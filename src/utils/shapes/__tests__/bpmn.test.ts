import { describe, it, expect } from 'vitest'
import { 
  renderBpmnStartEvent,
  renderBpmnEndEvent,
  renderBpmnIntermediateEvent,
  renderBpmnTask,
  renderBpmnUserTask,
  renderBpmnServiceTask,
  renderBpmnExclusiveGateway,
  renderBpmnParallelGateway,
  renderBpmnInclusiveGateway,
  renderBpmnPool,
  renderBpmnLane,
} from '../bpmn'
import type { ShapeRenderConfig } from '../types'

describe('BPMN shape renderers', () => {
  const defaultConfig: ShapeRenderConfig = {
    id: 'test-bpmn',
    x: 100,
    y: 200,
    width: 100,
    height: 80,
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
    text: 'Task',
  }

  describe('renderBpmnStartEvent', () => {
    it('should create a BPMN start event shape', () => {
      const node = renderBpmnStartEvent(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderBpmnEndEvent', () => {
    it('should create a BPMN end event shape with thicker stroke', () => {
      const node = renderBpmnEndEvent(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
      expect(node.attr('body/strokeWidth')).toBe(3)
    })
  })

  describe('renderBpmnIntermediateEvent', () => {
    it('should create a BPMN intermediate event shape', () => {
      const node = renderBpmnIntermediateEvent(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderBpmnTask', () => {
    it('should create a BPMN task shape', () => {
      const node = renderBpmnTask(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderBpmnUserTask', () => {
    it('should create a BPMN user task shape', () => {
      const node = renderBpmnUserTask(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderBpmnServiceTask', () => {
    it('should create a BPMN service task shape', () => {
      const node = renderBpmnServiceTask(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderBpmnExclusiveGateway', () => {
    it('should create an exclusive gateway shape', () => {
      const node = renderBpmnExclusiveGateway(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderBpmnParallelGateway', () => {
    it('should create a parallel gateway shape', () => {
      const node = renderBpmnParallelGateway(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderBpmnInclusiveGateway', () => {
    it('should create an inclusive gateway shape', () => {
      const node = renderBpmnInclusiveGateway(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderBpmnPool', () => {
    it('should create a BPMN pool shape', () => {
      const node = renderBpmnPool(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderBpmnLane', () => {
    it('should create a BPMN lane shape', () => {
      const node = renderBpmnLane(defaultConfig)
      
      expect(node.id).toBe('test-bpmn')
      expect(node.shape).toBe('path')
    })
  })
})
