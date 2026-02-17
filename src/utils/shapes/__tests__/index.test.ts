import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderShape, shapeRenderers } from '../index'
import { globalShapeCache } from '../../rendering/ShapeCache'
import { Node } from '@antv/x6'

describe('renderShape', () => {
  beforeEach(() => {
    globalShapeCache.clear()
  })

  it('should render a rectangle with correct properties', () => {
    const config = {
      id: 'test-rect',
      x: 100,
      y: 200,
      width: 120,
      height: 80,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
      text: 'Test',
    }

    const node = renderShape('rectangle', config)

    expect(node).toBeDefined()
    expect(node.id).toBe('test-rect')
    expect(node.position().x).toBe(100)
    expect(node.position().y).toBe(200)
  })

  it('should use default rectangle when renderer not found', () => {
    const config = {
      id: 'test-unknown',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
    }

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const node = renderShape('unknown-type', config)

    expect(node).toBeDefined()
    expect(node.shape).toBe('rect')
    consoleSpy.mockRestore()
  })

  it('should cache and reuse shapes', () => {
    const config1 = {
      id: 'node-1',
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
    }

    const config2 = {
      id: 'node-2',
      x: 200,
      y: 200,
      width: 120,
      height: 80,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
    }

    const node1 = renderShape('rectangle', config1)
    const node2 = renderShape('rectangle', config2)

    expect(globalShapeCache.size()).toBeGreaterThan(0)
  })

  it('should return different instances for different IDs', () => {
    const config1 = {
      id: 'node-1',
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
    }

    const config2 = {
      id: 'node-2',
      x: 200,
      y: 200,
      width: 120,
      height: 80,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
    }

    const node1 = renderShape('rectangle', config1)
    const node2 = renderShape('rectangle', config2)

    // 验证两个节点是不同的实例
    expect(node1).not.toBe(node2)
    // 验证 ID 被正确设置（克隆后会被覆盖）
    expect(node1.id).toBe('node-1')
    expect(node2.id).toBe('node-2')
  })

  it('should handle rendering errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const config = {
      id: 'test-error',
      x: 0,
      y: 0,
      width: -1, // Invalid width
      height: 80,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
    }

    const node = renderShape('rectangle', config)

    expect(node).toBeDefined()
    consoleSpy.mockRestore()
  })
})

describe('shapeRenderers', () => {
  it('should contain all base renderers', () => {
    expect(shapeRenderers.rectangle).toBeDefined()
    expect(shapeRenderers.circle).toBeDefined()
    expect(shapeRenderers.triangle).toBeDefined()
    expect(shapeRenderers.diamond).toBeDefined()
  })

  it('should contain flowchart renderers', () => {
    expect(shapeRenderers.process).toBeDefined()
    expect(shapeRenderers.decision).toBeDefined()
    expect(shapeRenderers['start-end']).toBeDefined()
  })

  it('should contain UML renderers', () => {
    expect(shapeRenderers['uml-class']).toBeDefined()
    expect(shapeRenderers['uml-actor']).toBeDefined()
    expect(shapeRenderers['uml-usecase']).toBeDefined()
  })

  it('should contain ER renderers', () => {
    expect(shapeRenderers['er-entity']).toBeDefined()
    expect(shapeRenderers['er-relationship']).toBeDefined()
    expect(shapeRenderers['er-attribute']).toBeDefined()
  })

  it('should contain BPMN renderers', () => {
    expect(shapeRenderers['bpmn-start-event']).toBeDefined()
    expect(shapeRenderers['bpmn-task']).toBeDefined()
    expect(shapeRenderers['bpmn-exclusive-gateway']).toBeDefined()
  })

  it('should contain cloud renderers', () => {
    expect(shapeRenderers.server).toBeDefined()
    expect(shapeRenderers.cloud).toBeDefined()
    expect(shapeRenderers.router).toBeDefined()
  })
})
