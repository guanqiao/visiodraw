import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parseMindmapDiagram(code: string): MermaidParseResult {
  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []

  const lines = cleanLines(code)

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
      const x = 200 + level * 150

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
