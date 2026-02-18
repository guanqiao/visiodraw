import { describe, it, expect, beforeEach } from 'vitest'
import { SequenceIncrementalUpdateManager } from '../sequenceDiagramIncrementalUpdate'
import type { SequenceMessage } from '../mermaidSequenceParser'

describe('SequenceIncrementalUpdateManager', () => {
  let manager: SequenceIncrementalUpdateManager

  beforeEach(() => {
    manager = new SequenceIncrementalUpdateManager()
  })

  describe('recordUpdate', () => {
    it('should record an update', () => {
      manager.recordUpdate({
        type: 'message',
        action: 'add',
        id: 'msg-1',
        data: { text: 'test' },
        affectedRange: [0, 100],
      })

      const history = manager.getUpdateHistory()
      expect(history).toHaveLength(1)
      expect(history[0].type).toBe('message')
      expect(history[0].action).toBe('add')
    })

    it('should limit history size', () => {
      // 添加超过最大历史记录数的更新
      for (let i = 0; i < 60; i++) {
        manager.recordUpdate({
          type: 'message',
          action: 'add',
          id: `msg-${i}`,
          data: {},
          affectedRange: [0, 100],
        })
      }

      const history = manager.getUpdateHistory()
      expect(history.length).toBeLessThanOrEqual(50)
    })
  })

  describe('calculateAffectedRange', () => {
    it('should calculate union of affected ranges', () => {
      const updates = [
        { type: 'message', action: 'add', id: '1', data: {}, affectedRange: [0, 100], timestamp: 1 },
        { type: 'message', action: 'add', id: '2', data: {}, affectedRange: [50, 150], timestamp: 2 },
        { type: 'message', action: 'add', id: '3', data: {}, affectedRange: [200, 300], timestamp: 3 },
      ]

      const range = manager.calculateAffectedRange(updates as any)
      expect(range).toEqual([0, 300])
    })

    it('should return null for empty updates', () => {
      const range = manager.calculateAffectedRange([])
      expect(range).toBeNull()
    })
  })

  describe('needsFullRelayout', () => {
    it('should return true for participant add/remove', () => {
      const updates = [
        { type: 'participant', action: 'add', id: 'p1', data: {}, affectedRange: [0, 100], timestamp: 1 },
      ]

      expect(manager.needsFullRelayout(updates as any)).toBe(true)
    })

    it('should return true for many updates', () => {
      const updates = Array.from({ length: 15 }, (_, i) => ({
        type: 'message',
        action: 'add',
        id: `msg-${i}`,
        data: {},
        affectedRange: [0, 100],
        timestamp: i,
      }))

      expect(manager.needsFullRelayout(updates as any)).toBe(true)
    })

    it('should return false for message-only updates', () => {
      const updates = [
        { type: 'message', action: 'add', id: '1', data: {}, affectedRange: [0, 100], timestamp: 1 },
        { type: 'message', action: 'update', id: '2', data: {}, affectedRange: [100, 200], timestamp: 2 },
      ]

      expect(manager.needsFullRelayout(updates as any)).toBe(false)
    })
  })

  describe('mergeUpdates', () => {
    it('should merge updates with same id', () => {
      const updates = [
        { type: 'message', action: 'add', id: '1', data: { text: 'a' }, affectedRange: [0, 100], timestamp: 1 },
        { type: 'message', action: 'update', id: '1', data: { text: 'b' }, affectedRange: [0, 100], timestamp: 2 },
      ]

      const merged = manager.mergeUpdates(updates as any)
      expect(merged).toHaveLength(1)
      expect(merged[0].action).toBe('update')
      expect(merged[0].data.text).toBe('b')
    })

    it('should remove add+remove pairs', () => {
      const updates = [
        { type: 'message', action: 'add', id: '1', data: {}, affectedRange: [0, 100], timestamp: 1 },
        { type: 'message', action: 'remove', id: '1', data: {}, affectedRange: [0, 100], timestamp: 2 },
      ]

      const merged = manager.mergeUpdates(updates as any)
      expect(merged).toHaveLength(0)
    })

    it('should keep different ids separate', () => {
      const updates = [
        { type: 'message', action: 'add', id: '1', data: {}, affectedRange: [0, 100], timestamp: 1 },
        { type: 'message', action: 'add', id: '2', data: {}, affectedRange: [0, 100], timestamp: 2 },
      ]

      const merged = manager.mergeUpdates(updates as any)
      expect(merged).toHaveLength(2)
    })
  })

  describe('undo', () => {
    it('should undo last update', () => {
      manager.recordUpdate({
        type: 'message',
        action: 'add',
        id: 'msg-1',
        data: {},
        affectedRange: [0, 100],
      })

      const undone = manager.undo()
      expect(undone).not.toBeNull()
      expect(undone!.id).toBe('msg-1')
      expect(manager.getUpdateHistory()).toHaveLength(0)
    })

    it('should return null when no updates', () => {
      const undone = manager.undo()
      expect(undone).toBeNull()
    })
  })

  describe('calculateMessageAddImpact', () => {
    it('should calculate impact range for new message', () => {
      const message: SequenceMessage = {
        id: 'msg-1',
        from: 'A',
        to: 'B',
        text: 'test',
        type: 'sync',
        order: 2,
      }

      const range = manager.calculateMessageAddImpact(message, 2, 45)
      expect(range[0]).toBe(90) // 2 * 45
      expect(range[1]).toBe(Infinity)
    })
  })

  describe('generateOptimizationSuggestions', () => {
    it('should suggest batch operation for frequent participant changes', () => {
      for (let i = 0; i < 6; i++) {
        manager.recordUpdate({
          type: 'participant',
          action: 'add',
          id: `p-${i}`,
          data: {},
          affectedRange: [0, 100],
        })
      }

      const suggestions = manager.generateOptimizationSuggestions()
      expect(suggestions.some(s => s.includes('批量操作'))).toBe(true)
    })

    it('should suggest debounce for frequent message updates', () => {
      for (let i = 0; i < 20; i++) {
        manager.recordUpdate({
          type: 'message',
          action: 'update',
          id: `msg-${i}`,
          data: {},
          affectedRange: [0, 100],
        })
      }

      const suggestions = manager.generateOptimizationSuggestions()
      expect(suggestions.some(s => s.includes('防抖'))).toBe(true)
    })
  })
})
