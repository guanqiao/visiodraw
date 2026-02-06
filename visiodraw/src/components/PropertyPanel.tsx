import React from 'react'
import { Form, Input, InputNumber, ColorPicker, Collapse } from 'antd'
import useCanvasStore from '@stores/canvasStore'

const PropertyPanel: React.FC = () => {
  const { shapes, selectedShapeId, updateShape, deleteShape } = useCanvasStore()

  const selectedShape = shapes.find((s) => s.id === selectedShapeId)

  if (!selectedShape) {
    return (
      <div className="property-panel">
        <p style={{ color: '#999', textAlign: 'center' }}>
          请选择一个图形以编辑属性
        </p>
      </div>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (key: string, value: any) => {
    if (selectedShapeId) {
      updateShape(selectedShapeId, { [key]: value })
    }
  }

  const collapseItems = [
    {
      key: 'position',
      label: '位置与大小',
      children: (
        <Form layout="vertical" size="small">
          <Form.Item label="X 坐标">
            <InputNumber
              value={selectedShape.x}
              onChange={(value) => handleChange('x', value)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Y 坐标">
            <InputNumber
              value={selectedShape.y}
              onChange={(value) => handleChange('y', value)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="宽度">
            <InputNumber
              value={selectedShape.width}
              onChange={(value) => handleChange('width', value)}
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
          <Form.Item label="高度">
            <InputNumber
              value={selectedShape.height}
              onChange={(value) => handleChange('height', value)}
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
          <Form.Item label="旋转角度">
            <InputNumber
              value={selectedShape.angle || 0}
              onChange={(value) => handleChange('angle', value)}
              style={{ width: '100%' }}
              min={0}
              max={360}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'style',
      label: '样式',
      children: (
        <Form layout="vertical" size="small">
          <Form.Item label="填充颜色">
            <ColorPicker
              value={selectedShape.fill}
              onChange={(color) => handleChange('fill', color.toHexString())}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="边框颜色">
            <ColorPicker
              value={selectedShape.stroke}
              onChange={(color) => handleChange('stroke', color.toHexString())}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="边框宽度">
            <InputNumber
              value={selectedShape.strokeWidth}
              onChange={(value) => handleChange('strokeWidth', value)}
              style={{ width: '100%' }}
              min={0}
              max={20}
            />
          </Form.Item>
        </Form>
      ),
    },
    ...(selectedShape.text !== undefined
      ? [
          {
            key: 'text',
            label: '文本',
            children: (
              <Form layout="vertical" size="small">
                <Form.Item label="文本内容">
                  <Input.TextArea
                    value={selectedShape.text}
                    onChange={(e) => handleChange('text', e.target.value)}
                    rows={3}
                  />
                </Form.Item>
              </Form>
            ),
          },
        ]
      : []),
    {
      key: 'actions',
      label: '操作',
      children: (
        <Form layout="vertical" size="small">
          <Form.Item>
            <a
              onClick={() => selectedShapeId && deleteShape(selectedShapeId)}
              style={{ color: '#ff4d4f' }}
            >
              删除图形
            </a>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div className="property-panel">
      <Collapse
        defaultActiveKey={['position', 'style']}
        bordered={false}
        items={collapseItems}
      />
    </div>
  )
}

export default PropertyPanel
