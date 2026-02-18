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
}

export interface GanttSection {
  id: string
  name: string
  order: number
}

export interface ParsedGanttDiagram {
  title?: string
  dateFormat: string
  sections: GanttSection[]
  tasks: GanttTask[]
  startDate: Date
  endDate: Date
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

  generate(data: ParsedGanttDiagram): GeneratedGanttDiagram {
    const nodes: ShapeData[] = []
    const edges: Connector[] = []

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

    return { nodes, edges }
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

      // 日期刻度线
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const isFirstDayOfMonth = date.getDate() === 1

      nodes.push({
        id: `timeline-tick-${i}`,
        type: 'uml-line',
        x: x,
        y: this.config.startY + this.config.timelineHeight - 5,
        width: 1,
        height: isFirstDayOfMonth ? 10 : 5,
        text: '',
        stroke: isWeekend ? '#ff4d4f' : '#bfbfbf',
        strokeWidth: 1,
        zIndex: 2,
      })

      // 日期标签（每5天或月初显示）
      if (i % 5 === 0 || isFirstDayOfMonth) {
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

      // 周末背景色
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

  private generateGridLines(data: ParsedGanttDiagram, nodes: ShapeData[]): void {
    const totalHeight = this.calculateTotalHeight(data)

    // 垂直网格线
    for (let i = 0; i <= this.totalDays; i += 7) {
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
    const style = this.styles.task[task.status] || this.styles.task.default

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

        // 创建依赖连线
        edges.push({
          id: `dep-${depId}-${task.id}`,
          sourceShapeId: `task-${depId}`,
          sourcePointId: 'right',
          targetShapeId: `task-${task.id}`,
          targetPointId: 'left',
          stroke: this.styles.dependency.stroke,
          strokeWidth: this.styles.dependency.strokeWidth,
          lineStyle: 'solid',
          startStyle: 'none',
          endStyle: 'arrow',
          style: 'orthogonal',
          zIndex: 8,
        })
      })
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
