import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig, ShapeStyleConfig } from './types'
import {
  createCylinderPath,
  createParallelogramPoints,
  createTrapezoidPoints,
  createDoubleEllipsePath,
} from '../shapeMath'

// Mermaid 默认阴影
const MERMAID_SHADOW: ShapeStyleConfig = {
  shadowBlur: 3,
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowOffsetX: 2,
  shadowOffsetY: 2,
}

// Mermaid 默认圆角
const MERMAID_RX = 5
const MERMAID_RY = 5

/**
 * Stadium 形状 - 跑道形（两端半圆）
 * Mermaid语法: ([text])
 */
export const renderStadium = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const height = config.height
  const width = config.width
  const radius = height / 2

  // 创建跑道形路径：矩形 + 两端半圆
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
        d: path,
      },
    },
  })
}

/**
 * Cylinder 形状 - 圆柱形/数据库
 * Mermaid语法: [(text)]
 */
export const renderCylinder = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const path = createCylinderPath(config.width, config.height, 0.2)

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

/**
 * Hexagon 形状 - 六边形
 * Mermaid语法: {{text}}
 */
export const renderHexagon = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const cornerWidth = width * 0.2

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
        d: path,
      },
    },
  })
}

/**
 * Parallelogram 形状 - 平行四边形（左斜）
 * Mermaid语法: [/text/]
 */
export const renderParallelogramLeft = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const points = createParallelogramPoints(config.width, config.height, 0.2)

  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        points,
      },
    },
  })
}

/**
 * Parallelogram 形状 - 平行四边形（右斜）
 * Mermaid语法: [\text\]
 */
export const renderParallelogramRight = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const skew = width * 0.2

  // 右斜平行四边形
  const points = `0,0 ${width - skew},0 ${width},${height} ${skew},${height}`

  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        points,
      },
    },
  })
}

/**
 * Trapezoid 形状 - 梯形（上宽下窄）
 * Mermaid语法: [/\text\]
 */
export const renderTrapezoidTop = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const points = createTrapezoidPoints(config.width, config.height, 0.6)

  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        points,
      },
    },
  })
}

/**
 * Trapezoid 形状 - 梯形（上窄下宽）
 * Mermaid语法: [\text/]
 */
export const renderTrapezoidBottom = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const topWidth = width * 0.6
  const leftOffset = (width - topWidth) / 2

  // 上窄下宽的梯形
  const points = `${leftOffset},0 ${leftOffset + topWidth},0 ${width},${height} 0,${height}`

  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        points,
      },
    },
  })
}

/**
 * Subroutine 形状 - 子程序（双边框矩形）
 * Mermaid语法: [[text]]
 */
export const renderSubroutine = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { rx: MERMAID_RX, ry: MERMAID_RY, ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const borderOffset = Math.min(width, height) * 0.08

  // 创建双边框路径
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
        d: path,
        fillRule: 'evenodd',
      },
    },
  })
}

/**
 * Double Circle 形状 - 双圆
 * Mermaid语法: (((text)))
 */
export const renderDoubleCircle = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const path = createDoubleEllipsePath(config.width, config.height, 0.2)

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

/**
 * Asymmetric 形状 - 不对称形状
 * Mermaid语法: >text]
 */
export const renderAsymmetric = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, { ...MERMAID_SHADOW })
  const width = config.width
  const height = config.height
  const arrowWidth = width * 0.25

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
        d: path,
      },
    },
  })
}

/**
 * Circle 形状 - 圆形
 * Mermaid语法: ((text))
 */
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
        d: path,
      },
    },
  })
}

/**
 * Rhombus 形状 - 菱形（决策）
 * Mermaid语法: {text}
 */
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
      },
    },
  })
}

// Mermaid 形状渲染器映射
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
  'mermaid-rhombus': renderRhombus,
}
