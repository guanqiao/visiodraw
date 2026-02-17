import { describe, it, expect } from 'vitest'
import { 
  renderErEntity,
  renderErWeakEntity,
  renderErTableEntity,
  renderErAttribute,
  renderErKeyAttribute,
  renderErRelationship,
  renderErWeakRelationship,
  renderErCardinality,
  renderErIsaHierarchy,
} from '../er'
import type { ShapeRenderConfig } from '../types'

describe('ER shape renderers', () => {
  const defaultConfig: ShapeRenderConfig = {
    id: 'test-er',
    x: 100,
    y: 200,
    width: 120,
    height: 80,
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
    text: 'Customer',
  }

  describe('renderErEntity', () => {
    it('should create an ER entity shape (rectangle)', () => {
      const node = renderErEntity(defaultConfig)
      
      expect(node.id).toBe('test-er')
      expect(node.shape).toBe('rect')
    })
  })

  describe('renderErWeakEntity', () => {
    it('should create a weak entity shape (double rectangle)', () => {
      const node = renderErWeakEntity(defaultConfig)
      
      expect(node.id).toBe('test-er')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderErTableEntity', () => {
    it('should create an ER table entity shape', () => {
      const node = renderErTableEntity(defaultConfig)
      
      expect(node.id).toBe('test-er')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderErAttribute', () => {
    it('should create an ER attribute shape (ellipse)', () => {
      const node = renderErAttribute(defaultConfig)
      
      expect(node.id).toBe('test-er')
      expect(node.shape).toBe('ellipse')
    })
  })

  describe('renderErKeyAttribute', () => {
    it('should create a key attribute with underline', () => {
      const node = renderErKeyAttribute(defaultConfig)
      
      expect(node.id).toBe('test-er')
      expect(node.shape).toBe('ellipse')
      expect(node.attr('label/textDecoration')).toBe('underline')
    })
  })

  describe('renderErRelationship', () => {
    it('should create an ER relationship shape (diamond)', () => {
      const node = renderErRelationship(defaultConfig)
      
      expect(node.id).toBe('test-er')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderErWeakRelationship', () => {
    it('should create a weak relationship shape (double diamond)', () => {
      const node = renderErWeakRelationship(defaultConfig)
      
      expect(node.id).toBe('test-er')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderErCardinality', () => {
    it('should create a cardinality label', () => {
      const node = renderErCardinality(defaultConfig)
      
      expect(node.id).toBe('test-er')
    })
  })

  describe('renderErIsaHierarchy', () => {
    it('should create an ISA hierarchy shape (triangle)', () => {
      const node = renderErIsaHierarchy(defaultConfig)
      
      expect(node.id).toBe('test-er')
      expect(node.shape).toBe('polygon')
    })

    it('should have ISA as default text', () => {
      const node = renderErIsaHierarchy({ ...defaultConfig, text: undefined })
      
      expect(node.attr('label/text')).toBe('ISA')
    })
  })
})
