export type ConnectionPointPosition = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'custom'

export interface ConnectionPoint {
  id: string
  x: number
  y: number
  position: ConnectionPointPosition
  isVisible: boolean
  isConnected: boolean
  connectedLineIds: string[]
  isDynamic?: boolean
}

export type ConnectorStyle = 'straight' | 'orthogonal' | 'curved' | 'bezier' | 'metro' | 'manhattan'

export type ConnectorEndStyle = 'none' | 'arrow' | 'dot' | 'diamond' | 'circle' | 'triangle' | 'hollow-triangle' | 'hollow-diamond' | 'open-arrow'

// UML 关系类型
export type UMLRelationType =
  | 'inheritance'      // 继承 (空心三角箭头)
  | 'implementation'   // 实现 (空心三角箭头 + 虚线)
  | 'dependency'       // 依赖 (开放箭头 + 虚线)
  | 'association'      // 关联 (普通箭头或无箭头)
  | 'aggregation'      // 聚合 (空心菱形)
  | 'composition'      // 组合 (实心菱形)
  | 'directed-association' // 定向关联 (箭头)

// ER图关系类型 - 基于 Chen Notation 和 Crow's Foot Notation
export type ERRelationType =
  | 'er-entity-attribute'      // 实体-属性连接
  | 'er-entity-relationship'   // 实体-关系连接
  | 'er-relationship-attribute' // 关系-属性连接
  | 'er-isa-hierarchy'         // ISA层次继承
  | 'er-identifying'           // 标识关系 (弱实体)
  | 'er-non-identifying'       // 非标识关系
  | 'er-total-participation'   // 完全参与 (双线)
  | 'er-partial-participation' // 部分参与 (单线)
  | 'er-crows-foot-one'        // Crow's Foot - 一
  | 'er-crows-foot-many'       // Crow's Foot - 多
  | 'er-crows-foot-zero-one'   // Crow's Foot - 零或一
  | 'er-crows-foot-one-many'   // Crow's Foot - 一或多
  | 'er-crows-foot-zero-many'  // Crow's Foot - 零或多
  | 'er-one-to-one'            // 一对一关系
  | 'er-one-to-many'           // 一对多关系
  | 'er-many-to-many'          // 多对多关系
  | 'er-foreign-key'           // 外键关系

export type LineStyle = 'solid' | 'dashed' | 'dotted'

export type RoutingConstraint = 'horizontal' | 'vertical' | 'none'

export interface ConnectorLabel {
  id: string
  text: string
  position: number // 0-1 along the connector
  offsetX?: number
  offsetY?: number
  fontSize?: number
  color?: string
  backgroundColor?: string
  autoRotate?: boolean
}

export interface Connector {
  id: string
  sourceShapeId: string
  sourcePointId: string
  targetShapeId: string
  targetPointId: string
  style: ConnectorStyle
  lineStyle: LineStyle
  startStyle: ConnectorEndStyle
  endStyle: ConnectorEndStyle
  stroke: string
  strokeWidth: number
  opacity?: number
  labels?: ConnectorLabel[]
  pathPoints?: { x: number; y: number }[]
  isSelected?: boolean
  routingConstraint?: RoutingConstraint
  routingPadding?: number
}

export interface ConnectionPointRenderOptions {
  radius: number
  fill: string
  connectedFill: string
  hoverFill: string
  stroke: string
  strokeWidth: number
  visibleOn: 'hover' | 'always' | 'selected'
}

export const defaultConnectionPointOptions: ConnectionPointRenderOptions = {
  radius: 6,
  fill: '#ffffff',
  connectedFill: '#52c41a',
  hoverFill: '#1890ff',
  stroke: '#1890ff',
  strokeWidth: 2,
  visibleOn: 'hover',
}

export const defaultConnectionPointsConfig: Record<string, ConnectionPointPosition[]> = {
  // 基础图形
  rectangle: ['top', 'bottom', 'left', 'right'],
  'rounded-rectangle': ['top', 'bottom', 'left', 'right'],
  circle: ['top', 'bottom', 'left', 'right'],
  ellipse: ['top', 'bottom', 'left', 'right'],
  triangle: ['top', 'bottom', 'left', 'right'],
  diamond: ['top', 'bottom', 'left', 'right'],
  pentagon: ['top', 'bottom', 'left', 'right'],
  hexagon: ['top', 'bottom', 'left', 'right'],
  star: ['top', 'bottom', 'left', 'right'],
  cross: ['top', 'bottom', 'left', 'right'],

  // 流程图
  process: ['top', 'bottom', 'left', 'right'],
  decision: ['top', 'bottom', 'left', 'right'],
  'start-end': ['left', 'right'],
  'input-output': ['top', 'bottom', 'left', 'right'],
  document: ['top', 'bottom', 'left', 'right'],
  database: ['top', 'bottom', 'left', 'right'],
  preparation: ['top', 'bottom', 'left', 'right'],
  'manual-input': ['top', 'bottom', 'left', 'right'],
  display: ['top', 'bottom', 'left', 'right'],
  'off-page': ['left', 'right'],

  // 网络/云
  server: ['top', 'bottom', 'left', 'right'],
  cloud: ['top', 'bottom', 'left', 'right'],
  router: ['top', 'bottom', 'left', 'right'],
  switch: ['top', 'bottom', 'left', 'right'],
  firewall: ['top', 'bottom', 'left', 'right'],
  desktop: ['top', 'bottom', 'left', 'right'],
  laptop: ['top', 'bottom', 'left', 'right'],
  'database-server': ['top', 'bottom', 'left', 'right'],
  wifi: ['top', 'bottom', 'left', 'right'],
  globe: ['top', 'bottom', 'left', 'right'],

  // UML - Class Diagram (Mermaid Style)
  'uml-class': ['top', 'bottom', 'left', 'right'],
  'uml-interface': ['top', 'bottom', 'left', 'right'],
  'uml-abstract-class': ['top', 'bottom', 'left', 'right'],
  'uml-enum': ['top', 'bottom', 'left', 'right'],
  'uml-generic-class': ['top', 'bottom', 'left', 'right'],
  'uml-package': ['top', 'bottom', 'left', 'right'],
  'uml-annotation': ['top', 'bottom', 'left', 'right'],
  // UML - Use Case Diagram (Mermaid Style)
  'uml-actor': ['top', 'bottom', 'left', 'right'],
  'uml-usecase': ['top', 'bottom', 'left', 'right'],
  'uml-system-boundary': ['top', 'bottom', 'left', 'right'],
  'uml-include': ['top', 'bottom', 'left', 'right'],
  'uml-extend': ['top', 'bottom', 'left', 'right'],
  // UML - Sequence Diagram (Mermaid Style)
  'uml-participant': ['top', 'bottom', 'left', 'right'],
  'uml-actor-sequence': ['top', 'bottom', 'left', 'right'],
  'uml-database-participant': ['top', 'bottom', 'left', 'right'],
  'uml-activation': ['top', 'bottom', 'left', 'right'],
  'uml-message-sync': ['top', 'bottom', 'left', 'right'],
  'uml-message-async': ['top', 'bottom', 'left', 'right'],
  'uml-message-return': ['top', 'bottom', 'left', 'right'],
  'uml-self-message': ['top', 'bottom', 'left', 'right'],
  'uml-alt-fragment': ['top', 'bottom', 'left', 'right'],
  'uml-loop-fragment': ['top', 'bottom', 'left', 'right'],
  // UML - Activity Diagram (Mermaid Style)
  'uml-activity-action': ['top', 'bottom', 'left', 'right'],
  'uml-activity-start': ['top', 'bottom', 'left', 'right'],
  'uml-activity-end': ['top', 'bottom', 'left', 'right'],
  'uml-activity-decision': ['top', 'bottom', 'left', 'right'],
  'uml-activity-fork': ['top', 'bottom', 'left', 'right'],
  'uml-activity-merge': ['top', 'bottom', 'left', 'right'],
  'uml-activity-swimlane': ['top', 'bottom', 'left', 'right'],
  'uml-activity-signal-send': ['top', 'bottom', 'left', 'right'],
  'uml-activity-signal-receive': ['top', 'bottom', 'left', 'right'],
  // UML - State Machine Diagram (Mermaid Style)
  'uml-state-simple': ['top', 'bottom', 'left', 'right'],
  'uml-state-composite': ['top', 'bottom', 'left', 'right'],
  'uml-state-start': ['top', 'bottom', 'left', 'right'],
  'uml-state-end': ['top', 'bottom', 'left', 'right'],
  'uml-state-choice': ['top', 'bottom', 'left', 'right'],
  'uml-state-fork': ['top', 'bottom', 'left', 'right'],
  // UML - Component Diagram (Mermaid Style)
  'uml-component-main': ['top', 'bottom', 'left', 'right'],
  'uml-interface-provided': ['top', 'bottom', 'left', 'right'],
  'uml-interface-required': ['top', 'bottom', 'left', 'right'],
  'uml-port': ['top', 'bottom', 'left', 'right'],
  // UML - Deployment Diagram (Mermaid Style)
  'uml-node-server': ['top', 'bottom', 'left', 'right'],
  'uml-artifact-file': ['top', 'bottom', 'left', 'right'],
  'uml-device-server': ['top', 'bottom', 'left', 'right'],
  'uml-execution-environment': ['top', 'bottom', 'left', 'right'],
  'uml-communication-path': ['top', 'bottom', 'left', 'right'],
  // UML - Common
  'uml-comment': ['top', 'bottom', 'left', 'right'],
  'uml-constraint': ['top', 'bottom', 'left', 'right'],
  // 新增 UML 时序图元素
  'uml-sync-message': ['top', 'bottom', 'left', 'right'],
  'uml-async-message': ['top', 'bottom', 'left', 'right'],
  'uml-return-message': ['top', 'bottom', 'left', 'right'],
  'uml-fragment-alt': ['top', 'bottom', 'left', 'right'],
  'uml-fragment-loop': ['top', 'bottom', 'left', 'right'],
  'uml-fragment-par': ['top', 'bottom', 'left', 'right'],
  'uml-fragment-opt': ['top', 'bottom', 'left', 'right'],
  'uml-actor-lifeline': ['top', 'bottom', 'left', 'right'],
  // 新增 UML 类图关系连接器
  'uml-generalization': [],
  'uml-realization': [],
  'uml-dependency': [],
  'uml-association': [],
  'uml-aggregation': [],
  'uml-composition': [],
  // 新增 UML 用例图关系连接器
  // (已存在于 153-154 行)
  // 新增活动图增强元素
  'uml-object-node': ['top', 'bottom', 'left', 'right'],
  'uml-data-store': ['top', 'bottom', 'left', 'right'],
  // 新增 ER 图元素
  'uml-entity': ['top', 'bottom', 'left', 'right'],
  'uml-attribute': ['top', 'bottom', 'left', 'right'],
  'uml-relationship': [],
  // Legacy UML types (for backward compatibility)
  'uml-lifeline': ['top', 'bottom', 'left', 'right'],
  'uml-object': ['top', 'bottom', 'left', 'right'],
  'uml-activity': ['top', 'bottom', 'left', 'right'],
  'uml-action': ['top', 'bottom', 'left', 'right'],
  'uml-decision': ['top', 'bottom', 'left', 'right'],
  'uml-fork': ['top', 'bottom', 'left', 'right'],
  'uml-initial': ['top', 'bottom', 'left', 'right'],
  'uml-final': ['top', 'bottom', 'left', 'right'],
  'uml-swimlane': ['top', 'bottom', 'left', 'right'],
  'uml-state': ['top', 'bottom', 'left', 'right'],
  'uml-initial-state': ['top', 'bottom', 'left', 'right'],
  'uml-final-state': ['top', 'bottom', 'left', 'right'],
  'uml-choice': ['top', 'bottom', 'left', 'right'],
  'uml-component': ['top', 'bottom', 'left', 'right'],
  'uml-node': ['top', 'bottom', 'left', 'right'],
  'uml-artifact': ['top', 'bottom', 'left', 'right'],
  'uml-device': ['top', 'bottom', 'left', 'right'],

  // ER图 - 基于 Chen Notation 和 Crow's Foot Notation
  // 实体类型
  'er-entity': ['top', 'bottom', 'left', 'right'],
  'er-weak-entity': ['top', 'bottom', 'left', 'right'],
  'er-associative-entity': ['top', 'bottom', 'left', 'right'],
  // 属性类型
  'er-attribute': ['top', 'bottom', 'left', 'right'],
  'er-key-attribute': ['top', 'bottom', 'left', 'right'],
  'er-composite-attribute': ['top', 'bottom', 'left', 'right'],
  'er-multivalued-attribute': ['top', 'bottom', 'left', 'right'],
  'er-derived-attribute': ['top', 'bottom', 'left', 'right'],
  'er-weak-key-attribute': ['top', 'bottom', 'left', 'right'],
  // 关系类型
  'er-relationship': ['top', 'bottom', 'left', 'right'],
  'er-weak-relationship': ['top', 'bottom', 'left', 'right'],
  'er-recursive-relationship': ['top', 'bottom', 'left', 'right'],
  // 基数约束 (作为标签，无连接点)
  'er-cardinality-one': [],
  'er-cardinality-many': [],
  'er-cardinality-zero-or-one': [],
  'er-cardinality-one-or-many': [],
  'er-cardinality-zero-or-many': [],
  'er-cardinality-exactly': [],
  // 参与度约束 (作为标签，无连接点)
  'er-total-participation': [],
  'er-partial-participation': [],
  // Crow's Foot 符号 (作为标签，无连接点)
  'er-crows-foot-one': [],
  'er-crows-foot-many': [],
  'er-crows-foot-zero': [],
  'er-crows-foot-one-or-many': [],
  'er-crows-foot-zero-or-many': [],
  // 特殊标记
  'er-isa-hierarchy': ['top', 'bottom', 'left', 'right'],
  'er-disjoint-constraint': [],
  'er-overlap-constraint': [],
  'er-union-constraint': [],

  line: [],
  text: [],
}

export interface SnapConfig {
  enabled: boolean
  threshold: number
  showIndicator: boolean
}

export const defaultSnapConfig: SnapConfig = {
  enabled: true,
  threshold: 15,
  showIndicator: true,
}

export interface RoutingConfig {
  enabled: boolean
  algorithm: 'manhattan' | 'metro' | 'er' | 'normal'
  padding: number
  maxIterations: number
  avoidObstacles: boolean
}

export const defaultRoutingConfig: RoutingConfig = {
  enabled: true,
  algorithm: 'manhattan',
  padding: 10,
  maxIterations: 100,
  avoidObstacles: true,
}

export interface ConnectorMarker {
  name: string
  size?: number
  width?: number
  height?: number
}

export const connectorMarkers: Record<ConnectorEndStyle, ConnectorMarker | null> = {
  none: null,
  arrow: { name: 'classic', size: 10 },
  dot: { name: 'circle', size: 6 },
  diamond: { name: 'diamond', size: 10 },
  circle: { name: 'circle', size: 6 },
  triangle: { name: 'block', size: 12 },
  'hollow-triangle': { name: 'classic', size: 12 },
  'hollow-diamond': { name: 'diamond', size: 12 },
  'open-arrow': { name: 'open', size: 10 },
}

// UML 关系配置
export interface UMLRelationConfig {
  name: string
  lineStyle: LineStyle
  startStyle: ConnectorEndStyle
  endStyle: ConnectorEndStyle
  stroke: string
  description: string
}

export interface ERRelationConfig {
  name: string
  lineStyle: LineStyle
  startStyle: ConnectorEndStyle
  endStyle: ConnectorEndStyle
  stroke: string
  strokeWidth: number
  description: string
  cardinality?: string
  participation?: 'total' | 'partial'
}

export const umlRelations: Record<UMLRelationType, UMLRelationConfig> = {
  inheritance: {
    name: '继承 (Generalization)',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'hollow-triangle',
    stroke: '#333333',
    description: 'is-a 关系，子类继承父类',
  },
  implementation: {
    name: '实现 (Realization)',
    lineStyle: 'dashed',
    startStyle: 'none',
    endStyle: 'hollow-triangle',
    stroke: '#333333',
    description: '实现接口',
  },
  dependency: {
    name: '依赖 (Dependency)',
    lineStyle: 'dashed',
    startStyle: 'none',
    endStyle: 'open-arrow',
    stroke: '#333333',
    description: '使用关系',
  },
  association: {
    name: '关联 (Association)',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#333333',
    description: '对象之间的连接',
  },
  'directed-association': {
    name: '定向关联 (Directed Association)',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'arrow',
    stroke: '#333333',
    description: '有方向的关联',
  },
  aggregation: {
    name: '聚合 (Aggregation)',
    lineStyle: 'solid',
    startStyle: 'hollow-diamond',
    endStyle: 'none',
    stroke: '#333333',
    description: 'has-a 关系，整体包含部分，部分可独立存在',
  },
  composition: {
    name: '组合 (Composition)',
    lineStyle: 'solid',
    startStyle: 'diamond',
    endStyle: 'none',
    stroke: '#333333',
    description: 'contains-a 关系，整体包含部分，部分不能独立存在',
  },
}

// ER图关系配置 - 基于 Chen Notation 和 Crow's Foot Notation
export const erRelations: Record<ERRelationType, ERRelationConfig> = {
  'er-entity-attribute': {
    name: '实体-属性连接',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#52c41a',
    strokeWidth: 1,
    description: '实体与属性之间的连接',
  },
  'er-entity-relationship': {
    name: '实体-关系连接',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#fa8c16',
    strokeWidth: 1.5,
    description: '实体与关系之间的连接',
  },
  'er-relationship-attribute': {
    name: '关系-属性连接',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#52c41a',
    strokeWidth: 1,
    description: '关系与属性之间的连接',
  },
  'er-isa-hierarchy': {
    name: 'ISA层次继承',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'hollow-triangle',
    stroke: '#2f54eb',
    strokeWidth: 1.5,
    description: '实体继承层次结构',
  },
  'er-identifying': {
    name: '标识关系 (弱实体)',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#1890ff',
    strokeWidth: 2,
    description: '弱实体与拥有实体之间的标识关系 (双线)',
    participation: 'total',
  },
  'er-non-identifying': {
    name: '非标识关系',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#1890ff',
    strokeWidth: 1,
    description: '普通实体间的关系 (单线)',
    participation: 'partial',
  },
  'er-total-participation': {
    name: '完全参与',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#f5222d',
    strokeWidth: 3,
    description: '实体必须参与关系 (双线表示)',
    participation: 'total',
  },
  'er-partial-participation': {
    name: '部分参与',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#52c41a',
    strokeWidth: 1,
    description: '实体可以参与关系 (单线表示)',
    participation: 'partial',
  },
  'er-crows-foot-one': {
    name: 'Crow\'s Foot - 一',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#333333',
    strokeWidth: 1.5,
    description: '一对一关系',
    cardinality: '1',
  },
  'er-crows-foot-many': {
    name: 'Crow\'s Foot - 多',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#333333',
    strokeWidth: 1.5,
    description: '一对多关系',
    cardinality: 'N',
  },
  'er-crows-foot-zero-one': {
    name: 'Crow\'s Foot - 零或一',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#333333',
    strokeWidth: 1.5,
    description: '零或一 (可选)',
    cardinality: '0..1',
  },
  'er-crows-foot-one-many': {
    name: 'Crow\'s Foot - 一或多',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#333333',
    strokeWidth: 1.5,
    description: '一或多',
    cardinality: '1..*',
  },
  'er-crows-foot-zero-many': {
    name: 'Crow\'s Foot - 零或多',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'none',
    stroke: '#333333',
    strokeWidth: 1.5,
    description: '零或多',
    cardinality: '0..*',
  },
  'er-one-to-one': {
    name: '一对一关系',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'arrow',
    stroke: '#1890ff',
    strokeWidth: 2,
    description: '一个实体唯一对应另一个实体',
    cardinality: '1:1',
  },
  'er-one-to-many': {
    name: '一对多关系',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'arrow',
    stroke: '#1890ff',
    strokeWidth: 2,
    description: '一个实体对应多个实体',
    cardinality: '1:N',
  },
  'er-many-to-many': {
    name: '多对多关系',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'arrow',
    stroke: '#1890ff',
    strokeWidth: 2,
    description: '多个实体对应多个实体',
    cardinality: 'N:M',
  },
  'er-foreign-key': {
    name: '外键关系',
    lineStyle: 'solid',
    startStyle: 'none',
    endStyle: 'diamond',
    stroke: '#722ed1',
    strokeWidth: 2,
    description: '外键引用关系',
    cardinality: 'FK',
  },
}

export interface ConnectorStyleConfig {
  router: string
  connector: string
  attrs?: Record<string, any>
}

export const connectorStyleConfigs: Record<ConnectorStyle, ConnectorStyleConfig> = {
  straight: {
    router: 'normal',
    connector: 'normal',
  },
  orthogonal: {
    router: 'manhattan',
    connector: 'rounded',
  },
  curved: {
    router: 'er',
    connector: 'rounded',
  },
  bezier: {
    router: 'normal',
    connector: 'smooth',
  },
  metro: {
    router: 'metro',
    connector: 'rounded',
  },
  manhattan: {
    router: 'manhattan',
    connector: 'rounded',
  },
}
