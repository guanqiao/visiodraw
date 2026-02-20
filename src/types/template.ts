export type TemplateCategory = 'flowchart' | 'org' | 'network' | 'uml' | 'custom'

export interface Template {
  id: string
  name: string
  description?: string
  category: TemplateCategory
  shapes: any[]
  connectors?: any[]
  thumbnail?: string
  tags?: string[]
  createdAt?: number
  updatedAt?: number
}

export interface TemplateRegistry {
  getBuiltinTemplates(): Template[]
  getCustomTemplates(): Template[]
  saveCustomTemplate(template: Omit<Template, 'id'>): Template
  deleteCustomTemplate(id: string): void
  importTemplate(json: string): Template | null
  exportTemplate(id: string): string
}
