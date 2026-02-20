import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parseBlockDiagram(code: string): MermaidParseResult {
  const nodes: NonNullable<MermaidParseResult['nodes']> = []
  const edges: NonNullable<MermaidParseResult['edges']> = []

  const lines = cleanLines(code)

  const blockMap = new Map<string, NonNullable<MermaidParseResult['nodes']>[0]>()
  let yOffset = 100
  let xOffset = 100
  const blockWidth = 120
  const blockHeight = 60

  for (const line of lines) {
    if (line.match(/^block(-beta)?$/i)) continue

    const columnsMatch = line.match(/^columns\s+(\d+)$/i)
    if (columnsMatch) continue

    const blockDefMatch = line.match(/^(\w+)\s*\[?"?([^"\]]+)"?\]?\s*:\s*(\d+)$/i)
    if (blockDefMatch) {
      const [, id, name, space] = blockDefMatch
      blockMap.set(id, {
        id,
        type: 'uml-action',
        x: xOffset,
        y: yOffset,
        width: blockWidth,
        height: blockHeight,
        text: name || id,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })
      xOffset += blockWidth + 40
      if (xOffset > 600) {
        xOffset = 100
        yOffset += blockHeight + 40
      }
      continue
    }

    const simpleBlockMatch = line.match(/^(\w+)\s*\[?"?([^"\]]+)"?\]?$/)
    if (simpleBlockMatch && !line.includes(':')) {
      const [, id, name] = simpleBlockMatch
      blockMap.set(id, {
        id,
        type: 'uml-action',
        x: xOffset,
        y: yOffset,
        width: blockWidth,
        height: blockHeight,
        text: name || id,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })
      xOffset += blockWidth + 40
      if (xOffset > 600) {
        xOffset = 100
        yOffset += blockHeight + 40
      }
      continue
    }

    const arrowMatch = line.match(/^(\w+)\s*-->\s*(\w+)$/)
    if (arrowMatch) {
      const [, from, to] = arrowMatch
      if (!blockMap.has(from)) {
        blockMap.set(from, {
          id: from,
          type: 'uml-action',
          x: xOffset,
          y: yOffset,
          width: blockWidth,
          height: blockHeight,
          text: from,
          fill: '#e6f7ff',
          stroke: '#1890ff',
          strokeWidth: 2,
        })
        xOffset += blockWidth + 40
      }
      if (!blockMap.has(to)) {
        blockMap.set(to, {
          id: to,
          type: 'uml-action',
          x: xOffset,
          y: yOffset,
          width: blockWidth,
          height: blockHeight,
          text: to,
          fill: '#e6f7ff',
          stroke: '#1890ff',
          strokeWidth: 2,
        })
        xOffset += blockWidth + 40
      }
      edges.push({
        id: `edge-${edges.length}`,
        source: from,
        target: to,
        style: 'orthogonal',
        lineStyle: 'solid',
      })
    }
  }

  return {
    success: true,
    diagramType: 'block',
    nodes: Array.from(blockMap.values()),
    edges,
  }
}
