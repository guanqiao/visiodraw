/**
 * 资源管理器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ResourceManager, Resource, ResourceAssignment } from '../resourceManager'
import type { GanttTask } from '../../ganttDiagramGenerator'

describe('ResourceManager', () => {
  let manager: ResourceManager

  beforeEach(() => {
    manager = new ResourceManager()
  })

  // 测试资源
  const createTestResource = (id: string, name: string, capacity: number = 8): Resource => ({
    id,
    name,
    type: 'human',
    capacity,
    isActive: true,
  })

  // 测试任务
  const createTestTask = (id: string, duration: number = 5): GanttTask => ({
    id,
    name: `任务${id}`,
    type: 'task',
    status: 'default',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-06'),
    duration,
    dependencies: [],
    order: 0,
  })

  describe('资源管理', () => {
    it('应该正确添加资源', () => {
      const resource = createTestResource('r1', '张三')
      manager.addResource(resource)

      expect(manager.getResource('r1')).toEqual(resource)
      expect(manager.getAllResources()).toHaveLength(1)
    })

    it('应该正确更新资源', () => {
      const resource = createTestResource('r1', '张三')
      manager.addResource(resource)

      manager.updateResource('r1', { name: '张三丰', capacity: 6 })
      const updated = manager.getResource('r1')

      expect(updated?.name).toBe('张三丰')
      expect(updated?.capacity).toBe(6)
    })

    it('应该正确删除资源', () => {
      const resource = createTestResource('r1', '张三')
      manager.addResource(resource)

      manager.removeResource('r1')
      expect(manager.getResource('r1')).toBeUndefined()
    })

    it('删除已分配的资源应该抛出错误', () => {
      const resource = createTestResource('r1', '张三')
      manager.addResource(resource)

      const assignment: ResourceAssignment = {
        resourceId: 'r1',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 40,
      }
      manager.assignResource(assignment)

      expect(() => manager.removeResource('r1')).toThrow('无法删除资源')
    })

    it('应该按类型获取资源', () => {
      manager.addResource(createTestResource('r1', '张三'))
      manager.addResource({ ...createTestResource('r2', '服务器'), type: 'equipment' })

      const humanResources = manager.getResourcesByType('human')
      expect(humanResources).toHaveLength(1)
      expect(humanResources[0].name).toBe('张三')
    })
  })

  describe('资源分配', () => {
    it('应该正确分配资源给任务', () => {
      const resource = createTestResource('r1', '张三')
      manager.addResource(resource)

      const assignment: ResourceAssignment = {
        resourceId: 'r1',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 40,
      }
      manager.assignResource(assignment)

      const taskAssignments = manager.getTaskAssignments('t1')
      expect(taskAssignments).toHaveLength(1)
      expect(taskAssignments[0].resourceId).toBe('r1')
    })

    it('分配给不存在的资源应该抛出错误', () => {
      const assignment: ResourceAssignment = {
        resourceId: 'r999',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 40,
      }

      expect(() => manager.assignResource(assignment)).toThrow('资源不存在')
    })

    it('应该正确移除资源分配', () => {
      const resource = createTestResource('r1', '张三')
      manager.addResource(resource)

      const assignment: ResourceAssignment = {
        resourceId: 'r1',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 40,
      }
      manager.assignResource(assignment)
      manager.removeAssignment('r1', 't1')

      expect(manager.getTaskAssignments('t1')).toHaveLength(0)
    })

    it('一个任务可以分配多个资源', () => {
      manager.addResource(createTestResource('r1', '张三'))
      manager.addResource(createTestResource('r2', '李四'))

      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 50,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 20,
      })
      manager.assignResource({
        resourceId: 'r2',
        taskId: 't1',
        allocation: 50,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 20,
      })

      expect(manager.getTaskAssignments('t1')).toHaveLength(2)
    })
  })

  describe('资源负载计算', () => {
    it('应该正确计算单日的资源负载', () => {
      const resource = createTestResource('r1', '张三', 8)
      manager.addResource(resource)

      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 40,
      })

      const load = manager.calculateResourceLoad('r1', new Date('2024-01-02'))

      expect(load.allocatedHours).toBe(8) // 100% * 8小时
      expect(load.availableHours).toBe(8)
      expect(load.utilizationRate).toBe(100)
    })

    it('应该正确计算部分分配的资源负载', () => {
      const resource = createTestResource('r1', '张三', 8)
      manager.addResource(resource)

      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 50,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 20,
      })

      const load = manager.calculateResourceLoad('r1', new Date('2024-01-02'))

      expect(load.allocatedHours).toBe(4) // 50% * 8小时
      expect(load.utilizationRate).toBe(50)
    })

    it('应该正确计算日期范围内的资源负载', () => {
      const resource = createTestResource('r1', '张三', 8)
      manager.addResource(resource)

      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03'),
        plannedHours: 24,
      })

      const loads = manager.calculateResourceLoadRange(
        'r1',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(loads).toHaveLength(5)
      expect(loads[0].allocatedHours).toBe(8) // 分配期间
      expect(loads[3].allocatedHours).toBe(0) // 分配结束后
    })
  })

  describe('资源冲突检测', () => {
    it('应该检测到资源过载冲突', () => {
      const resource = createTestResource('r1', '张三', 8)
      manager.addResource(resource)

      // 分配两个任务，总分配超过100%
      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 80,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 32,
      })
      manager.assignResource({
        resourceId: 'r1',
        taskId: 't2',
        allocation: 50,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 20,
      })

      const conflicts = manager.detectConflicts(
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(conflicts.length).toBeGreaterThan(0)
      expect(conflicts[0].overAllocation).toBeGreaterThan(0)
    })

    it('没有冲突时应该返回空数组', () => {
      const resource = createTestResource('r1', '张三', 8)
      manager.addResource(resource)

      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 50,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 20,
      })

      const conflicts = manager.detectConflicts(
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(conflicts).toHaveLength(0)
    })
  })

  describe('资源统计', () => {
    it('应该正确计算资源统计信息', () => {
      const resource = createTestResource('r1', '张三', 8)
      manager.addResource(resource)

      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 40,
        actualHours: 35,
      })

      const tasks: GanttTask[] = [createTestTask('t1')]
      const stats = manager.getResourceStats('r1', tasks)

      expect(stats.resourceName).toBe('张三')
      expect(stats.totalTasks).toBe(1)
      expect(stats.totalPlannedHours).toBe(40)
      expect(stats.totalActualHours).toBe(35)
    })

    it('应该正确计算多个任务的统计', () => {
      const resource = createTestResource('r1', '张三', 8)
      manager.addResource(resource)

      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03'),
        plannedHours: 24,
      })
      manager.assignResource({
        resourceId: 'r1',
        taskId: 't2',
        allocation: 100,
        startDate: new Date('2024-01-04'),
        endDate: new Date('2024-01-06'),
        plannedHours: 24,
      })

      const tasks: GanttTask[] = [createTestTask('t1'), createTestTask('t2')]
      const stats = manager.getResourceStats('r1', tasks)

      expect(stats.totalTasks).toBe(2)
      expect(stats.totalPlannedHours).toBe(48)
    })
  })

  describe('资源热力图', () => {
    it('应该生成正确的热力图数据', () => {
      const resource = createTestResource('r1', '张三', 8)
      manager.addResource(resource)

      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-03'),
        plannedHours: 24,
      })

      const heatmap = manager.getResourceHeatmap(
        'r1',
        new Date('2024-01-01'),
        new Date('2024-01-05')
      )

      expect(heatmap).toHaveLength(5)
      expect(heatmap[0].utilizationRate).toBe(100)
      expect(heatmap[0].isOverAllocated).toBe(false)
      expect(heatmap[3].utilizationRate).toBe(0)
    })
  })

  describe('序列化', () => {
    it('应该正确序列化和反序列化', () => {
      const resource = createTestResource('r1', '张三', 8)
      manager.addResource(resource)

      manager.assignResource({
        resourceId: 'r1',
        taskId: 't1',
        allocation: 100,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
        plannedHours: 40,
      })

      const json = manager.toJSON()
      const newManager = new ResourceManager()
      newManager.fromJSON(json)

      expect(newManager.getResource('r1')?.name).toBe('张三')
      expect(newManager.getTaskAssignments('t1')).toHaveLength(1)
    })
  })
})
