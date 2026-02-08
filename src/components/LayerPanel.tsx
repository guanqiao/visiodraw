import React from 'react'
import { Card, List, Button, Space, Tooltip, Input, Empty } from 'antd'
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons'
import useX6GraphStore from '@stores/x6GraphStore'

const LayerPanel: React.FC = () => {
  const {
    nodes,
    selectedNodeIds,
    selectNode,
    clearSelection,
    updateNode,
    deleteNode,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = useX6GraphStore()

  // Sort nodes by z-index (reverse order for layer list - top layer first)
  const sortedNodes = [...nodes].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))

  const handleLayerClick = (nodeId: string, isSelected: boolean) => {
    if (isSelected) {
      clearSelection()
    } else {
      selectNode(nodeId)
    }
  }

  const handleToggleVisibility = (nodeId: string, currentVisible: boolean) => {
    updateNode(nodeId, { visible: !currentVisible })
  }

  const handleToggleLock = (nodeId: string, currentLocked: boolean) => {
    updateNode(nodeId, { locked: !currentLocked })
  }

  const handleDelete = (nodeId: string) => {
    deleteNode(nodeId)
  }

  const handleBringToFront = (nodeId: string) => {
    bringToFront(nodeId)
  }

  const handleSendToBack = (nodeId: string) => {
    sendToBack(nodeId)
  }

  const handleBringForward = (nodeId: string) => {
    bringForward(nodeId)
  }

  const handleSendBackward = (nodeId: string) => {
    sendBackward(nodeId)
  }

  if (nodes.length === 0) {
    return (
      <Card title="图层" size="small" style={{ width: 280, height: '100%' }}>
        <Empty description="暂无图层" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    )
  }

  return (
    <Card
      title={`图层 (${nodes.length})`}
      size="small"
      style={{ width: 280, height: '100%' }}
      bodyStyle={{ padding: 0, height: 'calc(100% - 40px)', overflow: 'auto' }}
    >
      <List
        size="small"
        dataSource={sortedNodes}
        renderItem={(node, index) => {
          const isSelected = selectedNodeIds.includes(node.id)
          const isVisible = node.visible !== false
          const isLocked = node.locked === true

          return (
            <List.Item
              key={node.id}
              onClick={() => handleLayerClick(node.id, isSelected)}
              style={{
                cursor: 'pointer',
                background: isSelected ? '#e6f7ff' : 'transparent',
                padding: '8px 12px',
                borderLeft: isSelected ? '3px solid #1890ff' : '3px solid transparent',
              }}
              actions={[
                <Tooltip title={isVisible ? '隐藏' : '显示'} key="visibility">
                  <Button
                    type="text"
                    size="small"
                    icon={isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleVisibility(node.id, isVisible)
                    }}
                  />
                </Tooltip>,
                <Tooltip title={isLocked ? '解锁' : '锁定'} key="lock">
                  <Button
                    type="text"
                    size="small"
                    icon={isLocked ? <LockOutlined /> : <UnlockOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleLock(node.id, isLocked)
                    }}
                  />
                </Tooltip>,
              ]}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#999', minWidth: 20 }}>
                  {sortedNodes.length - index}
                </span>
                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    opacity: isVisible ? 1 : 0.5,
                  }}
                >
                  {node.text || `${node.type} ${sortedNodes.length - index}`}
                </span>
              </div>
            </List.Item>
          )
        }}
      />

      {/* Layer Operations */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '8px 12px',
          borderTop: '1px solid #f0f0f0',
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Tooltip title="置于顶层">
            <Button
              size="small"
              icon={<VerticalAlignTopOutlined />}
              disabled={selectedNodeIds.length !== 1}
              onClick={() => handleBringToFront(selectedNodeIds[0])}
            />
          </Tooltip>
          <Tooltip title="上移一层">
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={selectedNodeIds.length !== 1}
              onClick={() => handleBringForward(selectedNodeIds[0])}
            />
          </Tooltip>
          <Tooltip title="下移一层">
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={selectedNodeIds.length !== 1}
              onClick={() => handleSendBackward(selectedNodeIds[0])}
            />
          </Tooltip>
          <Tooltip title="置于底层">
            <Button
              size="small"
              icon={<VerticalAlignBottomOutlined />}
              disabled={selectedNodeIds.length !== 1}
              onClick={() => handleSendToBack(selectedNodeIds[0])}
            />
          </Tooltip>
        </Space>

        <Tooltip title="删除">
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            disabled={selectedNodeIds.length === 0}
            onClick={() => {
              selectedNodeIds.forEach((id) => handleDelete(id))
            }}
          />
        </Tooltip>
      </div>
    </Card>
  )
}

export default LayerPanel
