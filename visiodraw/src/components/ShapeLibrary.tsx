import React, { useState } from 'react'
import { Collapse, Tabs, Tooltip } from 'antd'
import StencilBrowser from './StencilBrowser'
import { createDragData } from '../types/dragDrop'

// 基础图形
const basicShapes = [
  {
    type: 'rectangle',
    name: '矩形',
    icon: (
      <svg viewBox="0 0 40 40">
        <rect x="5" y="10" width="30" height="20" fill="#fff" stroke="#333" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 100, height: 60, fill: '#ffffff', stroke: '#333333' },
  },
  {
    type: 'rounded-rectangle',
    name: '圆角矩形',
    icon: (
      <svg viewBox="0 0 40 40">
        <rect x="5" y="10" width="30" height="20" rx="5" fill="#fff" stroke="#333" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 100, height: 60, rx: 10, ry: 10, fill: '#ffffff', stroke: '#333333' },
  },
  {
    type: 'circle',
    name: '圆形',
    icon: (
      <svg viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="12" fill="#fff" stroke="#333" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { radius: 40, fill: '#ffffff', stroke: '#333333' },
  },
  {
    type: 'ellipse',
    name: '椭圆',
    icon: (
      <svg viewBox="0 0 40 40">
        <ellipse cx="20" cy="20" rx="15" ry="10" fill="#fff" stroke="#333" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { rx: 60, ry: 40, fill: '#ffffff', stroke: '#333333' },
  },
  {
    type: 'triangle',
    name: '三角形',
    icon: (
      <svg viewBox="0 0 40 40">
        <polygon points="20,5 35,35 5,35" fill="#fff" stroke="#333" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 80, height: 70, fill: '#ffffff', stroke: '#333333' },
  },
  {
    type: 'diamond',
    name: '菱形',
    icon: (
      <svg viewBox="0 0 40 40">
        <polygon points="20,5 35,20 20,35 5,20" fill="#fff" stroke="#333" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 80, height: 80, fill: '#ffffff', stroke: '#333333' },
  },
]

// 流程图图形
const flowchartShapes = [
  {
    type: 'process',
    name: '流程',
    icon: (
      <svg viewBox="0 0 40 40">
        <rect x="5" y="10" width="30" height="20" fill="#e6f7ff" stroke="#1890ff" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 120, height: 60, fill: '#e6f7ff', stroke: '#1890ff' },
  },
  {
    type: 'decision',
    name: '判断',
    icon: (
      <svg viewBox="0 0 40 40">
        <polygon points="20,5 35,20 20,35 5,20" fill="#fff7e6" stroke="#fa8c16" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 100, height: 80, fill: '#fff7e6', stroke: '#fa8c16' },
  },
  {
    type: 'start-end',
    name: '开始/结束',
    icon: (
      <svg viewBox="0 0 40 40">
        <ellipse cx="20" cy="20" rx="15" ry="10" fill="#f6ffed" stroke="#52c41a" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { rx: 60, ry: 30, fill: '#f6ffed', stroke: '#52c41a' },
  },
  {
    type: 'input-output',
    name: '输入/输出',
    icon: (
      <svg viewBox="0 0 40 40">
        <polygon points="10,10 35,10 30,30 5,30" fill="#f9f0ff" stroke="#722ed1" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 120, height: 60, fill: '#f9f0ff', stroke: '#722ed1' },
  },
  {
    type: 'document',
    name: '文档',
    icon: (
      <svg viewBox="0 0 40 40">
        <path d="M10,5 L25,5 L30,10 L30,35 L10,35 Z" fill="#fff2f0" stroke="#f5222d" strokeWidth="2" />
        <path d="M25,5 L25,10 L30,10" fill="none" stroke="#f5222d" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 100, height: 80, fill: '#fff2f0', stroke: '#f5222d' },
  },
  {
    type: 'database',
    name: '数据库',
    icon: (
      <svg viewBox="0 0 40 40">
        <ellipse cx="20" cy="10" rx="12" ry="5" fill="#e6fffb" stroke="#13c2c2" strokeWidth="2" />
        <path d="M8,10 L8,30 Q20,35 32,30 L32,10" fill="#e6fffb" stroke="#13c2c2" strokeWidth="2" />
        <path d="M8,20 Q20,25 32,20" fill="none" stroke="#13c2c2" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 100, height: 100, fill: '#e6fffb', stroke: '#13c2c2' },
  },
]

// 连接线
const connectorShapes = [
  {
    type: 'line',
    name: '直线',
    icon: (
      <svg viewBox="0 0 40 40">
        <line x1="5" y1="20" x2="35" y2="20" stroke="#333" strokeWidth="2" />
      </svg>
    ),
    defaultProps: { width: 100, height: 2, fill: 'transparent', stroke: '#333333', strokeWidth: 2 },
  },
  {
    type: 'arrow',
    name: '箭头',
    icon: (
      <svg viewBox="0 0 40 40">
        <line x1="5" y1="20" x2="30" y2="20" stroke="#333" strokeWidth="2" />
        <polygon points="30,15 35,20 30,25" fill="#333" />
      </svg>
    ),
    defaultProps: { width: 100, height: 2, fill: 'transparent', stroke: '#333333', strokeWidth: 2, arrow: true },
  },
  {
    type: 'double-arrow',
    name: '双向箭头',
    icon: (
      <svg viewBox="0 0 40 40">
        <polygon points="10,15 5,20 10,25" fill="#333" />
        <line x1="10" y1="20" x2="30" y2="20" stroke="#333" strokeWidth="2" />
        <polygon points="30,15 35,20 30,25" fill="#333" />
      </svg>
    ),
    defaultProps: { width: 100, height: 2, fill: 'transparent', stroke: '#333333', strokeWidth: 2, doubleArrow: true },
  },
]

// 图形项组件
interface ShapeItemProps {
  shape: {
    type: string
    name: string
    icon: React.ReactNode
    defaultProps: Record<string, unknown>
  }
}

const ShapeItem: React.FC<ShapeItemProps> = ({ shape }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)

    const dragData = createDragData('shape', {
      shapeType: shape.type,
      name: shape.name,
      defaultProps: shape.defaultProps,
      width: (shape.defaultProps.width as number) || 100,
      height: (shape.defaultProps.height as number) || 60,
    })

    e.dataTransfer.setData('application/x-visiodraw-shape', JSON.stringify(dragData))
    e.dataTransfer.effectAllowed = 'copy'

    // 创建拖拽预览
    const dragPreview = document.createElement('div')
    dragPreview.style.width = '60px'
    dragPreview.style.height = '60px'
    dragPreview.style.background = 'rgba(24, 144, 255, 0.2)'
    dragPreview.style.border = '2px solid #1890ff'
    dragPreview.style.borderRadius = '4px'
    dragPreview.style.display = 'flex'
    dragPreview.style.alignItems = 'center'
    dragPreview.style.justifyContent = 'center'
    dragPreview.style.position = 'fixed'
    dragPreview.style.top = '-100px'
    dragPreview.innerHTML = `<span style="font-size: 10px; color: #1890ff;">${shape.name.slice(0, 4)}</span>`
    document.body.appendChild(dragPreview)

    e.dataTransfer.setDragImage(dragPreview, 30, 30)

    // 清理预览元素
    setTimeout(() => {
      document.body.removeChild(dragPreview)
    }, 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <Tooltip title={`拖拽或点击添加"${shape.name}"`} placement="right">
      <div
        className={`shape-item ${isDragging ? 'dragging' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {shape.icon}
        <span>{shape.name}</span>
      </div>
    </Tooltip>
  )
}

const ShapeLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('shapes')

  const renderShapeGrid = (shapes: typeof basicShapes) => (
    <div className="shape-library">
      {shapes.map((shape) => (
        <ShapeItem key={shape.type} shape={shape} />
      ))}
    </div>
  )

  const renderBasicShapes = () => (
    <Collapse
      defaultActiveKey={['basic', 'flowchart']}
      bordered={false}
      items={[
        {
          key: 'basic',
          label: '基础图形',
          children: renderShapeGrid(basicShapes),
        },
        {
          key: 'flowchart',
          label: '流程图',
          children: renderShapeGrid(flowchartShapes),
        },
        {
          key: 'connector',
          label: '连接线',
          children: renderShapeGrid(connectorShapes),
        },
      ]}
    />
  )

  const tabItems = [
    {
      key: 'shapes',
      label: '基础图形',
      children: renderBasicShapes(),
    },
    {
      key: 'stencils',
      label: 'Visio模具',
      children: <StencilBrowser visible={activeTab === 'stencils'} />,
    },
  ]

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      size="small"
      style={{ height: '100%' }}
      items={tabItems}
    />
  )
}

export default ShapeLibrary
