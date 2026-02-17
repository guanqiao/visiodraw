import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig } from './types'
import {
  createBpmnEventPath,
  createBpmnGatewayPath,
  createBpmnActivityPath,
  createBpmnUserTaskPath,
  createBpmnServiceTaskPath,
  createBpmnPoolPath,
  createBpmnLanePath,
} from '../shapeMath'

export const renderBpmnStartEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnEventPath(config.width, config.height, 'start')
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

export const renderBpmnEndEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnEventPath(config.width, config.height, 'end')
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
        strokeWidth: 3,
      },
    },
  })
}

export const renderBpmnIntermediateEvent = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnEventPath(config.width, config.height, 'intermediate')
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

export const renderBpmnTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnActivityPath(config.width, config.height)
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

export const renderBpmnUserTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnUserTaskPath(config.width, config.height)
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

export const renderBpmnServiceTask = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnServiceTaskPath(config.width, config.height)
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

export const renderBpmnExclusiveGateway = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createBpmnGatewayPath(config.width, config.height)
  const cx = config.width / 2
  const cy = config.height / 2
  const crossSize = Math.min(config.width, config.height) * 0.25
  const path = `M${cx - crossSize},${cy - crossSize} L${cx + crossSize},${cy + crossSize} M${cx + crossSize},${cy - crossSize} L${cx - crossSize},${cy + crossSize}`
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${points} M${path}`,
      },
    },
  })
}

export const renderBpmnParallelGateway = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createBpmnGatewayPath(config.width, config.height)
  const cx = config.width / 2
  const cy = config.height / 2
  const lineLen = Math.min(config.width, config.height) * 0.25
  const path = `M${cx},${cy - lineLen} L${cx},${cy + lineLen} M${cx - lineLen},${cy} L${cx + lineLen},${cy}`
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${points} M${path}`,
      },
    },
  })
}

export const renderBpmnInclusiveGateway = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const points = createBpmnGatewayPath(config.width, config.height)
  const cx = config.width / 2
  const cy = config.height / 2
  const circleR = Math.min(config.width, config.height) * 0.15
  const path = `M${cx},${cy - circleR} A${circleR},${circleR} 0 1,1 ${cx},${cy + circleR} A${circleR},${circleR} 0 1,1 ${cx},${cy - circleR}`
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M${points} M${path}`,
      },
    },
  })
}

export const renderBpmnPool = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnPoolPath(config.width, config.height)
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

export const renderBpmnLane = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const path = createBpmnLanePath(config.width, config.height)
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

export const bpmnRenderers = {
  'bpmn-start-event': renderBpmnStartEvent,
  'bpmn-end-event': renderBpmnEndEvent,
  'bpmn-intermediate-event': renderBpmnIntermediateEvent,
  'bpmn-task': renderBpmnTask,
  'bpmn-user-task': renderBpmnUserTask,
  'bpmn-service-task': renderBpmnServiceTask,
  'bpmn-exclusive-gateway': renderBpmnExclusiveGateway,
  'bpmn-parallel-gateway': renderBpmnParallelGateway,
  'bpmn-inclusive-gateway': renderBpmnInclusiveGateway,
  'bpmn-pool': renderBpmnPool,
  'bpmn-lane': renderBpmnLane,
}
