import { describe, it, expect } from 'vitest'
import {
  renderStadium,
  renderCylinder,
  renderHexagon,
  renderParallelogramLeft,
  renderParallelogramRight,
  renderTrapezoidTop,
  renderTrapezoidBottom,
  renderSubroutine,
  renderDoubleCircle,
  renderAsymmetric,
  renderCircle,
  renderRhombus,
  mermaidRenderers,
} from '../mermaidShapes'
import { ShapeRenderConfig } from '../types'

describe('Mermaid Shapes', () => {
  const baseConfig: ShapeRenderConfig = {
    id: 'test-node',
    x: 100,
    y: 100,
    width: 120,
    height: 60,
    text: 'Test Node',
    fill: '#e6f7ff',
    stroke: '#1890ff',
  }

  describe('renderStadium', () => {
    it('should render stadium shape', () => {
      const node = renderStadium(baseConfig)
      expect(node).toBeDefined()
      expect(node.id).toBe('test-node')
      expect(node.shape).toBe('path')
    })

    it('should have correct position', () => {
      const node = renderStadium(baseConfig)
      expect(node.position()).toEqual({ x: 100, y: 100 })
    })

    it('should have path data', () => {
      const node = renderStadium(baseConfig)
      const d = node.attr('body/d')
      expect(d).toContain('M')
      expect(d).toContain('A')
    })
  })

  describe('renderCylinder', () => {
    it('should render cylinder shape', () => {
      const node = renderCylinder(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('path')
    })

    it('should have cylinder path data', () => {
      const node = renderCylinder(baseConfig)
      const d = node.attr('body/d')
      expect(d).toContain('Q')
    })
  })

  describe('renderHexagon', () => {
    it('should render hexagon shape', () => {
      const node = renderHexagon(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('path')
    })

    it('should have 6 sides in path', () => {
      const node = renderHexagon(baseConfig)
      const d = node.attr('body/d')
      expect(d).toContain('M')
      expect(d).toContain('L')
      expect(d).toContain('Z')
    })
  })

  describe('renderParallelogramLeft', () => {
    it('should render parallelogram shape', () => {
      const node = renderParallelogramLeft(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('polygon')
    })

    it('should have 4 points', () => {
      const node = renderParallelogramLeft(baseConfig)
      const points = node.attr('body/points') as string
      const pointCount = points.split(' ').length
      expect(pointCount).toBe(4)
    })
  })

  describe('renderParallelogramRight', () => {
    it('should render right-slanted parallelogram', () => {
      const node = renderParallelogramRight(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderTrapezoidTop', () => {
    it('should render trapezoid with wider top', () => {
      const node = renderTrapezoidTop(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderTrapezoidBottom', () => {
    it('should render trapezoid with wider bottom', () => {
      const node = renderTrapezoidBottom(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderSubroutine', () => {
    it('should render subroutine shape with double border', () => {
      const node = renderSubroutine(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('path')
    })

    it('should have fillRule attribute', () => {
      const node = renderSubroutine(baseConfig)
      const fillRule = node.attr('body/fillRule')
      expect(fillRule).toBe('evenodd')
    })
  })

  describe('renderDoubleCircle', () => {
    it('should render double circle shape', () => {
      const node = renderDoubleCircle(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('path')
    })

    it('should have two circles in path', () => {
      const node = renderDoubleCircle(baseConfig)
      const d = node.attr('body/d') as string
      const arcCount = (d.match(/A/g) || []).length
      expect(arcCount).toBeGreaterThanOrEqual(4) // 2 circles, each with 2 arcs
    })
  })

  describe('renderAsymmetric', () => {
    it('should render asymmetric shape', () => {
      const node = renderAsymmetric(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('path')
    })
  })

  describe('renderCircle', () => {
    it('should render circle shape', () => {
      const node = renderCircle(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('path')
    })

    it('should have circular path', () => {
      const node = renderCircle(baseConfig)
      const d = node.attr('body/d')
      expect(d).toContain('A')
    })
  })

  describe('renderRhombus', () => {
    it('should render rhombus shape', () => {
      const node = renderRhombus(baseConfig)
      expect(node).toBeDefined()
      expect(node.shape).toBe('polygon')
    })

    it('should have 4 points', () => {
      const node = renderRhombus(baseConfig)
      const points = node.attr('body/points') as string
      const pointCount = points.split(' ').length
      expect(pointCount).toBe(4)
    })
  })

  describe('mermaidRenderers', () => {
    it('should export all shape renderers', () => {
      expect(mermaidRenderers).toHaveProperty('mermaid-stadium')
      expect(mermaidRenderers).toHaveProperty('mermaid-cylinder')
      expect(mermaidRenderers).toHaveProperty('mermaid-hexagon')
      expect(mermaidRenderers).toHaveProperty('mermaid-parallelogram-left')
      expect(mermaidRenderers).toHaveProperty('mermaid-parallelogram-right')
      expect(mermaidRenderers).toHaveProperty('mermaid-trapezoid-top')
      expect(mermaidRenderers).toHaveProperty('mermaid-trapezoid-bottom')
      expect(mermaidRenderers).toHaveProperty('mermaid-subroutine')
      expect(mermaidRenderers).toHaveProperty('mermaid-double-circle')
      expect(mermaidRenderers).toHaveProperty('mermaid-asymmetric')
      expect(mermaidRenderers).toHaveProperty('mermaid-circle')
      expect(mermaidRenderers).toHaveProperty('mermaid-rhombus')
    })

    it('should have callable renderers', () => {
      Object.values(mermaidRenderers).forEach(renderer => {
        expect(typeof renderer).toBe('function')
      })
    })
  })

  describe('shape styling', () => {
    it('should apply custom fill color', () => {
      const config = { ...baseConfig, fill: '#ff0000' }
      const node = renderStadium(config)
      expect(node.attr('body/fill')).toBe('#ff0000')
    })

    it('should apply custom stroke color', () => {
      const config = { ...baseConfig, stroke: '#00ff00' }
      const node = renderStadium(config)
      expect(node.attr('body/stroke')).toBe('#00ff00')
    })

    it('should apply text label', () => {
      const node = renderStadium(baseConfig)
      expect(node.attr('label/text')).toBe('Test Node')
    })
  })

  describe('shape dimensions', () => {
    it('should respect custom width', () => {
      const config = { ...baseConfig, width: 200 }
      const node = renderStadium(config)
      expect(node.size().width).toBe(200)
    })

    it('should respect custom height', () => {
      const config = { ...baseConfig, height: 100 }
      const node = renderStadium(config)
      expect(node.size().height).toBe(100)
    })
  })
})
