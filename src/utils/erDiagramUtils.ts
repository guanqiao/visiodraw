/**
 * ER图工具函数库
 * 提供ER图生成所需的共享工具函数和配置
 * 对标 sequenceDiagramUtils.ts 的设计模式
 *
 * 功能：
 * 1. 布局计算（网格、层次、力导向、环形）
 * 2. 节点创建（实体、属性）
 * 3. 关系边创建（带基数标记）
 * 4. Mermaid代码生成
 * 5. 主题和样式配置
 */

import type { DiagramTemplate, TemplateGenerateOptions, TemplateNode, TemplateEdge } from '../types/diagramTemplate'

// ==================== 类型定义 ====================

export type EntityType = 'strong' | 'weak' | 'associative'
export type CardinalityType = 'one' | 'many' | 'zero-or-one' | 'one-or-many' | 'zero-or-many'
export type ParticipationType = 'total' | 'partial'
export type LayoutAlgorithm = 'hierarchical' | 'grid' | 'force' | 'circular'
export type LayoutDirection = 'vertical' | 'horizontal'

export interface ErLayoutConfig {
  startX: number
  startY: number
  entityWidth: number
  entityHeight: number
  entitySpacing: number
  relationshipSpacing: number
  attributeSpacing: number
  layoutAlgorithm: LayoutAlgorithm
  direction: LayoutDirection
}

export interface EntityConfig {
  id: string
  name: string
  type?: EntityType
  columns: ColumnConfig[]
}

export interface ColumnConfig {
  name: string
  dataType: string
  isPrimary?: boolean
  isForeign?: boolean
  isNullable?: boolean
  isUnique?: boolean
  defaultValue?: string
  comment?: string
}

export interface RelationshipConfig {
  source: string
  target: string
  sourceCardinality: CardinalityType
  targetCardinality: CardinalityType
  sourceParticipation?: ParticipationType
  targetParticipation?: ParticipationType
  label?: string
  isIdentifying?: boolean
}

export interface EntityLayout {
  index: number
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export interface ErTemplateConfig {
  id: string
  name: string
  description: string
  category: 'database' | 'business' | 'system' | 'basic'
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  entities: EntityConfig[]
  relationships: RelationshipConfig[]
}

export interface ErTheme {
  name: string
  entityStyles: Record<EntityType, EntityStyle>
  relationshipStyle: RelationshipStyle
  attributeStyle: AttributeStyle
}

export interface EntityStyle {
  fill: string
  stroke: string
  strokeWidth: number
  headerFill?: string
  headerStroke?: string
  fontSize: number
  fontWeight: number
  cornerRadius: number
}

export interface RelationshipStyle {
  stroke: string
  strokeWidth: number
  fontSize: number
  fontWeight: number
}

export interface AttributeStyle {
  fill: string
  stroke: string
  strokeWidth: number
  fontSize: number
}

// ==================== 默认配置 ====================

export const DEFAULT_ER_CONFIG: ErLayoutConfig = {
  startX: 80,
  startY: 60,
  entityWidth: 180,
  entityHeight: 100,
  entitySpacing: 240,
  relationshipSpacing: 120,
  attributeSpacing: 80,
  layoutAlgorithm: 'hierarchical',
  direction: 'horizontal',
}

// ==================== 样式配置 ====================

export const ER_STYLES = {
  entity: {
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
    headerFill: '#bae7ff',
    headerStroke: '#1890ff',
    fontSize: 14,
    fontWeight: 600,
    cornerRadius: 4,
  },
  weakEntity: {
    fill: '#fff7e6',
    stroke: '#fa8c16',
    strokeWidth: 2.5,
    headerFill: '#ffe7ba',
    headerStroke: '#fa8c16',
    fontSize: 14,
    fontWeight: 600,
    cornerRadius: 4,
  },
  associativeEntity: {
    fill: '#f6ffed',
    stroke: '#52c41a',
    strokeWidth: 2,
    headerFill: '#d9f7be',
    headerStroke: '#52c41a',
    fontSize: 14,
    fontWeight: 600,
    cornerRadius: 4,
  },
  relationship: {
    stroke: '#595959',
    strokeWidth: 1.5,
    fontSize: 12,
    fontWeight: 500,
  },
  attribute: {
    fill: '#f0f0f0',
    stroke: '#8c8c8c',
    strokeWidth: 1,
    fontSize: 11,
  },
  keyAttribute: {
    fill: '#fff2e8',
    stroke: '#fa541c',
    strokeWidth: 1.5,
    fontSize: 11,
    fontWeight: 600,
  },
  crowsFoot: {
    stroke: '#262626',
    strokeWidth: 2,
    size: 10,
  },
  participation: {
    total: { strokeWidth: 3, stroke: '#262626' },
    partial: { strokeWidth: 1.5, stroke: '#8c8c8c' },
  },
}

// ==================== 主题配置 ====================

export const ER_THEMES: Record<string, ErTheme> = {
  default: {
    name: '默认主题',
    entityStyles: {
      strong: ER_STYLES.entity,
      weak: ER_STYLES.weakEntity,
      associative: ER_STYLES.associativeEntity,
    },
    relationshipStyle: ER_STYLES.relationship,
    attributeStyle: ER_STYLES.attribute,
  },
  dark: {
    name: '暗色主题',
    entityStyles: {
      strong: {
        fill: '#1f1f1f',
        stroke: '#177ddc',
        strokeWidth: 2,
        headerFill: '#177ddc',
        headerStroke: '#177ddc',
        fontSize: 14,
        fontWeight: 600,
        cornerRadius: 4,
      },
      weak: {
        fill: '#2b2118',
        stroke: '#d89614',
        strokeWidth: 2.5,
        headerFill: '#d89614',
        headerStroke: '#d89614',
        fontSize: 14,
        fontWeight: 600,
        cornerRadius: 4,
      },
      associative: {
        fill: '#1d2e18',
        stroke: '#49aa19',
        strokeWidth: 2,
        headerFill: '#49aa19',
        headerStroke: '#49aa19',
        fontSize: 14,
        fontWeight: 600,
        cornerRadius: 4,
      },
    },
    relationshipStyle: {
      stroke: '#8c8c8c',
      strokeWidth: 1.5,
      fontSize: 12,
      fontWeight: 500,
    },
    attributeStyle: {
      fill: '#2f2f2f',
      stroke: '#595959',
      strokeWidth: 1,
      fontSize: 11,
    },
  },
  colorful: {
    name: '多彩主题',
    entityStyles: {
      strong: {
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
        headerFill: '#1890ff',
        headerStroke: '#1890ff',
        fontSize: 14,
        fontWeight: 600,
        cornerRadius: 8,
      },
      weak: {
        fill: '#fff0f6',
        stroke: '#eb2f96',
        strokeWidth: 2.5,
        headerFill: '#eb2f96',
        headerStroke: '#eb2f96',
        fontSize: 14,
        fontWeight: 600,
        cornerRadius: 8,
      },
      associative: {
        fill: '#f6ffed',
        stroke: '#52c41a',
        strokeWidth: 2,
        headerFill: '#52c41a',
        headerStroke: '#52c41a',
        fontSize: 14,
        fontWeight: 600,
        cornerRadius: 8,
      },
    },
    relationshipStyle: ER_STYLES.relationship,
    attributeStyle: ER_STYLES.attribute,
  },
}

// ==================== 布局缓存 ====================

const layoutCache = new Map<string, Map<string, EntityLayout>>()

function generateCacheKey(entities: EntityConfig[], config: ErLayoutConfig): string {
  return JSON.stringify({
    entityIds: entities.map(e => e.id).sort(),
    entityCount: entities.length,
    algorithm: config.layoutAlgorithm,
    direction: config.direction,
    spacing: config.entitySpacing,
  })
}

// ==================== 布局计算函数 ====================

/**
 * 计算实体布局（带缓存）
 */
export function calculateEntityLayouts(
  entities: EntityConfig[],
  config: ErLayoutConfig,
  useCache: boolean = true
): Map<string, EntityLayout> {
  if (useCache) {
    const cacheKey = generateCacheKey(entities, config)
    if (layoutCache.has(cacheKey)) {
      return layoutCache.get(cacheKey)!
    }
  }

  const result = computeEntityLayouts(entities, config)
  
  if (useCache) {
    const cacheKey = generateCacheKey(entities, config)
    layoutCache.set(cacheKey, result)
  }

  return result
}

/**
 * 清除布局缓存
 */
export function clearLayoutCache(): void {
  layoutCache.clear()
}

/**
 * 计算实体布局（核心实现）
 */
function computeEntityLayouts(
  entities: EntityConfig[],
  config: ErLayoutConfig
): Map<string, EntityLayout> {
  const layouts = new Map<string, EntityLayout>()

  switch (config.layoutAlgorithm) {
    case 'grid':
      return computeGridLayout(entities, config)
    case 'force':
      return computeForceLayout(entities, config)
    case 'circular':
      return computeCircularLayout(entities, config)
    case 'hierarchical':
    default:
      return computeHierarchicalLayout(entities, config)
  }
}

/**
 * 网格布局
 */
function computeGridLayout(
  entities: EntityConfig[],
  config: ErLayoutConfig
): Map<string, EntityLayout> {
  const layouts = new Map<string, EntityLayout>()
  const cols = Math.ceil(Math.sqrt(entities.length))
  const rowHeight = config.entityHeight + 80

  entities.forEach((entity, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = config.startX + col * config.entitySpacing
    const y = config.startY + row * rowHeight
    const height = Math.max(config.entityHeight, 60 + entity.columns.length * 22)

    layouts.set(entity.id, {
      index,
      x,
      y,
      width: config.entityWidth,
      height,
      centerX: x + config.entityWidth / 2,
      centerY: y + height / 2,
    })
  })

  return layouts
}

/**
 * 层次布局
 */
function computeHierarchicalLayout(
  entities: EntityConfig[],
  config: ErLayoutConfig
): Map<string, EntityLayout> {
  const layouts = new Map<string, EntityLayout>()
  const rowHeight = config.entityHeight + 80

  entities.forEach((entity, index) => {
    let x: number
    let y: number

    if (config.direction === 'horizontal') {
      x = config.startX + index * config.entitySpacing
      y = config.startY
    } else {
      x = config.startX
      y = config.startY + index * rowHeight
    }

    const height = Math.max(config.entityHeight, 60 + entity.columns.length * 22)

    layouts.set(entity.id, {
      index,
      x,
      y,
      width: config.entityWidth,
      height,
      centerX: x + config.entityWidth / 2,
      centerY: y + height / 2,
    })
  })

  return layouts
}

/**
 * 力导向布局（简化实现）
 */
function computeForceLayout(
  entities: EntityConfig[],
  config: ErLayoutConfig
): Map<string, EntityLayout> {
  const layouts = new Map<string, EntityLayout>()
  const centerX = config.startX + (entities.length * config.entitySpacing) / 2
  const centerY = config.startY + 200
  const radius = Math.min(entities.length * 80, 400)

  entities.forEach((entity, index) => {
    const angle = (index / entities.length) * 2 * Math.PI - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    const height = Math.max(config.entityHeight, 60 + entity.columns.length * 22)

    layouts.set(entity.id, {
      index,
      x,
      y,
      width: config.entityWidth,
      height,
      centerX: x + config.entityWidth / 2,
      centerY: y + height / 2,
    })
  })

  return layouts
}

/**
 * 环形布局
 */
function computeCircularLayout(
  entities: EntityConfig[],
  config: ErLayoutConfig
): Map<string, EntityLayout> {
  const layouts = new Map<string, EntityLayout>()
  const centerX = config.startX + 400
  const centerY = config.startY + 300
  const radius = Math.min(entities.length * 60, 350)

  entities.forEach((entity, index) => {
    const angle = (index / entities.length) * 2 * Math.PI - Math.PI / 2
    const x = centerX + radius * Math.cos(angle) - config.entityWidth / 2
    const y = centerY + radius * Math.sin(angle) - config.entityHeight / 2
    const height = Math.max(config.entityHeight, 60 + entity.columns.length * 22)

    layouts.set(entity.id, {
      index,
      x,
      y,
      width: config.entityWidth,
      height,
      centerX: x + config.entityWidth / 2,
      centerY: y + height / 2,
    })
  })

  return layouts
}

// ==================== 节点创建函数 ====================

/**
 * 格式化列定义文本
 */
export function formatColumnText(columns: ColumnConfig[]): string {
  const lines = columns.map(col => {
    const constraints: string[] = []
    if (col.isPrimary) constraints.push('PK')
    if (col.isForeign) constraints.push('FK')
    if (col.isUnique && !col.isPrimary) constraints.push('UQ')
    if (!col.isNullable) constraints.push('NN')

    const constraintStr = constraints.length > 0 ? ` ${constraints.join(',')}` : ''
    return `${col.name} ${col.dataType}${constraintStr}`
  })

  return lines.join('\n')
}

/**
 * 创建实体节点
 */
export function createEntityNode(
  entity: EntityConfig,
  layout: EntityLayout,
  theme: ErTheme = ER_THEMES.default
): TemplateNode {
  const entityType = entity.type || 'strong'
  const style = theme.entityStyles[entityType]
  const nodeType = entityType === 'weak' ? 'er-weak-entity' : 'er-table-entity-with-columns'

  const columnText = formatColumnText(entity.columns)
  const fullText = `${entity.name}\n${columnText}`

  return {
    id: `entity-${entity.id}`,
    type: nodeType,
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
    text: fullText,
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
    data: {
      entityType,
      columns: entity.columns,
    },
  }
}

// ==================== 关系边创建函数 ====================

/**
 * 创建关系边
 */
export function createRelationshipEdge(
  index: number,
  rel: RelationshipConfig,
  sourceLayout: EntityLayout,
  targetLayout: EntityLayout,
  theme: ErTheme = ER_THEMES.default
): TemplateEdge {
  return {
    id: `rel-${index}`,
    source: `entity-${rel.source}`,
    target: `entity-${rel.target}`,
    label: rel.label,
    style: 'orthogonal',
    lineStyle: rel.isIdentifying ? 'solid' : 'dashed',
    stroke: theme.relationshipStyle.stroke,
    strokeWidth: theme.relationshipStyle.strokeWidth,
    data: {
      sourceCardinality: rel.sourceCardinality,
      targetCardinality: rel.targetCardinality,
      sourceParticipation: rel.sourceParticipation || 'partial',
      targetParticipation: rel.targetParticipation || 'partial',
      isIdentifying: rel.isIdentifying,
    },
  }
}

// ==================== Mermaid代码生成 ====================

/**
 * 生成 Mermaid ER 代码
 */
export function generateMermaidErCode(
  entities: EntityConfig[],
  relationships: RelationshipConfig[]
): string {
  const entityLines = entities.map(entity => {
    const colLines = entity.columns.map(col => {
      const type = col.dataType.toLowerCase()
      const pk = col.isPrimary ? ' PK' : ''
      const fk = col.isForeign ? ' FK' : ''
      return `        ${type} ${col.name}${pk}${fk}`
    }).join('\n')

    return `    ${entity.name} {
${colLines}
    }`
  }).join('\n')

  const relLines = relationships.map(rel => {
    const sourceCard = cardinalityToMermaid(rel.sourceCardinality)
    const targetCard = cardinalityToMermaid(rel.targetCardinality)
    const label = rel.label ? ` : "${rel.label}"` : ''
    const sourceEntity = entities.find(e => e.id === rel.source)?.name
    const targetEntity = entities.find(e => e.id === rel.target)?.name
    return `    ${sourceEntity} ${sourceCard}--${targetCard} ${targetEntity}${label}`
  }).join('\n')

  return `erDiagram
${entityLines}${relLines ? '\n' + relLines : ''}`
}

/**
 * 基数转换为 Mermaid 符号
 */
export function cardinalityToMermaid(cardinality: CardinalityType): string {
  switch (cardinality) {
    case 'one':
      return '||'
    case 'many':
      return '}o'
    case 'zero-or-one':
      return '|o'
    case 'one-or-many':
      return '}|'
    case 'zero-or-many':
      return 'o{'
    default:
      return '||'
  }
}

// ==================== 模板生成函数 ====================

/**
 * 统一的ER图模板生成器
 * 这是核心函数，用于简化所有模板函数的实现
 */
export function generateErTemplate(
  templateConfig: ErTemplateConfig,
  options: TemplateGenerateOptions = {},
  theme: ErTheme = ER_THEMES.default
): DiagramTemplate {
  const config: ErLayoutConfig = {
    ...DEFAULT_ER_CONFIG,
    startX: options.startX ?? DEFAULT_ER_CONFIG.startX,
    startY: options.startY ?? DEFAULT_ER_CONFIG.startY,
    entitySpacing: options.spacing ?? DEFAULT_ER_CONFIG.entitySpacing,
    direction: options.direction ?? DEFAULT_ER_CONFIG.direction,
  }

  const { entities, relationships } = templateConfig

  // 计算布局
  const layouts = calculateEntityLayouts(entities, config)

  // 创建节点
  const nodes: TemplateNode[] = entities.map(entity => {
    const layout = layouts.get(entity.id)!
    return createEntityNode(entity, layout, theme)
  })

  // 创建边
  const edges: TemplateEdge[] = relationships.map((rel, index) => {
    const sourceLayout = layouts.get(rel.source)!
    const targetLayout = layouts.get(rel.target)!
    return createRelationshipEdge(index, rel, sourceLayout, targetLayout, theme)
  })

  // 处理自引用关系
  relationships.forEach((rel, index) => {
    if (rel.source === rel.target) {
      const edge = edges[index]
      edge.isSelfLoop = true
      edge.selfLoopConfig = {
        direction: 'top',
        radius: 50,
      }
    }
  })

  return {
    id: templateConfig.id,
    name: templateConfig.name,
    description: templateConfig.description,
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidErCode(entities, relationships),
  }
}

// ==================== 辅助函数 ====================

/**
 * 获取模板的元数据
 */
export function getErTemplateMetadata(templateConfig: ErTemplateConfig) {
  return {
    id: templateConfig.id,
    name: templateConfig.name,
    description: templateConfig.description,
    category: templateConfig.category,
    tags: templateConfig.tags,
    difficulty: templateConfig.difficulty,
    entityCount: templateConfig.entities.length,
    relationshipCount: templateConfig.relationships.length,
  }
}

/**
 * 验证ER图配置的有效性
 */
export function validateErTemplateConfig(config: ErTemplateConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 验证实体ID唯一性
  const entityIds = config.entities.map(e => e.id)
  const duplicateIds = entityIds.filter((id, index) => entityIds.indexOf(id) !== index)
  if (duplicateIds.length > 0) {
    errors.push(`重复的实体ID: ${duplicateIds.join(', ')}`)
  }

  // 验证关系引用的实体存在
  config.relationships.forEach((rel, index) => {
    if (!entityIds.includes(rel.source)) {
      errors.push(`关系${index}: 源实体"${rel.source}"不存在`)
    }
    if (!entityIds.includes(rel.target)) {
      errors.push(`关系${index}: 目标实体"${rel.target}"不存在`)
    }
  })

  // 验证每个实体至少有一个主键
  config.entities.forEach(entity => {
    const hasPrimaryKey = entity.columns.some(col => col.isPrimary)
    if (!hasPrimaryKey) {
      errors.push(`实体"${entity.name}"缺少主键`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
