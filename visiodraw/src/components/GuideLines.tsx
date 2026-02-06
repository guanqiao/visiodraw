import React, { useState, useRef, useCallback } from 'react'
import { LockOutlined, UnlockOutlined, CloseOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import useRulerStore from '../stores/rulerStore'
import './GuideLines.css'

interface GuideLinesProps {
  zoom: number
  scrollLeft?: number
  scrollTop?: number
}

const GuideLines: React.FC<GuideLinesProps> = ({
  zoom,
  scrollLeft = 0,
  scrollTop = 0,
}) => {
  const {
    showGuideLines,
    guideLines,
    removeGuideLine,
    updateGuideLinePosition,
    toggleGuideLineLock,
  } = useRulerStore()

  const [draggingGuide, setDraggingGuide] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 处理参考线拖拽开始
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, guideId: string, _currentPos: number) => {
      const guide = guideLines.find((g) => g.id === guideId)
      if (!guide || guide.locked) return

      e.preventDefault()
      e.stopPropagation()

      setDraggingGuide(guideId)
    },
    [guideLines]
  )

  // 处理拖拽中
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingGuide || !containerRef.current) return

      const guide = guideLines.find((g) => g.id === draggingGuide)
      if (!guide) return

      const rect = containerRef.current.getBoundingClientRect()
      let newPos: number

      if (guide.orientation === 'horizontal') {
        newPos = (e.clientY - rect.top + scrollTop) / zoom
      } else {
        newPos = (e.clientX - rect.left + scrollLeft) / zoom
      }

      // 限制在画布范围内
      newPos = Math.max(0, newPos)

      updateGuideLinePosition(draggingGuide, newPos)
    },
    [draggingGuide, guideLines, zoom, scrollLeft, scrollTop, updateGuideLinePosition]
  )

  // 处理拖拽结束
  const handleMouseUp = useCallback(() => {
    setDraggingGuide(null)
  }, [])

  // 处理删除参考线
  const handleDelete = (e: React.MouseEvent, guideId: string) => {
    e.stopPropagation()
    removeGuideLine(guideId)
  }

  // 处理锁定/解锁
  const handleToggleLock = (e: React.MouseEvent, guideId: string) => {
    e.stopPropagation()
    toggleGuideLineLock(guideId)
  }

  if (!showGuideLines) return null

  return (
    <div
      ref={containerRef}
      className="guide-lines-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {guideLines.map((guide) => {
        const position = guide.position * zoom
        const isHorizontal = guide.orientation === 'horizontal'

        return (
          <div
            key={guide.id}
            className={`guide-line guide-line-${guide.orientation} ${
              guide.locked ? 'locked' : ''
            } ${draggingGuide === guide.id ? 'dragging' : ''}`}
            style={{
              [isHorizontal ? 'top' : 'left']: position,
            }}
            onMouseDown={(e) => handleMouseDown(e, guide.id, position)}
          >
            {/* 参考线主体 */}
            <div className="guide-line-body" />

            {/* 控制按钮 */}
            <div className="guide-line-controls">
              <Tooltip title={guide.locked ? '解锁' : '锁定'}>
                <button
                  className="guide-line-btn"
                  onClick={(e) => handleToggleLock(e, guide.id)}
                >
                  {guide.locked ? <LockOutlined /> : <UnlockOutlined />}
                </button>
              </Tooltip>
              <Tooltip title="删除">
                <button
                  className="guide-line-btn delete"
                  onClick={(e) => handleDelete(e, guide.id)}
                >
                  <CloseOutlined />
                </button>
              </Tooltip>
            </div>

            {/* 位置标签 */}
            <div className="guide-line-label">
              {Math.round(guide.position)}px
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default GuideLines
