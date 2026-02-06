/**
 * 内置模板库
 */

import { Template } from './types'
import { v4 as uuidv4 } from 'uuid'

// 简单流程图模板
export const simpleFlowchartTemplate: Template = {
  id: 'simple-flowchart',
  name: '简单流程图',
  description: '包含开始、处理、判断、结束的基本流程图',
  category: 'flowchart',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltIn: true,
  shapes: [
    // 开始
    {
      id: uuidv4(),
      type: 'start-end',
      x: 350,
      y: 50,
      width: 120,
      height: 60,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: '开始',
    },
    // 输入
    {
      id: uuidv4(),
      type: 'input-output',
      x: 320,
      y: 150,
      width: 180,
      height: 60,
      fill: '#f9f0ff',
      stroke: '#722ed1',
      strokeWidth: 2,
      text: '输入数据',
    },
    // 处理
    {
      id: uuidv4(),
      type: 'process',
      x: 320,
      y: 250,
      width: 180,
      height: 80,
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      text: '处理数据',
    },
    // 判断
    {
      id: uuidv4(),
      type: 'decision',
      x: 350,
      y: 380,
      width: 120,
      height: 100,
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 2,
      text: '是否有效?',
    },
    // 无效处理
    {
      id: uuidv4(),
      type: 'process',
      x: 550,
      y: 390,
      width: 140,
      height: 80,
      fill: '#fff2f0',
      stroke: '#f5222d',
      strokeWidth: 2,
      text: '显示错误',
    },
    // 输出
    {
      id: uuidv4(),
      type: 'input-output',
      x: 320,
      y: 530,
      width: 180,
      height: 60,
      fill: '#f9f0ff',
      stroke: '#722ed1',
      strokeWidth: 2,
      text: '输出结果',
    },
    // 结束
    {
      id: uuidv4(),
      type: 'start-end',
      x: 350,
      y: 630,
      width: 120,
      height: 60,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: '结束',
    },
  ],
}

// 组织结构图模板
export const orgChartTemplate: Template = {
  id: 'org-chart',
  name: '公司组织架构',
  description: '典型的公司组织架构图',
  category: 'org',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltIn: true,
  shapes: [
    // CEO
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 400,
      y: 50,
      width: 160,
      height: 80,
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      text: 'CEO\n首席执行官',
    },
    // CTO
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 200,
      y: 200,
      width: 140,
      height: 70,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: 'CTO\n技术总监',
    },
    // CFO
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 410,
      y: 200,
      width: 140,
      height: 70,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: 'CFO\n财务总监',
    },
    // COO
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 620,
      y: 200,
      width: 140,
      height: 70,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: 'COO\n运营总监',
    },
    // 前端团队
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 100,
      y: 350,
      width: 120,
      height: 60,
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 2,
      text: '前端团队',
    },
    // 后端团队
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 250,
      y: 350,
      width: 120,
      height: 60,
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 2,
      text: '后端团队',
    },
    // 财务部门
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 420,
      y: 350,
      width: 120,
      height: 60,
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 2,
      text: '财务部门',
    },
    // 市场部门
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 580,
      y: 350,
      width: 120,
      height: 60,
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 2,
      text: '市场部门',
    },
    // 客服部门
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 740,
      y: 350,
      width: 120,
      height: 60,
      fill: '#fff7e6',
      stroke: '#fa8c16',
      strokeWidth: 2,
      text: '客服部门',
    },
  ],
}

// 网络拓扑图模板
export const networkTopologyTemplate: Template = {
  id: 'network-topology',
  name: '网络拓扑图',
  description: '典型的企业网络架构图',
  category: 'network',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltIn: true,
  shapes: [
    // 互联网
    {
      id: uuidv4(),
      type: 'cloud',
      x: 350,
      y: 50,
      width: 200,
      height: 100,
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      text: '互联网\nInternet',
    },
    // 防火墙
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 380,
      y: 200,
      width: 140,
      height: 80,
      fill: '#fff2f0',
      stroke: '#f5222d',
      strokeWidth: 2,
      text: '防火墙\nFirewall',
    },
    // 核心交换机
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 380,
      y: 330,
      width: 140,
      height: 80,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: '核心交换机\nCore Switch',
    },
    // 服务器区域
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 150,
      y: 480,
      width: 160,
      height: 100,
      fill: '#f9f0ff',
      stroke: '#722ed1',
      strokeWidth: 2,
      text: '服务器区域\nServer Zone',
    },
    // 办公区域
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 370,
      y: 480,
      width: 160,
      height: 100,
      fill: '#f9f0ff',
      stroke: '#722ed1',
      strokeWidth: 2,
      text: '办公区域\nOffice Zone',
    },
    // 访客区域
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 590,
      y: 480,
      width: 160,
      height: 100,
      fill: '#f9f0ff',
      stroke: '#722ed1',
      strokeWidth: 2,
      text: '访客区域\nGuest Zone',
    },
    // 数据库服务器
    {
      id: uuidv4(),
      type: 'database',
      x: 100,
      y: 630,
      width: 100,
      height: 100,
      fill: '#e6fffb',
      stroke: '#13c2c2',
      strokeWidth: 2,
      text: '数据库',
    },
    // Web服务器
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 230,
      y: 630,
      width: 100,
      height: 80,
      fill: '#e6fffb',
      stroke: '#13c2c2',
      strokeWidth: 2,
      text: 'Web服务器',
    },
  ],
}

// UML类图模板
export const umlClassTemplate: Template = {
  id: 'uml-class',
  name: 'UML类图',
  description: '典型的面向对象类图',
  category: 'uml',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltIn: true,
  shapes: [
    // User类
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 180,
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      text: 'User\n-------------------\n- id: int\n- name: string\n- email: string\n-------------------\n+ login(): bool\n+ logout(): void',
    },
    // Order类
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 450,
      y: 100,
      width: 200,
      height: 180,
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      text: 'Order\n-------------------\n- id: int\n- userId: int\n- total: decimal\n-------------------\n+ create(): Order\n+ cancel(): bool',
    },
    // Product类
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 100,
      y: 380,
      width: 200,
      height: 160,
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      text: 'Product\n-------------------\n- id: int\n- name: string\n- price: decimal\n-------------------\n+ getPrice(): decimal',
    },
    // OrderItem类
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 450,
      y: 380,
      width: 200,
      height: 160,
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
      text: 'OrderItem\n-------------------\n- id: int\n- orderId: int\n- productId: int\n- quantity: int\n-------------------\n+ getSubtotal(): decimal',
    },
  ],
}

// 时序图模板
export const sequenceDiagramTemplate: Template = {
  id: 'sequence-diagram',
  name: 'UML时序图',
  description: '用户登录流程时序图',
  category: 'uml',
  version: '1.0.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isBuiltIn: true,
  shapes: [
    // 参与者：用户
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 100,
      y: 50,
      width: 100,
      height: 50,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: '用户',
    },
    // 参与者：前端
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 300,
      y: 50,
      width: 100,
      height: 50,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: '前端',
    },
    // 参与者：后端
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 500,
      y: 50,
      width: 100,
      height: 50,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: '后端',
    },
    // 参与者：数据库
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 700,
      y: 50,
      width: 100,
      height: 50,
      fill: '#f6ffed',
      stroke: '#52c41a',
      strokeWidth: 2,
      text: '数据库',
    },
    // 生命线
    {
      id: uuidv4(),
      type: 'line',
      x: 150,
      y: 120,
      width: 2,
      height: 400,
      fill: 'transparent',
      stroke: '#999',
      strokeWidth: 2,
    },
    {
      id: uuidv4(),
      type: 'line',
      x: 350,
      y: 120,
      width: 2,
      height: 400,
      fill: 'transparent',
      stroke: '#999',
      strokeWidth: 2,
    },
    {
      id: uuidv4(),
      type: 'line',
      x: 550,
      y: 120,
      width: 2,
      height: 400,
      fill: 'transparent',
      stroke: '#999',
      strokeWidth: 2,
    },
    {
      id: uuidv4(),
      type: 'line',
      x: 750,
      y: 120,
      width: 2,
      height: 400,
      fill: 'transparent',
      stroke: '#999',
      strokeWidth: 2,
    },
  ],
}

// 所有内置模板
export const BUILT_IN_TEMPLATES: Template[] = [
  simpleFlowchartTemplate,
  orgChartTemplate,
  networkTopologyTemplate,
  umlClassTemplate,
  sequenceDiagramTemplate,
]

// 获取模板分类
export function getTemplatesByCategory(category: string): Template[] {
  return BUILT_IN_TEMPLATES.filter((t) => t.category === category)
}

// 根据ID获取模板
export function getTemplateById(id: string): Template | undefined {
  return BUILT_IN_TEMPLATES.find((t) => t.id === id)
}
