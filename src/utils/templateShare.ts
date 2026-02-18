import type { Template } from '../types/template'

export interface ShareOptions {
  baseUrl?: string
  expiresIn?: number // days
}

export interface EmbedOptions {
  width?: number
  height?: number
  responsive?: boolean
  type?: 'iframe' | 'script' | 'markdown' | 'html'
}

export interface ExportImageOptions {
  width?: number
  height?: number
  quality?: number // 0-1, for JPEG
  backgroundColor?: string
}

export interface ExportSvgOptions {
  viewBox?: string
}

// 默认基础 URL
const DEFAULT_BASE_URL = window.location.origin

/**
 * 生成分享链接
 * @param template 模板
 * @param options 分享选项
 * @returns 分享链接
 */
export function generateShareLink(template: Template, options: ShareOptions = {}): string {
  if (!template || !template.id) {
    throw new Error('Invalid template')
  }

  const baseUrl = options.baseUrl || DEFAULT_BASE_URL
  const params = new URLSearchParams()

  params.set('id', template.id)
  params.set('name', encodeURIComponent(template.name))

  if (options.expiresIn) {
    const expiresAt = Date.now() + options.expiresIn * 24 * 60 * 60 * 1000
    params.set('expires', expiresAt.toString())
  }

  return `${baseUrl}/share/${template.id}?${params.toString()}`
}

/**
 * 生成嵌入代码
 * @param template 模板
 * @param options 嵌入选项
 * @returns 嵌入代码
 */
export function generateEmbedCode(template: Template, options: EmbedOptions = {}): string {
  if (!template || !template.id) {
    throw new Error('Invalid template')
  }

  const shareUrl = generateShareLink(template, { baseUrl: DEFAULT_BASE_URL })
  const type = options.type || 'iframe'

  switch (type) {
    case 'iframe':
      return generateIframeEmbed(shareUrl, options)
    case 'script':
      return generateScriptEmbed(template.id, shareUrl, options)
    case 'markdown':
      return generateMarkdownEmbed(template.name, shareUrl)
    case 'html':
      return generateHtmlEmbed(shareUrl, options)
    default:
      return generateIframeEmbed(shareUrl, options)
  }
}

/**
 * 生成 iframe 嵌入代码
 */
function generateIframeEmbed(shareUrl: string, options: EmbedOptions): string {
  const width = options.responsive ? '100%' : options.width || 800
  const height = options.responsive ? '100%' : options.height || 600

  const style = options.responsive
    ? 'style="width:100%;height:100%;border:none;"'
    : `width="${width}" height="${height}"`

  return `<iframe src="${shareUrl}" ${style} frameborder="0" allowfullscreen></iframe>`
}

/**
 * 生成 script 嵌入代码
 */
function generateScriptEmbed(templateId: string, shareUrl: string, options: EmbedOptions): string {
  const width = options.width || 800
  const height = options.height || 600

  return `<script>
(function() {
  var container = document.createElement('div');
  container.id = 'visiodraw-${templateId}';
  container.style.width = '${width}px';
  container.style.height = '${height}px';
  container.innerHTML = '<iframe src="${shareUrl}" width="100%" height="100%" frameborder="0"></iframe>';
  document.currentScript.parentNode.insertBefore(container, document.currentScript);
})();
</script>`
}

/**
 * 生成 markdown 嵌入代码
 */
function generateMarkdownEmbed(name: string, shareUrl: string): string {
  return `[${name}](${shareUrl})`
}

/**
 * 生成 HTML 嵌入代码
 */
function generateHtmlEmbed(shareUrl: string, options: EmbedOptions): string {
  const width = options.width || 800
  const height = options.height || 600

  return `<div style="width:${width}px;height:${height}px;">
  <object data="${shareUrl}" type="text/html" width="100%" height="100%"></object>
</div>`
}

/**
 * 导出模板为图片
 * @param template 模板
 * @param format 图片格式
 * @param options 导出选项
 * @returns 图片 Data URL
 */
export async function exportTemplateAsImage(
  template: Template,
  format: 'png' | 'jpeg' = 'png',
  options: ExportImageOptions = {}
): Promise<string> {
  if (!template) {
    throw new Error('Template is required')
  }

  const canvas = document.createElement('canvas')
  if (!canvas) {
    throw new Error('Failed to create canvas')
  }

  // 设置画布尺寸
  canvas.width = options.width || 800
  canvas.height = options.height || 600

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  // 填充背景
  ctx.fillStyle = options.backgroundColor || '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制模板内容
  await drawTemplateOnCanvas(ctx, template, canvas.width, canvas.height)

  // 导出为图片
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const quality = format === 'jpeg' ? options.quality || 0.9 : undefined

  return canvas.toDataURL(mimeType, quality)
}

/**
 * 在画布上绘制模板
 */
async function drawTemplateOnCanvas(
  ctx: CanvasRenderingContext2D,
  template: Template,
  width: number,
  height: number
): Promise<void> {
  if (!template.shapes || template.shapes.length === 0) {
    // 绘制空模板提示
    ctx.fillStyle = '#999999'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('空模板', width / 2, height / 2)
    return
  }

  // 计算边界框
  const bbox = calculateBoundingBox(template.shapes)
  const padding = 20

  // 计算缩放比例
  const scaleX = (width - padding * 2) / (bbox.maxX - bbox.minX || 1)
  const scaleY = (height - padding * 2) / (bbox.maxY - bbox.minY || 1)
  const scale = Math.min(scaleX, scaleY, 1)

  // 计算偏移量
  const offsetX = (width - (bbox.maxX - bbox.minX) * scale) / 2 - bbox.minX * scale
  const offsetY = (height - (bbox.maxY - bbox.minY) * scale) / 2 - bbox.minY * scale

  // 绘制连线
  if (template.connectors) {
    template.connectors.forEach((connector) => {
      drawConnector(ctx, connector, template.shapes, scale, offsetX, offsetY)
    })
  }

  // 绘制形状
  template.shapes.forEach((shape) => {
    drawShape(ctx, shape, scale, offsetX, offsetY)
  })
}

/**
 * 计算边界框
 */
function calculateBoundingBox(shapes: any[]): { minX: number; minY: number; maxX: number; maxY: number } {
  if (shapes.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  shapes.forEach((shape) => {
    const width = shape.width || 60
    const height = shape.height || 40
    minX = Math.min(minX, shape.x)
    minY = Math.min(minY, shape.y)
    maxX = Math.max(maxX, shape.x + width)
    maxY = Math.max(maxY, shape.y + height)
  })

  return { minX, minY, maxX, maxY }
}

/**
 * 绘制形状
 */
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: any,
  scale: number,
  offsetX: number,
  offsetY: number
): void {
  const x = shape.x * scale + offsetX
  const y = shape.y * scale + offsetY
  const width = (shape.width || 100) * scale
  const height = (shape.height || 60) * scale

  ctx.fillStyle = shape.fill || '#E6F7FF'
  ctx.strokeStyle = shape.stroke || '#1890FF'
  ctx.lineWidth = Math.max(1, 2 * scale)

  // 绘制圆角矩形
  const radius = Math.min(4 * scale, 8)
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

  ctx.fill()
  ctx.stroke()

  // 绘制文本
  if (shape.text) {
    ctx.fillStyle = '#333333'
    ctx.font = `${Math.max(8, 12 * scale)}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const lines = shape.text.split('\n').slice(0, 3)
    const lineHeight = Math.max(10, 14 * scale)
    const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2

    lines.forEach((line: string, index: number) => {
      const truncated = line.length > 15 ? line.substring(0, 15) + '...' : line
      ctx.fillText(truncated, x + width / 2, startY + index * lineHeight)
    })
  }
}

/**
 * 绘制连线
 */
function drawConnector(
  ctx: CanvasRenderingContext2D,
  connector: any,
  shapes: any[],
  scale: number,
  offsetX: number,
  offsetY: number
): void {
  const sourceShape = shapes.find((s) => s.id === connector.source || s.id === connector.sourceShapeId)
  const targetShape = shapes.find((s) => s.id === connector.target || s.id === connector.targetShapeId)

  if (!sourceShape || !targetShape) return

  const sourceX = (sourceShape.x + (sourceShape.width || 100) / 2) * scale + offsetX
  const sourceY = (sourceShape.y + (sourceShape.height || 60) / 2) * scale + offsetY
  const targetX = (targetShape.x + (targetShape.width || 100) / 2) * scale + offsetX
  const targetY = (targetShape.y + (targetShape.height || 60) / 2) * scale + offsetY

  ctx.strokeStyle = connector.stroke || '#666666'
  ctx.lineWidth = Math.max(1, 1.5 * scale)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(sourceX, sourceY)

  // 正交连线
  const midX = (sourceX + targetX) / 2
  ctx.lineTo(midX, sourceY)
  ctx.lineTo(midX, targetY)
  ctx.lineTo(targetX, targetY)

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
 * 导出模板为 SVG
 * @param template 模板
 * @param options 导出选项
 * @returns SVG 字符串
 */
export async function exportTemplateAsSvg(
  template: Template,
  options: ExportSvgOptions = {}
): Promise<string> {
  if (!template) {
    throw new Error('Template is required')
  }

  const bbox = calculateBoundingBox(template.shapes || [])
  const padding = 20
  const width = bbox.maxX - bbox.minX + padding * 2
  const height = bbox.maxY - bbox.minY + padding * 2

  const viewBox = options.viewBox || `0 0 ${width} ${height}`

  let shapesSvg = ''
  let connectorsSvg = ''

  // 绘制连线
  if (template.connectors) {
    connectorsSvg = template.connectors
      .map((connector) => {
        const sourceShape = template.shapes?.find(
          (s) => s.id === connector.source || s.id === connector.sourceShapeId
        )
        const targetShape = template.shapes?.find(
          (s) => s.id === connector.target || s.id === connector.targetShapeId
        )

        if (!sourceShape || !targetShape) return ''

        const x1 = sourceShape.x + (sourceShape.width || 100) / 2 + padding - bbox.minX
        const y1 = sourceShape.y + (sourceShape.height || 60) / 2 + padding - bbox.minY
        const x2 = targetShape.x + (targetShape.width || 100) / 2 + padding - bbox.minX
        const y2 = targetShape.y + (targetShape.height || 60) / 2 + padding - bbox.minY

        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${connector.stroke || '#666666'}" stroke-width="${connector.strokeWidth || 2}" marker-end="url(#arrowhead)" />`
      })
      .join('\n')
  }

  // 绘制形状
  if (template.shapes) {
    shapesSvg = template.shapes
      .map((shape) => {
        const x = shape.x + padding - bbox.minX
        const y = shape.y + padding - bbox.minY
        const width = shape.width || 100
        const height = shape.height || 60
        const radius = 4

        const rect = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="${shape.fill || '#E6F7FF'}" stroke="${shape.stroke || '#1890FF'}" stroke-width="2" />`

        let text = ''
        if (shape.text) {
          const lines = shape.text.split('\n').slice(0, 3)
          const lineHeight = 14
          const startY = y + height / 2 - ((lines.length - 1) * lineHeight) / 2

          text = lines
            .map((line, index) => {
              const truncated = line.length > 15 ? line.substring(0, 15) + '...' : line
              return `<text x="${x + width / 2}" y="${startY + index * lineHeight}" text-anchor="middle" dominant-baseline="middle" fill="#333333" font-size="12">${escapeXml(truncated)}</text>`
            })
            .join('\n')
        }

        return rect + '\n' + text
      })
      .join('\n')
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#666666" />
    </marker>
  </defs>
  ${connectorsSvg}
  ${shapesSvg}
</svg>`
}

/**
 * 复制到剪贴板
 * @param text 文本内容
 * @returns 是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return true

  try {
    // 尝试使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (error) {
    console.warn('Clipboard API failed, falling back to execCommand')
  }

  // 降级方案：使用 execCommand
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const success = document.execCommand('copy')
    document.body.removeChild(textarea)

    return success
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * 下载文件
 * @param content 文件内容
 * @param filename 文件名
 * @param mimeType MIME 类型
 * @returns 下载链接元素
 */
export function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType?: string
): HTMLAnchorElement {
  const link = document.createElement('a')

  if (content instanceof Blob) {
    link.href = URL.createObjectURL(content)
  } else if (content.startsWith('data:')) {
    link.href = content
  } else {
    const blob = new Blob([content], { type: mimeType || 'text/plain' })
    link.href = URL.createObjectURL(blob)
  }

  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  return link
}

/**
 * 验证分享链接
 * @param link 分享链接
 * @returns 验证结果
 */
export function validateShareLink(link: string): {
  valid: boolean
  templateId?: string
  error?: string
} {
  try {
    const url = new URL(link)

    // 提取模板 ID
    const pathMatch = url.pathname.match(/\/share\/(\w+)/)
    if (!pathMatch) {
      return { valid: false, error: '无效的分享链接格式' }
    }

    const templateId = pathMatch[1]

    // 检查是否过期
    const expiresParam = url.searchParams.get('expires')
    if (expiresParam) {
      const expiresAt = parseInt(expiresParam, 10)
      if (Date.now() > expiresAt) {
        return { valid: false, templateId, error: '分享链接已过期' }
      }
    }

    return { valid: true, templateId }
  } catch (error) {
    return { valid: false, error: '无效的 URL' }
  }
}

/**
 * XML 转义
 * @param text 文本
 * @returns 转义后的文本
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default {
  generateShareLink,
  generateEmbedCode,
  exportTemplateAsImage,
  exportTemplateAsSvg,
  copyToClipboard,
  downloadFile,
  validateShareLink,
}
