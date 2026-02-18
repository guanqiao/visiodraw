/**
 * 甘特图基线管理器
 *
 * 核心功能：
 * 1. 保存项目计划基线
 * 2. 支持多个基线版本
 * 3. 计划 vs 实际对比
 * 4. 偏差分析和统计
 * 5. 基线可视化（对比视图）
 */

import type { GanttTask, GanttSection, ParsedGanttDiagram } from '../ganttDiagramGenerator'

export interface Baseline {
  id: string
  name: string
  description?: string
  createdAt: Date
  createdBy?: string
  tasks: BaselineTask[]
  sections: GanttSection[]
  startDate: Date
  endDate: Date
  totalDuration: number
}

export interface BaselineTask {
  taskId: string
  name: string
  plannedStartDate: Date
  plannedEndDate: Date
  plannedDuration: number
  actualStartDate?: Date
  actualEndDate?: Date
  actualDuration?: number
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed'
  progress: number // 0-100
}

export interface TaskVariance {
  taskId: string
  taskName: string
  startVariance: number // 开始时间偏差（天数）
  endVariance: number // 结束时间偏差（天数）
  durationVariance: number // 持续时间偏差（天数）
  isDelayed: boolean
  isAhead: boolean
  delayPercentage: number // 延期百分比
}

export interface BaselineComparison {
  baseline: Baseline
  currentTasks: GanttTask[]
  variances: TaskVariance[]
  summary: {
    totalTasks: number
    completedTasks: number
    delayedTasks: number
    aheadTasks: number
    onTrackTasks: number
    averageDelay: number
    maxDelay: number
    projectDelay: number // 项目整体延期天数
  }
}

export interface BaselineStats {
  baselineId: string
  baselineName: string
  taskCount: number
  completedCount: number
  completionRate: number
  averageTaskDuration: number
  totalPlannedDuration: number
}

export class BaselineManager {
  private baselines: Map<string, Baseline> = new Map()
  private activeBaselineId: string | null = null

  /**
   * 从当前甘特图数据创建基线
   */
  createBaseline(
    data: ParsedGanttDiagram,
    name: string,
    description?: string,
    createdBy?: string
  ): Baseline {
    const baselineId = `baseline-${Date.now()}`

    const baselineTasks: BaselineTask[] = data.tasks.map(task => {
      let status: BaselineTask['status'] = 'not-started'
      let progress = 0

      if (task.status === 'done') {
        status = 'completed'
        progress = 100
      } else if (task.status === 'active') {
        status = 'in-progress'
        progress = 50
      }

      return {
        taskId: task.id,
        name: task.name,
        plannedStartDate: new Date(task.startDate),
        plannedEndDate: new Date(task.endDate),
        plannedDuration: task.duration,
        status,
        progress,
      }
    })

    const totalDuration = Math.max(
      ...baselineTasks.map(t => t.plannedDuration),
      0
    )

    const baseline: Baseline = {
      id: baselineId,
      name,
      description,
      createdAt: new Date(),
      createdBy,
      tasks: baselineTasks,
      sections: data.sections.map(s => ({ ...s })),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalDuration,
    }

    this.baselines.set(baselineId, baseline)
    return baseline
  }

  /**
   * 更新基线（用于记录实际进度）
   */
  updateBaselineWithActual(
    baselineId: string,
    currentTasks: GanttTask[]
  ): Baseline | null {
    const baseline = this.baselines.get(baselineId)
    if (!baseline) return null

    baseline.tasks.forEach(baselineTask => {
      const currentTask = currentTasks.find(t => t.id === baselineTask.taskId)
      if (currentTask) {
        baselineTask.actualStartDate = new Date(currentTask.startDate)
        baselineTask.actualEndDate = new Date(currentTask.endDate)
        baselineTask.actualDuration = currentTask.duration

        // 计算进度
        if (currentTask.status === 'done') {
          baselineTask.progress = 100
          baselineTask.status = 'completed'
        } else if (currentTask.status === 'active') {
          baselineTask.progress = 50 // 简化计算
          baselineTask.status = 'in-progress'
        }

        // 判断是否延期
        const plannedEnd = baselineTask.plannedEndDate.getTime()
        const actualEnd = baselineTask.actualEndDate.getTime()
        if (actualEnd > plannedEnd) {
          baselineTask.status = 'delayed'
        }
      }
    })

    return baseline
  }

  /**
   * 对比基线与当前任务
   */
  compareWithBaseline(
    baselineId: string,
    currentTasks: GanttTask[]
  ): BaselineComparison | null {
    const baseline = this.baselines.get(baselineId)
    if (!baseline) return null

    const variances: TaskVariance[] = []
    let delayedCount = 0
    let aheadCount = 0
    let totalDelay = 0
    let maxDelay = 0

    baseline.tasks.forEach(baselineTask => {
      const currentTask = currentTasks.find(t => t.id === baselineTask.taskId)
      if (!currentTask) return

      const startVariance = this.getDayDiff(
        baselineTask.plannedStartDate,
        currentTask.startDate
      )
      const endVariance = this.getDayDiff(
        baselineTask.plannedEndDate,
        currentTask.endDate
      )
      const durationVariance = currentTask.duration - baselineTask.plannedDuration

      const isDelayed = endVariance > 0
      const isAhead = endVariance < 0

      if (isDelayed) {
        delayedCount++
        totalDelay += endVariance
        maxDelay = Math.max(maxDelay, endVariance)
      } else if (isAhead) {
        aheadCount++
      }

      const delayPercentage = baselineTask.plannedDuration > 0
        ? (durationVariance / baselineTask.plannedDuration) * 100
        : 0

      variances.push({
        taskId: baselineTask.taskId,
        taskName: baselineTask.name,
        startVariance,
        endVariance,
        durationVariance,
        isDelayed,
        isAhead,
        delayPercentage: Math.round(delayPercentage * 100) / 100,
      })
    })

    const completedTasks = currentTasks.filter(t => t.status === 'done').length
    const onTrackTasks = currentTasks.length - delayedCount - aheadCount

    // 计算项目整体延期（基于关键任务的延期）
    const projectDelay = Math.max(0, ...variances.map(v => v.endVariance))

    return {
      baseline,
      currentTasks,
      variances,
      summary: {
        totalTasks: currentTasks.length,
        completedTasks,
        delayedTasks: delayedCount,
        aheadTasks: aheadCount,
        onTrackTasks,
        averageDelay: delayedCount > 0 ? Math.round((totalDelay / delayedCount) * 100) / 100 : 0,
        maxDelay,
        projectDelay,
      },
    }
  }

  /**
   * 获取基线
   */
  getBaseline(baselineId: string): Baseline | undefined {
    return this.baselines.get(baselineId)
  }

  /**
   * 获取所有基线
   */
  getAllBaselines(): Baseline[] {
    return Array.from(this.baselines.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  /**
   * 删除基线
   */
  deleteBaseline(baselineId: string): boolean {
    if (this.activeBaselineId === baselineId) {
      this.activeBaselineId = null
    }
    return this.baselines.delete(baselineId)
  }

  /**
   * 设置活动基线
   */
  setActiveBaseline(baselineId: string | null): void {
    if (baselineId && !this.baselines.has(baselineId)) {
      throw new Error(`基线不存在: ${baselineId}`)
    }
    this.activeBaselineId = baselineId
  }

  /**
   * 获取活动基线
   */
  getActiveBaseline(): Baseline | null {
    return this.activeBaselineId
      ? this.baselines.get(this.activeBaselineId) || null
      : null
  }

  /**
   * 重命名基线
   */
  renameBaseline(baselineId: string, newName: string): Baseline | null {
    const baseline = this.baselines.get(baselineId)
    if (baseline) {
      baseline.name = newName
      return baseline
    }
    return null
  }

  /**
   * 获取基线统计信息
   */
  getBaselineStats(baselineId: string): BaselineStats | null {
    const baseline = this.baselines.get(baselineId)
    if (!baseline) return null

    const completedCount = baseline.tasks.filter(
      t => t.status === 'completed'
    ).length

    const totalPlannedDuration = baseline.tasks.reduce(
      (sum, t) => sum + t.plannedDuration,
      0
    )

    return {
      baselineId: baseline.id,
      baselineName: baseline.name,
      taskCount: baseline.tasks.length,
      completedCount,
      completionRate: baseline.tasks.length > 0
        ? Math.round((completedCount / baseline.tasks.length) * 10000) / 100
        : 0,
      averageTaskDuration: baseline.tasks.length > 0
        ? Math.round((totalPlannedDuration / baseline.tasks.length) * 100) / 100
        : 0,
      totalPlannedDuration,
    }
  }

  /**
   * 生成对比可视化数据
   */
  generateComparisonVisualization(
    comparison: BaselineComparison
  ): Array<{
    taskId: string
    taskName: string
    plannedBar: {
      x: number
      width: number
      color: string
    }
    actualBar: {
      x: number
      width: number
      color: string
    }
    variance: TaskVariance
  }> {
    const dayWidth = 40 // 每天的像素宽度
    const startX = 200 // 左侧任务列表宽度
    const baseDate = comparison.baseline.startDate

    return comparison.variances.map(variance => {
      const baselineTask = comparison.baseline.tasks.find(
        t => t.taskId === variance.taskId
      )
      const currentTask = comparison.currentTasks.find(
        t => t.id === variance.taskId
      )

      if (!baselineTask || !currentTask) return null

      const plannedStart = this.getDayDiff(baseDate, baselineTask.plannedStartDate)
      const plannedWidth = baselineTask.plannedDuration * dayWidth

      const actualStart = this.getDayDiff(baseDate, currentTask.startDate)
      const actualWidth = currentTask.duration * dayWidth

      return {
        taskId: variance.taskId,
        taskName: variance.taskName,
        plannedBar: {
          x: startX + plannedStart * dayWidth,
          width: plannedWidth,
          color: '#d9d9d9', // 灰色表示计划
        },
        actualBar: {
          x: startX + actualStart * dayWidth,
          width: actualWidth,
          color: variance.isDelayed
            ? '#ff4d4f' // 红色表示延期
            : variance.isAhead
              ? '#52c41a' // 绿色表示提前
              : '#1890ff', // 蓝色表示正常
        },
        variance,
      }
    }).filter(Boolean) as any[]
  }

  /**
   * 导出基线为JSON
   */
  exportBaseline(baselineId: string): string | null {
    const baseline = this.baselines.get(baselineId)
    if (!baseline) return null

    return JSON.stringify({
      ...baseline,
      createdAt: this.formatDate(baseline.createdAt),
      startDate: this.formatDate(baseline.startDate),
      endDate: this.formatDate(baseline.endDate),
      tasks: baseline.tasks.map(t => ({
        ...t,
        plannedStartDate: this.formatDate(t.plannedStartDate),
        plannedEndDate: this.formatDate(t.plannedEndDate),
        actualStartDate: t.actualStartDate
          ? this.formatDate(t.actualStartDate)
          : undefined,
        actualEndDate: t.actualEndDate
          ? this.formatDate(t.actualEndDate)
          : undefined,
      })),
    })
  }

  /**
   * 从JSON导入基线
   */
  importBaseline(json: string): Baseline {
    const data = JSON.parse(json)

    const baseline: Baseline = {
      ...data,
      createdAt: new Date(data.createdAt),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      tasks: data.tasks.map((t: any) => ({
        ...t,
        plannedStartDate: new Date(t.plannedStartDate),
        plannedEndDate: new Date(t.plannedEndDate),
        actualStartDate: t.actualStartDate
          ? new Date(t.actualStartDate)
          : undefined,
        actualEndDate: t.actualEndDate
          ? new Date(t.actualEndDate)
          : undefined,
      })),
    }

    this.baselines.set(baseline.id, baseline)
    return baseline
  }

  /**
   * 清空所有基线
   */
  clear(): void {
    this.baselines.clear()
    this.activeBaselineId = null
  }

  /**
   * 计算两个日期之间的天数差
   */
  private getDayDiff(start: Date, end: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.floor((end.getTime() - start.getTime()) / msPerDay)
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}

// 导出单例
export const baselineManager = new BaselineManager()
export default baselineManager
