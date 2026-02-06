import React, { useEffect, useRef, useState, useCallback } from 'react'
import useCanvasStore from '@stores/canvasStore'
import useClipboardStore from '@stores/clipboardStore'
import useLayerStore from '@stores/layerStore'
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
  findNearestConnectionPointEnhanced,
  getNearestEdgePoint,
  isNearShapeEdge,
} from '@utils/connectionPoints'
import { createConnectorObjects, calculateStraightPath, calculateOrthogonalPath, calculateCurvedPath, pointsToPath } from '@utils/connectorRenderer'
import { defaultConnectionPointOptions } from '../types/connection'
import type { ConnectionPoint, ConnectorStyle } from '../types/connection'
import type { DragData, DropPosition } from '../types/dragDrop'
import type { Shape } from '@stores/canvasStore'
import { parseDragData } from '../types/dragDrop'

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const connectionPointsRef = useRef<fabric.Circle[]>([])
  const connectorsRef = useRef<Map<string, { path: fabric.Object; endPoints: fabric.Object[] }>>(new Map())

  // 连接线绘制状态
  const isDrawingLineRef = useRef(false)
  const lineStartRef = useRef<{ x: number; y: number; shapeId?: string; pointId?: string } | null>(null)
  const previewLineRef = useRef<fabric.Path | null>(null)
  const snapIndicatorRef = useRef<fabric.Circle | null>(null)
  const currentLineStyleRef = useRef<ConnectorStyle>('straight')

  // 拖拽绘制状态
  const isDrawingShapeRef = useRef(false)
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null)
  const previewShapeRef = useRef<fabric.Object | null>(null)

  // 框选状态
  const isBoxSelectingRef = useRef(false)
  const boxSelectStartRef = useRef<{ x: number; y: number } | null>(null)
  const selectionRectRef = useRef<fabric.Rect | null>(null)

  // 对齐辅助线状态
  const alignmentLinesRef = useRef<fabric.Line[]>([])
  const SNAP_THRESHOLD = 10 // 吸附阈值（像素）

  const {
    setCanvas,
    currentTool,
    gridEnabled,
    zoom,
    setZoom,
    setTool,
    addShape,
    addShapes,
    selectShape,
    selectShapes,
    selectedShapeId,
    selectedShapeIds,
    shapes,
    deleteShape,
    deleteShapes,
    connectors,
    addConnector,
    selectConnector,
    selectedConnectorId,
    smartToolMode,
    autoSwitchToSelect,
    toggleShapeSelection,
    clearSelection,
  } = useCanvasStore()

  const { copy, cut, paste } = useClipboardStore()

  // 图层状态
  const {
    getVisibleLayerIds,
    getLockedLayerIds,
  } = useLayerStore()

  // 获取可见和锁定的图层ID - 用于后续图层功能扩展
  getVisibleLayerIds()
  getLockedLayerIds()

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
  }>({ visible: false, x: 0, y: 0 })

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
        // 检查是否是连接线
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((activeObject as any).type === 'connector') {
          selectConnector(activeObject.id as string)
          selectShape(null)
        } else {
          selectShape(activeObject.id as string)
          selectConnector(null)
        }
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('selection:updated', (e: any) => {
      const activeObject = e.selected?.[0]
      if (activeObject && activeObject.id) {
        // 检查是否是连接线
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((activeObject as any).type === 'connector') {
          selectConnector(activeObject.id as string)
          selectShape(null)
        } else {
          selectShape(activeObject.id as string)
          selectConnector(null)
        }
      }
    })

    canvas.on('selection:cleared', () => {
      selectShape(null)
      selectConnector(null)
    })

    // 监听对象修改事件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('object:modified', (e: any) => {
      const obj = e.target
      if (obj && obj.id) {
        // 更新store中的形状数据
        console.log('对象已修改:', obj.id)
        // 清除对齐辅助线
        clearAlignmentLines()
      }
    })

    // 监听对象移动事件（显示对齐辅助线）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('object:moving', (e: any) => {
      const obj = e.target
      if (obj && obj.id) {
        const shape = shapes.find((s) => s.id === obj.id)
        if (shape) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const left = (obj as any).left as number
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const top = (obj as any).top as number
          showAlignmentLines(shape, left, top, shape.width, shape.height)
        }
      }
    })

    // 监听鼠标按下事件（开始绘制连接线、框选、多选）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('mouse:down', (e: any) => {
      // 隐藏右键菜单
      setContextMenu((prev) => ({ ...prev, visible: false }))

      // 处理右键
      if (e.e.button === 2) {
        e.e.preventDefault()
        setContextMenu({
          visible: true,
          x: e.e.clientX,
          y: e.e.clientY,
        })
        return
      }

      // 处理左键
      if (e.e.button === 0) {
        const pointer = canvas.getPointer(e.e)
        const target = e.target

        // 连接线工具模式：从图形边缘开始画线
        if (currentTool === 'connector' && target && target.id) {
          const shape = shapes.find((s) => s.id === target.id)
          if (shape) {
            const edgePoint = getNearestEdgePoint(shape, pointer.x, pointer.y)
            isDrawingLineRef.current = true
            lineStartRef.current = { x: edgePoint.x, y: edgePoint.y, shapeId: shape.id }
            currentLineStyleRef.current = 'straight'
            createPreviewLine(edgePoint.x, edgePoint.y, edgePoint.x, edgePoint.y)
            return
          }
        }

        // 检查是否点击在连接点上
        if (target && (target as unknown as { connectionPointId?: string }).connectionPointId) {
          const connectionPointId = (target as unknown as { connectionPointId: string }).connectionPointId
          const shapeId = (target as unknown as { shapeId: string }).shapeId

          // 开始绘制连接线
          isDrawingLineRef.current = true
          const pos = calculateConnectionPointPosition(
            shapes.find((s) => s.id === shapeId)!,
            shapes.find((s) => s.id === shapeId)!.connectionPoints!.find((p) => p.id === connectionPointId)!
          )
          lineStartRef.current = { x: pos.x, y: pos.y, shapeId, pointId: connectionPointId }
          currentLineStyleRef.current = 'straight'

          // 创建预览线
          createPreviewLine(pos.x, pos.y, pos.x, pos.y)
          return
        }

        // 检查是否点击在图形边缘附近
        if (target && target.id) {
          const shape = shapes.find((s) => s.id === target.id)
          if (shape && isNearShapeEdge(shape, pointer.x, pointer.y, 20)) {
            // 从边缘开始绘制
            const edgePoint = getNearestEdgePoint(shape, pointer.x, pointer.y)
            isDrawingLineRef.current = true
            lineStartRef.current = { x: edgePoint.x, y: edgePoint.y, shapeId: shape.id }
            currentLineStyleRef.current = 'straight'
            createPreviewLine(edgePoint.x, edgePoint.y, edgePoint.x, edgePoint.y)
            return
          }
        }

        // 处理绘制新图形（拖拽绘制模式）
        if (currentTool !== 'select' && currentTool !== 'connector' && target === null) {
          isDrawingShapeRef.current = true
          shapeStartRef.current = { x: pointer.x, y: pointer.y }
          createPreviewShape(currentTool, pointer.x, pointer.y, 0, 0)
          return
        }

        // 处理选择工具模式下的点击
        if (currentTool === 'select') {
          // Ctrl+点击：切换选中状态
          if (e.e.ctrlKey || e.e.metaKey) {
            if (target && target.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              toggleShapeSelection((target as any).id)
            }
            return
          }

          // 普通点击：单选
          if (target && target.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            selectShape((target as any).id)
          } else if (!target) {
            // 点击空白处：开始框选
            isBoxSelectingRef.current = true
            boxSelectStartRef.current = { x: pointer.x, y: pointer.y }
            createSelectionRect(pointer.x, pointer.y, 0, 0)
          }
        }
      }
    })

    // 监听鼠标移动事件（更新预览线和预览图形）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const throttledMouseMove = throttle((e: any) => {
      const pointer = canvas.getPointer(e.e)

      // 处理连接线绘制
      if (isDrawingLineRef.current && lineStartRef.current) {
        const start = lineStartRef.current

        // 查找最近的连接点或边缘点
        const nearest = findNearestConnectionPointEnhanced(pointer.x, pointer.y, shapes, 25)

        let endX = pointer.x
        let endY = pointer.y

        // 如果找到可吸附的点，显示吸附指示器
        if (nearest && nearest.distance < 20) {
          const pos = calculateConnectionPointPosition(nearest.shape, nearest.connectionPoint)
          endX = pos.x
          endY = pos.y
          showSnapIndicator(pos.x, pos.y)
        } else {
          hideSnapIndicator()
        }

        // 更新预览线
        updatePreviewLine(start.x, start.y, endX, endY)
      }

      // 处理图形拖拽绘制
      if (isDrawingShapeRef.current && shapeStartRef.current) {
        const start = shapeStartRef.current
        const width = Math.abs(pointer.x - start.x)
        const height = Math.abs(pointer.y - start.y)
        const left = Math.min(start.x, pointer.x)
        const top = Math.min(start.y, pointer.y)
        updatePreviewShape(left, top, width, height)
      }

      // 处理框选
      if (isBoxSelectingRef.current && boxSelectStartRef.current) {
        const start = boxSelectStartRef.current
        const width = Math.abs(pointer.x - start.x)
        const height = Math.abs(pointer.y - start.y)
        const left = Math.min(start.x, pointer.x)
        const top = Math.min(start.y, pointer.y)
        updateSelectionRect(left, top, width, height)
      }
    }, 16)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('mouse:move', (e: any) => {
      throttledMouseMove(e)

      // 处理鼠标悬停高亮
      if (!isDrawingLineRef.current && !isDrawingShapeRef.current && !isBoxSelectingRef.current) {
        handleMouseHover(e)
      }
    })

    // 监听鼠标释放事件（完成绘制连接线和图形）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on('mouse:up', (e: any) => {
      const pointer = canvas.getPointer(e.e)

      // 处理连接线绘制完成
      if (isDrawingLineRef.current && lineStartRef.current) {
        const start = lineStartRef.current

        // 查找目标连接点
        const nearest = findNearestConnectionPointEnhanced(pointer.x, pointer.y, shapes, 25)

        if (nearest && nearest.shape.id !== start.shapeId) {
          // 创建连接线
          const newConnector = {
            id: `connector-${Date.now()}`,
            sourceShapeId: start.shapeId!,
            sourcePointId: start.pointId || `edge-${nearest.connectionPoint.position}`,
            targetShapeId: nearest.shape.id,
            targetPointId: nearest.connectionPoint.id,
            style: currentLineStyleRef.current,
            startStyle: 'none' as const,
            endStyle: 'arrow' as const,
            stroke: '#333333',
            strokeWidth: 2,
          }
          addConnector(newConnector)
        }

        // 清理连接线绘制状态
        isDrawingLineRef.current = false
        lineStartRef.current = null
        removePreviewLine()
        hideSnapIndicator()
        canvas.renderAll()
      }

      // 处理图形拖拽绘制完成
      if (isDrawingShapeRef.current && shapeStartRef.current) {
        const start = shapeStartRef.current
        const width = Math.abs(pointer.x - start.x)
        const height = Math.abs(pointer.y - start.y)

        // 如果拖拽距离太小，使用默认尺寸
        const finalWidth = width < 10 ? 100 : width
        const finalHeight = height < 10 ? 60 : height
        const left = Math.min(start.x, pointer.x)
        const top = Math.min(start.y, pointer.y)

        // 创建最终图形
        finalizeDrawShape(currentTool, left, top, finalWidth, finalHeight)

        // 清理图形绘制状态
        isDrawingShapeRef.current = false
        shapeStartRef.current = null
        removePreviewShape()
        canvas.renderAll()

        // 智能工具模式：单次绘制后自动切换回选择工具
        if (smartToolMode === 'single' && autoSwitchToSelect) {
          setTool('select')
        }
      }

      // 处理框选完成
      if (isBoxSelectingRef.current && boxSelectStartRef.current) {
        const start = boxSelectStartRef.current
        const left = Math.min(start.x, pointer.x)
        const top = Math.min(start.y, pointer.y)
        const right = Math.max(start.x, pointer.x)
        const bottom = Math.max(start.y, pointer.y)

        // 查找框选区域内的图形
        const selectedIds = shapes
          .filter((shape) => {
            const shapeRight = shape.x + shape.width
            const shapeBottom = shape.y + shape.height
            return (
              shape.x >= left &&
              shape.y >= top &&
              shapeRight <= right &&
              shapeBottom <= bottom
            )
          })
          .map((s) => s.id)

        if (selectedIds.length > 0) {
          selectShapes(selectedIds)
        } else {
          clearSelection()
        }

        // 清理框选状态
        isBoxSelectingRef.current = false
        boxSelectStartRef.current = null
        removeSelectionRect()
        canvas.renderAll()
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
    }, 16)

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
  }, [shapes, currentTool])

  // 处理鼠标悬停高亮
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMouseHover = (e: any) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const pointer = canvas.getPointer(e.e)
    const target = e.target

    // 连接线工具模式：高亮图形边缘
    if (currentTool === 'connector' && target && target.id) {
      const shape = shapes.find((s) => s.id === target.id)
      if (shape && isNearShapeEdge(shape, pointer.x, pointer.y, 25)) {
        const edgePoint = getNearestEdgePoint(shape, pointer.x, pointer.y)
        showSnapIndicator(edgePoint.x, edgePoint.y, 8, 'rgba(24, 144, 255, 0.5)')
        canvas.defaultCursor = 'crosshair'
        return
      }
    }

    // 普通模式：高亮连接点
    const nearest = findNearestConnectionPointEnhanced(pointer.x, pointer.y, shapes, 20)

    if (nearest) {
      const pos = calculateConnectionPointPosition(nearest.shape, nearest.connectionPoint)
      showSnapIndicator(pos.x, pos.y, 8, 'rgba(24, 144, 255, 0.3)')
      canvas.defaultCursor = 'crosshair'
    } else {
      hideSnapIndicator()
      canvas.defaultCursor = currentTool === 'connector' ? 'crosshair' : 'default'
    }
  }

  // 创建预览线
  const createPreviewLine = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    removePreviewLine()

    const pathString = `M ${x1} ${y1} L ${x2} ${y2}`
    const path = new fabric.Path(pathString, {
      stroke: '#1890ff',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      fill: '',
      selectable: false,
      evented: false,
      opacity: 0.8,
    })

    previewLineRef.current = path
    canvas.add(path)
    canvas.renderAll()
  }

  // 更新预览线
  const updatePreviewLine = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !previewLineRef.current) return

    let pathString: string

    switch (currentLineStyleRef.current) {
      case 'orthogonal': {
        const points = calculateOrthogonalPath({ x: x1, y: y1 }, { x: x2, y: y2 })
        pathString = pointsToPath(points, 'orthogonal')
        break
      }
      case 'curved': {
        const points = calculateCurvedPath({ x: x1, y: y1 }, { x: x2, y: y2 })
        pathString = pointsToPath(points, 'curved')
        break
      }
      case 'straight':
      default: {
        const points = calculateStraightPath({ x: x1, y: y1 }, { x: x2, y: y2 })
        pathString = pointsToPath(points, 'straight')
        break
      }
    }

    previewLineRef.current.set({ path: pathString })
    canvas.renderAll()
  }

  // 移除预览线
  const removePreviewLine = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !previewLineRef.current) return

    canvas.remove(previewLineRef.current)
    previewLineRef.current = null
  }

  // 显示吸附指示器
  const showSnapIndicator = (x: number, y: number, radius: number = 10, color: string = 'rgba(82, 196, 26, 0.4)') => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    if (snapIndicatorRef.current) {
      snapIndicatorRef.current.set({ left: x - radius, top: y - radius, radius, fill: color })
    } else {
      const indicator = new fabric.Circle({
        left: x - radius,
        top: y - radius,
        radius,
        fill: color,
        selectable: false,
        evented: false,
      })
      snapIndicatorRef.current = indicator
      canvas.add(indicator)
    }
    canvas.renderAll()
  }

  // 隐藏吸附指示器
  const hideSnapIndicator = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !snapIndicatorRef.current) return

    canvas.remove(snapIndicatorRef.current)
    snapIndicatorRef.current = null
    canvas.renderAll()
  }

  // 创建框选矩形
  const createSelectionRect = (x: number, y: number, width: number, height: number) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    removeSelectionRect()

    const rect = new fabric.Rect({
      left: x,
      top: y,
      width: width || 1,
      height: height || 1,
      fill: 'rgba(24, 144, 255, 0.1)',
      stroke: '#1890ff',
      strokeWidth: 1,
      strokeDashArray: [3, 3],
      selectable: false,
      evented: false,
    })

    selectionRectRef.current = rect
    canvas.add(rect)
    canvas.renderAll()
  }

  // 更新框选矩形
  const updateSelectionRect = (left: number, top: number, width: number, height: number) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !selectionRectRef.current) return

    selectionRectRef.current.set({
      left,
      top,
      width: Math.max(width, 1),
      height: Math.max(height, 1),
    })
    canvas.renderAll()
  }

  // 移除框选矩形
  const removeSelectionRect = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !selectionRectRef.current) return

    canvas.remove(selectionRectRef.current)
    selectionRectRef.current = null
  }

  // 对齐辅助线功能
  const clearAlignmentLines = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    alignmentLinesRef.current.forEach((line) => {
      canvas.remove(line)
    })
    alignmentLinesRef.current = []
  }

  const showAlignmentLines = (
    targetShape: Shape,
    newX: number,
    newY: number,
    newWidth: number,
    newHeight: number
  ) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    clearAlignmentLines()

    const targetCenterX = newX + newWidth / 2
    const targetCenterY = newY + newHeight / 2
    const targetRight = newX + newWidth
    const targetBottom = newY + newHeight

    const lines: fabric.Line[] = []
    const canvasWidth = canvas.width || 800
    const canvasHeight = canvas.height || 600

    // 检查与其他图形的对齐
    shapes.forEach((shape) => {
      if (shape.id === targetShape.id) return

      const shapeCenterX = shape.x + shape.width / 2
      const shapeCenterY = shape.y + shape.height / 2
      const shapeRight = shape.x + shape.width
      const shapeBottom = shape.y + shape.height

      // 左对齐
      if (Math.abs(newX - shape.x) < SNAP_THRESHOLD) {
        lines.push(
          new fabric.Line([shape.x, 0, shape.x, canvasHeight], {
            stroke: '#1890ff',
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
          })
        )
      }

      // 水平居中对齐
      if (Math.abs(targetCenterX - shapeCenterX) < SNAP_THRESHOLD) {
        lines.push(
          new fabric.Line([shapeCenterX, 0, shapeCenterX, canvasHeight], {
            stroke: '#1890ff',
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
          })
        )
      }

      // 右对齐
      if (Math.abs(targetRight - shapeRight) < SNAP_THRESHOLD) {
        lines.push(
          new fabric.Line([shapeRight, 0, shapeRight, canvasHeight], {
            stroke: '#1890ff',
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
          })
        )
      }

      // 顶对齐
      if (Math.abs(newY - shape.y) < SNAP_THRESHOLD) {
        lines.push(
          new fabric.Line([0, shape.y, canvasWidth, shape.y], {
            stroke: '#1890ff',
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
          })
        )
      }

      // 垂直居中对齐
      if (Math.abs(targetCenterY - shapeCenterY) < SNAP_THRESHOLD) {
        lines.push(
          new fabric.Line([0, shapeCenterY, canvasWidth, shapeCenterY], {
            stroke: '#1890ff',
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
          })
        )
      }

      // 底对齐
      if (Math.abs(targetBottom - shapeBottom) < SNAP_THRESHOLD) {
        lines.push(
          new fabric.Line([0, shapeBottom, canvasWidth, shapeBottom], {
            stroke: '#1890ff',
            strokeWidth: 1,
            strokeDashArray: [3, 3],
            selectable: false,
            evented: false,
          })
        )
      }
    })

    // 添加到画布
    lines.forEach((line) => {
      canvas.add(line)
      alignmentLinesRef.current.push(line)
    })

    canvas.renderAll()
  }

  // 创建预览图形
  const createPreviewShape = (tool: string, x: number, y: number, width: number, height: number) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    removePreviewShape()

    let shape: fabric.Object | null = null
    const commonProps = {
      left: x,
      top: y,
      fill: 'rgba(24, 144, 255, 0.1)',
      stroke: '#1890ff',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
    }

    switch (tool) {
      case 'rectangle':
        shape = new fabric.Rect({
          ...commonProps,
          width: width || 1,
          height: height || 1,
        })
        break
      case 'circle':
        shape = new fabric.Ellipse({
          ...commonProps,
          rx: (width || 2) / 2,
          ry: (height || 2) / 2,
        })
        break
      case 'triangle':
        shape = new fabric.Triangle({
          ...commonProps,
          width: width || 1,
          height: height || 1,
        })
        break
      default:
        return
    }

    if (shape) {
      previewShapeRef.current = shape
      canvas.add(shape)
      canvas.renderAll()
    }
  }

  // 更新预览图形
  const updatePreviewShape = (left: number, top: number, width: number, height: number) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !previewShapeRef.current) return

    switch (currentTool) {
      case 'rectangle':
      case 'triangle':
        previewShapeRef.current.set({ left, top, width: Math.max(width, 1), height: Math.max(height, 1) })
        break
      case 'circle':
        previewShapeRef.current.set({
          left: left + width / 2,
          top: top + height / 2,
          rx: Math.max(width, 2) / 2,
          ry: Math.max(height, 2) / 2,
        })
        break
    }
    canvas.renderAll()
  }

  // 移除预览图形
  const removePreviewShape = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !previewShapeRef.current) return

    canvas.remove(previewShapeRef.current)
    previewShapeRef.current = null
  }

  // 完成绘制图形
  const finalizeDrawShape = (tool: string, x: number, y: number, width: number, height: number) => {
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

    switch (tool) {
      case 'rectangle':
        shape = new fabric.Rect({
          ...commonProps,
          width,
          height,
        })
        break
      case 'circle':
        shape = new fabric.Ellipse({
          ...commonProps,
          rx: width / 2,
          ry: height / 2,
        })
        break
      case 'triangle':
        shape = new fabric.Triangle({
          ...commonProps,
          width,
          height,
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
      const connectionPoints = generateDefaultConnectionPoints(tool)

      // 添加到store
      addShape({
        id,
        type: tool,
        x,
        y,
        width,
        height,
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
      case 'arrow':
      case 'double-arrow':
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
      // 添加选中状态
      const connectorWithSelection = {
        ...connector,
        isSelected: connector.id === selectedConnectorId,
      }
      const { path, endPoints } = createConnectorObjects(connectorWithSelection, shapes)
      if (path) {
        canvas.add(path)
        endPoints.forEach((ep) => canvas.add(ep))
        connectorsRef.current.set(connector.id, { path, endPoints })
      }
    })
  }, [connectors, shapes, selectedConnectorId])

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

        // 添加悬停效果
        const originalStroke = shapeData.stroke
        const originalStrokeWidth = shapeData.strokeWidth

        shape.on('mouseover', function(this: fabric.Object) {
          this.set({
            stroke: '#40a9ff',
            strokeWidth: (originalStrokeWidth || 2) + 1,
          })
          canvas.renderAll()
        })

        shape.on('mouseout', function(this: fabric.Object) {
          // 检查是否被选中
          const isSelected = selectedShapeIds.includes(shapeData.id)
          this.set({
            stroke: isSelected ? '#1890ff' : originalStroke,
            strokeWidth: isSelected ? (originalStrokeWidth || 2) + 1 : originalStrokeWidth,
          })
          canvas.renderAll()
        })

        canvas.add(shape)
      }
    })

    // 渲染连接线
    renderConnectors()

    canvas.renderAll()
  }, [shapes, renderConnectors, selectedShapeIds])

  // 更新选中状态（支持多选）
  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    if (selectedShapeIds.length > 0) {
      const objects = canvas.getObjects()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectedObjects = objects.filter((obj: any) => selectedShapeIds.includes(obj.id))

      if (selectedObjects.length === 1) {
        canvas.setActiveObject(selectedObjects[0])
      } else if (selectedObjects.length > 1) {
        // 多选：创建 ActiveSelection
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ActiveSelection = (window as any).fabric.ActiveSelection
        if (ActiveSelection) {
          const selection = new ActiveSelection(selectedObjects, { canvas })
          canvas.setActiveObject(selection)
        }
      }
      canvas.renderAll()
    } else {
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }, [selectedShapeId, selectedShapeIds])

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

        // 鼠标悬停效果 - 放大
        circle.on('mouseover', () => {
          circle.set({
            fill: defaultConnectionPointOptions.hoverFill,
            radius: defaultConnectionPointOptions.radius + 2,
            left: pos.x - defaultConnectionPointOptions.radius - 2,
            top: pos.y - defaultConnectionPointOptions.radius - 2,
          })
          canvas.renderAll()
        })

        circle.on('mouseout', () => {
          circle.set({
            fill: isConnected
              ? defaultConnectionPointOptions.connectedFill
              : defaultConnectionPointOptions.fill,
            radius: defaultConnectionPointOptions.radius,
            left: pos.x - defaultConnectionPointOptions.radius,
            top: pos.y - defaultConnectionPointOptions.radius,
          })
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
        renderConnectionPoints(shapeId)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseOut = (e: any) => {
      const target = e.target
      if (target && target.id && target.id !== selectedShapeId) {
        // 延迟清除，避免闪烁
        setTimeout(() => {
          renderConnectionPoints(null)
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

    const handleCut = () => {
      if (selectedShapeId) {
        const shape = shapes.find((s) => s.id === selectedShapeId)
        if (shape) {
          cut([shape], (ids) => {
            deleteShapes(ids)
          })
        }
      }
    }

    const handleCopy = () => {
      if (selectedShapeId) {
        const shape = shapes.find((s) => s.id === selectedShapeId)
        if (shape) {
          copy([shape])
        }
      }
    }

    const handlePaste = () => {
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
      }
    }

    return [
      {
        key: 'cut',
        label: '剪切',
        icon: <ScissorOutlined />,
        shortcut: 'Ctrl+X',
        disabled: !hasSelection,
        onClick: handleCut,
      },
      {
        key: 'copy',
        label: '复制',
        icon: <CopyOutlined />,
        shortcut: 'Ctrl+C',
        disabled: !hasSelection,
        onClick: handleCopy,
      },
      {
        key: 'paste',
        label: '粘贴',
        icon: <SnippetsOutlined />,
        shortcut: 'Ctrl+V',
        onClick: handlePaste,
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
