/**
 * 甘特图模板
 * 基于新的示例系统，提供更丰富的模板选择
 * 
 * @version 2.0.0
 * @updated 2024-01-19
 */

import type { DiagramTemplate, TemplateGenerateOptions } from '../types/diagramTemplate'
import { createTemplateNode, createTemplateEdge } from '../utils/diagramTemplateBuilder'
import {
  simpleExample,
  softwareExample,
  milestoneExample,
  agileExample,
  criticalExample,
  constructionExample,
  productLaunchExample,
  researchExample,
  ganttExamples,
} from '../utils/gantt/examples'

/**
 * 创建甘特图模板的通用函数
 */
function createGanttTemplate(
  example: typeof ganttExamples[0],
  options: TemplateGenerateOptions = {}
): DiagramTemplate {
  // 从示例代码中提取节点（简化处理，实际使用时由ganttDiagramGenerator生成）
  const nodes: DiagramTemplate['nodes'] = []
  const lines = example.code.split('\n')
  let order = 0

  lines.forEach(line => {
    const trimmed = line.trim()
    // 检测分组
    if (trimmed.startsWith('section ')) {
      const sectionName = trimmed.replace('section ', '').trim()
      nodes.push(createTemplateNode(
        `section-${order}`,
        'gantt-section',
        sectionName,
        order,
        options
      ))
      order++
    }
    // 检测任务行（包含冒号）
    else if (trimmed.includes(':') && !trimmed.startsWith('title') && !trimmed.startsWith('dateFormat')) {
      const taskName = trimmed.split(':')[0].trim()
      nodes.push(createTemplateNode(
        `task-${order}`,
        'gantt-task',
        taskName,
        order,
        options
      ))
      order++
    }
  })

  return {
    id: `gantt-${example.id}`,
    name: example.name,
    description: example.description,
    type: 'gantt',
    nodes,
    edges: [],
    mermaidCode: example.code,
  }
}

/**
 * 简单甘特图模板
 */
export function createSimpleGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  return createGanttTemplate(simpleExample, options)
}

/**
 * 软件开发甘特图模板
 */
export function createSoftwareGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  return createGanttTemplate(softwareExample, options)
}

/**
 * 里程碑甘特图模板
 */
export function createMilestoneGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  return createGanttTemplate(milestoneExample, options)
}

/**
 * 敏捷迭代甘特图模板
 */
export function createAgileGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  return createGanttTemplate(agileExample, options)
}

/**
 * 关键路径甘特图模板
 */
export function createCriticalPathGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  return createGanttTemplate(criticalExample, options)
}

/**
 * 建筑工程甘特图模板（新增）
 */
export function createConstructionGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  return createGanttTemplate(constructionExample, options)
}

/**
 * 产品发布甘特图模板（新增）
 */
export function createProductLaunchGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  return createGanttTemplate(productLaunchExample, options)
}

/**
 * 研发管理甘特图模板（新增）
 */
export function createResearchGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  return createGanttTemplate(researchExample, options)
}

/**
 * 获取所有甘特图模板
 * @returns 甘特图模板列表（8个模板）
 */
export function getGanttTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    createSimpleGanttTemplate(options),
    createSoftwareGanttTemplate(options),
    createMilestoneGanttTemplate(options),
    createAgileGanttTemplate(options),
    createCriticalPathGanttTemplate(options),
    createConstructionGanttTemplate(options),
    createProductLaunchGanttTemplate(options),
    createResearchGanttTemplate(options),
  ]
}

/**
 * 根据ID获取甘特图模板
 * @param id 模板ID
 * @param options 生成选项
 * @returns 模板或undefined
 */
export function getGanttTemplateById(
  id: string,
  options: TemplateGenerateOptions = {}
): DiagramTemplate | undefined {
  const templates = getGanttTemplates(options)
  return templates.find(t => t.id === id || t.id === `gantt-${id}`)
}

/**
 * 获取甘特图模板数量
 * @returns 模板数量
 */
export function getGanttTemplateCount(): number {
  return ganttExamples.length
}

// 导出示例供外部使用
export {
  simpleExample,
  softwareExample,
  milestoneExample,
  agileExample,
  criticalExample,
  constructionExample,
  productLaunchExample,
  researchExample,
  ganttExamples,
}
