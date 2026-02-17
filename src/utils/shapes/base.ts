import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig } from './types'
import { calculatePolygonPoints, calculateStarPoints, calculateCrossPoints } from '../shapeMath'

export const renderRectangle = (config: ShapeRenderConfig): Node => {
  return new Shape.Rect({
    ...createBaseConfig(config),
  })
}

export const renderRoundedRectangle = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        rx: config.rx || 10,
        ry: config.ry || 10,
      },
    },
  })
}

export const renderCircle = (config: ShapeRenderConfig): Node => {
  return new Shape.Circle({
    ...createBaseConfig(config),
  })
}

export const renderEllipse = (config: ShapeRenderConfig): Node => {
  return new Shape.Ellipse({
    ...createBaseConfig(config),
  })
}

export const renderTriangle = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
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
  const base = createBaseConfig(config)
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
  const base = createBaseConfig(config)
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
  const base = createBaseConfig(config)
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
  const base = createBaseConfig(config)
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
  const base = createBaseConfig(config)
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
