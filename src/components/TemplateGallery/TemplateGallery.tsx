import React, { useCallback, useMemo } from 'react'
import {
  Modal,
  Row,
  Col,
  Button,
  Input,
  Empty,
  Tabs,
  Badge,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
  CodeOutlined,
} from '@ant-design/icons'
import useX6GraphStore from '@stores/x6GraphStore'
import type { Template } from '../../types/template'
import type { DiagramTemplate, DiagramType } from '../../types/diagramTemplate'
import { saveCustomTemplate, deleteCustomTemplate } from '../../templates/templateRegistry'
import { buildDiagramTemplate } from '../../utils/diagramTemplateBuilder'
import {
  generateTemplateThumbnail,
  generateDiagramTemplateThumbnail,
} from '../../utils/templateThumbnailGenerator'
import TemplatePreviewModal from '../TemplatePreviewModal'
import TemplateImportDialog from '../TemplateImportDialog'
import { devError } from '../../utils/logger'
import {
  TemplateCard,
  DiagramTemplateCard,
  getCachedThumbnail,
  getCategoryColor,
} from './TemplateCard'
import { useTemplates } from './useTemplates'

const { TabPane } = Tabs
const { Search } = Input

interface TemplateGalleryProps {
  visible: boolean
  onClose: () => void
  onOpenMermaidImport?: () => void
}

const diagramTypeNames: Record<DiagramType, string> = {
  activity: '活动图',
  sequence: '序列图',
  state: '状态图',
  er: 'ER图',
  class: '类图',
  gantt: '甘特图',
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  visible,
  onClose,
  onOpenMermaidImport,
}) => {
  const {
    templates,
    customTemplates,
    diagramTemplates,
    favorites,
    searchText,
    setSearchText,
    activeTab,
    setActiveTab,
    activeDiagramTab,
    setActiveDiagramTab,
    filteredTemplates,
    filteredCustomTemplates,
    diagramTemplatesByType,
    refreshTemplates,
    toggleFavorite,
    isFavorite,
  } = useTemplates({ visible })

  const [previewTemplate, setPreviewTemplate] = React.useState<Template | DiagramTemplate | null>(
    null
  )
  const [previewVisible, setPreviewVisible] = React.useState(false)
  const [importDialogVisible, setImportDialogVisible] = React.useState(false)

  const { nodes, edges, addNodes, addEdges, newGraph } = useX6GraphStore()

  // 应用模板
  const handleApplyTemplate = useCallback(
    (template: Template) => {
      newGraph()

      if (template.shapes && template.shapes.length > 0) {
        addNodes(template.shapes)
      }

      if (template.connectors && template.connectors.length > 0) {
        const convertedConnectors = template.connectors.map((connector) => ({
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
            labels: [
              { id: `${connector.id}-label`, text: connector.label, position: 0.5 },
            ],
          }),
        }))
        addEdges(convertedConnectors)
      }

      onClose()
    },
    [newGraph, addNodes, addEdges, onClose]
  )

  // 应用图表模板
  const handleApplyDiagramTemplate = useCallback(
    (template: DiagramTemplate) => {
      newGraph()

      const { nodes: templateNodes, edges: templateEdges } = buildDiagramTemplate(template)

      if (templateNodes.length > 0) {
        addNodes(templateNodes)
      }

      if (templateEdges.length > 0) {
        addEdges(templateEdges)
      }

      onClose()
    },
    [newGraph, addNodes, addEdges, onClose]
  )

  // 保存为模板
  const handleSaveAsTemplate = useCallback(async () => {
    if (nodes.length === 0) {
      return
    }

    const name = window.prompt('请输入模板名称:')
    if (!name) return

    const description = window.prompt('请输入模板描述（可选）:') || ''

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
      refreshTemplates()
    } catch (error) {
      devError('保存模板失败:', error)
    }
  }, [nodes, edges, refreshTemplates])

  // 删除模板
  const handleDeleteTemplate = useCallback(
    (templateId: string) => {
      try {
        deleteCustomTemplate(templateId)
        refreshTemplates()
      } catch (error) {
        devError('删除模板失败:', error)
      }
    },
    [refreshTemplates]
  )

  // 导出模板
  const handleExportTemplate = useCallback((template: Template) => {
    const data = JSON.stringify(template, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${template.name}.template.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  // 导入成功
  const handleImportSuccess = useCallback(() => {
    refreshTemplates()
    setImportDialogVisible(false)
  }, [refreshTemplates])

  // 打开预览
  const openPreview = useCallback((template: Template | DiagramTemplate) => {
    setPreviewTemplate(template)
    setPreviewVisible(true)
  }, [])

  // 获取缩略图
  const getThumbnail = useCallback((template: Template | DiagramTemplate): string => {
    return getCachedThumbnail(template, () => {
      if ('nodes' in template) {
        return generateDiagramTemplateThumbnail(template)
      } else {
        return generateTemplateThumbnail(template)
      }
    })
  }, [])

  // 渲染图表模板标签页
  const renderDiagramTabs = useMemo(() => {
    return (
      <Tabs activeKey={activeDiagramTab} onChange={(key) => setActiveDiagramTab(key as DiagramType)}>
        {(Object.keys(diagramTypeNames) as DiagramType[]).map((type) => (
          <TabPane tab={diagramTypeNames[type]} key={type}>
            <Row gutter={[16, 16]}>
              {diagramTemplatesByType[type].length > 0 ? (
                diagramTemplatesByType[type].map((template) => (
                  <DiagramTemplateCard
                    key={template.id}
                    template={template}
                    thumbnail={getThumbnail(template)}
                    isFavorite={isFavorite(template.id)}
                    categoryColor={getCategoryColor(template.type)}
                    hasMermaidCode={!!template.mermaidCode}
                    onApply={() => handleApplyDiagramTemplate(template)}
                    onPreview={() => openPreview(template)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))
              ) : (
                <Col span={24}>
                  <Empty description={`暂无${diagramTypeNames[type]}模板`} />
                </Col>
              )}
            </Row>
          </TabPane>
        ))}
      </Tabs>
    )
  }, [
    activeDiagramTab,
    diagramTemplatesByType,
    getThumbnail,
    handleApplyDiagramTemplate,
    isFavorite,
    openPreview,
    setActiveDiagramTab,
    toggleFavorite,
  ])

  // 按分类获取模板
  const getTemplatesByCategory = useCallback(
    (category: 'flowchart' | 'org' | 'network' | 'uml') => {
      return filteredTemplates.filter((t) => t.category === category)
    },
    [filteredTemplates]
  )

  // 渲染分类模板
  const renderCategoryTemplates = useCallback(
    (category: 'flowchart' | 'org' | 'network' | 'uml') => {
      const categoryTemplates = getTemplatesByCategory(category)

      return (
        <Row gutter={[16, 16]}>
          {categoryTemplates.length > 0 ? (
            categoryTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                thumbnail={getThumbnail(template)}
                isCustom={false}
                isFavorite={isFavorite(template.id)}
                categoryColor={getCategoryColor(template.category)}
                onApply={() => handleApplyTemplate(template)}
                onPreview={() => openPreview(template)}
                onToggleFavorite={() => toggleFavorite(template.id)}
              />
            ))
          ) : (
            <Col span={24}>
              <Empty description="暂无模板" />
            </Col>
          )}
        </Row>
      )
    },
    [getTemplatesByCategory, getThumbnail, handleApplyTemplate, isFavorite, openPreview, toggleFavorite]
  )

  // 渲染自定义模板
  const renderCustomTemplates = useCallback(() => {
    return (
      <Row gutter={[16, 16]}>
        {filteredCustomTemplates.length > 0 ? (
          filteredCustomTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              thumbnail={getThumbnail(template)}
              isCustom={true}
              isFavorite={isFavorite(template.id)}
              categoryColor={getCategoryColor('custom')}
              onApply={() => handleApplyTemplate(template)}
              onExport={() => handleExportTemplate(template)}
              onDelete={() => handleDeleteTemplate(template.id)}
              onPreview={() => openPreview(template)}
              onToggleFavorite={() => toggleFavorite(template.id)}
            />
          ))
        ) : (
          <Col span={24}>
            <Empty description="暂无自定义模板，可以将当前画布保存为模板" />
          </Col>
        )}
      </Row>
    )
  }, [
    filteredCustomTemplates,
    getThumbnail,
    handleApplyTemplate,
    handleDeleteTemplate,
    handleExportTemplate,
    isFavorite,
    openPreview,
    toggleFavorite,
  ])

  return (
    <>
      <Modal
        title="模板库"
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={[
          <Button
            key="import"
            icon={<ImportOutlined />}
            onClick={() => setImportDialogVisible(true)}
          >
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

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'flowchart' | 'org' | 'network' | 'uml' | 'custom' | 'diagram')}
        >
          <TabPane tab="图表模板" key="diagram">
            {renderDiagramTabs}
          </TabPane>
          <TabPane tab="流程图" key="flowchart">
            {renderCategoryTemplates('flowchart')}
          </TabPane>
          <TabPane tab="组织结构" key="org">
            {renderCategoryTemplates('org')}
          </TabPane>
          <TabPane tab="网络拓扑" key="network">
            {renderCategoryTemplates('network')}
          </TabPane>
          <TabPane tab="UML" key="uml">
            {renderCategoryTemplates('uml')}
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
            {renderCustomTemplates()}
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
