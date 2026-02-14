import React, { useState, useMemo, useCallback } from 'react'
import { Modal, Select, Button, message, Tabs, Empty, Space } from 'antd'
import { CopyOutlined, DownloadOutlined, DatabaseOutlined } from '@ant-design/icons'
import { exportAllTablesToSQL, type SqlDialect } from '../utils/erExporter'
import type { ErColumn } from '../types/shapeLibrary'

interface TableData {
  id: string
  name: string
  columns: ErColumn[]
}

interface SqlExportDialogProps {
  visible: boolean
  tables: TableData[]
  onCancel: () => void
}

const DIALECT_OPTIONS = [
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'postgres' },
  { label: 'SQLite', value: 'sqlite' },
  { label: 'SQL Server', value: 'sqlserver' },
]

export const SqlExportDialog: React.FC<SqlExportDialogProps> = ({
  visible,
  tables,
  onCancel,
}) => {
  const [dialect, setDialect] = useState<SqlDialect>('mysql')
  const [activeTab, setActiveTab] = useState<string>('all')

  const generateSql = useCallback(
    (tableList: TableData[]) => {
      return exportAllTablesToSQL(
        tableList.map((t) => ({ name: t.name, columns: t.columns })),
        { dialect, dropIfExists: true }
      )
    },
    [dialect]
  )

  const allSql = useMemo(() => generateSql(tables), [generateSql, tables])

  const tableTabs = useMemo(() => {
    const tabs = [
      {
        key: 'all',
        label: '全部表',
        children: (
          <pre style={sqlPreviewStyle}>
            {tables.length > 0 ? allSql : '暂无表格实体'}
          </pre>
        ),
      },
    ]

    tables.forEach((table) => {
      tabs.push({
        key: table.id,
        label: table.name,
        children: (
          <pre style={sqlPreviewStyle}>{generateSql([table])}</pre>
        ),
      })
    })

    return tabs
  }, [tables, allSql, generateSql])

  const copyToClipboard = useCallback(() => {
    const sql = activeTab === 'all' ? allSql : generateSql([tables.find((t) => t.id === activeTab)!])
    navigator.clipboard.writeText(sql)
    message.success('SQL已复制到剪贴板')
  }, [activeTab, allSql, generateSql, tables])

  const downloadSql = useCallback(() => {
    const sql = activeTab === 'all' ? allSql : generateSql([tables.find((t) => t.id === activeTab)!])
    const fileName = activeTab === 'all' ? 'schema.sql' : `${activeTab}.sql`
    const blob = new Blob([sql], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    message.success('SQL文件已下载')
  }, [activeTab, allSql, generateSql, tables])

  return (
    <Modal
      title={
        <Space>
          <DatabaseOutlined />
          导出SQL
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Select
          key="dialect"
          value={dialect}
          onChange={setDialect}
          style={{ width: 140 }}
          options={DIALECT_OPTIONS}
        />,
        <Button key="copy" icon={<CopyOutlined />} onClick={copyToClipboard}>
          复制
        </Button>,
        <Button key="download" icon={<DownloadOutlined />} onClick={downloadSql}>
          下载
        </Button>,
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
      ]}
      width={700}
    >
      {tables.length > 0 ? (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tableTabs}
        />
      ) : (
        <Empty description="暂无表格实体，请先添加表格实体到画布" />
      )}
    </Modal>
  )
}

const sqlPreviewStyle: React.CSSProperties = {
  background: '#1e1e1e',
  color: '#d4d4d4',
  padding: 16,
  borderRadius: 8,
  overflow: 'auto',
  maxHeight: 400,
  fontSize: 13,
  fontFamily: 'Consolas, Monaco, monospace',
}

export default SqlExportDialog
