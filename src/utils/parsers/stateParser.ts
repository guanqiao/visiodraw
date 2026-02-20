import type { MermaidParseResult } from '../../types/diagramTemplate'
import { calculateStateLayout } from '../layoutEngine'
import { getNodeColors } from '../mermaidTheme'
import { calculateNodeSize } from '../layoutEngine'
import { cleanLines, createNode } from './baseParser'

export function parseStateDiagram(code: string): MermaidParseResult {
  const nodes: NonNullable<MermaidParseResult['nodes']> = []
  const edges: NonNullable<MermaidParseResult['edges']> = []
  const nodeMap = new Map<string, NonNullable<MermaidParseResult['nodes']>[0]>()

  const lines = cleanLines(code)

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

function createStateNode(id: string, text: string, type: string = 'uml-state'): MermaidParseResult['nodes'][0] {
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
