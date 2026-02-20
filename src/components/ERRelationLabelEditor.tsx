import React, { useState, useEffect, useCallback } from 'react'
import { Input, Popover, Button, Space, Select, Typography, Divider, message } from 'antd'
import { EditOutlined, CheckOutlined, CloseOutlined, LinkOutlined } from '@ant-design/icons'
import type { ERRelationType } from '../types/connection'
import { erRelations } from '../types/connection'

const { Text } = Typography

interface ERRelationLabelEditorProps {
  visible: boolean
  position: { x: number; y: number }
  currentLabel: string
  currentRelationType?: ERRelationType
  onLabelChange: (label: string) => void
  onRelationTypeChange?: (type: ERRelationType) => void
  onClose: () => void
}

const COMMON_LABELS = [
  { label: 'has', value: 'has' },
  { label: 'belongs_to', value: 'belongs_to' },
  { label: 'contains', value: 'contains' },
  { label: 'references', value: 'references' },
  { label: 'manages', value: 'manages' },
  { label: 'creates', value: 'creates' },
  { label: 'owns', value: 'owns' },
  { label: 'uses', value: 'uses' },
]

const ERRelationLabelEditor: React.FC<ERRelationLabelEditorProps> = ({
  visible,
  position,
  currentLabel,
  currentRelationType,
  onLabelChange,
  onRelationTypeChange,
  onClose,
}) => {
  const [label, setLabel] = useState(currentLabel)
  const [relationType, setRelationType] = useState<ERRelationType | undefined>(currentRelationType)

  useEffect(() => {
    setLabel(currentLabel)
    setRelationType(currentRelationType)
  }, [currentLabel, currentRelationType])

  const handleConfirm = useCallback(() => {
    if (label.trim()) {
      onLabelChange(label.trim())
      message.success('关系标签已更新')
    }
    onClose()
  }, [label, onLabelChange, onClose])

  const handleCancel = useCallback(() => {
    setLabel(currentLabel)
    onClose()
  }, [currentLabel, onClose])

  const handleRelationTypeChange = useCallback((type: ERRelationType) => {
    setRelationType(type)
    onRelationTypeChange?.(type)
  }, [onRelationTypeChange])

  if (!visible) return null

  const relationOptions = Object.entries(erRelations).map(([key, config]) => ({
    label: `${config.name} (${config.cardinality || ''})`,
    value: key,
  }))

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        padding: 12,
        minWidth: 280,
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <LinkOutlined style={{ color: '#1890ff' }} />
          <Text strong>编辑关系</Text>
        </Space>

        <Divider style={{ margin: '8px 0' }} />

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>关系标签</Text>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="输入关系标签"
            prefix={<EditOutlined />}
            onPressEnter={handleConfirm}
            autoFocus
          />
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>快速选择</Text>
          <Select
            value={label}
            onChange={setLabel}
            options={COMMON_LABELS}
            style={{ width: '100%' }}
            placeholder="选择常用标签"
            allowClear
          />
        </div>

        {onRelationTypeChange && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>关系类型</Text>
            <Select
              value={relationType}
              onChange={handleRelationTypeChange}
              options={relationOptions}
              style={{ width: '100%' }}
              placeholder="选择关系类型"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>
        )}

        <Divider style={{ margin: '8px 0' }} />

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button size="small" icon={<CloseOutlined />} onClick={handleCancel}>
            取消
          </Button>
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={handleConfirm}>
            确定
          </Button>
        </Space>
      </Space>
    </div>
  )
}

export default ERRelationLabelEditor

export function formatErRelationLabel(
  sourceTable: string,
  targetTable: string,
  relationType: ERRelationType
): string {
  const config = erRelations[relationType]
  if (!config) return ''

  const cardinality = config.cardinality || ''
  
  switch (relationType) {
    case 'er-one-to-one':
      return `${sourceTable} 1:1 ${targetTable}`
    case 'er-one-to-many':
      return `${sourceTable} 1:N ${targetTable}`
    case 'er-many-to-many':
      return `${sourceTable} N:M ${targetTable}`
    case 'er-foreign-key':
      return `${sourceTable} → ${targetTable}`
    default:
      return cardinality ? `${cardinality}` : ''
  }
}

export function parseErRelationLabel(label: string): {
  sourceTable?: string
  targetTable?: string
  relationType?: ERRelationType
  customLabel?: string
} {
  const patterns: { pattern: RegExp; type: ERRelationType }[] = [
    { pattern: /(\w+)\s*1:1\s*(\w+)/i, type: 'er-one-to-one' },
    { pattern: /(\w+)\s*1:N\s*(\w+)/i, type: 'er-one-to-many' },
    { pattern: /(\w+)\s*N:M\s*(\w+)/i, type: 'er-many-to-many' },
    { pattern: /(\w+)\s*→\s*(\w+)/, type: 'er-foreign-key' },
  ]

  for (const { pattern, type } of patterns) {
    const match = label.match(pattern)
    if (match) {
      return {
        sourceTable: match[1],
        targetTable: match[2],
        relationType: type,
      }
    }
  }

  return { customLabel: label }
}
