import React, { useState, useCallback, useEffect, useRef } from 'react'

export interface ResizableSiderProps {
  children: React.ReactNode
  width: number
  minWidth: number
  maxWidth: number
  side: 'left' | 'right'
  onWidthChange: (width: number) => void
  style?: React.CSSProperties
}

export const ResizableSider: React.FC<ResizableSiderProps> = ({
  children,
  width,
  minWidth,
  maxWidth,
  side,
  onWidthChange,
  style,
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(width)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
  }, [width])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const delta = side === 'left'
        ? e.clientX - startXRef.current
        : startXRef.current - e.clientX

      let newWidth = startWidthRef.current + delta
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      onWidthChange(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, minWidth, maxWidth, onWidthChange, side])

  return (
    <div style={{ position: 'relative', display: 'flex', height: '100%', ...style }}>
      <div style={{ width, overflow: 'auto', flexShrink: 0 }}>
        {children}
      </div>
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          [side]: -4,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: 'col-resize',
          zIndex: 10,
          background: isResizing ? 'var(--accent-color)' : 'transparent',
          transition: 'background 0.2s',
        }}
        className="resize-handle"
      />
    </div>
  )
}

export default ResizableSider
