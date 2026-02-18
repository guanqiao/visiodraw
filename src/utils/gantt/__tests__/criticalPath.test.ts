/**
 * 关键路径算法单元测试
 */

import { describe, it, expect } from 'vitest'
import { CriticalPathCalculator, DependencyType } from '../criticalPath'
import type { GanttTask } from '../../ganttDiagramGenerator'

describe('CriticalPathCalculator', () => {
  const calculator = new CriticalPathCalculator()

  describe('基础功能', () => {
    it('应该正确处理空任务列表', () => {
      const result = calculator.calculate([])
      expect(result.criticalPath).toEqual([])
      expect(result.projectDuration).toBe(0)
      expect(result.taskTimes.size).toBe(0)
    })

    it('应该正确处理单个任务', () => {
      const tasks: GanttTask[] = [
        {
          id: 'task1',
          name: '任务1',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-08'),
          duration: 7,
          dependencies: [],
          order: 0,
        },
      ]

      const result = calculator.calculate(tasks)
      expect(result.criticalPath).toEqual(['task1'])
      expect(result.projectDuration).toBe(7)
      expect(result.taskTimes.get('task1')?.isCritical).toBe(true)
    })
  })

  describe('关键路径计算', () => {
    it('应该正确识别简单依赖链的关键路径', () => {
      const tasks: GanttTask[] = [
        {
          id: 'a',
          name: '任务A',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-04'),
          duration: 3,
          dependencies: [],
          order: 0,
        },
        {
          id: 'b',
          name: '任务B',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-04'),
          endDate: new Date('2024-01-09'),
          duration: 5,
          dependencies: ['a'],
          order: 1,
        },
        {
          id: 'c',
          name: '任务C',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-09'),
          endDate: new Date('2024-01-12'),
          duration: 3,
          dependencies: ['b'],
          order: 2,
        },
      ]

      const result = calculator.calculate(tasks)
      expect(result.criticalPath).toEqual(['a', 'b', 'c'])
      expect(result.projectDuration).toBe(11) // 3 + 5 + 3
      expect(result.taskTimes.get('a')?.isCritical).toBe(true)
      expect(result.taskTimes.get('b')?.isCritical).toBe(true)
      expect(result.taskTimes.get('c')?.isCritical).toBe(true)
    })

    it('应该正确识别有并行任务的关键路径', () => {
      const tasks: GanttTask[] = [
        {
          id: 'a',
          name: '任务A',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-04'),
          duration: 3,
          dependencies: [],
          order: 0,
        },
        {
          id: 'b',
          name: '任务B',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-04'),
          endDate: new Date('2024-01-06'),
          duration: 2,
          dependencies: ['a'],
          order: 1,
        },
        {
          id: 'c',
          name: '任务C',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-04'),
          endDate: new Date('2024-01-11'),
          duration: 7,
          dependencies: ['a'],
          order: 2,
        },
        {
          id: 'd',
          name: '任务D',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-11'),
          endDate: new Date('2024-01-14'),
          duration: 3,
          dependencies: ['b', 'c'],
          order: 3,
        },
      ]

      const result = calculator.calculate(tasks)
      // 关键路径应该是 A -> C -> D (3 + 7 + 3 = 13)
      expect(result.criticalPath).toContain('a')
      expect(result.criticalPath).toContain('c')
      expect(result.criticalPath).toContain('d')
      expect(result.projectDuration).toBe(13)
      
      // 任务B不在关键路径上
      expect(result.taskTimes.get('b')?.isCritical).toBe(false)
      expect(result.taskTimes.get('b')?.totalFloat).toBe(5) // 可以延迟5天
    })
  })

  describe('时间计算', () => {
    it('应该正确计算最早开始/结束时间', () => {
      const tasks: GanttTask[] = [
        {
          id: 'a',
          name: '任务A',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-04'),
          duration: 3,
          dependencies: [],
          order: 0,
        },
        {
          id: 'b',
          name: '任务B',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-04'),
          endDate: new Date('2024-01-09'),
          duration: 5,
          dependencies: ['a'],
          order: 1,
        },
      ]

      const result = calculator.calculate(tasks)
      
      // 任务A
      expect(result.taskTimes.get('a')?.earliestStart).toBe(0)
      expect(result.taskTimes.get('a')?.earliestFinish).toBe(3)
      
      // 任务B
      expect(result.taskTimes.get('b')?.earliestStart).toBe(3)
      expect(result.taskTimes.get('b')?.earliestFinish).toBe(8)
    })

    it('应该正确计算浮动时间', () => {
      const tasks: GanttTask[] = [
        {
          id: 'a',
          name: '任务A',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-04'),
          duration: 3,
          dependencies: [],
          order: 0,
        },
        {
          id: 'b',
          name: '任务B',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-04'),
          endDate: new Date('2024-01-06'),
          duration: 2,
          dependencies: ['a'],
          order: 1,
        },
        {
          id: 'c',
          name: '任务C',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-06'),
          endDate: new Date('2024-01-09'),
          duration: 3,
          dependencies: ['b'],
          order: 2,
        },
      ]

      const result = calculator.calculate(tasks)
      
      // 所有任务都在关键路径上，浮动时间为0
      expect(result.taskTimes.get('a')?.totalFloat).toBe(0)
      expect(result.taskTimes.get('b')?.totalFloat).toBe(0)
      expect(result.taskTimes.get('c')?.totalFloat).toBe(0)
    })
  })

  describe('依赖类型', () => {
    it('应该正确处理FS（结束后开始）依赖', () => {
      const tasks: GanttTask[] = [
        {
          id: 'a',
          name: '任务A',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-04'),
          duration: 3,
          dependencies: [],
          order: 0,
        },
        {
          id: 'b',
          name: '任务B',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-04'),
          endDate: new Date('2024-01-09'),
          duration: 5,
          dependencies: ['a'],
          order: 1,
        },
      ]

      const dependencies = [
        { sourceId: 'a', targetId: 'b', type: 'FS' as DependencyType, lag: 0 },
      ]

      const result = calculator.calculate(tasks, dependencies)
      expect(result.taskTimes.get('b')?.earliestStart).toBe(3)
    })

    it('应该正确处理带延迟的依赖', () => {
      const tasks: GanttTask[] = [
        {
          id: 'a',
          name: '任务A',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-04'),
          duration: 3,
          dependencies: [],
          order: 0,
        },
        {
          id: 'b',
          name: '任务B',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-07'),
          endDate: new Date('2024-01-12'),
          duration: 5,
          dependencies: ['a'],
          order: 1,
        },
      ]

      const dependencies = [
        { sourceId: 'a', targetId: 'b', type: 'FS' as DependencyType, lag: 2 },
      ]

      const result = calculator.calculate(tasks, dependencies)
      expect(result.taskTimes.get('b')?.earliestStart).toBe(5) // 3 + 2
    })
  })

  describe('复杂场景', () => {
    it('应该正确处理多个前置依赖', () => {
      const tasks: GanttTask[] = [
        {
          id: 'a',
          name: '任务A',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-04'),
          duration: 3,
          dependencies: [],
          order: 0,
        },
        {
          id: 'b',
          name: '任务B',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-06'),
          duration: 5,
          dependencies: [],
          order: 1,
        },
        {
          id: 'c',
          name: '任务C',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-06'),
          endDate: new Date('2024-01-09'),
          duration: 3,
          dependencies: ['a', 'b'],
          order: 2,
        },
      ]

      const result = calculator.calculate(tasks)
      // 任务C需要等待A和B都完成，B结束得更晚（第5天）
      expect(result.taskTimes.get('c')?.earliestStart).toBe(5)
      expect(result.criticalPath).toContain('b')
      expect(result.criticalPath).toContain('c')
    })

    it('应该正确处理菱形依赖结构', () => {
      const tasks: GanttTask[] = [
        {
          id: 'start',
          name: '开始',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-04'),
          duration: 3,
          dependencies: [],
          order: 0,
        },
        {
          id: 'left',
          name: '左分支',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-04'),
          endDate: new Date('2024-01-06'),
          duration: 2,
          dependencies: ['start'],
          order: 1,
        },
        {
          id: 'right',
          name: '右分支',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-04'),
          endDate: new Date('2024-01-09'),
          duration: 5,
          dependencies: ['start'],
          order: 2,
        },
        {
          id: 'end',
          name: '结束',
          type: 'task',
          status: 'default',
          startDate: new Date('2024-01-09'),
          endDate: new Date('2024-01-12'),
          duration: 3,
          dependencies: ['left', 'right'],
          order: 3,
        },
      ]

      const result = calculator.calculate(tasks)
      // 关键路径: start -> right -> end (3 + 5 + 3 = 11)
      expect(result.criticalPath).toContain('start')
      expect(result.criticalPath).toContain('right')
      expect(result.criticalPath).toContain('end')
      expect(result.taskTimes.get('left')?.isCritical).toBe(false)
      expect(result.taskTimes.get('left')?.totalFloat).toBe(3) // 可以延迟3天
    })
  })
})
