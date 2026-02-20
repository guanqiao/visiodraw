/**
 * 序列图模板
 * 对标 Mermaid sequenceDiagram
 * 遵循 UML 2.5 规范
 * 
 * 结构说明：
 * - 参与者（Participant）：顶部矩形，表示对象/角色
 * - 生命线（Lifeline）：从参与者中心向下的垂直虚线
 * - 消息（Message）：水平线连接生命线
 * - 激活条（Activation）：覆盖在生命线上的细矩形
 * - 片段框（Fragment）：覆盖相关消息区域的圆角框
 * 
 * 设计原则：
 * 1. 使用锚点节点（1x1像素）确保消息边精确水平
 * 2. 生命线带顶部连接点和底部终止标记
 * 3. 激活条使用渐变填充和阴影效果
 * 4. 专业UML配色方案
 * 5. 消息连接点标记增强可读性
 */

import type { DiagramTemplate, TemplateGenerateOptions, TemplateNode, TemplateEdge } from '../types/diagramTemplate'

// ==================== 布局配置 ====================
interface LayoutConfig {
  startX: number
  startY: number
  participantWidth: number
  participantHeight: number
  participantSpacing: number
  lifelineExtension: number
  messageSpacing: number
  activationWidth: number
  noteWidth: number
  noteHeight: number
}

const DEFAULT_CONFIG: LayoutConfig = {
  startX: 60,
  startY: 25,
  participantWidth: 120,
  participantHeight: 55,
  participantSpacing: 160,
  lifelineExtension: 50,
  messageSpacing: 45,
  activationWidth: 14,
  noteWidth: 110,
  noteHeight: 45,
}

// ==================== 样式配置 - 专业UML配色 ====================
const STYLES = {
  participant: {
    fill: '#f0f5ff',
    stroke: '#2f54eb',
    strokeWidth: 2,
    cornerRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    shadowBlur: 4,
    shadowColor: 'rgba(0,0,0,0.1)',
  },
  actor: {
    fill: '#fff7e6',
    stroke: '#fa8c16',
    strokeWidth: 2.5,
    fontSize: 12,
    fontWeight: 600,
  },
  database: {
    fill: '#f6ffed',
    stroke: '#52c41a',
    strokeWidth: 2,
    fontSize: 12,
    fontWeight: 600,
  },
  lifeline: {
    stroke: '#bfbfbf',
    strokeWidth: 1.5,
    dashArray: '5,5',
  },
  activation: {
    fill: '#1890ff',
    stroke: '#096dd9',
    strokeWidth: 1.5,
    cornerRadius: 4,
    shadowBlur: 3,
    shadowColor: 'rgba(24,144,255,0.3)',
  },
  fragment: {
    fill: '#fafafa',
    fillOpacity: 0.4,
    stroke: '#595959',
    strokeWidth: 1.5,
    cornerRadius: 6,
    headerHeight: 28,
  },
  fragmentTypes: {
    alt: { stroke: '#722ed1', fill: '#f9f0ff' },
    opt: { stroke: '#13c2c2', fill: '#e6fffb' },
    loop: { stroke: '#1890ff', fill: '#e6f7ff' },
    par: { stroke: '#52c41a', fill: '#f6ffed' },
    break: { stroke: '#f5222d', fill: '#fff1f0' },
    critical: { stroke: '#fa8c16', fill: '#fff7e6' },
    group: { stroke: '#595959', fill: '#fafafa' },
  },
  note: {
    fill: '#fffbe6',
    stroke: '#ffd666',
    strokeWidth: 1.5,
    cornerRadius: 4,
  },
  message: {
    fontSize: 12,
    color: '#262626',
  },
}

// ==================== 类型定义 ====================
type MessageType = 'sync' | 'async' | 'return' | 'create' | 'destroy' | 'self'
type FragmentType = 'alt' | 'opt' | 'loop' | 'par' | 'break' | 'critical' | 'group'

interface MessageResult {
  anchors: TemplateNode[]
  markers: TemplateNode[]
  edge: TemplateEdge
}

interface ParticipantConfig {
  id: string
  name: string
  type?: 'participant' | 'actor' | 'database'
}

interface MessageConfig {
  from: string
  to: string
  label: string
  type?: MessageType
}

interface FragmentConfig {
  type: FragmentType
  startMessageIndex: number
  endMessageIndex: number
  condition?: string
}

// ==================== 工具函数 ====================

/**
 * 计算参与者布局
 */
function calculateParticipantLayout(
  participants: ParticipantConfig[],
  config: LayoutConfig
): Map<string, { index: number; x: number; y: number; width: number; height: number; centerX: number; bottomY: number }> {
  const layouts = new Map()
  
  participants.forEach((participant, index) => {
    const width = participant.type === 'actor' ? 60 :
                  participant.type === 'database' ? 80 :
                  config.participantWidth
    const height = participant.type === 'actor' ? 80 : config.participantHeight
    
    const x = config.startX + index * config.participantSpacing
    const centerX = x + width / 2
    
    layouts.set(participant.id, {
      index,
      x,
      y: config.startY,
      width,
      height,
      centerX,
      bottomY: config.startY + height,
    })
  })
  
  return layouts
}

/**
 * 计算消息Y位置
 */
function calculateMessageYPositions(
  messageCount: number,
  config: LayoutConfig,
  participantLayouts: Map<string, any>
): number[] {
  const maxParticipantHeight = Math.max(
    ...Array.from(participantLayouts.values()).map((l: any) => l.height),
    config.participantHeight
  )
  
  let currentY = config.startY + maxParticipantHeight + 35
  const positions: number[] = []
  
  for (let i = 0; i < messageCount; i++) {
    positions.push(currentY)
    currentY += config.messageSpacing
  }
  
  return positions
}

/**
 * 创建参与者节点
 */
function createParticipantNode(
  participant: ParticipantConfig,
  layout: any
): TemplateNode {
  let nodeType: string
  let width = layout.width
  let height = layout.height
  let style = STYLES.participant

  switch (participant.type) {
    case 'actor':
      nodeType = 'uml-actor-sequence'
      width = 60
      height = 80
      style = STYLES.actor
      break
    case 'database':
      nodeType = 'uml-database-participant'
      width = 80
      height = 60
      style = STYLES.database
      break
    default:
      nodeType = 'uml-participant'
  }

  return {
    id: `participant-${participant.id}`,
    type: nodeType,
    x: layout.x + (layout.width - width) / 2,
    y: layout.y,
    width,
    height,
    text: participant.name,
    fill: style.fill,
    stroke: style.stroke,
    strokeWidth: style.strokeWidth,
  }
}

/**
 * 创建生命线节点
 */
function createLifelineNodes(
  participantId: string,
  layout: any,
  totalHeight: number
): TemplateNode[] {
  const lifelineHeight = totalHeight - layout.bottomY
  const nodes: TemplateNode[] = []

  // 生命线主体（垂直虚线）
  nodes.push({
    id: `lifeline-${participantId}`,
    type: 'uml-lifeline',
    x: layout.centerX,
    y: layout.bottomY,
    width: 1,
    height: lifelineHeight,
    text: '',
    fill: 'transparent',
    stroke: STYLES.lifeline.stroke,
    strokeWidth: STYLES.lifeline.strokeWidth,
  })

  // 生命线顶部连接点（实心小圆点）
  nodes.push({
    id: `lifeline-top-${participantId}`,
    type: 'uml-lifeline-marker',
    x: layout.centerX - 3,
    y: layout.bottomY - 3,
    width: 6,
    height: 6,
    text: '',
    fill: STYLES.lifeline.stroke,
    stroke: 'transparent',
    strokeWidth: 0,
  })

  // 生命线底部终止标记（X形）
  const bottomY = layout.bottomY + lifelineHeight
  nodes.push({
    id: `lifeline-bottom-${participantId}`,
    type: 'uml-lifeline-end',
    x: layout.centerX - 6,
    y: bottomY - 6,
    width: 12,
    height: 12,
    text: '',
    fill: 'transparent',
    stroke: STYLES.lifeline.stroke,
    strokeWidth: 1.5,
  })

  return nodes
}

/**
 * 创建锚点节点
 */
function createAnchorNode(
  id: string,
  x: number,
  y: number
): TemplateNode {
  return {
    id,
    type: 'uml-anchor',
    x,
    y,
    width: 1,
    height: 1,
    text: '',
    fill: 'transparent',
    stroke: 'transparent',
    strokeWidth: 0,
  }
}

/**
 * 创建消息连接点标记（小圆点）
 */
function createMessageMarkers(
  index: number,
  fromCenterX: number,
  toCenterX: number,
  y: number,
  type: MessageType
): TemplateNode[] {
  const markerSize = 4
  const halfSize = markerSize / 2
  const color = getMessageColor(type)
  const markers: TemplateNode[] = []

  // 源点标记（发送方）
  markers.push({
    id: `msg-marker-src-${index}`,
    type: 'uml-message-marker',
    x: fromCenterX - halfSize,
    y: y - halfSize,
    width: markerSize,
    height: markerSize,
    text: '',
    fill: color,
    stroke: 'transparent',
    strokeWidth: 0,
  })

  // 目标点标记（接收方）- 销毁消息不添加目标标记
  if (type !== 'destroy') {
    markers.push({
      id: `msg-marker-tgt-${index}`,
      type: 'uml-message-marker',
      x: toCenterX - halfSize,
      y: y - halfSize,
      width: markerSize,
      height: markerSize,
      text: '',
      fill: color,
      stroke: 'transparent',
      strokeWidth: 0,
    })
  }

  return markers
}

/**
 * 获取消息颜色
 */
function getMessageColor(type: MessageType): string {
  switch (type) {
    case 'destroy':
      return '#f5222d'
    case 'create':
      return '#52c41a'
    default:
      return '#333333'
  }
}

/**
 * 获取消息箭头样式
 */
function getMessageArrow(type: MessageType): 'arrow' | 'open-arrow' | 'none' {
  switch (type) {
    case 'return':
    case 'async':
      return 'open-arrow'
    case 'destroy':
      return 'none'
    default:
      return 'arrow'
  }
}

/**
 * 获取消息线型
 */
function getMessageLineStyle(type: MessageType): 'solid' | 'dashed' {
  switch (type) {
    case 'return':
    case 'create':
      return 'dashed'
    default:
      return 'solid'
  }
}

/**
 * 计算标签位置（根据消息类型）
 */
function calculateLabelPosition(type: MessageType): number {
  switch (type) {
    case 'return':
      return 0.35
    case 'create':
    case 'destroy':
      return 0.4
    default:
      return 0.5
  }
}

/**
 * 计算标签垂直偏移（错开显示避免重叠）
 */
function calculateLabelOffsetY(messageIndex: number): number {
  const baseOffset = -8
  const staggerOffset = (messageIndex % 2 === 1) ? -12 : 5
  return baseOffset + staggerOffset
}

/**
 * 创建消息边
 */
function createMessageEdge(
  index: number,
  fromLayout: any,
  toLayout: any,
  y: number,
  label: string,
  type: MessageType = 'sync'
): MessageResult {
  const sourceId = `msg-src-${index}`
  const targetId = `msg-tgt-${index}`

  const anchors: TemplateNode[] = [
    createAnchorNode(sourceId, fromLayout.centerX, y),
    createAnchorNode(targetId, toLayout.centerX, y),
  ]

  // 创建消息连接点标记
  const markers = createMessageMarkers(index, fromLayout.centerX, toLayout.centerX, y, type)

  // 计算标签位置
  const labelPosition = calculateLabelPosition(type)
  const labelOffsetY = calculateLabelOffsetY(index)

  const edge: TemplateEdge = {
    id: `msg-${index}`,
    source: sourceId,
    target: targetId,
    label,
    style: 'straight',
    lineStyle: getMessageLineStyle(type),
    endMarker: getMessageArrow(type),
    // 标签位置信息
    labelPosition,
    labelOffsetY,
  }

  return { anchors, markers, edge }
}

/**
 * 创建激活条
 */
function createActivationBar(
  id: string,
  layout: any,
  startY: number,
  endY: number
): TemplateNode {
  return {
    id: `activation-${id}`,
    type: 'uml-activation',
    x: layout.centerX - STYLES.activation.cornerRadius / 2,
    y: startY - 6,
    width: STYLES.activation.cornerRadius,
    height: Math.max(endY - startY + 12, 28),
    text: '',
    fill: STYLES.activation.fill,
    stroke: STYLES.activation.stroke,
    strokeWidth: STYLES.activation.strokeWidth,
  }
}

/**
 * 创建片段框
 */
function createFragmentNode(
  config: FragmentConfig,
  participantLayouts: Map<string, any>,
  messageYPositions: number[],
  layoutConfig: LayoutConfig
): TemplateNode {
  const centers = Array.from(participantLayouts.values()).map((l: any) => l.centerX)
  const minCenter = Math.min(...centers)
  const maxCenter = Math.max(...centers)
  const leftX = minCenter - 30
  const rightX = maxCenter + 30

  const startY = messageYPositions[config.startMessageIndex]
  const endY = messageYPositions[config.endMessageIndex]

  const fragmentStyle = STYLES.fragmentTypes[config.type] || STYLES.fragmentTypes.group
  const label = config.condition ? `${config.type} [${config.condition}]` : config.type

  return {
    id: `fragment-${config.type}-${config.startMessageIndex}`,
    type: 'uml-fragment',
    x: leftX - 15,
    y: startY - 30,
    width: rightX - leftX + 30,
    height: Math.max(endY - startY + 60, 80),
    text: label,
    fill: fragmentStyle.fill,
    stroke: fragmentStyle.stroke,
    strokeWidth: STYLES.fragment.strokeWidth,
  }
}

/**
 * 创建销毁标记
 */
function createDestroyMarker(
  centerX: number,
  y: number
): TemplateNode {
  return {
    id: `destroy-marker-${y}`,
    type: 'uml-destroy-marker',
    x: centerX - 8,
    y: y + 5,
    width: 16,
    height: 16,
    text: '',
    fill: 'transparent',
    stroke: '#f5222d',
    strokeWidth: 2,
  }
}

/**
 * 创建创建标记（绿色方块）
 */
function createCreateMarker(
  centerX: number,
  y: number
): TemplateNode {
  const markerSize = 10
  return {
    id: `create-marker-${y}`,
    type: 'uml-create-marker',
    x: centerX - markerSize / 2,
    y: y - markerSize / 2,
    width: markerSize,
    height: markerSize,
    text: '',
    fill: '#52c41a',
    stroke: '#237804',
    strokeWidth: 1.5,
  }
}

/**
 * 创建创建标签（«create»）
 */
function createCreateLabel(
  centerX: number,
  y: number
): TemplateNode {
  return {
    id: `create-label-${y}`,
    type: 'uml-create-label',
    x: centerX + 15,
    y: y - 12,
    width: 60,
    height: 20,
    text: '«create»',
    fill: 'transparent',
    stroke: 'transparent',
    strokeWidth: 0,
  }
}

/**
 * 创建注释节点
 */
function createNoteNode(
  id: string,
  x: number,
  y: number,
  text: string
): TemplateNode {
  return {
    id: `note-${id}`,
    type: 'uml-note',
    x,
    y,
    width: STYLES.note.fill ? 100 : 100,
    height: 40,
    text,
    fill: STYLES.note.fill,
    stroke: STYLES.note.stroke,
    strokeWidth: STYLES.note.strokeWidth,
  }
}

// ==================== 模板生成函数 ====================

/**
 * 简单序列图模板
 * 展示基本的请求-响应流程
 */
export function createSimpleSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'user', name: '用户' },
    { id: 'system', name: '系统' },
    { id: 'database', name: '数据库' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(4, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('user')!, participantLayouts.get('system')!, messageYPositions[0], '请求数据', 'sync')
  const msg1 = createMessageEdge(1, participantLayouts.get('system')!, participantLayouts.get('database')!, messageYPositions[1], '查询', 'sync')
  const msg2 = createMessageEdge(2, participantLayouts.get('database')!, participantLayouts.get('system')!, messageYPositions[2], '返回结果', 'return')
  const msg3 = createMessageEdge(3, participantLayouts.get('system')!, participantLayouts.get('user')!, messageYPositions[3], '响应', 'return')

  const anchors: TemplateNode[] = [...msg0.anchors, ...msg1.anchors, ...msg2.anchors, ...msg3.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...msg1.markers, ...msg2.markers, ...msg3.markers]
  const edges: TemplateEdge[] = [msg0.edge, msg1.edge, msg2.edge, msg3.edge]

  return {
    id: 'sequence-simple',
    name: '简单序列图',
    description: '基本的请求-响应流程，适合展示简单的交互场景',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant User as 用户
    participant System as 系统
    participant DB as 数据库
    User->>System: 请求数据
    System->>DB: 查询
    DB-->>System: 返回结果
    System-->>User: 响应`,
  }
}

/**
 * 带激活条的序列图模板
 */
export function createActivationSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'client', name: '客户端' },
    { id: 'service', name: '服务层' },
    { id: 'dao', name: '数据层' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(4, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成激活条
  const activations: TemplateNode[] = [
    createActivationBar('service', participantLayouts.get('service')!, messageYPositions[0], messageYPositions[3]),
    createActivationBar('dao', participantLayouts.get('dao')!, messageYPositions[1], messageYPositions[2]),
  ]

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('client')!, participantLayouts.get('service')!, messageYPositions[0], '调用方法', 'sync')
  const msg1 = createMessageEdge(1, participantLayouts.get('service')!, participantLayouts.get('dao')!, messageYPositions[1], '查询数据', 'sync')
  const msg2 = createMessageEdge(2, participantLayouts.get('dao')!, participantLayouts.get('service')!, messageYPositions[2], '返回数据', 'return')
  const msg3 = createMessageEdge(3, participantLayouts.get('service')!, participantLayouts.get('client')!, messageYPositions[3], '返回结果', 'return')

  const anchors: TemplateNode[] = [...msg0.anchors, ...msg1.anchors, ...msg2.anchors, ...msg3.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...msg1.markers, ...msg2.markers, ...msg3.markers]
  const edges: TemplateEdge[] = [msg0.edge, msg1.edge, msg2.edge, msg3.edge]

  return {
    id: 'sequence-activation',
    name: '带激活条的序列图',
    description: '显示对象激活期间的调用，适合展示方法调用栈',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, ...activations, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant Client as 客户端
    participant Service as 服务层
    participant DAO as 数据层
    Client->>+Service: 调用方法
    Service->>+DAO: 查询数据
    DAO-->>-Service: 返回数据
    Service-->>-Client: 返回结果`,
  }
}

/**
 * 带循环的序列图模板
 */
export function createLoopSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'user', name: '用户' },
    { id: 'system', name: '系统' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(4, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成片段框（loop）
  const fragment = createFragmentNode(
    { type: 'loop', startMessageIndex: 1, endMessageIndex: 3, condition: '每个项目' },
    participantLayouts,
    messageYPositions,
    config
  )

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('user')!, participantLayouts.get('system')!, messageYPositions[0], '获取列表', 'sync')
  const msg1 = createMessageEdge(1, participantLayouts.get('system')!, participantLayouts.get('user')!, messageYPositions[1], '返回项目1', 'return')
  const msg2 = createMessageEdge(2, participantLayouts.get('system')!, participantLayouts.get('user')!, messageYPositions[2], '返回项目2', 'return')
  const msg3 = createMessageEdge(3, participantLayouts.get('system')!, participantLayouts.get('user')!, messageYPositions[3], '返回项目N', 'return')

  const anchors: TemplateNode[] = [...msg0.anchors, ...msg1.anchors, ...msg2.anchors, ...msg3.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...msg1.markers, ...msg2.markers, ...msg3.markers]
  const edges: TemplateEdge[] = [msg0.edge, msg1.edge, msg2.edge, msg3.edge]

  return {
    id: 'sequence-loop',
    name: '带循环的序列图',
    description: '批量处理数据，适合展示循环遍历场景',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, fragment, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant User as 用户
    participant System as 系统
    User->>System: 获取列表
    loop 每个项目
        System-->>User: 返回项目
    end`,
  }
}

/**
 * 带条件的序列图模板
 */
export function createAltSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'user', name: '用户' },
    { id: 'system', name: '系统' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(3, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成片段框（alt）
  const fragment = createFragmentNode(
    { type: 'alt', startMessageIndex: 1, endMessageIndex: 2, condition: '验证成功' },
    participantLayouts,
    messageYPositions,
    config
  )

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('user')!, participantLayouts.get('system')!, messageYPositions[0], '提交请求', 'sync')
  const msg1 = createMessageEdge(1, participantLayouts.get('system')!, participantLayouts.get('user')!, messageYPositions[1], '成功响应', 'return')
  const msg2 = createMessageEdge(2, participantLayouts.get('system')!, participantLayouts.get('user')!, messageYPositions[2], '错误信息', 'return')

  const anchors: TemplateNode[] = [...msg0.anchors, ...msg1.anchors, ...msg2.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...msg1.markers, ...msg2.markers]
  const edges: TemplateEdge[] = [msg0.edge, msg1.edge, msg2.edge]

  return {
    id: 'sequence-alt',
    name: '带条件的序列图',
    description: '根据条件返回不同结果，适合展示 if-else 场景',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, fragment, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant User as 用户
    participant System as 系统
    User->>System: 提交请求
    alt 验证成功
        System-->>User: 成功响应
    else 验证失败
        System-->>User: 错误信息
    end`,
  }
}

/**
 * 自调用序列图模板
 */
export function createSelfCallSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'client', name: '客户端' },
    { id: 'service', name: '服务层' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(3, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('client')!, participantLayouts.get('service')!, messageYPositions[0], '调用方法', 'sync')
  const msg2 = createMessageEdge(2, participantLayouts.get('service')!, participantLayouts.get('client')!, messageYPositions[2], '返回结果', 'return')

  // 自调用消息（右侧半圆弧线）
  const serviceLayout = participantLayouts.get('service')!
  const selfY = messageYPositions[1]
  const radius = 30
  
  // 创建自调用锚点
  const selfAnchors: TemplateNode[] = [
    createAnchorNode('self-anchor-0', serviceLayout.centerX, selfY),
    createAnchorNode('self-anchor-1', serviceLayout.centerX + radius * 2, selfY - radius),
    createAnchorNode('self-anchor-2', serviceLayout.centerX + radius * 2, selfY + radius),
    createAnchorNode('self-anchor-3', serviceLayout.centerX, selfY),
  ]

  // 自调用标记
  const selfMarkers = createMessageMarkers(1, serviceLayout.centerX, serviceLayout.centerX, selfY, 'self')

  const selfEdge: TemplateEdge = {
    id: 'msg-1',
    source: 'self-anchor-0',
    target: 'self-anchor-3',
    label: '内部处理',
    style: 'curved',
    lineStyle: 'solid',
    endMarker: 'arrow',
  }

  const anchors: TemplateNode[] = [...msg0.anchors, ...selfAnchors, ...msg2.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...selfMarkers, ...msg2.markers]
  const edges: TemplateEdge[] = [msg0.edge, selfEdge, msg2.edge]

  return {
    id: 'sequence-self-call',
    name: '自调用序列图',
    description: '对象调用自身方法，适合展示内部处理逻辑',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant Client as 客户端
    participant Service as 服务层
    Client->>Service: 调用方法
    Service->>Service: 内部处理
    Service-->>Client: 返回结果`,
  }
}

/**
 * 异步消息序列图模板
 */
export function createAsyncSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'client', name: '客户端' },
    { id: 'gateway', name: 'API网关' },
    { id: 'service', name: '微服务' },
    { id: 'callback', name: '回调服务' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(4, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('client')!, participantLayouts.get('gateway')!, messageYPositions[0], '异步请求', 'async')
  const msg1 = createMessageEdge(1, participantLayouts.get('gateway')!, participantLayouts.get('service')!, messageYPositions[1], '转发请求', 'sync')
  const msg2 = createMessageEdge(2, participantLayouts.get('service')!, participantLayouts.get('callback')!, messageYPositions[2], '注册回调', 'sync')
  const msg3 = createMessageEdge(3, participantLayouts.get('callback')!, participantLayouts.get('client')!, messageYPositions[3], '异步回调', 'return')

  const anchors: TemplateNode[] = [...msg0.anchors, ...msg1.anchors, ...msg2.anchors, ...msg3.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...msg1.markers, ...msg2.markers, ...msg3.markers]
  const edges: TemplateEdge[] = [msg0.edge, msg1.edge, msg2.edge, msg3.edge]

  return {
    id: 'sequence-async',
    name: '异步消息序列图',
    description: '展示异步调用和回调机制，适合展示消息队列、事件驱动场景',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant Client as 客户端
    participant Gateway as API网关
    participant Service as 微服务
    participant Callback as 回调服务
    Client->>Gateway: 异步请求
    Gateway->>Service: 转发请求
    Service->>Callback: 注册回调
    Callback-->>Client: 异步回调`,
  }
}

/**
 * 对象创建销毁序列图模板
 */
export function createLifecycleSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'client', name: '客户端' },
    { id: 'factory', name: '工厂' },
    { id: 'object', name: '对象' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(5, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('client')!, participantLayouts.get('factory')!, messageYPositions[0], '创建对象', 'sync')
  const msg1 = createMessageEdge(1, participantLayouts.get('factory')!, participantLayouts.get('object')!, messageYPositions[1], '实例化', 'create')
  const msg2 = createMessageEdge(2, participantLayouts.get('object')!, participantLayouts.get('client')!, messageYPositions[2], '返回引用', 'return')
  const msg3 = createMessageEdge(3, participantLayouts.get('client')!, participantLayouts.get('object')!, messageYPositions[3], '使用对象', 'sync')
  const msg4 = createMessageEdge(4, participantLayouts.get('client')!, participantLayouts.get('object')!, messageYPositions[4], '销毁对象', 'destroy')

  // 创建标记和标签
  const createMarker = createCreateMarker(participantLayouts.get('object')!.centerX, messageYPositions[1])
  const createLabel = createCreateLabel(participantLayouts.get('object')!.centerX, messageYPositions[1])

  // 销毁标记
  const destroyMarker = createDestroyMarker(participantLayouts.get('object')!.centerX, messageYPositions[4])

  const anchors: TemplateNode[] = [...msg0.anchors, ...msg1.anchors, ...msg2.anchors, ...msg3.anchors, ...msg4.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...msg1.markers, ...msg2.markers, ...msg3.markers, ...msg4.markers]
  const edges: TemplateEdge[] = [msg0.edge, msg1.edge, msg2.edge, msg3.edge, msg4.edge]

  return {
    id: 'sequence-lifecycle',
    name: '对象生命周期序列图',
    description: '展示对象的创建、使用和销毁过程',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, createMarker, createLabel, destroyMarker, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant Client as 客户端
    participant Factory as 工厂
    participant Object as 对象
    Client->>Factory: 创建对象
    Factory->>Object: 实例化
    Object-->>Client: 返回引用
    Client->>Object: 使用对象
    destroy Object
    Client->>Object: 销毁对象`,
  }
}

/**
 * 并行处理序列图模板
 */
export function createParSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'client', name: '客户端' },
    { id: 'gateway', name: '网关' },
    { id: 'serviceA', name: '服务A' },
    { id: 'serviceB', name: '服务B' },
    { id: 'aggregator', name: '聚合器' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(6, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成片段框（par）
  const fragment = createFragmentNode(
    { type: 'par', startMessageIndex: 1, endMessageIndex: 4, condition: '并行执行' },
    participantLayouts,
    messageYPositions,
    config
  )

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('client')!, participantLayouts.get('gateway')!, messageYPositions[0], '并行请求', 'sync')
  const msg1 = createMessageEdge(1, participantLayouts.get('gateway')!, participantLayouts.get('serviceA')!, messageYPositions[1], '请求A', 'sync')
  const msg2 = createMessageEdge(2, participantLayouts.get('gateway')!, participantLayouts.get('serviceB')!, messageYPositions[2], '请求B', 'sync')
  const msg3 = createMessageEdge(3, participantLayouts.get('serviceA')!, participantLayouts.get('aggregator')!, messageYPositions[3], '结果A', 'return')
  const msg4 = createMessageEdge(4, participantLayouts.get('serviceB')!, participantLayouts.get('aggregator')!, messageYPositions[4], '结果B', 'return')
  const msg5 = createMessageEdge(5, participantLayouts.get('aggregator')!, participantLayouts.get('client')!, messageYPositions[5], '聚合结果', 'return')

  const anchors: TemplateNode[] = [...msg0.anchors, ...msg1.anchors, ...msg2.anchors, ...msg3.anchors, ...msg4.anchors, ...msg5.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...msg1.markers, ...msg2.markers, ...msg3.markers, ...msg4.markers, ...msg5.markers]
  const edges: TemplateEdge[] = [msg0.edge, msg1.edge, msg2.edge, msg3.edge, msg4.edge, msg5.edge]

  return {
    id: 'sequence-par',
    name: '并行处理序列图',
    description: '展示并行执行场景，适合展示微服务并行调用',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, fragment, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant Client as 客户端
    participant Gateway as 网关
    participant ServiceA as 服务A
    participant ServiceB as 服务B
    participant Aggregator as 聚合器
    Client->>Gateway: 并行请求
    par 并行执行
        Gateway->>ServiceA: 请求A
        ServiceA-->>Aggregator: 结果A
    and
        Gateway->>ServiceB: 请求B
        ServiceB-->>Aggregator: 结果B
    end
    Aggregator-->>Client: 聚合结果`,
  }
}

/**
 * 延迟消息序列图模板
 */
export function createDelaySequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'scheduler', name: '调度器' },
    { id: 'queue', name: '消息队列' },
    { id: 'worker', name: '工作进程' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(4, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成注释节点
  const note = createNoteNode(
    'delay',
    participantLayouts.get('queue')!.centerX + 20,
    messageYPositions[1] - 10,
    '等待5分钟'
  )

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('scheduler')!, participantLayouts.get('queue')!, messageYPositions[0], '延迟任务', 'sync')
  const msg1 = createMessageEdge(1, participantLayouts.get('queue')!, participantLayouts.get('worker')!, messageYPositions[1], '延时到期', 'sync')
  const msg2 = createMessageEdge(2, participantLayouts.get('worker')!, participantLayouts.get('queue')!, messageYPositions[2], '确认完成', 'return')
  const msg3 = createMessageEdge(3, participantLayouts.get('queue')!, participantLayouts.get('scheduler')!, messageYPositions[3], '任务完成', 'return')

  const anchors: TemplateNode[] = [...msg0.anchors, ...msg1.anchors, ...msg2.anchors, ...msg3.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...msg1.markers, ...msg2.markers, ...msg3.markers]
  const edges: TemplateEdge[] = [msg0.edge, msg1.edge, msg2.edge, msg3.edge]

  return {
    id: 'sequence-delay',
    name: '延迟消息序列图',
    description: '展示延迟执行场景，适合展示定时任务、延时队列',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, note, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant Scheduler as 调度器
    participant Queue as 消息队列
    participant Worker as 工作进程
    Scheduler->>Queue: 延迟任务
    Note over Queue: 等待5分钟
    Queue->>Worker: 延时到期
    Worker-->>Queue: 确认完成
    Queue-->>Scheduler: 任务完成`,
  }
}

/**
 * 引用框序列图模板
 */
export function createReferenceSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const config = { ...DEFAULT_CONFIG, ...options }
  
  const participants: ParticipantConfig[] = [
    { id: 'client', name: '客户端' },
    { id: 'service', name: '服务' },
  ]

  const participantLayouts = calculateParticipantLayout(participants, config)
  const messageYPositions = calculateMessageYPositions(4, config, participantLayouts)
  const totalHeight = messageYPositions[messageYPositions.length - 1] + config.lifelineExtension

  // 生成参与者节点
  const participantNodes: TemplateNode[] = participants.map(p => 
    createParticipantNode(p, participantLayouts.get(p.id)!)
  )

  // 生成生命线节点
  const lifelineNodes: TemplateNode[] = []
  participants.forEach(p => {
    lifelineNodes.push(...createLifelineNodes(p.id, participantLayouts.get(p.id)!, totalHeight))
  })

  // 生成引用框
  const refNode: TemplateNode = {
    id: 'ref-auth',
    type: 'uml-reference',
    x: participantLayouts.get('client')!.centerX - 40,
    y: messageYPositions[1] - 25,
    width: participantLayouts.get('service')!.centerX - participantLayouts.get('client')!.centerX + 80,
    height: 50,
    text: '认证流程',
    fill: '#f0f5ff',
    stroke: '#2f54eb',
    strokeWidth: 1.5,
  }

  // 生成消息边
  const msg0 = createMessageEdge(0, participantLayouts.get('client')!, participantLayouts.get('service')!, messageYPositions[0], '请求', 'sync')
  const msg1 = createMessageEdge(1, participantLayouts.get('service')!, participantLayouts.get('client')!, messageYPositions[1], '响应', 'return')
  const msg2 = createMessageEdge(2, participantLayouts.get('client')!, participantLayouts.get('service')!, messageYPositions[2], '查询', 'sync')
  const msg3 = createMessageEdge(3, participantLayouts.get('service')!, participantLayouts.get('client')!, messageYPositions[3], '结果', 'return')

  const anchors: TemplateNode[] = [...msg0.anchors, ...msg1.anchors, ...msg2.anchors, ...msg3.anchors]
  const markers: TemplateNode[] = [...msg0.markers, ...msg1.markers, ...msg2.markers, ...msg3.markers]
  const edges: TemplateEdge[] = [msg0.edge, msg1.edge, msg2.edge, msg3.edge]

  return {
    id: 'sequence-reference',
    name: '引用框序列图',
    description: '展示引用其他序列图的场景',
    type: 'sequence',
    nodes: [...participantNodes, ...lifelineNodes, refNode, ...anchors, ...markers],
    edges,
    layout: {
      direction: 'horizontal',
      spacing: config.participantSpacing,
    },
    mermaidCode: `sequenceDiagram
    participant Client as 客户端
    participant Service as 服务
    Client->>Service: 请求
    ref over Client, Service: 认证流程
    Service-->>Client: 响应
    Client->>Service: 查询
    Service-->>Client: 结果`,
  }
}

/**
 * 获取所有序列图模板
 */
export function getSequenceTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    createSimpleSequenceTemplate(options),
    createActivationSequenceTemplate(options),
    createLoopSequenceTemplate(options),
    createAltSequenceTemplate(options),
    createSelfCallSequenceTemplate(options),
    createAsyncSequenceTemplate(options),
    createLifecycleSequenceTemplate(options),
    createParSequenceTemplate(options),
    createDelaySequenceTemplate(options),
    createReferenceSequenceTemplate(options),
  ]
}
