import type { Template } from '../types/template'
import type { DiagramTemplate, TemplateNode, TemplateEdge } from '../types/diagramTemplate'

export interface ThumbnailOptions {
  width?: number
  height?: number
  padding?: number
  backgroundColor?: string
  quality?: number
}

const DEFAULT_OPTIONS: Required<ThumbnailOptions> = {
  width: 320,
  height: 180,
  padding: 10,
  backgroundColor: '#f5f5f5',
  quality: 0.9,
}

/**
 * 计算模板的边界框
 */
function calculateBoundingBox(nodes: Array<{ x: number; y: number; width?: number; height?: number }>) {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  nodes.forEach((node) => {
    const width = node.width || 60
    const height = node.height || 40
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + width)
    maxY = Math.max(maxY, node.y + height)
  })

  return { minX, minY, maxX, maxY }
}

/**
 * 计算缩放比例和偏移量以适应画布
 */
function calculateTransform(
  bbox: { minX: number; minY: number; maxX: number; maxY: number },
  canvasWidth: number,
  canvasHeight: number,
  padding: number
) {
  const contentWidth = bbox.maxX - bbox.minX
  const contentHeight = bbox.maxY - bbox.minY

  if (contentWidth === 0 || contentHeight === 0) {
    return { scale: 1, offsetX: padding, offsetY: padding }
  }

  const availableWidth = canvasWidth - padding * 2
  const availableHeight = canvasHeight - padding * 2

  const scaleX = availableWidth / contentWidth
  const scaleY = availableHeight / contentHeight
  const scale = Math.min(scaleX, scaleY, 1) // 最大缩放为1，避免过度放大

  const scaledWidth = contentWidth * scale
  const scaledHeight = contentHeight * scale

  const offsetX = (canvasWidth - scaledWidth) / 2 - bbox.minX * scale
  const offsetY = (canvasHeight - scaledHeight) / 2 - bbox.minY * scale

  return { scale, offsetX, offsetY }
}

/**
 * 获取节点颜色
 */
function getNodeColors(node: TemplateNode) {
  const fill = node.fill || '#ffffff'
  const stroke = node.stroke || '#333333'
  return { fill, stroke }
}

/**
 * 绘制圆角矩形
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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
 * 绘制菱形（判断节点）
 */
function drawDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
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
 * 绘制椭圆（开始/结束节点）
 */
function drawEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const centerX = x + width / 2
  const centerY = y + height / 2
  const radiusX = width / 2
  const radiusY = height / 2

  ctx.beginPath()
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
  ctx.closePath()
}

/**
 * 绘制平行四边形（输入/输出节点）
 */
function drawParallelogram(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const offset = width * 0.15

  ctx.beginPath()
  ctx.moveTo(x + offset, y)
  ctx.lineTo(x + width, y)
  ctx.lineTo(x + width - offset, y + height)
  ctx.lineTo(x, y + height)
  ctx.closePath()
}

/**
 * 绘制云形（网络节点）
 */
function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
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
 * 绘制节点
 */
function drawNode(
  ctx: CanvasRenderingContext2D,
  node: TemplateNode,
  scale: number,
  offsetX: number,
  offsetY: number
) {
  const x = node.x * scale + offsetX
  const y = node.y * scale + offsetY
  const width = (node.width || 100) * scale
  const height = (node.height || 60) * scale
  const { fill, stroke } = getNodeColors(node)

  ctx.fillStyle = fill
  ctx.strokeStyle = stroke
  ctx.lineWidth = Math.max(1, 2 * scale)

  // 根据节点类型绘制不同形状
  switch (node.type) {
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
    default:
      drawRoundedRect(ctx, x, y, width, height, Math.min(4 * scale, 8))
  }

  ctx.fill()
  ctx.stroke()

  // 绘制文本
  if (node.text) {
    ctx.fillStyle = '#333333'
    ctx.font = `${Math.max(8, 12 * scale)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const lines = node.text.split('\n').slice(0, 3) // 最多显示3行
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
function drawEdge(
  ctx: CanvasRenderingContext2D,
  edge: TemplateEdge,
  nodes: TemplateNode[],
  scale: number,
  offsetX: number,
  offsetY: number
) {
  const sourceNode = nodes.find((n) => n.id === edge.source)
  const targetNode = nodes.find((n) => n.id === edge.target)

  if (!sourceNode || !targetNode) return

  const sourceX = (sourceNode.x + (sourceNode.width || 100) / 2) * scale + offsetX
  const sourceY = (sourceNode.y + (sourceNode.height || 60) / 2) * scale + offsetY
  const targetX = (targetNode.x + (targetNode.width || 100) / 2) * scale + offsetX
  const targetY = (targetNode.y + (targetNode.height || 60) / 2) * scale + offsetY

  ctx.strokeStyle = '#666666'
  ctx.lineWidth = Math.max(1, 1.5 * scale)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // 绘制连线
  ctx.beginPath()
  ctx.moveTo(sourceX, sourceY)

  if (edge.style === 'straight') {
    ctx.lineTo(targetX, targetY)
  } else {
    // 正交连线
    const midX = (sourceX + targetX) / 2
    ctx.lineTo(midX, sourceY)
    ctx.lineTo(midX, targetY)
    ctx.lineTo(targetX, targetY)
  }

  ctx.stroke()

  // 绘制箭头
  const angle = Math.atan2(targetY - sourceY, targetX - sourceX)
  const arrowLength = Math.max(6, 10 * scale)
  const arrowAngle = Math.PI / 6

  ctx.beginPath()
  ctx.moveTo(targetX, targetY)
  ctx.lineTo(
    targetX - arrowLength * Math.cos(angle - arrowAngle),
    targetY - arrowLength * Math.sin(angle - arrowAngle)
  )
  ctx.moveTo(targetX, targetY)
  ctx.lineTo(
    targetX - arrowLength * Math.cos(angle + arrowAngle),
    targetY - arrowLength * Math.sin(angle + arrowAngle)
  )
  ctx.stroke()
}

/**
 * 生成基础模板的缩略图
 */
export function generateTemplateThumbnail(
  template: Template,
  options: ThumbnailOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const canvas = document.createElement('canvas')
  canvas.width = opts.width
  canvas.height = opts.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 填充背景
  ctx.fillStyle = opts.backgroundColor
  ctx.fillRect(0, 0, opts.width, opts.height)

  // 绘制网格背景
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 0.5
  const gridSize = 20

  for (let x = 0; x < opts.width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, opts.height)
    ctx.stroke()
  }

  for (let y = 0; y < opts.height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(opts.width, y)
    ctx.stroke()
  }

  // 计算边界框和变换
  const nodes = template.shapes || []
  const bbox = calculateBoundingBox(nodes)
  const { scale, offsetX, offsetY } = calculateTransform(
    bbox,
    opts.width,
    opts.height,
    opts.padding
  )

  // 绘制连线
  if (template.connectors) {
    template.connectors.forEach((connector) => {
      drawEdge(
        ctx,
        {
          id: connector.id,
          source: connector.source,
          target: connector.target,
          style: 'orthogonal',
        },
        nodes,
        scale,
        offsetX,
        offsetY
      )
    })
  }

  // 绘制节点
  nodes.forEach((node) => {
    drawNode(ctx, node, scale, offsetX, offsetY)
  })

  return canvas.toDataURL('image/png', opts.quality)
}

/**
 * 生成图表模板的缩略图
 */
export function generateDiagramTemplateThumbnail(
  template: DiagramTemplate,
  options: ThumbnailOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const canvas = document.createElement('canvas')
  canvas.width = opts.width
  canvas.height = opts.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 填充背景
  ctx.fillStyle = opts.backgroundColor
  ctx.fillRect(0, 0, opts.width, opts.height)

  // 绘制网格背景
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 0.5
  const gridSize = 20

  for (let x = 0; x < opts.width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, opts.height)
    ctx.stroke()
  }

  for (let y = 0; y < opts.height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(opts.width, y)
    ctx.stroke()
  }

  // 计算边界框和变换
  const nodes = template.nodes || []
  const bbox = calculateBoundingBox(nodes)
  const { scale, offsetX, offsetY } = calculateTransform(
    bbox,
    opts.width,
    opts.height,
    opts.padding
  )

  // 绘制连线
  if (template.edges) {
    template.edges.forEach((edge) => {
      drawEdge(ctx, edge, nodes, scale, offsetX, offsetY)
    })
  }

  // 绘制节点
  nodes.forEach((node) => {
    drawNode(ctx, node, scale, offsetX, offsetY)
  })

  return canvas.toDataURL('image/png', opts.quality)
}

/**
 * 异步生成缩略图（使用 requestAnimationFrame 避免阻塞）
 */
export function generateThumbnailAsync(
  template: Template | DiagramTemplate,
  options: ThumbnailOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    requestAnimationFrame(() => {
      try {
        if ('nodes' in template) {
          resolve(generateDiagramTemplateThumbnail(template, options))
        } else {
          resolve(generateTemplateThumbnail(template, options))
        }
      } catch (error) {
        reject(error)
      }
    })
  })
}

/**
 * 生成空模板占位缩略图
 */
export function generateEmptyThumbnail(options: ThumbnailOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const canvas = document.createElement('canvas')
  canvas.width = opts.width
  canvas.height = opts.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 填充背景
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, opts.width, opts.height)

  // 绘制虚线边框
  ctx.strokeStyle = '#d9d9d9'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 4])
  ctx.strokeRect(20, 20, opts.width - 40, opts.height - 40)

  // 绘制提示文字
  ctx.fillStyle = '#bfbfbf'
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('暂无预览', opts.width / 2, opts.height / 2)

  return canvas.toDataURL('image/png')
}

export default {
  generateTemplateThumbnail,
  generateDiagramTemplateThumbnail,
  generateThumbnailAsync,
  generateEmptyThumbnail,
}
