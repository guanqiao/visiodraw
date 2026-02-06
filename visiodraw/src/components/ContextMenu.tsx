/**
 * 右键菜单组件
 */

import React, { useEffect, useRef } from 'react'
import {
  ScissorOutlined,
  CopyOutlined,
  SnippetsOutlined,
  DeleteOutlined,
  GroupOutlined,
  UngroupOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
} from '@ant-design/icons'

export interface ContextMenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  danger?: boolean
  disabled?: boolean
  divider?: boolean
  onClick?: () => void
}

interface ContextMenuProps {
  visible: boolean
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible, onClose])

  // 处理菜单项点击
  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick()
    }
    onClose()
  }

  if (!visible) return null

  // 计算菜单位置，确保不超出视口
  const menuStyle: React.CSSProperties = {
    left: x,
    top: y,
  }

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={menuStyle}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item) => {
        if (item.divider) {
          return <div key={item.key} className="context-menu-divider" />
        }

        return (
          <div
            key={item.key}
            className={`context-menu-item ${item.danger ? 'danger' : ''}`}
            style={{
              opacity: item.disabled ? 0.5 : 1,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
            }}
            onClick={() => handleItemClick(item)}
          >
            {item.icon}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span style={{ color: '#999', fontSize: 12 }}>{item.shortcut}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ContextMenu
