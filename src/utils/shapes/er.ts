import { Shape, Node } from '@antv/x6'
import { ShapeRenderConfig, createBaseConfig } from './types'
import {
  calculatePolygonPoints,
  createErTableEntityPath,
} from '../shapeMath'
import { renderEllipse, renderDiamond } from './base'

// ER 表格实体计算缓存
interface ErTableCacheEntry {
  width: number
  height: number
  path: string
  headerHeight: number
  tableName: string
}

const erTableCache = new Map<string, ErTableCacheEntry>()

/**
 * 生成 ER 表格实体的缓存键
 */
function generateErTableCacheKey(config: ShapeRenderConfig): string {
  // 使用文本内容、宽度和高度作为缓存键
  return `${config.text || ''}-${config.width}-${config.height}`
}

/**
 * 计算 ER 表格实体的尺寸和路径
 */
function calculateErTableDimensions(
  config: ShapeRenderConfig
): ErTableCacheEntry {
  const lines = config.text?.split('\n') || []
  const tableName = lines[0] || ''
  const columns = lines.slice(1).filter((line) => line.trim())

  // 计算列宽
  const charWidth = 8
  const padding = 16
  const maxColumnWidth = columns.reduce((max, col) => {
    const parts = col.split(/\s+/)
    const colWidth =
      parts.reduce((sum, part) => sum + part.length * charWidth, 0) +
      padding * 2
    return Math.max(max, colWidth)
  }, 100) // 最小宽度 100

  // 计算自适应宽度
  const nameWidth = tableName.length * charWidth + padding * 2
  const adaptiveWidth = Math.max(
    config.width,
    Math.max(nameWidth, maxColumnWidth)
  )

  // 计算自适应高度
  const lineHeight = 24
  const headerHeight = 32
  const minHeight = headerHeight + columns.length * lineHeight + padding
  const adaptiveHeight = Math.max(config.height, minHeight)

  // 计算 PK 区域高度（如果有主键列）
  const pkColumns = columns.filter(
    (col) => col.includes('[pk]') || col.includes('[PK]')
  )
  const pkRatio = pkColumns.length > 0 ? headerHeight / adaptiveHeight : 0.5

  const path = createErTableEntityPath(
    adaptiveWidth,
    adaptiveHeight,
    headerHeight / adaptiveHeight,
    pkRatio
  )

  return {
    width: adaptiveWidth,
    height: adaptiveHeight,
    path,
    headerHeight,
    tableName,
  }
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

  // 尝试从缓存获取计算结果
  const cacheKey = generateErTableCacheKey(config)
  let cached = erTableCache.get(cacheKey)

  if (!cached) {
    // 计算并缓存结果
    cached = calculateErTableDimensions(config)
    erTableCache.set(cacheKey, cached)

    // 限制缓存大小
    if (erTableCache.size > 100) {
      const firstKey = erTableCache.keys().next().value as string | undefined
      if (firstKey) {
        erTableCache.delete(firstKey)
      }
    }
  }

  return new Shape.Path({
    ...base,
    width: cached.width,
    height: cached.height,
    attrs: {
      ...base.attrs,
      body: {
        ...base.attrs.body,
        refD: cached.path,
      },
      label: {
        ...base.attrs.label,
        text: cached.tableName,
        textVerticalAnchor: 'top',
        textAnchor: 'middle',
        refY: cached.headerHeight / 2,
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

// 导出 ER 渲染器集合
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
