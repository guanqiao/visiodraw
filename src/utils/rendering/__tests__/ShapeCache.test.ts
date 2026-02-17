import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ShapeCache } from '../ShapeCache'
import { Node } from '@antv/x6'

// Mock X6 Node - 创建一个可以递归 clone 的 mock
const createMockNode = (): any => {
  const clonedNode: any = {
    id: 'cloned-node',
    setPosition: vi.fn(),
    prop: vi.fn(),
    attr: vi.fn(),
  }
  // 让 clonedNode 也能 clone
  clonedNode.clone = vi.fn().mockReturnValue(clonedNode)

  return {
    id: 'test-node',
    clone: vi.fn().mockReturnValue(clonedNode),
  } as unknown as Node
}

describe('ShapeCache', () => {
  let cache: ShapeCache

  beforeEach(() => {
    cache = new ShapeCache(10)
  })

  describe('set and get', () => {
    it('should store and retrieve a node', () => {
      const mockNode = createMockNode()
      const config = { width: 100, height: 60, fill: '#ffffff', stroke: '#333333' }
      cache.set('rectangle', config, mockNode)

      const result = cache.get('rectangle', config)
      expect(result).toBeDefined()
      expect(mockNode.clone).toHaveBeenCalled()
    })

    it('should return undefined for non-existent key', () => {
      const config = { width: 100, height: 60, fill: '#ffffff', stroke: '#333333' }
      const result = cache.get('circle', config)
      expect(result).toBeUndefined()
    })

    it('should update access count on get', () => {
      const mockNode = createMockNode()
      const config = { width: 100, height: 60, fill: '#ffffff', stroke: '#333333' }
      cache.set('rectangle', config, mockNode)
      cache.get('rectangle', config)
      cache.get('rectangle', config)

      const stats = cache.getStats()
      expect(stats.totalAccesses).toBeGreaterThan(0)
    })
  })

  describe('LRU eviction', () => {
    it('should respect max size limit', () => {
      const smallCache = new ShapeCache(2)

      // 使用不同的 config 来确保生成不同的 key
      const config1 = { width: 100, height: 60, fill: '#ff0000', stroke: '#333333' }
      const config2 = { width: 120, height: 80, fill: '#00ff00', stroke: '#333333' }
      const config3 = { width: 140, height: 100, fill: '#0000ff', stroke: '#333333' }

      smallCache.set('rect1', config1, createMockNode())
      smallCache.set('rect2', config2, createMockNode())
      smallCache.set('rect3', config3, createMockNode())

      // 缓存大小应该不超过 maxSize
      expect(smallCache.size()).toBeLessThanOrEqual(2)
    })
  })

  describe('clear', () => {
    it('should clear all cached items', () => {
      const mockNode = createMockNode()
      const config = { width: 100, height: 60, fill: '#ffffff', stroke: '#333333' }
      cache.set('rectangle', config, mockNode)

      cache.clear()

      expect(cache.size()).toBe(0)
      expect(cache.get('rectangle', config)).toBeUndefined()
    })
  })

  describe('stats', () => {
    it('should return correct statistics', () => {
      const mockNode = createMockNode()
      const config = { width: 100, height: 60, fill: '#ffffff', stroke: '#333333' }
      cache.set('rectangle', config, mockNode)
      cache.get('rectangle', config)

      const stats = cache.getStats()
      expect(stats.size).toBe(1)
      expect(stats.maxSize).toBe(10)
      expect(stats.totalAccesses).toBeGreaterThan(0)
    })
  })
})
