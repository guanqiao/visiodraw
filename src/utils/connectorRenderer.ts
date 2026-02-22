import type {
  Connector,
  ConnectorStyle,
  ConnectorEndStyle,
  LineStyle,
  ConnectorLabel,
} from '../types/connection'
import { connectorMarkers } from '../types/connection'
import { getConnectorRouter } from './connectorRouter'
import { getCurrentTheme } from './mermaidTheme'

export interface EdgeAttributes {
  line: {
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: string
    targetMarker?: any
    sourceMarker?: any
    filter?: any
    lineAnimations?: any[]
    opacity?: number
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
  vertices?: Array<{ x: number; y: number }>
  // X6 路由约束
  routerArgs?: {
    padding?: number
    constraint?: 'horizontal' | 'vertical' | 'none'
  }
}

export class ConnectorRenderer {
  /**
   * Convert connector data to X6 edge configuration
   */
  static toX6Edge(connector: Connector): X6EdgeConfig {
    const style: ConnectorStyle = connector.style || 'orthogonal'

    // X6 内置 router 配置
    const routerConfig = (() => {
      switch (style) {
        case 'orthogonal':
        case 'manhattan':
          return { name: 'manhattan' }
        case 'metro':
          return { name: 'metro' }
        case 'curved':
          return { name: 'er' }
        case 'bezier':
          return { name: 'normal' }
        case 'straight':
          // 使用 normal router 配合 pathPoints 实现直线
          return connector.pathPoints ? undefined : { name: 'normal' }
        default:
          return undefined
      }
    })()

    // X6 内置 connector 配置
    const connectorConfig = (() => {
      switch (style) {
        case 'bezier':
          return { name: 'smooth' }
        case 'curved':
          return { name: 'rounded' }
        case 'orthogonal':
        case 'manhattan':
        case 'metro':
          return { name: 'rounded' }
        case 'straight':
          // 直线不使用 connector，直接连接
          return undefined
        default:
          return undefined
      }
    })()

    // 构建基础配置
    const edgeConfig: X6EdgeConfig = {
      id: connector.id,
      source: {
        cell: connector.sourceShapeId,
        port: connector.sourcePointId,
      },
      target: {
        cell: connector.targetShapeId,
        port: connector.targetPointId,
      },
      router: routerConfig,
      connector: connectorConfig,
      attrs: this.buildEdgeAttributes(connector),
      labels: this.buildLabels(connector.labels),
      data: { fromStore: true },
    }

    // 对于 straight 样式，添加路径点确保直线
    if (style === 'straight' && connector.pathPoints && connector.pathPoints.length > 0) {
      // 使用 vertices 定义路径点，X6 会按顺序连接这些点
      edgeConfig.vertices = connector.pathPoints
    }

    // 应用路由约束（用于序列图等需要水平或垂直连线的场景）
    if (connector.routingConstraint && connector.routingConstraint !== 'none') {
      if (edgeConfig.router) {
        edgeConfig.router.args = {
          ...edgeConfig.router.args,
          constraint: connector.routingConstraint,
        }
      } else {
        edgeConfig.router = {
          name: 'normal',
          args: {
            constraint: connector.routingConstraint,
          },
        }
      }
    }

    return edgeConfig
  }

  /**
   * Build edge attributes for X6
   */
  private static buildEdgeAttributes(connector: Connector): EdgeAttributes {
    const theme = getCurrentTheme()
    const attrs: EdgeAttributes = {
      line: {
        stroke: connector.stroke || theme.lineColor,
        strokeWidth: connector.strokeWidth || 2,
      },
    }

    if (connector.gradient) {
      const gradientId = connector.gradient.id || `edge-gradient-${Date.now()}`
      attrs.line.stroke = `url(#${gradientId})`
    }

    if (connector.glow?.enabled) {
      attrs.line.filter = {
        name: 'dropShadow',
        args: {
          dx: 0,
          dy: 0,
          blur: connector.glow.blur || 8,
          color: connector.glow.color || 'rgba(24, 144, 255, 0.6)',
        },
      }
    }

    if (connector.animated?.enabled) {
      const speed = connector.animated.speed || 1
      if (connector.animated.type === 'flow') {
        attrs.line.strokeDasharray = '8,4'
        attrs.line.lineAnimations = [{
          attributeName: 'stroke-dashoffset',
          from: '0',
          to: '-12',
          dur: `${1 / speed}s`,
          repeatCount: 'indefinite',
        }]
      } else if (connector.animated.type === 'dash') {
        attrs.line.strokeDasharray = '4,4'
      } else if (connector.animated.type === 'pulse') {
        attrs.line.opacity = 0.5
      }
    }

    if (connector.opacity !== undefined) {
      attrs.line.opacity = connector.opacity
    }

    if (connector.lineStyle === 'dashed') {
      attrs.line.strokeDasharray = '8,4'
    } else if (connector.lineStyle === 'dotted') {
      attrs.line.strokeDasharray = '2,4'
    }

    const targetMarker = this.getMermaidMarker(connector.endStyle)
    const sourceMarker = this.getMermaidMarker(connector.startStyle)

    if (targetMarker) {
      attrs.line.targetMarker = targetMarker
    }

    if (sourceMarker) {
      attrs.line.sourceMarker = sourceMarker
    }

    return attrs
  }

  /**
   * Get Mermaid style marker
   */
  private static getMermaidMarker(style: ConnectorEndStyle): any {
    const theme = getCurrentTheme()
    
    switch (style) {
      case 'arrow':
        return {
          name: 'classic',
          width: 12,
          height: 12,
          fill: theme.lineColor,
          stroke: theme.lineColor,
        }
      case 'dot':
        return {
          name: 'circle',
          r: 4,
          fill: theme.lineColor,
          stroke: theme.lineColor,
          strokeWidth: 1,
        }
      case 'diamond':
        return {
          name: 'diamond',
          width: 10,
          height: 10,
          fill: theme.lineColor,
          stroke: theme.lineColor,
        }
      case 'circle':
        return {
          name: 'circle',
          r: 4,
          fill: 'white',
          stroke: theme.lineColor,
          strokeWidth: 2,
        }
      case 'triangle':
        return {
          name: 'block',
          width: 12,
          height: 12,
          fill: theme.lineColor,
        }
      case 'open-arrow':
        return {
          name: 'classic',
          width: 12,
          height: 12,
          fill: 'transparent',
          stroke: theme.lineColor,
          strokeWidth: 2,
        }
      case 'none':
      default:
        return null
    }
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
          fill: label.backgroundColor || '#ffffff',
          stroke: '#e8e8e8',
          strokeWidth: 1,
          rx: 4,
          ry: 4,
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
          fill: label.backgroundColor || '#ffffff',
          stroke: '#e8e8e8',
          strokeWidth: 1,
          rx: 4,
          ry: 4,
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
