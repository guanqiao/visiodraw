import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig } from './types'
import { 
  createCylinderPath,
  createDocumentPath,
  createParallelogramPoints,
  createTrapezoidPoints,
  createArrowPath,
} from '../shapeMath'
import { renderRectangle, renderDiamond, renderHexagon } from './base'

export const renderProcess = renderRectangle

export const renderDecision = renderDiamond

export const renderStartEnd = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        rx: config.height / 2,
        ry: config.height / 2,
      },
    },
  })
}

export const renderInputOutput = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createParallelogramPoints(config.width, config.height, 0.2)
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

export const renderDocument = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createDocumentPath(config.width, config.height, 0.12, 2)
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

export const renderDatabase = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createCylinderPath(config.width, config.height, 0.15)
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

export const renderPreparation = renderHexagon

export const renderManualInput = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createTrapezoidPoints(config.width, config.height, 0.7)
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

export const renderDisplay = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const skew = config.width * 0.15
  const points = `${skew},0 ${config.width},0 ${config.width - skew},${config.height} 0,${config.height}`
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

export const renderOffPage = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createArrowPath(config.width, config.height, 0.3)
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

export const flowchartRenderers = {
  process: renderProcess,
  decision: renderDecision,
  'start-end': renderStartEnd,
  'input-output': renderInputOutput,
  document: renderDocument,
  database: renderDatabase,
  preparation: renderPreparation,
  'manual-input': renderManualInput,
  display: renderDisplay,
  'off-page': renderOffPage,
}
