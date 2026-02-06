/**
 * 导出工具函数
 */

import { jsPDF } from 'jspdf'

/**
 * 将画布导出为PNG图片
 * @param canvas Fabric.js画布
 * @param options 导出选项
 * @returns PNG图片的DataURL
 */
export function exportToPng(
  canvas: fabric.Canvas,
  options: { quality?: number; multiplier?: number } = {}
): string {
  const { quality = 1, multiplier = 1 } = options

  return canvas.toDataURL({
    format: 'png',
    quality: quality,
    multiplier: multiplier,
  })
}

/**
 * 将画布导出为JPEG图片
 * @param canvas Fabric.js画布
 * @param options 导出选项
 * @returns JPEG图片的DataURL
 */
export function exportToJpeg(
  canvas: fabric.Canvas,
  options: { quality?: number; multiplier?: number } = {}
): string {
  const { quality = 0.8, multiplier = 1 } = options

  return canvas.toDataURL({
    format: 'jpeg',
    quality: quality,
    multiplier: multiplier,
  })
}

/**
 * 将画布导出为SVG
 * @param canvas Fabric.js画布
 * @returns SVG字符串
 */
export function exportToSvg(canvas: fabric.Canvas): string {
  return canvas.toSVG()
}

/**
 * 将画布导出为PDF
 * @param canvas Fabric.js画布
 * @param filename 文件名
 */
export function exportToPdf(canvas: fabric.Canvas, filename: string = 'export.pdf'): void {
  const dataUrl = canvas.toDataURL({
    format: 'png',
    multiplier: 2, // 提高分辨率
  })

  const img = new Image()
  img.onload = () => {
    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [img.width, img.height],
    })

    pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height)
    pdf.save(filename)
  }
  img.src = dataUrl
}

/**
 * 将画布导出为JSON
 * @param canvas Fabric.js画布
 * @returns JSON字符串
 */
export function exportToJson(canvas: fabric.Canvas): string {
  return JSON.stringify(canvas.toJSON(), null, 2)
}

/**
 * 从JSON加载画布
 * @param canvas Fabric.js画布
 * @param json JSON字符串
 */
export function loadFromJson(canvas: fabric.Canvas, json: string): void {
  canvas.loadFromJSON(json, () => {
    canvas.renderAll()
  })
}

/**
 * 下载DataURL为文件
 * @param dataUrl DataURL
 * @param filename 文件名
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
