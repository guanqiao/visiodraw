/**
 * 图表模板索引
 * 导出所有图表模板
 */

export { getActivityTemplates } from './activityTemplates'
export { getSequenceTemplates } from './sequenceTemplates'
export { getStateTemplates } from './stateTemplates'
export { getErTemplates } from './erTemplates'
export { getClassTemplates } from './classTemplates'
export { getGanttTemplates } from './ganttTemplates'

import { getActivityTemplates } from './activityTemplates'
import { getSequenceTemplates } from './sequenceTemplates'
import { getStateTemplates } from './stateTemplates'
import { getErTemplates } from './erTemplates'
import { getClassTemplates } from './classTemplates'
import { getGanttTemplates } from './ganttTemplates'
import type { DiagramTemplate, TemplateGenerateOptions, DiagramType } from '../types/diagramTemplate'

/**
 * 获取所有图表模板
 */
export function getAllTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    ...getActivityTemplates(options),
    ...getSequenceTemplates(options),
    ...getStateTemplates(options),
    ...getErTemplates(options),
    ...getClassTemplates(options),
    ...getGanttTemplates(options),
  ]
}

/**
 * 根据类型获取模板
 */
export function getTemplatesByType(
  type: DiagramType,
  options: TemplateGenerateOptions = {}
): DiagramTemplate[] {
  switch (type) {
    case 'activity':
      return getActivityTemplates(options)
    case 'sequence':
      return getSequenceTemplates(options)
    case 'state':
      return getStateTemplates(options)
    case 'er':
      return getErTemplates(options)
    case 'class':
      return getClassTemplates(options)
    case 'gantt':
      return getGanttTemplates(options)
    default:
      return []
  }
}
