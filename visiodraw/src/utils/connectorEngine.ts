/**
 * 连接线绘制引擎
 * @version 1.4.0
 * @date 2026-02-07
 */

import type { Connector, ConnectorStyle } from '../types/connection';
import type { Shape } from '../stores/canvasStore';
import { calculateConnectionPointPosition, getConnectionPointDirection } from './connectionPoints';

/**
 * 路径点
 */
export interface PathPoint {
  x: number;
  y: number;
}

/**
 * 计算连接线路径
 * @param connector 连接线对象
 * @param shapes 图形数组
 * @returns 路径点数组
 */
export function calculateConnectorPath(
  connector: Connector,
  shapes: Shape[]
): PathPoint[] {
  const sourceShape = shapes.find((s) => s.id === connector.sourceShapeId);
  const targetShape = shapes.find((s) => s.id === connector.targetShapeId);

  if (!sourceShape || !targetShape) {
    return [];
  }

  const sourcePoint = sourceShape.connectionPoints?.find(
    (p) => p.id === connector.sourcePointId
  );
  const targetPoint = targetShape.connectionPoints?.find(
    (p) => p.id === connector.targetPointId
  );

  if (!sourcePoint || !targetPoint) {
    return [];
  }

  const start = calculateConnectionPointPosition(sourceShape, sourcePoint);
  const end = calculateConnectionPointPosition(targetShape, targetPoint);

  switch (connector.style) {
    case 'straight':
      return calculateStraightPath(start, end);
    case 'orthogonal':
      return calculateOrthogonalPath(start, end, sourcePoint.position, targetPoint.position);
    case 'curved':
      return calculateCurvedPath(start, end, sourcePoint.position, targetPoint.position);
    default:
      return calculateStraightPath(start, end);
  }
}

/**
 * 计算直线路径
 * @param start 起点
 * @param end 终点
 * @returns 路径点数组
 */
function calculateStraightPath(start: PathPoint, end: PathPoint): PathPoint[] {
  return [start, end];
}

/**
 * 计算正交路径（曼哈顿路由）
 * @param start 起点
 * @param end 终点
 * @param startPosition 起点位置类型
 * @param endPosition 终点位置类型
 * @returns 路径点数组
 */
function calculateOrthogonalPath(
  start: PathPoint,
  end: PathPoint,
  startPosition: string,
  _endPosition: string
): PathPoint[] {
  const points: PathPoint[] = [start];

  // 获取方向向量
  const startDir = getConnectionPointDirection(startPosition as 'top' | 'bottom' | 'left' | 'right' | 'custom');

  // 计算中间点
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // 根据起点和终点的相对位置决定路径
  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平距离大于垂直距离，优先水平路由
    const midX = start.x + dx / 2;
    
    if (startDir.y !== 0) {
      // 起点是上下方向，先垂直后水平
      points.push({ x: start.x, y: start.y + dy / 2 });
      points.push({ x: end.x, y: start.y + dy / 2 });
    } else {
      // 起点是左右方向，先水平后垂直
      points.push({ x: midX, y: start.y });
      points.push({ x: midX, y: end.y });
    }
  } else {
    // 垂直距离大于等于水平距离，优先垂直路由
    const midY = start.y + dy / 2;
    
    if (startDir.x !== 0) {
      // 起点是左右方向，先水平后垂直
      points.push({ x: start.x + dx / 2, y: start.y });
      points.push({ x: start.x + dx / 2, y: end.y });
    } else {
      // 起点是上下方向，先垂直后水平
      points.push({ x: start.x, y: midY });
      points.push({ x: end.x, y: midY });
    }
  }

  points.push(end);
  return simplifyPath(points);
}

/**
 * 计算曲线路径（贝塞尔曲线）
 * @param start 起点
 * @param end 终点
 * @param startPosition 起点位置类型
 * @param endPosition 终点位置类型
 * @returns 路径点数组（包含控制点）
 */
function calculateCurvedPath(
  start: PathPoint,
  end: PathPoint,
  startPosition: string,
  endPosition: string
): PathPoint[] {
  // 获取方向向量
  const startDir = getConnectionPointDirection(startPosition as 'top' | 'bottom' | 'left' | 'right' | 'custom');
  const endDir = getConnectionPointDirection(endPosition as 'top' | 'bottom' | 'left' | 'right' | 'custom');

  // 计算控制点距离
  const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const controlDistance = distance * 0.5;

  // 计算控制点
  const controlPoint1: PathPoint = {
    x: start.x + startDir.x * controlDistance,
    y: start.y + startDir.y * controlDistance,
  };

  const controlPoint2: PathPoint = {
    x: end.x + endDir.x * controlDistance,
    y: end.y + endDir.y * controlDistance,
  };

  // 生成曲线路径点
  const points: PathPoint[] = [start];
  
  // 使用贝塞尔曲线公式生成点
  const steps = 20;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const point = calculateCubicBezierPoint(t, start, controlPoint1, controlPoint2, end);
    points.push(point);
  }

  points.push(end);
  return points;
}

/**
 * 计算三次贝塞尔曲线上的点
 * @param t 参数（0-1）
  * @param p0 起点
 * @param p1 控制点1
 * @param p2 控制点2
 * @param p3 终点
 * @returns 曲线上的点
 */
function calculateCubicBezierPoint(
  t: number,
  p0: PathPoint,
  p1: PathPoint,
  p2: PathPoint,
  p3: PathPoint
): PathPoint {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

/**
 * 简化路径（移除共线点）
 * @param points 路径点数组
 * @returns 简化后的路径点数组
 */
function simplifyPath(points: PathPoint[]): PathPoint[] {
  if (points.length <= 2) {
    return points;
  }

  const simplified: PathPoint[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // 检查是否共线
    if (!isCollinear(prev, curr, next)) {
      simplified.push(curr);
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
}

/**
 * 检查三点是否共线
 * @param p1 点1
 * @param p2 点2
 * @param p3 点3
 * @returns 是否共线
 */
function isCollinear(p1: PathPoint, p2: PathPoint, p3: PathPoint): boolean {
  const area = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  return Math.abs(area) < 0.001;
}

/**
 * 生成SVG路径字符串
 * @param points 路径点数组
 * @param style 连接线样式
 * @returns SVG路径字符串
 */
export function generateSvgPath(points: PathPoint[], style: ConnectorStyle): string {
  if (points.length === 0) {
    return '';
  }

  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  if (style === 'curved' && points.length > 2) {
    // 使用平滑曲线连接
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  }

  // 正交线或直线
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  return path;
}

/**
 * 生成箭头路径
 * @param point 箭头位置
 * @param direction 方向角度（弧度）
 * @param size 箭头大小
 * @returns 箭头路径字符串
 */
export function generateArrowPath(point: PathPoint, direction: number, size: number = 10): string {
  const angle1 = direction + Math.PI / 6;
  const angle2 = direction - Math.PI / 6;

  const x1 = point.x - size * Math.cos(angle1);
  const y1 = point.y - size * Math.sin(angle1);
  const x2 = point.x - size * Math.cos(angle2);
  const y2 = point.y - size * Math.sin(angle2);

  return `M ${point.x} ${point.y} L ${x1} ${y1} M ${point.x} ${point.y} L ${x2} ${y2}`;
}

/**
 * 生成闭合箭头路径（填充式）
 * @param point 箭头位置
 * @param direction 方向角度（弧度）
 * @param size 箭头大小
 * @returns 闭合箭头路径字符串
 */
export function generateClosedArrowPath(point: PathPoint, direction: number, size: number = 10): string {
  const angle1 = direction + Math.PI / 6;
  const angle2 = direction - Math.PI / 6;

  const x1 = point.x - size * Math.cos(angle1);
  const y1 = point.y - size * Math.sin(angle1);
  const x2 = point.x - size * Math.cos(angle2);
  const y2 = point.y - size * Math.sin(angle2);

  return `M ${point.x} ${point.y} L ${x1} ${y1} L ${x2} ${y2} Z`;
}

/**
 * 生成圆点路径
 * @param point 圆点位置
 * @param radius 圆点半径
 * @returns 圆点路径字符串
 */
export function generateDotPath(point: PathPoint, radius: number = 5): string {
  return `M ${point.x + radius} ${point.y} A ${radius} ${radius} 0 1 0 ${point.x - radius} ${point.y} A ${radius} ${radius} 0 1 0 ${point.x + radius} ${point.y}`;
}

/**
 * 生成菱形路径
 * @param point 菱形位置
 * @param size 菱形大小
 * @returns 菱形路径字符串
 */
export function generateDiamondPath(point: PathPoint, size: number = 8): string {
  return `M ${point.x} ${point.y - size} L ${point.x + size} ${point.y} L ${point.x} ${point.y + size} L ${point.x - size} ${point.y} Z`;
}

/**
 * 计算路径方向角度
 * @param from 起点
 * @param to 终点
 * @returns 方向角度（弧度）
 */
export function calculateDirection(from: PathPoint, to: PathPoint): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * 获取连接线与图形的交点
 * @param connector 连接线
 * @param shape 图形
 * @param isSource 是否是源图形
 * @returns 交点坐标
 */
export function getConnectorIntersection(
  connector: Connector,
  shape: Shape,
  isSource: boolean
): PathPoint | null {
  const pointId = isSource ? connector.sourcePointId : connector.targetPointId;
  const connectionPoint = shape.connectionPoints?.find((p) => p.id === pointId);

  if (!connectionPoint) {
    return null;
  }

  return calculateConnectionPointPosition(shape, connectionPoint);
}

/**
 * 检查连接线是否与图形关联
 * @param connector 连接线
 * @param shapeId 图形ID
 * @returns 是否关联
 */
export function isConnectorRelatedToShape(connector: Connector, shapeId: string): boolean {
  return connector.sourceShapeId === shapeId || connector.targetShapeId === shapeId;
}

/**
 * 查找与图形关联的所有连接线
 * @param connectors 连接线数组
 * @param shapeId 图形ID
 * @returns 关联的连接线数组
 */
export function findConnectorsByShape(connectors: Connector[], shapeId: string): Connector[] {
  return connectors.filter((c) => isConnectorRelatedToShape(c, shapeId));
}

/**
 * 计算连接线标签位置
 * @param points 路径点数组
 * @returns 标签位置
 */
export function calculateLabelPosition(points: PathPoint[]): PathPoint {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  if (points.length === 1) {
    return points[0];
  }

  // 计算路径中点
  const totalLength = calculatePathLength(points);
  const halfLength = totalLength / 2;

  let currentLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const segmentLength = Math.sqrt(
      Math.pow(points[i + 1].x - points[i].x, 2) + Math.pow(points[i + 1].y - points[i].y, 2)
    );

    if (currentLength + segmentLength >= halfLength) {
      const ratio = (halfLength - currentLength) / segmentLength;
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * ratio,
        y: points[i].y + (points[i + 1].y - points[i].y) * ratio,
      };
    }

    currentLength += segmentLength;
  }

  return points[Math.floor(points.length / 2)];
}

/**
 * 计算路径长度
 * @param points 路径点数组
 * @returns 路径长度
 */
function calculatePathLength(points: PathPoint[]): number {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    length += Math.sqrt(
      Math.pow(points[i + 1].x - points[i].x, 2) + Math.pow(points[i + 1].y - points[i].y, 2)
    );
  }
  return length;
}

/**
 * 创建默认连接线
 * @param sourceShapeId 源图形ID
 * @param sourcePointId 源连接点ID
 * @param targetShapeId 目标图形ID
 * @param targetPointId 目标连接点ID
 * @returns 连接线对象
 */
export function createDefaultConnector(
  sourceShapeId: string,
  sourcePointId: string,
  targetShapeId: string,
  targetPointId: string
): Connector {
  return {
    id: `connector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sourceShapeId,
    sourcePointId,
    targetShapeId,
    targetPointId,
    style: 'straight',
    startStyle: 'none',
    endStyle: 'arrow',
    stroke: '#333333',
    strokeWidth: 2,
  };
}

/**
 * 更新连接线端点
 * @param connector 连接线
 * @param sourceShapeId 新源图形ID
 * @param sourcePointId 新源连接点ID
 * @param targetShapeId 新目标图形ID
 * @param targetPointId 新目标连接点ID
 * @returns 更新后的连接线
 */
export function updateConnectorEndpoints(
  connector: Connector,
  sourceShapeId?: string,
  sourcePointId?: string,
  targetShapeId?: string,
  targetPointId?: string
): Connector {
  return {
    ...connector,
    sourceShapeId: sourceShapeId ?? connector.sourceShapeId,
    sourcePointId: sourcePointId ?? connector.sourcePointId,
    targetShapeId: targetShapeId ?? connector.targetShapeId,
    targetPointId: targetPointId ?? connector.targetPointId,
  };
}
