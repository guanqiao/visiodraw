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
 * 包含三个泳道：用户、系统、数据库
 */
export function createSwimlaneFlowTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const laneWidth = 200
  const laneHeight = 300
  const poolWidth = laneWidth * 3
  const poolHeight = laneHeight
  const headerHeight = 40

  const nodes = [
    {
      id: 'pool',
      type: 'uml-swimlane-pool',
      x: 50,
      y: 50,
      width: poolWidth,
      height: poolHeight,
      text: '订单处理流程',
      fill: '#fafafa',
      stroke: '#d9d9d9',
      strokeWidth: 1.5,
    },
    {
      id: 'lane-user',
      type: 'uml-swimlane-vertical',
      x: 50,
      y: 50 + headerHeight,
      width: laneWidth,
      height: poolHeight - headerHeight,
      text: '用户',
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 1,
    },
    {
      id: 'lane-system',
      type: 'uml-swimlane-vertical',
      x: 50 + laneWidth,
      y: 50 + headerHeight,
      width: laneWidth,
      height: poolHeight - headerHeight,
      text: '系统',
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 1,
    },
    {
      id: 'lane-database',
      type: 'uml-swimlane-vertical',
      x: 50 + laneWidth * 2,
      y: 50 + headerHeight,
      width: laneWidth,
      height: poolHeight - headerHeight,
      text: '数据库',
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 1,
    },
    {
      id: 'start',
      type: 'uml-initial',
      x: 120,
      y: 130,
      width: 30,
      height: 30,
      text: '',
      fill: '#52c41a',
      stroke: '#52c41a',
      strokeWidth: 2,
    },
    {
      id: 'userAction',
      type: 'uml-action',
      x: 80,
      y: 180,
      width: 100,
      height: 50,
      text: '提交订单',
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
    },
    {
      id: 'systemProcess',
      type: 'uml-action',
      x: 280,
      y: 180,
      width: 100,
      height: 50,
      text: '处理订单',
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
    },
    {
      id: 'dbSave',
      type: 'uml-action',
      x: 480,
      y: 180,
      width: 100,
      height: 50,
      text: '保存数据',
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 2,
    },
    {
      id: 'end',
      type: 'uml-final',
      x: 320,
      y: 270,
      width: 30,
      height: 30,
      text: '',
      fill: '#f5222d',
      stroke: '#f5222d',
      strokeWidth: 2,
    },
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
    description: '按角色划分的泳道流程，包含用户、系统、数据库三个泳道',
    type: 'activity',
    nodes,
    edges,
    mermaidCode: `flowchart TD
    subgraph UserLane [用户]
        Start([开始]) --> UserAction[提交订单]
    end
    subgraph SystemLane [系统]
        UserAction --> SystemProcess[处理订单]
    end
    subgraph DBLane [数据库]
        SystemProcess --> DBSave[保存数据]
    end
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
