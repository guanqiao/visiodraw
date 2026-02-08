/**
 * 连接线绘制 Hook
 * @version 1.0.0
 * @date 2026-02-08
 */

import { useRef, useCallback } from 'react'
import type { ConnectorStyle } from '../types/connection'
import type { Shape } from '../stores/canvasStore'
import {
  calculateStraightPath,
  calculateOrthogonalPath,
  calculateCurvedPath,
  calculateQuadraticPath,
  calculateFreehandPath,
  pointsToPath,
} from '../utils/connectorRenderer'
import {
  findNearestConnectionPointEnhanced,
  calculateConnectionPointPosition,
  getNearestEdgePoint,
  isNearShapeEdge,
} from '../utils/connectionPoints'

export interface UseConnectorDrawingOptions {
  canvas: fabric.Canvas | null
  shapes: Shape[]
  defaultConnectorStyle: ConnectorStyle
  onAddConnector: (connector: {
    id: string
    sourceShapeId: string
    sourcePointId: string
    targetShapeId: string
    targetPointId: string
    style: ConnectorStyle
    startStyle: 'none' | 'arrow' | 'dot' | 'diamond'
    endStyle: 'none' | 'arrow' | 'dot' | 'diamond'
    stroke: string
    strokeWidth: number
  }) => void
}

export interface UseConnectorDrawingReturn {
  isDrawingLine: boolean
  startDrawing: (x: number, y: number, shapeId?: string, pointId?: string, style?: ConnectorStyle) => void
  updateDrawing: (x: number, y: number) => void
  endDrawing: (x: number, y: number) => void
  cancelDrawing: () => void
  handleMouseHover: (pointer: { x: number; y: number }, target: fabric.Object | null, currentTool: string) => void
}

export function useConnectorDrawing(options: UseConnectorDrawingOptions): UseConnectorDrawingReturn {
  const { canvas, shapes, defaultConnectorStyle, onAddConnector } = options

  const isDrawingLineRef = useRef(false)
  const lineStartRef = useRef<{ x: number; y: number; shapeId?: string; pointId?: string } | null>(null)
  const previewLineRef = useRef<fabric.Path | null>(null)
  const snapIndicatorRef = useRef<fabric.Circle | null>(null)
  const currentLineStyleRef = useRef<ConnectorStyle>(defaultConnectorStyle)

  // 移除预览线
  const removePreviewLine = useCallback(() => {
    if (!canvas || !previewLineRef.current) return
    canvas.remove(previewLineRef.current)
    previewLineRef.current = null
  }, [canvas])

  // 创建预览线
  const createPreviewLine = useCallback((x1: number, y1: number, x2: number, y2: number) => {
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
    path.bringToFront()
    canvas.renderAll()
  }, [canvas, removePreviewLine])

  // 更新预览线
  const updatePreviewLine = useCallback((x1: number, y1: number, x2: number, y2: number) => {
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
      case 'quadratic': {
        const points = calculateQuadraticPath({ x: x1, y: y1 }, { x: x2, y: y2 })
        pathString = pointsToPath(points, 'quadratic')
        break
      }
      case 'freehand': {
        const points = calculateFreehandPath({ x: x1, y: y1 }, { x: x2, y: y2 })
        pathString = pointsToPath(points, 'freehand')
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
  }, [canvas])

  // 显示吸附指示器
  const showSnapIndicator = useCallback((x: number, y: number, radius: number = 10, color: string = 'rgba(82, 196, 26, 0.4)') => {
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
      indicator.bringToFront()
    }
    canvas.renderAll()
  }, [canvas])

  // 隐藏吸附指示器
  const hideSnapIndicator = useCallback(() => {
    if (!canvas || !snapIndicatorRef.current) return
    canvas.remove(snapIndicatorRef.current)
    snapIndicatorRef.current = null
    canvas.renderAll()
  }, [canvas])

  // 开始绘制连接线
  const startDrawing = useCallback((x: number, y: number, shapeId?: string, pointId?: string, style?: ConnectorStyle) => {
    isDrawingLineRef.current = true
    lineStartRef.current = { x, y, shapeId, pointId }
    currentLineStyleRef.current = style || defaultConnectorStyle
    createPreviewLine(x, y, x, y)
  }, [createPreviewLine, defaultConnectorStyle])

  // 更新绘制
  const updateDrawing = useCallback((x: number, y: number) => {
    if (!isDrawingLineRef.current || !lineStartRef.current) return

    const start = lineStartRef.current
    const nearest = findNearestConnectionPointEnhanced(x, y, shapes, 25)

    let endX = x
    let endY = y

    if (nearest && nearest.distance < 20) {
      const pos = calculateConnectionPointPosition(nearest.shape, nearest.connectionPoint)
      endX = pos.x
      endY = pos.y
      showSnapIndicator(endX, endY)
    } else {
      hideSnapIndicator()
    }

    updatePreviewLine(start.x, start.y, endX, endY)
  }, [shapes, showSnapIndicator, hideSnapIndicator, updatePreviewLine])

  // 结束绘制
  const endDrawing = useCallback((x: number, y: number) => {
    if (!isDrawingLineRef.current || !lineStartRef.current) return

    const start = lineStartRef.current
    const nearest = findNearestConnectionPointEnhanced(x, y, shapes, 25)

    if (nearest && nearest.shape.id !== start.shapeId) {
      onAddConnector({
        id: `connector-${Date.now()}`,
        sourceShapeId: start.shapeId!,
        sourcePointId: start.pointId || `edge-${nearest.connectionPoint.position}`,
        targetShapeId: nearest.shape.id,
        targetPointId: nearest.connectionPoint.id,
        style: currentLineStyleRef.current,
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      })
    }

    isDrawingLineRef.current = false
    lineStartRef.current = null
    removePreviewLine()
    hideSnapIndicator()
    canvas?.renderAll()
  }, [canvas, shapes, onAddConnector, removePreviewLine, hideSnapIndicator])

  // 取消绘制
  const cancelDrawing = useCallback(() => {
    isDrawingLineRef.current = false
    lineStartRef.current = null
    removePreviewLine()
    hideSnapIndicator()
    canvas?.renderAll()
  }, [canvas, removePreviewLine, hideSnapIndicator])

  // 处理鼠标悬停
  const handleMouseHover = useCallback((pointer: { x: number; y: number }, target: fabric.Object | null, currentTool: string) => {
    if (!canvas) return

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
  }, [canvas, shapes, showSnapIndicator, hideSnapIndicator])

  return {
    isDrawingLine: isDrawingLineRef.current,
    startDrawing,
    updateDrawing,
    endDrawing,
    cancelDrawing,
    handleMouseHover,
  }
}
