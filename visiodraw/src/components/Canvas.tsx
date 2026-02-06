import React, { useEffect, useRef, useState, useCallback } from 'react'
import { fabric } from 'fabric'
import useCanvasStore from '@stores/canvasStore'
import { v4 as uuidv4 } from 'uuid'
import ContextMenu, { ContextMenuItem } from './ContextMenu'
import {
  ScissorOutlined,
  CopyOutlined,
  SnippetsOutlined,
  DeleteOutlined,
  GroupOutlined,
  UngroupOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons'
import { throttle, performanceMonitor } from '@utils/performanceUtils'

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const {
    setCanvas,
    currentTool,
    gridEnabled,
    snapToGrid,
    zoom,
    setZoom,
    addShape,
    selectShape,
    selectedShapeId,
    shapes,
    deleteShape,
    updateShape,
  } = useCanvasStore()

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
  }>({ visible: false, x: 0, y: 0 })

  // 初始化Fabric.js画布
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    })

    fabricCanvasRef.current = canvas
    setCanvas(canvas)

    // 设置画布背景网格
    if (gridEnabled) {
      canvas.setBackgroundColor('#ffffff', () => {
        // 网格通过CSS实现
      })
    }

    // 监听对象选择事件
    canvas.on('selection:created', (e) => {
      const activeObject = e.selected?.[0]
      if (activeObject && activeObject.id) {
        selectShape(activeObject.id as string)
      }
    })

    canvas.on('selection:updated', (e) => {
      const activeObject = e.selected?.[0]
      if (activeObject && activeObject.id) {
        selectShape(activeObject.id as string)
      }
    })

    canvas.on('selection:cleared', () => {
      selectShape(null)
    })

    // 监听对象修改事件
    canvas.on('object:modified', (e) => {
      const obj = e.target
      if (obj && obj.id) {
        // 更新store中的形状数据
        console.log('对象已修改:', obj.id)
      }
    })

    // 监听鼠标点击事件（用于绘制新图形）
    canvas.on('mouse:down', (e) => {
      // 隐藏右键菜单
      setContextMenu((prev) => ({ ...prev, visible: false }))

      if (currentTool !== 'select' && e.target === null) {
        const pointer = canvas.getPointer(e.e)
        handleDrawShape(pointer.x, pointer.y)
      }
    })

    // 监听右键点击事件
    canvas.on('mouse:down', (e) => {
      if (e.e.button === 2) {
        // 右键
        e.e.preventDefault()
        const pointer = canvas.getPointer(e.e)
        setContextMenu({
          visible: true,
          x: e.e.clientX,
          y: e.e.clientY,
        })
      }
    })

    // 监听滚轮缩放（使用节流优化）
    const throttledZoom = throttle((e: fabric.IEvent<WheelEvent>) => {
      const delta = e.e.deltaY
      let newZoom = canvas.getZoom()
      newZoom *= 0.999 ** delta
      newZoom = Math.max(0.1, Math.min(newZoom, 3))
      canvas.zoomToPoint({ x: e.e.offsetX, y: e.e.offsetY }, newZoom)
      setZoom(newZoom)
    }, 16) // 约60fps

    canvas.on('mouse:wheel', (e) => {
      throttledZoom(e)
      e.e.preventDefault()
      e.e.stopPropagation()
    })

    // 清理函数
    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [])

  // 处理绘制图形
  const handleDrawShape = (x: number, y: number) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    let shape: fabric.Object | null = null
    const commonProps = {
      left: x,
      top: y,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
      selectable: true,
      evented: true,
    }

    switch (currentTool) {
      case 'rectangle':
        shape = new fabric.Rect({
          ...commonProps,
          width: 100,
          height: 60,
        })
        break
      case 'circle':
        shape = new fabric.Circle({
          ...commonProps,
          radius: 40,
        })
        break
      case 'triangle':
        shape = new fabric.Triangle({
          ...commonProps,
          width: 80,
          height: 70,
        })
        break
      case 'line':
        shape = new fabric.Line([x, y, x + 100, y], {
          stroke: '#333333',
          strokeWidth: 2,
          selectable: true,
          evented: true,
        })
        break
      case 'text':
        shape = new fabric.Text('双击编辑文本', {
          ...commonProps,
          fontSize: 16,
          fontFamily: 'Arial',
        })
        break
      default:
        return
    }

    if (shape) {
      const id = uuidv4()
      shape.set('id', id)
      canvas.add(shape)
      canvas.setActiveObject(shape)
      canvas.renderAll()

      // 添加到store
      addShape({
        id,
        type: currentTool,
        x,
        y,
        width: 100,
        height: 60,
        fill: '#ffffff',
        stroke: '#333333',
        strokeWidth: 2,
      })
    }
  }

  // 同步shapes到画布
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    // 清除现有对象
    canvas.clear()

    // 重新添加所有图形
    shapes.forEach((shapeData) => {
      let shape: fabric.Object | null = null
      const commonProps = {
        left: shapeData.x,
        top: shapeData.y,
        fill: shapeData.fill,
        stroke: shapeData.stroke,
        strokeWidth: shapeData.strokeWidth,
        selectable: true,
        evented: true,
      }

      switch (shapeData.type) {
        case 'rectangle':
        case 'process':
          shape = new fabric.Rect({
            ...commonProps,
            width: shapeData.width,
            height: shapeData.height,
          })
          break
        case 'circle':
        case 'start-end':
          shape = new fabric.Circle({
            ...commonProps,
            radius: (shapeData as any).radius || shapeData.width / 2,
          })
          break
        case 'triangle':
        case 'decision':
          shape = new fabric.Triangle({
            ...commonProps,
            width: shapeData.width,
            height: shapeData.height,
          })
          break
        case 'diamond':
          // 菱形使用Path绘制
          const halfW = shapeData.width / 2
          const halfH = shapeData.height / 2
          shape = new fabric.Path(
            `M ${halfW} 0 L ${shapeData.width} ${halfH} L ${halfW} ${shapeData.height} L 0 ${halfH} Z`,
            {
              ...commonProps,
            }
          )
          break
        case 'line':
          shape = new fabric.Line(
            [shapeData.x, shapeData.y, shapeData.x + shapeData.width, shapeData.y],
            {
              stroke: shapeData.stroke,
              strokeWidth: shapeData.strokeWidth,
              selectable: true,
              evented: true,
            }
          )
          break
        case 'text':
          shape = new fabric.Text(shapeData.text || '文本', {
            ...commonProps,
            fontSize: 16,
            fontFamily: 'Arial',
          })
          break
      }

      if (shape) {
        shape.set('id', shapeData.id)
        if (shapeData.angle) shape.set('angle', shapeData.angle)
        if (shapeData.scaleX) shape.set('scaleX', shapeData.scaleX)
        if (shapeData.scaleY) shape.set('scaleY', shapeData.scaleY)
        canvas.add(shape)
      }
    })

    canvas.renderAll()
  }, [shapes])

  // 更新选中状态
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    if (selectedShapeId) {
      const objects = canvas.getObjects()
      const selectedObject = objects.find((obj) => obj.id === selectedShapeId)
      if (selectedObject) {
        canvas.setActiveObject(selectedObject)
        canvas.renderAll()
      }
    } else {
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }, [selectedShapeId])

  // 更新缩放
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    canvas.setZoom(zoom)
    canvas.renderAll()
  }, [zoom])

  // 生成右键菜单项
  const getContextMenuItems = (): ContextMenuItem[] => {
    const hasSelection = !!selectedShapeId

    return [
      {
        key: 'cut',
        label: '剪切',
        icon: <ScissorOutlined />,
        shortcut: 'Ctrl+X',
        disabled: !hasSelection,
        onClick: () => {
          // TODO: 实现剪切功能
          console.log('剪切')
        },
      },
      {
        key: 'copy',
        label: '复制',
        icon: <CopyOutlined />,
        shortcut: 'Ctrl+C',
        disabled: !hasSelection,
        onClick: () => {
          // TODO: 实现复制功能
          console.log('复制')
        },
      },
      {
        key: 'paste',
        label: '粘贴',
        icon: <SnippetsOutlined />,
        shortcut: 'Ctrl+V',
        onClick: () => {
          // TODO: 实现粘贴功能
          console.log('粘贴')
        },
      },
      {
        key: 'divider1',
        label: '',
        divider: true,
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        shortcut: 'Delete',
        danger: true,
        disabled: !hasSelection,
        onClick: () => {
          if (selectedShapeId) {
            deleteShape(selectedShapeId)
          }
        },
      },
      {
        key: 'divider2',
        label: '',
        divider: true,
      },
      {
        key: 'bringToFront',
        label: '置于顶层',
        icon: <VerticalAlignTopOutlined />,
        disabled: !hasSelection,
        onClick: () => {
          const canvas = fabricCanvasRef.current
          if (canvas && selectedShapeId) {
            const obj = canvas.getObjects().find((o) => o.id === selectedShapeId)
            if (obj) {
              canvas.bringToFront(obj)
              canvas.renderAll()
            }
          }
        },
      },
      {
        key: 'sendToBack',
        label: '置于底层',
        icon: <VerticalAlignBottomOutlined />,
        disabled: !hasSelection,
        onClick: () => {
          const canvas = fabricCanvasRef.current
          if (canvas && selectedShapeId) {
            const obj = canvas.getObjects().find((o) => o.id === selectedShapeId)
            if (obj) {
              canvas.sendToBack(obj)
              canvas.renderAll()
            }
          }
        },
      },
    ]
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          backgroundColor: '#fff',
        }}
        className={gridEnabled ? 'canvas-grid' : ''}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* 右键菜单 */}
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        items={getContextMenuItems()}
        onClose={() => setContextMenu((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  )
}

export default Canvas
