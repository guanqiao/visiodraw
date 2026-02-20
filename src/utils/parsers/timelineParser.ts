import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parseTimelineDiagram(code: string): MermaidParseResult {
  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []

  const lines = cleanLines(code)

  let currentSection = ''
  let xOffset = 100

  for (const line of lines) {
    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      continue
    }

    const sectionMatch = line.match(/^section\s+(.+)$/i)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      continue
    }

    const timelineMatch = line.match(/^([^:]+)\s*:\s*(.+)$/)
    if (timelineMatch) {
      const [, period, events] = timelineMatch
      const periodId = `period-${nodes.length}`

      nodes.push({
        id: periodId,
        type: 'uml-action',
        x: xOffset,
        y: 100,
        width: 100,
        height: 40,
        text: period.trim(),
        fill: '#fff2e8',
        stroke: '#fa8c16',
        strokeWidth: 2,
      })

      const eventList = events.split(':').map(e => e.trim())
      eventList.forEach((event, index) => {
        const eventId = `event-${nodes.length}`
        nodes.push({
          id: eventId,
          type: 'uml-action',
          x: xOffset,
          y: 180 + index * 60,
          width: 120,
          height: 40,
          text: event,
          fill: '#f6ffed',
          stroke: '#52c41a',
          strokeWidth: 1,
        })

        edges.push({
          id: `edge-${edges.length}`,
          source: periodId,
          target: eventId,
          style: 'orthogonal',
          lineStyle: 'solid',
        })
      })

      xOffset += 150
    }
  }

  return {
    success: true,
    diagramType: 'timeline',
    nodes,
    edges,
  }
}
