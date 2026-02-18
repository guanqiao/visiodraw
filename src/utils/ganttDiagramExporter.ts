/**
 * 甘特图导出器
 * 将画布图形反向导出为 Mermaid 甘特图脚本
 */

import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector } from '../types/connection'

export interface ExportOptions {
  includeTitle?: boolean
  includeDateFormat?: boolean
  dateFormat?: string
}

export class GanttDiagramExporter {
  /**
   * 将图形导出为 Mermaid 甘特图脚本
   */
  export(
    nodes: ShapeData[],
    edges: Connector[],
    options: ExportOptions = {}
  ): string {
    const {
      includeTitle = true,
      includeDateFormat = true,
      dateFormat = 'YYYY-MM-DD',
    } = options

    const lines: string[] = []

    // 脚本头部
    lines.push('gantt')

    // 标题
    if (includeTitle) {
      const title = this.extractTitle(nodes)
      if (title) {
        lines.push(`    title ${title}`)
      }
    }

    // 日期格式
    if (includeDateFormat) {
      lines.push(`    dateFormat ${dateFormat}`)
    }

    // 提取分组和任务
    const sections = this.extractSections(nodes)
    const tasks = this.extractTasks(nodes)
    const dependencies = this.extractDependencies(edges, tasks)

    // 按分组组织任务
    sections.forEach(section => {
      lines.push('')
      lines.push(`    section ${section.name}`)

      const sectionTasks = tasks.filter(t => t.section === section.name)
      sectionTasks.forEach(task => {
        const taskLine = this.formatTaskLine(task, dependencies)
        lines.push(`    ${taskLine}`)
      })
    })

    return lines.join('\n')
  }

  private extractTitle(nodes: ShapeData[]): string | null {
    const titleNode = nodes.find(n => n.id === 'gantt-title')
    return titleNode?.text || null
  }

  private extractSections(nodes: ShapeData[]): Array<{ id: string; name: string; order: number }> {
    const sections: Array<{ id: string; name: string; order: number }> = []

    nodes.forEach(node => {
      if (node.id.startsWith('section-') && node.type === 'uml-section-header') {
        const sectionId = node.id.replace('section-', '')
        sections.push({
          id: sectionId,
          name: node.text || sectionId,
          order: node.y || 0,
        })
      }
    })

    // 按Y坐标排序
    return sections.sort((a, b) => a.order - b.order)
  }

  private extractTasks(nodes: ShapeData[]): Array<{
    id: string
    name: string
    type: 'task' | 'milestone'
    status: string
    startDate?: Date
    duration?: number
    section?: string
    order: number
  }> {
    const tasks: Array<{
      id: string
      name: string
      type: 'task' | 'milestone'
      status: string
      startDate?: Date
      duration?: number
      section?: string
      order: number
    }> = []

    // 任务节点映射（用于查找section）
    const taskNodeMap = new Map<string, ShapeData>()

    nodes.forEach(node => {
      if (node.id.startsWith('task-')) {
        const taskId = node.id.replace('task-', '')
        taskNodeMap.set(taskId, node)

        // 从填充色推断状态
        const status = this.inferStatusFromFill(node.fill || '')

        tasks.push({
          id: taskId,
          name: node.text || taskId,
          type: 'task',
          status,
          order: node.y || 0,
        })
      } else if (node.id.startsWith('milestone-')) {
        const milestoneId = node.id.replace('milestone-', '')
        taskNodeMap.set(milestoneId, node)

        const status = this.inferMilestoneStatusFromFill(node.fill || '')

        tasks.push({
          id: milestoneId,
          name: this.extractMilestoneName(node.text || ''),
          type: 'milestone',
          status,
          order: node.y || 0,
        })
      }
    })

    // 确定每个任务所属的分组
    const sections = this.extractSections(nodes)
    tasks.forEach(task => {
      const taskNode = taskNodeMap.get(task.id)
      if (taskNode) {
        // 根据Y坐标找到对应的分组
        const section = sections.find(s => {
          const sectionNode = nodes.find(n => n.id === `section-${s.id}`)
          if (sectionNode) {
            return taskNode.y >= sectionNode.y &&
                   taskNode.y < sectionNode.y + sectionNode.height
          }
          return false
        })
        if (section) {
          task.section = section.name
        }
      }
    })

    // 按Y坐标排序
    return tasks.sort((a, b) => a.order - b.order)
  }

  private extractDependencies(
    edges: Connector[],
    tasks: Array<{ id: string }>
  ): Map<string, string[]> {
    const dependencies = new Map<string, string[]>()
    const taskIds = new Set(tasks.map(t => t.id))

    edges.forEach(edge => {
      if (edge.id.startsWith('dep-')) {
        // 解析依赖关系ID: dep-{sourceId}-{targetId}
        const parts = edge.id.replace('dep-', '').split('-')
        if (parts.length >= 2) {
          const sourceId = parts[0]
          const targetId = parts[1]

          if (taskIds.has(sourceId) && taskIds.has(targetId)) {
            if (!dependencies.has(targetId)) {
              dependencies.set(targetId, [])
            }
            dependencies.get(targetId)!.push(sourceId)
          }
        }
      }
    })

    return dependencies
  }

  private formatTaskLine(
    task: {
      id: string
      name: string
      type: 'task' | 'milestone'
      status: string
      startDate?: Date
      duration?: number
    },
    dependencies: Map<string, string[]>
  ): string {
    const parts: string[] = []

    // 任务名称
    parts.push(task.name)

    // 状态和标签
    const tags: string[] = []
    if (task.status === 'done') tags.push('done')
    if (task.status === 'active') tags.push('active')
    if (task.status === 'crit') tags.push('crit')
    if (task.type === 'milestone') tags.push('milestone')

    // 任务ID
    if (tags.length > 0) {
      parts.push(`${tags.join(', ')}, ${task.id}`)
    } else {
      parts.push(task.id)
    }

    // 开始时间或依赖
    const deps = dependencies.get(task.id)
    if (deps && deps.length > 0) {
      parts.push(`after ${deps.join(', ')}`)
    } else if (task.startDate) {
      parts.push(this.formatDate(task.startDate))
    }

    // 持续时间
    if (task.type === 'milestone') {
      parts.push('0d')
    } else if (task.duration) {
      parts.push(`${task.duration}d`)
    }

    return parts.join(' : ')
  }

  private inferStatusFromFill(fill: string): string {
    const statusMap: Record<string, string> = {
      '#b7eb8f': 'done',
      '#91d5ff': 'active',
      '#ffa39e': 'crit',
      '#f5f5f5': 'default',
    }
    return statusMap[fill.toLowerCase()] || 'default'
  }

  private inferMilestoneStatusFromFill(fill: string): string {
    return fill.toLowerCase() === '#52c41a' ? 'done' : 'default'
  }

  private extractMilestoneName(text: string): string {
    // 移除前缀 "◆ "
    return text.replace(/^◆\s*/, '')
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

// 导出单例实例
export const ganttDiagramExporter = new GanttDiagramExporter()
export default ganttDiagramExporter
