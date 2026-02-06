/**
 * Visio模具浏览器组件
 * 用于浏览和使用Visio模具(VSSX)中的图形
 */

import React, { useState, useEffect } from 'react'
import { Card, Collapse, Empty, message, Upload, Button, Tabs, Tooltip } from 'antd'
import { UploadOutlined, AppstoreOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import {
  Stencil,
  StencilShape,
  getAllStencils,
  parseVssx,
  detectVisioStencilType,
} from '@utils/visioStencils'
import { createDragData } from '../types/dragDrop'

interface StencilBrowserProps {
  visible?: boolean
}

// 根据类别获取图标
const getIconByCategory = (category?: string, shapeName?: string): React.ReactNode => {
  const name = shapeName?.toLowerCase() || ''

  // 网络设备图标
  if (category === 'network' || name.includes('服务器') || name.includes('server')) {
    if (name.includes('服务器') || name.includes('server')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <rect x="8" y="5" width="24" height="30" rx="2" fill="#f0f5ff" stroke="#2f54eb" strokeWidth="1.5" />
          <circle cx="14" cy="12" r="2" fill="#2f54eb" />
          <rect x="18" y="10" width="10" height="4" rx="1" fill="#d6e4ff" />
          <circle cx="14" cy="20" r="2" fill="#2f54eb" />
          <rect x="18" y="18" width="10" height="4" rx="1" fill="#d6e4ff" />
          <circle cx="14" cy="28" r="2" fill="#2f54eb" />
          <rect x="18" y="26" width="10" height="4" rx="1" fill="#d6e4ff" />
        </svg>
      )
    }
    if (name.includes('路由器') || name.includes('router')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <circle cx="20" cy="25" r="10" fill="#fff7e6" stroke="#fa8c16" strokeWidth="1.5" />
          <circle cx="20" cy="25" r="4" fill="#fa8c16" />
          <line x1="20" y1="5" x2="20" y2="15" stroke="#fa8c16" strokeWidth="2" />
          <circle cx="20" cy="5" r="2" fill="#fa8c16" />
          <line x1="8" y1="12" x2="15" y2="18" stroke="#fa8c16" strokeWidth="2" />
          <circle cx="8" cy="12" r="2" fill="#fa8c16" />
          <line x1="32" y1="12" x2="25" y2="18" stroke="#fa8c16" strokeWidth="2" />
          <circle cx="32" cy="12" r="2" fill="#fa8c16" />
        </svg>
      )
    }
    if (name.includes('交换机') || name.includes('switch')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <rect x="5" y="12" width="30" height="16" rx="2" fill="#f6ffed" stroke="#52c41a" strokeWidth="1.5" />
          <circle cx="12" cy="20" r="2" fill="#52c41a" />
          <circle cx="20" cy="20" r="2" fill="#52c41a" />
          <circle cx="28" cy="20" r="2" fill="#52c41a" />
        </svg>
      )
    }
    if (name.includes('防火墙') || name.includes('firewall')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <path d="M20 5 L35 12 L35 28 L20 35 L5 28 L5 12 Z" fill="#fff1f0" stroke="#f5222d" strokeWidth="1.5" />
          <path d="M15 15 L25 25 M25 15 L15 25" stroke="#f5222d" strokeWidth="2" />
        </svg>
      )
    }
    if (name.includes('云') || name.includes('cloud')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <path d="M10 25 Q8 20 12 18 Q12 12 18 12 Q22 8 28 12 Q34 12 34 18 Q38 20 36 25 Q36 30 30 30 L12 30 Q6 30 10 25" fill="#e6fffb" stroke="#13c2c2" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('工作站') || name.includes('workstation')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <rect x="5" y="8" width="22" height="16" rx="1" fill="#f9f0ff" stroke="#722ed1" strokeWidth="1.5" />
          <rect x="8" y="24" width="16" height="8" rx="1" fill="#f9f0ff" stroke="#722ed1" strokeWidth="1.5" />
          <rect x="29" y="12" width="8" height="20" rx="1" fill="#f9f0ff" stroke="#722ed1" strokeWidth="1.5" />
        </svg>
      )
    }
  }

  // 流程图图标
  if (category === 'flowchart') {
    if (name.includes('流程') || name.includes('process')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <rect x="5" y="10" width="30" height="20" rx="1" fill="#e6f7ff" stroke="#1890ff" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('判定') || name.includes('decision')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <polygon points="20,5 35,20 20,35 5,20" fill="#fff7e6" stroke="#fa8c16" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('开始') || name.includes('结束') || name.includes('start') || name.includes('end')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <ellipse cx="20" cy="20" rx="15" ry="10" fill="#f6ffed" stroke="#52c41a" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('文档') || name.includes('document')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <path d="M10,5 L25,5 L30,10 L30,35 L10,35 Z" fill="#fff2f0" stroke="#f5222d" strokeWidth="1.5" />
          <path d="M25,5 L25,10 L30,10" fill="none" stroke="#f5222d" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('数据') || name.includes('data')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <path d="M10,10 L30,10 L35,35 L5,35 Z" fill="#f9f0ff" stroke="#722ed1" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('终结') || name.includes('terminator')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <rect x="5" y="12" width="30" height="16" rx="8" fill="#fff7e6" stroke="#faad14" strokeWidth="1.5" />
        </svg>
      )
    }
  }

  // 基本形状
  if (category === 'basic') {
    if (name.includes('矩形') || name.includes('rectangle')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <rect x="8" y="10" width="24" height="20" fill="#f5f5f5" stroke="#595959" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('椭圆') || name.includes('ellipse')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <ellipse cx="20" cy="20" rx="12" ry="8" fill="#f5f5f5" stroke="#595959" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('三角形') || name.includes('triangle')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <polygon points="20,5 35,35 5,35" fill="#f5f5f5" stroke="#595959" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('菱形') || name.includes('diamond')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <polygon points="20,5 35,20 20,35 5,20" fill="#f5f5f5" stroke="#595959" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('五边形') || name.includes('pentagon')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <polygon points="20,5 35,15 30,35 10,35 5,15" fill="#f5f5f5" stroke="#595959" strokeWidth="1.5" />
        </svg>
      )
    }
    if (name.includes('六边形') || name.includes('hexagon')) {
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
          <polygon points="20,5 35,12 35,28 20,35 5,28 5,12" fill="#f5f5f5" stroke="#595959" strokeWidth="1.5" />
        </svg>
      )
    }
  }

  // 默认图标
  return (
    <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
      <rect x="10" y="10" width="20" height="20" rx="2" fill="#f5f5f5" stroke="#d9d9d9" strokeWidth="1.5" />
    </svg>
  )
}

// 模具图形项组件
interface StencilShapeItemProps {
  shape: StencilShape
  stencilCategory?: string
}

const StencilShapeItem: React.FC<StencilShapeItemProps> = ({ shape, stencilCategory }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)

    const dragData = createDragData('stencil', {
      stencilId: shape.id,
      shapeId: shape.id,
      name: shape.name,
      width: shape.width,
      height: shape.height,
      defaultProps: {
        width: shape.width,
        height: shape.height,
        text: shape.name,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      },
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

    setTimeout(() => {
      document.body.removeChild(dragPreview)
    }, 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <Tooltip title={`拖拽添加"${shape.name}"`} placement="right">
      <div
        style={{
          width: 80,
          height: 70,
          margin: '8px',
          padding: '8px',
          border: isDragging ? '2px solid #1890ff' : '1px solid #d9d9d9',
          borderRadius: '6px',
          cursor: 'grab',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDragging ? '#e6f7ff' : '#fafafa',
          transition: 'all 0.2s ease',
          boxShadow: isDragging ? '0 4px 12px rgba(24, 144, 255, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
        }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = '#1890ff'
            e.currentTarget.style.background = '#e6f7ff'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.15)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = '#d9d9d9'
            e.currentTarget.style.background = '#fafafa'
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
            e.currentTarget.style.transform = 'translateY(0)'
          }
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {getIconByCategory(stencilCategory, shape.name)}
        </div>
        <span
          style={{
            fontSize: '10px',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
            color: '#595959',
          }}
        >
          {shape.name}
        </span>
      </div>
    </Tooltip>
  )
}

const StencilBrowser: React.FC<StencilBrowserProps> = ({ visible = true }) => {
  const [stencils, setStencils] = useState<Stencil[]>([])
  const [customStencils, setCustomStencils] = useState<Stencil[]>([])
  const [activeTab, setActiveTab] = useState('builtin')

  // 加载内置模具
  useEffect(() => {
    setStencils(getAllStencils())
  }, [])

  // 处理VSSX文件上传
  const handleVssxUpload = async (file: UploadFile) => {
    if (!file.originFileObj) return false

    const fileType = detectVisioStencilType(file.name)
    if (fileType !== 'vssx') {
      message.error('请选择VSSX格式的模具文件')
      return false
    }

    try {
      const arrayBuffer = await file.originFileObj.arrayBuffer()
      const stencil = await parseVssx(arrayBuffer)

      if (stencil) {
        stencil.name = file.name.replace('.vssx', '')
        setCustomStencils((prev) => [...prev, stencil])
        message.success(`成功导入模具"${stencil.name}"，包含 ${stencil.shapes.length} 个图形`)
      } else {
        message.error('解析模具文件失败')
      }
    } catch (error) {
      console.error('导入模具失败:', error)
      message.error('导入模具文件失败')
    }

    return false
  }

  // 渲染模具列表
  const renderStencilList = (stencilList: Stencil[]) => {
    if (stencilList.length === 0) {
      return <Empty description="暂无模具" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }

    const collapseItems = stencilList.map((stencil) => ({
      key: stencil.id,
      label: (
        <div>
          <strong>{stencil.name}</strong>
          <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>
            ({stencil.shapes.length}个图形)
          </span>
        </div>
      ),
      children: (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
          }}
        >
          {stencil.shapes.map((shape) => (
            <StencilShapeItem
              key={shape.id}
              shape={shape}
              stencilCategory={stencil.category}
            />
          ))}
        </div>
      ),
    }))

    return (
      <Collapse
        defaultActiveKey={stencilList[0]?.id}
        bordered={false}
        items={collapseItems}
      />
    )
  }

  const tabItems = [
    {
      key: 'builtin',
      label: '内置模具',
      children: renderStencilList(stencils),
    },
    {
      key: 'custom',
      label: (
        <span>
          自定义模具
          {customStencils.length > 0 && (
            <span style={{ marginLeft: 4, color: '#1890ff' }}>
              ({customStencils.length})
            </span>
          )}
        </span>
      ),
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Upload
              accept=".vssx"
              beforeUpload={handleVssxUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} size="small" block>
                导入VSSX模具
              </Button>
            </Upload>
          </div>
          {renderStencilList(customStencils)}
        </>
      ),
    },
  ]

  if (!visible) return null

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AppstoreOutlined />
          <span>Visio模具</span>
        </div>
      }
      size="small"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{
        flex: 1,
        overflow: 'auto',
        padding: '12px',
      }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} size="small" items={tabItems} />

      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: '#f5f5f5',
          borderRadius: 4,
          fontSize: 12,
          color: '#666',
        }}
      >
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>提示：</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>拖拽图形到画布添加</li>
          <li>支持导入Visio的.vssx模具文件</li>
          <li>自定义模具仅在当前会话有效</li>
        </ul>
      </div>
    </Card>
  )
}

export default StencilBrowser
