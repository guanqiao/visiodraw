/**
 * 任务进度管理模块单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { TaskProgressManager } from '../taskProgress'
import type { GanttTask } from '../parser/types'

describe('TaskProgressManager', () => {
  let manager: TaskProgressManager

  beforeEach(() => {
    manager = new TaskProgressManager()
  })

  // 创建测试任务
  const createTestTask = (
    id: string,
    status: 'default' | 'active' | 'done' | 'crit' = 'default',
    duration: number = 5
  ): GanttTask => ({
    id,
    name: `任务${id}`,
    type: 'task',
    status,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-06'),
    duration,
    dependencies: [],
    order: 0,
  })

  describe('进度设置', () => {
    it('应该正确设置任务进度', () => {
      const progress = manager.setProgress('task1', 50)

      expect(progress.taskId).toBe('task1')
      expect(progress.percent).toBe(50)
      expect(progress.lastUpdated).toBeInstanceOf(Date)
    })

    it('进度应该限制在0-100范围内', () => {
      const progress1 = manager.setProgress('task1', -10)
      expect(progress1.percent).toBe(0)

      const progress2 = manager.setProgress('task1', 150)
      expect(progress2.percent).toBe(100)
    })

    it('应该正确获取任务进度', () => {
      manager.setProgress('task1', 75)
      const progress = manager.getProgress('task1')

      expect(progress).toBeDefined()
      expect(progress?.percent).toBe(75)
    })

    it('应该计算已完成工时', () => {
      const progress = manager.setProgress('task1', 50, { totalHours: 40 })

      expect(progress.completedHours).toBe(20)
      expect(progress.totalHours).toBe(40)
    })
  })

  describe('进度历史', () => {
    it('应该记录进度变更历史', () => {
      manager.setProgress('task1', 25)  // 0 -> 25，记录
      manager.setProgress('task1', 50)  // 25 -> 50，记录
      manager.setProgress('task1', 75)  // 50 -> 75，记录

      const history = manager.getProgressHistory('task1')

      expect(history).toHaveLength(3) // 每次变更都会记录，包括从0开始
      expect(history[0].oldPercent).toBe(0)
      expect(history[0].newPercent).toBe(25)
      expect(history[1].oldPercent).toBe(25)
      expect(history[1].newPercent).toBe(50)
      expect(history[2].oldPercent).toBe(50)
      expect(history[2].newPercent).toBe(75)
    })

    it('相同进度不应该记录历史', () => {
      manager.setProgress('task1', 50) // 0 -> 50，记录
      manager.setProgress('task1', 50) // 50 -> 50，不记录

      const history = manager.getProgressHistory('task1')

      expect(history).toHaveLength(1) // 只有第一次变更记录
    })
  })

  describe('批量更新', () => {
    it('应该正确批量更新进度', () => {
      const updates = [
        { taskId: 'task1', percent: 25 },
        { taskId: 'task2', percent: 50 },
        { taskId: 'task3', percent: 75 },
      ]

      const results = manager.batchUpdateProgress(updates)

      expect(results).toHaveLength(3)
      expect(results[0].percent).toBe(25)
      expect(results[1].percent).toBe(50)
      expect(results[2].percent).toBe(75)
    })
  })

  describe('增加进度', () => {
    it('应该正确增加进度', () => {
      manager.setProgress('task1', 30)
      const progress = manager.increaseProgress('task1', 20)

      expect(progress?.percent).toBe(50)
    })

    it('不存在的任务应该返回undefined', () => {
      const progress = manager.increaseProgress('non-existent', 20)
      expect(progress).toBeUndefined()
    })
  })

  describe('进度统计', () => {
    it('应该正确计算项目进度统计', () => {
      const tasks: GanttTask[] = [
        createTestTask('t1', 'done', 5),    // 100%
        createTestTask('t2', 'active', 5),  // 默认50%
        createTestTask('t3', 'default', 5), // 0%
      ]

      // 设置自定义进度
      manager.setProgress('t2', 60)

      const stats = manager.calculateProgressStats(tasks)

      expect(stats.totalTasks).toBe(3)
      expect(stats.completedTasks).toBe(1)
      expect(stats.inProgressTasks).toBe(1)
      expect(stats.notStartedTasks).toBe(1)
    })

    it('应该正确计算平均进度', () => {
      const tasks: GanttTask[] = [
        createTestTask('t1', 'done', 5),    // 100%
        createTestTask('t2', 'active', 5),  // 50%
        createTestTask('t3', 'default', 5), // 0%
      ]

      const stats = manager.calculateProgressStats(tasks)

      // (100 + 50 + 0) / 3 = 50
      expect(stats.averageProgress).toBe(50)
    })

    it('应该正确计算加权进度', () => {
      const tasks: GanttTask[] = [
        createTestTask('t1', 'done', 10),   // 100% * 10 = 1000
        createTestTask('t2', 'active', 5),  // 50% * 5 = 250
        createTestTask('t3', 'default', 5), // 0% * 5 = 0
      ]
      // 总计: 1250 / 20 = 62.5%

      const stats = manager.calculateProgressStats(tasks)

      expect(stats.weightedProgress).toBe(62.5)
    })

    it('空任务列表应该返回零值', () => {
      const stats = manager.calculateProgressStats([])

      expect(stats.totalTasks).toBe(0)
      expect(stats.averageProgress).toBe(0)
      expect(stats.weightedProgress).toBe(0)
    })
  })

  describe('预计完成时间', () => {
    it('已完成项目应该返回最后任务结束时间', () => {
      const tasks: GanttTask[] = [
        { ...createTestTask('t1', 'done'), endDate: new Date('2024-01-10') },
        { ...createTestTask('t2', 'done'), endDate: new Date('2024-01-15') },
      ]

      manager.setProgress('t1', 100)
      manager.setProgress('t2', 100)

      const stats = manager.calculateProgressStats(tasks)

      expect(stats.estimatedCompletionDate).toEqual(new Date('2024-01-15'))
    })

    it('未开始项目应该返回null', () => {
      const tasks: GanttTask[] = [
        createTestTask('t1', 'default'),
        createTestTask('t2', 'default'),
      ]

      const stats = manager.calculateProgressStats(tasks)

      expect(stats.estimatedCompletionDate).toBeNull()
    })
  })

  describe('进度报告', () => {
    it('应该生成进度报告', () => {
      const tasks: GanttTask[] = [
        createTestTask('t1', 'done'),
        createTestTask('t2', 'active'),
        createTestTask('t3', 'default'),
      ]

      manager.setProgress('t2', 60)

      const report = manager.generateProgressReport(tasks)

      expect(report).toContain('项目进度报告')
      expect(report).toContain('总任务数: 3')
      // 任务名称格式是"任务t1"、"任务t2"等
      expect(report).toContain('任务t1')
      expect(report).toContain('任务t2')
      expect(report).toContain('任务t3')
    })
  })

  describe('数据导入导出', () => {
    it('应该正确导出进度数据', () => {
      manager.setProgress('task1', 50, { totalHours: 40, note: '测试' })
      manager.setProgress('task2', 75)

      const data = manager.exportData()

      expect(data.progress).toHaveLength(2)
      expect(data.history).toHaveProperty('task1')
      expect(data.history).toHaveProperty('task2')
    })

    it('应该正确导入进度数据', () => {
      const exportData = {
        progress: [
          {
            taskId: 'task1',
            percent: 50,
            completedHours: 20,
            totalHours: 40,
            lastUpdated: new Date().toISOString(),
            note: '测试',
          },
        ],
        history: {
          task1: [
            {
              date: new Date().toISOString(),
              oldPercent: 0,
              newPercent: 50,
              note: '初始化',
            },
          ],
        },
      }

      manager.importData(exportData)

      const progress = manager.getProgress('task1')
      expect(progress?.percent).toBe(50)
      expect(progress?.note).toBe('测试')

      const history = manager.getProgressHistory('task1')
      expect(history).toHaveLength(1)
    })
  })

  describe('清除数据', () => {
    it('应该清除所有进度数据', () => {
      manager.setProgress('task1', 50)
      manager.setProgress('task2', 75)

      manager.clear()

      expect(manager.getProgress('task1')).toBeUndefined()
      expect(manager.getProgress('task2')).toBeUndefined()
      expect(manager.getProgressHistory('task1')).toHaveLength(0)
    })
  })
})
