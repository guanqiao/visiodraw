import React, { useState, useCallback } from 'react'
import { Modal, Table, Button, Input, Select, Checkbox, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { ErColumn, ErConstraint } from '../types/shapeLibrary'
import { exportTableToSQL, type SqlDialect } from '../utils/erExporter'

interface ErColumnRow extends ErColumn {
  key: string
}

interface ErTableEditorProps {
  visible: boolean
  entityName: string
  columns: ErColumn[]
  onCancel: () => void
  onOk: (entityName: string, columns: ErColumn[]) => void
}

const DATA_TYPES = [
  'int',
  'bigint',
  'smallint',
  'tinyint',
  'decimal',
  'float',
  'double',
  'varchar',
  'char',
  'text',
  'longtext',
  'boolean',
  'date',
  'datetime',
  'timestamp',
  'time',
  'json',
  'uuid',
  'blob',
  'binary',
]

const CONSTRAINT_OPTIONS: { label: string; value: ErConstraint }[] = [
  { label: 'PK', value: 'pk' },
  { label: 'FK', value: 'fk' },
  { label: 'UNIQUE', value: 'unique' },
  { label: 'NOT NULL', value: 'notnull' },
  { label: 'AUTO', value: 'auto' },
  { label: 'INDEX', value: 'index' },
]

export const ErTableEditor: React.FC<ErTableEditorProps> = ({
  visible,
  entityName: initialEntityName,
  columns: initialColumns,
  onCancel,
  onOk,
}) => {
  const [entityName, setEntityName] = useState(initialEntityName)
  const [columns, setColumns] = useState<ErColumnRow[]>(() =>
    initialColumns.map((col, index) => ({ ...col, key: `col-${index}-${Date.now()}` }))
  )
  const [sqlPreview, setSqlPreview] = useState<string>('')
  const [showSqlPreview, setShowSqlPreview] = useState(false)
  const [dialect, setDialect] = useState<SqlDialect>('mysql')

  const addColumn = useCallback(() => {
    const newColumn: ErColumnRow = {
      key: `col-${Date.now()}`,
      name: `column_${columns.length + 1}`,
      type: 'varchar',
      constraints: [],
    }
    setColumns([...columns, newColumn])
  }, [columns])

  const deleteColumn = useCallback((key: string) => {
    setColumns(columns.filter((col) => col.key !== key))
  }, [columns])

  const updateColumn = useCallback((key: string, field: keyof ErColumn, value: string | ErConstraint[]) => {
    setColumns(
      columns.map((col) =>
        col.key === key ? { ...col, [field]: value } : col
      )
    )
  }, [columns])

  const toggleConstraint = useCallback((key: string, constraint: ErConstraint, checked: boolean) => {
    setColumns(
      columns.map((col) => {
        if (col.key !== key) return col
        const constraints = checked
          ? [...col.constraints.filter(c => c !== constraint), constraint]
          : col.constraints.filter((c) => c !== constraint)
        return { ...col, constraints }
      })
    )
  }, [columns])

  const handleOk = useCallback(() => {
    if (!entityName.trim()) {
      message.warning('请输入实体名称')
      return
    }
    if (columns.length === 0) {
      message.warning('请至少添加一列')
      return
    }
    const hasPk = columns.some((col) => col.constraints.includes('pk'))
    if (!hasPk) {
      message.warning('请至少指定一个主键列')
      return
    }
    onOk(
      entityName.trim(),
      columns.map(({ key: _key, ...rest }) => rest)
    )
  }, [entityName, columns, onOk])

  const generateSqlPreview = useCallback(() => {
    const cols = columns.map(({ key: _key, ...rest }) => rest)
    const sql = exportTableToSQL(entityName, cols, { dialect, dropIfExists: true })
    setSqlPreview(sql)
    setShowSqlPreview(true)
  }, [entityName, columns, dialect])

  const copySql = useCallback(() => {
    navigator.clipboard.writeText(sqlPreview)
    message.success('SQL已复制到剪贴板')
  }, [sqlPreview])

  const tableColumns: ColumnsType<ErColumnRow> = [
    {
      title: '列名',
      dataIndex: 'name',
      width: 150,
      render: (value, record) => (
        <Input
          value={value}
          onChange={(e) => updateColumn(record.key, 'name', e.target.value)}
          placeholder="列名"
        />
      ),
    },
    {
      title: '数据类型',
      dataIndex: 'type',
      width: 140,
      render: (value, record) => (
        <Select
          value={value}
          onChange={(v) => updateColumn(record.key, 'type', v)}
          options={DATA_TYPES.map((t) => ({ label: t, value: t }))}
          style={{ width: '100%' }}
          showSearch
        />
      ),
    },
    {
      title: '约束',
      dataIndex: 'constraints',
      width: 200,
      render: (constraints: ErConstraint[], record) => (
        <Space size={4} wrap>
          {CONSTRAINT_OPTIONS.map((opt) => (
            <Checkbox
              key={opt.value}
              checked={constraints.includes(opt.value)}
              onChange={(e) => toggleConstraint(record.key, opt.value, e.target.checked)}
            >
              {opt.label}
            </Checkbox>
          ))}
        </Space>
      ),
    },
    {
      title: '',
      width: 50,
      render: (_, record) => (
        <Popconfirm
          title="确定删除此列?"
          onConfirm={() => deleteColumn(record.key)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ]

  return (
    <>
      <Modal
        title="编辑表格实体"
        open={visible}
        onCancel={onCancel}
        onOk={handleOk}
        width={700}
        okText="确定"
        cancelText="取消"
        footer={[
          <Button key="sql" onClick={generateSqlPreview}>
            预览SQL
          </Button>,
          <Button key="cancel" onClick={onCancel}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={handleOk}>
            确定
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <label style={{ marginRight: 8, fontWeight: 500 }}>实体名称:</label>
            <Input
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="输入实体名称"
              style={{ width: 300 }}
            />
          </div>

          <div>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500 }}>列定义:</span>
              <Button type="dashed" icon={<PlusOutlined />} onClick={addColumn}>
                添加列
              </Button>
            </div>
            <Table
              columns={tableColumns}
              dataSource={columns}
              pagination={false}
              size="small"
              rowKey="key"
              locale={{ emptyText: '暂无列，请点击"添加列"按钮' }}
            />
          </div>
        </Space>
      </Modal>

      <Modal
        title="SQL预览"
        open={showSqlPreview}
        onCancel={() => setShowSqlPreview(false)}
        footer={[
          <Select
            key="dialect"
            value={dialect}
            onChange={setDialect}
            style={{ width: 120, marginRight: 8 }}
            options={[
              { label: 'MySQL', value: 'mysql' },
              { label: 'PostgreSQL', value: 'postgres' },
              { label: 'SQLite', value: 'sqlite' },
              { label: 'SQL Server', value: 'sqlserver' },
            ]}
          />,
          <Button key="copy" icon={<CopyOutlined />} onClick={copySql}>
            复制
          </Button>,
          <Button key="close" onClick={() => setShowSqlPreview(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
          {sqlPreview}
        </pre>
      </Modal>
    </>
  )
}

export default ErTableEditor
