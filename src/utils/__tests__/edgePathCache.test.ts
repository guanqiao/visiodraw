/**
 * EdgePathCache 测试用例
 *
 * 测试边路径缓存系统的核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { EdgePathCache, defaultCacheOptions } from '../edgePathCache'
import type { RoutePoint } from '../connectorRouter'

describe('EdgePathCache', () => {
  let cache: EdgePathCache

  beforeEach(() => {
    cache = new EdgePathCache()
  })

  describe('基本功能', () => {
    it('应该使用默认配置创建', () => {
      const stats = cache.getStats()
      expect(stats.maxSize).toBe(defaultCacheOptions.maxSize)
      expect(stats.enabled).toBe(true)
      expect(stats.size).toBe(0)
    })

    it('应该支持自定义配置', () => {
      const customCache = new EdgePathCache({
        maxSize: 100,
        ttl: 1000,
        enabled: false,
      })
      const stats = customCache.getStats()
      expect(stats.maxSize).toBe(100)
      expect(stats.enabled).toBe(false)
    })

    it('应该能更新配置', () => {
      cache.updateOptions({ maxSize: 50 })
      const stats = cache.getStats()
      expect(stats.maxSize).toBe(50)
    })
  })

  describe('缓存操作', () => {
    const edgeId = 'edge-1'
    const sourceX = 100
    const sourceY = 100
    const targetX = 200
    const targetY = 200
    const points: RoutePoint[] = [
      { x: 100, y: 100 },
      { x: 150, y: 150 },
      { x: 200, y: 200 },
    ]

    it('应该设置和获取缓存', () => {
      cache.set(edgeId, sourceX, sourceY, targetX, targetY, points)

      const cached = cache.get(edgeId, sourceX, sourceY, targetX, targetY)
      expect(cached).toEqual(points)
    })

    it('应该在位置变化时返回 null', () => {
      cache.set(edgeId, sourceX, sourceY, targetX, targetY, points)

      const cached = cache.get(edgeId, sourceX + 10, sourceY, targetX, targetY)
      expect(cached).toBeNull()
    })

    it('应该支持节点尺寸', () => {
      cache.set(
        edgeId,
        sourceX,
        sourceY,
        targetX,
        targetY,
        points,
        50,
        50,
        60,
        60
      )

      const cached = cache.get(
        edgeId,
        sourceX,
        sourceY,
        targetX,
        targetY,
        50,
        50,
        60,
        60
      )
      expect(cached).toEqual(points)
    })

    it('应该在尺寸变化时返回 null', () => {
      cache.set(
        edgeId,
        sourceX,
        sourceY,
        targetX,
        targetY,
        points,
        50,
        50,
        60,
        60
      )

      const cached = cache.get(
        edgeId,
        sourceX,
        sourceY,
        targetX,
        targetY,
        55, // 尺寸变化
        50,
        60,
        60
      )
      expect(cached).toBeNull()
    })
  })

  describe('缓存失效', () => {
    const edgeId = 'edge-1'
    const points: RoutePoint[] = [{ x: 0, y: 0 }]

    it('应该使特定边的缓存失效', () => {
      cache.set(edgeId, 0, 0, 100, 100, points)
      cache.invalidate(edgeId)

      const cached = cache.get(edgeId, 0, 0, 100, 100)
      expect(cached).toBeNull()
    })

    it('应该使多个边的缓存失效', () => {
      cache.set('edge-1', 0, 0, 100, 100, points)
      cache.set('edge-2', 0, 0, 100, 100, points)
      cache.invalidateMultiple(['edge-1', 'edge-2'])

      expect(cache.get('edge-1', 0, 0, 100, 100)).toBeNull()
      expect(cache.get('edge-2', 0, 0, 100, 100)).toBeNull()
    })

    it('应该清空所有缓存', () => {
      cache.set('edge-1', 0, 0, 100, 100, points)
      cache.set('edge-2', 0, 0, 100, 100, points)
      cache.clear()

      const stats = cache.getStats()
      expect(stats.size).toBe(0)
    })
  })

  describe('LRU 淘汰', () => {
    it('应该在缓存满时淘汰最久未使用的', () => {
      const smallCache = new EdgePathCache({ maxSize: 2 })
      const points: RoutePoint[] = [{ x: 0, y: 0 }]

      smallCache.set('edge-1', 0, 0, 100, 100, points)
      smallCache.set('edge-2', 0, 0, 100, 100, points)
      smallCache.set('edge-3', 0, 0, 100, 100, points) // 应该淘汰 edge-1

      expect(smallCache.get('edge-1', 0, 0, 100, 100)).toBeNull()
      expect(smallCache.get('edge-2', 0, 0, 100, 100)).toEqual(points)
      expect(smallCache.get('edge-3', 0, 0, 100, 100)).toEqual(points)
    })

    it('应该在访问后更新 LRU 顺序', () => {
      const smallCache = new EdgePathCache({ maxSize: 2 })
      const points: RoutePoint[] = [{ x: 0, y: 0 }]

      smallCache.set('edge-1', 0, 0, 100, 100, points)
      smallCache.set('edge-2', 0, 0, 100, 100, points)
      smallCache.get('edge-1', 0, 0, 100, 100) // 访问 edge-1，更新顺序
      smallCache.set('edge-3', 0, 0, 100, 100, points) // 应该淘汰 edge-2

      expect(smallCache.get('edge-1', 0, 0, 100, 100)).toEqual(points)
      expect(smallCache.get('edge-2', 0, 0, 100, 100)).toBeNull()
    })
  })

  describe('禁用缓存', () => {
    it('应该在禁用时返回 null', () => {
      const disabledCache = new EdgePathCache({ enabled: false })
      const points: RoutePoint[] = [{ x: 0, y: 0 }]

      disabledCache.set('edge-1', 0, 0, 100, 100, points)
      const cached = disabledCache.get('edge-1', 0, 0, 100, 100)

      expect(cached).toBeNull()
    })

    it('应该在禁用时清空缓存', () => {
      const points: RoutePoint[] = [{ x: 0, y: 0 }]
      cache.set('edge-1', 0, 0, 100, 100, points)

      cache.updateOptions({ enabled: false })

      const stats = cache.getStats()
      expect(stats.size).toBe(0)
      expect(stats.enabled).toBe(false)
    })
  })

  describe('统计信息', () => {
    it('应该返回正确的统计信息', () => {
      const points: RoutePoint[] = [{ x: 0, y: 0 }]
      cache.set('edge-1', 0, 0, 100, 100, points)

      const stats = cache.getStats()
      expect(stats.size).toBe(1)
      expect(stats.maxSize).toBe(defaultCacheOptions.maxSize)
      expect(stats.enabled).toBe(true)
      expect(stats.hitRate).toBeGreaterThanOrEqual(0)
    })
  })

  describe('配置支持', () => {
    it('应该支持配置哈希', () => {
      const points: RoutePoint[] = [{ x: 0, y: 0 }]
      const config1 = { style: 'straight' }
      const config2 = { style: 'curved' }

      cache.set('edge-1', 0, 0, 100, 100, points, undefined, undefined, undefined, undefined, config1)

      const cached1 = cache.get('edge-1', 0, 0, 100, 100, undefined, undefined, undefined, undefined, config1)
      expect(cached1).toEqual(points)

      const cached2 = cache.get('edge-1', 0, 0, 100, 100, undefined, undefined, undefined, undefined, config2)
      expect(cached2).toBeNull()
    })
  })
})
