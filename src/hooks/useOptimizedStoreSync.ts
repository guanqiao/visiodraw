import { useEffect, useRef, useCallback } from 'react'
import { Graph, Node as X6Node, Edge as X6Edge } from '@antv/x6'
import type { NodeData, EdgeData } from '../stores/x6GraphStore'
import {
  createNodeChangeBatch,
  detectNodeChanges,
  debounce,
} from '../utils/performance/nodeChangeDetector'
import { renderShape } from '../utils/shapeRenderers'
import { ConnectorRenderer } from '../utils/connectorRenderer'

interface UseOptimizedStoreSyncOptions {
  debounceMs?: number
  batchSize?: number
}

/**
 * 优化的 Store 同步 Hook
 * 使用增量更新和批量处理来提升性能
 */
export function useOptimizedStoreSync(
  graph: Graph | null,
  nodes: NodeData[],
  edges: EdgeData[],
  options: UseOptimizedStoreSyncOptions = {}
) {
  const { debounceMs = 16, batchSize = 50 } = options
  const previousNodesRef = useRef<NodeData[]>([])
  const previousEdgesRef = useRef<EdgeData[]>([])
  const isProcessingRef = useRef(false)

  /**
   * 创建 X6 节点
   */
  const createX6NodeFromData = useCallback((nodeData: NodeData) => {
    const node = renderShape(nodeData.type, {
      id: nodeData.id,
      x: nodeData.x,
      y: nodeData.y,
      width: nodeData.width,
      height: nodeData.height,
      text: nodeData.text,
      fill: nodeData.fill,
      stroke: nodeData.stroke,
      strokeWidth: nodeData.strokeWidth,
      shapeType: nodeData.type,
    })

    // 设置节点数据
    node.setData({
      type: nodeData.type,
      connectionPoints: nodeData.connectionPoints,
    })

    return node
  }, [])

  /**
   * 批量处理节点变更
   */
  const processNodeChanges = useCallback(
    (batch: ReturnType<typeof createNodeChangeBatch>) => {
      if (!graph) return

      // 处理删除
      if (batch.removed.length > 0) {
        const cellsToRemove = batch.removed
          .map((id) => graph.getCellById(id))
          .filter(Boolean)
        if (cellsToRemove.length > 0) {
          graph.removeCells(cellsToRemove)
        }
      }

      // 批量添加节点
      if (batch.added.length > 0) {
        const nodesToAdd = batch.added.map((nodeData) =>
          createX6NodeFromData(nodeData)
        )
        graph.addNodes(nodesToAdd)
      }

      // 批量更新节点 - 按变更类型分组
      const positionUpdates: Array<{ node: X6Node; x: number; y: number }> = []
      const sizeUpdates: Array<{
        node: X6Node
        width: number
        height: number
      }> = []
      const attrUpdates: Array<{ node: X6Node; attrs: any }> = []

      for (const { node, changes } of batch.updated) {
        const existingNode = graph.getCellById(node.id) as X6Node
        if (!existingNode) continue

        if (changes.positionChanged) {
          positionUpdates.push({ node: existingNode, x: node.x, y: node.y })
        }

        if (changes.sizeChanged) {
          sizeUpdates.push({
            node: existingNode,
            width: node.width,
            height: node.height,
          })
        }

        if (changes.styleChanged || changes.textChanged) {
          const attrs: any = {}
          if (changes.styleChanged) {
            attrs.body = {
              fill: node.fill,
              stroke: node.stroke,
              strokeWidth: node.strokeWidth,
            }
          }
          if (changes.textChanged) {
            attrs.label = {
              text: node.text || '',
            }
          }
          attrUpdates.push({ node: existingNode, attrs })
        }
      }

      // 执行批量更新
      graph.batchUpdate(() => {
        // 批量更新位置
        for (const { node, x, y } of positionUpdates) {
          node.position(x, y)
        }

        // 批量更新大小
        for (const { node, width, height } of sizeUpdates) {
          node.size(width, height)
        }

        // 批量更新属性
        for (const { node, attrs } of attrUpdates) {
          node.attr(attrs)
        }
      })
    },
    [graph, createX6NodeFromData]
  )

  /**
   * 批量处理边变更
   */
  const processEdgeChanges = useCallback(
    (
      currentEdges: EdgeData[],
      previousEdges: EdgeData[]
    ) => {
      if (!graph) return

      const previousMap = new Map(previousEdges.map((e) => [e.id, e]))
      const currentIds = new Set(currentEdges.map((e) => e.id))
      const previousIds = new Set(previousEdges.map((e) => e.id))

      // 找出删除的边
      const removedIds: string[] = []
      for (const id of previousIds) {
        if (!currentIds.has(id)) {
          removedIds.push(id)
        }
      }

      // 找出新增和更新的边
      const addedEdges: EdgeData[] = []
      const updatedEdges: Array<{ edge: EdgeData; oldEdge: EdgeData }> = []

      for (const edge of currentEdges) {
        if (!previousIds.has(edge.id)) {
          addedEdges.push(edge)
        } else {
          const oldEdge = previousMap.get(edge.id)
          if (oldEdge && hasEdgeChanged(oldEdge, edge)) {
            updatedEdges.push({ edge, oldEdge })
          }
        }
      }

      // 批量处理
      graph.batchUpdate(() => {
        // 删除边
        if (removedIds.length > 0) {
          const cellsToRemove = removedIds
            .map((id) => graph.getCellById(id))
            .filter(Boolean)
          if (cellsToRemove.length > 0) {
            graph.removeCells(cellsToRemove)
          }
        }

        // 添加边
        for (const edge of addedEdges) {
          const x6EdgeConfig = ConnectorRenderer.toX6Edge(edge)
          graph.addEdge(x6EdgeConfig)
        }

        // 更新边
        for (const { edge } of updatedEdges) {
          const existingEdge = graph.getCellById(edge.id) as X6Edge
          if (existingEdge) {
            ConnectorRenderer.updateEdgeStyle(existingEdge, edge.style)
            ConnectorRenderer.updateEdgeMarkers(
              existingEdge,
              edge.startStyle,
              edge.endStyle
            )
            ConnectorRenderer.updateEdgeAppearance(existingEdge, {
              stroke: edge.stroke,
              strokeWidth: edge.strokeWidth,
              lineStyle: edge.lineStyle,
            })
          }
        }
      })
    },
    [graph]
  )

  /**
   * 判断边是否有变化
   */
  function hasEdgeChanged(oldEdge: EdgeData, newEdge: EdgeData): boolean {
    return (
      oldEdge.source !== newEdge.source ||
      oldEdge.target !== newEdge.target ||
      oldEdge.style !== newEdge.style ||
      oldEdge.startStyle !== newEdge.startStyle ||
      oldEdge.endStyle !== newEdge.endStyle ||
      oldEdge.stroke !== newEdge.stroke ||
      oldEdge.strokeWidth !== newEdge.strokeWidth ||
      oldEdge.lineStyle !== newEdge.lineStyle
    )
  }

  // 使用防抖优化节点同步
  const debouncedNodeSync = useCallback(
    debounce((currentNodes: NodeData[]) => {
      if (!graph || isProcessingRef.current) return

      isProcessingRef.current = true
      try {
        const batch = createNodeChangeBatch(
          currentNodes,
          previousNodesRef.current
        )

        // 如果变更数量超过批次大小，分批处理
        if (batch.updated.length > batchSize) {
          processLargeBatch(batch, batchSize)
        } else {
          processNodeChanges(batch)
        }

        previousNodesRef.current = currentNodes
      } finally {
        isProcessingRef.current = false
      }
    }, debounceMs),
    [graph, processNodeChanges, batchSize, debounceMs]
  )

  /**
   * 处理大批量变更
   */
  const processLargeBatch = useCallback(
    (
      batch: ReturnType<typeof createNodeChangeBatch>,
      size: number
    ) => {
      if (!graph) return

      // 先处理删除和添加
      processNodeChanges({
        added: batch.added,
        removed: batch.removed,
        updated: [],
      })

      // 分批处理更新
      const updateChunks = chunkArray(batch.updated, size)
      let chunkIndex = 0

      const processNextChunk = () => {
        if (chunkIndex >= updateChunks.length) return

        const chunk = updateChunks[chunkIndex]
        processNodeChanges({
          added: [],
          removed: [],
          updated: chunk,
        })

        chunkIndex++
        // 使用 requestIdleCallback 或 setTimeout 让出主线程
        if ('requestIdleCallback' in window) {
          requestIdleCallback(processNextChunk, { timeout: 100 })
        } else {
          setTimeout(processNextChunk, 0)
        }
      }

      processNextChunk()
    },
    [graph, processNodeChanges]
  )

  // 节点同步
  useEffect(() => {
    debouncedNodeSync(nodes)
  }, [nodes, debouncedNodeSync])

  // 边同步（边变更频率较低，不需要防抖）
  useEffect(() => {
    if (!graph) return
    processEdgeChanges(edges, previousEdgesRef.current)
    previousEdgesRef.current = edges
  }, [edges, graph, processEdgeChanges])

  // 清理函数
  useEffect(() => {
    return () => {
      previousNodesRef.current = []
      previousEdgesRef.current = []
    }
  }, [])
}

/**
 * 将数组分块
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export default useOptimizedStoreSync
