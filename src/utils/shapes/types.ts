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

export interface HighlightConfig {
  type: 'top' | 'left' | 'right' | 'bottom' | 'corners' | 'full'
  color: string
  opacity?: number
  width?: number
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
  highlight?: HighlightConfig
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
  erEntity: {
    type: 'linear',
    id: 'gradient-er-entity',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#e6f7ff' },
      { offset: 1, color: '#1890ff' },
    ],
  },
  erWeakEntity: {
    type: 'linear',
    id: 'gradient-er-weak',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#fff7e6' },
      { offset: 1, color: '#fa8c16' },
    ],
  },
  erAttribute: {
    type: 'linear',
    id: 'gradient-er-attribute',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#f6ffed' },
      { offset: 1, color: '#52c41a' },
    ],
  },
  flowchartProcess: {
    type: 'linear',
    id: 'gradient-flowchart-process',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#ffffff' },
      { offset: 1, color: '#f0f0f0' },
    ],
  },
  flowchartDecision: {
    type: 'linear',
    id: 'gradient-flowchart-decision',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#fff7e6' },
      { offset: 1, color: '#ffd591' },
    ],
  },
  flowchartStart: {
    type: 'linear',
    id: 'gradient-flowchart-start',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#f6ffed' },
      { offset: 1, color: '#95de64' },
    ],
  },
  flowchartEnd: {
    type: 'linear',
    id: 'gradient-flowchart-end',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#fff1f0' },
      { offset: 1, color: '#ff7875' },
    ],
  },
  bpmnStart: {
    type: 'radial',
    id: 'gradient-bpmn-start',
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: 0, color: '#52c41a' },
      { offset: 1, color: '#389e0d' },
    ],
  },
  bpmnEnd: {
    type: 'radial',
    id: 'gradient-bpmn-end',
    cx: '50%', cy: '50%', r: '50%',
    stops: [
      { offset: 0, color: '#f5222d' },
      { offset: 1, color: '#cf1322' },
    ],
  },
  bpmnTask: {
    type: 'linear',
    id: 'gradient-bpmn-task',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#e6f7ff' },
      { offset: 1, color: '#91d5ff' },
    ],
  },
  umlClass: {
    type: 'linear',
    id: 'gradient-uml-class',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#fff7e6' },
      { offset: 1, color: '#ffd591' },
    ],
  },
  umlInterface: {
    type: 'linear',
    id: 'gradient-uml-interface',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#e6fffb' },
      { offset: 1, color: '#36cfc9' },
    ],
  },
  sequenceActor: {
    type: 'linear',
    id: 'gradient-sequence-actor',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#f9f0ff' },
      { offset: 1, color: '#b37feb' },
    ],
  },
  sequenceDatabase: {
    type: 'linear',
    id: 'gradient-sequence-db',
    x1: 0, y1: 0, x2: 0, y2: 1,
    stops: [
      { offset: 0, color: '#fff7e6' },
      { offset: 1, color: '#ffc069' },
    ],
  },
}

function resolveShadow(
  preset: keyof typeof SHADOW_PRESETS | undefined,
  custom: { shadowBlur?: number; shadowColor?: string; shadowOffsetX?: number; shadowOffsetY?: number }
): { name: string; args: any } | null {
  if (preset && SHADOW_PRESETS[preset]) {
    const p = SHADOW_PRESETS[preset]
    return {
      name: 'dropShadow',
      args: {
        dx: p.offsetX,
        dy: p.offsetY,
        blur: p.blur,
        color: p.color,
      },
    }
  }
  
  if (custom.shadowBlur !== undefined) {
    return {
      name: 'dropShadow',
      args: {
        dx: custom.shadowOffsetX || 2,
        dy: custom.shadowOffsetY || 2,
        blur: custom.shadowBlur,
        color: custom.shadowColor || 'rgba(0,0,0,0.1)',
      },
    }
  }
  
  return null
}

export const createBaseConfig = (config: ShapeRenderConfig, styleConfig: ShapeStyleConfig = {}) => {
  const { rx, ry, strokeDasharray, opacity, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, gradient, shadowPreset, highlight } = styleConfig
  
  const bodyAttrs: Record<string, any> = {}
  
  if (gradient) {
    if (typeof gradient === 'string') {
      bodyAttrs.fill = gradient
    } else {
      const gradientId = gradient.id || `gradient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      bodyAttrs.fill = `url(#${gradientId})`
    }
  } else {
    bodyAttrs.fill = config.fill || '#ffffff'
  }
  
  bodyAttrs.stroke = config.stroke || '#333333'
  bodyAttrs.strokeWidth = config.strokeWidth || 2
  
  if (rx !== undefined) bodyAttrs.rx = rx
  if (ry !== undefined) bodyAttrs.ry = ry
  
  if (strokeDasharray) bodyAttrs.strokeDasharray = strokeDasharray
  
  if (opacity !== undefined) bodyAttrs.opacity = opacity
  
  const resolvedShadow = resolveShadow(shadowPreset, { shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY })
  if (resolvedShadow) {
    bodyAttrs.filter = resolvedShadow
  }
  
  let attrs: Record<string, any> = {
    body: bodyAttrs,
    label: {
      text: config.text || '',
      fontSize: 14,
      fill: '#333333',
      fontFamily: 'trebuchet ms, verdana, arial, sans-serif',
    },
  }
  
  if (highlight) {
    attrs = addHighlight(config, highlight, attrs)
  }
  
  return {
    id: config.id,
    x: config.x,
    y: config.y,
    width: config.width,
    height: config.height,
    attrs,
    ports: {
      groups: getPortGroups(),
      items: getPortItems(),
    },
    data: { fromStore: true, shapeType: config.shapeType },
  }
}

function addHighlight(config: ShapeRenderConfig, highlight: HighlightConfig, attrs: Record<string, any>): Record<string, any> {
  const { width, height } = config
  const { type, color, opacity = 0.5, width: strokeWidth = 2 } = highlight
  
  const highlightPath = createHighlightPath(type, width, height)
  
  return {
    ...attrs,
    ...(attrs.body && {
      body: {
        ...attrs.body,
        stroke: attrs.body.stroke || color,
        strokeWidth: attrs.body.strokeWidth || strokeWidth,
      },
    }),
    highlight: {
      refD: highlightPath,
      fill: color,
      opacity,
      stroke: color,
      strokeWidth: 1,
      strokeDasharray: 'none',
    },
  }
}

function createHighlightPath(type: HighlightConfig['type'], width: number, height: number): string {
  const w = width
  const h = height
  
  switch (type) {
    case 'top':
      return `M0,0 L${w},0 L${w},3 L0,3 Z`
    case 'bottom':
      return `M0,${h - 3} L${w},${h - 3} L${w},${h} L0,${h} Z`
    case 'left':
      return `M0,0 L3,0 L3,${h} L0,${h} Z`
    case 'right':
      return `M${w - 3},0 L${w},0 L${w},${h} L${w - 3},${h} Z`
    case 'corners':
      const size = Math.min(w, h) * 0.15
      return `M0,0 L${size},0 L0,${size} Z M${w - size},0 L${w},0 L${w},${size} Z M0,${h - size} L0,${h} L${size},${h} Z M${w - size},${h} L${w},${h} L${w},${h - size} Z`
    case 'full':
    default:
      return `M0,0 L${w},0 L${w},${h} L0,${h} Z`
  }
}

export type ShapeRenderer = (config: ShapeRenderConfig) => Node

export type ShapeRendererMap = Record<string, ShapeRenderer>
