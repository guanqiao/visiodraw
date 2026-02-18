/**
 * nodeChangeDetector 测试用例
 *
 * 测试节点变化检测和批量处理功能
 */

import { describe, it, expect, vi } from 'vitest'
import {
  detectNodeChanges,
  hasNodeChanged,
  createNodeChangeBatch,
  debounce,
  throttle,
} from '../nodeChangeDetector'
import type { ShapeData as NodeData } from '../../../stores/x6GraphStore'

// 创建测试节点
const createNode = (overrides: Partial<NodeData> = {}): NodeData => ({
  id: 'node-1',
  type: 'rect',
  x: 100,
  y: 100,
  width: 80,
  height: 60,
  text: 'Test Node',
  fill: '#ffffff',
  stroke: '#333333',
  strokeWidth: 2,
  ...overrides,
})

describe('nodeChangeDetector', () => {
  describe('detectNodeChanges', () => {
    it('应该检测到新节点的所有变化', () => {
      const newNode = createNode()

      const changes = detectNodeChanges(undefined, newNode)

      expect(changes.positionChanged).toBe(true)
      expect(changes.sizeChanged).toBe(true)
      expect(changes.styleChanged).toBe(true)
      expect(changes.textChanged).toBe(true)
    })

    it('应该检测到位置变化', () => {
      const oldNode = createNode({ x: 100, y: 100 })
      const newNode = createNode({ x: 150, y: 100 })

      const changes = detectNodeChanges(oldNode, newNode)

      expect(changes.positionChanged).toBe(true)
      expect(changes.sizeChanged).toBe(false)
      expect(changes.styleChanged).toBe(false)
      expect(changes.textChanged).toBe(false)
    })

    it('应该检测到 Y 坐标变化', () => {
      const oldNode = createNode({ y: 100 })
      const newNode = createNode({ y: 200 })

      const changes = detectNodeChanges(oldNode, newNode)

      expect(changes.positionChanged).toBe(true)
    })

    it('应该检测到大小变化', () => {
      const oldNode = createNode({ width: 80, height: 60 })
      const newNode = createNode({ width: 100, height: 60 })

      const changes = detectNodeChanges(oldNode, newNode)

      expect(changes.positionChanged).toBe(false)
      expect(changes.sizeChanged).toBe(true)
      expect(changes.styleChanged).toBe(false)
      expect(changes.textChanged).toBe(false)
    })

    it('应该检测到高度变化', () => {
      const oldNode = createNode({ height: 60 })
      const newNode = createNode({ height: 80 })

      const changes = detectNodeChanges(oldNode, newNode)

      expect(changes.sizeChanged).toBe(true)
    })

    it('应该检测到样式变化', () => {
      const oldNode = createNode({ fill: '#ffffff' })
      const newNode = createNode({ fill: '#ff0000' })

      const changes = detectNodeChanges(oldNode, newNode)

      expect(changes.positionChanged).toBe(false)
      expect(changes.sizeChanged).toBe(false)
      expect(changes.styleChanged).toBe(true)
      expect(changes.textChanged).toBe(false)
    })

    it('应该检测到边框颜色变化', () => {
      const oldNode = createNode({ stroke: '#333333' })
      const newNode = createNode({ stroke: '#000000' })

      const changes = detectNodeChanges(oldNode, newNode)

      expect(changes.styleChanged).toBe(true)
    })

    it('应该检测到边框宽度变化', () => {
      const oldNode = createNode({ strokeWidth: 2 })
      const newNode = createNode({ strokeWidth: 4 })

      const changes = detectNodeChanges(oldNode, newNode)

      expect(changes.styleChanged).toBe(true)
    })

    it('应该检测到文本变化', () => {
      const oldNode = createNode({ text: 'Old Text' })
      const newNode = createNode({ text: 'New Text' })

      const changes = detectNodeChanges(oldNode, newNode)

      expect(changes.positionChanged).toBe(false)
      expect(changes.sizeChanged).toBe(false)
      expect(changes.styleChanged).toBe(false)
      expect(changes.textChanged).toBe(true)
    })

    it('应该返回无变化当节点相同', () => {
      const oldNode = createNode()
      const newNode = createNode()

      const changes = detectNodeChanges(oldNode, newNode)

      expect(changes.positionChanged).toBe(false)
      expect(changes.sizeChanged).toBe(false)
      expect(changes.styleChanged).toBe(false)
      expect(changes.textChanged).toBe(false)
    })
  })

  describe('hasNodeChanged', () => {
    it('应该返回 true 当 oldNode 为 undefined', () => {
      const newNode = createNode()

      expect(hasNodeChanged(undefined, newNode)).toBe(true)
    })

    it('应该返回 false 当节点未变化', () => {
      const oldNode = createNode()
      const newNode = createNode()

      expect(hasNodeChanged(oldNode, newNode)).toBe(false)
    })

    it('应该返回 true 当位置变化', () => {
      const oldNode = createNode({ x: 100 })
      const newNode = createNode({ x: 200 })

      expect(hasNodeChanged(oldNode, newNode)).toBe(true)
    })

    it('应该返回 true 当大小变化', () => {
      const oldNode = createNode({ width: 80 })
      const newNode = createNode({ width: 100 })

      expect(hasNodeChanged(oldNode, newNode)).toBe(true)
    })

    it('应该返回 true 当样式变化', () => {
      const oldNode = createNode({ fill: '#ffffff' })
      const newNode = createNode({ fill: '#000000' })

      expect(hasNodeChanged(oldNode, newNode)).toBe(true)
    })

    it('应该返回 true 当文本变化', () => {
      const oldNode = createNode({ text: 'Old' })
      const newNode = createNode({ text: 'New' })

      expect(hasNodeChanged(oldNode, newNode)).toBe(true)
    })
  })

  describe('createNodeChangeBatch', () => {
    it('应该识别新增的节点', () => {
      const previousNodes: NodeData[] = []
      const currentNodes = [createNode({ id: 'node-1' })]

      const batch = createNodeChangeBatch(currentNodes, previousNodes)

      expect(batch.added).toHaveLength(1)
      expect(batch.added[0].id).toBe('node-1')
      expect(batch.removed).toHaveLength(0)
      expect(batch.updated).toHaveLength(0)
    })

    it('应该识别删除的节点', () => {
      const previousNodes = [createNode({ id: 'node-1' })]
      const currentNodes: NodeData[] = []

      const batch = createNodeChangeBatch(currentNodes, previousNodes)

      expect(batch.added).toHaveLength(0)
      expect(batch.removed).toHaveLength(1)
      expect(batch.removed[0]).toBe('node-1')
      expect(batch.updated).toHaveLength(0)
    })

    it('应该识别更新的节点', () => {
      const previousNodes = [createNode({ id: 'node-1', x: 100 })]
      const currentNodes = [createNode({ id: 'node-1', x: 200 })]

      const batch = createNodeChangeBatch(currentNodes, previousNodes)

      expect(batch.added).toHaveLength(0)
      expect(batch.removed).toHaveLength(0)
      expect(batch.updated).toHaveLength(1)
      expect(batch.updated[0].node.id).toBe('node-1')
      expect(batch.updated[0].changes.positionChanged).toBe(true)
    })

    it('应该处理混合变更', () => {
      const previousNodes = [
        createNode({ id: 'node-1', x: 100 }),
        createNode({ id: 'node-2' }),
      ]
      const currentNodes = [
        createNode({ id: 'node-1', x: 200 }), // 更新
        createNode({ id: 'node-3' }), // 新增
      ]

      const batch = createNodeChangeBatch(currentNodes, previousNodes)

      expect(batch.added).toHaveLength(1)
      expect(batch.added[0].id).toBe('node-3')
      expect(batch.removed).toHaveLength(1)
      expect(batch.removed[0]).toBe('node-2')
      expect(batch.updated).toHaveLength(1)
      expect(batch.updated[0].node.id).toBe('node-1')
    })

    it('应该忽略未变化的节点', () => {
      const previousNodes = [createNode({ id: 'node-1' })]
      const currentNodes = [createNode({ id: 'node-1' })]

      const batch = createNodeChangeBatch(currentNodes, previousNodes)

      expect(batch.added).toHaveLength(0)
      expect(batch.removed).toHaveLength(0)
      expect(batch.updated).toHaveLength(0)
    })
  })

  describe('debounce', () => {
    it('应该延迟执行函数', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('应该取消之前的调用', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)

      vi.useRealTimers()
    })

    it('应该传递参数', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn('arg1', 'arg2')

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')

      vi.useRealTimers()
    })
  })

  describe('throttle', () => {
    it('应该限制执行频率', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(100)
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })

    it('应该在限制时间内只执行一次', () => {
      vi.useFakeTimers()
      const fn = vi.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(50)
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(50)
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })
  })
})
