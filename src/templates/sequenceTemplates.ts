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
 * 
 * 重构说明：
 * 本文件使用 sequenceDiagramUtils.ts 提供的共享工具函数
 * 消除与 sequenceDiagramGenerator.ts 的代码重复
 */

import type { DiagramTemplate, TemplateGenerateOptions, TemplateNode, TemplateEdge } from '../types/diagramTemplate'
import {
  DEFAULT_LAYOUT_CONFIG,
  DEFAULT_STYLES,
  FRAGMENT_TYPE_STYLES,
  type MessageType,
  type FragmentType,
  calculateParticipantLayouts,
  calculateMessageY,
  calculateTotalHeight,
  createParticipantNode as createParticipantNodeUtil,
  createLifelineNode as createLifelineNodeUtil,
  createLifelineTopMarker as createLifelineTopMarkerUtil,
  createLifelineBottomMarker as createLifelineBottomMarkerUtil,
  createActivationNode as createActivationNodeUtil,
  createMessageMarkers as createMessageMarkersUtil,
  createDestroyMarker as createDestroyMarkerUtil,
  createCreateMarker as createCreateMarkerUtil,
  createMessageEdge as createMessageEdgeUtil,
  generateMessageLabel,
  getMessageArrow,
  getMessageLineStyle,
} from '../utils/sequenceDiagramUtils'

// ==================== 类型定义 ====================

/**
 * 消息创建结果
 */
interface MessageResult {
  /** 锚点节点（用于消息边连接） */
  anchors: TemplateNode[]
  /** 消息连接点标记 */
  markers: TemplateNode[]
  /** 消息边 */
  edge: TemplateEdge
}

/**
 * 参与者配置
 */
interface ParticipantConfig {
  /** 唯一标识 */
  id: string
  /** 显示名称 */
  name: string
  /** 参与者类型 */
  type?: 'participant' | 'actor' | 'database'
}

/**
 * 消息配置
 */
interface MessageConfig {
  /** 源参与者ID */
  from: string
  /** 目标参与者ID */
  to: string
  /** 消息标签 */
  label: string
  /** 消息类型 */
  type?: MessageType
}

/**
 * 片段（组合片段）配置
 */
interface FragmentConfig {
  /** 片段类型（alt/opt/loop/par等） */
  type: FragmentType
  /** 起始消息索引 */
  startMessageIndex: number
  /** 结束消息索引 */
  endMessageIndex: number
  /** 条件表达式 */
  condition?: string
  /** 涉及的参与者ID列表 */
  participantIds?: string[]
}

/**
 * 激活条配置
 */
interface ActivationConfig {
  /** 参与者ID */
  participantId: string
  /** 起始消息索引 */
  startMessageIndex: number
  /** 结束消息索引 */
  endMessageIndex: number
}

/**
 * 注释配置
 */
interface NoteConfig {
  /** 注释内容 */
  text: string
  /** 位置 */
  position: 'left' | 'right' | 'over'
  /** 目标参与者ID */
  participantId: string
  /** 消息索引（可选） */
  messageIndex?: number
}

/**
 * 参与者布局信息
 */
interface ParticipantLayout {
  /** 索引位置 */
  index: number
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** 中心X坐标 */
  centerX: number
  /** 底部Y坐标 */
  bottomY: number
}

// ==================== 布局适配器 ====================

/**
 * 将共享库的布局转换为模板使用的布局格式
 */
function adaptLayout(layout: {
  id: string
  x: number
  y: number
  width: number
  height: number
  centerX: number
  bottomY: number
}): ParticipantLayout {
  return {
    index: 0, // 将在外部设置
    x: layout.x,
    y: layout.y,
    width: layout.width,
    height: layout.height,
    centerX: layout.centerX,
    bottomY: layout.bottomY,
  }
}

/**
 * 计算参与者布局（使用共享工具库）
 */
function calculateParticipantLayout(
  participants: ParticipantConfig[],
): Map<string, ParticipantLayout> {
  const participantIds = participants.map(p => p.id)
  const layouts = calculateParticipantLayouts(participantIds, DEFAULT_LAYOUT_CONFIG)

  const result = new Map<string, ParticipantLayout>()

  participants.forEach((participant, index) => {
    const sharedLayout = layouts.get(participant.id)!
    const adapted = adaptLayout(sharedLayout)
    adapted.index = index

    // 根据参与者类型调整尺寸
    if (participant.type === 'actor') {
      adapted.width = 60
      adapted.height = 80
      adapted.centerX = adapted.x + adapted.width / 2
      adapted.bottomY = adapted.y + adapted.height
    } else if (participant.type === 'database') {
      adapted.width = 80
      adapted.height = 60
      adapted.centerX = adapted.x + adapted.width / 2
      adapted.bottomY = adapted.y + adapted.height
    }

    result.set(participant.id, adapted)
  })

  return result
}

/**
 * 计算消息Y位置（使用共享工具库）
 */
function calculateMessageYPositions(
  messageCount: number,
  participantLayouts: Map<string, any>
): number[] {
  const maxParticipantHeight = Math.max(
    ...Array.from(participantLayouts.values()).map((l: any) => l.height),
    DEFAULT_LAYOUT_CONFIG.participantHeight
  )
  
  const startOffset = maxParticipantHeight + 35
  const positions: number[] = []
  
  for (let i = 0; i < messageCount; i++) {
    positions.push(calculateMessageY(i, DEFAULT_LAYOUT_CONFIG, startOffset))
  }
  
  return positions
}

// ==================== 通用适配函数 ====================

/**
 * 将共享库的节点转换为 TemplateNode
 * 自动提取所有非 undefined 属性
 */
function adaptNodeToTemplate<T extends Record<string, any>>(node: T): TemplateNode {
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
function adaptNodesToTemplate<T extends Record<string, any>>(nodes: T[]): TemplateNode[] {
  return nodes.map(adaptNodeToTemplate)
}

// ==================== 节点创建函数 ====================

/**
 * 创建参与者节点（使用共享工具库）
 */
function createParticipantNode(
  participant: ParticipantConfig,
  layout: any
): TemplateNode {
  // 调整布局以匹配参与者类型
  const adjustedLayout = { ...layout }
  
  if (participant.type === 'actor') {
    adjustedLayout.width = 60
    adjustedLayout.height = 80
    adjustedLayout.centerX = layout.x + 60 / 2
    adjustedLayout.bottomY = layout.y + 80
  } else if (participant.type === 'database') {
    adjustedLayout.width = 80
    adjustedLayout.height = 60
    adjustedLayout.centerX = layout.x + 80 / 2
    adjustedLayout.bottomY = layout.y + 60
  }
  
  const node = createParticipantNodeUtil(
    participant.id,
    participant.name,
    adjustedLayout,
    participant.type || 'participant'
  )
  
  // 使用通用适配函数转换
  return adaptNodeToTemplate({
    ...node,
    x: layout.x + (layout.width - adjustedLayout.width) / 2,
    y: layout.y,
    width: adjustedLayout.width,
    height: adjustedLayout.height,
  })
}

/**
 * 创建生命线节点（使用共享工具库）
 */
function createLifelineNodes(
  participantId: string,
  layout: any,
  totalHeight: number
): TemplateNode[] {
  // 生命线主体
  const lifeline = createLifelineNodeUtil(participantId, layout, totalHeight)
  
  // 顶部标记
  const topMarker = createLifelineTopMarkerUtil(participantId, layout)
  
  // 底部标记
  const bottomMarker = createLifelineBottomMarkerUtil(participantId, layout, totalHeight)
  
  // 使用通用适配函数批量转换
  return adaptNodesToTemplate([lifeline, topMarker, bottomMarker])
}

/**
 * 创建激活条节点（使用共享工具库）
 */
function createActivationBar(
  id: string,
  layout: any,
  startY: number,
  endY: number
): TemplateNode {
  const node = createActivationNodeUtil(id, layout, startY, endY)
  return adaptNodeToTemplate(node)
}

/**
 * 创建消息连接点标记（使用共享工具库）
 */
function createMessageMarkers(
  index: number,
  fromCenterX: number,
  toCenterX: number,
  y: number,
  type: MessageType
): TemplateNode[] {
  const markers = createMessageMarkersUtil(String(index), fromCenterX, toCenterX, y, type)
  return adaptNodesToTemplate(markers)
}

/**
 * 创建销毁标记（使用共享工具库）
 */
function createDestroyMarker(
  index: number,
  centerX: number,
  y: number
): TemplateNode {
  const marker = createDestroyMarkerUtil(String(index), centerX, y)
  return adaptNodeToTemplate(marker)
}

/**
 * 创建创建标记（使用共享工具库）
 */
function createCreateMarkers(
  index: number,
  centerX: number,
  y: number
): TemplateNode[] {
  const markers = createCreateMarkerUtil(String(index), centerX, y)
  return adaptNodesToTemplate(markers)
}

// ==================== 消息处理 ====================

/**
 * 创建锚点节点
 */
function createAnchorNode(id: string, x: number, y: number): TemplateNode {
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
 * 创建消息（使用共享工具库）
 */
function createMessage(
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

  // 使用共享工具库创建边
  const edge = createMessageEdgeUtil(String(index), sourceId, targetId, label, type, index)

  return {
    anchors,
    markers,
    edge: {
      id: edge.id,
      source: edge.sourceShapeId!,
      target: edge.targetShapeId!,
      label: edge.labels?.[0]?.text || label,
      style: edge.style,
      lineStyle: edge.lineStyle,
      startMarker: edge.startStyle,
      endMarker: edge.endStyle,
    },
  }
}

// ==================== 片段处理 ====================

/**
 * 创建片段节点
 */
function createFragmentNode(
  fragment: FragmentConfig,
  layouts: Map<string, any>,
  messageYPositions: number[]
): TemplateNode {
  const typeStyle = FRAGMENT_TYPE_STYLES[fragment.type]
  const startY = messageYPositions[fragment.startMessageIndex] - 25
  const endY = messageYPositions[fragment.endMessageIndex] || startY + 80

  const layoutList = Array.from(layouts.values())
  const minX = Math.min(...layoutList.map((l: any) => l.x))
  const maxX = Math.max(...layoutList.map((l: any) => l.x + l.width))

  const label = fragment.condition
    ? `${fragment.type} [${fragment.condition}]`
    : fragment.type

  return {
    id: `fragment-${fragment.type}-${fragment.startMessageIndex}`,
    type: 'uml-fragment',
    x: minX - 15,
    y: startY,
    width: maxX - minX + 30,
    height: endY - startY + 50,
    text: label,
    fill: typeStyle.fill,
    stroke: typeStyle.stroke,
    strokeWidth: DEFAULT_STYLES.fragment.strokeWidth,
    fillOpacity: DEFAULT_STYLES.fragment.fillOpacity,
  }
}

// ==================== 注释处理 ====================

/**
 * 创建注释节点
 */
function createNoteNode(
  text: string,
  position: 'left' | 'right' | 'over',
  targetLayout: any,
  y: number
): TemplateNode {
  let x: number

  switch (position) {
    case 'left':
      x = targetLayout.x - DEFAULT_LAYOUT_CONFIG.noteWidth - 20
      break
    case 'right':
      x = targetLayout.x + targetLayout.width + 20
      break
    case 'over':
    default:
      x = targetLayout.centerX - DEFAULT_LAYOUT_CONFIG.noteWidth / 2
  }

  return {
    id: `note-${text.slice(0, 10)}-${y}`,
    type: 'uml-note',
    x,
    y: y - DEFAULT_LAYOUT_CONFIG.noteHeight / 2,
    width: DEFAULT_LAYOUT_CONFIG.noteWidth,
    height: DEFAULT_LAYOUT_CONFIG.noteHeight,
    text,
    fill: DEFAULT_STYLES.note.fill,
    stroke: DEFAULT_STYLES.note.stroke,
    strokeWidth: DEFAULT_STYLES.note.strokeWidth,
  }
}

/**
 * 创建注释连接线
 * 连接注释和参与者/消息的虚线
 */
function createNoteConnector(
  noteId: string,
  noteX: number,
  noteY: number,
  targetX: number,
  targetY: number
): TemplateEdge {
  const sourceId = `${noteId}-anchor`
  const targetAnchorId = `${noteId}-target-anchor`

  // 创建两个锚点用于连接线
  const noteAnchor: TemplateNode = {
    id: sourceId,
    type: 'uml-anchor',
    x: noteX + DEFAULT_LAYOUT_CONFIG.noteWidth / 2,
    y: noteY + DEFAULT_LAYOUT_CONFIG.noteHeight / 2,
    width: 1,
    height: 1,
    text: '',
    fill: 'transparent',
    stroke: 'transparent',
    strokeWidth: 0,
  }

  const targetAnchor: TemplateNode = {
    id: targetAnchorId,
    type: 'uml-anchor',
    x: targetX,
    y: targetY,
    width: 1,
    height: 1,
    text: '',
    fill: 'transparent',
    stroke: 'transparent',
    strokeWidth: 0,
  }

  // 返回边和锚点
  return {
    id: `${noteId}-connector`,
    source: sourceId,
    target: targetAnchorId,
    label: '',
    lineStyle: 'dashed',
    stroke: DEFAULT_STYLES.note.stroke,
    strokeWidth: 1,
    dashArray: '3,3',
  }
}

// ==================== 参数校验 ====================

/**
 * 验证参与者配置
 */
function validateParticipantConfig(config: ParticipantConfig): void {
  if (!config.id || typeof config.id !== 'string') {
    throw new Error('Participant must have a valid id')
  }
  if (!config.name || typeof config.name !== 'string') {
    throw new Error('Participant must have a valid name')
  }
}

/**
 * 验证消息配置
 */
function validateMessageConfig(config: MessageConfig, participantIds: Set<string>): void {
  if (!config.from || typeof config.from !== 'string') {
    throw new Error('Message must have a valid from participant')
  }
  if (!config.to || typeof config.to !== 'string') {
    throw new Error('Message must have a valid to participant')
  }
  if (!participantIds.has(config.from)) {
    throw new Error(`Message from participant '${config.from}' not found`)
  }
  if (!participantIds.has(config.to)) {
    throw new Error(`Message to participant '${config.to}' not found`)
  }
}

/**
 * 验证片段配置
 */
function validateFragmentConfig(config: FragmentConfig, messageCount: number): void {
  if (config.startMessageIndex < 0 || config.startMessageIndex >= messageCount) {
    throw new Error(`Fragment startMessageIndex ${config.startMessageIndex} out of range`)
  }
  if (config.endMessageIndex < 0 || config.endMessageIndex >= messageCount) {
    throw new Error(`Fragment endMessageIndex ${config.endMessageIndex} out of range`)
  }
  if (config.startMessageIndex > config.endMessageIndex) {
    throw new Error('Fragment startMessageIndex must be <= endMessageIndex')
  }
}

// ==================== 模板生成 ====================

/**
 * 生成基础序列图模板
 */
function generateBaseSequenceDiagram(
  participants: ParticipantConfig[],
  messages: MessageConfig[],
  fragments: FragmentConfig[] = [],
  activations: ActivationConfig[] = [],
  notes: NoteConfig[] = [],
  options: TemplateGenerateOptions = {}
): { nodes: TemplateNode[]; edges: TemplateEdge[] } {
  // 参数校验
  if (!Array.isArray(participants) || participants.length === 0) {
    throw new Error('Participants must be a non-empty array')
  }
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array')
  }

  // 验证参与者配置
  participants.forEach(validateParticipantConfig)

  // 验证消息配置
  const participantIds = new Set(participants.map(p => p.id))
  messages.forEach(msg => validateMessageConfig(msg, participantIds))

  // 验证片段配置
  fragments.forEach(frag => validateFragmentConfig(frag, messages.length))

  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  // 计算布局
  const participantLayouts = calculateParticipantLayout(participants)
  const messageYPositions = calculateMessageYPositions(messages.length, participantLayouts)
  const totalHeight = calculateTotalHeight(
    messages.length,
    DEFAULT_LAYOUT_CONFIG,
    messageYPositions[0] - DEFAULT_LAYOUT_CONFIG.messageSpacing
  )

  // 创建参与者节点
  participants.forEach(participant => {
    const layout = participantLayouts.get(participant.id)!
    nodes.push(createParticipantNode(participant, layout))
  })

  // 创建生命线
  participants.forEach(participant => {
    const layout = participantLayouts.get(participant.id)!
    nodes.push(...createLifelineNodes(participant.id, layout, totalHeight))
  })

  // 创建激活条
  activations.forEach(activation => {
    const layout = participantLayouts.get(activation.participantId)
    if (layout) {
      const startY = messageYPositions[activation.startMessageIndex]
      const endY = messageYPositions[activation.endMessageIndex]
      nodes.push(createActivationBar(activation.participantId, layout, startY, endY))
    }
  })

  // 创建消息
  messages.forEach((message, index) => {
    const fromLayout = participantLayouts.get(message.from)
    const toLayout = participantLayouts.get(message.to)

    if (!fromLayout || !toLayout) return

    const y = messageYPositions[index]

    // 生成带编号的消息标签
    const autoNumber = options.autoNumber ?? false
    const messageLabel = generateMessageLabel(message.label, index + 1, autoNumber)

    const result = createMessage(index, fromLayout, toLayout, y, messageLabel, message.type)

    nodes.push(...result.anchors)
    nodes.push(...result.markers)
    edges.push(result.edge)

    // 处理创建/销毁消息的特殊标记
    if (message.type === 'create') {
      nodes.push(...createCreateMarkers(index, toLayout.centerX, y))
    } else if (message.type === 'destroy') {
      nodes.push(createDestroyMarker(index, toLayout.centerX, y))
    }
  })

  // 创建片段框
  fragments.forEach(fragment => {
    nodes.push(createFragmentNode(fragment, participantLayouts, messageYPositions))
  })

  // 创建注释
  notes.forEach(note => {
    const layout = participantLayouts.get(note.participantId)
    if (layout) {
      const y = note.messageIndex !== undefined 
        ? messageYPositions[note.messageIndex] 
        : layout.bottomY + 50
      nodes.push(createNoteNode(note.text, note.position, layout, y))
    }
  })

  return { nodes, edges }
}

// ==================== 预定义模板 ====================

export const basicSequenceTemplate: DiagramTemplate = {
  id: 'basic-sequence',
  name: '基础序列图',
  description: '简单的请求-响应交互',
  type: 'sequence',
  category: 'uml',
  tags: ['sequence', 'basic'],

  generate(options: TemplateGenerateOptions = {}) {
    const participants: ParticipantConfig[] = [
      { id: 'client', name: 'Client', type: 'participant' },
      { id: 'server', name: 'Server', type: 'participant' },
    ]

    const messages: MessageConfig[] = [
      { from: 'client', to: 'server', label: 'request()', type: 'sync' },
      { from: 'server', to: 'client', label: 'response()', type: 'return' },
    ]

    const activations: ActivationConfig[] = [
      { participantId: 'client', startMessageIndex: 0, endMessageIndex: 1 },
      { participantId: 'server', startMessageIndex: 0, endMessageIndex: 1 },
    ]

    return generateBaseSequenceDiagram(participants, messages, [], activations, [], options)
  },
}

export const authSequenceTemplate: DiagramTemplate = {
  id: 'auth-sequence',
  name: '认证流程',
  description: '用户认证和授权流程',
  type: 'sequence',
  category: 'uml',
  tags: ['sequence', 'auth', 'security'],

  generate(options: TemplateGenerateOptions = {}) {
    const participants: ParticipantConfig[] = [
      { id: 'user', name: 'User', type: 'actor' },
      { id: 'app', name: 'Application', type: 'participant' },
      { id: 'auth', name: 'Auth Service', type: 'participant' },
      { id: 'db', name: 'Database', type: 'database' },
    ]

    const messages: MessageConfig[] = [
      { from: 'user', to: 'app', label: 'login(credentials)' },
      { from: 'app', to: 'auth', label: 'validate(credentials)' },
      { from: 'auth', to: 'db', label: 'query(user)' },
      { from: 'db', to: 'auth', label: 'user data', type: 'return' },
      { from: 'auth', to: 'app', label: 'token', type: 'return' },
      { from: 'app', to: 'user', label: 'success', type: 'return' },
    ]

    const fragments: FragmentConfig[] = [
      {
        type: 'alt',
        startMessageIndex: 2,
        endMessageIndex: 4,
        condition: 'valid credentials',
      },
    ]

    return generateBaseSequenceDiagram(participants, messages, fragments, [], [], options)
  },
}

export const crudSequenceTemplate: DiagramTemplate = {
  id: 'crud-sequence',
  name: 'CRUD操作',
  description: '数据库CRUD操作流程',
  type: 'sequence',
  category: 'uml',
  tags: ['sequence', 'crud', 'database'],

  generate(options: TemplateGenerateOptions = {}) {
    const participants: ParticipantConfig[] = [
      { id: 'ui', name: 'UI', type: 'participant' },
      { id: 'api', name: 'API', type: 'participant' },
      { id: 'db', name: 'Database', type: 'database' },
    ]

    const messages: MessageConfig[] = [
      { from: 'ui', to: 'api', label: 'create(data)' },
      { from: 'api', to: 'db', label: 'INSERT' },
      { from: 'db', to: 'api', label: 'id', type: 'return' },
      { from: 'api', to: 'ui', label: 'created', type: 'return' },
      { from: 'ui', to: 'api', label: 'read(id)' },
      { from: 'api', to: 'db', label: 'SELECT' },
      { from: 'db', to: 'api', label: 'record', type: 'return' },
      { from: 'api', to: 'ui', label: 'data', type: 'return' },
    ]

    return generateBaseSequenceDiagram(participants, messages, [], [], [], options)
  },
}

export const loopSequenceTemplate: DiagramTemplate = {
  id: 'loop-sequence',
  name: '循环处理',
  description: '批量数据处理循环',
  type: 'sequence',
  category: 'uml',
  tags: ['sequence', 'loop', 'batch'],

  generate(options: TemplateGenerateOptions = {}) {
    const participants: ParticipantConfig[] = [
      { id: 'client', name: 'Client', type: 'participant' },
      { id: 'processor', name: 'Processor', type: 'participant' },
      { id: 'db', name: 'Database', type: 'database' },
    ]

    const messages: MessageConfig[] = [
      { from: 'client', to: 'processor', label: 'processBatch(items)' },
      { from: 'processor', to: 'processor', label: 'validate()', type: 'self' },
      { from: 'processor', to: 'db', label: 'save(item)' },
      { from: 'db', to: 'processor', label: 'ok', type: 'return' },
      { from: 'processor', to: 'client', label: 'results', type: 'return' },
    ]

    const fragments: FragmentConfig[] = [
      {
        type: 'loop',
        startMessageIndex: 2,
        endMessageIndex: 3,
        condition: 'for each item',
      },
    ]

    return generateBaseSequenceDiagram(participants, messages, fragments, [], [], options)
  },
}

export const errorHandlingTemplate: DiagramTemplate = {
  id: 'error-handling',
  name: '错误处理',
  description: '异常处理流程',
  type: 'sequence',
  category: 'uml',
  tags: ['sequence', 'error', 'exception'],

  generate(options: TemplateGenerateOptions = {}) {
    const participants: ParticipantConfig[] = [
      { id: 'client', name: 'Client', type: 'participant' },
      { id: 'service', name: 'Service', type: 'participant' },
      { id: 'logger', name: 'Logger', type: 'participant' },
    ]

    const messages: MessageConfig[] = [
      { from: 'client', to: 'service', label: 'request()' },
      { from: 'service', to: 'service', label: 'process()', type: 'self' },
      { from: 'service', to: 'logger', label: 'log(error)' },
      { from: 'service', to: 'client', label: 'error', type: 'return' },
    ]

    const fragments: FragmentConfig[] = [
      {
        type: 'opt',
        startMessageIndex: 2,
        endMessageIndex: 2,
        condition: 'if error',
      },
    ]

    return generateBaseSequenceDiagram(participants, messages, fragments, [], [], options)
  },
}

export const criticalSequenceTemplate: DiagramTemplate = {
  id: 'critical-sequence',
  name: '关键片段',
  description: '原子操作场景',
  type: 'sequence',
  category: 'uml',
  tags: ['sequence', 'critical', 'transaction'],

  generate(options: TemplateGenerateOptions = {}) {
    const participants: ParticipantConfig[] = [
      { id: 'client', name: 'Client', type: 'participant' },
      { id: 'service', name: 'Service', type: 'participant' },
      { id: 'db', name: 'Database', type: 'database' },
    ]

    const messages: MessageConfig[] = [
      { from: 'client', to: 'service', label: 'transfer()', type: 'sync' },
      { from: 'service', to: 'db', label: 'debit()', type: 'sync' },
      { from: 'db', to: 'service', label: 'ok', type: 'return' },
      { from: 'service', to: 'db', label: 'credit()', type: 'sync' },
      { from: 'db', to: 'service', label: 'ok', type: 'return' },
      { from: 'service', to: 'client', label: 'success', type: 'return' },
    ]

    const fragments: FragmentConfig[] = [
      {
        type: 'critical',
        startMessageIndex: 1,
        endMessageIndex: 4,
        condition: 'atomic',
        participantIds: ['service', 'db'],
      },
    ]

    const activations: ActivationConfig[] = [
      { participantId: 'client', startMessageIndex: 0, endMessageIndex: 5 },
      { participantId: 'service', startMessageIndex: 0, endMessageIndex: 5 },
      { participantId: 'db', startMessageIndex: 1, endMessageIndex: 4 },
    ]

    return generateBaseSequenceDiagram(participants, messages, fragments, activations, [], options)
  },
}

export const parSequenceTemplate: DiagramTemplate = {
  id: 'par-sequence',
  name: '并行处理',
  description: '并行执行多个任务',
  type: 'sequence',
  category: 'uml',
  tags: ['sequence', 'parallel', 'async'],

  generate(options: TemplateGenerateOptions = {}) {
    const participants: ParticipantConfig[] = [
      { id: 'client', name: 'Client', type: 'participant' },
      { id: 'service', name: 'Service', type: 'participant' },
      { id: 'api1', name: 'API 1', type: 'participant' },
      { id: 'api2', name: 'API 2', type: 'participant' },
    ]

    const messages: MessageConfig[] = [
      { from: 'client', to: 'service', label: 'fetchData()', type: 'sync' },
      { from: 'service', to: 'api1', label: 'getData()', type: 'async' },
      { from: 'service', to: 'api2', label: 'getData()', type: 'async' },
      { from: 'api1', to: 'service', label: 'data1', type: 'return' },
      { from: 'api2', to: 'service', label: 'data2', type: 'return' },
      { from: 'service', to: 'client', label: 'combined', type: 'return' },
    ]

    const fragments: FragmentConfig[] = [
      {
        type: 'par',
        startMessageIndex: 1,
        endMessageIndex: 4,
        condition: 'parallel calls',
      },
    ]

    const activations: ActivationConfig[] = [
      { participantId: 'client', startMessageIndex: 0, endMessageIndex: 5 },
      { participantId: 'service', startMessageIndex: 0, endMessageIndex: 5 },
      { participantId: 'api1', startMessageIndex: 1, endMessageIndex: 3 },
      { participantId: 'api2', startMessageIndex: 2, endMessageIndex: 4 },
    ]

    return generateBaseSequenceDiagram(participants, messages, fragments, activations, [], options)
  },
}

export const selfCallSequenceTemplate: DiagramTemplate = {
  id: 'self-call-sequence',
  name: '自调用',
  description: '对象内部方法调用',
  type: 'sequence',
  category: 'uml',
  tags: ['sequence', 'self', 'recursion'],

  generate(options: TemplateGenerateOptions = {}) {
    const participants: ParticipantConfig[] = [
      { id: 'client', name: 'Client', type: 'participant' },
      { id: 'service', name: 'Service', type: 'participant' },
    ]

    const messages: MessageConfig[] = [
      { from: 'client', to: 'service', label: 'process()', type: 'sync' },
      { from: 'service', to: 'service', label: 'validate()', type: 'self' },
      { from: 'service', to: 'service', label: 'transform()', type: 'self' },
      { from: 'service', to: 'client', label: 'result', type: 'return' },
    ]

    const activations: ActivationConfig[] = [
      { participantId: 'client', startMessageIndex: 0, endMessageIndex: 3 },
      { participantId: 'service', startMessageIndex: 0, endMessageIndex: 3 },
    ]

    return generateBaseSequenceDiagram(participants, messages, [], activations, [], options)
  },
}

// ==================== 模板导出 ====================

export const sequenceTemplates: DiagramTemplate[] = [
  basicSequenceTemplate,
  authSequenceTemplate,
  crudSequenceTemplate,
  loopSequenceTemplate,
  errorHandlingTemplate,
  criticalSequenceTemplate,
  parSequenceTemplate,
  selfCallSequenceTemplate,
]

/**
 * 获取序列图模板
 */
export function getSequenceTemplates(_options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return sequenceTemplates
}

export default sequenceTemplates
