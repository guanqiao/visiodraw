import React, { useState } from 'react'
import { Card, Form, InputNumber, Input, ColorPicker, Space, Button, Divider, Tooltip } from 'antd'
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  LockOutlined,
  UnlockOutlined,
  FontSizeOutlined,
} from '@ant-design/icons'
import type { ShapeData } from '../../stores/x6GraphStore'

export interface NodePropertyPanelProps {
  selectedNodes: ShapeData[]
  singleNode: ShapeData | null
  hasMultipleNodeSelection: boolean
  onUpdateNode: (id: string, updates: Partial<ShapeData>) => void
  onAlignNodes: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  children?: React.ReactNode
}

export const NodePropertyPanel: React.FC<NodePropertyPanelProps> = ({
  selectedNodes,
  singleNode,
  hasMultipleNodeSelection,
  onUpdateNode,
  onAlignNodes,
  children,
}) => {
  const [lockAspectRatio, setLockAspectRatio] = useState(true)

  const handlePositionChange = (axis: 'x' | 'y', value: number | null) => {
    if (value === null) return
    selectedNodes.forEach((node) => {
      onUpdateNode(node.id, { [axis]: value })
    })
  }

  const handleSizeChange = (dimension: 'width' | 'height', value: number | null) => {
    if (value === null || !singleNode) return
    
    if (lockAspectRatio) {
      const aspectRatio = singleNode.width / singleNode.height
      if (dimension === 'width') {
        const newHeight = Math.round(value / aspectRatio)
        onUpdateNode(singleNode.id, { width: value, height: newHeight })
      } else {
        const newWidth = Math.round(value * aspectRatio)
        onUpdateNode(singleNode.id, { width: newWidth, height: value })
      }
    } else {
      onUpdateNode(singleNode.id, { [dimension]: value })
    }
  }

  const handleFillChange = (color: string) => {
    selectedNodes.forEach((node) => {
      onUpdateNode(node.id, { fill: color })
    })
  }

  const handleStrokeChange = (color: string) => {
    selectedNodes.forEach((node) => {
      onUpdateNode(node.id, { stroke: color })
    })
  }

  const handleStrokeWidthChange = (value: number | null) => {
    if (value === null) return
    selectedNodes.forEach((node) => {
      onUpdateNode(node.id, { strokeWidth: value })
    })
  }

  const handleNodeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!singleNode) return
    onUpdateNode(singleNode.id, { text: e.target.value })
  }

  const handleNodeFontSizeChange = (value: number | null) => {
    if (value === null || !singleNode) return
    onUpdateNode(singleNode.id, { fontSize: value })
  }

  const handleNodeTextColorChange = (color: string) => {
    if (!singleNode) return
    onUpdateNode(singleNode.id, { fontColor: color })
  }

  return (
    <Card title="图形属性" size="small">
      {children}
      <Form layout="vertical" size="small">
        <Form.Item label="位置">
          <Space.Compact>
            <Button>X</Button>
            <InputNumber
              value={singleNode?.x ?? selectedNodes[0]?.x}
              onChange={(v) => handlePositionChange('x', v)}
              style={{ width: 100 }}
            />
            <Button>Y</Button>
            <InputNumber
              value={singleNode?.y ?? selectedNodes[0]?.y}
              onChange={(v) => handlePositionChange('y', v)}
              style={{ width: 100 }}
            />
          </Space.Compact>
        </Form.Item>

        <Form.Item label="尺寸">
          <Space.Compact>
            <Button>W</Button>
            <InputNumber
              value={singleNode?.width}
              onChange={(v) => handleSizeChange('width', v)}
              disabled={!singleNode}
              style={{ width: 80 }}
            />
            <Tooltip title={lockAspectRatio ? '解锁比例' : '锁定比例'}>
              <Button
                type={lockAspectRatio ? 'primary' : 'default'}
                icon={lockAspectRatio ? <LockOutlined /> : <UnlockOutlined />}
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                size="small"
              />
            </Tooltip>
            <Button>H</Button>
            <InputNumber
              value={singleNode?.height}
              onChange={(v) => handleSizeChange('height', v)}
              disabled={!singleNode}
              style={{ width: 80 }}
            />
          </Space.Compact>
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        {singleNode && (
          <>
            <Form.Item label="文本内容">
              <Input
                value={singleNode.text || ''}
                onChange={handleNodeTextChange}
                placeholder="输入文本"
              />
            </Form.Item>

            <Form.Item label="字体大小">
              <InputNumber
                min={8}
                max={72}
                value={singleNode.fontSize || 14}
                onChange={handleNodeFontSizeChange}
                prefix={<FontSizeOutlined />}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item label="字体颜色">
              <ColorPicker
                value={singleNode.fontColor || '#333333'}
                onChange={(color) => handleNodeTextColorChange(color.toHexString())}
                showText
              />
            </Form.Item>

            <Divider style={{ margin: '12px 0' }} />
          </>
        )}

        <Form.Item label="填充颜色">
          <ColorPicker
            value={singleNode?.fill ?? selectedNodes[0]?.fill}
            onChange={(color) => handleFillChange(color.toHexString())}
            showText
          />
        </Form.Item>

        <Form.Item label="描边颜色">
          <ColorPicker
            value={singleNode?.stroke ?? selectedNodes[0]?.stroke}
            onChange={(color) => handleStrokeChange(color.toHexString())}
            showText
          />
        </Form.Item>

        <Form.Item label="描边宽度">
          <InputNumber
            min={0}
            max={10}
            value={singleNode?.strokeWidth ?? selectedNodes[0]?.strokeWidth}
            onChange={handleStrokeWidthChange}
            style={{ width: '100%' }}
          />
        </Form.Item>

        {hasMultipleNodeSelection && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Form.Item label="对齐">
              <Space wrap>
                <Button
                  icon={<AlignLeftOutlined />}
                  onClick={() => onAlignNodes('left')}
                  size="small"
                />
                <Button
                  icon={<AlignCenterOutlined />}
                  onClick={() => onAlignNodes('center')}
                  size="small"
                />
                <Button
                  icon={<AlignRightOutlined />}
                  onClick={() => onAlignNodes('right')}
                  size="small"
                />
                <Button
                  icon={<VerticalAlignTopOutlined />}
                  onClick={() => onAlignNodes('top')}
                  size="small"
                />
                <Button
                  icon={<VerticalAlignMiddleOutlined />}
                  onClick={() => onAlignNodes('middle')}
                  size="small"
                />
                <Button
                  icon={<VerticalAlignBottomOutlined />}
                  onClick={() => onAlignNodes('bottom')}
                  size="small"
                />
              </Space>
            </Form.Item>
          </>
        )}
      </Form>
    </Card>
  )
}

export default NodePropertyPanel
