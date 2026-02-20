import type { TemplateNode, TemplateEdge } from '../../types/diagramTemplate'
import { calculateLayout, defaultLayoutConfig, type LayoutConfig } from './coreLayout'

export function calculateSequenceLayout(
  participants: TemplateNode[],
  messages: TemplateEdge[]
): { nodes: TemplateNode[]; edges: TemplateEdge[] } {
  const padding = 50
  const participantWidth = 100
  const participantHeight = 50
  const lifelineHeight = 300
  const spacing = 150
  const messageSpacing = 60

  const layoutedParticipants = participants.map((p, index) => ({
    ...p,
    x: padding + index * spacing,
    y: padding,
    width: participantWidth,
    height: participantHeight,
  }))

  const lifelineY = padding + participantHeight
  const lifelines = layoutedParticipants.map(p => ({
    id: `lifeline-${p.id}`,
    type: 'uml-lifeline',
    x: p.x + participantWidth / 2 - 5,
    y: lifelineY,
    width: 10,
    height: lifelineHeight,
    text: '',
    fill: 'transparent',
    stroke: '#666',
    strokeWidth: 1,
  }))

  const layoutedEdges: TemplateEdge[] = []
  let currentY = lifelineY + 30

  messages.forEach((msg, index) => {
    const sourceIndex = participants.findIndex(p => p.id === msg.source)
    const targetIndex = participants.findIndex(p => p.id === msg.target)

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const sourceX = layoutedParticipants[sourceIndex].x + participantWidth / 2
      const targetX = layoutedParticipants[targetIndex].x + participantWidth / 2

      layoutedEdges.push({
        ...msg,
        id: msg.id || `msg-${index}`,
        style: sourceX === targetX ? 'orthogonal' : 'straight',
        lineStyle: msg.lineStyle || 'solid',
      })

      currentY += messageSpacing
    }
  })

  return {
    nodes: [...layoutedParticipants, ...lifelines],
    edges: layoutedEdges,
  }
}

export function calculateClassLayout(
  classes: TemplateNode[],
  relations: TemplateEdge[],
  config: Partial<LayoutConfig> = {}
): TemplateNode[] {
  const fullConfig = { ...defaultLayoutConfig, ...config, direction: config.direction || 'TB' }

  const nodesWithSizes = classes.map(cls => ({
    ...cls,
    width: cls.width || calculateClassWidth(cls.text || ''),
    height: cls.height || calculateClassHeight(cls.text || ''),
  }))

  return calculateLayout(nodesWithSizes, relations, fullConfig)
}

export function calculateERLayout(
  entities: TemplateNode[],
  relations: TemplateEdge[],
  config: Partial<LayoutConfig> = {}
): TemplateNode[] {
  const fullConfig = { ...defaultLayoutConfig, ...config, direction: config.direction || 'LR' }

  const nodesWithSizes = entities.map(entity => ({
    ...entity,
    width: entity.width || calculateEREntityWidth(entity.text || ''),
    height: entity.height || calculateEREntityHeight(entity.text || ''),
  }))

  return calculateLayout(nodesWithSizes, relations, fullConfig)
}

export function calculateStateLayout(
  states: TemplateNode[],
  transitions: TemplateEdge[],
  config: Partial<LayoutConfig> = {}
): TemplateNode[] {
  const fullConfig = { ...defaultLayoutConfig, ...config, direction: config.direction || 'LR' }

  const nodesWithSizes = states.map(state => ({
    ...state,
    width: state.width || calculateStateWidth(state.type || '', state.text || ''),
    height: state.height || calculateStateHeight(state.type || '', state.text || ''),
  }))

  return calculateLayout(nodesWithSizes, transitions, fullConfig)
}

function calculateClassWidth(text: string): number {
  const lines = text.split('\n')
  const maxWidth = Math.max(...lines.map(line => line.length * 8 + 40))
  return Math.max(140, Math.min(300, maxWidth))
}

export function calculateClassHeight(text: string): number {
  const lines = text.split('\n')
  const memberCount = lines.filter(l => l.includes('(') || l.includes(':') || /^[+\-#~]/.test(l)).length
  const headerHeight = 35
  const memberHeight = Math.max(memberCount * 22, 30)
  const methodHeight = 30
  return headerHeight + memberHeight + methodHeight
}

function calculateEREntityWidth(text: string): number {
  const lines = text.split('\n')
  const maxWidth = Math.max(...lines.map(line => line.length * 8 + 20))
  return Math.max(120, Math.min(250, maxWidth))
}

export function calculateEREntityHeight(text: string): number {
  const lines = text.split('\n')
  const headerHeight = 30
  const rowHeight = 24
  return headerHeight + (lines.length - 1) * rowHeight
}

function calculateStateWidth(type: string, text: string): number {
  if (type === 'uml-initial-state' || type === 'uml-final-state') {
    return 30
  }
  const textWidth = text.length * 8 + 40
  return Math.max(100, Math.min(200, textWidth))
}

function calculateStateHeight(type: string, text: string): number {
  if (type === 'uml-initial-state' || type === 'uml-final-state') {
    return 30
  }
  return 50
}
