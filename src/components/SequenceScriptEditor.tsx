import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Modal, Input, Button, Alert, Space, Typography, Card, Tabs, Tooltip, message, Row, Col } from 'antd'
import { CodeOutlined, PlayCircleOutlined, CopyOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons'
import { mermaidSequenceParser } from '@utils/mermaidSequenceParser'
import { sequenceDiagramGenerator } from '@utils/sequenceDiagramGenerator'
import { sequenceDiagramExporter } from '@utils/sequenceDiagramExporter'
import useX6GraphStore from '@stores/x6GraphStore'
import mermaid from 'mermaid'

const { TextArea } = Input
const { Text } = Typography
const { TabPane } = Tabs

interface SequenceScriptEditorProps {
  visible: boolean
  onClose: () => void
}

// 示例脚本
const examples = {
  simple: `sequenceDiagram
  participant A as 客户端
  participant B as 服务端
  
  A->>B: 请求数据
  B-->>A: 返回响应`,

  complex: `sequenceDiagram
  participant U as 用户
  participant A as API网关
  participant S as 订单服务
  participant D as 数据库
  
  U->>A: 创建订单
  A->>S: 转发请求
  S->>D: 保存订单
  D-->>S: 订单ID
  S-->>A: 订单创建成功
  A-->>U: 返回订单信息`,

  loop: `sequenceDiagram
  participant C as 客户端
  participant S as 服务端
  
  loop 重试3次
    C->>S: 发送请求
    alt 请求成功
      S-->>C: 返回数据
    else 请求失败
      S-->>C: 错误信息
    end
  end`,

  activation: `sequenceDiagram
  participant U as 用户
  participant S as 系统
  participant D as 数据库
  
  U->>S: 登录请求
  activate S
  S->>D: 查询用户
  activate D
  D-->>S: 用户信息
  deactivate D
  S->>S: 验证密码
  S-->>U: 登录成功
  deactivate S`,

  notes: `sequenceDiagram
  participant A as 客户端
  participant B as 服务端
  
  Note left of A: 准备请求
  A->>B: 发送数据
  Note over A,B: 数据传输中
  B-->>A: 响应结果
  Note right of B: 处理完成`,

  full: `sequenceDiagram
  autonumber

  actor U as 用户
  participant A as Web应用
  participant B as 业务服务
  participant D as 数据库

  U->>A: 输入用户名密码
  activate A

  A->>B: 验证登录信息
  activate B

  B->>D: 查询用户信息
  activate D
  D-->>B: 返回用户数据
  deactivate D

  alt 验证成功
    B->>B: 生成Token
    B-->>A: 登录成功
    A-->>U: 跳转首页
  else 验证失败
    B-->>A: 错误信息
    A-->>U: 显示错误
  end

  deactivate B
  deactivate A

  opt 记住密码
    A->>A: 保存登录状态
  end`,

  break: `sequenceDiagram
  participant C as 客户端
  participant S as 服务器
  
  C->>S: 发送请求
  break 如果超时
    S-->>C: 返回超时错误
  end
  S-->>C: 正常响应`,

  par: `sequenceDiagram
  participant A as 主线程
  participant B as 线程1
  participant C as 线程2
  
  par 并行任务1
    A->>B: 任务1
    B-->>A: 结果1
  and 并行任务2
    A->>C: 任务2
    C-->>A: 结果2
  end`,
}

const defaultScript = examples.full

const SequenceScriptEditor: React.FC<SequenceScriptEditorProps> = ({ visible, onClose }) => {
  const [script, setScript] = useState(defaultScript)
  const [errors, setErrors] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')
  const [exportedScript, setExportedScript] = useState('')
  const [previewSvg, setPreviewSvg] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const { nodes, edges, addNodes, addEdge, newGraph } = useX6GraphStore()

  // 初始化 mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: true,
      },
    })
  }, [])

  // 当有图形时，可以导出
  useEffect(() => {
    if (nodes.length > 0 && activeTab === 'export') {
      const exported = sequenceDiagramExporter.export(nodes, edges, {
        includeAutoNumber: true,
        includeComments: true,
      })
      setExportedScript(exported)
    }
  }, [nodes, edges, activeTab])

  const handleValidate = useCallback(() => {
    const result = mermaidSequenceParser.validate(script)
    setErrors(result.errors)
    if (result.valid) {
      message.success('脚本语法正确')
    }
    return result.valid
  }, [script])

  const handlePreview = useCallback(async () => {
    setIsPreviewLoading(true)
    try {
      // 验证语法
      const result = mermaidSequenceParser.validate(script)
      if (!result.valid) {
        setErrors(result.errors)
        message.error('脚本语法错误，无法预览')
        setIsPreviewLoading(false)
        return
      }

      // 使用 mermaid 渲染
      const { svg } = await mermaid.render('mermaid-preview', script)
      setPreviewSvg(svg)
      setActiveTab('preview')
      message.success('预览生成成功')
    } catch (e) {
      setErrors([`预览生成失败: ${e}`])
      message.error('预览生成失败')
    } finally {
      setIsPreviewLoading(false)
    }
  }, [script])

  const handleGenerate = useCallback(() => {
    if (!handleValidate()) {
      return
    }

    setIsGenerating(true)
    try {
      // 解析脚本
      const parsed = mermaidSequenceParser.parse(script)

      // 生成图形
      const { nodes: generatedNodes, edges: generatedEdges } = sequenceDiagramGenerator.generate(parsed)

      // 清空画布并添加新图形
      newGraph()

      // 添加节点
      addNodes(generatedNodes)

      // 添加连线
      generatedEdges.forEach(edge => {
        addEdge(edge)
      })

      message.success('时序图生成成功')
      onClose()
    } catch (e) {
      setErrors([`生成失败: ${e}`])
      message.error('生成失败')
    } finally {
      setIsGenerating(false)
    }
  }, [script, handleValidate, newGraph, addNodes, addEdge, onClose])

  const handleExample = useCallback((type: keyof typeof examples) => {
    setScript(examples[type])
    setErrors([])
    setPreviewSvg('')
  }, [])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(script)
    message.success('已复制到剪贴板')
  }, [script])

  const handleExportCopy = useCallback(() => {
    navigator.clipboard.writeText(exportedScript)
    message.success('已复制到剪贴板')
  }, [exportedScript])

  return (
    <Modal
      title={
        <Space>
          <CodeOutlined />
          <span>时序图脚本编辑器</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="validate" onClick={handleValidate}>
          验证
        </Button>,
        <Button
          key="preview"
          icon={<EyeOutlined />}
          loading={isPreviewLoading}
          onClick={handlePreview}
        >
          Mermaid预览
        </Button>,
        <Button
          key="generate"
          type="primary"
          icon={<PlayCircleOutlined />}
          loading={isGenerating}
          onClick={handleGenerate}
        >
          生成到画布
        </Button>,
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="编辑脚本" key="edit">
          <Row gutter={16}>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {/* 示例按钮 */}
                <Card size="small" title="快速示例">
                  <Space wrap>
                    <Tooltip title="简单示例">
                      <Button size="small" onClick={() => handleExample('simple')}>简单</Button>
                    </Tooltip>
                    <Tooltip title="复杂示例">
                      <Button size="small" onClick={() => handleExample('complex')}>复杂</Button>
                    </Tooltip>
                    <Tooltip title="循环示例">
                      <Button size="small" onClick={() => handleExample('loop')}>循环</Button>
                    </Tooltip>
                    <Tooltip title="激活示例">
                      <Button size="small" onClick={() => handleExample('activation')}>激活</Button>
                    </Tooltip>
                    <Tooltip title="注释示例">
                      <Button size="small" onClick={() => handleExample('notes')}>注释</Button>
                    </Tooltip>
                    <Tooltip title="break示例">
                      <Button size="small" onClick={() => handleExample('break')}>break</Button>
                    </Tooltip>
                    <Tooltip title="并行示例">
                      <Button size="small" onClick={() => handleExample('par')}>par</Button>
                    </Tooltip>
                    <Tooltip title="完整示例">
                      <Button size="small" type="primary" onClick={() => handleExample('full')}>完整</Button>
                    </Tooltip>
                  </Space>
                </Card>

                {/* 语法说明 */}
                <Card size="small" title="语法说明">
                  <Text type="secondary">
                    <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.5 }}>
                      {`participant A as 名称    - 定义参与者
actor A as 名称           - 定义角色
database A as 名称        - 定义数据库
A->>B: 消息              - 同步消息 (实线实心箭头)
A-->>B: 消息             - 返回消息 (虚线实心箭头)
A->B: 消息               - 异步消息 (实线开放箭头)
activate A / deactivate A - 激活/停用
Note left/right/over A:  - 注释
alt/opt/loop/par/break    - 片段类型
else / and               - 分支/并行
end                      - 结束片段`}
                    </pre>
                  </Text>
                </Card>

                {/* 错误提示 */}
                {errors.length > 0 && (
                  <Alert
                    type="error"
                    message="语法错误"
                    description={
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    }
                    closable
                    onClose={() => setErrors([])}
                  />
                )}
              </Space>
            </Col>
            <Col span={12}>
              {/* 脚本编辑器 */}
              <div>
                <Space style={{ marginBottom: 8 }}>
                  <Text strong>脚本内容:</Text>
                  <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>
                    复制
                  </Button>
                </Space>
                <TextArea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={20}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 13,
                  }}
                  placeholder="输入 Mermaid 时序图脚本..."
                />
              </div>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Mermaid预览" key="preview">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              message="Mermaid 预览"
              description="使用 Mermaid.js 直接渲染的时序图预览。点击「生成到画布」按钮可将图形导入到编辑器中。"
              type="info"
              showIcon
            />
            {previewSvg ? (
              <div
                ref={previewRef}
                style={{
                  width: '100%',
                  minHeight: 400,
                  backgroundColor: '#fafafa',
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  padding: 16,
                  overflow: 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: previewSvg }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: 400,
                  backgroundColor: '#fafafa',
                  border: '1px dashed #d9d9d9',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text type="secondary">点击「Mermaid预览」按钮生成预览</Text>
              </div>
            )}
          </Space>
        </TabPane>

        <TabPane tab="导出脚本" key="export">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              message="导出说明"
              description="将当前画布中的时序图反向导出为 Mermaid 脚本。注意：只有使用脚本编辑器生成的时序图才能正确导出。"
              type="info"
              showIcon
            />

            {nodes.length === 0 ? (
              <Alert message="画布为空，没有可导出的内容" type="warning" />
            ) : (
              <>
                <Space>
                  <Button icon={<ExportOutlined />} onClick={handleExportCopy}>
                    复制脚本
                  </Button>
                </Space>
                <TextArea
                  value={exportedScript}
                  readOnly
                  rows={20}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 13,
                    backgroundColor: '#f5f5f5',
                  }}
                />
              </>
            )}
          </Space>
        </TabPane>
      </Tabs>
    </Modal>
  )
}

export default SequenceScriptEditor
