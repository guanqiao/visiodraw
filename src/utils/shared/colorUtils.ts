/**
 * 颜色工具函数
 */

/**
 * Visio 颜色转换为十六进制
 * @param visioColor Visio 颜色值（整数或RGB字符串）
 * @returns 十六进制颜色值
 */
export function visioColorToHex(visioColor: number | string): string {
  if (typeof visioColor === 'string') {
    if (visioColor.startsWith('#')) return visioColor

    // 尝试解析 RGB 字符串
    const rgbMatch = visioColor.match(/RGB\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10)
      const g = parseInt(rgbMatch[2], 10)
      const b = parseInt(rgbMatch[3], 10)
      return rgbToHex(r, g, b)
    }

    return visioColor
  }

  // Visio 颜色是整数格式 (0xRRGGBB)
  const r = (visioColor >> 16) & 0xff
  const g = (visioColor >> 8) & 0xff
  const b = visioColor & 0xff

  return rgbToHex(r, g, b)
}

/**
 * RGB 转换为十六进制
 * @param r 红色 (0-255)
 * @param g 绿色 (0-255)
 * @param b 蓝色 (0-255)
 * @returns 十六进制颜色值
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * 十六进制转换为 RGB
 * @param hex 十六进制颜色值
 * @returns RGB 对象
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * 调整颜色亮度
 * @param color 十六进制颜色值
 * @param amount 调整量 (-1 到 1)
 * @returns 调整后的颜色值
 */
export function adjustBrightness(color: string, amount: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) return color

  const clamp = (value: number) => Math.max(0, Math.min(255, value))

  return rgbToHex(
    clamp(rgb.r + Math.round(255 * amount)),
    clamp(rgb.g + Math.round(255 * amount)),
    clamp(rgb.b + Math.round(255 * amount))
  )
}

/**
 * 获取对比文本颜色（黑或白）
 * @param backgroundColor 背景色
 * @returns 适合的文本颜色
 */
export function getContrastTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return '#333333'

  // 计算亮度
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255

  return luminance > 0.5 ? '#333333' : '#ffffff'
}

/**
 * 混合两种颜色
 * @param color1 颜色1
 * @param color2 颜色2
 * @param ratio 混合比例 (0-1)
 * @returns 混合后的颜色
 */
export function blendColors(color1: string, color2: string, ratio: number): string {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) return color1

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio)
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio)
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio)

  return rgbToHex(r, g, b)
}

export default {
  visioColorToHex,
  rgbToHex,
  hexToRgb,
  adjustBrightness,
  getContrastTextColor,
  blendColors,
}
