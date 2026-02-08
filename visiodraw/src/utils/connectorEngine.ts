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
    case 'quadratic':
      return calculateQuadraticPath(start, end, sourcePoint.position, targetPoint.position);
    case 'freehand':
      return calculateFreehandPath(start, end, connector.pathPoints);
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
export function calculateStraightPath(start: PathPoint, end: PathPoint): PathPoint[] {
  return [start, end];
}

/**
 * 计算曲线路径（贝塞尔曲线）
 * @param start 起点
 * @param end 终点
 * @param startPosition 起点位置类型
 * @param endPosition 终点位置类型
 * @returns 路径点数组（包含控制点）
 */
export function calculateCurvedPath(
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
 * 障碍物接口
 */
export interface Obstacle {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 计算正交路径（曼哈顿路由）- 增强版
 * @param start 起点
 * @param end 终点
 * @param startPosition 起点位置类型
 * @param endPosition 终点位置类型
 * @param obstacles 障碍物数组（可选）
 * @returns 路径点数组
 */
export function calculateOrthogonalPath(
  start: PathPoint,
  end: PathPoint,
  startPosition: string,
  endPosition: string,
  obstacles?: Obstacle[]
): PathPoint[] {
  const points: PathPoint[] = [start];

  // 计算方向向量
  const startDir = getConnectionPointDirection(startPosition as 'top' | 'bottom' | 'left' | 'right' | 'custom');
  const endDir = getConnectionPointDirection(endPosition as 'top' | 'bottom' | 'left' | 'right' | 'custom');

  // 计算中间点
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // 处理障碍物
  if (obstacles && obstacles.length > 0) {
    return calculateOrthogonalPathWithObstacles(start, end, startDir, endDir, obstacles);
  }

  // 长距离自动分割
  const totalDistance = Math.abs(dx) + Math.abs(dy);
  if (totalDistance > 300) {
    return calculateLongDistanceOrthogonalPath(start, end, startDir, endDir);
  }

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
 * 计算带障碍物的正交路径
 */
function calculateOrthogonalPathWithObstacles(
  start: PathPoint,
  end: PathPoint,
  startDir: { x: number; y: number },
  endDir: { x: number; y: number },
  obstacles: Obstacle[]
): PathPoint[] {
  const points: PathPoint[] = [start];

  // 检查直线是否穿过障碍物
  const startToEndClear = !obstacles.some(obs => lineIntersectsObstacle(start, end, obs));

  if (startToEndClear) {
    points.push(end);
    return simplifyPath(points);
  }

  // 需要绕行 - 使用简单的避障策略
  const centerX = (start.x + end.x) / 2;
  const centerY = (start.y + end.y) / 2;

  // 根据起点和终点方向决定绕行优先级
  // 方向向量: x>0=右, x<0=左, y>0=下, y<0=上
  const priorityOrder: ('above' | 'below' | 'left' | 'right')[] = [];

  // 根据起点方向确定初始方向优先级
  if (startDir.y < 0) {
    priorityOrder.push('above', 'below', 'right', 'left'); // 从上方出发，优先往上绕
  } else if (startDir.y > 0) {
    priorityOrder.push('below', 'above', 'right', 'left'); // 从下方出发，优先往下绕
  } else if (startDir.x > 0) {
    priorityOrder.push('right', 'left', 'above', 'below'); // 从右侧出发，优先往右绕
  } else {
    priorityOrder.push('left', 'right', 'above', 'below'); // 从左侧出发，优先往左绕
  }

  // 根据终点方向调整优先级
  if (endDir.y < 0) {
    // 终点在上方，优先使用上方路径
    priorityOrder.splice(priorityOrder.indexOf('above'), 1);
    priorityOrder.unshift('above');
  } else if (endDir.y > 0) {
    priorityOrder.splice(priorityOrder.indexOf('below'), 1);
    priorityOrder.unshift('below');
  } else if (endDir.x > 0) {
    priorityOrder.splice(priorityOrder.indexOf('right'), 1);
    priorityOrder.unshift('right');
  } else if (endDir.x < 0) {
    priorityOrder.splice(priorityOrder.indexOf('left'), 1);
    priorityOrder.unshift('left');
  }

  // 定义各种绕行路径
  const pathStrategies = {
    above: [
      start,
      { x: start.x, y: Math.min(start.y, centerY) - 50 },
      { x: end.x, y: Math.min(start.y, centerY) - 50 },
      { x: end.x, y: end.y }
    ],
    below: [
      start,
      { x: start.x, y: Math.max(start.y, centerY) + 50 },
      { x: end.x, y: Math.max(start.y, centerY) + 50 },
      { x: end.x, y: end.y }
    ],
    left: [
      start,
      { x: Math.min(start.x, centerX) - 50, y: start.y },
      { x: Math.min(start.x, centerX) - 50, y: end.y },
      { x: end.x, y: end.y }
    ],
    right: [
      start,
      { x: Math.max(start.x, centerX) + 50, y: start.y },
      { x: Math.max(start.x, centerX) + 50, y: end.y },
      { x: end.x, y: end.y }
    ]
  };

  // 按优先级尝试各种绕行方案
  for (const direction of priorityOrder) {
    const path = pathStrategies[direction];
    const isClear = !obstacles.some(obs =>
      path.some(p => pointInObstacle(p, obs))
    );

    if (isClear) {
      return simplifyPath(path);
    }
  }

  // 所有方向都被阻挡，尝试混合方案
  const mixedPath = [
    start,
    { x: start.x + startDir.x * 30, y: start.y + startDir.y * 30 },
    { x: end.x + endDir.x * 30, y: end.y + endDir.y * 30 },
    { x: end.x, y: end.y }
  ];

  const mixedClear = !obstacles.some(obs =>
    mixedPath.some(p => pointInObstacle(p, obs))
  );

  if (mixedClear) {
    return simplifyPath(mixedPath);
  }

  // 如果所有方向都被阻挡，使用默认路径
  return [start, end];
}

/**
 * 检查点是否在障碍物内
 */
function pointInObstacle(point: PathPoint, obstacle: Obstacle): boolean {
  return point.x >= obstacle.x &&
         point.x <= obstacle.x + obstacle.width &&
         point.y >= obstacle.y &&
         point.y <= obstacle.y + obstacle.height;
}

/**
 * 检查线段是否与障碍物相交
 */
function lineIntersectsObstacle(start: PathPoint, end: PathPoint, obstacle: Obstacle): boolean {
  // 检查线段的四个边界
  const left = obstacle.x;
  const right = obstacle.x + obstacle.width;
  const top = obstacle.y;
  const bottom = obstacle.y + obstacle.height;

  // 线段与矩形相交检测
  return lineIntersectsLine(start, end, { x: left, y: top }, { x: right, y: top }) ||
         lineIntersectsLine(start, end, { x: left, y: bottom }, { x: right, y: bottom }) ||
         lineIntersectsLine(start, end, { x: left, y: top }, { x: left, y: bottom }) ||
         lineIntersectsLine(start, end, { x: right, y: top }, { x: right, y: bottom }) ||
         pointInObstacle(start, obstacle) ||
         pointInObstacle(end, obstacle);
}

/**
 * 检查两条线段是否相交
 */
function lineIntersectsLine(
  a: PathPoint,
  b: PathPoint,
  c: PathPoint,
  d: PathPoint
): boolean {
  const denominator = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);
  
  if (Math.abs(denominator) < 0.0001) {
    return false; // 平行线
  }
  
  const ua = ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denominator;
  const ub = ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / denominator;
  
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

/**
 * 计算长距离正交路径（自动分割）
 */
function calculateLongDistanceOrthogonalPath(
  start: PathPoint,
  end: PathPoint,
  startDir: { x: number; y: number },
  endDir: { x: number; y: number }
): PathPoint[] {
  const points: PathPoint[] = [start];

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const totalDistance = Math.abs(dx) + Math.abs(dy);

  // 根据距离分割成多个段
  const segmentLength = 150;
  const segments = Math.ceil(totalDistance / segmentLength);

  // 根据起点和终点方向确定路由策略
  const horizontalRouting = Math.abs(dx) >= Math.abs(dy);

  if (horizontalRouting) {
    // 水平为主 - 决定是从上方还是下方走
    const useUpperRoute = startDir.y <= 0 || endDir.y <= 0;
    const routeY = useUpperRoute ? Math.min(start.y, end.y) - 30 : Math.max(start.y, end.y) + 30;

    points.push({ x: start.x, y: routeY });

    for (let i = 1; i < segments; i++) {
      const ratio = i / segments;
      const x = start.x + dx * ratio;
      points.push({ x, y: routeY });
    }

    points.push({ x: end.x, y: routeY });
  } else {
    // 垂直为主 - 决定是从左侧还是右侧走
    const useLeftRoute = startDir.x <= 0 || endDir.x <= 0;
    const routeX = useLeftRoute ? Math.min(start.x, end.x) - 30 : Math.max(start.x, end.x) + 30;

    points.push({ x: routeX, y: start.y });

    for (let i = 1; i < segments; i++) {
      const ratio = i / segments;
      const y = start.y + dy * ratio;
      points.push({ x: routeX, y });
    }

    points.push({ x: routeX, y: end.y });
  }

  points.push(end);
  return simplifyPath(points);
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
 * 检查三点是否共线
 * @param p1 点1
 * @param p2 点2
 * @param p3 点3
 * @returns 是否共线
 */
export function isCollinear(p1: PathPoint, p2: PathPoint, p3: PathPoint): boolean {
  const area = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  return Math.abs(area) < 0.001;
}

/**
 * 简化路径（移除共线点）
 * @param points 路径点数组
 * @returns 简化后的路径点数组
 */
export function simplifyPath(points: PathPoint[]): PathPoint[] {
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
 * 计算二次贝塞尔曲线路径
 * @param start 起点
 * @param end 终点
 * @param startPosition 起点位置类型
 * @param endPosition 终点位置类型
 * @returns 路径点数组
 */
function calculateQuadraticPath(
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

  // 计算控制点（使用两个方向的平均值）
  const controlPoint: PathPoint = {
    x: (start.x + end.x) / 2 + (startDir.x - endDir.x) * controlDistance * 0.3,
    y: (start.y + end.y) / 2 + (startDir.y - endDir.y) * controlDistance * 0.3,
  };

  // 生成曲线路径点
  const points: PathPoint[] = [start];

  // 使用二次贝塞尔曲线公式生成点
  const steps = 20;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const point = calculateQuadraticBezierPoint(t, start, controlPoint, end);
    points.push(point);
  }

  points.push(end);
  return points;
}

/**
 * 计算二次贝塞尔曲线上的点
 * @param t 参数（0-1）
 * @param p0 起点
 * @param p1 控制点
 * @param p2 终点
 * @returns 曲线上的点
 */
function calculateQuadraticBezierPoint(
  t: number,
  p0: PathPoint,
  p1: PathPoint,
  p2: PathPoint
): PathPoint {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/**
 * 计算手绘曲线路径
 * @param start 起点
 * @param end 终点
 * @param pathPoints 路径点数组（可选，用于编辑模式）
 * @returns 路径点数组
 */
function calculateFreehandPath(
  start: PathPoint,
  end: PathPoint,
  pathPoints?: { x: number; y: number }[]
): PathPoint[] {
  // 如果有提供路径点，使用提供的路径点
  if (pathPoints && pathPoints.length > 0) {
    // 确保起点和终点匹配
    const points: PathPoint[] = [{ ...start }];
    
    // 添加中间点（排除第一个和最后一个，因为我们要强制匹配起点终点）
    for (let i = 1; i < pathPoints.length - 1; i++) {
      points.push({ x: pathPoints[i].x, y: pathPoints[i].y });
    }
    
    points.push({ ...end });
    return smoothPath(points);
  }

  // 默认生成一个S形曲线
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 生成S形曲线的控制点
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  
  const points: PathPoint[] = [start];
  
  // 添加S形曲线的中间点
  const offset = distance * 0.2;
  points.push({ x: midX - offset, y: midY - offset });
  points.push({ x: midX + offset, y: midY + offset });
  
  points.push(end);
  
  return smoothPath(points);
}

/**
 * 平滑路径（使用样条插值）
 * @param points 原始路径点
 * @returns 平滑后的路径点
 */
function smoothPath(points: PathPoint[]): PathPoint[] {
  if (points.length < 3) {
    return points;
  }

  const smoothed: PathPoint[] = [points[0]];
  
  // 使用Catmull-Rom样条曲线平滑
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    
    // 在每一段之间插入平滑点
    const steps = 5;
    for (let j = 1; j < steps; j++) {
      const t = j / steps;
      const point = catmullRomPoint(t, p0, p1, p2, p3);
      smoothed.push(point);
    }
  }
  
  smoothed.push(points[points.length - 1]);
  return smoothed;
}

/**
 * Catmull-Rom样条曲线插值
 * @param t 参数（0-1）
 * @param p0 前一个点
 * @param p1 当前点
 * @param p2 下一个点
 * @param p3 后一个点
 * @returns 插值点
 */
function catmullRomPoint(
  t: number,
  p0: PathPoint,
  p1: PathPoint,
  p2: PathPoint,
  p3: PathPoint
): PathPoint {
  const t2 = t * t;
  const t3 = t2 * t;
  
  return {
    x: 0.5 * ((2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
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
