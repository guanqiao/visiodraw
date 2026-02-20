/**
 * 甘特图语法定义
 * 定义Mermaid甘特图语法规则和正则表达式
 */

import type { TaskStatus, TaskType, TaskPriority } from './types'

/** 语法规则常量 */
export const GrammarRules = {
  /** 注释行 */
  COMMENT: /^\s*%%/,
  /** 甘特图声明 */
  GANTT_DECLARATION: /^\s*gantt\s*$/i,
  /** 标题定义 */
  TITLE: /^\s*title\s+(.+)$/i,
  /** 日期格式定义 */
  DATE_FORMAT: /^\s*dateFormat\s+(.+)$/i,
  /** 分组定义 */
  SECTION: /^\s*section\s+(.+)$/i,
  /** 任务定义（基础格式：任务名 : 定义） */
  TASK: /^\s*([^:]+)\s*:\s*(.+)$/,
} as const

/** 任务标签常量 */
export const TaskTags = {
  /** 已完成 */
  DONE: 'done',
  /** 进行中 */
  ACTIVE: 'active',
  /** 关键任务 */
  CRIT: 'crit',
  /** 里程碑 */
  MILESTONE: 'milestone',
} as const

/** 扩展属性标签 */
export const ExtendedTags = {
  /** 标签前缀 */
  TAG: 'tag',
  /** 分配人前缀 */
  ASSIGNEE: 'assignee',
  /** 进度前缀 */
  PROGRESS: 'progress',
  /** 优先级前缀 */
  PRIORITY: 'priority',
} as const

/** 优先级映射 */
export const PriorityMap: Record<string, TaskPriority> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
  h: 'high',
  m: 'medium',
  l: 'low',
}

/** 状态标签映射 */
export const StatusMap: Record<string, TaskStatus> = {
  [TaskTags.DONE]: 'done',
  [TaskTags.ACTIVE]: 'active',
  [TaskTags.CRIT]: 'crit',
}

/** 类型标签映射 */
export const TypeMap: Record<string, TaskType> = {
  [TaskTags.MILESTONE]: 'milestone',
}

/** 正则表达式模式 */
export const Patterns = {
  /** 持续时间（如：7d, 14d） */
  DURATION: /^(\d+)d$/i,
  /** 日期格式（YYYY-MM-DD） */
  DATE: /^(\d{4})-(\d{2})-(\d{2})$/,
  /** 依赖关系（after taskId） */
  DEPENDENCY: /^after\s+(.+)$/i,
  /** 多个依赖（逗号分隔） */
  MULTI_DEPENDENCY: /\s*,\s*/,
  /** 任务ID（字母数字下划线） */
  TASK_ID: /^[a-zA-Z_]\w*$/,
  /** 进度百分比（如：50%） */
  PROGRESS: /^(\d+)%$/,
  /** 扩展属性（tag: value格式） */
  EXTENDED_PROPERTY: /^(\w+)\s+(.+)$/,
} as const

/** 默认配置 */
export const DefaultConfig = {
  /** 默认日期格式 */
  DATE_FORMAT: 'YYYY-MM-DD',
  /** 默认开始日期 */
  START_DATE: '2024-01-01',
  /** 默认持续时间（天） */
  DURATION: 1,
  /** 默认进度 */
  PROGRESS: 0,
} as const

/** 限制常量 */
export const Limits = {
  /** 最大工期（天）- 100年 */
  MAX_DURATION: 365 * 100,
  /** 最大行长度（字符） */
  MAX_LINE_LENGTH: 10000,
  /** 最大任务数 */
  MAX_TASKS: 10000,
  /** 最大分组数 */
  MAX_SECTIONS: 100,
} as const

/** 语法帮助文本 */
export const SyntaxHelp = {
  title: '语法说明',
  sections: [
    {
      title: '基本结构',
      content: `gantt
  title 项目标题
  dateFormat YYYY-MM-DD
  section 分组名称
  任务名称 :标签, ID, 开始时间, 持续时间`,
    },
    {
      title: '状态标签',
      items: [
        { label: 'done', description: '已完成（绿色）' },
        { label: 'active', description: '进行中（蓝色）' },
        { label: 'crit', description: '关键任务（红色）' },
        { label: 'milestone', description: '里程碑（菱形）' },
      ],
    },
    {
      title: '扩展属性',
      items: [
        { label: 'tag 标签名', description: '任务分类标签' },
        { label: 'assignee 姓名', description: '任务分配人' },
        { label: 'progress 50%', description: '完成进度' },
        { label: 'priority high/medium/low', description: '任务优先级' },
      ],
    },
    {
      title: '时间格式',
      items: [
        { label: 'YYYY-MM-DD', description: '具体日期（如2024-01-01）' },
        { label: 'after ID', description: '在指定任务后' },
        { label: '7d', description: '持续7天' },
      ],
    },
  ],
} as const

/**
 * 检查字符串是否为状态标签
 */
export function isStatusTag(value: string): boolean {
  return Object.keys(StatusMap).includes(value.toLowerCase())
}

/**
 * 检查字符串是否为类型标签
 */
export function isTypeTag(value: string): boolean {
  return Object.keys(TypeMap).includes(value.toLowerCase())
}

/**
 * 检查字符串是否为扩展属性标签
 */
export function isExtendedPropertyTag(value: string): boolean {
  const lowerValue = value.toLowerCase()
  return Object.values(ExtendedTags).some(tag => lowerValue.startsWith(tag))
}

/**
 * 解析扩展属性
 * @param value 属性值字符串（如 "tag frontend"）
 * @returns [key, value] 元组
 */
export function parseExtendedProperty(value: string): [string, string] | null {
  const match = value.match(Patterns.EXTENDED_PROPERTY)
  if (match) {
    return [match[1].toLowerCase(), match[2].trim()]
  }
  return null
}

/**
 * 解析进度值
 * @param value 进度字符串（如 "50%"）
 * @returns 进度数值（0-100）
 */
export function parseProgress(value: string): number | null {
  const match = value.match(Patterns.PROGRESS)
  if (match) {
    const progress = parseInt(match[1], 10)
    return Math.min(100, Math.max(0, progress))
  }
  return null
}

/**
 * 解析优先级
 * @param value 优先级字符串
 * @returns 优先级类型
 */
export function parsePriority(value: string): TaskPriority | null {
  return PriorityMap[value.toLowerCase()] || null
}

/**
 * 解析依赖关系
 * @param value 依赖字符串（如 "after task1"）
 * @returns 依赖任务ID列表
 */
export function parseDependency(value: string): string[] | null {
  const match = value.match(Patterns.DEPENDENCY)
  if (match) {
    return match[1].split(Patterns.MULTI_DEPENDENCY).map(id => id.trim())
  }
  return null
}

/**
 * 解析持续时间
 * @param value 持续时间字符串（如 "7d"）
 * @returns 天数（限制在 MAX_DURATION 内）
 */
export function parseDuration(value: string): number | null {
  const match = value.match(Patterns.DURATION)
  if (match) {
    const duration = parseInt(match[1], 10)
    // 限制最大工期
    return Math.min(duration, Limits.MAX_DURATION)
  }
  return null
}

/**
 * 解析日期
 * @param value 日期字符串（如 "2024-01-01"）
 * @returns Date对象
 */
export function parseDate(value: string): Date | null {
  const match = value.match(Patterns.DATE)
  if (match) {
    const year = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1
    const day = parseInt(match[3], 10)
    return new Date(year, month, day)
  }
  return null
}

/**
 * 检查是否为有效的任务ID
 * @param value 任务ID字符串
 */
export function isValidTaskId(value: string): boolean {
  return Patterns.TASK_ID.test(value)
}
