/**
 * 基线管理器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { BaselineManager } from '../baselineManager'
import type { ParsedGanttDiagram, GanttTask, GanttSection } from '../../ganttDiagramGenerator'

describe('BaselineManager', () => {
  let manager: BaselineManager

  beforeEach(() => {
    manager = new BaselineManager()
  })

  // 创建测试数据
  const createTestData = (): ParsedGanttDiagram => ({
    title: '测试项目',
    dateFormat: 'YYYY-MM-DD',
    sections: [
      { id: 's1', name: '第一阶段', order: 0 },
      { id: 's2', name: '第二阶段', order: 1 },
    ] as GanttSection[],
    tasks: [
      {
        id: 't1',
        name: '任务1',
        type: 'task',
        status: 'default',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-06'),
        duration: 5,
        dependencies: [],
        order: 0,
      },
      {
        id: 't2',
        name: '任务2',
        type: 'task',
        status: 'active',
        startDate: new Date('2024-01-06'),
        endDate: new Date('2024-01-11'),
        duration: 5,
        dependencies: ['t1'],
        order: 1,
      },
      {
        id: 't3',
        name: '任务3',
        type: 'task',
        status: 'done',
        startDate: new Date('2024-01-11'),
        endDate: new Date('2024-01-16'),
        duration: 5,
        dependencies: ['t2'],
        order: 2,
      },
    ] as GanttTask[],
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-16'),
  })

  describe('基线创建', () => {
    it('应该正确创建基线', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划', '项目启动时的计划')

      expect(baseline.name).toBe('初始计划')
      expect(baseline.description).toBe('项目启动时的计划')
      expect(baseline.tasks).toHaveLength(3)
      expect(baseline.sections).toHaveLength(2)
    })

    it('创建的基线应该包含正确的任务信息', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const task1 = baseline.tasks.find(t => t.taskId === 't1')
      expect(task1).toBeDefined()
      expect(task1?.name).toBe('任务1')
      expect(task1?.plannedDuration).toBe(5)
      expect(task1?.status).toBe('not-started')
    })

    it('已完成的任务应该标记为completed', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const task3 = baseline.tasks.find(t => t.taskId === 't3')
      expect(task3?.status).toBe('completed')
      expect(task3?.progress).toBe(100)
    })

    it('进行中的任务应该标记为in-progress', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const task2 = baseline.tasks.find(t => t.taskId === 't2')
      expect(task2?.status).toBe('in-progress')
    })
  })

  describe('基线管理', () => {
    it('应该正确获取基线', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const retrieved = manager.getBaseline(baseline.id)
      expect(retrieved).toEqual(baseline)
    })

    it('应该正确获取所有基线', async () => {
      const data = createTestData()
      manager.createBaseline(data, '基线1')
      await new Promise(resolve => setTimeout(resolve, 10)) // 等待10ms避免ID重复
      manager.createBaseline(data, '基线2')

      const allBaselines = manager.getAllBaselines()
      expect(allBaselines).toHaveLength(2)
    })

    it('应该正确删除基线', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const result = manager.deleteBaseline(baseline.id)
      expect(result).toBe(true)
      expect(manager.getBaseline(baseline.id)).toBeUndefined()
    })

    it('应该正确重命名基线', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '旧名称')

      manager.renameBaseline(baseline.id, '新名称')
      const renamed = manager.getBaseline(baseline.id)
      expect(renamed?.name).toBe('新名称')
    })
  })

  describe('活动基线', () => {
    it('应该正确设置活动基线', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      manager.setActiveBaseline(baseline.id)
      expect(manager.getActiveBaseline()?.id).toBe(baseline.id)
    })

    it('设置不存在的基线应该抛出错误', () => {
      expect(() => manager.setActiveBaseline('non-existent')).toThrow('基线不存在')
    })

    it('删除活动基线应该清除活动状态', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      manager.setActiveBaseline(baseline.id)
      manager.deleteBaseline(baseline.id)
      expect(manager.getActiveBaseline()).toBeNull()
    })
  })

  describe('基线对比', () => {
    it('应该正确对比基线与当前任务', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      // 修改当前任务（模拟实际进度）
      const currentTasks: GanttTask[] = [
        {
          ...data.tasks[0],
          endDate: new Date('2024-01-08'), // 延期2天
          duration: 7,
        },
        {
          ...data.tasks[1],
          startDate: new Date('2024-01-08'),
          endDate: new Date('2024-01-13'),
        },
        data.tasks[2],
      ]

      const comparison = manager.compareWithBaseline(baseline.id, currentTasks)

      expect(comparison).toBeDefined()
      expect(comparison?.variances).toHaveLength(3)

      const task1Variance = comparison?.variances.find(v => v.taskId === 't1')
      expect(task1Variance?.isDelayed).toBe(true)
      expect(task1Variance?.endVariance).toBe(2) // 延期2天
    })

    it('应该正确识别提前完成的任务', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const currentTasks: GanttTask[] = [
        {
          ...data.tasks[0],
          endDate: new Date('2024-01-04'), // 提前2天
          duration: 3,
        },
        data.tasks[1],
        data.tasks[2],
      ]

      const comparison = manager.compareWithBaseline(baseline.id, currentTasks)
      const task1Variance = comparison?.variances.find(v => v.taskId === 't1')

      expect(task1Variance?.isAhead).toBe(true)
      expect(task1Variance?.endVariance).toBe(-2) // 提前2天
    })

    it('应该正确计算对比摘要', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const currentTasks: GanttTask[] = [
        {
          ...data.tasks[0],
          endDate: new Date('2024-01-08'), // 延期2天
          duration: 7,
        },
        data.tasks[1],
        data.tasks[2],
      ]

      const comparison = manager.compareWithBaseline(baseline.id, currentTasks)

      expect(comparison?.summary.totalTasks).toBe(3)
      expect(comparison?.summary.delayedTasks).toBe(1)
      expect(comparison?.summary.maxDelay).toBe(2)
    })

    it('对比不存在的基线应该返回null', () => {
      const data = createTestData()
      const comparison = manager.compareWithBaseline('non-existent', data.tasks)
      expect(comparison).toBeNull()
    })
  })

  describe('基线统计', () => {
    it('应该正确计算基线统计', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const stats = manager.getBaselineStats(baseline.id)

      expect(stats?.taskCount).toBe(3)
      expect(stats?.completedCount).toBe(1) // 任务3已完成
      expect(stats?.completionRate).toBeGreaterThan(0)
      expect(stats?.averageTaskDuration).toBe(5)
      expect(stats?.totalPlannedDuration).toBe(15)
    })

    it('统计不存在的基线应该返回null', () => {
      const stats = manager.getBaselineStats('non-existent')
      expect(stats).toBeNull()
    })
  })

  describe('可视化数据生成', () => {
    it('应该生成正确的可视化数据', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const currentTasks: GanttTask[] = [
        {
          ...data.tasks[0],
          endDate: new Date('2024-01-08'), // 延期
          duration: 7,
        },
        data.tasks[1],
        data.tasks[2],
      ]

      const comparison = manager.compareWithBaseline(baseline.id, currentTasks)
      const visualization = manager.generateComparisonVisualization(comparison!)

      expect(visualization).toHaveLength(3)

      const task1Viz = visualization.find(v => v.taskId === 't1')
      expect(task1Viz?.plannedBar.color).toBe('#d9d9d9') // 灰色表示计划
      expect(task1Viz?.actualBar.color).toBe('#ff4d4f') // 红色表示延期
    })
  })

  describe('序列化', () => {
    it('应该正确导出基线', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      const json = manager.exportBaseline(baseline.id)
      expect(json).toBeDefined()

      const parsed = JSON.parse(json!)
      expect(parsed.name).toBe('初始计划')
      expect(parsed.tasks).toHaveLength(3)
    })

    it('应该正确导入基线', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')
      const json = manager.exportBaseline(baseline.id)

      manager.clear()
      const imported = manager.importBaseline(json!)

      expect(imported.name).toBe('初始计划')
      expect(imported.tasks).toHaveLength(3)
    })

    it('导出不存在的基线应该返回null', () => {
      const json = manager.exportBaseline('non-existent')
      expect(json).toBeNull()
    })
  })

  describe('更新基线', () => {
    it('应该正确更新基线实际进度', () => {
      const data = createTestData()
      const baseline = manager.createBaseline(data, '初始计划')

      // 修改当前任务
      const currentTasks: GanttTask[] = [
        {
          ...data.tasks[0],
          status: 'done' as const,
        },
        data.tasks[1],
        data.tasks[2],
      ]

      manager.updateBaselineWithActual(baseline.id, currentTasks)
      const updated = manager.getBaseline(baseline.id)

      const task1 = updated?.tasks.find(t => t.taskId === 't1')
      expect(task1?.status).toBe('completed')
      expect(task1?.progress).toBe(100)
    })

    it('更新不存在的基线应该返回null', () => {
      const data = createTestData()
      const result = manager.updateBaselineWithActual('non-existent', data.tasks)
      expect(result).toBeNull()
    })
  })
})
