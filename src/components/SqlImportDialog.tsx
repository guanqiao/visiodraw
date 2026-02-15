import React, { useState, useMemo, useCallback } from 'react'
import { Modal, Input, Button, message, Table, Alert, Space, Typography, Divider, Upload, Tooltip } from 'antd'
import { ImportOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined, UploadOutlined, ClearOutlined } from '@ant-design/icons'
import { parseCreateTableSQL, generateErNodesFromTables, type ParsedSqlTable } from '../utils/erExporter'

const { TextArea } = Input
const { Text } = Typography

interface SqlImportDialogProps {
  visible: boolean
  onImport: (tables: ParsedSqlTable[]) => void
  onCancel: () => void
}

const SAMPLE_SQL = `-- 示例 SQL
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  status ENUM('draft', 'published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);`

const SqlImportDialog: React.FC<SqlImportDialogProps> = ({
  visible,
  onImport,
  onCancel,
}) => {
  const [sqlText, setSqlText] = useState('')
  const [imported, setImported] = useState(false)

  const parseResult = useMemo(() => {
    if (!sqlText.trim()) {
      return { tables: [], errors: [] }
    }
    return parseCreateTableSQL(sqlText)
  }, [sqlText])

  const handleImport = useCallback(() => {
    if (parseResult.tables.length === 0) {
      message.warning('没有可导入的表')
      return
    }
    
    onImport(parseResult.tables)
    setImported(true)
    message.success(`成功导入 ${parseResult.tables.length} 个表`)
  }, [parseResult.tables, onImport])

  const handleCancel = useCallback(() => {
    setSqlText('')
    setImported(false)
    onCancel()
  }, [onCancel])

  const handleLoadSample = useCallback(() => {
    setSqlText(SAMPLE_SQL)
    message.info('已加载示例 SQL')
  }, [])

  const handleClear = useCallback(() => {
    setSqlText('')
    setImported(false)
  }, [])

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setSqlText(content)
      message.success(`已加载文件: ${file.name}`)
    }
    reader.onerror = () => {
      message.error('文件读取失败')
    }
    reader.readAsText(file)
    return false
  }, [])

  const tableColumns = [
    {
      title: '表名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong style={{ color: '#1890ff' }}>{name}</Text>,
    },
    {
      title: '列数',
      key: 'columns',
      render: (_: unknown, record: ParsedSqlTable) => (
        <Text>{record.columns.length} 列</Text>
      ),
    },
    {
      title: '主键',
      key: 'pk',
      render: (_: unknown, record: ParsedSqlTable) => {
        const pkColumns = record.columns.filter(c => c.constraints.includes('pk'))
        return pkColumns.length > 0 ? (
          <Text type="success">{pkColumns.map(c => c.name).join(', ')}</Text>
        ) : (
          <Text type="secondary">无</Text>
        )
      },
    },
    {
      title: '外键',
      key: 'fk',
      render: (_: unknown, record: ParsedSqlTable) => {
        const fkColumns = record.columns.filter(c => c.constraints.includes('fk'))
        return fkColumns.length > 0 ? (
          <Text type="warning">{fkColumns.map(c => c.name).join(', ')}</Text>
        ) : (
          <Text type="secondary">无</Text>
        )
      },
    },
    {
      title: '状态',
      key: 'status',
      render: () => (
        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
      ),
    },
  ]

  return (
    <Modal
      title={
        <Space>
          <ImportOutlined />
          从 SQL 导入 ER 图
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="import"
          type="primary"
          icon={<ImportOutlined />}
          onClick={handleImport}
          disabled={parseResult.tables.length === 0}
        >
          导入到画布
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 12 }}>
        <Space>
          <Button
            size="small"
            icon={<FileTextOutlined />}
            onClick={handleLoadSample}
          >
            加载示例
          </Button>
          <Upload
            accept=".sql,.txt"
            beforeUpload={handleFileUpload}
            showUploadList={false}
          >
            <Button size="small" icon={<UploadOutlined />}>
              上传 SQL 文件
            </Button>
          </Upload>
          <Button
            size="small"
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={!sqlText}
          >
            清空
          </Button>
        </Space>
      </div>

      <TextArea
        value={sqlText}
        onChange={(e) => setSqlText(e.target.value)}
        placeholder="粘贴 CREATE TABLE 语句..."
        style={{
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: 13,
          marginBottom: 16,
        }}
        rows={10}
      />

      {parseResult.errors.length > 0 && (
        <Alert
          type="warning"
          message="解析警告"
          description={parseResult.errors.join('; ')}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {parseResult.tables.length > 0 && (
        <>
          <Divider style={{ margin: '12px 0' }}>
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text>解析结果: {parseResult.tables.length} 个表</Text>
            </Space>
          </Divider>

          <Table
            dataSource={parseResult.tables}
            columns={tableColumns}
            rowKey="name"
            size="small"
            pagination={false}
            scroll={{ y: 200 }}
          />

          <Alert
            type="info"
            message="导入提示"
            description="点击「导入到画布」按钮，解析的表将以 ER 表格实体的形式添加到画布中。外键关系将自动创建连接线。"
            showIcon
            style={{ marginTop: 12 }}
          />
        </>
      )}

      {sqlText && parseResult.tables.length === 0 && (
        <Alert
          type="error"
          message="解析失败"
          description="未能从输入的 SQL 中解析到有效的 CREATE TABLE 语句，请检查 SQL 格式是否正确。"
          showIcon
        />
      )}
    </Modal>
  )
}

export default SqlImportDialog
