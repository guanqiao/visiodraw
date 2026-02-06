/**
 * 拖拽功能自定义 Hook
 */

import { useState, useCallback, useRef } from 'react'
import type { DragData, DropPosition } from '../types/dragDrop'
import { setDragData as setDragDataToTransfer, parseDragData } from '../types/dragDrop'

interface UseDragDropOptions {
  onDrop?: (position: DropPosition, data: DragData) => void
  onDragStart?: (data: DragData) => void
  onDragEnd?: () => void
}

interface UseDragDropReturn {
  isDragging: boolean
  isOver: boolean
  dragData: DragData | null
  handleDragStart: (data: DragData, e: React.DragEvent) => void
  handleDragEnd: () => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: () => void
  handleDrop: (e: React.DragEvent, canvasRect?: DOMRect) => void
}

export function useDragDrop(options: UseDragDropOptions = {}): UseDragDropReturn {
  const [isDragging, setIsDragging] = useState(false)
  const [isOver, setIsOver] = useState(false)
  const [dragData, setDragData] = useState<DragData | null>(null)
  const dragDataRef = useRef<DragData | null>(null)

  const handleDragStart = useCallback((data: DragData, e: React.DragEvent) => {
    setDragData(data)
    dragDataRef.current = data
    setIsDragging(true)
    
    // 设置拖拽数据
    setDragDataToTransfer(e.dataTransfer, data)
    
    // 设置拖拽效果
    e.dataTransfer.effectAllowed = 'copy'
    
    // 创建自定义拖拽图像
    const dragImage = createDragImage(data)
    if (dragImage) {
      e.dataTransfer.setDragImage(dragImage, dragImage.width / 2, dragImage.height / 2)
    }
    
    options.onDragStart?.(data)
  }, [options])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDragData(null)
    dragDataRef.current = null
    options.onDragEnd?.()
  }, [options])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, canvasRect?: DOMRect) => {
    e.preventDefault()
    setIsOver(false)
    setIsDragging(false)

    const data = parseDragData(e.dataTransfer) || dragDataRef.current
    if (!data) return

    // 计算放置位置
    const x = e.clientX
    const y = e.clientY
    let canvasX = x
    let canvasY = y

    if (canvasRect) {
      canvasX = x - canvasRect.left
      canvasY = y - canvasRect.top
    }

    const position: DropPosition = {
      x,
      y,
      canvasX,
      canvasY,
    }

    options.onDrop?.(position, data)
    
    // 清理
    setDragData(null)
    dragDataRef.current = null
  }, [options])

  return {
    isDragging,
    isOver,
    dragData,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}

/**
 * 创建拖拽预览图像
 */
function createDragImage(data: DragData): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const size = 60
  canvas.width = size
  canvas.height = size

  // 绘制半透明背景
  ctx.fillStyle = 'rgba(24, 144, 255, 0.2)'
  ctx.fillRect(0, 0, size, size)

  // 绘制边框
  ctx.strokeStyle = '#1890ff'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, size, size)

  // 绘制图形名称（如果有）
  if (data.name) {
    ctx.fillStyle = '#1890ff'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(data.name.slice(0, 4), size / 2, size / 2)
  }

  return canvas
}

/**
 * 使用拖拽源的 Hook
 */
export function useDragSource() {
  const handleDragStart = useCallback((data: DragData, e: React.DragEvent) => {
    setDragDataToTransfer(e.dataTransfer, data)
    e.dataTransfer.effectAllowed = 'copy'
  }, [])

  return { handleDragStart }
}

/**
 * 使用放置目标的 Hook
 */
export function useDropTarget(
  onDrop: (position: DropPosition, data: DragData) => void,
  canvasRef?: React.RefObject<HTMLElement>
) {
  const [isOver, setIsOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)

    const data = parseDragData(e.dataTransfer)
    if (!data) return

    const canvasRect = canvasRef?.current?.getBoundingClientRect()
    const position: DropPosition = {
      x: e.clientX,
      y: e.clientY,
      canvasX: canvasRect ? e.clientX - canvasRect.left : e.clientX,
      canvasY: canvasRect ? e.clientY - canvasRect.top : e.clientY,
    }

    onDrop(position, data)
  }, [onDrop, canvasRef])

  return {
    isOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
