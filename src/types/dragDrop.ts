export type DragDataType = 'shape' | 'stencil'

export interface DragData {
  type: DragDataType
  shapeType?: string
  stencilId?: string
  shapeId?: string
  defaultProps?: Record<string, unknown>
  width?: number
  height?: number
  name?: string
  icon?: string
}

export interface DropPosition {
  x: number
  y: number
  canvasX: number
  canvasY: number
}

export const DRAG_DATA_FORMAT = 'application/x-visiodraw-shape'

export function createDragData(
  type: DragDataType,
  data: Omit<DragData, 'type'>
): DragData {
  return {
    type,
    ...data,
  }
}

export function parseDragData(dataTransfer: DataTransfer): DragData | null {
  try {
    const data = dataTransfer.getData(DRAG_DATA_FORMAT)
    if (data) {
      return JSON.parse(data) as DragData
    }
  } catch {
    // Parse failed
  }
  return null
}

export function setDragData(dataTransfer: DataTransfer, data: DragData): void {
  dataTransfer.setData(DRAG_DATA_FORMAT, JSON.stringify(data))
  dataTransfer.effectAllowed = 'copy'
}
