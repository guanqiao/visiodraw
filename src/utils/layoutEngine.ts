import dagre from 'dagre'
import type { TemplateNode, TemplateEdge } from '../types/diagramTemplate'

export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL'

export interface LayoutConfig {
  direction: LayoutDirection
  nodeWidth: number
  nodeHeight: number
  rankSpacing: number
  nodeSpacing: number
  padding: number
  align?: 'UL' | 'UR' | 'DL' | 'DR'
  acyclicer?: 'greedy' | 'dfs'
  ranker?: 'network-simplex' | 'tight-tree' | 'longest-path'
}

export const defaultLayoutConfig: LayoutConfig = {
  direction: 'TB',
  nodeWidth: 120,
  nodeHeight: 60,
  rankSpacing: 80,
  nodeSpacing: 50,
  padding: 50,
  ranker: 'network-simplex',
}

export function calculateLayout(
  nodes: TemplateNode[],
  edges: TemplateEdge[],
  config: Partial<LayoutConfig> = {}
): TemplateNode[] {
  const fullConfig = { ...defaultLayoutConfig, ...config }
  
  if (nodes.length === 0) return []
  if (edges.length === 0) {
    return calculateGridLayout(nodes, fullConfig)
  }

  const g = new dagre.graphlib.Graph()
  
  g.setGraph({
    rankdir: fullConfig.direction,
    nodesep: fullConfig.nodeSpacing,
    ranksep: fullConfig.rankSpacing,
    marginx: fullConfig.padding,
    marginy: fullConfig.padding,
    align: fullConfig.align,
    acyclicer: fullConfig.acyclicer,
    ranker: fullConfig.ranker,
  })
  
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach(node => {
    g.setNode(node.id, {
      width: node.width || fullConfig.nodeWidth,
      height: node.height || fullConfig.nodeHeight,
    })
  })

  edges.forEach(edge => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target)
    }
  })

  dagre.layout(g)

  return nodes.map(node => {
    const dagreNode = g.node(node.id)
    if (dagreNode) {
      return {
        ...node,
        x: dagreNode.x - (dagreNode.width / 2),
        y: dagreNode.y - (dagreNode.height / 2),
      }
    }
    return node
  })
}

export function calculateGridLayout(
  nodes: TemplateNode[],
  config: Partial<LayoutConfig> = {}
): TemplateNode[] {
  const fullConfig = { ...defaultLayoutConfig, ...config }
  const cols = Math.ceil(Math.sqrt(nodes.length))
  const cellWidth = fullConfig.nodeWidth + fullConfig.nodeSpacing
  const cellHeight = fullConfig.nodeHeight + fullConfig.rankSpacing
  
  return nodes.map((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    
    return {
      ...node,
      x: fullConfig.padding + col * cellWidth,
      y: fullConfig.padding + row * cellHeight,
    }
  })
}

export function parseDirectionFromCode(code: string): LayoutDirection {
  const directionMatch = code.match(/(?:flowchart|graph)\s+(TD|TB|BT|LR|RL)/i)
  if (directionMatch) {
    const dir = directionMatch[1].toUpperCase()
    if (dir === 'TD') return 'TB'
    return dir as LayoutDirection
  }
  return 'TB'
}

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
  const lifelines = layoutedParticipants.map((p, index) => ({
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

function calculateClassHeight(text: string): number {
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

function calculateEREntityHeight(text: string): number {
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

export function calculateNodeSize(
  type: string,
  text: string,
  config: { minWidth?: number; minHeight?: number; padding?: number } = {}
): { width: number; height: number } {
  const { minWidth = 80, minHeight = 40, padding = 20 } = config
  
  const textLines = text.split('\n')
  const maxLineLength = Math.max(...textLines.map(l => l.length))
  const textWidth = maxLineLength * 9 + padding * 2
  const textHeight = textLines.length * 18 + padding * 2
  
  switch (type) {
    case 'uml-initial':
    case 'uml-final':
    case 'uml-initial-state':
    case 'uml-final-state':
      return { width: 30, height: 30 }
    
    case 'uml-decision':
    case 'mermaid-rhombus':
      return { width: 80, height: 80 }
    
    case 'uml-fork':
    case 'uml-join':
      return { width: 20, height: 80 }
    
    case 'mermaid-stadium':
      return {
        width: Math.max(100, textWidth),
        height: Math.max(40, textHeight),
      }
    
    case 'mermaid-circle':
    case 'mermaid-double-circle':
      const circleSize = Math.max(40, Math.max(textWidth, textHeight))
      return { width: circleSize, height: circleSize }
    
    case 'mermaid-cylinder':
      return {
        width: Math.max(80, textWidth),
        height: Math.max(60, textHeight + 15),
      }
    
    case 'mermaid-hexagon':
      return {
        width: Math.max(100, textWidth + 20),
        height: Math.max(50, textHeight),
      }
    
    case 'uml-class':
    case 'uml-interface':
    case 'uml-abstract-class':
    case 'uml-enum':
      return {
        width: Math.max(140, textWidth),
        height: calculateClassHeight(text),
      }
    
    case 'er-table-entity':
    case 'er-table-entity-with-columns':
      return {
        width: Math.max(120, textWidth),
        height: calculateEREntityHeight(text),
      }
    
    case 'uml-state':
      return {
        width: Math.max(100, textWidth),
        height: Math.max(50, textHeight),
      }
    
    case 'uml-lifeline':
      return { width: 10, height: 300 }
    
    case 'uml-activation':
      return { width: 20, height: 60 }
    
    default:
      return {
        width: Math.max(minWidth, textWidth),
        height: Math.max(minHeight, textHeight),
      }
  }
}

export interface SwimlaneConfig {
  direction: 'horizontal' | 'vertical'
  laneWidth: number
  laneHeight: number
  headerHeight: number
  padding: number
  laneSpacing: number
}

export const defaultSwimlaneConfig: SwimlaneConfig = {
  direction: 'vertical',
  laneWidth: 200,
  laneHeight: 300,
  headerHeight: 40,
  padding: 20,
  laneSpacing: 0,
}

export function calculateSwimlaneLayout(
  nodes: TemplateNode[],
  edges: TemplateEdge[],
  swimlaneIds: string[],
  config: Partial<SwimlaneConfig> = {}
): TemplateNode[] {
  const fullConfig = { ...defaultSwimlaneConfig, ...config }
  
  const swimlaneNodes = nodes.filter(n => 
    n.type === 'uml-swimlane' || 
    n.type === 'uml-swimlane-horizontal' || 
    n.type === 'uml-swimlane-vertical' ||
    n.type === 'uml-swimlane-pool' ||
    swimlaneIds.includes(n.id)
  )
  
  const regularNodes = nodes.filter(n => !swimlaneNodes.includes(n))
  
  const nodeToSwimlane = new Map<string, string>()
  regularNodes.forEach(node => {
    const swimlaneId = (node.data as any)?.swimlaneId
    if (swimlaneId) {
      nodeToSwimlane.set(node.id, swimlaneId)
    }
  })
  
  const swimlaneChildren = new Map<string, TemplateNode[]>()
  regularNodes.forEach(node => {
    const swimlaneId = nodeToSwimlane.get(node.id)
    if (swimlaneId) {
      if (!swimlaneChildren.has(swimlaneId)) {
        swimlaneChildren.set(swimlaneId, [])
      }
      swimlaneChildren.get(swimlaneId)!.push(node)
    }
  })
  
  swimlaneChildren.forEach((children, swimlaneId) => {
    const internalEdges = edges.filter(e => 
      children.some(c => c.id === e.source) && 
      children.some(c => c.id === e.target)
    )
    
    const layoutedChildren = calculateLayout(children, internalEdges, {
      direction: fullConfig.direction === 'vertical' ? 'TB' : 'LR',
      padding: fullConfig.padding,
    })
    
    layoutedChildren.forEach((node, index) => {
      const originalNode = children[index]
      originalNode.x = node.x
      originalNode.y = node.y
    })
  })
  
  return nodes
}

export function groupNodesBySwimlane(
  nodes: TemplateNode[]
): Map<string, TemplateNode[]> {
  const groups = new Map<string, TemplateNode[]>()
  
  nodes.forEach(node => {
    const swimlaneId = (node.data as any)?.swimlaneId
    if (swimlaneId) {
      if (!groups.has(swimlaneId)) {
        groups.set(swimlaneId, [])
      }
      groups.get(swimlaneId)!.push(node)
    } else {
      if (!groups.has('__default__')) {
        groups.set('__default__', [])
      }
      groups.get('__default__')!.push(node)
    }
  })
  
  return groups
}

export function calculateSwimlaneBounds(
  nodes: TemplateNode[],
  swimlaneId: string
): { x: number; y: number; width: number; height: number } {
  const swimlaneNodes = nodes.filter(
    n => (n.data as any)?.swimlaneId === swimlaneId
  )
  
  if (swimlaneNodes.length === 0) {
    return { x: 0, y: 0, width: 200, height: 150 }
  }
  
  const padding = 30
  const headerHeight = 40
  
  const minX = Math.min(...swimlaneNodes.map(n => n.x))
  const maxX = Math.max(...swimlaneNodes.map(n => n.x + (n.width || 100)))
  const minY = Math.min(...swimlaneNodes.map(n => n.y))
  const maxY = Math.max(...swimlaneNodes.map(n => n.y + (n.height || 60)))
  
  return {
    x: minX - padding,
    y: minY - padding - headerHeight,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2 + headerHeight,
  }
}
