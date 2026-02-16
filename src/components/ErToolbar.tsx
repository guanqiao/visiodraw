import React from 'react'
import { Space, Button, Tooltip, Dropdown, message } from 'antd'
import { 
  TableOutlined, LinkOutlined, LayoutOutlined, 
  PlusOutlined, OrderedListOutlined, ApartmentOutlined,
  ThunderboltOutlined, KeyOutlined, ClockCircleOutlined,
  DatabaseOutlined, GroupOutlined, DownloadOutlined, ExportOutlined,
  BranchesOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

interface ErToolbarProps {
  onCreateEntity: (withDefaults?: boolean) => void
  onCreateRelation: () => void
  onAutoLayout: (algorithm: 'grid' | 'hierarchical' | 'force') => void
  onAddPrimaryKey: () => void
  onAddTimestamps: () => void
  onOptimizeRouting?: () => void
  onExport?: () => void
  disabled?: boolean
}

const ErToolbar: React.FC<ErToolbarProps> = ({
  onCreateEntity,
  onCreateRelation,
  onAutoLayout,
  onAddPrimaryKey,
  onAddTimestamps,
  onOptimizeRouting,
  onExport,
  disabled = false,
}) => {
  const layoutMenuItems: MenuProps['items'] = [
    {
      key: 'grid',
      label: '网格布局',
      icon: <OrderedListOutlined />,
      onClick: () => {
        onAutoLayout('grid')
        message.success('已应用网格布局')
      },
    },
    {
      key: 'hierarchical',
      label: '层次布局',
      icon: <ApartmentOutlined />,
      onClick: () => {
        onAutoLayout('hierarchical')
        message.success('已应用层次布局')
      },
    },
    {
      key: 'force',
      label: '力导向布局',
      icon: <GroupOutlined />,
      onClick: () => {
        onAutoLayout('force')
        message.success('已应用力导向布局')
      },
    },
  ]

  const quickAddMenuItems: MenuProps['items'] = [
    {
      key: 'primaryKey',
      label: '主键 ID',
      icon: <KeyOutlined />,
      onClick: () => {
        onAddPrimaryKey()
        message.success('已添加主键列')
      },
    },
    {
      key: 'timestamps',
      label: '时间戳字段',
      icon: <ClockCircleOutlined />,
      onClick: () => {
        onAddTimestamps()
        message.success('已添加时间戳字段')
      },
    },
  ]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
      gap: 8,
    }}>
      <Space.Compact>
        <Tooltip title="创建实体 (E)">
          <Button
            icon={<TableOutlined />}
            onClick={() => onCreateEntity(false)}
            disabled={disabled}
          >
            实体
          </Button>
        </Tooltip>
        <Dropdown menu={{ items: quickAddMenuItems }} trigger={['click']}>
          <Button disabled={disabled}>
            <PlusOutlined />
          </Button>
        </Dropdown>
      </Space.Compact>

      <div style={{ width: 1, height: 24, background: '#e8e8e8' }} />

      <Tooltip title="创建关系 (R)">
        <Button
          icon={<LinkOutlined />}
          onClick={onCreateRelation}
          disabled={disabled}
        >
          关系
        </Button>
      </Tooltip>

      <div style={{ width: 1, height: 24, background: '#e8e8e8' }} />

      <Dropdown menu={{ items: layoutMenuItems }} trigger={['click']}>
        <Tooltip title="自动布局 (Ctrl+L)">
          <Button
            icon={<LayoutOutlined />}
            disabled={disabled}
          >
            布局
          </Button>
        </Tooltip>
      </Dropdown>

      {onOptimizeRouting && (
        <>
          <div style={{ width: 1, height: 24, background: '#e8e8e8' }} />
          <Tooltip title="优化关系线路由">
            <Button
              icon={<BranchesOutlined />}
              onClick={onOptimizeRouting}
              disabled={disabled}
            >
              路由优化
            </Button>
          </Tooltip>
        </>
      )}

      <div style={{ width: 1, height: 24, background: '#e8e8e8' }} />

      <Tooltip title="快速添加默认字段">
        <Dropdown menu={{ items: quickAddMenuItems }} trigger={['click']}>
          <Button
            icon={<ThunderboltOutlined />}
            disabled={disabled}
          >
            快速添加
          </Button>
        </Dropdown>
      </Tooltip>

      <div style={{ flex: 1 }} />

      {onExport && (
        <>
          <Tooltip title="导出ER图 (Mermaid/PlantUML/DBML/HTML)">
            <Button
              type="primary"
              icon={<ExportOutlined />}
              onClick={onExport}
              disabled={disabled}
            >
              导出
            </Button>
          </Tooltip>
          <div style={{ width: 1, height: 24, background: '#e8e8e8' }} />
        </>
      )}

      <Space>
        <Tooltip title="ER图模式已启用">
          <DatabaseOutlined style={{ color: '#1890ff', fontSize: 16 }} />
        </Tooltip>
      </Space>
    </div>
  )
}

export default ErToolbar
