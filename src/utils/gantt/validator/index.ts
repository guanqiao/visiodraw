/**
 * 甘特图验证器模块
 * 提供甘特图数据的验证功能
 */

// 导出类型
export type {
  ValidationSeverity,
  ValidationError,
  ValidationResult,
  ValidationRule,
  DependencyNode,
  CycleInfo,
} from './types'

// 导出验证器
export {
  GanttValidator,
  validateGanttData,
  isValidGanttData,
  ganttValidator,
} from './ganttValidator'

// 导出验证规则
export { validateDependencies, dependencyRule } from './rules/dependencyRule'
export { validateDateConflicts, dateConflictRule } from './rules/dateConflictRule'
