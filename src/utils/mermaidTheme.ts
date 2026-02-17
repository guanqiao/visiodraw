/**
 * Mermaid 主题系统
 * 提供与 Mermaid 官方主题一致的颜色配置
 * 参考: https://mermaid.js.org/config/theming.html
 */

export type MermaidThemeName = 'default' | 'dark' | 'forest' | 'neutral' | 'base'

/**
 * Mermaid 主题变量定义
 */
export interface MermaidThemeVariables {
  // 基础颜色
  background: string
  primaryColor: string
  primaryTextColor: string
  primaryBorderColor: string
  lineColor: string
  secondaryColor: string
  secondaryTextColor: string
  secondaryBorderColor: string
  tertiaryColor: string
  tertiaryTextColor: string
  tertiaryBorderColor: string

  // 特殊元素
  noteBkgColor: string
  noteTextColor: string
  noteBorderColor: string

  // 文本
  textColor: string
  fontFamily: string
  fontSize: string

  // 活动图/流程图
  nodeBkg: string
  nodeBorder: string
  clusterBkg: string
  clusterBorder: string
  defaultLinkColor: string
  titleColor: string
  edgeLabelBackground: string

  // 序列图
  actorBkg: string
  actorBorder: string
  actorTextColor: string
  actorLineColor: string
  signalColor: string
  signalTextColor: string
  activationBkg: string
  activationBorder: string

  // 状态图
  labelColor: string
  altBackground: string

  // 类图
  classText: string

  // 甘特图
  sectionBkgColor: string
  altSectionBkgColor: string
  gridColor: string
  doneTaskBkgColor: string
  doneTaskBorderColor: string
  activeTaskBkgColor: string
  activeTaskBorderColor: string
  critBkgColor: string
  critBorderColor: string
  taskTextColor: string
  taskTextOutsideColor: string
  activeTaskTextColor: string
}

/**
 * 默认主题 (Default Theme)
 * Mermaid 默认主题颜色配置
 */
export const defaultTheme: MermaidThemeVariables = {
  // 基础颜色
  background: '#f4f4f4',
  primaryColor: '#fff4dd',
  primaryTextColor: '#333',
  primaryBorderColor: '#d4b46a',
  lineColor: '#666',
  secondaryColor: '#e1e1e1',
  secondaryTextColor: '#333',
  secondaryBorderColor: '#999',
  tertiaryColor: '#fff',
  tertiaryTextColor: '#333',
  tertiaryBorderColor: '#ccc',

  // 特殊元素
  noteBkgColor: '#fff5ad',
  noteTextColor: '#333',
  noteBorderColor: '#e8d665',

  // 文本
  textColor: '#333',
  fontFamily: 'trebuchet ms, verdana, arial, sans-serif',
  fontSize: '14px',

  // 活动图/流程图
  nodeBkg: '#fff4dd',
  nodeBorder: '#d4b46a',
  clusterBkg: '#fff',
  clusterBorder: '#ccc',
  defaultLinkColor: '#666',
  titleColor: '#333',
  edgeLabelBackground: '#fff',

  // 序列图
  actorBkg: '#fff4dd',
  actorBorder: '#d4b46a',
  actorTextColor: '#333',
  actorLineColor: '#d4b46a',
  signalColor: '#333',
  signalTextColor: '#333',
  activationBkg: '#e1e1e1',
  activationBorder: '#999',

  // 状态图
  labelColor: '#333',
  altBackground: '#f4f4f4',

  // 类图
  classText: '#333',

  // 甘特图
  sectionBkgColor: '#fff4dd',
  altSectionBkgColor: '#e1e1e1',
  gridColor: '#ddd',
  doneTaskBkgColor: '#bbf',
  doneTaskBorderColor: '#88f',
  activeTaskBkgColor: '#f9f',
  activeTaskBorderColor: '#f6f',
  critBkgColor: '#f88',
  critBorderColor: '#f00',
  taskTextColor: '#333',
  taskTextOutsideColor: '#333',
  activeTaskTextColor: '#333',
}

/**
 * 深色主题 (Dark Theme)
 */
export const darkTheme: MermaidThemeVariables = {
  ...defaultTheme,
  background: '#1a1a1a',
  primaryColor: '#2d2d2d',
  primaryTextColor: '#e0e0e0',
  primaryBorderColor: '#555',
  lineColor: '#888',
  secondaryColor: '#3d3d3d',
  secondaryTextColor: '#e0e0e0',
  secondaryBorderColor: '#666',
  tertiaryColor: '#4d4d4d',
  tertiaryTextColor: '#e0e0e0',
  tertiaryBorderColor: '#777',

  noteBkgColor: '#4a4a2a',
  noteTextColor: '#e0e0e0',
  noteBorderColor: '#666',

  textColor: '#e0e0e0',

  nodeBkg: '#2d2d2d',
  nodeBorder: '#555',
  clusterBkg: '#3d3d3d',
  clusterBorder: '#666',
  defaultLinkColor: '#888',
  titleColor: '#e0e0e0',
  edgeLabelBackground: '#2d2d2d',

  actorBkg: '#2d2d2d',
  actorBorder: '#555',
  actorTextColor: '#e0e0e0',
  actorLineColor: '#555',
  signalColor: '#e0e0e0',
  signalTextColor: '#e0e0e0',
  activationBkg: '#3d3d3d',
  activationBorder: '#666',

  labelColor: '#e0e0e0',
  altBackground: '#2d2d2d',

  classText: '#e0e0e0',

  sectionBkgColor: '#2d2d2d',
  altSectionBkgColor: '#3d3d3d',
  gridColor: '#555',
  doneTaskBkgColor: '#447',
  doneTaskBorderColor: '#66f',
  activeTaskBkgColor: '#636',
  activeTaskBorderColor: '#969',
  critBkgColor: '#633',
  critBorderColor: '#900',
  taskTextColor: '#e0e0e0',
  taskTextOutsideColor: '#e0e0e0',
  activeTaskTextColor: '#e0e0e0',
}

/**
 * 森林主题 (Forest Theme)
 */
export const forestTheme: MermaidThemeVariables = {
  ...defaultTheme,
  background: '#f4f9f4',
  primaryColor: '#d4edda',
  primaryTextColor: '#155724',
  primaryBorderColor: '#5cb85c',
  lineColor: '#4a7c4e',
  secondaryColor: '#c3e6cb',
  secondaryTextColor: '#155724',
  secondaryBorderColor: '#4cae4c',
  tertiaryColor: '#e8f5e9',
  tertiaryTextColor: '#155724',
  tertiaryBorderColor: '#81c784',

  noteBkgColor: '#fff3cd',
  noteTextColor: '#856404',
  noteBorderColor: '#ffc107',

  nodeBkg: '#d4edda',
  nodeBorder: '#5cb85c',
  clusterBkg: '#e8f5e9',
  clusterBorder: '#81c784',
  defaultLinkColor: '#4a7c4e',
  titleColor: '#155724',
  edgeLabelBackground: '#f4f9f4',

  actorBkg: '#d4edda',
  actorBorder: '#5cb85c',
  actorTextColor: '#155724',
  actorLineColor: '#5cb85c',
  signalColor: '#155724',
  signalTextColor: '#155724',
  activationBkg: '#c3e6cb',
  activationBorder: '#4cae4c',

  labelColor: '#155724',
  altBackground: '#e8f5e9',

  classText: '#155724',

  sectionBkgColor: '#d4edda',
  altSectionBkgColor: '#c3e6cb',
  gridColor: '#a5d6a7',
  doneTaskBkgColor: '#c3e6cb',
  doneTaskBorderColor: '#4cae4c',
  activeTaskBkgColor: '#d4edda',
  activeTaskBorderColor: '#5cb85c',
  critBkgColor: '#f8d7da',
  critBorderColor: '#dc3545',
  taskTextColor: '#155724',
  taskTextOutsideColor: '#155724',
  activeTaskTextColor: '#155724',
}

/**
 * 中性主题 (Neutral Theme)
 */
export const neutralTheme: MermaidThemeVariables = {
  ...defaultTheme,
  background: '#fafafa',
  primaryColor: '#f0f0f0',
  primaryTextColor: '#333',
  primaryBorderColor: '#999',
  lineColor: '#666',
  secondaryColor: '#e8e8e8',
  secondaryTextColor: '#333',
  secondaryBorderColor: '#888',
  tertiaryColor: '#fff',
  tertiaryTextColor: '#333',
  tertiaryBorderColor: '#bbb',

  noteBkgColor: '#f5f5f5',
  noteTextColor: '#333',
  noteBorderColor: '#ccc',

  nodeBkg: '#f0f0f0',
  nodeBorder: '#999',
  clusterBkg: '#fff',
  clusterBorder: '#bbb',
  defaultLinkColor: '#666',
  titleColor: '#333',
  edgeLabelBackground: '#fafafa',

  actorBkg: '#f0f0f0',
  actorBorder: '#999',
  actorTextColor: '#333',
  actorLineColor: '#999',
  signalColor: '#333',
  signalTextColor: '#333',
  activationBkg: '#e8e8e8',
  activationBorder: '#888',

  labelColor: '#333',
  altBackground: '#f5f5f5',

  classText: '#333',

  sectionBkgColor: '#f0f0f0',
  altSectionBkgColor: '#e8e8e8',
  gridColor: '#ddd',
  doneTaskBkgColor: '#e8e8e8',
  doneTaskBorderColor: '#888',
  activeTaskBkgColor: '#f0f0f0',
  activeTaskBorderColor: '#999',
  critBkgColor: '#ffcccc',
  critBorderColor: '#cc0000',
  taskTextColor: '#333',
  taskTextOutsideColor: '#333',
  activeTaskTextColor: '#333',
}

/**
 * 获取主题配置
 * @param themeName 主题名称
 * @returns 主题变量
 */
export function getTheme(themeName: MermaidThemeName): MermaidThemeVariables {
  switch (themeName) {
    case 'dark':
      return darkTheme
    case 'forest':
      return forestTheme
    case 'neutral':
      return neutralTheme
    case 'default':
    case 'base':
    default:
      return defaultTheme
  }
}

/**
 * 当前使用的主题
 */
let currentTheme: MermaidThemeVariables = { ...defaultTheme }

/**
 * 设置当前主题
 * @param themeName 主题名称
 */
export function setTheme(themeName: MermaidThemeName): void {
  currentTheme = getTheme(themeName)
}

/**
 * 获取当前主题
 * @returns 当前主题变量
 */
export function getCurrentTheme(): MermaidThemeVariables {
  return currentTheme
}

/**
 * 获取节点样式
 * @param type 节点类型
 * @returns 填充色和边框色
 */
export function getNodeColors(type: string): { fill: string; stroke: string; text: string } {
  const theme = getCurrentTheme()

  switch (type) {
    case 'uml-initial':
    case 'start':
      return { fill: '#52c41a', stroke: '#52c41a', text: '#fff' }
    case 'uml-final':
    case 'end':
      return { fill: '#f5222d', stroke: '#f5222d', text: '#fff' }
    case 'uml-decision':
      return { fill: '#fff7e6', stroke: '#fa8c16', text: theme.textColor }
    case 'uml-fork':
    case 'uml-join':
      return { fill: '#722ed1', stroke: '#722ed1', text: '#fff' }
    case 'uml-interface':
      return { fill: '#f6ffed', stroke: '#52c41a', text: theme.textColor }
    case 'uml-abstract-class':
      return { fill: '#fff0f6', stroke: '#eb2f96', text: theme.textColor }
    case 'uml-enum':
      return { fill: '#e6fffb', stroke: '#13c2c2', text: theme.textColor }
    case 'uml-state':
      return { fill: '#f0f5ff', stroke: '#2f54eb', text: theme.textColor }
    case 'uml-initial-state':
      return { fill: '#52c41a', stroke: '#52c41a', text: '#fff' }
    case 'uml-final-state':
      return { fill: '#f5222d', stroke: '#f5222d', text: '#fff' }
    case 'er-table-entity':
    case 'er-table-entity-with-columns':
      return { fill: '#e6f7ff', stroke: '#1890ff', text: theme.textColor }
    default:
      return {
        fill: theme.nodeBkg,
        stroke: theme.nodeBorder,
        text: theme.primaryTextColor,
      }
  }
}

/**
 * 获取边样式
 * @param style 边样式类型
 * @returns 线条颜色
 */
export function getEdgeColors(style?: string): { stroke: string; text: string } {
  const theme = getCurrentTheme()
  return {
    stroke: theme.lineColor,
    text: theme.textColor,
  }
}

/**
 * 从 Mermaid 代码中解析主题配置
 * @param code Mermaid 代码
 * @returns 主题名称
 */
export function parseThemeFromCode(code: string): MermaidThemeName {
  const themeMatch = code.match(/%%\s*theme:\s*(\w+)/i) ||
    code.match(/---\s*\nconfig:\s*\n\s*theme:\s*['"]?(\w+)['"]?/i)

  if (themeMatch) {
    const theme = themeMatch[1].toLowerCase() as MermaidThemeName
    if (['default', 'dark', 'forest', 'neutral', 'base'].includes(theme)) {
      return theme
    }
  }

  return 'default'
}
