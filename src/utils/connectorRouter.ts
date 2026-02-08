import type { ConnectorStyle, RoutingConfig, RoutingConstraint } from '../types/connection'
import { defaultRoutingConfig, connectorStyleConfigs } from '../types/connection'

export interface RoutePoint {
  x: number
  y: number
}

export interface RouteContext {
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourceShape: any
  targetShape: any
  obstacles: any[]
  constraint?: RoutingConstraint
  padding?: number
}

export class ConnectorRouter {
  private config: RoutingConfig

  constructor(config: Partial<RoutingConfig> = {}) {
    this.config = { ...defaultRoutingConfig, ...config }
  }

  /**
   * Get router configuration for X6 based on connector style
   */
  getRouterConfig(style: ConnectorStyle): { name: string; args?: any } {
    const config = connectorStyleConfigs[style]
    return {
      name: config.router,
      args: this.getRouterArgs(style),
    }
  }

  /**
   * Get connector configuration for X6 based on connector style
   */
  getConnectorConfig(style: ConnectorStyle): { name: string; args?: any } {
    const config = connectorStyleConfigs[style]
    return {
      name: config.connector,
    }
  }

  /**
   * Get router arguments based on style
   */
  private getRouterArgs(style: ConnectorStyle): any {
    switch (style) {
      case 'orthogonal':
      case 'manhattan':
        return {
          step: 10,
          padding: this.config.padding,
        }
      case 'metro':
        return {
          step: 10,
          padding: this.config.padding,
          maximumLoops: this.config.maxIterations,
        }
      case 'curved':
        return {
          direction: 'H',
        }
      default:
        return undefined
    }
  }

  /**
   * Calculate route points for a connector
   */
  calculateRoute(context: RouteContext): RoutePoint[] {
    const { sourceX, sourceY, targetX, targetY, constraint } = context

    // If constraint is specified, apply it
    if (constraint === 'horizontal') {
      return this.calculateHorizontalFirstRoute(context)
    }
    if (constraint === 'vertical') {
      return this.calculateVerticalFirstRoute(context)
    }

    // Default: direct line or simple orthogonal
    if (this.config.algorithm === 'manhattan' || this.config.algorithm === 'metro') {
      return this.calculateOrthogonalRoute(context)
    }

    // Direct line for normal/smooth
    return [{ x: sourceX, y: sourceY }, { x: targetX, y: targetY }]
  }

  /**
   * Calculate orthogonal route with horizontal-first constraint
   */
  private calculateHorizontalFirstRoute(context: RouteContext): RoutePoint[] {
    const { sourceX, sourceY, targetX, targetY } = context
    const points: RoutePoint[] = [{ x: sourceX, y: sourceY }]

    // Go horizontal first
    const midX = (sourceX + targetX) / 2
    points.push({ x: midX, y: sourceY })

    // Then vertical
    points.push({ x: midX, y: targetY })

    points.push({ x: targetX, y: targetY })
    return points
  }

  /**
   * Calculate orthogonal route with vertical-first constraint
   */
  private calculateVerticalFirstRoute(context: RouteContext): RoutePoint[] {
    const { sourceX, sourceY, targetX, targetY } = context
    const points: RoutePoint[] = [{ x: sourceX, y: sourceY }]

    // Go vertical first
    const midY = (sourceY + targetY) / 2
    points.push({ x: sourceX, y: midY })

    // Then horizontal
    points.push({ x: targetX, y: midY })

    points.push({ x: targetX, y: targetY })
    return points
  }

  /**
   * Calculate orthogonal route avoiding obstacles
   */
  private calculateOrthogonalRoute(context: RouteContext): RoutePoint[] {
    const { sourceX, sourceY, targetX, targetY, obstacles, padding = 10 } = context

    // Simple orthogonal routing
    const points: RoutePoint[] = [{ x: sourceX, y: sourceY }]

    // Determine if we should go horizontal or vertical first
    const dx = Math.abs(targetX - sourceX)
    const dy = Math.abs(targetY - sourceY)

    if (dx > dy) {
      // Horizontal first
      points.push({ x: targetX, y: sourceY })
    } else {
      // Vertical first
      points.push({ x: sourceX, y: targetY })
    }

    points.push({ x: targetX, y: targetY })

    // If obstacle avoidance is enabled, check and adjust path
    if (this.config.avoidObstacles && obstacles.length > 0) {
      return this.avoidObstacles(points, obstacles, padding)
    }

    return points
  }

  /**
   * Adjust path to avoid obstacles
   */
  private avoidObstacles(
    points: RoutePoint[],
    obstacles: any[],
    padding: number
  ): RoutePoint[] {
    // Simple obstacle avoidance - add waypoints around obstacles
    const adjustedPoints: RoutePoint[] = [points[0]]

    for (let i = 1; i < points.length; i++) {
      const current = points[i - 1]
      const next = points[i]

      // Check if line segment intersects any obstacle
      const intersectingObstacles = obstacles.filter((obs) =>
        this.lineIntersectsObstacle(current, next, obs, padding)
      )

      if (intersectingObstacles.length > 0) {
        // Add detour points
        const detour = this.calculateDetour(current, next, intersectingObstacles[0], padding)
        adjustedPoints.push(...detour)
      }

      adjustedPoints.push(next)
    }

    return adjustedPoints
  }

  /**
   * Check if a line segment intersects an obstacle
   */
  private lineIntersectsObstacle(
    p1: RoutePoint,
    p2: RoutePoint,
    obstacle: any,
    padding: number
  ): boolean {
    const obsLeft = obstacle.x - padding
    const obsRight = obstacle.x + obstacle.width + padding
    const obsTop = obstacle.y - padding
    const obsBottom = obstacle.y + obstacle.height + padding

    // Check if line segment intersects obstacle rectangle
    return this.lineIntersectsRectangle(p1, p2, obsLeft, obsTop, obsRight, obsBottom)
  }

  /**
   * Check if line segment intersects rectangle
   */
  private lineIntersectsRectangle(
    p1: RoutePoint,
    p2: RoutePoint,
    left: number,
    top: number,
    right: number,
    bottom: number
  ): boolean {
    // Check if either point is inside rectangle
    if (this.pointInRectangle(p1, left, top, right, bottom)) return true
    if (this.pointInRectangle(p2, left, top, right, bottom)) return true

    // Check intersection with rectangle edges
    const edges = [
      { p1: { x: left, y: top }, p2: { x: right, y: top } },
      { p1: { x: right, y: top }, p2: { x: right, y: bottom } },
      { p1: { x: right, y: bottom }, p2: { x: left, y: bottom } },
      { p1: { x: left, y: bottom }, p2: { x: left, y: top } },
    ]

    return edges.some((edge) => this.lineSegmentsIntersect(p1, p2, edge.p1, edge.p2))
  }

  /**
   * Check if point is inside rectangle
   */
  private pointInRectangle(
    p: RoutePoint,
    left: number,
    top: number,
    right: number,
    bottom: number
  ): boolean {
    return p.x >= left && p.x <= right && p.y >= top && p.y <= bottom
  }

  /**
   * Check if two line segments intersect
   */
  private lineSegmentsIntersect(
    p1: RoutePoint,
    p2: RoutePoint,
    p3: RoutePoint,
    p4: RoutePoint
  ): boolean {
    const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x)
    if (d === 0) return false

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / d
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / d

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
  }

  /**
   * Calculate detour points around an obstacle
   */
  private calculateDetour(
    from: RoutePoint,
    to: RoutePoint,
    obstacle: any,
    padding: number
  ): RoutePoint[] {
    const obsCenterX = obstacle.x + obstacle.width / 2
    const obsCenterY = obstacle.y + obstacle.height / 2

    // Determine which side to go around
    const goAbove = from.y < obsCenterY && to.y < obsCenterY
    const goBelow = from.y > obsCenterY && to.y > obsCenterY
    const goLeft = from.x < obsCenterX && to.x < obsCenterX
    const goRight = from.x > obsCenterX && to.x > obsCenterX

    const detour: RoutePoint[] = []

    if (goAbove) {
      detour.push({ x: from.x, y: obstacle.y - padding })
      detour.push({ x: to.x, y: obstacle.y - padding })
    } else if (goBelow) {
      detour.push({ x: from.x, y: obstacle.y + obstacle.height + padding })
      detour.push({ x: to.x, y: obstacle.y + obstacle.height + padding })
    } else if (goLeft) {
      detour.push({ x: obstacle.x - padding, y: from.y })
      detour.push({ x: obstacle.x - padding, y: to.y })
    } else if (goRight) {
      detour.push({ x: obstacle.x + obstacle.width + padding, y: from.y })
      detour.push({ x: obstacle.x + obstacle.width + padding, y: to.y })
    } else {
      // Default: go around the closest side
      const distToTop = Math.abs(from.y - obstacle.y)
      const distToBottom = Math.abs(from.y - (obstacle.y + obstacle.height))

      if (distToTop < distToBottom) {
        detour.push({ x: from.x, y: obstacle.y - padding })
        detour.push({ x: to.x, y: obstacle.y - padding })
      } else {
        detour.push({ x: from.x, y: obstacle.y + obstacle.height + padding })
        detour.push({ x: to.x, y: obstacle.y + obstacle.height + padding })
      }
    }

    return detour
  }

  /**
   * Calculate path length
   */
  calculatePathLength(points: RoutePoint[]): number {
    let length = 0
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x
      const dy = points[i].y - points[i - 1].y
      length += Math.sqrt(dx * dx + dy * dy)
    }
    return length
  }

  /**
   * Update router configuration
   */
  updateConfig(config: Partial<RoutingConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig(): RoutingConfig {
    return { ...this.config }
  }
}

// Singleton instance
let routerInstance: ConnectorRouter | null = null

export function getConnectorRouter(config?: Partial<RoutingConfig>): ConnectorRouter {
  if (!routerInstance) {
    routerInstance = new ConnectorRouter(config)
  } else if (config) {
    routerInstance.updateConfig(config)
  }
  return routerInstance
}

export function resetConnectorRouter() {
  routerInstance = null
}
