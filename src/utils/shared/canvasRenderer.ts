import type { Shape } from '../../types/shape'
import type { Connector } from '../../types/connector'

export interface RenderOptions {
  width: number
  height: number
  padding?: number
  backgroundColor?: string
  showGrid?: boolean
  gridSize?: number
  gridColor?: string
}

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface Transform {
  scale: number
  offsetX: number
  offsetY: number
}

export interface Positionable {
  x: number
  y: number
  width?: number
  height?: number
}

/**
 * 计算边界框
 */
export function calculateBoundingBox(items: Positionable[]): BoundingBox {
  if (items.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  items.forEach((item) => {
    const width = item.width || 60
    const height = item.height || 40
    minX = Math.min(minX, item.x)
    minY = Math.min(minY, item.y)
    maxX = Math.max(maxX, item.x + width)
    maxY = Math.max(maxY, item.y + height)
  })

  return { minX, minY, maxX, maxY }
}

/**
 * 计算变换参数以适应画布
 */
export function calculateTransform(
  bbox: BoundingBox,
  canvasWidth: number,
  canvasHeight: number,
  padding: number
): Transform {
  const contentWidth = bbox.maxX - bbox.minX
  const contentHeight = bbox.maxY - bbox.minY

  if (contentWidth === 0 || contentHeight === 0) {
    return { scale: 1, offsetX: padding, offsetY: padding }
  }

  const availableWidth = canvasWidth - padding * 2
  const availableHeight = canvasHeight - padding * 2

  const scaleX = availableWidth / contentWidth
  const scaleY = availableHeight / contentHeight
  const scale = Math.min(scaleX, scaleY, 1)

  const scaledWidth = contentWidth * scale
  const scaledHeight = contentHeight * scale

  const offsetX = (canvasWidth - scaledWidth) / 2 - bbox.minX * scale
  const offsetY = (canvasHeight - scaledHeight) / 2 - bbox.minY * scale

  return { scale, offsetX, offsetY }
}

/**
 * 绘制网格背景
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: { gridSize?: number; gridColor?: string } = {}
): void {
  const gridSize = options.gridSize || 20
  const gridColor = options.gridColor || '#e0e0e0'

  ctx.strokeStyle = gridColor
  ctx.lineWidth = 0.5

  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

/**
 * 绘制圆角矩形
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 绘制菱形
 */
export function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const centerX = x + width / 2
  const centerY = y + height / 2

  ctx.beginPath()
  ctx.moveTo(centerX, y)
  ctx.lineTo(x + width, centerY)
  ctx.lineTo(centerX, y + height)
  ctx.lineTo(x, centerY)
  ctx.closePath()
}

/**
 * 绘制椭圆
 */
export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const centerX = x + width / 2
  const centerY = y + height / 2
  const radiusX = width / 2
  const radiusY = height / 2

  ctx.beginPath()
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
  ctx.closePath()
}

/**
 * 绘制平行四边形
 */
export function drawParallelogram(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const offset = width * 0.15

  ctx.beginPath()
  ctx.moveTo(x + offset, y)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x + width - offset, y + height)
  ctx.lineTo(x, y + height)
  ctx.closePath()
}

/**
 * 绘制云形
 */
export function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const centerX = x + width / 2
  const centerY = y + height / 2
  const rx = width / 2
  const ry = height / 2

  ctx.beginPath()
  ctx.ellipse(centerX - rx * 0.3, centerY - ry * 0.3, rx * 0.4, ry * 0.4, 0, 0, Math.PI * 2)
  ctx.ellipse(centerX + rx * 0.3, centerY - ry * 0.3, rx * 0.4, ry * 0.4, 0, 0, Math.PI * 2)
  ctx.ellipse(centerX, centerY + ry * 0.2, rx * 0.5, ry * 0.5, 0, 0, Math.PI * 2)
  ctx.ellipse(centerX - rx * 0.4, centerY + ry * 0.1, rx * 0.35, ry * 0.35, 0, 0, Math.PI * 2)
  ctx.ellipse(centerX + rx * 0.4, centerY + ry * 0.1, rx * 0.35, ry * 0.35, 0, 0, Math.PI * 2)
  ctx.closePath()
}

/**
 * 检查是否应该跳过绘制该节点（辅助节点）
 */
function shouldSkipNode(type: string): boolean {
  const skipTypes = [
    'uml-anchor',
    'uml-lifeline-marker',
    'uml-lifeline-end',
    'uml-message-marker',
    'uml-destroy-marker',
    'uml-create-marker',
    'uml-create-label',
  ]
  return skipTypes.includes(type)
}

/**
 * 根据形状类型绘制形状
 */
export function drawShapeByType(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  switch (type) {
    case 'decision':
    case 'uml-decision':
      drawDiamond(ctx, x, y, width, height)
      break
    case 'start-end':
      drawEllipse(ctx, x, y, width, height)
      break
    case 'input-output':
      drawParallelogram(ctx, x, y, width, height)
      break
    case 'cloud':
      drawCloud(ctx, x, y, width, height)
      break
    case 'uml-initial':
    case 'uml-final':
    case 'uml-initial-state':
    case 'uml-final-state':
      ctx.beginPath()
      ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, Math.PI * 2)
      ctx.closePath()
      break
    // 序列图节点类型
    case 'uml-participant':
      drawRoundedRect(ctx, x, y, width, height, Math.min(4, height * 0.1))
      break
    case 'uml-actor-sequence':
      drawActor(ctx, x, y, width, height)
      break
    case 'uml-database-sequence':
      drawDatabase(ctx, x, y, width, height)
      break
    case 'uml-fragment':
      drawFragment(ctx, x, y, width, height)
      break
    case 'uml-note':
      drawNote(ctx, x, y, width, height)
      break
    case 'uml-activation':
      drawRoundedRect(ctx, x, y, width, height, 2)
      break
    default:
      drawRoundedRect(ctx, x, y, width, height, Math.min(4, 8))
  }
}

/**
 * 绘制参与者（人形图标）
 */
function drawActor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const centerX = x + width / 2
  const headRadius = Math.min(width, height) * 0.15
  const bodyY = y + headRadius * 2.5

  ctx.beginPath()
  // 头部
  ctx.arc(centerX, y + headRadius * 1.2, headRadius, 0, Math.PI * 2)
  // 身体
  ctx.moveTo(centerX, bodyY)
  ctx.lineTo(centerX, y + height * 0.7)
  // 手臂
  ctx.moveTo(centerX - width * 0.25, y + height * 0.45)
  ctx.lineTo(centerX + width * 0.25, y + height * 0.45)
  // 腿
  ctx.moveTo(centerX, y + height * 0.7)
  ctx.lineTo(centerX - width * 0.2, y + height)
  ctx.moveTo(centerX, y + height * 0.7)
  ctx.lineTo(centerX + width * 0.2, y + height)
  ctx.stroke()
}

/**
 * 绘制数据库图标
 */
function drawDatabase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const centerX = x + width / 2
  const topY = y + height * 0.2
  const bottomY = y + height * 0.8
  const rx = width * 0.4
  const ry = height * 0.15

  ctx.beginPath()
  // 顶部椭圆
  ctx.ellipse(centerX, topY, rx, ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // 主体
  ctx.beginPath()
  ctx.moveTo(centerX - rx, topY)
  ctx.lineTo(centerX - rx, bottomY - ry)
  ctx.ellipse(centerX, bottomY - ry, rx, ry, 0, Math.PI, 0)
  ctx.lineTo(centerX + rx, topY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

/**
 * 绘制片段框
 */
function drawFragment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const headerHeight = Math.min(25, height * 0.15)
  const cornerRadius = 4

  ctx.beginPath()
  // 外框
  ctx.moveTo(x + cornerRadius, y)
  ctx.lineTo(x + width - cornerRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius)
  ctx.lineTo(x + width, y + height - cornerRadius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height)
  ctx.lineTo(x + cornerRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius)
  ctx.lineTo(x, y + cornerRadius)
  ctx.quadraticCurveTo(x, y, x + cornerRadius, y)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // 标题栏虚线
  ctx.beginPath()
  ctx.setLineDash([4, 2])
  ctx.moveTo(x, y + headerHeight)
  ctx.lineTo(x + width, y + headerHeight)
  ctx.stroke()
  ctx.setLineDash([])
}

/**
 * 绘制注释框
 */
function drawNote(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const foldSize = Math.min(15, width * 0.15, height * 0.15)

  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + width - foldSize, y)
  ctx.lineTo(x + width, y + foldSize)
  ctx.lineTo(x + width, y + height)
  ctx.lineTo(x, y + height)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // 折叠角
  ctx.beginPath()
  ctx.moveTo(x + width - foldSize, y)
  ctx.lineTo(x + width - foldSize, y + foldSize)
  ctx.lineTo(x + width, y + foldSize)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

/**
 * 绘制形状
 */
export interface ShapeRenderOptions {
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  textColor?: string
}

export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  scale: number,
  offsetX: number,
  offsetY: number,
  options: ShapeRenderOptions = {}
): void {
  // 注意：辅助节点的过滤应该在调用方处理（如 drawTemplateToCanvas）
  // 这里保留绘制逻辑，以便在需要时可以绘制所有节点

  const x = shape.x * scale + offsetX
  const y = shape.y * scale + offsetY
  const width = (shape.width || 100) * scale
  const height = (shape.height || 60) * scale

  const fill = options.fill || shape.fill || '#E6F7FF'
  const stroke = options.stroke || shape.stroke || '#1890FF'
  const strokeWidth = options.strokeWidth || Math.max(1, 2 * scale)

  ctx.fillStyle = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth = strokeWidth

  // 处理虚线样式（用于生命线）
  const dashArray = (shape as any).dashArray
  if (dashArray) {
    ctx.setLineDash(dashArray.split(',').map(Number))
  }

  // 绘制形状
  drawShapeByType(ctx, shape.type, x, y, width, height)

  ctx.fill()
  ctx.stroke()

  // 重置虚线样式
  if (dashArray) {
    ctx.setLineDash([])
  }

  // 绘制文本
  const text = options.text || shape.text
  if (text) {
    const fontSize = options.fontSize || Math.max(8, 12 * scale)
    const fontFamily = options.fontFamily || 'Arial'
    const textColor = options.textColor || '#333333'

    ctx.fillStyle = textColor
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const lines = text.split('\n').slice(0, 3)
    const lineHeight = Math.max(10, 14 * scale)
    const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2

    lines.forEach((line, index) => {
      const truncated = line.length > 15 ? line.substring(0, 15) + '...' : line
      ctx.fillText(truncated, x + width / 2, startY + index * lineHeight)
    })
  }
}

/**
 * 绘制连线
 */
export interface ConnectorRenderOptions {
  stroke?: string
  strokeWidth?: number
  showArrow?: boolean
  arrowSize?: number
}

export function drawConnector(
  ctx: CanvasRenderingContext2D,
  connector: Connector,
  shapes: Shape[],
  scale: number,
  offsetX: number,
  offsetY: number,
  options: ConnectorRenderOptions = {}
): void {
  const sourceShape = shapes.find(
    (s) => s.id === connector.sourceShapeId || s.id === (connector as any).source
  )
  const targetShape = shapes.find(
    (s) => s.id === connector.targetShapeId || s.id === (connector as any).target
  )

  if (!sourceShape || !targetShape) return

  const sourceX = (sourceShape.x + (sourceShape.width || 100) / 2) * scale + offsetX
  const sourceY = (sourceShape.y + (sourceShape.height || 60) / 2) * scale + offsetY
  const targetX = (targetShape.x + (targetShape.width || 100) / 2) * scale + offsetX
  const targetY = (targetShape.y + (targetShape.height || 60) / 2) * scale + offsetY

  const stroke = options.stroke || connector.stroke || '#666666'
  const strokeWidth = options.strokeWidth || Math.max(1, 1.5 * scale)

  ctx.strokeStyle = stroke
  ctx.lineWidth = strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // 处理虚线样式
  const dashArray = (connector as any).dashArray || (connector as any).lineDash
  if (dashArray) {
    ctx.setLineDash(dashArray.split(',').map(Number))
  }

  // 绘制连线
  ctx.beginPath()
  ctx.moveTo(sourceX, sourceY)

  // 判断连线样式
  const style = (connector as any).style || connector.style
  if (style === 'straight') {
    // 直线连接（用于序列图消息）
    ctx.lineTo(targetX, targetY)
  } else {
    // 正交连线（默认）
    const midX = (sourceX + targetX) / 2
    ctx.lineTo(midX, sourceY)
    ctx.lineTo(midX, targetY)
    ctx.lineTo(targetX, targetY)
  }

  ctx.stroke()

  // 重置虚线样式
  if (dashArray) {
    ctx.setLineDash([])
  }

  // 绘制箭头
  if (options.showArrow !== false) {
    const arrowSize = options.arrowSize || Math.max(6, 10 * scale)
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX)
    const arrowAngle = Math.PI / 6

    ctx.beginPath()
    ctx.moveTo(targetX, targetY)
    ctx.lineTo(
      targetX - arrowSize * Math.cos(angle - arrowAngle),
      targetY - arrowSize * Math.sin(angle - arrowAngle)
    )
    ctx.moveTo(targetX, targetY)
    ctx.lineTo(
      targetX - arrowSize * Math.cos(angle + arrowAngle),
      targetY - arrowSize * Math.sin(angle + arrowAngle)
    )
    ctx.stroke()
  }
}

/**
 * Canvas 渲染器类
 */
export class CanvasRenderer {
  protected canvas: HTMLCanvasElement
  protected ctx: CanvasRenderingContext2D

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height

    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
    this.ctx = ctx
  }

  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  /**
   * 获取 2D 上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx
  }

  /**
   * 清除画布
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * 填充背景色
   */
  fillBackground(color: string): void {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * 导出为 Data URL
   */
  toDataURL(type: string = 'image/png', quality?: number): string {
    return this.canvas.toDataURL(type, quality)
  }

  /**
   * 导出为 Blob
   */
  async toBlob(type: string = 'image/png', quality?: number): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob), type, quality)
    })
  }
}

export default {
  calculateBoundingBox,
  calculateTransform,
  drawGrid,
  drawRoundedRect,
  drawDiamond,
  drawEllipse,
  drawParallelogram,
  drawCloud,
  drawShapeByType,
  drawShape,
  drawConnector,
  CanvasRenderer,
}
