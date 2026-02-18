/**
 * 日期冲突验证规则
 * 检测任务日期冲突、不合理的时间安排等问题
 */

import type { ValidationError } from '../types'
import type { GanttTask, ParsedGanttDiagram } from '../../parser/types'

/**
 * 验证日期冲突
 * @param data 解析后的甘特图数据
 * @returns 验证错误列表
 */
export function validateDateConflicts(data: ParsedGanttDiagram): ValidationError[] {
  const errors: ValidationError[] = []

  // 检查依赖任务的时间冲突
  errors.push(...validateDependencyTimeConflicts(data.tasks))

  // 检查里程碑持续时间
  errors.push(...validateMilestoneDuration(data.tasks))

  // 检查任务持续时间合理性
  errors.push(...validateTaskDuration(data.tasks))

  // 检查过去日期的活动任务
  errors.push(...validateActiveTaskDates(data.tasks))

  return errors
}

/**
 * 验证依赖任务的时间冲突
 * 确保任务的开始时间不早于依赖任务的结束时间
 */
function validateDependencyTimeConflicts(tasks: GanttTask[]): ValidationError[] {
  const errors: ValidationError[] = []
  const taskMap = new Map<string, GanttTask>()

  tasks.forEach(task => {
    taskMap.set(task.id, task)
  })

  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      const depTask = taskMap.get(depId)
      if (depTask) {
        // 检查依赖任务的结束时间是否晚于当前任务的开始时间
        if (depTask.endDate > task.startDate) {
          errors.push({
            type: 'date-conflict',
            severity: 'warning',
            message: `任务 "${task.name}" 的开始时间 (${formatDate(task.startDate)}) 早于依赖任务 "${depTask.name}" 的结束时间 (${formatDate(depTask.endDate)})`,
            taskId: task.id,
            taskName: task.name,
          })
        }
      }
    })
  })

  return errors
}

/**
 * 验证里程碑持续时间
 * 里程碑应该是0天或1天
 */
function validateMilestoneDuration(tasks: GanttTask[]): ValidationError[] {
  const errors: ValidationError[] = []

  tasks.forEach(task => {
    if (task.type === 'milestone' && task.duration > 1) {
      errors.push({
        type: 'milestone-duration',
        severity: 'warning',
        message: `里程碑 "${task.name}" 的持续时间为 ${task.duration} 天，建议设置为 0 或 1 天`,
        taskId: task.id,
        taskName: task.name,
      })
    }
  })

  return errors
}

/**
 * 验证任务持续时间合理性
 */
function validateTaskDuration(tasks: GanttTask[]): ValidationError[] {
  const errors: ValidationError[] = []
  const MAX_REASONABLE_DURATION = 365 // 最大合理持续时间（1年）
  const MIN_REASONABLE_DURATION = 0

  tasks.forEach(task => {
    // 检查持续时间是否为负数或零
    if (task.duration <= MIN_REASONABLE_DURATION && task.type !== 'milestone') {
      errors.push({
        type: 'invalid-duration',
        severity: 'error',
        message: `任务 "${task.name}" 的持续时间必须大于 0`,
        taskId: task.id,
        taskName: task.name,
      })
    }

    // 检查持续时间是否过长
    if (task.duration > MAX_REASONABLE_DURATION) {
      errors.push({
        type: 'long-duration',
        severity: 'warning',
        message: `任务 "${task.name}" 的持续时间超过 ${MAX_REASONABLE_DURATION} 天，建议拆分为多个子任务`,
        taskId: task.id,
        taskName: task.name,
      })
    }
  })

  return errors
}

/**
 * 验证活动任务的日期
 * 检查标记为active的任务是否在未来
 */
function validateActiveTaskDates(tasks: GanttTask[]): ValidationError[] {
  const errors: ValidationError[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  tasks.forEach(task => {
    if (task.status === 'active') {
      // 如果活动任务的结束日期已经过去
      if (task.endDate < now) {
        errors.push({
          type: 'overdue-task',
          severity: 'warning',
          message: `进行中的任务 "${task.name}" 已逾期（计划结束时间: ${formatDate(task.endDate)}）`,
          taskId: task.id,
          taskName: task.name,
        })
      }
    }

    // 检查已完成的任务但进度不是100%
    if (task.status === 'done' && task.progress !== undefined && task.progress < 100) {
      errors.push({
        type: 'incomplete-done-task',
        severity: 'info',
        message: `任务 "${task.name}" 标记为已完成，但进度为 ${task.progress}%`,
        taskId: task.id,
        taskName: task.name,
      })
    }
  })

  return errors
}

/**
 * 格式化日期
 */
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 日期冲突规则定义
 */
export const dateConflictRule = {
  name: 'date-conflict-rule',
  description: '验证任务日期安排的合理性',
  validate: validateDateConflicts,
}
