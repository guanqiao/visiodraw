export type MermaidThemeName = 'default' | 'dark' | 'forest' | 'neutral' | 'base'

export interface MermaidThemeVariables {
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

  noteBkgColor: string
  noteTextColor: string
  noteBorderColor: string

  textColor: string
  fontFamily: string
  fontSize: string

  nodeBkg: string
  nodeBorder: string
  clusterBkg: string
  clusterBorder: string
  defaultLinkColor: string
  titleColor: string
  edgeLabelBackground: string

  actorBkg: string
  actorBorder: string
  actorTextColor: string
  actorLineColor: string
  signalColor: string
  signalTextColor: string
  activationBkg: string
  activationBorder: string

  labelColor: string
  altBackground: string

  classText: string

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

export const defaultTheme: MermaidThemeVariables = {
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

  noteBkgColor: '#fff5ad',
  noteTextColor: '#333',
  noteBorderColor: '#e8d665',

  textColor: '#333',
  fontFamily: '"trebuchet ms", verdana, arial, sans-serif',
  fontSize: '14px',

  nodeBkg: '#fff4dd',
  nodeBorder: '#d4b46a',
  clusterBkg: '#fff',
  clusterBorder: '#ccc',
  defaultLinkColor: '#666',
  titleColor: '#333',
  edgeLabelBackground: '#eee',

  actorBkg: '#fff4dd',
  actorBorder: '#d4b46a',
  actorTextColor: '#333',
  actorLineColor: '#d4b46a',
  signalColor: '#333',
  signalTextColor: '#333',
  activationBkg: '#e1e1e1',
  activationBorder: '#999',

  labelColor: '#333',
  altBackground: '#f4f4f4',

  classText: '#333',

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

let currentTheme: MermaidThemeVariables = { ...defaultTheme }

export function setTheme(themeName: MermaidThemeName): void {
  currentTheme = getTheme(themeName)
}

export function getCurrentTheme(): MermaidThemeVariables {
  return currentTheme
}

export function getNodeColors(type: string): { fill: string; stroke: string; text: string } {
  const theme = getCurrentTheme()

  switch (type) {
    case 'uml-initial':
    case 'start':
    case 'uml-initial-state':
      return { fill: '#52c41a', stroke: '#52c41a', text: '#fff' }
    case 'uml-final':
    case 'end':
    case 'uml-final-state':
      return { fill: '#f5222d', stroke: '#f5222d', text: '#fff' }
    case 'uml-decision':
    case 'mermaid-rhombus':
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
    case 'er-table-entity':
    case 'er-table-entity-with-columns':
      return { fill: '#e6f7ff', stroke: '#1890ff', text: theme.textColor }
    case 'mermaid-stadium':
      return { fill: '#e6fffb', stroke: '#13c2c2', text: theme.textColor }
    case 'mermaid-cylinder':
      return { fill: '#f6ffed', stroke: '#52c41a', text: theme.textColor }
    case 'mermaid-hexagon':
      return { fill: '#fff2e8', stroke: '#fa8c16', text: theme.textColor }
    case 'mermaid-parallelogram-left':
    case 'mermaid-parallelogram-right':
      return { fill: '#f9f0ff', stroke: '#722ed1', text: theme.textColor }
    case 'mermaid-trapezoid-top':
    case 'mermaid-trapezoid-bottom':
      return { fill: '#fff0f6', stroke: '#eb2f96', text: theme.textColor }
    case 'mermaid-subroutine':
      return { fill: '#e6f7ff', stroke: '#1890ff', text: theme.textColor }
    case 'mermaid-double-circle':
      return { fill: '#fff7e6', stroke: '#fa8c16', text: theme.textColor }
    case 'mermaid-asymmetric':
      return { fill: '#f5f5f5', stroke: '#434343', text: theme.textColor }
    case 'mermaid-circle':
      return { fill: '#f0f5ff', stroke: '#2f54eb', text: theme.textColor }
    case 'mermaid-cloud':
      return { fill: '#f0f5ff', stroke: '#2f54eb', text: theme.textColor }
    case 'mermaid-banner':
      return { fill: '#fff4dd', stroke: '#d4b46a', text: theme.textColor }
    case 'mermaid-document':
      return { fill: '#fffbe6', stroke: '#fadb14', text: theme.textColor }
    case 'mermaid-delay':
      return { fill: '#f6ffed', stroke: '#52c41a', text: theme.textColor }
    case 'mermaid-lightning':
      return { fill: '#fff7e6', stroke: '#fa8c16', text: theme.textColor }
    case 'mermaid-lean-left':
    case 'mermaid-lean-right':
      return { fill: '#f9f0ff', stroke: '#722ed1', text: theme.textColor }
    case 'mermaid-divided-rect':
      return { fill: '#e6f7ff', stroke: '#1890ff', text: theme.textColor }
    case 'mermaid-lined-document':
      return { fill: '#fffbe6', stroke: '#fadb14', text: theme.textColor }
    case 'mermaid-stadium-end':
      return { fill: '#e6fffb', stroke: '#13c2c2', text: theme.textColor }
    case 'mermaid-label-rect':
      return { fill: '#f0f5ff', stroke: '#2f54eb', text: theme.textColor }
    case 'uml-class':
      return { fill: theme.nodeBkg, stroke: theme.nodeBorder, text: theme.textColor }
    case 'uml-lifeline':
      return { fill: theme.actorBkg, stroke: theme.actorBorder, text: theme.textColor }
    case 'uml-activation':
      return { fill: theme.activationBkg, stroke: theme.activationBorder, text: theme.textColor }
    case 'uml-note':
      return { fill: theme.noteBkgColor, stroke: theme.noteBorderColor, text: theme.noteTextColor }
    case 'uml-action':
    default:
      return {
        fill: theme.nodeBkg,
        stroke: theme.nodeBorder,
        text: theme.primaryTextColor,
      }
  }
}

export function getEdgeColors(style?: string): { stroke: string; text: string } {
  const theme = getCurrentTheme()
  return {
    stroke: theme.defaultLinkColor,
    text: theme.textColor,
  }
}

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
