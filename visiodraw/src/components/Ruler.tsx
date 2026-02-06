import React, { useRef, useEffect, useCallback } from 'react'
import useRulerStore from '../stores/rulerStore'
import './Ruler.css'

interface RulerProps {
  orientation: 'horizontal' | 'vertical'
  canvasWidth: number
  canvasHeight: number
  zoom: number
  scrollLeft?: number
  scrollTop?: number
}

const Ruler: React.FC<RulerProps> = ({
  orientation,
  canvasWidth,
  canvasHeight,
  zoom,
  scrollLeft = 0,
  scrollTop = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { showRulers, rulerInterval, addGuideLine } = useRulerStore()

  const isHorizontal = orientation === 'horizontal'
  const rulerSize = 20 // 标尺尺寸

  // 绘制标尺
  const drawRuler = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !showRulers) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const length = isHorizontal ? canvasWidth : canvasHeight

    // 设置canvas尺寸
    if (isHorizontal) {
      canvas.width = length * dpr
      canvas.height = rulerSize * dpr
      canvas.style.width = `${length}px`
      canvas.style.height = `${rulerSize}px`
    } else {
      canvas.width = rulerSize * dpr
      canvas.height = length * dpr
      canvas.style.width = `${rulerSize}px`
      canvas.style.height = `${length}px`
    }

    ctx.scale(dpr, dpr)

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 绘制背景
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, isHorizontal ? length : rulerSize, isHorizontal ? rulerSize : length)

    // 绘制边框
    ctx.strokeStyle = '#d9d9d9'
    ctx.lineWidth = 1
    ctx.beginPath()
    if (isHorizontal) {
      ctx.moveTo(0, rulerSize - 0.5)
      ctx.lineTo(length, rulerSize - 0.5)
    } else {
      ctx.moveTo(rulerSize - 0.5, 0)
      ctx.lineTo(rulerSize - 0.5, length)
    }
    ctx.stroke()

    // 绘制刻度
    ctx.fillStyle = '#666'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const interval = rulerInterval * zoom
    const offset = isHorizontal ? scrollLeft : scrollTop
    const startTick = Math.floor(offset / interval) * interval
    const endTick = startTick + (isHorizontal ? canvasWidth : canvasHeight) + interval

    for (let tick = startTick; tick <= endTick; tick += interval / 5) {
      const pos = tick - offset
      if (pos < 0) continue

      const isMajorTick = Math.round(tick / interval) % 5 === 0
      const isLabelTick = Math.round(tick / interval) % 10 === 0
      const tickLength = isMajorTick ? 8 : 5

      ctx.beginPath()
      ctx.strokeStyle = isMajorTick ? '#333' : '#999'
      ctx.lineWidth = 1

      if (isHorizontal) {
        ctx.moveTo(pos, rulerSize)
        ctx.lineTo(pos, rulerSize - tickLength)
      } else {
        ctx.moveTo(rulerSize, pos)
        ctx.lineTo(rulerSize - tickLength, pos)
      }
      ctx.stroke()

      // 绘制标签
      if (isLabelTick && tick > 0) {
        const label = Math.round(tick / zoom).toString()
        if (isHorizontal) {
          ctx.fillText(label, pos, rulerSize / 2)
        } else {
          ctx.save()
          ctx.translate(rulerSize / 2, pos)
          ctx.rotate(-Math.PI / 2)
          ctx.fillText(label, 0, 0)
          ctx.restore()
        }
      }
    }
  }, [canvasWidth, canvasHeight, zoom, scrollLeft, scrollTop, showRulers, rulerInterval, isHorizontal])

  // 处理标尺点击创建参考线
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const pos = isHorizontal
      ? e.clientX - rect.left + scrollLeft
      : e.clientY - rect.top + scrollTop

    addGuideLine(orientation, pos / zoom)
  }

  useEffect(() => {
    drawRuler()
  }, [drawRuler])

  if (!showRulers) return null

  return (
    <canvas
      ref={canvasRef}
      className={`ruler ruler-${orientation}`}
      onMouseDown={handleMouseDown}
      style={{
        cursor: 'crosshair',
      }}
    />
  )
}

export default Ruler
