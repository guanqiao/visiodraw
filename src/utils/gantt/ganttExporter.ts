/**
 * 甘特图数据导入导出器
 *
 * 支持多种格式的导入导出：
 * 1. Excel 导入/导出
 * 2. CSV 导入/导出
 * 3. JSON 导入/导出
 * 4. MS Project XML 导入
 * 5. Mermaid 脚本导出（已有）
 * 6. PDF/PNG 导出（通过画布）
 */

import type { GanttTask, GanttSection, ParsedGanttDiagram } from '../ganttDiagramGenerator'

export interface ExcelRow {
  任务ID: string
  任务名称: string
  分组: string
  开始日期: string
  结束日期: string
  持续时间: number
  状态: string
  依赖任务: string
  进度: number
}

export interface CSVRow {
  id: string
  name: string
  section: string
  startDate: string
  endDate: string
  duration: number
  status: string
  dependencies: string
  progress: number
}

export interface MSProjectTask {
  UID: number
  Name: string
  Start: string
  Finish: string
  Duration: string
  PercentComplete: number
  PredecessorUID?: number
  OutlineLevel: number
}

export class GanttExporter {
  /**
   * 导出为 Excel 格式（CSV格式，可被Excel打开）
   */
  exportToExcel(data: ParsedGanttDiagram): string {
    const rows: ExcelRow[] = data.tasks.map(task => {
      const section = data.sections.find(s => s.id === task.section)

      return {
        任务ID: task.id,
        任务名称: task.name,
        分组: section?.name || '',
        开始日期: this.formatDate(task.startDate),
        结束日期: this.formatDate(task.endDate),
        持续时间: task.duration,
        状态: this.translateStatus(task.status),
        依赖任务: task.dependencies.join(','),
        进度: task.status === 'done' ? 100 : task.status === 'active' ? 50 : 0,
      }
    })

    // 生成 CSV 内容
    const headers = Object.keys(rows[0] || {}).join(',')
    const csvRows = rows.map(row =>
      Object.values(row).map(value => `"${value}"`).join(',')
    )

    return [headers, ...csvRows].join('\n')
  }

  /**
   * 从 Excel/CSV 导入
   */
  importFromExcel(csvContent: string): Partial<ParsedGanttDiagram> {
    const lines = csvContent.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV文件格式错误')
    }

    // 解析表头
    const headers = this.parseCSVLine(lines[0])

    // 解析数据行
    const tasks: GanttTask[] = []
    const sections: GanttSection[] = []
    const sectionMap = new Map<string, string>()

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      const row: Record<string, string> = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      // 创建或获取分组
      const sectionName = row['分组'] || row['section'] || '默认分组'
      let sectionId = sectionMap.get(sectionName)
      if (!sectionId) {
        sectionId = `section-${sections.length}`
        sectionMap.set(sectionName, sectionId)
        sections.push({
          id: sectionId,
          name: sectionName,
          order: sections.length,
        })
      }

      // 创建任务
      const task: GanttTask = {
        id: row['任务ID'] || row['id'] || `task-${i}`,
        name: row['任务名称'] || row['name'] || `任务${i}`,
        type: 'task',
        status: this.parseStatus(row['状态'] || row['status']),
        startDate: new Date(row['开始日期'] || row['startDate'] || new Date()),
        endDate: new Date(row['结束日期'] || row['endDate'] || new Date()),
        duration: parseInt(row['持续时间'] || row['duration'] || '0', 10),
        dependencies: (row['依赖任务'] || row['dependencies'] || '')
          .split(',')
          .filter(Boolean),
        order: i - 1,
        section: sectionId,
      }

      tasks.push(task)
    }

    // 计算日期范围
    const startDates = tasks.map(t => t.startDate.getTime())
    const endDates = tasks.map(t => t.endDate.getTime())

    return {
      title: '导入的项目',
      dateFormat: 'YYYY-MM-DD',
      sections,
      tasks,
      startDate: new Date(Math.min(...startDates)),
      endDate: new Date(Math.max(...endDates)),
    }
  }

  /**
   * 导出为 JSON
   */
  exportToJSON(data: ParsedGanttDiagram): string {
    const exportData = {
      ...data,
      startDate: this.formatDate(data.startDate),
      endDate: this.formatDate(data.endDate),
      tasks: data.tasks.map(task => ({
        ...task,
        startDate: this.formatDate(task.startDate),
        endDate: this.formatDate(task.endDate),
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 从 JSON 导入
   */
  importFromJSON(json: string): ParsedGanttDiagram {
    const data = JSON.parse(json)

    return {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      tasks: data.tasks.map((task: any) => ({
        ...task,
        startDate: new Date(task.startDate),
        endDate: new Date(task.endDate),
      })),
    }
  }

  /**
   * 导出为 MS Project XML 格式
   */
  exportToMSProjectXML(data: ParsedGanttDiagram): string {
    const tasks: MSProjectTask[] = data.tasks.map((task, index) => ({
      UID: index + 1,
      Name: task.name,
      Start: this.formatDateTime(task.startDate),
      Finish: this.formatDateTime(task.endDate),
      Duration: `${task.duration} days`,
      PercentComplete: task.status === 'done' ? 100 : task.status === 'active' ? 50 : 0,
      OutlineLevel: 1,
    }))

    // 简单的 XML 模板
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>${data.title || 'Project'}</Name>
  <Tasks>
    ${tasks.map(task => `
    <Task>
      <UID>${task.UID}</UID>
      <Name>${this.escapeXml(task.Name)}</Name>
      <Start>${task.Start}</Start>
      <Finish>${task.Finish}</Finish>
      <Duration>${task.Duration}</Duration>
      <PercentComplete>${task.PercentComplete}</PercentComplete>
      <OutlineLevel>${task.OutlineLevel}</OutlineLevel>
    </Task>`).join('')}
  </Tasks>
</Project>`

    return xml
  }

  /**
   * 生成项目报告
   */
  generateReport(data: ParsedGanttDiagram): string {
    const totalTasks = data.tasks.length
    const completedTasks = data.tasks.filter(t => t.status === 'done').length
    const activeTasks = data.tasks.filter(t => t.status === 'active').length
    const notStartedTasks = data.tasks.filter(t => t.status === 'default').length

    const totalDuration = Math.max(
      ...data.tasks.map(t => t.duration),
      0
    )

    const report = `# 项目报告

## 基本信息
- 项目名称: ${data.title || '未命名项目'}
- 报告生成时间: ${new Date().toLocaleString('zh-CN')}

## 任务统计
- 总任务数: ${totalTasks}
- 已完成: ${completedTasks} (${Math.round((completedTasks / totalTasks) * 100)}%)
- 进行中: ${activeTasks} (${Math.round((activeTasks / totalTasks) * 100)}%)
- 未开始: ${notStartedTasks} (${Math.round((notStartedTasks / totalTasks) * 100)}%)

## 时间信息
- 项目开始: ${this.formatDate(data.startDate)}
- 项目结束: ${this.formatDate(data.endDate)}
- 项目工期: ${totalDuration} 天

## 分组信息
${data.sections.map(section => {
  const sectionTasks = data.tasks.filter(t => t.section === section.id)
  return `- ${section.name}: ${sectionTasks.length} 个任务`
}).join('\n')}

## 关键任务
${data.tasks
  .filter(t => t.status === 'crit')
  .map(t => `- ${t.name} (${this.formatDate(t.startDate)} - ${this.formatDate(t.endDate)})`)
  .join('\n') || '无'}
`

    return report
  }

  /**
   * 下载文件
   */
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * 导出并下载 Excel
   */
  downloadExcel(data: ParsedGanttDiagram, filename?: string): void {
    const content = this.exportToExcel(data)
    const name = filename || `${data.title || 'gantt'}_${this.formatDate(new Date())}.csv`
    this.downloadFile(content, name, 'text/csv;charset=utf-8;')
  }

  /**
   * 导出并下载 JSON
   */
  downloadJSON(data: ParsedGanttDiagram, filename?: string): void {
    const content = this.exportToJSON(data)
    const name = filename || `${data.title || 'gantt'}_${this.formatDate(new Date())}.json`
    this.downloadFile(content, name, 'application/json')
  }

  /**
   * 导出并下载 MS Project XML
   */
  downloadMSProjectXML(data: ParsedGanttDiagram, filename?: string): void {
    const content = this.exportToMSProjectXML(data)
    const name = filename || `${data.title || 'project'}_${this.formatDate(new Date())}.xml`
    this.downloadFile(content, name, 'application/xml')
  }

  /**
   * 导出并下载报告
   */
  downloadReport(data: ParsedGanttDiagram, filename?: string): void {
    const content = this.generateReport(data)
    const name = filename || `${data.title || 'report'}_${this.formatDate(new Date())}.md`
    this.downloadFile(content, name, 'text/markdown')
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  /**
   * 格式化日期时间
   */
  private formatDateTime(date: Date): string {
    return `${this.formatDate(date)}T00:00:00`
  }

  /**
   * 翻译状态
   */
  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      default: '未开始',
      done: '已完成',
      active: '进行中',
      crit: '关键任务',
    }
    return statusMap[status] || status
  }

  /**
   * 解析状态
   */
  private parseStatus(status: string): 'default' | 'done' | 'active' | 'crit' {
    const statusMap: Record<string, 'default' | 'done' | 'active' | 'crit'> = {
      '未开始': 'default',
      '已完成': 'done',
      '进行中': 'active',
      '关键任务': 'crit',
      'default': 'default',
      'done': 'done',
      'active': 'active',
      'crit': 'crit',
    }
    return statusMap[status] || 'default'
  }

  /**
   * 解析 CSV 行
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    values.push(current.trim())
    return values.map(v => v.replace(/^"|"$/g, ''))
  }

  /**
   * 转义 XML 特殊字符
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

// 导出单例
export const ganttExporter = new GanttExporter()
export default ganttExporter
