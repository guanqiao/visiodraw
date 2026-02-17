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

export const createBaseConfig = (config: ShapeRenderConfig) => ({
  id: config.id,
  x: config.x,
  y: config.y,
  width: config.width,
  height: config.height,
  attrs: {
    body: {
      fill: config.fill || '#ffffff',
      stroke: config.stroke || '#333333',
      strokeWidth: config.strokeWidth || 2,
    },
    label: {
      text: config.text || '',
      fontSize: 14,
      fill: '#333333',
    },
  },
  ports: {
    groups: getPortGroups(),
    items: getPortItems(),
  },
  data: { fromStore: true },
})

export type ShapeRenderer = (config: ShapeRenderConfig) => Node

export type ShapeRendererMap = Record<string, ShapeRenderer>
