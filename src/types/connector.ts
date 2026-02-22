/**
 * 连接器类型定义
 */

export interface Connector {
  id: string
  sourceShapeId?: string
  targetShapeId?: string
  source?: string
  target?: string
  sourcePointId?: string
  targetPointId?: string
  stroke?: string
  strokeWidth?: number
  style?: string
  lineStyle?: string
  startStyle?: string
  endStyle?: string
}
