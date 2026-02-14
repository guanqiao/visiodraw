import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Layout, message, Tabs } from 'antd'
import X6Canvas from '@components/X6Canvas'
import Toolbar from '@components/Toolbar'
import StatusBar from '@components/StatusBar'
import PropertyPanel from '@components/PropertyPanel'
import ShapeLibrary from '@components/ShapeLibrary'
import LayerPanel from '@components/LayerPanel'
import TemplateGallery from '@components/TemplateGallery'
import CanvasHistoryPanel from '@components/CanvasHistoryPanel'
import SequenceScriptEditor from '@components/SequenceScriptEditor'
import SqlExportDialog from '@components/SqlExportDialog'
import useX6GraphStore from '@stores/x6GraphStore'
import useClipboardStore from '@stores/clipboardStore'
import { useTheme } from '@hooks/useTheme'
import { v4 as uuidv4 } from 'uuid'
import './styles/theme.css'

const { TabPane } = Tabs

interface ResizableSiderProps {
  children: React.ReactNode
  width: number
  minWidth: number
  maxWidth: number
  side: 'left' | 'right'
  onWidthChange: (width: number) => void
  style?: React.CSSProperties
}

const ResizableSider: React.FC<ResizableSiderProps> = ({
  children,
  width,
  minWidth,
  maxWidth,
  side,
  onWidthChange,
  style,
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(width)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    startXRef.current = e.clientX
    startWidthRef.current = width
  }, [width])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return

      const delta = side === 'left'
        ? e.clientX - startXRef.current
        : startXRef.current - e.clientX

      let newWidth = startWidthRef.current + delta
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      onWidthChange(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, minWidth, maxWidth, onWidthChange, side])

  return (
    <div style={{ position: 'relative', display: 'flex', height: '100%', ...style }}>
      <div style={{ width, overflow: 'auto', flexShrink: 0 }}>
        {children}
      </div>
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          [side]: -4,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: 'col-resize',
          zIndex: 10,
          background: isResizing ? 'var(--accent-color)' : 'transparent',
          transition: 'background 0.2s',
        }}
        className="resize-handle"
      />
    </div>
  )
}

const App: React.FC = () => {
  const [showTemplates, setShowTemplates] = useState(false)
  const [, setShowStencils] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showScriptEditor, setShowScriptEditor] = useState(false)
  const [showSqlExport, setShowSqlExport] = useState(false)

  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('left-panel-width')
    return saved ? parseInt(saved, 10) : 280
  })
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem('right-panel-width')
    return saved ? parseInt(saved, 10) : 300
  })

  useEffect(() => {
    localStorage.setItem('left-panel-width', leftWidth.toString())
  }, [leftWidth])

  useEffect(() => {
    localStorage.setItem('right-panel-width', rightWidth.toString())
  }, [rightWidth])

  useTheme()

  const {
    newGraph,
    nodes,
    selectedNodeIds,
    deleteNodes,
    addNodes,
    selectNode,
    importFromJson,
    exportToJson,
  } = useX6GraphStore()

  const { copy, cut, paste } = useClipboardStore()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.length > 0) {
          deleteNodes(selectedNodeIds)
          message.success('已删除')
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedNodeIds.length > 0) {
          const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id))
          copy(selectedNodes as any[])
          message.success('已复制')
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        if (selectedNodeIds.length > 0) {
          const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id))
          cut(selectedNodes, (ids) => deleteNodes(ids))
          message.success('已剪切')
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const result = paste()
        if (result && result.shapes.length > 0) {
          const newNodes = result.shapes.map((shape) => ({
            ...shape,
            id: uuidv4(),
            x: shape.x + 20,
            y: shape.y + 20,
          }))
          addNodes(newNodes)
          selectNode(newNodes[newNodes.length - 1].id)
          message.success('已粘贴')
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewFile()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        handleOpenFile()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSaveFile()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeIds, nodes, deleteNodes, copy, cut, paste, addNodes, selectNode])

  const handleNewFile = () => {
    if (nodes.length > 0) {
      const confirmed = window.confirm('当前画布有未保存的内容，确定要新建吗？')
      if (!confirmed) return
    }
    newGraph()
    message.success('新建画布')
  }

  const handleOpenFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const json = event.target?.result as string
            importFromJson(json)
            message.success('文件已打开')
          } catch (error) {
            message.error('打开文件失败')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleSaveFile = () => {
    const json = exportToJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `visiodraw-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    message.success('文件已保存')
  }

  return (
    <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        onNewFile={handleNewFile}
        onOpenFile={handleOpenFile}
        onSaveFile={handleSaveFile}
        onShowTemplates={() => setShowTemplates(true)}
        onShowStencils={() => setShowStencils(true)}
        onShowHistory={() => setShowHistory(true)}
        onShowScriptEditor={() => setShowScriptEditor(true)}
        onShowSqlExport={() => setShowSqlExport(true)}
      />
      
      <Layout style={{ flex: 1, overflow: 'hidden' }}>
        <ResizableSider
          side="left"
          width={leftWidth}
          minWidth={200}
          maxWidth={500}
          onWidthChange={setLeftWidth}
          style={{
            background: 'var(--bg-primary)',
            borderRight: '1px solid var(--border-color)',
          }}
        >
          <ShapeLibrary />
        </ResizableSider>

        <div style={{ position: 'relative', overflow: 'hidden', flex: 1, height: '100%' }}>
          <X6Canvas />
        </div>

        <ResizableSider
          side="right"
          width={rightWidth}
          minWidth={200}
          maxWidth={500}
          onWidthChange={setRightWidth}
          style={{
            background: 'var(--bg-primary)',
            borderLeft: '1px solid var(--border-color)',
          }}
        >
          <Tabs defaultActiveKey="properties" size="small" style={{ height: '100%' }}>
            <TabPane
              tab="属性"
              key="properties"
              style={{
                height: 'calc(100% - 40px)',
                overflow: 'auto',
                padding: '16px',
                background: 'var(--bg-primary)',
              }}
            >
              <PropertyPanel />
            </TabPane>
            <TabPane
              tab="图层"
              key="layers"
              style={{
                height: 'calc(100% - 40px)',
                overflow: 'auto',
                background: 'var(--bg-primary)',
              }}
            >
              <LayerPanel />
            </TabPane>
          </Tabs>
        </ResizableSider>
      </Layout>
      
      <StatusBar />
      
      <TemplateGallery visible={showTemplates} onClose={() => setShowTemplates(false)} />
      <CanvasHistoryPanel visible={showHistory} onClose={() => setShowHistory(false)} />
      <SequenceScriptEditor visible={showScriptEditor} onClose={() => setShowScriptEditor(false)} />
      <SqlExportDialog
        visible={showSqlExport}
        tables={nodes
          .filter((n) => n.type === 'er-table-entity-with-columns' || n.type === 'er-table-entity')
          .map((n) => ({
            id: n.id,
            name: n.text?.split('\n')[0] || 'untitled',
            columns: parseColumnsFromText(n.text || ''),
          }))}
        onCancel={() => setShowSqlExport(false)}
      />
    </Layout>
  )
}

function parseColumnsFromText(text: string) {
  const lines = text.split('\n').filter((l) => l.trim())
  if (lines.length <= 1) return []
  
  return lines.slice(1).map((line) => {
    const parts = line.trim().split(/\s+/)
    const name = parts[0] || ''
    const type = parts[1] || 'varchar'
    const constraints: string[] = []
    
    if (line.includes('[pk]')) constraints.push('pk')
    if (line.includes('[fk]')) constraints.push('fk')
    if (line.includes('[unique]')) constraints.push('unique')
    if (line.includes('[notnull]')) constraints.push('notnull')
    if (line.includes('[auto]')) constraints.push('auto')
    
    return { name, type, constraints }
  })
}

export default App
