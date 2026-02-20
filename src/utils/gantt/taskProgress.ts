/**
 * 任务进度管理模块
 *
 * 核心功能：
 * 1. 任务进度计算和更新
 * 2. 进度历史记录
 * 3. 进度统计和分析
 * 4. 预计完成时间计算
 */

import type { GanttTask } from './parser/types'

export interface TaskProgress {
  taskId: string
  percent: number // 0-100
  completedHours: number
  totalHours: number
  lastUpdated: Date
  updatedBy?: string
  note?: string
}

export interface ProgressHistoryEntry {
  date: Date
  oldPercent: number
  newPercent: number
  updatedBy?: string
  note?: string
}

export interface ProgressStats {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  notStartedTasks: number
  averageProgress: number
  weightedProgress: number // 按工期加权的进度
  estimatedCompletionDate: Date | null
}

export class TaskProgressManager {
  private progressMap = new Map<string, TaskProgress>()
  private historyMap = new Map<string, ProgressHistoryEntry[]>()

  /**
   * 设置任务进度
   */
  setProgress(
    taskId: string,
    percent: number,
    options?: {
      totalHours?: number
      updatedBy?: string
      note?: string
    }
  ): TaskProgress {
    // 限制进度范围
    const clampedPercent = Math.max(0, Math.min(100, percent))

    // 获取旧进度
    const oldProgress = this.progressMap.get(taskId)
    const oldPercent = oldProgress?.percent || 0

    // 创建新进度记录
    const progress: TaskProgress = {
      taskId,
      percent: clampedPercent,
      completedHours: options?.totalHours
        ? (clampedPercent / 100) * options.totalHours
        : 0,
      totalHours: options?.totalHours || 0,
      lastUpdated: new Date(),
      updatedBy: options?.updatedBy,
      note: options?.note,
    }

    // 保存进度
    this.progressMap.set(taskId, progress)

    // 记录历史
    if (oldPercent !== clampedPercent) {
      this.addHistoryEntry(taskId, {
        date: new Date(),
        oldPercent,
        newPercent: clampedPercent,
        updatedBy: options?.updatedBy,
        note: options?.note,
      })
    }

    return progress
  }

  /**
   * 获取任务进度
   */
  getProgress(taskId: string): TaskProgress | undefined {
    return this.progressMap.get(taskId)
  }

  /**
   * 批量更新进度
   */
  batchUpdateProgress(
    updates: Array<{
      taskId: string
      percent: number
      options?: {
        totalHours?: number
        updatedBy?: string
        note?: string
      }
    }>
  ): TaskProgress[] {
    return updates.map(update =>
      this.setProgress(update.taskId, update.percent, update.options)
    )
  }

  /**
   * 增加进度
   */
  increaseProgress(
    taskId: string,
    delta: number,
    options?: {
      updatedBy?: string
      note?: string
    }
  ): TaskProgress | undefined {
    const current = this.progressMap.get(taskId)
    if (current) {
      return this.setProgress(taskId, current.percent + delta, {
        totalHours: current.totalHours,
        ...options,
      })
    }
    return undefined
  }

  /**
   * 获取进度历史
   */
  getProgressHistory(taskId: string): ProgressHistoryEntry[] {
    return this.historyMap.get(taskId) || []
  }

  /**
   * 添加历史记录
   */
  private addHistoryEntry(
    taskId: string,
    entry: ProgressHistoryEntry
  ): void {
    const history = this.historyMap.get(taskId) || []
    history.push(entry)
    this.historyMap.set(taskId, history)
  }

  /**
   * 计算项目进度统计
   */
  calculateProgressStats(tasks: GanttTask[]): ProgressStats {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => {
      const progress = this.progressMap.get(t.id)
      return progress?.percent === 100 || t.status === 'done'
    }).length

    const inProgressTasks = tasks.filter(t => {
      const progress = this.progressMap.get(t.id)
      return (progress && progress.percent > 0 && progress.percent < 100) || t.status === 'active'
    }).length

    const notStartedTasks = totalTasks - completedTasks - inProgressTasks

    // 计算平均进度
    const totalProgress = tasks.reduce((sum, task) => {
      const progress = this.progressMap.get(task.id)
      return sum + (progress?.percent || this.getDefaultProgress(task))
    }, 0)
    const averageProgress = totalTasks > 0 ? totalProgress / totalTasks : 0

    // 计算按工期加权的进度
    const totalDuration = tasks.reduce((sum, t) => sum + t.duration, 0)
    const weightedProgress =
      totalDuration > 0
        ? tasks.reduce((sum, task) => {
            const progress = this.progressMap.get(task.id)
            const percent = progress?.percent || this.getDefaultProgress(task)
            return sum + (percent * task.duration) / totalDuration
          }, 0)
        : 0

    // 计算预计完成时间
    const estimatedCompletionDate = this.calculateEstimatedCompletionDate(
      tasks,
      weightedProgress
    )

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      averageProgress: Math.round(averageProgress * 100) / 100,
      weightedProgress: Math.round(weightedProgress * 100) / 100,
      estimatedCompletionDate,
    }
  }

  /**
   * 获取默认进度（基于状态）
   */
  private getDefaultProgress(task: GanttTask): number {
    switch (task.status) {
      case 'done':
        return 100
      case 'active':
        return 50
      default:
        return 0
    }
  }

  /**
   * 计算预计完成时间
   */
  private calculateEstimatedCompletionDate(
    tasks: GanttTask[],
    weightedProgress: number
  ): Date | null {
    if (weightedProgress >= 100) {
      // 已完成，返回最后任务的结束时间
      const lastTask = tasks.reduce((latest, task) => {
        return task.endDate > latest.endDate ? task : latest
      }, tasks[0])
      return lastTask?.endDate || null
    }

    if (weightedProgress <= 0) {
      return null
    }

    // 根据当前进度和剩余工作量估算
    const remainingProgress = 100 - weightedProgress
    const daysElapsed = this.calculateDaysElapsed(tasks)
    const estimatedTotalDays = (daysElapsed / weightedProgress) * 100
    const remainingDays = estimatedTotalDays - daysElapsed

    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + Math.ceil(remainingDays))

    return estimatedDate
  }

  /**
   * 计算已过去的天数
   */
  private calculateDaysElapsed(tasks: GanttTask[]): number {
    const now = new Date()
    const startedTasks = tasks.filter(t => t.startDate <= now)

    if (startedTasks.length === 0) return 0

    const earliestStart = startedTasks.reduce((earliest, task) => {
      return task.startDate < earliest ? task.startDate : earliest
    }, startedTasks[0].startDate)

    return Math.max(0, Math.floor((now.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24)))
  }

  /**
   * 生成进度报告
   */
  generateProgressReport(tasks: GanttTask[]): string {
    const stats = this.calculateProgressStats(tasks)

    return `# 项目进度报告

生成时间: ${new Date().toLocaleString('zh-CN')}

## 总体进度

- 总任务数: ${stats.totalTasks}
- 已完成: ${stats.completedTasks} (${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%)
- 进行中: ${stats.inProgressTasks} (${Math.round((stats.inProgressTasks / stats.totalTasks) * 100)}%)
- 未开始: ${stats.notStartedTasks} (${Math.round((stats.notStartedTasks / stats.totalTasks) * 100)}%)
- 平均进度: ${stats.averageProgress}%
- 加权进度: ${stats.weightedProgress}%
${stats.estimatedCompletionDate ? `- 预计完成: ${stats.estimatedCompletionDate.toLocaleDateString('zh-CN')}` : ''}

## 任务详情

${tasks
  .map(task => {
    const progress = this.progressMap.get(task.id)
    const percent = progress?.percent || this.getDefaultProgress(task)
    const bar = this.generateProgressBar(percent, 20)
    return `- ${task.name}: ${bar} ${percent}%`
  })
  .join('\n')}
`
  }

  /**
   * 生成进度条字符串
   */
  private generateProgressBar(percent: number, width: number = 20): string {
    const filled = Math.round((percent / 100) * width)
    const empty = width - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
  }

  /**
   * 清除所有进度数据
   */
  clear(): void {
    this.progressMap.clear()
    this.historyMap.clear()
  }

  /**
   * 导出进度数据
   */
  exportData(): {
    progress: TaskProgress[]
    history: Record<string, ProgressHistoryEntry[]>
  } {
    const history: Record<string, ProgressHistoryEntry[]> = {}
    this.historyMap.forEach((entries, taskId) => {
      history[taskId] = entries
    })

    return {
      progress: Array.from(this.progressMap.values()),
      history,
    }
  }

  /**
   * 导入进度数据
   */
  importData(data: {
    progress: TaskProgress[]
    history: Record<string, ProgressHistoryEntry[]>
  }): void {
    this.clear()

    data.progress.forEach(p => {
      this.progressMap.set(p.taskId, {
        ...p,
        lastUpdated: new Date(p.lastUpdated),
      })
    })

    Object.entries(data.history).forEach(([taskId, entries]) => {
      this.historyMap.set(
        taskId,
        entries.map(e => ({
          ...e,
          date: new Date(e.date),
        }))
      )
    })
  }
}

// 导出单例
export const taskProgressManager = new TaskProgressManager()
export default taskProgressManager
