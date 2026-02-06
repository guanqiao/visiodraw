import React from 'react'
import type { AlignmentGuide } from '../../utils/alignmentUtils'

interface AlignmentGuidesProps {
  guides: AlignmentGuide[]
  canvasWidth: number
  canvasHeight: number
}

const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  guides,
  canvasWidth,
  canvasHeight,
}) => {
  if (guides.length === 0) return null

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: canvasWidth,
        height: canvasHeight,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {guides.map((guide, index) => (
        <line
          key={`${guide.type}-${guide.position}-${index}`}
          x1={guide.type === 'vertical' ? guide.position : 0}
          y1={guide.type === 'horizontal' ? guide.position : 0}
          x2={guide.type === 'vertical' ? guide.position : canvasWidth}
          y2={guide.type === 'horizontal' ? guide.position : canvasHeight}
          stroke="#1890ff"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.8}
        />
      ))}
    </svg>
  )
}

export default AlignmentGuides
