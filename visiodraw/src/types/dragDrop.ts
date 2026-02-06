/**
 * 拖拽相关类型定义
 */

/**
 * 拖拽数据类型
 */
export type DragDataType = 'shape' | 'stencil'

/**
 * 拖拽数据接口
 */
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

/**
 * 拖拽状态
 */
export interface DragState {
  isDragging: boolean
  dragData: DragData | null
  dragImage: string | null
}

/**
 * 放置位置信息
 */
export interface DropPosition {
  x: number
  y: number
  canvasX: number
  canvasY: number
}

/**
 * 拖拽事件处理器
 */
export interface DragHandlers {
  onDragStart: (data: DragData, e: React.DragEvent) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (position: DropPosition, data: DragData) => void
}

/**
 * DataTransfer 数据格式
 */
export const DRAG_DATA_FORMAT = 'application/x-visiodraw-shape'

/**
 * 创建拖拽数据
 */
export function createDragData(
  type: DragDataType,
  data: Omit<DragData, 'type'>
): DragData {
  return {
    type,
    ...data,
  }
}

/**
 * 解析拖拽数据
 */
export function parseDragData(dataTransfer: DataTransfer): DragData | null {
  try {
    const data = dataTransfer.getData(DRAG_DATA_FORMAT)
    if (data) {
      return JSON.parse(data) as DragData
    }
  } catch {
    // 解析失败返回null
  }
  return null
}

/**
 * 设置拖拽数据
 */
export function setDragData(dataTransfer: DataTransfer, data: DragData): void {
  dataTransfer.setData(DRAG_DATA_FORMAT, JSON.stringify(data))
  dataTransfer.effectAllowed = 'copy'
}
