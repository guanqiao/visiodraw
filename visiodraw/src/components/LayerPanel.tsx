import React, { useState, useEffect, useCallback, useMemo } from 'react'
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

// 图层项组件
interface LayerItemProps {
  layer: {
    id: string
    name: string
    visible: boolean
    locked: boolean
    order: number
    shapeIds: string[]
  }
  isActive: boolean
  isDefault: boolean
  isEditing: boolean
  editingName: string
  layers: LayerItemProps['layer'][]
  onToggleVisibility: (id: string) => void
  onToggleLock: (id: string) => void
  onSetActive: (id: string) => void
  onStartEditing: (layer: LayerItemProps['layer']) => void
  onSaveEditing: () => void
  onCancelEditing: () => void
  onEditingNameChange: (name: string) => void
  onMoveLayer: (id: string, direction: 'up' | 'down') => void
  onDeleteLayer: (id: string) => void
}

const LayerItem: React.FC<LayerItemProps> = ({
  layer,
  isActive,
  isDefault,
  isEditing,
  editingName,
  layers,
  onToggleVisibility,
  onToggleLock,
  onSetActive,
  onStartEditing,
  onSaveEditing,
  onCancelEditing,
  onEditingNameChange,
  onMoveLayer,
  onDeleteLayer,
}) => {
  const handleVisibilityClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleVisibility(layer.id)
  }, [layer.id, onToggleVisibility])

  const handleLockClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleLock(layer.id)
  }, [layer.id, onToggleLock])

  const handleItemClick = useCallback(() => {
    if (!layer.locked) {
      onSetActive(layer.id)
    }
  }, [layer.locked, layer.id, onSetActive])

  const handleStartEditing = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onStartEditing(layer)
  }, [layer, onStartEditing])

  const handleMoveUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onMoveLayer(layer.id, 'up')
  }, [layer.id, onMoveLayer])

  const handleMoveDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onMoveLayer(layer.id, 'down')
  }, [layer.id, onMoveLayer])

  const handleDelete = useCallback(() => {
    onDeleteLayer(layer.id)
  }, [layer.id, onDeleteLayer])

  const handleNameDoubleClick = useCallback(() => {
    onStartEditing(layer)
  }, [layer, onStartEditing])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onEditingNameChange(e.target.value)
  }, [onEditingNameChange])

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSaveEditing()
    }
  }, [onSaveEditing])

  const maxOrder = Math.max(...layers.map((l) => l.order))
  const minOrder = Math.min(...layers.map((l) => l.order))

  return (
    <List.Item
      className={`layer-item ${isActive ? 'active' : ''} ${layer.locked ? 'locked' : ''}`}
      onClick={handleItemClick}
    >
      <div className="layer-item-content">
        {/* 可见性按钮 */}
        <Tooltip title={layer.visible ? '隐藏图层' : '显示图层'}>
          <Button
            type="text"
            size="small"
            icon={layer.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            onClick={handleVisibilityClick}
            className={layer.visible ? '' : 'inactive'}
          />
        </Tooltip>

        {/* 锁定按钮 */}
        <Tooltip title={layer.locked ? '解锁图层' : '锁定图层'}>
          <Button
            type="text"
            size="small"
            icon={layer.locked ? <LockOutlined /> : <UnlockOutlined />}
            onClick={handleLockClick}
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
              onChange={handleInputChange}
              onPressEnter={handleInputKeyDown}
              autoFocus
              style={{ width: 100 }}
            />
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={onSaveEditing}
            />
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={onCancelEditing}
            />
          </div>
        ) : (
          <div className="layer-name" onDoubleClick={handleNameDoubleClick}>
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
                onClick={handleStartEditing}
              />
            </Tooltip>

            <Tooltip title="上移">
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                onClick={handleMoveUp}
                disabled={layer.order === maxOrder}
              />
            </Tooltip>

            <Tooltip title="下移">
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                onClick={handleMoveDown}
                disabled={layer.order === minOrder}
              />
            </Tooltip>

            {!isDefault && (
              <Popconfirm
                title="删除图层"
                description="确定要删除这个图层吗？图层中的图形将移动到默认图层。"
                onConfirm={handleDelete}
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
  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => b.order - a.order)
  }, [layers])

  // 处理添加图层
  const handleAddLayer = useCallback(() => {
    const newId = addLayer()
    setActiveLayer(newId)
  }, [addLayer, setActiveLayer])

  // 处理删除图层
  const handleDeleteLayer = useCallback((id: string) => {
    deleteLayer(id)
  }, [deleteLayer])

  // 开始编辑图层名称
  const startEditing = useCallback((layer: typeof layers[0]) => {
    setEditingId(layer.id)
    setEditingName(layer.name)
  }, [])

  // 保存图层名称
  const saveEditing = useCallback(() => {
    if (editingId && editingName.trim()) {
      renameLayer(editingId, editingName.trim())
    }
    setEditingId(null)
    setEditingName('')
  }, [editingId, editingName, renameLayer])

  // 取消编辑
  const cancelEditing = useCallback(() => {
    setEditingId(null)
    setEditingName('')
  }, [])

  // 使用useCallback缓存事件处理函数
  const handleToggleVisibility = useCallback((id: string) => {
    toggleLayerVisibility(id)
  }, [toggleLayerVisibility])

  const handleToggleLock = useCallback((id: string) => {
    toggleLayerLock(id)
  }, [toggleLayerLock])

  const handleSetActive = useCallback((id: string) => {
    setActiveLayer(id)
  }, [setActiveLayer])

  const handleMoveLayer = useCallback((id: string, direction: 'up' | 'down') => {
    moveLayer(id, direction)
  }, [moveLayer])

  const handleEditingNameChange = useCallback((name: string) => {
    setEditingName(name)
  }, [])

  // 渲染图层项
  const renderLayerItem = useCallback((layer: typeof layers[0]) => {
    const isActive = layer.id === activeLayerId
    const isDefault = layer.id === defaultLayerId
    const isEditing = layer.id === editingId

    return (
      <LayerItem
        key={layer.id}
        layer={layer}
        isActive={isActive}
        isDefault={isDefault}
        isEditing={isEditing}
        editingName={editingName}
        layers={layers}
        onToggleVisibility={handleToggleVisibility}
        onToggleLock={handleToggleLock}
        onSetActive={handleSetActive}
        onStartEditing={startEditing}
        onSaveEditing={saveEditing}
        onCancelEditing={cancelEditing}
        onEditingNameChange={handleEditingNameChange}
        onMoveLayer={handleMoveLayer}
        onDeleteLayer={handleDeleteLayer}
      />
    )
  }, [
    layers,
    activeLayerId,
    defaultLayerId,
    editingId,
    editingName,
    handleToggleVisibility,
    handleToggleLock,
    handleSetActive,
    startEditing,
    saveEditing,
    cancelEditing,
    handleEditingNameChange,
    handleMoveLayer,
    handleDeleteLayer,
  ])

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
