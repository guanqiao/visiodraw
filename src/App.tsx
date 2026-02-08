import React, { useEffect } from 'react'
import { Layout, message } from 'antd'
import X6Canvas from '@components/X6Canvas'
import useX6GraphStore from '@stores/x6GraphStore'
import useClipboardStore from '@stores/clipboardStore'
import { v4 as uuidv4 } from 'uuid'

const { Header, Sider, Content } = Layout

const App: React.FC = () => {
  const {
    newGraph,
    nodes,
    selectedNodeIds,
    deleteNode,
    deleteNodes,
    addNodes,
    selectNode,
    zoom,
    setZoom,
    alignNodes,
    distributeNodes,
  } = useX6GraphStore()

  const { copy, cut, paste } = useClipboardStore()

  // Keyboard shortcuts
  useEffect(() => {
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

      // Zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault()
        setZoom(z => Math.min(z + 0.1, 3))
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault()
        setZoom(z => Math.max(z - 0.1, 0.1))
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault()
        setZoom(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeIds, nodes, deleteNodes, copy, cut, paste, addNodes, selectNode, setZoom])

  // Alignment handlers
  const handleAlignLeft = () => {
    alignNodes('left')
    message.success('左对齐完成')
  }

  const handleAlignCenter = () => {
    alignNodes('center')
    message.success('水平居中完成')
  }

  const handleAlignRight = () => {
    alignNodes('right')
    message.success('右对齐完成')
  }

  const handleAlignTop = () => {
    alignNodes('top')
    message.success('顶端对齐完成')
  }

  const handleAlignMiddle = () => {
    alignNodes('middle')
    message.success('垂直居中完成')
  }

  const handleAlignBottom = () => {
    alignNodes('bottom')
    message.success('底端对齐完成')
  }

  const handleDistributeHorizontal = () => {
    distributeNodes('horizontal')
    message.success('水平分布完成')
  }

  const handleDistributeVertical = () => {
    distributeNodes('vertical')
    message.success('垂直分布完成')
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ height: 'auto', padding: 0, background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>VisioDraw X6</h1>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleAlignLeft}>左对齐</button>
            <button onClick={handleAlignCenter}>水平居中</button>
            <button onClick={handleAlignRight}>右对齐</button>
            <button onClick={handleAlignTop}>顶端对齐</button>
            <button onClick={handleAlignMiddle}>垂直居中</button>
            <button onClick={handleAlignBottom}>底端对齐</button>
            <button onClick={handleDistributeHorizontal}>水平分布</button>
            <button onClick={handleDistributeVertical}>垂直分布</button>
          </div>
        </div>
      </Header>
      <Layout>
        <Content style={{ position: 'relative' }}>
          <X6Canvas />
        </Content>
      </Layout>
      <div style={{ padding: '8px 16px', background: '#f5f5f5', borderTop: '1px solid #d9d9d9' }}>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <span style={{ marginLeft: 16 }}>Selected: {selectedNodeIds.length} nodes</span>
      </div>
    </Layout>
  )
}

export default App
