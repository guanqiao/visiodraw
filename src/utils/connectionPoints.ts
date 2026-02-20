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
    case 'center':
      return { x: 0.5, y: 0.5 }
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
      isDynamic: false,
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
    isDynamic: false,
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
          isDynamic: true,
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
    isDynamic: true,
  }
}

export function isPointInsideShape(shape: any, x: number, y: number): boolean {
  return x >= shape.x &&
    x <= shape.x + shape.width &&
    y >= shape.y &&
    y <= shape.y + shape.height
}

export function getPortIdFromPosition(position: ConnectionPointPosition): string {
  return position
}

export function getPositionFromPortId(portId: string): ConnectionPointPosition {
  if (['top', 'bottom', 'left', 'right', 'center'].includes(portId)) {
    return portId as ConnectionPointPosition
  }
  return 'custom'
}

export function updateConnectionPointConnectionStatus(
  connectionPoint: ConnectionPoint,
  lineId: string,
  isConnected: boolean
): ConnectionPoint {
  const newConnectedLineIds = isConnected
    ? [...connectionPoint.connectedLineIds, lineId]
    : connectionPoint.connectedLineIds.filter(id => id !== lineId)

  return {
    ...connectionPoint,
    isConnected: newConnectedLineIds.length > 0,
    connectedLineIds: newConnectedLineIds,
  }
}

export function getConnectionPointsForX6Ports(shapeType: string): { id: string; group: string }[] {
  const positions = defaultConnectionPointsConfig[shapeType] || ['top', 'bottom', 'left', 'right']
  return positions.map(pos => ({
    id: pos,
    group: pos,
  }))
}

export function getX6PortGroups() {
  return {
    top: {
      position: 'top',
      attrs: {
        circle: {
          r: 6,
          magnet: true,
          stroke: '#1890ff',
          strokeWidth: 2,
          fill: '#fff',
          opacity: 0.3,
        },
      },
    },
    bottom: {
      position: 'bottom',
      attrs: {
        circle: {
          r: 6,
          magnet: true,
          stroke: '#1890ff',
          strokeWidth: 2,
          fill: '#fff',
          opacity: 0.3,
        },
      },
    },
    left: {
      position: 'left',
      attrs: {
        circle: {
          r: 6,
          magnet: true,
          stroke: '#1890ff',
          strokeWidth: 2,
          fill: '#fff',
          opacity: 0.3,
        },
      },
    },
    right: {
      position: 'right',
      attrs: {
        circle: {
          r: 6,
          magnet: true,
          stroke: '#1890ff',
          strokeWidth: 2,
          fill: '#fff',
          opacity: 0.3,
        },
      },
    },
    custom: {
      position: {
        name: 'absolute',
        args: { x: 0.5, y: 0 },
      },
      attrs: {
        circle: {
          r: 5,
          magnet: true,
          stroke: '#1890ff',
          strokeWidth: 1.5,
          fill: '#ffffff',
          opacity: 1,
          cursor: 'crosshair',
        },
      },
    },
    'custom-outward': {
      position: {
        name: 'absolute',
        args: { x: 0.5, y: 0 },
      },
      attrs: {
        circle: {
          r: 5,
          magnet: true,
          stroke: '#fa8c16',
          strokeWidth: 1.5,
          fill: '#ffffff',
          opacity: 1,
          cursor: 'crosshair',
        },
      },
    },
    'custom-bidirectional': {
      position: {
        name: 'absolute',
        args: { x: 0.5, y: 0 },
      },
      attrs: {
        circle: {
          r: 5,
          magnet: true,
          stroke: '#52c41a',
          strokeWidth: 1.5,
          fill: '#ffffff',
          opacity: 1,
          cursor: 'crosshair',
        },
      },
    },
  }
}

/**
 * 批量显示/隐藏连接点
 * 使用批量更新 API 提升性能
 */
export function showPorts(node: any, visible: boolean) {
  // 使用批量更新减少渲染次数
  const ports = node.getPorts()
  if (ports.length === 0) return

  // 使用 X6 的 attr 方法批量更新
  const opacity = visible ? 1 : 0.3
  node.attr({
    ports: {
      groups: {
        top: { attrs: { circle: { opacity } } },
        bottom: { attrs: { circle: { opacity } } },
        left: { attrs: { circle: { opacity } } },
        right: { attrs: { circle: { opacity } } },
      },
    },
  })
}

/**
 * 延迟显示连接点 - 用于优化鼠标悬停性能
 */
let pendingPortVisibility: Map<string, { node: any; visible: boolean }> = new Map()
let portVisibilityTimer: ReturnType<typeof setTimeout> | null = null

export function showPortsDebounced(node: any, visible: boolean, delay: number = 50) {
  pendingPortVisibility.set(node.id, { node, visible })

  if (portVisibilityTimer) {
    clearTimeout(portVisibilityTimer)
  }

  portVisibilityTimer = setTimeout(() => {
    // 批量处理所有待处理的连接点显示/隐藏
    pendingPortVisibility.forEach(({ node, visible }) => {
      showPorts(node, visible)
    })
    pendingPortVisibility.clear()
    portVisibilityTimer = null
  }, delay)
}

/**
 * 清除待处理的连接点显示/隐藏
 */
export function clearPendingPortVisibility() {
  if (portVisibilityTimer) {
    clearTimeout(portVisibilityTimer)
    portVisibilityTimer = null
  }
  pendingPortVisibility.clear()
}

/**
 * 检查点是否在节点边缘附近
 */
export function isNearNodeEdge(
  node: any,
  clientX: number,
  clientY: number,
  threshold: number = 15
): boolean {
  const position = node.getPosition()
  const size = node.getSize()
  
  const x = position.x
  const y = position.y
  const width = size.width
  const height = size.height

  const inBounds = clientX >= x - threshold &&
    clientX <= x + width + threshold &&
    clientY >= y - threshold &&
    clientY <= y + height + threshold

  if (!inBounds) return false

  const nearEdge = clientX <= x + threshold ||
    clientX >= x + width - threshold ||
    clientY <= y + threshold ||
    clientY >= y + height - threshold

  return nearEdge
}

/**
 * 计算鼠标位置对应的图形边缘坐标（相对于节点）
 */
export function getEdgePointFromMouse(
  node: any,
  clientX: number,
  clientY: number
): { x: number; y: number; edge: 'top' | 'bottom' | 'left' | 'right' } | null {
  const position = node.getPosition()
  const size = node.getSize()
  
  const nodeX = position.x
  const nodeY = position.y
  const width = size.width
  const height = size.height

  const distances = [
    { edge: 'top' as const, distance: Math.abs(clientY - nodeY), x: clientX, y: nodeY },
    { edge: 'bottom' as const, distance: Math.abs(clientY - (nodeY + height)), x: clientX, y: nodeY + height },
    { edge: 'left' as const, distance: Math.abs(clientX - nodeX), x: nodeX, y: clientY },
    { edge: 'right' as const, distance: Math.abs(clientX - (nodeX + width)), x: nodeX + width, y: clientY },
  ]

  const nearest = distances.reduce((min, current) => 
    current.distance < min.distance ? current : min
  )

  let finalX = nearest.x
  let finalY = nearest.y

  if (nearest.edge === 'top' || nearest.edge === 'bottom') {
    finalX = Math.max(nodeX, Math.min(nodeX + width, clientX))
  } else {
    finalY = Math.max(nodeY, Math.min(nodeY + height, clientY))
  }

  const relativeX = (finalX - nodeX) / width
  const relativeY = (finalY - nodeY) / height

  return {
    x: relativeX,
    y: relativeY,
    edge: nearest.edge,
  }
}

/**
 * 计算连接点的方向向量
 */
export function calculateDirectionVector(
  relativeX: number,
  relativeY: number
): { dirX: number; dirY: number } {
  const edgeThreshold = 0.15
  
  if (relativeY <= edgeThreshold) {
    return { dirX: 0, dirY: -1 }
  }
  if (relativeY >= 1 - edgeThreshold) {
    return { dirX: 0, dirY: 1 }
  }
  if (relativeX <= edgeThreshold) {
    return { dirX: -1, dirY: 0 }
  }
  if (relativeX >= 1 - edgeThreshold) {
    return { dirX: 1, dirY: 0 }
  }
  
  return { dirX: 0, dirY: 0 }
}

/**
 * 将点吸附到图形边缘
 * 根据鼠标位置计算最近的边缘位置
 */
export function snapToEdge(
  relativeX: number,
  relativeY: number,
  threshold: number = 0.15
): { x: number; y: number; edge: 'top' | 'bottom' | 'left' | 'right' | 'none' } {
  // 计算到各边缘的距离
  const distances = [
    { edge: 'top' as const, distance: relativeY },
    { edge: 'bottom' as const, distance: 1 - relativeY },
    { edge: 'left' as const, distance: relativeX },
    { edge: 'right' as const, distance: 1 - relativeX },
  ]

  // 找到最近的边缘
  const nearest = distances.reduce((min, current) =>
    current.distance < min.distance ? current : min
  )

  // 如果距离在阈值内，吸附到边缘
  if (nearest.distance <= threshold) {
    switch (nearest.edge) {
      case 'top':
        return { x: relativeX, y: 0, edge: 'top' }
      case 'bottom':
        return { x: relativeX, y: 1, edge: 'bottom' }
      case 'left':
        return { x: 0, y: relativeY, edge: 'left' }
      case 'right':
        return { x: 1, y: relativeY, edge: 'right' }
    }
  }

  // 不在阈值内，保持原位置
  return { x: relativeX, y: relativeY, edge: 'none' }
}

/**
 * 动态添加自定义 Port 到节点
 * 使用绝对位置配置，确保连接点显示为小圆点
 * 支持智能边缘吸附
 */
export function addCustomPort(
  node: any,
  relativeX: number,
  relativeY: number,
  options?: {
    snapToEdge?: boolean
    edgeThreshold?: number
    type?: 'inward' | 'outward' | 'inward-outward'
  }
): { id: string; x: number; y: number; dirX: number; dirY: number; edge: string } {
  const portId = `custom-${uuidv4()}`
  const size = node.getSize()

  // 智能边缘吸附
  let finalX = relativeX
  let finalY = relativeY
  let edge: 'top' | 'bottom' | 'left' | 'right' | 'none' = 'none'

  if (options?.snapToEdge !== false) {
    const snapped = snapToEdge(relativeX, relativeY, options?.edgeThreshold)
    finalX = snapped.x
    finalY = snapped.y
    edge = snapped.edge
  }

  const absoluteX = finalX * size.width
  const absoluteY = finalY * size.height

  const { dirX, dirY } = calculateDirectionVector(finalX, finalY)

  // 根据类型选择颜色
  const type = options?.type || 'inward'
  const strokeColor = type === 'outward' ? '#fa8c16' : type === 'inward-outward' ? '#52c41a' : '#1890ff'

  // 使用绝对位置配置，确保连接点精确定位并显示为小圆点
  node.addPort({
    id: portId,
    group: 'custom',
    args: {
      x: absoluteX,
      y: absoluteY,
    },
    attrs: {
      circle: {
        r: 5,
        magnet: true,
        stroke: strokeColor,
        strokeWidth: 1.5,
        fill: '#ffffff',
        opacity: 1,
        cursor: 'crosshair',
      },
    },
  })

  return {
    id: portId,
    x: finalX,
    y: finalY,
    dirX,
    dirY,
    edge,
  }
}

/**
 * 获取自定义连接点数量
 */
export function getCustomPortCount(node: any): number {
  const ports = node.getPorts()
  return ports.filter((p: any) => p.id?.startsWith('custom-')).length
}

/**
 * 检查是否已达到最大连接点数量限制
 */
export function isMaxConnectionPointsReached(node: any, maxCount: number = 16): boolean {
  return getCustomPortCount(node) >= maxCount
}

/**
 * 检查新连接点位置是否与现有连接点重复
 * @param node 节点
 * @param relativeX 相对X坐标
 * @param relativeY 相对Y坐标
 * @param threshold 距离阈值（默认0.05，即5%）
 * @returns 重复的连接点ID，如果没有重复则返回null
 */
export function findDuplicateConnectionPoint(
  node: any,
  relativeX: number,
  relativeY: number,
  threshold: number = 0.05
): string | null {
  const ports = node.getPorts()
  const size = node.getSize()

  for (const port of ports) {
    if (!port.id?.startsWith('custom-')) continue

    const portArgs = (port as any).args
    if (!portArgs) continue

    // 计算现有连接点的相对坐标
    const existingRelativeX = (portArgs.x || 0) / size.width
    const existingRelativeY = (portArgs.y || 0) / size.height

    // 计算距离
    const distance = Math.sqrt(
      Math.pow(relativeX - existingRelativeX, 2) +
      Math.pow(relativeY - existingRelativeY, 2)
    )

    if (distance < threshold) {
      return port.id
    }
  }

  return null
}

/**
 * 检查新连接点位置是否有效（不重复且在限制内）
 */
export function isValidConnectionPointPosition(
  node: any,
  relativeX: number,
  relativeY: number,
  options?: {
    maxCount?: number
    duplicateThreshold?: number
  }
): { valid: boolean; reason?: 'duplicate' | 'max_reached' | 'invalid_position' } {
  // 检查坐标范围
  if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
    return { valid: false, reason: 'invalid_position' }
  }

  // 检查数量限制
  if (isMaxConnectionPointsReached(node, options?.maxCount || 16)) {
    return { valid: false, reason: 'max_reached' }
  }

  // 检查重复位置
  const duplicate = findDuplicateConnectionPoint(
    node,
    relativeX,
    relativeY,
    options?.duplicateThreshold
  )
  if (duplicate) {
    return { valid: false, reason: 'duplicate' }
  }

  return { valid: true }
}

/**
 * 删除自定义 Port
 */
export function removeCustomPort(node: any, portId: string): boolean {
  const port = node.getPort(portId)
  if (port && portId.startsWith('custom-')) {
    node.removePort(portId)
    return true
  }
  return false
}

/**
 * 批量删除所有自定义连接点
 */
export function removeAllCustomPorts(node: any): number {
  const ports = node.getPorts()
  const customPorts = ports.filter((p: any) => p.id?.startsWith('custom-'))
  let removedCount = 0

  customPorts.forEach((port: any) => {
    if (removeCustomPort(node, port.id)) {
      removedCount++
    }
  })

  return removedCount
}

/**
 * 检查点是否与现有连接点对齐
 * @returns 对齐信息，包括是否水平对齐、垂直对齐，以及对齐的坐标
 */
export function checkAlignment(
  node: any,
  relativeX: number,
  relativeY: number,
  threshold: number = 0.02
): {
  horizontal: boolean
  vertical: boolean
  alignX?: number
  alignY?: number
} {
  const ports = node.getPorts()
  let horizontal = false
  let vertical = false
  let alignX: number | undefined
  let alignY: number | undefined

  for (const port of ports) {
    if (!port.id?.startsWith('custom-')) continue

    const portArgs = (port as any).args
    if (!portArgs) continue

    const size = node.getSize()
    const portRelativeX = (portArgs.x || 0) / size.width
    const portRelativeY = (portArgs.y || 0) / size.height

    // 检查水平对齐（Y坐标相同）
    if (Math.abs(relativeY - portRelativeY) < threshold) {
      horizontal = true
      alignY = portRelativeY
    }

    // 检查垂直对齐（X坐标相同）
    if (Math.abs(relativeX - portRelativeX) < threshold) {
      vertical = true
      alignX = portRelativeX
    }
  }

  return { horizontal, vertical, alignX, alignY }
}

/**
 * 在边缘上均匀分布连接点
 * @param node 节点
 * @param edge 边缘位置
 * @param count 连接点数量
 * @returns 生成的连接点位置数组
 */
export function distributeConnectionPointsOnEdge(
  node: any,
  edge: 'top' | 'bottom' | 'left' | 'right',
  count: number
): Array<{ x: number; y: number }> {
  if (count < 2) return []

  const positions: Array<{ x: number; y: number }> = []
  const padding = 0.1 // 两端留白10%
  const availableSpace = 1 - 2 * padding
  const step = availableSpace / (count - 1)

  for (let i = 0; i < count; i++) {
    const pos = padding + i * step

    switch (edge) {
      case 'top':
        positions.push({ x: pos, y: 0 })
        break
      case 'bottom':
        positions.push({ x: pos, y: 1 })
        break
      case 'left':
        positions.push({ x: 0, y: pos })
        break
      case 'right':
        positions.push({ x: 1, y: pos })
        break
    }
  }

  return positions
}

/**
 * 创建自定义连接点数据
 */
export function createCustomConnectionPoint(
  relativeX: number,
  relativeY: number
): ConnectionPoint {
  const { dirX, dirY } = calculateDirectionVector(relativeX, relativeY)
  
  return {
    id: `custom-${uuidv4()}`,
    x: relativeX,
    y: relativeY,
    position: 'custom',
    isVisible: true,
    isConnected: false,
    connectedLineIds: [],
    isDynamic: false,
    isCustom: true,
    dirX,
    dirY,
    type: 'inward',
  }
}

/**
 * 更新自定义连接点位置
 */
export function updateCustomPortPosition(
  node: any,
  portId: string,
  newRelativeX: number,
  newRelativeY: number
): boolean {
  const port = node.getPort(portId)
  if (!port || !portId.startsWith('custom-')) return false
  
  const size = node.getSize()
  const absoluteX = newRelativeX * size.width
  const absoluteY = newRelativeY * size.height
  
  node.setPortProp(portId, 'args', { x: absoluteX, y: absoluteY })
  
  return true
}

/**
 * 更新 showPorts 函数以支持 custom 组
 */
export function showPortsWithCustom(node: any, visible: boolean) {
  const ports = node.getPorts()
  if (ports.length === 0) return

  const opacity = visible ? 1 : 0.3
  
  const groups: Record<string, { attrs: { circle: { opacity: number } } }> = {
    top: { attrs: { circle: { opacity } } },
    bottom: { attrs: { circle: { opacity } } },
    left: { attrs: { circle: { opacity } } },
    right: { attrs: { circle: { opacity } } },
  }

  const hasCustomPorts = ports.some((p: any) => p.id?.startsWith('custom-'))
  if (hasCustomPorts) {
    node.getPorts().forEach((p: any) => {
      if (p.id?.startsWith('custom-')) {
        node.setPortProp(p.id, 'attrs/circle/opacity', visible ? 1 : 0.5)
      }
    })
  }

  node.attr({
    ports: { groups },
  })
}
