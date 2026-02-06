import React, { useEffect, useRef, useState, useCallback } from 'react'
import useCanvasStore from '@stores/canvasStore'
import { v4 as uuidv4 } from 'uuid'
import ContextMenu, { ContextMenuItem } from './ContextMenu'
import {
  ScissorOutlined,
  CopyOutlined,
  SnippetsOutlined,
  DeleteOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons'
import { throttle } from '@utils/performanceUtils'
import {
  generateDefaultConnectionPoints,
  calculateConnectionPointPosition,
} from '@utils/connectionPoints'
import { createConnectorObjects } from '@utils/connectorRenderer'
import { defaultConnectionPointOptions } from '../types/connection'
import type { ConnectionPoint } from '../types/connection'
import type { DragData, DropPosition } from '../types/dragDrop'
import { parseDragData } from '../types/dragDrop'

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const connectionPointsRef = useRef<fabric.Circle[]>([])
  const connectorsRef = useRef<Map<string, { path: fabric.Object; endPoints: fabric.Object[] }>>(new Map())
  const {
    setCanvas,
    currentTool,
    gridEnabled,
    zoom,
    setZoom,
    addShape,
    selectShape,
    selectedShapeId,
    shapes,
    deleteShape,
    connectors,
  } = useCanvasStore()

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
  }>({ visible: false, x: 0, y: 0 })

  // 悬停的图形ID
  const [, setHoveredShapeId] = useState<string | null>(null)

  // 拖拽状态
  const [isDragOver, setIsDragOver] = useState(false)

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('selection:created', (e: any) => {
      const activeObject = e.selected?.[0]
      if (activeObject && activeObject.id) {
        selectShape(activeObject.id as string)
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('selection:updated', (e: any) => {
      const activeObject = e.selected?.[0]
      if (activeObject && activeObject.id) {
        selectShape(activeObject.id as string)
      }
    })

    canvas.on('selection:cleared', () => {
      selectShape(null)
    })

    // 监听对象修改事件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('object:modified', (e: any) => {
      const obj = e.target
      if (obj && obj.id) {
        // 更新store中的形状数据
        console.log('对象已修改:', obj.id)
      }
    })

    // 监听鼠标点击事件（用于绘制新图形）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('mouse:down', (e: any) => {
      // 隐藏右键菜单
      setContextMenu((prev) => ({ ...prev, visible: false }))

      if (currentTool !== 'select' && e.target === null) {
        const mousePointer = canvas.getPointer(e.e)
        handleDrawShape(mousePointer.x, mousePointer.y)
      }
    })

    // 监听右键点击事件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('mouse:down', (e: any) => {
      if (e.e.button === 2) {
        // 右键
        e.e.preventDefault()
        setContextMenu({
          visible: true,
          x: e.e.clientX,
          y: e.e.clientY,
        })
      }
    })

    // 监听滚轮缩放（使用节流优化）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const throttledZoom = throttle((e: any) => {
      const delta = e.e.deltaY
      let newZoom = canvas.getZoom()
      newZoom *= 0.999 ** delta
      newZoom = Math.max(0.1, Math.min(newZoom, 3))
      canvas.zoomToPoint({ x: e.e.offsetX, y: e.e.offsetY }, newZoom)
      setZoom(newZoom)
    }, 16) // 约60fps

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('mouse:wheel', (e: any) => {
      throttledZoom(e)
      e.e.preventDefault()
      e.e.stopPropagation()
    })

    // 清理函数
    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      ;(shape as unknown as { id: string }).id = id
      canvas.add(shape)
      canvas.setActiveObject(shape)
      canvas.renderAll()

      // 生成连接点
      const connectionPoints = generateDefaultConnectionPoints(currentTool)

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
        connectionPoints,
      })
    }
  }

  // 处理从模具拖拽添加图形
  const handleDropShape = useCallback((position: DropPosition, dragData: DragData) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const id = uuidv4()
    const defaultProps = dragData.defaultProps || {}

    // 计算放置位置（考虑画布缩放）
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (!canvasRect) return

    const zoom = canvas.getZoom()
    const x = (position.x - canvasRect.left) / zoom
    const y = (position.y - canvasRect.top) / zoom

    // 根据拖拽数据创建图形
    const shapeType = dragData.shapeType || 'rectangle'
    const width = dragData.width || 100
    const height = dragData.height || 60
    const fill = (defaultProps.fill as string) || '#e6f7ff'
    const stroke = (defaultProps.stroke as string) || '#1890ff'
    const strokeWidth = (defaultProps.strokeWidth as number) || 2

    // 创建 Fabric.js 图形
    let shape: fabric.Object | null = null
    const commonProps = {
      left: x - width / 2,
      top: y - height / 2,
      fill,
      stroke,
      strokeWidth,
      selectable: true,
      evented: true,
    }

    switch (shapeType) {
      case 'rectangle':
      case 'process':
        shape = new fabric.Rect({
          ...commonProps,
          width,
          height,
        })
        break
      case 'rounded-rectangle':
        shape = new fabric.Rect({
          ...commonProps,
          width,
          height,
          rx: (defaultProps.rx as number) || 10,
          ry: (defaultProps.ry as number) || 10,
        })
        break
      case 'circle':
      case 'start-end':
        shape = new fabric.Circle({
          ...commonProps,
          radius: (defaultProps.radius as number) || width / 2,
        })
        break
      case 'ellipse':
        shape = new fabric.Ellipse({
          ...commonProps,
          rx: (defaultProps.rx as number) || width / 2,
          ry: (defaultProps.ry as number) || height / 2,
        })
        break
      case 'triangle':
      case 'decision':
        shape = new fabric.Triangle({
          ...commonProps,
          width,
          height,
        })
        break
      case 'diamond': {
        // 菱形使用Path绘制
        const halfW = width / 2
        const halfH = height / 2
        shape = new fabric.Path(
          `M ${halfW} 0 L ${width} ${halfH} L ${halfW} ${height} L 0 ${halfH} Z`,
          {
            ...commonProps,
          }
        )
        break
      }
      case 'line':
        shape = new fabric.Line([x, y, x + width, y], {
          stroke,
          strokeWidth,
          selectable: true,
          evented: true,
        })
        break
      default:
        // 默认矩形
        shape = new fabric.Rect({
          ...commonProps,
          width,
          height,
        })
    }

    if (shape) {
      (shape as unknown as { id: string }).id = id
      canvas.add(shape)
      canvas.setActiveObject(shape)
      canvas.renderAll()

      // 生成连接点
      const connectionPoints = generateDefaultConnectionPoints(shapeType)

      // 添加到store
      addShape({
        id,
        type: shapeType,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        fill,
        stroke,
        strokeWidth,
        text: dragData.name,
        connectionPoints,
      })
    }
  }, [addShape])

  // 拖拽事件处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const dragData = parseDragData(e.dataTransfer)
    if (!dragData) return

    const canvasRect = containerRef.current?.getBoundingClientRect()
    if (!canvasRect) return

    const position: DropPosition = {
      x: e.clientX,
      y: e.clientY,
      canvasX: e.clientX - canvasRect.left,
      canvasY: e.clientY - canvasRect.top,
    }

    handleDropShape(position, dragData)
  }, [handleDropShape])

  // 渲染连接线
  const renderConnectors = useCallback(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    // 清除现有连接线
    connectorsRef.current.forEach((connector) => {
      canvas.remove(connector.path)
      connector.endPoints.forEach((ep) => canvas.remove(ep))
    })
    connectorsRef.current.clear()

    // 渲染新连接线
    connectors.forEach((connector) => {
      const { path, endPoints } = createConnectorObjects(connector, shapes)
      if (path) {
        canvas.add(path)
        endPoints.forEach((ep) => canvas.add(ep))
        connectorsRef.current.set(connector.id, { path, endPoints })
      }
    })
  }, [connectors, shapes])

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
            radius: (shapeData as unknown as { radius?: number }).radius || shapeData.width / 2,
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
        case 'diamond': {
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
        }
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
        (shape as unknown as { id: string }).id = shapeData.id
        if (shapeData.angle) shape.set('angle', shapeData.angle)
        if (shapeData.scaleX) shape.set('scaleX', shapeData.scaleX)
        if (shapeData.scaleY) shape.set('scaleY', shapeData.scaleY)
        canvas.add(shape)
      }
    })

    // 渲染连接线
    renderConnectors()

    canvas.renderAll()
  }, [shapes, renderConnectors])

  // 更新选中状态
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    if (selectedShapeId) {
      const objects = canvas.getObjects()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedObject = objects.find((obj: any) => obj.id === selectedShapeId)
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

  // 渲染连接点
  const renderConnectionPoints = useCallback(
    (shapeId: string | null) => {
      const canvas = fabricCanvasRef.current
      if (!canvas) return

      // 清除之前的连接点
      connectionPointsRef.current.forEach((point) => {
        canvas.remove(point)
      })
      connectionPointsRef.current = []

      if (!shapeId) {
        canvas.renderAll()
        return
      }

      const shape = shapes.find((s) => s.id === shapeId)
      if (!shape || !shape.connectionPoints) {
        canvas.renderAll()
        return
      }

      // 渲染每个连接点
      shape.connectionPoints.forEach((point: ConnectionPoint) => {
        const pos = calculateConnectionPointPosition(shape, point)
        const isConnected = point.isConnected

        const circle = new fabric.Circle({
          left: pos.x - defaultConnectionPointOptions.radius,
          top: pos.y - defaultConnectionPointOptions.radius,
          radius: defaultConnectionPointOptions.radius,
          fill: isConnected
            ? defaultConnectionPointOptions.connectedFill
            : defaultConnectionPointOptions.fill,
          stroke: defaultConnectionPointOptions.stroke,
          strokeWidth: defaultConnectionPointOptions.strokeWidth,
          selectable: false,
          evented: true,
          hoverCursor: 'crosshair',
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(circle as any).connectionPointId = point.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(circle as any).shapeId = shape.id

        // 鼠标悬停效果
        circle.on('mouseover', () => {
          circle.set('fill', defaultConnectionPointOptions.hoverFill)
          canvas.renderAll()
        })

        circle.on('mouseout', () => {
          circle.set(
            'fill',
            isConnected
              ? defaultConnectionPointOptions.connectedFill
              : defaultConnectionPointOptions.fill
          )
          canvas.renderAll()
        })

        canvas.add(circle)
        connectionPointsRef.current.push(circle)
      })

      canvas.renderAll()
    },
    [shapes]
  )

  // 监听鼠标悬停事件显示连接点
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseOver = (e: any) => {
      const target = e.target
      if (target && target.id && target.id !== selectedShapeId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shapeId = (target as any).id as string
        setHoveredShapeId(shapeId)
        renderConnectionPoints(shapeId)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseOut = (e: any) => {
      const target = e.target
      if (target && target.id && target.id !== selectedShapeId) {
        // 延迟清除，避免闪烁
        setTimeout(() => {
          setHoveredShapeId((prev) => {
            if (prev === target.id) {
              renderConnectionPoints(null)
              return null
            }
            return prev
          })
        }, 100)
      }
    }

    canvas.on('mouse:over', handleMouseOver)
    canvas.on('mouse:out', handleMouseOut)

    return () => {
      canvas.off('mouse:over', handleMouseOver)
      canvas.off('mouse:out', handleMouseOut)
    }
  }, [selectedShapeId, renderConnectionPoints])

  // 选中图形时显示连接点
  useEffect(() => {
    renderConnectionPoints(selectedShapeId)
  }, [selectedShapeId, renderConnectionPoints])

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const obj = canvas.getObjects().find((o: any) => o.id === selectedShapeId)
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const obj = canvas.getObjects().find((o: any) => o.id === selectedShapeId)
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
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDragOver ? '#e6f7ff' : '#f0f2f5',
        transition: 'background-color 0.2s ease',
        border: isDragOver ? '2px dashed #1890ff' : '2px solid transparent',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          backgroundColor: '#fff',
          position: 'relative',
        }}
        className={gridEnabled ? 'canvas-grid' : ''}
      >
        <canvas ref={canvasRef} />
        
        {/* 拖拽提示 */}
        {isDragOver && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(24, 144, 255, 0.9)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '14px',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            释放鼠标添加图形
          </div>
        )}
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
