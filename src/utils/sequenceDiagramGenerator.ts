/**
 * 时序图生成器 - Mermaid 标准布局版（优化版）
 *
 * 核心设计：
 * 1. 参与者是顶部节点（带图标）
 * 2. 生命线是垂直虚线（从参与者中心到底部）
 * 3. 消息连线连接生命线，形成水平线
 * 4. 激活条是覆盖在生命线上的细矩形
 * 5. 片段框覆盖相关消息区域（圆角）
 */

import type {
  ParsedSequenceDiagram,
  SequenceParticipant,
  SequenceMessage,
  SequenceFragment,
  SequenceNote,
  SequenceActivation,
  SequenceReference,
} from './mermaidSequenceParser'
import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector, ConnectorEndStyle } from '../types/connection'
import { v4 as uuidv4 } from 'uuid'
import { SelfLoopRouter, selfLoopManager } from './selfLoopRouter'

export interface GeneratedDiagram {
  nodes: ShapeData[]
  edges: Connector[]
}

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

interface ParticipantLayout {
  id: string
  index: number
  x: number
  y: number
  width: number
  height: number
  centerX: number
  bottomY: number
}

export class SequenceDiagramGenerator {
  private config: LayoutConfig = {
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

  // 样式配置 - 专业 UML 配色（统一优化版）
  private styles = {
    participant: {
      fill: '#f0f5ff',
      fillGradient: ['#ffffff', '#f0f5ff'],
      stroke: '#2f54eb',
      strokeWidth: 2,
      cornerRadius: 6,
      fontSize: 13,
      fontWeight: 600,
      shadow: { blur: 4, color: 'rgba(0,0,0,0.1)', offsetX: 2, offsetY: 2 },
    },
    actor: {
      fill: '#fff7e6',
      fillGradient: ['#ffffff', '#fff7e6'],
      stroke: '#fa8c16',
      strokeWidth: 2.5,
      cornerRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      shadow: { blur: 4, color: 'rgba(0,0,0,0.1)', offsetX: 2, offsetY: 2 },
    },
    database: {
      fill: '#f6ffed',
      fillGradient: ['#ffffff', '#f6ffed'],
      stroke: '#52c41a',
      strokeWidth: 2,
      cornerRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      shadow: { blur: 4, color: 'rgba(0,0,0,0.1)', offsetX: 2, offsetY: 2 },
    },
    lifeline: {
      stroke: '#bfbfbf',
      strokeWidth: 1.5,
      dashArray: '5,5',
    },
    activation: {
      fill: '#1890ff',
      fillGradient: ['#40a9ff', '#1890ff'],
      stroke: '#096dd9',
      strokeWidth: 1.5,
      cornerRadius: 4,
      shadow: { blur: 3, color: 'rgba(24,144,255,0.3)', offsetX: 1, offsetY: 1 },
    },
    fragment: {
      fillOpacity: 0.4,
      strokeWidth: 1.5,
      cornerRadius: 6,
      headerHeight: 28,
      shadow: { blur: 2, color: 'rgba(0,0,0,0.05)', offsetX: 1, offsetY: 1 },
    },
    note: {
      fill: '#fffbe6',
      stroke: '#ffd666',
      strokeWidth: 1.5,
      cornerRadius: 4,
      shadow: { blur: 3, color: 'rgba(0,0,0,0.08)', offsetX: 1, offsetY: 1 },
    },
    message: {
      fontSize: 12,
      color: '#262626',
    },
  }

  private participantLayouts: Map<string, ParticipantLayout> = new Map()
  private messageYMap: Map<number, number> = new Map()
  private totalHeight: number = 0
  private autoNumber: boolean = false
  private diagramData: ParsedSequenceDiagram | null = null

  /**
   * 生成时序图
   */
  generate(data: ParsedSequenceDiagram): GeneratedDiagram {
    const nodes: ShapeData[] = []
    const edges: Connector[] = []

    // 保存数据引用和自动编号状态
    this.diagramData = data
    this.autoNumber = data.autoNumber || false

    // 计算布局
    this.calculateLayout(data)

    // 1. 生成参与者
    this.generateParticipants(data.participants, nodes)

    // 2. 生成生命线（垂直虚线）
    this.generateLifelines(nodes)

    // 3. 生成片段框（在消息之前，作为背景）
    this.generateFragments(data.fragments, nodes)

    // 4. 生成激活条
    this.generateActivations(data.activations, nodes)

    // 5. 生成消息连线
    this.generateMessages(data.messages, nodes, edges)

    // 6. 生成注释
    this.generateNotes(data.notes, nodes)

    // 7. 生成引用框
    this.generateReferences(data.references, nodes)

    return { nodes, edges }
  }

  private calculateLayout(data: ParsedSequenceDiagram): void {
    this.participantLayouts.clear()
    this.messageYMap.clear()

    // 计算参与者布局
    data.participants.forEach((participant, index) => {
      const width = participant.type === 'actor' ? 50 :
                    participant.type === 'database' ? 70 :
                    this.config.participantWidth
      const height = participant.type === 'actor' ? 70 : this.config.participantHeight

      const x = this.config.startX + index * this.config.participantSpacing
      const centerX = x + width / 2

      this.participantLayouts.set(participant.id, {
        id: participant.id,
        index,
        x,
        y: this.config.startY,
        width,
        height,
        centerX,
        bottomY: this.config.startY + height,
      })
    })

    // 计算消息Y位置 - 使用最大参与者高度作为基准
    const maxParticipantHeight = Math.max(
      ...Array.from(this.participantLayouts.values()).map(l => l.height),
      this.config.participantHeight
    )
    let currentY = this.config.startY + maxParticipantHeight + 35
    data.messages.forEach((message) => {
      this.messageYMap.set(message.order, currentY)
      currentY += this.config.messageSpacing
    })

    // 计算总高度
    this.totalHeight = currentY + this.config.lifelineExtension
  }

  private generateParticipants(participants: SequenceParticipant[], nodes: ShapeData[]): void {
    participants.forEach(participant => {
      const layout = this.participantLayouts.get(participant.id)
      if (!layout) return

      let nodeType: string
      let width = layout.width
      let height = layout.height
      let style = this.styles.participant

      switch (participant.type) {
        case 'actor':
          nodeType = 'uml-actor-sequence'
          width = 60
          height = 80
          style = this.styles.actor
          break
        case 'database':
          nodeType = 'uml-database-participant'
          width = 80
          height = 60
          style = this.styles.database
          break
        default:
          nodeType = 'uml-participant'
      }

      const node: ShapeData = {
        id: `part-${participant.id}`,
        type: nodeType,
        x: layout.x + (layout.width - width) / 2,
        y: layout.y,
        width,
        height,
        text: participant.name,
        fill: participant.color || style.fill,
        stroke: participant.color || style.stroke,
        strokeWidth: style.strokeWidth,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        zIndex: 20,
      }

      nodes.push(node)
    })
  }

  private generateLifelines(nodes: ShapeData[]): void {
    this.participantLayouts.forEach(layout => {
      const lifelineHeight = this.totalHeight - layout.bottomY

      // 生命线主体
      const lifeline: ShapeData = {
        id: `lifeline-${layout.id}`,
        type: 'uml-lifeline',
        x: layout.centerX,
        y: layout.bottomY,
        width: 1,
        height: lifelineHeight,
        text: '',
        fill: 'transparent',
        stroke: this.styles.lifeline.stroke,
        strokeWidth: this.styles.lifeline.strokeWidth,
        dashArray: this.styles.lifeline.dashArray,
        zIndex: 1,
      }
      nodes.push(lifeline)

      // 生命线顶部连接点（实心小圆点）
      const topMarker: ShapeData = {
        id: `lifeline-top-${layout.id}`,
        type: 'uml-lifeline-marker',
        x: layout.centerX - 3,
        y: layout.bottomY - 3,
        width: 6,
        height: 6,
        text: '',
        fill: this.styles.lifeline.stroke,
        stroke: 'transparent',
        strokeWidth: 0,
        cornerRadius: 3,
        zIndex: 2,
      }
      nodes.push(topMarker)

      // 生命线底部终止标记（X形）
      const bottomY = layout.bottomY + lifelineHeight
      const bottomMarker: ShapeData = {
        id: `lifeline-bottom-${layout.id}`,
        type: 'uml-lifeline-end',
        x: layout.centerX - 6,
        y: bottomY - 6,
        width: 12,
        height: 12,
        text: '',
        fill: 'transparent',
        stroke: this.styles.lifeline.stroke,
        strokeWidth: 1.5,
        zIndex: 2,
      }
      nodes.push(bottomMarker)
    })
  }

  private generateActivations(activations: SequenceActivation[], nodes: ShapeData[]): void {
    activations.forEach(activation => {
      const layout = this.participantLayouts.get(activation.participant)
      if (!layout) return

      const startY = this.messageYMap.get(activation.startMessageOrder)
      const endY = activation.endMessageOrder > 0
        ? this.messageYMap.get(activation.endMessageOrder)
        : startY

      if (!startY || !endY) return

      const activationBar: ShapeData = {
        id: `activation-${activation.id}`,
        type: 'uml-activation',
        x: layout.centerX - this.config.activationWidth / 2,
        y: startY - 6,
        width: this.config.activationWidth,
        height: Math.max(endY - startY + 12, 28),
        text: '',
        fill: this.styles.activation.fill,
        stroke: this.styles.activation.stroke,
        strokeWidth: this.styles.activation.strokeWidth,
        cornerRadius: this.styles.activation.cornerRadius,
        zIndex: 5,
      }

      nodes.push(activationBar)
    })
  }

  private generateMessages(messages: SequenceMessage[], nodes: ShapeData[], edges: Connector[]): void {
    messages.forEach(message => {
      const fromLayout = this.participantLayouts.get(message.from)
      const toLayout = this.participantLayouts.get(message.to)
      const y = this.messageYMap.get(message.order)

      if (!fromLayout || !toLayout || !y) return

      // 自调用消息特殊处理
      if (message.from === message.to) {
        this.generateSelfMessage(message, fromLayout.centerX, y, nodes, edges)
        return
      }

      // 创建消息源点和目标点（小节点用于连接）
      const sourceId = `msg-src-${message.id}`
      const targetId = `msg-tgt-${message.id}`

      // 源点节点（在发送方生命线上）- 使用1x1像素确保精确位置
      const sourceNode: ShapeData = {
        id: sourceId,
        type: 'uml-anchor',
        x: fromLayout.centerX,
        y: y,
        width: 1,
        height: 1,
        text: '',
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        zIndex: 0,
      }

      // 目标节点（在接收方生命线上）- 使用1x1像素确保精确位置
      const targetNode: ShapeData = {
        id: targetId,
        type: 'uml-anchor',
        x: toLayout.centerX,
        y: y,
        width: 1,
        height: 1,
        text: '',
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        zIndex: 0,
      }

      nodes.push(sourceNode, targetNode)

      // 创建消息边
      const messageLabel = this.generateMessageLabel(message)
      const labelPosition = this.calculateLabelPosition(message)
      const labelOffsetY = this.calculateLabelOffsetY(message.order)
      const edge: Connector = {
        id: `msg-${message.id}`,
        sourceShapeId: sourceId,
        sourcePointId: 'default',
        targetShapeId: targetId,
        targetPointId: 'default',
        stroke: message.color || this.getMessageColor(message.type),
        strokeWidth: 1.5,
        lineStyle: this.getMessageLineStyle(message.type),
        startStyle: 'none',
        endStyle: this.getMessageArrow(message.type),
        style: 'straight',
        labels: messageLabel ? [{
          id: `label-${uuidv4()}`,
          text: messageLabel,
          position: labelPosition,
          offsetX: 0,
          offsetY: labelOffsetY,
          fontSize: 12,
          color: message.color || '#333333',
        }] : undefined,
      }

      edges.push(edge)

      // 添加消息连接点标记（小圆点）
      this.generateMessageConnectionMarkers(message, fromLayout.centerX, toLayout.centerX, y, nodes)

      // 创建消息特殊处理：在目标位置添加创建标记
      if (message.type === 'create') {
        this.generateCreateMarker(message, toLayout.centerX, y, nodes)
      }

      // 销毁消息特殊处理：在目标位置添加销毁标记
      if (message.type === 'destroy') {
        this.generateDestroyMarker(message, toLayout.centerX, y, nodes)
      }
    })
  }

  private generateSelfMessage(
    message: SequenceMessage,
    centerX: number,
    y: number,
    nodes: ShapeData[],
    edges: Connector[]
  ): void {
    // 使用优化的自连线路由算法 - 右侧半圆弧线更符合UML标准
    const router = new SelfLoopRouter({
      radius: 30,
      direction: 'right',
      useBezier: true,
      bezierControlOffset: 45,
      startPosition: 0.5,
      endPosition: 0.5,
    })

    // 计算自连线路径
    const path = router.calculatePath(centerX, y, 10, 10, 0)

    // 创建路径点作为锚点节点
    const anchorIds: string[] = []
    path.points.forEach((point, index) => {
      const anchorId = `self-anchor-${message.id}-${index}`
      anchorIds.push(anchorId)

      const anchorNode: ShapeData = {
        id: anchorId,
        type: 'uml-anchor',
        x: point.x,
        y: point.y,
        width: 1,
        height: 1,
        text: '',
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        zIndex: 0,
      }
      nodes.push(anchorNode)
    })

    // 创建贝塞尔曲线路径点
    const pathPoints = path.points.map(p => ({ x: p.x, y: p.y }))

    // 创建自调用消息边（使用贝塞尔曲线）
    const selfMessageLabel = this.generateMessageLabel(message)
    const selfLabelPosition = this.calculateLabelPosition(message)
    const selfLabelOffsetY = this.calculateLabelOffsetY(message.order)
    const edge: Connector = {
      id: `msg-${message.id}`,
      sourceShapeId: anchorIds[0],
      sourcePointId: 'default',
      targetShapeId: anchorIds[anchorIds.length - 1],
      targetPointId: 'default',
      stroke: this.getMessageColor(message.type),
      strokeWidth: 1.5,
      lineStyle: message.type === 'return' ? 'dashed' : 'solid',
      startStyle: 'none',
      endStyle: this.getMessageArrow(message.type),
      style: 'bezier',
      pathPoints: pathPoints,
      labels: selfMessageLabel ? [{
        id: `label-${uuidv4()}`,
        text: selfMessageLabel,
        position: selfLabelPosition,
        offsetX: 0,
        offsetY: selfLabelOffsetY,
        fontSize: 12,
        color: '#333333',
      }] : undefined,
    }

    edges.push(edge)
  }

  private generateFragments(fragments: SequenceFragment[], nodes: ShapeData[]): void {
    if (this.participantLayouts.size === 0) return

    const centers = Array.from(this.participantLayouts.values()).map(l => l.centerX)
    const minCenter = Math.min(...centers)
    const maxCenter = Math.max(...centers)
    const leftX = minCenter - 30
    const rightX = maxCenter + 30

    // 计算每个片段的嵌套深度
    const fragmentDepths = this.calculateFragmentDepths(fragments)

    fragments.forEach((fragment, index) => {
      const startY = this.messageYMap.get(fragment.startMessageOrder)
      const endY = fragment.endMessageOrder > 0
        ? this.messageYMap.get(fragment.endMessageOrder)
        : startY

      if (!startY) return

      const depth = fragmentDepths.get(fragment.id) || 0
      const indent = depth * 12  // 每层缩进12px

      const strokeColor = this.getFragmentStroke(fragment.type)
      const fillColor = this.getFragmentFill(fragment.type)
      const fragmentLabel = this.getFragmentLabel(fragment)

      // 根据嵌套深度调整样式
      const adjustedStrokeWidth = this.styles.fragment.strokeWidth + depth * 0.5
      const adjustedFillOpacity = Math.max(0.2, this.styles.fragment.fillOpacity - depth * 0.1)
      const adjustedZIndex = depth  // 嵌套越深，zIndex越高（显示在上层）

      const fragmentNode: ShapeData = {
        id: `fragment-${fragment.id}`,
        type: 'uml-fragment',
        x: leftX - 15 + indent,
        y: startY - 30,
        width: rightX - leftX + 30 - indent * 2,
        height: Math.max((endY || startY) - startY + 60, 80),
        text: fragmentLabel,
        fill: fillColor,
        fillOpacity: adjustedFillOpacity,
        stroke: strokeColor,
        strokeWidth: adjustedStrokeWidth,
        cornerRadius: this.styles.fragment.cornerRadius,
        headerHeight: this.styles.fragment.headerHeight,
        zIndex: adjustedZIndex,
      }

      nodes.push(fragmentNode)
    })
  }

  /**
   * 计算每个片段的嵌套深度
   */
  private calculateFragmentDepths(fragments: SequenceFragment[]): Map<string, number> {
    const depths = new Map<string, number>()

    // 按开始消息顺序排序
    const sortedFragments = [...fragments].sort((a, b) => a.startMessageOrder - b.startMessageOrder)

    sortedFragments.forEach(fragment => {
      let depth = 0
      // 检查该片段是否在其他片段内部
      sortedFragments.forEach(other => {
        if (other.id !== fragment.id) {
          // 如果 other 包含 fragment
          if (other.startMessageOrder < fragment.startMessageOrder &&
              other.endMessageOrder > fragment.endMessageOrder) {
            depth++
          }
        }
      })
      depths.set(fragment.id, depth)
    })

    return depths
  }

  private getFragmentLabel(fragment: SequenceFragment): string {
    const labels: Record<string, string> = {
      'alt': 'alt',
      'opt': 'opt',
      'loop': 'loop',
      'par': 'par',
      'break': 'break',
      'critical': 'critical',
      'group': 'group',
    }
    const baseLabel = labels[fragment.type] || fragment.type
    return fragment.condition ? `${baseLabel} [${fragment.condition}]` : baseLabel
  }

  private generateNotes(notes: SequenceNote[], nodes: ShapeData[]): void {
    notes.forEach(note => {
      const participantId = note.participants[0]
      const layout = this.participantLayouts.get(participantId)
      if (!layout) return

      const messageY = note.messageOrder > 0
        ? this.messageYMap.get(note.messageOrder)
        : layout.bottomY + 30

      if (!messageY) return

      let x: number
      let y: number = messageY - 22

      switch (note.position) {
        case 'left':
          x = layout.x - this.config.noteWidth - 15
          break
        case 'right':
          x = layout.x + layout.width + 15
          break
        case 'over':
        case 'across':
        default:
          if (note.participants.length > 1) {
            const lastLayout = this.participantLayouts.get(note.participants[note.participants.length - 1])
            const rightCenter = lastLayout ? lastLayout.centerX : layout.centerX
            x = (layout.centerX + rightCenter) / 2 - this.config.noteWidth / 2
          } else {
            x = layout.centerX - this.config.noteWidth / 2
          }
          y = messageY - 30
          break
      }

      const noteNode: ShapeData = {
        id: `note-${note.id}`,
        type: 'uml-note',
        x,
        y,
        width: this.config.noteWidth,
        height: this.config.noteHeight,
        text: note.text,
        fill: this.styles.note.fill,
        stroke: this.styles.note.stroke,
        strokeWidth: this.styles.note.strokeWidth,
        cornerRadius: this.styles.note.cornerRadius,
        fontSize: 11,
        zIndex: 15,
      }

      nodes.push(noteNode)

      // 添加Note到参与者的虚线连接
      this.generateNoteConnection(note, x, y, layout, nodes)
    })
  }

  /**
   * 生成Note到参与者的虚线连接
   */
  private generateNoteConnection(
    note: SequenceNote,
    noteX: number,
    noteY: number,
    layout: ParticipantLayout,
    nodes: ShapeData[]
  ): void {
    // 只在left/right位置添加连接线
    if (note.position !== 'left' && note.position !== 'right') return

    const isLeft = note.position === 'left'
    const startX = isLeft ? noteX + this.config.noteWidth : noteX
    const startY = noteY + this.config.noteHeight / 2
    const endX = isLeft ? layout.x : layout.x + layout.width
    const endY = layout.bottomY + 10

    // 创建连接线（使用小线段模拟虚线效果）
    const connectionId = `note-conn-${note.id}`
    const connection: ShapeData = {
      id: connectionId,
      type: 'uml-note-connection',
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
      text: '',
      fill: 'transparent',
      stroke: this.styles.note.stroke,
      strokeWidth: 1,
      dashArray: '3,3',
      zIndex: 14,
    }
    nodes.push(connection)
  }

  // ==================== 样式方法 ====================

  private getParticipantFill(type: SequenceParticipant['type']): string {
    switch (type) {
      case 'actor':
        return '#ffffff'
      case 'database':
        return '#ffffff'
      default:
        return '#ffffff'
    }
  }

  private getParticipantStroke(type: SequenceParticipant['type']): string {
    switch (type) {
      case 'actor':
        return '#333333'
      case 'database':
        return '#333333'
      default:
        return '#333333'
    }
  }

  private getMessageColor(type: SequenceMessage['type']): string {
    switch (type) {
      case 'return':
        return '#333333'
      case 'async':
        return '#333333'
      case 'self':
        return '#333333'
      case 'destroy':
        return '#f5222d'
      case 'create':
        return '#333333'
      default:
        return '#333333'
    }
  }

  /**
   * 生成带编号的消息标签
   */
  private generateMessageLabel(message: SequenceMessage): string {
    if (this.autoNumber) {
      return `${message.order}: ${message.text}`
    }
    return message.text
  }

  /**
   * 根据消息类型计算标签位置
   * - 返回消息偏左，便于阅读
   * - 自调用消息偏上，避免与弧线重叠
   * - 普通消息居中
   */
  private calculateLabelPosition(message: SequenceMessage): number {
    switch (message.type) {
      case 'return':
        return 0.35  // 返回消息偏左
      case 'self':
        return 0.25  // 自调用消息偏上
      case 'create':
        return 0.4   // 创建消息略偏左
      case 'destroy':
        return 0.4   // 销毁消息略偏左
      default:
        return 0.5   // 普通消息居中
    }
  }

  /**
   * 计算标签垂直偏移，避免相邻消息标签重叠
   */
  private calculateLabelOffsetY(messageOrder: number): number {
    // 奇数消息向上偏移，偶数消息向下偏移，错开显示
    const baseOffset = -8
    const staggerOffset = (messageOrder % 2 === 1) ? -12 : 5
    return baseOffset + staggerOffset
  }

  /**
   * 生成消息连接点标记（在消息与生命线交点处添加小圆点）
   */
  private generateMessageConnectionMarkers(
    message: SequenceMessage,
    fromCenterX: number,
    toCenterX: number,
    y: number,
    nodes: ShapeData[]
  ): void {
    const markerSize = 4
    const halfSize = markerSize / 2
    const color = message.color || this.getMessageColor(message.type)

    // 源点标记（发送方）
    const sourceMarker: ShapeData = {
      id: `msg-marker-src-${message.id}`,
      type: 'uml-message-marker',
      x: fromCenterX - halfSize,
      y: y - halfSize,
      width: markerSize,
      height: markerSize,
      text: '',
      fill: color,
      stroke: 'transparent',
      strokeWidth: 0,
      cornerRadius: 2,
      zIndex: 3,
    }
    nodes.push(sourceMarker)

    // 目标点标记（接收方）- 销毁消息不添加目标标记（已有X形标记）
    if (message.type !== 'destroy') {
      const targetMarker: ShapeData = {
        id: `msg-marker-tgt-${message.id}`,
        type: 'uml-message-marker',
        x: toCenterX - halfSize,
        y: y - halfSize,
        width: markerSize,
        height: markerSize,
        text: '',
        fill: color,
        stroke: 'transparent',
        strokeWidth: 0,
        cornerRadius: 2,
        zIndex: 3,
      }
      nodes.push(targetMarker)
    }
  }

  private getMessageArrow(type: SequenceMessage['type']): ConnectorEndStyle {
    switch (type) {
      case 'return':
        return 'open-arrow'  // 返回消息使用开放箭头（空心）
      case 'async':
        return 'open-arrow'  // 异步消息使用开放箭头
      case 'destroy':
        return 'none'        // 销毁消息不使用箭头，使用X形标记
      case 'create':
        return 'arrow'       // 创建消息使用实心箭头
      case 'self':
        return 'arrow'
      default:
        return 'arrow'       // 同步消息使用实心箭头
    }
  }

  private generateReferences(references: SequenceReference[], nodes: ShapeData[]): void {
    if (this.participantLayouts.size === 0) return

    references.forEach(reference => {
      const y = this.messageYMap.get(reference.messageOrder)
      if (!y) return

      // 获取引用涉及的所有参与者的布局
      const layouts = reference.participants
        .map(p => this.participantLayouts.get(p))
        .filter((l): l is ParticipantLayout => l !== undefined)

      if (layouts.length === 0) return

      // 计算引用框的位置和大小
      const minX = Math.min(...layouts.map(l => l.centerX))
      const maxX = Math.max(...layouts.map(l => l.centerX))
      const leftX = minX - 40
      const rightX = maxX + 40

      const refNode: ShapeData = {
        id: `ref-${reference.id}`,
        type: 'uml-reference',
        x: leftX,
        y: y - 25,
        width: rightX - leftX,
        height: 50,
        text: reference.text,
        fill: '#f0f5ff',
        fillOpacity: 0.3,
        stroke: '#2f54eb',
        strokeWidth: 1.5,
        cornerRadius: 4,
        fontSize: 12,
        color: '#1d39c4',
        zIndex: 5,
      }

      nodes.push(refNode)
    })
  }

  private getMessageLineStyle(type: SequenceMessage['type']): 'solid' | 'dashed' | 'dotted' {
    switch (type) {
      case 'return':
        return 'dashed'
      case 'create':
        return 'dashed'
      default:
        return 'solid'
    }
  }

  private generateCreateMarker(
    message: SequenceMessage,
    centerX: number,
    y: number,
    nodes: ShapeData[]
  ): void {
    // 在创建消息位置添加标记和标签表示新参与者被创建
    const markerSize = 10
    const halfSize = markerSize / 2
    
    // 创建绿色方块标记
    const marker: ShapeData = {
      id: `create-marker-${message.id}`,
      type: 'uml-create-marker',
      x: centerX - halfSize,
      y: y - halfSize,
      width: markerSize,
      height: markerSize,
      text: '',
      fill: '#52c41a',
      stroke: '#237804',
      strokeWidth: 1.5,
      cornerRadius: 2,
      zIndex: 10,
    }
    nodes.push(marker)
    
    // 添加 «create» 标签
    const label: ShapeData = {
      id: `create-label-${message.id}`,
      type: 'uml-create-label',
      x: centerX + 15,
      y: y - 12,
      width: 60,
      height: 16,
      text: '«create»',
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      fontSize: 10,
      color: '#52c41a',
      fontWeight: 600,
      zIndex: 11,
    }
    nodes.push(label)
  }

  private generateDestroyMarker(
    message: SequenceMessage,
    centerX: number,
    y: number,
    nodes: ShapeData[]
  ): void {
    // 在销毁消息位置添加一个专业X形标记表示参与者被销毁
    const markerSize = 20
    const halfSize = markerSize / 2
    
    // 创建X形路径
    const xPath = `M${centerX - halfSize},${y} L${centerX + halfSize},${y + markerSize} M${centerX + halfSize},${y} L${centerX - halfSize},${y + markerSize}`
    
    const marker: ShapeData = {
      id: `destroy-marker-${message.id}`,
      type: 'uml-destroy-marker',
      x: centerX - halfSize,
      y: y,
      width: markerSize,
      height: markerSize,
      text: '',
      fill: 'none',
      stroke: '#f5222d',
      strokeWidth: 2.5,
      zIndex: 10,
      // 使用pathData存储X形路径
      pathData: xPath,
    }
    nodes.push(marker)

    // 截断生命线（在销毁标记处结束）
    const lifelineId = `lifeline-${message.to}`
    const lifeline = nodes.find(n => n.id === lifelineId)
    if (lifeline) {
      lifeline.height = y - lifeline.y + halfSize
    }
  }

  private getFragmentFill(type: SequenceFragment['type']): string {
    const fills: Record<string, string> = {
      'alt': '#f6ffed',
      'opt': '#fff7e6',
      'loop': '#e6f7ff',
      'par': '#f9f0ff',
      'break': '#fff2f0',
      'critical': '#fff1f0',
      'group': '#f5f5f5',
    }
    return fills[type] || '#f5f5f5'
  }

  private getFragmentStroke(type: SequenceFragment['type']): string {
    const strokes: Record<string, string> = {
      'alt': '#52c41a',
      'opt': '#fa8c16',
      'loop': '#1890ff',
      'par': '#722ed1',
      'break': '#f5222d',
      'critical': '#cf1322',
      'group': '#8c8c8c',
    }
    return strokes[type] || '#8c8c8c'
  }
}

// 导出单例实例
export const sequenceDiagramGenerator = new SequenceDiagramGenerator()

export default sequenceDiagramGenerator
