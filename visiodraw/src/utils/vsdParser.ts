/**
 * Visio VSD (二进制) 文件解析器
 * VSD是Visio 2003及更早版本使用的二进制格式
 * 
 * 注意：VSD是复杂的二进制格式，完整解析需要大量工作。
 * 这里提供一个基础框架，实际使用时建议转换为VSDX格式。
 */

import { VsdxShape, VsdxPage, VsdxDocument } from './vsdxParser'

/**
 * VSD文件头信息
 */
interface VsdHeader {
  signature: string
  version: number
  isCompoundFile: boolean
}

/**
 * 检测文件是否为VSD格式
 * @param arrayBuffer 文件内容
 * @returns 是否为VSD格式
 */
export function isVsdFormat(arrayBuffer: ArrayBuffer): boolean {
  const view = new DataView(arrayBuffer)
  
  // 检查OLE复合文件签名
  // VSD文件通常是OLE复合文档格式
  const oleSignature = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]
  let isOle = true
  for (let i = 0; i < oleSignature.length; i++) {
    if (view.getUint8(i) !== oleSignature[i]) {
      isOle = false
      break
    }
  }
  
  if (isOle) return true
  
  // 检查旧的VSD格式签名
  const signature = view.getUint32(0, true)
  return signature === 0x0000ABCD || signature === 0x0000BEEF
}

/**
 * 读取VSD文件头
 */
function readVsdHeader(arrayBuffer: ArrayBuffer): VsdHeader {
  const view = new DataView(arrayBuffer)
  
  // 检查OLE签名
  const oleSignature = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]
  let isCompoundFile = true
  for (let i = 0; i < oleSignature.length; i++) {
    if (view.getUint8(i) !== oleSignature[i]) {
      isCompoundFile = false
      break
    }
  }
  
  return {
    signature: isCompoundFile ? 'OLE' : 'VSD',
    version: 0,
    isCompoundFile,
  }
}

/**
 * 解析VSD文件
 * 
 * 注意：这是一个简化实现。完整的VSD解析非常复杂，
 * 建议用户将VSD文件转换为VSDX格式后使用。
 * 
 * @param arrayBuffer VSD文件的ArrayBuffer
 * @returns 解析后的文档对象或null
 */
export async function parseVsd(arrayBuffer: ArrayBuffer): Promise<VsdxDocument | null> {
  const header = readVsdHeader(arrayBuffer)
  
  if (!header.isCompoundFile) {
    console.warn('不支持的VSD格式')
    return null
  }
  
  console.log('检测到OLE复合文件格式的VSD文件')
  console.log('建议：请将文件转换为VSDX格式以获得最佳兼容性')
  
  // OLE复合文件解析非常复杂，这里提供一个基础框架
  // 实际实现需要使用专门的OLE解析库
  
  try {
    // 尝试提取文本内容
    const text = extractTextFromVsd(arrayBuffer)
    
    if (text) {
      console.log('从VSD文件提取到文本内容')
    }
    
    // 返回一个空文档，提示用户转换格式
    return {
      pages: [{
        id: '1',
        name: 'Page 1',
        width: 8.5,
        height: 11,
        shapes: [{
          id: 'warning',
          type: 'text',
          x: 100,
          y: 100,
          width: 400,
          height: 100,
          fill: '#fff7e6',
          stroke: '#fa8c16',
          strokeWidth: 2,
          text: '提示：VSD格式支持有限\n建议转换为VSDX格式',
        }],
      }],
      masters: [],
      themes: [],
    }
  } catch (error) {
    console.error('解析VSD文件失败:', error)
    return null
  }
}

/**
 * 从VSD文件中提取文本
 * 这是一个简化的实现，仅提取可读的文本内容
 */
function extractTextFromVsd(arrayBuffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(arrayBuffer)
  let text = ''
  
  // 查找可打印字符序列
  let currentText = ''
  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i]
    // 可打印ASCII字符
    if (byte >= 32 && byte <= 126) {
      currentText += String.fromCharCode(byte)
    } else if (byte === 0 && currentText.length > 3) {
      // 遇到空字符且当前文本足够长
      if (currentText.length > text.length) {
        text = currentText
      }
      currentText = ''
    } else {
      currentText = ''
    }
  }
  
  return text.length > 10 ? text : null
}

/**
 * 尝试将VSD转换为VSDX
 * 注意：这需要服务器端支持或第三方库
 */
export async function convertVsdToVsdx(arrayBuffer: ArrayBuffer): Promise<ArrayBuffer | null> {
  console.warn('VSD到VSDX的转换需要服务器端支持')
  console.warn('建议：使用Microsoft Visio或在线转换工具')
  
  // 这里可以集成第三方转换服务
  // 例如：Microsoft Graph API、CloudConvert等
  
  return null
}

/**
 * 获取VSD文件信息
 */
export function getVsdInfo(arrayBuffer: ArrayBuffer): {
  format: string
  version: string
  isSupported: boolean
} {
  const header = readVsdHeader(arrayBuffer)
  
  if (header.isCompoundFile) {
    return {
      format: 'VSD (OLE Compound)',
      version: '2003-2010',
      isSupported: false,
    }
  }
  
  return {
    format: 'VSD (Legacy)',
    version: 'Unknown',
    isSupported: false,
  }
}
