/**
 * 边右键菜单组件
 *
 * 提供边的快捷操作菜单
 */

import React from 'react'
import { Menu, Dropdown, Space, Divider } from 'antd'
import type { MenuProps } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  SwapOutlined,
  CopyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineOutlined,
  DashOutlined,
  SmallDashOutlined,
  NodeIndexOutlined,
  MinusOutlined,
  BorderOutlined,
} from '@ant-design/icons'
import type { Connector, LineStyle, ConnectorStyle } from '../../types/connection'

export interface EdgeContextMenuProps {
  edge: Connector
  visible: boolean
  position: { x: number; y: number }
  onClose: () => void
  onDelete: (edgeId: string) => void
  onEditLabel: (edgeId: string) => void
  onChangeLineStyle: (edgeId: string, style: LineStyle) => void
  onChangeRouter: (edgeId: string, style: ConnectorStyle) => void
  onReverseDirection: (edgeId: string) => void
  onCopyStyle: (edgeId: string) => void
  onBringToFront: (edgeId: string) => void
  onSendToBack: (edgeId: string) => void
}

export const EdgeContextMenu: React.FC<EdgeContextMenuProps> = ({
  edge,
  visible,
  position,
  onClose,
  onDelete,
  onEditLabel,
  onChangeLineStyle,
  onChangeRouter,
  onReverseDirection,
  onCopyStyle,
  onBringToFront,
  onSendToBack,
}) => {
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const key = e.key

    switch (key) {
      case 'delete':
        onDelete(edge.id)
        break
      case 'editLabel':
        onEditLabel(edge.id)
        break
      case 'reverse':
        onReverseDirection(edge.id)
        break
      case 'copyStyle':
        onCopyStyle(edge.id)
        break
      case 'bringToFront':
        onBringToFront(edge.id)
        break
      case 'sendToBack':
        onSendToBack(edge.id)
        break
      case 'lineStyle-solid':
        onChangeLineStyle(edge.id, 'solid')
        break
      case 'lineStyle-dashed':
        onChangeLineStyle(edge.id, 'dashed')
        break
      case 'lineStyle-dotted':
        onChangeLineStyle(edge.id, 'dotted')
        break
      case 'router-straight':
        onChangeRouter(edge.id, 'straight')
        break
      case 'router-orthogonal':
        onChangeRouter(edge.id, 'orthogonal')
        break
      case 'router-curved':
        onChangeRouter(edge.id, 'curved')
        break
      case 'router-bezier':
        onChangeRouter(edge.id, 'bezier')
        break
      case 'router-metro':
        onChangeRouter(edge.id, 'metro')
        break
      case 'router-manhattan':
        onChangeRouter(edge.id, 'manhattan')
        break
    }

    onClose()
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'editLabel',
      icon: <EditOutlined />,
      label: '编辑标签',
    },
    {
      key: 'reverse',
      icon: <SwapOutlined />,
      label: '反向箭头',
    },
    {
      type: 'divider',
    },
    {
      key: 'lineStyle',
      icon: <LineOutlined />,
      label: '线型',
      children: [
        {
          key: 'lineStyle-solid',
          icon: <LineOutlined />,
          label: '实线',
        },
        {
          key: 'lineStyle-dashed',
          icon: <DashOutlined />,
          label: '虚线',
        },
        {
          key: 'lineStyle-dotted',
          icon: <SmallDashOutlined />,
          label: '点线',
        },
      ],
    },
    {
      key: 'router',
      icon: <NodeIndexOutlined />,
      label: '路由方式',
      children: [
        {
          key: 'router-straight',
          icon: <LineOutlined />,
          label: '直线',
        },
        {
          key: 'router-orthogonal',
          icon: <NodeIndexOutlined />,
          label: '正交线',
        },
        {
          key: 'router-curved',
          icon: <MinusOutlined rotate={45} />,
          label: '曲线',
        },
        {
          key: 'router-bezier',
          icon: <MinusOutlined rotate={-45} />,
          label: '贝塞尔曲线',
        },
        {
          key: 'router-metro',
          icon: <BorderOutlined />,
          label: '地铁线',
        },
        {
          key: 'router-manhattan',
          icon: <NodeIndexOutlined rotate={90} />,
          label: '曼哈顿线',
        },
      ],
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
      key: 'copyStyle',
      icon: <CopyOutlined />,
      label: '复制样式',
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

export default EdgeContextMenu
