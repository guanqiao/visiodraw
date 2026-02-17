import type {
  DiagramType,
  MermaidParseResult,
  TemplateNode,
  TemplateEdge,
} from '../types/diagramTemplate'
import { setTheme, getNodeColors, getEdgeColors, parseThemeFromCode } from './mermaidTheme'
import { 
  calculateLayout, 
  parseDirectionFromCode, 
  calculateNodeSize,
  calculateSequenceLayout,
  calculateClassLayout,
  calculateERLayout,
  calculateStateLayout,
} from './layoutEngine'
import { MermaidSequenceParser, type ParsedSequenceDiagram } from './mermaidSequenceParser'

export function detectDiagramType(code: string): DiagramType | null {
  const trimmedCode = code.trim().toLowerCase()

  if (trimmedCode.startsWith('flowchart') || trimmedCode.startsWith('graph')) {
    return 'activity'
  }
  if (trimmedCode.startsWith('sequencediagram')) {
    return 'sequence'
  }
  if (trimmedCode.startsWith('statediagram')) {
    return 'state'
  }
  if (trimmedCode.startsWith('erdiagram')) {
    return 'er'
  }
  if (trimmedCode.startsWith('classdiagram')) {
    return 'class'
  }
  if (trimmedCode.startsWith('gantt')) {
    return 'gantt'
  }
  if (trimmedCode.startsWith('mindmap')) {
    return 'mindmap'
  }
  if (trimmedCode.startsWith('timeline')) {
    return 'timeline'
  }
  if (trimmedCode.startsWith('gitgraph')) {
    return 'gitgraph'
  }
  if (trimmedCode.startsWith('pie')) {
    return 'pie'
  }
  if (trimmedCode.startsWith('journey')) {
    return 'journey'
  }
  if (trimmedCode.startsWith('requirementdiagram')) {
    return 'requirement'
  }
  if (trimmedCode.startsWith('c4context') || trimmedCode.startsWith('c4container') || 
      trimmedCode.startsWith('c4component') || trimmedCode.startsWith('c4dynamic')) {
    return 'c4'
  }

  return null
}

export function parseMermaidCode(code: string): MermaidParseResult {
  const diagramType = detectDiagramType(code)

  if (!diagramType) {
    return {
      success: false,
      error: '无法识别的图表类型，请检查代码格式',
    }
  }

  const themeName = parseThemeFromCode(code)
  setTheme(themeName)

  try {
    switch (diagramType) {
      case 'activity':
        return parseActivityDiagram(code)
      case 'sequence':
        return parseSequenceDiagram(code)
      case 'state':
        return parseStateDiagram(code)
      case 'er':
        return parseErDiagram(code)
      case 'class':
        return parseClassDiagram(code)
      case 'gantt':
        return parseGanttDiagram(code)
      case 'mindmap':
        return parseMindmapDiagram(code)
      case 'timeline':
        return parseTimelineDiagram(code)
      case 'gitgraph':
        return parseGitgraphDiagram(code)
      case 'pie':
        return parsePieDiagram(code)
      case 'journey':
        return parseJourneyDiagram(code)
      case 'requirement':
        return parseRequirementDiagram(code)
      case 'c4':
        return parseC4Diagram(code)
      default:
        return {
          success: false,
          error: '不支持的图表类型',
        }
    }
  } catch (error) {
    return {
      success: false,
      error: `解析错误: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export function parseActivityDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  const nodeMap = new Map<string, TemplateNode>()
  const subgraphMap = new Map<string, { id: string; title: string; nodes: string[] }>()
  const nodeToSubgraph = new Map<string, string>()

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  const directionMatch = lines[0]?.match(/(?:flowchart|graph)\s+(TD|TB|LR|RL|BT)/i)
  const direction = directionMatch?.[1] || 'TD'

  let currentSubgraph: string | null = null
  let subgraphDepth = 0
  const subgraphStack: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]

    const subgraphMatch = line.match(/^subgraph\s+(?:(\w+)\s+)?(?:\[?"?([^"\]]+)"?\]?)?$/i)
    if (subgraphMatch) {
      const subgraphId = subgraphMatch[1] || `subgraph-${subgraphMap.size}`
      const subgraphTitle = subgraphMatch[2]?.trim() || ''
      
      subgraphMap.set(subgraphId, {
        id: subgraphId,
        title: subgraphTitle,
        nodes: [],
      })
      
      if (currentSubgraph) {
        subgraphStack.push(currentSubgraph)
      }
      currentSubgraph = subgraphId
      subgraphDepth++
      continue
    }

    if (line === 'end' && currentSubgraph) {
      if (subgraphStack.length > 0) {
        currentSubgraph = subgraphStack.pop()!
      } else {
        currentSubgraph = null
      }
      subgraphDepth--
      continue
    }

    const edgeMatch = line.match(/^(\w+)\s*(-->|---|-\.->|==>|\.->|<-->|~~~-|---o|o---|---x|x---)\s*(?:\|([^|]+)\|)?\s*(\w+)$/)
    if (edgeMatch) {
      const [, sourceId, arrowType, label, targetId] = edgeMatch

      if (!nodeMap.has(sourceId)) {
        const node = createActivityNode(sourceId, sourceId, direction, nodes.length)
        nodes.push(node)
        nodeMap.set(sourceId, node)
        if (currentSubgraph) {
          subgraphMap.get(currentSubgraph)?.nodes.push(sourceId)
          nodeToSubgraph.set(sourceId, currentSubgraph)
        }
      }

      if (!nodeMap.has(targetId)) {
        const node = createActivityNode(targetId, targetId, direction, nodes.length)
        nodes.push(node)
        nodeMap.set(targetId, node)
        if (currentSubgraph) {
          subgraphMap.get(currentSubgraph)?.nodes.push(targetId)
          nodeToSubgraph.set(targetId, currentSubgraph)
        }
      }

      const edgeStyle = getEdgeStyle(arrowType)
      edges.push({
        id: `edge-${edges.length}`,
        source: sourceId,
        target: targetId,
        label: label?.trim(),
        style: edgeStyle.style,
        lineStyle: edgeStyle.lineStyle,
        startMarker: edgeStyle.startMarker,
        endMarker: edgeStyle.endMarker,
      })

      continue
    }

    const chainedEdgeMatch = line.match(/^(\w+)\s*(-->|---|-\.->|==>|\.->)\s*(?:\|([^|]+)\|)?\s*(\w+)\s*(-->|---|-\.->|==>|\.->)\s*(?:\|([^|]+)\|)?\s*(\w+)/)
    if (chainedEdgeMatch) {
      const [, sourceId, arrowType1, label1, midId, arrowType2, label2, targetId] = chainedEdgeMatch
      
      if (!nodeMap.has(sourceId)) {
        const node = createActivityNode(sourceId, sourceId, direction, nodes.length)
        nodes.push(node)
        nodeMap.set(sourceId, node)
        if (currentSubgraph) {
          subgraphMap.get(currentSubgraph)?.nodes.push(sourceId)
          nodeToSubgraph.set(sourceId, currentSubgraph)
        }
      }
      
      if (!nodeMap.has(midId)) {
        const node = createActivityNode(midId, midId, direction, nodes.length)
        nodes.push(node)
        nodeMap.set(midId, node)
        if (currentSubgraph) {
          subgraphMap.get(currentSubgraph)?.nodes.push(midId)
          nodeToSubgraph.set(midId, currentSubgraph)
        }
      }
      
      if (!nodeMap.has(targetId)) {
        const node = createActivityNode(targetId, targetId, direction, nodes.length)
        nodes.push(node)
        nodeMap.set(targetId, node)
        if (currentSubgraph) {
          subgraphMap.get(currentSubgraph)?.nodes.push(targetId)
          nodeToSubgraph.set(targetId, currentSubgraph)
        }
      }
      
      const edgeStyle1 = getEdgeStyle(arrowType1)
      edges.push({
        id: `edge-${edges.length}`,
        source: sourceId,
        target: midId,
        label: label1?.trim(),
        style: edgeStyle1.style,
        lineStyle: edgeStyle1.lineStyle,
      })
      
      const edgeStyle2 = getEdgeStyle(arrowType2)
      edges.push({
        id: `edge-${edges.length}`,
        source: midId,
        target: targetId,
        label: label2?.trim(),
        style: edgeStyle2.style,
        lineStyle: edgeStyle2.lineStyle,
      })
      
      continue
    }

    const nodeMatch = line.match(/^(\w+)\s*(\[|\(|\{|\(\(|\(\[|<|\[\[|\[\(|\{\{)\s*([^\]]*)\s*(\]|\)|\}|\)\)|\]\)|\]\]|\}\})?\s*(?:-->.*)?$/)
    const newSyntaxMatch = line.match(/^(\w+)\s*@\{\s*shape:\s*\w+\s*\}\s*(?:-->.*)?$/)

    if (nodeMatch || newSyntaxMatch) {
      let nodeId: string
      let openBracket: string
      let text: string
      let fullLine: string

      if (newSyntaxMatch) {
        const match = line.match(/^(\w+)\s*@\{\s*shape:\s*(\w+)\s*\}(?:\s*:\s*(.+))?$/)
        if (match) {
          [, nodeId, , text = ''] = match
          openBracket = ''
          fullLine = line
        } else {
          continue
        }
      } else {
        [, nodeId, openBracket, text] = nodeMatch!
        fullLine = line
      }

      if (!nodeMap.has(nodeId)) {
        const nodeType = getActivityNodeType(openBracket, fullLine)
        const node = createActivityNode(nodeId, text?.trim() || nodeId, direction, nodes.length, nodeType)
        nodes.push(node)
        nodeMap.set(nodeId, node)
        if (currentSubgraph) {
          subgraphMap.get(currentSubgraph)?.nodes.push(nodeId)
          nodeToSubgraph.set(nodeId, currentSubgraph)
        }
      } else {
        const existingNode = nodeMap.get(nodeId)!
        existingNode.text = text?.trim() || nodeId
        existingNode.type = getActivityNodeType(openBracket, fullLine)
        const size = calculateNodeSize(existingNode.type, existingNode.text || '')
        existingNode.width = size.width
        existingNode.height = size.height
      }
    }
  }

  subgraphMap.forEach((subgraph) => {
    if (subgraph.nodes.length > 0) {
      const subgraphNodeIds = subgraph.nodes
      const subgraphNodes = subgraphNodeIds.map(id => nodeMap.get(id)).filter(Boolean) as TemplateNode[]
      
      if (subgraphNodes.length > 0) {
        const padding = 30
        const headerHeight = 30
        
        nodes.push({
          id: subgraph.id,
          type: 'uml-swimlane',
          x: 0,
          y: 0,
          width: 200,
          height: 150,
          text: subgraph.title,
          fill: '#f0f5ff',
          stroke: '#2f54eb',
          strokeWidth: 1,
        })
      }
    }
  })

  const layoutDirection = parseDirectionFromCode(code)
  const layoutedNodes = nodes.length > 0 
    ? calculateLayout(nodes, edges, { direction: layoutDirection })
    : nodes

  return {
    success: true,
    diagramType: 'activity',
    nodes: layoutedNodes,
    edges,
  }
}

function getEdgeStyle(arrowType: string): { 
  style: 'straight' | 'orthogonal' | 'curved' | 'bezier'; 
  lineStyle: 'solid' | 'dashed';
  startMarker?: string;
  endMarker?: string;
} {
  switch (arrowType) {
    case '-->':
      return { style: 'orthogonal', lineStyle: 'solid', endMarker: 'arrow' }
    case '---':
      return { style: 'orthogonal', lineStyle: 'solid' }
    case '-.->':
    case '.->':
      return { style: 'curved', lineStyle: 'dashed', endMarker: 'arrow' }
    case '==>':
      return { style: 'orthogonal', lineStyle: 'solid', endMarker: 'arrow', startMarker: 'arrow' }
    case '<-->':
      return { style: 'orthogonal', lineStyle: 'solid', startMarker: 'arrow', endMarker: 'arrow' }
    case '~~~':
      return { style: 'orthogonal', lineStyle: 'dashed' }
    case '---o':
    case 'o---':
      return { style: 'orthogonal', lineStyle: 'solid', endMarker: 'circle' }
    case '---x':
    case 'x---':
      return { style: 'orthogonal', lineStyle: 'solid', endMarker: 'cross' }
    default:
      return { style: 'orthogonal', lineStyle: 'solid', endMarker: 'arrow' }
  }
}

function createActivityNode(
  id: string,
  text: string,
  direction: string,
  index: number,
  type: string = 'uml-action'
): TemplateNode {
  const size = calculateNodeSize(type, text)
  const colors = getNodeColors(type)

  return {
    id,
    type,
    x: 100,
    y: 100,
    width: size.width,
    height: size.height,
    text,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  }
}

function getActivityNodeType(bracket: string, fullText: string = ''): string {
  const newSyntaxMatch = fullText.match(/@\{\s*shape:\s*(\w+)\s*\}/)
  if (newSyntaxMatch) {
    const shapeName = newSyntaxMatch[1].toLowerCase()
    const shapeMap: Record<string, string> = {
      'stadium': 'mermaid-stadium',
      'cylinder': 'mermaid-cylinder',
      'hexagon': 'mermaid-hexagon',
      'parallelogram': 'mermaid-parallelogram-left',
      'trapezoid': 'mermaid-trapezoid-top',
      'subroutine': 'mermaid-subroutine',
      'circle': 'mermaid-circle',
      'doublecircle': 'mermaid-double-circle',
      'asymmetric': 'mermaid-asymmetric',
      'rhombus': 'mermaid-rhombus',
      'diamond': 'mermaid-rhombus',
      'rect': 'uml-action',
      'rectangle': 'uml-action',
      'roundrect': 'uml-initial',
    }
    return shapeMap[shapeName] || 'uml-action'
  }

  if (fullText.includes('([') && fullText.includes('])')) {
    return 'mermaid-stadium'
  }
  if (fullText.includes('[[[') && fullText.includes(']]]')) {
    return 'mermaid-double-circle'
  }
  if (fullText.includes('(((') && fullText.includes(')))')) {
    return 'mermaid-double-circle'
  }
  if (fullText.includes('[(') && fullText.includes(')]')) {
    return 'mermaid-cylinder'
  }
  if (fullText.includes('{{') && fullText.includes('}}')) {
    return 'mermaid-hexagon'
  }

  switch (bracket) {
    case '(':
      return 'uml-initial'
    case '([':
      return 'mermaid-stadium'
    case '{':
      return 'mermaid-rhombus'
    case '(((':
      return 'mermaid-double-circle'
    case '>':
      return 'mermaid-asymmetric'
    case '[/':
      return 'mermaid-parallelogram-left'
    case '((':
      return 'mermaid-circle'
    case '[[':
      return 'mermaid-subroutine'
    case '[(]':
      return 'mermaid-cylinder'
    case '{{':
      return 'mermaid-hexagon'
    default:
      if (bracket === '[' || bracket?.startsWith('[')) {
        return 'uml-action'
      }
      return 'uml-action'
  }
}

export function parseSequenceDiagram(code: string): MermaidParseResult {
  const parser = new MermaidSequenceParser()
  const parsed = parser.parse(code)
  
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  
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
  
  parsed.fragments.forEach((fragment, index) => {
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
  
  parsed.notes.forEach((note, index) => {
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

export function parseStateDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  const nodeMap = new Map<string, TemplateNode>()

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  for (const line of lines) {
    const stateDefMatch = line.match(/state\s+"([^"]+)"\s+as\s+(\w+)/)
    if (stateDefMatch) {
      const [, name, id] = stateDefMatch
      if (!nodeMap.has(id)) {
        const node = createStateNode(id, name)
        nodes.push(node)
        nodeMap.set(id, node)
      }
      continue
    }

    const compositeMatch = line.match(/state\s+(\w+)\s*\{/)
    if (compositeMatch) {
      const [, id] = compositeMatch
      if (!nodeMap.has(id)) {
        const node = createStateNode(id, id, 'uml-state-composite')
        nodes.push(node)
        nodeMap.set(id, node)
      }
      continue
    }

    const transitionMatch = line.match(/^(\[?\*?\]?|\w+)\s*-->\s*(\[?\*?\]?|\w+)(?:\s*:\s*(.+))?$/)
    if (transitionMatch) {
      const [, sourceId, targetId, event] = transitionMatch

      if (sourceId === '[*]') {
        const startId = 'start'
        if (!nodeMap.has(startId)) {
          const node = createStateNode(startId, '', 'uml-initial-state')
          nodes.push(node)
          nodeMap.set(startId, node)
        }
      }
      if (targetId === '[*]') {
        const endId = 'end'
        if (!nodeMap.has(endId)) {
          const node = createStateNode(endId, '', 'uml-final-state')
          nodes.push(node)
          nodeMap.set(endId, node)
        }
      }

      if (sourceId !== '[*]' && !nodeMap.has(sourceId)) {
        const node = createStateNode(sourceId, sourceId)
        nodes.push(node)
        nodeMap.set(sourceId, node)
      }
      if (targetId !== '[*]' && !nodeMap.has(targetId)) {
        const node = createStateNode(targetId, targetId)
        nodes.push(node)
        nodeMap.set(targetId, node)
      }

      edges.push({
        id: `edge-${edges.length}`,
        source: sourceId === '[*]' ? 'start' : sourceId,
        target: targetId === '[*]' ? 'end' : targetId,
        label: event?.trim(),
        style: 'orthogonal',
        lineStyle: 'solid',
      })
    }
  }

  const layoutedNodes = calculateStateLayout(nodes, edges, { direction: 'LR' })

  return {
    success: true,
    diagramType: 'state',
    nodes: layoutedNodes,
    edges,
  }
}

function createStateNode(id: string, text: string, type: string = 'uml-state'): TemplateNode {
  const size = calculateNodeSize(type, text)
  const colors = getNodeColors(type)

  return {
    id,
    type,
    x: 100,
    y: 100,
    width: size.width,
    height: size.height,
    text,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  }
}

export function parseErDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  const nodeMap = new Map<string, TemplateNode>()

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentEntity: string | null = null
  let entityAttributes: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const entityStartMatch = line.match(/^(\w+)\s*\{/)
    if (entityStartMatch) {
      currentEntity = entityStartMatch[1]
      entityAttributes = []
      continue
    }

    if (line === '}' && currentEntity) {
      const node = createErEntityNode(currentEntity, entityAttributes)
      nodes.push(node)
      nodeMap.set(currentEntity, node)
      currentEntity = null
      continue
    }

    if (currentEntity && line.match(/^(\w+)\s+\w+/)) {
      entityAttributes.push(line)
      continue
    }

    const relationshipMatch = line.match(/^(\w+)\s+([|}o])\|?(-?-?)([|}o])\}\s+(\w+)\s*:\s*(.+)$/)
    const relationshipMatch2 = line.match(/^(\w+)\s+\|\|?(-?-?)([|}o])\}\s+(\w+)\s*:\s*(.+)$/)
    const relationshipMatch3 = line.match(/^(\w+)\s+([|}o])\}(-?-?)\|?\|\s+(\w+)\s*:\s*(.+)$/)

    const match = relationshipMatch || relationshipMatch2 || relationshipMatch3

    if (match) {
      const entity1 = match[1]
      const entity2 = match[5] || match[4]
      const label = match[6] || match[5]

      if (!nodeMap.has(entity1)) {
        const node = createErEntityNode(entity1)
        nodes.push(node)
        nodeMap.set(entity1, node)
      }
      if (!nodeMap.has(entity2)) {
        const node = createErEntityNode(entity2)
        nodes.push(node)
        nodeMap.set(entity2, node)
      }

      edges.push({
        id: `edge-${edges.length}`,
        source: entity1,
        target: entity2,
        label: label?.trim() || '',
        style: 'orthogonal',
        lineStyle: 'solid',
      })
    }
  }

  const layoutedNodes = calculateERLayout(nodes, edges)

  return {
    success: true,
    diagramType: 'er',
    nodes: layoutedNodes,
    edges,
  }
}

function createErEntityNode(name: string, attributes: string[] = []): TemplateNode {
  let text = name
  if (attributes.length > 0) {
    text = name + '\n' + attributes.join('\n')
  }

  const size = calculateNodeSize('er-table-entity-with-columns', text)
  const colors = getNodeColors('er-table-entity-with-columns')

  return {
    id: name,
    type: 'er-table-entity-with-columns',
    x: 100,
    y: 100,
    width: size.width,
    height: size.height,
    text,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  }
}

export function parseClassDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  const classMap = new Map<string, TemplateNode>()

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentClass: string | null = null
  let classMembers: string[] = []
  let classAnnotations: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const directionMatch = line.match(/^direction\s+(TB|BT|LR|RL)$/i)
    if (directionMatch) {
      continue
    }

    const titleMatch = line.match(/^title[:\s]+(.+)$/i)
    if (titleMatch) {
      continue
    }

    const classStartMatch = line.match(/^class\s+(\w+)(?:\s*<<(.+)>>)?\s*\{/)
    if (classStartMatch) {
      const [, className, annotation] = classStartMatch
      currentClass = className
      classMembers = []
      classAnnotations = annotation ? [annotation] : []
      continue
    }

    if (line === '}' && currentClass) {
      const node = createClassNode(currentClass, classMembers, classAnnotations)
      nodes.push(node)
      classMap.set(currentClass, node)
      currentClass = null
      classAnnotations = []
      continue
    }

    const simpleClassMatch = line.match(/^class\s+(\w+)(?:\s*<<(.+)>>)?$/)
    if (simpleClassMatch && !line.includes('{')) {
      const [, className, annotation] = simpleClassMatch
      const annotations = annotation ? [annotation] : []
      if (!classMap.has(className)) {
        const node = createClassNode(className, [], annotations)
        nodes.push(node)
        classMap.set(className, node)
      }
      continue
    }

    if (currentClass && (line.includes('(') || line.includes(':') || line.match(/^[\+\-\#~]/))) {
      classMembers.push(line)
      continue
    }

    const relationMatch = line.match(/^(\w+)\s*([\*o]?<\|[\|>]?\|[\*o]?|<[\|>]?|--[\*o]?|\.\.[\|>]?|\.\.\|>)\s*(\w+)(?:\s*:\s*(.+))?$/)
    if (relationMatch) {
      const [, sourceId, relation, targetId, label] = relationMatch

      if (!classMap.has(sourceId)) {
        const node = createClassNode(sourceId)
        nodes.push(node)
        classMap.set(sourceId, node)
      }
      if (!classMap.has(targetId)) {
        const node = createClassNode(targetId)
        nodes.push(node)
        classMap.set(targetId, node)
      }

      edges.push({
        id: `edge-${edges.length}`,
        source: sourceId,
        target: targetId,
        label: label?.trim() || getRelationLabel(relation),
        style: 'orthogonal',
        lineStyle: relation.includes('.') ? 'dashed' : 'solid',
      })
    }
  }

  const layoutedNodes = calculateClassLayout(nodes, edges)

  return {
    success: true,
    diagramType: 'class',
    nodes: layoutedNodes,
    edges,
  }
}

function createClassNode(name: string, members: string[] = [], annotations: string[] = []): TemplateNode {
  let text = name
  if (annotations.length > 0) {
    text = `«${annotations[0]}»\n${text}`
  }
  if (members.length > 0) {
    text += '\n' + members.join('\n')
  }

  let type = 'uml-class'
  if (annotations.includes('interface')) {
    type = 'uml-interface'
  } else if (annotations.includes('abstract')) {
    type = 'uml-abstract-class'
  } else if (annotations.includes('enumeration') || annotations.includes('enum')) {
    type = 'uml-enum'
  }

  const size = calculateNodeSize(type, text)
  const colors = getNodeColors(type)

  return {
    id: name,
    type,
    x: 100,
    y: 100,
    width: size.width,
    height: size.height,
    text,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  }
}

function getRelationLabel(relation: string): string {
  if (relation.includes('<|--')) return '继承'
  if (relation.includes('*--')) return '组合'
  if (relation.includes('o--')) return '聚合'
  if (relation.includes('-->')) return '关联'
  if (relation.includes('..|>')) return '实现'
  if (relation.includes('..>')) return '依赖'
  return ''
}

export function parseGanttDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentSection = 'Default'
  let yOffset = 100
  let taskIndex = 0

  for (const line of lines) {
    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      continue
    }

    const dateFormatMatch = line.match(/^dateformat\s+(.+)$/i)
    if (dateFormatMatch) {
      continue
    }

    const sectionMatch = line.match(/^section\s+(.+)$/i)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      nodes.push({
        id: `section-${nodes.length}`,
        type: 'uml-action',
        x: 50,
        y: yOffset,
        width: 120,
        height: 30,
        text: currentSection,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })
      yOffset += 50
      continue
    }

    const taskMatch = line.match(/^([^:]+)\s*:\s*(?:(\w+),\s*)?([^,]+)(?:,\s*(.+))?$/)
    if (taskMatch) {
      const [, taskName, taskId, startOrStatus, duration] = taskMatch
      const trimmedTaskName = taskName.trim()

      const isMilestone = line.toLowerCase().includes('milestone')
      const isDone = line.toLowerCase().includes('done')
      const isActive = line.toLowerCase().includes('active')
      const isCrit = line.toLowerCase().includes('crit')

      const nodeId = taskId || `task-${taskIndex}`
      const nodeWidth = isMilestone ? 20 : 150
      const nodeHeight = isMilestone ? 20 : 30

      nodes.push({
        id: nodeId,
        type: isMilestone ? 'uml-initial' : 'uml-action',
        x: 200 + taskIndex * 30,
        y: yOffset,
        width: nodeWidth,
        height: nodeHeight,
        text: trimmedTaskName,
        fill: isDone ? '#52c41a' : isActive ? '#1890ff' : isCrit ? '#f5222d' : '#f0f0f0',
        stroke: isDone ? '#52c41a' : isActive ? '#1890ff' : isCrit ? '#f5222d' : '#999',
        strokeWidth: 2,
      })

      yOffset += 40
      taskIndex++
    }
  }

  return {
    success: true,
    diagramType: 'gantt',
    nodes,
    edges,
  }
}

export function parseMindmapDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  const rootMatch = lines[0]?.match(/root\s*\(\(([^)]+)\)\)|root\s*\[([^\]]+)\]|root\s+(.+)/)
  if (rootMatch) {
    const rootText = rootMatch[1] || rootMatch[2] || rootMatch[3]
    nodes.push({
      id: 'root',
      type: 'uml-initial',
      x: 400,
      y: 50,
      width: 100,
      height: 50,
      text: rootText.trim(),
      fill: '#722ed1',
      stroke: '#722ed1',
      strokeWidth: 2,
    })
  }

  let currentLevel = 0
  let yOffset = 150

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const indent = line.search(/\S/)
    const level = Math.floor(indent / 4)
    const text = line.trim()

    if (text) {
      const nodeId = `node-${nodes.length}`
      const x = 200 + (level * 150)

      nodes.push({
        id: nodeId,
        type: 'uml-action',
        x,
        y: yOffset,
        width: 120,
        height: 40,
        text,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })

      const parentId = level === 0 ? 'root' : `node-${nodes.length - 2}`
      edges.push({
        id: `edge-${edges.length}`,
        source: parentId,
        target: nodeId,
        style: 'orthogonal',
        lineStyle: 'solid',
      })

      yOffset += 60
    }
  }

  return {
    success: true,
    diagramType: 'mindmap',
    nodes,
    edges,
  }
}

export function parseTimelineDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentSection = ''
  let xOffset = 100

  for (const line of lines) {
    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      continue
    }

    const sectionMatch = line.match(/^section\s+(.+)$/i)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      continue
    }

    const timelineMatch = line.match(/^([^:]+)\s*:\s*(.+)$/)
    if (timelineMatch) {
      const [, period, events] = timelineMatch
      const periodId = `period-${nodes.length}`

      nodes.push({
        id: periodId,
        type: 'uml-action',
        x: xOffset,
        y: 100,
        width: 100,
        height: 40,
        text: period.trim(),
        fill: '#fff2e8',
        stroke: '#fa8c16',
        strokeWidth: 2,
      })

      const eventList = events.split(':').map(e => e.trim())
      eventList.forEach((event, index) => {
        const eventId = `event-${nodes.length}`
        nodes.push({
          id: eventId,
          type: 'uml-action',
          x: xOffset,
          y: 180 + index * 60,
          width: 120,
          height: 40,
          text: event,
          fill: '#f6ffed',
          stroke: '#52c41a',
          strokeWidth: 1,
        })

        edges.push({
          id: `edge-${edges.length}`,
          source: periodId,
          target: eventId,
          style: 'orthogonal',
          lineStyle: 'solid',
        })
      })

      xOffset += 150
    }
  }

  return {
    success: true,
    diagramType: 'timeline',
    nodes,
    edges,
  }
}

export function parseGitgraphDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentBranch = 'main'
  let xOffset = 100
  let yOffset = 100
  const branchYMap = new Map<string, number>()
  const commitMap = new Map<string, string>()

  branchYMap.set('main', 100)

  for (const line of lines) {
    const commitMatch = line.match(/^commit(?:\s+(?:id:\s*["']?([^"']+)["']?)?)?/i)
    if (commitMatch) {
      const commitId = commitMatch[1] || `commit-${nodes.length}`
      const nodeId = `node-${nodes.length}`
      const branchY = branchYMap.get(currentBranch) || 100

      nodes.push({
        id: nodeId,
        type: 'uml-initial',
        x: xOffset,
        y: branchY,
        width: 30,
        height: 30,
        text: commitId.slice(0, 7),
        fill: '#1890ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })

      commitMap.set(commitId, nodeId)
      xOffset += 80
      continue
    }

    const branchMatch = line.match(/^branch\s+(\w+)/i)
    if (branchMatch) {
      const branchName = branchMatch[1]
      currentBranch = branchName
      branchYMap.set(branchName, 100 + branchYMap.size * 80)
      continue
    }

    const checkoutMatch = line.match(/^checkout\s+(\w+)/i)
    if (checkoutMatch) {
      currentBranch = checkoutMatch[1]
      continue
    }

    const mergeMatch = line.match(/^merge\s+(\w+)(?:\s+(?:id:\s*["']?([^"']+)["']?)?)?/i)
    if (mergeMatch) {
      const sourceBranch = mergeMatch[1]
      const mergeId = mergeMatch[2] || `merge-${nodes.length}`
      const nodeId = `node-${nodes.length}`
      const branchY = branchYMap.get(currentBranch) || 100

      nodes.push({
        id: nodeId,
        type: 'uml-decision',
        x: xOffset,
        y: branchY,
        width: 30,
        height: 30,
        text: 'M',
        fill: '#722ed1',
        stroke: '#722ed1',
        strokeWidth: 2,
      })

      xOffset += 80
    }
  }

  return {
    success: true,
    diagramType: 'gitgraph',
    nodes,
    edges,
  }
}

export function parsePieDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let showTitle = false
  let title = ''
  const slices: { label: string; value: number }[] = []

  for (const line of lines) {
    if (line.match(/^pie\s+showtitle/i)) {
      showTitle = true
      continue
    }
    if (line.match(/^pie$/i)) {
      continue
    }

    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      title = titleMatch[1]
      continue
    }

    const sliceMatch = line.match(/^"([^"]+)"\s*:\s*(\d+(?:\.\d+)?)/)
    if (sliceMatch) {
      slices.push({
        label: sliceMatch[1],
        value: parseFloat(sliceMatch[2]),
      })
    }
  }

  const centerX = 250
  const centerY = 200
  const radius = 150
  const total = slices.reduce((sum, s) => sum + s.value, 0)

  if (title) {
    nodes.push({
      id: 'pie-title',
      type: 'uml-action',
      x: centerX - 75,
      y: 20,
      width: 150,
      height: 30,
      text: title,
      fill: '#f0f5ff',
      stroke: '#2f54eb',
      strokeWidth: 2,
    })
  }

  let startAngle = -Math.PI / 2
  const colors = [
    '#1890ff', '#52c41a', '#fa8c16', '#eb2f96', 
    '#722ed1', '#13c2c2', '#faad14', '#f5222d'
  ]

  slices.forEach((slice, index) => {
    const sliceAngle = (slice.value / total) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle
    const midAngle = startAngle + sliceAngle / 2

    const labelX = centerX + Math.cos(midAngle) * (radius + 40)
    const labelY = centerY + Math.sin(midAngle) * (radius + 40)

    nodes.push({
      id: `slice-${index}`,
      type: 'uml-action',
      x: labelX - 50,
      y: labelY - 15,
      width: 100,
      height: 30,
      text: `${slice.label}: ${slice.value}`,
      fill: colors[index % colors.length],
      stroke: colors[index % colors.length],
      strokeWidth: 1,
    })

    startAngle = endAngle
  })

  nodes.push({
    id: 'pie-center',
    type: 'mermaid-circle',
    x: centerX - radius,
    y: centerY - radius,
    width: radius * 2,
    height: radius * 2,
    text: '',
    fill: '#f0f0f0',
    stroke: '#999',
    strokeWidth: 2,
  })

  return {
    success: true,
    diagramType: 'pie',
    nodes,
    edges,
  }
}

export function parseJourneyDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let title = ''
  let currentSection = ''
  let yOffset = 80
  let taskIndex = 0

  for (const line of lines) {
    if (line.match(/^journey$/i)) {
      continue
    }

    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      title = titleMatch[1]
      nodes.push({
        id: 'journey-title',
        type: 'uml-action',
        x: 300,
        y: 20,
        width: 200,
        height: 40,
        text: title,
        fill: '#f0f5ff',
        stroke: '#2f54eb',
        strokeWidth: 2,
      })
      continue
    }

    const sectionMatch = line.match(/^section\s+(.+)$/i)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      nodes.push({
        id: `section-${nodes.length}`,
        type: 'uml-swimlane',
        x: 50,
        y: yOffset,
        width: 600,
        height: 40,
        text: currentSection,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 1,
      })
      yOffset += 60
      continue
    }

    const taskMatch = line.match(/^([^:]+):\s*(\d+)(?::\s*(.+))?$/)
    if (taskMatch) {
      const [, taskName, score, actors] = taskMatch
      const taskId = `task-${taskIndex}`

      nodes.push({
        id: taskId,
        type: 'uml-action',
        x: 100 + taskIndex * 80,
        y: yOffset,
        width: 120,
        height: 40,
        text: taskName.trim(),
        fill: '#f6ffed',
        stroke: '#52c41a',
        strokeWidth: 2,
      })

      if (taskIndex > 0) {
        edges.push({
          id: `edge-${edges.length}`,
          source: `task-${taskIndex - 1}`,
          target: taskId,
          style: 'orthogonal',
          lineStyle: 'solid',
        })
      }

      taskIndex++
    }
  }

  return {
    success: true,
    diagramType: 'journey',
    nodes,
    edges,
  }
}

export function parseRequirementDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  const requirementMap = new Map<string, TemplateNode>()
  let yOffset = 100

  for (const line of lines) {
    if (line.match(/^requirementdiagram$/i)) {
      continue
    }

    const requirementMatch = line.match(/^requirement\s+(\w+)\s*\{/)
    if (requirementMatch) {
      const reqId = requirementMatch[1]
      requirementMap.set(reqId, {
        id: reqId,
        type: 'uml-action',
        x: 100,
        y: yOffset,
        width: 180,
        height: 80,
        text: reqId,
        fill: '#fff4dd',
        stroke: '#d4b46a',
        strokeWidth: 2,
      })
      yOffset += 100
      continue
    }

    const functionalMatch = line.match(/^functionalrequirement\s+(\w+)\s*\{/)
    if (functionalMatch) {
      const reqId = functionalMatch[1]
      requirementMap.set(reqId, {
        id: reqId,
        type: 'uml-action',
        x: 100,
        y: yOffset,
        width: 180,
        height: 80,
        text: reqId,
        fill: '#e6fffb',
        stroke: '#13c2c2',
        strokeWidth: 2,
      })
      yOffset += 100
      continue
    }

    const interfaceMatch = line.match(/^interfacerequirement\s+(\w+)\s*\{/)
    if (interfaceMatch) {
      const reqId = interfaceMatch[1]
      requirementMap.set(reqId, {
        id: reqId,
        type: 'uml-interface',
        x: 100,
        y: yOffset,
        width: 180,
        height: 80,
        text: reqId,
        fill: '#f6ffed',
        stroke: '#52c41a',
        strokeWidth: 2,
      })
      yOffset += 100
      continue
    }

    const elementMatch = line.match(/^element\s+(\w+)\s*\{/)
    if (elementMatch) {
      const elemId = elementMatch[1]
      requirementMap.set(elemId, {
        id: elemId,
        type: 'uml-component',
        x: 350,
        y: yOffset,
        width: 150,
        height: 60,
        text: elemId,
        fill: '#f0f5ff',
        stroke: '#2f54eb',
        strokeWidth: 2,
      })
      continue
    }

    const relationshipMatch = line.match(/^(\w+)\s*(->|-.->)\s*(\w+)/)
    if (relationshipMatch) {
      const [, source, , target] = relationshipMatch
      edges.push({
        id: `edge-${edges.length}`,
        source,
        target,
        style: 'orthogonal',
        lineStyle: relationshipMatch[2] === '-.-> ' ? 'dashed' : 'solid',
      })
    }
  }

  return {
    success: true,
    diagramType: 'requirement',
    nodes: Array.from(requirementMap.values()),
    edges,
  }
}

export function parseC4Diagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  const elementMap = new Map<string, TemplateNode>()
  let yOffset = 100
  let xOffset = 100

  for (const line of lines) {
    if (line.match(/^c4context|c4container|c4component|c4dynamic$/i)) {
      continue
    }

    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      nodes.push({
        id: 'c4-title',
        type: 'uml-action',
        x: 250,
        y: 20,
        width: 200,
        height: 40,
        text: titleMatch[1],
        fill: '#f0f5ff',
        stroke: '#2f54eb',
        strokeWidth: 2,
      })
      continue
    }

    const personMatch = line.match(/^person\(([^,]+),\s*([^,]+),\s*([^)]+)\)/i)
    if (personMatch) {
      const [, id, name, desc] = personMatch
      elementMap.set(id.trim(), {
        id: id.trim(),
        type: 'uml-actor',
        x: xOffset,
        y: yOffset,
        width: 100,
        height: 80,
        text: name.trim(),
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })
      yOffset += 100
      continue
    }

    const systemMatch = line.match(/^(system|systemdb|systemqueue|systemext)\(([^,]+),\s*([^,]+),\s*([^)]+)\)/i)
    if (systemMatch) {
      const [, type, id, name, desc] = systemMatch
      elementMap.set(id.trim(), {
        id: id.trim(),
        type: 'uml-component',
        x: xOffset + 200,
        y: yOffset,
        width: 150,
        height: 80,
        text: name.trim(),
        fill: type.toLowerCase().includes('ext') ? '#fff0f6' : '#f6ffed',
        stroke: type.toLowerCase().includes('ext') ? '#eb2f96' : '#52c41a',
        strokeWidth: 2,
      })
      yOffset += 100
      continue
    }

    const containerMatch = line.match(/^container\(([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/i)
    if (containerMatch) {
      const [, id, name, tech, desc] = containerMatch
      elementMap.set(id.trim(), {
        id: id.trim(),
        type: 'uml-component',
        x: xOffset + 200,
        y: yOffset,
        width: 150,
        height: 80,
        text: `${name.trim()}\n[${tech.trim()}]`,
        fill: '#fff4dd',
        stroke: '#d4b46a',
        strokeWidth: 2,
      })
      yOffset += 100
      continue
    }

    const relMatch = line.match(/^rel\(([^,]+),\s*([^,]+),\s*([^)]+)\)/i)
    if (relMatch) {
      const [, from, to, label] = relMatch
      edges.push({
        id: `edge-${edges.length}`,
        source: from.trim(),
        target: to.trim(),
        label: label.trim(),
        style: 'orthogonal',
        lineStyle: 'solid',
      })
    }
  }

  return {
    success: true,
    diagramType: 'c4',
    nodes: Array.from(elementMap.values()),
    edges,
  }
}
