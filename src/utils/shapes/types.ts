import { Node } from '@antv/x6'

export interface ShapeRenderConfig {
  id: string
  x: number
  y: number
  width: number
  height: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  rx?: number
  ry?: number
  shapeType?: string
  startAngle?: number
  endAngle?: number
  centerX?: number
  centerY?: number
  radius?: number
}

export interface PortGroup {
  position: 'top' | 'bottom' | 'left' | 'right'
  attrs: {
    circle: {
      r: number
      magnet: boolean
      stroke: string
      strokeWidth: number
      fill: string
    }
  }
}

export interface PortItem {
  id: string
  group: 'top' | 'bottom' | 'left' | 'right'
}

export const getPortGroups = (): Record<string, PortGroup> => ({
  top: {
    position: 'top',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#1890ff',
        strokeWidth: 1,
        fill: '#fff',
      },
    },
  },
  bottom: {
    position: 'bottom',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#1890ff',
        strokeWidth: 1,
        fill: '#fff',
      },
    },
  },
  left: {
    position: 'left',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#1890ff',
        strokeWidth: 1,
        fill: '#fff',
      },
    },
  },
  right: {
    position: 'right',
    attrs: {
      circle: {
        r: 4,
        magnet: true,
        stroke: '#1890ff',
        strokeWidth: 1,
        fill: '#fff',
      },
    },
  },
})

export const getPortItems = (): PortItem[] => [
  { id: 'top', group: 'top' },
  { id: 'bottom', group: 'bottom' },
  { id: 'left', group: 'left' },
  { id: 'right', group: 'right' },
]

export interface TextWrapConfig {
  width: number
  height: number
  ellipsis?: boolean
  [key: string]: any
}

export interface ShapeStyleConfig {
  rx?: number
  ry?: number
  strokeDasharray?: string
  opacity?: number
  shadowBlur?: number
  shadowColor?: string
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export const createBaseConfig = (config: ShapeRenderConfig, styleConfig: ShapeStyleConfig = {}) => {
  const { rx, ry, strokeDasharray, opacity, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY } = styleConfig
  
  const bodyAttrs: Record<string, any> = {
    fill: config.fill || '#ffffff',
    stroke: config.stroke || '#333333',
    strokeWidth: config.strokeWidth || 2,
  }
  
  // 添加圆角
  if (rx !== undefined) bodyAttrs.rx = rx
  if (ry !== undefined) bodyAttrs.ry = ry
  
  // 添加虚线
  if (strokeDasharray) bodyAttrs.strokeDasharray = strokeDasharray
  
  // 添加透明度
  if (opacity !== undefined) bodyAttrs.opacity = opacity
  
  // 添加阴影
  if (shadowBlur !== undefined) bodyAttrs.filter = {
    name: 'dropShadow',
    args: {
      dx: shadowOffsetX || 2,
      dy: shadowOffsetY || 2,
      blur: shadowBlur,
      color: shadowColor || 'rgba(0,0,0,0.1)',
    },
  }
  
  return {
    id: config.id,
    x: config.x,
    y: config.y,
    width: config.width,
    height: config.height,
    attrs: {
      body: bodyAttrs,
      label: {
        text: config.text || '',
        fontSize: 14,
        fill: '#333333',
        fontFamily: 'trebuchet ms, verdana, arial, sans-serif',
      },
    },
    ports: {
      groups: getPortGroups(),
      items: getPortItems(),
    },
    data: { fromStore: true, shapeType: config.shapeType },
  }
}

export type ShapeRenderer = (config: ShapeRenderConfig) => Node

export type ShapeRendererMap = Record<string, ShapeRenderer>
