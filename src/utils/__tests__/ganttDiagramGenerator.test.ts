import { describe, it, expect } from 'vitest'
import { GanttDiagramGenerator, type ParsedGanttDiagram } from '../ganttDiagramGenerator'

describe('GanttDiagramGenerator', () => {
  const generator = new GanttDiagramGenerator()

  const createMockData = (): ParsedGanttDiagram => ({
    title: '测试项目',
    dateFormat: 'YYYY-MM-DD',
    sections: [
      { id: 'section-0', name: '第一阶段', order: 0 },
      { id: 'section-1', name: '第二阶段', order: 1 },
    ],
    tasks: [
      {
        id: 'task-1',
        name: '任务1',
        type: 'task',
        status: 'done',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-08'),
        duration: 7,
        section: '第一阶段',
        dependencies: [],
        order: 0,
      },
      {
        id: 'task-2',
        name: '任务2',
        type: 'task',
        status: 'active',
        startDate: new Date('2024-01-08'),
        endDate: new Date('2024-01-13'),
        duration: 5,
        section: '第一阶段',
        dependencies: ['task-1'],
        order: 1,
      },
      {
        id: 'milestone-1',
        name: '里程碑1',
        type: 'milestone',
        status: 'default',
        startDate: new Date('2024-01-13'),
        endDate: new Date('2024-01-13'),
        duration: 0,
        section: '第二阶段',
        dependencies: ['task-2'],
        order: 2,
      },
    ],
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-13'),
  })

  describe('generate', () => {
    it('应该生成节点和边', () => {
      const data = createMockData()
      const result = generator.generate(data)

      expect(result.nodes.length).toBeGreaterThan(0)
      expect(result.edges.length).toBeGreaterThanOrEqual(0)
    })

    it('应该生成时间轴背景节点', () => {
      const data = createMockData()
      const result = generator.generate(data)

      const timelineBg = result.nodes.find(n => n.id === 'timeline-header-bg')
      expect(timelineBg).toBeDefined()
      expect(timelineBg?.type).toBe('uml-rect')
    })

    it('应该生成左侧分组列背景', () => {
      const data = createMockData()
      const result = generator.generate(data)

      const sectionBg = result.nodes.find(n => n.id === 'section-column-bg')
      expect(sectionBg).toBeDefined()
      expect(sectionBg?.type).toBe('uml-rect')
    })

    it('应该生成标题节点', () => {
      const data = createMockData()
      const result = generator.generate(data)

      const titleNode = result.nodes.find(n => n.id === 'gantt-title')
      expect(titleNode).toBeDefined()
      expect(titleNode?.text).toBe('测试项目')
    })

    it('应该生成分组节点', () => {
      const data = createMockData()
      const result = generator.generate(data)

      const sectionNodes = result.nodes.filter(n => n.id.startsWith('section-') && n.type === 'uml-section-header')
      expect(sectionNodes.length).toBe(2)
    })

    it('应该生成任务节点', () => {
      const data = createMockData()
      const result = generator.generate(data)

      // 任务节点包括任务本身和标签
      const taskNodes = result.nodes.filter(n => n.id.startsWith('task-') && n.type === 'uml-gantt-task')
      expect(taskNodes.length).toBe(2)
    })

    it('应该生成里程碑节点', () => {
      const data = createMockData()
      const result = generator.generate(data)

      // 里程碑节点包括里程碑本身
      const milestoneNodes = result.nodes.filter(n => n.id.startsWith('milestone-') && n.type === 'uml-gantt-milestone')
      expect(milestoneNodes.length).toBe(1)
    })

    it('应该生成依赖连线', () => {
      const data = createMockData()
      const result = generator.generate(data)

      const dependencyEdges = result.edges.filter(e => e.id.startsWith('dep-'))
      expect(dependencyEdges.length).toBeGreaterThan(0)
    })

    it('应该正确设置任务状态颜色', () => {
      const data = createMockData()
      const result = generator.generate(data)

      const doneTask = result.nodes.find(n => n.id === 'task-task-1')
      expect(doneTask?.fill).toBe('#b7eb8f')

      const activeTask = result.nodes.find(n => n.id === 'task-task-2')
      expect(activeTask?.fill).toBe('#91d5ff')
    })

    it('没有标题时不应该生成标题节点', () => {
      const data = { ...createMockData(), title: undefined }
      const result = generator.generate(data)

      const titleNode = result.nodes.find(n => n.id === 'gantt-title')
      expect(titleNode).toBeUndefined()
    })
  })
})
