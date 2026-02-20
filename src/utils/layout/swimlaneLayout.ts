import type { TemplateNode, TemplateEdge } from '../../types/diagramTemplate'
import { calculateLayout, defaultLayoutConfig, type LayoutConfig } from './coreLayout'

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
    const swimlaneId = (node.data as Record<string, unknown>)?.swimlaneId as string | undefined
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
    const swimlaneId = (node.data as Record<string, unknown>)?.swimlaneId as string | undefined
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
    n => (n.data as Record<string, unknown>)?.swimlaneId === swimlaneId
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
