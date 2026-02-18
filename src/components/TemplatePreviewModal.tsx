import React, { useMemo } from 'react'
import {
  Modal,
  Button,
  Descriptions,
  Tag,
  Space,
  Image,
  Divider,
  Typography,
  Row,
  Col,
  Card,
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  AppstoreOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import type { Template } from '../types/template'
import type { DiagramTemplate } from '../types/diagramTemplate'
import {
  generateTemplateThumbnail,
  generateDiagramTemplateThumbnail,
} from '../utils/templateThumbnailGenerator'

const { Title, Text } = Typography

interface TemplatePreviewModalProps {
  visible: boolean
  template: Template | DiagramTemplate | null
  onClose: () => void
  onApply: () => void
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  visible,
  template,
  onClose,
  onApply,
}) => {
  const previewImage = useMemo(() => {
    if (!template) return ''

    try {
      if ('nodes' in template) {
        return generateDiagramTemplateThumbnail(template, {
          width: 800,
          height: 450,
          padding: 20,
        })
      } else {
        return generateTemplateThumbnail(template, {
          width: 800,
          height: 450,
          padding: 20,
        })
      }
    } catch (error) {
      console.error('生成预览图失败:', error)
      return ''
    }
  }, [template])

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      flowchart: 'blue',
      org: 'green',
      network: 'purple',
      uml: 'orange',
      custom: 'cyan',
      activity: 'blue',
      sequence: 'green',
      state: 'orange',
      er: 'purple',
      class: 'magenta',
      gantt: 'cyan',
    }
    return colors[category] || 'default'
  }

  const getNodeCount = () => {
    if (!template) return 0
    if ('nodes' in template) {
      return template.nodes?.length || 0
    }
    return template.shapes?.length || 0
  }

  const getEdgeCount = () => {
    if (!template) return 0
    if ('nodes' in template) {
      return template.edges?.length || 0
    }
    return template.connectors?.length || 0
  }

  const getTemplateType = () => {
    if (!template) return ''
    if ('nodes' in template) {
      return template.type
    }
    return template.category
  }

  const getTemplateInfo = () => {
    if (!template) return null

    const isDiagramTemplate = 'nodes' in template
    const type = getTemplateType()
    const nodeCount = getNodeCount()
    const edgeCount = getEdgeCount()

    return (
      <Descriptions column={2} bordered size="small">
        <Descriptions.Item label="模板名称" span={2}>
          <Title level={5} style={{ margin: 0 }}>
            {template.name}
          </Title>
        </Descriptions.Item>

        <Descriptions.Item label="类型">
          <Tag color={getCategoryColor(type)}>{type}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="图表类型">
          {isDiagramTemplate ? (
            <Tag icon={<NodeIndexOutlined />} color="processing">
              图表模板
            </Tag>
          ) : (
            <Tag icon={<AppstoreOutlined />} color="default">
              基础模板
            </Tag>
          )}
        </Descriptions.Item>

        <Descriptions.Item label="节点数量">
          <Space>
            <DatabaseOutlined />
            <Text>{nodeCount} 个节点</Text>
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="连线数量">
          <Space>
            <NodeIndexOutlined />
            <Text>{edgeCount} 条连线</Text>
          </Space>
        </Descriptions.Item>

        {template.description && (
          <Descriptions.Item label="描述" span={2}>
            <Text type="secondary">{template.description}</Text>
          </Descriptions.Item>
        )}

        {'mermaidCode' in template && template.mermaidCode && (
          <Descriptions.Item label="Mermaid 支持" span={2}>
            <Tag icon={<CheckCircleOutlined />} color="success">
              支持 Mermaid 代码
            </Tag>
          </Descriptions.Item>
        )}

        {'createdAt' in template && template.createdAt && (
          <Descriptions.Item label="创建时间">
            <Space>
              <ClockCircleOutlined />
              <Text>{new Date(template.createdAt).toLocaleString()}</Text>
            </Space>
          </Descriptions.Item>
        )}

        {'updatedAt' in template && template.updatedAt && (
          <Descriptions.Item label="更新时间">
            <Space>
              <ClockCircleOutlined />
              <Text>{new Date(template.updatedAt).toLocaleString()}</Text>
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>
    )
  }

  return (
    <Modal
      title="模板预览"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button key="apply" type="primary" onClick={onApply}>
          应用此模板
        </Button>,
      ]}
    >
      {template ? (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 预览图 */}
          <Card
            title="预览"
            bordered={false}
            style={{ background: '#f5f5f5' }}
            bodyStyle={{ padding: 16 }}
          >
            <div
              style={{
                width: '100%',
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt={template.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  preview={{
                    mask: '点击查看大图',
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#bfbfbf' }}>
                  <FileTextOutlined style={{ fontSize: 48 }} />
                  <p>无法生成预览</p>
                </div>
              )}
            </div>
          </Card>

          {/* 模板信息 */}
          <Card title="模板信息" bordered={false}>
            {getTemplateInfo()}
          </Card>

          {/* 统计信息 */}
          <Row gutter={16}>
            <Col span={8}>
              <Card bordered={false} style={{ background: '#e6f7ff' }}>
                <div style={{ textAlign: 'center' }}>
                  <DatabaseOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text strong style={{ fontSize: 24, color: '#1890ff' }}>
                      {getNodeCount()}
                    </Text>
                  </div>
                  <Text type="secondary">节点数量</Text>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ background: '#f6ffed' }}>
                <div style={{ textAlign: 'center' }}>
                  <NodeIndexOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text strong style={{ fontSize: 24, color: '#52c41a' }}>
                      {getEdgeCount()}
                    </Text>
                  </div>
                  <Text type="secondary">连线数量</Text>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ background: '#fff7e6' }}>
                <div style={{ textAlign: 'center' }}>
                  <AppstoreOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                  <div style={{ marginTop: 8 }}>
                    <Text strong style={{ fontSize: 24, color: '#fa8c16' }}>
                      {'nodes' in template ? '图表' : '基础'}
                    </Text>
                  </div>
                  <Text type="secondary">模板类型</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Space>
      ) : (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">暂无模板信息</Text>
        </div>
      )}
    </Modal>
  )
}

export default TemplatePreviewModal
