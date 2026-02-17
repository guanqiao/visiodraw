import { useCallback, useRef } from 'react'

export interface InlineEditorOptions {
  isDark: boolean
  onSave: (text: string) => void
  onCancel?: () => void
  initialText?: string
  position?: { x: number; y: number }
  fontSize?: number
  minWidth?: number
}

export interface InlineEditorResult {
  showEditor: (options: Omit<InlineEditorOptions, 'isDark'>) => void
  hideEditor: () => void
}

export const useInlineEditor = (isDark: boolean): InlineEditorResult => {
  const editorRef = useRef<HTMLDivElement | null>(null)

  const hideEditor = useCallback(() => {
    if (editorRef.current) {
      document.body.removeChild(editorRef.current)
      editorRef.current = null
    }
  }, [])

  const showEditor = useCallback((options: Omit<InlineEditorOptions, 'isDark'>) => {
    const {
      onSave,
      onCancel,
      initialText = '',
      position,
      fontSize = 14,
      minWidth = 60,
    } = options

    if (editorRef.current) {
      hideEditor()
    }

    const colors = {
      bg: isDark ? '#2c2c2c' : '#ffffff',
      text: isDark ? '#e0e0e0' : '#333333',
      border: isDark ? '#18a0fb' : '#1890ff',
    }

    const editor = document.createElement('div')
    editor.contentEditable = 'true'
    editor.innerText = initialText
    editor.style.cssText = `
      position: fixed;
      background: ${colors.bg};
      color: ${colors.text};
      border: 2px solid ${colors.border};
      padding: 4px 8px;
      border-radius: 4px;
      outline: none;
      min-width: ${minWidth}px;
      text-align: center;
      font-size: ${fontSize}px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `

    if (position) {
      editor.style.left = `${position.x - minWidth / 2}px`
      editor.style.top = `${position.y - fontSize}px`
    }

    document.body.appendChild(editor)
    editorRef.current = editor
    editor.focus()

    const range = document.createRange()
    range.selectNodeContents(editor)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)

    const save = () => {
      const newText = editor.innerText.trim()
      onSave(newText)
      hideEditor()
    }

    const cancel = () => {
      onCancel?.()
      hideEditor()
    }

    editor.addEventListener('blur', save)
    editor.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') {
        evt.preventDefault()
        editor.blur()
      } else if (evt.key === 'Escape') {
        cancel()
      }
    })
  }, [isDark, hideEditor])

  return { showEditor, hideEditor }
}

export default useInlineEditor
