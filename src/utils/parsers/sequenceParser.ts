import type { MermaidParseResult } from '../../types/diagramTemplate'
import { calculateSequenceLayout } from '../layoutEngine'
import { getNodeColors } from '../mermaidTheme'
import { MermaidSequenceParser } from '../mermaidSequenceParser'

export function parseSequenceDiagram(code: string): MermaidParseResult {
  const parser = new MermaidSequenceParser()
  const parsed = parser.parse(code)

  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []

  const padding = 50
  const participantWidth = 120
  const participantHeight = 50
  const spacing = 160
  const messageSpacing = 55
  const lifelineStartY = padding + participantHeight + 20

  const participantXMap = new Map<string, number>()

  parsed.participants.forEach((p, index) => {
    const x = padding + index * spacing
    participantXMap.set(p.id, x)

    const colors = getNodeColors(p.type === 'actor' ? 'uml-actor' : 'uml-action')

    nodes.push({
      id: p.id,
      type: p.type === 'actor' ? 'uml-actor' : 'uml-action',
      x,
      y: padding,
      width: participantWidth,
      height: participantHeight,
      text: p.name,
      fill: colors.fill,
      stroke: colors.stroke,
      strokeWidth: 2,
    })

    nodes.push({
      id: `lifeline-${p.id}`,
      type: 'uml-lifeline',
      x: x + participantWidth / 2 - 5,
      y: lifelineStartY,
      width: 10,
      height: parsed.messages.length * messageSpacing + 100,
      text: '',
      fill: 'transparent',
      stroke: '#666',
      strokeWidth: 1,
    })
  })

  parsed.messages.forEach((msg, index) => {
    const sourceX = participantXMap.get(msg.from) ?? 0
    const targetX = participantXMap.get(msg.to) ?? 0
    const y = lifelineStartY + index * messageSpacing

    const isSelfMessage = msg.from === msg.to

    edges.push({
      id: msg.id,
      source: msg.from,
      target: msg.to,
      label: parsed.autoNumber ? `${index + 1}. ${msg.text}` : msg.text,
      style: isSelfMessage ? 'curved' : 'straight',
      lineStyle: msg.type === 'return' ? 'dashed' : 'solid',
    })

    if (msg.activate || parsed.activations.some(a => a.participant === msg.to && a.startMessageOrder === msg.order)) {
      const actX = (participantXMap.get(msg.to) ?? 0) + participantWidth / 2 - 10
      const activation = parsed.activations.find(a =>
        a.participant === msg.to && a.startMessageOrder <= msg.order && a.endMessageOrder >= msg.order
      )

      if (activation) {
        nodes.push({
          id: activation.id,
          type: 'uml-activation',
          x: actX,
          y: y - 10,
          width: 20,
          height: messageSpacing * (activation.endMessageOrder - activation.startMessageOrder + 1),
          text: '',
          fill: '#e1e1e1',
          stroke: '#999',
          strokeWidth: 1,
        })
      }
    }
  })

  parsed.fragments.forEach((fragment) => {
    const startY = lifelineStartY + (fragment.startMessageOrder - 1) * messageSpacing - 15
    const endY = lifelineStartY + fragment.endMessageOrder * messageSpacing + 15

    const involvedParticipants = new Set<string>()
    for (let i = fragment.startMessageOrder - 1; i < fragment.endMessageOrder; i++) {
      const msg = parsed.messages[i]
      if (msg) {
        involvedParticipants.add(msg.from)
        involvedParticipants.add(msg.to)
      }
    }

    const participantIndices = Array.from(involvedParticipants)
      .map(id => parsed.participants.findIndex(p => p.id === id))
      .filter(i => i >= 0)

    if (participantIndices.length === 0) return

    const minX = Math.min(...participantIndices)
    const maxX = Math.max(...participantIndices)

    const startX = padding + minX * spacing - 20
    const endX = padding + maxX * spacing + participantWidth + 20

    const fragmentLabels: Record<string, string> = {
      'alt': 'alt',
      'opt': 'opt',
      'loop': 'loop',
      'par': 'par',
      'break': 'break',
      'critical': 'critical',
      'group': fragment.condition || 'group',
    }

    nodes.push({
      id: fragment.id,
      type: 'uml-fragment',
      x: startX,
      y: startY,
      width: endX - startX,
      height: endY - startY,
      text: fragmentLabels[fragment.type] + (fragment.condition ? ` [${fragment.condition}]` : ''),
      fill: '#f4f4f4',
      stroke: '#666',
      strokeWidth: 1,
    })
  })

  parsed.notes.forEach((note) => {
    const y = lifelineStartY + note.messageOrder * messageSpacing
    const participantIndex = parsed.participants.findIndex(p => p.id === note.participants[0])
    const participantX = padding + participantIndex * spacing

    let noteX: number
    let noteWidth = 100

    if (note.position === 'left') {
      noteX = participantX - noteWidth - 20
    } else if (note.position === 'right') {
      noteX = participantX + participantWidth + 20
    } else {
      noteX = participantX
      noteWidth = participantWidth
    }

    nodes.push({
      id: note.id,
      type: 'uml-note',
      x: noteX,
      y: y - 15,
      width: noteWidth,
      height: 30,
      text: note.text,
      fill: '#fff5ad',
      stroke: '#e8d665',
      strokeWidth: 1,
    })
  })

  return {
    success: true,
    diagramType: 'sequence',
    nodes,
    edges,
  }
}
