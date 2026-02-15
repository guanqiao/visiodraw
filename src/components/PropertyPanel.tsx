import React, { useState, useMemo, useCallback } from 'react'
import { Card, Form, InputNumber, Input, ColorPicker, Space, Button, Divider, Select, Slider, Tabs, Typography } from 'antd'
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  LineOutlined,
  NodeIndexOutlined,
  DeleteOutlined,
  BorderOutlined,
  MinusOutlined,
  DashOutlined,
  SmallDashOutlined,
  ArrowRightOutlined,
  DotChartOutlined,
  CiCircleOutlined,
  PlusSquareOutlined,
  PlusOutlined,
  EditOutlined,
  FontSizeOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import useX6GraphStore from '@stores/x6GraphStore'
import type { ConnectorStyle, ConnectorEndStyle, LineStyle, ConnectorLabel, UMLRelationType, ERRelationType } from '../types/connection'
import { ConnectorRenderer } from '@utils/connectorRenderer'
import { umlRelations, erRelations } from '../types/connection'
import { v4 as uuidv4 } from 'uuid'
import ErTableEditor, { type ErTableColumn } from './ErTableEditor'

const { Option } = Select

const ER_TABLE_TYPES = ['er-table-entity', 'er-table-entity-with-columns']

const PropertyPanel: React.FC = () => {
  const {
    selectedNodeIds,
    selectedEdgeId,
    nodes,
    edges,
    updateNode,
    updateEdge,
    deleteEdge,
    alignNodes,
    distributeNodes,
    graph,
  } = useX6GraphStore()

  const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id))
  const hasNodeSelection = selectedNodes.length > 0
  const hasMultipleNodeSelection = selectedNodes.length > 1
  const singleNode = selectedNodes.length === 1 ? selectedNodes[0] : null

  const selectedEdge = edges.find((e) => e.id === selectedEdgeId)
  const hasEdgeSelection = !!selectedEdge

  const [editingLabelIndex, setEditingLabelIndex] = useState<number | null>(null)
  const [labelText, setLabelText] = useState('')

  const isErTableEntity = singleNode && ER_TABLE_TYPES.includes(singleNode.type)

  const parseTextToColumns = useCallback((text: string): { tableName: string; columns: ErTableColumn[] } => {
    const lines = text.split('\n').filter((l) => l.trim())
    if (lines.length === 0) {
      return { tableName: 'untitled', columns: [] }
    }
    
    const tableName = lines[0].trim()
    const columns: ErTableColumn[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const constraintMatch = line.match(/^(.+?)\s*\[(.+)\]\s*$/)
      
      if (constraintMatch) {
        const colName = constraintMatch[1].trim().split(/\s+/)[0]
        const typePart = constraintMatch[1].trim().split(/\s+/).slice(1).join(' ') || 'varchar'
        const constraintStr = constraintMatch[2]
        
        const constraints: string[] = []
        if (constraintStr.includes('pk')) constraints.push('pk')
        if (constraintStr.includes('fk')) constraints.push('fk')
        if (constraintStr.includes('unique')) constraints.push('unique')
        if (constraintStr.includes('notnull')) constraints.push('notnull')
        if (constraintStr.includes('auto')) constraints.push('auto')
        if (constraintStr.includes('index')) constraints.push('index')
        
        const column: ErTableColumn = { 
          id: uuidv4(), 
          name: colName, 
          type: typePart, 
          constraints: constraints as any,
          defaultValue: undefined,
          comment: undefined,
        }
        columns.push(column)
      } else {
        const parts = line.split(/\s+/)
        const colName = parts[0]
        const type = parts[1] || 'varchar'
        
        columns.push({ 
          id: uuidv4(), 
          name: colName, 
          type, 
          constraints: [],
          defaultValue: undefined,
          comment: undefined,
        })
      }
    }
    
    return { tableName, columns }
  }, [])

  const columnsToText = useCallback((tableName: string, columns: ErTableColumn[]): string => {
    const lines = [tableName]
    columns.forEach((col) => {
      const constraints = col.constraints.length > 0 ? ` [${col.constraints.join(',')}]` : ''
      lines.push(`${col.name}\t${col.type}${constraints}`)
    })
    return lines.join('\n')
  }, [])

  const erTableData = useMemo(() => {
    if (!isErTableEntity || !singleNode?.text) {
      return { tableName: 'untitled', columns: [] }
    }
    return parseTextToColumns(singleNode.text)
  }, [isErTableEntity, singleNode?.text, parseTextToColumns])

  const handleErTableChange = useCallback((tableName: string, columns: ErTableColumn[]) => {
    if (!singleNode) return
    const newText = columnsToText(tableName, columns)
    updateNode(singleNode.id, { text: newText })
    
    const newHeight = Math.max(100, 50 + columns.length * 28)
    if (singleNode.height !== newHeight) {
      updateNode(singleNode.id, { height: newHeight })
    }
    
    if (graph) {
      const x6Node = graph.getCellById(singleNode.id)
      if (x6Node) {
        x6Node.attr('label/text', '')
        
        const headerHeight = 28
        const rowHeight = 28
        
        const shapes: any[] = []
        
        shapes.push({
          type: 'rect',
          attrs: {
            x: 0,
            y: 0,
            width: singleNode.width,
            height: headerHeight,
            fill: '#1890ff',
            stroke: 'none',
          },
        })
        
        shapes.push({
          type: 'text',
          attrs: {
            x: singleNode.width / 2,
            y: headerHeight / 2 + 1,
            text: tableName,
            fill: '#ffffff',
            fontSize: 13,
            fontWeight: 'bold',
            textAnchor: 'middle',
            dominantBaseline: 'middle',
          },
        })
        
        columns.forEach((col, index) => {
          const y = headerHeight + index * rowHeight
          
          if (index % 2 === 0) {
            shapes.push({
              type: 'rect',
              attrs: {
                x: 0,
                y: y,
                width: singleNode.width,
                height: rowHeight,
                fill: '#fafafa',
                stroke: 'none',
              },
            })
          }
          
          const isPk = col.constraints.includes('pk')
          const isFk = col.constraints.includes('fk')
          const textColor = isPk ? '#1890ff' : isFk ? '#722ed1' : '#333333'
          const fontWeight = isPk ? 'bold' : 'normal'
          
          shapes.push({
            type: 'text',
            attrs: {
              x: 8,
              y: y + rowHeight / 2,
              text: col.name,
              fill: textColor,
              fontSize: 11,
              fontWeight: fontWeight,
              textAnchor: 'start',
              dominantBaseline: 'middle',
              textDecoration: isPk ? 'underline' : 'none',
            },
          })
          
          shapes.push({
            type: 'text',
            attrs: {
              x: singleNode.width - 8,
              y: y + rowHeight / 2,
              text: col.type.toUpperCase(),
              fill: '#666666',
              fontSize: 10,
              fontWeight: 'normal',
              textAnchor: 'end',
              dominantBaseline: 'middle',
            },
          })
          
          const constraintIcons: string[] = []
          if (col.constraints.includes('pk')) constraintIcons.push('🔑')
          if (col.constraints.includes('fk')) constraintIcons.push('🔗')
          if (col.constraints.includes('auto')) constraintIcons.push('⚡')
          if (col.constraints.includes('unique')) constraintIcons.push('🔷')
          if (col.constraints.includes('notnull')) constraintIcons.push('✦')
          
          if (constraintIcons.length > 0) {
            shapes.push({
              type: 'text',
              attrs: {
                x: singleNode.width / 2,
                y: y + rowHeight / 2,
                text: constraintIcons.join(''),
                fill: '#333333',
                fontSize: 9,
                textAnchor: 'middle',
                dominantBaseline: 'middle',
              },
            })
          }
        })
        
        x6Node.prop('shapes', shapes)
      }
    }
  }, [singleNode, updateNode, graph, columnsToText])

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

  // Handle text change for node
  const handleNodeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!singleNode) return
    const newText = e.target.value
    updateNode(singleNode.id, { text: newText })
    // Sync to X6
    if (graph) {
      const x6Node = graph.getCellById(singleNode.id)
      if (x6Node) {
        x6Node.attr('label/text', newText)
      }
    }
  }

  // Handle font size change for node
  const handleNodeFontSizeChange = (value: number | null) => {
    if (value === null || !singleNode) return
    updateNode(singleNode.id, { fontSize: value })
    if (graph) {
      const x6Node = graph.getCellById(singleNode.id)
      if (x6Node) {
        x6Node.attr('label/fontSize', value)
      }
    }
  }

  // Handle text color change for node
  const handleNodeTextColorChange = (color: string) => {
    if (!singleNode) return
    updateNode(singleNode.id, { fontColor: color })
    if (graph) {
      const x6Node = graph.getCellById(singleNode.id)
      if (x6Node) {
        x6Node.attr('label/fill', color)
      }
    }
  }

  // Edge property handlers
  const handleEdgeStyleChange = (style: ConnectorStyle) => {
    if (!selectedEdge) return
    updateEdge(selectedEdge.id, { style })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeStyle(x6Edge as any, style)
      }
    }
  }

  const handleEdgeLineStyleChange = (lineStyle: LineStyle) => {
    if (!selectedEdge) return
    updateEdge(selectedEdge.id, { lineStyle })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeAppearance(x6Edge as any, { lineStyle })
      }
    }
  }

  const handleEdgeStartStyleChange = (startStyle: ConnectorEndStyle) => {
    if (!selectedEdge) return
    updateEdge(selectedEdge.id, { startStyle })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeMarkers(x6Edge as any, startStyle, selectedEdge.endStyle)
      }
    }
  }

  const handleEdgeEndStyleChange = (endStyle: ConnectorEndStyle) => {
    if (!selectedEdge) return
    updateEdge(selectedEdge.id, { endStyle })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeMarkers(x6Edge as any, selectedEdge.startStyle, endStyle)
      }
    }
  }

  // UML 关系处理
  const handleUMLRelationChange = (relationType: UMLRelationType) => {
    if (!selectedEdge) return
    const config = umlRelations[relationType]
    updateEdge(selectedEdge.id, {
      lineStyle: config.lineStyle,
      startStyle: config.startStyle,
      endStyle: config.endStyle,
      stroke: config.stroke,
    })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeMarkers(x6Edge as any, config.startStyle, config.endStyle)
        ConnectorRenderer.updateEdgeAppearance(x6Edge as any, {
          lineStyle: config.lineStyle,
          stroke: config.stroke,
        })
      }
    }
  }

  const handleEdgeColorChange = (color: string) => {
    if (!selectedEdge) return
    updateEdge(selectedEdge.id, { stroke: color })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeAppearance(x6Edge as any, { stroke: color })
      }
    }
  }

  const handleEdgeStrokeWidthChange = (strokeWidth: number) => {
    if (!selectedEdge) return
    updateEdge(selectedEdge.id, { strokeWidth })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeAppearance(x6Edge as any, { strokeWidth })
      }
    }
  }

  const handleDeleteEdge = () => {
    if (!selectedEdge) return
    deleteEdge(selectedEdge.id)
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge) {
        graph.removeCell(x6Edge)
      }
    }
  }

  // Edge label handlers
  const handleAddLabel = () => {
    if (!selectedEdge) return
    const newLabel: ConnectorLabel = {
      id: uuidv4(),
      text: '新标签',
      position: 0.5,
      fontSize: 12,
      color: '#333333',
    }
    const updatedLabels = [...(selectedEdge.labels || []), newLabel]
    updateEdge(selectedEdge.id, { labels: updatedLabels })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeLabel(x6Edge as any, newLabel, updatedLabels.length - 1)
      }
    }
  }

  const handleEditLabel = (index: number) => {
    if (!selectedEdge || !selectedEdge.labels) return
    setEditingLabelIndex(index)
    setLabelText(selectedEdge.labels[index].text)
  }

  const handleSaveLabel = () => {
    if (!selectedEdge || editingLabelIndex === null) return
    const updatedLabels = [...(selectedEdge.labels || [])]
    updatedLabels[editingLabelIndex] = {
      ...updatedLabels[editingLabelIndex],
      text: labelText,
    }
    updateEdge(selectedEdge.id, { labels: updatedLabels })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeLabel(x6Edge as any, updatedLabels[editingLabelIndex], editingLabelIndex)
      }
    }
    setEditingLabelIndex(null)
    setLabelText('')
  }

  const handleDeleteLabel = (index: number) => {
    if (!selectedEdge) return
    const updatedLabels = (selectedEdge.labels || []).filter((_, i) => i !== index)
    updateEdge(selectedEdge.id, { labels: updatedLabels })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.removeEdgeLabel(x6Edge as any, index)
      }
    }
  }

  const handleLabelPositionChange = (index: number, position: number) => {
    if (!selectedEdge || !selectedEdge.labels) return
    const updatedLabels = [...selectedEdge.labels]
    updatedLabels[index] = { ...updatedLabels[index], position }
    updateEdge(selectedEdge.id, { labels: updatedLabels })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeLabel(x6Edge as any, updatedLabels[index], index)
      }
    }
  }

  // ER 关系处理
  const handleERRelationChange = (relationType: ERRelationType) => {
    if (!selectedEdge) return
    const config = erRelations[relationType]
    updateEdge(selectedEdge.id, {
      lineStyle: config.lineStyle,
      startStyle: config.startStyle,
      endStyle: config.endStyle,
      stroke: config.stroke,
      strokeWidth: config.strokeWidth,
    })
    if (graph) {
      const x6Edge = graph.getCellById(selectedEdge.id)
      if (x6Edge && x6Edge.isEdge()) {
        ConnectorRenderer.updateEdgeMarkers(x6Edge as any, config.startStyle, config.endStyle)
        ConnectorRenderer.updateEdgeAppearance(x6Edge as any, {
          lineStyle: config.lineStyle,
          stroke: config.stroke,
          strokeWidth: config.strokeWidth,
        })
      }
    }
  }

  // No selection
  if (!hasNodeSelection && !hasEdgeSelection) {
    return (
      <Card title="属性" size="small">
        <div style={{ color: '#999', textAlign: 'center', padding: '20px 0' }}>
          选择一个图形或连接线以编辑属性
        </div>
      </Card>
    )
  }

  // Edge property panel
  if (hasEdgeSelection && !hasNodeSelection) {
    return (
      <Card
        title="连接线属性"
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
          {/* UML 关系类型 */}
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

          {/* ER 关系类型 */}
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

          {/* 连线样式 */}
          <Form.Item label="连线样式">
            <Select
              value={selectedEdge.style}
              onChange={handleEdgeStyleChange}
              style={{ width: '100%' }}
            >
              <Option value="straight">
                <Space>
                  <LineOutlined />
                  直线
                </Space>
              </Option>
              <Option value="orthogonal">
                <Space>
                  <NodeIndexOutlined />
                  正交线
                </Space>
              </Option>
              <Option value="curved">
                <Space>
                  <MinusOutlined rotate={45} />
                  曲线
                </Space>
              </Option>
              <Option value="bezier">
                <Space>
                  <MinusOutlined rotate={-45} />
                  贝塞尔曲线
                </Space>
              </Option>
              <Option value="metro">
                <Space>
                  <BorderOutlined />
                  地铁线
                </Space>
              </Option>
              <Option value="manhattan">
                <Space>
                  <NodeIndexOutlined rotate={90} />
                  曼哈顿线
                </Space>
              </Option>
            </Select>
          </Form.Item>

          {/* 线型 */}
          <Form.Item label="线型">
            <Select
              value={selectedEdge.lineStyle}
              onChange={handleEdgeLineStyleChange}
              style={{ width: '100%' }}
            >
              <Option value="solid">
                <Space>
                  <LineOutlined />
                  实线
                </Space>
              </Option>
              <Option value="dashed">
                <Space>
                  <DashOutlined />
                  虚线
                </Space>
              </Option>
              <Option value="dotted">
                <Space>
                  <SmallDashOutlined />
                  点线
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          {/* 起点箭头 */}
          <Form.Item label="起点箭头">
            <Select
              value={selectedEdge.startStyle}
              onChange={handleEdgeStartStyleChange}
              style={{ width: '100%' }}
            >
              <Option value="none">
                <Space>
                  <MinusOutlined />
                  无
                </Space>
              </Option>
              <Option value="arrow">
                <Space>
                  <ArrowRightOutlined rotate={180} />
                  箭头
                </Space>
              </Option>
              <Option value="dot">
                <Space>
                  <DotChartOutlined />
                  圆点
                </Space>
              </Option>
              <Option value="diamond">
                <Space>
                  <PlusSquareOutlined rotate={45} />
                  菱形
                </Space>
              </Option>
              <Option value="circle">
                <Space>
                  <CiCircleOutlined />
                  圆形
                </Space>
              </Option>
            </Select>
          </Form.Item>

          {/* 终点箭头 */}
          <Form.Item label="终点箭头">
            <Select
              value={selectedEdge.endStyle}
              onChange={handleEdgeEndStyleChange}
              style={{ width: '100%' }}
            >
              <Option value="none">
                <Space>
                  <MinusOutlined />
                  无
                </Space>
              </Option>
              <Option value="arrow">
                <Space>
                  <ArrowRightOutlined />
                  箭头
                </Space>
              </Option>
              <Option value="dot">
                <Space>
                  <DotChartOutlined />
                  圆点
                </Space>
              </Option>
              <Option value="diamond">
                <Space>
                  <PlusSquareOutlined rotate={45} />
                  菱形
                </Space>
              </Option>
              <Option value="circle">
                <Space>
                  <CiCircleOutlined />
                  圆形
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          {/* 线条颜色 */}
          <Form.Item label="线条颜色">
            <ColorPicker
              value={selectedEdge.stroke}
              onChange={(color) => handleEdgeColorChange(color.toHexString())}
              showText
            />
          </Form.Item>

          {/* 线条宽度 */}
          <Form.Item label="线条宽度">
            <InputNumber
              min={1}
              max={10}
              value={selectedEdge.strokeWidth}
              onChange={(value) => handleEdgeStrokeWidthChange(value || 2)}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          {/* 标签编辑 */}
          <Form.Item label="标签">
            <Space direction="vertical" style={{ width: '100%' }}>
              {selectedEdge.labels?.map((label, index) => (
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

  const renderErTablePanel = () => {
    if (!isErTableEntity) return null
    
    return (
      <Tabs
        defaultActiveKey="editor"
        size="small"
        items={[
          {
            key: 'editor',
            label: (
              <Space size={4}>
                <DatabaseOutlined />
                表格编辑
              </Space>
            ),
            children: (
              <ErTableEditor
                tableName={erTableData.tableName}
                columns={erTableData.columns}
                onChange={handleErTableChange}
              />
            ),
          },
          {
            key: 'style',
            label: (
              <Space size={4}>
                <SettingOutlined />
                样式
              </Space>
            ),
            children: (
              <Form layout="vertical" size="small">
                <Form.Item label="位置">
                  <Space>
                    <InputNumber
                      addonBefore="X"
                      value={singleNode?.x}
                      onChange={(v) => handlePositionChange('x', v)}
                      style={{ width: 100 }}
                    />
                    <InputNumber
                      addonBefore="Y"
                      value={singleNode?.y}
                      onChange={(v) => handlePositionChange('y', v)}
                      style={{ width: 100 }}
                    />
                  </Space>
                </Form.Item>
                <Form.Item label="尺寸">
                  <Space>
                    <InputNumber
                      addonBefore="W"
                      value={singleNode?.width}
                      onChange={(v) => handleSizeChange('width', v)}
                      style={{ width: 100 }}
                    />
                    <InputNumber
                      addonBefore="H"
                      value={singleNode?.height}
                      onChange={(v) => handleSizeChange('height', v)}
                      style={{ width: 100 }}
                    />
                  </Space>
                </Form.Item>
                <Form.Item label="填充颜色">
                  <ColorPicker
                    value={singleNode?.fill}
                    onChange={(color) => handleFillChange(color.toHexString())}
                    showText
                  />
                </Form.Item>
                <Form.Item label="描边颜色">
                  <ColorPicker
                    value={singleNode?.stroke}
                    onChange={(color) => handleStrokeChange(color.toHexString())}
                    showText
                  />
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    )
  }

  // Node property panel
  return (
    <Card title="图形属性" size="small">
      {isErTableEntity ? (
        renderErTablePanel()
      ) : (
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

          <Divider style={{ margin: '12px 0' }} />

          {/* Text */}
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
          {hasMultipleNodeSelection && (
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
      )}
    </Card>
  )
}

export default PropertyPanel
