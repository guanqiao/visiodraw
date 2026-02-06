/**
 * 文件操作工具函数
 */

/**
 * 读取文件为ArrayBuffer
 * @param file 文件对象
 * @returns ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        resolve(e.target.result)
      } else {
        reject(new Error('读取文件失败'))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 读取文件为文本
 * @param file 文件对象
 * @returns 文本内容
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result)
      } else {
        reject(new Error('读取文件失败'))
      }
    }
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}

/**
 * 下载Blob为文件
 * @param blob Blob对象
 * @param filename 文件名
 */
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

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 扩展名（小写）
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : ''
}

/**
 * 获取文件名（不含扩展名）
 * @param filename 文件名
 * @returns 不含扩展名的文件名
 */
export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
}

/**
 * 检查文件类型是否支持
 * @param filename 文件名
 * @returns 是否支持
 */
export function isSupportedFileType(filename: string): boolean {
  const ext = getFileExtension(filename)
  const supportedExts = ['vsdx', 'vsd', 'vdx', 'json', 'vssx', 'vstx']
  return supportedExts.includes(ext)
}

/**
 * 检测Visio文件格式
 * @param arrayBuffer 文件内容
 * @returns 文件格式信息
 */
export function detectVisioFormat(arrayBuffer: ArrayBuffer): {
  format: 'vsdx' | 'vsd' | 'vdx' | 'unknown'
  isSupported: boolean
} {
  // 检查VSDX (ZIP格式)
  const view = new DataView(arrayBuffer)
  const isZip = view.getUint8(0) === 0x50 && view.getUint8(1) === 0x4B
  
  if (isZip) {
    return { format: 'vsdx', isSupported: true }
  }
  
  // 检查VSD (OLE格式)
  const oleSignature = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]
  let isOle = true
  for (let i = 0; i < oleSignature.length; i++) {
    if (view.getUint8(i) !== oleSignature[i]) {
      isOle = false
      break
    }
  }
  
  if (isOle) {
    return { format: 'vsd', isSupported: false }
  }
  
  // 检查VDX (XML格式)
  const textDecoder = new TextDecoder('utf-8')
  const firstBytes = textDecoder.decode(arrayBuffer.slice(0, 100))
  if (firstBytes.includes('<?xml') && firstBytes.includes('VisioDocument')) {
    return { format: 'vdx', isSupported: true }
  }
  
  return { format: 'unknown', isSupported: false }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
