import { Node } from '@antv/x6'

interface CacheEntry {
  node: Node
  lastAccessed: number
  accessCount: number
}

export class ShapeCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize: number
  private readonly defaultMaxSize = 100

  constructor(maxSize?: number) {
    this.maxSize = maxSize || this.defaultMaxSize
  }

  /**
   * 生成缓存键
   */
  private generateKey(type: string, config: Record<string, any>): string {
    const relevantProps = {
      type,
      width: config.width,
      height: config.height,
      fill: config.fill,
      stroke: config.stroke,
      strokeWidth: config.strokeWidth,
      rx: config.rx,
      ry: config.ry,
    }
    return JSON.stringify(relevantProps)
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
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    totalAccesses: number
  } {
    let totalAccesses = 0
    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalAccesses > 0 ? this.cache.size / totalAccesses : 0,
      totalAccesses,
    }
  }
}

export const globalShapeCache = new ShapeCache()

export default ShapeCache
