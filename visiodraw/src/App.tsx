import React, { useEffect } from 'react'
import { Layout, message } from 'antd'
import Toolbar from '@components/Toolbar'
import ShapeLibrary from '@components/ShapeLibrary'
import Canvas from '@components/Canvas'
import PropertyPanel from '@components/PropertyPanel'
import StatusBar from '@components/StatusBar'
import useCanvasStore from '@stores/canvasStore'
import {
  useKeyboardShortcuts,
  createDefaultShortcuts,
} from '@hooks/useKeyboardShortcuts'
import './App.css'

const { Header, Sider, Content } = Layout

// Electron API 返回类型
interface ElectronOpenResult {
  canceled: boolean
  filePaths: string[]
}

interface ElectronSaveResult {
  canceled: boolean
  filePath: string
}

const App: React.FC = () => {
  const {
    newCanvas,
    openFile,
    saveFile,
    undo,
    redo,
    deleteShape,
    selectedShapeId,
    zoom,
    setZoom,
    canvas,
  } = useCanvasStore()

  // 注册键盘快捷键
  useKeyboardShortcuts(
    createDefaultShortcuts({
      onNew: () => {
        newCanvas()
        message.success('新建画布')
      },
      onOpen: async () => {
        if (window.electronAPI) {
          const result = await window.electronAPI.openFile() as ElectronOpenResult
          if (!result.canceled && result.filePaths.length > 0) {
            await openFile(result.filePaths[0])
            message.success('文件已打开')
          }
        }
      },
      onSave: async () => {
        if (window.electronAPI) {
          const result = await window.electronAPI.saveFile() as ElectronSaveResult
          if (!result.canceled) {
            await saveFile(result.filePath)
            message.success('文件已保存')
          }
        }
      },
      onCut: () => {
        message.info('剪切功能开发中')
      },
      onCopy: () => {
        message.info('复制功能开发中')
      },
      onPaste: () => {
        message.info('粘贴功能开发中')
      },
      onDelete: () => {
        if (selectedShapeId) {
          deleteShape(selectedShapeId)
          message.success('已删除')
        }
      },
      onUndo: () => {
        undo()
        message.success('已撤销')
      },
      onRedo: () => {
        redo()
        message.success('已重做')
      },
      onSelectAll: () => {
        if (canvas) {
          canvas.discardActiveObject()
          const objects = canvas.getObjects()
          if (objects.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ActiveSelection = (window as unknown as { fabric: { ActiveSelection: new(objects: unknown[], options: { canvas: unknown }) => unknown } }).fabric.ActiveSelection
            const selection = new ActiveSelection(objects, { canvas })
            canvas.setActiveObject(selection as unknown as fabric.Object)
            canvas.renderAll()
          }
        }
      },
      onGroup: () => {
        message.info('组合功能开发中')
      },
      onUngroup: () => {
        message.info('取消组合功能开发中')
      },
      onZoomIn: () => {
        const newZoom = Math.min(zoom + 0.1, 3)
        setZoom(newZoom)
      },
      onZoomOut: () => {
        const newZoom = Math.max(zoom - 0.1, 0.1)
        setZoom(newZoom)
      },
      onZoomFit: () => {
        setZoom(1)
        message.success('适应窗口')
      },
    })
  )

  useEffect(() => {
    // 注册Electron菜单事件监听
    if (window.electronAPI) {
      window.electronAPI.onMenuNewFile(() => {
        newCanvas()
      })

      window.electronAPI.onMenuOpenFile(async () => {
        const result = await window.electronAPI.openFile() as ElectronOpenResult
        if (!result.canceled && result.filePaths.length > 0) {
          await openFile(result.filePaths[0])
        }
      })

      window.electronAPI.onMenuSaveFile(async () => {
        const result = await window.electronAPI.saveFile() as ElectronSaveResult
        if (!result.canceled) {
          await saveFile(result.filePath)
        }
      })

      window.electronAPI.onMenuUndo(() => {
        undo()
      })

      window.electronAPI.onMenuRedo(() => {
        redo()
      })

      window.electronAPI.onMenuDelete(() => {
        if (selectedShapeId) {
          deleteShape(selectedShapeId)
        }
      })
    }

    return () => {
      // 清理监听器
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('menu-new-file')
        window.electronAPI.removeAllListeners('menu-open-file')
        window.electronAPI.removeAllListeners('menu-save-file')
        window.electronAPI.removeAllListeners('menu-undo')
        window.electronAPI.removeAllListeners('menu-redo')
        window.electronAPI.removeAllListeners('menu-delete')
      }
    }
  }, [newCanvas, openFile, saveFile, undo, redo, deleteShape, selectedShapeId])

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Toolbar />
      </Header>
      <Layout className="app-body">
        <Sider width={200} className="app-sider-left">
          <ShapeLibrary />
        </Sider>
        <Content className="app-content">
          <Canvas />
        </Content>
        <Sider width={250} className="app-sider-right">
          <PropertyPanel />
        </Sider>
      </Layout>
      <StatusBar />
    </Layout>
  )
}

export default App
