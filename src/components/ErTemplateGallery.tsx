import React from 'react'
import { Card, Row, Col, Typography, Space, Tag, Modal } from 'antd'
import { 
  UserOutlined, ShopOutlined, ShoppingCartOutlined,
  BookOutlined, TeamOutlined, DatabaseOutlined
} from '@ant-design/icons'

const { Text, Title } = Typography

interface ErTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  tags: string[]
  tables: {
    name: string
    columns: { name: string; type: string; constraints: string[] }[]
    foreignKeys?: { column: string; refTable: string; refColumn: string }[]
  }[]
}

const ER_TEMPLATES: ErTemplate[] = [
  {
    id: 'user-system',
    name: '用户系统',
    description: '基础用户认证和权限管理',
    icon: <UserOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    tags: ['认证', '权限', '用户'],
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'username', type: 'varchar(50)', constraints: ['notnull', 'unique'] },
          { name: 'email', type: 'varchar(100)', constraints: ['notnull', 'unique'] },
          { name: 'password_hash', type: 'varchar(255)', constraints: ['notnull'] },
          { name: 'status', type: 'tinyint', constraints: [] },
          { name: 'created_at', type: 'timestamp', constraints: [] },
          { name: 'updated_at', type: 'timestamp', constraints: [] },
        ],
        foreignKeys: [],
      },
      {
        name: 'roles',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(50)', constraints: ['notnull', 'unique'] },
          { name: 'description', type: 'varchar(255)', constraints: [] },
        ],
        foreignKeys: [],
      },
      {
        name: 'user_roles',
        columns: [
          { name: 'user_id', type: 'int', constraints: ['pk', 'fk'] },
          { name: 'role_id', type: 'int', constraints: ['pk', 'fk'] },
        ],
        foreignKeys: [
          { column: 'user_id', refTable: 'users', refColumn: 'id' },
          { column: 'role_id', refTable: 'roles', refColumn: 'id' },
        ],
      },
      {
        name: 'permissions',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(100)', constraints: ['notnull', 'unique'] },
          { name: 'resource', type: 'varchar(100)', constraints: ['notnull'] },
          { name: 'action', type: 'varchar(50)', constraints: ['notnull'] },
        ],
        foreignKeys: [],
      },
      {
        name: 'role_permissions',
        columns: [
          { name: 'role_id', type: 'int', constraints: ['pk', 'fk'] },
          { name: 'permission_id', type: 'int', constraints: ['pk', 'fk'] },
        ],
        foreignKeys: [
          { column: 'role_id', refTable: 'roles', refColumn: 'id' },
          { column: 'permission_id', refTable: 'permissions', refColumn: 'id' },
        ],
      },
    ],
  },
  {
    id: 'e-commerce',
    name: '电商系统',
    description: '商品、订单、购物车核心模块',
    icon: <ShoppingCartOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
    tags: ['电商', '订单', '商品'],
    tables: [
      {
        name: 'products',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(200)', constraints: ['notnull'] },
          { name: 'description', type: 'text', constraints: [] },
          { name: 'price', type: 'decimal(10,2)', constraints: ['notnull'] },
          { name: 'stock', type: 'int', constraints: ['notnull'] },
          { name: 'category_id', type: 'int', constraints: ['fk'] },
          { name: 'status', type: 'tinyint', constraints: [] },
        ],
        foreignKeys: [],
      },
      {
        name: 'categories',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(100)', constraints: ['notnull'] },
          { name: 'parent_id', type: 'int', constraints: ['fk'] },
        ],
        foreignKeys: [],
      },
      {
        name: 'orders',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'user_id', type: 'int', constraints: ['fk', 'notnull'] },
          { name: 'total_amount', type: 'decimal(10,2)', constraints: ['notnull'] },
          { name: 'status', type: 'varchar(20)', constraints: ['notnull'] },
          { name: 'created_at', type: 'timestamp', constraints: [] },
        ],
        foreignKeys: [
          { column: 'user_id', refTable: 'users', refColumn: 'id' },
        ],
      },
      {
        name: 'order_items',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'order_id', type: 'int', constraints: ['fk', 'notnull'] },
          { name: 'product_id', type: 'int', constraints: ['fk', 'notnull'] },
          { name: 'quantity', type: 'int', constraints: ['notnull'] },
          { name: 'unit_price', type: 'decimal(10,2)', constraints: ['notnull'] },
        ],
        foreignKeys: [
          { column: 'order_id', refTable: 'orders', refColumn: 'id' },
          { column: 'product_id', refTable: 'products', refColumn: 'id' },
        ],
      },
      {
        name: 'cart_items',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'user_id', type: 'int', constraints: ['fk', 'notnull'] },
          { name: 'product_id', type: 'int', constraints: ['fk', 'notnull'] },
          { name: 'quantity', type: 'int', constraints: ['notnull'] },
        ],
        foreignKeys: [
          { column: 'user_id', refTable: 'users', refColumn: 'id' },
          { column: 'product_id', refTable: 'products', refColumn: 'id' },
        ],
      },
    ],
  },
  {
    id: 'blog-cms',
    name: '博客/CMS',
    description: '文章、分类、标签管理',
    icon: <BookOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
    tags: ['博客', 'CMS', '内容'],
    tables: [
      {
        name: 'articles',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'title', type: 'varchar(200)', constraints: ['notnull'] },
          { name: 'slug', type: 'varchar(200)', constraints: ['unique'] },
          { name: 'content', type: 'longtext', constraints: [] },
          { name: 'excerpt', type: 'text', constraints: [] },
          { name: 'author_id', type: 'int', constraints: ['fk'] },
          { name: 'category_id', type: 'int', constraints: ['fk'] },
          { name: 'status', type: 'enum', constraints: [] },
          { name: 'published_at', type: 'timestamp', constraints: [] },
          { name: 'created_at', type: 'timestamp', constraints: [] },
        ],
        foreignKeys: [],
      },
      {
        name: 'categories',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(100)', constraints: ['notnull'] },
          { name: 'slug', type: 'varchar(100)', constraints: ['unique'] },
          { name: 'parent_id', type: 'int', constraints: ['fk'] },
        ],
        foreignKeys: [],
      },
      {
        name: 'tags',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(50)', constraints: ['notnull', 'unique'] },
          { name: 'slug', type: 'varchar(50)', constraints: ['unique'] },
        ],
        foreignKeys: [],
      },
      {
        name: 'article_tags',
        columns: [
          { name: 'article_id', type: 'int', constraints: ['pk', 'fk'] },
          { name: 'tag_id', type: 'int', constraints: ['pk', 'fk'] },
        ],
        foreignKeys: [
          { column: 'article_id', refTable: 'articles', refColumn: 'id' },
          { column: 'tag_id', refTable: 'tags', refColumn: 'id' },
        ],
      },
      {
        name: 'comments',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'article_id', type: 'int', constraints: ['fk'] },
          { name: 'user_id', type: 'int', constraints: ['fk'] },
          { name: 'content', type: 'text', constraints: ['notnull'] },
          { name: 'status', type: 'tinyint', constraints: [] },
          { name: 'created_at', type: 'timestamp', constraints: [] },
        ],
        foreignKeys: [
          { column: 'article_id', refTable: 'articles', refColumn: 'id' },
        ],
      },
    ],
  },
  {
    id: 'company-hr',
    name: '企业人事',
    description: '员工、部门、考勤管理',
    icon: <TeamOutlined style={{ fontSize: 32, color: '#fa8c16' }} />,
    tags: ['HR', '员工', '部门'],
    tables: [
      {
        name: 'departments',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(100)', constraints: ['notnull'] },
          { name: 'parent_id', type: 'int', constraints: ['fk'] },
          { name: 'manager_id', type: 'int', constraints: ['fk'] },
        ],
        foreignKeys: [],
      },
      {
        name: 'employees',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'employee_no', type: 'varchar(20)', constraints: ['unique'] },
          { name: 'name', type: 'varchar(50)', constraints: ['notnull'] },
          { name: 'email', type: 'varchar(100)', constraints: ['unique'] },
          { name: 'phone', type: 'varchar(20)', constraints: [] },
          { name: 'department_id', type: 'int', constraints: ['fk'] },
          { name: 'position_id', type: 'int', constraints: ['fk'] },
          { name: 'hire_date', type: 'date', constraints: [] },
          { name: 'status', type: 'tinyint', constraints: [] },
        ],
        foreignKeys: [
          { column: 'department_id', refTable: 'departments', refColumn: 'id' },
        ],
      },
      {
        name: 'positions',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(100)', constraints: ['notnull'] },
          { name: 'level', type: 'int', constraints: [] },
        ],
        foreignKeys: [],
      },
      {
        name: 'attendance',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'employee_id', type: 'int', constraints: ['fk'] },
          { name: 'date', type: 'date', constraints: ['notnull'] },
          { name: 'check_in', type: 'time', constraints: [] },
          { name: 'check_out', type: 'time', constraints: [] },
          { name: 'status', type: 'tinyint', constraints: [] },
        ],
        foreignKeys: [
          { column: 'employee_id', refTable: 'employees', refColumn: 'id' },
        ],
      },
      {
        name: 'salaries',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'employee_id', type: 'int', constraints: ['fk'] },
          { name: 'month', type: 'varchar(7)', constraints: ['notnull'] },
          { name: 'base_salary', type: 'decimal(10,2)', constraints: ['notnull'] },
          { name: 'bonus', type: 'decimal(10,2)', constraints: [] },
          { name: 'deduction', type: 'decimal(10,2)', constraints: [] },
        ],
        foreignKeys: [
          { column: 'employee_id', refTable: 'employees', refColumn: 'id' },
        ],
      },
    ],
  },
  {
    id: 'inventory',
    name: '库存管理',
    description: '仓库、库存、出入库管理',
    icon: <DatabaseOutlined style={{ fontSize: 32, color: '#13c2c2' }} />,
    tags: ['库存', '仓库', '物流'],
    tables: [
      {
        name: 'warehouses',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(100)', constraints: ['notnull'] },
          { name: 'location', type: 'varchar(255)', constraints: [] },
          { name: 'capacity', type: 'int', constraints: [] },
        ],
        foreignKeys: [],
      },
      {
        name: 'inventory_items',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'sku', type: 'varchar(50)', constraints: ['unique'] },
          { name: 'name', type: 'varchar(200)', constraints: ['notnull'] },
          { name: 'category_id', type: 'int', constraints: ['fk'] },
          { name: 'unit', type: 'varchar(20)', constraints: [] },
        ],
        foreignKeys: [],
      },
      {
        name: 'inventory_stock',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'item_id', type: 'int', constraints: ['fk'] },
          { name: 'warehouse_id', type: 'int', constraints: ['fk'] },
          { name: 'quantity', type: 'int', constraints: ['notnull'] },
          { name: 'min_quantity', type: 'int', constraints: [] },
        ],
        foreignKeys: [
          { column: 'item_id', refTable: 'inventory_items', refColumn: 'id' },
          { column: 'warehouse_id', refTable: 'warehouses', refColumn: 'id' },
        ],
      },
      {
        name: 'stock_transactions',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'item_id', type: 'int', constraints: ['fk'] },
          { name: 'warehouse_id', type: 'int', constraints: ['fk'] },
          { name: 'type', type: 'enum', constraints: ['notnull'] },
          { name: 'quantity', type: 'int', constraints: ['notnull'] },
          { name: 'reference_id', type: 'int', constraints: [] },
          { name: 'created_at', type: 'timestamp', constraints: [] },
        ],
        foreignKeys: [
          { column: 'item_id', refTable: 'inventory_items', refColumn: 'id' },
          { column: 'warehouse_id', refTable: 'warehouses', refColumn: 'id' },
        ],
      },
    ],
  },
  {
    id: 'shop-management',
    name: '门店管理',
    description: '连锁门店、员工排班',
    icon: <ShopOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
    tags: ['门店', '连锁', '零售'],
    tables: [
      {
        name: 'stores',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'name', type: 'varchar(100)', constraints: ['notnull'] },
          { name: 'address', type: 'varchar(255)', constraints: [] },
          { name: 'phone', type: 'varchar(20)', constraints: [] },
          { name: 'manager_id', type: 'int', constraints: ['fk'] },
          { name: 'status', type: 'tinyint', constraints: [] },
        ],
        foreignKeys: [],
      },
      {
        name: 'store_employees',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'store_id', type: 'int', constraints: ['fk'] },
          { name: 'name', type: 'varchar(50)', constraints: ['notnull'] },
          { name: 'role', type: 'varchar(50)', constraints: [] },
          { name: 'phone', type: 'varchar(20)', constraints: [] },
        ],
        foreignKeys: [
          { column: 'store_id', refTable: 'stores', refColumn: 'id' },
        ],
      },
      {
        name: 'shifts',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'store_id', type: 'int', constraints: ['fk'] },
          { name: 'employee_id', type: 'int', constraints: ['fk'] },
          { name: 'date', type: 'date', constraints: ['notnull'] },
          { name: 'start_time', type: 'time', constraints: ['notnull'] },
          { name: 'end_time', type: 'time', constraints: ['notnull'] },
        ],
        foreignKeys: [
          { column: 'store_id', refTable: 'stores', refColumn: 'id' },
          { column: 'employee_id', refTable: 'store_employees', refColumn: 'id' },
        ],
      },
      {
        name: 'daily_sales',
        columns: [
          { name: 'id', type: 'int', constraints: ['pk', 'auto'] },
          { name: 'store_id', type: 'int', constraints: ['fk'] },
          { name: 'date', type: 'date', constraints: ['notnull'] },
          { name: 'total_amount', type: 'decimal(10,2)', constraints: ['notnull'] },
          { name: 'transaction_count', type: 'int', constraints: [] },
        ],
        foreignKeys: [
          { column: 'store_id', refTable: 'stores', refColumn: 'id' },
        ],
      },
    ],
  },
]

interface ErTemplateGalleryProps {
  visible: boolean
  onClose: () => void
  onSelect: (template: ErTemplate) => void
}

const ErTemplateGallery: React.FC<ErTemplateGalleryProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  return (
    <Modal
      open={visible}
      title={
        <Space>
          <DatabaseOutlined />
          <span>ER图模板库</span>
        </Space>
      }
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Row gutter={[16, 16]}>
        {ER_TEMPLATES.map(template => (
          <Col key={template.id} span={8}>
            <Card
              hoverable
              onClick={() => onSelect(template)}
              style={{ height: '100%' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                {template.icon}
              </div>
              <Title level={5} style={{ textAlign: 'center', marginBottom: 8 }}>
                {template.name}
              </Title>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', textAlign: 'center' }}>
                {template.description}
              </Text>
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Space size={4} wrap>
                  {template.tags.map(tag => (
                    <Tag key={tag} color="blue">{tag}</Tag>
                  ))}
                </Space>
              </div>
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {template.tables.length} 个表
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  )
}

export default ErTemplateGallery
export { ER_TEMPLATES }
export type { ErTemplate }
