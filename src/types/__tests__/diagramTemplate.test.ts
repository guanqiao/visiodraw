import { describe, it, expect } from 'vitest'
import type {
  DiagramType,
  DiagramTemplate,
  TemplateNode,
  TemplateEdge,
  MermaidParseResult,
  DiagramLayout,
} from '../diagramTemplate'

describe('DiagramTemplate Types', () => {
  describe('DiagramType', () => {
    it('should accept valid diagram types', () => {
      const activity: DiagramType = 'activity'
      const sequence: DiagramType = 'sequence'
      const state: DiagramType = 'state'
      const er: DiagramType = 'er'

      expect(activity).toBe('activity')
      expect(sequence).toBe('sequence')
      expect(state).toBe('state')
      expect(er).toBe('er')
    })
  })

  describe('TemplateNode', () => {
    it('should create a valid template node', () => {
      const node: TemplateNode = {
        id: 'node-1',
        type: 'uml-activity',
        x: 100,
        y: 200,
        width: 120,
        height: 60,
        text: 'Start',
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      }

      expect(node.id).toBe('node-1')
      expect(node.type).toBe('uml-activity')
      expect(node.x).toBe(100)
      expect(node.y).toBe(200)
      expect(node.width).toBe(120)
      expect(node.height).toBe(60)
      expect(node.text).toBe('Start')
    })

    it('should allow optional properties', () => {
      const node: TemplateNode = {
        id: 'node-2',
        type: 'uml-decision',
        x: 0,
        y: 0,
        width: 60,
        height: 60,
      }

      expect(node.text).toBeUndefined()
      expect(node.fill).toBeUndefined()
    })
  })

  describe('TemplateEdge', () => {
    it('should create a valid template edge', () => {
      const edge: TemplateEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        label: 'yes',
        style: 'orthogonal',
        lineStyle: 'solid',
      }

      expect(edge.id).toBe('edge-1')
      expect(edge.source).toBe('node-1')
      expect(edge.target).toBe('node-2')
      expect(edge.label).toBe('yes')
      expect(edge.style).toBe('orthogonal')
      expect(edge.lineStyle).toBe('solid')
    })

    it('should have default values for optional properties', () => {
      const edge: TemplateEdge = {
        id: 'edge-2',
        source: 'node-1',
        target: 'node-2',
      }

      expect(edge.label).toBeUndefined()
      expect(edge.style).toBeUndefined()
      expect(edge.lineStyle).toBeUndefined()
    })
  })

  describe('DiagramTemplate', () => {
    it('should create a valid diagram template', () => {
      const template: DiagramTemplate = {
        id: 'template-1',
        name: 'Simple Flowchart',
        description: 'A simple flowchart template',
        type: 'activity',
        nodes: [
          {
            id: 'start',
            type: 'uml-initial',
            x: 100,
            y: 50,
            width: 30,
            height: 30,
          },
          {
            id: 'process',
            type: 'uml-action',
            x: 85,
            y: 120,
            width: 60,
            height: 40,
            text: 'Process',
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'start',
            target: 'process',
          },
        ],
        layout: {
          direction: 'vertical',
          spacing: 50,
        },
        mermaidCode: 'flowchart TD\n    A[Start] --> B[Process]',
      }

      expect(template.id).toBe('template-1')
      expect(template.name).toBe('Simple Flowchart')
      expect(template.type).toBe('activity')
      expect(template.nodes).toHaveLength(2)
      expect(template.edges).toHaveLength(1)
      expect(template.layout?.direction).toBe('vertical')
    })

    it('should allow template without edges', () => {
      const template: DiagramTemplate = {
        id: 'template-2',
        name: 'Single Node',
        type: 'activity',
        nodes: [
          {
            id: 'only',
            type: 'uml-action',
            x: 0,
            y: 0,
            width: 100,
            height: 50,
          },
        ],
      }

      expect(template.edges).toBeUndefined()
    })
  })

  describe('MermaidParseResult', () => {
    it('should handle successful parse result', () => {
      const result: MermaidParseResult = {
        success: true,
        diagramType: 'activity',
        nodes: [],
        edges: [],
      }

      expect(result.success).toBe(true)
      expect(result.diagramType).toBe('activity')
    })

    it('should handle failed parse result', () => {
      const result: MermaidParseResult = {
        success: false,
        error: 'Invalid syntax at line 3',
      }

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid syntax at line 3')
      expect(result.nodes).toBeUndefined()
    })
  })

  describe('DiagramLayout', () => {
    it('should support vertical layout', () => {
      const layout: DiagramLayout = {
        direction: 'vertical',
        spacing: 60,
        padding: 20,
      }

      expect(layout.direction).toBe('vertical')
      expect(layout.spacing).toBe(60)
      expect(layout.padding).toBe(20)
    })

    it('should support horizontal layout', () => {
      const layout: DiagramLayout = {
        direction: 'horizontal',
        spacing: 80,
      }

      expect(layout.direction).toBe('horizontal')
      expect(layout.spacing).toBe(80)
      expect(layout.padding).toBeUndefined()
    })
  })
})
