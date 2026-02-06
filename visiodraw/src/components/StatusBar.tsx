import React from 'react'
import { Layout, Space, Tag } from 'antd'
import {
  SelectOutlined,
  BorderOutlined,
  LineOutlined,
  FontSizeOutlined,
  LinkOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import useCanvasStore from '@stores/canvasStore'
import useClipboardStore from '@stores/clipboardStore'

const { Footer } = Layout

// 工具图标映射
const toolIcons: Record<string, React.ReactNode> = {
  select: <SelectOutlined />,
  rectangle: <BorderOutlined />,
  circle: <BorderOutlined />,
  line: <LineOutlined />,
  text: <FontSizeOutlined />,
  connector: <LinkOutlined />,
}

// 工具名称映射
const toolNames: Record<string, string> = {
  select: '选择工具',
  rectangle: '矩形',
  circle: '圆形',
  line: '线条',
  text: '文本',
  connector: '连接线',
}

const StatusBar: React.FC = () => {
  const {
    zoom,
    shapes,
    selectedShapeId,
    selectedShapeIds,
    filePath,
    isModified,
    currentTool,
    connectors,
    selectedConnectorId,
  } = useCanvasStore()

  const { hasItems } = useClipboardStore()

  const selectedShape = shapes.find((s) => s.id === selectedShapeId)
  const selectedConnector = connectors.find((c) => c.id === selectedConnectorId)

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
      {/* 左侧：文件信息和当前工具 */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span>
          {filePath ? (
            <>
              {filePath}
              {isModified && <Tag color="orange" style={{ marginLeft: 8, fontSize: '10px' }}>已修改</Tag>}
            </>
          ) : (
            <>
              未命名
              {isModified && <Tag color="orange" style={{ marginLeft: 8, fontSize: '10px' }}>已修改</Tag>}
            </>
          )}
        </span>

        <Space size="small" style={{ borderLeft: '1px solid #e8e8e8', paddingLeft: 16 }}>
          <span style={{ color: '#666' }}>
            {toolIcons[currentTool]} {toolNames[currentTool] || currentTool}
          </span>
        </Space>
      </div>

      {/* 中间：操作提示 */}
      <div style={{ display: 'flex', gap: '16px', color: '#999' }}>
        <Space size="small">
          <span>Ctrl+C 复制</span>
          <span>Ctrl+V 粘贴</span>
          <span>Ctrl+X 剪切</span>
          <span>Ctrl+Z 撤销</span>
          <span>Ctrl+Y 重做</span>
          {currentTool === 'select' && (
            <>
              <span>|</span>
              <span>拖拽框选</span>
              <span>Ctrl+点击多选</span>
            </>
          )}
          {currentTool === 'connector' && (
            <>
              <span>|</span>
              <span>从连接点拖拽到连接点</span>
            </>
          )}
          {hasItems() && (
            <>
              <span>|</span>
              <Tag color="blue" style={{ fontSize: '10px' }}>
                <CopyOutlined /> 剪贴板有内容
              </Tag>
            </>
          )}
        </Space>
      </div>

      {/* 右侧：画布信息 */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {/* 选中状态 */}
        {selectedShapeIds.length > 0 && (
          <Tag color="blue" style={{ fontSize: '10px' }}>
            已选中 {selectedShapeIds.length} 个图形
          </Tag>
        )}

        {/* 选中图形详情 */}
        {selectedShape && selectedShapeIds.length === 1 && (
          <span style={{ color: '#1890ff' }}>
            {selectedShape.type} ({Math.round(selectedShape.x)},{' '}
            {Math.round(selectedShape.y)}) {Math.round(selectedShape.width)}×{Math.round(selectedShape.height)}
          </span>
        )}

        {/* 选中连接线详情 */}
        {selectedConnector && !selectedShape && (
          <span style={{ color: '#1890ff' }}>
            连接线 ({selectedConnector.style === 'straight' ? '直线' : selectedConnector.style === 'orthogonal' ? '正交线' : '曲线'})
          </span>
        )}

        <Space size="small" style={{ borderLeft: '1px solid #e8e8e8', paddingLeft: 16 }}>
          <span>缩放: {Math.round(zoom * 100)}%</span>
          <span>图形: {shapes.length}</span>
          <span>连接线: {connectors.length}</span>
        </Space>
      </div>
    </Footer>
  )
}

export default StatusBar
