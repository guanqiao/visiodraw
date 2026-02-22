import { useEffect, useRef, useCallback } from 'react'
import { Graph, Node as X6Node, Edge as X6Edge } from '@antv/x6'
import type { ShapeData as NodeData } from '../stores/x6GraphStore'
import type { Connector as EdgeData } from '../types/connection'
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
  const graphRef = useRef<Graph | null>(graph)
  const previousNodesRef = useRef<NodeData[]>([])
  const previousEdgesRef = useRef<EdgeData[]>([])
  const isProcessingRef = useRef(false)

  // 同步 graph 到 ref
  useEffect(() => {
    graphRef.current = graph
  }, [graph])

  // 检测是否是清空操作
  const isClearingNodes = previousNodesRef.current.length > 0 && nodes.length === 0
  const isClearingEdges = previousEdgesRef.current.length > 0 && edges.length === 0

  // 处理清空操作
  useEffect(() => {
    if (!graph) return

    if (isClearingNodes || isClearingEdges) {
      graph.clearCells()
      previousNodesRef.current = []
      previousEdgesRef.current = []
    }
  }, [graph, isClearingNodes, isClearingEdges])

  // 当 nodes 变为空数组时，重置 previousNodesRef（处理 newGraph 被调用的情况）
  useEffect(() => {
    if (nodes.length === 0) {
      previousNodesRef.current = []
    }
  }, [nodes])

  // 当 edges 变为空数组时，重置 previousEdgesRef（处理 newGraph 被调用的情况）
  useEffect(() => {
    if (edges.length === 0) {
      previousEdgesRef.current = []
    }
  }, [edges])

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
      const currentGraph = graphRef.current
      if (!currentGraph) return

      // 处理删除
      if (batch.removed.length > 0) {
        const cellsToRemove = batch.removed
          .map((id) => currentGraph.getCellById(id))
          .filter(Boolean)
        if (cellsToRemove.length > 0) {
          currentGraph.removeCells(cellsToRemove)
        }
      }

      // 批量添加节点（跳过已存在的节点）
      if (batch.added.length > 0) {
        const nodesToAdd = batch.added
          .filter((nodeData) => !currentGraph.getCellById(nodeData.id))
          .map((nodeData) => createX6NodeFromData(nodeData))
        
        if (nodesToAdd.length > 0) {
          currentGraph.addNodes(nodesToAdd)
        }
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
        const existingNode = currentGraph.getCellById(node.id) as X6Node
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
      currentGraph.batchUpdate(() => {
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
    [createX6NodeFromData]
  )

  /**
   * 批量处理边变更
   */
  const processEdgeChanges = useCallback(
    (
      currentEdges: EdgeData[],
      previousEdges: EdgeData[]
    ) => {
      const currentGraph = graphRef.current
      if (!currentGraph) return

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
      currentGraph.batchUpdate(() => {
        // 删除边
        if (removedIds.length > 0) {
          const cellsToRemove = removedIds
            .map((id) => currentGraph.getCellById(id))
            .filter(Boolean)
          if (cellsToRemove.length > 0) {
            currentGraph.removeCells(cellsToRemove)
          }
        }

        // 添加边（跳过已存在的边）
        for (const edge of addedEdges) {
          if (!currentGraph.getCellById(edge.id)) {
            const x6EdgeConfig = ConnectorRenderer.toX6Edge(edge)
            currentGraph.addEdge(x6EdgeConfig)
          }
        }

        // 更新边
        for (const { edge } of updatedEdges) {
          const existingEdge = currentGraph.getCellById(edge.id) as X6Edge
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
            if (edge.labels && edge.labels.length > 0) {
              edge.labels.forEach((label, index) => {
                ConnectorRenderer.updateEdgeLabel(existingEdge, label, index)
              })
            }
          }
        }
      })
    },
    []
  )

  /**
   * 判断边是否有变化
   */
  function hasEdgeChanged(oldEdge: EdgeData, newEdge: EdgeData): boolean {
    const labelsChanged = (() => {
      const oldLabels = oldEdge.labels
      const newLabels = newEdge.labels
      if (!oldLabels && !newLabels) return false
      if (!oldLabels || !newLabels) return true
      if (oldLabels.length !== newLabels.length) return true
      for (let i = 0; i < oldLabels.length; i++) {
        if (oldLabels[i].text !== newLabels[i].text ||
            oldLabels[i].position !== newLabels[i].position ||
            oldLabels[i].offsetX !== newLabels[i].offsetX ||
            oldLabels[i].offsetY !== newLabels[i].offsetY ||
            oldLabels[i].fontSize !== newLabels[i].fontSize ||
            oldLabels[i].color !== newLabels[i].color ||
            oldLabels[i].backgroundColor !== newLabels[i].backgroundColor) {
          return true
        }
      }
      return false
    })()

    return (
      oldEdge.sourceShapeId !== newEdge.sourceShapeId ||
      oldEdge.sourcePointId !== newEdge.sourcePointId ||
      oldEdge.targetShapeId !== newEdge.targetShapeId ||
      oldEdge.targetPointId !== newEdge.targetPointId ||
      oldEdge.style !== newEdge.style ||
      oldEdge.startStyle !== newEdge.startStyle ||
      oldEdge.endStyle !== newEdge.endStyle ||
      oldEdge.stroke !== newEdge.stroke ||
      oldEdge.strokeWidth !== newEdge.strokeWidth ||
      oldEdge.lineStyle !== newEdge.lineStyle ||
      labelsChanged
    )
  }

  // 使用防抖优化节点同步
  const debouncedNodeSync = useCallback(
    debounce((currentNodes: NodeData[]) => {
      const currentGraph = graphRef.current
      if (!currentGraph || isProcessingRef.current) return

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
    [processNodeChanges, batchSize, debounceMs]
  )

  /**
   * 处理大批量变更
   */
  const processLargeBatch = useCallback(
    (
      batch: ReturnType<typeof createNodeChangeBatch>,
      size: number
    ) => {
      const currentGraph = graphRef.current
      if (!currentGraph) return

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
    [processNodeChanges]
  )

  // 节点同步
  useEffect(() => {
    // 如果是清空操作，已经在上面的 useEffect 中处理了
    if (isClearingNodes || isClearingEdges) return
    debouncedNodeSync(nodes)
  }, [nodes, debouncedNodeSync, isClearingNodes, isClearingEdges])

  // 边同步（边变更频率较低，不需要防抖）
  useEffect(() => {
    // 如果是清空操作，已经在上面的 useEffect 中处理了
    if (isClearingNodes || isClearingEdges) return
    if (!graph) return
    processEdgeChanges(edges, previousEdgesRef.current)
    previousEdgesRef.current = edges
  }, [edges, graph, processEdgeChanges, isClearingNodes, isClearingEdges])

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
