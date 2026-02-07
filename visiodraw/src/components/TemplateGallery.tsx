/**
 * 模板库组件
 */

import React, { useState, useMemo, useCallback } from 'react'
import { Modal, Card, Button, Tag, Empty, Input, Radio, Space, Typography } from 'antd'
import {
  PartitionOutlined,
  TeamOutlined,
  ApartmentOutlined,
  BranchesOutlined,
  FileAddOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import useTemplateStore from '@stores/templateStore'
import useCanvasStore from '@stores/canvasStore'
import { Template, TEMPLATE_CATEGORIES, TemplateCategoryInfo } from '@templates/types'
import { Shape } from '@stores/canvasStore'
import { v4 as uuidv4 } from 'uuid'

const { Title, Text } = Typography
const { Search } = Input

interface TemplateGalleryProps {
  visible: boolean
  onClose: () => void
  onSelectTemplate?: (template: Template) => void
}

const iconMap: Record<string, React.ReactNode> = {
  PartitionOutlined: <PartitionOutlined />,
  TeamOutlined: <TeamOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  BranchesOutlined: <BranchesOutlined />,
  FileAddOutlined: <FileAddOutlined />,
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  visible,
  onClose,
  onSelectTemplate,
}) => {
  const {
    currentCategory,
    setCurrentCategory,
    getAllTemplates,
    getTemplatesByCategory,
  } = useTemplateStore()

  const { shapes, addShape, newCanvas } = useCanvasStore()

  const [searchText, setSearchText] = useState('')
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')

  // 获取当前显示的模板列表 - 使用 useMemo 缓存
  const displayedTemplates = useMemo((): Template[] => {
    let templates: Template[]
    if (currentCategory === 'all') {
      templates = getAllTemplates()
    } else {
      templates = getTemplatesByCategory(currentCategory)
    }

    // 搜索过滤
    if (searchText) {
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchText.toLowerCase()) ||
          t.description.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    return templates
  }, [currentCategory, getAllTemplates, getTemplatesByCategory, searchText])

  // 选择模板 - 使用 useCallback 缓存
  const handleSelectTemplate = useCallback((template: Template) => {
    // 清空当前画布
    newCanvas()

    // 加载模板中的图形
    template.shapes.forEach((shape: Shape) => {
      const newShape = {
        ...shape,
        id: uuidv4(), // 生成新的ID避免冲突
      }
      addShape(newShape)
    })

    onSelectTemplate?.(template)
    onClose()
  }, [addShape, newCanvas, onClose, onSelectTemplate])

  // 保存当前文档为模板 - 使用 useCallback 缓存
  const handleSaveAsTemplate = useCallback(() => {
    if (!templateName.trim()) {
      return
    }

    useTemplateStore.getState().addCustomTemplate({
      name: templateName,
      description: templateDescription,
      category: 'custom',
      shapes: [...shapes],
      version: '1.0.0',
    })

    setIsSaveModalVisible(false)
    setTemplateName('')
    setTemplateDescription('')
  }, [templateName, templateDescription, shapes])

  // 渲染模板卡片 - 使用 useCallback 缓存
  const renderTemplateCard = useCallback((template: Template) => (
    <Card
      key={template.id}
      hoverable
      className="template-card"
      onClick={() => handleSelectTemplate(template)}
      cover={
        <div
          style={{
            height: 120,
            background: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #e8e8e8',
          }}
        >
          {template.thumbnail ? (
            <img
              src={template.thumbnail}
              alt={template.name}
              style={{ maxHeight: '100%', maxWidth: '100%' }}
            />
          ) : (
            <div
              style={{
                fontSize: 48,
                color: '#bfbfbf',
              }}
            >
              {iconMap[
                TEMPLATE_CATEGORIES.find((c: TemplateCategoryInfo) => c.key === template.category)
                  ?.icon || 'FileAddOutlined'
              ]}
            </div>
          )}
        </div>
      }
      actions={[
        <Button type="link" key="use" onClick={() => handleSelectTemplate(template)}>
          使用此模板
        </Button>,
      ]}
    >
      <Card.Meta
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{template.name}</span>
            {template.isBuiltIn && <Tag color="blue">内置</Tag>}
          </div>
        }
        description={
          <div>
            <Text type="secondary" ellipsis>
              {template.description}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag>
                {TEMPLATE_CATEGORIES.find((c: TemplateCategoryInfo) => c.key === template.category)?.name}
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {template.shapes.length} 个图形
              </Text>
            </div>
          </div>
        }
      />
    </Card>
  ), [handleSelectTemplate])

  return (
    <>
      <Modal
        title="模板库"
        open={visible}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsSaveModalVisible(true)}
            disabled={shapes.length === 0}
          >
            保存当前为模板
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Search
              placeholder="搜索模板..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
            <Radio.Group
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">全部</Radio.Button>
              {TEMPLATE_CATEGORIES.map((category: TemplateCategoryInfo) => (
                <Radio.Button key={category.key} value={category.key}>
                  {category.name}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Space>
        </div>

        {displayedTemplates.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
              maxHeight: 500,
              overflowY: 'auto',
              padding: 8,
            }}
          >
            {displayedTemplates.map(renderTemplateCard)}
          </div>
        ) : (
          <Empty
            description="暂无模板"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ margin: '40px 0' }}
          />
        )}

        {/* 分类说明 */}
        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
          <Title level={5}>分类说明</Title>
          <Space wrap>
            {TEMPLATE_CATEGORIES.map((category: TemplateCategoryInfo) => (
              <div key={category.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {iconMap[category.icon]}
                <Text strong>{category.name}</Text>
                <Text type="secondary">- {category.description}</Text>
              </div>
            ))}
          </Space>
        </div>
      </Modal>

      {/* 保存模板对话框 */}
      <Modal
        title="保存为模板"
        open={isSaveModalVisible}
        onOk={handleSaveAsTemplate}
        onCancel={() => {
          setIsSaveModalVisible(false)
          setTemplateName('')
          setTemplateDescription('')
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>模板名称</Text>
            <Input
              placeholder="请输入模板名称"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          <div>
            <Text strong>模板描述</Text>
            <Input.TextArea
              placeholder="请输入模板描述"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Text type="secondary">当前画布包含 {shapes.length} 个图形</Text>
        </Space>
      </Modal>
    </>
  )
}

export default TemplateGallery
