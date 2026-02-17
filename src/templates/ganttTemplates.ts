/**
 * 甘特图模板
 * 对标 Mermaid gantt
 */

import type { DiagramTemplate, TemplateGenerateOptions } from '../types/diagramTemplate'
import { createTemplateNode, createTemplateEdge } from '../utils/diagramTemplateBuilder'

/**
 * 简单甘特图模板
 */
export function createSimpleGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('section1', 'uml-action', '项目规划', 0, options),
    createTemplateNode('task1', 'uml-action', '需求分析', 1, options),
    createTemplateNode('task2', 'uml-action', '设计阶段', 2, options),
    createTemplateNode('section2', 'uml-action', '开发阶段', 3, options),
    createTemplateNode('task3', 'uml-action', '编码实现', 4, options),
    createTemplateNode('task4', 'uml-action', '测试验证', 5, options),
  ]

  return {
    id: 'gantt-simple',
    name: '简单甘特图',
    description: '基本项目进度规划',
    type: 'gantt',
    nodes,
    edges: [],
    mermaidCode: `gantt
    title 项目进度计划
    dateFormat YYYY-MM-DD
    section 项目规划
    需求分析    :done, a1, 2024-01-01, 7d
    设计阶段    :active, a2, after a1, 5d
    section 开发阶段
    编码实现    :a3, after a2, 14d
    测试验证    :a4, after a3, 7d`,
  }
}

/**
 * 软件开发甘特图模板
 */
export function createSoftwareGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('section1', 'uml-action', '需求分析', 0, options),
    createTemplateNode('req1', 'uml-action', '用户调研', 1, options),
    createTemplateNode('req2', 'uml-action', '需求文档', 2, options),
    createTemplateNode('section2', 'uml-action', '系统设计', 3, options),
    createTemplateNode('design1', 'uml-action', '架构设计', 4, options),
    createTemplateNode('design2', 'uml-action', 'UI设计', 5, options),
    createTemplateNode('section3', 'uml-action', '开发实现', 6, options),
    createTemplateNode('dev1', 'uml-action', '前端开发', 7, options),
    createTemplateNode('dev2', 'uml-action', '后端开发', 8, options),
    createTemplateNode('section4', 'uml-action', '测试部署', 9, options),
    createTemplateNode('test1', 'uml-action', '功能测试', 10, options),
    createTemplateNode('deploy1', 'uml-action', '上线部署', 11, options),
  ]

  return {
    id: 'gantt-software',
    name: '软件开发计划',
    description: '软件项目完整开发周期',
    type: 'gantt',
    nodes,
    edges: [],
    mermaidCode: `gantt
    title 软件开发项目计划
    dateFormat YYYY-MM-DD
    
    section 需求分析
    用户调研    :done, req1, 2024-01-01, 5d
    需求文档    :done, req2, after req1, 3d
    
    section 系统设计
    架构设计    :active, arch1, after req2, 7d
    UI设计      :ui1, after req2, 5d
    
    section 开发实现
    前端开发    :fe1, after ui1, 14d
    后端开发    :be1, after arch1, 14d
    
    section 测试部署
    功能测试    :test1, after fe1, 7d
    上线部署    :deploy1, after test1, 2d`,
  }
}

/**
 * 里程碑甘特图模板
 */
export function createMilestoneGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('section1', 'uml-action', '第一阶段', 0, options),
    createTemplateNode('m1', 'uml-initial', 'M1', 1, options),
    createTemplateNode('section2', 'uml-action', '第二阶段', 2, options),
    createTemplateNode('m2', 'uml-initial', 'M2', 3, options),
    createTemplateNode('section3', 'uml-action', '第三阶段', 4, options),
    createTemplateNode('m3', 'uml-initial', 'M3', 5, options),
  ]

  return {
    id: 'gantt-milestone',
    name: '里程碑计划',
    description: '带里程碑的项目计划',
    type: 'gantt',
    nodes,
    edges: [],
    mermaidCode: `gantt
    title 项目里程碑计划
    dateFormat YYYY-MM-DD
    
    section 第一阶段
    需求确认    :done, a1, 2024-01-01, 10d
    里程碑1     :milestone, m1, after a1, 0d
    
    section 第二阶段
    开发完成    :a2, after m1, 20d
    里程碑2     :milestone, m2, after a2, 0d
    
    section 第三阶段
    测试通过    :a3, after m2, 10d
    里程碑3     :milestone, m3, after a3, 0d`,
  }
}

/**
 * 敏捷迭代甘特图模板
 */
export function createAgileGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('section1', 'uml-action', 'Sprint 1', 0, options),
    createTemplateNode('sp1-task1', 'uml-action', '需求评审', 1, options),
    createTemplateNode('sp1-task2', 'uml-action', '开发实现', 2, options),
    createTemplateNode('sp1-task3', 'uml-action', 'Sprint评审', 3, options),
    createTemplateNode('section2', 'uml-action', 'Sprint 2', 4, options),
    createTemplateNode('sp2-task1', 'uml-action', '需求评审', 5, options),
    createTemplateNode('sp2-task2', 'uml-action', '开发实现', 6, options),
    createTemplateNode('sp2-task3', 'uml-action', 'Sprint评审', 7, options),
  ]

  return {
    id: 'gantt-agile',
    name: '敏捷迭代计划',
    description: 'Scrum Sprint 迭代计划',
    type: 'gantt',
    nodes,
    edges: [],
    mermaidCode: `gantt
    title 敏捷迭代计划
    dateFormat YYYY-MM-DD
    
    section Sprint 1
    需求评审    :done, sp1-1, 2024-01-01, 1d
    开发实现    :active, sp1-2, after sp1-1, 8d
    Sprint评审  :sp1-3, after sp1-2, 1d
    
    section Sprint 2
    需求评审    :sp2-1, after sp1-3, 1d
    开发实现    :sp2-2, after sp2-1, 8d
    Sprint评审  :sp2-3, after sp2-2, 1d`,
  }
}

/**
 * 关键路径甘特图模板
 */
export function createCriticalPathGanttTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('section1', 'uml-action', '关键任务', 0, options),
    createTemplateNode('crit1', 'uml-action', '核心架构', 1, options),
    createTemplateNode('crit2', 'uml-action', '数据库设计', 2, options),
    createTemplateNode('section2', 'uml-action', '依赖任务', 3, options),
    createTemplateNode('dep1', 'uml-action', 'API开发', 4, options),
    createTemplateNode('dep2', 'uml-action', '前端集成', 5, options),
  ]

  return {
    id: 'gantt-critical',
    name: '关键路径计划',
    description: '突出关键任务的甘特图',
    type: 'gantt',
    nodes,
    edges: [],
    mermaidCode: `gantt
    title 关键路径计划
    dateFormat YYYY-MM-DD
    
    section 关键任务
    核心架构    :crit, done, c1, 2024-01-01, 5d
    数据库设计  :crit, active, c2, after c1, 3d
    
    section 依赖任务
    API开发     :crit, c3, after c2, 7d
    前端集成    :c4, after c3, 5d`,
  }
}

/**
 * 获取所有甘特图模板
 */
export function getGanttTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    createSimpleGanttTemplate(options),
    createSoftwareGanttTemplate(options),
    createMilestoneGanttTemplate(options),
    createAgileGanttTemplate(options),
    createCriticalPathGanttTemplate(options),
  ]
}
