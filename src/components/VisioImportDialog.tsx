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
  Alert,
  Empty,
  Tooltip,
  Badge,
  Spin,
  Progress,
} from 'antd'
import {
  UploadOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ImportOutlined,
  InboxOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload'
import type { Template } from '../types/template'
import {
  validateVisioFile,
  parseVisioFile,
  convertVisioToTemplate,
} from '../utils/visioConverter'
import { saveCustomTemplate } from '../templates/templateRegistry'

const { Dragger } = Upload
const { Text, Title } = Typography

interface VisioImportDialogProps {
  visible: boolean
  onClose: () => void
  onImportSuccess: () => void
}

interface ImportItem {
  id: string
  file: File
  template?: Template
  status: 'pending' | 'parsing' | 'success' | 'error'
  error?: string
  progress: number
}

const VisioImportDialog: React.FC<VisioImportDialogProps> = ({
  visible,
  onClose,
  onImportSuccess,
}) => {
  const [importItems, setImportItems] = useState<ImportItem[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newItems: ImportItem[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // 验证文件
      const validation = validateVisioFile(file)
      if (!validation.valid) {
        message.warning(`${file.name}: ${validation.error}`)
        continue
      }

      const item: ImportItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        status: 'pending',
        progress: 0,
      }
      newItems.push(item)
    }

    if (newItems.length === 0) return

    setImportItems((prev) => [...prev, ...newItems])

    // 逐个解析文件
    for (const item of newItems) {
      await parseFile(item)
    }
  }

  // 解析文件
  const parseFile = async (item: ImportItem) => {
    setImportItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'parsing', progress: 30 } : i))
    )

    try {
      const result = await parseVisioFile(item.file)

      if (!result.success) {
        setImportItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: 'error', error: result.error, progress: 0 }
              : i
          )
        )
        return
      }

      setImportItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, progress: 60 } : i))
      )

      // 转换为模板
      const template = await convertVisioToTemplate({
        pages: result.pages,
        shapes: result.shapes,
        connectors: result.connectors,
      })

      setImportItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, template, status: 'success', progress: 100 } : i
        )
      )
    } catch (error) {
      setImportItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'error',
                error: error instanceof Error ? error.message : '解析失败',
                progress: 0,
              }
            : i
        )
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
          })
          successCount++
        }
      } catch (error) {
        console.error('导入模板失败:', error)
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
          <Tooltip title="删除" key="delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(item.id)}
              disabled={isImporting}
            />
          </Tooltip>,
        ]}
      >
        <List.Item.Meta
          avatar={
            <div style={{ fontSize: 24 }}>
              {isSuccess && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              {isError && <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              {isPending && <Spin size="small" />}
            </div>
          }
          title={
            <Space>
              <Text strong>{item.file.name}</Text>
              {isSuccess && <Tag color="success">成功</Tag>}
              {isError && <Tag color="error">失败</Tag>}
              {isPending && <Tag color="processing">处理中</Tag>}
            </Space>
          }
          description={
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              {item.template && (
                <Text type="secondary">
                  {item.template.name} • {item.template.shapes?.length || 0} 个图形
                </Text>
              )}
              {isError && (
                <Text type="danger" style={{ fontSize: 12 }}>
                  {item.error}
                </Text>
              )}
              {isPending && (
                <Progress
                  percent={item.progress}
                  size="small"
                  status="active"
                  style={{ width: 200 }}
                />
              )}
            </Space>
          }
        />
      </List.Item>
    )
  }

  return (
    <Modal
      title="导入 Visio 文件"
      open={visible}
      onCancel={() => {
        if (!isImporting) {
          onClose()
          setImportItems([])
        }
      }}
      width={700}
      footer={[
        <Button key="clear" onClick={handleClearAll} disabled={importItems.length === 0 || isImporting}>
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
            accept=".vsdx"
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />
          <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <p style={{ marginTop: 16, marginBottom: 8 }}>
            <Text strong>点击或拖拽 Visio 文件到此处</Text>
          </p>
          <p style={{ color: '#8c8c8c', fontSize: 12 }}>
            支持 .vsdx 格式，单个文件不超过 10MB
          </p>
        </div>

        {/* 统计信息 */}
        {importItems.length > 0 && (
          <Alert
            message={
              <Space>
                <span>
                  总计: <Badge count={stats.total} style={{ backgroundColor: '#1890ff' }} />
                </span>
                <span>
                  成功: <Badge count={stats.success} style={{ backgroundColor: '#52c41a' }} />
                </span>
                <span>
                  失败: <Badge count={stats.error} style={{ backgroundColor: '#ff4d4f' }} />
                </span>
                {stats.pending > 0 && (
                  <span>
                    处理中: <Badge count={stats.pending} style={{ backgroundColor: '#faad14' }} />
                  </span>
                )}
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
            <List dataSource={importItems} renderItem={renderImportItem} split />
          </Card>
        ) : (
          <Empty
            image={<FileOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description="暂无待导入的 Visio 文件"
          />
        )}

        {/* 提示信息 */}
        <Alert
          message="Visio 导入说明"
          description="支持导入 .vsdx 格式的 Visio 文件。导入后会自动转换为模板格式，部分高级特性可能无法完全保留。"
          type="warning"
          showIcon
        />
      </Space>
    </Modal>
  )
}

export default VisioImportDialog
