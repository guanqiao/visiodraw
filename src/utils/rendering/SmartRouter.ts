import { Node, Edge, Graph } from '@antv/x6'

interface Point {
  x: number
  y: number
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
  id?: string
}

interface RouteOptions {
  padding?: number
  maxIterations?: number
  preferHorizontal?: boolean
}

/**
 * 智能路由器 - 实现连接线的智能避让
 */
export class SmartRouter {
  private graph: Graph
  private obstacles: Map<string, Rect> = new Map()
  private readonly defaultPadding = 20
  private readonly defaultMaxIterations = 100

  constructor(graph: Graph) {
    this.graph = graph
    this.initializeObstacles()
    this.setupObstacleTracking()
  }

  /**
   * 初始化障碍物（所有节点）
   */
  private initializeObstacles(): void {
    const nodes = this.graph.getNodes()
    nodes.forEach((node) => {
      this.addObstacle(node)
    })
  }

  /**
   * 设置障碍物跟踪
   */
  private setupObstacleTracking(): void {
    // 监听节点添加
    this.graph.on('node:added', ({ node }) => {
      this.addObstacle(node)
    })

    // 监听节点移动
    this.graph.on('node:moved', ({ node }) => {
      this.updateObstacle(node)
      this.rerouteConnectedEdges(node)
    })

    // 监听节点删除
    this.graph.on('node:removed', ({ node }) => {
      this.removeObstacle(node.id)
    })

    // 监听节点大小变化
    this.graph.on('node:resized', ({ node }) => {
      this.updateObstacle(node)
      this.rerouteConnectedEdges(node)
    })
  }

  /**
   * 添加障碍物
   */
  private addObstacle(node: Node): void {
    const bbox = node.getBBox()
    this.obstacles.set(node.id, {
      id: node.id,
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
    })
  }

  /**
   * 更新障碍物
   */
  private updateObstacle(node: Node): void {
    this.addObstacle(node)
  }

  /**
   * 移除障碍物
   */
  private removeObstacle(nodeId: string): void {
    this.obstacles.delete(nodeId)
  }

  /**
   * 重新路由与节点相连的边
   */
  private rerouteConnectedEdges(node: Node): void {
    const connectedEdges = this.graph.getConnectedEdges(node)
    connectedEdges.forEach((edge) => {
      this.rerouteEdge(edge)
    })
  }

  /**
   * 重新路由单条边
   */
  private rerouteEdge(edge: Edge): void {
    const source = edge.getSourceNode()
    const target = edge.getTargetNode()

    if (!source || !target) return

    const sourcePoint = this.getConnectionPoint(source, edge.getSourcePortId() || 'center')
    const targetPoint = this.getConnectionPoint(target, edge.getTargetPortId() || 'center')

    const route = this.calculateRoute(sourcePoint, targetPoint, {
      excludeIds: [source.id, target.id],
    })

    // 更新边的路由点
    if (route.length > 2) {
      edge.setVertices(route.slice(1, -1))
    }
  }

  /**
   * 获取连接点位置
   */
  private getConnectionPoint(node: Node, portId: string): Point {
    const bbox = node.getBBox()
    const port = node.getPort(portId)

    if (port) {
      const portPosition = (node.getPortProp(portId, 'args/position') as { x: number; y: number } | undefined) 
        || this.getDefaultPortPosition(portId)
      return {
        x: bbox.x + bbox.width * portPosition.x,
        y: bbox.y + bbox.height * portPosition.y,
      }
    }

    // 默认返回中心点
    return {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    }
  }

  /**
   * 获取默认端口位置
   */
  private getDefaultPortPosition(portId: string): { x: number; y: number } {
    const positions: Record<string, { x: number; y: number }> = {
      top: { x: 0.5, y: 0 },
      bottom: { x: 0.5, y: 1 },
      left: { x: 0, y: 0.5 },
      right: { x: 1, y: 0.5 },
      center: { x: 0.5, y: 0.5 },
    }
    return positions[portId] || positions.center
  }

  /**
   * 计算路由路径（A*算法）
   */
  calculateRoute(
    start: Point,
    end: Point,
    options: RouteOptions & { excludeIds?: string[] } = {}
  ): Point[] {
    const padding = options.padding || this.defaultPadding
    const maxIterations = options.maxIterations || this.defaultMaxIterations
    const excludeIds = new Set(options.excludeIds || [])

    // 获取有效的障碍物
    const obstacles = Array.from(this.obstacles.values()).filter(
      (obs) => !excludeIds.has(obs.id || '')
    )

    // 使用改进的曼哈顿路由
    return this.manhattanRoute(start, end, obstacles, padding, maxIterations)
  }

  /**
   * 曼哈顿路由算法
   */
  private manhattanRoute(
    start: Point,
    end: Point,
    obstacles: Rect[],
    padding: number,
    maxIterations: number
  ): Point[] {
    // 尝试直接路径
    const directPath = this.tryDirectPath(start, end, obstacles, padding)
    if (directPath) {
      return directPath
    }

    // 尝试 L 型路径
    const lPaths = this.generateLPaths(start, end)
    for (const path of lPaths) {
      if (this.isValidPath(path, obstacles, padding)) {
        return path
      }
    }

    // 尝试 Z 型路径
    const zPaths = this.generateZPaths(start, end)
    for (const path of zPaths) {
      if (this.isValidPath(path, obstacles, padding)) {
        return path
      }
    }

    // 使用 A* 算法寻找路径
    return this.aStarRoute(start, end, obstacles, padding, maxIterations)
  }

  /**
   * 尝试直接路径
   */
  private tryDirectPath(
    start: Point,
    end: Point,
    obstacles: Rect[],
    padding: number
  ): Point[] | null {
    const path = [start, end]
    if (this.isValidPath(path, obstacles, padding)) {
      return path
    }
    return null
  }

  /**
   * 生成 L 型路径
   */
  private generateLPaths(start: Point, end: Point): Point[][] {
    const midX = { x: end.x, y: start.y }
    const midY = { x: start.x, y: end.y }

    return [
      [start, midX, end],
      [start, midY, end],
    ]
  }

  /**
   * 生成 Z 型路径
   */
  private generateZPaths(start: Point, end: Point): Point[][] {
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2

    return [
      [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end],
      [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end],
    ]
  }

  /**
   * 检查路径是否有效（不与障碍物相交）
   */
  private isValidPath(path: Point[], obstacles: Rect[], padding: number): boolean {
    for (let i = 0; i < path.length - 1; i++) {
      if (this.lineIntersectsObstacles(path[i], path[i + 1], obstacles, padding)) {
        return false
      }
    }
    return true
  }

  /**
   * 检查线段是否与障碍物相交
   */
  private lineIntersectsObstacles(
    p1: Point,
    p2: Point,
    obstacles: Rect[],
    padding: number
  ): boolean {
    return obstacles.some((obs) =>
      this.lineIntersectsRect(p1, p2, {
        x: obs.x - padding,
        y: obs.y - padding,
        width: obs.width + padding * 2,
        height: obs.height + padding * 2,
      })
    )
  }

  /**
   * 检查线段是否与矩形相交
   */
  private lineIntersectsRect(p1: Point, p2: Point, rect: Rect): boolean {
    // 快速排除
    const minX = Math.min(p1.x, p2.x)
    const maxX = Math.max(p1.x, p2.x)
    const minY = Math.min(p1.y, p2.y)
    const maxY = Math.max(p1.y, p2.y)

    if (maxX < rect.x || minX > rect.x + rect.width) return false
    if (maxY < rect.y || minY > rect.y + rect.height) return false

    // 详细检测
    const edges = [
      { p1: { x: rect.x, y: rect.y }, p2: { x: rect.x + rect.width, y: rect.y } },
      { p1: { x: rect.x + rect.width, y: rect.y }, p2: { x: rect.x + rect.width, y: rect.y + rect.height } },
      { p1: { x: rect.x + rect.width, y: rect.y + rect.height }, p2: { x: rect.x, y: rect.y + rect.height } },
      { p1: { x: rect.x, y: rect.y + rect.height }, p2: { x: rect.x, y: rect.y } },
    ]

    return edges.some((edge) => this.lineSegmentsIntersect(p1, p2, edge.p1, edge.p2))
  }

  /**
   * 检查两条线段是否相交
   */
  private lineSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x)
    if (d === 0) return false

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / d
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / d

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
  }

  /**
   * A* 路由算法
   */
  private aStarRoute(
    start: Point,
    end: Point,
    obstacles: Rect[],
    padding: number,
    maxIterations: number
  ): Point[] {
    // 简化的 A* 实现
    const openSet: { point: Point; g: number; f: number; parent: Point | null }[] = [
      { point: start, g: 0, f: this.heuristic(start, end), parent: null },
    ]
    const closedSet = new Set<string>()
    const pointKey = (p: Point) => `${Math.round(p.x)},${Math.round(p.y)}`

    let iterations = 0
    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++

      // 找到 f 值最小的节点
      openSet.sort((a, b) => a.f - b.f)
      const current = openSet.shift()!
      const currentKey = pointKey(current.point)

      if (closedSet.has(currentKey)) continue
      closedSet.add(currentKey)

      // 到达目标
      if (this.distance(current.point, end) < 10) {
        return this.reconstructPath(current, end)
      }

      // 生成邻居
      const neighbors = this.generateNeighbors(current.point, obstacles, padding)
      for (const neighbor of neighbors) {
        const neighborKey = pointKey(neighbor)
        if (closedSet.has(neighborKey)) continue

        const g = current.g + this.distance(current.point, neighbor)
        const h = this.heuristic(neighbor, end)
        const f = g + h

        const existing = openSet.find((n) => pointKey(n.point) === neighborKey)
        if (!existing || g < existing.g) {
          if (existing) {
            existing.g = g
            existing.f = f
            existing.parent = current.point
          } else {
            openSet.push({ point: neighbor, g, f, parent: current.point })
          }
        }
      }
    }

    // 未找到路径，返回直接连线
    return [start, end]
  }

  /**
   * 生成邻居点
   */
  private generateNeighbors(point: Point, obstacles: Rect[], padding: number): Point[] {
    const step = 20
    const neighbors: Point[] = [
      { x: point.x + step, y: point.y },
      { x: point.x - step, y: point.y },
      { x: point.x, y: point.y + step },
      { x: point.x, y: point.y - step },
    ]

    return neighbors.filter((n) => !this.pointInObstacles(n, obstacles, padding))
  }

  /**
   * 检查点是否在障碍物内
   */
  private pointInObstacles(point: Point, obstacles: Rect[], padding: number): boolean {
    return obstacles.some(
      (obs) =>
        point.x >= obs.x - padding &&
        point.x <= obs.x + obs.width + padding &&
        point.y >= obs.y - padding &&
        point.y <= obs.y + obs.height + padding
    )
  }

  /**
   * 启发函数
   */
  private heuristic(p1: Point, p2: Point): number {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y)
  }

  /**
   * 计算距离
   */
  private distance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x
    const dy = p1.y - p2.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 重建路径
   */
  private reconstructPath(
    endNode: { point: Point; parent: Point | null },
    end: Point
  ): Point[] {
    const path: Point[] = [end]
    let current: { point: Point; parent: Point | null } | null = endNode

    while (current) {
      path.unshift(current.point)
      if (!current.parent) break

      // 查找父节点
      current = null // 简化处理
    }

    return path
  }

  /**
   * 更新所有边的路由
   */
  updateAllRoutes(): void {
    const edges = this.graph.getEdges()
    edges.forEach((edge) => {
      this.rerouteEdge(edge)
    })
  }

  /**
   * 获取障碍物统计
   */
  getObstacleStats(): { count: number; totalArea: number } {
    let totalArea = 0
    for (const obs of this.obstacles.values()) {
      totalArea += obs.width * obs.height
    }
    return {
      count: this.obstacles.size,
      totalArea,
    }
  }
}

export default SmartRouter
