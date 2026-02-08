import type {
  Connector,
  ConnectorStyle,
  ConnectorEndStyle,
  LineStyle,
  ConnectorLabel,
} from '../types/connection'
import { connectorMarkers } from '../types/connection'
import { getConnectorRouter } from './connectorRouter'

export interface EdgeAttributes {
  line: {
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: string
    targetMarker?: any
    sourceMarker?: any
  }
  label?: {
    text?: string
    fontSize?: number
    fill?: string
    [key: string]: any
  }
}

export interface X6EdgeConfig {
  id?: string
  source: { cell: string; port?: string }
  target: { cell: string; port?: string }
  router?: { name: string; args?: any }
  connector?: { name: string; args?: any }
  attrs?: EdgeAttributes
  labels?: any[]
  data?: any
}

export class ConnectorRenderer {
  /**
   * Convert connector data to X6 edge configuration
   */
  static toX6Edge(connector: Connector): X6EdgeConfig {
    const router = getConnectorRouter()

    return {
      id: connector.id,
      source: {
        cell: connector.sourceShapeId,
        port: connector.sourcePointId,
      },
      target: {
        cell: connector.targetShapeId,
        port: connector.targetPointId,
      },
      router: router.getRouterConfig(connector.style),
      connector: router.getConnectorConfig(connector.style),
      attrs: this.buildEdgeAttributes(connector),
      labels: this.buildLabels(connector.labels),
      data: { fromStore: true },
    }
  }

  /**
   * Build edge attributes for X6
   */
  private static buildEdgeAttributes(connector: Connector): EdgeAttributes {
    const attrs: EdgeAttributes = {
      line: {
        stroke: connector.stroke || '#333333',
        strokeWidth: connector.strokeWidth || 2,
      },
    }

    // Apply line style
    if (connector.lineStyle === 'dashed') {
      attrs.line.strokeDasharray = '5,5'
    } else if (connector.lineStyle === 'dotted') {
      attrs.line.strokeDasharray = '2,2'
    }

    // Apply markers
    const targetMarker = connectorMarkers[connector.endStyle]
    const sourceMarker = connectorMarkers[connector.startStyle]

    if (targetMarker) {
      attrs.line.targetMarker = targetMarker
    }

    if (sourceMarker) {
      attrs.line.sourceMarker = sourceMarker
    }

    return attrs
  }

  /**
   * Build labels configuration for X6
   */
  private static buildLabels(labels?: ConnectorLabel[]): any[] {
    if (!labels || labels.length === 0) {
      return []
    }

    return labels.map((label) => ({
      attrs: {
        text: {
          text: label.text,
          fontSize: label.fontSize || 12,
          fill: label.color || '#333333',
        },
        rect: {
          fill: label.backgroundColor || 'transparent',
          stroke: 'none',
        },
      },
      position: {
        distance: label.position ?? 0.5,
        offset: {
          x: label.offsetX ?? 0,
          y: label.offsetY ?? -10,
        },
        angle: label.autoRotate ? 'auto' : 0,
      },
    }))
  }

  /**
   * Update edge attributes based on style changes
   */
  static updateEdgeStyle(
    edge: any,
    style: ConnectorStyle
  ): void {
    const router = getConnectorRouter()
    const routerConfig = router.getRouterConfig(style)
    const connectorConfig = router.getConnectorConfig(style)

    edge.setRouter(routerConfig)
    edge.setConnector(connectorConfig)
  }

  /**
   * Update edge markers
   */
  static updateEdgeMarkers(
    edge: any,
    startStyle: ConnectorEndStyle,
    endStyle: ConnectorEndStyle
  ): void {
    const targetMarker = connectorMarkers[endStyle]
    const sourceMarker = connectorMarkers[startStyle]

    edge.attr('line/targetMarker', targetMarker)
    edge.attr('line/sourceMarker', sourceMarker)
  }

  /**
   * Update edge appearance
   */
  static updateEdgeAppearance(
    edge: any,
    updates: {
      stroke?: string
      strokeWidth?: number
      lineStyle?: LineStyle
    }
  ): void {
    if (updates.stroke !== undefined) {
      edge.attr('line/stroke', updates.stroke)
    }

    if (updates.strokeWidth !== undefined) {
      edge.attr('line/strokeWidth', updates.strokeWidth)
    }

    if (updates.lineStyle !== undefined) {
      let dasharray: string | undefined
      if (updates.lineStyle === 'dashed') {
        dasharray = '5,5'
      } else if (updates.lineStyle === 'dotted') {
        dasharray = '2,2'
      }
      edge.attr('line/strokeDasharray', dasharray)
    }
  }

  /**
   * Add or update label on edge
   */
  static updateEdgeLabel(
    edge: any,
    label: ConnectorLabel,
    index: number = 0
  ): void {
    const labels = edge.getLabels() || []
    const labelConfig = {
      attrs: {
        text: {
          text: label.text,
          fontSize: label.fontSize || 12,
          fill: label.color || '#333333',
        },
        rect: {
          fill: label.backgroundColor || 'transparent',
          stroke: 'none',
        },
      },
      position: {
        distance: label.position ?? 0.5,
        offset: {
          x: label.offsetX ?? 0,
          y: label.offsetY ?? -10,
        },
        angle: label.autoRotate ? 'auto' : 0,
      },
    }

    if (index < labels.length) {
      edge.setLabelAt(index, labelConfig)
    } else {
      edge.appendLabel(labelConfig)
    }
  }

  /**
   * Remove label from edge
   */
  static removeEdgeLabel(edge: any, index: number): void {
    edge.removeLabelAt(index)
  }

  /**
   * Get default connector configuration
   */
  static getDefaultConnector(): Partial<Connector> {
    return {
      style: 'orthogonal',
      lineStyle: 'solid',
      startStyle: 'none',
      endStyle: 'arrow',
      stroke: '#333333',
      strokeWidth: 2,
    }
  }

  /**
   * Create a new connector with default values
   */
  static createConnector(
    sourceShapeId: string,
    sourcePointId: string,
    targetShapeId: string,
    targetPointId: string,
    overrides: Partial<Connector> = {}
  ): Connector {
    const defaults = this.getDefaultConnector()

    return {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceShapeId,
      sourcePointId,
      targetShapeId,
      targetPointId,
      style: (overrides.style as ConnectorStyle) || (defaults.style as ConnectorStyle),
      lineStyle: (overrides.lineStyle as LineStyle) || (defaults.lineStyle as LineStyle),
      startStyle: (overrides.startStyle as ConnectorEndStyle) || (defaults.startStyle as ConnectorEndStyle),
      endStyle: (overrides.endStyle as ConnectorEndStyle) || (defaults.endStyle as ConnectorEndStyle),
      stroke: overrides.stroke || defaults.stroke || '#333333',
      strokeWidth: overrides.strokeWidth || defaults.strokeWidth || 2,
      ...overrides,
    } as Connector
  }

  /**
   * Parse X6 edge data to connector format
   */
  static fromX6Edge(edge: any): Connector {
    const source = edge.getSource()
    const target = edge.getTarget()
    const attrs = edge.getAttrs() || {}
    const lineAttrs = attrs.line || {}

    // Determine style from router
    let style: ConnectorStyle = 'straight'
    const router = edge.getRouter()
    if (router) {
      switch (router.name) {
        case 'manhattan':
          style = 'orthogonal'
          break
        case 'metro':
          style = 'metro'
          break
        case 'er':
          style = 'curved'
          break
        default:
          style = 'straight'
      }
    }

    // Determine line style
    let lineStyle: LineStyle = 'solid'
    const dasharray = lineAttrs.strokeDasharray
    if (dasharray) {
      if (dasharray.includes('5')) {
        lineStyle = 'dashed'
      } else if (dasharray.includes('2')) {
        lineStyle = 'dotted'
      }
    }

    // Determine end styles from markers
    const getMarkerStyle = (marker: any): ConnectorEndStyle => {
      if (!marker) return 'none'
      const name = typeof marker === 'string' ? marker : marker.name
      switch (name) {
        case 'classic':
          return 'arrow'
        case 'circle':
          return 'dot'
        case 'diamond':
          return 'diamond'
        default:
          return 'none'
      }
    }

    return {
      id: edge.id,
      sourceShapeId: source?.cell || '',
      sourcePointId: source?.port || 'default',
      targetShapeId: target?.cell || '',
      targetPointId: target?.port || 'default',
      style,
      lineStyle,
      startStyle: getMarkerStyle(lineAttrs.sourceMarker),
      endStyle: getMarkerStyle(lineAttrs.targetMarker),
      stroke: lineAttrs.stroke || '#333333',
      strokeWidth: lineAttrs.strokeWidth || 2,
      labels: this.parseLabels(edge.getLabels()),
    }
  }

  /**
   * Parse X6 labels to connector format
   */
  private static parseLabels(labels: any[]): ConnectorLabel[] | undefined {
    if (!labels || labels.length === 0) {
      return undefined
    }

    return labels.map((label, index) => {
      const textAttrs = label.attrs?.text || {}
      const position = label.position || {}

      return {
        id: `label-${index}`,
        text: textAttrs.text || '',
        position: typeof position.distance === 'number' ? position.distance : 0.5,
        offsetX: position.offset?.x,
        offsetY: position.offset?.y,
        fontSize: textAttrs.fontSize,
        color: textAttrs.fill,
        backgroundColor: label.attrs?.rect?.fill,
        autoRotate: position.angle === 'auto',
      }
    })
  }
}

export default ConnectorRenderer
