import { Graph, Node, Edge } from '@antv/x6'

interface Viewport {
  x: number
  y: number
  width: number
  height: number
}

interface VirtualRenderOptions {
  bufferRatio?: number
  enableCulling?: boolean
  maxVisibleNodes?: number
}

/**
 * 虚拟渲染器 - 只渲染视口内的图形
 */
export class VirtualRenderer {
  private graph: Graph
  private options: VirtualRenderOptions
  private visibleNodes: Set<string> = new Set()
  private visibleEdges: Set<string> = new Set()
  private allNodes: Map<string, Node> = new Map()
  private allEdges: Map<string, Edge> = new Map()
  private readonly defaultBufferRatio = 0.2
  private readonly defaultMaxVisibleNodes = 500

  constructor(graph: Graph, options: VirtualRenderOptions = {}) {
    this.graph = graph
    this.options = {
      bufferRatio: options.bufferRatio || this.defaultBufferRatio,
      enableCulling: options.enableCulling !== false,
      maxVisibleNodes: options.maxVisibleNodes || this.defaultMaxVisibleNodes,
    }
    this.setupViewportTracking()
  }

  /**
   * 设置视口跟踪
   */
  private setupViewportTracking(): void {
    // 监听视口变化
    this.graph.on('scale', () => {
      this.updateVisibleElements()
    })

    this.graph.on('translate', () => {
      this.updateVisibleElements()
    })

    // 监听画布大小变化
    this.graph.on('resize', () => {
      this.updateVisibleElements()
    })

    // 监听节点添加
    this.graph.on('node:added', ({ node }) => {
      this.allNodes.set(node.id, node)
      if (this.isInViewport(node)) {
        this.visibleNodes.add(node.id)
      } else {
        this.hideNode(node)
      }
    })

    // 监听节点删除
    this.graph.on('node:removed', ({ node }) => {
      this.allNodes.delete(node.id)
      this.visibleNodes.delete(node.id)
    })

    // 监听节点移动
    this.graph.on('node:moved', ({ node }) => {
      this.updateNodeVisibility(node)
    })

    // 监听边添加
    this.graph.on('edge:added', ({ edge }) => {
      this.allEdges.set(edge.id, edge)
      this.updateEdgeVisibility(edge)
    })

    // 监听边删除
    this.graph.on('edge:removed', ({ edge }) => {
      this.allEdges.delete(edge.id)
      this.visibleEdges.delete(edge.id)
    })
  }

  /**
   * 获取当前视口
   */
  private getViewport(): Viewport {
    const graphRect = this.graph.getGraphArea()
    const zoom = this.graph.zoom()
    const translate = this.graph.translate()

    return {
      x: -translate.tx / zoom,
      y: -translate.ty / zoom,
      width: graphRect.width / zoom,
      height: graphRect.height / zoom,
    }
  }

  /**
   * 获取扩展视口（包含缓冲区）
   */
  private getExtendedViewport(): Viewport {
    const viewport = this.getViewport()
    const bufferRatio = this.options.bufferRatio || this.defaultBufferRatio
    const bufferX = viewport.width * bufferRatio
    const bufferY = viewport.height * bufferRatio

    return {
      x: viewport.x - bufferX,
      y: viewport.y - bufferY,
      width: viewport.width + bufferX * 2,
      height: viewport.height + bufferY * 2,
    }
  }

  /**
   * 检查节点是否在视口内
   */
  private isInViewport(node: Node, viewport?: Viewport): boolean {
    const vp = viewport || this.getExtendedViewport()
    const bbox = node.getBBox()

    return (
      bbox.x < vp.x + vp.width &&
      bbox.x + bbox.width > vp.x &&
      bbox.y < vp.y + vp.height &&
      bbox.y + bbox.height > vp.y
    )
  }

  /**
   * 检查边是否在视口内
   */
  private isEdgeInViewport(edge: Edge, viewport?: Viewport): boolean {
    const vp = viewport || this.getExtendedViewport()
    const sourceNode = edge.getSourceNode()
    const targetNode = edge.getTargetNode()

    if (!sourceNode || !targetNode) return false

    // 如果任一节点在视口内，则边可见
    return this.isInViewport(sourceNode, vp) || this.isInViewport(targetNode, vp)
  }

  /**
   * 隐藏节点
   */
  private hideNode(node: Node): void {
    node.hide()
  }

  /**
   * 显示节点
   */
  private showNode(node: Node): void {
    node.show()
  }

  /**
   * 隐藏边
   */
  private hideEdge(edge: Edge): void {
    edge.hide()
  }

  /**
   * 显示边
   */
  private showEdge(edge: Edge): void {
    edge.show()
  }

  /**
   * 更新节点可见性
   */
  private updateNodeVisibility(node: Node): void {
    const isVisible = this.isInViewport(node)
    const wasVisible = this.visibleNodes.has(node.id)

    if (isVisible && !wasVisible) {
      this.showNode(node)
      this.visibleNodes.add(node.id)
    } else if (!isVisible && wasVisible) {
      this.hideNode(node)
      this.visibleNodes.delete(node.id)
    }
  }

  /**
   * 更新边可见性
   */
  private updateEdgeVisibility(edge: Edge): void {
    const isVisible = this.isEdgeInViewport(edge)
    const wasVisible = this.visibleEdges.has(edge.id)

    if (isVisible && !wasVisible) {
      this.showEdge(edge)
      this.visibleEdges.add(edge.id)
    } else if (!isVisible && wasVisible) {
      this.hideEdge(edge)
      this.visibleEdges.delete(edge.id)
    }
  }

  /**
   * 更新所有可见元素
   */
  updateVisibleElements(): void {
    if (!this.options.enableCulling) return

    const viewport = this.getExtendedViewport()
    const maxVisible = this.options.maxVisibleNodes || this.defaultMaxVisibleNodes

    // 更新节点可见性
    let visibleCount = 0
    for (const [id, node] of this.allNodes) {
      if (visibleCount >= maxVisible) {
        // 超过最大可见数量，隐藏剩余节点
        if (this.visibleNodes.has(id)) {
          this.hideNode(node)
          this.visibleNodes.delete(id)
        }
        continue
      }

      const isVisible = this.isInViewport(node, viewport)
      const wasVisible = this.visibleNodes.has(id)

      if (isVisible && !wasVisible) {
        this.showNode(node)
        this.visibleNodes.add(id)
        visibleCount++
      } else if (!isVisible && wasVisible) {
        this.hideNode(node)
        this.visibleNodes.delete(id)
      } else if (isVisible && wasVisible) {
        visibleCount++
      }
    }

    // 更新边可见性
    for (const [id, edge] of this.allEdges) {
      this.updateEdgeVisibility(edge)
    }
  }

  /**
   * 初始化所有元素
   */
  initialize(elements: { nodes: Node[]; edges: Edge[] }): void {
    // 存储所有元素
    elements.nodes.forEach((node) => {
      this.allNodes.set(node.id, node)
    })
    elements.edges.forEach((edge) => {
      this.allEdges.set(edge.id, edge)
    })

    // 初始更新可见性
    this.updateVisibleElements()
  }

  /**
   * 强制显示所有元素
   */
  showAll(): void {
    for (const [id, node] of this.allNodes) {
      this.showNode(node)
      this.visibleNodes.add(id)
    }
    for (const [id, edge] of this.allEdges) {
      this.showEdge(edge)
      this.visibleEdges.add(id)
    }
  }

  /**
   * 强制隐藏所有元素
   */
  hideAll(): void {
    for (const [id, node] of this.allNodes) {
      this.hideNode(node)
      this.visibleNodes.delete(id)
    }
    for (const [id, edge] of this.allEdges) {
      this.hideEdge(edge)
      this.visibleEdges.delete(id)
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalNodes: number
    visibleNodes: number
    totalEdges: number
    visibleEdges: number
    cullingRatio: number
  } {
    const totalNodes = this.allNodes.size
    const visibleNodes = this.visibleNodes.size
    const totalEdges = this.allEdges.size
    const visibleEdges = this.visibleEdges.size

    return {
      totalNodes,
      visibleNodes,
      totalEdges,
      visibleEdges,
      cullingRatio: totalNodes > 0 ? (totalNodes - visibleNodes) / totalNodes : 0,
    }
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<VirtualRenderOptions>): void {
    this.options = { ...this.options, ...options }
    this.updateVisibleElements()
  }

  /**
   * 销毁
   */
  dispose(): void {
    this.showAll()
    this.allNodes.clear()
    this.allEdges.clear()
    this.visibleNodes.clear()
    this.visibleEdges.clear()
  }
}

export default VirtualRenderer
