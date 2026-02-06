import React, { useEffect } from 'react'
import { Layout, message } from 'antd'
import Toolbar from '@components/Toolbar/index'
import ShapeLibrary from '@components/ShapeLibrary'
import Canvas from '@components/Canvas'
import PropertyPanel from '@components/PropertyPanel'
import StatusBar from '@components/StatusBar'
import LayerPanel from '@components/LayerPanel'
import ThemeSelector from '@components/ThemeSelector'
import RulerPanel from '@components/RulerPanel'
import useThemeStore, { initTheme } from '@stores/themeStore'
import useCanvasStore from '@stores/canvasStore'
import useClipboardStore from '@stores/clipboardStore'
import {
  useKeyboardShortcuts,
  createDefaultShortcuts,
} from '@hooks/useKeyboardShortcuts'
import { v4 as uuidv4 } from 'uuid'
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
    deleteShapes,
    addShapes,
    shapes,
    selectedShapeId,
    selectShape,
    zoom,
    setZoom,
    canvas,
    updateShape,
  } = useCanvasStore()

  const { copy, cut, paste } = useClipboardStore()

  // 初始化主题（只需要执行一次）
  useEffect(() => {
    initTheme()
  }, [])

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
        if (selectedShapeId) {
          const shape = shapes.find((s) => s.id === selectedShapeId)
          if (shape) {
            cut([shape], (ids) => {
              deleteShapes(ids)
            })
            message.success('已剪切')
          }
        }
      },
      onCopy: () => {
        if (selectedShapeId) {
          const shape = shapes.find((s) => s.id === selectedShapeId)
          if (shape) {
            copy([shape])
            message.success('已复制')
          }
        }
      },
      onPaste: () => {
        const result = paste()
        if (result && result.shapes.length > 0) {
          // 为新图形生成新的ID
          const newShapes = result.shapes.map((shape) => ({
            ...shape,
            id: uuidv4(),
          }))
          addShapes(newShapes)
          // 选中新粘贴的最后一个图形
          selectShape(newShapes[newShapes.length - 1].id)
          message.success('已粘贴')
        } else {
          message.info('剪贴板为空')
        }
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

  // 对齐功能处理函数
  const handleAlignLeft = () => {
    if (!selectedShapeId || !canvas) return
    const selectedShape = shapes.find((s) => s.id === selectedShapeId)
    if (!selectedShape) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 1) {
      // 多选对齐
      const minX = Math.min(...activeObjects.map((obj) => (obj as fabric.Object).left || 0))
      activeObjects.forEach((obj) => {
        const fabricObj = obj as fabric.Object
        const shapeId = (fabricObj as unknown as { id?: string }).id
        if (shapeId) {
          updateShape(shapeId, { x: minX })
        }
      })
      message.success('左对齐完成')
    }
  }

  const handleAlignCenter = () => {
    if (!selectedShapeId || !canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 1) {
      const centers = activeObjects.map((obj) => {
        const fabricObj = obj as fabric.Object
        return (fabricObj.left || 0) + (fabricObj.width || 0) / 2
      })
      const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length
      activeObjects.forEach((obj) => {
        const fabricObj = obj as fabric.Object
        const shapeId = (fabricObj as unknown as { id?: string }).id
        if (shapeId) {
          updateShape(shapeId, { x: avgCenter - (fabricObj.width || 0) / 2 })
        }
      })
      message.success('水平居中完成')
    }
  }

  const handleAlignRight = () => {
    if (!selectedShapeId || !canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 1) {
      const maxRight = Math.max(
        ...activeObjects.map((obj) => {
          const fabricObj = obj as fabric.Object
          return (fabricObj.left || 0) + (fabricObj.width || 0)
        })
      )
      activeObjects.forEach((obj) => {
        const fabricObj = obj as fabric.Object
        const shapeId = (fabricObj as unknown as { id?: string }).id
        if (shapeId) {
          updateShape(shapeId, { x: maxRight - (fabricObj.width || 0) })
        }
      })
      message.success('右对齐完成')
    }
  }

  const handleAlignTop = () => {
    if (!selectedShapeId || !canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 1) {
      const minY = Math.min(...activeObjects.map((obj) => (obj as fabric.Object).top || 0))
      activeObjects.forEach((obj) => {
        const fabricObj = obj as fabric.Object
        const shapeId = (fabricObj as unknown as { id?: string }).id
        if (shapeId) {
          updateShape(shapeId, { y: minY })
        }
      })
      message.success('顶端对齐完成')
    }
  }

  const handleAlignMiddle = () => {
    if (!selectedShapeId || !canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 1) {
      const centers = activeObjects.map((obj) => {
        const fabricObj = obj as fabric.Object
        return (fabricObj.top || 0) + (fabricObj.height || 0) / 2
      })
      const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length
      activeObjects.forEach((obj) => {
        const fabricObj = obj as fabric.Object
        const shapeId = (fabricObj as unknown as { id?: string }).id
        if (shapeId) {
          updateShape(shapeId, { y: avgCenter - (fabricObj.height || 0) / 2 })
        }
      })
      message.success('垂直居中完成')
    }
  }

  const handleAlignBottom = () => {
    if (!selectedShapeId || !canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 1) {
      const maxBottom = Math.max(
        ...activeObjects.map((obj) => {
          const fabricObj = obj as fabric.Object
          return (fabricObj.top || 0) + (fabricObj.height || 0)
        })
      )
      activeObjects.forEach((obj) => {
        const fabricObj = obj as fabric.Object
        const shapeId = (fabricObj as unknown as { id?: string }).id
        if (shapeId) {
          updateShape(shapeId, { y: maxBottom - (fabricObj.height || 0) })
        }
      })
      message.success('底端对齐完成')
    }
  }

  const handleDistributeHorizontal = () => {
    if (!selectedShapeId || !canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length < 3) {
      message.info('至少需要选择3个图形才能进行分布')
      return
    }

    const sorted = [...activeObjects].sort(
      (a, b) => ((a as fabric.Object).left || 0) - ((b as fabric.Object).left || 0)
    )
    const first = sorted[0] as fabric.Object
    const last = sorted[sorted.length - 1] as fabric.Object
    const totalWidth = (last.left || 0) - (first.left || 0)
    const spacing = totalWidth / (sorted.length - 1)

    sorted.forEach((obj, index) => {
      const fabricObj = obj as fabric.Object
      const shapeId = (fabricObj as unknown as { id?: string }).id
      if (shapeId && index > 0 && index < sorted.length - 1) {
        updateShape(shapeId, { x: (first.left || 0) + spacing * index })
      }
    })
    message.success('水平分布完成')
  }

  const handleDistributeVertical = () => {
    if (!selectedShapeId || !canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length < 3) {
      message.info('至少需要选择3个图形才能进行分布')
      return
    }

    const sorted = [...activeObjects].sort(
      (a, b) => ((a as fabric.Object).top || 0) - ((b as fabric.Object).top || 0)
    )
    const first = sorted[0] as fabric.Object
    const last = sorted[sorted.length - 1] as fabric.Object
    const totalHeight = (last.top || 0) - (first.top || 0)
    const spacing = totalHeight / (sorted.length - 1)

    sorted.forEach((obj, index) => {
      const fabricObj = obj as fabric.Object
      const shapeId = (fabricObj as unknown as { id?: string }).id
      if (shapeId && index > 0 && index < sorted.length - 1) {
        updateShape(shapeId, { y: (first.top || 0) + spacing * index })
      }
    })
    message.success('垂直分布完成')
  }

  return (
    <Layout className="app-layout">
      <Header className="app-header" style={{ height: 'auto', padding: 0, background: '#fff' }}>
        <Toolbar
          onAlignLeft={handleAlignLeft}
          onAlignCenter={handleAlignCenter}
          onAlignRight={handleAlignRight}
          onAlignTop={handleAlignTop}
          onAlignMiddle={handleAlignMiddle}
          onAlignBottom={handleAlignBottom}
          onDistributeHorizontal={handleDistributeHorizontal}
          onDistributeVertical={handleDistributeVertical}
        />
      </Header>
      <Layout className="app-body">
        <Sider width={200} className="app-sider-left">
          <ShapeLibrary />
        </Sider>
        <Content className="app-content">
          <Canvas />
        </Content>
        <Sider width={280} className="app-sider-right">
          <div className="right-panel-container">
            <PropertyPanel />
            <LayerPanel />
            <ThemeSelector />
            <RulerPanel />
          </div>
        </Sider>
      </Layout>
      <StatusBar />
    </Layout>
  )
}

export default App
