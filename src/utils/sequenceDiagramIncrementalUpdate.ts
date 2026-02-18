/**
 * 序列图增量更新管理器
 *
 * 用于优化大规模序列图的性能，支持：
 * 1. 增量更新 - 只更新变化的部分
 * 2. 变更追踪 - 记录变更历史和范围
 * 3. 智能重算 - 只重算受影响的区域
 */

import type { SequenceMessage, SequenceParticipant, SequenceActivation, SequenceFragment } from './mermaidSequenceParser'
import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector } from '../types/connection'

export interface IncrementalUpdate {
  type: 'message' | 'participant' | 'activation' | 'fragment' | 'note'
  action: 'add' | 'remove' | 'update'
  id: string
  data: any
  affectedRange: [number, number] // 受影响的Y坐标范围
  timestamp: number
}

export interface UpdateResult {
  nodesToAdd: ShapeData[]
  nodesToUpdate: ShapeData[]
  nodesToRemove: string[]
  edgesToAdd: Connector[]
  edgesToUpdate: Connector[]
  edgesToRemove: string[]
  needsFullRelayout: boolean
}

export class SequenceIncrementalUpdateManager {
  private updateHistory: IncrementalUpdate[] = []
  private maxHistorySize = 50
  private nodeCache: Map<string, ShapeData> = new Map()
  private edgeCache: Map<string, Connector> = new Map()

  /**
   * 记录更新操作
   */
  recordUpdate(update: Omit<IncrementalUpdate, 'timestamp'>): void {
    const fullUpdate: IncrementalUpdate = {
      ...update,
      timestamp: Date.now(),
    }

    this.updateHistory.push(fullUpdate)

    // 限制历史记录大小
    if (this.updateHistory.length > this.maxHistorySize) {
      this.updateHistory.shift()
    }
  }

  /**
   * 计算增量更新的影响范围
   */
  calculateAffectedRange(updates: IncrementalUpdate[]): [number, number] | null {
    if (updates.length === 0) return null

    let minY = Infinity
    let maxY = -Infinity

    updates.forEach(update => {
      const [start, end] = update.affectedRange
      minY = Math.min(minY, start)
      maxY = Math.max(maxY, end)
    })

    return [minY, maxY]
  }

  /**
   * 判断是否需要完整重布局
   */
  needsFullRelayout(updates: IncrementalUpdate[]): boolean {
    // 以下情况需要完整重布局：
    // 1. 添加/删除参与者（影响整体布局）
    // 2. 大量更新（超过阈值）
    // 3. 涉及布局配置变更

    const participantChanges = updates.filter(
      u => u.type === 'participant' && (u.action === 'add' || u.action === 'remove')
    )

    if (participantChanges.length > 0) return true

    // 如果更新数量超过10个，直接重布局
    if (updates.length > 10) return true

    return false
  }

  /**
   * 缓存节点和边
   */
  cacheElements(nodes: ShapeData[], edges: Connector[]): void {
    nodes.forEach(node => {
      this.nodeCache.set(node.id, { ...node })
    })

    edges.forEach(edge => {
      this.edgeCache.set(edge.id, { ...edge })
    })
  }

  /**
   * 获取缓存的节点
   */
  getCachedNode(id: string): ShapeData | undefined {
    return this.nodeCache.get(id)
  }

  /**
   * 获取缓存的边
   */
  getCachedEdge(id: string): Connector | undefined {
    return this.edgeCache.get(id)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.nodeCache.clear()
    this.edgeCache.clear()
  }

  /**
   * 获取更新历史
   */
  getUpdateHistory(): IncrementalUpdate[] {
    return [...this.updateHistory]
  }

  /**
   * 撤销最近的一次更新
   */
  undo(): IncrementalUpdate | null {
    const lastUpdate = this.updateHistory.pop()
    return lastUpdate || null
  }

  /**
   * 计算消息添加的影响范围
   */
  calculateMessageAddImpact(
    message: SequenceMessage,
    messageOrder: number,
    messageSpacing: number
  ): [number, number] {
    const y = messageOrder * messageSpacing
    // 影响当前消息位置及之后的所有消息
    return [y, Infinity]
  }

  /**
   * 计算消息删除的影响范围
   */
  calculateMessageRemoveImpact(
    message: SequenceMessage,
    messageOrder: number,
    messageSpacing: number
  ): [number, number] {
    const y = messageOrder * messageSpacing
    // 影响被删除消息位置及之后的所有消息
    return [y, Infinity]
  }

  /**
   * 计算消息更新的影响范围
   */
  calculateMessageUpdateImpact(
    oldMessage: SequenceMessage,
    newMessage: SequenceMessage,
    messageOrder: number
  ): [number, number] {
    // 如果只更新文本，只影响当前消息
    if (oldMessage.from === newMessage.from &&
        oldMessage.to === newMessage.to &&
        oldMessage.type === newMessage.type) {
      const y = messageOrder * 45 // 使用默认消息间距
      return [y, y + 45]
    }

    // 如果更新类型或参与者，可能影响更大范围
    return [0, Infinity]
  }

  /**
   * 智能合并连续的更新
   */
  mergeUpdates(updates: IncrementalUpdate[]): IncrementalUpdate[] {
    const merged: IncrementalUpdate[] = []
    const messageUpdates = new Map<string, IncrementalUpdate[]>()

    // 按ID分组
    updates.forEach(update => {
      const existing = messageUpdates.get(update.id) || []
      existing.push(update)
      messageUpdates.set(update.id, existing)
    })

    // 合并同一ID的更新
    messageUpdates.forEach((idUpdates, id) => {
      if (idUpdates.length === 1) {
        merged.push(idUpdates[0])
      } else {
        // 取最后一次更新
        const lastUpdate = idUpdates[idUpdates.length - 1]

        // 如果第一次是add，最后一次是remove，则完全删除这条记录
        const firstUpdate = idUpdates[0]
        if (firstUpdate.action === 'add' && lastUpdate.action === 'remove') {
          // 不添加到合并结果中
          return
        }

        merged.push(lastUpdate)
      }
    })

    return merged
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions(): string[] {
    const suggestions: string[] = []

    // 分析更新历史
    const recentUpdates = this.updateHistory.slice(-20)

    // 检查频繁的完整重布局
    const fullRelayoutCount = recentUpdates.filter(u =>
      u.type === 'participant' && (u.action === 'add' || u.action === 'remove')
    ).length

    if (fullRelayoutCount > 5) {
      suggestions.push('建议：频繁添加/删除参与者，考虑使用批量操作')
    }

    // 检查消息更新模式
    const messageUpdates = recentUpdates.filter(u => u.type === 'message')
    if (messageUpdates.length > 15) {
      suggestions.push('建议：消息更新频繁，考虑启用防抖机制')
    }

    return suggestions
  }
}

export default SequenceIncrementalUpdateManager
