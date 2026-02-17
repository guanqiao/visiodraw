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
import { renderEllipse } from './base'

// Mermaid 默认阴影
const MERMAID_SHADOW: ShapeStyleConfig = {
  shadowBlur: 3,
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowOffsetX: 2,
  shadowOffsetY: 2,
}

export const renderUmlClass = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, MERMAID_SHADOW)
  
  // 解析文本内容，计算自适应高度
  const lines = config.text?.split('\n') || []
  const className = lines[0] || ''
  const attributes = lines.slice(1).filter(line => 
    line.startsWith('-') || line.startsWith('+') || line.startsWith('#') || line.startsWith('~')
  )
  const methods = lines.slice(1).filter(line => 
    line.includes('()') || line.includes(':')
  )
  
  // 计算最小高度
  const lineHeight = 20
  const headerHeight = Math.max(30, lineHeight + 10)
  const attrHeight = Math.max(30, attributes.length * lineHeight + 10)
  const methodHeight = Math.max(30, methods.length * lineHeight + 10)
  const minHeight = headerHeight + attrHeight + methodHeight
  
  // 使用自适应高度
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
      },
      label: {
        ...base.attrs.label,
        text: className,
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refY: headerHeight / 2,
      },
    },
  })
}

export const renderUmlInterface = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: 5, ry: 5, ...MERMAID_SHADOW })
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        text: config.text ? `«interface»\n${config.text}` : '«interface»',
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
        strokeDasharray: '4,4',
        fill: 'none',
        stroke: '#666666',
        strokeWidth: 1,
      },
    },
  })
}

export const renderUmlActivation = (config: ShapeRenderConfig): Node => {
  return new Shape.Rect({
    ...createBaseConfig(config, MERMAID_SHADOW),
  })
}

export const renderUmlFragment = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: 4, ry: 4, ...MERMAID_SHADOW })
  return new Shape.Rect({
    ...base,
  })
}

export const renderUmlSwimlanePool = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlSwimlanePoolPath(config.width, config.height, 3, 80)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderUmlSwimlaneHorizontal = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlSwimlaneHorizontalPath(config.width, config.height, 80)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
    },
  })
}

export const renderUmlSwimlaneVertical = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlSwimlaneVerticalPath(config.width, config.height, 40)
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
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
      },
    },
  })
}

export const renderUmlSwimlane = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const headerWidth = 80
  const width = config.width
  const height = config.height
  const path = `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z M ${headerWidth} 0 L ${headerWidth} ${height}`
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
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
}
