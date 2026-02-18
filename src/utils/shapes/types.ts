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
  gradient?: GradientConfig | string
  shadowPreset?: keyof typeof SHADOW_PRESETS
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

export interface GradientConfig {
  type: 'linear' | 'radial'
  id?: string
  x1?: number | string
  y1?: number | string
  x2?: number | string
  y2?: number | string
  cx?: number | string
  cy?: number | string
  r?: number | string
  stops: GradientStop[]
}

export interface GradientStop {
  offset: number
  color: string
  opacity?: number
}

export interface ShadowPreset {
  name: string
  blur: number
  color: string
  offsetX: number
  offsetY: number
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
  gradient?: GradientConfig | string
  shadowPreset?: keyof typeof SHADOW_PRESETS
}

export const SHADOW_PRESETS: Record<string, ShadowPreset> = {
  soft: {
    name: 'soft',
    blur: 4,
    color: 'rgba(0, 0, 0, 0.08)',
    offsetX: 1,
    offsetY: 2,
  },
  medium: {
    name: 'medium',
    blur: 8,
    color: 'rgba(0, 0, 0, 0.12)',
    offsetX: 2,
    offsetY: 4,
  },
  strong: {
    name: 'strong',
    blur: 16,
    color: 'rgba(0, 0, 0, 0.2)',
    offsetX: 4,
    offsetY: 8,
  },
  inner: {
    name: 'inner',
    blur: 4,
    color: 'rgba(0, 0, 0, 0.15)',
    offsetX: 0,
    offsetY: 0,
  },
  glow: {
    name: 'glow',
    blur: 12,
    color: 'rgba(24, 144, 255, 0.4)',
    offsetX: 0,
    offsetY: 0,
  },
  colored: {
    name: 'colored',
    blur: 8,
    color: 'rgba(24, 144, 255, 0.25)',
    offsetX: 0,
    offsetY: 4,
  },
}

export const GRADIENT_PRESETS: Record<string, GradientConfig> = {
  blue: {
    type: 'linear',
    id: 'gradient-blue',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#e6f7ff' },
      { offset: 1, color: '#1890ff' },
    ],
  },
  green: {
    type: 'linear',
    id: 'gradient-green',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#f6ffed' },
      { offset: 1, color: '#52c41a' },
    ],
  },
  orange: {
    type: 'linear',
    id: 'gradient-orange',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#fff7e6' },
      { offset: 1, color: '#fa8c16' },
    ],
  },
  red: {
    type: 'linear',
    id: 'gradient-red',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#fff1f0' },
      { offset: 1, color: '#f5222d' },
    ],
  },
  purple: {
    type: 'linear',
    id: 'gradient-purple',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#f9f0ff' },
      { offset: 1, color: '#722ed1' },
    ],
  },
  cyan: {
    type: 'linear',
    id: 'gradient-cyan',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#e6fffb' },
      { offset: 1, color: '#13c2c2' },
    ],
  },
  gray: {
    type: 'linear',
    id: 'gradient-gray',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#fafafa' },
      { offset: 1, color: '#d9d9d9' },
    ],
  },
  radialBlue: {
    type: 'radial',
    id: 'gradient-radial-blue',
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: 0, color: '#ffffff', opacity: 1 },
      { offset: 0.5, color: '#e6f7ff', opacity: 0.8 },
      { offset: 1, color: '#1890ff', opacity: 0.4 },
    ],
  },
  radialGreen: {
    type: 'radial',
    id: 'gradient-radial-green',
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: 0, color: '#ffffff', opacity: 1 },
      { offset: 0.5, color: '#f6ffed', opacity: 0.8 },
      { offset: 1, color: '#52c41a', opacity: 0.4 },
    ],
  },
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
