import React, { useState, useEffect } from 'react'
import {
  Modal,
  Button,
  Tabs,
  Input,
  Space,
  Typography,
  message,
  Radio,
  Slider,
  Select,
  QRCode,
  Tooltip,
  Card,
  Row,
  Col,
  Image,
  Alert,
} from 'antd'
import {
  LinkOutlined,
  CodeOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  FileTextOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import type { Template } from '../types/template'
import {
  generateShareLink,
  generateEmbedCode,
  exportTemplateAsImage,
  exportTemplateAsSvg,
  copyToClipboard,
  downloadFile,
} from '../utils/templateShare'

const { TabPane } = Tabs
const { Text, Title } = Typography
const { TextArea } = Input

interface TemplateShareDialogProps {
  visible: boolean
  template: Template | null
  onClose: () => void
}

const TemplateShareDialog: React.FC<TemplateShareDialogProps> = ({
  visible,
  template,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('link')
  const [shareLink, setShareLink] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [embedType, setEmbedType] = useState<'iframe' | 'script' | 'markdown' | 'html'>('iframe')
  const [imageUrl, setImageUrl] = useState('')
  const [svgCode, setSvgCode] = useState('')
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'svg'>('png')
  const [exportQuality, setExportQuality] = useState(0.9)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (visible && template) {
      generateShareContent()
    }
  }, [visible, template, embedType, exportFormat, exportQuality])

  const generateShareContent = async () => {
    if (!template) return

    setIsGenerating(true)

    try {
      // 生成分享链接
      const link = generateShareLink(template)
      setShareLink(link)

      // 生成嵌入代码
      const code = generateEmbedCode(template, { type: embedType })
      setEmbedCode(code)

      // 导出图片
      if (exportFormat === 'svg') {
        const svg = await exportTemplateAsSvg(template)
        setSvgCode(svg)
        setImageUrl('')
      } else {
        const image = await exportTemplateAsImage(template, exportFormat, {
          quality: exportQuality,
        })
        setImageUrl(image)
        setSvgCode('')
      }
    } catch (error) {
      console.error('生成分享内容失败:', error)
      message.error('生成分享内容失败')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (content: string) => {
    const success = await copyToClipboard(content)
    if (success) {
      setCopied(true)
      message.success('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } else {
      message.error('复制失败')
    }
  }

  const handleDownload = async () => {
    if (!template) return

    try {
      if (exportFormat === 'svg') {
        const svg = await exportTemplateAsSvg(template)
        downloadFile(svg, `${template.name}.svg`, 'image/svg+xml')
      } else {
        const image = await exportTemplateAsImage(template, exportFormat, {
          quality: exportQuality,
        })
        downloadFile(image, `${template.name}.${exportFormat}`, `image/${exportFormat}`)
      }
      message.success('下载成功')
    } catch (error) {
      message.error('下载失败')
    }
  }

  if (!template) return null

  return (
    <Modal
      title="分享模板"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 链接分享 */}
        <TabPane
          tab={
            <span>
              <LinkOutlined />
              链接分享
            </span>
          }
          key="link"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="分享链接" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  value={shareLink}
                  readOnly
                  addonAfter={
                    <Button
                      type="text"
                      icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                      onClick={() => handleCopy(shareLink)}
                    >
                      {copied ? '已复制' : '复制'}
                    </Button>
                  }
                />
                <Text type="secondary">复制链接分享给他人，对方可以直接查看模板</Text>
              </Space>
            </Card>

            <Card title="二维码分享" size="small">
              <Row gutter={16} align="middle">
                <Col>
                  <QRCode value={shareLink} size={150} />
                </Col>
                <Col>
                  <Space direction="vertical">
                    <Text>扫描二维码快速访问</Text>
                    <Text type="secondary">支持微信、支付宝等扫码工具</Text>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Space>
        </TabPane>

        {/* 嵌入代码 */}
        <TabPane
          tab={
            <span>
              <CodeOutlined />
              嵌入代码
            </span>
          }
          key="embed"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Radio.Group
              value={embedType}
              onChange={(e) => setEmbedType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="iframe">IFrame</Radio.Button>
              <Radio.Button value="script">Script</Radio.Button>
              <Radio.Button value="markdown">Markdown</Radio.Button>
              <Radio.Button value="html">HTML</Radio.Button>
            </Radio.Group>

            <TextArea
              value={embedCode}
              readOnly
              rows={6}
              style={{ fontFamily: 'monospace' }}
            />

            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(embedCode)}
              block
            >
              复制嵌入代码
            </Button>

            <Alert
              message="使用说明"
              description="将代码粘贴到您的网页、博客或文档中，即可嵌入此模板。"
              type="info"
              showIcon
            />
          </Space>
        </TabPane>

        {/* 导出图片 */}
        <TabPane
          tab={
            <span>
              <FileImageOutlined />
              导出图片
            </span>
          }
          key="image"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="导出设置" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text>格式</Text>
                      <Radio.Group
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        style={{ marginLeft: 16 }}
                      >
                        <Radio.Button value="png">PNG</Radio.Button>
                        <Radio.Button value="jpeg">JPEG</Radio.Button>
                        <Radio.Button value="svg">SVG</Radio.Button>
                      </Radio.Group>
                    </div>

                    {exportFormat === 'jpeg' && (
                      <div>
                        <Text>质量</Text>
                        <Slider
                          value={exportQuality}
                          onChange={setExportQuality}
                          min={0.1}
                          max={1}
                          step={0.1}
                          style={{ width: 200 }}
                        />
                      </div>
                    )}

                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                      loading={isGenerating}
                      block
                    >
                      下载 {exportFormat.toUpperCase()}
                    </Button>
                  </Space>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="预览" size="small" style={{ textAlign: 'center' }}>
                  {isGenerating ? (
                    <div style={{ padding: 40 }}>生成中...</div>
                  ) : imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={template.name}
                      style={{ maxWidth: '100%', maxHeight: 300 }}
                    />
                  ) : svgCode ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: svgCode }}
                      style={{ maxWidth: '100%', maxHeight: 300 }}
                    />
                  ) : (
                    <div style={{ padding: 40 }}>无预览</div>
                  )}
                </Card>
              </Col>
            </Row>

            {exportFormat === 'svg' && (
              <Card title="SVG 代码" size="small">
                <TextArea
                  value={svgCode}
                  readOnly
                  rows={4}
                  style={{ fontFamily: 'monospace', fontSize: 12 }}
                />
                <Button
                  style={{ marginTop: 8 }}
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(svgCode)}
                  block
                >
                  复制 SVG 代码
                </Button>
              </Card>
            )}
          </Space>
        </TabPane>
      </Tabs>
    </Modal>
  )
}

export default TemplateShareDialog
