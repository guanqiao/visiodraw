import type { ConnectionPoint } from '../../types/connection'

interface Point {
  x: number
  y: number
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface IndexedConnectionPoint {
  shapeId: string
  point: ConnectionPoint
  position: Point
}

/**
 * 网格空间索引 - 用于快速查找最近的连接点
 * 将画布划分为网格，每个网格单元存储该区域的连接点
 */
export class SpatialIndex {
  private gridSize: number
  private grid = new Map<string, IndexedConnectionPoint[]>()
  private shapeConnectionPoints = new Map<string, IndexedConnectionPoint[]>()

  constructor(gridSize: number = 100) {
    this.gridSize = gridSize
  }

  /**
   * 获取网格键
   */
  private getGridKey(x: number, y: number): string {
    const gridX = Math.floor(x / this.gridSize)
    const gridY = Math.floor(y / this.gridSize)
    return `${gridX},${gridY}`
  }

  /**
   * 构建空间索引
   */
  buildIndex(
    shapes: Array<{
      id: string
      x: number
      y: number
      width: number
      height: number
      connectionPoints?: ConnectionPoint[]
    }>
  ): void {
    this.clear()

    for (const shape of shapes) {
      if (!shape.connectionPoints || shape.connectionPoints.length === 0) {
        continue
      }

      const indexedPoints: IndexedConnectionPoint[] = []

      for (const point of shape.connectionPoints) {
        const position = this.calculateConnectionPointPosition(
          shape,
          point
        )
        const indexedPoint: IndexedConnectionPoint = {
          shapeId: shape.id,
          point,
          position,
        }

        indexedPoints.push(indexedPoint)

        // 将连接点添加到对应的网格单元
        const gridKey = this.getGridKey(position.x, position.y)
        if (!this.grid.has(gridKey)) {
          this.grid.set(gridKey, [])
        }
        this.grid.get(gridKey)!.push(indexedPoint)
      }

      this.shapeConnectionPoints.set(shape.id, indexedPoints)
    }
  }

  /**
   * 计算连接点的实际位置
   */
  private calculateConnectionPointPosition(
    shape: { x: number; y: number; width: number; height: number },
    point: ConnectionPoint
  ): Point {
    const relativePos = this.getRelativePosition(point.position)
    return {
      x: shape.x + shape.width * relativePos.x,
      y: shape.y + shape.height * relativePos.y,
    }
  }

  /**
   * 获取相对位置
   */
  private getRelativePosition(position: string): { x: number; y: number } {
    const positions: Record<string, { x: number; y: number }> = {
      top: { x: 0.5, y: 0 },
      bottom: { x: 0.5, y: 1 },
      left: { x: 0, y: 0.5 },
      right: { x: 1, y: 0.5 },
      center: { x: 0.5, y: 0.5 },
      'top-left': { x: 0, y: 0 },
      'top-right': { x: 1, y: 0 },
      'bottom-left': { x: 0, y: 1 },
      'bottom-right': { x: 1, y: 1 },
    }
    return positions[position] || positions.center
  }

  /**
   * 查找最近的连接点
   * 使用网格索引优化，时间复杂度从 O(n*m) 降低到 O(k)
   * k 是附近网格中的连接点数量
   */
  findNearest(
    x: number,
    y: number,
    threshold: number,
    excludeShapeId?: string
  ): { shapeId: string; point: ConnectionPoint; distance: number } | null {
    const thresholdSquared = threshold * threshold
    let nearest: { shapeId: string; point: ConnectionPoint; distance: number } | null =
      null
    let minDistanceSquared = thresholdSquared

    // 计算搜索范围（以阈值扩展的网格区域）
    const startGridX = Math.floor((x - threshold) / this.gridSize)
    const endGridX = Math.floor((x + threshold) / this.gridSize)
    const startGridY = Math.floor((y - threshold) / this.gridSize)
    const endGridY = Math.floor((y + threshold) / this.gridSize)

    // 只搜索附近的网格单元
    for (let gridX = startGridX; gridX <= endGridX; gridX++) {
      for (let gridY = startGridY; gridY <= endGridY; gridY++) {
        const gridKey = `${gridX},${gridY}`
        const points = this.grid.get(gridKey)

        if (!points) continue

        for (const indexedPoint of points) {
          // 排除指定图形
          if (excludeShapeId && indexedPoint.shapeId === excludeShapeId) {
            continue
          }

          const dx = indexedPoint.position.x - x
          const dy = indexedPoint.position.y - y
          const distanceSquared = dx * dx + dy * dy

          if (distanceSquared < minDistanceSquared) {
            minDistanceSquared = distanceSquared
            nearest = {
              shapeId: indexedPoint.shapeId,
              point: indexedPoint.point,
              distance: Math.sqrt(distanceSquared),
            }
          }
        }
      }
    }

    return nearest
  }

  /**
   * 查找指定图形范围内的所有连接点
   */
  findInRect(rect: Rect): IndexedConnectionPoint[] {
    const result: IndexedConnectionPoint[] = []

    const startGridX = Math.floor(rect.x / this.gridSize)
    const endGridX = Math.floor((rect.x + rect.width) / this.gridSize)
    const startGridY = Math.floor(rect.y / this.gridSize)
    const endGridY = Math.floor((rect.y + rect.height) / this.gridSize)

    for (let gridX = startGridX; gridX <= endGridX; gridX++) {
      for (let gridY = startGridY; gridY <= endGridY; gridY++) {
        const gridKey = `${gridX},${gridY}`
        const points = this.grid.get(gridKey)

        if (points) {
          for (const point of points) {
            if (
              point.position.x >= rect.x &&
              point.position.x <= rect.x + rect.width &&
              point.position.y >= rect.y &&
              point.position.y <= rect.y + rect.height
            ) {
              result.push(point)
            }
          }
        }
      }
    }

    return result
  }

  /**
   * 更新指定图形的连接点
   */
  updateShape(
    shape: {
      id: string
      x: number
      y: number
      width: number
      height: number
      connectionPoints?: ConnectionPoint[]
    }
  ): void {
    // 移除旧的连接点
    this.removeShape(shape.id)

    // 添加新的连接点
    if (shape.connectionPoints && shape.connectionPoints.length > 0) {
      const indexedPoints: IndexedConnectionPoint[] = []

      for (const point of shape.connectionPoints) {
        const position = this.calculateConnectionPointPosition(shape, point)
        const indexedPoint: IndexedConnectionPoint = {
          shapeId: shape.id,
          point,
          position,
        }

        indexedPoints.push(indexedPoint)

        const gridKey = this.getGridKey(position.x, position.y)
        if (!this.grid.has(gridKey)) {
          this.grid.set(gridKey, [])
        }
        this.grid.get(gridKey)!.push(indexedPoint)
      }

      this.shapeConnectionPoints.set(shape.id, indexedPoints)
    }
  }

  /**
   * 移除指定图形的连接点
   */
  removeShape(shapeId: string): void {
    const indexedPoints = this.shapeConnectionPoints.get(shapeId)
    if (!indexedPoints) return

    for (const indexedPoint of indexedPoints) {
      const gridKey = this.getGridKey(indexedPoint.position.x, indexedPoint.position.y)
      const points = this.grid.get(gridKey)
      if (points) {
        const index = points.indexOf(indexedPoint)
        if (index > -1) {
          points.splice(index, 1)
        }
        if (points.length === 0) {
          this.grid.delete(gridKey)
        }
      }
    }

    this.shapeConnectionPoints.delete(shapeId)
  }

  /**
   * 清空索引
   */
  clear(): void {
    this.grid.clear()
    this.shapeConnectionPoints.clear()
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    gridCells: number
    totalPoints: number
    shapes: number
    gridSize: number
  } {
    let totalPoints = 0
    for (const points of this.grid.values()) {
      totalPoints += points.length
    }

    return {
      gridCells: this.grid.size,
      totalPoints,
      shapes: this.shapeConnectionPoints.size,
      gridSize: this.gridSize,
    }
  }
}

export default SpatialIndex
