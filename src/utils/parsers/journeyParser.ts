import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parseJourneyDiagram(code: string): MermaidParseResult {
  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []

  const lines = cleanLines(code)

  let title = ''
  let currentSection = ''
  let yOffset = 80
  let taskIndex = 0

  for (const line of lines) {
    if (line.match(/^journey$/i)) {
      continue
    }

    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      title = titleMatch[1]
      nodes.push({
        id: 'journey-title',
        type: 'uml-action',
        x: 300,
        y: 20,
        width: 200,
        height: 40,
        text: title,
        fill: '#f0f5ff',
        stroke: '#2f54eb',
        strokeWidth: 2,
      })
      continue
    }

    const sectionMatch = line.match(/^section\s+(.+)$/i)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      nodes.push({
        id: `section-${nodes.length}`,
        type: 'uml-swimlane',
        x: 50,
        y: yOffset,
        width: 600,
        height: 40,
        text: currentSection,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 1,
      })
      yOffset += 60
      continue
    }

    const taskMatch = line.match(/^([^:]+):\s*(\d+)(?::\s*(.+))?$/)
    if (taskMatch) {
      const [, taskName, score, actors] = taskMatch
      const taskId = `task-${taskIndex}`

      nodes.push({
        id: taskId,
        type: 'uml-action',
        x: 100 + taskIndex * 80,
        y: yOffset,
        width: 120,
        height: 40,
        text: taskName.trim(),
        fill: '#f6ffed',
        stroke: '#52c41a',
        strokeWidth: 2,
      })

      if (taskIndex > 0) {
        edges.push({
          id: `edge-${edges.length}`,
          source: `task-${taskIndex - 1}`,
          target: taskId,
          style: 'orthogonal',
          lineStyle: 'solid',
        })
      }

      taskIndex++
    }
  }

  return {
    success: true,
    diagramType: 'journey',
    nodes,
    edges,
  }
}
