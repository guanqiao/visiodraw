/**
 * 序列图对象池
 *
 * 用于优化内存使用，减少GC压力：
 * 1. 复用ShapeData对象
 * 2. 复用Connector对象
 * 3. 批量创建和回收
 */

import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector } from '../types/connection'

interface PooledObject<T> {
  object: T
  inUse: boolean
  lastUsed: number
}

export class SequenceObjectPool {
  private nodePool: Map<string, PooledObject<ShapeData>[]> = new Map()
  private edgePool: Map<string, PooledObject<Connector>[]> = new Map()
  private maxPoolSize = 100 // 每种类型最大池大小
  private maxIdleTime = 60000 // 最大空闲时间（毫秒）

  /**
   * 获取节点对象
   */
  acquireNode(type: string, count: number = 1): ShapeData[] {
    const pool = this.nodePool.get(type) || []
    const result: ShapeData[] = []

    // 首先尝试从池中获取空闲对象
    for (const pooled of pool) {
      if (!pooled.inUse && result.length < count) {
        pooled.inUse = true
        pooled.lastUsed = Date.now()
        result.push(this.resetNode(pooled.object))
      }
    }

    // 如果池中没有足够的对象，创建新的
    while (result.length < count) {
      const newNode = this.createNode(type)
      result.push(newNode)

      // 如果池未满，添加到池中
      if (pool.length < this.maxPoolSize) {
        pool.push({
          object: newNode,
          inUse: true,
          lastUsed: Date.now(),
        })
      }
    }

    this.nodePool.set(type, pool)
    return result
  }

  /**
   * 获取边对象
   */
  acquireEdge(type: string, count: number = 1): Connector[] {
    const pool = this.edgePool.get(type) || []
    const result: Connector[] = []

    for (const pooled of pool) {
      if (!pooled.inUse && result.length < count) {
        pooled.inUse = true
        pooled.lastUsed = Date.now()
        result.push(this.resetEdge(pooled.object))
      }
    }

    while (result.length < count) {
      const newEdge = this.createEdge(type)
      result.push(newEdge)

      if (pool.length < this.maxPoolSize) {
        pool.push({
          object: newEdge,
          inUse: true,
          lastUsed: Date.now(),
        })
      }
    }

    this.edgePool.set(type, pool)
    return result
  }

  /**
   * 释放节点对象回池
   */
  releaseNode(type: string, nodes: ShapeData[]): void {
    const pool = this.nodePool.get(type) || []

    nodes.forEach(node => {
      const pooled = pool.find(p => p.object.id === node.id)
      if (pooled) {
        pooled.inUse = false
        pooled.lastUsed = Date.now()
      }
    })
  }

  /**
   * 释放边对象回池
   */
  releaseEdge(type: string, edges: Connector[]): void {
    const pool = this.edgePool.get(type) || []

    edges.forEach(edge => {
      const pooled = pool.find(p => p.object.id === edge.id)
      if (pooled) {
        pooled.inUse = false
        pooled.lastUsed = Date.now()
      }
    })
  }

  /**
   * 创建新的节点对象
   */
  private createNode(type: string): ShapeData {
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      fill: 'transparent',
      stroke: 'transparent',
      strokeWidth: 0,
      text: '',
      zIndex: 0,
    }
  }

  /**
   * 创建新的边对象
   */
  private createEdge(type: string): Connector {
    return {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceShapeId: '',
      sourcePointId: 'default',
      targetShapeId: '',
      targetPointId: 'default',
      style: 'straight',
      lineStyle: 'solid',
      startStyle: 'none',
      endStyle: 'none',
      stroke: '#333333',
      strokeWidth: 1,
    }
  }

  /**
   * 重置节点对象
   */
  private resetNode(node: ShapeData): ShapeData {
    node.x = 0
    node.y = 0
    node.width = 0
    node.height = 0
    node.fill = 'transparent'
    node.stroke = 'transparent'
    node.strokeWidth = 0
    node.text = ''
    node.zIndex = 0
    // 清除可选属性
    delete node.rx
    delete node.ry
    delete node.fontSize
    delete node.color
    return node
  }

  /**
   * 重置边对象
   */
  private resetEdge(edge: Connector): Connector {
    edge.sourceShapeId = ''
    edge.sourcePointId = 'default'
    edge.targetShapeId = ''
    edge.targetPointId = 'default'
    edge.style = 'straight'
    edge.lineStyle = 'solid'
    edge.startStyle = 'none'
    edge.endStyle = 'none'
    edge.stroke = '#333333'
    edge.strokeWidth = 1
    delete edge.labels
    delete edge.pathPoints
    return edge
  }

  /**
   * 清理过期的对象
   */
  cleanup(): void {
    const now = Date.now()

    // 清理节点池
    this.nodePool.forEach((pool, type) => {
      const active = pool.filter(p => {
        // 保留正在使用的对象
        if (p.inUse) return true
        // 删除空闲时间过长的对象
        return now - p.lastUsed < this.maxIdleTime
      })
      this.nodePool.set(type, active)
    })

    // 清理边池
    this.edgePool.forEach((pool, type) => {
      const active = pool.filter(p => {
        if (p.inUse) return true
        return now - p.lastUsed < this.maxIdleTime
      })
      this.edgePool.set(type, active)
    })
  }

  /**
   * 获取池统计信息
   */
  getStats(): {
    nodeTypes: number
    totalNodes: number
    usedNodes: number
    edgeTypes: number
    totalEdges: number
    usedEdges: number
  } {
    let totalNodes = 0
    let usedNodes = 0
    this.nodePool.forEach(pool => {
      totalNodes += pool.length
      usedNodes += pool.filter(p => p.inUse).length
    })

    let totalEdges = 0
    let usedEdges = 0
    this.edgePool.forEach(pool => {
      totalEdges += pool.length
      usedEdges += pool.filter(p => p.inUse).length
    })

    return {
      nodeTypes: this.nodePool.size,
      totalNodes,
      usedNodes,
      edgeTypes: this.edgePool.size,
      totalEdges,
      usedEdges,
    }
  }

  /**
   * 清空所有池
   */
  clear(): void {
    this.nodePool.clear()
    this.edgePool.clear()
  }
}

export default SequenceObjectPool
