/**
 * 打印预览组件
 */

import React, { useState, useRef } from 'react'
import { Modal, Button, Space, Select, Radio, Typography, message } from 'antd'
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons'
import useCanvasStore from '@stores/canvasStore'

const { Title, Text } = Typography
const { Option } = Select

interface PrintPreviewProps {
  visible: boolean
  onClose: () => void
}

interface PrintSettings {
  paperSize: 'A4' | 'A3' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  scale: 'fit' | 'actual' | 'custom'
  customScale: number
  margins: 'default' | 'minimal' | 'none' | 'custom'
  copies: number
}

const paperSizes = {
  A4: { width: 210, height: 297, name: 'A4 (210 x 297 mm)' },
  A3: { width: 297, height: 420, name: 'A3 (297 x 420 mm)' },
  Letter: { width: 216, height: 279, name: 'Letter (8.5 x 11 in)' },
  Legal: { width: 216, height: 356, name: 'Legal (8.5 x 14 in)' },
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ visible, onClose }) => {
  const { canvas } = useCanvasStore()
  const previewRef = useRef<HTMLDivElement>(null)

  const [settings, setSettings] = useState<PrintSettings>({
    paperSize: 'A4',
    orientation: 'portrait',
    scale: 'fit',
    customScale: 100,
    margins: 'default',
    copies: 1,
  })

  // 计算预览尺寸
  const getPreviewDimensions = () => {
    const paper = paperSizes[settings.paperSize]
    const isLandscape = settings.orientation === 'landscape'
    const width = isLandscape ? paper.height : paper.width
    const height = isLandscape ? paper.width : paper.height

    // 根据缩放比例调整
    let scale = 1
    if (settings.scale === 'fit') {
      scale = 0.8 // 适应页面
    } else if (settings.scale === 'custom') {
      scale = settings.customScale / 100
    }

    return {
      width: width * scale,
      height: height * scale,
      scale,
    }
  }

  // 执行打印
  const handlePrint = () => {
    if (!canvas) {
      message.error('画布未初始化')
      return
    }

    // 创建打印窗口
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      message.error('无法打开打印窗口，请检查弹出窗口设置')
      return
    }

    // 获取画布数据
    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 2,
    })

    const paper = paperSizes[settings.paperSize]
    const isLandscape = settings.orientation === 'landscape'
    const width = isLandscape ? paper.height : paper.width
    const height = isLandscape ? paper.width : paper.height

    // 构建打印HTML
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>打印 - VisioDraw</title>
          <style>
            @page {
              size: ${settings.paperSize} ${settings.orientation};
              margin: ${settings.margins === 'none' ? '0' : settings.margins === 'minimal' ? '5mm' : '20mm'};
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .print-container {
              width: ${width}mm;
              height: ${height}mm;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            .print-container img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <img src="${dataUrl}" alt="打印内容" />
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.write(printHtml)
    printWindow.document.close()

    message.success('打印任务已发送')
    onClose()
  }

  // 导出为PDF（通过打印到PDF）
  const handleExportPdf = () => {
    if (!canvas) {
      message.error('画布未初始化')
      return
    }

    // 触发浏览器的打印到PDF功能
    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 2,
    })

    const paper = paperSizes[settings.paperSize]
    const isLandscape = settings.orientation === 'landscape'
    const width = isLandscape ? paper.height : paper.width
    const height = isLandscape ? paper.width : paper.height

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      message.error('无法打开打印窗口')
      return
    }

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>导出PDF - VisioDraw</title>
          <style>
            @page {
              size: ${settings.paperSize} ${settings.orientation};
              margin: ${settings.margins === 'none' ? '0' : settings.margins === 'minimal' ? '5mm' : '20mm'};
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .print-container {
              width: ${width}mm;
              height: ${height}mm;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            .print-container img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            .instructions {
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: #1890ff;
              color: white;
              padding: 12px 24px;
              border-radius: 4px;
              font-family: Arial, sans-serif;
              z-index: 1000;
            }
            @media print {
              .instructions {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="instructions">
            请按 Ctrl+P 选择"另存为PDF"以导出PDF文件
          </div>
          <div class="print-container">
            <img src="${dataUrl}" alt="导出内容" />
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printHtml)
    printWindow.document.close()

    message.success('请在打开的页面中选择"另存为PDF"')
    onClose()
  }

  const previewDimensions = getPreviewDimensions()

  return (
    <Modal
      title="打印预览"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button key="pdf" icon={<DownloadOutlined />} onClick={handleExportPdf}>
          导出PDF
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          打印
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', gap: 24 }}>
        {/* 设置面板 */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>纸张大小</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={settings.paperSize}
                onChange={(value) => setSettings({ ...settings, paperSize: value })}
              >
                {Object.entries(paperSizes).map(([key, paper]) => (
                  <Option key={key} value={key}>
                    {paper.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Text strong>方向</Text>
              <Radio.Group
                style={{ width: '100%', marginTop: 8 }}
                value={settings.orientation}
                onChange={(e) => setSettings({ ...settings, orientation: e.target.value })}
                buttonStyle="solid"
              >
                <Radio.Button value="portrait" style={{ width: '50%', textAlign: 'center' }}>
                  纵向
                </Radio.Button>
                <Radio.Button value="landscape" style={{ width: '50%', textAlign: 'center' }}>
                  横向
                </Radio.Button>
              </Radio.Group>
            </div>

            <div>
              <Text strong>缩放</Text>
              <Radio.Group
                style={{ width: '100%', marginTop: 8 }}
                value={settings.scale}
                onChange={(e) => setSettings({ ...settings, scale: e.target.value })}
              >
                <Radio value="fit">适应页面</Radio>
                <Radio value="actual">实际大小</Radio>
                <Radio value="custom">自定义</Radio>
              </Radio.Group>
              {settings.scale === 'custom' && (
                <div style={{ marginTop: 8, marginLeft: 24 }}>
                  <Select
                    value={settings.customScale}
                    onChange={(value) => setSettings({ ...settings, customScale: value })}
                    style={{ width: 120 }}
                  >
                    {[25, 50, 75, 100, 125, 150, 200].map((scale) => (
                      <Option key={scale} value={scale}>
                        {scale}%
                      </Option>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Text strong>边距</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={settings.margins}
                onChange={(value) => setSettings({ ...settings, margins: value })}
              >
                <Option value="default">默认 (20mm)</Option>
                <Option value="minimal">最小 (5mm)</Option>
                <Option value="none">无边距</Option>
              </Select>
            </div>

            <div>
              <Text strong>份数</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={settings.copies}
                onChange={(value) => setSettings({ ...settings, copies: value })}
              >
                {[1, 2, 3, 4, 5, 10].map((num) => (
                  <Option key={num} value={num}>
                    {num} 份
                  </Option>
                ))}
              </Select>
            </div>
          </Space>
        </div>

        {/* 预览区域 */}
        <div
          style={{
            flex: 1,
            background: '#f0f0f0',
            borderRadius: 4,
            padding: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            overflow: 'auto',
          }}
        >
          <div
            ref={previewRef}
            style={{
              width: previewDimensions.width * 2, // 放大2倍以便查看
              height: previewDimensions.height * 2,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {canvas ? (
              <img
                src={canvas.toDataURL({ format: 'png', multiplier: 0.5 })}
                alt="预览"
                style={{
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Text type="secondary">画布未初始化</Text>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                fontSize: 12,
                color: '#999',
              }}
            >
              {paperSizes[settings.paperSize].name} - {settings.orientation === 'portrait' ? '纵向' : '横向'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default PrintPreview
