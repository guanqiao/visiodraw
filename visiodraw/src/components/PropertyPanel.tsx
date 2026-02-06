import React from 'react'
import { Form, Input, InputNumber, ColorPicker, Select, Collapse } from 'antd'
import useCanvasStore from '@stores/canvasStore'

const { Panel } = Collapse
const { Option } = Select

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

  const handleChange = (key: string, value: any) => {
    if (selectedShapeId) {
      updateShape(selectedShapeId, { [key]: value })
    }
  }

  return (
    <div className="property-panel">
      <Collapse defaultActiveKey={['position', 'style']} bordered={false}>
        <Panel header="位置与大小" key="position">
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
        </Panel>

        <Panel header="样式" key="style">
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
        </Panel>

        {selectedShape.text !== undefined && (
          <Panel header="文本" key="text">
            <Form layout="vertical" size="small">
              <Form.Item label="文本内容">
                <Input.TextArea
                  value={selectedShape.text}
                  onChange={(e) => handleChange('text', e.target.value)}
                  rows={3}
                />
              </Form.Item>
            </Form>
          </Panel>
        )
        }

        <Panel header="操作" key="actions">
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
        </Panel>
      </Collapse>
    </div>
  )
}

export default PropertyPanel
