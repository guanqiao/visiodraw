import React, { useState, useEffect } from 'react'
import {
  Button,
  List,
  Tooltip,
  Input,
  Popconfirm,
  Badge,
  Empty,
  Space,
} from 'antd'
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  FileOutlined,
} from '@ant-design/icons'
import useLayerStore from '../stores/layerStore'
import './LayerPanel.css'

const LayerPanel: React.FC = () => {
  const {
    layers,
    activeLayerId,
    defaultLayerId,
    initDefaultLayer,
    addLayer,
    deleteLayer,
    renameLayer,
    setActiveLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    moveLayer,
  } = useLayerStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // 初始化默认图层
  useEffect(() => {
    initDefaultLayer()
  }, [initDefaultLayer])

  // 按order排序图层（倒序，上面的图层显示在前面）
  const sortedLayers = [...layers].sort((a, b) => b.order - a.order)

  // 处理添加图层
  const handleAddLayer = () => {
    const newId = addLayer()
    // 自动选中新图层
    setActiveLayer(newId)
  }

  // 处理删除图层
  const handleDeleteLayer = (id: string) => {
    deleteLayer(id)
  }

  // 开始编辑图层名称
  const startEditing = (layer: typeof layers[0]) => {
    setEditingId(layer.id)
    setEditingName(layer.name)
  }

  // 保存图层名称
  const saveEditing = () => {
    if (editingId && editingName.trim()) {
      renameLayer(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }

  // 取消编辑
  const cancelEditing = () => {
    setEditingId(null)
    setEditingName('')
  }

  // 渲染图层项
  const renderLayerItem = (layer: typeof layers[0]) => {
    const isActive = layer.id === activeLayerId
    const isDefault = layer.id === defaultLayerId
    const isEditing = layer.id === editingId

    return (
      <List.Item
        className={`layer-item ${isActive ? 'active' : ''} ${layer.locked ? 'locked' : ''}`}
        onClick={() => !layer.locked && setActiveLayer(layer.id)}
      >
        <div className="layer-item-content">
          {/* 可见性按钮 */}
          <Tooltip title={layer.visible ? '隐藏图层' : '显示图层'}>
            <Button
              type="text"
              size="small"
              icon={layer.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                toggleLayerVisibility(layer.id)
              }}
              className={layer.visible ? '' : 'inactive'}
            />
          </Tooltip>

          {/* 锁定按钮 */}
          <Tooltip title={layer.locked ? '解锁图层' : '锁定图层'}>
            <Button
              type="text"
              size="small"
              icon={layer.locked ? <LockOutlined /> : <UnlockOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                toggleLayerLock(layer.id)
              }}
              className={layer.locked ? 'locked-icon' : ''}
            />
          </Tooltip>

          {/* 图层图标 */}
          <FileOutlined className="layer-icon" />

          {/* 图层名称 */}
          {isEditing ? (
            <div className="layer-name-edit" onClick={(e) => e.stopPropagation()}>
              <Input
                size="small"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onPressEnter={saveEditing}
                autoFocus
                style={{ width: 100 }}
              />
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={saveEditing}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={cancelEditing}
              />
            </div>
          ) : (
            <div className="layer-name" onDoubleClick={() => startEditing(layer)}>
              <Badge
                status={isActive ? 'processing' : 'default'}
                text={
                  <span className={isActive ? 'active-text' : ''}>
                    {layer.name}
                    {isDefault && <span className="default-badge">默认</span>}
                  </span>
                }
              />
            </div>
          )}

          {/* 图形数量 */}
          <span className="layer-shape-count">
            {layer.shapeIds.length}
          </span>

          {/* 操作按钮组 */}
          {!isEditing && (
            <Space className="layer-actions" size={0}>
              <Tooltip title="重命名">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    startEditing(layer)
                  }}
                />
              </Tooltip>

              <Tooltip title="上移">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    moveLayer(layer.id, 'up')
                  }}
                  disabled={layer.order === Math.max(...layers.map((l) => l.order))}
                />
              </Tooltip>

              <Tooltip title="下移">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    moveLayer(layer.id, 'down')
                  }}
                  disabled={layer.order === Math.min(...layers.map((l) => l.order))}
                />
              </Tooltip>

              {!isDefault && (
                <Popconfirm
                  title="删除图层"
                  description="确定要删除这个图层吗？图层中的图形将移动到默认图层。"
                  onConfirm={() => handleDeleteLayer(layer.id)}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              )}
            </Space>
          )}
        </div>
      </List.Item>
    )
  }

  return (
    <div className="layer-panel">
      <div className="layer-panel-header">
        <h4>图层</h4>
        <Tooltip title="新建图层">
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleAddLayer}
          >
            新建
          </Button>
        </Tooltip>
      </div>

      <div className="layer-panel-content">
        {sortedLayers.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无图层"
          />
        ) : (
          <List
            size="small"
            dataSource={sortedLayers}
            renderItem={renderLayerItem}
            className="layer-list"
          />
        )}
      </div>

      <div className="layer-panel-footer">
        <div className="layer-stats">
          <span>共 {layers.length} 个图层</span>
          <span>{layers.filter((l) => l.visible).length} 个可见</span>
        </div>
      </div>
    </div>
  )
}

export default LayerPanel
