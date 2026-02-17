import React, { useState } from 'react'
import { Modal, Input, Button, message, Typography, Alert, Space } from 'antd'
import { ImportOutlined, FileTextOutlined } from '@ant-design/icons'
import { parseMermaidCode } from '../utils/mermaidParser'
import { buildDiagramTemplate } from '../utils/diagramTemplateBuilder'
import useX6GraphStore from '@stores/x6GraphStore'

const { TextArea } = Input
const { Text } = Typography

interface MermaidImportDialogProps {
  visible: boolean
  onClose: () => void
}

const MermaidImportDialog: React.FC<MermaidImportDialogProps> = ({ visible, onClose }) => {
  const [code, setCode] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { addNodes, addEdge, newGraph } = useX6GraphStore()

  const handleImport = async () => {
    if (!code.trim()) {
      message.warning('请输入 Mermaid 代码')
      return
    }

    setParsing(true)
    setError(null)

    try {
      const result = parseMermaidCode(code)

      if (!result.success) {
        setError(result.error || '解析失败')
        setParsing(false)
        return
      }

      // Clear current canvas
      newGraph()

      // Add nodes
      if (result.nodes && result.nodes.length > 0) {
        const { nodes: shapeData } = buildDiagramTemplate({
          id: 'imported',
          name: 'Imported',
          type: result.diagramType!,
          nodes: result.nodes,
          edges: result.edges || [],
        })
        addNodes(shapeData)
      }

      // Add edges
      if (result.edges && result.edges.length > 0) {
        const { edges: connectorData } = buildDiagramTemplate({
          id: 'imported',
          name: 'Imported',
          type: result.diagramType!,
          nodes: result.nodes || [],
          edges: result.edges,
        })
        connectorData.forEach((edge) => addEdge(edge))
      }

      message.success(`成功导入 ${result.diagramType} 图表`)
      setCode('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败')
    } finally {
      setParsing(false)
    }
  }

  const handleLoadExample = (type: 'activity' | 'sequence' | 'state' | 'er' | 'class' | 'gantt') => {
    const examples = {
      activity: `flowchart TD
    Start([开始]) --> Input[输入数据]
    Input --> Validate{验证}
    Validate -->|有效| Process[处理]
    Validate -->|无效| Error[显示错误]
    Error --> Input
    Process --> Output[输出结果]
    Output --> End([结束])`,
      sequence: `sequenceDiagram
    participant User as 用户
    participant API as API网关
    participant Service as 服务
    participant DB as 数据库
    User->>API: 发送请求
    API->>Service: 转发请求
    Service->>DB: 查询数据
    DB-->>Service: 返回数据
    Service-->>API: 返回结果
    API-->>User: 响应`,
      state: `stateDiagram
    [*] --> Idle
    Idle --> Running: 启动
    Running --> Paused: 暂停
    Paused --> Running: 恢复
    Running --> Stopped: 停止
    Stopped --> [*]`,
      er: `erDiagram
    CUSTOMER {
        int id PK
        string name
        string email
    }
    ORDER {
        int id PK
        int customer_id FK
        date order_date
    }
    CUSTOMER ||--o{ ORDER : places`,
      class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
      gantt: `gantt
    title 项目进度计划
    dateFormat YYYY-MM-DD
    section 项目规划
    需求分析    :done, a1, 2024-01-01, 7d
    设计阶段    :active, a2, after a1, 5d
    section 开发阶段
    编码实现    :a3, after a2, 14d
    测试验证    :a4, after a3, 7d`,
    }

    setCode(examples[type])
    setError(null)
  }

  return (
    <Modal
      title="从 Mermaid 导入"
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="import"
          type="primary"
          icon={<ImportOutlined />}
          loading={parsing}
          onClick={handleImport}
        >
          导入
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          message="支持以下 Mermaid 图表类型"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>flowchart / graph - 活动图</li>
              <li>sequenceDiagram - 序列图</li>
              <li>stateDiagram - 状态图</li>
              <li>erDiagram - ER图</li>
              <li>classDiagram - 类图</li>
              <li>gantt - 甘特图</li>
            </ul>
          }
          type="info"
          showIcon
        />

        <div>
          <Text type="secondary">加载示例：</Text>
          <Space size="small" style={{ marginLeft: 8 }} wrap>
            <Button size="small" onClick={() => handleLoadExample('activity')}>
              活动图
            </Button>
            <Button size="small" onClick={() => handleLoadExample('sequence')}>
              序列图
            </Button>
            <Button size="small" onClick={() => handleLoadExample('state')}>
              状态图
            </Button>
            <Button size="small" onClick={() => handleLoadExample('er')}>
              ER图
            </Button>
            <Button size="small" onClick={() => handleLoadExample('class')}>
              类图
            </Button>
            <Button size="small" onClick={() => handleLoadExample('gantt')}>
              甘特图
            </Button>
          </Space>
        </div>

        <TextArea
          placeholder="在此粘贴 Mermaid 代码..."
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(null)
          }}
          rows={12}
          style={{ fontFamily: 'monospace' }}
        />

        {error && (
          <Alert message={error} type="error" showIcon />
        )}
      </Space>
    </Modal>
  )
}

export default MermaidImportDialog
