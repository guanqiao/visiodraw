/**
 * 甘特图视口管理器
 *
 * 核心功能：
 * 1. 时间轴缩放（日/周/月/季度/年视图）
 * 2. 今日标记线
 * 3. 视口平移和导航
 * 4. 缩放动画
 */

import type { Graph } from '@antv/x6'

export type ViewMode = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface ViewportConfig {
  minDayWidth: number
  maxDayWidth: number
  defaultDayWidth: number
  animationDuration: number
}

export interface ViewportState {
  viewMode: ViewMode
  dayWidth: number
  scrollX: number
  scrollY: number
  startDate: Date
  endDate: Date
}

export class GanttViewportManager {
  private graph: Graph | null = null
  private config: ViewportConfig
  private state: ViewportState

  // 视图模式对应的默认天宽度
  private static VIEW_MODE_DAY_WIDTHS: Record<ViewMode, number> = {
    day: 40,
    week: 20,
    month: 8,
    quarter: 3,
    year: 1,
  }

  // 视图模式对应的最小/最大天宽度
  private static VIEW_MODE_LIMITS: Record<ViewMode, { min: number; max: number }> = {
    day: { min: 20, max: 100 },
    week: { min: 10, max: 50 },
    month: { min: 4, max: 20 },
    quarter: { min: 2, max: 8 },
    year: { min: 0.5, max: 3 },
  }

  constructor(config?: Partial<ViewportConfig>) {
    this.config = {
      minDayWidth: 5,
      maxDayWidth: 100,
      defaultDayWidth: 40,
      animationDuration: 300,
      ...config,
    }

    this.state = {
      viewMode: 'day',
      dayWidth: this.config.defaultDayWidth,
      scrollX: 0,
      scrollY: 0,
      startDate: new Date(),
      endDate: new Date(),
    }
  }

  /**
   * 绑定到 X6 Graph 实例
   */
  bind(graph: Graph): void {
    this.graph = graph
    this.setupEventListeners()
  }

  /**
   * 解绑
   */
  unbind(): void {
    if (this.graph) {
      this.graph.off('scale', this.onScale)
    }
    this.graph = null
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    if (!this.graph) return
    this.graph.on('scale', this.onScale)
  }

  /**
   * 缩放事件处理
   */
  private onScale = (args: { sx: number; sy: number }): void => {
    // 可以在这里处理缩放事件
  }

  /**
   * 切换视图模式
   */
  setViewMode(mode: ViewMode): void {
    const oldMode = this.state.viewMode
    this.state.viewMode = mode

    // 计算新的天宽度
    const newDayWidth = GanttViewportManager.VIEW_MODE_DAY_WIDTHS[mode]
    this.setDayWidth(newDayWidth)

    // 触发重绘
    this.onViewportChanged?.(oldMode, mode)
  }

  /**
   * 获取当前视图模式
   */
  getViewMode(): ViewMode {
    return this.state.viewMode
  }

  /**
   * 设置天宽度
   */
  setDayWidth(width: number): void {
    const limits = GanttViewportManager.VIEW_MODE_LIMITS[this.state.viewMode]
    const clampedWidth = Math.max(limits.min, Math.min(limits.max, width))
    
    this.state.dayWidth = clampedWidth
    this.onDayWidthChanged?.(clampedWidth)
  }

  /**
   * 获取当前天宽度
   */
  getDayWidth(): number {
    return this.state.dayWidth
  }

  /**
   * 放大
   */
  zoomIn(): void {
    const zoomFactor = 1.2
    const newWidth = this.state.dayWidth * zoomFactor
    this.setDayWidth(newWidth)
  }

  /**
   * 缩小
   */
  zoomOut(): void {
    const zoomFactor = 0.8
    const newWidth = this.state.dayWidth * zoomFactor
    this.setDayWidth(newWidth)
  }

  /**
   * 适应屏幕
   */
  fitToScreen(): void {
    if (!this.graph) return

    const container = this.graph.container
    const containerWidth = container.clientWidth
    
    // 计算需要的天宽度以适应屏幕
    const totalDays = this.getTotalDays()
    const availableWidth = containerWidth - 200 // 减去左侧任务列表宽度
    const newDayWidth = availableWidth / totalDays

    this.setDayWidth(newDayWidth)
  }

  /**
   * 滚动到指定日期
   */
  scrollToDate(date: Date): void {
    if (!this.graph) return

    const dayDiff = this.getDayDiff(this.state.startDate, date)
    const x = 200 + dayDiff * this.state.dayWidth // 200是左侧任务列表宽度

    const container = this.graph.container
    container.scrollLeft = x - container.clientWidth / 2
  }

  /**
   * 滚动到今天
   */
  scrollToToday(): void {
    this.scrollToDate(new Date())
  }

  /**
   * 生成今日标记线
   */
  generateTodayMarker(): {
    id: string
    type: string
    x: number
    y: number
    width: number
    height: number
    stroke: string
    strokeWidth: number
    dashArray: string
    zIndex: number
  } {
    const today = new Date()
    const dayDiff = this.getDayDiff(this.state.startDate, today)
    const x = 200 + dayDiff * this.state.dayWidth + this.state.dayWidth / 2

    return {
      id: 'gantt-today-marker',
      type: 'uml-line',
      x,
      y: 30, // 从时间轴下方开始
      width: 1,
      height: 2000, // 足够长以覆盖整个甘特图
      stroke: '#1890ff',
      strokeWidth: 2,
      dashArray: '5,5',
      zIndex: 100,
    }
  }

  /**
   * 生成今日标签
   */
  generateTodayLabel(): {
    id: string
    type: string
    x: number
    y: number
    width: number
    height: number
    text: string
    fill: string
    stroke: string
    fontSize: number
    color: string
    zIndex: number
  } {
    const today = new Date()
    const dayDiff = this.getDayDiff(this.state.startDate, today)
    const x = 200 + dayDiff * this.state.dayWidth

    return {
      id: 'gantt-today-label',
      type: 'uml-label',
      x: x - 30,
      y: 10,
      width: 60,
      height: 20,
      text: '今天',
      fill: '#1890ff',
      stroke: 'transparent',
      fontSize: 11,
      color: '#ffffff',
      zIndex: 101,
    }
  }

  /**
   * 设置日期范围
   */
  setDateRange(startDate: Date, endDate: Date): void {
    this.state.startDate = new Date(startDate)
    this.state.endDate = new Date(endDate)
  }

  /**
   * 获取日期范围
   */
  getDateRange(): { startDate: Date; endDate: Date } {
    return {
      startDate: new Date(this.state.startDate),
      endDate: new Date(this.state.endDate),
    }
  }

  /**
   * 计算两个日期之间的天数差
   */
  private getDayDiff(start: Date, end: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24
    return Math.floor((end.getTime() - start.getTime()) / msPerDay)
  }

  /**
   * 获取总天数
   */
  private getTotalDays(): number {
    return this.getDayDiff(this.state.startDate, this.state.endDate)
  }

  /**
   * 视口变化回调
   */
  onViewportChanged?: (oldMode: ViewMode, newMode: ViewMode) => void

  /**
   * 天宽度变化回调
   */
  onDayWidthChanged?: (dayWidth: number) => void

  /**
   * 获取当前状态
   */
  getState(): ViewportState {
    return { ...this.state }
  }

  /**
   * 重置视口
   */
  reset(): void {
    this.state = {
      viewMode: 'day',
      dayWidth: this.config.defaultDayWidth,
      scrollX: 0,
      scrollY: 0,
      startDate: new Date(),
      endDate: new Date(),
    }
    this.onDayWidthChanged?.(this.config.defaultDayWidth)
  }
}

// 导出单例
export const ganttViewportManager = new GanttViewportManager()
export default ganttViewportManager
