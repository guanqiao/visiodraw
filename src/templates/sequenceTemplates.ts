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
  getMessageArrow,
  getMessageLineStyle,
} from '../utils/sequenceDiagramUtils'

// ==================== 类型定义 ====================
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
  participantIds?: string[]
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
}): {
  index: number
  x: number
  y: number
  width: number
  height: number
  centerX: number
  bottomY: number
} {
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
): Map<string, { index: number; x: number; y: number; width: number; height: number; centerX: number; bottomY: number }> {
  const participantIds = participants.map(p => p.id)
  const layouts = calculateParticipantLayouts(participantIds, DEFAULT_LAYOUT_CONFIG)
  
  const result = new Map<string, { index: number; x: number; y: number; width: number; height: number; centerX: number; bottomY: number }>()
  
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
  
  // 转换为TemplateNode格式
  return {
    id: node.id,
    type: node.type,
    x: layout.x + (layout.width - adjustedLayout.width) / 2,
    y: layout.y,
    width: adjustedLayout.width,
    height: adjustedLayout.height,
    text: node.text,
    fill: node.fill,
    stroke: node.stroke,
    strokeWidth: node.strokeWidth,
    rx: node.rx,
    ry: node.ry,
    fontSize: node.fontSize,
    fontWeight: node.fontWeight,
  }
}

/**
 * 创建生命线节点（使用共享工具库）
 */
function createLifelineNodes(
  participantId: string,
  layout: any,
  totalHeight: number
): TemplateNode[] {
  const nodes: TemplateNode[] = []
  
  // 生命线主体
  const lifeline = createLifelineNodeUtil(participantId, layout, totalHeight)
  nodes.push({
    id: lifeline.id,
    type: lifeline.type,
    x: lifeline.x,
    y: lifeline.y,
    width: lifeline.width,
    height: lifeline.height,
    text: lifeline.text,
    fill: lifeline.fill,
    stroke: lifeline.stroke,
    strokeWidth: lifeline.strokeWidth,
    dashArray: lifeline.dashArray,
  })
  
  // 顶部标记
  const topMarker = createLifelineTopMarkerUtil(participantId, layout)
  nodes.push({
    id: topMarker.id,
    type: topMarker.type,
    x: topMarker.x,
    y: topMarker.y,
    width: topMarker.width,
    height: topMarker.height,
    text: topMarker.text,
    fill: topMarker.fill,
    stroke: topMarker.stroke,
    strokeWidth: topMarker.strokeWidth,
  })
  
  // 底部标记
  const bottomMarker = createLifelineBottomMarkerUtil(participantId, layout, totalHeight)
  nodes.push({
    id: bottomMarker.id,
    type: bottomMarker.type,
    x: bottomMarker.x,
    y: bottomMarker.y,
    width: bottomMarker.width,
    height: bottomMarker.height,
    text: bottomMarker.text,
    fill: bottomMarker.fill,
    stroke: bottomMarker.stroke,
    strokeWidth: bottomMarker.strokeWidth,
  })
  
  return nodes
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
  
  return {
    id: node.id,
    type: node.type,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    text: node.text,
    fill: node.fill,
    stroke: node.stroke,
    strokeWidth: node.strokeWidth,
  }
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
  
  return markers.map(marker => ({
    id: marker.id,
    type: marker.type,
    x: marker.x,
    y: marker.y,
    width: marker.width,
    height: marker.height,
    text: marker.text,
    fill: marker.fill,
    stroke: marker.stroke,
    strokeWidth: marker.strokeWidth,
  }))
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
  
  return {
    id: marker.id,
    type: marker.type,
    x: marker.x,
    y: marker.y,
    width: marker.width,
    height: marker.height,
    text: marker.text,
    fill: marker.fill,
    stroke: marker.stroke,
    strokeWidth: marker.strokeWidth,
  }
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
  
  return markers.map(marker => ({
    id: marker.id,
    type: marker.type,
    x: marker.x,
    y: marker.y,
    width: marker.width,
    height: marker.height,
    text: marker.text,
    fill: marker.fill,
    stroke: marker.stroke,
    strokeWidth: marker.strokeWidth,
    fontSize: marker.fontSize,
    color: marker.color,
    fontWeight: marker.fontWeight,
  }))
}

// ==================== 消息处理 ====================

/**
 * 创建锚点节点
 */
function createAnchorNode(id: string, x: number, y: number): TemplateNode {
  return {
    id,
    type: 'anchor',
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
      source: edge.sourceShapeId,
      target: edge.targetShapeId,
      label: edge.labels?.[0]?.text || label,
      style: edge.style,
      lineStyle: edge.lineStyle,
      endMarker: edge.endStyle,
      labelPosition: edge.labels?.[0]?.position,
      labelOffsetY: edge.labels?.[0]?.offsetY,
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

// ==================== 模板生成 ====================

/**
 * 生成基础序列图模板
 */
function generateBaseSequenceDiagram(
  participants: ParticipantConfig[],
  messages: MessageConfig[],
  fragments: FragmentConfig[] = [],
  options: TemplateGenerateOptions = {}
): { nodes: TemplateNode[]; edges: TemplateEdge[] } {
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

  // 创建消息
  messages.forEach((message, index) => {
    const fromLayout = participantLayouts.get(message.from)
    const toLayout = participantLayouts.get(message.to)

    if (!fromLayout || !toLayout) return

    const y = messageYPositions[index]
    const result = createMessage(index, fromLayout, toLayout, y, message.label, message.type)

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

  return { nodes, edges }
}

// ==================== 预定义模板 ====================

export const basicSequenceTemplate: DiagramTemplate = {
  id: 'basic-sequence',
  name: '基础序列图',
  description: '简单的请求-响应交互',
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

    return generateBaseSequenceDiagram(participants, messages, [], options)
  },
}

export const authSequenceTemplate: DiagramTemplate = {
  id: 'auth-sequence',
  name: '认证流程',
  description: '用户认证和授权流程',
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

    return generateBaseSequenceDiagram(participants, messages, fragments, options)
  },
}

export const crudSequenceTemplate: DiagramTemplate = {
  id: 'crud-sequence',
  name: 'CRUD操作',
  description: '数据库CRUD操作流程',
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

    return generateBaseSequenceDiagram(participants, messages, [], options)
  },
}

export const loopSequenceTemplate: DiagramTemplate = {
  id: 'loop-sequence',
  name: '循环处理',
  description: '批量数据处理循环',
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

    return generateBaseSequenceDiagram(participants, messages, fragments, options)
  },
}

export const errorHandlingTemplate: DiagramTemplate = {
  id: 'error-handling',
  name: '错误处理',
  description: '异常处理流程',
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

    return generateBaseSequenceDiagram(participants, messages, fragments, options)
  },
}

// ==================== 模板导出 ====================

export const sequenceTemplates: DiagramTemplate[] = [
  basicSequenceTemplate,
  authSequenceTemplate,
  crudSequenceTemplate,
  loopSequenceTemplate,
  errorHandlingTemplate,
]

export default sequenceTemplates
