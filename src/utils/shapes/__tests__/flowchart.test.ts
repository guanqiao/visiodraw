import { describe, it, expect } from 'vitest'
import { 
  renderProcess, 
  renderDecision, 
  renderStartEnd, 
  renderInputOutput, 
  renderDocument, 
  renderDatabase, 
  renderPreparation, 
  renderManualInput, 
  renderDisplay, 
  renderOffPage 
} from '../flowchart'
import type { ShapeRenderConfig } from '../types'

describe('flowchart shape renderers', () => {
  const defaultConfig: ShapeRenderConfig = {
    id: 'test-flowchart',
    x: 100,
    y: 200,
    width: 120,
    height: 80,
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
    text: 'Test',
  }

  describe('renderProcess', () => {
    it('should create a process shape (rectangle)', () => {
      const node = renderProcess(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('rect')
    })
  })

  describe('renderDecision', () => {
    it('should create a decision shape (diamond)', () => {
      const node = renderDecision(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderStartEnd', () => {
    it('should create a start/end shape with rounded corners', () => {
      const node = renderStartEnd(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('rect')
      expect(node.attr('body/rx')).toBe(defaultConfig.height / 2)
      expect(node.attr('body/ry')).toBe(defaultConfig.height / 2)
    })
  })

  describe('renderInputOutput', () => {
    it('should create an input/output shape (parallelogram)', () => {
      const node = renderInputOutput(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderDocument', () => {
    it('should create a document shape', () => {
      const node = renderDocument(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderDatabase', () => {
    it('should create a database shape (cylinder)', () => {
      const node = renderDatabase(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderPreparation', () => {
    it('should create a preparation shape (hexagon)', () => {
      const node = renderPreparation(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderManualInput', () => {
    it('should create a manual input shape (trapezoid)', () => {
      const node = renderManualInput(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderDisplay', () => {
    it('should create a display shape', () => {
      const node = renderDisplay(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('polygon')
    })
  })

  describe('renderOffPage', () => {
    it('should create an off-page connector shape (arrow)', () => {
      const node = renderOffPage(defaultConfig)
      
      expect(node.id).toBe('test-flowchart')
      expect(node.shape).toBe('polygon')
    })
  })
})
