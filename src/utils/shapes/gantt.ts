import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig, ShapeStyleConfig } from './types'
import { calculatePolygonPoints } from '../shapeMath'

const MERMAID_SHADOW: ShapeStyleConfig = {
  shadowBlur: 3,
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowOffsetX: 2,
  shadowOffsetY: 2,
}

export const renderGanttTask = (config: ShapeRenderConfig): Node => {
  const cornerRadius = (config as any).cornerRadius || 4
  const base = createBaseConfig(config, {
    rx: cornerRadius,
    ry: cornerRadius,
    ...MERMAID_SHADOW,
  })

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#f5f5f5',
        stroke: config.stroke || '#d9d9d9',
        strokeWidth: config.strokeWidth || 1,
        rx: cornerRadius,
        ry: cornerRadius,
      },
      label: {
        ...base.attrs.label,
        text: config.text || '',
        fontSize: (config as any).fontSize || 12,
        fill: (config as any).color || '#262626',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
      },
    },
  })
}

export const renderGanttSection = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, {
    rx: 4,
    ry: 4,
    ...MERMAID_SHADOW,
  })

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#f0f5ff',
        stroke: config.stroke || '#2f54eb',
        strokeWidth: config.strokeWidth || 1,
        rx: 4,
        ry: 4,
      },
      label: {
        ...base.attrs.label,
        text: config.text || '',
        fontSize: (config as any).fontSize || 14,
        fontWeight: (config as any).fontWeight || 600,
        fill: (config as any).color || '#1d39c4',
        textAnchor: 'start',
        textVerticalAnchor: 'top',
        refX: 10,
        refY: 10,
      },
    },
  })
}

export const renderGanttProgress = (config: ShapeRenderConfig): Node => {
  const cornerRadius = (config as any).cornerRadius || 2
  const base = createBaseConfig(config)

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#1890ff',
        stroke: config.stroke || 'transparent',
        strokeWidth: 0,
        rx: cornerRadius,
        ry: cornerRadius,
      },
    },
  })
}

export const renderGanttMilestone = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, MERMAID_SHADOW)
  const points = calculatePolygonPoints(4, config.width, config.height)
  
  return new Shape.Polygon({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refPoints: points,
        fill: config.fill || '#faad14',
        stroke: config.stroke || '#d48806',
        strokeWidth: config.strokeWidth || 2,
      },
    },
  })
}

export const renderSectionHeader = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config, {
    rx: 4,
    ry: 4,
  })

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#f0f5ff',
        stroke: config.stroke || '#2f54eb',
        strokeWidth: config.strokeWidth || 1,
        rx: 4,
        ry: 4,
      },
      label: {
        ...base.attrs.label,
        text: config.text || '',
        fontSize: (config as any).fontSize || 14,
        fontWeight: (config as any).fontWeight || 600,
        fill: (config as any).color || '#1d39c4',
        textAnchor: 'start',
        textVerticalAnchor: 'middle',
        refX: 10,
      },
    },
  })
}

export const renderUmlRect = (config: ShapeRenderConfig): Node => {
  const cornerRadius = (config as any).cornerRadius || 0
  const base = createBaseConfig(config, {
    rx: cornerRadius,
    ry: cornerRadius,
  })

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || '#ffffff',
        fillOpacity: (config as any).fillOpacity ?? 1,
        stroke: config.stroke || '#d9d9d9',
        strokeWidth: config.strokeWidth || 1,
        rx: cornerRadius,
        ry: cornerRadius,
      },
    },
  })
}

export const renderUmlLine = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: `M0,0 L${config.width},${config.height}`,
        fill: 'none',
        stroke: config.stroke || '#d9d9d9',
        strokeWidth: config.strokeWidth || 1,
        strokeDasharray: (config as any).dashArray || 'none',
      },
    },
  })
}

export const renderUmlLabel = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)

  return new Shape.Rect({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        fill: config.fill || 'transparent',
        stroke: config.stroke || 'transparent',
        strokeWidth: 0,
      },
      label: {
        ...base.attrs.label,
        text: config.text || '',
        fontSize: (config as any).fontSize || 12,
        fontWeight: (config as any).fontWeight,
        fill: (config as any).color || '#262626',
        textAnchor: ((config as any).textAlign as any) || 'left',
        textVerticalAnchor: 'middle',
      },
    },
  })
}

export const ganttRenderers = {
  'gantt-task': renderGanttTask,
  'gantt-section': renderGanttSection,
  'uml-gantt-task': renderGanttTask,
  'uml-gantt-progress': renderGanttProgress,
  'uml-gantt-milestone': renderGanttMilestone,
  'uml-section-header': renderSectionHeader,
  'uml-rect': renderUmlRect,
  'uml-line': renderUmlLine,
  'uml-label': renderUmlLabel,
}
