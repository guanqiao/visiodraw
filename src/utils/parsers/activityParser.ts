import type { MermaidParseResult, TemplateNode } from '../../types/diagramTemplate'
import { calculateLayout, parseDirectionFromCode, calculateNodeSize } from '../layoutEngine'
import { parseThemeFromCode, setTheme, getNodeColors } from '../mermaidTheme'
import { parseColorValue } from '../mermaidStyleParser'
import {
  createParserContext,
  cleanLines,
  createNode,
  getEdgeStyle,
  getNodeTypeFromBracket,
  parseMultiChainEdge,
  type ParserContext,
} from './baseParser'

const BRACKET_PAIRS: Record<string, { close: string; pattern: string }> = {
  '[': { close: ']', pattern: '\\[([^\\]]*)\\]' },
  '([': { close: '])', pattern: '\\(\\[([^\\]]*)\\]\\)' },
  '(': { close: ')', pattern: '\\(([^)]*)\\)' },
  '{': { close: '}', pattern: '\\{([^}]*)\\}' },
  '((': { close: '))', pattern: '\\(\\(([^)]*)\\)\\)' },
  '[[': { close: ']]', pattern: '\\[\\[([^\\]]*)\\]\\]' },
  '[(': { close: ')]', pattern: '\\[\\(([^)]*)\\)\\]' },
  '{{': { close: '}}', pattern: '\\{\\{([^}]*)\\}\\}' },
  '>': { close: ']', pattern: '>([^\\]]*)\\]' },
  '[/': { close: '/]', pattern: '\\[/([^/]*)/\\]' },
  '[\\': { close: '\\]', pattern: '\\[\\\\([^\\\\]*)\\\\\\]' },
}

const ARROW_PATTERN = '(-->|---|-\\.->|==>|\\.->|<-->|~~~|---o|o---|---x|x---|-\\.x|x\\.-|-\\.o|o\\.-)'

function parseNodeDefinition(nodeStr: string): { id: string; text: string; bracket: string } | null {
  const simpleMatch = nodeStr.match(/^(\w+)$/)
  if (simpleMatch) {
    return { id: simpleMatch[1], text: simpleMatch[1], bracket: '' }
  }

  for (const [open, config] of Object.entries(BRACKET_PAIRS)) {
    const regex = new RegExp(`^(\\w+)${config.pattern}$`)
    const match = nodeStr.match(regex)
    if (match) {
      return { id: match[1], text: match[2] || '', bracket: open }
    }
  }

  const bracketMatch = nodeStr.match(/^(\w+)([\[\(\{<].*)$/)
  if (bracketMatch) {
    return { id: bracketMatch[1], text: '', bracket: '' }
  }

  return null
}

function parseEdgeWithNodeDefinitions(
  line: string,
  ctx: ParserContext,
  subgraphMap: Map<string, { id: string; title: string; nodes: string[] }>,
  nodeToSubgraph: Map<string, string>,
  currentSubgraph: string | null
): boolean {
  if (line.includes('@{shape:')) {
    return false
  }

  const nodePattern = '(\\w+(?:\\([^)]*\\)|\\[[^\\]]*\\]|\\{[^}]*\\}|\\(\\([^)]*\\)\\)|\\[\\[[^\\]]*\\]\\]|\\[\\([^)]*\\)\\]|\\{\\{[^}]*\\}\\}|>[^\\]]*\\]|\\[/[^/]*/\\]|\\[\\\\[^\\\\]*\\\\\\])*)'
  const edgeRegex = new RegExp(`^${nodePattern}\\s*${ARROW_PATTERN}\\s*(?:\\|([^|]+)\\|)?\\s*${nodePattern}$`)
  
  const match = line.match(edgeRegex)
  if (!match) return false

  const [, sourceNodeStr, arrowType, label, targetNodeStr] = match

  const sourceNode = parseNodeDefinition(sourceNodeStr)
  const targetNode = parseNodeDefinition(targetNodeStr)

  if (!sourceNode || !targetNode) return false

  if (!ctx.nodeMap.has(sourceNode.id)) {
    const nodeType = getNodeTypeFromBracket(sourceNode.bracket, sourceNodeStr)
    const node = createNode(sourceNode.id, sourceNode.text || sourceNode.id, nodeType, {
      styleParser: ctx.styleParser,
    })
    ctx.nodes.push(node)
    ctx.nodeMap.set(sourceNode.id, node)
    if (currentSubgraph) {
      subgraphMap.get(currentSubgraph)?.nodes.push(sourceNode.id)
      nodeToSubgraph.set(sourceNode.id, currentSubgraph)
    }
  } else if (sourceNode.text) {
    const existingNode = ctx.nodeMap.get(sourceNode.id)!
    existingNode.text = sourceNode.text
    existingNode.type = getNodeTypeFromBracket(sourceNode.bracket, sourceNodeStr)
    const size = calculateNodeSize(existingNode.type, existingNode.text || '')
    existingNode.width = size.width
    existingNode.height = size.height
  }

  if (!ctx.nodeMap.has(targetNode.id)) {
    const nodeType = getNodeTypeFromBracket(targetNode.bracket, targetNodeStr)
    const node = createNode(targetNode.id, targetNode.text || targetNode.id, nodeType, {
      styleParser: ctx.styleParser,
    })
    ctx.nodes.push(node)
    ctx.nodeMap.set(targetNode.id, node)
    if (currentSubgraph) {
      subgraphMap.get(currentSubgraph)?.nodes.push(targetNode.id)
      nodeToSubgraph.set(targetNode.id, currentSubgraph)
    }
  } else if (targetNode.text) {
    const existingNode = ctx.nodeMap.get(targetNode.id)!
    existingNode.text = targetNode.text
    existingNode.type = getNodeTypeFromBracket(targetNode.bracket, targetNodeStr)
    const size = calculateNodeSize(existingNode.type, existingNode.text || '')
    existingNode.width = size.width
    existingNode.height = size.height
  }

  const edgeStyle = getEdgeStyle(arrowType)
  ctx.edges.push({
    id: `edge-${ctx.edges.length}`,
    source: sourceNode.id,
    target: targetNode.id,
    label: label?.trim(),
    style: edgeStyle.style,
    lineStyle: edgeStyle.lineStyle,
    startMarker: edgeStyle.startMarker,
    endMarker: edgeStyle.endMarker,
  })

  return true
}

export function parseActivityDiagram(code: string): MermaidParseResult {
  const ctx = createParserContext()
  const subgraphMap = new Map<string, { id: string; title: string; nodes: string[] }>()
  const nodeToSubgraph = new Map<string, string>()

  const lines = cleanLines(code)

  const directionMatch = lines[0]?.match(/(?:flowchart|graph)\s+(TD|TB|LR|RL|BT)/i)
  const direction = directionMatch?.[1] || 'TD'

  let currentSubgraph: string | null = null
  const subgraphStack: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('classDef ')) {
      ctx.styleParser.parseClassDef(line)
      continue
    }

    if (line.startsWith('style ')) {
      ctx.styleParser.parseStyle(line)
      continue
    }

    if (line.startsWith('linkStyle ')) {
      ctx.styleParser.parseLinkStyle(line)
      continue
    }

    if (line.match(/^class\s+[\w,]+\s+\w+/)) {
      ctx.styleParser.parseClassApplication(line)
      continue
    }

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
      continue
    }

    if (line === 'end' && currentSubgraph) {
      if (subgraphStack.length > 0) {
        currentSubgraph = subgraphStack.pop()!
      } else {
        currentSubgraph = null
      }
      continue
    }

    const newSyntaxMatch = line.match(/^(\w+)\s*@\{\s*shape:\s*\w+\s*\}/)
    if (newSyntaxMatch) {
      const match = line.match(/^(\w+)\s*@\{\s*shape:\s*(\w+)\s*\}(?::\s*(.+))?$/)
      if (match) {
        const nodeId = match[1]
        const text = match[3] || ''
        const fullLine = line

        if (!ctx.nodeMap.has(nodeId)) {
          const nodeType = getNodeTypeFromBracket('', fullLine)
          const node = createNode(nodeId, text?.trim() || nodeId, nodeType, {
            styleParser: ctx.styleParser,
          })
          ctx.nodes.push(node)
          ctx.nodeMap.set(nodeId, node)
          if (currentSubgraph) {
            subgraphMap.get(currentSubgraph)?.nodes.push(nodeId)
            nodeToSubgraph.set(nodeId, currentSubgraph)
          }
        }
      }
      continue
    }

    if (parseEdgeWithNodeDefinitions(line, ctx, subgraphMap, nodeToSubgraph, currentSubgraph)) {
      continue
    }

    const edgeMatch = line.match(/^(\w+)\s*(-->|---|-\.->|==>|\.->|<-->|~~~|---o|o---|---x|x---)\s*(?:\|([^|]+)\|)?\s*(\w+)$/)
    if (edgeMatch) {
      const [, sourceId, arrowType, label, targetId] = edgeMatch

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
        label: label?.trim(),
        style: edgeStyle.style,
        lineStyle: edgeStyle.lineStyle,
        startMarker: edgeStyle.startMarker,
        endMarker: edgeStyle.endMarker,
      })

      continue
    }

    if (parseMultiChainEdge(line, direction, ctx, subgraphMap, nodeToSubgraph, currentSubgraph)) {
      continue
    }

    const nodeMatch = line.match(/^(\w+)\s*(\[|\(|\{|\(\(|\(\[|<|\[\[|\[\(|\{\{)\s*([^\]]*)\s*(\]|\)|\}|\)\)|\]\)|\]\]|\}\})?\s*(?:-->.*)?$/)

    if (nodeMatch) {
      const [, nodeId, openBracket, text] = nodeMatch!
      const fullLine = line

      if (!ctx.nodeMap.has(nodeId)) {
        const nodeType = getNodeTypeFromBracket(openBracket, fullLine)
        const node = createNode(nodeId, text?.trim() || nodeId, nodeType, {
          styleParser: ctx.styleParser,
        })
        ctx.nodes.push(node)
        ctx.nodeMap.set(nodeId, node)
        if (currentSubgraph) {
          subgraphMap.get(currentSubgraph)?.nodes.push(nodeId)
          nodeToSubgraph.set(nodeId, currentSubgraph)
        }
      } else {
        const existingNode = ctx.nodeMap.get(nodeId)!
        existingNode.text = text?.trim() || nodeId
        existingNode.type = getNodeTypeFromBracket(openBracket, fullLine)
        const size = calculateNodeSize(existingNode.type, existingNode.text || '')
        existingNode.width = size.width
        existingNode.height = size.height

        const customStyle = ctx.styleParser.getNodeStyle(nodeId)
        if (customStyle) {
          if (customStyle.fill) existingNode.fill = parseColorValue(customStyle.fill)
          if (customStyle.stroke) existingNode.stroke = parseColorValue(customStyle.stroke)
          if (customStyle.strokeWidth) existingNode.strokeWidth = customStyle.strokeWidth
        }
      }
    }
  }

  subgraphMap.forEach((subgraph) => {
    if (subgraph.nodes.length > 0) {
      const subgraphNodeIds = subgraph.nodes
      const subgraphNodes = subgraphNodeIds.map(id => ctx.nodeMap.get(id)).filter(Boolean) as TemplateNode[]

      if (subgraphNodes.length > 0) {
        const padding = 40
        const headerHeight = 35

        const minX = Math.min(...subgraphNodes.map(n => n.x))
        const maxX = Math.max(...subgraphNodes.map(n => n.x + (n.width || 100)))
        const minY = Math.min(...subgraphNodes.map(n => n.y))
        const maxY = Math.max(...subgraphNodes.map(n => n.y + (n.height || 60)))

        const swimlaneWidth = maxX - minX + padding * 2
        const swimlaneHeight = maxY - minY + padding * 2 + headerHeight

        const labelWidth = 80
        const isHorizontal = direction === 'LR' || direction === 'RL'

        ctx.nodes.push({
          id: subgraph.id,
          type: isHorizontal ? 'uml-swimlane-horizontal' : 'uml-swimlane-vertical',
          x: minX - padding,
          y: minY - padding - headerHeight,
          width: isHorizontal ? swimlaneWidth : swimlaneWidth + labelWidth,
          height: isHorizontal ? swimlaneHeight + labelWidth : swimlaneHeight + headerHeight,
          text: subgraph.title,
          fill: '#fafafa',
          stroke: '#d9d9d9',
          strokeWidth: 1,
          data: {
            nodeIds: subgraphNodeIds,
            isSwimlane: true,
          },
        })

        subgraphNodes.forEach(node => {
          node.data = {
            ...node.data,
            swimlaneId: subgraph.id,
          }
        })
      }
    }
  })

  const layoutDirection = parseDirectionFromCode(code)
  const layoutedNodes = ctx.nodes.length > 0
    ? calculateLayout(ctx.nodes, ctx.edges, { direction: layoutDirection })
    : ctx.nodes

  return {
    success: true,
    diagramType: 'activity',
    nodes: layoutedNodes,
    edges: ctx.edges,
  }
}
