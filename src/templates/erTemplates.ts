/**
 * ER图模板
 * 对标 Mermaid erDiagram
 * 遵循 ER 建模规范
 *
 * 结构说明：
 * - 实体（Entity）：矩形表示，包含表名和字段列表
 * - 弱实体（Weak Entity）：双边框矩形，依赖强实体存在
 * - 关系（Relationship）：菱形或连线，表示实体间关联
 * - 属性（Attribute）：椭圆或表格内的字段定义
 * - 基数约束（Cardinality）：Crow's Foot 标记表示关系数量
 * - 参与度约束（Participation）：双线表示全参与，单线表示部分参与
 *
 * 设计原则：
 * 1. 使用 Crow's Foot 表示法清晰表达基数关系
 * 2. 实体采用专业配色方案区分类型
 * 3. 支持多种布局算法（层次、网格、力导向）
 * 4. 关系线带基数标记和参与度约束
 * 5. 自动生成准确的 Mermaid 代码
 */

import type { DiagramTemplate, TemplateGenerateOptions, TemplateNode, TemplateEdge } from '../types/diagramTemplate'

// ==================== 布局配置 ====================
interface ErLayoutConfig {
  startX: number
  startY: number
  entityWidth: number
  entityHeight: number
  entitySpacing: number
  relationshipSpacing: number
  attributeSpacing: number
  layoutAlgorithm: 'hierarchical' | 'grid' | 'force' | 'circular'
  direction: 'vertical' | 'horizontal'
}

const DEFAULT_CONFIG: ErLayoutConfig = {
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

// ==================== 样式配置 - 专业ER图配色 ====================
const ER_STYLES = {
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

// ==================== 类型定义 ====================
type EntityType = 'strong' | 'weak' | 'associative'
type CardinalityType = 'one' | 'many' | 'zero-or-one' | 'one-or-many' | 'zero-or-many'
type ParticipationType = 'total' | 'partial'

interface EntityConfig {
  id: string
  name: string
  type?: EntityType
  columns: ColumnConfig[]
}

interface ColumnConfig {
  name: string
  dataType: string
  isPrimary?: boolean
  isForeign?: boolean
  isNullable?: boolean
  isUnique?: boolean
  defaultValue?: string
  comment?: string
}

interface RelationshipConfig {
  source: string
  target: string
  sourceCardinality: CardinalityType
  targetCardinality: CardinalityType
  sourceParticipation?: ParticipationType
  targetParticipation?: ParticipationType
  label?: string
  isIdentifying?: boolean
}

// ==================== 工具函数 ====================

/**
 * 计算实体布局
 */
function calculateEntityLayout(
  entities: EntityConfig[],
  config: ErLayoutConfig
): Map<string, { index: number; x: number; y: number; width: number; height: number; centerX: number; centerY: number }> {
  const layouts = new Map()
  const cols = Math.ceil(Math.sqrt(entities.length))

  entities.forEach((entity, index) => {
    let x: number
    let y: number

    switch (config.layoutAlgorithm) {
      case 'grid':
        const col = index % cols
        const row = Math.floor(index / cols)
        x = config.startX + col * config.entitySpacing
        y = config.startY + row * (config.entityHeight + 80)
        break
      case 'hierarchical':
        if (config.direction === 'horizontal') {
          x = config.startX + index * config.entitySpacing
          y = config.startY
        } else {
          x = config.startX
          y = config.startY + index * (config.entityHeight + 80)
        }
        break
      default:
        x = config.startX + index * config.entitySpacing
        y = config.startY
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
 * 格式化列定义文本
 */
function formatColumnText(columns: ColumnConfig[]): string {
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
function createEntityNode(
  entity: EntityConfig,
  layout: any,
  config: ErLayoutConfig
): TemplateNode {
  let style = ER_STYLES.entity
  let nodeType = 'er-table-entity-with-columns'

  switch (entity.type) {
    case 'weak':
      style = ER_STYLES.weakEntity
      nodeType = 'er-weak-entity'
      break
    case 'associative':
      style = ER_STYLES.associativeEntity
      break
  }

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
      entityType: entity.type || 'strong',
      columns: entity.columns,
    },
  }
}

/**
 * 创建关系边
 */
function createRelationshipEdge(
  index: number,
  rel: RelationshipConfig,
  sourceLayout: any,
  targetLayout: any
): TemplateEdge {
  return {
    id: `rel-${index}`,
    source: `entity-${rel.source}`,
    target: `entity-${rel.target}`,
    label: rel.label,
    style: 'orthogonal',
    lineStyle: rel.isIdentifying ? 'solid' : 'dashed',
    data: {
      sourceCardinality: rel.sourceCardinality,
      targetCardinality: rel.targetCardinality,
      sourceParticipation: rel.sourceParticipation || 'partial',
      targetParticipation: rel.targetParticipation || 'partial',
      isIdentifying: rel.isIdentifying,
    },
  }
}

/**
 * 生成 Mermaid ER 代码
 */
function generateMermaidCode(
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
    return `    ${entities.find(e => e.id === rel.source)?.name} ${sourceCard}--${targetCard} ${entities.find(e => e.id === rel.target)?.name}${label}`
  }).join('\n')

  return `erDiagram
${entityLines}
${relLines ? '\n' + relLines : ''}`
}

/**
 * 基数转换为 Mermaid 符号
 */
function cardinalityToMermaid(cardinality: CardinalityType): string {
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
 * 简单ER图模板
 * 用户-订单-商品关系
 */
export function createSimpleErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'user',
      name: 'USER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'username', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'email', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'order',
      name: 'ORDER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'user_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'total_amount', dataType: 'decimal(10,2)', isNullable: false },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'product',
      name: 'PRODUCT',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(100)', isNullable: false },
        { name: 'price', dataType: 'decimal(10,2)', isNullable: false },
        { name: 'stock', dataType: 'int', isNullable: false, defaultValue: '0' },
      ],
    },
    {
      id: 'order_item',
      name: 'ORDER_ITEM',
      type: 'associative',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'order_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'product_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'quantity', dataType: 'int', isNullable: false },
        { name: 'unit_price', dataType: 'decimal(10,2)', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'user',
      target: 'order',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'places',
    },
    {
      source: 'order',
      target: 'order_item',
      sourceCardinality: 'one',
      targetCardinality: 'one-or-many',
      label: 'contains',
    },
    {
      source: 'product',
      target: 'order_item',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'included_in',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-simple',
    name: '简单ER图',
    description: '用户-订单-商品关系，展示基础的电商数据模型',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 一对多关系模板
 * 部门与员工
 */
export function createOneToManyErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'department',
      name: 'DEPARTMENT',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'location', dataType: 'varchar(100)' },
        { name: 'budget', dataType: 'decimal(12,2)' },
      ],
    },
    {
      id: 'employee',
      name: 'EMPLOYEE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'dept_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'email', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'hire_date', dataType: 'date', isNullable: false },
        { name: 'salary', dataType: 'decimal(10,2)' },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'department',
      target: 'employee',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      sourceParticipation: 'partial',
      targetParticipation: 'total',
      label: 'employs',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-one-to-many',
    name: '一对多关系',
    description: '部门与员工的一对多关系，展示基础的组织架构模型',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 多对多关系模板
 * 学生与课程
 */
export function createManyToManyErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'student',
      name: 'STUDENT',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'student_no', dataType: 'varchar(20)', isNullable: false, isUnique: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'major', dataType: 'varchar(50)' },
        { name: 'enrollment_date', dataType: 'date', isNullable: false },
      ],
    },
    {
      id: 'course',
      name: 'COURSE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'course_code', dataType: 'varchar(20)', isNullable: false, isUnique: true },
        { name: 'title', dataType: 'varchar(100)', isNullable: false },
        { name: 'credits', dataType: 'int', isNullable: false },
        { name: 'department', dataType: 'varchar(50)' },
      ],
    },
    {
      id: 'enrollment',
      name: 'ENROLLMENT',
      type: 'associative',
      columns: [
        { name: 'student_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'course_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'semester', dataType: 'varchar(20)', isPrimary: true },
        { name: 'grade', dataType: 'varchar(2)' },
        { name: 'enrolled_at', dataType: 'timestamp', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'student',
      target: 'enrollment',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'enrolls_in',
    },
    {
      source: 'course',
      target: 'enrollment',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'has_students',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-many-to-many',
    name: '多对多关系',
    description: '学生与课程的多对多关系，通过关联实体ENROLLMENT实现',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 自引用关系模板
 * 员工上下级关系
 */
export function createSelfReferenceErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'employee',
      name: 'EMPLOYEE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'manager_id', dataType: 'int', isForeign: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'position', dataType: 'varchar(50)' },
        { name: 'email', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'hire_date', dataType: 'date', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'employee',
      target: 'employee',
      sourceCardinality: 'zero-or-one',
      targetCardinality: 'zero-or-many',
      label: 'manages',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) => ({
    ...createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!),
    isSelfLoop: true,
    selfLoopConfig: {
      direction: 'top',
      radius: 50,
    },
  }))

  return {
    id: 'er-self-reference',
    name: '自引用关系',
    description: '员工的上下级关系，展示递归关联模式',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 电商系统ER图模板
 */
export function createEcommerceErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  config.layoutAlgorithm = 'hierarchical'

  const entities: EntityConfig[] = [
    {
      id: 'customer',
      name: 'CUSTOMER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'email', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'password_hash', dataType: 'varchar(255)', isNullable: false },
        { name: 'first_name', dataType: 'varchar(50)' },
        { name: 'last_name', dataType: 'varchar(50)' },
        { name: 'phone', dataType: 'varchar(20)' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'address',
      name: 'ADDRESS',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'customer_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'type', dataType: 'varchar(20)', isNullable: false },
        { name: 'street', dataType: 'varchar(200)', isNullable: false },
        { name: 'city', dataType: 'varchar(50)', isNullable: false },
        { name: 'zip_code', dataType: 'varchar(20)' },
        { name: 'is_default', dataType: 'boolean', defaultValue: 'false' },
      ],
    },
    {
      id: 'category',
      name: 'CATEGORY',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'parent_id', dataType: 'int', isForeign: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'slug', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'description', dataType: 'text' },
      ],
    },
    {
      id: 'product',
      name: 'PRODUCT',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'category_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'sku', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'name', dataType: 'varchar(100)', isNullable: false },
        { name: 'description', dataType: 'text' },
        { name: 'price', dataType: 'decimal(10,2)', isNullable: false },
        { name: 'stock_quantity', dataType: 'int', isNullable: false, defaultValue: '0' },
        { name: 'is_active', dataType: 'boolean', defaultValue: 'true' },
      ],
    },
    {
      id: 'order',
      name: 'ORDER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'customer_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'address_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'order_number', dataType: 'varchar(20)', isNullable: false, isUnique: true },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
        { name: 'total_amount', dataType: 'decimal(12,2)', isNullable: false },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'order_item',
      name: 'ORDER_ITEM',
      type: 'associative',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'order_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'product_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'quantity', dataType: 'int', isNullable: false },
        { name: 'unit_price', dataType: 'decimal(10,2)', isNullable: false },
        { name: 'subtotal', dataType: 'decimal(10,2)', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'customer',
      target: 'address',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'has',
    },
    {
      source: 'category',
      target: 'product',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'contains',
    },
    {
      source: 'customer',
      target: 'order',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'places',
    },
    {
      source: 'order',
      target: 'order_item',
      sourceCardinality: 'one',
      targetCardinality: 'one-or-many',
      label: 'includes',
    },
    {
      source: 'product',
      target: 'order_item',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'ordered_as',
    },
    {
      source: 'address',
      target: 'order',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'ships_to',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-ecommerce',
    name: '电商系统ER图',
    description: '完整的电商系统数据模型，包含客户、商品、订单、地址等实体',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 博客系统ER图模板
 */
export function createBlogErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'user',
      name: 'USER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'username', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'email', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'password_hash', dataType: 'varchar(255)', isNullable: false },
        { name: 'role', dataType: 'varchar(20)', isNullable: false, defaultValue: 'reader' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'category',
      name: 'CATEGORY',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'slug', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'description', dataType: 'text' },
      ],
    },
    {
      id: 'post',
      name: 'POST',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'author_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'category_id', dataType: 'int', isForeign: true },
        { name: 'title', dataType: 'varchar(200)', isNullable: false },
        { name: 'slug', dataType: 'varchar(200)', isNullable: false, isUnique: true },
        { name: 'content', dataType: 'text', isNullable: false },
        { name: 'status', dataType: 'varchar(20)', isNullable: false, defaultValue: 'draft' },
        { name: 'published_at', dataType: 'timestamp' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'tag',
      name: 'TAG',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'slug', dataType: 'varchar(50)', isNullable: false, isUnique: true },
      ],
    },
    {
      id: 'post_tag',
      name: 'POST_TAG',
      type: 'associative',
      columns: [
        { name: 'post_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'tag_id', dataType: 'int', isPrimary: true, isForeign: true },
      ],
    },
    {
      id: 'comment',
      name: 'COMMENT',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'post_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'author_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'parent_id', dataType: 'int', isForeign: true },
        { name: 'content', dataType: 'text', isNullable: false },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'user',
      target: 'post',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'writes',
    },
    {
      source: 'category',
      target: 'post',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'contains',
    },
    {
      source: 'post',
      target: 'post_tag',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'tagged_with',
    },
    {
      source: 'tag',
      target: 'post_tag',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'used_in',
    },
    {
      source: 'post',
      target: 'comment',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'has',
    },
    {
      source: 'user',
      target: 'comment',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'writes',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-blog',
    name: '博客系统ER图',
    description: '博客文章、评论、标签、分类系统，支持多对多标签关联',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 社交网络ER图模板
 */
export function createSocialNetworkErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'user',
      name: 'USER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'username', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'email', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'password_hash', dataType: 'varchar(255)', isNullable: false },
        { name: 'bio', dataType: 'text' },
        { name: 'avatar_url', dataType: 'varchar(255)' },
        { name: 'is_verified', dataType: 'boolean', defaultValue: 'false' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'post',
      name: 'POST',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'user_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'content', dataType: 'text' },
        { name: 'media_url', dataType: 'varchar(255)' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'follow',
      name: 'FOLLOW',
      type: 'associative',
      columns: [
        { name: 'follower_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'following_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'like',
      name: 'LIKE',
      type: 'associative',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'user_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'post_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'message',
      name: 'MESSAGE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'sender_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'receiver_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'content', dataType: 'text', isNullable: false },
        { name: 'is_read', dataType: 'boolean', defaultValue: 'false' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'notification',
      name: 'NOTIFICATION',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'user_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'type', dataType: 'varchar(50)', isNullable: false },
        { name: 'reference_id', dataType: 'int' },
        { name: 'is_read', dataType: 'boolean', defaultValue: 'false' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'user',
      target: 'post',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'creates',
    },
    {
      source: 'user',
      target: 'follow',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'follows',
    },
    {
      source: 'user',
      target: 'like',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'gives',
    },
    {
      source: 'post',
      target: 'like',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'receives',
    },
    {
      source: 'user',
      target: 'message',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'sends',
    },
    {
      source: 'user',
      target: 'notification',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'receives',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-social-network',
    name: '社交网络ER图',
    description: '用户、帖子、关注、点赞、消息、通知系统',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 库存管理系统ER图模板
 */
export function createInventoryErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'product',
      name: 'PRODUCT',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'sku', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'name', dataType: 'varchar(100)', isNullable: false },
        { name: 'description', dataType: 'text' },
        { name: 'unit_price', dataType: 'decimal(10,2)', isNullable: false },
        { name: 'is_active', dataType: 'boolean', defaultValue: 'true' },
      ],
    },
    {
      id: 'warehouse',
      name: 'WAREHOUSE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'code', dataType: 'varchar(20)', isNullable: false, isUnique: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'location', dataType: 'varchar(200)' },
        { name: 'manager_name', dataType: 'varchar(50)' },
      ],
    },
    {
      id: 'inventory',
      name: 'INVENTORY',
      type: 'associative',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'product_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'warehouse_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'quantity', dataType: 'int', isNullable: false, defaultValue: '0' },
        { name: 'reserved_qty', dataType: 'int', defaultValue: '0' },
        { name: 'reorder_level', dataType: 'int', defaultValue: '10' },
        { name: 'last_updated', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'supplier',
      name: 'SUPPLIER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(100)', isNullable: false },
        { name: 'contact_person', dataType: 'varchar(50)' },
        { name: 'email', dataType: 'varchar(100)' },
        { name: 'phone', dataType: 'varchar(20)' },
        { name: 'address', dataType: 'varchar(200)' },
      ],
    },
    {
      id: 'purchase_order',
      name: 'PURCHASE_ORDER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'supplier_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'po_number', dataType: 'varchar(20)', isNullable: false, isUnique: true },
        { name: 'order_date', dataType: 'date', isNullable: false },
        { name: 'expected_date', dataType: 'date' },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
        { name: 'total_amount', dataType: 'decimal(12,2)', isNullable: false },
      ],
    },
    {
      id: 'purchase_item',
      name: 'PURCHASE_ITEM',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'po_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'product_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'quantity', dataType: 'int', isNullable: false },
        { name: 'unit_price', dataType: 'decimal(10,2)', isNullable: false },
        { name: 'received_qty', dataType: 'int', defaultValue: '0' },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'product',
      target: 'inventory',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'stored_in',
    },
    {
      source: 'warehouse',
      target: 'inventory',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'contains',
    },
    {
      source: 'supplier',
      target: 'purchase_order',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'receives',
    },
    {
      source: 'purchase_order',
      target: 'purchase_item',
      sourceCardinality: 'one',
      targetCardinality: 'one-or-many',
      label: 'includes',
    },
    {
      source: 'product',
      target: 'purchase_item',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'ordered_as',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-inventory',
    name: '库存管理系统ER图',
    description: '产品、仓库、库存、供应商、采购订单系统',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 图书馆管理系统ER图模板
 */
export function createLibraryErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'member',
      name: 'MEMBER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'member_no', dataType: 'varchar(20)', isNullable: false, isUnique: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'email', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'phone', dataType: 'varchar(20)' },
        { name: 'address', dataType: 'varchar(200)' },
        { name: 'membership_type', dataType: 'varchar(20)', isNullable: false },
        { name: 'expiry_date', dataType: 'date' },
      ],
    },
    {
      id: 'book',
      name: 'BOOK',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'isbn', dataType: 'varchar(20)', isNullable: false, isUnique: true },
        { name: 'title', dataType: 'varchar(200)', isNullable: false },
        { name: 'author', dataType: 'varchar(100)', isNullable: false },
        { name: 'publisher', dataType: 'varchar(100)' },
        { name: 'publish_year', dataType: 'int' },
        { name: 'category', dataType: 'varchar(50)' },
        { name: 'total_copies', dataType: 'int', isNullable: false, defaultValue: '1' },
        { name: 'available_copies', dataType: 'int', isNullable: false, defaultValue: '1' },
      ],
    },
    {
      id: 'loan',
      name: 'LOAN',
      type: 'associative',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'member_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'book_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'borrow_date', dataType: 'date', isNullable: false },
        { name: 'due_date', dataType: 'date', isNullable: false },
        { name: 'return_date', dataType: 'date' },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
      ],
    },
    {
      id: 'reservation',
      name: 'RESERVATION',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'member_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'book_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'reserve_date', dataType: 'date', isNullable: false },
        { name: 'expiry_date', dataType: 'date', isNullable: false },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
      ],
    },
    {
      id: 'fine',
      name: 'FINE',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'loan_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'amount', dataType: 'decimal(8,2)', isNullable: false },
        { name: 'reason', dataType: 'varchar(100)', isNullable: false },
        { name: 'is_paid', dataType: 'boolean', defaultValue: 'false' },
        { name: 'paid_date', dataType: 'date' },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'member',
      target: 'loan',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'borrows',
    },
    {
      source: 'book',
      target: 'loan',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'lent_to',
    },
    {
      source: 'member',
      target: 'reservation',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'reserves',
    },
    {
      source: 'book',
      target: 'reservation',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'reserved_by',
    },
    {
      source: 'loan',
      target: 'fine',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-one',
      label: 'incurs',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-library',
    name: '图书馆管理系统ER图',
    description: '会员、图书、借阅、预约、罚款系统',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * HR人力资源管理系统ER图模板
 */
export function createHrErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'department',
      name: 'DEPARTMENT',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'code', dataType: 'varchar(10)', isNullable: false, isUnique: true },
        { name: 'location', dataType: 'varchar(50)' },
        { name: 'budget', dataType: 'decimal(12,2)' },
      ],
    },
    {
      id: 'employee',
      name: 'EMPLOYEE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'dept_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'manager_id', dataType: 'int', isForeign: true },
        { name: 'employee_no', dataType: 'varchar(20)', isNullable: false, isUnique: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'email', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'hire_date', dataType: 'date', isNullable: false },
        { name: 'status', dataType: 'varchar(20)', isNullable: false, defaultValue: 'active' },
      ],
    },
    {
      id: 'position',
      name: 'POSITION',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'title', dataType: 'varchar(50)', isNullable: false },
        { name: 'level', dataType: 'int', isNullable: false },
        { name: 'department', dataType: 'varchar(50)' },
        { name: 'min_salary', dataType: 'decimal(10,2)' },
        { name: 'max_salary', dataType: 'decimal(10,2)' },
      ],
    },
    {
      id: 'employee_position',
      name: 'EMPLOYEE_POSITION',
      type: 'associative',
      columns: [
        { name: 'employee_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'position_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'start_date', dataType: 'date', isPrimary: true },
        { name: 'end_date', dataType: 'date' },
        { name: 'is_current', dataType: 'boolean', defaultValue: 'true' },
      ],
    },
    {
      id: 'salary',
      name: 'SALARY',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'employee_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'amount', dataType: 'decimal(10,2)', isNullable: false },
        { name: 'effective_date', dataType: 'date', isNullable: false },
        { name: 'currency', dataType: 'varchar(3)', defaultValue: 'CNY' },
      ],
    },
    {
      id: 'attendance',
      name: 'ATTENDANCE',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'employee_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'date', dataType: 'date', isNullable: false },
        { name: 'check_in', dataType: 'time' },
        { name: 'check_out', dataType: 'time' },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
      ],
    },
    {
      id: 'leave',
      name: 'LEAVE',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'employee_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'type', dataType: 'varchar(20)', isNullable: false },
        { name: 'start_date', dataType: 'date', isNullable: false },
        { name: 'end_date', dataType: 'date', isNullable: false },
        { name: 'days', dataType: 'int', isNullable: false },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'department',
      target: 'employee',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'employs',
    },
    {
      source: 'employee',
      target: 'employee',
      sourceCardinality: 'zero-or-one',
      targetCardinality: 'zero-or-many',
      label: 'manages',
    },
    {
      source: 'employee',
      target: 'employee_position',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'holds',
    },
    {
      source: 'position',
      target: 'employee_position',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'assigned_to',
    },
    {
      source: 'employee',
      target: 'salary',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'earns',
    },
    {
      source: 'employee',
      target: 'attendance',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'records',
    },
    {
      source: 'employee',
      target: 'leave',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'requests',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-hr',
    name: 'HR人力资源ER图',
    description: '部门、员工、职位、薪资、考勤、请假系统',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 权限管理系统ER图模板（RBAC）
 */
export function createRbacErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'user',
      name: 'USER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'username', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'email', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'password_hash', dataType: 'varchar(255)', isNullable: false },
        { name: 'is_active', dataType: 'boolean', defaultValue: 'true' },
        { name: 'last_login', dataType: 'timestamp' },
      ],
    },
    {
      id: 'role',
      name: 'ROLE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'description', dataType: 'text' },
        { name: 'is_system', dataType: 'boolean', defaultValue: 'false' },
      ],
    },
    {
      id: 'permission',
      name: 'PERMISSION',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'code', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'resource', dataType: 'varchar(50)', isNullable: false },
        { name: 'action', dataType: 'varchar(20)', isNullable: false },
      ],
    },
    {
      id: 'user_role',
      name: 'USER_ROLE',
      type: 'associative',
      columns: [
        { name: 'user_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'role_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'granted_at', dataType: 'timestamp', isNullable: false },
        { name: 'granted_by', dataType: 'int' },
      ],
    },
    {
      id: 'role_permission',
      name: 'ROLE_PERMISSION',
      type: 'associative',
      columns: [
        { name: 'role_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'permission_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'granted_at', dataType: 'timestamp', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'user',
      target: 'user_role',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'has',
    },
    {
      source: 'role',
      target: 'user_role',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'assigned_to',
    },
    {
      source: 'role',
      target: 'role_permission',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'grants',
    },
    {
      source: 'permission',
      target: 'role_permission',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'belongs_to',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-rbac',
    name: '权限管理系统ER图（RBAC）',
    description: '基于角色的访问控制模型，用户-角色-权限多对多关系',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 内容管理系统ER图模板（CMS）
 */
export function createCmsErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'site',
      name: 'SITE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'domain', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'theme', dataType: 'varchar(50)' },
        { name: 'is_active', dataType: 'boolean', defaultValue: 'true' },
      ],
    },
    {
      id: 'content_type',
      name: 'CONTENT_TYPE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false },
        { name: 'slug', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'description', dataType: 'text' },
        { name: 'has_versions', dataType: 'boolean', defaultValue: 'false' },
      ],
    },
    {
      id: 'content',
      name: 'CONTENT',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'site_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'type_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'title', dataType: 'varchar(200)', isNullable: false },
        { name: 'slug', dataType: 'varchar(200)', isNullable: false },
        { name: 'body', dataType: 'text' },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
        { name: 'published_at', dataType: 'timestamp' },
      ],
    },
    {
      id: 'media',
      name: 'MEDIA',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'site_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'filename', dataType: 'varchar(255)', isNullable: false },
        { name: 'file_type', dataType: 'varchar(50)', isNullable: false },
        { name: 'file_size', dataType: 'int', isNullable: false },
        { name: 'url', dataType: 'varchar(500)', isNullable: false },
        { name: 'uploaded_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'content_media',
      name: 'CONTENT_MEDIA',
      type: 'associative',
      columns: [
        { name: 'content_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'media_id', dataType: 'int', isPrimary: true, isForeign: true },
        { name: 'sort_order', dataType: 'int', defaultValue: '0' },
      ],
    },
    {
      id: 'menu',
      name: 'MENU',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'site_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'parent_id', dataType: 'int', isForeign: true },
        { name: 'label', dataType: 'varchar(100)', isNullable: false },
        { name: 'url', dataType: 'varchar(500)' },
        { name: 'sort_order', dataType: 'int', defaultValue: '0' },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'site',
      target: 'content',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'has',
    },
    {
      source: 'content_type',
      target: 'content',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'defines',
    },
    {
      source: 'site',
      target: 'media',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'stores',
    },
    {
      source: 'content',
      target: 'content_media',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'uses',
    },
    {
      source: 'media',
      target: 'content_media',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'attached_to',
    },
    {
      source: 'site',
      target: 'menu',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'navigates',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-cms',
    name: '内容管理系统ER图（CMS）',
    description: '站点、内容类型、内容、媒体、菜单系统',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 工作流系统ER图模板
 */
export function createWorkflowErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'workflow',
      name: 'WORKFLOW',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(100)', isNullable: false },
        { name: 'description', dataType: 'text' },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
        { name: 'version', dataType: 'int', isNullable: false, defaultValue: '1' },
      ],
    },
    {
      id: 'workflow_step',
      name: 'WORKFLOW_STEP',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'workflow_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'name', dataType: 'varchar(100)', isNullable: false },
        { name: 'step_order', dataType: 'int', isNullable: false },
        { name: 'approver_role', dataType: 'varchar(50)' },
        { name: 'is_required', dataType: 'boolean', defaultValue: 'true' },
      ],
    },
    {
      id: 'workflow_instance',
      name: 'WORKFLOW_INSTANCE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'workflow_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'requester_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'reference_type', dataType: 'varchar(50)', isNullable: false },
        { name: 'reference_id', dataType: 'int', isNullable: false },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
        { name: 'started_at', dataType: 'timestamp', isNullable: false },
        { name: 'completed_at', dataType: 'timestamp' },
      ],
    },
    {
      id: 'workflow_task',
      name: 'WORKFLOW_TASK',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'instance_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'step_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'assignee_id', dataType: 'int', isForeign: true },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
        { name: 'comment', dataType: 'text' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
        { name: 'completed_at', dataType: 'timestamp' },
      ],
    },
    {
      id: 'workflow_transition',
      name: 'WORKFLOW_TRANSITION',
      type: 'associative',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'from_step_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'to_step_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'condition', dataType: 'varchar(100)' },
        { name: 'is_default', dataType: 'boolean', defaultValue: 'false' },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'workflow',
      target: 'workflow_step',
      sourceCardinality: 'one',
      targetCardinality: 'one-or-many',
      label: 'contains',
    },
    {
      source: 'workflow',
      target: 'workflow_instance',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'instantiates',
    },
    {
      source: 'workflow_instance',
      target: 'workflow_task',
      sourceCardinality: 'one',
      targetCardinality: 'one-or-many',
      label: 'generates',
    },
    {
      source: 'workflow_step',
      target: 'workflow_task',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'creates',
    },
    {
      source: 'workflow_step',
      target: 'workflow_transition',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'transitions_from',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-workflow',
    name: '工作流系统ER图',
    description: '工作流定义、步骤、实例、任务、转换系统',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 消息通知系统ER图模板
 */
export function createNotificationErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'user',
      name: 'USER',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'username', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'email', dataType: 'varchar(100)', isNullable: false },
        { name: 'phone', dataType: 'varchar(20)' },
        { name: 'notification_prefs', dataType: 'json' },
      ],
    },
    {
      id: 'notification_template',
      name: 'NOTIFICATION_TEMPLATE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'code', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'name', dataType: 'varchar(100)', isNullable: false },
        { name: 'channel', dataType: 'varchar(20)', isNullable: false },
        { name: 'subject', dataType: 'varchar(200)' },
        { name: 'content', dataType: 'text', isNullable: false },
        { name: 'is_active', dataType: 'boolean', defaultValue: 'true' },
      ],
    },
    {
      id: 'notification',
      name: 'NOTIFICATION',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'user_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'template_id', dataType: 'int', isForeign: true },
        { name: 'type', dataType: 'varchar(50)', isNullable: false },
        { name: 'title', dataType: 'varchar(200)' },
        { name: 'content', dataType: 'text', isNullable: false },
        { name: 'channel', dataType: 'varchar(20)', isNullable: false },
        { name: 'is_read', dataType: 'boolean', defaultValue: 'false' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'notification_log',
      name: 'NOTIFICATION_LOG',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'notification_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'status', dataType: 'varchar(20)', isNullable: false },
        { name: 'error_message', dataType: 'text' },
        { name: 'sent_at', dataType: 'timestamp' },
        { name: 'delivered_at', dataType: 'timestamp' },
      ],
    },
    {
      id: 'subscription',
      name: 'SUBSCRIPTION',
      type: 'associative',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'user_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'topic', dataType: 'varchar(50)', isNullable: false },
        { name: 'channel', dataType: 'varchar(20)', isNullable: false },
        { name: 'is_active', dataType: 'boolean', defaultValue: 'true' },
        { name: 'subscribed_at', dataType: 'timestamp', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'user',
      target: 'notification',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'receives',
    },
    {
      source: 'notification_template',
      target: 'notification',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'generates',
    },
    {
      source: 'notification',
      target: 'notification_log',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'logs',
    },
    {
      source: 'user',
      target: 'subscription',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'subscribes',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-notification',
    name: '消息通知系统ER图',
    description: '用户、通知模板、通知、日志、订阅系统',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 文件存储系统ER图模板
 */
export function createFileStorageErTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }

  const entities: EntityConfig[] = [
    {
      id: 'storage_bucket',
      name: 'STORAGE_BUCKET',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'name', dataType: 'varchar(50)', isNullable: false, isUnique: true },
        { name: 'provider', dataType: 'varchar(20)', isNullable: false },
        { name: 'region', dataType: 'varchar(50)' },
        { name: 'is_public', dataType: 'boolean', defaultValue: 'false' },
      ],
    },
    {
      id: 'folder',
      name: 'FOLDER',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'bucket_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'parent_id', dataType: 'int', isForeign: true },
        { name: 'name', dataType: 'varchar(100)', isNullable: false },
        { name: 'path', dataType: 'varchar(500)', isNullable: false },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'file',
      name: 'FILE',
      type: 'strong',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'folder_id', dataType: 'int', isForeign: true },
        { name: 'bucket_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'name', dataType: 'varchar(255)', isNullable: false },
        { name: 'original_name', dataType: 'varchar(255)', isNullable: false },
        { name: 'mime_type', dataType: 'varchar(100)', isNullable: false },
        { name: 'size_bytes', dataType: 'bigint', isNullable: false },
        { name: 'checksum', dataType: 'varchar(64)' },
        { name: 'storage_path', dataType: 'varchar(500)', isNullable: false },
        { name: 'url', dataType: 'varchar(500)' },
        { name: 'uploaded_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'file_version',
      name: 'FILE_VERSION',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'file_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'version_number', dataType: 'int', isNullable: false },
        { name: 'storage_path', dataType: 'varchar(500)', isNullable: false },
        { name: 'size_bytes', dataType: 'bigint', isNullable: false },
        { name: 'is_current', dataType: 'boolean', defaultValue: 'false' },
        { name: 'created_at', dataType: 'timestamp', isNullable: false },
      ],
    },
    {
      id: 'file_metadata',
      name: 'FILE_METADATA',
      type: 'weak',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'file_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'key', dataType: 'varchar(50)', isNullable: false },
        { name: 'value', dataType: 'text' },
        { name: 'data_type', dataType: 'varchar(20)', isNullable: false },
      ],
    },
    {
      id: 'file_share',
      name: 'FILE_SHARE',
      type: 'associative',
      columns: [
        { name: 'id', dataType: 'int', isPrimary: true },
        { name: 'file_id', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'shared_by', dataType: 'int', isForeign: true, isNullable: false },
        { name: 'shared_with', dataType: 'int', isForeign: true },
        { name: 'token', dataType: 'varchar(100)', isNullable: false, isUnique: true },
        { name: 'expires_at', dataType: 'timestamp' },
        { name: 'permission', dataType: 'varchar(20)', isNullable: false },
      ],
    },
  ]

  const relationships: RelationshipConfig[] = [
    {
      source: 'storage_bucket',
      target: 'folder',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'contains',
    },
    {
      source: 'storage_bucket',
      target: 'file',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'stores',
    },
    {
      source: 'folder',
      target: 'file',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'organizes',
    },
    {
      source: 'file',
      target: 'file_version',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'has',
    },
    {
      source: 'file',
      target: 'file_metadata',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'described_by',
    },
    {
      source: 'file',
      target: 'file_share',
      sourceCardinality: 'one',
      targetCardinality: 'zero-or-many',
      label: 'shared_via',
    },
  ]

  const layouts = calculateEntityLayout(entities, config)

  const nodes: TemplateNode[] = entities.map(e => createEntityNode(e, layouts.get(e.id)!, config))

  const edges: TemplateEdge[] = relationships.map((rel, index) =>
    createRelationshipEdge(index, rel, layouts.get(rel.source)!, layouts.get(rel.target)!)
  )

  return {
    id: 'er-file-storage',
    name: '文件存储系统ER图',
    description: '存储桶、文件夹、文件、版本、元数据、分享系统',
    type: 'er',
    nodes,
    edges,
    layout: {
      direction: config.direction,
      spacing: config.entitySpacing,
    },
    mermaidCode: generateMermaidCode(entities, relationships),
  }
}

/**
 * 获取所有ER图模板
 */
export function getErTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    createSimpleErTemplate(options),
    createOneToManyErTemplate(options),
    createManyToManyErTemplate(options),
    createSelfReferenceErTemplate(options),
    createEcommerceErTemplate(options),
    createBlogErTemplate(options),
    createSocialNetworkErTemplate(options),
    createInventoryErTemplate(options),
    createLibraryErTemplate(options),
    createHrErTemplate(options),
    createRbacErTemplate(options),
    createCmsErTemplate(options),
    createWorkflowErTemplate(options),
    createNotificationErTemplate(options),
    createFileStorageErTemplate(options),
  ]
}
