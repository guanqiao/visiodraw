/**
 * 性能优化工具
 */

import { Shape } from '@stores/canvasStore'

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number[]> = new Map()

  /**
   * 开始计时
   */
  start(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * 结束计时
   */
  end(name: string): number {
    const startTime = this.marks.get(name)
    if (!startTime) return 0

    const duration = performance.now() - startTime
    
    if (!this.measures.has(name)) {
      this.measures.set(name, [])
    }
    this.measures.get(name)!.push(duration)

    // 只保留最近100次测量
    const measures = this.measures.get(name)!
    if (measures.length > 100) {
      measures.shift()
    }

    return duration
  }

  /**
   * 获取平均耗时
   */
  getAverage(name: string): number {
    const measures = this.measures.get(name)
    if (!measures || measures.length === 0) return 0
    
    const sum = measures.reduce((a, b) => a + b, 0)
    return sum / measures.length
  }

  /**
   * 获取所有性能数据
   */
  getAllStats(): Record<string, { avg: number; count: number; last: number }> {
    const stats: Record<string, { avg: number; count: number; last: number }> = {}
    
    this.measures.forEach((measures, name) => {
      if (measures.length > 0) {
        const sum = measures.reduce((a, b) => a + b, 0)
        stats[name] = {
          avg: sum / measures.length,
          count: measures.length,
          last: measures[measures.length - 1],
        }
      }
    })
    
    return stats
  }

  /**
   * 清除所有数据
   */
  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }
}

// 全局性能监控器实例
export const performanceMonitor = new PerformanceMonitor()

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 批量处理函数
 * 将大量操作分批执行，避免阻塞主线程
 */
export async function batchProcess<T>(
  items: T[],
  processor: (item: T) => void,
  batchSize: number = 100,
  onProgress?: (processed: number, total: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0
    
    function processBatch(): void {
      const end = Math.min(index + batchSize, items.length)
      
      for (let i = index; i < end; i++) {
        processor(items[i])
      }
      
      index = end
      onProgress?.(index, items.length)
      
      if (index < items.length) {
        // 使用 requestIdleCallback 或 setTimeout 让出主线程
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(processBatch)
        } else {
          setTimeout(processBatch, 0)
        }
      } else {
        resolve()
      }
    }
    
    processBatch()
  })
}

/**
 * 虚拟渲染计算
 * 计算可视区域内的图形索引
 */
export function getVisibleShapeIndices(
  shapes: Shape[],
  viewport: { x: number; y: number; width: number; height: number },
  zoom: number
): number[] {
  const visibleIndices: number[] = []
  
  const scaledViewport = {
    x: viewport.x / zoom,
    y: viewport.y / zoom,
    width: viewport.width / zoom,
    height: viewport.height / zoom,
  }
  
  shapes.forEach((shape, index) => {
    // 简单的AABB碰撞检测
    const shapeLeft = shape.x
    const shapeRight = shape.x + shape.width
    const shapeTop = shape.y
    const shapeBottom = shape.y + shape.height
    
    const viewportLeft = scaledViewport.x
    const viewportRight = scaledViewport.x + scaledViewport.width
    const viewportTop = scaledViewport.y
    const viewportBottom = scaledViewport.y + scaledViewport.height
    
    // 检查是否在可视区域内（加上一些缓冲）
    const buffer = 100
    if (
      shapeRight >= viewportLeft - buffer &&
      shapeLeft <= viewportRight + buffer &&
      shapeBottom >= viewportTop - buffer &&
      shapeTop <= viewportBottom + buffer
    ) {
      visibleIndices.push(index)
    }
  })
  
  return visibleIndices
}

/**
 * 内存使用监控
 */
export function getMemoryUsage(): { used: number; total: number; limit: number } | null {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    }
  }
  return null
}

/**
 * 优化历史记录
 * 限制历史记录大小，使用结构化克隆避免引用问题
 */
export function optimizeHistory<T>(
  history: T[][],
  maxSize: number = 50
): T[][] {
  if (history.length <= maxSize) {
    return history
  }
  
  // 保留最近的历史记录
  return history.slice(-maxSize)
}

/**
 * 深克隆（用于历史记录）
 * 比 JSON.parse(JSON.stringify()) 更快
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T
  }
  
  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  
  return cloned
}

/**
 * 图形数据压缩
 * 移除不必要的字段，减少内存占用
 */
export function compressShapeData(shape: Shape): Partial<Shape> {
  const compressed: Partial<Shape> = {
    id: shape.id,
    type: shape.type,
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    fill: shape.fill,
    stroke: shape.stroke,
    strokeWidth: shape.strokeWidth,
  }
  
  // 只包含有值的可选字段
  if (shape.text) compressed.text = shape.text
  if (shape.angle) compressed.angle = shape.angle
  if (shape.scaleX !== undefined && shape.scaleX !== 1) compressed.scaleX = shape.scaleX
  if (shape.scaleY !== undefined && shape.scaleY !== 1) compressed.scaleY = shape.scaleY
  
  return compressed
}

/**
 * 检查是否需要性能警告
 */
export function checkPerformanceWarning(
  shapeCount: number,
  memoryUsage: number
): { warning: boolean; message: string } {
  if (shapeCount > 5000) {
    return {
      warning: true,
      message: `图形数量较多(${shapeCount})，可能会影响性能`,
    }
  }
  
  if (memoryUsage > 500 * 1024 * 1024) { // 500MB
    return {
      warning: true,
      message: '内存使用较高，建议保存并重启应用',
    }
  }
  
  return { warning: false, message: '' }
}
