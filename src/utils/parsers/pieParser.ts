import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parsePieDiagram(code: string): MermaidParseResult {
  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []

  const lines = cleanLines(code)

  let showTitle = false
  let title = ''
  const slices: { label: string; value: number }[] = []

  for (const line of lines) {
    if (line.match(/^pie\s+showtitle/i)) {
      showTitle = true
      continue
    }
    if (line.match(/^pie$/i)) {
      continue
    }

    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      title = titleMatch[1]
      continue
    }

    const sliceMatch = line.match(/^"([^"]+)"\s*:\s*(\d+(?:\.\d+)?)/)
    if (sliceMatch) {
      slices.push({
        label: sliceMatch[1],
        value: parseFloat(sliceMatch[2]),
      })
    }
  }

  const centerX = 250
  const centerY = 200
  const radius = 120
  const total = slices.reduce((sum, s) => sum + s.value, 0)

  if (title) {
    nodes.push({
      id: 'pie-title',
      type: 'uml-action',
      x: centerX - 75,
      y: 20,
      width: 150,
      height: 30,
      text: title,
      fill: '#f0f5ff',
      stroke: '#2f54eb',
      strokeWidth: 2,
    })
  }

  let startAngle = -Math.PI / 2
  const colors = [
    '#1890ff', '#52c41a', '#fa8c16', '#eb2f96',
    '#722ed1', '#13c2c2', '#faad14', '#f5222d'
  ]

  slices.forEach((slice, index) => {
    const sliceAngle = (slice.value / total) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle
    const midAngle = startAngle + sliceAngle / 2

    nodes.push({
      id: `pie-slice-${index}`,
      type: 'mermaid-pie-slice',
      x: centerX - radius,
      y: centerY - radius,
      width: radius * 2,
      height: radius * 2,
      text: '',
      fill: colors[index % colors.length],
      stroke: '#fff',
      strokeWidth: 2,
      startAngle,
      endAngle,
      centerX,
      centerY,
      radius,
    })

    const labelRadius = radius + 50
    const labelX = centerX + Math.cos(midAngle) * labelRadius
    const labelY = centerY + Math.sin(midAngle) * labelRadius

    nodes.push({
      id: `slice-label-${index}`,
      type: 'uml-action',
      x: labelX - 50,
      y: labelY - 15,
      width: 100,
      height: 30,
      text: `${slice.label}: ${slice.value}`,
      fill: colors[index % colors.length],
      stroke: colors[index % colors.length],
      strokeWidth: 1,
    })

    startAngle = endAngle
  })

  return {
    success: true,
    diagramType: 'pie',
    nodes,
    edges,
  }
}
