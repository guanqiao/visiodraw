import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig, ShapeStyleConfig, GRADIENT_PRESETS } from './types'
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
        refD: path,
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
        refD: `M0,0 L${lollipopX},0 L${lollipopX},${config.height} L0,${config.height} Z ${lollipopPath}`,
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
        refD: path,
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
        refD: path,
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
        refD: path,
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
        refD: path,
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
        refD: path,
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
        refD: `M${centerX},0 L${centerX},${height}`,
        strokeDasharray: '4,4',
        fill: 'none',
        stroke: config.stroke || '#8c8c8c',
        strokeWidth: config.strokeWidth || 1.5,
        strokeLinecap: 'round',
      },
    },
  })
}

export const renderUmlActivation = (config: ShapeRenderConfig): Node => {
  const gradientFill = {
    type: 'linearGradient',
    stops: [
      { offset: '0%', color: '#40a9ff' },
      { offset: '100%', color: '#1890ff' },
    ],
  }
  
  return new Shape.Rect({
    ...createBaseConfig(config, { 
      rx: 3, 
      ry: 3,
      shadowBlur: 4,
      shadowColor: 'rgba(24, 144, 255, 0.3)',
      shadowOffsetX: 1,
      shadowOffsetY: 1,
    }),
    attrs: {
      ...createBaseConfig(config).attrs,
      body: {
        ...createBaseConfig(config).attrs.body,
        fill: config.fill || gradientFill,
        stroke: config.stroke || '#096dd9',
        strokeWidth: config.strokeWidth || 1.5,
        rx: 3,
        ry: 3,
      },
    },
  })
}

export const renderUmlFragment = (config: ShapeRenderConfig): Node => {
  const foldSize = Math.min(config.width, config.height) * 0.1
  const headerHeight = Math.min(config.height * 0.18, 28)
  const width = config.width
  const height = config.height
  
  // 更专业的折叠角路径
  const fragmentPath = `
    M0,${headerHeight} 
    L0,0 
    L${width - foldSize},0 
    L${width},${foldSize} 
    L${width},${height} 
    L0,${height} 
    Z
    M${width - foldSize},0 
    L${width - foldSize},${foldSize} 
    L${width},${foldSize}
    M0,${headerHeight} 
    L${width},${headerHeight}
  `

  const base = createBaseConfig(config, { 
    rx: 4, 
    ry: 4,
    shadowBlur: 6,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffsetX: 2,
    shadowOffsetY: 2,
  })

  return new Shape.Path({
    ...base,
    markup: [
      {
        tagName: 'path',
        selector: 'body',
      },
      {
        tagName: 'rect',
        selector: 'header',
      },
      {
        tagName: 'text',
        selector: 'label',
      },
    ],
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: fragmentPath,
        fill: config.fill || '#fafafa',
        fillOpacity: config.fillOpacity || 0.6,
        stroke: config.stroke || '#595959',
        strokeWidth: config.strokeWidth || 1.5,
      },
      header: {
        x: 0,
        y: 0,
        width: width,
        height: headerHeight,
        fill: config.stroke || '#595959',
        fillOpacity: 0.12,
        stroke: 'none',
      },
      label: {
        ...base.attrs.label,
        text: config.text || 'alt',
        textVerticalAnchor: 'middle',
        refY: headerHeight / 2,
        refX: 12,
        textAnchor: 'start',
        fontSize: 13,
        fontWeight: 700,
        fill: config.stroke || '#434343',
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
        refD: path,
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
        refD: path,
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
        refD: path,
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
        refD: path,
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
        refD: path,
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
        refD: path,
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
        refD: path,
        fillRule: 'evenodd',
        fill: '#f5222d',
        stroke: '#f5222d',
      },
    },
  })
}

export const renderUmlClassGradient = (config: ShapeRenderConfig): Node => {
  const gradientKey = config.gradient as string || 'umlClass'
  const gradient = GRADIENT_PRESETS[gradientKey] || GRADIENT_PRESETS.umlClass
  const styleConfig: ShapeStyleConfig = { ...MERMAID_SHADOW, gradient }
  const base = createBaseConfig(config, styleConfig)
  
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
        fillRule: 'evenodd',
      },
    },
  })
}

export const renderUmlPackageGradient = (config: ShapeRenderConfig): Node => {
  const gradientKey = config.gradient as string || 'blue'
  const gradient = GRADIENT_PRESETS[gradientKey] || GRADIENT_PRESETS.blue
  const styleConfig: ShapeStyleConfig = { ...MERMAID_SHADOW, gradient }
  const base = createBaseConfig(config, styleConfig)
  const path = createUmlPackagePath(config.width, config.height)
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fillRule: 'evenodd',
      },
    },
  })
}

export const renderUmlNoteGradient = (config: ShapeRenderConfig): Node => {
  const gradientKey = config.gradient as string || 'orange'
  const gradient = GRADIENT_PRESETS[gradientKey] || GRADIENT_PRESETS.orange
  const styleConfig: ShapeStyleConfig = { ...MERMAID_SHADOW, gradient }
  const base = createBaseConfig(config, styleConfig)
  const path = createUmlNotePath(config.width, config.height)
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
      },
    },
  })
}

// ==================== 序列图专用渲染器 (Sequence Diagram) ====================

/**
 * 序列图标准参与者 - 圆角矩形带渐变和阴影
 */
export const renderUmlParticipant = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { 
    rx: 6, 
    ry: 6, 
    gradient: GRADIENT_PRESETS.blue,
    ...MERMAID_SHADOW 
  })
  
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#f0f5ff',
        stroke: config.stroke || '#2f54eb',
        strokeWidth: config.strokeWidth || 2,
        rx: 6,
        ry: 6,
      },
      label: {
        ...base.attrs.label,
        text: config.text || 'Participant',
        fontSize: config.fontSize || 13,
        fontWeight: config.fontWeight || 600,
        fill: config.color || '#1d39c4',
      },
    },
  })
}

/**
 * 序列图 Actor 参与者 - 优化的人形图标
 */
export const renderUmlActorSequence = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createUmlActorPath(config.width, config.height * 0.7)
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: 'none',
        stroke: config.stroke || '#fa8c16',
        strokeWidth: 2.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      label: {
        ...base.attrs.label,
        text: config.text || 'Actor',
        refY: config.height * 0.85,
        fontSize: 12,
        fontWeight: 600,
        fill: config.color || '#d46b08',
      },
    },
  })
}

/**
 * 序列图数据库参与者 - 圆柱形数据库图标
 */
export const renderUmlDatabaseParticipant = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, {
    gradient: GRADIENT_PRESETS.green,
    ...MERMAID_SHADOW
  })

  const width = config.width
  const height = config.height
  const ellipseHeight = height * 0.18  // 增加椭圆高度
  const bodyTop = ellipseHeight

  // 构建更专业的数据库圆柱形路径
  // 1. 主体轮廓（左侧、底部、右侧）
  const bodyPath = `
    M0,${bodyTop}
    L0,${height - ellipseHeight}
    Q${width / 2},${height} ${width},${height - ellipseHeight}
    L${width},${bodyTop}
  `

  // 2. 顶部椭圆（突出效果）
  const topEllipse = `
    M0,${bodyTop}
    Q${width / 2},${-ellipseHeight * 0.5} ${width},${bodyTop}
    Q${width / 2},${ellipseHeight * 2.5} 0,${bodyTop}
  `

  // 3. 中间装饰线（表示数据库层级）
  const midLine1Y = bodyTop + (height - ellipseHeight * 2) * 0.33
  const midLine2Y = bodyTop + (height - ellipseHeight * 2) * 0.66

  const midLine1 = `
    M${width * 0.1},${midLine1Y}
    Q${width / 2},${midLine1Y + ellipseHeight * 0.3} ${width * 0.9},${midLine1Y}
  `

  const midLine2 = `
    M${width * 0.1},${midLine2Y}
    Q${width / 2},${midLine2Y + ellipseHeight * 0.3} ${width * 0.9},${midLine2Y}
  `

  // 组合路径
  const dbPath = `${bodyPath} ${topEllipse} ${midLine1} ${midLine2}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: dbPath,
        fill: config.fill || '#f6ffed',
        stroke: config.stroke || '#52c41a',
        strokeWidth: config.strokeWidth || 2,
        fillRule: 'evenodd',
      },
      label: {
        ...base.attrs.label,
        text: config.text || 'Database',
        refY: height * 0.58,
        fontSize: 12,
        fontWeight: 600,
        fill: config.color || '#389e0d',
      },
    },
  })
}

/**
 * 序列图引用框渲染器 - 带 ref: 标签头
 */
export const renderUmlReference = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, {
    rx: 4,
    ry: 4,
    shadowBlur: 4,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffsetX: 1,
    shadowOffsetY: 1,
  })

  const width = config.width
  const height = config.height
  const headerHeight = Math.min(height * 0.25, 30)

  return new Shape.Rect({
    ...base,
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'rect',
        selector: 'header',
      },
      {
        tagName: 'text',
        selector: 'headerLabel',
      },
      {
        tagName: 'text',
        selector: 'label',
      },
    ],
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#f0f5ff',
        fillOpacity: config.fillOpacity || 0.3,
        stroke: config.stroke || '#2f54eb',
        strokeWidth: config.strokeWidth || 1.5,
        strokeDasharray: '5,3',
        rx: 4,
        ry: 4,
      },
      header: {
        x: 0,
        y: 0,
        width: width,
        height: headerHeight,
        fill: config.stroke || '#2f54eb',
        fillOpacity: 0.15,
        stroke: 'none',
      },
      headerLabel: {
        text: 'ref:',
        x: 10,
        y: headerHeight / 2,
        textVerticalAnchor: 'middle',
        textAnchor: 'start',
        fontSize: 12,
        fontWeight: 700,
        fill: config.stroke || '#2f54eb',
      },
      label: {
        ...base.attrs.label,
        text: config.text || '',
        refY: headerHeight + (height - headerHeight) / 2,
        fontSize: 11,
        fill: config.color || '#434343',
      },
    },
  })
}

/**
 * 销毁标记渲染器 - X形标记
 */
export const renderUmlDestroyMarker = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const width = config.width
  const height = config.height

  // X形路径
  const xPath = `M0,0 L${width},${height} M${width},0 L0,${height}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: xPath,
        fill: 'none',
        stroke: config.stroke || '#f5222d',
        strokeWidth: config.strokeWidth || 2.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
    },
  })
}

/**
 * 创建标记渲染器 - 绿色方块
 */
export const renderUmlCreateMarker = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#52c41a',
        stroke: config.stroke || '#237804',
        strokeWidth: config.strokeWidth || 1.5,
        rx: 2,
        ry: 2,
      },
    },
  })
}

/**
 * 创建标记标签渲染器
 */
export const renderUmlCreateLabel = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: 'transparent',
        stroke: 'transparent',
      },
      label: {
        ...base.attrs.label,
        text: config.text || '«create»',
        fontSize: config.fontSize || 10,
        fontWeight: config.fontWeight || 600,
        fill: config.color || '#52c41a',
      },
    },
  })
}

/**
 * 生命线顶部标记渲染器 - 实心圆点
 */
export const renderUmlLifelineMarker = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#8c8c8c',
        stroke: 'transparent',
        rx: config.width / 2,
        ry: config.height / 2,
      },
    },
  })
}

/**
 * 生命线底部终止标记渲染器 - X形
 */
export const renderUmlLifelineEnd = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const width = config.width
  const height = config.height

  // X形路径
  const xPath = `M0,0 L${width},${height} M${width},0 L0,${height}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: xPath,
        fill: 'none',
        stroke: config.stroke || '#8c8c8c',
        strokeWidth: config.strokeWidth || 1.5,
        strokeLinecap: 'round',
      },
    },
  })
}

/**
 * 消息连接点标记渲染器 - 小圆点
 */
export const renderUmlMessageMarker = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#333333',
        stroke: 'transparent',
        rx: config.width / 2,
        ry: config.height / 2,
      },
    },
  })
}

/**
 * Note连接线渲染器 - 虚线
 */
export const renderUmlNoteConnection = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const width = config.width
  const height = config.height

  // 简单的斜线路径
  const linePath = `M0,0 L${width},${height}`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: linePath,
        fill: 'none',
        stroke: config.stroke || '#ffd666',
        strokeWidth: config.strokeWidth || 1,
        strokeDasharray: config.dashArray || '3,3',
      },
    },
  })
}

/**
 * 锚点节点渲染器 - 1x1像素透明节点
 * 用于序列图消息边的精确连接
 */
export const renderUmlAnchor = (config: ShapeRenderConfig): Node => {
  return new Shape.Rect({
    id: config.id,
    x: config.x,
    y: config.y,
    width: config.width || 1,
    height: config.height || 1,
    attrs: {
      body: {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
      },
    },
    ports: {
      groups: {
        center: {
          position: {
            name: 'absolute',
            args: { x: 0.5, y: 0.5 },
          },
          attrs: {
            circle: {
              r: 1,
              magnet: true,
              fill: 'transparent',
              stroke: 'transparent',
            },
          },
        },
      },
      items: [
        { id: 'center', group: 'center' },
      ],
    },
    data: { fromStore: true, shapeType: 'uml-anchor' },
  })
}

export const umlRenderers = {
  'uml-class': renderUmlClass,
  'uml-class-gradient': renderUmlClassGradient,
  'uml-interface': renderUmlInterface,
  'uml-actor': renderUmlActor,
  'uml-usecase': renderUmlUseCase,
  'uml-package': renderUmlPackage,
  'uml-package-gradient': renderUmlPackageGradient,
  'uml-component': renderUmlComponent,
  'uml-node': renderUmlNode,
  'uml-note': renderUmlNote,
  'uml-note-gradient': renderUmlNoteGradient,
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
  'uml-join': renderUmlActivation,
  'uml-state': renderUmlState,
  'uml-action': renderUmlState,
  'uml-initial-state': renderUmlInitialState,
  'uml-final-state': renderUmlFinalState,
  // 序列图专用渲染器
  'uml-participant': renderUmlParticipant,
  'uml-actor-sequence': renderUmlActorSequence,
  'uml-database-sequence': renderUmlDatabaseParticipant,
  'uml-database-participant': renderUmlDatabaseParticipant,
  'uml-reference': renderUmlReference,
  'uml-destroy-marker': renderUmlDestroyMarker,
  'uml-create-marker': renderUmlCreateMarker,
  'uml-create-label': renderUmlCreateLabel,
  'uml-lifeline-marker': renderUmlLifelineMarker,
  'uml-lifeline-end': renderUmlLifelineEnd,
  'uml-message-marker': renderUmlMessageMarker,
  'uml-note-connection': renderUmlNoteConnection,
  'uml-anchor': renderUmlAnchor,
}
