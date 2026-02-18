/**
 * 甘特图验证器类型定义
 */

import type { GanttTask, ParsedGanttDiagram } from '../parser/types'

/** 验证错误严重级别 */
export type ValidationSeverity = 'error' | 'warning' | 'info'

/** 验证错误信息 */
export interface ValidationError {
  /** 错误类型 */
  type: string
  /** 严重级别 */
  severity: ValidationSeverity
  /** 错误消息 */
  message: string
  /** 相关任务ID */
  taskId?: string
  /** 相关任务名称 */
  taskName?: string
  /** 错误所在行号 */
  line?: number
}

/** 验证结果 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误列表 */
  errors: ValidationError[]
  /** 警告列表 */
  warnings: ValidationError[]
  /** 信息列表 */
  infos: ValidationError[]
}

/** 验证规则接口 */
export interface ValidationRule {
  /** 规则名称 */
  name: string
  /** 规则描述 */
  description: string
  /** 验证函数 */
  validate: (data: ParsedGanttDiagram) => ValidationError[]
}

/** 依赖图节点 */
export interface DependencyNode {
  task: GanttTask
  dependencies: string[]
  dependents: string[]
  visited: boolean
  visiting: boolean
}

/** 循环依赖信息 */
export interface CycleInfo {
  /** 循环中的任务ID列表 */
  cycle: string[]
  /** 循环描述 */
  description: string
}
