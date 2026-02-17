import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInlineEditor } from '../useInlineEditor'

describe('useInlineEditor', () => {
  it('should return showEditor and hideEditor functions', () => {
    const { result } = renderHook(() => useInlineEditor(false))

    expect(result.current.showEditor).toBeDefined()
    expect(result.current.hideEditor).toBeDefined()
    expect(typeof result.current.showEditor).toBe('function')
    expect(typeof result.current.hideEditor).toBe('function')
  })

  it('should create editor element when showEditor is called', () => {
    document.body.innerHTML = ''
    const { result } = renderHook(() => useInlineEditor(false))
    const onSave = vi.fn()

    act(() => {
      result.current.showEditor({
        onSave,
        initialText: 'test',
        position: { x: 100, y: 100 },
      })
    })

    const editor = document.querySelector('[contenteditable="true"]')
    expect(editor).not.toBeNull()
    expect(editor?.textContent).toBe('test')
    
    document.body.innerHTML = ''
  })
})
