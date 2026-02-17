/**
 * 活动图模板
 * 对标 Mermaid flowchart/graph
 */

import type { DiagramTemplate, TemplateGenerateOptions } from '../types/diagramTemplate'
import { createTemplateNode, createTemplateEdge } from '../utils/diagramTemplateBuilder'

/**
 * 简单流程模板
 * 开始 -> 处理 -> 结束
 */
export function createSimpleFlowTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial', '', 0, options),
    createTemplateNode('process', 'uml-action', '处理', 1, options),
    createTemplateNode('end', 'uml-final', '', 2, options),
  ]

  const edges = [
    createTemplateEdge('start', 'process', undefined, 0),
    createTemplateEdge('process', 'end', undefined, 1),
  ]

  return {
    id: 'activity-simple-flow',
    name: '简单流程',
    description: '基本的开始-处理-结束流程',
    type: 'activity',
    nodes,
    edges,
    mermaidCode: `flowchart TD
    Start([开始]) --> Process[处理]
    Process --> End([结束])`,
  }
}

/**
 * 带判断的流程模板
 * 开始 -> 处理 -> 判断 -> (是)结束/(否)返回处理
 */
export function createDecisionFlowTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial', '', 0, options),
    createTemplateNode('input', 'uml-action', '输入数据', 1, options),
    createTemplateNode('decision', 'uml-decision', '有效?', 2, options),
    createTemplateNode('process', 'uml-action', '处理', 3, options),
    createTemplateNode('end', 'uml-final', '', 4, options),
  ]

  const edges = [
    createTemplateEdge('start', 'input', undefined, 0),
    createTemplateEdge('input', 'decision', undefined, 1),
    createTemplateEdge('decision', 'process', '是', 2),
    createTemplateEdge('decision', 'input', '否', 3),
    createTemplateEdge('process', 'end', undefined, 4),
  ]

  return {
    id: 'activity-decision-flow',
    name: '带判断的流程',
    description: '包含条件判断的流程',
    type: 'activity',
    nodes,
    edges,
    mermaidCode: `flowchart TD
    Start([开始]) --> Input[输入数据]
    Input --> Decision{有效?}
    Decision -->|是| Process[处理]
    Decision -->|否| Input
    Process --> End([结束])`,
  }
}

/**
 * 带循环的流程模板
 * 开始 -> 初始化 -> 循环条件 -> 处理 -> 循环条件
 */
export function createLoopFlowTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial', '', 0, options),
    createTemplateNode('init', 'uml-action', '初始化', 1, options),
    createTemplateNode('condition', 'uml-decision', 'i < n?', 2, options),
    createTemplateNode('process', 'uml-action', '处理', 3, options),
    createTemplateNode('increment', 'uml-action', 'i++', 4, options),
    createTemplateNode('end', 'uml-final', '', 5, options),
  ]

  const edges = [
    createTemplateEdge('start', 'init', undefined, 0),
    createTemplateEdge('init', 'condition', undefined, 1),
    createTemplateEdge('condition', 'process', '是', 2),
    createTemplateEdge('condition', 'end', '否', 3),
    createTemplateEdge('process', 'increment', undefined, 4),
    createTemplateEdge('increment', 'condition', undefined, 5),
  ]

  return {
    id: 'activity-loop-flow',
    name: '带循环的流程',
    description: '包含循环处理的流程',
    type: 'activity',
    nodes,
    edges,
    mermaidCode: `flowchart TD
    Start([开始]) --> Init[初始化]
    Init --> Condition{i < n?}
    Condition -->|是| Process[处理]
    Condition -->|否| End([结束])
    Process --> Increment[i++]
    Increment --> Condition`,
  }
}

/**
 * 并行流程模板
 * 开始 -> 分叉 -> 并行处理A/并行处理B -> 汇合 -> 结束
 */
export function createParallelFlowTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial', '', 0, options),
    createTemplateNode('fork', 'uml-fork', '', 1, options),
    createTemplateNode('processA', 'uml-action', '处理A', 2, options),
    createTemplateNode('processB', 'uml-action', '处理B', 3, options),
    createTemplateNode('join', 'uml-fork', '', 4, options),
    createTemplateNode('end', 'uml-final', '', 5, options),
  ]

  const edges = [
    createTemplateEdge('start', 'fork', undefined, 0),
    createTemplateEdge('fork', 'processA', undefined, 1),
    createTemplateEdge('fork', 'processB', undefined, 2),
    createTemplateEdge('processA', 'join', undefined, 3),
    createTemplateEdge('processB', 'join', undefined, 4),
    createTemplateEdge('join', 'end', undefined, 5),
  ]

  return {
    id: 'activity-parallel-flow',
    name: '并行流程',
    description: '包含并行处理的流程',
    type: 'activity',
    nodes,
    edges,
    mermaidCode: `flowchart TD
    Start([开始]) --> Fork[分叉]
    Fork --> ProcessA[处理A]
    Fork --> ProcessB[处理B]
    ProcessA --> Join[汇合]
    ProcessB --> Join
    Join --> End([结束])`,
  }
}

/**
 * 泳道流程模板
 */
export function createSwimlaneFlowTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial', '', 0, options),
    createTemplateNode('userAction', 'uml-action', '用户操作', 1, options),
    createTemplateNode('systemProcess', 'uml-action', '系统处理', 2, options),
    createTemplateNode('dbSave', 'uml-action', '数据存储', 3, options),
    createTemplateNode('end', 'uml-final', '', 4, options),
  ]

  const edges = [
    createTemplateEdge('start', 'userAction', undefined, 0),
    createTemplateEdge('userAction', 'systemProcess', undefined, 1),
    createTemplateEdge('systemProcess', 'dbSave', undefined, 2),
    createTemplateEdge('dbSave', 'end', undefined, 3),
  ]

  return {
    id: 'activity-swimlane-flow',
    name: '泳道流程',
    description: '按角色划分的泳道流程',
    type: 'activity',
    nodes,
    edges,
    mermaidCode: `flowchart TD
    Start([开始]) --> UserAction[用户操作]
    UserAction --> SystemProcess[系统处理]
    SystemProcess --> DBSave[数据存储]
    DBSave --> End([结束])`,
  }
}

/**
 * 获取所有活动图模板
 */
export function getActivityTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    createSimpleFlowTemplate(options),
    createDecisionFlowTemplate(options),
    createLoopFlowTemplate(options),
    createParallelFlowTemplate(options),
    createSwimlaneFlowTemplate(options),
  ]
}
