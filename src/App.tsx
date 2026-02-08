import React, { useState } from 'react'
import { Layout, message, Tabs } from 'antd'
import X6Canvas from '@components/X6Canvas'
import Toolbar from '@components/Toolbar'
import StatusBar from '@components/StatusBar'
import PropertyPanel from '@components/PropertyPanel'
import ShapeLibrary from '@components/ShapeLibrary'
import LayerPanel from '@components/LayerPanel'
import TemplateGallery from '@components/TemplateGallery'
import useX6GraphStore from '@stores/x6GraphStore'
import useClipboardStore from '@stores/clipboardStore'
import { v4 as uuidv4 } from 'uuid'

const { Content, Sider } = Layout
const { TabPane } = Tabs

const App: React.FC = () => {
  const [showTemplates, setShowTemplates] = useState(false)
  const [showStencils, setShowStencils] = useState(false)

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

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.length > 0) {
          deleteNodes(selectedNodeIds)
          message.success('已删除')
        }
      }

      // Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedNodeIds.length > 0) {
          const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id))
          copy(selectedNodes as any[])
          message.success('已复制')
        }
      }

      // Cut
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        if (selectedNodeIds.length > 0) {
          const selectedNodes = nodes.filter(n => selectedNodeIds.includes(n.id))
          cut(selectedNodes, (ids) => deleteNodes(ids))
          message.success('已剪切')
        }
      }

      // Paste
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

      // New file
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewFile()
      }

      // Open file
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault()
        handleOpenFile()
      }

      // Save file
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
      />
      
      <Layout style={{ flex: 1, overflow: 'hidden' }}>
        <Sider width={280} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', overflow: 'auto' }}>
          <ShapeLibrary />
        </Sider>
        
        <Content style={{ position: 'relative', overflow: 'hidden' }}>
          <X6Canvas />
        </Content>
        
        <Sider width={300} style={{ background: '#fff', borderLeft: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <Tabs defaultActiveKey="properties" size="small" style={{ height: '100%' }}>
            <TabPane tab="属性" key="properties" style={{ height: 'calc(100% - 40px)', overflow: 'auto', padding: '16px' }}>
              <PropertyPanel />
            </TabPane>
            <TabPane tab="图层" key="layers" style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
              <LayerPanel />
            </TabPane>
          </Tabs>
        </Sider>
      </Layout>
      
      <StatusBar />
      
      <TemplateGallery visible={showTemplates} onClose={() => setShowTemplates(false)} />
    </Layout>
  )
}

export default App
