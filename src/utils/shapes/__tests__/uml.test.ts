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
  renderUmlSwimlanePool,
  renderUmlSwimlaneHorizontal,
  renderUmlSwimlaneVertical,
  renderUmlSwimlaneSeparator,
  renderUmlParticipant,
  renderUmlActorSequence,
  renderUmlDatabaseParticipant,
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
      expect(node.shape).toBe('path')
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
      expect(node.shape).toBe('path')
    })
  })

  describe('renderUmlSwimlanePool', () => {
    it('should create a UML swimlane pool shape', () => {
      const node = renderUmlSwimlanePool(defaultConfig)

      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })

    it('should create pool with correct dimensions', () => {
      const config = { ...defaultConfig, width: 600, height: 400 }
      const node = renderUmlSwimlanePool(config)

      expect(node.size().width).toBe(600)
      expect(node.size().height).toBe(400)
    })

    it('should have valid path data', () => {
      const node = renderUmlSwimlanePool(defaultConfig)
      const pathData = node.attr('body/refD')

      expect(pathData).toBeDefined()
      expect(pathData).toContain('M')
      expect(pathData).toContain('L')
      expect(pathData).toContain('Z')
    })
  })

  describe('renderUmlSwimlaneHorizontal', () => {
    it('should create a horizontal swimlane shape', () => {
      const node = renderUmlSwimlaneHorizontal(defaultConfig)

      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })

    it('should create horizontal swimlane with header', () => {
      const config = { ...defaultConfig, width: 400, height: 100 }
      const node = renderUmlSwimlaneHorizontal(config)

      expect(node.size().width).toBe(400)
      expect(node.size().height).toBe(100)
    })
  })

  describe('renderUmlSwimlaneVertical', () => {
    it('should create a vertical swimlane shape', () => {
      const node = renderUmlSwimlaneVertical(defaultConfig)

      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })

    it('should create vertical swimlane with header', () => {
      const config = { ...defaultConfig, width: 120, height: 300 }
      const node = renderUmlSwimlaneVertical(config)

      expect(node.size().width).toBe(120)
      expect(node.size().height).toBe(300)
    })
  })

  describe('renderUmlSwimlaneSeparator', () => {
    it('should create a swimlane separator shape', () => {
      const node = renderUmlSwimlaneSeparator(defaultConfig)

      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })

    it('should have dashed stroke style', () => {
      const node = renderUmlSwimlaneSeparator(defaultConfig)
      const strokeDasharray = node.attr('body/strokeDasharray')

      expect(strokeDasharray).toBe('4,2')
    })
  })

  // ==================== 序列图专用渲染器测试 ====================

  describe('renderUmlParticipant', () => {
    it('should create a sequence diagram participant shape', () => {
      const node = renderUmlParticipant(defaultConfig)

      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('rect')
    })

    it('should have correct styling', () => {
      const node = renderUmlParticipant(defaultConfig)

      expect(node.attr('body/rx')).toBe(6)
      expect(node.attr('body/ry')).toBe(6)
      expect(node.attr('label/fontWeight')).toBe(600)
    })
  })

  describe('renderUmlActorSequence', () => {
    it('should create a sequence diagram actor shape', () => {
      const node = renderUmlActorSequence(defaultConfig)

      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })

    it('should have actor label at bottom', () => {
      const node = renderUmlActorSequence({ ...defaultConfig, text: 'User' })

      expect(node.attr('label/text')).toBe('User')
      expect(node.attr('label/refY')).toBe(defaultConfig.height * 0.85)
    })
  })

  describe('renderUmlDatabaseParticipant', () => {
    it('should create a sequence diagram database shape', () => {
      const node = renderUmlDatabaseParticipant(defaultConfig)

      expect(node.id).toBe('test-uml')
      expect(node.shape).toBe('path')
    })

    it('should have database path with cylinder shape', () => {
      const node = renderUmlDatabaseParticipant(defaultConfig)
      const pathData = node.attr('body/refD')

      expect(pathData).toBeDefined()
      expect(pathData).toContain('Q')
      expect(pathData).toContain('M')
    })
  })
})
