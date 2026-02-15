import React, { useState, useEffect, useCallback } from 'react'
import { Table, Button, Input, Select, Checkbox, Space, Popconfirm, Tooltip, message, Dropdown, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined, KeyOutlined, LinkOutlined, SafetyOutlined, ThunderboltOutlined, HolderOutlined, MoreOutlined, CopyOutlined, ArrowUpOutlined, ArrowDownOutlined, OrderedListOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { ErColumn, ErConstraint } from '../types/shapeLibrary'
import { v4 as uuidv4 } from 'uuid'

const { Text } = Typography

export interface ErTableColumn extends ErColumn {
  id: string
}

interface ErTableEditorProps {
  tableName: string
  columns: ErTableColumn[]
  onChange: (tableName: string, columns: ErTableColumn[]) => void
  readOnly?: boolean
}

const DATA_TYPES = [
  { label: 'INT', value: 'int' },
  { label: 'BIGINT', value: 'bigint' },
  { label: 'SMALLINT', value: 'smallint' },
  { label: 'TINYINT', value: 'tinyint' },
  { label: 'VARCHAR(255)', value: 'varchar' },
  { label: 'VARCHAR(50)', value: 'varchar[50]' },
  { label: 'VARCHAR(100)', value: 'varchar[100]' },
  { label: 'TEXT', value: 'text' },
  { label: 'BOOLEAN', value: 'boolean' },
  { label: 'DATE', value: 'date' },
  { label: 'DATETIME', value: 'datetime' },
  { label: 'TIMESTAMP', value: 'timestamp' },
  { label: 'TIME', value: 'time' },
  { label: 'FLOAT', value: 'float' },
  { label: 'DOUBLE', value: 'double' },
  { label: 'DECIMAL(10,2)', value: 'decimal' },
  { label: 'JSON', value: 'json' },
  { label: 'UUID', value: 'uuid' },
  { label: 'BLOB', value: 'blob' },
  { label: 'BINARY', value: 'binary' },
]

const CONSTRAINT_CONFIG: { key: ErConstraint; label: string; icon: React.ReactNode; color: string; tooltip: string }[] = [
  { key: 'pk', label: 'PK', icon: <KeyOutlined />, color: '#1890ff', tooltip: '主键 (Primary Key)' },
  { key: 'fk', label: 'FK', icon: <LinkOutlined />, color: '#722ed1', tooltip: '外键 (Foreign Key)' },
  { key: 'unique', label: 'UQ', icon: <SafetyOutlined />, color: '#13c2c2', tooltip: '唯一约束 (Unique)' },
  { key: 'notnull', label: 'NN', icon: <SafetyOutlined />, color: '#fa8c16', tooltip: '非空约束 (Not Null)' },
  { key: 'auto', label: 'AI', icon: <ThunderboltOutlined />, color: '#52c41a', tooltip: '自增 (Auto Increment)' },
  { key: 'index', label: 'IDX', icon: <OrderedListOutlined />, color: '#eb2f96', tooltip: '索引 (Index)' },
]

const ErTableEditor: React.FC<ErTableEditorProps> = ({
  tableName,
  columns,
  onChange,
  readOnly = false,
}) => {
  const [localTableName, setLocalTableName] = useState(tableName)
  const [localColumns, setLocalColumns] = useState<ErTableColumn[]>(columns)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  useEffect(() => {
    setLocalTableName(tableName)
    setLocalColumns(columns)
  }, [tableName, columns])

  const handleTableNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setLocalTableName(newName)
    onChange(newName, localColumns)
  }

  const handleColumnChange = (id: string, field: 'name' | 'type', value: string) => {
    const newColumns = localColumns.map((col) =>
      col.id === id ? { ...col, [field]: value } : col
    )
    setLocalColumns(newColumns)
    onChange(localTableName, newColumns)
  }

  const handleConstraintChange = (id: string, constraint: ErConstraint, checked: boolean) => {
    const newColumns = localColumns.map((col) => {
      if (col.id === id) {
        const newConstraints = checked
          ? [...col.constraints, constraint]
          : col.constraints.filter((c) => c !== constraint)
        return { ...col, constraints: newConstraints }
      }
      return col
    })
    setLocalColumns(newColumns)
    onChange(localTableName, newColumns)
  }

  const addColumn = () => {
    const newColumn: ErTableColumn = {
      id: uuidv4(),
      name: `column_${localColumns.length + 1}`,
      type: 'varchar',
      constraints: [],
    }
    const newColumns = [...localColumns, newColumn]
    setLocalColumns(newColumns)
    onChange(localTableName, newColumns)
    message.success('已添加新列')
  }

  const deleteColumn = (id: string) => {
    const newColumns = localColumns.filter((col) => col.id !== id)
    setLocalColumns(newColumns)
    onChange(localTableName, newColumns)
  }

  const duplicateColumn = (column: ErTableColumn) => {
    const newColumn: ErTableColumn = {
      ...column,
      id: uuidv4(),
      name: `${column.name}_copy`,
    }
    const index = localColumns.findIndex((c) => c.id === column.id)
    const newColumns = [...localColumns]
    newColumns.splice(index + 1, 0, newColumn)
    setLocalColumns(newColumns)
    onChange(localTableName, newColumns)
    message.success('已复制列')
  }

  const moveColumn = (id: string, direction: 'up' | 'down') => {
    const index = localColumns.findIndex((c) => c.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === localColumns.length - 1) return

    const newColumns = [...localColumns]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]]
    setLocalColumns(newColumns)
    onChange(localTableName, newColumns)
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    const newColumns = [...localColumns]
    const draggedItem = newColumns[dragIndex]
    newColumns.splice(dragIndex, 1)
    newColumns.splice(index, 0, draggedItem)
    setLocalColumns(newColumns)
    setDragIndex(index)
  }

  const handleDragEnd = () => {
    if (dragIndex !== null) {
      onChange(localTableName, localColumns)
    }
    setDragIndex(null)
  }

  const getConstraintMenuItems = (column: ErTableColumn) => {
    return CONSTRAINT_CONFIG.map((config) => ({
      key: config.key,
      label: (
        <Checkbox
          checked={column.constraints.includes(config.key)}
          onChange={(e) => handleConstraintChange(column.id, config.key, e.target.checked)}
        >
          <Space>
            <span style={{ color: config.color }}>{config.icon}</span>
            <span>{config.label}</span>
            <Text type="secondary" style={{ fontSize: 11 }}>{config.tooltip}</Text>
          </Space>
        </Checkbox>
      ),
    }))
  }

  const renderConstraints = (column: ErTableColumn) => {
    const activeConstraints = CONSTRAINT_CONFIG.filter((c) =>
      column.constraints.includes(c.key)
    )

    if (activeConstraints.length === 0) {
      return (
        <Dropdown menu={{ items: getConstraintMenuItems(column) }} trigger={['click']} disabled={readOnly}>
          <Button size="small" type="dashed" icon={<PlusOutlined />}>
            添加约束
          </Button>
        </Dropdown>
      )
    }

    return (
      <Space size={2} wrap>
        {activeConstraints.map((config) => (
          <Tooltip key={config.key} title={config.tooltip}>
            <Button
              size="small"
              style={{ 
                color: config.color, 
                borderColor: config.color,
                padding: '0 6px',
                fontSize: 11,
              }}
              onClick={() => handleConstraintChange(column.id, config.key, false)}
              disabled={readOnly}
            >
              {config.icon} {config.label}
            </Button>
          </Tooltip>
        ))}
        <Dropdown menu={{ items: getConstraintMenuItems(column) }} trigger={['click']} disabled={readOnly}>
          <Button size="small" type="text" icon={<PlusOutlined />} />
        </Dropdown>
      </Space>
    )
  }

  const columnsDef: ColumnsType<ErTableColumn> = [
    {
      key: 'drag',
      width: 30,
      render: (_, __, index) => (
        <HolderOutlined
          style={{ cursor: 'grab', color: '#999' }}
          draggable={!readOnly}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        />
      ),
    },
    {
      title: '#',
      key: 'index',
      width: 40,
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>,
    },
    {
      title: '列名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (name, record) => (
        <Input
          value={name}
          onChange={(e) => handleColumnChange(record.id, 'name', e.target.value)}
          placeholder="列名"
          size="small"
          style={{ fontWeight: record.constraints.includes('pk') ? 'bold' : 'normal' }}
          readOnly={readOnly}
        />
      ),
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type, record) => (
        <Select
          value={type}
          onChange={(value) => handleColumnChange(record.id, 'type', value)}
          options={DATA_TYPES}
          size="small"
          style={{ width: '100%' }}
          disabled={readOnly}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      ),
    },
    {
      title: '约束',
      key: 'constraints',
      width: 200,
      render: (_, record) => renderConstraints(record),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record, index) => (
        <Space size={0}>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', icon: <CopyOutlined />, label: '复制列', onClick: () => duplicateColumn(record) },
                { key: 'up', icon: <ArrowUpOutlined />, label: '上移', onClick: () => moveColumn(record.id, 'up'), disabled: index === 0 },
                { key: 'down', icon: <ArrowDownOutlined />, label: '下移', onClick: () => moveColumn(record.id, 'down'), disabled: index === localColumns.length - 1 },
                { type: 'divider' },
                { key: 'delete', icon: <DeleteOutlined />, label: '删除列', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'delete') {
                  deleteColumn(record.id)
                }
              },
            }}
            trigger={['click']}
          >
            <Button size="small" type="text" icon={<MoreOutlined />} disabled={readOnly} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ marginRight: 8 }}>表名:</Text>
        <Input
          value={localTableName}
          onChange={handleTableNameChange}
          placeholder="输入表名"
          style={{ width: 200 }}
          readOnly={readOnly}
        />
      </div>

      <Table
        dataSource={localColumns}
        columns={columnsDef}
        rowKey="id"
        size="small"
        pagination={false}
        bordered
        style={{ marginBottom: 12 }}
        onRow={(record, index) => ({
          draggable: !readOnly,
          onDragStart: (e) => {
            e.dataTransfer.effectAllowed = 'move'
            if (index !== undefined) handleDragStart(index)
          },
          onDragOver: (e) => {
            if (index !== undefined) handleDragOver(e, index)
          },
          onDragEnd: handleDragEnd,
        })}
      />

      {!readOnly && (
        <Button type="dashed" icon={<PlusOutlined />} onClick={addColumn} block>
          添加列
        </Button>
      )}
    </div>
  )
}

export default ErTableEditor
