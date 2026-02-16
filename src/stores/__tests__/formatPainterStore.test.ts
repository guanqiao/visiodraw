import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useFormatPainterStore from '../formatPainterStore'

describe('FormatPainterStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    const { result } = renderHook(() => useFormatPainterStore())
    act(() => {
      result.current.clear()
    })
  })

  describe('Initialization', () => {
    it('should have empty styles after clear', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      
      act(() => {
        result.current.clear()
      })
      
      expect(result.current.copiedNodeStyle).toBeNull()
      expect(result.current.copiedEdgeStyle).toBeNull()
      expect(result.current.isPersistentMode).toBe(false)
    })
  })

  describe('copyNodeStyle', () => {
    it('should copy node style', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { fill: '#ff0000', stroke: '#000000', strokeWidth: 2 }

      act(() => {
        result.current.clear()
        result.current.copyNodeStyle(style)
      })

      expect(result.current.copiedNodeStyle).toEqual(style)
    })

    it('should deep clone node style', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { fill: '#ff0000' }

      act(() => {
        result.current.clear()
        result.current.copyNodeStyle(style)
      })

      expect(result.current.copiedNodeStyle).not.toBe(style)
    })

    it('should copy partial node style', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { fill: '#ff0000' }

      act(() => {
        result.current.clear()
        result.current.copyNodeStyle(style)
      })

      expect(result.current.copiedNodeStyle?.fill).toBe('#ff0000')
      expect(result.current.copiedNodeStyle?.stroke).toBeUndefined()
    })
  })

  describe('copyEdgeStyle', () => {
    it('should copy edge style', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { stroke: '#00ff00', strokeWidth: 1, lineStyle: 'dashed' as const }

      act(() => {
        result.current.clear()
        result.current.copyEdgeStyle(style)
      })

      expect(result.current.copiedEdgeStyle).toEqual(style)
    })

    it('should deep clone edge style', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { stroke: '#00ff00' }

      act(() => {
        result.current.clear()
        result.current.copyEdgeStyle(style)
      })

      expect(result.current.copiedEdgeStyle).not.toBe(style)
    })
  })

  describe('pasteNodeStyle', () => {
    it('should return null when no style copied', () => {
      const { result } = renderHook(() => useFormatPainterStore())

      act(() => {
        result.current.clear()
      })

      const pasted = result.current.pasteNodeStyle()
      expect(pasted).toBeNull()
    })

    it('should return copied node style', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { fill: '#ff0000', stroke: '#000000' }

      act(() => {
        result.current.clear()
        result.current.copyNodeStyle(style)
      })

      const pasted = result.current.pasteNodeStyle()
      expect(pasted).toEqual(style)
    })

    it('should clear style after paste in non-persistent mode', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { fill: '#ff0000' }

      act(() => {
        result.current.clear()
        result.current.copyNodeStyle(style)
        result.current.pasteNodeStyle()
      })

      expect(result.current.copiedNodeStyle).toBeNull()
    })

    it('should keep style after paste in persistent mode', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { fill: '#ff0000' }

      act(() => {
        result.current.clear()
        result.current.setPersistentMode(true)
        result.current.copyNodeStyle(style)
        result.current.pasteNodeStyle()
      })

      expect(result.current.copiedNodeStyle).not.toBeNull()
    })
  })

  describe('pasteEdgeStyle', () => {
    it('should return null when no style copied', () => {
      const { result } = renderHook(() => useFormatPainterStore())

      act(() => {
        result.current.clear()
      })

      const pasted = result.current.pasteEdgeStyle()
      expect(pasted).toBeNull()
    })

    it('should return copied edge style', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { stroke: '#00ff00', lineStyle: 'dashed' as const }

      act(() => {
        result.current.clear()
        result.current.copyEdgeStyle(style)
      })

      const pasted = result.current.pasteEdgeStyle()
      expect(pasted).toEqual(style)
    })

    it('should keep style after paste in persistent mode', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      const style = { stroke: '#00ff00' }

      act(() => {
        result.current.clear()
        result.current.setPersistentMode(true)
        result.current.copyEdgeStyle(style)
        result.current.pasteEdgeStyle()
      })

      expect(result.current.copiedEdgeStyle).not.toBeNull()
    })
  })

  describe('setPersistentMode', () => {
    it('should enable persistent mode', () => {
      const { result } = renderHook(() => useFormatPainterStore())

      act(() => {
        result.current.clear()
        result.current.setPersistentMode(true)
      })

      expect(result.current.isPersistentMode).toBe(true)
    })

    it('should disable persistent mode', () => {
      const { result } = renderHook(() => useFormatPainterStore())

      act(() => {
        result.current.clear()
        result.current.setPersistentMode(true)
        result.current.setPersistentMode(false)
      })

      expect(result.current.isPersistentMode).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all styles and reset persistent mode', () => {
      const { result } = renderHook(() => useFormatPainterStore())

      act(() => {
        result.current.copyNodeStyle({ fill: '#ff0000' })
        result.current.copyEdgeStyle({ stroke: '#00ff00' })
        result.current.setPersistentMode(true)
        result.current.clear()
      })

      expect(result.current.copiedNodeStyle).toBeNull()
      expect(result.current.copiedEdgeStyle).toBeNull()
      expect(result.current.isPersistentMode).toBe(false)
    })
  })

  describe('hasNodeStyle', () => {
    it('should return false when no node style', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      
      act(() => {
        result.current.clear()
      })
      
      expect(result.current.hasNodeStyle()).toBe(false)
    })

    it('should return true when node style exists', () => {
      const { result } = renderHook(() => useFormatPainterStore())

      act(() => {
        result.current.clear()
        result.current.copyNodeStyle({ fill: '#ff0000' })
      })

      expect(result.current.hasNodeStyle()).toBe(true)
    })
  })

  describe('hasEdgeStyle', () => {
    it('should return false when no edge style', () => {
      const { result } = renderHook(() => useFormatPainterStore())
      
      act(() => {
        result.current.clear()
      })
      
      expect(result.current.hasEdgeStyle()).toBe(false)
    })

    it('should return true when edge style exists', () => {
      const { result } = renderHook(() => useFormatPainterStore())

      act(() => {
        result.current.clear()
        result.current.copyEdgeStyle({ stroke: '#00ff00' })
      })

      expect(result.current.hasEdgeStyle()).toBe(true)
    })
  })
})
