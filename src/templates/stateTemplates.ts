/**
 * 状态图模板
 * 对标 Mermaid stateDiagram
 */

import type { DiagramTemplate, TemplateGenerateOptions } from '../types/diagramTemplate'
import { createTemplateNode, createTemplateEdge } from '../utils/diagramTemplateBuilder'

/**
 * 简单状态机模板
 */
export function createSimpleStateTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial-state', '', 0, options),
    createTemplateNode('idle', 'uml-state', '空闲', 1, options),
    createTemplateNode('running', 'uml-state', '运行中', 2, options),
    createTemplateNode('stopped', 'uml-state', '已停止', 3, options),
    createTemplateNode('end', 'uml-final-state', '', 4, options),
  ]

  const edges = [
    createTemplateEdge('start', 'idle', undefined, 0),
    createTemplateEdge('idle', 'running', '启动', 1),
    createTemplateEdge('running', 'stopped', '停止', 2),
    createTemplateEdge('stopped', 'end', undefined, 3),
  ]

  return {
    id: 'state-simple',
    name: '简单状态机',
    description: '基本的状态转换',
    type: 'state',
    nodes,
    edges,
    mermaidCode: `stateDiagram
    [*] --> Idle
    Idle --> Running: 启动
    Running --> Stopped: 停止
    Stopped --> [*]`,
  }
}

/**
 * 带自循环的状态机模板
 */
export function createSelfLoopStateTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial-state', '', 0, options),
    createTemplateNode('processing', 'uml-state', '处理中', 1, options),
    createTemplateNode('end', 'uml-final-state', '', 2, options),
  ]

  const edges = [
    createTemplateEdge('start', 'processing', undefined, 0),
    {
      ...createTemplateEdge('processing', 'processing', '继续', 1),
      // 自循环边配置
      isSelfLoop: true,
      selfLoopConfig: {
        direction: 'top',
        radius: 35,
      },
    },
    createTemplateEdge('processing', 'end', '完成', 2),
  ]

  return {
    id: 'state-self-loop',
    name: '自循环状态机',
    description: '状态可以转换到自身',
    type: 'state',
    nodes,
    edges,
    mermaidCode: `stateDiagram
    [*] --> Processing
    Processing --> Processing: 继续
    Processing --> [*]: 完成`,
  }
}

/**
 * 复合状态模板
 */
export function createCompositeStateTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial-state', '', 0, options),
    createTemplateNode('active', 'uml-state-composite', '活跃', 1, options),
    createTemplateNode('inactive', 'uml-state', '非活跃', 2, options),
    createTemplateNode('end', 'uml-final-state', '', 3, options),
  ]

  const edges = [
    createTemplateEdge('start', 'active', undefined, 0),
    createTemplateEdge('active', 'inactive', '暂停', 1),
    createTemplateEdge('inactive', 'active', '恢复', 2),
    createTemplateEdge('active', 'end', '退出', 3),
  ]

  return {
    id: 'state-composite',
    name: '复合状态',
    description: '包含子状态的状态',
    type: 'state',
    nodes,
    edges,
    mermaidCode: `stateDiagram
    [*] --> Active
    state Active {
        [*] --> SubState1
        SubState1 --> SubState2
    }
    Active --> Inactive: 暂停
    Inactive --> Active: 恢复
    Active --> [*]: 退出`,
  }
}

/**
 * 并发状态模板
 */
export function createConcurrentStateTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial-state', '', 0, options),
    createTemplateNode('fork', 'uml-fork', '', 1, options),
    createTemplateNode('stateA', 'uml-state', '状态A', 2, options),
    createTemplateNode('stateB', 'uml-state', '状态B', 3, options),
    createTemplateNode('join', 'uml-fork', '', 4, options),
    createTemplateNode('end', 'uml-final-state', '', 5, options),
  ]

  const edges = [
    createTemplateEdge('start', 'fork', undefined, 0),
    createTemplateEdge('fork', 'stateA', undefined, 1),
    createTemplateEdge('fork', 'stateB', undefined, 2),
    createTemplateEdge('stateA', 'join', undefined, 3),
    createTemplateEdge('stateB', 'join', undefined, 4),
    createTemplateEdge('join', 'end', undefined, 5),
  ]

  return {
    id: 'state-concurrent',
    name: '并发状态',
    description: '同时执行多个状态',
    type: 'state',
    nodes,
    edges,
    mermaidCode: `stateDiagram
    [*] --> Fork
    state Fork <<fork>>
    Fork --> StateA
    Fork --> StateB
    state Join <<join>>
    StateA --> Join
    StateB --> Join
    Join --> [*]`,
  }
}

/**
 * 历史状态模板
 */
export function createHistoryStateTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('start', 'uml-initial-state', '', 0, options),
    createTemplateNode('running', 'uml-state', '运行', 1, options),
    createTemplateNode('paused', 'uml-state', '暂停', 2, options),
    createTemplateNode('history', 'uml-state-history', 'H', 3, options),
    createTemplateNode('end', 'uml-final-state', '', 4, options),
  ]

  const edges = [
    createTemplateEdge('start', 'running', undefined, 0),
    createTemplateEdge('running', 'paused', '暂停', 1),
    createTemplateEdge('paused', 'history', '恢复', 2),
    createTemplateEdge('history', 'running', undefined, 3),
    createTemplateEdge('running', 'end', '停止', 4),
  ]

  return {
    id: 'state-history',
    name: '历史状态',
    description: '记住之前的状态',
    type: 'state',
    nodes,
    edges,
    mermaidCode: `stateDiagram
    [*] --> Running
    Running --> Paused: 暂停
    Paused --> History: 恢复
    History --> Running
    Running --> [*]: 停止`,
  }
}

/**
 * 获取所有状态图模板
 */
export function getStateTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    createSimpleStateTemplate(options),
    createSelfLoopStateTemplate(options),
    createCompositeStateTemplate(options),
    createConcurrentStateTemplate(options),
    createHistoryStateTemplate(options),
  ]
}
