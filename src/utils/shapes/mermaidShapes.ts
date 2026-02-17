import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig, ShapeStyleConfig } from './types'
import {
  createCylinderPath,
  createParallelogramPoints,
  createTrapezoidPoints,
  createDoubleEllipsePath,
} from '../shapeMath'

const MERMAID_SHADOW: ShapeStyleConfig = {
  shadowBlur: 3,
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowOffsetX: 2,
  shadowOffsetY: 2,
}

const MERMAID_RX = 5
const MERMAID_RY = 5

export const renderStadium = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const height = config.height
  const width = config.width
  const radius = height / 2

  const path = `
    M${radius},0
    L${width - radius},0
    A${radius},${radius} 0 0,1 ${width - radius},${height}
    L${radius},${height}
    A${radius},${radius} 0 0,1 ${radius},0
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#e6fffb',
        stroke: config.stroke || '#13c2c2',
      },
    },
  })
}

export const renderCylinder = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const path = createCylinderPath(config.width, config.height, 0.15)

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#f6ffed',
        stroke: config.stroke || '#52c41a',
      },
    },
  })
}

export const renderHexagon = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const cornerWidth = width * 0.15

  const path = `
    M${cornerWidth},0
    L${width - cornerWidth},0
    L${width},${height / 2}
    L${width - cornerWidth},${height}
    L${cornerWidth},${height}
    L0,${height / 2}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#fff2e8',
        stroke: config.stroke || '#fa8c16',
      },
    },
  })
}

export const renderParallelogramLeft = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const points = createParallelogramPoints(config.width, config.height, 0.15)

  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        points,
        fill: config.fill || '#f9f0ff',
        stroke: config.stroke || '#722ed1',
      },
    },
  })
}

export const renderParallelogramRight = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const skew = width * 0.15

  const points = `0,0 ${width - skew},0 ${width},${height} ${skew},${height}`

  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        points,
        fill: config.fill || '#f9f0ff',
        stroke: config.stroke || '#722ed1',
      },
    },
  })
}

export const renderTrapezoidTop = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const points = createTrapezoidPoints(config.width, config.height, 0.7)

  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        points,
        fill: config.fill || '#fff0f6',
        stroke: config.stroke || '#eb2f96',
      },
    },
  })
}

export const renderTrapezoidBottom = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const topWidth = width * 0.7
  const leftOffset = (width - topWidth) / 2

  const points = `${leftOffset},0 ${leftOffset + topWidth},0 ${width},${height} 0,${height}`

  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        points,
        fill: config.fill || '#fff0f6',
        stroke: config.stroke || '#eb2f96',
      },
    },
  })
}

export const renderSubroutine = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: MERMAID_RX, ry: MERMAID_RY, ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const borderOffset = Math.min(width, height) * 0.06

  const path = `
    M0,0 L${width},0 L${width},${height} L0,${height} Z
    M${borderOffset},${borderOffset} L${width - borderOffset},${borderOffset}
    L${width - borderOffset},${height - borderOffset} L${borderOffset},${height - borderOffset} Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fillRule: 'evenodd',
        fill: config.fill || '#e6f7ff',
        stroke: config.stroke || '#1890ff',
      },
    },
  })
}

export const renderDoubleCircle = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const path = createDoubleEllipsePath(config.width, config.height, 0.18)

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#fff7e6',
        stroke: config.stroke || '#fa8c16',
      },
    },
  })
}

export const renderAsymmetric = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const arrowWidth = width * 0.2

  const path = `
    M${arrowWidth},0
    L${width},0
    L${width},${height}
    L${arrowWidth},${height}
    L0,${height / 2}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#f5f5f5',
        stroke: config.stroke || '#434343',
      },
    },
  })
}

export const renderCircle = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const cx = config.width / 2
  const cy = config.height / 2
  const r = Math.min(config.width, config.height) / 2 - 2

  const path = `
    M${cx},${cy - r}
    A${r},${r} 0 1,1 ${cx},${cy + r}
    A${r},${r} 0 1,1 ${cx},${cy - r}
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#f0f5ff',
        stroke: config.stroke || '#2f54eb',
      },
    },
  })
}

export const renderPieSlice = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const cx = config.centerX ?? config.x + config.width / 2
  const cy = config.centerY ?? config.y + config.height / 2
  const r = config.radius ?? Math.min(config.width, config.height) / 2 - 2
  const startAngle = config.startAngle ?? 0
  const endAngle = config.endAngle ?? Math.PI / 2

  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)

  const angleDiff = endAngle - startAngle
  const largeArcFlag = angleDiff > Math.PI ? 1 : 0

  const path = `
    M${cx},${cy}
    L${x1},${y1}
    A${r},${r} 0 ${largeArcFlag},1 ${x2},${y2}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#1890ff',
        stroke: config.stroke || '#fff',
        strokeWidth: config.strokeWidth ?? 1,
      },
    },
  })
}

export const renderRhombus = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height

  const points = `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`

  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        points,
        fill: config.fill || '#fff7e6',
        stroke: config.stroke || '#fa8c16',
      },
    },
  })
}

export const renderMermaidAction = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: 5, ry: 5, ...MERMAID_SHADOW })
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#fff4dd',
        stroke: config.stroke || '#d4b46a',
        rx: 5,
        ry: 5,
      },
    },
  })
}

export const renderCloud = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const r = height * 0.25

  const path = `
    M${r * 2},${height - r}
    Q0,${height - r} ${r},${height - r * 2}
    Q0,${height * 0.3} ${r * 2},${r}
    Q${width * 0.3},0 ${width * 0.5},${r}
    Q${width * 0.7},0 ${width - r * 2},${r}
    Q${width},${height * 0.3} ${width - r},${height - r * 2}
    Q${width},${height - r} ${width - r * 2},${height - r}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#f0f5ff',
        stroke: config.stroke || '#2f54eb',
      },
    },
  })
}

export const renderBanner = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const notch = height * 0.15

  const path = `
    M0,0
    L${width},0
    L${width},${height - notch}
    L${width / 2},${height}
    L0,${height - notch}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#fff4dd',
        stroke: config.stroke || '#d4b46a',
      },
    },
  })
}

export const renderDocument = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const waveHeight = height * 0.1

  const path = `
    M0,0
    L${width},0
    L${width},${height - waveHeight * 2}
    Q${width * 0.75},${height - waveHeight} ${width * 0.5},${height - waveHeight * 2}
    Q${width * 0.25},${height - waveHeight * 3} 0,${height - waveHeight * 2}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#fffbe6',
        stroke: config.stroke || '#fadb14',
      },
    },
  })
}

export const renderDelay = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const radius = height * 0.3

  const path = `
    M${radius},0
    L${width - radius},0
    Q${width},0 ${width},${radius}
    L${width},${height - radius}
    Q${width},${height} ${width - radius},${height}
    L${radius},${height}
    Q0,${height} 0,${height - radius}
    L0,${radius}
    Q0,0 ${radius},0
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#f6ffed',
        stroke: config.stroke || '#52c41a',
      },
    },
  })
}

export const renderLightning = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height

  const path = `
    M${width * 0.4},0
    L${width * 0.7},0
    L${width * 0.5},${height * 0.4}
    L${width * 0.8},${height * 0.4}
    L${width * 0.3},${height}
    L${width * 0.45},${height * 0.55}
    L${width * 0.15},${height * 0.55}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#fff7e6',
        stroke: config.stroke || '#fa8c16',
      },
    },
  })
}

export const renderLeanLeft = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const skew = width * 0.2

  const path = `
    M${skew},0
    L${width},0
    L${width - skew},${height}
    L0,${height}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#f9f0ff',
        stroke: config.stroke || '#722ed1',
      },
    },
  })
}

export const renderLeanRight = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const skew = width * 0.2

  const path = `
    M0,0
    L${width - skew},0
    L${width},${height}
    L${skew},${height}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#f9f0ff',
        stroke: config.stroke || '#722ed1',
      },
    },
  })
}

export const renderDividedRect = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: MERMAID_RX, ry: MERMAID_RY, ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const dividerY = height * 0.25

  const path = `
    M0,0 L${width},0 L${width},${height} L0,${height} Z
    M0,${dividerY} L${width},${dividerY}
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#e6f7ff',
        stroke: config.stroke || '#1890ff',
      },
    },
  })
}

export const renderLinedDocument = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const cornerSize = Math.min(width, height) * 0.15

  const path = `
    M0,0
    L${width - cornerSize},0
    L${width},${cornerSize}
    L${width},${height}
    L0,${height}
    Z
    M${width - cornerSize},0
    L${width - cornerSize},${cornerSize}
    L${width},${cornerSize}
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#fffbe6',
        stroke: config.stroke || '#fadb14',
      },
    },
  })
}

export const renderStadiumWithEnd = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const radius = height / 2
  const endWidth = width * 0.1

  const path = `
    M${radius},0
    L${width - radius - endWidth},0
    A${radius},${radius} 0 0,1 ${width - radius - endWidth},${height}
    L${radius},${height}
    A${radius},${radius} 0 0,1 ${radius},0
    Z
    M${width - endWidth},${height * 0.2}
    L${width - endWidth},${height * 0.8}
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#e6fffb',
        stroke: config.stroke || '#13c2c2',
      },
    },
  })
}

export const renderLabelRect = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: MERMAID_RX, ry: MERMAID_RY, ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const labelHeight = height * 0.2

  const path = `
    M0,${labelHeight}
    L${width * 0.1},0
    L${width * 0.9},0
    L${width},${labelHeight}
    L${width},${height}
    L0,${height}
    Z
  `

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: path,
        fill: config.fill || '#f0f5ff',
        stroke: config.stroke || '#2f54eb',
      },
    },
  })
}

export const mermaidRenderers = {
  'mermaid-stadium': renderStadium,
  'mermaid-cylinder': renderCylinder,
  'mermaid-hexagon': renderHexagon,
  'mermaid-parallelogram-left': renderParallelogramLeft,
  'mermaid-parallelogram-right': renderParallelogramRight,
  'mermaid-trapezoid-top': renderTrapezoidTop,
  'mermaid-trapezoid-bottom': renderTrapezoidBottom,
  'mermaid-subroutine': renderSubroutine,
  'mermaid-double-circle': renderDoubleCircle,
  'mermaid-asymmetric': renderAsymmetric,
  'mermaid-circle': renderCircle,
  'mermaid-pie-slice': renderPieSlice,
  'mermaid-rhombus': renderRhombus,
  'mermaid-cloud': renderCloud,
  'mermaid-banner': renderBanner,
  'mermaid-document': renderDocument,
  'mermaid-delay': renderDelay,
  'mermaid-lightning': renderLightning,
  'mermaid-lean-left': renderLeanLeft,
  'mermaid-lean-right': renderLeanRight,
  'mermaid-divided-rect': renderDividedRect,
  'mermaid-lined-document': renderLinedDocument,
  'mermaid-stadium-end': renderStadiumWithEnd,
  'mermaid-label-rect': renderLabelRect,
  'uml-action': renderMermaidAction,
}
