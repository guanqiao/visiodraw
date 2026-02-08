import React, { useState } from 'react'
import { Card, Tabs, Input, Space, Tooltip } from 'antd'
import {
  BorderOutlined,
  Loading3QuartersOutlined,
  WarningOutlined,
  GatewayOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  LaptopOutlined,
  GlobalOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { setDragData } from '../types/dragDrop'

const { TabPane } = Tabs
const { Search } = Input

interface ShapeItem {
  id: string
  name: string
  type: string
  icon: React.ReactNode
  width: number
  height: number
  defaultProps?: Record<string, unknown>
}

const basicShapes: ShapeItem[] = [
  {
    id: 'rectangle',
    name: '矩形',
    type: 'rectangle',
    icon: <BorderOutlined style={{ fontSize: 24 }} />,
    width: 100,
    height: 60,
  },
  {
    id: 'circle',
    name: '圆形',
    type: 'circle',
    icon: <Loading3QuartersOutlined style={{ fontSize: 24, transform: 'rotate(45deg)' }} />,
    width: 80,
    height: 80,
  },
  {
    id: 'triangle',
    name: '三角形',
    type: 'triangle',
    icon: <WarningOutlined style={{ fontSize: 24 }} />,
    width: 80,
    height: 70,
  },
  {
    id: 'diamond',
    name: '菱形',
    type: 'diamond',
    icon: <GatewayOutlined style={{ fontSize: 24 }} />,
    width: 80,
    height: 80,
  },
]

const flowchartShapes: ShapeItem[] = [
  {
    id: 'start-end',
    name: '开始/结束',
    type: 'start-end',
    icon: <div style={{ width: 40, height: 24, borderRadius: 12, border: '2px solid #333' }} />,
    width: 100,
    height: 50,
    defaultProps: { fill: '#e6f7ff', stroke: '#1890ff' },
  },
  {
    id: 'process',
    name: '处理',
    type: 'process',
    icon: <div style={{ width: 40, height: 24, border: '2px solid #333' }} />,
    width: 100,
    height: 60,
    defaultProps: { fill: '#f6ffed', stroke: '#52c41a' },
  },
  {
    id: 'decision',
    name: '判断',
    type: 'decision',
    icon: <GatewayOutlined style={{ fontSize: 24 }} />,
    width: 100,
    height: 80,
    defaultProps: { fill: '#fff7e6', stroke: '#fa8c16' },
  },
  {
    id: 'input-output',
    name: '输入/输出',
    type: 'input-output',
    icon: <div style={{ width: 40, height: 24, border: '2px solid #333', transform: 'skewX(-20deg)' }} />,
    width: 100,
    height: 60,
    defaultProps: { fill: '#f9f0ff', stroke: '#722ed1' },
  },
  {
    id: 'document',
    name: '文档',
    type: 'document',
    icon: <FileTextOutlined style={{ fontSize: 24 }} />,
    width: 80,
    height: 100,
    defaultProps: { fill: '#fff1f0', stroke: '#f5222d' },
  },
  {
    id: 'database',
    name: '数据库',
    type: 'database',
    icon: <DatabaseOutlined style={{ fontSize: 24 }} />,
    width: 80,
    height: 100,
    defaultProps: { fill: '#e6fffb', stroke: '#13c2c2' },
  },
]

const deviceShapes: ShapeItem[] = [
  {
    id: 'desktop',
    name: '台式机',
    type: 'rectangle',
    icon: <DesktopOutlined style={{ fontSize: 24 }} />,
    width: 80,
    height: 80,
    defaultProps: { fill: '#f0f5ff', stroke: '#2f54eb' },
  },
  {
    id: 'laptop',
    name: '笔记本',
    type: 'rectangle',
    icon: <LaptopOutlined style={{ fontSize: 24 }} />,
    width: 100,
    height: 60,
    defaultProps: { fill: '#f0f5ff', stroke: '#2f54eb' },
  },
  {
    id: 'server',
    name: '服务器',
    type: 'rectangle',
    icon: <DatabaseOutlined style={{ fontSize: 24 }} />,
    width: 60,
    height: 100,
    defaultProps: { fill: '#fff2e8', stroke: '#fa541c' },
  },
  {
    id: 'cloud',
    name: '云',
    type: 'cloud',
    icon: <GlobalOutlined style={{ fontSize: 24 }} />,
    width: 100,
    height: 60,
    defaultProps: { fill: '#e6f7ff', stroke: '#1890ff' },
  },
]

const ShapeLibrary: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('basic')

  const handleDragStart = (e: React.DragEvent, shape: ShapeItem) => {
    setDragData(e.dataTransfer, {
      type: 'shape',
      shapeType: shape.type,
      name: shape.name,
      width: shape.width,
      height: shape.height,
      defaultProps: shape.defaultProps,
    })
  }

  const filterShapes = (shapes: ShapeItem[]) => {
    if (!searchText) return shapes
    return shapes.filter((shape) =>
      shape.name.toLowerCase().includes(searchText.toLowerCase())
    )
  }

  const renderShapeGrid = (shapes: ShapeItem[]) => {
    const filtered = filterShapes(shapes)
    if (filtered.length === 0) {
      return <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>无匹配图形</div>
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          padding: 12,
        }}
      >
        {filtered.map((shape) => (
          <Tooltip key={shape.id} title={shape.name} placement="bottom">
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, shape)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                cursor: 'grab',
                background: '#fff',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1890ff'
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(24, 144, 255, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {shape.icon}
              <span style={{ marginTop: 8, fontSize: 12, textAlign: 'center' }}>
                {shape.name}
              </span>
            </div>
          </Tooltip>
        ))}
      </div>
    )
  }

  return (
    <Card
      title="图形库"
      size="small"
      style={{ width: 280, height: '100%' }}
      bodyStyle={{ padding: 0, height: 'calc(100% - 40px)', overflow: 'auto' }}
    >
      <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
        <Search
          placeholder="搜索图形"
          allowClear
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
        />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        style={{ margin: 0 }}
        tabBarStyle={{ margin: 0, padding: '0 12px' }}
      >
        <TabPane tab="基础" key="basic">
          {renderShapeGrid(basicShapes)}
        </TabPane>
        <TabPane tab="流程图" key="flowchart">
          {renderShapeGrid(flowchartShapes)}
        </TabPane>
        <TabPane tab="设备" key="devices">
          {renderShapeGrid(deviceShapes)}
        </TabPane>
      </Tabs>
    </Card>
  )
}

export default ShapeLibrary
