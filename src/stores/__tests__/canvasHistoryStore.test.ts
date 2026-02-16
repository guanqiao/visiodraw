import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useCanvasHistoryStore from '../canvasHistoryStore'

describe('CanvasHistoryStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    const { result } = renderHook(() => useCanvasHistoryStore())
    act(() => {
      result.current.clearHistory()
    })
  })

  describe('Initialization', () => {
    it('should have maxHistoryCount of 20', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      expect(result.current.maxHistoryCount).toBe(20)
    })
  })

  describe('addToHistory', () => {
    it('should add item to history', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('New Canvas', '{"test": true}')
      })

      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0].name).toBe('New Canvas')
      expect(result.current.history[0].data).toBe('{"test": true}')
    })

    it('should add item with thumbnail', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('Canvas', '{}', 'base64thumbnail')
      })

      expect(result.current.history[0].thumbnail).toBe('base64thumbnail')
    })

    it('should add item to beginning of history', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('First', '{}')
        result.current.addToHistory('Second', '{}')
      })

      expect(result.current.history[0].name).toBe('Second')
      expect(result.current.history[1].name).toBe('First')
    })

    it('should limit history to maxHistoryCount', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        for (let i = 0; i < 25; i++) {
          result.current.addToHistory(`Canvas ${i}`, '{}')
        }
      })

      expect(result.current.history).toHaveLength(20)
    })

    it('should generate default name if not provided', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('', '{}')
      })

      expect(result.current.history[0].name).toContain('画布')
    })

    it('should save to localStorage', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('Test', '{}')
      })

      expect(localStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('deleteFromHistory', () => {
    it('should delete item from history', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('Test', '{}')
      })

      const itemId = result.current.history[0]?.id
      expect(itemId).toBeDefined()

      act(() => {
        result.current.deleteFromHistory(itemId!)
      })

      expect(result.current.history).toHaveLength(0)
    })

    it('should not affect other items', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('First', '{}')
        result.current.addToHistory('Second', '{}')
      })

      const firstId = result.current.history[1]?.id
      expect(firstId).toBeDefined()

      act(() => {
        result.current.deleteFromHistory(firstId!)
      })

      expect(result.current.history).toHaveLength(1)
      expect(result.current.history[0].name).toBe('Second')
    })
  })

  describe('loadHistory', () => {
    it('should return history item by id', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('Test', '{"data": "value"}')
      })

      const itemId = result.current.history[0]?.id
      expect(itemId).toBeDefined()

      const item = result.current.loadHistory(itemId!)
      expect(item).toBeDefined()
      expect(item?.name).toBe('Test')
      expect(item?.data).toBe('{"data": "value"}')
    })

    it('should return null for non-existent id', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      const item = result.current.loadHistory('nonexistent')
      expect(item).toBeNull()
    })
  })

  describe('getHistoryList', () => {
    it('should return all history items', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('First', '{}')
        result.current.addToHistory('Second', '{}')
      })

      const list = result.current.getHistoryList()
      expect(list).toHaveLength(2)
    })
  })

  describe('clearHistory', () => {
    it('should clear all history', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('Test', '{}')
        result.current.clearHistory()
      })

      expect(result.current.history).toHaveLength(0)
    })

    it('should remove from localStorage', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('Test', '{}')
        result.current.clearHistory()
      })

      expect(localStorage.removeItem).toHaveBeenCalledWith('visiodraw-canvas-history')
    })
  })

  describe('updateHistoryName', () => {
    it('should update history item name', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('Old Name', '{}')
      })

      const itemId = result.current.history[0]?.id
      expect(itemId).toBeDefined()

      act(() => {
        result.current.updateHistoryName(itemId!, 'New Name')
      })

      expect(result.current.history[0].name).toBe('New Name')
    })

    it('should not affect other items', () => {
      const { result } = renderHook(() => useCanvasHistoryStore())
      
      act(() => {
        result.current.clearHistory()
        result.current.addToHistory('First', '{}')
        result.current.addToHistory('Second', '{}')
      })

      const firstId = result.current.history[1]?.id
      expect(firstId).toBeDefined()

      act(() => {
        result.current.updateHistoryName(firstId!, 'Updated First')
      })

      expect(result.current.history[1].name).toBe('Updated First')
      expect(result.current.history[0].name).toBe('Second')
    })
  })
})
