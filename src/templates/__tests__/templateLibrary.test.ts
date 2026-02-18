import { describe, it, expect, beforeAll } from 'vitest'
import type { Template } from '../../types/template'
import type { DiagramTemplate } from '../../types/diagramTemplate'
import { getBuiltinTemplates } from '../templateRegistry'
import { getAllTemplates, getTemplatesByType } from '../index'
import {
  getActivityTemplates,
  getSequenceTemplates,
  getStateTemplates,
  getErTemplates,
  getClassTemplates,
  getGanttTemplates,
} from '../index'
import {
  generateTemplateThumbnail,
  generateDiagramTemplateThumbnail,
} from '../../utils/templateThumbnailGenerator'

describe('Template Library', () => {
  describe('Template Count and Coverage', () => {
    it('should have at least 30 templates in total', () => {
      const builtinTemplates = getBuiltinTemplates()
      const diagramTemplates = getAllTemplates()
      const totalTemplates = builtinTemplates.length + diagramTemplates.length

      expect(totalTemplates).toBeGreaterThanOrEqual(30)
    })

    it('should have at least 5 builtin templates', () => {
      const templates = getBuiltinTemplates()
      expect(templates.length).toBeGreaterThanOrEqual(5)
    })

    it('should have at least 25 diagram templates', () => {
      const templates = getAllTemplates()
      expect(templates.length).toBeGreaterThanOrEqual(25)
    })
  })

  describe('Template Categories', () => {
    it('should cover flowchart category', () => {
      const templates = getBuiltinTemplates()
      const flowchartTemplates = templates.filter((t) => t.category === 'flowchart')
      expect(flowchartTemplates.length).toBeGreaterThanOrEqual(1)
    })

    it('should cover org category', () => {
      const templates = getBuiltinTemplates()
      const orgTemplates = templates.filter((t) => t.category === 'org')
      expect(orgTemplates.length).toBeGreaterThanOrEqual(1)
    })

    it('should cover network category', () => {
      const templates = getBuiltinTemplates()
      const networkTemplates = templates.filter((t) => t.category === 'network')
      expect(networkTemplates.length).toBeGreaterThanOrEqual(1)
    })

    it('should cover uml category', () => {
      const templates = getBuiltinTemplates()
      const umlTemplates = templates.filter((t) => t.category === 'uml')
      expect(umlTemplates.length).toBeGreaterThanOrEqual(1)
    })

    it('should cover activity diagram type', () => {
      const templates = getTemplatesByType('activity')
      expect(templates.length).toBeGreaterThanOrEqual(3)
    })

    it('should cover sequence diagram type', () => {
      const templates = getTemplatesByType('sequence')
      expect(templates.length).toBeGreaterThanOrEqual(3)
    })

    it('should cover state diagram type', () => {
      const templates = getTemplatesByType('state')
      expect(templates.length).toBeGreaterThanOrEqual(3)
    })

    it('should cover er diagram type', () => {
      const templates = getTemplatesByType('er')
      expect(templates.length).toBeGreaterThanOrEqual(3)
    })

    it('should cover class diagram type', () => {
      const templates = getTemplatesByType('class')
      expect(templates.length).toBeGreaterThanOrEqual(3)
    })

    it('should cover gantt diagram type', () => {
      const templates = getTemplatesByType('gantt')
      expect(templates.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Template Structure Validation', () => {
    it('each builtin template should have valid structure', () => {
      const templates = getBuiltinTemplates()

      templates.forEach((template) => {
        // 验证必需字段
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('category')
        expect(template).toHaveProperty('shapes')

        // 验证字段类型
        expect(typeof template.id).toBe('string')
        expect(typeof template.name).toBe('string')
        expect(typeof template.category).toBe('string')
        expect(Array.isArray(template.shapes)).toBe(true)

        // 验证 ID 唯一性
        const ids = templates.map((t) => t.id)
        const uniqueIds = new Set(ids)
        expect(uniqueIds.size).toBe(ids.length)
      })
    })

    it('each diagram template should have valid structure', () => {
      const templates = getAllTemplates()

      templates.forEach((template) => {
        // 验证必需字段
        expect(template).toHaveProperty('id')
        expect(template).toHaveProperty('name')
        expect(template).toHaveProperty('type')
        expect(template).toHaveProperty('nodes')

        // 验证字段类型
        expect(typeof template.id).toBe('string')
        expect(typeof template.name).toBe('string')
        expect(typeof template.type).toBe('string')
        expect(Array.isArray(template.nodes)).toBe(true)

        // 验证 nodes 不为空
        expect(template.nodes.length).toBeGreaterThan(0)
      })
    })

    it('each template shape should have required properties', () => {
      const templates = getBuiltinTemplates()

      templates.forEach((template) => {
        template.shapes.forEach((shape) => {
          expect(shape).toHaveProperty('id')
          expect(shape).toHaveProperty('type')
          expect(shape).toHaveProperty('x')
          expect(shape).toHaveProperty('y')
          expect(shape).toHaveProperty('width')
          expect(shape).toHaveProperty('height')
        })
      })
    })

    it('each diagram template node should have required properties', () => {
      const templates = getAllTemplates()

      templates.forEach((template) => {
        template.nodes.forEach((node) => {
          expect(node).toHaveProperty('id')
          expect(node).toHaveProperty('type')
          expect(node).toHaveProperty('x')
          expect(node).toHaveProperty('y')
          expect(node).toHaveProperty('width')
          expect(node).toHaveProperty('height')
        })
      })
    })
  })

  describe('Template Thumbnail Generation', () => {
    it('should generate thumbnail for each builtin template', () => {
      const templates = getBuiltinTemplates()

      templates.forEach((template) => {
        expect(() => {
          const thumbnail = generateTemplateThumbnail(template)
          expect(thumbnail).toMatch(/^data:image\/png;base64,/)
        }).not.toThrow()
      })
    })

    it('should generate thumbnail for each diagram template', () => {
      const templates = getAllTemplates()

      templates.forEach((template) => {
        expect(() => {
          const thumbnail = generateDiagramTemplateThumbnail(template)
          expect(thumbnail).toMatch(/^data:image\/png;base64,/)
        }).not.toThrow()
      })
    })
  })

  describe('Template Content Validation', () => {
    it('templates should have meaningful names', () => {
      const builtinTemplates = getBuiltinTemplates()
      const diagramTemplates = getAllTemplates()

      builtinTemplates.forEach((template) => {
        expect(template.name.length).toBeGreaterThan(0)
        expect(template.name.length).toBeLessThan(50)
      })

      diagramTemplates.forEach((template) => {
        expect(template.name.length).toBeGreaterThan(0)
        expect(template.name.length).toBeLessThan(50)
      })
    })

    it('templates should have descriptions', () => {
      const builtinTemplates = getBuiltinTemplates()
      const diagramTemplates = getAllTemplates()

      builtinTemplates.forEach((template) => {
        if (template.description) {
          expect(template.description.length).toBeGreaterThan(0)
        }
      })

      diagramTemplates.forEach((template) => {
        if (template.description) {
          expect(template.description.length).toBeGreaterThan(0)
        }
      })
    })
  })

  describe('Template Uniqueness', () => {
    it('should not have duplicate template IDs', () => {
      const builtinTemplates = getBuiltinTemplates()
      const diagramTemplates = getAllTemplates()
      const allTemplates = [...builtinTemplates, ...diagramTemplates]

      const ids = allTemplates.map((t) => t.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should not have duplicate template names within same category', () => {
      const builtinTemplates = getBuiltinTemplates()
      const groupedByCategory = builtinTemplates.reduce((acc, template) => {
        if (!acc[template.category]) {
          acc[template.category] = []
        }
        acc[template.category].push(template.name)
        return acc
      }, {} as Record<string, string[]>)

      Object.values(groupedByCategory).forEach((names) => {
        const uniqueNames = new Set(names)
        expect(uniqueNames.size).toBe(names.length)
      })
    })
  })

  describe('Template Completeness', () => {
    it('flowchart templates should have connectors', () => {
      const templates = getBuiltinTemplates().filter((t) => t.category === 'flowchart')

      templates.forEach((template) => {
        expect(template.connectors).toBeDefined()
        expect(Array.isArray(template.connectors)).toBe(true)
      })
    })

    it('org templates should have connectors', () => {
      const templates = getBuiltinTemplates().filter((t) => t.category === 'org')

      templates.forEach((template) => {
        expect(template.connectors).toBeDefined()
        expect(Array.isArray(template.connectors)).toBe(true)
      })
    })

    it('network templates should have connectors', () => {
      const templates = getBuiltinTemplates().filter((t) => t.category === 'network')

      templates.forEach((template) => {
        expect(template.connectors).toBeDefined()
        expect(Array.isArray(template.connectors)).toBe(true)
      })
    })
  })
})
