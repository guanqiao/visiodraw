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
  // 参数校验
  if (!templateConfig.entities || !Array.isArray(templateConfig.entities)) {
    throw new Error('Template must have a valid entities array')
  }
  if (!templateConfig.relationships || !Array.isArray(templateConfig.relationships)) {
    throw new Error('Template must have a valid relationships array')
  }

  const config: ErLayoutConfig = {
    ...DEFAULT_ER_CONFIG,
    startX: options.startX ?? DEFAULT_ER_CONFIG.startX,
    startY: options.startY ?? DEFAULT_ER_CONFIG.startY,
    entitySpacing: options.spacing ?? DEFAULT_ER_CONFIG.entitySpacing,
    direction: options.direction ?? DEFAULT_ER_CONFIG.direction,
  }

  // 验证布局配置
  validateLayoutConfig(config)

  const { entities, relationships } = templateConfig

  // 验证实体ID唯一性
  const entityIdList = entities.map(e => e.id)
  const duplicateIds = entityIdList.filter((id, index) => entityIdList.indexOf(id) !== index)
  if (duplicateIds.length > 0) {
    throw new Error(`Duplicate entity IDs: ${duplicateIds.join(', ')}`)
  }

  // 验证实体配置
  entities.forEach(validateEntityConfig)

  // 验证关系配置
  const entityIds = new Set(entityIdList)
  relationships.forEach(rel => validateRelationshipConfig(rel, entityIds))

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

// ==================== 实体适配器 ====================

/**
 * 实体布局适配器
 * 将内部布局格式转换为模板使用的格式
 */
export function adaptEntityLayout(layout: EntityLayout): {
  index: number
  x: number
  y: number
  width: number
  height: number
  centerX: number
  centerY: number
} {
  return {
    index: layout.index,
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
    centerX: layout.centerX,
    centerY: layout.centerY,
  }
}

/**
 * 批量适配实体布局
 */
export function adaptEntityLayouts(layouts: Map<string, EntityLayout>): Map<string, ReturnType<typeof adaptEntityLayout>> {
  const result = new Map<string, ReturnType<typeof adaptEntityLayout>>()
  layouts.forEach((layout, id) => {
    result.set(id, adaptEntityLayout(layout))
  })
  return result
}

/**
 * 将共享库的节点转换为 TemplateNode
 * 自动提取所有非 undefined 属性
 */
export function adaptNodeToTemplate<T extends Record<string, any>>(node: T): TemplateNode {
  const result: Record<string, any> = {}

  // 提取所有非 undefined 的属性
  for (const [key, value] of Object.entries(node)) {
    if (value !== undefined) {
      result[key] = value
    }
  }

  return result as TemplateNode
}

/**
 * 批量转换节点数组
 */
export function adaptNodesToTemplate<T extends Record<string, any>>(nodes: T[]): TemplateNode[] {
  return nodes.map(adaptNodeToTemplate)
}

// ==================== 参数校验 ====================

/**
 * 验证实体配置
 */
export function validateEntityConfig(config: EntityConfig): void {
  if (!config.id || typeof config.id !== 'string') {
    throw new Error('Entity must have a valid id')
  }
  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Entity must have a valid name')
  }
  if (!Array.isArray(config.columns) || config.columns.length === 0) {
    throw new Error(`Entity "${config.name}" must have at least one column`)
  }

  // 验证列配置
  const columnNames = new Set<string>()
  config.columns.forEach((col, index) => {
    if (!col.name || typeof col.name !== 'string') {
      throw new Error(`Entity "${config.name}" column ${index} must have a valid name`)
    }
    if (columnNames.has(col.name)) {
      throw new Error(`Entity "${config.name}" has duplicate column name: ${col.name}`)
    }
    columnNames.add(col.name)
  })

  // 验证每个实体至少有一个主键
  const hasPrimaryKey = config.columns.some(col => col.isPrimary)
  if (!hasPrimaryKey) {
    throw new Error(`Entity "${config.name}" must have at least one primary key`)
  }
}

/**
 * 验证关系配置
 */
export function validateRelationshipConfig(config: RelationshipConfig, entityIds: Set<string>): void {
  if (!config.source || typeof config.source !== 'string') {
    throw new Error('Relationship must have a valid source entity')
  }
  if (!config.target || typeof config.target !== 'string') {
    throw new Error('Relationship must have a valid target entity')
  }
  if (!entityIds.has(config.source)) {
    throw new Error(`Relationship source entity "${config.source}" not found`)
  }
  if (!entityIds.has(config.target)) {
    throw new Error(`Relationship target entity "${config.target}" not found`)
  }

  // 验证基数类型
  const validCardinalities: CardinalityType[] = ['one', 'many', 'zero-or-one', 'one-or-many', 'zero-or-many']
  if (!validCardinalities.includes(config.sourceCardinality)) {
    throw new Error(`Invalid source cardinality: ${config.sourceCardinality}`)
  }
  if (!validCardinalities.includes(config.targetCardinality)) {
    throw new Error(`Invalid target cardinality: ${config.targetCardinality}`)
  }
}

/**
 * 验证布局配置
 */
export function validateLayoutConfig(config: ErLayoutConfig): void {
  if (config.startX < 0) {
    throw new Error('startX must be non-negative')
  }
  if (config.startY < 0) {
    throw new Error('startY must be non-negative')
  }
  if (config.entityWidth < 50) {
    throw new Error('entityWidth must be at least 50')
  }
  if (config.entityHeight < 50) {
    throw new Error('entityHeight must be at least 50')
  }
  if (config.entitySpacing < config.entityWidth) {
    throw new Error('entitySpacing must be at least entityWidth')
  }

  const validAlgorithms: LayoutAlgorithm[] = ['hierarchical', 'grid', 'force', 'circular']
  if (!validAlgorithms.includes(config.layoutAlgorithm)) {
    throw new Error(`Invalid layout algorithm: ${config.layoutAlgorithm}`)
  }
}

// ==================== 高级工具函数 ====================

/**
 * 获取实体之间的关系路径
 * 用于分析实体间的依赖关系
 */
export function getRelationshipPaths(
  entities: EntityConfig[],
  relationships: RelationshipConfig[],
  startEntityId: string
): { entityId: string; path: string[]; depth: number }[] {
  const paths: { entityId: string; path: string[]; depth: number }[] = []
  const visited = new Set<string>()

  function traverse(currentId: string, currentPath: string[], depth: number) {
    if (visited.has(currentId)) return
    visited.add(currentId)

    paths.push({
      entityId: currentId,
      path: [...currentPath],
      depth,
    })

    // 查找与当前实体相关的所有关系
    const relatedRels = relationships.filter(
      rel => rel.source === currentId || rel.target === currentId
    )

    relatedRels.forEach(rel => {
      const nextId = rel.source === currentId ? rel.target : rel.source
      if (!visited.has(nextId)) {
        traverse(nextId, [...currentPath, currentId], depth + 1)
      }
    })
  }

  traverse(startEntityId, [], 0)
  return paths
}

/**
 * 分析实体的连接度（关联的实体数量）
 */
export function analyzeEntityConnectivity(
  entities: EntityConfig[],
  relationships: RelationshipConfig[]
): Map<string, { incoming: number; outgoing: number; total: number }> {
  const connectivity = new Map<string, { incoming: number; outgoing: number; total: number }>()

  entities.forEach(entity => {
    const incoming = relationships.filter(rel => rel.target === entity.id).length
    const outgoing = relationships.filter(rel => rel.source === entity.id).length
    connectivity.set(entity.id, {
      incoming,
      outgoing,
      total: incoming + outgoing,
    })
  })

  return connectivity
}

/**
 * 根据连接度排序实体（用于优化布局）
 */
export function sortEntitiesByConnectivity(
  entities: EntityConfig[],
  relationships: RelationshipConfig[]
): EntityConfig[] {
  const connectivity = analyzeEntityConnectivity(entities, relationships)

  return [...entities].sort((a, b) => {
    const connA = connectivity.get(a.id) || { total: 0 }
    const connB = connectivity.get(b.id) || { total: 0 }
    return connB.total - connA.total // 降序排列
  })
}

/**
 * 生成数据库表创建SQL
 */
export function generateCreateTableSQL(entity: EntityConfig): string {
  const columns: string[] = entity.columns.map(col => {
    let def = `  ${col.name} ${col.dataType}`
    if (col.isPrimary) {
      def += ' PRIMARY KEY'
    }
    if (!col.isNullable) {
      def += ' NOT NULL'
    }
    if (col.isUnique) {
      def += ' UNIQUE'
    }
    if (col.defaultValue !== undefined) {
      def += ` DEFAULT ${col.defaultValue}`
    }
    return def
  })

  return `CREATE TABLE ${entity.name} (
${columns.join(',\n')}
);`
}

/**
 * 生成所有实体的SQL DDL
 */
export function generateAllTablesSQL(entities: EntityConfig[]): string {
  return entities.map(generateCreateTableSQL).join('\n\n')
}

/**
 * 生成外键约束SQL
 */
export function generateForeignKeySQL(
  relationship: RelationshipConfig,
  entities: EntityConfig[]
): string | null {
  const sourceEntity = entities.find(e => e.id === relationship.source)
  const targetEntity = entities.find(e => e.id === relationship.target)

  if (!sourceEntity || !targetEntity) return null

  // 查找外键列（通常是目标实体的主键）
  const targetPrimaryKey = targetEntity.columns.find(col => col.isPrimary)
  if (!targetPrimaryKey) return null

  return `ALTER TABLE ${sourceEntity.name}
ADD CONSTRAINT fk_${relationship.source}_${relationship.target}
FOREIGN KEY (${targetPrimaryKey.name}_id) REFERENCES ${targetEntity.name}(${targetPrimaryKey.name});`
}

/**
 * 生成索引创建SQL
 */
export function generateIndexSQL(entity: EntityConfig): string[] {
  const indexes: string[] = []

  // 为外键列创建索引
  entity.columns.forEach(col => {
    if (col.isForeign) {
      indexes.push(`CREATE INDEX idx_${entity.name}_${col.name} ON ${entity.name}(${col.name});`)
    }
  })

  // 为唯一约束创建索引
  entity.columns.forEach(col => {
    if (col.isUnique && !col.isPrimary) {
      indexes.push(`CREATE UNIQUE INDEX idx_${entity.name}_${col.name}_unique ON ${entity.name}(${col.name});`)
    }
  })

  return indexes
}
