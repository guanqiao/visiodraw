/**
 * 连接点管理工具函数
 * @version 1.4.0
 * @date 2026-02-07
 */

import { v4 as uuidv4 } from 'uuid';
import type { ConnectionPoint, ConnectionPointPosition } from '../types/connection';
import { defaultConnectionPointsConfig } from '../types/connection';
import type { Shape } from '../stores/canvasStore';

/**
 * 根据位置类型获取相对坐标
 * @param position 位置类型
 * @returns 相对坐标 {x, y}，范围0-1
 */
export function getRelativePosition(position: ConnectionPointPosition | string): { x: number; y: number } {
  switch (position) {
    case 'top':
      return { x: 0.5, y: 0 };
    case 'bottom':
      return { x: 0.5, y: 1 };
    case 'left':
      return { x: 0, y: 0.5 };
    case 'right':
      return { x: 1, y: 0.5 };
    case 'bottom-left':
      return { x: 0, y: 1 };
    case 'bottom-right':
      return { x: 1, y: 1 };
    case 'custom':
    default:
      return { x: 0.5, y: 0.5 };
  }
}

/**
 * 为图形生成默认连接点
 * @param shapeType 图形类型
 * @returns 连接点数组
 */
export function generateDefaultConnectionPoints(shapeType: string): ConnectionPoint[] {
  const positions = defaultConnectionPointsConfig[shapeType] || ['top', 'bottom', 'left', 'right'];
  
  return positions.map((position) => {
    const relativePos = getRelativePosition(position);
    return {
      id: uuidv4(),
      x: relativePos.x,
      y: relativePos.y,
      position: position as ConnectionPointPosition,
      isVisible: false,
      isConnected: false,
      connectedLineIds: [],
    };
  });
}

/**
 * 计算连接点的绝对坐标
 * @param shape 图形对象
 * @param connectionPoint 连接点
 * @returns 绝对坐标 {x, y}
 */
export function calculateConnectionPointPosition(
  shape: Shape,
  connectionPoint: ConnectionPoint
): { x: number; y: number } {
  // 根据图形类型计算绝对位置
  const absX = shape.x + shape.width * connectionPoint.x;
  const absY = shape.y + shape.height * connectionPoint.y;
  
  // 如果图形有旋转，需要计算旋转后的位置
  if (shape.rotation && shape.rotation !== 0) {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;
    const rad = (shape.rotation * Math.PI) / 180;
    
    // 相对于中心的坐标
    const relX = absX - centerX;
    const relY = absY - centerY;
    
    // 旋转后的坐标
    const rotatedX = relX * Math.cos(rad) - relY * Math.sin(rad);
    const rotatedY = relX * Math.sin(rad) + relY * Math.cos(rad);
    
    return {
      x: centerX + rotatedX,
      y: centerY + rotatedY,
    };
  }
  
  return { x: absX, y: absY };
}

/**
 * 查找最近的连接点
 * @param x 目标X坐标
 * @param y 目标Y坐标
 * @param shapes 图形数组
 * @param threshold 距离阈值
 * @returns 最近的连接点信息或null
 */
export function findNearestConnectionPoint(
  x: number,
  y: number,
  shapes: Shape[],
  threshold: number = 15
): { shape: Shape; connectionPoint: ConnectionPoint; distance: number } | null {
  let nearest: { shape: Shape; connectionPoint: ConnectionPoint; distance: number } | null = null;
  let minDistance = threshold;
  
  for (const shape of shapes) {
    if (!shape.connectionPoints || shape.connectionPoints.length === 0) {
      continue;
    }
    
    for (const point of shape.connectionPoints) {
      const pos = calculateConnectionPointPosition(shape, point);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { shape, connectionPoint: point, distance };
      }
    }
  }
  
  return nearest;
}

/**
 * 更新连接点的连接状态
 * @param shape 图形对象
 * @param pointId 连接点ID
 * @param lineId 连接线ID
 * @param isConnecting 是否正在连接（true为连接，false为断开）
 * @returns 更新后的图形对象
 */
export function updateConnectionPointStatus(
  shape: Shape,
  pointId: string,
  lineId: string,
  isConnecting: boolean
): Shape {
  if (!shape.connectionPoints) {
    return shape;
  }
  
  const updatedPoints = shape.connectionPoints.map((point) => {
    if (point.id === pointId) {
      const connectedLineIds = isConnecting
        ? [...point.connectedLineIds, lineId]
        : point.connectedLineIds.filter((id) => id !== lineId);
      
      return {
        ...point,
        isConnected: connectedLineIds.length > 0,
        connectedLineIds,
      };
    }
    return point;
  });
  
  return {
    ...shape,
    connectionPoints: updatedPoints,
  };
}

/**
 * 显示/隐藏图形的连接点
 * @param shape 图形对象
 * @param visible 是否可见
 * @returns 更新后的图形对象
 */
export function setConnectionPointsVisibility(shape: Shape, visible: boolean): Shape {
  if (!shape.connectionPoints) {
    return shape;
  }
  
  return {
    ...shape,
    connectionPoints: shape.connectionPoints.map((point) => ({
      ...point,
      isVisible: visible,
    })),
  };
}

/**
 * 获取图形上所有可见的连接点
 * @param shape 图形对象
 * @returns 可见的连接点数组
 */
export function getVisibleConnectionPoints(shape: Shape): ConnectionPoint[] {
  return shape.connectionPoints?.filter((point) => point.isVisible) || [];
}

/**
 * 创建自定义连接点
 * @param x 相对X坐标（0-1）
 * @param y 相对Y坐标（0-1）
 * @param position 位置类型
 * @returns 连接点对象
 */
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
  };
}

/**
 * 删除连接点上的连接线引用
 * @param shape 图形对象
 * @param lineId 连接线ID
 * @returns 更新后的图形对象
 */
export function removeLineReferenceFromShape(shape: Shape, lineId: string): Shape {
  if (!shape.connectionPoints) {
    return shape;
  }
  
  const updatedPoints = shape.connectionPoints.map((point) => {
    const filteredIds = point.connectedLineIds.filter((id) => id !== lineId);
    return {
      ...point,
      isConnected: filteredIds.length > 0,
      connectedLineIds: filteredIds,
    };
  });
  
  return {
    ...shape,
    connectionPoints: updatedPoints,
  };
}

/**
 * 序列化连接点
 * @param connectionPoints 连接点数组
 * @returns 序列化后的数据
 */
export function serializeConnectionPoints(connectionPoints: ConnectionPoint[]): string {
  return JSON.stringify(connectionPoints);
}

/**
 * 反序列化连接点
 * @param data 序列化数据
 * @returns 连接点数组
 */
export function deserializeConnectionPoints(data: string): ConnectionPoint[] {
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * 检查连接点是否可用（未被连接或支持多连接）
 * @param connectionPoint 连接点
 * @param allowMultiple 是否允许多个连接
 * @returns 是否可用
 */
export function isConnectionPointAvailable(
  connectionPoint: ConnectionPoint,
  allowMultiple: boolean = false
): boolean {
  if (allowMultiple) {
    return true;
  }
  return !connectionPoint.isConnected;
}

/**
 * 获取连接点的方向向量
 * @param position 位置类型
 * @returns 方向向量 {x, y}
 */
export function getConnectionPointDirection(position: ConnectionPointPosition): { x: number; y: number } {
  switch (position) {
    case 'top':
      return { x: 0, y: -1 };
    case 'bottom':
      return { x: 0, y: 1 };
    case 'left':
      return { x: -1, y: 0 };
    case 'right':
      return { x: 1, y: 0 };
    case 'custom':
    default:
      return { x: 0, y: 0 };
  }
}
