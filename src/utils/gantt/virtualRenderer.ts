/**
 * 甘特图虚拟渲染管理器
 *
 * 核心优化：
 * 1. 只渲染可见区域的时间轴刻度
 * 2. 只渲染可见区域的任务节点
 * 3. 动态计算网格线数量
 * 4. 缓存渲染结果
 */

import type { GanttTask, GanttSection } from './parser/types'

export interface Viewport {
  x: number
  y: number
  width: number
  height: number
}

export interface RenderRange {
  startDay: number
  endDay: number
  startTaskIndex: number
  endTaskIndex: number
}

export class VirtualRenderer {
  private config = {
    dayWidth: 40,
    taskHeight: 32,
    taskSpacing: 8,
    sectionSpacing: 16,
    startX: 200,
    startY: 80,
    overscanDays: 3,      // 预渲染天数
    overscanTasks: 5,     // 预渲染任务数
  }

  private cache = new Map<string, any>()

  /**
   * 计算可见范围
   */
  calculateRenderRange(
    viewport: Viewport,
    tasks: GanttTask[],
    sections: GanttSection[],
    totalDays: number
  ): RenderRange {
    // 计算可见天数范围
    const startDay = Math.max(0, Math.floor((viewport.x - this.config.startX) / this.config.dayWidth) - this.config.overscanDays)
    const visibleDays = Math.ceil(viewport.width / this.config.dayWidth)
    const endDay = Math.min(totalDays, startDay + visibleDays + this.config.overscanDays * 2)

    // 计算可见任务范围
    const startTaskIndex = Math.max(0, Math.floor((viewport.y - this.config.startY) / (this.config.taskHeight + this.config.taskSpacing)) - this.config.overscanTasks)
    const visibleTasks = Math.ceil(viewport.height / (this.config.taskHeight + this.config.taskSpacing))
    const endTaskIndex = Math.min(tasks.length, startTaskIndex + visibleTasks + this.config.overscanTasks * 2)

    return {
      startDay,
      endDay,
      startTaskIndex,
      endTaskIndex,
    }
  }

  /**
   * 获取可见任务
   */
  getVisibleTasks(
    tasks: GanttTask[],
    range: RenderRange
  ): Array<{ task: GanttTask; index: number }> {
    const result: Array<{ task: GanttTask; index: number }> = []

    for (let i = range.startTaskIndex; i < range.endTaskIndex; i++) {
      if (i < tasks.length) {
        result.push({ task: tasks[i], index: i })
      }
    }

    return result
  }

  /**
   * 获取可见时间刻度
   */
  getVisibleTimeScale(
    range: RenderRange,
    view: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ): Array<{ day: number; label: string; type: 'day' | 'week' | 'month' }> {
    const result: Array<{ day: number; label: string; type: 'day' | 'week' | 'month' }> = []
    const cacheKey = `timescale-${view}-${range.startDay}-${range.endDay}`

    // 检查缓存
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    // 根据视图类型确定刻度间隔
    let interval = 1
    let labelType: 'day' | 'week' | 'month' = 'day'

    switch (view) {
      case 'day':
        interval = 1
        labelType = 'day'
        break
      case 'week':
        interval = 7
        labelType = 'week'
        break
      case 'month':
        interval = 30
        labelType = 'month'
        break
      case 'quarter':
        interval = 90
        labelType = 'month'
        break
      case 'year':
        interval = 365
        labelType = 'month'
        break
    }

    // 优化：根据屏幕宽度动态调整间隔
    const visibleDays = range.endDay - range.startDay
    if (visibleDays > 100 && view === 'day') {
      interval = 7  // 天视图但显示超过100天，改为周刻度
      labelType = 'week'
    }

    // 生成刻度
    for (let day = range.startDay; day <= range.endDay; day += interval) {
      const date = new Date()
      date.setDate(date.getDate() + day)

      let label = ''
      if (labelType === 'day') {
        label = `${date.getMonth() + 1}/${date.getDate()}`
      } else if (labelType === 'week') {
        label = `W${Math.ceil(day / 7)}`
      } else {
        label = `${date.getMonth() + 1}月`
      }

      result.push({ day, label, type: labelType })
    }

    // 保存缓存
    this.cache.set(cacheKey, result)

    return result
  }

  /**
   * 计算网格线位置（优化版）
   */
  calculateGridLines(
    range: RenderRange,
    view: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ): Array<{ x: number; type: 'major' | 'minor' }> {
    const result: Array<{ x: number; type: 'major' | 'minor' }> = []

    // 根据视图和可见范围确定网格线间隔
    let majorInterval = 1
    let minorInterval = 0

    switch (view) {
      case 'day':
        majorInterval = 7   // 每周一条主线
        minorInterval = 1   // 每天一条细线
        break
      case 'week':
        majorInterval = 4   // 每月一条主线
        minorInterval = 7   // 每周一条细线
        break
      case 'month':
        majorInterval = 3   // 每季度一条主线
        minorInterval = 30  // 每月一条细线
        break
      case 'quarter':
        majorInterval = 4   // 每年一条主线
        minorInterval = 90  // 每季度一条细线
        break
      case 'year':
        majorInterval = 1   // 每年一条主线
        minorInterval = 0   // 年视图不需要细线
        break
    }

    // 生成网格线
    for (let day = range.startDay; day <= range.endDay; day++) {
      const x = this.config.startX + day * this.config.dayWidth

      if (day % majorInterval === 0) {
        result.push({ x, type: 'major' })
      } else if (minorInterval > 0 && day % minorInterval === 0) {
        result.push({ x, type: 'minor' })
      }
    }

    return result
  }

  /**
   * 计算任务位置（带缓存）
   */
  calculateTaskLayout(
    task: GanttTask,
    startDate: Date,
    cacheKey?: string
  ): { x: number; y: number; width: number; height: number } {
    const key = cacheKey || `layout-${task.id}`

    // 检查缓存
    const cached = this.cache.get(key)
    if (cached) return cached

    const dayDiff = Math.floor((task.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const x = this.config.startX + dayDiff * this.config.dayWidth
    const width = task.duration * this.config.dayWidth
    const height = this.config.taskHeight

    const result = { x, y: 0, width, height }  // y需要外部计算

    // 保存缓存
    this.cache.set(key, result)

    return result
  }

  /**
   * 批量计算任务位置
   */
  batchCalculateLayouts(
    tasks: GanttTask[],
    startDate: Date
  ): Map<string, { x: number; y: number; width: number; height: number }> {
    const result = new Map<string, { x: number; y: number; width: number; height: number }>()

    let currentY = this.config.startY + this.config.sectionSpacing

    tasks.forEach((task, index) => {
      const layout = this.calculateTaskLayout(task, startDate, `layout-${task.id}-${index}`)
      layout.y = currentY
      result.set(task.id, layout)
      currentY += this.config.taskHeight + this.config.taskSpacing
    })

    return result
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 设置配置
   */
  setConfig(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config }
    this.clearCache()
  }

  /**
   * 获取配置
   */
  getConfig() {
    return { ...this.config }
  }
}

// 导出单例
export const virtualRenderer = new VirtualRenderer()
export default virtualRenderer
