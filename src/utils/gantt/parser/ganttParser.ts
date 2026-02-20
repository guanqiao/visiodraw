/**
 * 甘特图解析器
 * 将Mermaid甘特图脚本解析为结构化数据
 */

import type {
  GanttTask,
  GanttSection,
  ParsedGanttDiagram,
  ParseResult,
  ParseError,
  RawTaskDefinition,
  TaskStatus,
  TaskType,
  TaskPriority,
} from './types'
import {
  GrammarRules,
  DefaultConfig,
  Limits,
  StatusMap,
  TypeMap,
  ExtendedTags,
  parseExtendedProperty,
  parseProgress,
  parsePriority,
  parseDependency,
  parseDuration,
  parseDate,
  isValidTaskId,
  isStatusTag,
  isTypeTag,
} from './grammar'

/**
 * 甘特图解析器类
 */
export class GanttParser {
  private errors: ParseError[] = []
  private lineNumber = 0

  /**
   * 解析甘特图脚本
   * @param script Mermaid甘特图脚本
   * @returns 解析结果
   */
  parse(script: string): ParseResult {
    this.errors = []
    const lines = this.preprocessLines(script)

    // 检查是否以gantt开头
    if (lines.length === 0 || !GrammarRules.GANTT_DECLARATION.test(lines[0])) {
      this.addError('脚本应以 "gantt" 开头', 1)
      return { success: false, errors: this.errors }
    }

    let title: string | undefined
    let dateFormat = DefaultConfig.DATE_FORMAT
    const sections: GanttSection[] = []
    const rawTasks: Array<{ section: string | undefined; definition: RawTaskDefinition; line: number }> = []
    let currentSection: string | undefined
    let taskOrder = 0
    let sectionOrder = 0

    // 解析开始日期（用于计算）
    let baseDate = new Date(DefaultConfig.START_DATE)
    let currentDate = new Date(baseDate)

    // 从第二行开始解析
    for (let i = 1; i < lines.length; i++) {
      this.lineNumber = i + 1
      const line = lines[i]

      // 检查行长度限制
      if (line.length > Limits.MAX_LINE_LENGTH) {
        this.addError(`行长度超过限制(${Limits.MAX_LINE_LENGTH}字符): ${line.length}字符`, i + 1)
        continue
      }

      // 解析标题
      const titleMatch = line.match(GrammarRules.TITLE)
      if (titleMatch) {
        title = titleMatch[1].trim()
        continue
      }

      // 解析日期格式
      const dateFormatMatch = line.match(GrammarRules.DATE_FORMAT)
      if (dateFormatMatch) {
        dateFormat = dateFormatMatch[1].trim()
        continue
      }

      // 解析分组
      const sectionMatch = line.match(GrammarRules.SECTION)
      if (sectionMatch) {
        // 检查分组数限制
        if (sections.length >= Limits.MAX_SECTIONS) {
          this.addError(`分组数超过最大限制(${Limits.MAX_SECTIONS})`, i + 1)
          continue
        }
        currentSection = sectionMatch[1].trim()
        sections.push({
          id: `section-${sectionOrder}`,
          name: currentSection,
          order: sectionOrder++,
        })
        continue
      }

      // 解析任务
      const taskMatch = line.match(GrammarRules.TASK)
      if (taskMatch) {
        // 检查任务数限制
        if (rawTasks.length >= Limits.MAX_TASKS) {
          this.addError(`任务数超过最大限制(${Limits.MAX_TASKS})`, i + 1)
          continue
        }

        const taskName = taskMatch[1].trim()
        const taskDef = taskMatch[2].trim()

        const rawTask = this.parseTaskDefinition(taskName, taskDef, taskOrder, currentDate)
        if (rawTask) {
          rawTasks.push({
            section: currentSection,
            definition: rawTask,
            line: this.lineNumber,
          })

          // 更新当前日期
          if (rawTask.endDate) {
            currentDate = new Date(rawTask.endDate)
          }
          taskOrder++
        }
      }
    }

    // 构建任务列表
    const tasks = this.buildTasks(rawTasks, baseDate)

    // 计算日期范围
    const { startDate, endDate } = this.calculateDateRange(tasks, baseDate)

    // 检查错误
    if (this.errors.length > 0) {
      return { success: false, errors: this.errors }
    }

    // 检查是否有任务
    if (tasks.length === 0) {
      this.addError('未找到任何任务')
      return { success: false, errors: this.errors }
    }

    // 检查是否有分组
    if (sections.length === 0) {
      this.addError('未找到任何分组')
      return { success: false, errors: this.errors }
    }

    return {
      success: true,
      data: {
        title,
        dateFormat,
        sections,
        tasks,
        startDate,
        endDate,
      },
      errors: [],
    }
  }

  /**
   * 预处理脚本行
   * @param script 原始脚本
   * @returns 处理后的行数组
   */
  private preprocessLines(script: string): string[] {
    return script
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !GrammarRules.COMMENT.test(line))
  }

  /**
   * 解析任务定义
   * @param taskName 任务名称
   * @param taskDef 任务定义字符串
   * @param order 任务顺序
   * @param defaultDate 默认日期
   * @returns 原始任务定义
   */
  private parseTaskDefinition(
    taskName: string,
    taskDef: string,
    order: number,
    defaultDate: Date
  ): RawTaskDefinition | null {
    const parts = taskDef.split(',').map(p => p.trim())

    const rawTask: RawTaskDefinition = {
      name: taskName,
      tags: [],
      dependencies: [],
    }

    let hasId = false
    let hasDate = false

    for (const part of parts) {
      const lowerPart = part.toLowerCase()

      // 状态标签
      if (isStatusTag(lowerPart)) {
        rawTask.tags.push(lowerPart)
        continue
      }

      // 类型标签
      if (isTypeTag(lowerPart)) {
        rawTask.tags.push(lowerPart)
        continue
      }

      // 依赖关系 - 必须在扩展属性之前检查
      const depMatch = part.match(/^after\s+(.+)$/i)
      if (depMatch) {
        const deps = depMatch[1].split(/\s*,\s*/).map(id => id.trim())
        rawTask.dependencies.push(...deps)
        continue
      }

      // 扩展属性
      const extProp = parseExtendedProperty(part)
      if (extProp) {
        const [key, value] = extProp
        switch (key) {
          case ExtendedTags.TAG:
            rawTask.tags.push(value)
            break
          case ExtendedTags.ASSIGNEE:
            rawTask.assignee = value
            break
          case ExtendedTags.PROGRESS:
            const progress = parseProgress(value)
            if (progress !== null) {
              rawTask.progress = progress
            }
            break
          case ExtendedTags.PRIORITY:
            const priority = parsePriority(value)
            if (priority) {
              rawTask.priority = priority
            }
            break
        }
        continue
      }

      // 持续时间
      const duration = parseDuration(part)
      if (duration !== null) {
        rawTask.duration = duration
        continue
      }

      // 日期
      const date = parseDate(part)
      if (date) {
        rawTask.startDate = date
        hasDate = true
        continue
      }

      // 任务ID（必须是有效的标识符且未设置过）
      if (!hasId && isValidTaskId(part)) {
        rawTask.id = part
        hasId = true
        continue
      }
    }

    // 设置默认值
    if (!rawTask.id) {
      rawTask.id = `task-${order}`
    }
    if (!rawTask.duration) {
      rawTask.duration = DefaultConfig.DURATION
    }
    if (!rawTask.startDate) {
      rawTask.startDate = new Date(defaultDate)
    }

    return rawTask
  }

  /**
   * 构建任务列表
   * @param rawTasks 原始任务列表
   * @param baseDate 基准日期
   * @returns 任务列表
   */
  private buildTasks(
    rawTasks: Array<{ section: string | undefined; definition: RawTaskDefinition; line: number }>,
    baseDate: Date
  ): GanttTask[] {
    const tasks: GanttTask[] = []
    const taskMap = new Map<string, GanttTask>()
    const existingIds = new Set<string>()

    for (let i = 0; i < rawTasks.length; i++) {
      const { section, definition: raw, line } = rawTasks[i]

      // 检查任务ID是否重复，自动重命名
      let taskId = raw.id!
      if (existingIds.has(taskId)) {
        const originalId = taskId
        taskId = this.generateUniqueId(taskId, existingIds)
        this.addError(`任务ID重复: ${originalId}，已自动重命名为: ${taskId}`, line, 'warning')
      }
      raw.id = taskId
      existingIds.add(taskId)

      // 解析标签
      const status = this.parseStatus(raw.tags)
      const type = this.parseType(raw.tags)
      const tags = raw.tags.filter(t => !isStatusTag(t) && !isTypeTag(t))

      // 计算结束日期（使用日期对象操作，避免夏令时问题）
      const startDate = raw.startDate!
      const duration = raw.duration!
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + duration)

      const task: GanttTask = {
        id: raw.id!,
        name: raw.name,
        type,
        status,
        startDate,
        endDate,
        duration,
        section,
        dependencies: raw.dependencies,
        order: i,
        assignee: raw.assignee,
        progress: raw.progress,
        tags: tags.length > 0 ? tags : undefined,
        priority: raw.priority,
      }

      tasks.push(task)
      taskMap.set(task.id, task)
    }

    // 验证依赖关系
    this.validateDependencies(tasks, taskMap)

    return tasks
  }

  /**
   * 解析任务状态
   * @param tags 标签列表
   * @returns 任务状态
   */
  private parseStatus(tags: string[]): TaskStatus {
    for (const tag of tags) {
      const status = StatusMap[tag.toLowerCase()]
      if (status) {
        return status
      }
    }
    return 'default'
  }

  /**
   * 解析任务类型
   * @param tags 标签列表
   * @returns 任务类型
   */
  private parseType(tags: string[]): TaskType {
    for (const tag of tags) {
      const type = TypeMap[tag.toLowerCase()]
      if (type) {
        return type
      }
    }
    return 'task'
  }

  /**
   * 验证依赖关系
   * @param tasks 任务列表
   * @param taskMap 任务映射
   */
  private validateDependencies(tasks: GanttTask[], taskMap: Map<string, GanttTask>): void {
    for (const task of tasks) {
      for (const depId of task.dependencies) {
        if (!taskMap.has(depId)) {
          this.addError(`任务 "${task.name}" 依赖不存在的任务: ${depId}`)
        }
      }
    }
  }

  /**
   * 计算日期范围
   * @param tasks 任务列表
   * @param defaultDate 默认日期
   * @returns 日期范围
   */
  private calculateDateRange(
    tasks: GanttTask[],
    defaultDate: Date
  ): { startDate: Date; endDate: Date } {
    if (tasks.length === 0) {
      const endDate = new Date(defaultDate)
      endDate.setDate(endDate.getDate() + 30)
      return {
        startDate: defaultDate,
        endDate,
      }
    }

    const startTimes = tasks.map(t => t.startDate.getTime())
    const endTimes = tasks.map(t => t.endDate.getTime())

    return {
      startDate: new Date(Math.min(...startTimes)),
      endDate: new Date(Math.max(...endTimes)),
    }
  }

  /**
   * 生成唯一ID
   * @param baseId 基础ID
   * @param existingIds 已存在的ID集合
   * @returns 唯一ID
   */
  private generateUniqueId(baseId: string, existingIds: Set<string>): string {
    let counter = 1
    let newId = `${baseId}-${counter}`
    while (existingIds.has(newId)) {
      counter++
      newId = `${baseId}-${counter}`
    }
    return newId
  }

  /**
   * 添加错误信息
   * @param message 错误消息
   * @param line 行号（可选）
   * @param severity 严重程度（可选，默认为'error'）
   */
  private addError(message: string, line?: number, severity: 'error' | 'warning' = 'error'): void {
    this.errors.push({
      type: severity === 'error' ? 'syntax' : 'semantic',
      message,
      line: line || this.lineNumber,
    })
  }
}

/**
 * 解析甘特图脚本（便捷函数）
 * @param script Mermaid甘特图脚本
 * @returns 解析结果
 */
export function parseGanttScript(script: string): ParseResult {
  const parser = new GanttParser()
  return parser.parse(script)
}

/**
 * 解析甘特图脚本（简化版，只返回数据或null）
 * @param script Mermaid甘特图脚本
 * @returns 解析后的数据或null
 */
export function parseGanttScriptSimple(script: string): ParsedGanttDiagram | null {
  const result = parseGanttScript(script)
  return result.success ? result.data || null : null
}

// 导出默认实例
export const ganttParser = new GanttParser()
export default ganttParser
