import React from 'react'
import { Layout } from 'antd'
import useCanvasStore from '@stores/canvasStore'

const { Footer } = Layout

const StatusBar: React.FC = () => {
  const { zoom, shapes, selectedShapeId, filePath, isModified } = useCanvasStore()

  const selectedShape = shapes.find((s) => s.id === selectedShapeId)

  return (
    <Footer
      style={{
        height: '28px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fafafa',
        borderTop: '1px solid #e8e8e8',
        fontSize: '12px',
      }}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        <span>
          {filePath ? (
            <>
              {filePath}
              {isModified && ' *'}
            </>
          ) : (
            '未命名'
          )}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <span>缩放: {Math.round(zoom * 100)}%</span>
        <span>图形数量: {shapes.length}</span>
        {selectedShape && (
          <span>
            选中: {selectedShape.type} ({Math.round(selectedShape.x)},{' '}
            {Math.round(selectedShape.y)})
          </span>
        )}
      </div>
    </Footer>
  )
}

export default StatusBar
