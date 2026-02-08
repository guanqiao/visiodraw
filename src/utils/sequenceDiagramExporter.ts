/**
 * 时序图导出器
 * 将画布图形反向导出为 Mermaid 时序图脚本
 */

import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector } from '../types/connection'

export interface ExportOptions {
  includeAutoNumber?: boolean
  includeComments?: boolean
}

export class SequenceDiagramExporter {
  /**
   * 将图形导出为 Mermaid 时序图脚本
   */
  export(
    nodes: ShapeData[],
    edges: Connector[],
    options: ExportOptions = {}
  ): string {
    const { includeAutoNumber = false, includeComments = true } = options

    const lines: string[] = []

    // 脚本头部
    lines.push('sequenceDiagram')
    if (includeAutoNumber) {
      lines.push('  autonumber')
    }

    // 收集参与者
    const participants = this.extractParticipants(nodes)
    if (includeComments && participants.length > 0) {
      lines.push('')
      lines.push('  %% 参与者定义')
    }

    participants.forEach(p => {
      const keyword = p.type === 'actor' ? 'actor' : p.type === 'database' ? 'database' : 'participant'
      if (p.name !== p.id) {
        lines.push(`  ${keyword} ${p.id} as ${p.name}`)
      } else {
        lines.push(`  ${keyword} ${p.id}`)
      }
    })

    // 收集消息
    const messages = this.extractMessages(edges, participants)
    if (includeComments && messages.length > 0) {
      lines.push('')
      lines.push('  %% 消息流')
    }

    messages.forEach(msg => {
      const arrow = this.getArrowSyntax(msg.type)
      lines.push(`  ${msg.from}${arrow}${msg.to}: ${msg.text}`)
    })

    return lines.join('\n')
  }

  private extractParticipants(nodes: ShapeData[]): Array<{ id: string; name: string; type: string; order: number }> {
    const participants: Array<{ id: string; name: string; type: string; order: number }> = []

    nodes.forEach(node => {
      if (node.id.startsWith('part-')) {
        const id = node.id.replace('part-', '')
        let type = 'participant'

        if (node.type === 'uml-actor-sequence') {
          type = 'actor'
        } else if (node.type === 'uml-database-participant') {
          type = 'database'
        }

        participants.push({
          id,
          name: node.text || id,
          type,
          order: node.x || 0,
        })
      }
    })

    // 按X坐标排序
    return participants.sort((a, b) => a.order - b.order)
  }

  private extractMessages(
    edges: Connector[],
    participants: Array<{ id: string; name: string; type: string }>
  ): Array<{ from: string; to: string; text: string; type: string }> {
    const messages: Array<{ from: string; to: string; text: string; type: string }> = []

    edges.forEach(edge => {
      if (edge.id.startsWith('msg-')) {
        const fromId = edge.sourceShapeId?.replace('part-', '') || ''
        const toId = edge.targetShapeId?.replace('part-', '') || ''

        // 确定消息类型
        let type = 'sync'
        if (edge.lineStyle === 'dashed') {
          type = 'return'
        } else if (edge.endStyle === 'open-arrow') {
          type = 'async'
        }

        if (fromId === toId) {
          type = 'self'
        }

        messages.push({
          from: fromId,
          to: toId,
          text: edge.labels?.[0]?.text || '',
          type,
        })
      }
    })

    return messages
  }

  private getArrowSyntax(type: string): string {
    switch (type) {
      case 'return':
        return '-->>'
      case 'async':
        return '->'
      case 'self':
        return '->>'
      default:
        return '->>'
    }
  }
}

// 导出单例实例
export const sequenceDiagramExporter = new SequenceDiagramExporter()

export default sequenceDiagramExporter
