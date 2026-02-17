import { describe, it, expect } from 'vitest'
import { renderRectangle, renderRoundedRectangle, renderCircle, renderEllipse, renderTriangle, renderDiamond, renderPentagon, renderHexagon, renderStar, renderCross } from '../base'
import type { ShapeRenderConfig } from '../types'

describe('base shape renderers', () => {
  const defaultConfig: ShapeRenderConfig = {
    id: 'test-shape',
    x: 100,
    y: 200,
    width: 120,
    height: 80,
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
    text: 'Test Shape',
  }

  describe('renderRectangle', () => {
    it('should create a rectangle node with correct properties', () => {
      const node = renderRectangle(defaultConfig)
      
      expect(node.id).toBe('test-shape')
      expect(node.position().x).toBe(100)
      expect(node.position().y).toBe(200)
      expect(node.size().width).toBe(120)
      expect(node.size().height).toBe(80)
    })

    it('should apply default fill and stroke colors', () => {
      const node = renderRectangle({ ...defaultConfig, fill: undefined, stroke: undefined })
      
      expect(node.attr('body/fill')).toBe('#ffffff')
      expect(node.attr('body/stroke')).toBe('#333333')
    })

    it('should apply custom fill and stroke colors', () => {
      const node = renderRectangle(defaultConfig)
      
      expect(node.attr('body/fill')).toBe('#e6f7ff')
      expect(node.attr('body/stroke')).toBe('#1890ff')
    })

    it('should set text label', () => {
      const node = renderRectangle(defaultConfig)
      
      expect(node.attr('label/text')).toBe('Test Shape')
    })

    it('should have connection ports', () => {
      const node = renderRectangle(defaultConfig)
      const ports = node.getPorts()
      
      expect(ports.length).toBe(4)
      expect(ports.map(p => p.id)).toContain('top')
      expect(ports.map(p => p.id)).toContain('bottom')
      expect(ports.map(p => p.id)).toContain('left')
      expect(ports.map(p => p.id)).toContain('right')
    })
  })

  describe('renderRoundedRectangle', () => {
    it('should create a rounded rectangle with corner radius', () => {
      const node = renderRoundedRectangle(defaultConfig)
      
      expect(node.attr('body/rx')).toBe(15) // Mermaid 默认圆角
      expect(node.attr('body/ry')).toBe(15)
    })

    it('should use custom corner radius', () => {
      const node = renderRoundedRectangle({ ...defaultConfig, rx: 20, ry: 10 })
      
      expect(node.attr('body/rx')).toBe(20)
      expect(node.attr('body/ry')).toBe(10)
    })
  })

  describe('renderCircle', () => {
    it('should create a circle node', () => {
      const node = renderCircle(defaultConfig)
      
      expect(node.id).toBe('test-shape')
      expect(node.shape).toBe('circle')
    })
  })

  describe('renderEllipse', () => {
    it('should create an ellipse node', () => {
      const node = renderEllipse(defaultConfig)
      
      expect(node.id).toBe('test-shape')
      expect(node.shape).toBe('ellipse')
    })
  })

  describe('renderTriangle', () => {
    it('should create a triangle node', () => {
      const node = renderTriangle(defaultConfig)
      
      expect(node.id).toBe('test-shape')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderDiamond', () => {
    it('should create a diamond node', () => {
      const node = renderDiamond(defaultConfig)
      
      expect(node.id).toBe('test-shape')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderPentagon', () => {
    it('should create a pentagon node', () => {
      const node = renderPentagon(defaultConfig)
      
      expect(node.id).toBe('test-shape')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderHexagon', () => {
    it('should create a hexagon node', () => {
      const node = renderHexagon(defaultConfig)
      
      expect(node.id).toBe('test-shape')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderStar', () => {
    it('should create a star node', () => {
      const node = renderStar(defaultConfig)
      
      expect(node.id).toBe('test-shape')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderCross', () => {
    it('should create a cross node', () => {
      const node = renderCross(defaultConfig)
      
      expect(node.id).toBe('test-shape')
      expect(node.shape).toBe('polygon')
    })
  })
})
