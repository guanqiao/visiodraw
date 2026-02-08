/**
 * 连接点管理 Hook
 * @version 1.0.0
 * @date 2026-02-08
 */

import { useRef, useCallback } from 'react'
import type { ConnectionPoint } from '../types/connection'
import type { Shape } from '../stores/canvasStore'
import {
  calculateConnectionPointPosition,
  createConnectionPoint,
  isNearShapeEdge,
  getNearestEdgePoint,
} from '../utils/connectionPoints'
import { defaultConnectionPointOptions } from '../types/connection'

export interface UseConnectionPointsOptions {
  canvas: fabric.Canvas | null
  shapes: Shape[]
  onUpdateConnectionPoints: (shapeId: string, points: ConnectionPoint[]) => void
}

export interface UseConnectionPointsReturn {
  renderConnectionPoints: (shapeId: string | null) => void
  addConnectionPoint: (shapeId: string, x: number, y: number) => void
  isAddingMode: boolean
  setAddingMode: (isAdding: boolean) => void
  handleMouseHover: (pointer: { x: number; y: number }, target: fabric.Object | null, isAddingMode: boolean) => void
  startDraggingPoint: (pointId: string, shapeId: string) => void
  isDraggingPoint: () => boolean
}

export function useConnectionPoints(options: UseConnectionPointsOptions): UseConnectionPointsReturn {
  const { canvas, shapes, onUpdateConnectionPoints } = options

  const connectionPointsRef = useRef<fabric.Circle[]>([])
  const isAddingModeRef = useRef(false)
  const snapIndicatorRef = useRef<fabric.Circle | null>(null)
  const draggingPointRef = useRef<{ pointId: string; shapeId: string } | null>(null)

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

  // 渲染连接点
  const renderConnectionPoints = useCallback((shapeId: string | null) => {
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

      // 拖拽连接点 - 鼠标按下
      circle.on('mousedown', () => {
        draggingPointRef.current = { pointId: point.id, shapeId: shape.id }
      })

      // 拖拽连接点 - 鼠标移动
      circle.on('moving', () => {
        if (!draggingPointRef.current || draggingPointRef.current.pointId !== point.id) return

        const movedShape = shapes.find(s => s.id === draggingPointRef.current!.shapeId)
        if (!movedShape) return

        const circleCenterX = circle.left! + defaultConnectionPointOptions.radius
        const circleCenterY = circle.top! + defaultConnectionPointOptions.radius

        // 计算新的相对坐标
        let newRelativeX = (circleCenterX - movedShape.x) / movedShape.width
        let newRelativeY = (circleCenterY - movedShape.y) / movedShape.height

        // 限制在图形范围内
        newRelativeX = Math.max(0, Math.min(1, newRelativeX))
        newRelativeY = Math.max(0, Math.min(1, newRelativeY))

        // 更新连接点位置
        const updatedPoints = movedShape.connectionPoints?.map(p => {
          if (p.id === point.id) {
            return { ...p, x: newRelativeX, y: newRelativeY }
          }
          return p
        })

        if (updatedPoints) {
          onUpdateConnectionPoints(movedShape.id, updatedPoints)
        }

        canvas.renderAll()
      })

      // 拖拽连接点 - 鼠标释放
      circle.on('mouseup', () => {
        draggingPointRef.current = null
      })

      // 鼠标悬停效果 - 放大
      circle.on('mouseover', () => {
        if (draggingPointRef.current) return
        circle.set({
          fill: defaultConnectionPointOptions.hoverFill,
          radius: defaultConnectionPointOptions.radius + 2,
          left: pos.x - defaultConnectionPointOptions.radius - 2,
          top: pos.y - defaultConnectionPointOptions.radius - 2,
        })
        canvas.renderAll()
      })

      circle.on('mouseout', () => {
        if (draggingPointRef.current) return
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
      circle.bringToFront()
      connectionPointsRef.current.push(circle)
    })

    canvas.renderAll()
  }, [canvas, shapes])

  // 添加连接点
  const addConnectionPoint = useCallback((shapeId: string, x: number, y: number) => {
    const shape = shapes.find((s) => s.id === shapeId)
    if (!shape || !isNearShapeEdge(shape, x, y, 25)) return

    // 计算相对坐标
    const relativeX = (x - shape.x) / shape.width
    const relativeY = (y - shape.y) / shape.height

    // 确定位置类型
    let position: 'top' | 'bottom' | 'left' | 'right' | 'custom' = 'custom'
    const threshold = 0.15
    if (relativeY < threshold) position = 'top'
    else if (relativeY > 1 - threshold) position = 'bottom'
    else if (relativeX < threshold) position = 'left'
    else if (relativeX > 1 - threshold) position = 'right'

    // 创建新连接点
    const newPoint = createConnectionPoint(
      Math.max(0, Math.min(1, relativeX)),
      Math.max(0, Math.min(1, relativeY)),
      position
    )

    // 更新图形的连接点
    const updatedPoints = [...(shape.connectionPoints || []), newPoint]
    onUpdateConnectionPoints(shape.id, updatedPoints)

    // 显示视觉反馈
    showSnapIndicator(x, y, 8, 'rgba(82, 196, 26, 0.6)')
    setTimeout(() => hideSnapIndicator(), 300)
  }, [shapes, onUpdateConnectionPoints, showSnapIndicator, hideSnapIndicator])

  // 设置添加模式
  const setAddingMode = useCallback((isAdding: boolean) => {
    isAddingModeRef.current = isAdding
  }, [])

  // 处理鼠标悬停
  const handleMouseHover = useCallback((pointer: { x: number; y: number }, target: fabric.Object | null, isAddingMode: boolean) => {
    if (!canvas) return

    // 添加连接点模式：高亮图形边缘并显示预览点
    if (isAddingMode && target && target.id) {
      const shape = shapes.find((s) => s.id === target.id)
      if (shape && isNearShapeEdge(shape, pointer.x, pointer.y, 25)) {
        const edgePoint = getNearestEdgePoint(shape, pointer.x, pointer.y)
        showSnapIndicator(edgePoint.x, edgePoint.y, 8, 'rgba(82, 196, 26, 0.5)')
        canvas.defaultCursor = 'copy'
        return true
      }
    }
    return false
  }, [canvas, shapes, showSnapIndicator])

  return {
    renderConnectionPoints,
    addConnectionPoint,
    isAddingMode: isAddingModeRef.current,
    setAddingMode,
    handleMouseHover,
    startDraggingPoint: (pointId: string, shapeId: string) => {
      draggingPointRef.current = { pointId, shapeId }
    },
    isDraggingPoint: () => draggingPointRef.current !== null,
  }
}
