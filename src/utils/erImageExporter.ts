import type { Graph } from '@antv/x6'

export interface ImageExportOptions {
  backgroundColor?: string
  padding?: number
  quality?: number
  scale?: number
  includeGrid?: boolean
}

const defaultExportOptions: ImageExportOptions = {
  backgroundColor: '#ffffff',
  padding: 20,
  quality: 1,
  scale: 2,
  includeGrid: false,
}

export async function exportToPNG(
  graph: Graph,
  options: ImageExportOptions = {}
): Promise<Blob> {
  const opts = { ...defaultExportOptions, ...options }
  
  const svgElement = graph.container.querySelector('svg')
  if (!svgElement) {
    throw new Error('无法找到SVG元素')
  }

  const contentBBox = graph.getContentBBox()
  const padding = opts.padding || 20
  
  const width = contentBBox.width + padding * 2
  const height = contentBBox.height + padding * 2

  const clonedSvg = svgElement.cloneNode(true) as SVGElement
  
  clonedSvg.setAttribute('width', String(width * (opts.scale || 2)))
  clonedSvg.setAttribute('height', String(height * (opts.scale || 2)))
  clonedSvg.setAttribute('viewBox', `${contentBBox.x - padding} ${contentBBox.y - padding} ${width} ${height}`)
  
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bgRect.setAttribute('x', String(contentBBox.x - padding))
  bgRect.setAttribute('y', String(contentBBox.y - padding))
  bgRect.setAttribute('width', String(width))
  bgRect.setAttribute('height', String(height))
  bgRect.setAttribute('fill', opts.backgroundColor || '#ffffff')
  clonedSvg.insertBefore(bgRect, clonedSvg.firstChild)

  const svgData = new XMLSerializer().serializeToString(clonedSvg)
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width * (opts.scale || 2)
      canvas.height = height * (opts.scale || 2)
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法获取Canvas上下文'))
        return
      }
      
      ctx.fillStyle = opts.backgroundColor || '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      
      URL.revokeObjectURL(svgUrl)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('PNG生成失败'))
          }
        },
        'image/png',
        opts.quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl)
      reject(new Error('SVG加载失败'))
    }
    
    img.src = svgUrl
  })
}

export async function exportToSVG(
  graph: Graph,
  options: ImageExportOptions = {}
): Promise<string> {
  const opts = { ...defaultExportOptions, ...options }
  
  const svgElement = graph.container.querySelector('svg')
  if (!svgElement) {
    throw new Error('无法找到SVG元素')
  }

  const contentBBox = graph.getContentBBox()
  const padding = opts.padding || 20
  
  const width = contentBBox.width + padding * 2
  const height = contentBBox.height + padding * 2

  const clonedSvg = svgElement.cloneNode(true) as SVGElement
  
  clonedSvg.setAttribute('width', String(width))
  clonedSvg.setAttribute('height', String(height))
  clonedSvg.setAttribute('viewBox', `${contentBBox.x - padding} ${contentBBox.y - padding} ${width} ${height}`)
  
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bgRect.setAttribute('x', String(contentBBox.x - padding))
  bgRect.setAttribute('y', String(contentBBox.y - padding))
  bgRect.setAttribute('width', String(width))
  bgRect.setAttribute('height', String(height))
  bgRect.setAttribute('fill', opts.backgroundColor || '#ffffff')
  clonedSvg.insertBefore(bgRect, clonedSvg.firstChild)

  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  
  const styleContent = generateStyleContent()
  const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  styleElement.textContent = styleContent
  clonedSvg.insertBefore(styleElement, clonedSvg.firstChild)

  return new XMLSerializer().serializeToString(clonedSvg)
}

function generateStyleContent(): string {
  return `
    .x6-node text {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .x6-edge path {
      fill: none;
    }
  `
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadSVG(svgContent: string, filename: string): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, filename)
}

export async function exportErDiagramAsPNG(
  graph: Graph,
  filename: string = 'er-diagram.png',
  options: ImageExportOptions = {}
): Promise<void> {
  const blob = await exportToPNG(graph, options)
  downloadBlob(blob, filename)
}

export async function exportErDiagramAsSVG(
  graph: Graph,
  filename: string = 'er-diagram.svg',
  options: ImageExportOptions = {}
): Promise<void> {
  const svgContent = await exportToSVG(graph, options)
  downloadSVG(svgContent, filename)
}

export function getImageDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export interface ErDiagramExportResult {
  png?: Blob
  svg?: string
  pngDataUrl?: string
}

export async function exportErDiagram(
  graph: Graph,
  formats: ('png' | 'svg')[] = ['png', 'svg'],
  options: ImageExportOptions = {}
): Promise<ErDiagramExportResult> {
  const result: ErDiagramExportResult = {}
  
  if (formats.includes('png')) {
    result.png = await exportToPNG(graph, options)
    result.pngDataUrl = await getImageDataUrl(result.png)
  }
  
  if (formats.includes('svg')) {
    result.svg = await exportToSVG(graph, options)
  }
  
  return result
}
