import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig } from './types'
import {
  calculatePolygonPoints,
  createErTableEntityPath,
} from '../shapeMath'
import { renderRectangle, renderEllipse, renderDiamond } from './base'

export const renderErEntity = renderRectangle

export const renderErWeakEntity = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const margin = Math.min(config.width, config.height) * 0.08
  const innerW = config.width - margin * 2
  const innerH = config.height - margin * 2
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: `M0,0 L${config.width},0 L${config.width},${config.height} L0,${config.height} Z M${margin},${margin} L${margin + innerW},${margin} L${margin + innerW},${margin + innerH} L${margin},${margin + innerH} Z`,
      },
    },
  })
}

export const renderErTableEntity = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  
  // 解析文本内容，计算列数和自适应尺寸
  const lines = config.text?.split('\n') || []
  const tableName = lines[0] || ''
  const columns = lines.slice(1).filter(line => line.trim())
  
  // 计算列宽
  const charWidth = 8
  const padding = 16
  const maxColumnWidth = columns.reduce((max, col) => {
    const parts = col.split(/\s+/)
    const colWidth = parts.reduce((sum, part) => sum + part.length * charWidth, 0) + padding * 2
    return Math.max(max, colWidth)
  }, 100) // 最小宽度 100
  
  // 计算自适应宽度
  const nameWidth = tableName.length * charWidth + padding * 2
  const adaptiveWidth = Math.max(config.width, Math.max(nameWidth, maxColumnWidth))
  
  // 计算自适应高度
  const lineHeight = 24
  const headerHeight = 32
  const minHeight = headerHeight + columns.length * lineHeight + padding
  const adaptiveHeight = Math.max(config.height, minHeight)
  
  // 计算 PK 区域高度（如果有主键列）
  const pkColumns = columns.filter(col => col.includes('[pk]') || col.includes('[PK]'))
  const pkRatio = pkColumns.length > 0 ? headerHeight / adaptiveHeight : 0.5
  
  const path = createErTableEntityPath(adaptiveWidth, adaptiveHeight, headerHeight / adaptiveHeight, pkRatio)
  
  return new Shape.Path({
    ...base,
    width: adaptiveWidth,
    height: adaptiveHeight,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: path,
      },
      label: {
        ...base.attrs.label,
        text: tableName,
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refY: headerHeight / 2,
      },
    },
  })
}

export const renderErAttribute = renderEllipse

export const renderErKeyAttribute = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.Ellipse({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        textDecoration: 'underline',
      },
    },
  })
}

export const renderErRelationship = renderDiamond

export const renderErWeakRelationship = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cx = config.width / 2
  const cy = config.height / 2
  const outerR = Math.min(config.width, config.height) / 2
  const innerR = outerR * 0.75

  const diamondPath = `M${cx},0 L${config.width},${cy} L${cx},${config.height} L0,${cy} Z M${cx},${outerR - innerR} L${cx + innerR},${cy} L${cx},${cy + innerR} L${cx - innerR},${cy} Z`

  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        d: diamondPath,
      },
    },
  })
}

export const renderErCardinality = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  return new Shape.TextBlock({
    ...base,
    attrs: {
      ...base.attrs,
      label: {
        ...base.attrs.label,
        text: config.text || '1',
        fontSize: 14,
        fontWeight: 'bold',
        fill: config.stroke || '#333333',
      },
    },
  })
}

export const renderErIsaHierarchy = (config: ShapeRenderConfig): Node => {
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
      label: {
        ...base.attrs.label,
        text: config.text || 'ISA',
      },
    },
  })
}

export const erRenderers = {
  'er-entity': renderErEntity,
  'er-weak-entity': renderErWeakEntity,
  'er-table-entity': renderErTableEntity,
  'er-attribute': renderErAttribute,
  'er-key-attribute': renderErKeyAttribute,
  'er-relationship': renderErRelationship,
  'er-weak-relationship': renderErWeakRelationship,
  'er-cardinality-one': renderErCardinality,
  'er-cardinality-many': renderErCardinality,
  'er-isa-hierarchy': renderErIsaHierarchy,
}
