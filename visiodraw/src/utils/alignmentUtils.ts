import type { Shape } from '../stores/canvasStore'

// 对齐线类型
export interface AlignmentGuide {
  type: 'horizontal' | 'vertical'
  position: number
  targetValue: number
}

// 对齐结果
export interface AlignmentResult {
  guides: AlignmentGuide[]
  snapX?: number
  snapY?: number
}

// 对齐阈值（像素）
const ALIGNMENT_THRESHOLD = 10

// 计算图形的边界框
export function getShapeBounds(shape: Shape): {
  left: number
  right: number
  top: number
  bottom: number
  centerX: number
  centerY: number
} {
  const width = shape.width || 0
  const height = shape.height || 0
  const left = shape.x
  const top = shape.y

  return {
    left,
    right: left + width,
    top,
    bottom: top + height,
    centerX: left + width / 2,
    centerY: top + height / 2,
  }
}

// 计算对齐线
export function calculateAlignmentGuides(
  draggedShape: Shape,
  otherShapes: Shape[],
  currentX: number,
  currentY: number
): AlignmentResult {
  const guides: AlignmentGuide[] = []
  let snapX: number | undefined
  let snapY: number | undefined

  const draggedBounds = getShapeBounds({
    ...draggedShape,
    x: currentX,
    y: currentY,
  })

  // 需要检查的对齐点
  const draggedPoints = {
    left: draggedBounds.left,
    right: draggedBounds.right,
    centerX: draggedBounds.centerX,
    top: draggedBounds.top,
    bottom: draggedBounds.bottom,
    centerY: draggedBounds.centerY,
  }

  for (const shape of otherShapes) {
    if (shape.id === draggedShape.id) continue

    const bounds = getShapeBounds(shape)

    // 水平对齐检查（左对齐、右对齐、中心对齐）
    // 左对齐
    if (Math.abs(draggedPoints.left - bounds.left) < ALIGNMENT_THRESHOLD) {
      guides.push({
        type: 'vertical',
        position: bounds.left,
        targetValue: bounds.left,
      })
      snapX = bounds.left
    }
    // 右对齐
    else if (Math.abs(draggedPoints.right - bounds.right) < ALIGNMENT_THRESHOLD) {
      guides.push({
        type: 'vertical',
        position: bounds.right,
        targetValue: bounds.right - (draggedBounds.right - draggedBounds.left),
      })
      snapX = bounds.right - (draggedBounds.right - draggedBounds.left)
    }
    // 中心垂直对齐
    else if (Math.abs(draggedPoints.centerX - bounds.centerX) < ALIGNMENT_THRESHOLD) {
      guides.push({
        type: 'vertical',
        position: bounds.centerX,
        targetValue: bounds.centerX - (draggedBounds.right - draggedBounds.left) / 2,
      })
      snapX = bounds.centerX - (draggedBounds.right - draggedBounds.left) / 2
    }

    // 垂直对齐检查（顶对齐、底对齐、中心对齐）
    // 顶对齐
    if (Math.abs(draggedPoints.top - bounds.top) < ALIGNMENT_THRESHOLD) {
      guides.push({
        type: 'horizontal',
        position: bounds.top,
        targetValue: bounds.top,
      })
      snapY = bounds.top
    }
    // 底对齐
    else if (Math.abs(draggedPoints.bottom - bounds.bottom) < ALIGNMENT_THRESHOLD) {
      guides.push({
        type: 'horizontal',
        position: bounds.bottom,
        targetValue: bounds.bottom - (draggedBounds.bottom - draggedBounds.top),
      })
      snapY = bounds.bottom - (draggedBounds.bottom - draggedBounds.top)
    }
    // 中心水平对齐
    else if (Math.abs(draggedPoints.centerY - bounds.centerY) < ALIGNMENT_THRESHOLD) {
      guides.push({
        type: 'horizontal',
        position: bounds.centerY,
        targetValue: bounds.centerY - (draggedBounds.bottom - draggedBounds.top) / 2,
      })
      snapY = bounds.centerY - (draggedBounds.bottom - draggedBounds.top) / 2
    }
  }

  return { guides, snapX, snapY }
}

// 计算等间距分布
export function calculateDistribution(
  shapes: Shape[],
  axis: 'x' | 'y'
): number[] | null {
  if (shapes.length < 3) return null

  const sorted = [...shapes].sort((a, b) => {
    const aVal = axis === 'x' ? a.x : a.y
    const bVal = axis === 'x' ? b.x : b.y
    return aVal - bVal
  })

  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  const firstVal = axis === 'x' ? first.x : first.y
  const lastVal = axis === 'x' ? last.x : last.y

  const totalDistance = lastVal - firstVal
  const spacing = totalDistance / (sorted.length - 1)

  return sorted.map((_, index) => firstVal + spacing * index)
}

// 对齐多个图形
export function alignShapes(
  shapes: Shape[],
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): Partial<Shape>[] {
  if (shapes.length < 2) return []

  const updates: Partial<Shape>[] = []

  switch (alignment) {
    case 'left': {
      const minX = Math.min(...shapes.map((s) => s.x))
      shapes.forEach((shape) => {
        updates.push({ id: shape.id, x: minX })
      })
      break
    }
    case 'center': {
      const centers = shapes.map((s) => s.x + (s.width || 0) / 2)
      const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length
      shapes.forEach((shape) => {
        updates.push({ id: shape.id, x: avgCenter - (shape.width || 0) / 2 })
      })
      break
    }
    case 'right': {
      const maxRight = Math.max(...shapes.map((s) => s.x + (s.width || 0)))
      shapes.forEach((shape) => {
        updates.push({ id: shape.id, x: maxRight - (shape.width || 0) })
      })
      break
    }
    case 'top': {
      const minY = Math.min(...shapes.map((s) => s.y))
      shapes.forEach((shape) => {
        updates.push({ id: shape.id, y: minY })
      })
      break
    }
    case 'middle': {
      const centers = shapes.map((s) => s.y + (s.height || 0) / 2)
      const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length
      shapes.forEach((shape) => {
        updates.push({ id: shape.id, y: avgCenter - (shape.height || 0) / 2 })
      })
      break
    }
    case 'bottom': {
      const maxBottom = Math.max(...shapes.map((s) => s.y + (s.height || 0)))
      shapes.forEach((shape) => {
        updates.push({ id: shape.id, y: maxBottom - (shape.height || 0) })
      })
      break
    }
  }

  return updates
}

// 分布多个图形
export function distributeShapes(
  shapes: Shape[],
  axis: 'horizontal' | 'vertical'
): Partial<Shape>[] | null {
  if (shapes.length < 3) return null

  const sorted = [...shapes].sort((a, b) => {
    if (axis === 'horizontal') {
      return a.x - b.x
    } else {
      return a.y - b.y
    }
  })

  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  const firstVal = axis === 'horizontal' ? first.x : first.y
  const lastVal = axis === 'horizontal' ? last.x : last.y
  const totalDistance = lastVal - firstVal
  const spacing = totalDistance / (sorted.length - 1)

  const updates: Partial<Shape>[] = []

  sorted.forEach((shape, index) => {
    if (index === 0 || index === sorted.length - 1) return

    const newVal = firstVal + spacing * index
    if (axis === 'horizontal') {
      updates.push({ id: shape.id, x: newVal })
    } else {
      updates.push({ id: shape.id, y: newVal })
    }
  })

  return updates
}
