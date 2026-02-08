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
} from './mermaidSequenceParser'
import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector, ConnectorEndStyle } from '../types/connection'
import { v4 as uuidv4 } from 'uuid'

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
    startX: 80,
    startY: 30,
    participantWidth: 100,
    participantHeight: 50,
    participantSpacing: 160,
    lifelineExtension: 50,
    messageSpacing: 45,
    activationWidth: 10,
    noteWidth: 100,
    noteHeight: 40,
  }

  private participantLayouts: Map<string, ParticipantLayout> = new Map()
  private messageYMap: Map<number, number> = new Map()
  private totalHeight: number = 0

  /**
   * 生成时序图
   */
  generate(data: ParsedSequenceDiagram): GeneratedDiagram {
    const nodes: ShapeData[] = []
    const edges: Connector[] = []

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

      switch (participant.type) {
        case 'actor':
          nodeType = 'uml-actor'
          width = 50
          height = 70
          break
        case 'database':
          nodeType = 'uml-database'
          width = 70
          height = 50
          break
        default:
          nodeType = 'uml-rect'
      }

      const node: ShapeData = {
        id: `part-${participant.id}`,
        type: nodeType,
        x: layout.x,
        y: layout.y,
        width,
        height,
        text: participant.name,
        fill: this.getParticipantFill(participant.type),
        stroke: this.getParticipantStroke(participant.type),
        strokeWidth: 1,
        zIndex: 20,
      }

      nodes.push(node)
    })
  }

  private generateLifelines(nodes: ShapeData[]): void {
    this.participantLayouts.forEach(layout => {
      const lifeline: ShapeData = {
        id: `lifeline-${layout.id}`,
        type: 'uml-lifeline',
        x: layout.centerX - 1,
        y: layout.bottomY,
        width: 2,
        height: this.totalHeight - layout.bottomY,
        text: '',
        fill: 'transparent',
        stroke: '#999999',
        strokeWidth: 1,
        zIndex: 1,
      }
      nodes.push(lifeline)
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
        height: Math.max(endY - startY + 12, 20),
        text: '',
        fill: '#e3e3e3',
        stroke: '#666666',
        strokeWidth: 1,
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
      const edge: Connector = {
        id: `msg-${message.id}`,
        sourceShapeId: sourceId,
        sourcePointId: 'default',
        targetShapeId: targetId,
        targetPointId: 'default',
        stroke: this.getMessageColor(message.type),
        strokeWidth: 1.5,
        lineStyle: message.type === 'return' ? 'dashed' : 'solid',
        startStyle: 'none',
        endStyle: this.getMessageArrow(message.type),
        style: 'straight',
        labels: message.text ? [{
          id: `label-${uuidv4()}`,
          text: message.text,
          position: 0.5,
          fontSize: 12,
          color: '#333333',
        }] : undefined,
      }

      edges.push(edge)
    })
  }

  private generateSelfMessage(
    message: SequenceMessage,
    centerX: number,
    y: number,
    nodes: ShapeData[],
    edges: Connector[]
  ): void {
    const sourceId = `self-src-${message.id}`
    const cornerId = `self-corner-${message.id}`
    const targetId = `self-tgt-${message.id}`

    // 自调用消息的锚点（在生命线上）
    const sourceNode: ShapeData = {
      id: sourceId,
      type: 'uml-anchor',
      x: centerX,
      y: y,
      width: 1,
      height: 1,
      text: '',
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      zIndex: 0,
    }

    // 拐角点（向右偏移）
    const cornerNode: ShapeData = {
      id: cornerId,
      type: 'uml-anchor',
      x: centerX + 30,
      y: y,
      width: 1,
      height: 1,
      text: '',
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      zIndex: 0,
    }

    // 目标点（向下偏移）
    const targetNode: ShapeData = {
      id: targetId,
      type: 'uml-anchor',
      x: centerX + 30,
      y: y + 25,
      width: 1,
      height: 1,
      text: '',
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      zIndex: 0,
    }

    nodes.push(sourceNode, cornerNode, targetNode)

    // 第一段：水平向右
    const edge1: Connector = {
      id: `msg-${message.id}-1`,
      sourceShapeId: sourceId,
      sourcePointId: 'default',
      targetShapeId: cornerId,
      targetPointId: 'default',
      stroke: '#333333',
      strokeWidth: 1.5,
      lineStyle: 'solid',
      startStyle: 'none',
      endStyle: 'none',
      style: 'straight',
    }

    // 第二段：垂直向下带箭头
    const edge2: Connector = {
      id: `msg-${message.id}`,
      sourceShapeId: cornerId,
      sourcePointId: 'default',
      targetShapeId: targetId,
      targetPointId: 'default',
      stroke: '#333333',
      strokeWidth: 1.5,
      lineStyle: 'solid',
      startStyle: 'none',
      endStyle: 'arrow',
      style: 'straight',
      labels: message.text ? [{
        id: `label-${uuidv4()}`,
        text: message.text,
        position: 0.5,
        fontSize: 12,
        color: '#333333',
      }] : undefined,
    }

    edges.push(edge1, edge2)
  }

  private generateFragments(fragments: SequenceFragment[], nodes: ShapeData[]): void {
    if (this.participantLayouts.size === 0) return

    const centers = Array.from(this.participantLayouts.values()).map(l => l.centerX)
    const minCenter = Math.min(...centers)
    const maxCenter = Math.max(...centers)
    const leftX = minCenter - 25
    const rightX = maxCenter + 25

    fragments.forEach(fragment => {
      const startY = this.messageYMap.get(fragment.startMessageOrder)
      const endY = fragment.endMessageOrder > 0
        ? this.messageYMap.get(fragment.endMessageOrder)
        : startY

      if (!startY) return

      const fragmentNode: ShapeData = {
        id: `fragment-${fragment.id}`,
        type: 'uml-fragment',
        x: leftX - 10,
        y: startY - 20,
        width: rightX - leftX + 20,
        height: Math.max((endY || startY) - startY + 40, 60),
        text: `${fragment.type}${fragment.condition ? `: ${fragment.condition}` : ''}`,
        fill: this.getFragmentFill(fragment.type),
        stroke: this.getFragmentStroke(fragment.type),
        strokeWidth: 1,
        zIndex: 0,
      }

      nodes.push(fragmentNode)
    })
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
      let y: number = messageY - 20

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
        fill: '#fffbe6',
        stroke: '#d9d9d9',
        strokeWidth: 1,
        zIndex: 15,
      }

      nodes.push(noteNode)
    })
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

  private getMessageArrow(type: SequenceMessage['type']): ConnectorEndStyle {
    switch (type) {
      case 'return':
        return 'arrow'
      case 'async':
        return 'open-arrow'
      case 'destroy':
        return 'diamond'
      case 'create':
        return 'arrow'
      default:
        return 'arrow'
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
      'group': '#999999',
    }
    return strokes[type] || '#999999'
  }
}

// 导出单例实例
export const sequenceDiagramGenerator = new SequenceDiagramGenerator()

export default sequenceDiagramGenerator
