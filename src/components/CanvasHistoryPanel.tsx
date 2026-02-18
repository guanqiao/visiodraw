import React, { useState } from 'react'
import { Modal, List, Button, Input, Popconfirm, Empty, Typography, Space, Tooltip } from 'antd'
import { DeleteOutlined, EditOutlined, ImportOutlined, SaveOutlined, HistoryOutlined, ClearOutlined } from '@ant-design/icons'
import useCanvasHistoryStore, { CanvasHistoryItem } from '@stores/canvasHistoryStore'
import useX6GraphStore from '@stores/x6GraphStore'
import dayjs from 'dayjs'
import { devError } from '../utils/logger'

interface CanvasHistoryPanelProps {
  visible: boolean
  onClose: () => void
}

const CanvasHistoryPanel: React.FC<CanvasHistoryPanelProps> = ({ visible, onClose }) => {
  const { history, addToHistory, deleteFromHistory, loadHistory, clearHistory, updateHistoryName } = useCanvasHistoryStore()
  const { exportToJson, importFromJson, graph } = useX6GraphStore()
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [saveName, setSaveName] = useState('')

  const handleSaveCurrent = async () => {
    if (!graph) return
    
    const data = exportToJson()
    let thumbnail = ''
    
    // Try to generate thumbnail
    try {
      thumbnail = await useX6GraphStore.getState().exportToPng()
    } catch (error) {
      devError('Failed to generate thumbnail:', error)
    }
    
    addToHistory(saveName || `画布 ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, data, thumbnail)
    setSaveName('')
  }

  const handleLoad = (item: CanvasHistoryItem) => {
    importFromJson(item.data)
    onClose()
  }

  const handleDelete = (id: string) => {
    deleteFromHistory(id)
  }

  const handleStartEdit = (item: CanvasHistoryItem) => {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  const handleSaveEdit = () => {
    if (editingId) {
      updateHistoryName(editingId, editingName)
      setEditingId(null)
      setEditingName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleClearAll = () => {
    clearHistory()
  }

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined />
          <span>画布历史记录</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Typography.Text type="secondary">
          保存当前画布到历史记录，或从历史记录中加载之前的画布。
        </Typography.Text>
      </div>

      {/* Save current canvas */}
      <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <Typography.Text strong>保存当前画布</Typography.Text>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <Input
            placeholder="输入画布名称（可选）"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onPressEnter={handleSaveCurrent}
            style={{ flex: 1 }}
          />
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            onClick={handleSaveCurrent}
          >
            保存
          </Button>
        </div>
      </div>

      {/* History list */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Text strong>历史记录 ({history.length})</Typography.Text>
        {history.length > 0 && (
          <Popconfirm
            title="确定要清空所有历史记录吗？"
            onConfirm={handleClearAll}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small" icon={<ClearOutlined />}>
              清空全部
            </Button>
          </Popconfirm>
        )}
      </div>

      {history.length === 0 ? (
        <Empty description="暂无历史记录" />
      ) : (
        <List
          dataSource={history}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Tooltip title="加载此画布">
                  <Button
                    type="primary"
                    icon={<ImportOutlined />}
                    onClick={() => handleLoad(item)}
                  >
                    加载
                  </Button>
                </Tooltip>,
                <Tooltip title="重命名">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleStartEdit(item)}
                  />
                </Tooltip>,
                <Popconfirm
                  title="确定要删除这条记录吗？"
                  onConfirm={() => handleDelete(item.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Tooltip title="删除">
                    <Button danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      style={{ width: 80, height: 60, objectFit: 'contain', border: '1px solid #d9d9d9', borderRadius: 4 }}
                    />
                  ) : (
                    <div style={{ width: 80, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HistoryOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
                    </div>
                  )
                }
                title={
                  editingId === item.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onPressEnter={handleSaveEdit}
                      onBlur={handleSaveEdit}
                      autoFocus
                      size="small"
                      style={{ width: 200 }}
                    />
                  ) : (
                    <Typography.Text strong>{item.name}</Typography.Text>
                  )
                }
                description={dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  )
}

export default CanvasHistoryPanel
