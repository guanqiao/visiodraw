import type {
  DiagramTemplate,
  TemplateNode,
  TemplateEdge,
  TemplateGenerateOptions,
} from '../types/diagramTemplate'
import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector, ConnectorEndStyle } from '../types/connection'
import { getCurrentTheme } from './mermaidTheme'

export function templateNodeToShapeData(node: TemplateNode): ShapeData {
  return {
    id: node.id,
    type: node.type,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    fill: node.fill || '#ffffff',
    stroke: node.stroke || '#333333',
    strokeWidth: node.strokeWidth || 2,
    text: node.text,
  }
}

export function templateEdgeToConnector(edge: TemplateEdge, nodes: TemplateNode[]): Connector {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)
  
  const { sourcePointId, targetPointId } = calculateConnectionPoints(
    sourceNode,
    targetNode,
    edge.style
  )
  
  const startMarker = edge.startMarker || 'none'
  const endMarker = edge.endMarker || 'arrow'
  
  const theme = getCurrentTheme()
  
  return {
    id: edge.id,
    sourceShapeId: edge.source,
    sourcePointId,
    targetShapeId: edge.target,
    targetPointId,
    style: (edge.style as any) || 'orthogonal',
    lineStyle: edge.lineStyle || 'solid',
    startStyle: (startMarker === 'none' ? 'none' : startMarker) as ConnectorEndStyle,
    endStyle: (endMarker === 'arrow' ? 'classic' : endMarker) as ConnectorEndStyle,
    stroke: theme.lineColor || '#666',
    strokeWidth: 2,
    labels: edge.label ? [{ 
      id: `${edge.id}-label`, 
      text: edge.label, 
      position: 0.5,
      fontSize: 12,
      color: theme.textColor || '#333',
      backgroundColor: theme.edgeLabelBackground || '#fff',
    }] : undefined,
  }
}

function calculateConnectionPoints(
  sourceNode?: TemplateNode,
  targetNode?: TemplateNode,
  style?: string
): { sourcePointId: string; targetPointId: string } {
  if (!sourceNode || !targetNode) {
    return { sourcePointId: 'bottom', targetPointId: 'top' }
  }
  
  const sourceCenterX = sourceNode.x + (sourceNode.width || 100) / 2
  const sourceCenterY = sourceNode.y + (sourceNode.height || 60) / 2
  const targetCenterX = targetNode.x + (targetNode.width || 100) / 2
  const targetCenterY = targetNode.y + (targetNode.height || 60) / 2
  
  const dx = targetCenterX - sourceCenterX
  const dy = targetCenterY - sourceCenterY
  
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      return { sourcePointId: 'right', targetPointId: 'left' }
    } else {
      return { sourcePointId: 'left', targetPointId: 'right' }
    }
  } else {
    if (dy > 0) {
      return { sourcePointId: 'bottom', targetPointId: 'top' }
    } else {
      return { sourcePointId: 'top', targetPointId: 'bottom' }
    }
  }
}

export function buildDiagramTemplate(template: DiagramTemplate): {
  nodes: ShapeData[]
  edges: Connector[]
} {
  const nodes = template.nodes.map(templateNodeToShapeData)
  const edges = template.edges?.map(edge => templateEdgeToConnector(edge, template.nodes)) || []

  return { nodes, edges }
}

export function getDefaultGenerateOptions(): Required<TemplateGenerateOptions> {
  return {
    startX: 100,
    startY: 100,
    spacing: 120,
    direction: 'vertical',
  }
}

export function calculateNodePosition(
  index: number,
  options: TemplateGenerateOptions = {}
): { x: number; y: number } {
  const opts = { ...getDefaultGenerateOptions(), ...options }

  if (opts.direction === 'horizontal') {
    return {
      x: opts.startX + index * opts.spacing,
      y: opts.startY,
    }
  }

  return {
    x: opts.startX,
    y: opts.startY + index * opts.spacing,
  }
}

export function createTemplateNode(
  id: string,
  type: string,
  text: string,
  index: number,
  options: TemplateGenerateOptions = {}
): TemplateNode {
  const position = calculateNodePosition(index, options)
  const theme = getCurrentTheme()

  const baseNode: TemplateNode = {
    id,
    type,
    x: position.x,
    y: position.y,
    width: 120,
    height: 60,
    text,
  }

  switch (type) {
    case 'uml-initial':
    case 'uml-final':
      return {
        ...baseNode,
        width: 30,
        height: 30,
        fill: type === 'uml-initial' ? '#52c41a' : '#f5222d',
        stroke: type === 'uml-initial' ? '#52c41a' : '#f5222d',
        strokeWidth: 2,
      }
    case 'uml-decision':
      return {
        ...baseNode,
        width: 60,
        height: 60,
        fill: '#fff7e6',
        stroke: '#fa8c16',
        strokeWidth: 2,
      }
    case 'uml-fork':
      return {
        ...baseNode,
        width: 20,
        height: 80,
        fill: '#722ed1',
        stroke: '#722ed1',
        strokeWidth: 4,
      }
    case 'uml-lifeline':
      return {
        ...baseNode,
        width: 60,
        height: 300,
        fill: theme.actorBkg,
        stroke: theme.actorBorder,
        strokeWidth: 2,
      }
    case 'uml-state':
      return {
        ...baseNode,
        width: 120,
        height: 60,
        fill: theme.altBackground,
        stroke: theme.lineColor,
        strokeWidth: 2,
      }
    case 'uml-initial-state':
      return {
        ...baseNode,
        width: 30,
        height: 30,
        fill: '#52c41a',
        stroke: '#52c41a',
        strokeWidth: 2,
      }
    case 'uml-final-state':
      return {
        ...baseNode,
        width: 30,
        height: 30,
        fill: '#f5222d',
        stroke: '#f5222d',
        strokeWidth: 2,
      }
    case 'uml-interface':
      return {
        ...baseNode,
        width: 140,
        height: 60,
        fill: '#f6ffed',
        stroke: '#52c41a',
        strokeWidth: 2,
      }
    case 'uml-abstract-class':
      return {
        ...baseNode,
        width: 140,
        height: 60,
        fill: '#fff0f6',
        stroke: '#eb2f96',
        strokeWidth: 2,
      }
    case 'uml-enum':
      return {
        ...baseNode,
        width: 140,
        height: 60,
        fill: '#e6fffb',
        stroke: '#13c2c2',
        strokeWidth: 2,
      }
    case 'er-table-entity':
    case 'er-table-entity-with-columns':
      return {
        ...baseNode,
        width: 160,
        height: 80,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      }
    default:
      return {
        ...baseNode,
        fill: theme.nodeBkg,
        stroke: theme.nodeBorder,
        strokeWidth: 2,
      }
  }
}

export function createTemplateEdge(
  source: string,
  target: string,
  label?: string,
  index: number = 0
): TemplateEdge {
  return {
    id: `edge-${index}`,
    source,
    target,
    label,
    style: 'orthogonal',
    lineStyle: 'solid',
  }
}

export function createSequenceDiagramEdge(
  source: string,
  target: string,
  label?: string,
  lineStyle: 'solid' | 'dashed' = 'solid',
  index: number = 0
): TemplateEdge {
  return {
    id: `edge-${index}`,
    source,
    target,
    label,
    style: 'straight',
    lineStyle,
    endMarker: 'arrow',
  }
}

export function createClassDiagramEdge(
  source: string,
  target: string,
  relation: string,
  label?: string,
  index: number = 0
): TemplateEdge {
  const lineStyle = relation.includes('.') ? 'dashed' : 'solid'
  let endMarker: 'arrow' | 'diamond' | 'none' = 'arrow'
  let startMarker: 'none' | 'diamond' | 'arrow' = 'none'
  
  if (relation.includes('<|--')) {
    endMarker = 'arrow'
    startMarker = 'none'
  } else if (relation.includes('*--')) {
    endMarker = 'diamond'
  } else if (relation.includes('o--')) {
    endMarker = 'diamond'
  } else if (relation.includes('..|>')) {
    endMarker = 'arrow'
  }
  
  return {
    id: `edge-${index}`,
    source,
    target,
    label,
    style: 'orthogonal',
    lineStyle,
    startMarker,
    endMarker,
  }
}

export function createERDiagramEdge(
  source: string,
  target: string,
  cardinality: string,
  label?: string,
  index: number = 0
): TemplateEdge {
  return {
    id: `edge-${index}`,
    source,
    target,
    label,
    style: 'orthogonal',
    lineStyle: 'solid',
    endMarker: 'none',
  }
}
