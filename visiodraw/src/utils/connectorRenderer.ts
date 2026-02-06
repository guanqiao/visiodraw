/**
 * 连接线渲染工具函数
 * @version 1.5.0
 * @date 2026-02-07
 */

import type { Connector, ConnectorStyle, ConnectorEndStyle } from '../types/connection'
import type { Shape } from '../stores/canvasStore'
import { calculateConnectionPointPosition, getRelativePosition } from './connectionPoints'

/**
 * 计算连接点绝对坐标
 * @param shape 图形对象
 * @param pointId 连接点ID或位置名称
 * @returns 绝对坐标
 */
export function getConnectorEndpoint(
  shape: Shape,
  pointId: string
): { x: number; y: number } | null {
  if (!shape.connectionPoints) {
    // 如果没有连接点，使用默认位置
    const relativePos = getRelativePosition(pointId as 'top' | 'bottom' | 'left' | 'right')
    return {
      x: shape.x + shape.width * relativePos.x,
      y: shape.y + shape.height * relativePos.y,
    }
  }

  const point = shape.connectionPoints.find((p) => p.id === pointId || p.position === pointId)
  if (!point) {
    // 如果找不到连接点，使用图形中心
    return {
      x: shape.x + shape.width / 2,
      y: shape.y + shape.height / 2,
    }
  }

  return calculateConnectionPointPosition(shape, point)
}

/**
 * 计算直线路径
 * @param start 起点坐标
 * @param end 终点坐标
 * @returns 路径点数组
 */
export function calculateStraightPath(
  start: { x: number; y: number },
  end: { x: number; y: number }
): { x: number; y: number }[] {
  return [start, end]
}

/**
 * 计算正交线路径（直角线）
 * @param start 起点坐标
 * @param end 终点坐标
 * @param startDirection 起点方向
 * @param endDirection 终点方向
 * @returns 路径点数组
 */
export function calculateOrthogonalPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  startDirection: { x: number; y: number } = { x: 0, y: 1 },
  endDirection: { x: number; y: number } = { x: 0, y: -1 }
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [start]

  // 计算中间点
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  // 根据方向决定路径
  if (startDirection.x !== 0) {
    // 水平出发
    points.push({ x: midX, y: start.y })
    if (endDirection.x !== 0) {
      // 水平结束
      points.push({ x: midX, y: end.y })
    } else {
      // 垂直结束
      points.push({ x: end.x, y: start.y })
    }
  } else {
    // 垂直出发
    points.push({ x: start.x, y: midY })
    if (endDirection.x !== 0) {
      // 水平结束
      points.push({ x: start.x, y: end.y })
    } else {
      // 垂直结束
      points.push({ x: end.x, y: midY })
    }
  }

  points.push(end)
  return points
}

/**
 * 计算曲线路径（贝塞尔曲线）
 * @param start 起点坐标
 * @param end 终点坐标
 * @param startDirection 起点方向
 * @param endDirection 终点方向
 * @returns 路径点数组（包含控制点）
 */
export function calculateCurvedPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  startDirection: { x: number; y: number } = { x: 0, y: 1 },
  endDirection: { x: number; y: number } = { x: 0, y: -1 }
): { x: number; y: number }[] {
  const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
  const controlDistance = distance * 0.5

  const controlPoint1 = {
    x: start.x + startDirection.x * controlDistance,
    y: start.y + startDirection.y * controlDistance,
  }

  const controlPoint2 = {
    x: end.x + endDirection.x * controlDistance,
    y: end.y + endDirection.y * controlDistance,
  }

  return [start, controlPoint1, controlPoint2, end]
}

/**
 * 将路径点转换为SVG路径字符串
 * @param points 路径点数组
 * @param style 线型
 * @returns SVG路径字符串
 */
export function pointsToPath(
  points: { x: number; y: number }[],
  style: ConnectorStyle
): string {
  if (points.length < 2) return ''

  let path = `M ${points[0].x} ${points[0].y}`

  if (style === 'curved' && points.length === 4) {
    // 贝塞尔曲线
    path += ` C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y}`
  } else {
    // 直线或正交线
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }
  }

  return path
}

/**
 * 创建箭头端点路径
 * @param x 箭头尖端X坐标
 * @param y 箭头尖端Y坐标
 * @param angle 箭头方向角度（弧度）
 * @param size 箭头大小
 * @returns SVG路径字符串
 */
export function createArrowPath(
  x: number,
  y: number,
  angle: number,
  size: number = 10
): string {
  const arrowAngle = Math.PI / 6 // 30度
  const x1 = x - size * Math.cos(angle - arrowAngle)
  const y1 = y - size * Math.sin(angle - arrowAngle)
  const x2 = x - size * Math.cos(angle + arrowAngle)
  const y2 = y - size * Math.sin(angle + arrowAngle)

  return `M ${x} ${y} L ${x1} ${y1} M ${x} ${y} L ${x2} ${y2}`
}

/**
 * 创建圆点端点
 * @param x 圆心X坐标
 * @param y 圆心Y坐标
 * @param radius 圆点半径
 * @returns SVG路径字符串
 */
export function createDotPath(x: number, y: number, radius: number = 4): string {
  return `M ${x + radius} ${y} A ${radius} ${radius} 0 1 0 ${x - radius} ${y} A ${radius} ${radius} 0 1 0 ${x + radius} ${y}`
}

/**
 * 创建菱形端点路径
 * @param x 菱形尖端X坐标
 * @param y 菱形尖端Y坐标
 * @param angle 菱形方向角度（弧度）
 * @param size 菱形大小
 * @returns SVG路径字符串
 */
export function createDiamondPath(
  x: number,
  y: number,
  angle: number,
  size: number = 8
): string {
  const x1 = x - size * Math.cos(angle)
  const y1 = y - size * Math.sin(angle)
  const x2 = x1 - size * Math.cos(angle + Math.PI / 2)
  const y2 = y1 - size * Math.sin(angle + Math.PI / 2)
  const x3 = x1 - size * Math.cos(angle + Math.PI)
  const y3 = y1 - size * Math.sin(angle + Math.PI)
  const x4 = x1 - size * Math.cos(angle - Math.PI / 2)
  const y4 = y1 - size * Math.sin(angle - Math.PI / 2)

  return `M ${x} ${y} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`
}

/**
 * 计算线段角度
 * @param start 起点
 * @param end 终点
 * @returns 角度（弧度）
 */
export function calculateLineAngle(
  start: { x: number; y: number },
  end: { x: number; y: number }
): number {
  return Math.atan2(end.y - start.y, end.x - start.x)
}

/**
 * 获取连接点方向
 * @param pointId 连接点ID或位置
 * @returns 方向向量
 */
export function getPointDirection(
  pointId: string
): { x: number; y: number } {
  switch (pointId) {
    case 'top':
      return { x: 0, y: -1 }
    case 'bottom':
      return { x: 0, y: 1 }
    case 'left':
      return { x: -1, y: 0 }
    case 'right':
      return { x: 1, y: 0 }
    default:
      return { x: 0, y: 0 }
  }
}

/**
 * 创建连接线对象
 * @param connector 连接线数据
 * @param shapes 图形数组
 * @returns Fabric.js路径对象和端点对象数组
 */
export function createConnectorObjects(
  connector: Connector,
  shapes: Shape[]
): { path: fabric.Path | fabric.Line | null; endPoints: fabric.Object[] } {
  const sourceShape = shapes.find((s) => s.id === connector.sourceShapeId)
  const targetShape = shapes.find((s) => s.id === connector.targetShapeId)

  if (!sourceShape || !targetShape) {
    return { path: null, endPoints: [] }
  }

  const start = getConnectorEndpoint(sourceShape, connector.sourcePointId)
  const end = getConnectorEndpoint(targetShape, connector.targetPointId)

  if (!start || !end) {
    return { path: null, endPoints: [] }
  }

  // 计算路径
  let points: { x: number; y: number }[]
  const startDirection = getPointDirection(connector.sourcePointId)
  const endDirection = getPointDirection(connector.targetPointId)

  switch (connector.style) {
    case 'orthogonal':
      points = calculateOrthogonalPath(start, end, startDirection, endDirection)
      break
    case 'curved':
      points = calculateCurvedPath(start, end, startDirection, endDirection)
      break
    case 'straight':
    default:
      points = calculateStraightPath(start, end)
      break
  }

  // 创建路径对象
  let path: fabric.Path | fabric.Line
  const isSelected = connector.isSelected || false

  if (connector.style === 'straight' && points.length === 2) {
    // 直线使用Line对象
    path = new fabric.Line([points[0].x, points[0].y, points[1].x, points[1].y], {
      stroke: isSelected ? '#1890ff' : connector.stroke,
      strokeWidth: isSelected ? connector.strokeWidth + 1 : connector.strokeWidth,
      selectable: true,
      evented: true,
      hoverCursor: 'pointer',
    })
  } else {
    // 正交线和曲线使用Path对象
    const pathString = pointsToPath(points, connector.style)
    path = new fabric.Path(pathString, {
      fill: '',
      stroke: isSelected ? '#1890ff' : connector.stroke,
      strokeWidth: isSelected ? connector.strokeWidth + 1 : connector.strokeWidth,
      selectable: true,
      evented: true,
      hoverCursor: 'pointer',
    })
  }

  // 设置连接线ID和类型
  ;(path as unknown as { id: string }).id = connector.id
  ;(path as unknown as { type: string }).type = 'connector'

  // 创建端点
  const endPoints: fabric.Object[] = []

  // 起点样式
  if (connector.startStyle !== 'none') {
    const startAngle = calculateLineAngle(points[1], points[0])
    const startEndPoint = createEndPoint(
      points[0].x,
      points[0].y,
      startAngle,
      connector.startStyle,
      connector.stroke,
      connector.strokeWidth
    )
    if (startEndPoint) {
      endPoints.push(startEndPoint)
    }
  }

  // 终点样式
  if (connector.endStyle !== 'none') {
    const endAngle = calculateLineAngle(points[points.length - 2], points[points.length - 1])
    const endEndPoint = createEndPoint(
      points[points.length - 1].x,
      points[points.length - 1].y,
      endAngle,
      connector.endStyle,
      connector.stroke,
      connector.strokeWidth
    )
    if (endEndPoint) {
      endPoints.push(endEndPoint)
    }
  }

  return { path, endPoints }
}

/**
 * 创建端点对象
 * @param x X坐标
 * @param y Y坐标
 * @param angle 方向角度
 * @param style 端点样式
 * @param stroke 颜色
 * @param strokeWidth 线宽
 * @returns Fabric.js对象
 */
function createEndPoint(
  x: number,
  y: number,
  angle: number,
  style: ConnectorEndStyle,
  stroke: string,
  strokeWidth: number
): fabric.Object | null {
  switch (style) {
    case 'arrow': {
      const arrowPath = createArrowPath(x, y, angle, 10)
      return new fabric.Path(arrowPath, {
        stroke,
        strokeWidth: strokeWidth + 1,
        fill: '',
        selectable: false,
        evented: false,
      })
    }
    case 'dot': {
      const dotPath = createDotPath(x, y, 4)
      return new fabric.Path(dotPath, {
        stroke,
        fill: stroke,
        selectable: false,
        evented: false,
      })
    }
    case 'diamond': {
      const diamondPath = createDiamondPath(x, y, angle, 8)
      return new fabric.Path(diamondPath, {
        stroke,
        fill: '#ffffff',
        strokeWidth: strokeWidth,
        selectable: false,
        evented: false,
      })
    }
    case 'none':
    default:
      return null
  }
}

/**
 * 更新连接线位置
 * @param connector 连接线数据
 * @param shapes 图形数组
 * @param existingPath 现有的路径对象
 * @param existingEndPoints 现有的端点对象数组
 * @returns 更新后的对象
 */
export function updateConnectorPosition(
  connector: Connector,
  shapes: Shape[],
  existingPath: fabric.Path | fabric.Line,
  existingEndPoints: fabric.Object[]
): { path: fabric.Path | fabric.Line; endPoints: fabric.Object[] } {
  // 重新创建连接线对象
  const { path: newPath, endPoints: newEndPoints } = createConnectorObjects(connector, shapes)

  if (!newPath) {
    return { path: existingPath, endPoints: existingEndPoints }
  }

  // 复制新路径的属性到现有路径
  if (existingPath instanceof fabric.Line && newPath instanceof fabric.Line) {
    existingPath.set({
      x1: (newPath as unknown as { x1: number }).x1,
      y1: (newPath as unknown as { y1: number }).y1,
      x2: (newPath as unknown as { x2: number }).x2,
      y2: (newPath as unknown as { y2: number }).y2,
    })
  } else if (existingPath instanceof fabric.Path && newPath instanceof fabric.Path) {
    existingPath.set({
      path: (newPath as unknown as { path: unknown[] }).path,
    })
  }

  return { path: existingPath, endPoints: newEndPoints }
}
