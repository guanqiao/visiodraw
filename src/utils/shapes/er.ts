import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig } from './types'
import {
  calculatePolygonPoints,
  createErTableEntityPath,
} from '../shapeMath'
import { renderEllipse, renderDiamond } from './base'

export interface ErColumnInfo {
  name: string
  type: string
  constraints: string[]
  isPrimaryKey: boolean
  isForeignKey: boolean
  isUnique: boolean
  isNotNull: boolean
  isAutoIncrement: boolean
  displayText: string
}

export interface ErTableRenderData {
  tableName: string
  columns: ErColumnInfo[]
  width: number
  height: number
  headerHeight: number
  pkAreaHeight: number
  path: string
}

const ER_COLORS = {
  headerBg: '#1890ff',
  headerText: '#ffffff',
  pkBg: '#e6f7ff',
  pkText: '#1890ff',
  fkBg: '#f9f0ff',
  fkText: '#722ed1',
  normalBg: '#ffffff',
  normalText: '#333333',
  borderColor: '#d9d9d9',
  constraintPk: '#1890ff',
  constraintFk: '#722ed1',
  constraintUnique: '#13c2c2',
  constraintNotNull: '#fa8c16',
  constraintAuto: '#52c41a',
}

const CONSTRAINT_ICONS: Record<string, string> = {
  pk: '🔑',
  fk: '🔗',
  unique: '🔷',
  notnull: '❗',
  auto: '⚡',
  index: '📋',
}

function parseErColumn(line: string): ErColumnInfo {
  const constraintMatch = line.match(/^(.+?)\s*\[(.+)\]\s*$/)
  let name = ''
  let type = 'varchar'
  const constraints: string[] = []

  if (constraintMatch) {
    const parts = constraintMatch[1].trim().split(/\s+/)
    name = parts[0] || ''
    type = parts.slice(1).join(' ') || 'varchar'
    const constraintStr = constraintMatch[2].toLowerCase()
    if (constraintStr.includes('pk')) constraints.push('pk')
    if (constraintStr.includes('fk')) constraints.push('fk')
    if (constraintStr.includes('unique')) constraints.push('unique')
    if (constraintStr.includes('notnull')) constraints.push('notnull')
    if (constraintStr.includes('auto')) constraints.push('auto')
    if (constraintStr.includes('index')) constraints.push('index')
  } else {
    const parts = line.trim().split(/\s+/)
    name = parts[0] || ''
    type = parts[1] || 'varchar'
  }

  const isPrimaryKey = constraints.includes('pk')
  const isForeignKey = constraints.includes('fk')
  const isUnique = constraints.includes('unique')
  const isNotNull = constraints.includes('notnull')
  const isAutoIncrement = constraints.includes('auto')

  const constraintIcons = constraints
    .filter(c => CONSTRAINT_ICONS[c])
    .map(c => CONSTRAINT_ICONS[c])
    .join('')

  const displayText = constraintIcons 
    ? `${name} ${type} ${constraintIcons}`.trim()
    : `${name} ${type}`.trim()

  return {
    name,
    type,
    constraints,
    isPrimaryKey,
    isForeignKey,
    isUnique,
    isNotNull,
    isAutoIncrement,
    displayText,
  }
}

interface ErTableCacheEntry {
  width: number
  height: number
  path: string
  headerHeight: number
  tableName: string
  columns: ErColumnInfo[]
  pkAreaHeight: number
}

const erTableCache = new Map<string, ErTableCacheEntry>()

function generateErTableCacheKey(config: ShapeRenderConfig): string {
  return `${config.text || ''}-${config.width}-${config.height}`
}

function calculateErTableDimensions(
  config: ShapeRenderConfig
): ErTableCacheEntry {
  const lines = config.text?.split('\n') || []
  const tableName = lines[0] || ''
  const rawColumns = lines.slice(1).filter((line) => line.trim())
  const columns = rawColumns.map(line => parseErColumn(line))

  const charWidth = 8
  const padding = 16
  const maxColumnWidth = columns.reduce((max, col) => {
    const colWidth = col.displayText.length * charWidth + padding * 2 + 40
    return Math.max(max, colWidth)
  }, 120)

  const nameWidth = tableName.length * charWidth + padding * 2
  const adaptiveWidth = Math.max(
    config.width,
    Math.max(nameWidth, maxColumnWidth)
  )

  const lineHeight = 26
  const headerHeight = 36
  const minHeight = headerHeight + columns.length * lineHeight + padding
  const adaptiveHeight = Math.max(config.height, minHeight)

  const pkColumns = columns.filter(col => col.isPrimaryKey)
  const pkCount = pkColumns.length
  const pkAreaHeight = pkCount > 0 ? headerHeight + pkCount * lineHeight : 0

  const path = createEnhancedErTablePath(
    adaptiveWidth,
    adaptiveHeight,
    headerHeight,
    columns
  )

  return {
    width: adaptiveWidth,
    height: adaptiveHeight,
    path,
    headerHeight,
    tableName,
    columns,
    pkAreaHeight,
  }
}

function createEnhancedErTablePath(
  width: number,
  height: number,
  headerHeight: number,
  columns: ErColumnInfo[]
): string {
  let path = `M0,0 L${width},0 L${width},${height} L0,${height} Z`
  path += ` M0,${headerHeight} L${width},${headerHeight}`

  const lineHeight = 26
  let currentY = headerHeight

  columns.forEach((col, index) => {
    currentY += lineHeight
    path += ` M0,${currentY} L${width},${currentY}`
  })

  return path
}

export const renderErEntity = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const cornerRadius = Math.min(config.width, config.height) * 0.08

  const path = `M${cornerRadius},0 
    L${config.width - cornerRadius},0 
    Q${config.width},0 ${config.width},${cornerRadius}
    L${config.width},${config.height - cornerRadius}
    Q${config.width},${config.height} ${config.width - cornerRadius},${config.height}
    L${cornerRadius},${config.height}
    Q0,${config.height} 0,${config.height - cornerRadius}
    L0,${cornerRadius}
    Q0,0 ${cornerRadius},0 Z`

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
        refD: `M0,0 L${config.width},0 L${config.width},${config.height} L0,${config.height} Z M${margin},${margin} L${margin + innerW},${margin} L${margin + innerW},${margin + innerH} L${margin},${margin + innerH} Z`,
      },
    },
  })
}

export const renderErTableEntity = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)

  const cacheKey = generateErTableCacheKey(config)
  let cached = erTableCache.get(cacheKey)

  if (!cached) {
    cached = calculateErTableDimensions(config)
    erTableCache.set(cacheKey, cached)

    if (erTableCache.size > 100) {
      const firstKey = erTableCache.keys().next().value as string | undefined
      if (firstKey) {
        erTableCache.delete(firstKey)
      }
    }
  }

  const markup: any[] = [
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
      selector: 'tableName',
    },
  ]

  const lineHeight = 26
  cached.columns.forEach((col, index) => {
    const y = cached.headerHeight + index * lineHeight + lineHeight / 2
    
    markup.push({
      tagName: 'rect',
      selector: `colBg-${index}`,
      groupSelector: 'columnBackgrounds',
    })
    
    markup.push({
      tagName: 'text',
      selector: `colText-${index}`,
      groupSelector: 'columnTexts',
    })
    
    markup.push({
      tagName: 'text',
      selector: `colType-${index}`,
      groupSelector: 'columnTypes',
    })
    
    if (col.constraints.length > 0) {
      markup.push({
        tagName: 'text',
        selector: `colConstraints-${index}`,
        groupSelector: 'columnConstraints',
      })
    }
  })

  const attrs: Record<string, any> = {
    body: {
      refWidth: '100%',
      refHeight: '100%',
      fill: ER_COLORS.normalBg,
      stroke: ER_COLORS.borderColor,
      strokeWidth: 1,
    },
    header: {
      refWidth: '100%',
      height: cached.headerHeight,
      fill: ER_COLORS.headerBg,
      stroke: ER_COLORS.borderColor,
      strokeWidth: 1,
    },
    tableName: {
      refX: '50%',
      refY: cached.headerHeight / 2,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      text: cached.tableName,
      fill: ER_COLORS.headerText,
      fontWeight: 'bold',
      fontSize: 14,
    },
  }

  cached.columns.forEach((col, index) => {
    const y = cached.headerHeight + index * lineHeight
    const isPk = col.isPrimaryKey
    const isFk = col.isForeignKey

    attrs[`colBg-${index}`] = {
      refWidth: '100%',
      height: lineHeight,
      refY: y,
      fill: isPk ? ER_COLORS.pkBg : isFk ? ER_COLORS.fkBg : ER_COLORS.normalBg,
      stroke: ER_COLORS.borderColor,
      strokeWidth: 0.5,
    }

    attrs[`colText-${index}`] = {
      refX: 8,
      refY: y + lineHeight / 2,
      textVerticalAnchor: 'middle',
      text: col.name,
      fill: isPk ? ER_COLORS.pkText : isFk ? ER_COLORS.fkText : ER_COLORS.normalText,
      fontWeight: isPk ? 'bold' : 'normal',
      textDecoration: isPk ? 'underline' : 'none',
      fontSize: 12,
    }

    attrs[`colType-${index}`] = {
      refX: cached.width * 0.45,
      refY: y + lineHeight / 2,
      textVerticalAnchor: 'middle',
      text: col.type,
      fill: '#666666',
      fontSize: 11,
    }

    if (col.constraints.length > 0) {
      const constraintText = col.constraints.map(c => {
        switch(c) {
          case 'pk': return 'PK'
          case 'fk': return 'FK'
          case 'unique': return 'UQ'
          case 'notnull': return 'NN'
          case 'auto': return 'AI'
          case 'index': return 'IDX'
          default: return c.toUpperCase()
        }
      }).join(' ')

      attrs[`colConstraints-${index}`] = {
        refX: cached.width - 8,
        refY: y + lineHeight / 2,
        textAnchor: 'end',
        textVerticalAnchor: 'middle',
        text: constraintText,
        fill: isPk ? ER_COLORS.constraintPk : isFk ? ER_COLORS.constraintFk : '#999999',
        fontSize: 10,
        fontWeight: 'bold',
      }
    }
  })

  return new Shape.Path({
    ...base,
    width: cached.width,
    height: cached.height,
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
        refD: cached.path,
        fill: ER_COLORS.normalBg,
      },
      header: {
        width: cached.width,
        height: cached.headerHeight,
        fill: ER_COLORS.headerBg,
        stroke: 'none',
      },
      label: {
        ...base.attrs.label,
        text: cached.tableName,
        textVerticalAnchor: 'middle',
        textAnchor: 'middle',
        refY: cached.headerHeight / 2,
        fill: ER_COLORS.headerText,
        fontWeight: 'bold',
        fontSize: 14,
      },
    },
    data: {
      ...base.data,
      erTableData: {
        tableName: cached.tableName,
        columns: cached.columns,
        pkAreaHeight: cached.pkAreaHeight,
      },
    },
  })
}

export const renderErTableEntityWithColumns = (config: ShapeRenderConfig): Node => {
  return renderErTableEntity(config)
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
  const margin = Math.min(config.width, config.height) * 0.1
  const innerW = config.width - margin * 2
  const innerH = config.height - margin * 2

  // calculatePolygonPoints 返回的是字符串格式的点
  const outerPointsStr = calculatePolygonPoints(4, config.width, config.height, 45)
  const innerPointsStr = calculatePolygonPoints(
    4,
    innerW,
    innerH,
    45
  )

  const path = `
    M ${outerPointsStr} Z
    M ${margin},${margin} L ${margin + innerW},${margin} L ${margin + innerW},${margin + innerH} L ${margin},${margin + innerH} Z
  `

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

// 导出缓存清理函数，用于测试和内存管理
export function clearErTableCache(): void {
  erTableCache.clear()
}

// 导出缓存统计信息
export function getErTableCacheStats(): {
  size: number
  maxSize: number
} {
  return {
    size: erTableCache.size,
    maxSize: 100,
  }
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

export function createCrowsFootMarker(type: 'one' | 'many' | 'zero-one' | 'one-many' | 'zero-many'): string {
  const size = 12
  
  switch (type) {
    case 'one':
      return `M0,${size/2} L${size},${size/2} M${size},0 L${size},${size}`
    
    case 'many':
      return `M0,${size/2} L${size*0.7},${size/2} M${size*0.7},0 L${size},${size/2} L${size*0.7},${size}`
    
    case 'zero-one':
      return `M${size*0.3},${size/2} A${size*0.15},${size*0.15} 0 1,1 ${size*0.3},${size/2+0.01} M${size*0.3},${size/2} L${size},${size/2} M${size},0 L${size},${size}`
    
    case 'one-many':
      return `M0,${size/2} L${size*0.5},${size/2} M${size*0.5},0 L${size*0.5},${size} M${size*0.5},0 L${size},${size/2} L${size*0.5},${size}`
    
    case 'zero-many':
      return `M${size*0.2},${size/2} A${size*0.1},${size*0.1} 0 1,1 ${size*0.2},${size/2+0.01} M${size*0.3},${size/2} L${size*0.7},${size/2} M${size*0.7},0 L${size},${size/2} L${size*0.7},${size}`
    
    default:
      return ''
  }
}

export const renderErCrowsFootOne = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const markerPath = createCrowsFootMarker('one')
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: markerPath,
        fill: 'none',
        stroke: config.stroke || '#333333',
        strokeWidth: 2,
      },
    },
  })
}

export const renderErCrowsFootMany = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const markerPath = createCrowsFootMarker('many')
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: markerPath,
        fill: 'none',
        stroke: config.stroke || '#333333',
        strokeWidth: 2,
      },
    },
  })
}

export const renderErCrowsFootZeroOne = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const markerPath = createCrowsFootMarker('zero-one')
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: markerPath,
        fill: 'none',
        stroke: config.stroke || '#333333',
        strokeWidth: 2,
      },
    },
  })
}

export const renderErCrowsFootOneMany = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const markerPath = createCrowsFootMarker('one-many')
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: markerPath,
        fill: 'none',
        stroke: config.stroke || '#333333',
        strokeWidth: 2,
      },
    },
  })
}

export const renderErCrowsFootZeroMany = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const markerPath = createCrowsFootMarker('zero-many')
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: markerPath,
        fill: 'none',
        stroke: config.stroke || '#333333',
        strokeWidth: 2,
      },
    },
  })
}

export const renderErTotalParticipation = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const width = config.width || 20
  const height = config.height || 60
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: `M${width/2},0 L${width/2},${height} M${width/2-3},0 L${width/2-3},${height}`,
        fill: 'none',
        stroke: config.stroke || '#f5222d',
        strokeWidth: 3,
      },
    },
  })
}

export const renderErPartialParticipation = (config: ShapeRenderConfig): Node => {
  const base = createBaseConfig(config)
  const width = config.width || 20
  const height = config.height || 60
  
  return new Shape.Path({
    ...base,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: `M${width/2},0 L${width/2},${height}`,
        fill: 'none',
        stroke: config.stroke || '#52c41a',
        strokeWidth: 2,
      },
    },
  })
}

export function getErRelationMarkers(relationType: string): {
  sourceMarker: string
  targetMarker: string
} {
  switch (relationType) {
    case 'er-one-to-one':
      return {
        sourceMarker: createCrowsFootMarker('one'),
        targetMarker: createCrowsFootMarker('one'),
      }
    case 'er-one-to-many':
      return {
        sourceMarker: createCrowsFootMarker('one'),
        targetMarker: createCrowsFootMarker('many'),
      }
    case 'er-many-to-many':
      return {
        sourceMarker: createCrowsFootMarker('many'),
        targetMarker: createCrowsFootMarker('many'),
      }
    case 'er-crows-foot-one':
      return {
        sourceMarker: createCrowsFootMarker('one'),
        targetMarker: createCrowsFootMarker('one'),
      }
    case 'er-crows-foot-many':
      return {
        sourceMarker: createCrowsFootMarker('many'),
        targetMarker: createCrowsFootMarker('many'),
      }
    case 'er-crows-foot-zero-one':
      return {
        sourceMarker: createCrowsFootMarker('zero-one'),
        targetMarker: createCrowsFootMarker('zero-one'),
      }
    case 'er-crows-foot-one-many':
      return {
        sourceMarker: createCrowsFootMarker('one'),
        targetMarker: createCrowsFootMarker('one-many'),
      }
    case 'er-crows-foot-zero-many':
      return {
        sourceMarker: createCrowsFootMarker('zero-one'),
        targetMarker: createCrowsFootMarker('zero-many'),
      }
    default:
      return {
        sourceMarker: '',
        targetMarker: '',
      }
  }
}

// 导出 ER 渲染器集合
export const erRenderers = {
  'er-entity': renderErEntity,
  'er-weak-entity': renderErWeakEntity,
  'er-table-entity': renderErTableEntity,
  'er-table-entity-with-columns': renderErTableEntityWithColumns,
  'er-attribute': renderErAttribute,
  'er-key-attribute': renderErKeyAttribute,
  'er-relationship': renderErRelationship,
  'er-weak-relationship': renderErWeakRelationship,
  'er-cardinality-one': renderErCardinality,
  'er-cardinality-many': renderErCardinality,
  'er-isa-hierarchy': renderErIsaHierarchy,
  'er-crows-foot-one': renderErCrowsFootOne,
  'er-crows-foot-many': renderErCrowsFootMany,
  'er-crows-foot-zero-one': renderErCrowsFootZeroOne,
  'er-crows-foot-one-many': renderErCrowsFootOneMany,
  'er-crows-foot-zero-many': renderErCrowsFootZeroMany,
  'er-total-participation': renderErTotalParticipation,
  'er-partial-participation': renderErPartialParticipation,
}

export { ER_COLORS, CONSTRAINT_ICONS }
