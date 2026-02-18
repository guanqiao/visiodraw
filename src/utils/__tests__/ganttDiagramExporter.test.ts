import { describe, it, expect } from 'vitest'
import { GanttDiagramExporter } from '../ganttDiagramExporter'
import type { ShapeData } from '../../stores/x6GraphStore'
import type { Connector } from '../../types/connection'

describe('GanttDiagramExporter', () => {
  const exporter = new GanttDiagramExporter()

  const createMockNodes = (): ShapeData[] => [
    {
      id: 'gantt-title',
      type: 'uml-label',
      x: 20,
      y: 20,
      width: 300,
      height: 30,
      text: '测试项目',
      fill: 'transparent',
      stroke: 'transparent',
    },
    {
      id: 'section-section-0',
      type: 'uml-section-header',
      x: 10,
      y: 80,
      width: 180,
      height: 100,
      text: '第一阶段',
      fill: '#f0f5ff',
      stroke: '#2f54eb',
    },
    {
      id: 'task-1',
      type: 'uml-gantt-task',
      x: 200,
      y: 80,
      width: 100,
      height: 32,
      text: '任务1',
      fill: '#b7eb8f',
      stroke: '#52c41a',
    },
    {
      id: 'task-2',
      type: 'uml-gantt-task',
      x: 350,
      y: 120,
      width: 80,
      height: 32,
      text: '任务2',
      fill: '#91d5ff',
      stroke: '#1890ff',
    },
    {
      id: 'milestone-1',
      type: 'uml-gantt-milestone',
      x: 480,
      y: 160,
      width: 16,
      height: 16,
      text: '',
      fill: '#faad14',
      stroke: '#d48806',
    },
  ]

  const createMockEdges = (): Connector[] => [
    {
      id: 'dep-1-2',
      sourceShapeId: 'task-1',
      sourcePointId: 'right',
      targetShapeId: 'task-2',
      targetPointId: 'left',
      stroke: '#8c8c8c',
      strokeWidth: 1.5,
      lineStyle: 'solid',
      startStyle: 'none',
      endStyle: 'arrow',
      style: 'orthogonal',
    },
  ]

  describe('export', () => {
    it('应该导出基本的甘特图脚本', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const result = exporter.export(nodes, edges)

      expect(result).toContain('gantt')
      expect(result).toContain('title 测试项目')
      expect(result).toContain('dateFormat YYYY-MM-DD')
    })

    it('应该包含分组定义', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const result = exporter.export(nodes, edges)

      expect(result).toContain('section 第一阶段')
    })

    it('应该包含任务定义', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const result = exporter.export(nodes, edges)

      expect(result).toContain('任务1')
      expect(result).toContain('任务2')
    })

    it('应该正确标记已完成任务', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const result = exporter.export(nodes, edges)

      expect(result).toContain('done')
    })

    it('应该正确标记进行中任务', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const result = exporter.export(nodes, edges)

      expect(result).toContain('active')
    })

    it('应该包含依赖关系', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const result = exporter.export(nodes, edges)

      expect(result).toContain('after')
    })

    it('应该支持不包含标题', () => {
      const nodes = createMockNodes().filter(n => n.id !== 'gantt-title')
      const edges = createMockEdges()

      const result = exporter.export(nodes, edges, { includeTitle: false })

      expect(result).not.toContain('title')
    })

    it('应该支持不包含日期格式', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const result = exporter.export(nodes, edges, { includeDateFormat: false })

      expect(result).not.toContain('dateFormat')
    })

    it('应该支持自定义日期格式', () => {
      const nodes = createMockNodes()
      const edges = createMockEdges()

      const result = exporter.export(nodes, edges, { dateFormat: 'DD/MM/YYYY' })

      expect(result).toContain('dateFormat DD/MM/YYYY')
    })

    it('空节点应该返回基本结构', () => {
      const result = exporter.export([], [])

      expect(result).toContain('gantt')
    })
  })
})
