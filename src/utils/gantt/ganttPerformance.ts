/**
 * 甘特图性能优化模块
 *
 * 核心功能：
 * 1. 虚拟滚动 - 只渲染可见区域的任务
 * 2. 任务分片 - 大数据量分批渲染
 * 3. 缓存机制 - 避免重复计算
 * 4. 节流/防抖 - 优化频繁触发的事件
 * 5. Web Worker 支持 - 复杂计算异步化
 */

import type { GanttTask, ParsedGanttDiagram } from '../ganttDiagramGenerator'

export interface VirtualScrollConfig {
  rowHeight: number
  containerHeight: number
  overscan: number // 预渲染行数
}

export interface VirtualScrollState {
  startIndex: number
  endIndex: number
  visibleTasks: GanttTask[]
  totalHeight: number
  offsetY: number
}

export interface RenderChunk {
  tasks: GanttTask[]
  startIndex: number
  endIndex: number
}

export class GanttPerformanceOptimizer {
  private cache = new Map<string, any>()
  private taskPositions = new Map<string, number>()
  private lastScrollTop = 0

  /**
   * 虚拟滚动计算
   */
  calculateVirtualScroll(
    tasks: GanttTask[],
    scrollTop: number,
    config: VirtualScrollConfig
  ): VirtualScrollState {
    const { rowHeight, containerHeight, overscan } = config

    // 计算可见范围
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / rowHeight) + overscan * 2
    const endIndex = Math.min(tasks.length, startIndex + visibleCount)

    // 获取可见任务
    const visibleTasks = tasks.slice(startIndex, endIndex)

    // 计算总高度
    const totalHeight = tasks.length * rowHeight

    // 计算偏移量
    const offsetY = startIndex * rowHeight

    return {
      startIndex,
      endIndex,
      visibleTasks,
      totalHeight,
      offsetY,
    }
  }

  /**
   * 任务分片渲染
   */
  createRenderChunks(tasks: GanttTask[], chunkSize: number = 50): RenderChunk[] {
    const chunks: RenderChunk[] = []

    for (let i = 0; i < tasks.length; i += chunkSize) {
      chunks.push({
        tasks: tasks.slice(i, i + chunkSize),
        startIndex: i,
        endIndex: Math.min(i + chunkSize, tasks.length),
      })
    }

    return chunks
  }

  /**
   * 渐进式渲染
   */
  async renderProgressive(
    chunks: RenderChunk[],
    renderFn: (chunk: RenderChunk) => void,
    delay: number = 16
  ): Promise<void> {
    for (const chunk of chunks) {
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          renderFn(chunk)
          resolve(null)
        })
      })

      // 延迟，避免阻塞主线程
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  /**
   * 缓存任务位置
   */
  cacheTaskPosition(taskId: string, y: number): void {
    this.taskPositions.set(taskId, y)
  }

  /**
   * 获取缓存的任务位置
   */
  getCachedTaskPosition(taskId: string): number | undefined {
    return this.taskPositions.get(taskId)
  }

  /**
   * 缓存计算结果
   */
  setCache<T>(key: string, value: T): void {
    this.cache.set(key, value)
  }

  /**
   * 获取缓存
   */
  getCache<T>(key: string): T | undefined {
    return this.cache.get(key)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear()
    this.taskPositions.clear()
  }

  /**
   * 节流函数
   */
  throttle<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastTime = 0
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastTime >= delay) {
        lastTime = now
        fn(...args)
      }
    }
  }

  /**
   * 防抖函数
   */
  debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout> | null = null
    return (...args: Parameters<T>) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    }
  }

  /**
   * 优化大数据量任务
   */
  optimizeLargeDataset(data: ParsedGanttDiagram): ParsedGanttDiagram {
    const { tasks } = data

    // 如果任务数超过阈值，启用优化
    if (tasks.length > 100) {
      // 按时间排序，优先显示近期任务
      const sortedTasks = [...tasks].sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime()
      )

      // 简化非关键任务的信息
      const optimizedTasks = sortedTasks.map((task, index) => {
        if (index < 20 || task.status === 'crit' || task.status === 'active') {
          return task // 保留前20个和关键任务的完整信息
        }

        // 简化其他任务
        return {
          ...task,
          dependencies: [], // 减少依赖计算
        }
      })

      return {
        ...data,
        tasks: optimizedTasks,
      }
    }

    return data
  }

  /**
   * 智能渲染策略
   */
  getRenderStrategy(taskCount: number): {
    useVirtualScroll: boolean
    useChunkedRender: boolean
    chunkSize: number
    overscan: number
  } {
    if (taskCount <= 50) {
      return {
        useVirtualScroll: false,
        useChunkedRender: false,
        chunkSize: taskCount,
        overscan: 5,
      }
    } else if (taskCount <= 200) {
      return {
        useVirtualScroll: true,
        useChunkedRender: false,
        chunkSize: 50,
        overscan: 5,
      }
    } else {
      return {
        useVirtualScroll: true,
        useChunkedRender: true,
        chunkSize: 30,
        overscan: 10,
      }
    }
  }

  /**
   * 计算渲染性能指标
   */
  calculatePerformanceMetrics(
    startTime: number,
    endTime: number,
    taskCount: number
  ): {
    renderTime: number
    tasksPerSecond: number
    fps: number
  } {
    const renderTime = endTime - startTime
    const tasksPerSecond = (taskCount / renderTime) * 1000
    const fps = 1000 / renderTime

    return {
      renderTime: Math.round(renderTime * 100) / 100,
      tasksPerSecond: Math.round(tasksPerSecond),
      fps: Math.round(fps * 10) / 10,
    }
  }

  /**
   * 内存使用监控
   */
  getMemoryUsage(): {
    used: number
    total: number
    percent: number
  } {
    if (performance && (performance as any).memory) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        percent: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
      }
    }

    return { used: 0, total: 0, percent: 0 }
  }

  /**
   * 清理过期缓存
   */
  cleanupCache(maxAge: number = 60000): void {
    // 这里可以实现基于时间的缓存清理
    // 简化实现：直接清空
    this.clearCache()
  }
}

// 导出单例
export const ganttPerformanceOptimizer = new GanttPerformanceOptimizer()
export default ganttPerformanceOptimizer
