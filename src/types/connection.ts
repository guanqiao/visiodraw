export type ConnectionPointPosition = 'top' | 'bottom' | 'left' | 'right' | 'bottom-left' | 'bottom-right' | 'custom'

export interface ConnectionPoint {
  id: string
  x: number
  y: number
  position: ConnectionPointPosition
  isVisible: boolean
  isConnected: boolean
  connectedLineIds: string[]
}

export type ConnectorStyle = 'straight' | 'orthogonal' | 'curved' | 'quadratic' | 'freehand'

export type ConnectorEndStyle = 'none' | 'arrow' | 'dot' | 'diamond'

export interface Connector {
  id: string
  sourceShapeId: string
  sourcePointId: string
  targetShapeId: string
  targetPointId: string
  style: ConnectorStyle
  startStyle: ConnectorEndStyle
  endStyle: ConnectorEndStyle
  stroke: string
  strokeWidth: number
  opacity?: number
  label?: string
  labelColor?: string
  labelFontSize?: number
  pathPoints?: { x: number; y: number }[]
  isSelected?: boolean
}

export interface ConnectionPointRenderOptions {
  radius: number
  fill: string
  connectedFill: string
  hoverFill: string
  stroke: string
  strokeWidth: number
}

export const defaultConnectionPointOptions: ConnectionPointRenderOptions = {
  radius: 6,
  fill: '#ffffff',
  connectedFill: '#52c41a',
  hoverFill: '#1890ff',
  stroke: '#1890ff',
  strokeWidth: 2,
}

export const defaultConnectionPointsConfig: Record<string, ConnectionPointPosition[]> = {
  rectangle: ['top', 'bottom', 'left', 'right'],
  circle: ['top', 'bottom', 'left', 'right'],
  triangle: ['top', 'bottom-left', 'bottom-right'],
  diamond: ['top', 'bottom', 'left', 'right'],
  'start-end': ['left', 'right'],
  process: ['top', 'bottom', 'left', 'right'],
  decision: ['top', 'bottom', 'left', 'right'],
  'input-output': ['top', 'bottom', 'left', 'right'],
  document: ['top', 'bottom', 'left', 'right'],
  database: ['top', 'bottom', 'left', 'right'],
  line: [],
  text: [],
}

export interface SnapConfig {
  enabled: boolean
  threshold: number
  showIndicator: boolean
}

export const defaultSnapConfig: SnapConfig = {
  enabled: true,
  threshold: 15,
  showIndicator: true,
}
