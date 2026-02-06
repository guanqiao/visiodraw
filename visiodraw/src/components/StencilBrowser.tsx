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
import useCanvasStore from '@stores/canvasStore'

const { Panel } = Collapse
const { TabPane } = Tabs

interface StencilBrowserProps {
  visible?: boolean
}

const StencilBrowser: React.FC<StencilBrowserProps> = ({ visible = true }) => {
  const [stencils, setStencils] = useState<Stencil[]>([])
  const [customStencils, setCustomStencils] = useState<Stencil[]>([])
  const [activeTab, setActiveTab] = useState('builtin')
  const { addShape } = useCanvasStore()

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

  // 从模具添加图形到画布
  const handleAddShape = (shape: StencilShape) => {
    const { v4: uuidv4 } = require('uuid')
    addShape({
      id: uuidv4(),
      type: 'rectangle', // 默认类型，实际应根据模具类型
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      width: shape.width,
      height: shape.height,
      text: shape.name,
      fill: '#e6f7ff',
      stroke: '#1890ff',
      strokeWidth: 2,
    })
    message.success(`已添加"${shape.name}"`)
  }

  // 渲染模具图形
  const renderStencilShape = (shape: StencilShape) => (
    <Tooltip key={shape.id} title={shape.name} placement="right">
      <div
        style={{
          width: 80,
          height: 60,
          margin: '8px',
          padding: '8px',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          transition: 'all 0.2s',
        }}
        onClick={() => handleAddShape(shape)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#1890ff'
          e.currentTarget.style.background = '#e6f7ff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#d9d9d9'
          e.currentTarget.style.background = '#fafafa'
        }}
      >
        <div
          style={{
            width: shape.width * 0.3,
            height: shape.height * 0.3,
            background: '#1890ff',
            borderRadius: '2px',
            marginBottom: '4px',
          }}
        />
        <span
          style={{
            fontSize: '10px',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
        >
          {shape.name}
        </span>
      </div>
    </Tooltip>
  )

  // 渲染模具列表
  const renderStencilList = (stencilList: Stencil[]) => {
    if (stencilList.length === 0) {
      return <Empty description="暂无模具" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }

    return (
      <Collapse defaultActiveKey={stencilList[0]?.id} bordered={false}>
        {stencilList.map((stencil) => (
          <Panel
            header={
              <div>
                <strong>{stencil.name}</strong>
                <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>
                  ({stencil.shapes.length}个图形)
                </span>
              </div>
            }
            key={stencil.id}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-start',
              }}
            >
              {stencil.shapes.map(renderStencilShape)}
            </div>
          </Panel>
        ))}
      </Collapse>
    )
  }

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
      <Tabs activeKey={activeTab} onChange={setActiveTab} size="small">
        <TabPane tab="内置模具" key="builtin">
          {renderStencilList(stencils)}
        </TabPane>

        <TabPane
          tab={
            <span>
              自定义模具
              {customStencils.length > 0 && (
                <span style={{ marginLeft: 4, color: '#1890ff' }}>
                  ({customStencils.length})
                </span>
              )}
            </span>
          }
          key="custom"
        >
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
        </TabPane>
      </Tabs>

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
          <li>点击图形即可添加到画布</li>
          <li>支持导入Visio的.vssx模具文件</li>
          <li>自定义模具仅在当前会话有效</li>
        </ul>
      </div>
    </Card>
  )
}

export default StencilBrowser
