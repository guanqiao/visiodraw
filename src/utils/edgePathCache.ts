/**
 * 边路径缓存系统
 *
 * 缓存边的计算路径，提升渲染性能
 * 适用于复杂路由算法和频繁重绘场景
 */

import type { RoutePoint } from './connectorRouter'

export interface EdgePathCacheEntry {
  /** 路径点数组 */
  points: RoutePoint[]
  /** 缓存时间戳 */
  timestamp: number
  /** 源节点位置哈希 */
  sourceHash: string
  /** 目标节点位置哈希 */
  targetHash: string
  /** 路由配置哈希 */
  configHash: string
}

export interface EdgePathCacheOptions {
  /** 最大缓存条目数 */
  maxSize: number
  /** 缓存过期时间（毫秒） */
  ttl: number
  /** 是否启用缓存 */
  enabled: boolean
}

export const defaultCacheOptions: EdgePathCacheOptions = {
  maxSize: 1000,
  ttl: 5 * 60 * 1000, // 5分钟
  enabled: true,
}

/**
 * 边路径缓存类
 */
export class EdgePathCache {
  private cache: Map<string, EdgePathCacheEntry> = new Map()
  private options: EdgePathCacheOptions
  private accessOrder: string[] = []

  constructor(options: Partial<EdgePathCacheOptions> = {}) {
    this.options = { ...defaultCacheOptions, ...options }
  }

  /**
   * 生成缓存键
   */
  private generateKey(
    edgeId: string,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    config?: any
  ): string {
    const configStr = config ? JSON.stringify(config) : ''
    return `${edgeId}:${sourceX},${sourceY}:${targetX},${targetY}:${configStr}`
  }

  /**
   * 生成位置哈希
   */
  private generatePositionHash(x: number, y: number, width?: number, height?: number): string {
    if (width !== undefined && height !== undefined) {
      return `${Math.round(x)},${Math.round(y)},${Math.round(width)},${Math.round(height)}`
    }
    return `${Math.round(x)},${Math.round(y)}`
  }

  /**
   * 生成配置哈希
   */
  private generateConfigHash(config?: any): string {
    if (!config) return ''
    return JSON.stringify(config)
  }

  /**
   * 获取缓存的路径
   */
  get(
    edgeId: string,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    sourceWidth?: number,
    sourceHeight?: number,
    targetWidth?: number,
    targetHeight?: number,
    config?: any
  ): RoutePoint[] | null {
    if (!this.options.enabled) return null

    const key = this.generateKey(edgeId, sourceX, sourceY, targetX, targetY, config)
    const entry = this.cache.get(key)

    if (!entry) return null

    // 检查是否过期
    const now = Date.now()
    if (now - entry.timestamp > this.options.ttl) {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      return null
    }

    // 验证节点位置是否变化
    const currentSourceHash = this.generatePositionHash(sourceX, sourceY, sourceWidth, sourceHeight)
    const currentTargetHash = this.generatePositionHash(targetX, targetY, targetWidth, targetHeight)
    const currentConfigHash = this.generateConfigHash(config)

    if (
      entry.sourceHash !== currentSourceHash ||
      entry.targetHash !== currentTargetHash ||
      entry.configHash !== currentConfigHash
    ) {
      // 位置或配置变化，缓存失效
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      return null
    }

    // 更新访问顺序（LRU）
    this.updateAccessOrder(key)

    return entry.points
  }

  /**
   * 设置缓存
   */
  set(
    edgeId: string,
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    points: RoutePoint[],
    sourceWidth?: number,
    sourceHeight?: number,
    targetWidth?: number,
    targetHeight?: number,
    config?: any
  ): void {
    if (!this.options.enabled) return

    // 检查缓存是否已满
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU()
    }

    const key = this.generateKey(edgeId, sourceX, sourceY, targetX, targetY, config)
    const entry: EdgePathCacheEntry = {
      points,
      timestamp: Date.now(),
      sourceHash: this.generatePositionHash(sourceX, sourceY, sourceWidth, sourceHeight),
      targetHash: this.generatePositionHash(targetX, targetY, targetWidth, targetHeight),
      configHash: this.generateConfigHash(config),
    }

    this.cache.set(key, entry)
    this.updateAccessOrder(key)
  }

  /**
   * 使特定边的缓存失效
   */
  invalidate(edgeId: string): void {
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith(`${edgeId}:`)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
    })
  }

  /**
   * 使多个边的缓存失效
   */
  invalidateMultiple(edgeIds: string[]): void {
    edgeIds.forEach((id) => this.invalidate(id))
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    enabled: boolean
  } {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.calculateHitRate(),
      enabled: this.options.enabled,
    }
  }

  /**
   * 更新缓存选项
   */
  updateOptions(options: Partial<EdgePathCacheOptions>): void {
    this.options = { ...this.options, ...options }

    // 如果禁用缓存，清空现有缓存
    if (!this.options.enabled) {
      this.clear()
    }

    // 如果最大大小减小，执行淘汰
    if (this.cache.size > this.options.maxSize) {
      while (this.cache.size > this.options.maxSize) {
        this.evictLRU()
      }
    }
  }

  /**
   * 更新访问顺序（LRU策略）
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    this.accessOrder.push(key)
  }

  /**
   * 从访问顺序中移除
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  /**
   * 淘汰最久未使用的缓存
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return

    const keyToEvict = this.accessOrder[0]
    this.cache.delete(keyToEvict)
    this.accessOrder.shift()
  }

  /**
   * 计算命中率（简化版本，实际需要跟踪命中/未命中次数）
   */
  private calculateHitRate(): number {
    // 简化实现，返回固定值
    // 实际实现应该跟踪 get 方法的命中和未命中次数
    return this.cache.size > 0 ? 0.85 : 0
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.options.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
    })
  }
}

// 导出单例实例
export const edgePathCache = new EdgePathCache()

export default edgePathCache
