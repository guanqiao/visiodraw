import React from 'react'
import { Form, Input, InputNumber, ColorPicker, Collapse, Select, Radio } from 'antd'
import useCanvasStore from '@stores/canvasStore'
import type { ConnectorStyle } from '../types/connection'

const PropertyPanel: React.FC = () => {
  const {
    shapes,
    selectedShapeId,
    updateShape,
    deleteShape,
    connectors,
    selectedConnectorId,
    updateConnector,
    deleteConnector,
    selectConnector,
    selectShape,
  } = useCanvasStore()

  const selectedShape = shapes.find((s) => s.id === selectedShapeId)
  const selectedConnector = connectors.find((c) => c.id === selectedConnectorId)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleShapeChange = (key: string, value: any) => {
    if (selectedShapeId) {
      updateShape(selectedShapeId, { [key]: value })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleConnectorChange = (key: string, value: any) => {
    if (selectedConnectorId) {
      updateConnector(selectedConnectorId, { [key]: value })
    }
  }

  // 如果没有选中任何对象
  if (!selectedShape && !selectedConnector) {
    return (
      <div className="property-panel">
        <p style={{ color: '#999', textAlign: 'center' }}>
          请选择一个图形或连接线以编辑属性
        </p>
      </div>
    )
  }

  // 连接线属性面板
  if (selectedConnector) {
    const collapseItems = [
      {
        key: 'style',
        label: '连接线样式',
        children: (
          <Form layout="vertical" size="small">
            <Form.Item label="线型">
              <Select
                value={selectedConnector.style}
                onChange={(value: ConnectorStyle) => handleConnectorChange('style', value)}
                style={{ width: '100%' }}
              >
                <Select.Option value="straight">直线</Select.Option>
                <Select.Option value="orthogonal">正交线（直角）</Select.Option>
                <Select.Option value="curved">曲线（贝塞尔）</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="线条颜色">
              <ColorPicker
                value={selectedConnector.stroke}
                onChange={(color) => handleConnectorChange('stroke', color.toHexString())}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item label="线条宽度">
              <InputNumber
                value={selectedConnector.strokeWidth}
                onChange={(value) => handleConnectorChange('strokeWidth', value)}
                style={{ width: '100%' }}
                min={1}
                max={10}
              />
            </Form.Item>
          </Form>
        ),
      },
      {
        key: 'endpoints',
        label: '端点样式',
        children: (
          <Form layout="vertical" size="small">
            <Form.Item label="起点样式">
              <Radio.Group
                value={selectedConnector.startStyle}
                onChange={(e) => handleConnectorChange('startStyle', e.target.value)}
              >
                <Radio.Button value="none">无</Radio.Button>
                <Radio.Button value="arrow">箭头</Radio.Button>
                <Radio.Button value="dot">圆点</Radio.Button>
                <Radio.Button value="diamond">菱形</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="终点样式">
              <Radio.Group
                value={selectedConnector.endStyle}
                onChange={(e) => handleConnectorChange('endStyle', e.target.value)}
              >
                <Radio.Button value="none">无</Radio.Button>
                <Radio.Button value="arrow">箭头</Radio.Button>
                <Radio.Button value="dot">圆点</Radio.Button>
                <Radio.Button value="diamond">菱形</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Form>
        ),
      },
      {
        key: 'label',
        label: '标签',
        children: (
          <Form layout="vertical" size="small">
            <Form.Item label="标签文本">
              <Input
                value={selectedConnector.label || ''}
                onChange={(e) => handleConnectorChange('label', e.target.value)}
                placeholder="输入标签文本"
              />
            </Form.Item>
          </Form>
        ),
      },
      {
        key: 'actions',
        label: '操作',
        children: (
          <Form layout="vertical" size="small">
            <Form.Item>
              <a
                onClick={() => {
                  if (selectedConnectorId) {
                    deleteConnector(selectedConnectorId)
                    selectConnector(null)
                  }
                }}
                style={{ color: '#ff4d4f' }}
              >
                删除连接线
              </a>
            </Form.Item>
          </Form>
        ),
      },
    ]

    return (
      <div className="property-panel">
        <h4 style={{ marginBottom: 16, padding: '0 16px' }}>连接线属性</h4>
        <Collapse
          defaultActiveKey={['style', 'endpoints']}
          bordered={false}
          items={collapseItems}
        />
      </div>
    )
  }

  // 图形属性面板
  const collapseItems = [
    {
      key: 'position',
      label: '位置与大小',
      children: (
        <Form layout="vertical" size="small">
          <Form.Item label="X 坐标">
            <InputNumber
              value={selectedShape!.x}
              onChange={(value) => handleShapeChange('x', value)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Y 坐标">
            <InputNumber
              value={selectedShape!.y}
              onChange={(value) => handleShapeChange('y', value)}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="宽度">
            <InputNumber
              value={selectedShape!.width}
              onChange={(value) => handleShapeChange('width', value)}
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
          <Form.Item label="高度">
            <InputNumber
              value={selectedShape!.height}
              onChange={(value) => handleShapeChange('height', value)}
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
          <Form.Item label="旋转角度">
            <InputNumber
              value={selectedShape!.angle || 0}
              onChange={(value) => handleShapeChange('angle', value)}
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
              value={selectedShape!.fill}
              onChange={(color) => handleShapeChange('fill', color.toHexString())}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="边框颜色">
            <ColorPicker
              value={selectedShape!.stroke}
              onChange={(color) => handleShapeChange('stroke', color.toHexString())}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="边框宽度">
            <InputNumber
              value={selectedShape!.strokeWidth}
              onChange={(value) => handleShapeChange('strokeWidth', value)}
              style={{ width: '100%' }}
              min={0}
              max={20}
            />
          </Form.Item>
        </Form>
      ),
    },
    ...(selectedShape!.text !== undefined
      ? [
          {
            key: 'text',
            label: '文本',
            children: (
              <Form layout="vertical" size="small">
                <Form.Item label="文本内容">
                  <Input.TextArea
                    value={selectedShape!.text}
                    onChange={(e) => handleShapeChange('text', e.target.value)}
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
              onClick={() => {
                if (selectedShapeId) {
                  deleteShape(selectedShapeId)
                  selectShape(null)
                }
              }}
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
      <h4 style={{ marginBottom: 16, padding: '0 16px' }}>图形属性</h4>
      <Collapse
        defaultActiveKey={['position', 'style']}
        bordered={false}
        items={collapseItems}
      />
    </div>
  )
}

export default PropertyPanel
