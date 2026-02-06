/**
 * Visio 模具(VSSX)和模板(VSTX)支持
 * 
 * VSSX - Visio Stencil (模具文件，包含可复用图形)
 * VSTX - Visio Template (模板文件，包含预设页面和样式)
 */

import JSZip from 'jszip'
import { parseVisioDocument } from './vsdxParser'

/**
 * 模具图形定义
 */
export interface StencilShape {
  id: string
  name: string
  icon?: string
  width: number
  height: number
  svgContent?: string
  vsdxContent?: string
}

/**
 * 模具定义
 */
export interface Stencil {
  id: string
  name: string
  description?: string
  shapes: StencilShape[]
  category?: string
}

/**
 * 模板页面定义
 */
export interface TemplatePage {
  id: string
  name: string
  width: number
  height: string
  background?: string
}

/**
 * Visio模板定义
 */
export interface VisioTemplate {
  id: string
  name: string
  description?: string
  pages: TemplatePage[]
  styles: Record<string, any>
  themes?: any[]
}

/**
 * 解析VSSX模具文件
 * @param arrayBuffer VSSX文件的ArrayBuffer
 * @returns 解析后的模具对象
 */
export async function parseVssx(arrayBuffer: ArrayBuffer): Promise<Stencil | null> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer)
    
    // 读取文档属性
    const docPropsXml = await zip.file('docProps/core.xml')?.async('text')
    const name = extractTitleFromCoreXml(docPropsXml) || '未命名模具'
    
    // 读取模具内容
    const stencils: StencilShape[] = []
    
    // 遍历masters文件夹
    const masterFiles = Object.keys(zip.files).filter(
      path => path.startsWith('visio/masters/') && path.endsWith('.xml')
    )
    
    for (const masterPath of masterFiles) {
      const masterXml = await zip.file(masterPath)?.async('text')
      if (masterXml) {
        const shape = parseMasterShape(masterXml, masterPath)
        if (shape) {
          stencils.push(shape)
        }
      }
    }
    
    // 如果没有找到masters，尝试从document解析
    if (stencils.length === 0) {
      const documentXml = await zip.file('visio/document.xml')?.async('text')
      if (documentXml) {
        const docStencils = parseDocumentStencils(documentXml)
        stencils.push(...docStencils)
      }
    }
    
    return {
      id: `stencil-${Date.now()}`,
      name,
      description: `包含 ${stencils.length} 个图形`,
      shapes: stencils,
      category: 'custom',
    }
  } catch (error) {
    console.error('解析VSSX文件失败:', error)
    return null
  }
}

/**
 * 解析VSTX模板文件
 * @param arrayBuffer VSTX文件的ArrayBuffer
 * @returns 解析后的模板对象
 */
export async function parseVstx(arrayBuffer: ArrayBuffer): Promise<VisioTemplate | null> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer)
    
    // 读取文档属性
    const docPropsXml = await zip.file('docProps/core.xml')?.async('text')
    const name = extractTitleFromCoreXml(docPropsXml) || '未命名模板'
    
    // 读取页面信息
    const pages: TemplatePage[] = []
    const pagesXml = await zip.file('visio/pages.xml')?.async('text')
    
    if (pagesXml) {
      const pageRefs = parsePageReferences(pagesXml)
      
      for (const pageRef of pageRefs) {
        const pageXml = await zip.file(`visio/pages/${pageRef.id}.xml`)?.async('text')
        if (pageXml) {
          const page = parsePageInfo(pageXml, pageRef.name)
          if (page) {
            pages.push(page)
          }
        }
      }
    }
    
    // 读取样式信息
    const styles: Record<string, any> = {}
    const stylesXml = await zip.file('visio/styles.xml')?.async('text')
    if (stylesXml) {
      Object.assign(styles, parseStyles(stylesXml))
    }
    
    return {
      id: `template-${Date.now()}`,
      name,
      description: `包含 ${pages.length} 个页面`,
      pages,
      styles,
    }
  } catch (error) {
    console.error('解析VSTX文件失败:', error)
    return null
  }
}

/**
 * 从core.xml提取标题
 */
function extractTitleFromCoreXml(xml?: string): string | null {
  if (!xml) return null
  
  const titleMatch = xml.match(/<dc:title>([^<]*)<\/dc:title>/)
  return titleMatch?.[1] || null
}

/**
 * 解析Master图形
 */
function parseMasterShape(xml: string, path: string): StencilShape | null {
  try {
    // 提取ID和名称
    const idMatch = xml.match(/ID="([^"]+)"/)
    const nameMatch = xml.match(/NameU="([^"]+)"/) || xml.match(/Name="([^"]+)"/)
    
    const id = idMatch?.[1] || `shape-${Date.now()}`
    const name = nameMatch?.[1] || '未命名图形'
    
    // 尝试提取尺寸信息
    let width = 100
    let height = 100
    
    const widthMatch = xml.match(/<Cell[^>]*N="Width"[^>]*V="([^"]+)"/)
    const heightMatch = xml.match(/<Cell[^>]*N="Height"[^>]*V="([^"]+)"/)
    
    if (widthMatch) {
      width = parseFloat(widthMatch[1]) * 25.4 // 转换为像素近似值
    }
    if (heightMatch) {
      height = parseFloat(heightMatch[1]) * 25.4
    }
    
    return {
      id,
      name,
      width,
      height,
      vsdxContent: xml,
    }
  } catch (error) {
    console.error('解析Master图形失败:', error)
    return null
  }
}

/**
 * 从document.xml解析模具
 */
function parseDocumentStencils(xml: string): StencilShape[] {
  const stencils: StencilShape[] = []
  
  // 简单解析Shapes
  const shapeRegex = /<Shape[^>]*ID="([^"]+)"[^>]*>/g
  let match
  
  while ((match = shapeRegex.exec(xml)) !== null) {
    const id = match[1]
    const nameMatch = xml.substring(match.index, match.index + 500).match(/NameU="([^"]+)"/)
    
    stencils.push({
      id,
      name: nameMatch?.[1] || `Shape ${id}`,
      width: 100,
      height: 100,
    })
  }
  
  return stencils
}

/**
 * 解析页面引用
 */
function parsePageReferences(xml: string): Array<{ id: string; name: string }> {
  const pages: Array<{ id: string; name: string }> = []
  
  const pageRegex = /<Page[^>]*ID="([^"]+)"[^>]*>/g
  let match
  
  while ((match = pageRegex.exec(xml)) !== null) {
    const id = match[1]
    const nameMatch = xml.substring(match.index, match.index + 500).match(/NameU="([^"]+)"/)
    pages.push({
      id,
      name: nameMatch?.[1] || `Page ${id}`,
    })
  }
  
  return pages
}

/**
 * 解析页面信息
 */
function parsePageInfo(xml: string, name: string): TemplatePage | null {
  try {
    let width = 8.5
    let height = 11
    
    const widthMatch = xml.match(/<Cell[^>]*N="PageWidth"[^>]*V="([^"]+)"/)
    const heightMatch = xml.match(/<Cell[^>]*N="PageHeight"[^>]*V="([^"]+)"/)
    
    if (widthMatch) {
      width = parseFloat(widthMatch[1])
    }
    if (heightMatch) {
      height = parseFloat(heightMatch[1])
    }
    
    return {
      id: `page-${Date.now()}`,
      name,
      width,
      height: `${height}in`,
    }
  } catch (error) {
    return null
  }
}

/**
 * 解析样式信息
 */
function parseStyles(xml: string): Record<string, any> {
  const styles: Record<string, any> = {}
  
  // 简单提取样式名称
  const styleRegex = /<StyleSheet[^>]*ID="([^"]+)"[^>]*>/g
  let match
  
  while ((match = styleRegex.exec(xml)) !== null) {
    const id = match[1]
    const nameMatch = xml.substring(match.index, match.index + 300).match(/NameU="([^"]+)"/)
    
    if (nameMatch) {
      styles[id] = { name: nameMatch[1] }
    }
  }
  
  return styles
}

/**
 * 检测文件类型
 */
export function detectVisioStencilType(filename: string): 'vssx' | 'vstx' | 'unknown' {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'vssx') return 'vssx'
  if (ext === 'vstx') return 'vstx'
  return 'unknown'
}

/**
 * 内置Visio模具库
 * 模拟一些常用的Visio模具
 */
export const builtInVisioStencils: Stencil[] = [
  {
    id: 'basic-flowchart',
    name: '基本流程图形状',
    category: 'flowchart',
    description: 'Visio标准流程图形状',
    shapes: [
      { id: 'process', name: '流程', width: 120, height: 60 },
      { id: 'decision', name: '判定', width: 100, height: 100 },
      { id: 'start', name: '开始/结束', width: 120, height: 60 },
      { id: 'document', name: '文档', width: 120, height: 90 },
      { id: 'data', name: '数据', width: 120, height: 80 },
      { id: 'terminator', name: '终结符', width: 120, height: 60 },
    ],
  },
  {
    id: 'basic-shapes',
    name: '基本形状',
    category: 'basic',
    description: '常用基本几何形状',
    shapes: [
      { id: 'rectangle', name: '矩形', width: 100, height: 80 },
      { id: 'ellipse', name: '椭圆', width: 100, height: 80 },
      { id: 'triangle', name: '三角形', width: 100, height: 100 },
      { id: 'diamond', name: '菱形', width: 100, height: 100 },
      { id: 'pentagon', name: '五边形', width: 100, height: 100 },
      { id: 'hexagon', name: '六边形', width: 100, height: 100 },
    ],
  },
  {
    id: 'network-equipment',
    name: '网络设备',
    category: 'network',
    description: '网络拓扑图常用设备',
    shapes: [
      { id: 'server', name: '服务器', width: 80, height: 120 },
      { id: 'router', name: '路由器', width: 100, height: 60 },
      { id: 'switch', name: '交换机', width: 100, height: 60 },
      { id: 'firewall', name: '防火墙', width: 100, height: 100 },
      { id: 'cloud', name: '云', width: 120, height: 80 },
      { id: 'workstation', name: '工作站', width: 100, height: 80 },
    ],
  },
]

/**
 * 获取所有可用模具
 */
export function getAllStencils(): Stencil[] {
  // 这里可以合并内置模具和用户导入的模具
  return [...builtInVisioStencils]
}

/**
 * 根据ID查找模具
 */
export function getStencilById(id: string): Stencil | undefined {
  return getAllStencils().find(s => s.id === id)
}

/**
 * 根据ID查找模具图形
 */
export function getStencilShape(stencilId: string, shapeId: string): StencilShape | undefined {
  const stencil = getStencilById(stencilId)
  return stencil?.shapes.find(s => s.id === shapeId)
}
