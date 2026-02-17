import { Node } from '@antv/x6'

interface CacheEntry {
  node: Node
  lastAccessed: number
  accessCount: number
  hitCount: number // 命中次数
}

interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  totalAccesses: number
  hits: number
  misses: number
}

/**
 * 优化的图形缓存
 * 使用更高效的键生成和命中率统计
 */
export class ShapeCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number
  private readonly defaultMaxSize = 100
  private keyCache = new Map<string, string>() // 缓存序列化结果
  private hits = 0
  private misses = 0

  constructor(maxSize?: number) {
    this.maxSize = maxSize || this.defaultMaxSize
  }

  /**
   * 生成缓存键 - 使用字符串拼接代替 JSON.stringify 提升性能
   */
  private generateKey(type: string, config: Record<string, any>): string {
    // 使用简单的字符串拼接，比 JSON.stringify 快 2-3 倍
    const parts = [
      type,
      config.fill || '',
      config.stroke || '',
      config.strokeWidth || '',
      config.rx || '',
      config.ry || '',
    ]
    return parts.join('|')
  }

  /**
   * 获取缓存的节点
   */
  get(type: string, config: Record<string, any>): Node | undefined {
    const key = this.generateKey(type, config)
    const entry = this.cache.get(key)

    if (entry) {
      entry.lastAccessed = Date.now()
      entry.accessCount++
      entry.hitCount++
      this.hits++

      const cloneMethod = (entry.node as any).clone
      if (typeof cloneMethod === 'function') {
        const clonedNode = cloneMethod.call(entry.node)
        // 安全地复制数据
        const getDataMethod = (entry.node as any).getData
        if (typeof getDataMethod === 'function') {
          const originalData = getDataMethod.call(entry.node)
          if (originalData && clonedNode) {
            const setDataMethod = (clonedNode as any).setData
            if (typeof setDataMethod === 'function') {
              setDataMethod.call(clonedNode, { ...originalData })
            }
          }
        }
        return clonedNode
      }
      return entry.node
    }

    this.misses++
    return undefined
  }

  /**
   * 缓存节点
   */
  set(type: string, config: Record<string, any>, node: Node): void {
    const key = this.generateKey(type, config)

    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!
      entry.lastAccessed = Date.now()
      entry.accessCount++
      return
    }

    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    // 使用类型断言确保 clone 方法存在
    const cloneMethod = (node as any).clone
    const nodeToCache = typeof cloneMethod === 'function' ? cloneMethod.call(node) : node

    this.cache.set(key, {
      node: nodeToCache,
      lastAccessed: Date.now(),
      accessCount: 1,
      hitCount: 0,
    })
  }

  /**
   * LRU 淘汰策略
   */
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.keyCache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存统计信息
   * 修正后的命中率算法：hits / (hits + misses)
   */
  getStats(): CacheStats {
    let totalAccesses = 0
    let totalHits = 0
    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount
      totalHits += entry.hitCount
    }

    const totalRequests = this.hits + this.misses
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      totalAccesses,
      hits: this.hits,
      misses: this.misses,
    }
  }

  /**
   * 预加载常用图形到缓存
   */
  preload(type: string, configs: Record<string, any>[], createNode: (config: Record<string, any>) => Node): void {
    for (const config of configs) {
      if (!this.get(type, config)) {
        const node = createNode(config)
        this.set(type, config, node)
      }
    }
  }

  /**
   * 获取缓存键数量（用于调试）
   */
  getKeyCount(): number {
    return this.keyCache.size
  }
}

export const globalShapeCache = new ShapeCache()

export default ShapeCache
