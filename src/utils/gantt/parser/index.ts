/**
 * 甘特图解析器模块
 * 提供Mermaid甘特图脚本的解析功能
 */

// 导出类型
export type {
  TaskStatus,
  TaskType,
  TaskPriority,
  TimelineView,
  GanttTask,
  GanttSection,
  GanttProject,
  ParsedGanttDiagram,
  ParseError,
  ParseResult,
  RawTaskDefinition,
} from './types'

// 导出语法定义
export {
  GrammarRules,
  TaskTags,
  ExtendedTags,
  PriorityMap,
  StatusMap,
  TypeMap,
  Patterns,
  DefaultConfig,
  SyntaxHelp,
  isStatusTag,
  isTypeTag,
  isExtendedPropertyTag,
  parseExtendedProperty,
  parseProgress,
  parsePriority,
  parseDependency,
  parseDuration,
  parseDate,
  isValidTaskId,
} from './grammar'

// 导出解析器
export {
  GanttParser,
  parseGanttScript,
  parseGanttScriptSimple,
  ganttParser,
} from './ganttParser'
