import type { Template } from '../types/template'
import type { DiagramTemplate, TemplateNode, TemplateEdge } from '../types/diagramTemplate'
import {
  calculateBoundingBox,
  calculateTransform,
  drawGrid,
  drawShape,
  drawConnector,
} from './shared/canvasRenderer'

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
 * 绘制模板到 Canvas
 */
function drawTemplateToCanvas(
  ctx: CanvasRenderingContext2D,
  nodes: TemplateNode[],
  edges: TemplateEdge[],
  width: number,
  height: number,
  padding: number
): void {
  // 绘制网格背景
  drawGrid(ctx, width, height)

  // 计算边界框和变换（包含所有节点，包括锚点）
  const bbox = calculateBoundingBox(nodes)
  const { scale, offsetX, offsetY } = calculateTransform(bbox, width, height, padding)

  // 绘制连线（需要所有节点包括锚点来定位）
  edges.forEach((edge) => {
    drawConnector(ctx, edge as any, nodes as any, scale, offsetX, offsetY)
  })

  // 绘制节点（过滤掉辅助节点）
  nodes.forEach((node) => {
    // 跳过辅助节点（锚点、标记等）
    if (!shouldSkipNodeInThumbnail(node.type)) {
      drawShape(ctx, node as any, scale, offsetX, offsetY)
    }
  })
}

/**
 * 检查是否在缩略图中跳过该节点
 */
function shouldSkipNodeInThumbnail(type: string): boolean {
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

  // 绘制模板
  const nodes = (template.shapes || []) as TemplateNode[]
  const edges = (template.connectors || []).map((c) => ({
    id: c.id,
    source: c.source,
    target: c.target,
    style: 'orthogonal' as const,
  })) as TemplateEdge[]

  drawTemplateToCanvas(ctx, nodes, edges, opts.width, opts.height, opts.padding)

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

  // 如果模板有 generate 函数，先调用它生成 nodes 和 edges
  let nodes = template.nodes || []
  let edges = template.edges || []

  if (template.generate) {
    const generated = template.generate()
    nodes = generated.nodes
    edges = generated.edges
  }

  // 绘制模板
  drawTemplateToCanvas(ctx, nodes, edges, opts.width, opts.height, opts.padding)

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
