import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig, ShapeStyleConfig } from './types'
import { calculatePolygonPoints, calculateStarPoints, calculateCrossPoints } from '../shapeMath'

// Mermaid 默认圆角半径
const MERMAID_RX = 5
const MERMAID_RY = 5

// Mermaid 默认阴影
const MERMAID_SHADOW: ShapeStyleConfig = {
  shadowBlur: 3,
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowOffsetX: 2,
  shadowOffsetY: 2,
}

export const renderRectangle = (config: ShapeRenderConfig): Node => {
  return new Shape.Rect({
    ...createBaseConfig(config, {
      rx: MERMAID_RX,
      ry: MERMAID_RY,
      ...MERMAID_SHADOW,
    }),
  })
}

export const renderRoundedRectangle = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, {
    rx: config.rx || 15,
    ry: config.ry || 15,
    ...MERMAID_SHADOW,
  })
  return new Shape.Rect({
    ...base,
  })
}

export const renderCircle = (config: ShapeRenderConfig): Node => {
  return new Shape.Circle({
    ...createBaseConfig(config, MERMAID_SHADOW),
  })
}

export const renderEllipse = (config: ShapeRenderConfig): Node => {
  return new Shape.Ellipse({
    ...createBaseConfig(config, MERMAID_SHADOW),
  })
}

export const renderTriangle = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, MERMAID_SHADOW)
  const points = calculatePolygonPoints(3, config.width, config.height)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderDiamond = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, MERMAID_SHADOW)
  const points = calculatePolygonPoints(4, config.width, config.height)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderPentagon = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, MERMAID_SHADOW)
  const points = calculatePolygonPoints(5, config.width, config.height)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderHexagon = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, MERMAID_SHADOW)
  const points = calculatePolygonPoints(6, config.width, config.height, 0)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderStar = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, MERMAID_SHADOW)
  const cx = config.width / 2
  const cy = config.height / 2
  const outerR = Math.min(config.width, config.height) / 2
  const innerR = outerR * 0.4
  const points = calculateStarPoints(outerR, innerR, 5, cx, cy)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const renderCross = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, MERMAID_SHADOW)
  const points = calculateCrossPoints(config.width, config.height)
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
      },
    },
  })
}

export const baseRenderers = {
  rectangle: renderRectangle,
  'rounded-rectangle': renderRoundedRectangle,
  circle: renderCircle,
  ellipse: renderEllipse,
  triangle: renderTriangle,
  diamond: renderDiamond,
  pentagon: renderPentagon,
  hexagon: renderHexagon,
  star: renderStar,
  cross: renderCross,
}
