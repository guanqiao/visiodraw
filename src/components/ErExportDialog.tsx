import React, { useState, useCallback } from 'react'
import { Modal, Tabs, Button, Space, Select, Input, message, Divider, Typography, Alert } from 'antd'
import { 
  DownloadOutlined, FileImageOutlined, CodeOutlined, 
  FileTextOutlined, Html5Outlined, CopyOutlined 
} from '@ant-design/icons'
import type { ErColumn } from '../types/shapeLibrary'

const { TabPane } = Tabs
const { TextArea } = Input
const { Text } = Typography

interface ErExportDialogProps {
  visible: boolean
  tables: { id: string; name: string; columns: ErColumn[] }[]
  onClose: () => void
}

const ErExportDialog: React.FC<ErExportDialogProps> = ({
  visible,
  tables,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('mermaid')
  const [sqlDialect, setSqlDialect] = useState<string>('mysql')
  const [exportContent, setExportContent] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const generateMermaid = useCallback(() => {
    const lines: string[] = []
    lines.push('```mermaid')
    lines.push('erDiagram')
    
    for (const table of tables) {
      for (const col of table.columns) {
        const keyType = col.constraints.includes('pk') ? 'PK' 
          : col.constraints.includes('fk') ? 'FK' 
          : ''
        const typeDisplay = col.type.toUpperCase()
        lines.push(`    ${table.name} {`)
        lines.push(`        ${typeDisplay} ${col.name}${keyType ? ' ' + keyType : ''}`)
        lines.push(`    }`)
      }
    }
    
    lines.push('```')
    return lines.join('\n')
  }, [tables])

  const generatePlantUML = useCallback(() => {
    const lines: string[] = []
    lines.push('@startuml')
    lines.push('')
    lines.push('skinparam linetype ortho')
    lines.push('')
    
    for (const table of tables) {
      lines.push(`entity "${table.name}" as ${table.name} {`)
      
      for (const col of table.columns) {
        const parts: string[] = []
        if (col.constraints.includes('pk')) parts.push('<u>')
        parts.push(col.name)
        if (col.constraints.includes('pk')) parts.push('</u>')
        parts.push(' : ')
        parts.push(col.type.toUpperCase())
        if (col.constraints.includes('fk')) parts.push(' <<FK>>')
        lines.push(`  ${parts.join('')}`)
      }
      
      lines.push('}')
      lines.push('')
    }
    
    lines.push('@enduml')
    return lines.join('\n')
  }, [tables])

  const generateDbml = useCallback(() => {
    const lines: string[] = []
    
    for (const table of tables) {
      lines.push(`Table ${table.name} {`)
      
      for (const col of table.columns) {
        const parts: string[] = [col.name, col.type]
        if (col.constraints.includes('pk')) parts.push('[pk]')
        if (col.constraints.includes('notnull')) parts.push('[not null]')
        if (col.constraints.includes('unique')) parts.push('[unique]')
        lines.push(`  ${parts.join(' ')}`)
      }
      
      lines.push('}')
      lines.push('')
    }
    
    return lines.join('\n')
  }, [tables])

  const generateMarkdown = useCallback(() => {
    const lines: string[] = []
    lines.push('# ER Diagram')
    lines.push('')
    lines.push(`Generated at: ${new Date().toISOString()}`)
    lines.push('')
    
    for (const table of tables) {
      lines.push(`## ${table.name}`)
      lines.push('')
      lines.push('| Column | Type | Constraints |')
      lines.push('|--------|------|-------------|')
      
      for (const col of table.columns) {
        const constraints = col.constraints.join(', ') || '-'
        lines.push(`| ${col.name} | ${col.type} | ${constraints} |`)
      }
      
      lines.push('')
    }
    
    return lines.join('\n')
  }, [tables])

  const generateHtml = useCallback(() => {
    const lines: string[] = []
    lines.push('<!DOCTYPE html>')
    lines.push('<html lang="en">')
    lines.push('<head>')
    lines.push('  <meta charset="UTF-8">')
    lines.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">')
    lines.push('  <title>ER Diagram</title>')
    lines.push('  <style>')
    lines.push('    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }')
    lines.push('    .table-card { background: white; border-radius: 8px; padding: 16px; margin: 16px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }')
    lines.push('    .table-name { font-size: 18px; font-weight: bold; color: #1890ff; margin-bottom: 12px; }')
    lines.push('    table { width: 100%; border-collapse: collapse; }')
    lines.push('    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }')
    lines.push('    th { background: #fafafa; font-weight: 600; }')
    lines.push('    .pk { color: #1890ff; font-weight: bold; text-decoration: underline; }')
    lines.push('    .fk { color: #722ed1; }')
    lines.push('    .constraint { font-size: 11px; padding: 2px 6px; border-radius: 4px; background: #e6f7ff; margin-left: 4px; }')
    lines.push('  </style>')
    lines.push('</head>')
    lines.push('<body>')
    lines.push('  <h1>ER Diagram</h1>')
    lines.push(`  <p>Generated at: ${new Date().toISOString()}</p>`)
    
    for (const table of tables) {
      lines.push('  <div class="table-card">')
      lines.push(`    <div class="table-name">${table.name}</div>`)
      lines.push('    <table>')
      lines.push('      <thead><tr><th>Column</th><th>Type</th><th>Constraints</th></tr></thead>')
      lines.push('      <tbody>')
      
      for (const col of table.columns) {
        const isPk = col.constraints.includes('pk')
        const isFk = col.constraints.includes('fk')
        const className = isPk ? 'pk' : isFk ? 'fk' : ''
        const constraints = col.constraints.map(c => `<span class="constraint">${c}</span>`).join(' ')
        
        lines.push(`        <tr>`)
        lines.push(`          <td class="${className}">${col.name}</td>`)
        lines.push(`          <td>${col.type}</td>`)
        lines.push(`          <td>${constraints}</td>`)
        lines.push(`        </tr>`)
      }
      
      lines.push('      </tbody>')
      lines.push('    </table>')
      lines.push('  </div>')
    }
    
    lines.push('</body>')
    lines.push('</html>')
    
    return lines.join('\n')
  }, [tables])

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key)
    
    switch (key) {
      case 'mermaid':
        setExportContent(generateMermaid())
        break
      case 'plantuml':
        setExportContent(generatePlantUML())
        break
      case 'dbml':
        setExportContent(generateDbml())
        break
      case 'markdown':
        setExportContent(generateMarkdown())
        break
      case 'html':
        setExportContent(generateHtml())
        break
      default:
        setExportContent('')
    }
  }, [generateMermaid, generatePlantUML, generateDbml, generateMarkdown, generateHtml])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(exportContent)
    message.success('已复制到剪贴板')
  }, [exportContent])

  const handleDownload = useCallback(() => {
    const extensions: Record<string, string> = {
      mermaid: 'mmd',
      plantuml: 'puml',
      dbml: 'dbml',
      markdown: 'md',
      html: 'html',
    }
    
    const extension = extensions[activeTab] || 'txt'
    const blob = new Blob([exportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `er-diagram.${extension}`
    link.click()
    URL.revokeObjectURL(url)
    message.success('文件已下载')
  }, [activeTab, exportContent])

  React.useEffect(() => {
    if (visible) {
      handleTabChange(activeTab)
    }
  }, [visible, activeTab, handleTabChange])

  return (
    <Modal
      open={visible}
      title={
        <Space>
          <DownloadOutlined />
          <span>导出ER图</span>
        </Space>
      }
      onCancel={onClose}
      width={700}
      footer={
        <Space>
          <Button icon={<CopyOutlined />} onClick={handleCopy}>
            复制
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            下载文件
          </Button>
        </Space>
      }
    >
      <Alert
        type="info"
        message={`共 ${tables.length} 个表可导出`}
        style={{ marginBottom: 16 }}
        showIcon
      />

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane 
          tab={<span><CodeOutlined /> Mermaid</span>} 
          key="mermaid"
        />
        <TabPane 
          tab={<span><CodeOutlined /> PlantUML</span>} 
          key="plantuml"
        />
        <TabPane 
          tab={<span><FileTextOutlined /> DBML</span>} 
          key="dbml"
        />
        <TabPane 
          tab={<span><FileTextOutlined /> Markdown</span>} 
          key="markdown"
        />
        <TabPane 
          tab={<span><Html5Outlined /> HTML</span>} 
          key="html"
        />
      </Tabs>

      <TextArea
        value={exportContent}
        rows={15}
        readOnly
        style={{ fontFamily: 'monospace', fontSize: 12 }}
      />
    </Modal>
  )
}

export default ErExportDialog
