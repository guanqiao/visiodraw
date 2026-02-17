import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getRelativePosition,
  generateDefaultConnectionPoints,
  calculateConnectionPointPosition,
  findNearestConnectionPoint,
  createConnectionPoint,
  getNearestEdgePoint,
  findNearestConnectionPointEnhanced,
  isNearShapeEdge,
  createDynamicConnectionPoint,
  isPointInsideShape,
  getPortIdFromPosition,
  getPositionFromPortId,
  updateConnectionPointConnectionStatus,
  getConnectionPointsForX6Ports,
  getX6PortGroups,
  isNearNodeEdge,
  getEdgePointFromMouse,
  createCustomConnectionPoint,
} from '../connectionPoints'
import type { ConnectionPoint } from '../../types/connection'

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}))

describe('connectionPoints', () => {
  describe('getRelativePosition', () => {
    it('should return correct position for top', () => {
      const pos = getRelativePosition('top')
      expect(pos).toEqual({ x: 0.5, y: 0 })
    })

    it('should return correct position for bottom', () => {
      const pos = getRelativePosition('bottom')
      expect(pos).toEqual({ x: 0.5, y: 1 })
    })

    it('should return correct position for left', () => {
      const pos = getRelativePosition('left')
      expect(pos).toEqual({ x: 0, y: 0.5 })
    })

    it('should return correct position for right', () => {
      const pos = getRelativePosition('right')
      expect(pos).toEqual({ x: 1, y: 0.5 })
    })

    it('should return correct position for center', () => {
      const pos = getRelativePosition('center')
      expect(pos).toEqual({ x: 0.5, y: 0.5 })
    })

    it('should return center for custom position', () => {
      const pos = getRelativePosition('custom')
      expect(pos).toEqual({ x: 0.5, y: 0.5 })
    })
  })

  describe('generateDefaultConnectionPoints', () => {
    it('should generate default connection points', () => {
      const points = generateDefaultConnectionPoints('rectangle')
      expect(points.length).toBeGreaterThan(0)
      expect(points[0]).toHaveProperty('id')
      expect(points[0]).toHaveProperty('x')
      expect(points[0]).toHaveProperty('y')
      expect(points[0]).toHaveProperty('position')
    })

    it('should generate points with correct visibility', () => {
      const points = generateDefaultConnectionPoints('rectangle')
      points.forEach(point => {
        expect(point.isVisible).toBe(false)
      })
    })
  })

  describe('calculateConnectionPointPosition', () => {
    const shape = {
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      rotation: 0,
    }

    it('should calculate absolute position for top center', () => {
      const point: ConnectionPoint = {
        id: '1',
        x: 0.5,
        y: 0,
        position: 'top',
        isVisible: false,
        isConnected: false,
        connectedLineIds: [],
        isDynamic: false,
      }
      const pos = calculateConnectionPointPosition(shape, point)
      expect(pos.x).toBe(200)
      expect(pos.y).toBe(100)
    })

    it('should calculate absolute position for bottom center', () => {
      const point: ConnectionPoint = {
        id: '1',
        x: 0.5,
        y: 1,
        position: 'bottom',
        isVisible: false,
        isConnected: false,
        connectedLineIds: [],
        isDynamic: false,
      }
      const pos = calculateConnectionPointPosition(shape, point)
      expect(pos.x).toBe(200)
      expect(pos.y).toBe(200)
    })

    it('should handle rotated shapes', () => {
      const rotatedShape = { ...shape, rotation: 90 }
      const point: ConnectionPoint = {
        id: '1',
        x: 0.5,
        y: 0,
        position: 'top',
        isVisible: false,
        isConnected: false,
        connectedLineIds: [],
        isDynamic: false,
      }
      const pos = calculateConnectionPointPosition(rotatedShape, point)
      expect(pos.x).toBeDefined()
      expect(pos.y).toBeDefined()
    })
  })

  describe('findNearestConnectionPoint', () => {
    const shapes = [
      {
        id: 'shape1',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        rotation: 0,
        connectionPoints: [
          { id: 'cp1', x: 0.5, y: 0, position: 'top' as const, isVisible: false, isConnected: false, connectedLineIds: [], isDynamic: false },
        ],
      },
    ]

    it('should find nearest connection point', () => {
      const result = findNearestConnectionPoint(150, 100, shapes, 15)
      expect(result).not.toBeNull()
      expect(result?.shape.id).toBe('shape1')
    })

    it('should return null if no point within threshold', () => {
      const result = findNearestConnectionPoint(500, 500, shapes, 15)
      expect(result).toBeNull()
    })

    it('should return null if shape has no connection points', () => {
      const shapesWithoutPoints = [
        { id: 'shape1', x: 100, y: 100, width: 100, height: 100, rotation: 0, connectionPoints: [] },
      ]
      const result = findNearestConnectionPoint(150, 100, shapesWithoutPoints, 15)
      expect(result).toBeNull()
    })
  })

  describe('createConnectionPoint', () => {
    it('should create a connection point', () => {
      const point = createConnectionPoint(0.5, 0.5, 'custom')
      expect(point.x).toBe(0.5)
      expect(point.y).toBe(0.5)
      expect(point.position).toBe('custom')
      expect(point.isVisible).toBe(false)
      expect(point.isConnected).toBe(false)
    })

    it('should default to custom position', () => {
      const point = createConnectionPoint(0.5, 0.5)
      expect(point.position).toBe('custom')
    })
  })

  describe('getNearestEdgePoint', () => {
    const shape = {
      x: 100,
      y: 100,
      width: 200,
      height: 100,
    }

    it('should find nearest top edge', () => {
      const result = getNearestEdgePoint(shape, 150, 50)
      expect(result.position).toBe('top')
    })

    it('should find nearest bottom edge', () => {
      const result = getNearestEdgePoint(shape, 150, 250)
      expect(result.position).toBe('bottom')
    })

    it('should find nearest edge based on distance', () => {
      const result = getNearestEdgePoint(shape, 50, 150)
      expect(['left', 'top', 'bottom']).toContain(result.position)
    })

    it('should clamp coordinates to shape bounds', () => {
      const result = getNearestEdgePoint(shape, 500, 50)
      expect(result.x).toBeLessThanOrEqual(shape.x + shape.width)
      expect(result.x).toBeGreaterThanOrEqual(shape.x)
    })
  })

  describe('findNearestConnectionPointEnhanced', () => {
    const shapes = [
      {
        id: 'shape1',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        rotation: 0,
        connectionPoints: [
          { id: 'cp1', x: 0.5, y: 0, position: 'top' as const, isVisible: false, isConnected: false, connectedLineIds: [], isDynamic: false },
        ],
      },
    ]

    it('should find connection point if within threshold', () => {
      const result = findNearestConnectionPointEnhanced(150, 100, shapes, 20)
      expect(result).not.toBeNull()
      expect(result?.isEdgePoint).toBe(false)
    })
  })

  describe('isNearShapeEdge', () => {
    const shape = {
      x: 100,
      y: 100,
      width: 200,
      height: 100,
    }

    it('should return true when near edge', () => {
      expect(isNearShapeEdge(shape, 105, 150, 15)).toBe(true)
    })

    it('should return false when far from edge', () => {
      expect(isNearShapeEdge(shape, 200, 150, 15)).toBe(false)
    })

    it('should return false when outside shape bounds', () => {
      expect(isNearShapeEdge(shape, 50, 50, 15)).toBe(false)
    })
  })

  describe('createDynamicConnectionPoint', () => {
    const shape = {
      x: 100,
      y: 100,
      width: 200,
      height: 100,
    }

    it('should create dynamic connection point', () => {
      const point = createDynamicConnectionPoint(shape, 150, 100)
      expect(point.isDynamic).toBe(true)
      expect(point.isConnected).toBe(true)
    })

    it('should determine position based on relative coordinates', () => {
      const topPoint = createDynamicConnectionPoint(shape, 200, 105)
      expect(topPoint.position).toBe('top')

      const bottomPoint = createDynamicConnectionPoint(shape, 200, 195)
      expect(bottomPoint.position).toBe('bottom')
    })

    it('should clamp relative coordinates to valid range', () => {
      const point = createDynamicConnectionPoint(shape, 500, 500)
      expect(point.x).toBeLessThanOrEqual(1)
      expect(point.x).toBeGreaterThanOrEqual(0)
      expect(point.y).toBeLessThanOrEqual(1)
      expect(point.y).toBeGreaterThanOrEqual(0)
    })
  })

  describe('isPointInsideShape', () => {
    const shape = {
      x: 100,
      y: 100,
      width: 200,
      height: 100,
    }

    it('should return true for point inside shape', () => {
      expect(isPointInsideShape(shape, 150, 150)).toBe(true)
    })

    it('should return true for point on edge', () => {
      expect(isPointInsideShape(shape, 100, 100)).toBe(true)
    })

    it('should return false for point outside shape', () => {
      expect(isPointInsideShape(shape, 50, 50)).toBe(false)
    })
  })

  describe('getPortIdFromPosition', () => {
    it('should return position as port id', () => {
      expect(getPortIdFromPosition('top')).toBe('top')
      expect(getPortIdFromPosition('bottom')).toBe('bottom')
    })
  })

  describe('getPositionFromPortId', () => {
    it('should return valid position for known port ids', () => {
      expect(getPositionFromPortId('top')).toBe('top')
      expect(getPositionFromPortId('bottom')).toBe('bottom')
      expect(getPositionFromPortId('left')).toBe('left')
      expect(getPositionFromPortId('right')).toBe('right')
      expect(getPositionFromPortId('center')).toBe('center')
    })

    it('should return custom for unknown port ids', () => {
      expect(getPositionFromPortId('unknown')).toBe('custom')
    })
  })

  describe('updateConnectionPointConnectionStatus', () => {
    const point: ConnectionPoint = {
      id: '1',
      x: 0.5,
      y: 0,
      position: 'top',
      isVisible: false,
      isConnected: false,
      connectedLineIds: [],
      isDynamic: false,
    }

    it('should add line id when connecting', () => {
      const updated = updateConnectionPointConnectionStatus(point, 'line1', true)
      expect(updated.isConnected).toBe(true)
      expect(updated.connectedLineIds).toContain('line1')
    })

    it('should remove line id when disconnecting', () => {
      const connectedPoint = { ...point, connectedLineIds: ['line1'], isConnected: true }
      const updated = updateConnectionPointConnectionStatus(connectedPoint, 'line1', false)
      expect(updated.isConnected).toBe(false)
      expect(updated.connectedLineIds).not.toContain('line1')
    })

    it('should handle multiple connections', () => {
      let updated = updateConnectionPointConnectionStatus(point, 'line1', true)
      updated = updateConnectionPointConnectionStatus(updated, 'line2', true)
      expect(updated.connectedLineIds).toHaveLength(2)
      expect(updated.isConnected).toBe(true)
    })
  })

  describe('getConnectionPointsForX6Ports', () => {
    it('should return port configuration for X6', () => {
      const ports = getConnectionPointsForX6Ports('rectangle')
      expect(ports.length).toBeGreaterThan(0)
      expect(ports[0]).toHaveProperty('id')
      expect(ports[0]).toHaveProperty('group')
    })
  })

  describe('getX6PortGroups', () => {
    it('should return port group configuration', () => {
      const groups = getX6PortGroups()
      expect(groups).toHaveProperty('top')
      expect(groups).toHaveProperty('bottom')
      expect(groups).toHaveProperty('left')
      expect(groups).toHaveProperty('right')
    })

    it('should have correct port attributes', () => {
      const groups = getX6PortGroups()
      expect(groups.top.attrs.circle).toHaveProperty('r')
      expect(groups.top.attrs.circle).toHaveProperty('magnet')
      expect(groups.top.attrs.circle.magnet).toBe(true)
    })

    it('should have custom port group', () => {
      const groups = getX6PortGroups()
      expect(groups).toHaveProperty('custom')
      expect(groups.custom.attrs.circle.stroke).toBe('#52c41a')
    })
  })

  describe('isNearNodeEdge', () => {
    const mockNode = {
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 200, height: 100 }),
    }

    it('should return true when near edge', () => {
      expect(isNearNodeEdge(mockNode, 105, 150, 15)).toBe(true)
    })

    it('should return false when far from edge', () => {
      expect(isNearNodeEdge(mockNode, 200, 150, 15)).toBe(false)
    })

    it('should return false when outside bounds', () => {
      expect(isNearNodeEdge(mockNode, 50, 50, 15)).toBe(false)
    })
  })

  describe('getEdgePointFromMouse', () => {
    const mockNode = {
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 200, height: 100 }),
    }

    it('should return edge point for top edge', () => {
      const result = getEdgePointFromMouse(mockNode, 150, 100)
      expect(result).not.toBeNull()
      expect(result?.edge).toBe('top')
      expect(result?.y).toBe(0)
    })

    it('should return edge point for bottom edge', () => {
      const result = getEdgePointFromMouse(mockNode, 150, 200)
      expect(result).not.toBeNull()
      expect(result?.edge).toBe('bottom')
      expect(result?.y).toBe(1)
    })

    it('should return edge point for left edge', () => {
      const result = getEdgePointFromMouse(mockNode, 100, 150)
      expect(result).not.toBeNull()
      expect(result?.edge).toBe('left')
      expect(result?.x).toBe(0)
    })

    it('should return edge point for right edge', () => {
      const result = getEdgePointFromMouse(mockNode, 300, 150)
      expect(result).not.toBeNull()
      expect(result?.edge).toBe('right')
      expect(result?.x).toBe(1)
    })

    it('should return relative coordinates', () => {
      const result = getEdgePointFromMouse(mockNode, 150, 100)
      expect(result?.x).toBeGreaterThanOrEqual(0)
      expect(result?.x).toBeLessThanOrEqual(1)
      expect(result?.y).toBeGreaterThanOrEqual(0)
      expect(result?.y).toBeLessThanOrEqual(1)
    })
  })

  describe('createCustomConnectionPoint', () => {
    it('should create custom connection point', () => {
      const point = createCustomConnectionPoint(0.3, 0.7)
      expect(point.x).toBe(0.3)
      expect(point.y).toBe(0.7)
      expect(point.position).toBe('custom')
      expect(point.isCustom).toBe(true)
    })

    it('should have correct default properties', () => {
      const point = createCustomConnectionPoint(0.5, 0.5)
      expect(point.isVisible).toBe(true)
      expect(point.isConnected).toBe(false)
      expect(point.connectedLineIds).toEqual([])
    })
  })
})
