export type LineStyle = 'solid' | 'dashed' | 'dotted'
export type MarkerStyle = 'none' | 'classic' | 'block' | 'blockThin' | 'diamond' | 'diamondThin' | 'async' | 'circle'
export type RouterType = 'normal' | 'manhattan' | 'orthogonal' | 'oneSide'
export type ConnectorType = 'normal' | 'rounded' | 'smooth' | 'jumpover'

export interface EdgeStyleConfig {
  stroke: string
  strokeWidth: number
  lineStyle: LineStyle
  startStyle: MarkerStyle
  endStyle: MarkerStyle
  router?: RouterType
  connector?: ConnectorType
}

export interface MarkerConfig {
  name: string
  size: number
}

export interface EdgeAttrs {
  line: {
    stroke: string
    strokeWidth: number
    strokeDasharray?: string
    sourceMarker: MarkerConfig | null
    targetMarker: MarkerConfig | null
  }
}

const DEFAULT_STYLE: EdgeStyleConfig = {
  stroke: '#333333',
  strokeWidth: 2,
  lineStyle: 'solid',
  startStyle: 'none',
  endStyle: 'classic',
  router: 'normal',
  connector: 'normal',
}

const MARKER_SIZE = 10

const PRESET_STYLES: Record<string, Partial<EdgeStyleConfig>> = {
  'flowchart-arrow': {
    endStyle: 'classic',
    lineStyle: 'solid',
    router: 'manhattan',
    connector: 'rounded',
  },
  'er-relationship': {
    startStyle: 'none',
    endStyle: 'none',
    lineStyle: 'solid',
    router: 'normal',
  },
  'er-one-to-many': {
    startStyle: 'none',
    endStyle: 'classic',
    lineStyle: 'solid',
  },
  'er-many-to-many': {
    startStyle: 'classic',
    endStyle: 'classic',
    lineStyle: 'solid',
  },
  'uml-dependency': {
    lineStyle: 'dashed',
    endStyle: 'blockThin',
  },
  'uml-inheritance': {
    lineStyle: 'solid',
    endStyle: 'blockThin',
  },
  'uml-composition': {
    lineStyle: 'solid',
    startStyle: 'diamond',
    endStyle: 'none',
  },
  'uml-aggregation': {
    lineStyle: 'solid',
    startStyle: 'diamondThin',
    endStyle: 'none',
  },
  'bpmn-sequence': {
    endStyle: 'classic',
    lineStyle: 'solid',
    router: 'manhattan',
  },
  'bpmn-message': {
    endStyle: 'classic',
    lineStyle: 'dashed',
    startStyle: 'circle',
  },
}

export const EdgeStyleManager = {
  getDefaultStyle(): EdgeStyleConfig {
    return { ...DEFAULT_STYLE }
  },

  applyStyle(customStyle: Partial<EdgeStyleConfig>): EdgeStyleConfig {
    return {
      ...DEFAULT_STYLE,
      ...customStyle,
    }
  },

  getMarkerConfig(style: MarkerStyle): MarkerConfig | null {
    if (style === 'none') {
      return null
    }

    const markerNames: Record<Exclude<MarkerStyle, 'none'>, string> = {
      classic: 'classic',
      block: 'block',
      blockThin: 'blockThin',
      diamond: 'diamond',
      diamondThin: 'diamondThin',
      async: 'async',
      circle: 'circle',
    }

    return {
      name: markerNames[style],
      size: MARKER_SIZE,
    }
  },

  getLineStyleDash(style: LineStyle): string {
    const dashPatterns: Record<LineStyle, string> = {
      solid: '',
      dashed: '5,5',
      dotted: '2,2',
    }
    return dashPatterns[style]
  },

  getRouterConfig(router: RouterType) {
    const routerConfigs: Record<RouterType, any> = {
      normal: { name: 'normal' },
      manhattan: {
        name: 'manhattan',
        args: {
          padding: 20,
        },
      },
      orthogonal: { name: 'orthogonal' },
      oneSide: {
        name: 'oneSide',
        args: {
          side: 'bottom',
        },
      },
    }
    return routerConfigs[router]
  },

  getConnectorConfig(connector: ConnectorType) {
    const connectorConfigs: Record<ConnectorType, any> = {
      normal: { name: 'normal' },
      rounded: { name: 'rounded' },
      smooth: { name: 'smooth' },
      jumpover: { name: 'jumpover' },
    }
    return connectorConfigs[connector]
  },

  createEdgeAttrs(config: EdgeStyleConfig): EdgeAttrs {
    const strokeDasharray = this.getLineStyleDash(config.lineStyle)
    const sourceMarker = this.getMarkerConfig(config.startStyle)
    const targetMarker = this.getMarkerConfig(config.endStyle)

    return {
      line: {
        stroke: config.stroke,
        strokeWidth: config.strokeWidth,
        ...(strokeDasharray ? { strokeDasharray } : {}),
        sourceMarker,
        targetMarker,
      },
    }
  },

  getPresetStyle(presetName: string): EdgeStyleConfig {
    const preset = PRESET_STYLES[presetName]
    if (preset) {
      return this.applyStyle(preset)
    }
    return this.getDefaultStyle()
  },

  createPresetEdgeAttrs(presetName: string): EdgeAttrs {
    const style = this.getPresetStyle(presetName)
    return this.createEdgeAttrs(style)
  },

  validateStyle(style: Partial<EdgeStyleConfig>): boolean {
    const validLineStyles: LineStyle[] = ['solid', 'dashed', 'dotted']
    const validMarkers: MarkerStyle[] = ['none', 'classic', 'block', 'blockThin', 'diamond', 'diamondThin', 'async']

    if (style.lineStyle && !validLineStyles.includes(style.lineStyle)) {
      return false
    }

    if (style.startStyle && !validMarkers.includes(style.startStyle)) {
      return false
    }

    if (style.endStyle && !validMarkers.includes(style.endStyle)) {
      return false
    }

    if (style.strokeWidth !== undefined && (style.strokeWidth < 1 || style.strokeWidth > 10)) {
      return false
    }

    return true
  },
}

export default EdgeStyleManager
