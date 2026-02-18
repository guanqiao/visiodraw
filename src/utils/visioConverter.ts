import type { Template } from '../types/template'
import type { Shape } from '../types/shape'
import type { Connector } from '../types/connector'

// Visio 文件大小限制 (10MB)
const MAX_VSDX_SIZE = 10 * 1024 * 1024

// Visio 形状类型到我们的形状类型映射
const shapeTypeMapping: Record<string, string> = {
  Rectangle: 'rectangle',
  Ellipse: 'ellipse',
  Diamond: 'decision',
  Parallelogram: 'input-output',
  'Start/End': 'start-end',
  Circle: 'ellipse',
  Square: 'rectangle',
  'Rounded Rectangle': 'rectangle',
  Hexagon: 'hexagon',
  Cloud: 'cloud',
  Cylinder: 'cylinder',
  Document: 'document',
  Database: 'cylinder',
  Server: 'server',
  Computer: 'computer',
  Network: 'network',
  Process: 'rectangle',
  Decision: 'decision',
  Terminator: 'start-end',
  Data: 'input-output',
  PredefinedProcess: 'rectangle',
  Preparation: 'hexagon',
  ManualInput: 'input-output',
  ManualOperation: 'trapezoid',
  OffPageConnector: 'circle',
  Or: 'diamond',
  SummingJunction: 'circle',
  Merge: 'merge',
  Collate: 'collate',
  Sort: 'sort',
  Extract: 'extract',
  StoredData: 'stored-data',
  SequentialAccess: 'sequential-access',
  MagneticDisk: 'magnetic-disk',
  DirectAccessStorage: 'direct-access',
  Display: 'display',
  Delay: 'delay',
}

// Visio 颜色映射（Visio 使用 RGB 整数，我们需要转换为十六进制）
function visioColorToHex(visioColor: number | string): string {
  if (typeof visioColor === 'string') {
    if (visioColor.startsWith('#')) return visioColor
    // 尝试解析 RGB 字符串
    const rgbMatch = visioColor.match(/RGB\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10)
      const g = parseInt(rgbMatch[2], 10)
      const b = parseInt(rgbMatch[3], 10)
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
    return visioColor
  }

  // Visio 颜色是整数格式
  const r = (visioColor >> 16) & 0xff
  const g = (visioColor >> 8) & 0xff
  const b = visioColor & 0xff

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 验证 Visio 文件
export function validateVisioFile(file: File): { valid: boolean; error?: string } {
  // 检查文件扩展名
  if (!file.name.toLowerCase().endsWith('.vsdx')) {
    return { valid: false, error: '文件格式错误，仅支持 .vsdx 文件' }
  }

  // 检查文件大小
  if (file.size > MAX_VSDX_SIZE) {
    return { valid: false, error: `文件过大，最大支持 ${MAX_VSDX_SIZE / 1024 / 1024}MB` }
  }

  // 检查文件是否为空
  if (file.size === 0) {
    return { valid: false, error: '文件为空' }
  }

  return { valid: true }
}

// 获取 Visio 形状类型映射
export function getVisioShapeMapping(visioType: string): string {
  return shapeTypeMapping[visioType] || 'rectangle'
}

// 获取 Visio 样式映射
export function getVisioStyleMapping(visioStyle: Record<string, any>): {
  fill?: string
  stroke?: string
  strokeWidth?: number
} {
  const mapped: { fill?: string; stroke?: string; strokeWidth?: number } = {}

  if (visioStyle.FillForegnd !== undefined) {
    mapped.fill = visioColorToHex(visioStyle.FillForegnd)
  }

  if (visioStyle.LineColor !== undefined) {
    mapped.stroke = visioColorToHex(visioStyle.LineColor)
  }

  if (visioStyle.LineWeight !== undefined) {
    // Visio 线宽通常是 pt 单位
    const weightStr = String(visioStyle.LineWeight)
    const match = weightStr.match(/([\d.]+)/)
    if (match) {
      mapped.strokeWidth = parseFloat(match[1])
    }
  }

  return mapped
}

// 解析 Visio 文件
export async function parseVisioFile(file: File): Promise<{
  success: boolean
  pages?: any[]
  shapes?: any[]
  connectors?: any[]
  error?: string
}> {
  try {
    // 验证文件
    const validation = validateVisioFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // 检查 ZIP 文件签名 (PK)
    if (uint8Array[0] !== 0x50 || uint8Array[1] !== 0x4b) {
      return { success: false, error: '无效的文件格式，不是有效的 .vsdx 文件' }
    }

    // 由于浏览器环境限制，我们使用简化的解析
    // 实际项目中可以使用 JSZip 库来完整解析
    const result = await parseVsdxSimplified(uint8Array)

    return {
      success: true,
      pages: result.pages,
      shapes: result.shapes,
      connectors: result.connectors,
    }
  } catch (error) {
    console.error('解析 Visio 文件失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '解析文件时发生未知错误',
    }
  }
}

// 简化的 VSDX 解析（实际项目中应使用完整的 XML 解析）
async function parseVsdxSimplified(uint8Array: Uint8Array): Promise<{
  pages: any[]
  shapes: any[]
  connectors: any[]
}> {
  // 将 Uint8Array 转换为字符串进行简单解析
  const decoder = new TextDecoder('utf-8')
  const content = decoder.decode(uint8Array)

  const shapes: any[] = []
  const connectors: any[] = []
  const pages: any[] = []

  // 简单的 XML 提取逻辑
  // 注意：这是简化版本，实际应使用完整的 XML 解析器
  try {
    // 提取页面信息
    const pageMatches = content.match(/<Page[\s\S]*?<\/Page>/g)
    if (pageMatches) {
      pageMatches.forEach((pageXml, index) => {
        pages.push({
          id: `page-${index + 1}`,
          name: `Page ${index + 1}`,
        })
      })
    }

    // 提取形状信息（简化解析）
    const shapeMatches = content.match(/<Shape[\s\S]*?<\/Shape>/g)
    if (shapeMatches) {
      shapeMatches.forEach((shapeXml, index) => {
        const id = extractXmlAttribute(shapeXml, 'ID') || `shape-${index + 1}`
        const type = extractXmlAttribute(shapeXml, 'Type') || 'Rectangle'
        const text = extractXmlContent(shapeXml, 'Text') || ''

        // 提取位置和尺寸
        const xform = shapeXml.match(/<XForm>([\s\S]*?)<\/XForm>/)
        let x = 100
        let y = 100
        let width = 100
        let height = 60

        if (xform) {
          x = parseFloat(extractXmlContent(xform[1], 'PinX') || '1') * 50
          y = parseFloat(extractXmlContent(xform[1], 'PinY') || '2') * 50
          width = parseFloat(extractXmlContent(xform[1], 'Width') || '2') * 50
          height = parseFloat(extractXmlContent(xform[1], 'Height') || '1') * 50
        }

        // 提取样式
        const fillMatch = shapeXml.match(/FillForegnd="([^"]*)"/)
        const lineMatch = shapeXml.match(/LineColor="([^"]*)"/)

        shapes.push({
          id,
          type,
          x,
          y,
          width,
          height,
          text,
          style: {
            FillForegnd: fillMatch ? fillMatch[1] : undefined,
            LineColor: lineMatch ? lineMatch[1] : undefined,
          },
        })
      })
    }

    // 提取连接线信息
    const connectorMatches = content.match(/<Connect[\s\S]*?<\/Connect>/g)
    if (connectorMatches) {
      connectorMatches.forEach((connXml, index) => {
        const fromSheet = extractXmlAttribute(connXml, 'FromSheet')
        const toSheet = extractXmlAttribute(connXml, 'ToSheet')

        if (fromSheet && toSheet) {
          connectors.push({
            id: `connector-${index + 1}`,
            source: fromSheet,
            target: toSheet,
          })
        }
      })
    }
  } catch (error) {
    console.warn('解析过程中出现警告:', error)
  }

  return { pages, shapes, connectors }
}

// 提取 XML 属性
function extractXmlAttribute(xml: string, attribute: string): string | undefined {
  const match = xml.match(new RegExp(`${attribute}="([^"]*)"`))
  return match ? match[1] : undefined
}

// 提取 XML 内容
function extractXmlContent(xml: string, tag: string): string | undefined {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return match ? match[1].trim() : undefined
}

// 将 Visio 数据转换为模板
export async function convertVisioToTemplate(visioData: {
  pages?: any[]
  shapes?: any[]
  connectors?: any[]
}): Promise<Template> {
  const shapes: Shape[] = []
  const connectors: Connector[] = []

  // 转换形状
  if (visioData.shapes) {
    visioData.shapes.forEach((visioShape, index) => {
      const mappedType = getVisioShapeMapping(visioShape.type)
      const style = visioShape.style ? getVisioStyleMapping(visioShape.style) : {}

      shapes.push({
        id: visioShape.id || `shape-${index + 1}`,
        type: mappedType,
        x: visioShape.x || 100 + index * 150,
        y: visioShape.y || 100,
        width: visioShape.width || 100,
        height: visioShape.height || 60,
        fill: style.fill || '#E6F7FF',
        stroke: style.stroke || '#1890FF',
        text: visioShape.text || '',
      })
    })
  }

  // 转换连接线
  if (visioData.connectors) {
    visioData.connectors.forEach((visioConn, index) => {
      connectors.push({
        id: visioConn.id || `connector-${index + 1}`,
        sourceShapeId: visioConn.source,
        sourcePointId: 'bottom',
        targetShapeId: visioConn.target,
        targetPointId: 'top',
        style: 'orthogonal',
        lineStyle: 'solid',
        startStyle: 'none',
        endStyle: 'arrow',
        stroke: '#333333',
        strokeWidth: 2,
      })
    })
  }

  return {
    id: `visio-import-${Date.now()}`,
    name: `Visio导入-${new Date().toLocaleDateString()}`,
    description: `从 Visio 文件导入的模板，共 ${shapes.length} 个图形`,
    category: 'flowchart',
    shapes,
    connectors,
  }
}

// 将模板转换为 Visio 格式
export async function convertTemplateToVisio(template: Template): Promise<Blob> {
  // 创建简化的 VSDX 内容
  // 注意：实际项目中应使用完整的 Open XML 格式

  const visioXml = generateVisioXml(template)

  // 创建 Blob
  return new Blob([visioXml], { type: 'application/vnd.visio' })
}

// 生成 Visio XML
function generateVisioXml(template: Template): string {
  const shapesXml = template.shapes
    .map(
      (shape, index) => `
    <Shape ID="${shape.id}" Type="${mapToVisioType(shape.type)}" Master="0">
      <XForm>
        <PinX>${(shape.x / 50).toFixed(2)}</PinX>
        <PinY>${(shape.y / 50).toFixed(2)}</PinY>
        <Width>${(shape.width / 50).toFixed(2)}</Width>
        <Height>${(shape.height / 50).toFixed(2)}</Height>
      </XForm>
      <Text>${escapeXml(shape.text || '')}</Text>
      <Fill>
        <FillForegnd>${shape.fill || '#E6F7FF'}</FillForegnd>
      </Fill>
      <Line>
        <LineColor>${shape.stroke || '#1890FF'}</LineColor>
        <LineWeight>1 pt</LineWeight>
      </Line>
    </Shape>
  `
    )
    .join('\n')

  const connectorsXml = template.connectors
    .map(
      (conn, index) => `
    <Connect ID="${index + 1}" FromSheet="${conn.sourceShapeId}" ToSheet="${conn.targetShapeId}"/>
  `
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<VisioDocument xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  <DocumentSettings>
    <GlueSettings>0</GlueSettings>
    <SnapSettings>0</SnapSettings>
    <SnapExtensions>0</SnapExtensions>
    <SnapAngles>0</SnapAngles>
    <DynamicGridEnabled>0</DynamicGridEnabled>
  </DocumentSettings>
  <Pages>
    <Page ID="0" Name="Page-1">
      <PageSheet>
        <PageProps>
          <PageWidth>8.5</PageWidth>
          <PageHeight>11</PageHeight>
        </PageProps>
      </PageSheet>
      <Shapes>
        ${shapesXml}
      </Shapes>
      <Connects>
        ${connectorsXml}
      </Connects>
    </Page>
  </Pages>
</VisioDocument>`
}

// 映射我们的形状类型到 Visio 类型
function mapToVisioType(ourType: string): string {
  const reverseMapping: Record<string, string> = {
    rectangle: 'Rectangle',
    ellipse: 'Ellipse',
    decision: 'Diamond',
    'input-output': 'Parallelogram',
    'start-end': 'Ellipse',
    hexagon: 'Hexagon',
    cloud: 'Cloud',
    cylinder: 'Cylinder',
    document: 'Document',
  }

  return reverseMapping[ourType] || 'Rectangle'
}

// XML 转义
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default {
  validateVisioFile,
  parseVisioFile,
  convertVisioToTemplate,
  convertTemplateToVisio,
  getVisioShapeMapping,
  getVisioStyleMapping,
}
