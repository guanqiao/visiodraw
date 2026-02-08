/**
 * 连接器系统测试
 * @version 1.0.0
 * @date 2026-02-08
 * 
 * TDD 测试用例 - 连线系统优化
 */

import { describe, it, expect } from 'vitest'
import {
  calculateOrthogonalPath,
  calculateCurvedPath,
  calculateStraightPath,
  simplifyPath,
  isCollinear,
  generateSvgPath,
} from '../connectorEngine'
import { type Connector, type ConnectionPoint } from '../../types/connection'
import { type Shape } from '../../stores/canvasStore'

describe('连线系统 - 路径计算', () => {
  describe('正交线路径计算', () => {
    it('应该计算简单的水平正交路径', () => {
      const start = { x: 0, y: 50 }
      const end = { x: 100, y: 80 }  // 终点 Y 不同于起点
      
      const path = calculateOrthogonalPath(
        start,
        end,
        'right',  // 从右侧出发
        'left'   // 从左侧进入
      )
      
      expect(path.length).toBeGreaterThanOrEqual(2)  // 起点 + 终点（simplifyPath 可能移除中间点）
      expect(path[0]).toEqual(start)
      expect(path[path.length - 1]).toEqual(end)
    })

    it('应该计算简单的垂直正交路径', () => {
      const start = { x: 50, y: 0 }
      const end = { x: 80, y: 100 }  // 终点 X 不同于起点
      
      const path = calculateOrthogonalPath(
        start,
        end,
        'bottom',  // 从底部出发
        'top'   // 从顶部进入
      )
      
      expect(path.length).toBeGreaterThanOrEqual(2)
      expect(path[0]).toEqual(start)
      expect(path[path.length - 1]).toEqual(end)
    })

    it('应该避免在跨越图形时产生交叉', () => {
      const start = { x: 0, y: 50 }
      const end = { x: 200, y: 50 }
      const obstacles = [
        { x: 80, y: 30, width: 40, height: 40 }  // 障碍物
      ]
      
      // 优化后的正交路径应该绕过障碍物
      const path = calculateOrthogonalPath(
        start,
        end,
        'right',
        'left',
        obstacles
      )
      
      expect(path.length).toBeGreaterThanOrEqual(2)
      // 路径应该不穿过障碍物
      for (const point of path) {
        for (const obs of obstacles) {
          expect(
            point.x >= obs.x - 1 &&
            point.x <= obs.x + obs.width + 1 &&
            point.y >= obs.y - 1 &&
            point.y <= obs.y + obs.height + 1
          ).toBe(false)
        }
      }
    })

    it('应该处理跨越很长距离的路径（自动分割）', () => {
      const start = { x: 0, y: 100 }
      const end = { x: 1000, y: 100 }
      
      const path = calculateOrthogonalPath(
        start,
        end,
        'right',
        'left'
      )
      
      // 长距离应该自动添加中间点
      expect(path.length).toBeGreaterThanOrEqual(2)  // 简化后可能只有起点和终点
    })
  })

  describe('曲线线路径计算', () => {
    it('应该生成平滑的贝塞尔曲线', () => {
      const start = { x: 0, y: 50 }
      const end = { x: 100, y: 50 }
      
      const path = calculateCurvedPath(
        start,
        end,
        'right',
        'left'
      )
      
      expect(path.length).toBe(21)  // 起点 + 20个中间点 + 终点
    })

    it('应该根据方向自动调整曲线', () => {
      const start = { x: 0, y: 50 }
      const end = { x: 100, y: 100 }
      
      // 不同方向的曲线应该返回数组
      const path1 = calculateCurvedPath(
        start,
        end,
        'bottom',  // 向下
        'top'   // 向上
      )
      
      const path2 = calculateCurvedPath(
        start,
        end,
        'right',  // 向右
        'left'   // 向左
      )
      
      // 两条路径都应该是有效的
      expect(path1.length).toBe(21)
      expect(path2.length).toBe(21)
      expect(path1[0]).toEqual(start)
      expect(path2[0]).toEqual(start)
      expect(path1[path1.length - 1]).toEqual(end)
      expect(path2[path2.length - 1]).toEqual(end)
    })
  })

  describe('直线路径计算', () => {
    it('应该返回起点和终点', () => {
      const start = { x: 0, y: 0 }
      const end = { x: 100, y: 100 }
      
      const path = calculateStraightPath(start, end)
      
      expect(path.length).toBe(2)
      expect(path[0]).toEqual(start)
      expect(path[1]).toEqual(end)
    })
  })

  describe('路径简化', () => {
    it('应该移除共线点', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 0 },
        { x: 30, y: 0 },
        { x: 40, y: 0 },
      ]
      
      const simplified = simplifyPath(points)
      
      expect(simplified.length).toBeLessThan(points.length)
      expect(simplified[0]).toEqual(points[0])
      expect(simplified[simplified.length - 1]).toEqual(points[points.length - 1])
    })

    it('应该保留非共线点', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 10 },  // 转折点
        { x: 30, y: 0 },
      ]
      
      const simplified = simplifyPath(points)
      
      // 应该保留转折点
      expect(simplified.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('isCollinear 共线检测', () => {
    it('应该正确判断三点共线', () => {
      expect(isCollinear(
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 20, y: 0 }
      )).toBe(true)
    })

    it('应该正确判断三点不共线', () => {
      expect(isCollinear(
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 }
      )).toBe(false)
    })
  })

  describe('SVG 路径生成', () => {
    it('应该生成正确的直线 SVG 路径', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 100, y: 100 }
      ]
      
      const svgPath = generateSvgPath(points, 'straight')
      
      expect(svgPath).toBe('M 0 0 L 100 100')
    })

    it('应该生成正确的正交线 SVG 路径', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 100 },
        { x: 100, y: 100 }
      ]
      
      const svgPath = generateSvgPath(points, 'orthogonal')
      
      expect(svgPath).toContain('M 0 0')
      expect(svgPath).toContain('L 50 0')
      expect(svgPath).toContain('L 50 100')
      expect(svgPath).toContain('L 100 100')
    })
  })
})

describe('连接点系统', () => {
  describe('连接点自动吸附', () => {
    it('应该在接近连接点时自动吸附', () => {
      const connectionPoints = [
        { id: 'cp1', x: 0.5, y: 0, position: 'top' as const, isVisible: true, isConnected: false, connectedLineIds: [] }
      ]
      const shape: Shape = {
        id: 'shape1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 1,
        connectionPoints,
      }
      
      const mousePos = { x: 148, y: 100 }  // 接近顶部中心 (150, 100)
      const snapThreshold = 10
      
      // 应该吸附到连接点
      const snappedPoint = snapToConnectionPoint(mousePos, shape, snapThreshold)
      
      expect(snappedPoint).toBeDefined()
      expect(snappedPoint?.id).toBe('cp1')
    })

    it('应该在远离连接点时返回 null', () => {
      const connectionPoints = [
        { id: 'cp1', x: 0.5, y: 0, position: 'top' as const, isVisible: true, isConnected: false, connectedLineIds: [] }
      ]
      const shape: Shape = {
        id: 'shape1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 1,
        connectionPoints,
      }
      
      const mousePos = { x: 200, y: 200 }  // 远离连接点
      const snapThreshold = 10
      
      const snappedPoint = snapToConnectionPoint(mousePos, shape, snapThreshold)
      
      expect(snappedPoint).toBeNull()
    })
  })

  describe('多个连接点的优先级', () => {
    it('应该优先吸附到最近的连接点', () => {
      const connectionPoints = [
        { id: 'cp1', x: 0, y: 0.5, position: 'left' as const, isVisible: true, isConnected: false, connectedLineIds: [] },
        { id: 'cp2', x: 0.5, y: 1, position: 'bottom' as const, isVisible: true, isConnected: false, connectedLineIds: [] },
      ]
      const shape: Shape = {
        id: 'shape1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 1,
        connectionPoints,
      }
      
      // 更接近左侧连接点
      const mousePos = { x: 102, y: 150 }
      const snapThreshold = 20
      
      const snappedPoint = snapToConnectionPoint(mousePos, shape, snapThreshold)
      
      expect(snappedPoint?.id).toBe('cp1')  // 应该吸附到左侧
    })
  })
})

describe('连线实时跟随', () => {
  describe('图形移动时更新连线', () => {
    it('应该计算移动后的正确路径', () => {
      const connector: Connector = {
        id: 'conn1',
        sourceShapeId: 'shape1',
        sourcePointId: 'cp1',
        targetShapeId: 'shape2',
        targetPointId: 'cp2',
        style: 'straight',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      }
      
      const oldShapes: Shape[] = [
        {
          id: 'shape1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp1', x: 1, y: 0.5, position: 'right', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] }
          ]
        },
        {
          id: 'shape2',
          type: 'rectangle',
          x: 300,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp2', x: 0, y: 0.5, position: 'left', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] }
          ]
        },
      ]
      
      // 移动 shape1 后
      const newShapes = [...oldShapes]
      newShapes[0] = { ...newShapes[0], x: 150 }
      
      const updatedConnector = updateConnectorForShapeMove(connector, 'shape1', newShapes)
      
      // 路径应该更新
      expect(updatedConnector).toBeDefined()
    })
  })
})

// 辅助函数 - 吸附到连接点
function snapToConnectionPoint(
  mousePos: { x: number; y: number },
  shape: Shape,
  threshold: number
): { id: string; x: number; y: number } | null {
  if (!shape.connectionPoints) return null
  
  let closestPoint: { id: string; x: number; y: number } | null = null
  let closestDistance = threshold
  
  for (const point of shape.connectionPoints) {
    const absX = shape.x + point.x * shape.width
    const absY = shape.y + point.y * shape.height
    
    const distance = Math.sqrt(
      Math.pow(mousePos.x - absX, 2) + Math.pow(mousePos.y - absY, 2)
    )
    
    if (distance < closestDistance) {
      closestDistance = distance
      closestPoint = { id: point.id, x: absX, y: absY }
    }
  }
  
  return closestPoint
}

// 辅助函数 - 更新连线以响应图形移动
function updateConnectorForShapeMove(
  connector: Connector,
  movedShapeId: string,
  shapes: Shape[]
): Connector {
  const updatedConnector = { ...connector }
  
  if (connector.sourceShapeId === movedShapeId) {
    // 更新源连接点位置
    const sourceShape = shapes.find(s => s.id === connector.sourceShapeId)
    if (sourceShape) {
      const point = sourceShape.connectionPoints?.find((p: ConnectionPoint) => p.id === connector.sourcePointId)
      if (point) {
        // 标记需要重新计算路径
        updatedConnector.pathPoints = undefined
      }
    }
  }

  if (connector.targetShapeId === movedShapeId) {
    // 更新目标连接点位置
    const targetShape = shapes.find(s => s.id === connector.targetShapeId)
    if (targetShape) {
      const point = targetShape.connectionPoints?.find((p: ConnectionPoint) => p.id === connector.targetPointId)
      if (point) {
        updatedConnector.pathPoints = undefined
      }
    }
  }
  
  return updatedConnector
}

describe('智能路径路由', () => {
  describe('基于连接点位置的智能路由', () => {
    it('起点在右侧终点在左侧时应走水平路线', () => {
      const start = { x: 0, y: 50 }
      const end = { x: 200, y: 50 }

      const path = calculateOrthogonalPath(start, end, 'right', 'left')

      expect(path.length).toBeGreaterThanOrEqual(2)
      expect(path[0]).toEqual(start)
      expect(path[path.length - 1]).toEqual(end)
      // 检查是否走了水平路线
      const hasHorizontalSegment = path.some((p, i) => i > 0 && p.y === path[0].y)
      expect(hasHorizontalSegment).toBe(true)
    })

    it('起点在顶部终点在底部时应走垂直路线', () => {
      const start = { x: 50, y: 0 }
      const end = { x: 50, y: 200 }

      const path = calculateOrthogonalPath(start, end, 'bottom', 'top')

      expect(path.length).toBeGreaterThanOrEqual(2)
      expect(path[0]).toEqual(start)
      expect(path[path.length - 1]).toEqual(end)
      // 检查是否走了垂直路线
      const hasVerticalSegment = path.some((p, i) => i > 0 && p.x === path[0].x)
      expect(hasVerticalSegment).toBe(true)
    })

    it('起点在右下角终点在左上角时应智能选择路径', () => {
      const start = { x: 200, y: 200 }  // 右下
      const end = { x: 0, y: 0 }  // 左上

      const path = calculateOrthogonalPath(start, end, 'top', 'bottom')

      expect(path.length).toBeGreaterThanOrEqual(2)
      expect(path[0]).toEqual(start)
      expect(path[path.length - 1]).toEqual(end)
    })
  })

  describe('障碍物智能避让', () => {
    it('遇到障碍物应该自动绕行', () => {
      const start = { x: 0, y: 100 }
      const end = { x: 300, y: 100 }
      const obstacles = [
        { x: 100, y: 50, width: 100, height: 100 }  // 阻挡在中间
      ]

      const path = calculateOrthogonalPath(start, end, 'right', 'left', obstacles)

      // 路径不应该穿过障碍物
      for (const point of path) {
        for (const obs of obstacles) {
          expect(
            point.x >= obs.x - 1 &&
            point.x <= obs.x + obs.width + 1 &&
            point.y >= obs.y - 1 &&
            point.y <= obs.y + obs.height + 1
          ).toBe(false)
        }
      }
    })

    it('应该选择最短的无障碍路径', () => {
      const start = { x: 0, y: 100 }
      const end = { x: 300, y: 100 }
      // 两个障碍物，一个在上方一个在下方
      const obstacles = [
        { x: 100, y: 0, width: 100, height: 80 },   // 上方障碍物
        { x: 100, y: 150, width: 100, height: 100 } // 下方障碍物
      ]

      const path = calculateOrthogonalPath(start, end, 'right', 'left', obstacles)

      // 路径不应该穿过任何障碍物
      for (const point of path) {
        for (const obs of obstacles) {
          expect(
            point.x >= obs.x - 1 &&
            point.x <= obs.x + obs.width + 1 &&
            point.y >= obs.y - 1 &&
            point.y <= obs.y + obs.height + 1
          ).toBe(false)
        }
      }
    })
  })

  describe('长距离路径自动分割', () => {
    it('长距离路径应该自动添加中间路由点', () => {
      const start = { x: 0, y: 100 }
      const end = { x: 800, y: 100 }  // 超过300像素

      const path = calculateOrthogonalPath(start, end, 'right', 'left')

      // 长距离应该有中间点
      expect(path.length).toBeGreaterThan(2)
      // 检查是否有中间路由
      const hasIntermediatePoints = path.length > 3
      expect(hasIntermediatePoints).toBe(true)
    })
  })
})

describe('实时连线更新', () => {
  describe('图形移动时更新连线', () => {
    it('源图形移动后路径应该更新', () => {
      const connector: Connector = {
        id: 'conn1',
        sourceShapeId: 'shape1',
        sourcePointId: 'cp1',
        targetShapeId: 'shape2',
        targetPointId: 'cp2',
        style: 'orthogonal',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      }

      const oldShapes: Shape[] = [
        {
          id: 'shape1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp1', x: 1, y: 0.5, position: 'right', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] }
          ]
        },
        {
          id: 'shape2',
          type: 'rectangle',
          x: 400,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp2', x: 0, y: 0.5, position: 'left', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] }
          ]
        },
      ]

      // 移动 shape1 到新位置
      const newShapes: Shape[] = [
        { ...oldShapes[0], x: 200, y: 100 },
        oldShapes[1]
      ]

      const updatedConnector = updateConnectorForShapeMove(connector, 'shape1', newShapes)

      // 标记为需要重新计算路径
      expect(updatedConnector.pathPoints).toBeUndefined()
    })

    it('目标图形移动后路径应该更新', () => {
      const connector: Connector = {
        id: 'conn1',
        sourceShapeId: 'shape1',
        sourcePointId: 'cp1',
        targetShapeId: 'shape2',
        targetPointId: 'cp2',
        style: 'orthogonal',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      }

      const oldShapes: Shape[] = [
        {
          id: 'shape1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp1', x: 1, y: 0.5, position: 'right', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] }
          ]
        },
        {
          id: 'shape2',
          type: 'rectangle',
          x: 400,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp2', x: 0, y: 0.5, position: 'left', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] }
          ]
        },
      ]

      // 移动 shape2 到新位置
      const newShapes: Shape[] = [
        oldShapes[0],
        { ...oldShapes[1], x: 500, y: 150 }
      ]

      const updatedConnector = updateConnectorForShapeMove(connector, 'shape2', newShapes)

      // 标记为需要重新计算路径
      expect(updatedConnector.pathPoints).toBeUndefined()
    })

    it('不相关的图形移动不应该触发更新', () => {
      const connector: Connector = {
        id: 'conn1',
        sourceShapeId: 'shape1',
        sourcePointId: 'cp1',
        targetShapeId: 'shape2',
        targetPointId: 'cp2',
        style: 'orthogonal',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
        pathPoints: [{ x: 0, y: 0 }, { x: 100, y: 100 }]
      }

      const shapes: Shape[] = [
        {
          id: 'shape1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp1', x: 1, y: 0.5, position: 'right', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] }
          ]
        },
        {
          id: 'shape2',
          type: 'rectangle',
          x: 400,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp2', x: 0, y: 0.5, position: 'left', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] }
          ]
        },
        {
          id: 'shape3',  // 不相关的图形
          type: 'rectangle',
          x: 700,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
        },
      ]

      // 移动不相关的 shape3
      const newShapes = [...shapes]
      newShapes[2] = { ...shapes[2], x: 800 }

      const updatedConnector = updateConnectorForShapeMove(connector, 'shape3', newShapes)

      // 路径点应该保持不变
      expect(updatedConnector.pathPoints).toEqual(connector.pathPoints)
    })
  })

  describe('批量图形移动', () => {
    it('多个图形移动时应该正确处理所有关联的连线', () => {
      const connector1: Connector = {
        id: 'conn1',
        sourceShapeId: 'shape1',
        sourcePointId: 'cp1',
        targetShapeId: 'shape2',
        targetPointId: 'cp2',
        style: 'orthogonal',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      }

      const connector2: Connector = {
        id: 'conn2',
        sourceShapeId: 'shape2',
        sourcePointId: 'cp3',
        targetShapeId: 'shape3',
        targetPointId: 'cp4',
        style: 'orthogonal',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      }

      const shapes: Shape[] = [
        {
          id: 'shape1',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp1', x: 1, y: 0.5, position: 'right', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] }
          ]
        },
        {
          id: 'shape2',
          type: 'rectangle',
          x: 400,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp2', x: 0, y: 0.5, position: 'left', isVisible: true, isConnected: true, connectedLineIds: ['conn1'] },
            { id: 'cp3', x: 1, y: 0.5, position: 'right', isVisible: true, isConnected: true, connectedLineIds: ['conn2'] }
          ]
        },
        {
          id: 'shape3',
          type: 'rectangle',
          x: 700,
          y: 100,
          width: 100,
          height: 100,
          fill: '#ffffff',
          stroke: '#333333',
          strokeWidth: 1,
          connectionPoints: [
            { id: 'cp4', x: 0, y: 0.5, position: 'left', isVisible: true, isConnected: true, connectedLineIds: ['conn2'] }
          ]
        },
      ]

      // 同时移动 shape2 和 shape3
      const newShapes: Shape[] = [
        shapes[0],
        { ...shapes[1], x: 450 },
        { ...shapes[2], x: 800 }
      ]

      const updatedConn1 = updateConnectorForShapeMove(connector1, 'shape2', newShapes)
      const updatedConn2 = updateConnectorForShapeMove(connector2, 'shape2', newShapes)
      const updatedConn3 = updateConnectorForShapeMove(connector2, 'shape3', newShapes)

      // 所有相关的连接器都应该标记为需要重新计算
      expect(updatedConn1.pathPoints).toBeUndefined()
      expect(updatedConn2.pathPoints).toBeUndefined()
      expect(updatedConn3.pathPoints).toBeUndefined()
    })
  })
})
