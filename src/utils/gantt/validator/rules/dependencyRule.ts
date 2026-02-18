/**
 * 依赖关系验证规则
 * 检测循环依赖、无效依赖等问题
 */

import type { ValidationError, DependencyNode, CycleInfo } from '../types'
import type { GanttTask, ParsedGanttDiagram } from '../../parser/types'

/**
 * 验证依赖关系
 * @param data 解析后的甘特图数据
 * @returns 验证错误列表
 */
export function validateDependencies(data: ParsedGanttDiagram): ValidationError[] {
  const errors: ValidationError[] = []
  const taskMap = new Map<string, GanttTask>()

  // 构建任务映射
  data.tasks.forEach(task => {
    taskMap.set(task.id, task)
  })

  // 检查无效依赖
  errors.push(...validateInvalidDependencies(data.tasks, taskMap))

  // 检查循环依赖
  errors.push(...validateCircularDependencies(data.tasks, taskMap))

  // 检查自依赖
  errors.push(...validateSelfDependencies(data.tasks))

  return errors
}

/**
 * 验证无效依赖（依赖不存在的任务）
 */
function validateInvalidDependencies(
  tasks: GanttTask[],
  taskMap: Map<string, GanttTask>
): ValidationError[] {
  const errors: ValidationError[] = []

  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      if (!taskMap.has(depId)) {
        errors.push({
          type: 'invalid-dependency',
          severity: 'error',
          message: `任务 "${task.name}" 依赖不存在的任务: ${depId}`,
          taskId: task.id,
          taskName: task.name,
        })
      }
    })
  })

  return errors
}

/**
 * 验证循环依赖
 */
function validateCircularDependencies(
  tasks: GanttTask[],
  taskMap: Map<string, GanttTask>
): ValidationError[] {
  const errors: ValidationError[] = []
  const cycles = detectCycles(tasks, taskMap)

  cycles.forEach(cycle => {
    const taskNames = cycle.cycle.map(id => taskMap.get(id)?.name || id).join(' → ')
    errors.push({
      type: 'circular-dependency',
      severity: 'error',
      message: `检测到循环依赖: ${taskNames}`,
    })
  })

  return errors
}

/**
 * 验证自依赖
 */
function validateSelfDependencies(tasks: GanttTask[]): ValidationError[] {
  const errors: ValidationError[] = []

  tasks.forEach(task => {
    if (task.dependencies.includes(task.id)) {
      errors.push({
        type: 'self-dependency',
        severity: 'error',
        message: `任务 "${task.name}" 不能依赖自身`,
        taskId: task.id,
        taskName: task.name,
      })
    }
  })

  return errors
}

/**
 * 检测循环依赖（使用DFS算法）
 */
function detectCycles(
  tasks: GanttTask[],
  taskMap: Map<string, GanttTask>
): CycleInfo[] {
  const cycles: CycleInfo[] = []
  const nodes = buildDependencyGraph(tasks)
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  function dfs(taskId: string, path: string[]): boolean {
    if (recursionStack.has(taskId)) {
      // 发现循环
      const cycleStart = path.indexOf(taskId)
      const cycle = path.slice(cycleStart).concat([taskId])
      cycles.push({
        cycle,
        description: cycle.join(' → '),
      })
      return true
    }

    if (visited.has(taskId)) {
      return false
    }

    visited.add(taskId)
    recursionStack.add(taskId)
    path.push(taskId)

    const node = nodes.get(taskId)
    if (node) {
      for (const depId of node.dependencies) {
        if (taskMap.has(depId)) {
          dfs(depId, [...path])
        }
      }
    }

    recursionStack.delete(taskId)
    return false
  }

  tasks.forEach(task => {
    if (!visited.has(task.id)) {
      dfs(task.id, [])
    }
  })

  return cycles
}

/**
 * 构建依赖图
 */
function buildDependencyGraph(tasks: GanttTask[]): Map<string, DependencyNode> {
  const nodes = new Map<string, DependencyNode>()

  // 初始化所有节点
  tasks.forEach(task => {
    nodes.set(task.id, {
      task,
      dependencies: [...task.dependencies],
      dependents: [],
      visited: false,
      visiting: false,
    })
  })

  // 构建反向依赖关系
  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      const depNode = nodes.get(depId)
      if (depNode) {
        depNode.dependents.push(task.id)
      }
    })
  })

  return nodes
}

/**
 * 依赖规则定义
 */
export const dependencyRule = {
  name: 'dependency-rule',
  description: '验证任务依赖关系的有效性',
  validate: validateDependencies,
}
