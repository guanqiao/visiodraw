/**
 * 平行边处理器
 *
 * 处理同一对节点间的多条边，自动计算偏移避免重叠
 */

import type { Graph, Edge, Node } from '@antv/x6'

export interface ParallelEdgeConfig {
  /** 边之间的间距 */
  spacing: number
  /** 最大偏移角度（度数） */
  maxAngle: number
  /** 是否启用曲线 */
  useCurve: boolean
  /** 曲线控制点偏移 */
  curveOffset: number
}

export const defaultParallelEdgeConfig: ParallelEdgeConfig = {
  spacing: 20,
  maxAngle: 45,
  useCurve: true,
  curveOffset: 30,
}

interface EdgeGroup {
  sourceId: string
  targetId: string
  edges: Edge[]
}

/**
 * 平行边处理器
 */
export class ParallelEdgeHandler {
  private graph: Graph
  private config: ParallelEdgeConfig

  constructor(graph: Graph, config: Partial<ParallelEdgeConfig> = {}) {
    this.graph = graph
    this.config = { ...defaultParallelEdgeConfig, ...config }
    this.setupEdgeTracking()
  }

  /**
   * 设置边跟踪
   */
  private setupEdgeTracking(): void {
    // 监听边添加
    this.graph.on('edge:added', ({ edge }) => {
      // 延迟处理，等待边完全初始化
      setTimeout(() => {
        this.handleEdgeAdded(edge)
      }, 0)
    })

    // 监听边删除
    this.graph.on('edge:removed', ({ edge }) => {
      this.handleEdgeRemoved(edge)
    })

    // 监听边连接变化
    this.graph.on('edge:connected', ({ edge }) => {
      setTimeout(() => {
        this.handleEdgeAdded(edge)
      }, 0)
    })
  }

  /**
   * 处理边添加
   */
  private handleEdgeAdded(edge: Edge): void {
    const sourceNode = edge.getSourceNode()
    const targetNode = edge.getTargetNode()

    if (!sourceNode || !targetNode) return

    // 获取同一对节点间的所有边
    const parallelEdges = this.getParallelEdges(sourceNode, targetNode)

    if (parallelEdges.length > 1) {
      this.distributeEdges(parallelEdges, sourceNode, targetNode)
    }
  }

  /**
   * 处理边删除
   */
  private handleEdgeRemoved(edge: Edge): void {
    // 重新计算剩余平行边的分布
    const sourceNode = edge.getSourceNode()
    const targetNode = edge.getTargetNode()

    if (!sourceNode || !targetNode) return

    const parallelEdges = this.getParallelEdges(sourceNode, targetNode)

    if (parallelEdges.length > 1) {
      this.distributeEdges(parallelEdges, sourceNode, targetNode)
    } else if (parallelEdges.length === 1) {
      // 只剩一条边，恢复直线路径
      this.resetEdgePath(parallelEdges[0])
    }
  }

  /**
   * 获取同一对节点间的所有边
   */
  private getParallelEdges(sourceNode: Node, targetNode: Node): Edge[] {
    const edges = this.graph.getEdges()
    const sourceId = sourceNode.id
    const targetId = targetNode.id

    return edges.filter((edge) => {
      const edgeSource = edge.getSourceNode()
      const edgeTarget = edge.getTargetNode()

      if (!edgeSource || !edgeTarget) return false

      const edgeSourceId = edgeSource.id
      const edgeTargetId = edgeTarget.id

      // 检查是否是同一对节点（考虑方向）
      return (
        (edgeSourceId === sourceId && edgeTargetId === targetId) ||
        (edgeSourceId === targetId && edgeTargetId === sourceId)
      )
    })
  }

  /**
   * 分布多条边
   */
  private distributeEdges(edges: Edge[], sourceNode: Node, targetNode: Node): void {
    const count = edges.length
    const { spacing, useCurve, curveOffset } = this.config

    // 计算源节点和目标节点的中心点
    const sourceBBox = sourceNode.getBBox()
    const targetBBox = targetNode.getBBox()
    const sourceCenter = {
      x: sourceBBox.x + sourceBBox.width / 2,
      y: sourceBBox.y + sourceBBox.height / 2,
    }
    const targetCenter = {
      x: targetBBox.x + targetBBox.width / 2,
      y: targetBBox.y + targetBBox.height / 2,
    }

    // 计算基础角度
    const baseAngle = Math.atan2(
      targetCenter.y - sourceCenter.y,
      targetCenter.x - sourceCenter.x
    )

    // 计算总跨度
    const totalSpan = (count - 1) * spacing
    const startOffset = -totalSpan / 2

    edges.forEach((edge, index) => {
      const offset = startOffset + index * spacing

      if (useCurve) {
        // 使用曲线偏移
        this.applyCurvedOffset(edge, sourceCenter, targetCenter, offset, curveOffset)
      } else {
        // 使用角度偏移
        this.applyAngularOffset(edge, sourceCenter, targetCenter, baseAngle, offset)
      }
    })
  }

  /**
   * 应用曲线偏移
   */
  private applyCurvedOffset(
    edge: Edge,
    sourceCenter: { x: number; y: number },
    targetCenter: { x: number; y: number },
    offset: number,
    curveOffset: number
  ): void {
    // 计算垂直于连线的方向
    const dx = targetCenter.x - sourceCenter.x
    const dy = targetCenter.y - sourceCenter.y
    const length = Math.sqrt(dx * dx + dy * dy)

    if (length === 0) return

    // 垂直方向的单位向量
    const perpX = -dy / length
    const perpY = dx / length

    // 计算控制点
    const midX = (sourceCenter.x + targetCenter.x) / 2
    const midY = (sourceCenter.y + targetCenter.y) / 2

    const controlX = midX + perpX * (curveOffset + offset)
    const controlY = midY + perpY * (curveOffset + offset)

    // 设置边的顶点（贝塞尔曲线控制点）
    edge.setVertices([{ x: controlX, y: controlY }])

    // 设置连接器为曲线
    edge.setConnector({ name: 'smooth' })
  }

  /**
   * 应用角度偏移
   */
  private applyAngularOffset(
    edge: Edge,
    sourceCenter: { x: number; y: number },
    targetCenter: { x: number; y: number },
    baseAngle: number,
    offset: number
  ): void {
    const distance = Math.sqrt(
      Math.pow(targetCenter.x - sourceCenter.x, 2) +
      Math.pow(targetCenter.y - sourceCenter.y, 2)
    )

    // 计算偏移角度
    const angleOffset = (offset / distance) * (Math.PI / 4) // 最大45度
    const newAngle = baseAngle + angleOffset

    // 计算新的目标点
    const newTargetX = sourceCenter.x + Math.cos(newAngle) * distance
    const newTargetY = sourceCenter.y + Math.sin(newAngle) * distance

    // 设置边的顶点
    edge.setVertices([{ x: newTargetX, y: newTargetY }])
  }

  /**
   * 重置边路径为直线
   */
  private resetEdgePath(edge: Edge): void {
    edge.setVertices([])
    edge.setConnector({ name: 'rounded' })
  }

  /**
   * 手动触发平行边重新分布
   */
  redistributeEdges(): void {
    const edges = this.graph.getEdges()
    const edgeGroups = new Map<string, Edge[]>()

    // 按节点对分组
    edges.forEach((edge) => {
      const sourceNode = edge.getSourceNode()
      const targetNode = edge.getTargetNode()

      if (!sourceNode || !targetNode) return

      const key = this.getEdgeGroupKey(sourceNode.id, targetNode.id)

      if (!edgeGroups.has(key)) {
        edgeGroups.set(key, [])
      }
      edgeGroups.get(key)!.push(edge)
    })

    // 处理每组平行边
    edgeGroups.forEach((groupEdges, key) => {
      if (groupEdges.length > 1) {
        const firstEdge = groupEdges[0]
        const sourceNode = firstEdge.getSourceNode()
        const targetNode = firstEdge.getTargetNode()

        if (sourceNode && targetNode) {
          this.distributeEdges(groupEdges, sourceNode, targetNode)
        }
      }
    })
  }

  /**
   * 获取边分组的 key
   */
  private getEdgeGroupKey(sourceId: string, targetId: string): string {
    // 确保 key 的一致性（不考虑方向）
    return [sourceId, targetId].sort().join('-')
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ParallelEdgeConfig>): void {
    this.config = { ...this.config, ...config }
    // 重新分布所有平行边
    this.redistributeEdges()
  }

  /**
   * 获取当前配置
   */
  getConfig(): ParallelEdgeConfig {
    return { ...this.config }
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    // 清理事件监听
    this.graph.off('edge:added')
    this.graph.off('edge:removed')
    this.graph.off('edge:connected')
  }
}

// 导出单例管理函数
let handlerInstance: ParallelEdgeHandler | null = null

export function getParallelEdgeHandler(
  graph: Graph,
  config?: Partial<ParallelEdgeConfig>
): ParallelEdgeHandler {
  if (!handlerInstance) {
    handlerInstance = new ParallelEdgeHandler(graph, config)
  } else if (config) {
    handlerInstance.updateConfig(config)
  }
  return handlerInstance
}

export function resetParallelEdgeHandler(): void {
  if (handlerInstance) {
    handlerInstance.destroy()
    handlerInstance = null
  }
}

export default ParallelEdgeHandler
