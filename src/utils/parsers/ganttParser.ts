import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parseGanttDiagram(code: string): MermaidParseResult {
  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []

  const lines = cleanLines(code)

  let currentSection = 'Default'
  let yOffset = 100
  let taskIndex = 0

  for (const line of lines) {
    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      continue
    }

    const dateFormatMatch = line.match(/^dateformat\s+(.+)$/i)
    if (dateFormatMatch) {
      continue
    }

    const sectionMatch = line.match(/^section\s+(.+)$/i)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      nodes.push({
        id: `section-${nodes.length}`,
        type: 'uml-action',
        x: 50,
        y: yOffset,
        width: 120,
        height: 30,
        text: currentSection,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })
      yOffset += 50
      continue
    }

    const taskMatch = line.match(/^([^:]+)\s*:\s*(?:(\w+),\s*)?([^,]+)(?:,\s*(.+))?$/)
    if (taskMatch) {
      const [, taskName, taskId, startOrStatus, duration] = taskMatch
      const trimmedTaskName = taskName.trim()

      const isMilestone = line.toLowerCase().includes('milestone')
      const isDone = line.toLowerCase().includes('done')
      const isActive = line.toLowerCase().includes('active')
      const isCrit = line.toLowerCase().includes('crit')

      const nodeId = taskId || `task-${taskIndex}`
      const nodeWidth = isMilestone ? 20 : 150
      const nodeHeight = isMilestone ? 20 : 30

      nodes.push({
        id: nodeId,
        type: isMilestone ? 'uml-initial' : 'uml-action',
        x: 200 + taskIndex * 30,
        y: yOffset,
        width: nodeWidth,
        height: nodeHeight,
        text: trimmedTaskName,
        fill: isDone ? '#52c41a' : isActive ? '#1890ff' : isCrit ? '#f5222d' : '#f0f0f0',
        stroke: isDone ? '#52c41a' : isActive ? '#1890ff' : isCrit ? '#f5222d' : '#999',
        strokeWidth: 2,
      })

      yOffset += 40
      taskIndex++
    }
  }

  return {
    success: true,
    diagramType: 'gantt',
    nodes,
    edges,
  }
}
