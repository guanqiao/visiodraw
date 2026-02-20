/**
 * 连接器类型定义
 */

export interface Connector {
  id: string
  sourceShapeId?: string
  targetShapeId?: string
  source?: string
  target?: string
  stroke?: string
  strokeWidth?: number
  style?: string
}
