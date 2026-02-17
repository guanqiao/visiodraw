export interface MermaidStyle {
  fill?: string
  stroke?: string
  strokeWidth?: number
  color?: string
  fontSize?: number
  fontWeight?: string
  fontStyle?: string
  textDecoration?: string
  opacity?: number
  strokeDasharray?: string
  rx?: number
  ry?: number
}

export interface MermaidClassDef {
  name: string
  styles: MermaidStyle
}

export interface MermaidLinkStyle {
  index: number
  stroke?: string
  strokeWidth?: number
  strokeDasharray?: string
}

export class MermaidStyleParser {
  private classDefs: Map<string, MermaidStyle> = new Map()
  private nodeStyles: Map<string, MermaidStyle> = new Map()
  private linkStyles: Map<number, MermaidLinkStyle> = new Map()

  parseClassDef(line: string): MermaidClassDef | null {
    const match = line.match(/classDef\s+(\w+)\s+(.+)/)
    if (!match) return null

    const name = match[1]
    const styleStr = match[2]
    const styles = this.parseStyleString(styleStr)

    this.classDefs.set(name, styles)
    return { name, styles }
  }

  parseStyle(line: string): { nodeId: string; styles: MermaidStyle } | null {
    const match = line.match(/style\s+(\w+)\s+(.+)/)
    if (!match) return null

    const nodeId = match[1]
    const styleStr = match[2]
    const styles = this.parseStyleString(styleStr)

    this.nodeStyles.set(nodeId, styles)
    return { nodeId, styles }
  }

  parseLinkStyle(line: string): MermaidLinkStyle | null {
    const match = line.match(/linkStyle\s+(\d+)\s+(.+)/)
    if (!match) return null

    const index = parseInt(match[1], 10)
    const styleStr = match[2]
    const styles = this.parseLinkStyleString(styleStr)

    this.linkStyles.set(index, { index, ...styles })
    return { index, ...styles }
  }

  parseClassApplication(line: string): { nodeIds: string[]; className: string } | null {
    const match = line.match(/class\s+([\w,]+)\s+(\w+)/)
    if (!match) return null

    const nodeIds = match[1].split(',').map(id => id.trim())
    const className = match[2]

    const classStyle = this.classDefs.get(className)
    if (classStyle) {
      nodeIds.forEach(nodeId => {
        this.nodeStyles.set(nodeId, classStyle)
      })
    }

    return { nodeIds, className }
  }

  private parseStyleString(styleStr: string): MermaidStyle {
    const styles: MermaidStyle = {}
    const parts = styleStr.split(',')

    parts.forEach(part => {
      const trimmed = part.trim()
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex === -1) return

      const key = trimmed.substring(0, colonIndex).trim()
      const value = trimmed.substring(colonIndex + 1).trim()

      switch (key) {
        case 'fill':
        case 'stroke':
          styles[key] = value
          break
        case 'stroke-width':
          styles.strokeWidth = parseFloat(value)
          break
        case 'color':
          styles.color = value
          break
        case 'font-size':
          styles.fontSize = parseFloat(value)
          break
        case 'font-weight':
          styles.fontWeight = value
          break
        case 'font-style':
          styles.fontStyle = value
          break
        case 'text-decoration':
          styles.textDecoration = value
          break
        case 'opacity':
          styles.opacity = parseFloat(value)
          break
        case 'stroke-dasharray':
          styles.strokeDasharray = value
          break
        case 'rx':
          styles.rx = parseFloat(value)
          break
        case 'ry':
          styles.ry = parseFloat(value)
          break
      }
    })

    return styles
  }

  private parseLinkStyleString(styleStr: string): Omit<MermaidLinkStyle, 'index'> {
    const styles: Omit<MermaidLinkStyle, 'index'> = {}
    const parts = styleStr.split(',')

    parts.forEach(part => {
      const trimmed = part.trim()
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex === -1) return

      const key = trimmed.substring(0, colonIndex).trim()
      const value = trimmed.substring(colonIndex + 1).trim()

      switch (key) {
        case 'stroke':
          styles.stroke = value
          break
        case 'stroke-width':
          styles.strokeWidth = parseFloat(value)
          break
        case 'stroke-dasharray':
          styles.strokeDasharray = value
          break
      }
    })

    return styles
  }

  getNodeStyle(nodeId: string): MermaidStyle | undefined {
    return this.nodeStyles.get(nodeId)
  }

  getLinkStyle(index: number): MermaidLinkStyle | undefined {
    return this.linkStyles.get(index)
  }

  getClassDef(name: string): MermaidStyle | undefined {
    return this.classDefs.get(name)
  }

  applyNodeStyle(nodeId: string, baseStyle: MermaidStyle): MermaidStyle {
    const customStyle = this.nodeStyles.get(nodeId)
    if (!customStyle) return baseStyle

    return { ...baseStyle, ...customStyle }
  }

  applyLinkStyle(index: number, baseStyle: { stroke: string; strokeWidth: number }): { stroke: string; strokeWidth: number; strokeDasharray?: string } {
    const customStyle = this.linkStyles.get(index)
    if (!customStyle) return baseStyle

    return {
      ...baseStyle,
      ...(customStyle.stroke && { stroke: customStyle.stroke }),
      ...(customStyle.strokeWidth && { strokeWidth: customStyle.strokeWidth }),
      ...(customStyle.strokeDasharray && { strokeDasharray: customStyle.strokeDasharray }),
    }
  }

  clear(): void {
    this.classDefs.clear()
    this.nodeStyles.clear()
    this.linkStyles.clear()
  }
}

export const mermaidStyleParser = new MermaidStyleParser()

export function parseColorValue(value: string): string {
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) {
    return value
  }
  
  const namedColors: Record<string, string> = {
    'red': '#f5222d',
    'green': '#52c41a',
    'blue': '#1890ff',
    'yellow': '#fadb14',
    'orange': '#fa8c16',
    'purple': '#722ed1',
    'pink': '#eb2f96',
    'cyan': '#13c2c2',
    'gray': '#8c8c8c',
    'grey': '#8c8c8c',
    'white': '#ffffff',
    'black': '#000000',
    'transparent': 'transparent',
  }

  return namedColors[value.toLowerCase()] || value
}

export function mergeStyles(base: MermaidStyle, ...overrides: (MermaidStyle | undefined)[]): MermaidStyle {
  return overrides.reduce((acc: MermaidStyle, override) => {
    if (!override) return acc
    return { ...acc, ...override }
  }, { ...base })
}
