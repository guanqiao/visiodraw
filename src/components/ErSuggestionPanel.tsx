import React, { useMemo } from 'react'
import { List, Tag, Space, Typography, Empty, Badge, Collapse } from 'antd'
import { 
  WarningOutlined, InfoCircleOutlined, CloseCircleOutlined,
  KeyOutlined, LinkOutlined, FontSizeOutlined, TableOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import type { ErSuggestion } from '@utils/erAnalyzer'
import { getSuggestionSummary } from '@utils/erAnalyzer'

const { Text } = Typography
const { Panel } = Collapse

interface ErSuggestionPanelProps {
  suggestions: ErSuggestion[]
  onNodeClick?: (nodeId: string) => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  primaryKey: <KeyOutlined />,
  naming: <FontSizeOutlined />,
  orphan: <TableOutlined />,
  dataType: <ThunderboltOutlined />,
  relationship: <LinkOutlined />,
  bestPractice: <InfoCircleOutlined />,
}

const categoryColors: Record<string, string> = {
  primaryKey: '#1890ff',
  naming: '#722ed1',
  orphan: '#fa8c16',
  dataType: '#13c2c2',
  relationship: '#eb2f96',
  bestPractice: '#52c41a',
}

const ErSuggestionPanel: React.FC<ErSuggestionPanelProps> = ({
  suggestions,
  onNodeClick,
}) => {
  const summary = useMemo(() => getSuggestionSummary(suggestions), [suggestions])

  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, ErSuggestion[]> = {}
    suggestions.forEach(s => {
      if (!groups[s.category]) groups[s.category] = []
      groups[s.category].push(s)
    })
    return groups
  }, [suggestions])

  if (suggestions.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={0}>
              <Text type="secondary">没有发现设计问题</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                ER图设计良好
              </Text>
            </Space>
          }
        />
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />
    }
  }

  const getTypeTag = (type: string) => {
    switch (type) {
      case 'error':
        return <Tag color="error">错误</Tag>
      case 'warning':
        return <Tag color="warning">警告</Tag>
      default:
        return <Tag color="processing">建议</Tag>
    }
  }

  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{ 
        padding: '12px 0', 
        borderBottom: '1px solid #f0f0f0',
        marginBottom: 12,
      }}>
        <Space size="large">
          {summary.errors > 0 && (
            <Badge count={summary.errors} size="small" color="#f5222d">
              <Tag color="error">错误</Tag>
            </Badge>
          )}
          {summary.warnings > 0 && (
            <Badge count={summary.warnings} size="small" color="#faad14">
              <Tag color="warning">警告</Tag>
            </Badge>
          )}
          {summary.infos > 0 && (
            <Badge count={summary.infos} size="small" color="#1890ff">
              <Tag color="processing">建议</Tag>
            </Badge>
          )}
        </Space>
      </div>

      <Collapse 
        ghost 
        defaultActiveKey={Object.keys(groupedSuggestions)}
      >
        {Object.entries(groupedSuggestions).map(([category, items]) => (
          <Panel
            key={category}
            header={
              <Space>
                <span style={{ color: categoryColors[category] }}>
                  {categoryIcons[category]}
                </span>
                <Text strong>
                  {category === 'primaryKey' && '主键问题'}
                  {category === 'naming' && '命名规范'}
                  {category === 'orphan' && '孤立表'}
                  {category === 'dataType' && '数据类型'}
                  {category === 'relationship' && '关系问题'}
                  {category === 'bestPractice' && '最佳实践'}
                </Text>
                <Tag>{items.length}</Tag>
              </Space>
            }
          >
            <List
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  style={{ 
                    padding: '8px 0',
                    cursor: item.nodeId ? 'pointer' : 'default',
                  }}
                  onClick={() => item.nodeId && onNodeClick?.(item.nodeId)}
                >
                  <List.Item.Meta
                    avatar={getTypeIcon(item.type)}
                    title={
                      <Space>
                        {getTypeTag(item.type)}
                        <Text>{item.message}</Text>
                      </Space>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.suggestion}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Panel>
        ))}
      </Collapse>
    </div>
  )
}

export default ErSuggestionPanel
