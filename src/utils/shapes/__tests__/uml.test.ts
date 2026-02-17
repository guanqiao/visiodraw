import { describe, it, expect } from 'vitest'
import { 
  renderUmlClass,
  renderUmlInterface,
  renderUmlActor,
  renderUmlUseCase,
  renderUmlPackage,
  renderUmlComponent,
  renderUmlNode,
  renderUmlNote,
  renderUmlLifeline,
  renderUmlActivation,
  renderUmlFragment,
} from '../uml'
import type { ShapeRenderConfig } from '../types'

describe('UML shape renderers', () => {
  const defaultConfig: ShapeRenderConfig = {
    id: 'test-uml',
    x: 100,
    y: 200,
    width: 120,
    height: 80,
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
    text: 'TestClass',
  }

  describe('renderUmlClass', () => {
    it('should create a UML class shape', () => {
      const node = renderUmlClass(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderUmlInterface', () => {
    it('should create a UML interface with stereotype', () => {
      const node = renderUmlInterface(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('rect')
      expect(node.attr('label/text')).toContain('«interface»')
    })

    it('should include interface name in label', () => {
      const node = renderUmlInterface({ ...defaultConfig, text: 'IRepository' })
      
      expect(node.attr('label/text')).toBe('«interface»\nIRepository')
    })
  })

  describe('renderUmlActor', () => {
    it('should create a UML actor shape', () => {
      const node = renderUmlActor(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderUmlUseCase', () => {
    it('should create a UML use case shape (ellipse)', () => {
      const node = renderUmlUseCase(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('ellipse')
    })
  })

  describe('renderUmlPackage', () => {
    it('should create a UML package shape', () => {
      const node = renderUmlPackage(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderUmlComponent', () => {
    it('should create a UML component shape', () => {
      const node = renderUmlComponent(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderUmlNode', () => {
    it('should create a UML node shape', () => {
      const node = renderUmlNode(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderUmlNote', () => {
    it('should create a UML note shape', () => {
      const node = renderUmlNote(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderUmlLifeline', () => {
    it('should create a UML lifeline shape', () => {
      const node = renderUmlLifeline(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderUmlActivation', () => {
    it('should create a UML activation shape (rectangle)', () => {
      const node = renderUmlActivation(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('rect')
    })
  })

  describe('renderUmlFragment', () => {
    it('should create a UML fragment shape', () => {
      const node = renderUmlFragment(defaultConfig)
      
      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('rect')
    })
  })
})
