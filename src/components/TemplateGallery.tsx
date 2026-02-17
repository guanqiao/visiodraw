import React, { useState, useEffect } from 'react'
import {
  Modal,
  Card,
  Row,
  Col,
  Button,
  Input,
  Empty,
  Tabs,
  Tooltip,
  message,
  Popconfirm,
  Space,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
  FileOutlined,
  CodeOutlined,
} from '@ant-design/icons'
import useX6GraphStore from '@stores/x6GraphStore'
import type { Template, TemplateCategory } from '../types/template'
import type { DiagramTemplate, DiagramType } from '../types/diagramTemplate'
import { getBuiltinTemplates, saveCustomTemplate, getCustomTemplates, deleteCustomTemplate } from '../templates/templateRegistry'
import { getAllTemplates, getTemplatesByType } from '../templates'
import { buildDiagramTemplate } from '../utils/diagramTemplateBuilder'
import { parseMermaidCode } from '../utils/mermaidParser'

const { TabPane } = Tabs
const { Search } = Input
const { Meta } = Card

interface TemplateGalleryProps {
  visible: boolean
  onClose: () => void
  onOpenMermaidImport?: () => void
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ visible, onClose, onOpenMermaidImport }) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  const [diagramTemplates, setDiagramTemplates] = useState<DiagramTemplate[]>([])
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<TemplateCategory | 'custom' | 'diagram'>('flowchart')
  const [activeDiagramTab, setActiveDiagramTab] = useState<DiagramType>('activity')

  const { nodes, edges, addNodes, addEdge, newGraph } = useX6GraphStore()

  useEffect(() => {
    if (visible) {
      setTemplates(getBuiltinTemplates())
      setCustomTemplates(getCustomTemplates())
      setDiagramTemplates(getAllTemplates())
    }
  }, [visible])

  const handleApplyTemplate = (template: Template) => {
    // Clear current canvas
    newGraph()

    // Add template shapes
    if (template.shapes && template.shapes.length > 0) {
      addNodes(template.shapes)
    }

    // Add template connectors - convert to Connector format
    if (template.connectors && template.connectors.length > 0) {
      template.connectors.forEach((connector) => {
        const convertedConnector = {
          id: connector.id,
          sourceShapeId: connector.source,
          sourcePointId: 'bottom',
          targetShapeId: connector.target,
          targetPointId: 'top',
          style: 'orthogonal' as const,
          lineStyle: 'solid' as const,
          startStyle: 'none' as const,
          endStyle: 'arrow' as const,
          stroke: '#333333',
          strokeWidth: 2,
          ...(connector.label && {
            labels: [{ id: `${connector.id}-label`, text: connector.label, position: 0.5 }]
          }),
        }
        addEdge(convertedConnector)
      })
    }

    message.success(`已应用模板: ${template.name}`)
    onClose()
  }

  const handleApplyDiagramTemplate = (template: DiagramTemplate) => {
    // Clear current canvas
    newGraph()

    // Build template to X6 format
    const { nodes: templateNodes, edges: templateEdges } = buildDiagramTemplate(template)

    // Add template nodes
    if (templateNodes.length > 0) {
      addNodes(templateNodes)
    }

    // Add template edges
    if (templateEdges.length > 0) {
      templateEdges.forEach((edge) => addEdge(edge))
    }

    message.success(`已应用模板: ${template.name}`)
    onClose()
  }

  const handleSaveAsTemplate = () => {
    if (nodes.length === 0) {
      message.warning('画布为空，无法保存模板')
      return
    }

    const name = window.prompt('请输入模板名称:')
    if (!name) return

    const description = window.prompt('请输入模板描述（可选）:') || ''

    const template: Omit<Template, 'id'> = {
      name,
      description,
      category: 'custom',
      shapes: nodes,
      connectors: edges,
      thumbnail: '',
    }

    try {
      saveCustomTemplate(template)
      setCustomTemplates(getCustomTemplates())
      message.success('模板已保存')
    } catch (error) {
      message.error('保存模板失败')
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    try {
      deleteCustomTemplate(templateId)
      setCustomTemplates(getCustomTemplates())
      message.success('模板已删除')
    } catch (error) {
      message.error('删除模板失败')
    }
  }

  const handleExportTemplate = (template: Template) => {
    const data = JSON.stringify(template, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${template.name}.template.json`
    link.click()
    URL.revokeObjectURL(url)
    message.success('模板已导出')
  }

  const handleImportTemplate = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const template = JSON.parse(event.target?.result as string) as Template
            saveCustomTemplate({
              name: template.name,
              description: template.description,
              category: 'custom',
              shapes: template.shapes,
              connectors: template.connectors,
            })
            setCustomTemplates(getCustomTemplates())
            message.success('模板已导入')
          } catch (error) {
            message.error('导入模板失败')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const filterTemplates = (templates: Template[]) => {
    if (!searchText) return templates
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchText.toLowerCase())
    )
  }

  const filterDiagramTemplates = (templates: DiagramTemplate[]) => {
    if (!searchText) return templates
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchText.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchText.toLowerCase())
    )
  }

  const getTemplatesByCategory = (category: TemplateCategory | 'custom') => {
    if (category === 'custom') {
      return filterTemplates(customTemplates)
    }
    return filterTemplates(templates.filter((t) => t.category === category))
  }

  const getDiagramTemplatesByType = (type: DiagramType) => {
    return filterDiagramTemplates(getTemplatesByType(type))
  }

  const renderTemplateCard = (template: Template, isCustom = false) => (
    <Col span={8} key={template.id}>
      <Card
        hoverable
        cover={
          <div
            style={{
              height: 120,
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              color: '#d9d9d9',
            }}
          >
            <FileOutlined />
          </div>
        }
        actions={[
          <Tooltip title="应用模板" key="apply">
            <Button type="link" onClick={() => handleApplyTemplate(template)}>
              应用
            </Button>
          </Tooltip>,
          ...(isCustom
            ? [
                <Tooltip title="导出模板" key="export">
                  <ExportOutlined onClick={() => handleExportTemplate(template)} />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="确定删除此模板？"
                  onConfirm={() => handleDeleteTemplate(template.id)}
                >
                  <DeleteOutlined style={{ color: '#ff4d4f' }} />
                </Popconfirm>,
              ]
            : []),
        ]}
      >
        <Meta title={template.name} description={template.description} />
      </Card>
    </Col>
  )

  const renderDiagramTemplateCard = (template: DiagramTemplate) => (
    <Col span={8} key={template.id}>
      <Card
        hoverable
        cover={
          <div
            style={{
              height: 120,
              background: '#f0f5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              color: '#2f54eb',
            }}
          >
            <CodeOutlined />
          </div>
        }
        actions={[
          <Tooltip title="应用模板" key="apply">
            <Button type="link" onClick={() => handleApplyDiagramTemplate(template)}>
              应用
            </Button>
          </Tooltip>,
        ]}
      >
        <Meta 
          title={template.name} 
          description={
            <Space direction="vertical" size={0}>
              <span>{template.description}</span>
              {template.mermaidCode && (
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>支持 Mermaid</span>
              )}
            </Space>
          } 
        />
      </Card>
    </Col>
  )

  const renderDiagramTabs = () => (
    <Tabs activeKey={activeDiagramTab} onChange={(key) => setActiveDiagramTab(key as DiagramType)}>
      <TabPane tab="活动图" key="activity">
        <Row gutter={[16, 16]}>
          {getDiagramTemplatesByType('activity').length > 0 ? (
            getDiagramTemplatesByType('activity').map((t) => renderDiagramTemplateCard(t))
          ) : (
            <Col span={24}>
              <Empty description="暂无活动图模板" />
            </Col>
          )}
        </Row>
      </TabPane>
      <TabPane tab="序列图" key="sequence">
        <Row gutter={[16, 16]}>
          {getDiagramTemplatesByType('sequence').length > 0 ? (
            getDiagramTemplatesByType('sequence').map((t) => renderDiagramTemplateCard(t))
          ) : (
            <Col span={24}>
              <Empty description="暂无序列图模板" />
            </Col>
          )}
        </Row>
      </TabPane>
      <TabPane tab="状态图" key="state">
        <Row gutter={[16, 16]}>
          {getDiagramTemplatesByType('state').length > 0 ? (
            getDiagramTemplatesByType('state').map((t) => renderDiagramTemplateCard(t))
          ) : (
            <Col span={24}>
              <Empty description="暂无状态图模板" />
            </Col>
          )}
        </Row>
      </TabPane>
      <TabPane tab="ER图" key="er">
        <Row gutter={[16, 16]}>
          {getDiagramTemplatesByType('er').length > 0 ? (
            getDiagramTemplatesByType('er').map((t) => renderDiagramTemplateCard(t))
          ) : (
            <Col span={24}>
              <Empty description="暂无ER图模板" />
            </Col>
          )}
        </Row>
      </TabPane>
      <TabPane tab="类图" key="class">
        <Row gutter={[16, 16]}>
          {getDiagramTemplatesByType('class').length > 0 ? (
            getDiagramTemplatesByType('class').map((t) => renderDiagramTemplateCard(t))
          ) : (
            <Col span={24}>
              <Empty description="暂无类图模板" />
            </Col>
          )}
        </Row>
      </TabPane>
      <TabPane tab="甘特图" key="gantt">
        <Row gutter={[16, 16]}>
          {getDiagramTemplatesByType('gantt').length > 0 ? (
            getDiagramTemplatesByType('gantt').map((t) => renderDiagramTemplateCard(t))
          ) : (
            <Col span={24}>
              <Empty description="暂无甘特图模板" />
            </Col>
          )}
        </Row>
      </TabPane>
    </Tabs>
  )

  return (
    <Modal
      title="模板库"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="import" icon={<ImportOutlined />} onClick={handleImportTemplate}>
          导入模板
        </Button>,
        onOpenMermaidImport && (
          <Button key="mermaid" icon={<CodeOutlined />} onClick={onOpenMermaidImport}>
            从 Mermaid 导入
          </Button>
        ),
        <Button
          key="save"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleSaveAsTemplate}
        >
          保存当前为模板
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索模板"
          allowClear
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as TemplateCategory | 'custom' | 'diagram')}>
        <TabPane tab="图表模板" key="diagram">
          {renderDiagramTabs()}
        </TabPane>
        <TabPane tab="流程图" key="flowchart">
          <Row gutter={[16, 16]}>
            {getTemplatesByCategory('flowchart').length > 0 ? (
              getTemplatesByCategory('flowchart').map((t) => renderTemplateCard(t))
            ) : (
              <Col span={24}>
                <Empty description="暂无模板" />
              </Col>
            )}
          </Row>
        </TabPane>
        <TabPane tab="组织结构" key="org">
          <Row gutter={[16, 16]}>
            {getTemplatesByCategory('org').length > 0 ? (
              getTemplatesByCategory('org').map((t) => renderTemplateCard(t))
            ) : (
              <Col span={24}>
                <Empty description="暂无模板" />
              </Col>
            )}
          </Row>
        </TabPane>
        <TabPane tab="网络拓扑" key="network">
          <Row gutter={[16, 16]}>
            {getTemplatesByCategory('network').length > 0 ? (
              getTemplatesByCategory('network').map((t) => renderTemplateCard(t))
            ) : (
              <Col span={24}>
                <Empty description="暂无模板" />
              </Col>
            )}
          </Row>
        </TabPane>
        <TabPane tab="UML" key="uml">
          <Row gutter={[16, 16]}>
            {getTemplatesByCategory('uml').length > 0 ? (
              getTemplatesByCategory('uml').map((t) => renderTemplateCard(t))
            ) : (
              <Col span={24}>
                <Empty description="暂无模板" />
              </Col>
            )}
          </Row>
        </TabPane>
        <TabPane tab="自定义" key="custom">
          <Row gutter={[16, 16]}>
            {getTemplatesByCategory('custom').length > 0 ? (
              getTemplatesByCategory('custom').map((t) => renderTemplateCard(t, true))
            ) : (
              <Col span={24}>
                <Empty description="暂无自定义模板，可以将当前画布保存为模板" />
              </Col>
            )}
          </Row>
        </TabPane>
      </Tabs>
    </Modal>
  )
}

export default TemplateGallery
