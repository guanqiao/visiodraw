/**
 * 节点右键菜单组件
 *
 * 提供节点的快捷操作菜单
 */

import React from 'react'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  DeleteOutlined,
  CopyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EditOutlined,
} from '@ant-design/icons'
import type { ShapeData } from '../../stores/x6GraphStore'

export interface NodeContextMenuProps {
  node: ShapeData
  visible: boolean
  position: { x: number; y: number }
  onClose: () => void
  onDelete: (nodeId: string) => void
  onCopy?: (nodeId: string) => void
  onBringToFront?: (nodeId: string) => void
  onSendToBack?: (nodeId: string) => void
  onEditLabel?: (nodeId: string) => void
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  visible,
  position,
  onClose,
  onDelete,
  onCopy,
  onBringToFront,
  onSendToBack,
  onEditLabel,
}) => {
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const key = e.key

    switch (key) {
      case 'delete':
        onDelete(node.id)
        break
      case 'copy':
        onCopy?.(node.id)
        break
      case 'bringToFront':
        onBringToFront?.(node.id)
        break
      case 'sendToBack':
        onSendToBack?.(node.id)
        break
      case 'editLabel':
        onEditLabel?.(node.id)
        break
    }

    onClose()
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'editLabel',
      icon: <EditOutlined />,
      label: '编辑文本',
    },
    {
      type: 'divider',
    },
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: '复制',
    },
    {
      type: 'divider',
    },
    {
      key: 'layer',
      icon: <ArrowUpOutlined />,
      label: '图层',
      children: [
        {
          key: 'bringToFront',
          icon: <ArrowUpOutlined />,
          label: '置于顶层',
        },
        {
          key: 'sendToBack',
          icon: <ArrowDownOutlined />,
          label: '置于底层',
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
    },
  ]

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: 4,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Menu
        items={menuItems}
        onClick={handleMenuClick}
        style={{ border: 'none', minWidth: 160 }}
        mode="vertical"
      />
    </div>
  )
}

export default NodeContextMenu
