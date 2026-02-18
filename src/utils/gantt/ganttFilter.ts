/**
 * 甘特图任务筛选和搜索模块
 *
 * 核心功能：
 * 1. 多条件筛选（状态、日期、资源等）
 * 2. 全文搜索
 * 3. 高级筛选（组合条件）
 * 4. 筛选结果排序
 * 5. 筛选条件持久化
 */

import type { GanttTask, TaskStatus, TaskType } from '../ganttDiagramGenerator'

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in'

export interface FilterCondition {
  field: string
  operator: FilterOperator
  value: any
}

export interface FilterGroup {
  operator: 'and' | 'or'
  conditions: (FilterCondition | FilterGroup)[]
}

export interface SearchOptions {
  keyword: string
  fields?: string[] // 搜索字段，默认搜索name
  caseSensitive?: boolean
  exactMatch?: boolean
}

export interface SortOptions {
  field: string
  order: 'asc' | 'desc'
}

export interface FilterResult {
  tasks: GanttTask[]
  totalCount: number
  filteredCount: number
  appliedFilters: FilterGroup | null
}

export class GanttFilter {
  private savedFilters = new Map<string, FilterGroup>()

  /**
   * 根据状态筛选
   */
  filterByStatus(tasks: GanttTask[], statuses: TaskStatus[]): GanttTask[] {
    return tasks.filter(task => statuses.includes(task.status))
  }

  /**
   * 根据类型筛选
   */
  filterByType(tasks: GanttTask[], types: TaskType[]): GanttTask[] {
    return tasks.filter(task => types.includes(task.type))
  }

  /**
   * 根据日期范围筛选
   */
  filterByDateRange(
    tasks: GanttTask[],
    startDate: Date,
    endDate: Date,
    mode: 'overlap' | 'contain' | 'start' | 'end' = 'overlap'
  ): GanttTask[] {
    return tasks.filter(task => {
      const taskStart = task.startDate.getTime()
      const taskEnd = task.endDate.getTime()
      const rangeStart = startDate.getTime()
      const rangeEnd = endDate.getTime()

      switch (mode) {
        case 'overlap':
          // 任务与日期范围有重叠
          return taskStart <= rangeEnd && taskEnd >= rangeStart
        case 'contain':
          // 任务完全包含在日期范围内
          return taskStart >= rangeStart && taskEnd <= rangeEnd
        case 'start':
          // 任务开始时间在范围内
          return taskStart >= rangeStart && taskStart <= rangeEnd
        case 'end':
          // 任务结束时间在范围内
          return taskEnd >= rangeStart && taskEnd <= rangeEnd
        default:
          return false
      }
    })
  }

  /**
   * 根据资源筛选
   */
  filterByResource(tasks: GanttTask[], resourceIds: string[]): GanttTask[] {
    return tasks.filter(task => {
      if (!task.assignees) return false
      return task.assignees.some(assignee => resourceIds.includes(assignee))
    })
  }

  /**
   * 根据分组筛选
   */
  filterBySection(tasks: GanttTask[], sectionIds: string[]): GanttTask[] {
    return tasks.filter(task => sectionIds.includes(task.sectionId || ''))
  }

  /**
   * 全文搜索
   */
  search(tasks: GanttTask[], options: SearchOptions): GanttTask[] {
    const { keyword, fields = ['name'], caseSensitive = false, exactMatch = false } = options

    if (!keyword.trim()) return tasks

    const searchTerm = caseSensitive ? keyword : keyword.toLowerCase()

    return tasks.filter(task => {
      return fields.some(field => {
        const value = this.getFieldValue(task, field)
        if (value === undefined || value === null) return false

        const strValue = String(value)
        const compareValue = caseSensitive ? strValue : strValue.toLowerCase()

        if (exactMatch) {
          return compareValue === searchTerm
        } else {
          return compareValue.includes(searchTerm)
        }
      })
    })
  }

  /**
   * 高级筛选（支持组合条件）
   */
  advancedFilter(tasks: GanttTask[], filterGroup: FilterGroup): GanttTask[] {
    return tasks.filter(task => this.evaluateFilterGroup(task, filterGroup))
  }

  /**
   * 评估筛选组
   */
  private evaluateFilterGroup(task: GanttTask, group: FilterGroup): boolean {
    const results = group.conditions.map(condition => {
      if ('operator' in condition && ('and' === condition.operator || 'or' === condition.operator)) {
        // 嵌套筛选组
        return this.evaluateFilterGroup(task, condition as FilterGroup)
      } else {
        // 筛选条件
        return this.evaluateCondition(task, condition as FilterCondition)
      }
    })

    return group.operator === 'and'
      ? results.every(r => r)
      : results.some(r => r)
  }

  /**
   * 评估单个条件
   */
  private evaluateCondition(task: GanttTask, condition: FilterCondition): boolean {
    const { field, operator, value } = condition
    const fieldValue = this.getFieldValue(task, field)

    switch (operator) {
      case 'eq':
        return fieldValue === value
      case 'ne':
        return fieldValue !== value
      case 'gt':
        return fieldValue > value
      case 'gte':
        return fieldValue >= value
      case 'lt':
        return fieldValue < value
      case 'lte':
        return fieldValue <= value
      case 'contains':
        return String(fieldValue).includes(String(value))
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue)
      default:
        return false
    }
  }

  /**
   * 获取字段值
   */
  private getFieldValue(task: GanttTask, field: string): any {
    const fields = field.split('.')
    let value: any = task

    for (const f of fields) {
      if (value === undefined || value === null) return undefined
      value = value[f]
    }

    return value
  }

  /**
   * 排序任务
   */
  sort(tasks: GanttTask[], options: SortOptions[]): GanttTask[] {
    return [...tasks].sort((a, b) => {
      for (const option of options) {
        const { field, order } = option
        const valueA = this.getFieldValue(a, field)
        const valueB = this.getFieldValue(b, field)

        if (valueA === valueB) continue

        const comparison = this.compareValues(valueA, valueB)
        return order === 'asc' ? comparison : -comparison
      }
      return 0
    })
  }

  /**
   * 比较值
   */
  private compareValues(a: any, b: any): number {
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime()
    }
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b)
    }
    return a < b ? -1 : 1
  }

  /**
   * 综合筛选（搜索 + 筛选 + 排序）
   */
  filter(
    tasks: GanttTask[],
    options: {
      search?: SearchOptions
      filter?: FilterGroup
      sort?: SortOptions[]
    }
  ): FilterResult {
    let result = [...tasks]
    let appliedFilters: FilterGroup | null = null

    // 搜索
    if (options.search && options.search.keyword) {
      result = this.search(result, options.search)
    }

    // 筛选
    if (options.filter) {
      result = this.advancedFilter(result, options.filter)
      appliedFilters = options.filter
    }

    // 排序
    if (options.sort && options.sort.length > 0) {
      result = this.sort(result, options.sort)
    }

    return {
      tasks: result,
      totalCount: tasks.length,
      filteredCount: result.length,
      appliedFilters,
    }
  }

  /**
   * 保存筛选条件
   */
  saveFilter(name: string, filter: FilterGroup): void {
    this.savedFilters.set(name, filter)
  }

  /**
   * 加载筛选条件
   */
  loadFilter(name: string): FilterGroup | undefined {
    return this.savedFilters.get(name)
  }

  /**
   * 删除筛选条件
   */
  deleteFilter(name: string): boolean {
    return this.savedFilters.delete(name)
  }

  /**
   * 获取所有保存的筛选条件
   */
  getSavedFilters(): { name: string; filter: FilterGroup }[] {
    return Array.from(this.savedFilters.entries()).map(([name, filter]) => ({
      name,
      filter,
    }))
  }

  /**
   * 常用筛选预设
   */
  getPresetFilters(): { name: string; filter: FilterGroup; description: string }[] {
    return [
      {
        name: '未完成任务',
        description: '显示所有未完成的任务',
        filter: {
          operator: 'and',
          conditions: [
            {
              field: 'status',
              operator: 'ne',
              value: 'done',
            },
          ],
        },
      },
      {
        name: '关键任务',
        description: '显示所有关键路径上的任务',
        filter: {
          operator: 'and',
          conditions: [
            {
              field: 'status',
              operator: 'eq',
              value: 'crit',
            },
          ],
        },
      },
      {
        name: '延期任务',
        description: '显示所有延期的任务',
        filter: {
          operator: 'and',
          conditions: [
            {
              field: 'endDate',
              operator: 'lt',
              value: new Date(),
            },
            {
              field: 'status',
              operator: 'ne',
              value: 'done',
            },
          ],
        },
      },
      {
        name: '本周任务',
        description: '显示本周内的任务',
        filter: {
          operator: 'and',
          conditions: [
            {
              field: 'startDate',
              operator: 'gte',
              value: new Date(),
            },
          ],
        },
      },
    ]
  }

  /**
   * 清除所有保存的筛选条件
   */
  clearSavedFilters(): void {
    this.savedFilters.clear()
  }
}

// 导出单例
export const ganttFilter = new GanttFilter()
export default ganttFilter
