import { calculateClassHeight, calculateEREntityHeight } from './diagramLayout'

export interface NodeSizeConfig {
  minWidth?: number
  minHeight?: number
  padding?: number
}

export function calculateNodeSize(
  type: string,
  text: string,
  config: NodeSizeConfig = {}
): { width: number; height: number } {
  const { minWidth = 80, minHeight = 40, padding = 20 } = config

  const textLines = text.split('\n')
  const maxLineLength = Math.max(...textLines.map(l => l.length))
  const textWidth = maxLineLength * 9 + padding * 2
  const textHeight = textLines.length * 18 + padding * 2

  switch (type) {
    case 'uml-initial':
    case 'uml-final':
    case 'uml-initial-state':
    case 'uml-final-state':
      return { width: 30, height: 30 }

    case 'uml-decision':
    case 'mermaid-rhombus':
      return { width: 80, height: 80 }

    case 'uml-fork':
    case 'uml-join':
      return { width: 20, height: 80 }

    case 'mermaid-stadium':
      return {
        width: Math.max(100, textWidth),
        height: Math.max(40, textHeight),
      }

    case 'mermaid-circle':
    case 'mermaid-double-circle':
      const circleSize = Math.max(40, Math.max(textWidth, textHeight))
      return { width: circleSize, height: circleSize }

    case 'mermaid-cylinder':
      return {
        width: Math.max(80, textWidth),
        height: Math.max(60, textHeight + 15),
      }

    case 'mermaid-hexagon':
      return {
        width: Math.max(100, textWidth + 20),
        height: Math.max(50, textHeight),
      }

    case 'uml-class':
    case 'uml-interface':
    case 'uml-abstract-class':
    case 'uml-enum':
      return {
        width: Math.max(140, textWidth),
        height: calculateClassHeight(text),
      }

    case 'er-table-entity':
    case 'er-table-entity-with-columns':
      return {
        width: Math.max(120, textWidth),
        height: calculateEREntityHeight(text),
      }

    case 'uml-state':
      return {
        width: Math.max(100, textWidth),
        height: Math.max(50, textHeight),
      }

    case 'uml-lifeline':
      return { width: 10, height: 300 }

    case 'uml-activation':
      return { width: 20, height: 60 }

    default:
      return {
        width: Math.max(minWidth, textWidth),
        height: Math.max(minHeight, textHeight),
      }
  }
}
