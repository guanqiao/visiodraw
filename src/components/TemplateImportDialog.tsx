import React, { useState, useCallback, useRef } from 'react'
import {
  Modal,
  Button,
  Upload,
  message,
  List,
  Card,
  Typography,
  Space,
  Tag,
  Progress,
  Alert,
  Empty,
  Tooltip,
  Badge,
  Divider,
  Row,
  Col,
  Image,
} from 'antd'
import {
  UploadOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  DeleteOutlined,
  ImportOutlined,
  InboxOutlined,
  FileAddOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload'
import type { Template } from '../types/template'
import { saveCustomTemplate } from '../templates/templateRegistry'
import { generateTemplateThumbnail } from '../utils/templateThumbnailGenerator'
import TemplatePreviewModal from './TemplatePreviewModal'
import { devError, devWarn } from '../utils/logger'

const { Dragger } = Upload
const { Text, Title } = Typography

interface ImportItem {
  id: string
  file: File
  template?: Template
  status: 'pending' | 'parsing' | 'success' | 'error'
  error?: string
  thumbnail?: string
}

interface TemplateImportDialogProps {
  visible: boolean
  onClose: () => void
  onImportSuccess: () => void
}

const TemplateImportDialog: React.FC<TemplateImportDialogProps> = ({
  visible,
  onClose,
  onImportSuccess,
}) => {
  const [importItems, setImportItems] = useState<ImportItem[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [previewItem, setPreviewItem] = useState<ImportItem | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 验证模板数据
  const validateTemplate = (data: any): { valid: boolean; error?: string } => {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '无效的 JSON 格式' }
    }

    if (!data.name || typeof data.name !== 'string') {
      return { valid: false, error: '缺少模板名称' }
    }

    if (!data.shapes || !Array.isArray(data.shapes)) {
      return { valid: false, error: '缺少 shapes 数据' }
    }

    return { valid: true }
  }

  // 解析模板文件
  const parseTemplateFile = async (file: File): Promise<ImportItem> => {
    const item: ImportItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'parsing',
    }

    try {
      const content = await file.text()
      const data = JSON.parse(content)

      const validation = validateTemplate(data)
      if (!validation.valid) {
        return {
          ...item,
          status: 'error',
          error: validation.error,
        }
      }

      // 生成缩略图
      let thumbnail: string | undefined
      try {
        thumbnail = generateTemplateThumbnail(data)
      } catch (e) {
        devWarn('生成缩略图失败:', e)
      }

      return {
        ...item,
        template: data as Template,
        status: 'success',
        thumbnail,
      }
    } catch (error) {
      return {
        ...item,
        status: 'error',
        error: error instanceof Error ? error.message : '解析失败',
      }
    }
  }

  // 处理文件选择
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newItems: ImportItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 检查文件类型
      if (!file.name.endsWith('.json')) {
        message.warning(`${file.name} 不是 JSON 文件，已跳过`)
        continue
      }

      // 检查文件大小 (最大 5MB)
      if (file.size > 5 * 1024 * 1024) {
        message.warning(`${file.name} 文件过大，已跳过`)
        continue
      }

      const item: ImportItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        status: 'pending',
      }
      newItems.push(item)
    }

    if (newItems.length === 0) return

    setImportItems((prev) => [...prev, ...newItems])

    // 逐个解析文件
    for (const item of newItems) {
      const parsedItem = await parseTemplateFile(item.file)
      setImportItems((prev) =>
        prev.map((i) => (i.id === item.id ? parsedItem : i))
      )
    }
  }

  // 处理拖拽上传
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files)
  }, [])

  // 处理文件输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // 重置 input 以便可以重复选择同一文件
    e.target.value = ''
  }

  // 删除导入项
  const handleRemoveItem = (id: string) => {
    setImportItems((prev) => prev.filter((item) => item.id !== id))
  }

  // 清空所有
  const handleClearAll = () => {
    setImportItems([])
  }

  // 执行导入
  const handleImport = async () => {
    const validItems = importItems.filter((item) => item.status === 'success' && item.template)

    if (validItems.length === 0) {
      message.warning('没有可导入的模板')
      return
    }

    setIsImporting(true)
    let successCount = 0
    let errorCount = 0

    for (const item of validItems) {
      try {
        if (item.template) {
          saveCustomTemplate({
            name: item.template.name,
            description: item.template.description || '',
            category: 'custom',
            shapes: item.template.shapes,
            connectors: item.template.connectors || [],
            thumbnail: item.thumbnail || '',
          })
          successCount++
        }
      } catch (error) {
        devError('导入模板失败:', error)
        errorCount++
      }
    }

    setIsImporting(false)

    if (successCount > 0) {
      message.success(`成功导入 ${successCount} 个模板`)
      onImportSuccess()
      setImportItems([])
    }

    if (errorCount > 0) {
      message.error(`${errorCount} 个模板导入失败`)
    }
  }

  // 预览模板
  const handlePreview = (item: ImportItem) => {
    setPreviewItem(item)
    setPreviewVisible(true)
  }

  // 获取状态统计
  const getStats = () => {
    const total = importItems.length
    const success = importItems.filter((i) => i.status === 'success').length
    const error = importItems.filter((i) => i.status === 'error').length
    const pending = importItems.filter((i) => i.status === 'pending' || i.status === 'parsing').length

    return { total, success, error, pending }
  }

  const stats = getStats()

  // 渲染导入项
  const renderImportItem = (item: ImportItem) => {
    const isSuccess = item.status === 'success'
    const isError = item.status === 'error'
    const isPending = item.status === 'pending' || item.status === 'parsing'

    return (
      <List.Item
        key={item.id}
        actions={[
          isSuccess && (
            <Tooltip title="预览">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handlePreview(item)}
              />
            </Tooltip>
          ),
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(item.id)}
            />
          </Tooltip>,
        ]}
      >
        <List.Item.Meta
          avatar={
            <div style={{ width: 80, height: 60, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.file.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  preview={false}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <FileOutlined style={{ fontSize: 24, color: '#d9d9d9' }} />
                </div>
              )}
            </div>
          }
          title={
            <Space>
              <Text strong>{item.file.name}</Text>
              {isSuccess && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              {isError && <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              {isPending && <Badge status="processing" />}
            </Space>
          }
          description={
            <Space direction="vertical" size={0}>
              {item.template && (
                <Text type="secondary">
                  {item.template.name} • {item.template.shapes?.length || 0} 个节点
                </Text>
              )}
              {isError && (
                <Text type="danger" style={{ fontSize: 12 }}>
                  <WarningOutlined /> {item.error}
                </Text>
              )}
              {isPending && <Text type="secondary" style={{ fontSize: 12 }}>解析中...</Text>}
            </Space>
          }
        />
      </List.Item>
    )
  }

  return (
    <>
      <Modal
        title="导入模板"
        open={visible}
        onCancel={() => {
          if (!isImporting) {
            onClose()
            setImportItems([])
          }
        }}
        width={700}
        footer={[
          <Button
            key="clear"
            onClick={handleClearAll}
            disabled={importItems.length === 0 || isImporting}
          >
            清空
          </Button>,
          <Button key="cancel" onClick={onClose} disabled={isImporting}>
            取消
          </Button>,
          <Button
            key="import"
            type="primary"
            icon={<ImportOutlined />}
            loading={isImporting}
            disabled={stats.success === 0}
            onClick={handleImport}
          >
            导入 ({stats.success})
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* 拖拽上传区域 */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{
              border: '2px dashed #d9d9d9',
              borderRadius: 8,
              padding: '40px 20px',
              textAlign: 'center',
              background: '#fafafa',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1890ff'
              e.currentTarget.style.background = '#e6f7ff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d9d9d9'
              e.currentTarget.style.background = '#fafafa'
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />
            <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <p style={{ marginTop: 16, marginBottom: 8 }}>
              <Text strong>点击或拖拽文件到此处上传</Text>
            </p>
            <p style={{ color: '#8c8c8c', fontSize: 12 }}>
              支持 .json 格式的模板文件，单个文件不超过 5MB
            </p>
          </div>

          {/* 统计信息 */}
          {importItems.length > 0 && (
            <Alert
              message={
                <Space>
                  <span>总计: <Badge count={stats.total} style={{ backgroundColor: '#1890ff' }} /></span>
                  <span>成功: <Badge count={stats.success} style={{ backgroundColor: '#52c41a' }} /></span>
                  <span>失败: <Badge count={stats.error} style={{ backgroundColor: '#ff4d4f' }} /></span>
                  {stats.pending > 0 && <span>处理中: <Badge count={stats.pending} style={{ backgroundColor: '#faad14' }} /></span>}
                </Space>
              }
              type="info"
              showIcon
            />
          )}

          {/* 导入列表 */}
          {importItems.length > 0 ? (
            <Card
              title="待导入列表"
              size="small"
              bodyStyle={{ padding: 0, maxHeight: 300, overflow: 'auto' }}
            >
              <List
                dataSource={importItems}
                renderItem={renderImportItem}
                split
              />
            </Card>
          ) : (
            <Empty
              image={<FileAddOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
              description="暂无待导入的模板文件"
            />
          )}
        </Space>
      </Modal>

      {/* 预览弹窗 */}
      <TemplatePreviewModal
        visible={previewVisible}
        template={previewItem?.template || null}
        onClose={() => {
          setPreviewVisible(false)
          setPreviewItem(null)
        }}
        onApply={() => {
          setPreviewVisible(false)
          setPreviewItem(null)
        }}
      />
    </>
  )
}

export default TemplateImportDialog
