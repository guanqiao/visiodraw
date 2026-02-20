import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Modal, Input, Button, Alert, Space, Typography, Card, Tabs, Tooltip, message, Row, Col, Checkbox } from 'antd'
import { CodeOutlined, PlayCircleOutlined, CopyOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons'
import { ganttDiagramGenerator, type ParsedGanttDiagram, type GanttTask, type GanttSection } from '@utils/ganttDiagramGenerator'
import { ganttDiagramExporter } from '@utils/ganttDiagramExporter'
import { workCalendar } from '@utils/gantt/workCalendar'
import useX6GraphStore from '@stores/x6GraphStore'
import mermaid from 'mermaid'

const { TextArea } = Input
const { Text } = Typography
const { TabPane } = Tabs

interface GanttScriptEditorProps {
  visible: boolean
  onClose: () => void
}

// 示例脚本
const examples = {
  simple: `gantt
  title 项目进度计划
  dateFormat YYYY-MM-DD
  section 项目规划
  需求分析    :done, a1, 2024-01-01, 7d
  设计阶段    :active, a2, after a1, 5d
  section 开发阶段
  编码实现    :a3, after a2, 14d
  测试验证    :a4, after a3, 7d`,

  software: `gantt
  title 软件开发项目计划
  dateFormat YYYY-MM-DD
  
  section 需求分析
  用户调研    :done, req1, 2024-01-01, 5d
  需求文档    :done, req2, after req1, 3d
  
  section 系统设计
  架构设计    :active, arch1, after req2, 7d
  UI设计      :ui1, after req2, 5d
  
  section 开发实现
  前端开发    :fe1, after ui1, 14d
  后端开发    :be1, after arch1, 14d
  
  section 测试部署
  功能测试    :test1, after fe1, 7d
  上线部署    :deploy1, after test1, 2d`,

  milestone: `gantt
  title 项目里程碑计划
  dateFormat YYYY-MM-DD
  
  section 第一阶段
  需求确认    :done, a1, 2024-01-01, 10d
  里程碑1     :milestone, m1, after a1, 0d
  
  section 第二阶段
  开发完成    :a2, after m1, 20d
  里程碑2     :milestone, m2, after a2, 0d
  
  section 第三阶段
  测试通过    :a3, after m2, 10d
  里程碑3     :milestone, m3, after a3, 0d`,

  agile: `gantt
  title 敏捷迭代计划
  dateFormat YYYY-MM-DD
  
  section Sprint 1
  需求评审    :done, sp1-1, 2024-01-01, 1d
  开发实现    :active, sp1-2, after sp1-1, 8d
  Sprint评审  :sp1-3, after sp1-2, 1d
  
  section Sprint 2
  需求评审    :sp2-1, after sp1-3, 1d
  开发实现    :sp2-2, after sp2-1, 8d
  Sprint评审  :sp2-3, after sp2-2, 1d`,

  critical: `gantt
  title 关键路径计划
  dateFormat YYYY-MM-DD
  
  section 关键任务
  核心架构    :crit, done, c1, 2024-01-01, 5d
  数据库设计  :crit, active, c2, after c1, 3d
  
  section 依赖任务
  API开发     :crit, c3, after c2, 7d
  前端集成    :c4, after c3, 5d`,
}

const defaultScript = examples.simple

const GanttScriptEditor: React.FC<GanttScriptEditorProps> = ({ visible, onClose }) => {
  const [script, setScript] = useState(defaultScript)
  const [errors, setErrors] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')
  const [exportedScript, setExportedScript] = useState('')
  const [previewSvg, setPreviewSvg] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [showCriticalPath, setShowCriticalPath] = useState(false)
  const [useWorkCalendar, setUseWorkCalendar] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const { nodes, edges, addNodes, addEdge, newGraph } = useX6GraphStore()

  // 初始化 mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      gantt: {
        titleTopMargin: 25,
        barHeight: 20,
        barGap: 4,
        topPadding: 50,
        leftPadding: 75,
        gridLineStartPadding: 35,
        fontSize: 11,
        numberSectionStyles: 4,
        axisFormat: '%Y-%m-%d',
      },
    })
  }, [])

  // 当有图形时，可以导出
  useEffect(() => {
    if (nodes.length > 0 && activeTab === 'export') {
      const exported = ganttDiagramExporter.export(nodes, edges, {
        includeTitle: true,
        includeDateFormat: true,
      })
      setExportedScript(exported)
    }
  }, [nodes, edges, activeTab])

  const parseGanttScript = (script: string): ParsedGanttDiagram | null => {
    const lines = script.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))
    
    if (lines.length === 0 || !lines[0].toLowerCase().startsWith('gantt')) {
      return null
    }

    let title: string | undefined
    let dateFormat = 'YYYY-MM-DD'
    const sections: GanttSection[] = []
    const tasks: GanttTask[] = []
    let currentSection: string | undefined
    let taskOrder = 0
    let sectionOrder = 0

    // 解析开始日期（用于计算）
    let baseDate = new Date('2024-01-01')
    let currentDate = new Date(baseDate)

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]

      // 标题
      const titleMatch = line.match(/^title\s+(.+)$/i)
      if (titleMatch) {
        title = titleMatch[1]
        continue
      }

      // 日期格式
      const dateFormatMatch = line.match(/^dateFormat\s+(.+)$/i)
      if (dateFormatMatch) {
        dateFormat = dateFormatMatch[1]
        continue
      }

      // 分组
      const sectionMatch = line.match(/^section\s+(.+)$/i)
      if (sectionMatch) {
        currentSection = sectionMatch[1]
        sections.push({
          id: `section-${sectionOrder}`,
          name: currentSection,
          order: sectionOrder++,
        })
        continue
      }

      // 任务
      const taskMatch = line.match(/^([^:]+)\s*:\s*(.+)$/)
      if (taskMatch) {
        const taskName = taskMatch[1].trim()
        const taskDef = taskMatch[2].trim()

        // 解析任务定义
        const parts = taskDef.split(',').map(p => p.trim())
        
        let status: 'done' | 'active' | 'crit' | 'default' = 'default'
        let type: 'task' | 'milestone' = 'task'
        let taskId = `task-${taskOrder}`
        let duration = 1
        let dependencies: string[] = []

        // 解析标签
        const tags: string[] = []
        let idIndex = -1
        
        parts.forEach((part, index) => {
          const lowerPart = part.toLowerCase()
          if (lowerPart === 'done') status = 'done'
          else if (lowerPart === 'active') status = 'active'
          else if (lowerPart === 'crit') status = 'crit'
          else if (lowerPart === 'milestone') type = 'milestone'
          else if (part.match(/^\d+d$/)) {
            duration = parseInt(part)
          }
          else if (part.match(/^after\s+/i)) {
            const depStr = part.replace(/^after\s+/i, '')
            dependencies = depStr.split(/\s*,\s*/).map(d => d.trim())
          }
          else if (part.match(/^\d{4}-\d{2}-\d{2}$/)) {
            currentDate = new Date(part)
          }
          else if (idIndex === -1 && part.match(/^\w+$/)) {
            taskId = part
            idIndex = index
          }
        })

        const startDate = new Date(currentDate)
        const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000)

        tasks.push({
          id: taskId,
          name: taskName,
          type,
          status,
          startDate,
          endDate,
          duration,
          section: currentSection,
          dependencies,
          order: taskOrder++,
        })

        // 更新当前日期
        currentDate = new Date(endDate)
      }
    }

    // 计算日期范围
    const startDate = tasks.length > 0 
      ? new Date(Math.min(...tasks.map(t => t.startDate.getTime())))
      : baseDate
    const endDate = tasks.length > 0
      ? new Date(Math.max(...tasks.map(t => t.endDate.getTime())))
      : new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000)

    return {
      title,
      dateFormat,
      sections,
      tasks,
      startDate,
      endDate,
    }
  }

  const validate = useCallback((script: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    const lines = script.split('\n').map(line => line.trim())

    // 检查是否以 gantt 开头
    if (lines.length === 0 || !lines[0].toLowerCase().startsWith('gantt')) {
      errors.push('脚本应以 "gantt" 开头')
    }

    try {
      const result = parseGanttScript(script)
      if (!result) {
        errors.push('无法解析甘特图脚本')
      } else {
        if (result.tasks.length === 0) {
          errors.push('未找到任何任务')
        }
        if (result.sections.length === 0) {
          errors.push('未找到任何分组')
        }
      }
    } catch (e) {
      errors.push(`解析错误: ${e}`)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }, [])

  const handleValidate = useCallback(() => {
    const result = validate(script)
    setErrors(result.errors)
    if (result.valid) {
      message.success('脚本语法正确')
    }
    return result.valid
  }, [script, validate])

  const handlePreview = useCallback(async () => {
    setIsPreviewLoading(true)
    try {
      // 验证语法
      const result = validate(script)
      if (!result.valid) {
        setErrors(result.errors)
        message.error('脚本语法错误，无法预览')
        setIsPreviewLoading(false)
        return
      }

      // 使用 mermaid 渲染
      const { svg } = await mermaid.render('mermaid-gantt-preview', script)
      setPreviewSvg(svg)
      setActiveTab('preview')
      message.success('预览生成成功')
    } catch (e) {
      setErrors([`预览生成失败: ${e}`])
      message.error('预览生成失败')
    } finally {
      setIsPreviewLoading(false)
    }
  }, [script, validate])

  const handleGenerate = useCallback(() => {
    if (!handleValidate()) {
      return
    }

    setIsGenerating(true)
    try {
      // 解析脚本
      const parsed = parseGanttScript(script)
      if (!parsed) {
        throw new Error('解析失败')
      }

      // 添加专业功能选项
      parsed.showCriticalPath = showCriticalPath
      if (useWorkCalendar) {
        parsed.workCalendar = workCalendar
      }

      // 生成图形
      const { nodes: generatedNodes, edges: generatedEdges } = ganttDiagramGenerator.generate(parsed)

      // 清空画布并添加新图形
      newGraph()

      // 添加节点
      addNodes(generatedNodes)

      // 添加连线
      generatedEdges.forEach(edge => {
        addEdge(edge)
      })

      message.success('甘特图生成成功')
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
          <span>甘特图脚本编辑器</span>
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
                    <Tooltip title="软件开发">
                      <Button size="small" onClick={() => handleExample('software')}>软件开发</Button>
                    </Tooltip>
                    <Tooltip title="里程碑">
                      <Button size="small" onClick={() => handleExample('milestone')}>里程碑</Button>
                    </Tooltip>
                    <Tooltip title="敏捷迭代">
                      <Button size="small" onClick={() => handleExample('agile')}>敏捷</Button>
                    </Tooltip>
                    <Tooltip title="关键路径">
                      <Button size="small" onClick={() => handleExample('critical')}>关键路径</Button>
                    </Tooltip>
                  </Space>
                </Card>

                {/* 专业功能选项 */}
                <Card size="small" title="专业功能">
                  <Space direction="vertical">
                    <Checkbox 
                      checked={showCriticalPath}
                      onChange={(e) => setShowCriticalPath(e.target.checked)}
                    >
                      显示关键路径 (CPM)
                    </Checkbox>
                    <Checkbox 
                      checked={useWorkCalendar}
                      onChange={(e) => setUseWorkCalendar(e.target.checked)}
                    >
                      使用工作日历（排除周末）
                    </Checkbox>
                  </Space>
                </Card>

                {/* 语法说明 */}
                <Card size="small" title="语法说明">
                  <Text type="secondary">
                    <pre style={{ margin: 0, fontSize: 11, lineHeight: 1.5 }}>
                      {`title 标题              - 图表标题
dateFormat YYYY-MM-DD   - 日期格式
section 分组名          - 定义分组
任务名 :标签, ID, 时间   - 定义任务

标签:
  done      - 已完成
  active    - 进行中
  crit      - 关键任务
  milestone - 里程碑

时间格式:
  2024-01-01     - 具体日期
  after ID       - 在指定任务后
  7d             - 持续7天`}
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
                  placeholder="输入 Mermaid 甘特图脚本..."
                />
              </div>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Mermaid预览" key="preview">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Alert
              message="Mermaid 预览"
              description="使用 Mermaid.js 直接渲染的甘特图预览。点击「生成到画布」按钮可将图形导入到编辑器中。"
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
              description="将当前画布中的甘特图反向导出为 Mermaid 脚本。注意：只有使用脚本编辑器生成的甘特图才能正确导出。"
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

export default GanttScriptEditor
