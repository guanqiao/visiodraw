/**
 * 甘特图解析器类型定义
 * 定义解析相关的所有类型接口
 */

/** 任务状态类型 */
export type TaskStatus = 'done' | 'active' | 'crit' | 'default'

/** 任务类型 */
export type TaskType = 'task' | 'milestone' | 'section'

/** 优先级类型 */
export type TaskPriority = 'high' | 'medium' | 'low'

/** 时间轴视图模式 */
export type TimelineView = 'day' | 'week' | 'month'

/**
 * 甘特图任务定义
 */
export interface GanttTask {
  /** 任务唯一标识 */
  id: string
  /** 任务名称 */
  name: string
  /** 任务类型 */
  type: TaskType
  /** 任务状态 */
  status: TaskStatus
  /** 开始日期 */
  startDate: Date
  /** 结束日期 */
  endDate: Date
  /** 持续时间（天） */
  duration: number
  /** 所属分组 */
  section?: string
  /** 依赖任务ID列表 */
  dependencies: string[]
  /** 排序顺序 */
  order: number
  /** 分配人 */
  assignee?: string
  /** 进度百分比（0-100） */
  progress?: number
  /** 标签列表 */
  tags?: string[]
  /** 优先级 */
  priority?: TaskPriority
}

/**
 * 甘特图分组定义
 */
export interface GanttSection {
  /** 分组唯一标识 */
  id: string
  /** 分组名称 */
  name: string
  /** 排序顺序 */
  order: number
}

/**
 * 甘特图项目定义
 */
export interface GanttProject {
  /** 项目唯一标识 */
  id: string
  /** 项目名称 */
  name: string
  /** 项目颜色 */
  color: string
  /** 排序顺序 */
  order: number
}

/**
 * 解析后的甘特图数据
 */
export interface ParsedGanttDiagram {
  /** 图表标题 */
  title?: string
  /** 日期格式 */
  dateFormat: string
  /** 分组列表 */
  sections: GanttSection[]
  /** 任务列表 */
  tasks: GanttTask[]
  /** 项目列表（多项目模式） */
  projects?: GanttProject[]
  /** 项目开始日期 */
  startDate: Date
  /** 项目结束日期 */
  endDate: Date
  /** 时间轴视图模式 */
  view?: TimelineView
  /** 是否显示关键路径 */
  showCriticalPath?: boolean
}

/**
 * 解析错误信息
 */
export interface ParseError {
  /** 错误类型 */
  type: 'syntax' | 'semantic' | 'reference'
  /** 错误消息 */
  message: string
  /** 错误所在行号（1-based） */
  line?: number
  /** 错误所在列号（1-based） */
  column?: number
  /** 相关任务ID */
  taskId?: string
}

/**
 * 解析结果
 */
export interface ParseResult {
  /** 是否解析成功 */
  success: boolean
  /** 解析后的数据（成功时） */
  data?: ParsedGanttDiagram
  /** 错误列表（失败时） */
  errors: ParseError[]
}

/**
 * 任务定义原始数据（解析中间状态）
 */
export interface RawTaskDefinition {
  /** 任务名称 */
  name: string
  /** 任务标签列表 */
  tags: string[]
  /** 任务ID */
  id?: string
  /** 开始日期 */
  startDate?: Date
  /** 持续时间 */
  duration?: number
  /** 依赖任务 */
  dependencies: string[]
  /** 分配人 */
  assignee?: string
  /** 进度 */
  progress?: number
  /** 优先级 */
  priority?: TaskPriority
}
