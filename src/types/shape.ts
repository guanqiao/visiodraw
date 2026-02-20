/**
 * 形状类型定义
 */

export interface Shape {
  id: string
  type: string
  x: number
  y: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  rx?: number
  ry?: number
}
