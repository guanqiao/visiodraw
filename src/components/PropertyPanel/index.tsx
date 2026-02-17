import React, { useState, useMemo, useCallback } from 'react'
import { Card, Tabs, Space, Form, InputNumber, ColorPicker, Button, Divider } from 'antd'
import {
  DatabaseOutlined,
  SettingOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons'
import useX6GraphStore from '@stores/x6GraphStore'
import ErTableEditor, { type ErTableColumn } from '../ErTableEditor'
import { EdgePropertyPanel } from './EdgePropertyPanel'
import { NodePropertyPanel } from './NodePropertyPanel'
import { v4 as uuidv4 } from 'uuid'

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
    graph,
  } = useX6GraphStore()

  const selectedNodes = useMemo(() => 
    nodes.filter((n) => selectedNodeIds.includes(n.id)),
    [nodes, selectedNodeIds]
  )
  const hasNodeSelection = selectedNodes.length > 0
  const hasMultipleNodeSelection = selectedNodes.length > 1
  const singleNode = selectedNodes.length === 1 ? selectedNodes[0] : null

  const selectedEdge = useMemo(() => 
    edges.find((e) => e.id === selectedEdgeId),
    [edges, selectedEdgeId]
  )
  const hasEdgeSelection = !!selectedEdge

  const [lockAspectRatio, setLockAspectRatio] = useState(true)

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
          constraints 
        }
        columns.push(column)
      } else {
        const parts = line.split(/\s+/)
        const colName = parts[0]
        const typePart = parts.slice(1).join(' ') || 'varchar'
        
        const column: ErTableColumn = { 
          id: uuidv4(), 
          name: colName, 
          type: typePart,
          constraints: [] 
        }
        columns.push(column)
      }
    }
    
    return { tableName, columns }
  }, [])

  const columnsToText = useCallback((tableName: string, columns: ErTableColumn[]): string => {
    const lines = [tableName]
    columns.forEach(col => {
      const constraintStr = col.constraints.length > 0 ? ` [${col.constraints.join(',')}]` : ''
      lines.push(`${col.name} ${col.type}${constraintStr}`)
    })
    return lines.join('\n')
  }, [])

  const erTableData = useMemo(() => {
    if (!isErTableEntity || !singleNode) {
      return { tableName: '', columns: [] }
    }
    return parseTextToColumns(singleNode.text || '')
  }, [isErTableEntity, singleNode, parseTextToColumns])

  const handleErTableChange = useCallback((tableName: string, columns: ErTableColumn[]) => {
    if (!singleNode || !graph) return
    
    const newText = columnsToText(tableName, columns)
    updateNode(singleNode.id, { text: newText })
    
    const x6Node = graph.getCellById(singleNode.id)
    if (x6Node && x6Node.isNode()) {
      const headerHeight = 32
      const rowHeight = 24
      const padding = 8
      
      let maxWidth = 120
      columns.forEach(col => {
        const nameWidth = col.name.length * 8
        const typeWidth = col.type.length * 7
        const totalWidth = nameWidth + typeWidth + 60
        if (totalWidth > maxWidth) maxWidth = totalWidth
      })
      
      const newHeight = headerHeight + columns.length * rowHeight + padding * 2
      const newWidth = Math.max(maxWidth + padding * 2, 150)
      
      updateNode(singleNode.id, { 
        width: newWidth, 
        height: newHeight,
        text: newText 
      })
      
      const shapes: any[] = []
      
      shapes.push({
        type: 'rect',
        attrs: {
          x: 0,
          y: 0,
          width: newWidth,
          height: headerHeight,
          fill: '#1890ff',
          stroke: 'none',
          rx: 4,
          ry: 4,
        },
      })
      
      shapes.push({
        type: 'text',
        attrs: {
          x: newWidth / 2,
          y: headerHeight / 2,
          text: tableName,
          fill: '#ffffff',
          fontSize: 12,
          fontWeight: 'bold',
          textAnchor: 'middle',
          dominantBaseline: 'middle',
        },
      })
      
      shapes.push({
        type: 'rect',
        attrs: {
          x: 0,
          y: headerHeight,
          width: newWidth,
          height: newHeight - headerHeight,
          fill: '#ffffff',
          stroke: '#e8e8e8',
          strokeWidth: 1,
        },
      })
      
      columns.forEach((col, index) => {
        const y = headerHeight + index * rowHeight
        
        if (index > 0) {
          shapes.push({
            type: 'line',
            attrs: {
              x1: 0,
              y1: y,
              x2: newWidth,
              y2: y,
              stroke: '#e8e8e8',
              strokeWidth: 1,
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
  }, [singleNode, updateNode, graph, columnsToText])

  const handleDeleteEdge = useCallback((id: string) => {
    deleteEdge(id)
  }, [deleteEdge])

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
  if (hasEdgeSelection && !hasNodeSelection && selectedEdge) {
    return (
      <EdgePropertyPanel
        edge={selectedEdge}
        onUpdateEdge={updateEdge}
        onDeleteEdge={handleDeleteEdge}
        graph={graph}
      />
    )
  }

  // ER Table panel
  if (isErTableEntity && singleNode) {
    return (
      <NodePropertyPanel
        selectedNodes={selectedNodes}
        singleNode={singleNode}
        hasMultipleNodeSelection={false}
        onUpdateNode={updateNode}
        onAlignNodes={alignNodes}
      >
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
                        onChange={(v) => v && updateNode(singleNode.id, { x: v })}
                        style={{ width: 100 }}
                      />
                      <InputNumber
                        addonBefore="Y"
                        value={singleNode?.y}
                        onChange={(v) => v && updateNode(singleNode.id, { y: v })}
                        style={{ width: 100 }}
                      />
                    </Space>
                  </Form.Item>
                  <Form.Item label="尺寸">
                    <Space>
                      <InputNumber
                        addonBefore="W"
                        value={singleNode?.width}
                        onChange={(v) => v && updateNode(singleNode.id, { width: v })}
                        style={{ width: 100 }}
                      />
                      <Button
                        type={lockAspectRatio ? 'primary' : 'default'}
                        icon={lockAspectRatio ? <LockOutlined /> : <UnlockOutlined />}
                        onClick={() => setLockAspectRatio(!lockAspectRatio)}
                        size="small"
                      />
                      <InputNumber
                        addonBefore="H"
                        value={singleNode?.height}
                        onChange={(v) => v && updateNode(singleNode.id, { height: v })}
                        style={{ width: 100 }}
                      />
                    </Space>
                  </Form.Item>
                  <Form.Item label="填充颜色">
                    <ColorPicker
                      value={singleNode?.fill}
                      onChange={(color) => updateNode(singleNode.id, { fill: color.toHexString() })}
                      showText
                    />
                  </Form.Item>
                  <Form.Item label="描边颜色">
                    <ColorPicker
                      value={singleNode?.stroke}
                      onChange={(color) => updateNode(singleNode.id, { stroke: color.toHexString() })}
                      showText
                    />
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </NodePropertyPanel>
    )
  }

  // Node property panel
  return (
    <NodePropertyPanel
      selectedNodes={selectedNodes}
      singleNode={singleNode}
      hasMultipleNodeSelection={hasMultipleNodeSelection}
      onUpdateNode={updateNode}
      onAlignNodes={alignNodes}
    />
  )
}

export default PropertyPanel
