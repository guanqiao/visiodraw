import React from 'react'
import { Space, Button, Slider } from 'antd'
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import useX6GraphStore from '@stores/x6GraphStore'

const StatusBar: React.FC = () => {
  const {
    zoom,
    setZoom,
    selectedNodeIds,
    nodes,
    gridEnabled,
    snapToGrid,
    toggleGrid,
    toggleSnapToGrid,
  } = useX6GraphStore()

  const handleZoomChange = (value: number) => {
    setZoom(value / 100)
  }

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 0.1, 0.1))
  }

  return (
    <div
      data-testid="status-bar"
      style={{
        height: '32px',
        background: '#f5f5f5',
        borderTop: '1px solid #d9d9d9',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        justifyContent: 'space-between',
      }}
    >
      {/* 左侧信息 */}
      <Space size={24}>
        <span data-testid="selection-count">
          选中: {selectedNodeIds.length} 个对象
        </span>
        <span>
          图形: {nodes.length} 个
        </span>
      </Space>

      {/* 中间网格控制 */}
      <Space size={16}>
        <Button
          size="small"
          type={gridEnabled ? 'primary' : 'default'}
          onClick={toggleGrid}
        >
          网格
        </Button>
        <Button
          size="small"
          type={snapToGrid ? 'primary' : 'default'}
          onClick={toggleSnapToGrid}
        >
          吸附
        </Button>
      </Space>

      {/* 右侧缩放控制 */}
      <Space size={8}>
        <Button
          size="small"
          icon={<ZoomOutOutlined />}
          onClick={handleZoomOut}
        />
        <span data-testid="zoom-level" style={{ minWidth: '50px', textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <Button
          size="small"
          icon={<ZoomInOutlined />}
          onClick={handleZoomIn}
        />
        <Slider
          min={10}
          max={300}
          value={Math.round(zoom * 100)}
          onChange={handleZoomChange}
          style={{ width: 100 }}
        />
      </Space>
    </div>
  )
}

export default StatusBar
