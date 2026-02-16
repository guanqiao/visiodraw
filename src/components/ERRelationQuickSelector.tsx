import React, { useState, useEffect, useCallback } from 'react'
import { Modal, Space, Button, Tooltip, Typography, Divider, message } from 'antd'
import { 
  LinkOutlined, OneToOneOutlined, SplitCellsOutlined, 
  ApartmentOutlined, TableOutlined, WarningOutlined 
} from '@ant-design/icons'
import type { ERRelationType, ERRelationConfig } from '../types/connection'
import { erRelations } from '../types/connection'

const { Text } = Typography

interface ERRelationQuickSelectorProps {
  visible: boolean
  sourceNodeInfo: { id: string; type: string; name: string } | null
  targetNodeInfo: { id: string; type: string; name: string } | null
  onSelect: (relationType: ERRelationType) => void
  onCancel: () => void
  position?: { x: number; y: number }
}

const QUICK_RELATIONS: { type: ERRelationType; label: string; icon: React.ReactNode; description: string; color: string }[] = [
  { 
    type: 'er-one-to-one', 
    label: '1:1', 
    icon: <OneToOneOutlined />,
    description: '一对一关系',
    color: '#1890ff'
  },
  { 
    type: 'er-one-to-many', 
    label: '1:N', 
    icon: <SplitCellsOutlined />,
    description: '一对多关系',
    color: '#52c41a'
  },
  { 
    type: 'er-many-to-many', 
    label: 'N:M', 
    icon: <ApartmentOutlined />,
    description: '多对多关系',
    color: '#722ed1'
  },
  { 
    type: 'er-foreign-key', 
    label: 'FK', 
    icon: <LinkOutlined />,
    description: '外键关系',
    color: '#fa8c16'
  },
]

const CROWS_FOOT_RELATIONS: { type: ERRelationType; label: string; description: string }[] = [
  { type: 'er-crows-foot-one', label: '一 (1)', description: 'Crow\'s Foot - 一' },
  { type: 'er-crows-foot-many', label: '多 (N)', description: 'Crow\'s Foot - 多' },
  { type: 'er-crows-foot-zero-one', label: '零或一 (0..1)', description: 'Crow\'s Foot - 零或一' },
  { type: 'er-crows-foot-one-many', label: '一或多 (1..*)', description: 'Crow\'s Foot - 一或多' },
  { type: 'er-crows-foot-zero-many', label: '零或多 (0..*)', description: 'Crow\'s Foot - 零或多' },
]

const PARTICIPATION_RELATIONS: { type: ERRelationType; label: string; description: string }[] = [
  { type: 'er-total-participation', label: '完全参与', description: '双线连接（必须参与）' },
  { type: 'er-partial-participation', label: '部分参与', description: '单线连接（可选参与）' },
]

const ERRelationQuickSelector: React.FC<ERRelationQuickSelectorProps> = ({
  visible,
  sourceNodeInfo,
  targetNodeInfo,
  onSelect,
  onCancel,
  position,
}) => {
  const [selectedType, setSelectedType] = useState<ERRelationType | null>(null)

  useEffect(() => {
    if (visible) {
      setSelectedType(null)
    }
  }, [visible])

  const handleSelect = useCallback((type: ERRelationType) => {
    setSelectedType(type)
    const config = erRelations[type]
    if (config) {
      message.success(`已选择: ${config.name}`)
    }
    onSelect(type)
  }, [onSelect])

  const handleConfirm = useCallback(() => {
    if (selectedType) {
      onSelect(selectedType)
    } else {
      message.warning('请选择关系类型')
    }
  }, [selectedType, onSelect])

  if (!visible) return null

  const modalStyle: React.CSSProperties = position 
    ? {
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }
    : {}

  return (
    <Modal
      open={visible}
      title={
        <Space>
          <LinkOutlined />
          <span>选择ER关系类型</span>
        </Space>
      }
      onCancel={onCancel}
      footer={null}
      width={480}
      centered={!position}
      styles={position ? { body: { padding: 16 } } : undefined}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {sourceNodeInfo && (
            <Text>
              <Text type="secondary">源实体: </Text>
              <Text strong style={{ color: '#1890ff' }}>{sourceNodeInfo.name}</Text>
            </Text>
          )}
          {targetNodeInfo && (
            <Text>
              <Text type="secondary">目标实体: </Text>
              <Text strong style={{ color: '#52c41a' }}>{targetNodeInfo.name}</Text>
            </Text>
          )}
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }}>快速选择</Divider>
      
      <Space wrap size="middle" style={{ marginBottom: 16, justifyContent: 'center', width: '100%', display: 'flex' }}>
        {QUICK_RELATIONS.map((rel) => (
          <Tooltip key={rel.type} title={rel.description}>
            <Button
              type={selectedType === rel.type ? 'primary' : 'default'}
              size="large"
              icon={rel.icon}
              onClick={() => handleSelect(rel.type)}
              style={{ 
                width: 90, 
                height: 70,
                borderColor: selectedType === rel.type ? rel.color : undefined,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>{rel.label}</div>
              <div style={{ fontSize: 10, color: '#999' }}>{rel.description}</div>
            </Button>
          </Tooltip>
        ))}
      </Space>

      <Divider style={{ margin: '12px 0' }}>Crow's Foot 表示法</Divider>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
        {CROWS_FOOT_RELATIONS.map((rel) => (
          <Tooltip key={rel.type} title={rel.description}>
            <Button
              type={selectedType === rel.type ? 'primary' : 'default'}
              size="small"
              onClick={() => handleSelect(rel.type)}
              style={{ width: '100%' }}
            >
              {rel.label}
            </Button>
          </Tooltip>
        ))}
      </div>

      <Divider style={{ margin: '12px 0' }}>参与度约束</Divider>
      
      <Space wrap size="small" style={{ marginBottom: 16 }}>
        {PARTICIPATION_RELATIONS.map((rel) => (
          <Tooltip key={rel.type} title={rel.description}>
            <Button
              type={selectedType === rel.type ? 'primary' : 'default'}
              size="small"
              onClick={() => handleSelect(rel.type)}
            >
              {rel.label}
            </Button>
          </Tooltip>
        ))}
      </Space>

      <div style={{ 
        background: '#f5f5f5', 
        padding: 8, 
        borderRadius: 4, 
        marginTop: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <WarningOutlined style={{ color: '#faad14' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>
          选择关系类型后，连接线将自动应用相应的样式和标记
        </Text>
      </div>
    </Modal>
  )
}

export default ERRelationQuickSelector

export function isErTableNode(type: string): boolean {
  const erTypes = [
    'er-entity',
    'er-weak-entity',
    'er-table-entity',
    'er-table-entity-with-columns',
    'er-associative-entity',
  ]
  return erTypes.includes(type)
}

export function getErNodeName(node: any): string {
  if (node.text) {
    return node.text.split('\n')[0] || '未命名'
  }
  return node.type || '未命名'
}
