/**
 * 自连线绘制钩子
 *
 * 提供自连线的创建、编辑和管理功能
 * 支持拖拽创建、右键菜单创建、双击创建等多种手势
 */

import { useCallback, useRef } from 'react'
import type { Graph, Edge, Node } from '@antv/x6'
import { SelfLoopRouter, SelfLoopManager, type SelfLoopDirection } from '../utils/selfLoopRouter'
import { v4 as uuidv4 } from 'uuid'

export interface SelfLoopOptions {
  direction?: SelfLoopDirection
  radius?: number
  label?: string
  stroke?: string
  strokeWidth?: number
}

export interface UseSelfLoopDrawingOptions {
  graph: Graph | null
  onSelfLoopCreate?: (edge: Edge) => void
}

/**
 * 自连线绘制钩子
 */
export function useSelfLoopDrawing(options: UseSelfLoopDrawingOptions) {
  const { graph, onSelfLoopCreate } = options
  const selfLoopManager = useRef(new SelfLoopManager())

  /**
   * 创建自连线
   */
  const createSelfLoop = useCallback((node: Node, options: SelfLoopOptions = {}) => {
    if (!graph) return null

    const nodeId = node.id
    const nodeData = node.getData() || {}
    const nodeSize = node.size()
    const nodePosition = node.position()

    // 注册自连线获取索引
    const edgeId = `self-loop-${uuidv4()}`
    const loopIndex = selfLoopManager.current.registerLoop(edgeId, nodeId)

    // 计算自连线配置
    const router = new SelfLoopRouter({
      direction: options.direction || 'top',
      radius: options.radius || 35,
      offset: 20,
    })

    // 计算路径点
    const path = router.calculatePath(
      nodePosition.x + nodeSize.width / 2,
      nodePosition.y + nodeSize.height / 2,
      nodeSize.width,
      nodeSize.height,
      loopIndex
    )

    // 创建边
    const edge = graph.addEdge({
      id: edgeId,
      source: { cell: nodeId, port: 'default' },
      target: { cell: nodeId, port: 'default' },
      attrs: {
        line: {
          stroke: options.stroke || '#333333',
          strokeWidth: options.strokeWidth || 2,
          targetMarker: {
            name: 'classic',
            size: 10,
          },
        },
      },
      router: {
        name: 'normal',
      },
      connector: {
        name: 'rounded',
      },
      vertices: path.points.slice(1, -1),
      data: {
        isSelfLoop: true,
        selfLoopConfig: {
          direction: options.direction || 'top',
          radius: options.radius || 35,
          loopIndex,
        },
      },
      labels: options.label ? [{
        attrs: {
          text: {
            text: options.label,
            fontSize: 12,
            fill: '#333333',
          },
        },
        position: {
          distance: 0.5,
          offset: {
            x: 0,
            y: -15,
          },
        },
      }] : undefined,
    })

    if (edge && onSelfLoopCreate) {
      onSelfLoopCreate(edge)
    }

    return edge
  }, [graph, onSelfLoopCreate])

  /**
   * 删除自连线
   */
  const removeSelfLoop = useCallback((edge: Edge) => {
    if (!graph) return

    const edgeId = edge.id
    const edgeData = edge.getData() || {}

    if (edgeData.isSelfLoop) {
      selfLoopManager.current.unregisterLoop(edgeId)
      graph.removeEdge(edgeId)
    }
  }, [graph])

  /**
   * 更新自连线配置
   */
  const updateSelfLoop = useCallback((edge: Edge, options: Partial<SelfLoopOptions>) => {
    if (!graph) return

    const edgeData = edge.getData() || {}
    if (!edgeData.isSelfLoop) return

    const sourceNode = edge.getSourceNode()
    if (!sourceNode) return

    const nodeSize = sourceNode.size()
    const nodePosition = sourceNode.position()
    const currentConfig = edgeData.selfLoopConfig || {}

    // 计算新的路径
    const router = new SelfLoopRouter({
      direction: options.direction || currentConfig.direction || 'top',
      radius: options.radius || currentConfig.radius || 35,
      offset: 20,
    })

    const path = router.calculatePath(
      nodePosition.x + nodeSize.width / 2,
      nodePosition.y + nodeSize.height / 2,
      nodeSize.width,
      nodeSize.height,
      currentConfig.loopIndex || 0
    )

    // 更新边
    edge.setVertices(path.points.slice(1, -1))
    edge.setData({
      ...edgeData,
      selfLoopConfig: {
        ...currentConfig,
        direction: options.direction || currentConfig.direction,
        radius: options.radius || currentConfig.radius,
      },
    })

    // 更新样式
    if (options.stroke || options.strokeWidth) {
      edge.attr('line/stroke', options.stroke || edge.attr('line/stroke'))
      edge.attr('line/strokeWidth', options.strokeWidth || edge.attr('line/strokeWidth'))
    }

    // 更新标签
    if (options.label !== undefined) {
      if (options.label) {
        edge.setLabels([{
          attrs: {
            text: {
              text: options.label,
              fontSize: 12,
              fill: '#333333',
            },
          },
          position: {
            distance: 0.5,
            offset: {
              x: 0,
              y: -15,
            },
          },
        }])
      } else {
        edge.setLabels([])
      }
    }
  }, [graph])

  /**
   * 检查边是否为自连线
   */
  const isSelfLoop = useCallback((edge: Edge): boolean => {
    const edgeData = edge.getData() || {}
    return !!edgeData.isSelfLoop
  }, [])

  /**
   * 获取节点的所有自连线
   */
  const getNodeSelfLoops = useCallback((nodeId: string): Edge[] => {
    if (!graph) return []

    return graph.getEdges().filter(edge => {
      const source = edge.getSourceCellId()
      const target = edge.getTargetCellId()
      const edgeData = edge.getData() || {}
      return source === nodeId && target === nodeId && edgeData.isSelfLoop
    })
  }, [graph])

  /**
   * 处理边连接事件（用于检测自连线创建）
   */
  const handleEdgeConnected = useCallback((args: { edge: Edge; isNew: boolean }) => {
    const { edge, isNew } = args
    if (!isNew) return

    const source = edge.getSourceCellId()
    const target = edge.getTargetCellId()

    // 检测是否为自连线
    if (source && target && source === target) {
      // 转换为自连线格式
      const edgeId = edge.id
      const loopIndex = selfLoopManager.current.registerLoop(edgeId, source)

      const sourceNode = edge.getSourceNode()
      if (!sourceNode) return

      const nodeSize = sourceNode.size()
      const nodePosition = sourceNode.position()

      // 计算默认自连线路径
      const router = new SelfLoopRouter({
        direction: 'top',
        radius: 35,
        offset: 20,
      })

      const path = router.calculatePath(
        nodePosition.x + nodeSize.width / 2,
        nodePosition.y + nodeSize.height / 2,
        nodeSize.width,
        nodeSize.height,
        loopIndex
      )

      // 更新边为自连线格式
      edge.setVertices(path.points.slice(1, -1))
      edge.setData({
        isSelfLoop: true,
        selfLoopConfig: {
          direction: 'top',
          radius: 35,
          loopIndex,
        },
      })

      if (onSelfLoopCreate) {
        onSelfLoopCreate(edge)
      }
    }
  }, [onSelfLoopCreate])

  return {
    createSelfLoop,
    removeSelfLoop,
    updateSelfLoop,
    isSelfLoop,
    getNodeSelfLoops,
    handleEdgeConnected,
    selfLoopManager: selfLoopManager.current,
  }
}

export default useSelfLoopDrawing
