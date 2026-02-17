import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig, ShapeStyleConfig } from './types'
import {
  createUmlActorPath,
  createUmlClassPath,
  createUmlPackagePath,
  createUmlComponentPath,
  createUmlNodePath,
  createUmlNotePath,
  createUmlSwimlanePoolPath,
  createUmlSwimlaneHorizontalPath,
  createUmlSwimlaneVerticalPath,
  createUmlSwimlaneSeparatorPath,
} from '../shapeMath'
import { renderEllipse, renderDiamond } from './base'

const MERMAID_SHADOW: ShapeStyleConfig = {
  shadowBlur: 3,
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowOffsetX: 2,
  shadowOffsetY: 2,
}

export const renderUmlClass = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, MERMAID_SHADOW)
  
  const lines = config.text?.split('\n') || []
  const className = lines[0] || ''
  const attributes = lines.slice(1).filter(line => 
    line.startsWith('-') || line.startsWith('+') || line.startsWith('#') || line.startsWith('~') ||
    line.includes(':') && !line.includes('()')
  )
  const methods = lines.slice(1).filter(line => 
    line.includes('()')
  )
  
  const lineHeight = 20
  const headerHeight = Math.max(35, lineHeight + 15)
  const attrHeight = Math.max(30, attributes.length * lineHeight + 15)
  const methodHeight = Math.max(30, methods.length * lineHeight + 15)
  const minHeight = headerHeight + attrHeight + methodHeight
  const adaptiveHeight = Math.max(config.height, minHeight)
  
  const path = createUmlClassPath(config.width, adaptiveHeight, headerHeight, attrHeight)
  
  return new Shape.Path({
    ...base,
    height: adaptiveHeight,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: config.fill || '#fff4dd',
        stroke: config.stroke || '#d4b46a',
      },
      label: {
        ...base.attrs.label,
        text: className,
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refY: headerHeight / 2,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#333',
      },
    },
  })
}

export const renderUmlInterface = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: 5, ry: 5, ...MERMAID_SHADOW })
  const lollipopR = Math.min(config.width, config.height) * 0.08
  const lollipopX = config.width - lollipopR * 2
  const lollipopY = config.height / 2

  const lollipopPath = `M${lollipopX},${lollipopY} L${config.width},${lollipopY} M${config.width + lollipopR},${lollipopY} A${lollipopR},${lollipopR} 0 1,1 ${config.width + lollipopR},${lollipopY + 0.01}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,0 L${lollipopX},0 L${lollipopX},${config.height} L0,${config.height} Z ${lollipopPath}`,
        fill: '#f6ffed',
        stroke: '#52c41a',
      },
      label: {
        ...base.attrs.label,
        text: config.text ? `«interface»\n${config.text}` : '«interface»',
        fill: '#333',
      },
    },
  })
}

export const renderUmlActor = (config: ShapeRenderConfig): Node => {
  const path = createUmlActorPath(config.width, config.height)
  const base = createBaseConfig(config)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: 'none',
        stroke: '#333333',
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    },
  })
}

export const renderUmlUseCase = renderEllipse

export const renderUmlPackage = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlPackagePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#fff4dd',
        stroke: '#d4b46a',
      },
    },
  })
}

export const renderUmlComponent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlComponentPath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#e6f7ff',
        stroke: '#1890ff',
      },
    },
  })
}

export const renderUmlNode = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlNodePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#f0f5ff',
        stroke: '#2f54eb',
      },
    },
  })
}

export const renderUmlNote = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlNotePath(config.width, config.height)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#fff5ad',
        stroke: '#e8d665',
      },
    },
  })
}

export const renderUmlLifeline = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const height = config.height
  const centerX = config.width / 2

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${centerX},0 L${centerX},${height}`,
        strokeDasharray: '5,5',
        fill: 'none',
        stroke: '#666666',
        strokeWidth: 2,
      },
    },
  })
}

export const renderUmlActivation = (config: ShapeRenderConfig): Node => {
  return new Shape.Rect({
    ...createBaseConfig(config, MERMAID_SHADOW),
    attrs: {
      ...createBaseConfig(config, MERMAID_SHADOW).attrs,
      body: {
        ...createBaseConfig(config, MERMAID_SHADOW).attrs.body,
        fill: '#e1e1e1',
        stroke: '#999',
        rx: 2,
        ry: 2,
      },
    },
  })
}

export const renderUmlFragment = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: 4, ry: 4, ...MERMAID_SHADOW })
  const foldSize = Math.min(config.width, config.height) * 0.12
  const headerHeight = Math.min(config.height * 0.2, 25)

  const fragmentPath = `M0,0 L${config.width - foldSize},0 L${config.width},${foldSize} L${config.width},${config.height} L0,${config.height} Z
    M${config.width - foldSize},0 L${config.width - foldSize},${foldSize} L${config.width},${foldSize}
    M0,${headerHeight} L${config.width},${headerHeight}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: fragmentPath,
        fill: '#f4f4f4',
        stroke: '#666',
      },
      label: {
        ...base.attrs.label,
        text: config.text || 'alt',
        textVerticalAnchor: 'top',
        refY: headerHeight / 2,
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#333',
      },
    },
  })
}

export const renderUmlSwimlanePool = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const laneCount = 3
  const headerWidth = Math.min(config.width * 0.15, 80)
  const path = createUmlSwimlanePoolPath(config.width, config.height, laneCount, headerWidth)

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fillRule: 'evenodd',
        fill: '#fff',
        stroke: '#999',
      },
      label: {
        ...base.attrs.label,
        refX: headerWidth / 2,
        textVerticalAnchor: 'middle',
        transform: `rotate(-90, ${headerWidth / 2}, ${config.height / 2})`,
      },
    },
  })
}

export const renderUmlSwimlaneHorizontal = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const headerWidth = Math.min(config.width * 0.2, 80)
  const path = createUmlSwimlaneHorizontalPath(config.width, config.height, headerWidth)

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fillRule: 'evenodd',
        fill: '#fff',
        stroke: '#999',
      },
      label: {
        ...base.attrs.label,
        refX: headerWidth / 2,
        textVerticalAnchor: 'middle',
        transform: `rotate(-90, ${headerWidth / 2}, ${config.height / 2})`,
      },
    },
  })
}

export const renderUmlSwimlaneVertical = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const headerHeight = Math.min(config.height * 0.15, 40)
  const path = createUmlSwimlaneVerticalPath(config.width, config.height, headerHeight)

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fillRule: 'evenodd',
        fill: '#fff',
        stroke: '#999',
      },
      label: {
        ...base.attrs.label,
        refY: headerHeight / 2,
        textVerticalAnchor: 'middle',
      },
    },
  })
}

export const renderUmlSwimlaneSeparator = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlSwimlaneSeparatorPath(config.width, config.height)

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: 'none',
        strokeDasharray: '4,2',
        stroke: '#999',
      },
    },
  })
}

export const renderUmlSwimlane = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const headerWidth = Math.min(config.width * 0.2, 80)
  const width = config.width
  const height = config.height
  const path = `M0,0 L${width},0 L${width},${height} L0,${height} Z M${headerWidth},0 L${headerWidth},${height}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fillRule: 'evenodd',
        fill: '#fff',
        stroke: '#999',
      },
      label: {
        ...base.attrs.label,
        refX: headerWidth / 2,
        textVerticalAnchor: 'middle',
        transform: `rotate(-90, ${headerWidth / 2}, ${height / 2})`,
      },
    },
  })
}

export const renderUmlState = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: 10, ry: 10, ...MERMAID_SHADOW })
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: '#f0f5ff',
        stroke: '#2f54eb',
        rx: 10,
        ry: 10,
      },
    },
  })
}

export const renderUmlInitialState = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2
  const r = Math.min(config.width, config.height) / 2 - 2

  const path = `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx},${cy + r} A${r},${r} 0 1,1 ${cx},${cy - r}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fill: '#52c41a',
        stroke: '#52c41a',
      },
    },
  })
}

export const renderUmlFinalState = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2
  const outerR = Math.min(config.width, config.height) / 2 - 2
  const innerR = outerR * 0.6

  const path = `M${cx},${cy - outerR} A${outerR},${outerR} 0 1,1 ${cx},${cy + outerR} A${outerR},${outerR} 0 1,1 ${cx},${cy - outerR}
    M${cx},${cy - innerR} A${innerR},${innerR} 0 1,1 ${cx},${cy + innerR} A${innerR},${innerR} 0 1,1 ${cx},${cy - innerR}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        fillRule: 'evenodd',
        fill: '#f5222d',
        stroke: '#f5222d',
      },
    },
  })
}

export const umlRenderers = {
  'uml-class': renderUmlClass,
  'uml-interface': renderUmlInterface,
  'uml-actor': renderUmlActor,
  'uml-usecase': renderUmlUseCase,
  'uml-package': renderUmlPackage,
  'uml-component': renderUmlComponent,
  'uml-node': renderUmlNode,
  'uml-note': renderUmlNote,
  'uml-lifeline': renderUmlLifeline,
  'uml-activation': renderUmlActivation,
  'uml-fragment': renderUmlFragment,
  'uml-swimlane': renderUmlSwimlane,
  'uml-swimlane-pool': renderUmlSwimlanePool,
  'uml-swimlane-horizontal': renderUmlSwimlaneHorizontal,
  'uml-swimlane-vertical': renderUmlSwimlaneVertical,
  'uml-swimlane-separator': renderUmlSwimlaneSeparator,
  'uml-decision': renderDiamond,
  'uml-initial': renderUmlInitialState,
  'uml-final': renderUmlFinalState,
  'uml-fork': renderUmlActivation,
  'uml-state': renderUmlState,
  'uml-initial-state': renderUmlInitialState,
  'uml-final-state': renderUmlFinalState,
}
