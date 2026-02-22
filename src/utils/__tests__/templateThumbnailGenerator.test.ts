// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Template } from '../../types/template'
import type { DiagramTemplate } from '../../types/diagramTemplate'
import {
  generateTemplateThumbnail,
  generateDiagramTemplateThumbnail,
  generateThumbnailAsync,
  generateEmptyThumbnail,
} from '../templateThumbnailGenerator'

// Mock canvas
const mockCanvasContext = {
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  ellipse: vi.fn(),
  setLineDash: vi.fn(),
  fillText: vi.fn(),
  font: '',
  textAlign: '',
  textBaseline: '',
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  lineCap: '',
  lineJoin: '',
}

const mockCanvas = {
  getContext: vi.fn(() => mockCanvasContext),
  toDataURL: vi.fn(() => 'data:image/png;base64,mocked'),
  width: 320,
  height: 180,
}

// Mock document.createElement
global.document = {
  createElement: vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return mockCanvas as any
    }
    return {}
  }),
} as any

describe('templateThumbnailGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateTemplateThumbnail', () => {
    it('should generate thumbnail for basic template', () => {
      const template: Template = {
        id: 'test-1',
        name: 'Test Template',
        category: 'flowchart',
        shapes: [
          { id: 's1', type: 'rectangle', x: 100, y: 100, width: 100, height: 60, text: 'Start' },
          { id: 's2', type: 'rectangle', x: 100, y: 250, width: 100, height: 60, text: 'End' },
        ],
        connectors: [
          { id: 'c1', source: 's1', target: 's2' },
        ],
      }

      const result = generateTemplateThumbnail(template)

      expect(result).toBe('data:image/png;base64,mocked')
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.9)
    })

    it('should handle empty template', () => {
      const template: Template = {
        id: 'test-empty',
        name: 'Empty Template',
        category: 'flowchart',
        shapes: [],
      }

      const result = generateTemplateThumbnail(template)

      expect(result).toBe('data:image/png;base64,mocked')
    })

    it('should handle template with different node types', () => {
      const template: Template = {
        id: 'test-types',
        name: 'Types Template',
        category: 'flowchart',
        shapes: [
          { id: 's1', type: 'start-end', x: 100, y: 100, width: 100, height: 50 },
          { id: 's2', type: 'decision', x: 100, y: 200, width: 100, height: 80 },
          { id: 's3', type: 'input-output', x: 100, y: 320, width: 100, height: 60 },
          { id: 's4', type: 'cloud', x: 100, y: 420, width: 120, height: 60 },
        ],
      }

      const result = generateTemplateThumbnail(template)

      expect(result).toBe('data:image/png;base64,mocked')
    })

    it('should respect custom options', () => {
      const template: Template = {
        id: 'test-options',
        name: 'Options Template',
        category: 'flowchart',
        shapes: [{ id: 's1', type: 'rectangle', x: 100, y: 100, width: 100, height: 60 }],
      }

      const result = generateTemplateThumbnail(template, {
        width: 640,
        height: 360,
        padding: 20,
        quality: 0.8,
      })

      expect(result).toBe('data:image/png;base64,mocked')
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 0.8)
    })
  })

  describe('generateDiagramTemplateThumbnail', () => {
    it('should generate thumbnail for diagram template', () => {
      const template: DiagramTemplate = {
        id: 'diagram-1',
        name: 'Activity Diagram',
        type: 'activity',
        nodes: [
          { id: 'n1', type: 'uml-initial', x: 100, y: 100, width: 30, height: 30 },
          { id: 'n2', type: 'uml-state', x: 100, y: 200, width: 120, height: 60, text: 'Process' },
          { id: 'n3', type: 'uml-final', x: 100, y: 320, width: 30, height: 30 },
        ],
        edges: [
          { id: 'e1', source: 'n1', target: 'n2' },
          { id: 'e2', source: 'n2', target: 'n3' },
        ],
      }

      const result = generateDiagramTemplateThumbnail(template)

      expect(result).toBe('data:image/png;base64,mocked')
    })

    it('should handle diagram template without edges', () => {
      const template: DiagramTemplate = {
        id: 'diagram-no-edges',
        name: 'Simple Diagram',
        type: 'er',
        nodes: [
          { id: 'n1', type: 'er-table-entity', x: 100, y: 100, width: 160, height: 80, text: 'User' },
        ],
      }

      const result = generateDiagramTemplateThumbnail(template)

      expect(result).toBe('data:image/png;base64,mocked')
    })
  })

  describe('generateThumbnailAsync', () => {
    it('should generate thumbnail asynchronously for Template', async () => {
      const template: Template = {
        id: 'async-test',
        name: 'Async Template',
        category: 'flowchart',
        shapes: [{ id: 's1', type: 'rectangle', x: 100, y: 100, width: 100, height: 60 }],
      }

      const result = await generateThumbnailAsync(template)

      expect(result).toBe('data:image/png;base64,mocked')
    })

    it('should generate thumbnail asynchronously for DiagramTemplate', async () => {
      const template: DiagramTemplate = {
        id: 'async-diagram',
        name: 'Async Diagram',
        type: 'sequence',
        nodes: [{ id: 'n1', type: 'uml-lifeline', x: 100, y: 100, width: 60, height: 300 }],
      }

      const result = await generateThumbnailAsync(template)

      expect(result).toBe('data:image/png;base64,mocked')
    })
  })

  describe('generateEmptyThumbnail', () => {
    it('should generate empty placeholder thumbnail', () => {
      const result = generateEmptyThumbnail()

      expect(result).toBe('data:image/png;base64,mocked')
    })

    it('should respect custom options for empty thumbnail', () => {
      const result = generateEmptyThumbnail({ width: 400, height: 300 })

      expect(result).toBe('data:image/png;base64,mocked')
    })
  })
})
