import { v4 as uuidv4 } from 'uuid'
import type { Template } from '../types/template'

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
    connectors: [],
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
    connectors: [],
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
    connectors: [],
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
    connectors: [],
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
    console.error('Failed to load custom templates:', error)
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
    console.error('Failed to import template:', error)
    return null
  }
}
