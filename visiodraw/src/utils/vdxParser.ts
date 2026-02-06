/**
 * Visio VDX (XML) 文件解析器
 * VDX是Visio 2003-2010使用的XML格式
 */

import { VsdxShape, VsdxPage, VsdxDocument } from './vsdxParser'

/**
 * 解析VDX文件
 * @param xmlText VDX文件的XML文本
 * @returns 解析后的文档对象
 */
export async function parseVdx(xmlText: string): Promise<VsdxDocument> {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml')

  const document: VsdxDocument = {
    pages: [],
    masters: [],
    themes: [],
  }

  // 解析页面
  const pageElements = xmlDoc.querySelectorAll('Page')
  for (const pageElement of Array.from(pageElements)) {
    const page = parseVdxPage(pageElement)
    if (page) {
      document.pages.push(page)
    }
  }

  return document
}

/**
 * 解析VDX页面
 */
function parseVdxPage(pageElement: Element): VsdxPage | null {
  const id = pageElement.getAttribute('ID') || ''
  const nameElement = pageElement.querySelector('PageSheet Name')
  const name = nameElement?.textContent || `Page ${id}`

  // 获取页面尺寸
  let width = 8.5
  let height = 11

  const pageSheet = pageElement.querySelector('PageSheet')
  if (pageSheet) {
    const pageWidth = pageSheet.querySelector('PageWidth')
    const pageHeight = pageSheet.querySelector('PageHeight')
    if (pageWidth?.textContent) {
      width = parseFloat(pageWidth.textContent) || 8.5
    }
    if (pageHeight?.textContent) {
      height = parseFloat(pageHeight.textContent) || 11
    }
  }

  // 解析图形
  const shapes: VsdxShape[] = []
  const shapeElements = pageElement.querySelectorAll('Shape')

  for (const shapeElement of Array.from(shapeElements)) {
    const shape = parseVdxShape(shapeElement)
    if (shape) {
      shapes.push(shape)
    }
  }

  return {
    id,
    name,
    width,
    height,
    shapes,
  }
}

/**
 * 解析VDX图形
 */
function parseVdxShape(shapeElement: Element): VsdxShape | null {
  const id = shapeElement.getAttribute('ID') || ''
  const master = shapeElement.getAttribute('Master') || ''
  const type = master ? 'master' : 'shape'

  // 解析XForm（位置和大小）
  const xForm = shapeElement.querySelector('XForm')
  let x = 0
  let y = 0
  let width = 100
  let height = 100
  let angle = 0

  if (xForm) {
    const pinX = xForm.querySelector('PinX')
    const pinY = xForm.querySelector('PinY')
    const widthEl = xForm.querySelector('Width')
    const heightEl = xForm.querySelector('Height')
    const angleEl = xForm.querySelector('Angle')

    if (pinX?.textContent) {
      x = parseFloat(pinX.textContent) || 0
    }
    if (pinY?.textContent) {
      y = parseFloat(pinY.textContent) || 0
    }
    if (widthEl?.textContent) {
      width = parseFloat(widthEl.textContent) || 100
    }
    if (heightEl?.textContent) {
      height = parseFloat(heightEl.textContent) || 100
    }
    if (angleEl?.textContent) {
      angle = parseFloat(angleEl.textContent) || 0
    }
  }

  // 解析填充
  let fill = '#ffffff'
  const fillElement = shapeElement.querySelector('Fill')
  if (fillElement) {
    const fillForegnd = fillElement.querySelector('FillForegnd')
    if (fillForegnd?.textContent) {
      fill = parseVdxColor(fillForegnd.textContent)
    }
  }

  // 解析线条
  let stroke = '#333333'
  let strokeWidth = 1
  const lineElement = shapeElement.querySelector('Line')
  if (lineElement) {
    const lineColor = lineElement.querySelector('LineColor')
    const lineWeight = lineElement.querySelector('LineWeight')
    if (lineColor?.textContent) {
      stroke = parseVdxColor(lineColor.textContent)
    }
    if (lineWeight?.textContent) {
      strokeWidth = parseFloat(lineWeight.textContent) || 1
    }
  }

  // 解析文本
  let text = ''
  const textElement = shapeElement.querySelector('Text')
  if (textElement?.textContent) {
    text = textElement.textContent.trim()
  }

  return {
    id,
    type,
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    text,
    angle: angle * (180 / Math.PI),
  }
}

/**
 * 解析VDX颜色值
 * VDX使用RGB(r,g,b)格式或索引格式
 */
function parseVdxColor(colorValue: string): string {
  // 处理RGB格式
  const rgbMatch = colorValue.match(/RGB\((\d+),\s*(\d+),\s*(\d+)\)/i)
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0')
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0')
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }

  // 处理十六进制格式
  if (colorValue.startsWith('#')) {
    return colorValue
  }

  // 处理数字索引（Visio颜色表）
  const colorIndex = parseInt(colorValue)
  if (!isNaN(colorIndex)) {
    return getVisioColorByIndex(colorIndex)
  }

  return '#ffffff'
}

/**
 * 根据Visio颜色索引获取颜色
 */
function getVisioColorByIndex(index: number): string {
  const visioColors: Record<number, string> = {
    0: '#000000', // 黑色
    1: '#ffffff', // 白色
    2: '#ff0000', // 红色
    3: '#00ff00', // 绿色
    4: '#0000ff', // 蓝色
    5: '#ffff00', // 黄色
    6: '#ff00ff', // 品红
    7: '#00ffff', // 青色
    8: '#800000', // 深红
    9: '#008000', // 深绿
    10: '#000080', // 深蓝
    11: '#808000', // 橄榄色
    12: '#800080', // 紫色
    13: '#008080', // 蓝绿
    14: '#c0c0c0', // 银色
    15: '#808080', // 灰色
  }

  return visioColors[index] || '#ffffff'
}

/**
 * 检测文件是否为VDX格式
 * @param content 文件内容
 * @returns 是否为VDX格式
 */
export function isVdxFormat(content: string): boolean {
  return content.includes('<?xml') && content.includes('VisioDocument')
}
