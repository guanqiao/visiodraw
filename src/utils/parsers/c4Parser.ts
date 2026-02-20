import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parseC4Diagram(code: string): MermaidParseResult {
  const nodes: NonNullable<MermaidParseResult['nodes']> = []
  const edges: NonNullable<MermaidParseResult['edges']> = []

  const lines = cleanLines(code)

  const elementMap = new Map<string, NonNullable<MermaidParseResult['nodes']>[0]>()
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
