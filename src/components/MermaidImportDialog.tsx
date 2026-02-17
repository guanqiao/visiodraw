import React, { useState, useMemo } from 'react'
import { Modal, Input, Button, message, Typography, Alert, Space, Tag, Divider, Collapse } from 'antd'
import { ImportOutlined, FileTextOutlined, CheckCircleOutlined, WarningOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { parseMermaidCode, detectDiagramType } from '../utils/mermaidParser'
import { buildDiagramTemplate } from '../utils/diagramTemplateBuilder'
import { mermaidSyntaxValidator, type ValidationError } from '../utils/mermaidSyntaxValidator'
import useX6GraphStore from '@stores/x6GraphStore'

const { TextArea } = Input
const { Text, Title } = Typography
const { Panel } = Collapse

interface MermaidImportDialogProps {
  visible: boolean
  onClose: () => void
}

const MermaidImportDialog: React.FC<MermaidImportDialogProps> = ({ visible, onClose }) => {
  const [code, setCode] = useState('')
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { addNodes, addEdge, newGraph } = useX6GraphStore()

  const diagramType = useMemo(() => detectDiagramType(code), [code])
  
  const validationResult = useMemo(() => {
    if (!diagramType || !code.trim()) return null
    return mermaidSyntaxValidator.validate(code, diagramType)
  }, [code, diagramType])

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

      newGraph()

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

  const handleLoadExample = (type: string) => {
    const examples: Record<string, string> = {
      activity: `flowchart TD
    Start([开始]) --> Input[输入数据]
    Input --> Validate{验证}
    Validate -->|有效| Process[处理]
    Validate -->|无效| Error[显示错误]
    Error --> Input
    Process --> Output[输出结果]
    Output --> End([结束])`,
      activitySubgraph: `flowchart TB
    subgraph 用户界面
        A[登录页面] --> B[主页]
    end
    subgraph 后端服务
        C[API网关] --> D[认证服务]
        D --> E[用户服务]
    end
    B --> C`,
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
      sequenceFragment: `sequenceDiagram
    participant A as 用户A
    participant B as 用户B
    participant S as 服务器
    
    loop 每分钟
        A->>S: 心跳检测
        S-->>A: 确认
    end
    
    alt 成功
        A->>B: 发送消息
        B-->>A: 确认接收
    else 失败
        A->>S: 存储离线消息
    end`,
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
      pie: `pie showtitle
    title 浏览器市场份额
    "Chrome" : 65
    "Safari" : 19
    "Firefox" : 8
    "Edge" : 5
    "其他" : 3`,
      journey: `journey
    title 用户购物旅程
    section 浏览商品
      搜索商品: 5: 用户
      查看详情: 4: 用户
    section 下单支付
      加入购物车: 4: 用户
      提交订单: 3: 用户, 系统
      支付成功: 5: 用户, 支付系统`,
      style: `flowchart LR
    A[开始] --> B[处理]
    B --> C{判断}
    C -->|是| D[结束]
    C -->|否| B
    
    classDef success fill:#52c41a,stroke:#389e0d,color:#fff
    classDef error fill:#f5222d,stroke:#cf1322,color:#fff
    classDef process fill:#1890ff,stroke:#096dd9,color:#fff
    
    class A success
    class B process
    class D success`,
    }

    setCode(examples[type] || '')
    setError(null)
  }

  const renderValidationResult = () => {
    if (!validationResult) return null

    const { valid, errors, warnings } = validationResult

    if (valid && warnings.length === 0) {
      return (
        <Alert
          message="语法检查通过"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      )
    }

    return (
      <Collapse size="small" style={{ marginTop: 8 }}>
        <Panel
          header={
            <Space>
              {errors.length > 0 && (
                <Tag color="error" icon={<WarningOutlined />}>
                  {errors.length} 错误
                </Tag>
              )}
              {warnings.length > 0 && (
                <Tag color="warning" icon={<InfoCircleOutlined />}>
                  {warnings.length} 警告
                </Tag>
              )}
            </Space>
          }
          key="validation"
        >
          {errors.map((err, idx) => (
            <div key={`error-${idx}`} style={{ color: '#f5222d', marginBottom: 4 }}>
              <WarningOutlined /> 行 {err.line}: {err.message}
            </div>
          ))}
          {warnings.map((warn, idx) => (
            <div key={`warning-${idx}`} style={{ color: '#faad14', marginBottom: 4 }}>
              <InfoCircleOutlined /> 行 {warn.line}: {warn.message}
            </div>
          ))}
        </Panel>
      </Collapse>
    )
  }

  return (
    <Modal
      title="从 Mermaid 导入"
      open={visible}
      onCancel={onClose}
      width={800}
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
          disabled={validationResult ? !validationResult.valid : false}
        >
          导入
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Alert
          message="支持以下 Mermaid 图表类型"
          description={
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Tag color="blue">flowchart/graph</Tag>
              <Tag color="green">sequenceDiagram</Tag>
              <Tag color="orange">stateDiagram</Tag>
              <Tag color="purple">erDiagram</Tag>
              <Tag color="cyan">classDiagram</Tag>
              <Tag color="magenta">gantt</Tag>
              <Tag color="gold">pie</Tag>
              <Tag color="lime">journey</Tag>
              <Tag color="geekblue">requirementDiagram</Tag>
              <Tag color="volcano">C4 Diagram</Tag>
            </div>
          }
          type="info"
          showIcon
        />

        <div>
          <Text type="secondary">加载示例：</Text>
          <div style={{ marginTop: 8 }}>
            <Space size={[4, 8]} wrap>
              <Button size="small" onClick={() => handleLoadExample('activity')}>
                活动图
              </Button>
              <Button size="small" onClick={() => handleLoadExample('activitySubgraph')}>
                子图
              </Button>
              <Button size="small" onClick={() => handleLoadExample('sequence')}>
                序列图
              </Button>
              <Button size="small" onClick={() => handleLoadExample('sequenceFragment')}>
                片段
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
              <Button size="small" onClick={() => handleLoadExample('pie')}>
                饼图
              </Button>
              <Button size="small" onClick={() => handleLoadExample('journey')}>
                旅程图
              </Button>
              <Button size="small" onClick={() => handleLoadExample('style')}>
                样式
              </Button>
            </Space>
          </div>
        </div>

        <TextArea
          placeholder="在此粘贴 Mermaid 代码..."
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(null)
          }}
          rows={12}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />

        {diagramType && (
          <Tag color="processing" style={{ alignSelf: 'flex-start' }}>
            检测到: {diagramType}
          </Tag>
        )}

        {renderValidationResult()}

        {error && (
          <Alert message={error} type="error" showIcon />
        )}
      </Space>
    </Modal>
  )
}

export default MermaidImportDialog
