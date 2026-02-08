import { v4 as uuidv4 } from 'uuid'
import type { ConnectionPoint, ConnectionPointPosition } from '../types/connection'
import { defaultConnectionPointsConfig } from '../types/connection'

export function getRelativePosition(position: ConnectionPointPosition | string): { x: number; y: number } {
  switch (position) {
    case 'top':
      return { x: 0.5, y: 0 }
    case 'bottom':
      return { x: 0.5, y: 1 }
    case 'left':
      return { x: 0, y: 0.5 }
    case 'right':
      return { x: 1, y: 0.5 }
    case 'bottom-left':
      return { x: 0, y: 1 }
    case 'bottom-right':
      return { x: 1, y: 1 }
    case 'custom':
    default:
      return { x: 0.5, y: 0.5 }
  }
}

export function generateDefaultConnectionPoints(shapeType: string): ConnectionPoint[] {
  const positions = defaultConnectionPointsConfig[shapeType] || ['top', 'bottom', 'left', 'right']
  
  return positions.map((position) => {
    const relativePos = getRelativePosition(position)
    return {
      id: uuidv4(),
      x: relativePos.x,
      y: relativePos.y,
      position: position as ConnectionPointPosition,
      isVisible: false,
      isConnected: false,
      connectedLineIds: [],
    }
  })
}

export function calculateConnectionPointPosition(
  shape: any,
  connectionPoint: ConnectionPoint
): { x: number; y: number } {
  const absX = shape.x + shape.width * connectionPoint.x
  const absY = shape.y + shape.height * connectionPoint.y
  
  if (shape.rotation && shape.rotation !== 0) {
    const centerX = shape.x + shape.width / 2
    const centerY = shape.y + shape.height / 2
    const rad = (shape.rotation * Math.PI) / 180
    
    const relX = absX - centerX
    const relY = absY - centerY
    
    const rotatedX = relX * Math.cos(rad) - relY * Math.sin(rad)
    const rotatedY = relX * Math.sin(rad) + relY * Math.cos(rad)
    
    return {
      x: centerX + rotatedX,
      y: centerY + rotatedY,
    }
  }
  
  return { x: absX, y: absY }
}

export function findNearestConnectionPoint(
  x: number,
  y: number,
  shapes: any[],
  threshold: number = 15
): { shape: any; connectionPoint: ConnectionPoint; distance: number } | null {
  let nearest: { shape: any; connectionPoint: ConnectionPoint; distance: number } | null = null
  let minDistance = threshold
  
  for (const shape of shapes) {
    if (!shape.connectionPoints || shape.connectionPoints.length === 0) {
      continue
    }
    
    for (const point of shape.connectionPoints) {
      const pos = calculateConnectionPointPosition(shape, point)
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2))
      
      if (distance < minDistance) {
        minDistance = distance
        nearest = { shape, connectionPoint: point, distance }
      }
    }
  }
  
  return nearest
}

export function createConnectionPoint(
  x: number,
  y: number,
  position: ConnectionPointPosition = 'custom'
): ConnectionPoint {
  return {
    id: uuidv4(),
    x,
    y,
    position,
    isVisible: false,
    isConnected: false,
    connectedLineIds: [],
  }
}

export function getNearestEdgePoint(
  shape: any,
  mouseX: number,
  mouseY: number
): { x: number; y: number; position: ConnectionPointPosition; distance: number } {
  const distances = [
    { position: 'top' as ConnectionPointPosition, distance: Math.abs(mouseY - shape.y), x: mouseX, y: shape.y },
    { position: 'bottom' as ConnectionPointPosition, distance: Math.abs(mouseY - (shape.y + shape.height)), x: mouseX, y: shape.y + shape.height },
    { position: 'left' as ConnectionPointPosition, distance: Math.abs(mouseX - shape.x), x: shape.x, y: mouseY },
    { position: 'right' as ConnectionPointPosition, distance: Math.abs(mouseX - (shape.x + shape.width)), x: shape.x + shape.width, y: mouseY },
  ]

  const nearest = distances.reduce((min, current) => (current.distance < min.distance ? current : min))

  let finalX = nearest.x
  let finalY = nearest.y

  if (nearest.position === 'top' || nearest.position === 'bottom') {
    finalX = Math.max(shape.x, Math.min(shape.x + shape.width, mouseX))
  } else {
    finalY = Math.max(shape.y, Math.min(shape.y + shape.height, mouseY))
  }

  return {
    x: finalX,
    y: finalY,
    position: nearest.position,
    distance: nearest.distance,
  }
}

export function findNearestConnectionPointEnhanced(
  x: number,
  y: number,
  shapes: any[],
  threshold: number = 20
): { shape: any; connectionPoint: ConnectionPoint; distance: number; isEdgePoint: boolean; edgePosition?: ConnectionPointPosition } | null {
  let nearest: { shape: any; connectionPoint: ConnectionPoint; distance: number; isEdgePoint: boolean; edgePosition?: ConnectionPointPosition } | null = null
  let minDistance = threshold

  for (const shape of shapes) {
    if (shape.connectionPoints && shape.connectionPoints.length > 0) {
      for (const point of shape.connectionPoints) {
        const pos = calculateConnectionPointPosition(shape, point)
        const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2))

        if (distance < minDistance) {
          minDistance = distance
          nearest = { shape, connectionPoint: point, distance, isEdgePoint: false }
        }
      }
    }

    if (!nearest || minDistance > 10) {
      const edgePoint = getNearestEdgePoint(shape, x, y)
      if (edgePoint.distance < minDistance) {
        const relativeX = (edgePoint.x - shape.x) / shape.width
        const relativeY = (edgePoint.y - shape.y) / shape.height
        const tempPoint: ConnectionPoint = {
          id: `temp-${edgePoint.position}`,
          x: relativeX,
          y: relativeY,
          position: edgePoint.position,
          isVisible: true,
          isConnected: false,
          connectedLineIds: [],
        }

        minDistance = edgePoint.distance
        nearest = {
          shape,
          connectionPoint: tempPoint,
          distance: edgePoint.distance,
          isEdgePoint: true,
          edgePosition: edgePoint.position,
        }
      }
    }
  }

  return nearest
}

export function isNearShapeEdge(shape: any, x: number, y: number, threshold: number = 15): boolean {
  const inBounds = x >= shape.x - threshold &&
    x <= shape.x + shape.width + threshold &&
    y >= shape.y - threshold &&
    y <= shape.y + shape.height + threshold

  if (!inBounds) return false

  const nearEdge = x <= shape.x + threshold ||
    x >= shape.x + shape.width - threshold ||
    y <= shape.y + threshold ||
    y >= shape.y + shape.height - threshold

  return nearEdge
}

export function createDynamicConnectionPoint(
  shape: any,
  x: number,
  y: number
): ConnectionPoint {
  const relativeX = Math.max(0, Math.min(1, (x - shape.x) / shape.width))
  const relativeY = Math.max(0, Math.min(1, (y - shape.y) / shape.height))
  
  let position: ConnectionPointPosition = 'custom'
  const threshold = 0.2
  
  if (relativeY < threshold) {
    position = 'top'
  } else if (relativeY > 1 - threshold) {
    position = 'bottom'
  } else if (relativeX < threshold) {
    position = 'left'
  } else if (relativeX > 1 - threshold) {
    position = 'right'
  }
  
  return {
    id: `dynamic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    x: relativeX,
    y: relativeY,
    position,
    isVisible: false,
    isConnected: true,
    connectedLineIds: [],
  }
}

export function isPointInsideShape(shape: any, x: number, y: number): boolean {
  return x >= shape.x &&
    x <= shape.x + shape.width &&
    y >= shape.y &&
    y <= shape.y + shape.height
}
