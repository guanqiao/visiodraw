import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parseXYChartDiagram(code: string): MermaidParseResult {
  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []

  const lines = cleanLines(code)

  let title = ''
  let xAxisTitle = ''
  let yAxisTitle = ''
  const xLabels: string[] = []
  const yData: { name: string; values: number[] }[] = []

  for (const line of lines) {
    if (line.match(/^xychart(-beta)?$/i)) continue

    const titleMatch = line.match(/^title\s+"([^"]+)"$/i)
    if (titleMatch) {
      title = titleMatch[1]
      continue
    }

    const xTitleMatch = line.match(/^x-axis\s+"([^"]+)"$/i)
    if (xTitleMatch) {
      xAxisTitle = xTitleMatch[1]
      continue
    }

    const yTitleMatch = line.match(/^y-axis\s+"([^"]+)"\s+(\d+)\s+-->\s+(\d+)$/i)
    if (yTitleMatch) {
      yAxisTitle = yTitleMatch[1]
      continue
    }

    const xLabelsMatch = line.match(/^x-axis\s+\[([^\]]+)\]$/i)
    if (xLabelsMatch) {
      xLabels.push(...xLabelsMatch[1].split(',').map(l => l.trim().replace(/"/g, '')))
      continue
    }

    const barMatch = line.match(/^bar\s+\[([^\]]+)\]$/i)
    if (barMatch) {
      const values = barMatch[1].split(',').map(v => parseFloat(v.trim()))
      yData.push({ name: 'Series 1', values })
      continue
    }

    const lineMatch = line.match(/^line\s+\[([^\]]+)\]$/i)
    if (lineMatch) {
      const values = lineMatch[1].split(',').map(v => parseFloat(v.trim()))
      yData.push({ name: 'Series 1', values })
    }
  }

  const chartX = 100
  const chartY = 80
  const chartWidth = 400
  const chartHeight = 250
  const padding = 50

  if (title) {
    nodes.push({
      id: 'chart-title',
      type: 'uml-action',
      x: chartX + chartWidth / 2 - 75,
      y: 20,
      width: 150,
      height: 30,
      text: title,
      fill: '#f0f5ff',
      stroke: '#2f54eb',
      strokeWidth: 2,
    })
  }

  nodes.push({
    id: 'chart-frame',
    type: 'uml-action',
    x: chartX,
    y: chartY,
    width: chartWidth,
    height: chartHeight,
    text: '',
    fill: '#fafafa',
    stroke: '#d9d9d9',
    strokeWidth: 1,
  })

  const barWidth = (chartWidth - padding * 2) / Math.max(xLabels.length, 1) * 0.6
  const barGap = (chartWidth - padding * 2) / Math.max(xLabels.length, 1)

  xLabels.forEach((label, index) => {
    nodes.push({
      id: `x-label-${index}`,
      type: 'uml-action',
      x: chartX + padding + index * barGap + barGap / 2 - 25,
      y: chartY + chartHeight + 10,
      width: 50,
      height: 20,
      text: label,
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
    })
  })

  const maxValue = Math.max(...yData.flatMap(d => d.values), 1)
  const colors = ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1']

  yData.forEach((series, seriesIndex) => {
    series.values.forEach((value, index) => {
      const barHeight = (value / maxValue) * (chartHeight - padding * 2)
      const x = chartX + padding + index * barGap + (barGap - barWidth) / 2
      const y = chartY + chartHeight - padding - barHeight

      nodes.push({
        id: `bar-${seriesIndex}-${index}`,
        type: 'uml-action',
        x,
        y,
        width: barWidth,
        height: barHeight,
        text: value.toString(),
        fill: colors[seriesIndex % colors.length],
        stroke: colors[seriesIndex % colors.length],
        strokeWidth: 1,
      })
    })
  })

  return {
    success: true,
    diagramType: 'xychart',
    nodes,
    edges,
  }
}
