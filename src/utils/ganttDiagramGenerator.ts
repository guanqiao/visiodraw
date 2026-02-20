/**
 * 甘特图生成器
 * 将解析后的甘特图数据生成 X6 图形节点和边
 *
 * 核心设计：
 * 1. 左侧显示任务/分组名称
 * 2. 顶部显示时间轴刻度
 * 3. 任务以水平条形显示，长度表示持续时间
 * 4. 里程碑以菱形显示
 * 5. 依赖关系以箭头连线表示
 */

import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector } from '../types/connection'
import { v4 as uuidv4 } from 'uuid'
import { criticalPathCalculator, type TaskTimeData } from './gantt/criticalPath'
import { workCalendar, WorkCalendar } from './gantt/workCalendar'

/** 布局常量 */
const LAYOUT_CONSTANTS = {
  TASK_X_OFFSET: 2,            // 任务条x偏移
  PROGRESS_BAR_HEIGHT: 4,      // 进度条高度
  CORNER_RADIUS: 4,            // 圆角半径
  HIGHLIGHT_PADDING: 2,        // 高亮边框内边距
  HIGHLIGHT_STROKE_ADD: 4,     // 高亮边框宽度增加
  LABEL_Y_OFFSET: 6,           // 标签y偏移
  LABEL_HEIGHT: 20,            // 标签高度
  LABEL_X: 10,                 // 标签x位置
  PROGRESS_BAR_Y_OFFSET: 4,    // 进度条y偏移
  // 新增：图例相关常量
  LEGEND_X_PADDING: 20,         // 图例x偏移
  LEGEND_TITLE_WIDTH: 120,      // 图例标题宽度
  LEGEND_TITLE_HEIGHT: 20,       // 图例标题高度
  LEGEND_TITLE_Y_OFFSET: 30,    // 图例标题y偏移
  LEGEND_ITEM_WIDTH: 16,        // 图例项宽度
  LEGEND_ITEM_HEIGHT: 16,       // 图例项高度
  LEGEND_ITEM_SPACING: 25,       // 图例项间距
  LEGEND_LABEL_SPACING: 24,      // 图例标签间距
  LEGEND_TEXT_WIDTH: 100,       // 图例文本宽度
  LEGEND_ITEM_CORNER_RADIUS: 2, // 图例项圆角
  LEGEND_STROKE_WIDTH: 1,        // 图例边框宽度
  // 新增：其他常量
  TASK_LABEL_PADDING: 20,        // 任务标签内边距
  PROGRESS_BAR_CORNER_RADIUS: 2, // 进度条圆角
  HIGHLIGHT_STROKE_WIDTH: 3,      // 高亮边框宽度
  // 新增：浮动时间标签常量
  FLOAT_LABEL_X_PADDING: 5,        // 浮动时间x偏移
  FLOAT_LABEL_WIDTH: 60,            // 浮动时间标签宽度
  FLOAT_LABEL_HEIGHT: 16,           // 浮动时间标签高度
  // 新增：zIndex 层级常量
  Z_INDEX_TASK: 10,
  Z_INDEX_PROGRESS: 11,
  Z_INDEX_LABEL: 10,
  Z_INDEX_MILESTONE: 10,
  Z_INDEX_DEPENDENCY_CRITICAL: 9,
  Z_INDEX_DEPENDENCY_NORMAL: 8,
  Z_INDEX_HIGHLIGHT: 12,
  Z_INDEX_FLOAT_LABEL: 15,
  // 新增：时间轴刻度常量
  TIMELINE_TICK_HEIGHT_SHORT: 5,
  TIMELINE_TICK_HEIGHT_MEDIUM: 8,
  TIMELINE_TICK_HEIGHT_LONG: 10,
  TIMELINE_TICK_Y_OFFSET: 5,
  TIMELINE_LABEL_WIDTH: 40,
  TIMELINE_LABEL_HEIGHT: 20,
  TIMELINE_LABEL_Y_OFFSET: 5,
  // 新增：标题常量
  TITLE_X: 20,
  TITLE_Y: 20,
  TITLE_WIDTH: 300,
  TITLE_HEIGHT: 30,
  TITLE_FONT_SIZE: 18,
  // 新增：分组常量
  SECTION_HEADER_X: 10,
  SECTION_HEADER_WIDTH_OFFSET: 20,
  SECTION_Z_INDEX: 5,
  // 新增：标签字体大小
  LABEL_FONT_SIZE: 12,
  // 新增：关键路径信息标签常量
  CRITICAL_INFO_X: 200,
  CRITICAL_INFO_Y: 20,
  CRITICAL_INFO_WIDTH: 300,
  CRITICAL_INFO_HEIGHT: 24,
  CRITICAL_INFO_FONT_SIZE: 12,
  // 新增：背景层zIndex
  Z_INDEX_BACKGROUND: 0,
  Z_INDEX_GRID: 0,
  Z_INDEX_TIMELINE: 1,
  Z_INDEX_TIMELINE_TICK: 2,
  Z_INDEX_TIMELINE_LABEL: 2,
} as const

export type TaskStatus = 'done' | 'active' | 'crit' | 'default'
export type TaskType = 'task' | 'milestone' | 'section'

export interface GanttTask {
  id: string
  name: string
  type: TaskType
  status: TaskStatus
  startDate: Date
  endDate: Date
  duration: number
  section?: string
  dependencies: string[]
  order: number
  assignee?: string
  progress?: number
  tags?: string[]
  project?: string
}

export interface GanttSection {
  id: string
  name: string
  order: number
}

export interface GanttProject {
  id: string
  name: string
  color: string
  order: number
}

export type TimelineView = 'day' | 'week' | 'month'

export interface ParsedGanttDiagram {
  title?: string
  dateFormat: string
  sections: GanttSection[]
  tasks: GanttTask[]
  projects?: GanttProject[]
  startDate: Date
  endDate: Date
  view?: TimelineView
  showCriticalPath?: boolean  // 是否显示关键路径
  workCalendar?: WorkCalendar // 工作日历配置
}

// 重新导出类型供其他模块使用
export type { GanttTask as GanttTaskType, GanttSection as GanttSectionType }

export interface GeneratedGanttDiagram {
  nodes: ShapeData[]
  edges: Connector[]
}

interface LayoutConfig {
  startX: number
  startY: number
  headerHeight: number
  sectionWidth: number
  taskHeight: number
  taskSpacing: number
  sectionSpacing: number
  dayWidth: number
  milestoneSize: number
  timelineHeight: number
}

interface TaskLayout {
  task: GanttTask
  x: number
  y: number
  width: number
  height: number
}

export class GanttDiagramGenerator {
  private config: LayoutConfig = {
    startX: 200,
    startY: 80,
    headerHeight: 40,
    sectionWidth: 180,
    taskHeight: 32,
    taskSpacing: 8,
    sectionSpacing: 16,
    dayWidth: 40,
    milestoneSize: 16,
    timelineHeight: 30,
  }

  private currentView: TimelineView = 'day'

  private styles = {
    section: {
      fill: '#f0f5ff',
      stroke: '#2f54eb',
      strokeWidth: 1,
      fontSize: 14,
      fontWeight: 600,
      color: '#1d39c4',
    },
    task: {
      default: {
        fill: '#f5f5f5',
        stroke: '#d9d9d9',
        strokeWidth: 1,
        fontSize: 12,
        color: '#262626',
      },
      done: {
        fill: '#b7eb8f',
        stroke: '#52c41a',
        strokeWidth: 1,
        fontSize: 12,
        color: '#237804',
      },
      active: {
        fill: '#91d5ff',
        stroke: '#1890ff',
        strokeWidth: 2,
        fontSize: 12,
        color: '#096dd9',
      },
      crit: {
        fill: '#ffa39e',
        stroke: '#f5222d',
        strokeWidth: 2,
        fontSize: 12,
        color: '#cf1322',
      },
    },
    milestone: {
      done: {
        fill: '#52c41a',
        stroke: '#237804',
        strokeWidth: 2,
      },
      default: {
        fill: '#faad14',
        stroke: '#d48806',
        strokeWidth: 2,
      },
    },
    timeline: {
      fill: '#fafafa',
      stroke: '#e8e8e8',
      strokeWidth: 1,
      fontSize: 11,
      color: '#595959',
    },
    grid: {
      stroke: '#f0f0f0',
      strokeWidth: 1,
    },
    dependency: {
      stroke: '#8c8c8c',
      strokeWidth: 1.5,
      arrowSize: 6,
    },
  }

  private taskLayouts: Map<string, TaskLayout> = new Map()
  private totalDays: number = 0
  private criticalPathData: Map<string, TaskTimeData> = new Map()
  private currentCalendar: WorkCalendar = workCalendar

  // 计算缓存
  private layoutCache = new Map<string, {
    data: ParsedGanttDiagram
    result: GeneratedGanttDiagram
    timestamp: number
  }>()
  private readonly CACHE_MAX_SIZE = 5
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5分钟

  // 样式缓存
  private styleCache = new Map<string, any>()

  // 新增：缓存 sectionMap 和 calculateTotalHeight
  private cachedSectionMap: Map<string, GanttTask[]> | null = null
  private cachedTotalHeight: number | null = null
  private milestoneStyleCache = new Map<string, any>()

  /**
   * 获取任务样式（带缓存）
   */
  private getTaskStyle(task: GanttTask, isCritical: boolean): any {
    const cacheKey = `${task.status}-${isCritical}`
    const cached = this.styleCache.get(cacheKey)
    if (cached) return cached

    let style = this.styles.task[task.status] || this.styles.task.default
    if (isCritical && task.status !== 'crit') {
      style = { ...style, stroke: '#f5222d', strokeWidth: 2 }
    }

    this.styleCache.set(cacheKey, style)
    return style
  }

  /**
   * 获取里程碑样式（带缓存）
   */
  private getMilestoneStyle(status: TaskStatus): any {
    const cached = this.milestoneStyleCache.get(status)
    if (cached) return cached
    const style = status === 'done' ? this.styles.milestone.done : this.styles.milestone.default
    this.milestoneStyleCache.set(status, style)
    return style
  }

  /**
   * 通用标签生成方法
   */
  private createLabelNode(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    options?: {
      fill?: string
      stroke?: string
      fontSize?: number
      fontWeight?: number
      color?: string
      textAlign?: 'left' | 'center' | 'right'
      zIndex?: number
    }
  ): ShapeData {
    return {
      id,
      type: 'uml-label',
      x,
      y,
      width,
      height,
      text,
      fill: options?.fill ?? 'transparent',
      stroke: options?.stroke ?? 'transparent',
      fontSize: options?.fontSize ?? LAYOUT_CONSTANTS.LABEL_FONT_SIZE,
      fontWeight: options?.fontWeight,
      color: options?.color ?? '#262626',
      textAlign: options?.textAlign ?? 'left',
      zIndex: options?.zIndex ?? LAYOUT_CONSTANTS.Z_INDEX_LABEL,
    }
  }

  /**
   * 释放资源，防止内存泄漏
   * 在组件卸载或重新生成前调用
   */
  dispose(): void {
    this.taskLayouts.clear()
    this.criticalPathData.clear()
    this.currentCalendar = workCalendar
    this.totalDays = 0
    this.currentView = 'day'
    this.layoutCache.clear()
    this.styleCache.clear()
    // 新增：清理新缓存
    this.cachedSectionMap = null
    this.cachedTotalHeight = null
    this.milestoneStyleCache.clear()
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(data: ParsedGanttDiagram): string {
    // 基于关键属性生成缓存键
    const keyParts = [
      data.title || '',
      data.tasks.length,
      data.tasks.map(t => `${t.id}-${t.status}-${t.progress}`).join(','),
      data.view || 'day',
      data.showCriticalPath ? '1' : '0',
    ]
    return keyParts.join('|')
  }

  /**
   * 检查缓存是否有效
   */
  private getCachedResult(key: string): GeneratedGanttDiagram | null {
    const cached = this.layoutCache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.CACHE_TTL) {
      // 缓存过期
      this.layoutCache.delete(key)
      return null
    }

    return cached.result
  }

  /**
   * 保存结果到缓存
   */
  private setCachedResult(key: string, data: ParsedGanttDiagram, result: GeneratedGanttDiagram): void {
    // 清理过期缓存
    const now = Date.now()
    for (const [k, v] of this.layoutCache.entries()) {
      if (now - v.timestamp > this.CACHE_TTL) {
        this.layoutCache.delete(k)
      }
    }

    // 如果缓存已满，删除最旧的
    if (this.layoutCache.size >= this.CACHE_MAX_SIZE) {
      const oldestKey = this.layoutCache.keys().next().value
      this.layoutCache.delete(oldestKey)
    }

    // 保存新缓存
    this.layoutCache.set(key, {
      data: JSON.parse(JSON.stringify(data)), // 深拷贝
      result: JSON.parse(JSON.stringify(result)), // 深拷贝
      timestamp: now,
    })
  }

  generate(data: ParsedGanttDiagram): GeneratedGanttDiagram {
    // 清理本次渲染的缓存
    this.cachedSectionMap = null
    this.cachedTotalHeight = null

    // 检查缓存
    const cacheKey = this.generateCacheKey(data)
    const cached = this.getCachedResult(cacheKey)
    if (cached) {
      console.log('[Gantt] 使用缓存结果')
      return cached
    }

    const nodes: ShapeData[] = []
    const edges: Connector[] = []

    // 设置视图模式
    this.currentView = data.view || 'day'
    this.applyViewConfig()

    // 设置工作日历
    this.currentCalendar = data.workCalendar || workCalendar

    // 计算关键路径（如果启用）
    if (data.showCriticalPath) {
      const cpResult = criticalPathCalculator.calculate(data.tasks)
      this.criticalPathData = cpResult.taskTimes
    } else {
      this.criticalPathData.clear()
    }

    // 计算布局
    this.calculateLayout(data)

    // 1. 生成时间轴背景
    this.generateTimelineBackground(data, nodes)

    // 2. 生成时间轴刻度
    this.generateTimelineScale(data, nodes)

    // 3. 生成网格线
    this.generateGridLines(data, nodes)

    // 4. 生成标题
    if (data.title) {
      this.generateTitle(data.title, nodes)
    }

    // 5. 生成分组和任务
    this.generateSectionsAndTasks(data, nodes)

    // 6. 生成依赖关系
    this.generateDependencies(data, edges)

    // 7. 生成项目图例（多项目模式）
    if (data.projects && data.projects.length > 0) {
      this.generateProjectLegend(data.projects, nodes)
    }

    // 8. 生成关键路径高亮（如果启用）
    if (data.showCriticalPath) {
      this.generateCriticalPathHighlight(data, nodes, edges)
    }

    return { nodes, edges }
  }

  private applyViewConfig(): void {
    switch (this.currentView) {
      case 'week':
        this.config.dayWidth = 20
        break
      case 'month':
        this.config.dayWidth = 8
        break
      case 'day':
      default:
        this.config.dayWidth = 40
        break
    }
  }

  private calculateLayout(data: ParsedGanttDiagram): void {
    this.taskLayouts.clear()

    // 计算总天数
    const timeDiff = data.endDate.getTime() - data.startDate.getTime()
    this.totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1

    let currentY = this.config.startY + this.config.timelineHeight

    // 按分组组织任务
    const sectionMap = new Map<string, GanttTask[]>()
    data.tasks.forEach(task => {
      const section = task.section || 'default'
      if (!sectionMap.has(section)) {
        sectionMap.set(section, [])
      }
      sectionMap.get(section)!.push(task)
    })

    // 保存到缓存
    this.cachedSectionMap = sectionMap

    // 计算每个任务的布局
    data.sections.forEach(section => {
      const sectionTasks = sectionMap.get(section.name) || []

      sectionTasks.forEach(task => {
        const startOffset = Math.ceil(
          (task.startDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        const duration = Math.max(task.duration, 1)

        const x = this.config.startX + startOffset * this.config.dayWidth
        const width = duration * this.config.dayWidth

        this.taskLayouts.set(task.id, {
          task,
          x,
          y: currentY,
          width: Math.max(width - 4, this.config.milestoneSize),
          height: this.config.taskHeight,
        })

        currentY += this.config.taskHeight + this.config.taskSpacing
      })

      currentY += this.config.sectionSpacing
    })
  }

  private generateTimelineBackground(data: ParsedGanttDiagram, nodes: ShapeData[]): void {
    const totalWidth = this.totalDays * this.config.dayWidth
    const totalHeight = this.calculateTotalHeight(data)

    // 时间轴头部背景
    nodes.push({
      id: 'timeline-header-bg',
      type: 'uml-rect',
      x: this.config.startX,
      y: this.config.startY,
      width: totalWidth,
      height: this.config.timelineHeight,
      text: '',
      fill: this.styles.timeline.fill,
      stroke: this.styles.timeline.stroke,
      strokeWidth: this.styles.timeline.strokeWidth,
      zIndex: LAYOUT_CONSTANTS.Z_INDEX_TIMELINE,
    })

    // 左侧分组列背景
    nodes.push({
      id: 'section-column-bg',
      type: 'uml-rect',
      x: 0,
      y: this.config.startY,
      width: this.config.startX,
      height: totalHeight,
      text: '',
      fill: '#fafafa',
      stroke: '#e8e8e8',
      strokeWidth: 1,
      zIndex: LAYOUT_CONSTANTS.Z_INDEX_TIMELINE,
    })
  }

  private generateTimelineScale(data: ParsedGanttDiagram, nodes: ShapeData[]): void {
    const dateFormat = this.getDateFormat(data.dateFormat)

    for (let i = 0; i <= this.totalDays; i++) {
      const date = new Date(data.startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const x = this.config.startX + i * this.config.dayWidth

      // 根据视图模式决定是否显示刻度
      const shouldShowTick = this.shouldShowTick(i, date)
      const shouldShowLabel = this.shouldShowLabel(i, date)

      if (shouldShowTick) {
        // 日期刻度线
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const isFirstDayOfMonth = date.getDate() === 1
        const isFirstDayOfWeek = date.getDay() === 1

        nodes.push({
          id: `timeline-tick-${i}`,
          type: 'uml-line',
          x: x,
          y: this.config.startY + this.config.timelineHeight - LAYOUT_CONSTANTS.TIMELINE_TICK_Y_OFFSET,
          width: 1,
          height: isFirstDayOfMonth ? LAYOUT_CONSTANTS.TIMELINE_TICK_HEIGHT_LONG : (isFirstDayOfWeek ? LAYOUT_CONSTANTS.TIMELINE_TICK_HEIGHT_MEDIUM : LAYOUT_CONSTANTS.TIMELINE_TICK_HEIGHT_SHORT),
          text: '',
          stroke: isWeekend ? '#ff4d4f' : '#bfbfbf',
          strokeWidth: 1,
          zIndex: LAYOUT_CONSTANTS.Z_INDEX_TIMELINE_TICK,
        })

        // 日期标签
        if (shouldShowLabel) {
          nodes.push(
            this.createLabelNode(
              `timeline-label-${i}`,
              x - LAYOUT_CONSTANTS.TIMELINE_LABEL_WIDTH / 2,
              this.config.startY + LAYOUT_CONSTANTS.TIMELINE_LABEL_Y_OFFSET,
              LAYOUT_CONSTANTS.TIMELINE_LABEL_WIDTH,
              LAYOUT_CONSTANTS.TIMELINE_LABEL_HEIGHT,
              dateFormat(date),
              {
                fontSize: this.styles.timeline.fontSize,
                color: isWeekend ? '#ff4d4f' : this.styles.timeline.color,
                zIndex: LAYOUT_CONSTANTS.Z_INDEX_TIMELINE_LABEL,
              }
            )
          )
        }
      }

      // 周末背景色（只在日视图显示）
      if (this.currentView === 'day') {
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        if (isWeekend) {
          nodes.push({
            id: `weekend-bg-${i}`,
            type: 'uml-rect',
            x: x,
            y: this.config.startY + this.config.timelineHeight,
            width: this.config.dayWidth,
            height: this.calculateTotalHeight(data) - this.config.timelineHeight,
            text: '',
            fill: '#fff2f0',
            fillOpacity: 0.3,
            stroke: 'transparent',
            zIndex: LAYOUT_CONSTANTS.Z_INDEX_BACKGROUND,
          })
        }
      }
    }
  }

  private generateGridLines(data: ParsedGanttDiagram, nodes: ShapeData[]): void {
    const totalHeight = this.calculateTotalHeight(data)

    // 垂直网格线（根据视图调整间隔）
    const gridInterval = this.currentView === 'month' ? 30 : (this.currentView === 'week' ? 7 : 7)
    for (let i = 0; i <= this.totalDays; i += gridInterval) {
      const x = this.config.startX + i * this.config.dayWidth
      nodes.push({
        id: `grid-line-v-${i}`,
        type: 'uml-line',
        x: x,
        y: this.config.startY + this.config.timelineHeight,
        width: 1,
        height: totalHeight - this.config.timelineHeight,
        text: '',
        stroke: this.styles.grid.stroke,
        strokeWidth: this.styles.grid.strokeWidth,
        dashArray: '3,3',
        zIndex: LAYOUT_CONSTANTS.Z_INDEX_GRID,
      })
    }
  }

  private shouldShowTick(index: number, date: Date): boolean {
    switch (this.currentView) {
      case 'week':
        // 周视图：只显示周一
        return date.getDay() === 1
      case 'month':
        // 月视图：只显示每月1号
        return date.getDate() === 1
      case 'day':
      default:
        // 日视图：显示所有天
        return true
    }
  }

  private shouldShowLabel(index: number, date: Date): boolean {
    switch (this.currentView) {
      case 'week':
        // 周视图：每周一显示标签
        return date.getDay() === 1
      case 'month':
        // 月视图：每月1号显示标签
        return date.getDate() === 1
      case 'day':
      default:
        // 日视图：每5天或月初显示
        return index % 5 === 0 || date.getDate() === 1
    }
  }

  private generateTitle(title: string, nodes: ShapeData[]): void {
    nodes.push(
      this.createLabelNode(
        'gantt-title',
        LAYOUT_CONSTANTS.TITLE_X,
        LAYOUT_CONSTANTS.TITLE_Y,
        LAYOUT_CONSTANTS.TITLE_WIDTH,
        LAYOUT_CONSTANTS.TITLE_HEIGHT,
        title,
        {
          fontSize: LAYOUT_CONSTANTS.TITLE_FONT_SIZE,
          fontWeight: 600,
        }
      )
    )
  }

  private generateSectionsAndTasks(data: ParsedGanttDiagram, nodes: ShapeData[]): void {
    // 使用缓存的 sectionMap，避免重复创建
    const sectionMap = this.cachedSectionMap || new Map()
    
    // 如果没有缓存，创建一个
    if (sectionMap.size === 0) {
      data.tasks.forEach(task => {
        const section = task.section || 'default'
        if (!sectionMap.has(section)) {
          sectionMap.set(section, [])
        }
        sectionMap.get(section)!.push(task)
      })
    }

    let currentY = this.config.startY + this.config.timelineHeight

    data.sections.forEach(section => {
      const sectionTasks = sectionMap.get(section.name) || []
      if (sectionTasks.length === 0) return

      // 生成分组标题
      const sectionHeight = sectionTasks.length * (this.config.taskHeight + this.config.taskSpacing) +
        this.config.sectionSpacing

      nodes.push({
        id: `section-${section.id}`,
        type: 'uml-section-header',
        x: LAYOUT_CONSTANTS.SECTION_HEADER_X,
        y: currentY,
        width: this.config.startX - LAYOUT_CONSTANTS.SECTION_HEADER_WIDTH_OFFSET,
        height: sectionHeight - this.config.sectionSpacing,
        text: section.name,
        fill: this.styles.section.fill,
        stroke: this.styles.section.stroke,
        strokeWidth: this.styles.section.strokeWidth,
        fontSize: this.styles.section.fontSize,
        fontWeight: this.styles.section.fontWeight,
        color: this.styles.section.color,
        zIndex: LAYOUT_CONSTANTS.SECTION_Z_INDEX,
      })

      // 生成分组任务
      sectionTasks.forEach(task => {
        const layout = this.taskLayouts.get(task.id)
        if (!layout) return

        if (task.type === 'milestone') {
          this.generateMilestone(task, layout, nodes)
        } else {
          this.generateTask(task, layout, nodes)
        }

        currentY += this.config.taskHeight + this.config.taskSpacing
      })

      currentY += this.config.sectionSpacing
    })
  }

  private generateTask(task: GanttTask, layout: TaskLayout, nodes: ShapeData[]): void {
    // 检查是否为关键路径任务
    const isCritical = this.criticalPathData.get(task.id)?.isCritical
    
    // 获取任务样式（使用缓存）
    const style = this.getTaskStyle(task, !!isCritical)

    // 任务条形
    nodes.push({
      id: `task-${task.id}`,
      type: 'uml-gantt-task',
      x: layout.x + LAYOUT_CONSTANTS.TASK_X_OFFSET,
      y: layout.y,
      width: layout.width,
      height: layout.height,
      text: task.name,
      fill: style.fill,
      stroke: style.stroke,
      strokeWidth: style.strokeWidth,
      fontSize: style.fontSize,
      color: style.color,
      cornerRadius: LAYOUT_CONSTANTS.CORNER_RADIUS,
      zIndex: LAYOUT_CONSTANTS.Z_INDEX_TASK,
    })

    // 进度条（如果有进度）
    if (task.progress !== undefined && task.progress > 0) {
      const progressWidth = layout.width * (task.progress / 100)
      nodes.push({
        id: `task-progress-${task.id}`,
        type: 'uml-gantt-progress',
        x: layout.x + LAYOUT_CONSTANTS.TASK_X_OFFSET,
        y: layout.y + layout.height - LAYOUT_CONSTANTS.PROGRESS_BAR_Y_OFFSET,
        width: progressWidth,
        height: LAYOUT_CONSTANTS.PROGRESS_BAR_HEIGHT,
        text: '',
        fill: this.getProgressColor(task.status),
        stroke: 'transparent',
        cornerRadius: LAYOUT_CONSTANTS.PROGRESS_BAR_CORNER_RADIUS,
        zIndex: LAYOUT_CONSTANTS.Z_INDEX_PROGRESS,
      })
    }

    // 任务名称标签（左侧）
    let labelText = task.name
    if (task.assignee) {
      labelText = `${task.name} (${task.assignee})`
    }
    if (task.tags && task.tags.length > 0) {
      labelText += ` [${task.tags.join(', ')}]`
    }

    nodes.push(
      this.createLabelNode(
        `task-label-${task.id}`,
        LAYOUT_CONSTANTS.LABEL_X,
        layout.y + LAYOUT_CONSTANTS.LABEL_Y_OFFSET,
        this.config.startX - LAYOUT_CONSTANTS.TASK_LABEL_PADDING,
        LAYOUT_CONSTANTS.LABEL_HEIGHT,
        labelText
      )
    )
  }

  private getProgressColor(status: TaskStatus): string {
    switch (status) {
      case 'done':
        return '#52c41a'
      case 'active':
        return '#1890ff'
      case 'crit':
        return '#f5222d'
      default:
        return '#8c8c8c'
    }
  }

  private generateProjectLegend(projects: GanttProject[], nodes: ShapeData[]): void {
    const legendX = this.config.startX + this.totalDays * this.config.dayWidth + LAYOUT_CONSTANTS.LEGEND_X_PADDING
    const legendY = this.config.startY

    // 图例标题
    nodes.push(
      this.createLabelNode(
        'project-legend-title',
        legendX,
        legendY,
        LAYOUT_CONSTANTS.LEGEND_TITLE_WIDTH,
        LAYOUT_CONSTANTS.LEGEND_TITLE_HEIGHT,
        '项目图例',
        {
          fontSize: 14,
          fontWeight: 600,
        }
      )
    )

    // 图例项
    projects.forEach((project, index) => {
      const itemY = legendY + LAYOUT_CONSTANTS.LEGEND_TITLE_Y_OFFSET + index * LAYOUT_CONSTANTS.LEGEND_ITEM_SPACING

      // 颜色块
      nodes.push({
        id: `legend-color-${project.id}`,
        type: 'uml-rect',
        x: legendX,
        y: itemY,
        width: LAYOUT_CONSTANTS.LEGEND_ITEM_WIDTH,
        height: LAYOUT_CONSTANTS.LEGEND_ITEM_HEIGHT,
        text: '',
        fill: project.color,
        stroke: project.color,
        strokeWidth: LAYOUT_CONSTANTS.LEGEND_STROKE_WIDTH,
        cornerRadius: LAYOUT_CONSTANTS.LEGEND_ITEM_CORNER_RADIUS,
        zIndex: LAYOUT_CONSTANTS.Z_INDEX_LABEL,
      })

      // 项目名称
      nodes.push(
        this.createLabelNode(
          `legend-text-${project.id}`,
          legendX + LAYOUT_CONSTANTS.LEGEND_LABEL_SPACING,
          itemY,
          LAYOUT_CONSTANTS.LEGEND_TEXT_WIDTH,
          LAYOUT_CONSTANTS.LEGEND_ITEM_HEIGHT,
          project.name,
          {
            color: '#595959',
          }
        )
      )
    })
  }

  private generateMilestone(task: GanttTask, layout: TaskLayout, nodes: ShapeData[]): void {
    const style = this.getMilestoneStyle(task.status)
    const size = this.config.milestoneSize

    nodes.push({
      id: `milestone-${task.id}`,
      type: 'uml-gantt-milestone',
      x: layout.x - size / 2,
      y: layout.y + (layout.height - size) / 2,
      width: size,
      height: size,
      text: '',
      fill: style.fill,
      stroke: style.stroke,
      strokeWidth: style.strokeWidth,
      zIndex: LAYOUT_CONSTANTS.Z_INDEX_MILESTONE,
    })

    // 里程碑名称标签
    nodes.push(
      this.createLabelNode(
        `milestone-label-${task.id}`,
        LAYOUT_CONSTANTS.LABEL_X,
        layout.y + LAYOUT_CONSTANTS.LABEL_Y_OFFSET,
        this.config.startX - LAYOUT_CONSTANTS.TASK_LABEL_PADDING,
        LAYOUT_CONSTANTS.LABEL_HEIGHT,
        `◆ ${task.name}`,
        {
          color: style.stroke,
        }
      )
    )
  }

  private generateDependencies(data: ParsedGanttDiagram, edges: Connector[]): void {
    // 提前获取所有数据，避免重复查询
    const layouts = new Map(this.taskLayouts)
    const criticalData = new Map(this.criticalPathData)

    data.tasks.forEach(task => {
      const targetLayout = layouts.get(task.id)
      const targetCritical = criticalData.get(task.id)?.isCritical

      task.dependencies.forEach(depId => {
        const sourceLayout = layouts.get(depId)
        if (!sourceLayout || !targetLayout) return

        const sourceCritical = criticalData.get(depId)?.isCritical
        const isCriticalDep = sourceCritical && targetCritical

        const sourceX = sourceLayout.x + sourceLayout.width
        const sourceY = sourceLayout.y + sourceLayout.height / 2
        const targetX = targetLayout.x
        const targetY = targetLayout.y + targetLayout.height / 2

        // 创建依赖连线
        edges.push({
          id: `dep-${depId}-${task.id}`,
          sourceShapeId: `task-${depId}`,
          sourcePointId: 'right',
          targetShapeId: `task-${task.id}`,
          targetPointId: 'left',
          stroke: isCriticalDep ? '#f5222d' : this.styles.dependency.stroke,
          strokeWidth: isCriticalDep ? 2.5 : this.styles.dependency.strokeWidth,
          lineStyle: 'solid',
          startStyle: 'none',
          endStyle: 'arrow',
          style: 'orthogonal',
          zIndex: isCriticalDep ? LAYOUT_CONSTANTS.Z_INDEX_DEPENDENCY_CRITICAL : LAYOUT_CONSTANTS.Z_INDEX_DEPENDENCY_NORMAL,
        })
      })
    })
  }

  /**
   * 生成关键路径高亮
   */
  private generateCriticalPathHighlight(
    data: ParsedGanttDiagram,
    nodes: ShapeData[],
    edges: Connector[]
  ): void {
    // 为关键路径上的任务添加高亮边框
    data.tasks.forEach(task => {
      const taskTimeData = this.criticalPathData.get(task.id)
      if (taskTimeData?.isCritical) {
        const layout = this.taskLayouts.get(task.id)
        if (!layout) return

        // 添加关键路径高亮边框
        nodes.push({
          id: `critical-highlight-${task.id}`,
          type: 'uml-rect',
          x: layout.x,
          y: layout.y - LAYOUT_CONSTANTS.HIGHLIGHT_PADDING,
          width: layout.width + LAYOUT_CONSTANTS.HIGHLIGHT_STROKE_ADD,
          height: layout.height + LAYOUT_CONSTANTS.HIGHLIGHT_STROKE_ADD,
          text: '',
          fill: 'transparent',
          stroke: '#f5222d',
          strokeWidth: LAYOUT_CONSTANTS.HIGHLIGHT_STROKE_WIDTH,
          dashArray: '5,3',
          zIndex: LAYOUT_CONSTANTS.Z_INDEX_HIGHLIGHT,
        })

        // 添加浮动时间标签（如果有）
        if (taskTimeData.totalFloat > 0) {
          nodes.push(
            this.createLabelNode(
              `float-label-${task.id}`,
              layout.x + layout.width + LAYOUT_CONSTANTS.FLOAT_LABEL_X_PADDING,
              layout.y,
              LAYOUT_CONSTANTS.FLOAT_LABEL_WIDTH,
              LAYOUT_CONSTANTS.FLOAT_LABEL_HEIGHT,
              `+${taskTimeData.totalFloat}d`,
              {
                fill: '#fff2f0',
                stroke: '#ff4d4f',
                fontSize: 10,
                color: '#cf1322',
                zIndex: LAYOUT_CONSTANTS.Z_INDEX_FLOAT_LABEL,
              }
            )
          )
        }
      }
    })

    // 添加关键路径信息标签
    const criticalTaskCount = Array.from(this.criticalPathData.values()).filter(t => t.isCritical).length
    const projectDuration = Math.max(...Array.from(this.criticalPathData.values()).map(t => t.earliestFinish))

    nodes.push(
      this.createLabelNode(
        'critical-path-info',
        LAYOUT_CONSTANTS.CRITICAL_INFO_X,
        LAYOUT_CONSTANTS.CRITICAL_INFO_Y,
        LAYOUT_CONSTANTS.CRITICAL_INFO_WIDTH,
        LAYOUT_CONSTANTS.CRITICAL_INFO_HEIGHT,
        `关键路径: ${criticalTaskCount}个任务, 总工期: ${projectDuration}天`,
        {
          fill: '#fff2f0',
          stroke: '#ff4d4f',
          fontSize: LAYOUT_CONSTANTS.CRITICAL_INFO_FONT_SIZE,
          fontWeight: 600,
          color: '#cf1322',
          zIndex: LAYOUT_CONSTANTS.Z_INDEX_FLOAT_LABEL,
        }
      )
    )
  }

  private calculateTotalHeight(data: ParsedGanttDiagram): number {
    // 检查缓存
    if (this.cachedTotalHeight !== null) {
      return this.cachedTotalHeight
    }

    const sectionMap = new Map<string, number>()
    data.tasks.forEach(task => {
      const section = task.section || 'default'
      sectionMap.set(section, (sectionMap.get(section) || 0) + 1)
    })

    const totalTasks = data.tasks.length
    const totalSections = data.sections.length

    const result = this.config.startY + this.config.timelineHeight +
      totalTasks * (this.config.taskHeight + this.config.taskSpacing) +
      totalSections * this.config.sectionSpacing + 50

    // 保存到缓存
    this.cachedTotalHeight = result
    return result
  }

  private getDateFormat(format: string): (date: Date) => string {
    switch (format.toUpperCase()) {
      case 'YYYY-MM-DD':
        return (date: Date) =>
          `${date.getMonth() + 1}/${date.getDate()}`
      case 'DD/MM/YYYY':
        return (date: Date) =>
          `${date.getDate()}/${date.getMonth() + 1}`
      case 'MM/DD/YYYY':
        return (date: Date) =>
          `${date.getMonth() + 1}/${date.getDate()}`
      default:
        return (date: Date) =>
          `${date.getMonth() + 1}/${date.getDate()}`
    }
  }
}

// 导出单例实例
export const ganttDiagramGenerator = new GanttDiagramGenerator()
export default ganttDiagramGenerator
