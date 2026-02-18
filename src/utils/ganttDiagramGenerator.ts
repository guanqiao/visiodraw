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

  generate(data: ParsedGanttDiagram): GeneratedGanttDiagram {
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
      zIndex: 1,
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
      zIndex: 1,
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
          y: this.config.startY + this.config.timelineHeight - 5,
          width: 1,
          height: isFirstDayOfMonth ? 10 : (isFirstDayOfWeek ? 8 : 5),
          text: '',
          stroke: isWeekend ? '#ff4d4f' : '#bfbfbf',
          strokeWidth: 1,
          zIndex: 2,
        })

        // 日期标签
        if (shouldShowLabel) {
          nodes.push({
            id: `timeline-label-${i}`,
            type: 'uml-label',
            x: x - 20,
            y: this.config.startY + 5,
            width: 40,
            height: 20,
            text: dateFormat(date),
            fill: 'transparent',
            stroke: 'transparent',
            fontSize: this.styles.timeline.fontSize,
            color: isWeekend ? '#ff4d4f' : this.styles.timeline.color,
            zIndex: 2,
          })
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
            zIndex: 0,
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
        zIndex: 0,
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
    nodes.push({
      id: 'gantt-title',
      type: 'uml-label',
      x: 20,
      y: 20,
      width: 300,
      height: 30,
      text: title,
      fill: 'transparent',
      stroke: 'transparent',
      fontSize: 18,
      fontWeight: 600,
      color: '#262626',
      zIndex: 10,
    })
  }

  private generateSectionsAndTasks(data: ParsedGanttDiagram, nodes: ShapeData[]): void {
    const sectionMap = new Map<string, GanttTask[]>()
    data.tasks.forEach(task => {
      const section = task.section || 'default'
      if (!sectionMap.has(section)) {
        sectionMap.set(section, [])
      }
      sectionMap.get(section)!.push(task)
    })

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
        x: 10,
        y: currentY,
        width: this.config.startX - 20,
        height: sectionHeight - this.config.sectionSpacing,
        text: section.name,
        fill: this.styles.section.fill,
        stroke: this.styles.section.stroke,
        strokeWidth: this.styles.section.strokeWidth,
        fontSize: this.styles.section.fontSize,
        fontWeight: this.styles.section.fontWeight,
        color: this.styles.section.color,
        zIndex: 5,
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
    
    // 如果是关键路径任务，使用关键路径样式，否则使用任务状态样式
    let style = this.styles.task[task.status] || this.styles.task.default
    if (isCritical && task.status !== 'crit') {
      // 关键路径任务使用特殊的边框样式
      style = {
        ...style,
        stroke: '#f5222d',
        strokeWidth: 2,
      }
    }

    // 任务条形
    nodes.push({
      id: `task-${task.id}`,
      type: 'uml-gantt-task',
      x: layout.x + 2,
      y: layout.y,
      width: layout.width,
      height: layout.height,
      text: task.name,
      fill: style.fill,
      stroke: style.stroke,
      strokeWidth: style.strokeWidth,
      fontSize: style.fontSize,
      color: style.color,
      cornerRadius: 4,
      zIndex: 10,
    })

    // 进度条（如果有进度）
    if (task.progress !== undefined && task.progress > 0) {
      const progressWidth = layout.width * (task.progress / 100)
      nodes.push({
        id: `task-progress-${task.id}`,
        type: 'uml-gantt-progress',
        x: layout.x + 2,
        y: layout.y + layout.height - 4,
        width: progressWidth,
        height: 4,
        text: '',
        fill: this.getProgressColor(task.status),
        stroke: 'transparent',
        cornerRadius: 2,
        zIndex: 11,
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

    nodes.push({
      id: `task-label-${task.id}`,
      type: 'uml-label',
      x: 10,
      y: layout.y + 6,
      width: this.config.startX - 20,
      height: 20,
      text: labelText,
      fill: 'transparent',
      stroke: 'transparent',
      fontSize: 12,
      color: '#262626',
      textAlign: 'left',
      zIndex: 10,
    })
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
    const legendX = this.config.startX + this.totalDays * this.config.dayWidth + 20
    const legendY = this.config.startY

    // 图例标题
    nodes.push({
      id: 'project-legend-title',
      type: 'uml-label',
      x: legendX,
      y: legendY,
      width: 120,
      height: 20,
      text: '项目图例',
      fill: 'transparent',
      stroke: 'transparent',
      fontSize: 14,
      fontWeight: 600,
      color: '#262626',
      zIndex: 10,
    })

    // 图例项
    projects.forEach((project, index) => {
      const itemY = legendY + 30 + index * 25

      // 颜色块
      nodes.push({
        id: `legend-color-${project.id}`,
        type: 'uml-rect',
        x: legendX,
        y: itemY,
        width: 16,
        height: 16,
        text: '',
        fill: project.color,
        stroke: project.color,
        strokeWidth: 1,
        cornerRadius: 2,
        zIndex: 10,
      })

      // 项目名称
      nodes.push({
        id: `legend-text-${project.id}`,
        type: 'uml-label',
        x: legendX + 24,
        y: itemY,
        width: 100,
        height: 16,
        text: project.name,
        fill: 'transparent',
        stroke: 'transparent',
        fontSize: 12,
        color: '#595959',
        zIndex: 10,
      })
    })
  }

  private generateMilestone(task: GanttTask, layout: TaskLayout, nodes: ShapeData[]): void {
    const style = task.status === 'done' ? this.styles.milestone.done : this.styles.milestone.default
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
      zIndex: 10,
    })

    // 里程碑名称标签
    nodes.push({
      id: `milestone-label-${task.id}`,
      type: 'uml-label',
      x: 10,
      y: layout.y + 6,
      width: this.config.startX - 20,
      height: 20,
      text: `◆ ${task.name}`,
      fill: 'transparent',
      stroke: 'transparent',
      fontSize: 12,
      color: style.stroke,
      textAlign: 'left',
      zIndex: 10,
    })
  }

  private generateDependencies(data: ParsedGanttDiagram, edges: Connector[]): void {
    data.tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        const sourceLayout = this.taskLayouts.get(depId)
        const targetLayout = this.taskLayouts.get(task.id)

        if (!sourceLayout || !targetLayout) return

        const sourceX = sourceLayout.x + sourceLayout.width
        const sourceY = sourceLayout.y + sourceLayout.height / 2
        const targetX = targetLayout.x
        const targetY = targetLayout.y + targetLayout.height / 2

        // 检查是否为关键路径上的依赖
        const sourceCritical = this.criticalPathData.get(depId)?.isCritical
        const targetCritical = this.criticalPathData.get(task.id)?.isCritical
        const isCriticalDep = sourceCritical && targetCritical

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
          zIndex: isCriticalDep ? 9 : 8,
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
          y: layout.y - 2,
          width: layout.width + 4,
          height: layout.height + 4,
          text: '',
          fill: 'transparent',
          stroke: '#f5222d',
          strokeWidth: 3,
          dashArray: '5,3',
          zIndex: 12,
        })

        // 添加浮动时间标签（如果有）
        if (taskTimeData.totalFloat > 0) {
          nodes.push({
            id: `float-label-${task.id}`,
            type: 'uml-label',
            x: layout.x + layout.width + 5,
            y: layout.y,
            width: 60,
            height: 16,
            text: `+${taskTimeData.totalFloat}d`,
            fill: '#fff2f0',
            stroke: '#ff4d4f',
            fontSize: 10,
            color: '#cf1322',
            zIndex: 13,
          })
        }
      }
    })

    // 添加关键路径信息标签
    const criticalTaskCount = Array.from(this.criticalPathData.values()).filter(t => t.isCritical).length
    const projectDuration = Math.max(...Array.from(this.criticalPathData.values()).map(t => t.earliestFinish))

    nodes.push({
      id: 'critical-path-info',
      type: 'uml-label',
      x: this.config.startX,
      y: 20,
      width: 300,
      height: 24,
      text: `关键路径: ${criticalTaskCount}个任务, 总工期: ${projectDuration}天`,
      fill: '#fff2f0',
      stroke: '#ff4d4f',
      fontSize: 12,
      fontWeight: 600,
      color: '#cf1322',
      zIndex: 15,
    })
  }

  private calculateTotalHeight(data: ParsedGanttDiagram): number {
    const sectionMap = new Map<string, number>()
    data.tasks.forEach(task => {
      const section = task.section || 'default'
      sectionMap.set(section, (sectionMap.get(section) || 0) + 1)
    })

    const totalTasks = data.tasks.length
    const totalSections = data.sections.length

    return this.config.startY + this.config.timelineHeight +
      totalTasks * (this.config.taskHeight + this.config.taskSpacing) +
      totalSections * this.config.sectionSpacing + 50
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
