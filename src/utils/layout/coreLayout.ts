import dagre from 'dagre'
import type { TemplateNode, TemplateEdge } from '../../types/diagramTemplate'

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
        x: dagreNode.x - dagreNode.width / 2,
        y: dagreNode.y - dagreNode.height / 2,
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
