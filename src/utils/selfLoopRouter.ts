/**
 * 自连接边（Self-Loop）路由算法
 *
 * 用于处理节点连接到自身的边，支持：
 * 1. 弧形自连线（贝塞尔曲线）
 * 2. 多自连线自动偏移（避免重叠）
 * 3. 可自定义弧度、方向、样式
 *
 * 参考 PlantUML 和 Mermaid 的自连线实现
 */

export interface SelfLoopConfig {
  /** 弧线半径 */
  radius: number
  /** 弧线方向: 'top' | 'right' | 'bottom' | 'left' */
  direction: SelfLoopDirection
  /** 弧线偏移量（用于多条自连线） */
  offset: number
  /** 起点在边缘的位置 (0-1) */
  startPosition: number
  /** 终点在边缘的位置 (0-1) */
  endPosition: number
  /** 是否使用贝塞尔曲线 */
  useBezier: boolean
  /** 贝塞尔曲线控制点偏移 */
  bezierControlOffset: number
}

export type SelfLoopDirection = 'top' | 'right' | 'bottom' | 'left'

export interface SelfLoopPoint {
  x: number
  y: number
}

export interface SelfLoopPath {
  points: SelfLoopPoint[]
  startPoint: SelfLoopPoint
  endPoint: SelfLoopPoint
  controlPoints?: SelfLoopPoint[]
}

export const defaultSelfLoopConfig: SelfLoopConfig = {
  radius: 30,
  direction: 'top',
  offset: 0,
  startPosition: 0.3,
  endPosition: 0.7,
  useBezier: true,
  bezierControlOffset: 50,
}

/**
 * 自连线路由器类
 */
export class SelfLoopRouter {
  private config: SelfLoopConfig

  constructor(config: Partial<SelfLoopConfig> = {}) {
    this.config = { ...defaultSelfLoopConfig, ...config }
  }

  /**
   * 计算自连线路径
   * @param nodeX 节点中心 X 坐标
   * @param nodeY 节点中心 Y 坐标
   * @param nodeWidth 节点宽度
   * @param nodeHeight 节点高度
   * @param existingLoops 已存在的自连线数量（用于计算偏移）
   * @returns 自连线路径点数组
   */
  calculatePath(
    nodeX: number,
    nodeY: number,
    nodeWidth: number,
    nodeHeight: number,
    existingLoops: number = 0
  ): SelfLoopPath {
    const { direction, radius, offset, startPosition, endPosition, useBezier, bezierControlOffset } = this.config

    // 计算偏移后的半径
    const offsetRadius = radius + existingLoops * (offset || 20)

    // 根据方向计算起点和终点
    let startPoint: SelfLoopPoint = { x: nodeX, y: nodeY }
    let endPoint: SelfLoopPoint = { x: nodeX, y: nodeY }
    let controlPoint1: SelfLoopPoint | undefined
    let controlPoint2: SelfLoopPoint | undefined

    switch (direction) {
      case 'top':
        startPoint = {
          x: nodeX - nodeWidth / 2 + nodeWidth * startPosition,
          y: nodeY - nodeHeight / 2,
        }
        endPoint = {
          x: nodeX - nodeWidth / 2 + nodeWidth * endPosition,
          y: nodeY - nodeHeight / 2,
        }
        if (useBezier) {
          controlPoint1 = {
            x: startPoint.x,
            y: startPoint.y - offsetRadius,
          }
          controlPoint2 = {
            x: endPoint.x,
            y: endPoint.y - offsetRadius,
          }
        }
        break

      case 'right':
        startPoint = {
          x: nodeX + nodeWidth / 2,
          y: nodeY - nodeHeight / 2 + nodeHeight * startPosition,
        }
        endPoint = {
          x: nodeX + nodeWidth / 2,
          y: nodeY - nodeHeight / 2 + nodeHeight * endPosition,
        }
        if (useBezier) {
          controlPoint1 = {
            x: startPoint.x + offsetRadius,
            y: startPoint.y,
          }
          controlPoint2 = {
            x: endPoint.x + offsetRadius,
            y: endPoint.y,
          }
        }
        break

      case 'bottom':
        startPoint = {
          x: nodeX - nodeWidth / 2 + nodeWidth * startPosition,
          y: nodeY + nodeHeight / 2,
        }
        endPoint = {
          x: nodeX - nodeWidth / 2 + nodeWidth * endPosition,
          y: nodeY + nodeHeight / 2,
        }
        if (useBezier) {
          controlPoint1 = {
            x: startPoint.x,
            y: startPoint.y + offsetRadius,
          }
          controlPoint2 = {
            x: endPoint.x,
            y: endPoint.y + offsetRadius,
          }
        }
        break

      case 'left':
        startPoint = {
          x: nodeX - nodeWidth / 2,
          y: nodeY - nodeHeight / 2 + nodeHeight * startPosition,
        }
        endPoint = {
          x: nodeX - nodeWidth / 2,
          y: nodeY - nodeHeight / 2 + nodeHeight * endPosition,
        }
        if (useBezier) {
          controlPoint1 = {
            x: startPoint.x - offsetRadius,
            y: startPoint.y,
          }
          controlPoint2 = {
            x: endPoint.x - offsetRadius,
            y: endPoint.y,
          }
        }
        break
    }

    // 生成路径点
    let points: SelfLoopPoint[]
    if (useBezier && controlPoint1 && controlPoint2) {
      // 使用贝塞尔曲线 - 生成多个点来近似曲线
      points = this.generateBezierPoints(startPoint, controlPoint1, controlPoint2, endPoint, 20)
    } else {
      // 使用简单的三点弧线
      const midPoint = this.calculateArcMidPoint(startPoint, endPoint, direction, offsetRadius)
      points = [startPoint, midPoint, endPoint]
    }

    return {
      points,
      startPoint,
      endPoint,
      controlPoints: useBezier ? [controlPoint1!, controlPoint2!] : undefined,
    }
  }

  /**
   * 生成贝塞尔曲线点
   */
  private generateBezierPoints(
    p0: SelfLoopPoint,
    p1: SelfLoopPoint,
    p2: SelfLoopPoint,
    p3: SelfLoopPoint,
    segments: number
  ): SelfLoopPoint[] {
    const points: SelfLoopPoint[] = [p0]

    for (let i = 1; i <= segments; i++) {
      const t = i / segments
      const point = this.calculateCubicBezierPoint(p0, p1, p2, p3, t)
      points.push(point)
    }

    return points
  }

  /**
   * 计算三次贝塞尔曲线上的点
   */
  private calculateCubicBezierPoint(
    p0: SelfLoopPoint,
    p1: SelfLoopPoint,
    p2: SelfLoopPoint,
    p3: SelfLoopPoint,
    t: number
  ): SelfLoopPoint {
    const u = 1 - t
    const u2 = u * u
    const u3 = u2 * u
    const t2 = t * t
    const t3 = t2 * t

    return {
      x: u3 * p0.x + 3 * u2 * t * p1.x + 3 * u * t2 * p2.x + t3 * p3.x,
      y: u3 * p0.y + 3 * u2 * t * p1.y + 3 * u * t2 * p2.y + t3 * p3.y,
    }
  }

  /**
   * 计算弧线中点
   */
  private calculateArcMidPoint(
    start: SelfLoopPoint,
    end: SelfLoopPoint,
    direction: SelfLoopDirection,
    radius: number
  ): SelfLoopPoint {
    const midX = (start.x + end.x) / 2
    const midY = (start.y + end.y) / 2

    switch (direction) {
      case 'top':
        return { x: midX, y: midY - radius }
      case 'right':
        return { x: midX + radius, y: midY }
      case 'bottom':
        return { x: midX, y: midY + radius }
      case 'left':
        return { x: midX - radius, y: midY }
    }
  }

  /**
   * 为节点计算多个自连线的配置
   * @param nodeId 节点ID
   * @param loopCount 该节点的自连线总数
   * @param loopIndex 当前自连线索引
   * @returns 自连线配置
   */
  calculateMultiLoopConfig(
    nodeId: string,
    loopCount: number,
    loopIndex: number
  ): Partial<SelfLoopConfig> {
    // 根据索引分配方向，均匀分布在四个方向
    const directions: SelfLoopDirection[] = ['top', 'right', 'bottom', 'left']
    const directionIndex = loopIndex % 4
    const direction = directions[directionIndex]

    // 同一方向的多个自连线使用不同偏移
    const offset = Math.floor(loopIndex / 4) * 25

    return {
      direction,
      offset,
    }
  }

  /**
   * 检测是否为自连线
   */
  static isSelfLoop(sourceId: string, targetId: string): boolean {
    return sourceId === targetId
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SelfLoopConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * 获取当前配置
   */
  getConfig(): SelfLoopConfig {
    return { ...this.config }
  }
}

/**
 * 自连线管理器 - 管理多个节点的自连线
 */
export class SelfLoopManager {
  private nodeLoopCounts: Map<string, number> = new Map()
  private loopRegistry: Map<string, { nodeId: string; index: number }> = new Map()

  /**
   * 注册自连线
   * @param edgeId 边ID
   * @param nodeId 节点ID
   * @returns 该节点上自连线的索引
   */
  registerLoop(edgeId: string, nodeId: string): number {
    const currentCount = this.nodeLoopCounts.get(nodeId) || 0
    const newIndex = currentCount

    this.nodeLoopCounts.set(nodeId, currentCount + 1)
    this.loopRegistry.set(edgeId, { nodeId, index: newIndex })

    return newIndex
  }

  /**
   * 注销自连线
   */
  unregisterLoop(edgeId: string): void {
    const loopInfo = this.loopRegistry.get(edgeId)
    if (loopInfo) {
      const currentCount = this.nodeLoopCounts.get(loopInfo.nodeId) || 0
      if (currentCount > 0) {
        this.nodeLoopCounts.set(loopInfo.nodeId, currentCount - 1)
      }
      this.loopRegistry.delete(edgeId)
    }
  }

  /**
   * 获取节点的自连线数量
   */
  getLoopCount(nodeId: string): number {
    return this.nodeLoopCounts.get(nodeId) || 0
  }

  /**
   * 获取自连线索引
   */
  getLoopIndex(edgeId: string): number {
    return this.loopRegistry.get(edgeId)?.index || 0
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.nodeLoopCounts.clear()
    this.loopRegistry.clear()
  }
}

// 导出单例实例
export const selfLoopRouter = new SelfLoopRouter()
export const selfLoopManager = new SelfLoopManager()

export default selfLoopRouter
