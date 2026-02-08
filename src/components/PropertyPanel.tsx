import React from 'react'
import { Card, Form, InputNumber, Input, ColorPicker, Space, Button, Divider } from 'antd'
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
} from '@ant-design/icons'
import useX6GraphStore from '@stores/x6GraphStore'

const PropertyPanel: React.FC = () => {
  const {
    selectedNodeIds,
    nodes,
    updateNode,
    alignNodes,
    distributeNodes,
  } = useX6GraphStore()

  // Get selected nodes
  const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id))
  const hasSelection = selectedNodes.length > 0
  const hasMultipleSelection = selectedNodes.length > 1
  const singleNode = selectedNodes.length === 1 ? selectedNodes[0] : null

  // Handle position change
  const handlePositionChange = (axis: 'x' | 'y', value: number | null) => {
    if (value === null) return
    selectedNodes.forEach((node) => {
      updateNode(node.id, { [axis]: value })
    })
  }

  // Handle size change
  const handleSizeChange = (dimension: 'width' | 'height', value: number | null) => {
    if (value === null || !singleNode) return
    updateNode(singleNode.id, { [dimension]: value })
  }

  // Handle fill color change
  const handleFillChange = (color: string) => {
    selectedNodes.forEach((node) => {
      updateNode(node.id, { fill: color })
    })
  }

  // Handle stroke color change
  const handleStrokeChange = (color: string) => {
    selectedNodes.forEach((node) => {
      updateNode(node.id, { stroke: color })
    })
  }

  // Handle stroke width change
  const handleStrokeWidthChange = (value: number | null) => {
    if (value === null) return
    selectedNodes.forEach((node) => {
      updateNode(node.id, { strokeWidth: value })
    })
  }

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!singleNode) return
    updateNode(singleNode.id, { text: e.target.value })
  }

  if (!hasSelection) {
    return (
      <Card title="属性" size="small" style={{ width: 280 }}>
        <div style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>
          选择一个图形以编辑属性
        </div>
      </Card>
    )
  }

  return (
    <Card title="属性" size="small" style={{ width: 280 }}>
      <Form layout="vertical" size="small">
        {/* Position */}
        <Form.Item label="位置">
          <Space>
            <InputNumber
              addonBefore="X"
              value={singleNode?.x ?? selectedNodes[0]?.x}
              onChange={(v) => handlePositionChange('x', v)}
              style={{ width: 120 }}
            />
            <InputNumber
              addonBefore="Y"
              value={singleNode?.y ?? selectedNodes[0]?.y}
              onChange={(v) => handlePositionChange('y', v)}
              style={{ width: 120 }}
            />
          </Space>
        </Form.Item>

        {/* Size */}
        <Form.Item label="尺寸">
          <Space>
            <InputNumber
              addonBefore="W"
              value={singleNode?.width}
              onChange={(v) => handleSizeChange('width', v)}
              disabled={!singleNode}
              style={{ width: 120 }}
            />
            <InputNumber
              addonBefore="H"
              value={singleNode?.height}
              onChange={(v) => handleSizeChange('height', v)}
              disabled={!singleNode}
              style={{ width: 120 }}
            />
          </Space>
        </Form.Item>

        {/* Text */}
        {singleNode && (
          <Form.Item label="文本">
            <Input
              value={singleNode.text || ''}
              onChange={handleTextChange}
              placeholder="输入文本"
            />
          </Form.Item>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* Fill Color */}
        <Form.Item label="填充颜色">
          <ColorPicker
            value={singleNode?.fill ?? selectedNodes[0]?.fill}
            onChange={(color) => handleFillChange(color.toHexString())}
            showText
          />
        </Form.Item>

        {/* Stroke Color */}
        <Form.Item label="描边颜色">
          <ColorPicker
            value={singleNode?.stroke ?? selectedNodes[0]?.stroke}
            onChange={(color) => handleStrokeChange(color.toHexString())}
            showText
          />
        </Form.Item>

        {/* Stroke Width */}
        <Form.Item label="描边宽度">
          <InputNumber
            min={0}
            max={10}
            value={singleNode?.strokeWidth ?? selectedNodes[0]?.strokeWidth}
            onChange={handleStrokeWidthChange}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Alignment - Only show for multiple selection */}
        {hasMultipleSelection && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item label="对齐">
              <Space wrap>
                <Button
                  icon={<AlignLeftOutlined />}
                  onClick={() => alignNodes('left')}
                  size="small"
                />
                <Button
                  icon={<AlignCenterOutlined />}
                  onClick={() => alignNodes('center')}
                  size="small"
                />
                <Button
                  icon={<AlignRightOutlined />}
                  onClick={() => alignNodes('right')}
                  size="small"
                />
                <Button
                  icon={<VerticalAlignTopOutlined />}
                  onClick={() => alignNodes('top')}
                  size="small"
                />
                <Button
                  icon={<VerticalAlignMiddleOutlined />}
                  onClick={() => alignNodes('middle')}
                  size="small"
                />
                <Button
                  icon={<VerticalAlignBottomOutlined />}
                  onClick={() => alignNodes('bottom')}
                  size="small"
                />
              </Space>
            </Form.Item>

            {selectedNodes.length >= 3 && (
              <Form.Item label="分布">
                <Space>
                  <Button
                    icon={<ColumnWidthOutlined />}
                    onClick={() => distributeNodes('horizontal')}
                    size="small"
                  >
                    水平
                  </Button>
                  <Button
                    icon={<ColumnHeightOutlined />}
                    onClick={() => distributeNodes('vertical')}
                    size="small"
                  >
                    垂直
                  </Button>
                </Space>
              </Form.Item>
            )}
          </>
        )}
      </Form>
    </Card>
  )
}

export default PropertyPanel
