/**
 * 键盘快捷键 Hook
 */

import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  handler: () => void
  preventDefault?: boolean
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrlKey === e.ctrlKey
        const shiftMatch = !!shortcut.shiftKey === e.shiftKey
        const altMatch = !!shortcut.altKey === e.altKey
        const metaMatch = !!shortcut.metaKey === e.metaKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault()
          }
          shortcut.handler()
        }
      })
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}

// 常用快捷键定义
export const createDefaultShortcuts = (actions: {
  onNew: () => void
  onOpen: () => void
  onSave: () => void
  onCut: () => void
  onCopy: () => void
  onPaste: () => void
  onDelete: () => void
  onUndo: () => void
  onRedo: () => void
  onSelectAll: () => void
  onGroup: () => void
  onUngroup: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomFit: () => void
}): KeyboardShortcut[] => [
  { key: 'n', ctrlKey: true, handler: actions.onNew, preventDefault: true },
  { key: 'o', ctrlKey: true, handler: actions.onOpen, preventDefault: true },
  { key: 's', ctrlKey: true, handler: actions.onSave, preventDefault: true },
  { key: 'x', ctrlKey: true, handler: actions.onCut, preventDefault: true },
  { key: 'c', ctrlKey: true, handler: actions.onCopy, preventDefault: true },
  { key: 'v', ctrlKey: true, handler: actions.onPaste, preventDefault: true },
  { key: 'Delete', handler: actions.onDelete },
  { key: 'z', ctrlKey: true, handler: actions.onUndo, preventDefault: true },
  { key: 'y', ctrlKey: true, handler: actions.onRedo, preventDefault: true },
  { key: 'a', ctrlKey: true, handler: actions.onSelectAll, preventDefault: true },
  { key: 'g', ctrlKey: true, handler: actions.onGroup, preventDefault: true },
  { key: 'g', ctrlKey: true, shiftKey: true, handler: actions.onUngroup, preventDefault: true },
  { key: '=', ctrlKey: true, handler: actions.onZoomIn, preventDefault: true },
  { key: '-', ctrlKey: true, handler: actions.onZoomOut, preventDefault: true },
  { key: '0', ctrlKey: true, handler: actions.onZoomFit, preventDefault: true },
]
