import React, { useState } from 'react'
import { Card, Form, InputNumber, Input, ColorPicker, Space, Button, Divider, Select, Slider, Tooltip, Switch } from 'antd'
import {
  LineOutlined,
  NodeIndexOutlined,
  DeleteOutlined,
  BorderOutlined,
  MinusOutlined,
  DashOutlined,
  SmallDashOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
  ArrowUpOutlined,
  ArrowRightOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import type { Connector, ConnectorStyle, ConnectorEndStyle, LineStyle, ConnectorLabel, UMLRelationType, ERRelationType } from '../../types/connection'
import { ConnectorRenderer } from '@utils/connectorRenderer'
import { umlRelations, erRelations } from '../../types/connection'
import type { SelfLoopDirection } from '../../utils/selfLoopRouter'
import { v4 as uuidv4 } from 'uuid'

const { Option } = Select

export interface EdgePropertyPanelProps {
  edge: Connector
  onUpdateEdge: (id: string, updates: Partial<Connector>) => void
  onDeleteEdge: (id: string) => void
  graph: any
  isSelfLoop?: boolean
  selfLoopConfig?: {
    direction?: SelfLoopDirection
    radius?: number
  }
  onUpdateSelfLoop?: (id: string, config: { direction?: SelfLoopDirection; radius?: number }) => void
}

export const EdgePropertyPanel: React.FC<EdgePropertyPanelProps> = ({
  edge,
  onUpdateEdge,
  onDeleteEdge,
  graph,
  isSelfLoop = false,
  selfLoopConfig,
  onUpdateSelfLoop,
}) => {
  const [editingLabelIndex, setEditingLabelIndex] = useState<number | null>(null)
  const [labelText, setLabelText] = useState('')

  const handleSelfLoopDirectionChange = (direction: SelfLoopDirection) => {
    if (onUpdateSelfLoop) {
      onUpdateSelfLoop(edge.id, { direction })
    }
  }

  const handleSelfLoopRadiusChange = (radius: number) => {
    if (onUpdateSelfLoop) {
      onUpdateSelfLoop(edge.id, { radius })
    }
  }

  const handleEdgeStyleChange = (style: ConnectorStyle) => {
    onUpdateEdge(edge.id, { style } as any)
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeAppearance(x6Edge, { style } as any)
      }
    }
  }

  const handleEdgeLineStyleChange = (lineStyle: LineStyle) => {
    onUpdateEdge(edge.id, { lineStyle })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeAppearance(x6Edge, { lineStyle })
      }
    }
  }

  const handleStartStyleChange = (startStyle: ConnectorEndStyle) => {
    onUpdateEdge(edge.id, { startStyle })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeMarkers(x6Edge, startStyle, edge.endStyle)
      }
    }
  }

  const handleEndStyleChange = (endStyle: ConnectorEndStyle) => {
    onUpdateEdge(edge.id, { endStyle })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeMarkers(x6Edge, edge.startStyle, endStyle)
      }
    }
  }

  const handleUMLRelationChange = (relationType: UMLRelationType) => {
    const config = umlRelations[relationType]
    onUpdateEdge(edge.id, {
      lineStyle: config.lineStyle,
      startStyle: config.startStyle,
      endStyle: config.endStyle,
      stroke: config.stroke,
    })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeMarkers(x6Edge, config.startStyle, config.endStyle)
        ConnectorRenderer.updateEdgeAppearance(x6Edge, {
          lineStyle: config.lineStyle,
          stroke: config.stroke,
        })
      }
    }
  }

  const handleERRelationChange = (relationType: ERRelationType) => {
    const config = erRelations[relationType]
    onUpdateEdge(edge.id, {
      lineStyle: config.lineStyle,
      startStyle: config.startStyle,
      endStyle: config.endStyle,
      stroke: config.stroke,
      strokeWidth: config.strokeWidth,
    })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeMarkers(x6Edge, config.startStyle, config.endStyle)
        ConnectorRenderer.updateEdgeAppearance(x6Edge, {
          lineStyle: config.lineStyle,
          stroke: config.stroke,
          strokeWidth: config.strokeWidth,
        })
      }
    }
  }

  const handleEdgeColorChange = (color: string) => {
    onUpdateEdge(edge.id, { stroke: color })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeAppearance(x6Edge, { stroke: color })
      }
    }
  }

  const handleEdgeStrokeWidthChange = (strokeWidth: number) => {
    onUpdateEdge(edge.id, { strokeWidth })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeAppearance(x6Edge, { strokeWidth })
      }
    }
  }

  const handleDeleteEdge = () => {
    onDeleteEdge(edge.id)
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge) {
        graph.removeCell(x6Edge)
      }
    }
  }

  const handleAddLabel = () => {
    const newLabel: ConnectorLabel = {
      id: uuidv4(),
      text: '新标签',
      position: 0.5,
      fontSize: 12,
      color: '#333333',
    }
    const updatedLabels = [...(edge.labels || []), newLabel]
    onUpdateEdge(edge.id, { labels: updatedLabels })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeLabel(x6Edge, newLabel, updatedLabels.length - 1)
      }
    }
  }

  const handleEditLabel = (index: number) => {
    if (!edge.labels) return
    setEditingLabelIndex(index)
    setLabelText(edge.labels[index].text)
  }

  const handleSaveLabel = () => {
    if (editingLabelIndex === null) return
    const updatedLabels = [...(edge.labels || [])]
    updatedLabels[editingLabelIndex] = {
      ...updatedLabels[editingLabelIndex],
      text: labelText,
    }
    onUpdateEdge(edge.id, { labels: updatedLabels })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeLabel(x6Edge, updatedLabels[editingLabelIndex], editingLabelIndex)
      }
    }
    setEditingLabelIndex(null)
    setLabelText('')
  }

  const handleDeleteLabel = (index: number) => {
    const updatedLabels = (edge.labels || []).filter((_, i) => i !== index)
    onUpdateEdge(edge.id, { labels: updatedLabels })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.removeEdgeLabel(x6Edge, index)
      }
    }
  }

  const handleLabelPositionChange = (index: number, position: number) => {
    if (!edge.labels) return
    const updatedLabels = [...edge.labels]
    updatedLabels[index] = { ...updatedLabels[index], position }
    onUpdateEdge(edge.id, { labels: updatedLabels })
    if (graph) {
      const x6Edge = graph.getCellById(edge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeLabel(x6Edge, updatedLabels[index], index)
      }
    }
  }

  return (
    <Card
      title={isSelfLoop ? "自连线属性" : "连接线属性"}
      size="small"
      extra={
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={handleDeleteEdge}
          size="small"
        />
      }
    >
      <Form layout="vertical" size="small">
        {isSelfLoop && (
          <>
            <Form.Item label="自连线配置">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SyncOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontSize: 12, color: '#666' }}>当前为自连线</span>
                </div>
              </Space>
            </Form.Item>

            <Form.Item label="方向">
              <Select
                value={selfLoopConfig?.direction || 'top'}
                onChange={handleSelfLoopDirectionChange}
                style={{ width: '100%' }}
              >
                <Option value="top">
                  <Space><ArrowUpOutlined />向上</Space>
                </Option>
                <Option value="right">
                  <Space><ArrowRightOutlined />向右</Space>
                </Option>
                <Option value="bottom">
                  <Space><ArrowDownOutlined />向下</Space>
                </Option>
                <Option value="left">
                  <Space><ArrowLeftOutlined />向左</Space>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item label="弧度半径">
              <InputNumber
                min={20}
                max={100}
                value={selfLoopConfig?.radius || 35}
                onChange={(v) => v && handleSelfLoopRadiusChange(v)}
                style={{ width: '100%' }}
                addonAfter="px"
              />
            </Form.Item>

            <Divider style={{ margin: '12px 0' }} />
          </>
        )}

        <Form.Item label="UML 关系">
          <Select
            placeholder="选择 UML 关系类型"
            onChange={handleUMLRelationChange}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="inheritance">继承 (Generalization)</Option>
            <Option value="implementation">实现 (Realization)</Option>
            <Option value="dependency">依赖 (Dependency)</Option>
            <Option value="association">关联 (Association)</Option>
            <Option value="directed-association">定向关联 (Directed)</Option>
            <Option value="aggregation">聚合 (Aggregation)</Option>
            <Option value="composition">组合 (Composition)</Option>
          </Select>
        </Form.Item>

        <Form.Item label="ER 关系">
          <Select
            placeholder="选择 ER 关系类型"
            onChange={handleERRelationChange}
            style={{ width: '100%' }}
            allowClear
          >
            <Option value="er-one-to-one">一对一 (1:1)</Option>
            <Option value="er-one-to-many">一对多 (1:N)</Option>
            <Option value="er-many-to-many">多对多 (N:M)</Option>
            <Option value="er-identifying">标识关系 (弱实体)</Option>
            <Option value="er-non-identifying">非标识关系</Option>
            <Option value="er-total-participation">完全参与</Option>
            <Option value="er-partial-participation">部分参与</Option>
            <Option value="er-foreign-key">外键关系</Option>
            <Option value="er-entity-attribute">实体-属性连接</Option>
            <Option value="er-entity-relationship">实体-关系连接</Option>
            <Option value="er-isa-hierarchy">ISA层次继承</Option>
          </Select>
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        <Form.Item label="连线样式">
          <Select
            value={edge.style}
            onChange={handleEdgeStyleChange}
            style={{ width: '100%' }}
          >
            <Option value="straight">
              <Space><LineOutlined />直线</Space>
            </Option>
            <Option value="orthogonal">
              <Space><NodeIndexOutlined />正交线</Space>
            </Option>
            <Option value="curved">
              <Space><MinusOutlined rotate={45} />曲线</Space>
            </Option>
            <Option value="bezier">
              <Space><MinusOutlined rotate={-45} />贝塞尔曲线</Space>
            </Option>
            <Option value="metro">
              <Space><BorderOutlined />地铁线</Space>
            </Option>
            <Option value="manhattan">
              <Space><NodeIndexOutlined rotate={90} />曼哈顿线</Space>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item label="线型">
          <Select
            value={edge.lineStyle}
            onChange={handleEdgeLineStyleChange}
            style={{ width: '100%' }}
          >
            <Option value="solid">
              <Space><LineOutlined />实线</Space>
            </Option>
            <Option value="dashed">
              <Space><DashOutlined />虚线</Space>
            </Option>
            <Option value="dotted">
              <Space><SmallDashOutlined />点线</Space>
            </Option>
          </Select>
        </Form.Item>

        <Form.Item label="起点样式">
          <Select
            value={edge.startStyle}
            onChange={handleStartStyleChange}
            style={{ width: '100%' }}
          >
            <Option value="none">无</Option>
            <Option value="arrow">箭头</Option>
            <Option value="classic">经典箭头</Option>
            <Option value="diamond">菱形</Option>
            <Option value="circle">圆形</Option>
            <Option value="cross">十字</Option>
            <Option value="async">异步箭头</Option>
          </Select>
        </Form.Item>

        <Form.Item label="终点样式">
          <Select
            value={edge.endStyle}
            onChange={handleEndStyleChange}
            style={{ width: '100%' }}
          >
            <Option value="none">无</Option>
            <Option value="arrow">箭头</Option>
            <Option value="classic">经典箭头</Option>
            <Option value="diamond">菱形</Option>
            <Option value="circle">圆形</Option>
            <Option value="cross">十字</Option>
            <Option value="async">异步箭头</Option>
          </Select>
        </Form.Item>

        <Form.Item label="颜色">
          <ColorPicker
            value={edge.stroke}
            onChange={(_, hex) => handleEdgeColorChange(hex)}
            showText
            size="small"
          />
        </Form.Item>

        <Form.Item label="线宽">
          <InputNumber
            min={1}
            max={10}
            value={edge.strokeWidth}
            onChange={(v) => v && handleEdgeStrokeWidthChange(v)}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Divider style={{ margin: '12px 0' }} />

        <Form.Item label="标签">
          <Space direction="vertical" style={{ width: '100%' }}>
            {(edge.labels || []).map((label, index) => (
              <div key={label.id || index} style={{ width: '100%' }}>
                {editingLabelIndex === index ? (
                  <Space style={{ width: '100%' }}>
                    <Input
                      value={labelText}
                      onChange={(e) => setLabelText(e.target.value)}
                      size="small"
                      style={{ flex: 1 }}
                    />
                    <Button type="primary" size="small" onClick={handleSaveLabel}>
                      保存
                    </Button>
                  </Space>
                ) : (
                  <Space style={{ width: '100%' }}>
                    <span
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        background: '#f5f5f5',
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      {label.text}
                    </span>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => handleEditLabel(index)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleDeleteLabel(index)}
                    />
                  </Space>
                )}
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#999' }}>位置:</span>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={label.position}
                    onChange={(value) => handleLabelPositionChange(index, value)}
                    style={{ margin: '4px 0' }}
                  />
                </div>
              </div>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              size="small"
              style={{ width: '100%' }}
              onClick={handleAddLabel}
            >
              添加标签
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default EdgePropertyPanel
