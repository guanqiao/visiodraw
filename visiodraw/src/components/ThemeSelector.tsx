import React, { useState } from 'react'
import {
  Button,
  Card,
  ColorPicker,
  Form,
  Input,
  Modal,
  Radio,
  Space,
  Switch,
  Tooltip,
  message,
} from 'antd'
import {
  BgColorsOutlined,
  DownloadOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import useThemeStore, { presetThemes, type ThemeConfig, type ThemeType } from '../stores/themeStore'
import './ThemeSelector.css'

const ThemeSelector: React.FC = () => {
  const {
    currentTheme,
    customThemes,
    followSystem,
    setTheme,
    addCustomTheme,
    removeCustomTheme,
    toggleFollowSystem,
    exportTheme,
    importTheme,
  } = useThemeStore()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Partial<ThemeConfig>>({})

  // 处理主题切换
  const handleThemeChange = (themeType: ThemeType) => {
    setTheme(themeType)
    message.success(`已切换到${presetThemes[themeType]?.name || '自定义'}主题`)
  }

  // 打开自定义主题编辑器
  const openCustomThemeEditor = (theme?: ThemeConfig) => {
    if (theme) {
      setEditingTheme({ ...theme })
      setIsEditing(true)
    } else {
      setEditingTheme({
        name: '',
        type: 'custom',
        canvasBackground: '#ffffff',
        gridColor: '#e8e8e8',
        defaultFill: '#ffffff',
        defaultStroke: '#333333',
        defaultConnectorColor: '#666666',
        selectionColor: '#1890ff',
        alignmentLineColor: '#1890ff',
        defaultTextColor: '#333333',
        primaryColor: '#1890ff',
        isDark: false,
      })
      setIsEditing(false)
    }
    setIsModalVisible(true)
  }

  // 保存自定义主题
  const saveCustomTheme = () => {
    if (!editingTheme.name) {
      message.error('请输入主题名称')
      return
    }

    const theme: ThemeConfig = editingTheme as ThemeConfig

    if (isEditing) {
      // 更新现有主题
      setTheme('custom', theme)
      message.success('主题已更新')
    } else {
      // 添加新主题
      addCustomTheme(theme)
      setTheme('custom', theme)
      message.success('自定义主题已创建')
    }

    setIsModalVisible(false)
  }

  // 导出当前主题
  const handleExportTheme = () => {
    const themeJson = exportTheme()
    const blob = new Blob([themeJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentTheme.name}-theme.json`
    a.click()
    URL.revokeObjectURL(url)
    message.success('主题已导出')
  }

  // 导入主题
  const handleImportTheme = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const themeJson = event.target?.result as string
          if (importTheme(themeJson)) {
            message.success('主题导入成功')
          } else {
            message.error('主题导入失败，请检查文件格式')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // 渲染主题预览卡片
  const renderThemeCard = (
    key: string,
    theme: ThemeConfig,
    isCustom: boolean = false
  ) => {
    const isActive = currentTheme.name === theme.name

    return (
      <Card
        key={key}
        className={`theme-card ${isActive ? 'active' : ''}`}
        onClick={() => handleThemeChange(theme.type)}
        style={{
          background: theme.canvasBackground,
          borderColor: isActive ? theme.primaryColor : undefined,
        }}
      >
        <div className="theme-preview">
          <div
            className="theme-preview-shape"
            style={{
              background: theme.defaultFill,
              border: `2px solid ${theme.defaultStroke}`,
            }}
          />
          <div
            className="theme-preview-connector"
            style={{ background: theme.defaultConnectorColor }}
          />
        </div>
        <div className="theme-info">
          <span className="theme-name" style={{ color: theme.defaultTextColor }}>
            {theme.name}
          </span>
          {isCustom && (
            <Space className="theme-actions">
              <Tooltip title="编辑">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    openCustomThemeEditor(theme)
                  }}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCustomTheme(theme.name)
                    message.success('主题已删除')
                  }}
                />
              </Tooltip>
            </Space>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="theme-selector">
      <div className="theme-selector-header">
        <h4>
          <BgColorsOutlined /> 主题设置
        </h4>
        <Space>
          <Tooltip title="导出当前主题">
            <Button icon={<DownloadOutlined />} size="small" onClick={handleExportTheme}>
              导出
            </Button>
          </Tooltip>
          <Tooltip title="导入主题">
            <Button icon={<UploadOutlined />} size="small" onClick={handleImportTheme}>
              导入
            </Button>
          </Tooltip>
        </Space>
      </div>

      <div className="theme-selector-content">
        {/* 跟随系统主题 */}
        <div className="theme-follow-system">
          <span>跟随系统主题</span>
          <Switch checked={followSystem} onChange={toggleFollowSystem} />
        </div>

        {/* 预设主题 */}
        <div className="theme-section">
          <h5>预设主题</h5>
          <div className="theme-grid">
            {Object.entries(presetThemes).map(([key, theme]) =>
              renderThemeCard(key, theme)
            )}
          </div>
        </div>

        {/* 自定义主题 */}
        {customThemes.length > 0 && (
          <div className="theme-section">
            <h5>自定义主题</h5>
            <div className="theme-grid">
              {customThemes.map((theme, index) =>
                renderThemeCard(`custom-${index}`, theme, true)
              )}
            </div>
          </div>
        )}

        {/* 创建自定义主题按钮 */}
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={() => openCustomThemeEditor()}
          className="create-theme-btn"
        >
          创建自定义主题
        </Button>
      </div>

      {/* 自定义主题编辑器模态框 */}
      <Modal
        title={isEditing ? '编辑主题' : '创建自定义主题'}
        open={isModalVisible}
        onOk={saveCustomTheme}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form layout="vertical" className="theme-editor-form">
          <Form.Item label="主题名称" required>
            <Input
              value={editingTheme.name}
              onChange={(e) =>
                setEditingTheme({ ...editingTheme, name: e.target.value })
              }
              placeholder="输入主题名称"
            />
          </Form.Item>

          <Form.Item label="画布背景色">
            <ColorPicker
              value={editingTheme.canvasBackground}
              onChange={(color) =>
                setEditingTheme({
                  ...editingTheme,
                  canvasBackground: color.toHexString(),
                })
              }
            />
          </Form.Item>

          <Form.Item label="网格颜色">
            <ColorPicker
              value={editingTheme.gridColor}
              onChange={(color) =>
                setEditingTheme({
                  ...editingTheme,
                  gridColor: color.toHexString(),
                })
              }
            />
          </Form.Item>

          <Form.Item label="图形默认填充色">
            <ColorPicker
              value={editingTheme.defaultFill}
              onChange={(color) =>
                setEditingTheme({
                  ...editingTheme,
                  defaultFill: color.toHexString(),
                })
              }
            />
          </Form.Item>

          <Form.Item label="图形默认边框色">
            <ColorPicker
              value={editingTheme.defaultStroke}
              onChange={(color) =>
                setEditingTheme({
                  ...editingTheme,
                  defaultStroke: color.toHexString(),
                })
              }
            />
          </Form.Item>

          <Form.Item label="连接线默认颜色">
            <ColorPicker
              value={editingTheme.defaultConnectorColor}
              onChange={(color) =>
                setEditingTheme({
                  ...editingTheme,
                  defaultConnectorColor: color.toHexString(),
                })
              }
            />
          </Form.Item>

          <Form.Item label="选中状态颜色">
            <ColorPicker
              value={editingTheme.selectionColor}
              onChange={(color) =>
                setEditingTheme({
                  ...editingTheme,
                  selectionColor: color.toHexString(),
                })
              }
            />
          </Form.Item>

          <Form.Item label="对齐线颜色">
            <ColorPicker
              value={editingTheme.alignmentLineColor}
              onChange={(color) =>
                setEditingTheme({
                  ...editingTheme,
                  alignmentLineColor: color.toHexString(),
                })
              }
            />
          </Form.Item>

          <Form.Item label="文本默认颜色">
            <ColorPicker
              value={editingTheme.defaultTextColor}
              onChange={(color) =>
                setEditingTheme({
                  ...editingTheme,
                  defaultTextColor: color.toHexString(),
                })
              }
            />
          </Form.Item>

          <Form.Item label="主题色">
            <ColorPicker
              value={editingTheme.primaryColor}
              onChange={(color) =>
                setEditingTheme({
                  ...editingTheme,
                  primaryColor: color.toHexString(),
                })
              }
            />
          </Form.Item>

          <Form.Item label="深色主题">
            <Radio.Group
              value={editingTheme.isDark}
              onChange={(e) =>
                setEditingTheme({ ...editingTheme, isDark: e.target.value })
              }
            >
              <Radio.Button value={false}>浅色</Radio.Button>
              <Radio.Button value={true}>深色</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ThemeSelector
