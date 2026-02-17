/**
 * 序列图模板
 * 对标 Mermaid sequenceDiagram
 */

import type { DiagramTemplate, TemplateGenerateOptions } from '../types/diagramTemplate'
import { createTemplateNode, createTemplateEdge } from '../utils/diagramTemplateBuilder'

/**
 * 简单序列图模板
 */
export function createSimpleSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('user', 'uml-lifeline', '用户', 0, options),
    createTemplateNode('system', 'uml-lifeline', '系统', 1, options),
    createTemplateNode('database', 'uml-lifeline', '数据库', 2, options),
  ]

  const edges = [
    createTemplateEdge('user', 'system', '请求数据', 0),
    createTemplateEdge('system', 'database', '查询', 1),
    createTemplateEdge('database', 'system', '返回结果', 2),
    createTemplateEdge('system', 'user', '响应', 3),
  ]

  return {
    id: 'sequence-simple',
    name: '简单序列图',
    description: '基本的请求-响应流程',
    type: 'sequence',
    nodes,
    edges,
    mermaidCode: `sequenceDiagram
    participant User as 用户
    participant System as 系统
    participant DB as 数据库
    User->>System: 请求数据
    System->>DB: 查询
    DB-->>System: 返回结果
    System-->>User: 响应`,
  }
}

/**
 * 带激活条的序列图模板
 */
export function createActivationSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('client', 'uml-lifeline', '客户端', 0, options),
    createTemplateNode('service', 'uml-lifeline', '服务层', 1, options),
    createTemplateNode('dao', 'uml-lifeline', '数据层', 2, options),
  ]

  const edges = [
    createTemplateEdge('client', 'service', '调用方法', 0),
    createTemplateEdge('service', 'dao', '查询数据', 1),
    createTemplateEdge('dao', 'service', '返回数据', 2),
    createTemplateEdge('service', 'client', '返回结果', 3),
  ]

  return {
    id: 'sequence-activation',
    name: '带激活条的序列图',
    description: '显示对象激活期间的调用',
    type: 'sequence',
    nodes,
    edges,
    mermaidCode: `sequenceDiagram
    participant Client as 客户端
    participant Service as 服务层
    participant DAO as 数据层
    Client->>+Service: 调用方法
    Service->>+DAO: 查询数据
    DAO-->>-Service: 返回数据
    Service-->>-Client: 返回结果`,
  }
}

/**
 * 带循环的序列图模板
 */
export function createLoopSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('user', 'uml-lifeline', '用户', 0, options),
    createTemplateNode('system', 'uml-lifeline', '系统', 1, options),
  ]

  const edges = [
    createTemplateEdge('user', 'system', '获取列表', 0),
    createTemplateEdge('system', 'user', '返回项目1', 1),
    createTemplateEdge('system', 'user', '返回项目2', 2),
    createTemplateEdge('system', 'user', '返回项目N', 3),
  ]

  return {
    id: 'sequence-loop',
    name: '带循环的序列图',
    description: '批量处理数据',
    type: 'sequence',
    nodes,
    edges,
    mermaidCode: `sequenceDiagram
    participant User as 用户
    participant System as 系统
    User->>System: 获取列表
    loop 每个项目
        System-->>User: 返回项目
    end`,
  }
}

/**
 * 带条件的序列图模板
 */
export function createAltSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('user', 'uml-lifeline', '用户', 0, options),
    createTemplateNode('system', 'uml-lifeline', '系统', 1, options),
  ]

  const edges = [
    createTemplateEdge('user', 'system', '提交请求', 0),
    createTemplateEdge('system', 'user', '成功响应', 1),
    createTemplateEdge('system', 'user', '错误信息', 2),
  ]

  return {
    id: 'sequence-alt',
    name: '带条件的序列图',
    description: '根据条件返回不同结果',
    type: 'sequence',
    nodes,
    edges,
    mermaidCode: `sequenceDiagram
    participant User as 用户
    participant System as 系统
    User->>System: 提交请求
    alt 验证成功
        System-->>User: 成功响应
    else 验证失败
        System-->>User: 错误信息
    end`,
  }
}

/**
 * 自调用序列图模板
 */
export function createSelfCallSequenceTemplate(options: TemplateGenerateOptions = {}): DiagramTemplate {
  const nodes = [
    createTemplateNode('client', 'uml-lifeline', '客户端', 0, options),
    createTemplateNode('service', 'uml-lifeline', '服务层', 1, options),
  ]

  const edges = [
    createTemplateEdge('client', 'service', '调用方法', 0),
    createTemplateEdge('service', 'service', '内部处理', 1),
    createTemplateEdge('service', 'client', '返回结果', 2),
  ]

  return {
    id: 'sequence-self-call',
    name: '自调用序列图',
    description: '对象调用自身方法',
    type: 'sequence',
    nodes,
    edges,
    mermaidCode: `sequenceDiagram
    participant Client as 客户端
    participant Service as 服务层
    Client->>Service: 调用方法
    Service->>Service: 内部处理
    Service-->>Client: 返回结果`,
  }
}

/**
 * 获取所有序列图模板
 */
export function getSequenceTemplates(options: TemplateGenerateOptions = {}): DiagramTemplate[] {
  return [
    createSimpleSequenceTemplate(options),
    createActivationSequenceTemplate(options),
    createLoopSequenceTemplate(options),
    createAltSequenceTemplate(options),
    createSelfCallSequenceTemplate(options),
  ]
}
