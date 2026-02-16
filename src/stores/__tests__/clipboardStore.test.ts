import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useClipboardStore from '../clipboardStore'

describe('ClipboardStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    const { result } = renderHook(() => useClipboardStore())
    act(() => {
      result.current.clear()
    })
  })

  describe('Initialization', () => {
    it('should have correct initial state after clear', () => {
      const { result } = renderHook(() => useClipboardStore())
      
      act(() => {
        result.current.clear()
      })
      
      expect(result.current.clipboard).toBeNull()
      expect(result.current.pasteCount).toBe(0)
    })
  })

  describe('copy', () => {
    it('should copy shapes to clipboard', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [
        { id: '1', x: 10, y: 20, width: 100, height: 50 },
        { id: '2', x: 30, y: 40, width: 80, height: 60 },
      ]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
      })

      expect(result.current.clipboard).not.toBeNull()
      expect(result.current.clipboard?.shapes).toHaveLength(2)
      expect(result.current.pasteCount).toBe(0)
    })

    it('should calculate offset from minimum coordinates', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [
        { id: '1', x: 50, y: 100 },
        { id: '2', x: 10, y: 30 },
        { id: '3', x: 80, y: 20 },
      ]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
      })

      expect(result.current.clipboard?.offsetX).toBe(10)
      expect(result.current.clipboard?.offsetY).toBe(20)
    })

    it('should deep clone shapes', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [{ id: '1', x: 10, y: 20, data: { nested: true } }]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
      })

      expect(result.current.clipboard?.shapes[0]).not.toBe(shapes[0])
      expect(result.current.clipboard?.shapes[0].data).not.toBe(shapes[0].data)
    })
  })

  describe('cut', () => {
    it('should copy shapes and call delete callback', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [
        { id: '1', x: 10, y: 20 },
        { id: '2', x: 30, y: 40 },
      ]
      const deleteCallback = vi.fn()

      act(() => {
        result.current.clear()
        result.current.cut(shapes, deleteCallback)
      })

      expect(result.current.clipboard).not.toBeNull()
      expect(deleteCallback).toHaveBeenCalledWith(['1', '2'])
    })
  })

  describe('paste', () => {
    it('should return null when clipboard is empty', () => {
      const { result } = renderHook(() => useClipboardStore())

      act(() => {
        result.current.clear()
      })

      const pasted = result.current.paste()
      expect(pasted).toBeNull()
    })

    it('should paste shapes with offset', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [{ id: '1', x: 10, y: 20, width: 100, height: 50 }]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
      })

      const pasted = result.current.paste()
      expect(pasted).not.toBeNull()
      expect(pasted?.shapes[0].x).toBe(30)
      expect(pasted?.shapes[0].y).toBe(40)
    })

    it('should increment paste count on each paste', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [{ id: '1', x: 10, y: 20 }]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
      })

      act(() => {
        result.current.paste()
      })
      expect(result.current.pasteCount).toBe(1)

      act(() => {
        result.current.paste()
      })
      expect(result.current.pasteCount).toBe(2)
    })

    it('should increase offset on each paste', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [{ id: '1', x: 10, y: 20 }]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
      })

      const firstPaste = result.current.paste()
      const secondPaste = result.current.paste()

      expect(firstPaste?.shapes[0].x).toBe(30)
      expect(secondPaste?.shapes[0].x).toBe(50)
    })

    it('should return deep cloned shapes', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [{ id: '1', x: 10, y: 20 }]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
      })

      const pasted = result.current.paste()
      expect(pasted?.shapes[0]).not.toBe(result.current.clipboard?.shapes[0])
    })
  })

  describe('clear', () => {
    it('should clear clipboard', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [{ id: '1', x: 10, y: 20 }]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
        result.current.clear()
      })

      expect(result.current.clipboard).toBeNull()
      expect(result.current.pasteCount).toBe(0)
    })
  })

  describe('resetPasteCount', () => {
    it('should reset paste count', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [{ id: '1', x: 10, y: 20 }]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
        result.current.paste()
        result.current.paste()
        result.current.resetPasteCount()
      })

      expect(result.current.pasteCount).toBe(0)
    })
  })

  describe('hasItems', () => {
    it('should return false when clipboard is empty', () => {
      const { result } = renderHook(() => useClipboardStore())
      
      act(() => {
        result.current.clear()
      })
      
      expect(result.current.hasItems()).toBe(false)
    })

    it('should return true when clipboard has items', () => {
      const { result } = renderHook(() => useClipboardStore())
      const shapes = [{ id: '1', x: 10, y: 20 }]

      act(() => {
        result.current.clear()
        result.current.copy(shapes)
      })

      expect(result.current.hasItems()).toBe(true)
    })
  })
})
