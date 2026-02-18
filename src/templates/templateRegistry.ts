import { v4 as uuidv4 } from 'uuid'
import type { Template } from '../types/template'
import { devError } from '../utils/logger'

const CUSTOM_TEMPLATES_KEY = 'visiodraw_custom_templates'

// Builtin templates
const builtinTemplates: Template[] = [
  // Flowchart templates
  {
    id: 'flowchart-simple',
    name: '简单流程图',
    description: '基本的流程图模板，包含开始、处理、判断和结束',
    category: 'flowchart',
    shapes: [
      { id: 'start', type: 'start-end', x: 350, y: 50, width: 100, height: 50, fill: '#e6f7ff', stroke: '#1890ff', text: '开始' },
      { id: 'input', type: 'input-output', x: 350, y: 150, width: 100, height: 60, fill: '#f9f0ff', stroke: '#722ed1', text: '输入' },
      { id: 'process', type: 'process', x: 350, y: 260, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '处理' },
      { id: 'decision', type: 'decision', x: 350, y: 370, width: 100, height: 80, fill: '#fff7e6', stroke: '#fa8c16', text: '判断' },
      { id: 'output', type: 'input-output', x: 350, y: 500, width: 100, height: 60, fill: '#f9f0ff', stroke: '#722ed1', text: '输出' },
      { id: 'end', type: 'start-end', x: 350, y: 610, width: 100, height: 50, fill: '#fff1f0', stroke: '#f5222d', text: '结束' },
    ],
    connectors: [
      { id: 'conn-1', source: 'start', target: 'input' },
      { id: 'conn-2', source: 'input', target: 'process' },
      { id: 'conn-3', source: 'process', target: 'decision' },
      { id: 'conn-4', source: 'decision', target: 'output' },
      { id: 'conn-5', source: 'output', target: 'end' },
    ],
  },
  // Org chart template
  {
    id: 'org-simple',
    name: '公司组织架构',
    description: '简单的公司组织架构图',
    category: 'org',
    shapes: [
      { id: 'ceo', type: 'rectangle', x: 350, y: 50, width: 120, height: 60, fill: '#e6f7ff', stroke: '#1890ff', text: 'CEO' },
      { id: 'cto', type: 'rectangle', x: 150, y: 180, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: 'CTO' },
      { id: 'cfo', type: 'rectangle', x: 350, y: 180, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: 'CFO' },
      { id: 'coo', type: 'rectangle', x: 550, y: 180, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: 'COO' },
      { id: 'dev1', type: 'rectangle', x: 80, y: 310, width: 80, height: 50, fill: '#fff7e6', stroke: '#fa8c16', text: '开发部' },
      { id: 'dev2', type: 'rectangle', x: 200, y: 310, width: 80, height: 50, fill: '#fff7e6', stroke: '#fa8c16', text: '测试部' },
      { id: 'finance', type: 'rectangle', x: 350, y: 310, width: 100, height: 50, fill: '#fff7e6', stroke: '#fa8c16', text: '财务部' },
      { id: 'ops1', type: 'rectangle', x: 500, y: 310, width: 80, height: 50, fill: '#fff7e6', stroke: '#fa8c16', text: '运营部' },
      { id: 'ops2', type: 'rectangle', x: 620, y: 310, width: 80, height: 50, fill: '#fff7e6', stroke: '#fa8c16', text: '市场部' },
    ],
    connectors: [
      { id: 'conn-1', source: 'ceo', target: 'cto' },
      { id: 'conn-2', source: 'ceo', target: 'cfo' },
      { id: 'conn-3', source: 'ceo', target: 'coo' },
      { id: 'conn-4', source: 'cto', target: 'dev1' },
      { id: 'conn-5', source: 'cto', target: 'dev2' },
      { id: 'conn-6', source: 'cfo', target: 'finance' },
      { id: 'conn-7', source: 'coo', target: 'ops1' },
      { id: 'conn-8', source: 'coo', target: 'ops2' },
    ],
  },
  // Network template
  {
    id: 'network-simple',
    name: '基础网络拓扑',
    description: '基础的网络拓扑结构',
    category: 'network',
    shapes: [
      { id: 'internet', type: 'cloud', x: 350, y: 50, width: 120, height: 60, fill: '#e6f7ff', stroke: '#1890ff', text: 'Internet' },
      { id: 'firewall', type: 'rectangle', x: 350, y: 160, width: 100, height: 60, fill: '#fff2e8', stroke: '#fa541c', text: '防火墙' },
      { id: 'switch', type: 'rectangle', x: 350, y: 280, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '核心交换机' },
      { id: 'dmz', type: 'rectangle', x: 150, y: 400, width: 100, height: 60, fill: '#fff7e6', stroke: '#fa8c16', text: 'DMZ区' },
      { id: 'lan', type: 'rectangle', x: 350, y: 400, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '内网' },
      { id: 'wifi', type: 'rectangle', x: 550, y: 400, width: 100, height: 60, fill: '#f9f0ff', stroke: '#722ed1', text: '无线网' },
    ],
    connectors: [
      { id: 'conn-1', source: 'internet', target: 'firewall' },
      { id: 'conn-2', source: 'firewall', target: 'switch' },
      { id: 'conn-3', source: 'switch', target: 'dmz' },
      { id: 'conn-4', source: 'switch', target: 'lan' },
      { id: 'conn-5', source: 'switch', target: 'wifi' },
    ],
  },
  // UML class template
  {
    id: 'uml-class',
    name: 'UML类图示例',
    description: '简单的UML类图示例',
    category: 'uml',
    shapes: [
      { id: 'user', type: 'rectangle', x: 100, y: 100, width: 150, height: 120, fill: '#e6f7ff', stroke: '#1890ff', text: 'User\n- id: int\n- name: string\n+ login(): bool' },
      { id: 'order', type: 'rectangle', x: 400, y: 100, width: 150, height: 120, fill: '#e6f7ff', stroke: '#1890ff', text: 'Order\n- id: int\n- total: decimal\n+ pay(): bool' },
      { id: 'product', type: 'rectangle', x: 250, y: 350, width: 150, height: 120, fill: '#e6f7ff', stroke: '#1890ff', text: 'Product\n- id: int\n- price: decimal\n+ getPrice(): decimal' },
    ],
    connectors: [
      { id: 'conn-1', source: 'user', target: 'order', label: '1:n' },
      { id: 'conn-2', source: 'order', target: 'product', label: 'n:m' },
      { id: 'conn-3', source: 'user', target: 'product', label: '浏览' },
    ],
  },
  // Cloud architecture template
  {
    id: 'cloud-simple',
    name: '基础云架构',
    description: '简单的云架构示例，包含负载均衡、应用服务器和数据库',
    category: 'network',
    shapes: [
      { id: 'users', type: 'cloud', x: 350, y: 50, width: 120, height: 60, fill: '#e6f7ff', stroke: '#1890ff', text: '用户' },
      { id: 'lb', type: 'rectangle', x: 350, y: 160, width: 120, height: 60, fill: '#fff7e6', stroke: '#fa8c16', text: '负载均衡' },
      { id: 'app1', type: 'rectangle', x: 200, y: 280, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '应用服务器1' },
      { id: 'app2', type: 'rectangle', x: 350, y: 280, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '应用服务器2' },
      { id: 'app3', type: 'rectangle', x: 500, y: 280, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '应用服务器3' },
      { id: 'cache', type: 'rectangle', x: 200, y: 400, width: 100, height: 60, fill: '#fff2e8', stroke: '#fa541c', text: '缓存' },
      { id: 'db', type: 'cylinder', x: 500, y: 400, width: 100, height: 80, fill: '#f9f0ff', stroke: '#722ed1', text: '数据库' },
    ],
    connectors: [
      { id: 'conn-1', source: 'users', target: 'lb' },
      { id: 'conn-2', source: 'lb', target: 'app1' },
      { id: 'conn-3', source: 'lb', target: 'app2' },
      { id: 'conn-4', source: 'lb', target: 'app3' },
      { id: 'conn-5', source: 'app1', target: 'cache' },
      { id: 'conn-6', source: 'app2', target: 'cache' },
      { id: 'conn-7', source: 'app3', target: 'db' },
    ],
  },
  // Microservices template
  {
    id: 'microservices',
    name: '微服务架构',
    description: '典型的微服务架构图，包含网关、服务和注册中心',
    category: 'network',
    shapes: [
      { id: 'client', type: 'rectangle', x: 350, y: 50, width: 100, height: 60, fill: '#e6f7ff', stroke: '#1890ff', text: '客户端' },
      { id: 'gateway', type: 'rectangle', x: 350, y: 160, width: 120, height: 60, fill: '#fff7e6', stroke: '#fa8c16', text: 'API网关' },
      { id: 'user-service', type: 'rectangle', x: 100, y: 280, width: 120, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '用户服务' },
      { id: 'order-service', type: 'rectangle', x: 290, y: 280, width: 120, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '订单服务' },
      { id: 'product-service', type: 'rectangle', x: 480, y: 280, width: 120, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '商品服务' },
      { id: 'payment-service', type: 'rectangle', x: 290, y: 400, width: 120, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '支付服务' },
      { id: 'registry', type: 'rectangle', x: 600, y: 160, width: 120, height: 60, fill: '#f9f0ff', stroke: '#722ed1', text: '注册中心' },
    ],
    connectors: [
      { id: 'conn-1', source: 'client', target: 'gateway' },
      { id: 'conn-2', source: 'gateway', target: 'user-service' },
      { id: 'conn-3', source: 'gateway', target: 'order-service' },
      { id: 'conn-4', source: 'gateway', target: 'product-service' },
      { id: 'conn-5', source: 'order-service', target: 'payment-service' },
      { id: 'conn-6', source: 'user-service', target: 'registry' },
      { id: 'conn-7', source: 'order-service', target: 'registry' },
      { id: 'conn-8', source: 'product-service', target: 'registry' },
    ],
  },
  // DevOps pipeline template
  {
    id: 'devops-pipeline',
    name: 'DevOps流水线',
    description: 'CI/CD持续集成和持续部署流程',
    category: 'flowchart',
    shapes: [
      { id: 'code', type: 'rectangle', x: 100, y: 100, width: 100, height: 60, fill: '#e6f7ff', stroke: '#1890ff', text: '代码提交' },
      { id: 'build', type: 'rectangle', x: 250, y: 100, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '构建' },
      { id: 'test', type: 'decision', x: 400, y: 90, width: 80, height: 80, fill: '#fff7e6', stroke: '#fa8c16', text: '测试' },
      { id: 'deploy', type: 'rectangle', x: 550, y: 100, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '部署' },
      { id: 'monitor', type: 'rectangle', x: 700, y: 100, width: 100, height: 60, fill: '#f9f0ff', stroke: '#722ed1', text: '监控' },
      { id: 'fix', type: 'rectangle', x: 400, y: 220, width: 100, height: 60, fill: '#fff1f0', stroke: '#f5222d', text: '修复' },
    ],
    connectors: [
      { id: 'conn-1', source: 'code', target: 'build' },
      { id: 'conn-2', source: 'build', target: 'test' },
      { id: 'conn-3', source: 'test', target: 'deploy', label: '通过' },
      { id: 'conn-4', source: 'deploy', target: 'monitor' },
      { id: 'conn-5', source: 'test', target: 'fix', label: '失败' },
      { id: 'conn-6', source: 'fix', target: 'code' },
    ],
  },
  // Database design template
  {
    id: 'database-design',
    name: '数据库设计',
    description: '电商系统数据库表结构设计',
    category: 'uml',
    shapes: [
      { id: 'users-table', type: 'rectangle', x: 100, y: 100, width: 140, height: 100, fill: '#e6f7ff', stroke: '#1890ff', text: 'users\n- id PK\n- username\n- email\n- created_at' },
      { id: 'orders-table', type: 'rectangle', x: 350, y: 100, width: 140, height: 100, fill: '#e6f7ff', stroke: '#1890ff', text: 'orders\n- id PK\n- user_id FK\n- total\n- status' },
      { id: 'products-table', type: 'rectangle', x: 600, y: 100, width: 140, height: 100, fill: '#e6f7ff', stroke: '#1890ff', text: 'products\n- id PK\n- name\n- price\n- stock' },
      { id: 'order-items-table', type: 'rectangle', x: 350, y: 280, width: 140, height: 100, fill: '#e6f7ff', stroke: '#1890ff', text: 'order_items\n- id PK\n- order_id FK\n- product_id FK\n- quantity' },
    ],
    connectors: [
      { id: 'conn-1', source: 'users-table', target: 'orders-table', label: '1:N' },
      { id: 'conn-2', source: 'orders-table', target: 'order-items-table', label: '1:N' },
      { id: 'conn-3', source: 'products-table', target: 'order-items-table', label: '1:N' },
    ],
  },
  // Mind map template
  {
    id: 'mindmap-project',
    name: '项目规划思维导图',
    description: '项目管理思维导图模板',
    category: 'org',
    shapes: [
      { id: 'center', type: 'ellipse', x: 350, y: 200, width: 120, height: 80, fill: '#e6f7ff', stroke: '#1890ff', text: '项目目标' },
      { id: 'scope', type: 'rectangle', x: 150, y: 100, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '范围' },
      { id: 'time', type: 'rectangle', x: 150, y: 200, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '时间' },
      { id: 'cost', type: 'rectangle', x: 150, y: 300, width: 100, height: 60, fill: '#f6ffed', stroke: '#52c41a', text: '成本' },
      { id: 'quality', type: 'rectangle', x: 550, y: 100, width: 100, height: 60, fill: '#fff7e6', stroke: '#fa8c16', text: '质量' },
      { id: 'risk', type: 'rectangle', x: 550, y: 200, width: 100, height: 60, fill: '#fff7e6', stroke: '#fa8c16', text: '风险' },
      { id: 'communication', type: 'rectangle', x: 550, y: 300, width: 100, height: 60, fill: '#fff7e6', stroke: '#fa8c16', text: '沟通' },
    ],
    connectors: [
      { id: 'conn-1', source: 'center', target: 'scope' },
      { id: 'conn-2', source: 'center', target: 'time' },
      { id: 'conn-3', source: 'center', target: 'cost' },
      { id: 'conn-4', source: 'center', target: 'quality' },
      { id: 'conn-5', source: 'center', target: 'risk' },
      { id: 'conn-6', source: 'center', target: 'communication' },
    ],
  },
  // Kubernetes deployment template
  {
    id: 'k8s-deployment',
    name: 'Kubernetes部署架构',
    description: 'K8s集群架构图，包含Master和Worker节点',
    category: 'network',
    shapes: [
      { id: 'master', type: 'rectangle', x: 350, y: 50, width: 140, height: 80, fill: '#fff1f0', stroke: '#f5222d', text: 'Master Node\nAPI Server\nScheduler\netcd' },
      { id: 'worker1', type: 'rectangle', x: 150, y: 200, width: 120, height: 100, fill: '#f6ffed', stroke: '#52c41a', text: 'Worker 1\nkubelet\nPod A\nPod B' },
      { id: 'worker2', type: 'rectangle', x: 350, y: 200, width: 120, height: 100, fill: '#f6ffed', stroke: '#52c41a', text: 'Worker 2\nkubelet\nPod C\nPod D' },
      { id: 'worker3', type: 'rectangle', x: 550, y: 200, width: 120, height: 100, fill: '#f6ffed', stroke: '#52c41a', text: 'Worker 3\nkubelet\nPod E\nPod F' },
      { id: 'service', type: 'rectangle', x: 350, y: 350, width: 140, height: 60, fill: '#e6f7ff', stroke: '#1890ff', text: 'Service\n负载均衡' },
      { id: 'ingress', type: 'rectangle', x: 350, y: 450, width: 140, height: 60, fill: '#fff7e6', stroke: '#fa8c16', text: 'Ingress\n入口网关' },
    ],
    connectors: [
      { id: 'conn-1', source: 'master', target: 'worker1' },
      { id: 'conn-2', source: 'master', target: 'worker2' },
      { id: 'conn-3', source: 'master', target: 'worker3' },
      { id: 'conn-4', source: 'worker1', target: 'service' },
      { id: 'conn-5', source: 'worker2', target: 'service' },
      { id: 'conn-6', source: 'worker3', target: 'service' },
      { id: 'conn-7', source: 'service', target: 'ingress' },
    ],
  },
]

// Get builtin templates
export function getBuiltinTemplates(): Template[] {
  return builtinTemplates
}

// Get custom templates from localStorage
export function getCustomTemplates(): Template[] {
  try {
    const data = localStorage.getItem(CUSTOM_TEMPLATES_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    devError('Failed to load custom templates:', error)
  }
  return []
}

// Save custom template
export function saveCustomTemplate(template: Omit<Template, 'id'>): Template {
  const templates = getCustomTemplates()
  const newTemplate: Template = {
    ...template,
    id: uuidv4(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  templates.push(newTemplate)
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates))
  return newTemplate
}

// Delete custom template
export function deleteCustomTemplate(id: string): void {
  const templates = getCustomTemplates()
  const index = templates.findIndex((t) => t.id === id)
  if (index !== -1) {
    templates.splice(index, 1)
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates))
  }
}

// Update custom template
export function updateCustomTemplate(id: string, updates: Partial<Template>): Template | null {
  const templates = getCustomTemplates()
  const index = templates.findIndex((t) => t.id === id)
  if (index !== -1) {
    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: Date.now(),
    }
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates))
    return templates[index]
  }
  return null
}

// Export template to JSON string
export function exportTemplate(template: Template): string {
  return JSON.stringify(template, null, 2)
}

// Import template from JSON string
export function importTemplate(json: string): Template | null {
  try {
    const template = JSON.parse(json) as Template
    return saveCustomTemplate({
      name: template.name,
      description: template.description,
      category: 'custom',
      shapes: template.shapes,
      connectors: template.connectors,
      thumbnail: template.thumbnail,
    })
  } catch (error) {
    devError('Failed to import template:', error)
    return null
  }
}
