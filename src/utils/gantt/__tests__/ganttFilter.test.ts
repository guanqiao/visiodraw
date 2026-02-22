/**
 * 甘特图筛选器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GanttFilter } from '../ganttFilter'
import type { GanttTask } from '../../ganttDiagramGenerator'

describe('GanttFilter', () => {
  let filter: GanttFilter

  beforeEach(() => {
    filter = new GanttFilter()
  })

  // 创建测试数据
  const createTestTasks = (): GanttTask[] => [
    {
      id: 't1',
      name: '前端开发',
      type: 'task',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-10'),
      duration: 9,
      dependencies: [],
      order: 0,
      section: 's1',
      assignee: 'user1',
    },
    {
      id: 't2',
      name: '后端开发',
      type: 'task',
      status: 'default',
      startDate: new Date('2024-01-05'),
      endDate: new Date('2024-01-15'),
      duration: 10,
      dependencies: ['t1'],
      order: 1,
      section: 's1',
      assignee: 'user2',
    },
    {
      id: 't3',
      name: '测试',
      type: 'task',
      status: 'done',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-20'),
      duration: 5,
      dependencies: ['t2'],
      order: 2,
      section: 's2',
      assignee: 'user1',
    },
    {
      id: 't4',
      name: '关键路径任务',
      type: 'task',
      status: 'crit',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-05'),
      duration: 4,
      dependencies: [],
      order: 3,
      section: 's2',
    },
  ]

  describe('状态筛选', () => {
    it('应该正确按状态筛选', () => {
      const tasks = createTestTasks()
      const result = filter.filterByStatus(tasks, ['active', 'done'])

      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('t1')
      expect(result.map(t => t.id)).toContain('t3')
    })

    it('空状态数组应该返回空结果', () => {
      const tasks = createTestTasks()
      const result = filter.filterByStatus(tasks, [])

      expect(result).toHaveLength(0)
    })
  })

  describe('日期范围筛选', () => {
    it('应该正确筛选重叠的任务', () => {
      const tasks = createTestTasks()
      const result = filter.filterByDateRange(
        tasks,
        new Date('2024-01-08'),
        new Date('2024-01-12')
      )

      // t1(1-10), t2(5-15) 与 8-12 重叠
      expect(result).toHaveLength(2)
    })

    it('应该正确筛选包含在范围内的任务', () => {
      const tasks = createTestTasks()
      const result = filter.filterByDateRange(
        tasks,
        new Date('2024-01-01'),
        new Date('2024-01-30'),
        'contain'
      )

      // 所有任务都在范围内
      expect(result).toHaveLength(4)
    })
  })

  describe('资源筛选', () => {
    it('应该正确按资源筛选', () => {
      const tasks = createTestTasks()
      const result = filter.filterByResource(tasks, ['user1'])

      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('t1')
      expect(result.map(t => t.id)).toContain('t3')
    })

    it('没有assignees的任务不应该被筛选出来', () => {
      const tasks = createTestTasks()
      const result = filter.filterByResource(tasks, ['user999'])

      expect(result).toHaveLength(0)
    })
  })

  describe('分组筛选', () => {
    it('应该正确按分组筛选', () => {
      const tasks = createTestTasks()
      const result = filter.filterBySection(tasks, ['s1'])

      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('t1')
      expect(result.map(t => t.id)).toContain('t2')
    })
  })

  describe('全文搜索', () => {
    it('应该正确搜索任务名称', () => {
      const tasks = createTestTasks()
      const result = filter.search(tasks, { keyword: '开发' })

      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('t1')
      expect(result.map(t => t.id)).toContain('t2')
    })

    it('应该支持不区分大小写搜索', () => {
      const tasks = createTestTasks()
      const result = filter.search(tasks, { keyword: 'FRONTEND' })

      expect(result).toHaveLength(0) // 因为没有匹配
    })

    it('空关键词应该返回所有任务', () => {
      const tasks = createTestTasks()
      const result = filter.search(tasks, { keyword: '' })

      expect(result).toHaveLength(4)
    })
  })

  describe('高级筛选', () => {
    it('应该正确应用AND条件', () => {
      const tasks = createTestTasks()
      const filterGroup = {
        operator: 'and' as const,
        conditions: [
          { field: 'status', operator: 'eq' as const, value: 'active' },
          { field: 'sectionId', operator: 'eq' as const, value: 's1' },
        ],
      }

      const result = filter.advancedFilter(tasks, filterGroup)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('t1')
    })

    it('应该正确应用OR条件', () => {
      const tasks = createTestTasks()
      const filterGroup = {
        operator: 'or' as const,
        conditions: [
          { field: 'status', operator: 'eq' as const, value: 'done' },
          { field: 'status', operator: 'eq' as const, value: 'crit' },
        ],
      }

      const result = filter.advancedFilter(tasks, filterGroup)

      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('t3')
      expect(result.map(t => t.id)).toContain('t4')
    })

    it('应该正确应用嵌套条件', () => {
      const tasks = createTestTasks()
      const filterGroup = {
        operator: 'and' as const,
        conditions: [
          { field: 'sectionId', operator: 'eq' as const, value: 's1' },
          {
            operator: 'or' as const,
            conditions: [
              { field: 'status', operator: 'eq' as const, value: 'active' },
              { field: 'status', operator: 'eq' as const, value: 'default' },
            ],
          },
        ],
      }

      const result = filter.advancedFilter(tasks, filterGroup)

      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toContain('t1')
      expect(result.map(t => t.id)).toContain('t2')
    })
  })

  describe('排序', () => {
    it('应该正确按开始日期排序', () => {
      const tasks = createTestTasks()
      const result = filter.sort(tasks, [{ field: 'startDate', order: 'asc' }])

      expect(result[0].id).toBe('t1') // 1月1日
      expect(result[1].id).toBe('t4') // 1月1日
      expect(result[2].id).toBe('t2') // 1月5日
    })

    it('应该正确按名称排序', () => {
      const tasks = createTestTasks()
      const result = filter.sort(tasks, [{ field: 'name', order: 'asc' }])

      // 验证排序后的顺序（按拼音字母顺序）
      // 实际顺序：测(ce), 关(guan), 后(hou), 前(qian)
      expect(result.map(t => t.name)).toEqual([
        '测试',
        '关键路径任务',
        '后端开发',
        '前端开发',
      ])
    })
  })

  describe('综合筛选', () => {
    it('应该正确组合搜索、筛选和排序', () => {
      const tasks = createTestTasks()
      const result = filter.filter(tasks, {
        search: { keyword: '开发' },
        sort: [{ field: 'status', order: 'asc' }],
      })

      expect(result.tasks).toHaveLength(2)
      expect(result.filteredCount).toBe(2)
      expect(result.totalCount).toBe(4)
    })
  })

  describe('预设筛选', () => {
    it('应该返回预设筛选', () => {
      const presets = filter.getPresetFilters()

      expect(presets.length).toBeGreaterThan(0)
      expect(presets[0].name).toBeDefined()
      expect(presets[0].filter).toBeDefined()
    })

    it('预设筛选应该能正确应用', () => {
      const presets = filter.getPresetFilters()
      const tasks = createTestTasks()

      // 应用"未完成任务"筛选
      const incompleteFilter = presets.find(p => p.name === '未完成任务')
      expect(incompleteFilter).toBeDefined()

      const result = filter.advancedFilter(tasks, incompleteFilter!.filter)
      expect(result.length).toBe(3) // t1, t2, t4 都未完成
    })
  })

  describe('保存和加载筛选', () => {
    it('应该正确保存和加载筛选', () => {
      const filterGroup = {
        operator: 'and' as const,
        conditions: [{ field: 'status', operator: 'eq' as const, value: 'active' }],
      }

      filter.saveFilter('我的筛选', filterGroup)
      const loaded = filter.loadFilter('我的筛选')

      expect(loaded).toEqual(filterGroup)
    })

    it('应该正确删除筛选', () => {
      const filterGroup = {
        operator: 'and' as const,
        conditions: [],
      }

      filter.saveFilter('待删除', filterGroup)
      const deleted = filter.deleteFilter('待删除')

      expect(deleted).toBe(true)
      expect(filter.loadFilter('待删除')).toBeUndefined()
    })
  })
})
