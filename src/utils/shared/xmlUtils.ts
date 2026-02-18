/**
 * XML 工具函数
 */

/**
 * XML 转义
 * @param text 原始文本
 * @returns 转义后的文本
 */
export function escapeXml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * XML 反转义
 * @param text 转义后的文本
 * @returns 原始文本
 */
export function unescapeXml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

/**
 * 提取 XML 属性
 * @param xml XML 字符串
 * @param attribute 属性名
 * @returns 属性值
 */
export function extractXmlAttribute(xml: string, attribute: string): string | undefined {
  const regex = new RegExp(`${attribute}="([^"]*)"`)
  const match = xml.match(regex)
  return match ? match[1] : undefined
}

/**
 * 提取 XML 内容
 * @param xml XML 字符串
 * @param tag 标签名
 * @returns 标签内容
 */
export function extractXmlContent(xml: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`)
  const match = xml.match(regex)
  return match ? match[1].trim() : undefined
}

/**
 * 创建 XML 元素
 * @param tag 标签名
 * @param attributes 属性对象
 * @param content 内容
 * @returns XML 字符串
 */
export function createXmlElement(
  tag: string,
  attributes: Record<string, string | number> = {},
  content?: string
): string {
  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeXml(String(value))}"`)
    .join(' ')

  if (content) {
    return `<${tag}${attrs ? ' ' + attrs : ''}>${content}</${tag}>`
  }
  return `<${tag}${attrs ? ' ' + attrs : ''} />`
}

export default {
  escapeXml,
  unescapeXml,
  extractXmlAttribute,
  extractXmlContent,
  createXmlElement,
}
