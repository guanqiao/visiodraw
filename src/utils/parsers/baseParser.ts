import type { TemplateNode, TemplateEdge } from '../../types/diagramTemplate'
import { getNodeColors } from '../mermaidTheme'
import { calculateNodeSize } from '../layoutEngine'
import { parseColorValue, MermaidStyleParser } from '../mermaidStyleParser'
import {
  MERMAID_SHAPE_TYPE_MAP,
  MERMAID_BRACKET_TYPE_MAP,
  MERMAID_EDGE_STYLE_MAP,
  DEFAULT_NODE_TYPE,
  DEFAULT_EDGE_STYLE,
} from '../mermaidShapeConfig'

export interface ParserContext {
  nodes: TemplateNode[]
  edges: TemplateEdge[]
  nodeMap: Map<string, TemplateNode>
  styleParser: MermaidStyleParser
}

export function createParserContext(): ParserContext {
  return {
    nodes: [],
    edges: [],
    nodeMap: new Map(),
    styleParser: new MermaidStyleParser(),
  }
}

export function cleanLines(code: string): string[] {
  return code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('%%'))
}

export function createNode(
  id: string,
  text: string,
  type: string = 'uml-action',
  options: {
    x?: number
    y?: number
    width?: number
    height?: number
    fill?: string
    stroke?: string
    strokeWidth?: number
    styleParser?: MermaidStyleParser
  } = {}
): TemplateNode {
  const size = calculateNodeSize(type, text)
  const colors = getNodeColors(type)

  const node: TemplateNode = {
    id,
    type,
    x: options.x ?? 100,
    y: options.y ?? 100,
    width: options.width ?? size.width,
    height: options.height ?? size.height,
    text,
    fill: options.fill ?? colors.fill,
    stroke: options.stroke ?? colors.stroke,
    strokeWidth: options.strokeWidth ?? 2,
  }

  if (options.styleParser) {
    const customStyle = options.styleParser.getNodeStyle(id)
    if (customStyle) {
      if (customStyle.fill) node.fill = parseColorValue(customStyle.fill)
      if (customStyle.stroke) node.stroke = parseColorValue(customStyle.stroke)
      if (customStyle.strokeWidth) node.strokeWidth = customStyle.strokeWidth
      if (customStyle.opacity !== undefined) node.opacity = customStyle.opacity
    }
  }

  return node
}

export function getEdgeStyle(arrowType: string): {
  style: 'straight' | 'orthogonal' | 'curved' | 'bezier'
  lineStyle: 'solid' | 'dashed'
  startMarker?: string
  endMarker?: string
} {
  const style = MERMAID_EDGE_STYLE_MAP[arrowType]
  if (style) {
    return style
  }
  return DEFAULT_EDGE_STYLE
}

export function getNodeTypeFromBracket(bracket: string, fullText: string = ''): string {
  const newSyntaxMatch = fullText.match(/@\{\s*shape:\s*(\w+)\s*\}/)
  if (newSyntaxMatch) {
    const shapeName = newSyntaxMatch[1].toLowerCase()
    return MERMAID_SHAPE_TYPE_MAP[shapeName] || DEFAULT_NODE_TYPE
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
  if (fullText.match(/\[\/[^\\]*\/\]/)) {
    return 'mermaid-parallelogram-left'
  }
  if (fullText.match(/\[\\[^\/]*\\\]/)) {
    return 'mermaid-parallelogram-right'
  }
  if (fullText.match(/\[\\[^\]]*\/\]/)) {
    return 'mermaid-trapezoid-top'
  }
  if (fullText.match(/\[\/[^\]]*\\\]/)) {
    return 'mermaid-trapezoid-bottom'
  }
  if (fullText.includes('((') && fullText.includes('))')) {
    return 'mermaid-circle'
  }
  if (fullText.includes('[[(') && fullText.includes(')]]')) {
    return 'mermaid-circle'
  }
  if (fullText.includes('((') && fullText.includes(')')) {
    return 'mermaid-circle'
  }

  const bracketType = MERMAID_BRACKET_TYPE_MAP[bracket]
  if (bracketType) {
    return bracketType
  }

  if (bracket === '[' || bracket?.startsWith('[')) {
    return 'uml-action'
  }
  return DEFAULT_NODE_TYPE
}

export function parseMultiChainEdge(
  line: string,
  direction: string,
  ctx: ParserContext,
  subgraphMap: Map<string, { id: string; title: string; nodes: string[] }>,
  nodeToSubgraph: Map<string, string>,
  currentSubgraph: string | null
): boolean {
  const arrowPattern = /(-->)|(---)|(-\.->)|(==>)|(\.->)|(--o)|(o--)|(--x)|(x--)|(-\.x)|(x\.-)|(-\.o)|(o\.-)|(<-->)|(~~~)/g

  const arrowMatches: Array<{ index: number; arrow: string }> = []
  let arrowMatch
  while ((arrowMatch = arrowPattern.exec(line)) !== null) {
    for (let i = 1; i <= 15; i++) {
      if (arrowMatch[i]) {
        arrowMatches.push({ index: arrowMatch.index, arrow: arrowMatch[i] })
        break
      }
    }
  }

  if (arrowMatches.length === 0) {
    return false
  }

  const nodeIds: string[] = []
  const labels: (string | undefined)[] = []

  let lastEnd = 0
  arrowMatches.forEach((match, idx) => {
    const beforeArrow = line.slice(lastEnd, match.index).trim()
    const nodeMatch = beforeArrow.match(/(\w+)(?:\s*\|\s*([^|]+)\s*\|)?$/)
    if (nodeMatch) {
      if (nodeIds.length === 0 || idx === 0) {
        nodeIds.push(nodeMatch[1])
        labels.push(nodeMatch[2]?.trim())
      }
    }

    const afterArrow = line.slice(match.index + match.arrow.length)
    const afterMatch = afterArrow.match(/^\s*(?:\|\s*([^|]+)\s*\|)?\s*(\w+)/)
    if (afterMatch) {
      labels.push(afterMatch[1]?.trim())
      nodeIds.push(afterMatch[2])
    }

    lastEnd = match.index + match.arrow.length
  })

  if (nodeIds.length < 2) {
    return false
  }

  for (let i = 0; i < nodeIds.length - 1; i++) {
    const sourceId = nodeIds[i]
    const targetId = nodeIds[i + 1]
    const arrowType = arrowMatches[Math.min(i, arrowMatches.length - 1)]?.arrow || '-->'
    const label = labels[i + 1]

    if (!ctx.nodeMap.has(sourceId)) {
      const node = createNode(sourceId, sourceId, 'uml-action', {
        styleParser: ctx.styleParser,
      })
      ctx.nodes.push(node)
      ctx.nodeMap.set(sourceId, node)
      if (currentSubgraph) {
        subgraphMap.get(currentSubgraph)?.nodes.push(sourceId)
        nodeToSubgraph.set(sourceId, currentSubgraph)
      }
    }

    if (!ctx.nodeMap.has(targetId)) {
      const node = createNode(targetId, targetId, 'uml-action', {
        styleParser: ctx.styleParser,
      })
      ctx.nodes.push(node)
      ctx.nodeMap.set(targetId, node)
      if (currentSubgraph) {
        subgraphMap.get(currentSubgraph)?.nodes.push(targetId)
        nodeToSubgraph.set(targetId, currentSubgraph)
      }
    }

    const edgeStyle = getEdgeStyle(arrowType)
    ctx.edges.push({
      id: `edge-${ctx.edges.length}`,
      source: sourceId,
      target: targetId,
      label: label,
      style: edgeStyle.style,
      lineStyle: edgeStyle.lineStyle,
      startMarker: edgeStyle.startMarker,
      endMarker: edgeStyle.endMarker,
    })
  }

  return true
}

export function getRelationLabel(relation: string): string {
  if (relation.includes('<|--')) return '继承'
  if (relation.includes('*--')) return '组合'
  if (relation.includes('o--')) return '聚合'
  if (relation.includes('-->')) return '关联'
  if (relation.includes('..|>')) return '实现'
  if (relation.includes('..>')) return '依赖'
  return ''
}
