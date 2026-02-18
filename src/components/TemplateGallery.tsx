import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  Badge,
  Spin,
  Image,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
  FileOutlined,
  CodeOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
} from '@ant-design/icons'
import useX6GraphStore from '@stores/x6GraphStore'
import type { Template, TemplateCategory } from '../types/template'
import type { DiagramTemplate, DiagramType } from '../types/diagramTemplate'
import { getBuiltinTemplates, saveCustomTemplate, getCustomTemplates, deleteCustomTemplate } from '../templates/templateRegistry'
import { getAllTemplates, getTemplatesByType } from '../templates'
import { buildDiagramTemplate } from '../utils/diagramTemplateBuilder'
import {
  generateTemplateThumbnail,
  generateDiagramTemplateThumbnail,
  generateEmptyThumbnail,
} from '../utils/templateThumbnailGenerator'
import TemplatePreviewModal from './TemplatePreviewModal'
import TemplateImportDialog from './TemplateImportDialog'

const { TabPane } = Tabs
const { Search } = Input
const { Meta } = Card

interface TemplateGalleryProps {
  visible: boolean
  onClose: () => void
  onOpenMermaidImport?: () => void
}

// 缩略图缓存
const thumbnailCache = new Map<string, string>()

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ visible, onClose, onOpenMermaidImport }) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [customTemplates, setCustomTemplates] = useState<Template[]>([])
  const [diagramTemplates, setDiagramTemplates] = useState<DiagramTemplate[]>([])
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<TemplateCategory | 'custom' | 'diagram'>('flowchart')
  const [activeDiagramTab, setActiveDiagramTab] = useState<DiagramType>('activity')
  const [loadingThumbnails, setLoadingThumbnails] = useState<Set<string>>(new Set())
  const [previewTemplate, setPreviewTemplate] = useState<Template | DiagramTemplate | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [importDialogVisible, setImportDialogVisible] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('visiodraw_template_favorites')
      return new Set(saved ? JSON.parse(saved) : [])
    } catch {
      return new Set()
    }
  })

  const { nodes, edges, addNodes, addEdge, newGraph } = useX6GraphStore()

  useEffect(() => {
    if (visible) {
      setTemplates(getBuiltinTemplates())
      setCustomTemplates(getCustomTemplates())
      setDiagramTemplates(getAllTemplates())
    }
  }, [visible])

  // 保存收藏到 localStorage
  useEffect(() => {
    localStorage.setItem('visiodraw_template_favorites', JSON.stringify([...favorites]))
  }, [favorites])

  const handleApplyTemplate = (template: Template) => {
    newGraph()

    if (template.shapes && template.shapes.length > 0) {
      addNodes(template.shapes)
    }

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
    newGraph()

    const { nodes: templateNodes, edges: templateEdges } = buildDiagramTemplate(template)

    if (templateNodes.length > 0) {
      addNodes(templateNodes)
    }

    if (templateEdges.length > 0) {
      templateEdges.forEach((edge) => addEdge(edge))
    }

    message.success(`已应用模板: ${template.name}`)
    onClose()
  }

  const handleSaveAsTemplate = async () => {
    if (nodes.length === 0) {
      message.warning('画布为空，无法保存模板')
      return
    }

    const name = window.prompt('请输入模板名称:')
    if (!name) return

    const description = window.prompt('请输入模板描述（可选）:') || ''

    // 生成缩略图
    const tempTemplate: Template = {
      id: 'temp',
      name,
      description,
      category: 'custom',
      shapes: nodes,
      connectors: edges,
      thumbnail: '',
    }

    try {
      const thumbnail = generateTemplateThumbnail(tempTemplate)

      const template: Omit<Template, 'id'> = {
        name,
        description,
        category: 'custom',
        shapes: nodes,
        connectors: edges,
        thumbnail,
      }

      saveCustomTemplate(template)
      setCustomTemplates(getCustomTemplates())
      message.success('模板已保存')
    } catch (error) {
      console.error('保存模板失败:', error)
      message.error('保存模板失败')
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    try {
      deleteCustomTemplate(templateId)
      setCustomTemplates(getCustomTemplates())
      thumbnailCache.delete(templateId)
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

  const handleImportSuccess = () => {
    setCustomTemplates(getCustomTemplates())
    setImportDialogVisible(false)
  }

  const toggleFavorite = (templateId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(templateId)) {
        next.delete(templateId)
        message.success('已取消收藏')
      } else {
        next.add(templateId)
        message.success('已添加到收藏')
      }
      return next
    })
  }

  const openPreview = (template: Template | DiagramTemplate) => {
    setPreviewTemplate(template)
    setPreviewVisible(true)
  }

  const getThumbnail = useCallback((template: Template | DiagramTemplate): string => {
    const cacheKey = 'id' in template && template.id ? template.id : `diagram-${(template as DiagramTemplate).name || (template as Template).name}`

    if (thumbnailCache.has(cacheKey)) {
      return thumbnailCache.get(cacheKey)!
    }

    if ('thumbnail' in template && template.thumbnail) {
      thumbnailCache.set(cacheKey, template.thumbnail)
      return template.thumbnail
    }

    try {
      let thumbnail: string
      if ('nodes' in template) {
        thumbnail = generateDiagramTemplateThumbnail(template)
      } else {
        thumbnail = generateTemplateThumbnail(template)
      }
      thumbnailCache.set(cacheKey, thumbnail)
      return thumbnail
    } catch (error) {
      console.error('生成缩略图失败:', error)
      return generateEmptyThumbnail()
    }
  }, [])

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

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      flowchart: '#1890ff',
      org: '#52c41a',
      network: '#722ed1',
      uml: '#fa8c16',
      custom: '#13c2c2',
      activity: '#1890ff',
      sequence: '#52c41a',
      state: '#fa8c16',
      er: '#722ed1',
      class: '#eb2f96',
      gantt: '#13c2c2',
    }
    return colors[category] || '#8c8c8c'
  }

  const renderTemplateCard = (template: Template, isCustom = false) => {
    const thumbnail = getThumbnail(template)
    const isFavorite = favorites.has(template.id)
    const categoryColor = getCategoryColor(template.category)

    return (
      <Col span={8} key={template.id}>
        <Badge.Ribbon
          text={template.category}
          color={categoryColor}
          style={{ display: template.category ? 'block' : 'none' }}
        >
          <Card
            hoverable
            cover={
              <div
                style={{
                  height: 140,
                  background: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Image
                  src={thumbnail}
                  alt={template.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  preview={false}
                  placeholder={
                    <div style={{ fontSize: 48, color: '#d9d9d9' }}>
                      <FileOutlined />
                    </div>
                  }
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  <Tooltip title="预览">
                    <Button
                      type="primary"
                      shape="circle"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        openPreview(template)
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            }
            actions={[
              <Tooltip title="应用模板" key="apply">
                <Button type="link" onClick={() => handleApplyTemplate(template)}>
                  应用
                </Button>
              </Tooltip>,
              <Tooltip title={isFavorite ? '取消收藏' : '收藏'} key="favorite">
                {isFavorite ? (
                  <StarFilled
                    style={{ color: '#faad14', fontSize: 16 }}
                    onClick={() => toggleFavorite(template.id)}
                  />
                ) : (
                  <StarOutlined
                    style={{ fontSize: 16 }}
                    onClick={() => toggleFavorite(template.id)}
                  />
                )}
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
            <Meta
              title={
                <Tooltip title={template.name}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {template.name}
                  </span>
                </Tooltip>
              }
              description={
                <Tooltip title={template.description}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#8c8c8c',
                    }}
                  >
                    {template.description || '暂无描述'}
                  </span>
                </Tooltip>
              }
            />
          </Card>
        </Badge.Ribbon>
      </Col>
    )
  }

  const renderDiagramTemplateCard = (template: DiagramTemplate) => {
    const thumbnail = getThumbnail(template)
    const cacheKey = `diagram-${template.name}`
    const isFavorite = favorites.has(cacheKey)
    const categoryColor = getCategoryColor(template.type)

    return (
      <Col span={8} key={template.id}>
        <Badge.Ribbon text={template.type} color={categoryColor}>
          <Card
            hoverable
            cover={
              <div
                style={{
                  height: 140,
                  background: '#f0f5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Image
                  src={thumbnail}
                  alt={template.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  preview={false}
                  placeholder={
                    <div style={{ fontSize: 48, color: '#2f54eb' }}>
                      <CodeOutlined />
                    </div>
                  }
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  <Tooltip title="预览">
                    <Button
                      type="primary"
                      shape="circle"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        openPreview(template)
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
            }
            actions={[
              <Tooltip title="应用模板" key="apply">
                <Button type="link" onClick={() => handleApplyDiagramTemplate(template)}>
                  应用
                </Button>
              </Tooltip>,
              <Tooltip title={isFavorite ? '取消收藏' : '收藏'} key="favorite">
                {isFavorite ? (
                  <StarFilled
                    style={{ color: '#faad14', fontSize: 16 }}
                    onClick={() => toggleFavorite(cacheKey)}
                  />
                ) : (
                  <StarOutlined
                    style={{ fontSize: 16 }}
                    onClick={() => toggleFavorite(cacheKey)}
                  />
                )}
              </Tooltip>,
            ]}
          >
            <Meta
              title={
                <Tooltip title={template.name}>
                  <span
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {template.name}
                  </span>
                </Tooltip>
              }
              description={
                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                  <Tooltip title={template.description}>
                    <span
                      style={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#8c8c8c',
                      }}
                    >
                      {template.description || '暂无描述'}
                    </span>
                  </Tooltip>
                  {template.mermaidCode && (
                    <span style={{ fontSize: 12, color: '#2f54eb' }}>支持 Mermaid</span>
                  )}
                </Space>
              }
            />
          </Card>
        </Badge.Ribbon>
      </Col>
    )
  }

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
    <>
      <Modal
        title="模板库"
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={[
          <Button key="import" icon={<ImportOutlined />} onClick={() => setImportDialogVisible(true)}>
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
          <TabPane
            tab={
              <span>
                自定义
                {favorites.size > 0 && (
                  <Badge count={favorites.size} style={{ marginLeft: 4 }} />
                )}
              </span>
            }
            key="custom"
          >
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

      <TemplatePreviewModal
        visible={previewVisible}
        template={previewTemplate}
        onClose={() => {
          setPreviewVisible(false)
          setPreviewTemplate(null)
        }}
        onApply={() => {
          if (previewTemplate) {
            if ('nodes' in previewTemplate) {
              handleApplyDiagramTemplate(previewTemplate)
            } else {
              handleApplyTemplate(previewTemplate)
            }
          }
        }}
      />

      <TemplateImportDialog
        visible={importDialogVisible}
        onClose={() => setImportDialogVisible(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  )
}

export default TemplateGallery
