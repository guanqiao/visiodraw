import React, { useState } from 'react'
import { Modal, Form, Input, Select, Button, Space, Alert, Typography, Divider, message, Spin } from 'antd'
import { 
  DatabaseOutlined, LinkOutlined, TableOutlined,
  SafetyOutlined, WarningOutlined
} from '@ant-design/icons'

const { Password } = Input
const { Text } = Typography

interface DatabaseConnection {
  type: 'mysql' | 'postgresql' | 'sqlite'
  host?: string
  port?: number
  username?: string
  password?: string
  database: string
  filename?: string
}

interface DbReverseEngineeringProps {
  visible: boolean
  onClose: () => void
  onImport: (tables: any[]) => void
}

const defaultPorts: Record<string, number> = {
  mysql: 3306,
  postgresql: 5432,
  sqlite: 0,
}

const DbReverseEngineering: React.FC<DbReverseEngineeringProps> = ({
  visible,
  onClose,
  onImport,
}) => {
  const [form] = Form.useForm()
  const [dbType, setDbType] = useState<string>('mysql')
  const [connecting, setConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [tables, setTables] = useState<any[]>([])

  const handleDbTypeChange = (value: string) => {
    setDbType(value)
    setConnectionStatus('idle')
    setTables([])
    if (value !== 'sqlite') {
      form.setFieldsValue({ port: defaultPorts[value] })
    }
  }

  const handleTestConnection = async () => {
    try {
      const values = await form.validateFields()
      setConnecting(true)
      setErrorMessage('')
      
      // 由于是前端应用，无法直接连接数据库
      // 这里模拟连接过程并提示用户
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟成功获取表结构
      const mockTables = [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
            { name: 'username', type: 'varchar(50)', constraints: ['notnull', 'unique'] },
            { name: 'email', type: 'varchar(100)', constraints: ['notnull', 'unique'] },
            { name: 'password_hash', type: 'varchar(255)', constraints: ['notnull'] },
            { name: 'created_at', type: 'timestamp', constraints: [] },
            { name: 'updated_at', type: 'timestamp', constraints: [] },
          ],
          foreignKeys: [],
          indexes: [{ name: 'idx_users_email', columns: ['email'] }],
        },
        {
          name: 'posts',
          columns: [
            { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
            { name: 'title', type: 'varchar(200)', constraints: ['notnull'] },
            { name: 'content', type: 'text', constraints: [] },
            { name: 'user_id', type: 'int', constraints: ['fk'] },
            { name: 'status', type: 'enum', constraints: [] },
            { name: 'created_at', type: 'timestamp', constraints: [] },
          ],
          foreignKeys: [{ column: 'user_id', refTable: 'users', refColumn: 'id' }],
          indexes: [{ name: 'idx_posts_user_id', columns: ['user_id'] }],
        },
        {
          name: 'comments',
          columns: [
            { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
            { name: 'post_id', type: 'int', constraints: ['fk'] },
            { name: 'user_id', type: 'int', constraints: ['fk'] },
            { name: 'content', type: 'text', constraints: ['notnull'] },
            { name: 'created_at', type: 'timestamp', constraints: [] },
          ],
          foreignKeys: [
            { column: 'post_id', refTable: 'posts', refColumn: 'id' },
            { column: 'user_id', refTable: 'users', refColumn: 'id' },
          ],
          indexes: [],
        },
      ]
      
      setTables(mockTables)
      setConnectionStatus('success')
      message.success(`成功连接数据库，发现 ${mockTables.length} 个表`)
    } catch (error: any) {
      setConnectionStatus('error')
      setErrorMessage(error.message || '连接失败')
      message.error('数据库连接失败')
    } finally {
      setConnecting(false)
    }
  }

  const handleImport = () => {
    if (tables.length === 0) {
      message.warning('请先连接数据库并获取表结构')
      return
    }
    onImport(tables)
    message.success(`已导入 ${tables.length} 个表`)
    handleClose()
  }

  const handleClose = () => {
    form.resetFields()
    setConnectionStatus('idle')
    setTables([])
    setErrorMessage('')
    onClose()
  }

  return (
    <Modal
      open={visible}
      title={
        <Space>
          <DatabaseOutlined />
          <span>数据库反向工程</span>
        </Space>
      }
      onCancel={handleClose}
      width={600}
      footer={
        <Space>
          <Button onClick={handleClose}>取消</Button>
          <Button 
            type="primary" 
            onClick={handleImport}
            disabled={tables.length === 0}
          >
            导入到画布
          </Button>
        </Space>
      }
    >
      <Alert
        type="info"
        message="功能说明"
        description={
          <Space direction="vertical" size={0}>
            <Text>此功能用于从现有数据库读取表结构并生成ER图。</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              注意：由于浏览器安全限制，直接连接数据库功能需要后端服务支持。
              当前为演示模式，将显示模拟数据。
            </Text>
          </Space>
        }
        style={{ marginBottom: 16 }}
        showIcon
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: 'mysql',
          port: 3306,
        }}
      >
        <Form.Item
          name="type"
          label="数据库类型"
          rules={[{ required: true }]}
        >
          <Select onChange={handleDbTypeChange}>
            <Select.Option value="mysql">
              <Space>
                <DatabaseOutlined style={{ color: '#00758f' }} />
                MySQL
              </Space>
            </Select.Option>
            <Select.Option value="postgresql">
              <Space>
                <DatabaseOutlined style={{ color: '#336791' }} />
                PostgreSQL
              </Space>
            </Select.Option>
            <Select.Option value="sqlite">
              <Space>
                <DatabaseOutlined style={{ color: '#003b57' }} />
                SQLite
              </Space>
            </Select.Option>
          </Select>
        </Form.Item>

        {dbType !== 'sqlite' ? (
          <>
            <Form.Item label="连接信息" required style={{ marginBottom: 0 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="host"
                  noStyle
                  rules={[{ required: true, message: '请输入主机地址' }]}
                >
                  <Input 
                    placeholder="主机地址 (如: localhost)" 
                    prefix={<LinkOutlined />}
                    style={{ width: '50%' }}
                  />
                </Form.Item>
                <Form.Item
                  name="port"
                  noStyle
                  rules={[{ required: true, message: '请输入端口' }]}
                >
                  <Input 
                    type="number" 
                    placeholder="端口" 
                    style={{ width: '25%' }}
                  />
                </Form.Item>
                <Form.Item
                  name="database"
                  noStyle
                  rules={[{ required: true, message: '请输入数据库名' }]}
                >
                  <Input 
                    placeholder="数据库名" 
                    style={{ width: '25%' }}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>

            <Form.Item label="认证信息" required style={{ marginBottom: 0, marginTop: 16 }}>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="username"
                  noStyle
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input placeholder="用户名" style={{ width: '50%' }} />
                </Form.Item>
                <Form.Item
                  name="password"
                  noStyle
                >
                  <Password placeholder="密码" style={{ width: '50%' }} />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </>
        ) : (
          <Form.Item
            name="filename"
            label="数据库文件"
            rules={[{ required: true, message: '请输入数据库文件路径' }]}
          >
            <Input placeholder="数据库文件路径 (如: /path/to/database.db)" />
          </Form.Item>
        )}

        <Form.Item style={{ marginTop: 16 }}>
          <Button 
            type="primary" 
            onClick={handleTestConnection}
            loading={connecting}
            icon={<SafetyOutlined />}
          >
            测试连接
          </Button>
        </Form.Item>
      </Form>

      {connectionStatus === 'success' && tables.length > 0 && (
        <>
          <Divider>发现的表 ({tables.length})</Divider>
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {tables.map(table => (
              <div 
                key={table.name}
                style={{ 
                  padding: '8px 12px', 
                  background: '#f5f5f5', 
                  marginBottom: 8,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <TableOutlined style={{ color: '#1890ff' }} />
                <Text strong>{table.name}</Text>
                <Text type="secondary">({table.columns.length} 列)</Text>
                {table.foreignKeys?.length > 0 && (
                  <Text type="secondary">({table.foreignKeys.length} 外键)</Text>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {connectionStatus === 'error' && (
        <Alert
          type="error"
          message="连接失败"
          description={errorMessage}
          showIcon
          icon={<WarningOutlined />}
          style={{ marginTop: 16 }}
        />
      )}
    </Modal>
  )
}

export default DbReverseEngineering
