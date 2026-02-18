/**
 * 甘特图资源管理器
 *
 * 核心功能：
 * 1. 资源定义和管理（人员、设备、材料等）
 * 2. 任务资源分配
 * 3. 资源负载计算
 * 4. 资源冲突检测
 * 5. 资源利用率统计
 */

import type { GanttTask } from '../ganttDiagramGenerator'

export type ResourceType = 'human' | 'equipment' | 'material' | 'cost'

export interface Resource {
  id: string
  name: string
  type: ResourceType
  email?: string
  avatar?: string
  capacity: number // 每日可用工时（小时）
  costPerHour?: number // 每小时成本
  color?: string // 资源颜色标识
  tags?: string[] // 技能标签
  department?: string // 部门
  isActive: boolean
}

export interface ResourceAssignment {
  resourceId: string
  taskId: string
  allocation: number // 分配比例（0-100%）
  startDate: Date
  endDate: Date
  plannedHours: number // 计划工时
  actualHours?: number // 实际工时
}

export interface ResourceLoad {
  resourceId: string
  date: Date
  allocatedHours: number
  availableHours: number
  utilizationRate: number // 利用率（0-100%）
  taskIds: string[]
}

export interface ResourceConflict {
  resourceId: string
  resourceName: string
  date: Date
  allocatedHours: number
  availableHours: number
  overAllocation: number // 超配工时
  taskIds: string[]
}

export interface ResourceStats {
  resourceId: string
  resourceName: string
  totalTasks: number
  totalPlannedHours: number
  totalActualHours: number
  averageUtilization: number
  conflictDays: number
}

export class ResourceManager {
  private resources: Map<string, Resource> = new Map()
  private assignments: Map<string, ResourceAssignment[]> = new Map() // resourceId -> assignments
  private taskAssignments: Map<string, ResourceAssignment[]> = new Map() // taskId -> assignments

  /**
   * 添加资源
   */
  addResource(resource: Resource): void {
    this.resources.set(resource.id, resource)
    if (!this.assignments.has(resource.id)) {
      this.assignments.set(resource.id, [])
    }
  }

  /**
   * 更新资源
   */
  updateResource(resourceId: string, updates: Partial<Resource>): void {
    const resource = this.resources.get(resourceId)
    if (resource) {
      this.resources.set(resourceId, { ...resource, ...updates })
    }
  }

  /**
   * 删除资源
   */
  removeResource(resourceId: string): void {
    // 检查是否有分配
    const resourceAssignments = this.assignments.get(resourceId)
    if (resourceAssignments && resourceAssignments.length > 0) {
      throw new Error(`无法删除资源：该资源已被分配给 ${resourceAssignments.length} 个任务`)
    }
    this.resources.delete(resourceId)
    this.assignments.delete(resourceId)
  }

  /**
   * 获取资源
   */
  getResource(resourceId: string): Resource | undefined {
    return this.resources.get(resourceId)
  }

  /**
   * 获取所有资源
   */
  getAllResources(): Resource[] {
    return Array.from(this.resources.values())
  }

  /**
   * 按类型获取资源
   */
  getResourcesByType(type: ResourceType): Resource[] {
    return this.getAllResources().filter(r => r.type === type)
  }

  /**
   * 分配资源给任务
   */
  assignResource(assignment: ResourceAssignment): void {
    const resource = this.resources.get(assignment.resourceId)
    if (!resource) {
      throw new Error(`资源不存在: ${assignment.resourceId}`)
    }

    // 添加到资源分配列表
    const resourceAssignments = this.assignments.get(assignment.resourceId) || []
    resourceAssignments.push(assignment)
    this.assignments.set(assignment.resourceId, resourceAssignments)

    // 添加到任务分配列表
    const taskAssignments = this.taskAssignments.get(assignment.taskId) || []
    taskAssignments.push(assignment)
    this.taskAssignments.set(assignment.taskId, taskAssignments)
  }

  /**
   * 移除资源分配
   */
  removeAssignment(resourceId: string, taskId: string): void {
    // 从资源分配列表中移除
    const resourceAssignments = this.assignments.get(resourceId) || []
    const filteredResourceAssignments = resourceAssignments.filter(
      a => a.taskId !== taskId
    )
    this.assignments.set(resourceId, filteredResourceAssignments)

    // 从任务分配列表中移除
    const taskAssignments = this.taskAssignments.get(taskId) || []
    const filteredTaskAssignments = taskAssignments.filter(
      a => a.resourceId !== resourceId
    )
    this.taskAssignments.set(taskId, filteredTaskAssignments)
  }

  /**
   * 获取任务的资源分配
   */
  getTaskAssignments(taskId: string): ResourceAssignment[] {
    return this.taskAssignments.get(taskId) || []
  }

  /**
   * 获取资源的所有分配
   */
  getResourceAssignments(resourceId: string): ResourceAssignment[] {
    return this.assignments.get(resourceId) || []
  }

  /**
   * 计算资源在指定日期的负载
   */
  calculateResourceLoad(resourceId: string, date: Date): ResourceLoad {
    const resource = this.resources.get(resourceId)
    if (!resource) {
      throw new Error(`资源不存在: ${resourceId}`)
    }

    const assignments = this.assignments.get(resourceId) || []
    const dateStr = this.formatDate(date)

    let allocatedHours = 0
    const taskIds: string[] = []

    assignments.forEach(assignment => {
      const assignmentStartStr = this.formatDate(assignment.startDate)
      const assignmentEndStr = this.formatDate(assignment.endDate)

      if (dateStr >= assignmentStartStr && dateStr <= assignmentEndStr) {
        // 计算当天分配的工时
        const dailyHours = (resource.capacity * assignment.allocation) / 100
        allocatedHours += dailyHours
        taskIds.push(assignment.taskId)
      }
    })

    const availableHours = resource.capacity
    const utilizationRate = availableHours > 0 ? (allocatedHours / availableHours) * 100 : 0

    return {
      resourceId,
      date: new Date(date),
      allocatedHours,
      availableHours,
      utilizationRate: Math.min(100, utilizationRate),
      taskIds,
    }
  }

  /**
   * 计算资源在日期范围内的负载
   */
  calculateResourceLoadRange(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): ResourceLoad[] {
    const loads: ResourceLoad[] = []
    const current = new Date(startDate)
    const end = new Date(endDate)

    while (current <= end) {
      loads.push(this.calculateResourceLoad(resourceId, current))
      current.setDate(current.getDate() + 1)
    }

    return loads
  }

  /**
   * 检测资源冲突（过载）
   */
  detectConflicts(startDate: Date, endDate: Date): ResourceConflict[] {
    const conflicts: ResourceConflict[] = []

    this.resources.forEach(resource => {
      const loads = this.calculateResourceLoadRange(resource.id, startDate, endDate)

      loads.forEach(load => {
        if (load.allocatedHours > load.availableHours) {
          conflicts.push({
            resourceId: resource.id,
            resourceName: resource.name,
            date: load.date,
            allocatedHours: load.allocatedHours,
            availableHours: load.availableHours,
            overAllocation: load.allocatedHours - load.availableHours,
            taskIds: load.taskIds,
          })
        }
      })
    })

    return conflicts
  }

  /**
   * 获取资源统计信息
   */
  getResourceStats(resourceId: string, tasks: GanttTask[]): ResourceStats {
    const resource = this.resources.get(resourceId)
    if (!resource) {
      throw new Error(`资源不存在: ${resourceId}`)
    }

    const assignments = this.assignments.get(resourceId) || []

    let totalPlannedHours = 0
    let totalActualHours = 0
    const uniqueTaskIds = new Set<string>()

    assignments.forEach(assignment => {
      uniqueTaskIds.add(assignment.taskId)
      totalPlannedHours += assignment.plannedHours
      totalActualHours += assignment.actualHours || 0
    })

    // 计算平均利用率
    const dateRange = this.getAssignmentsDateRange(assignments)
    if (dateRange) {
      const loads = this.calculateResourceLoadRange(
        resourceId,
        dateRange.start,
        dateRange.end
      )
      const avgUtilization = loads.reduce((sum, load) => sum + load.utilizationRate, 0) / loads.length

      // 统计冲突天数
      const conflictDays = loads.filter(load => load.allocatedHours > load.availableHours).length

      return {
        resourceId: resource.id,
        resourceName: resource.name,
        totalTasks: uniqueTaskIds.size,
        totalPlannedHours,
        totalActualHours,
        averageUtilization: Math.round(avgUtilization * 100) / 100,
        conflictDays,
      }
    }

    return {
      resourceId: resource.id,
      resourceName: resource.name,
      totalTasks: uniqueTaskIds.size,
      totalPlannedHours,
      totalActualHours,
      averageUtilization: 0,
      conflictDays: 0,
    }
  }

  /**
   * 获取所有资源的统计信息
   */
  getAllResourceStats(tasks: GanttTask[]): ResourceStats[] {
    return this.getAllResources()
      .filter(r => r.isActive)
      .map(r => this.getResourceStats(r.id, tasks))
  }

  /**
   * 获取资源负载热力图数据
   */
  getResourceHeatmap(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Array<{
    date: Date
    utilizationRate: number
    isOverAllocated: boolean
  }> {
    const loads = this.calculateResourceLoadRange(resourceId, startDate, endDate)

    return loads.map(load => ({
      date: load.date,
      utilizationRate: load.utilizationRate,
      isOverAllocated: load.allocatedHours > load.availableHours,
    }))
  }

  /**
   * 按资源生成甘特图数据（资源视图）
   */
  generateResourceGanttData(
    resourceId: string,
    tasks: GanttTask[]
  ): Array<{
    task: GanttTask
    assignment: ResourceAssignment
    resource: Resource
  }> {
    const assignments = this.assignments.get(resourceId) || []
    const result: Array<{
      task: GanttTask
      assignment: ResourceAssignment
      resource: Resource
    }> = []

    const resource = this.resources.get(resourceId)
    if (!resource) return result

    assignments.forEach(assignment => {
      const task = tasks.find(t => t.id === assignment.taskId)
      if (task) {
        result.push({ task, assignment, resource })
      }
    })

    return result.sort((a, b) => a.assignment.startDate.getTime() - b.assignment.startDate.getTime())
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.resources.clear()
    this.assignments.clear()
    this.taskAssignments.clear()
  }

  /**
   * 序列化为JSON
   */
  toJSON(): string {
    const data = {
      resources: Array.from(this.resources.values()),
      assignments: Array.from(this.assignments.entries()).map(([resourceId, assigns]) => ({
        resourceId,
        assignments: assigns.map(a => ({
          ...a,
          startDate: this.formatDate(a.startDate),
          endDate: this.formatDate(a.endDate),
        })),
      })),
    }
    return JSON.stringify(data)
  }

  /**
   * 从JSON反序列化
   */
  fromJSON(json: string): void {
    const data = JSON.parse(json)

    this.clear()

    // 恢复资源
    data.resources.forEach((r: Resource) => {
      this.addResource(r)
    })

    // 恢复分配
    data.assignments.forEach((item: { resourceId: string; assignments: any[] }) => {
      item.assignments.forEach((a: any) => {
        this.assignResource({
          ...a,
          startDate: new Date(a.startDate),
          endDate: new Date(a.endDate),
        })
      })
    })
  }

  /**
   * 获取分配的日期范围
   */
  private getAssignmentsDateRange(
    assignments: ResourceAssignment[]
  ): { start: Date; end: Date } | null {
    if (assignments.length === 0) return null

    const startDates = assignments.map(a => a.startDate.getTime())
    const endDates = assignments.map(a => a.endDate.getTime())

    return {
      start: new Date(Math.min(...startDates)),
      end: new Date(Math.max(...endDates)),
    }
  }

  /**
   * 格式化日期为字符串
   */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}

// 导出单例
export const resourceManager = new ResourceManager()
export default resourceManager
