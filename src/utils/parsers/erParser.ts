import type { MermaidParseResult } from '../../types/diagramTemplate'
import { calculateERLayout } from '../layoutEngine'
import { getNodeColors } from '../mermaidTheme'
import { calculateNodeSize } from '../layoutEngine'
import { cleanLines } from './baseParser'

export function parseErDiagram(code: string): MermaidParseResult {
  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []
  const nodeMap = new Map<string, MermaidParseResult['nodes'][0]>()

  const lines = cleanLines(code)

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

function createErEntityNode(name: string, attributes: string[] = []): MermaidParseResult['nodes'][0] {
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
