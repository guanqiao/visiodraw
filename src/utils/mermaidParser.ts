import type { DiagramType, MermaidParseResult } from '../types/diagramTemplate'
import { setTheme, parseThemeFromCode } from './mermaidTheme'
import {
  parseActivityDiagram,
  parseSequenceDiagram,
  parseStateDiagram,
  parseErDiagram,
  parseClassDiagram,
  parseGanttDiagram,
  parseMindmapDiagram,
  parseTimelineDiagram,
  parseGitgraphDiagram,
  parsePieDiagram,
  parseJourneyDiagram,
  parseRequirementDiagram,
  parseC4Diagram,
  parseXYChartDiagram,
  parseBlockDiagram,
  createNode,
  getEdgeStyle,
  getNodeTypeFromBracket,
  parseMultiChainEdge,
  getRelationLabel,
  createParserContext,
  cleanLines,
  type ParserContext,
} from './parsers'

export {
  createNode,
  getEdgeStyle,
  getNodeTypeFromBracket,
  parseMultiChainEdge,
  getRelationLabel,
  createParserContext,
  cleanLines,
  type ParserContext,
}

export function detectDiagramType(code: string): DiagramType | null {
  const trimmedCode = code.trim().toLowerCase()

  if (trimmedCode.startsWith('flowchart') || trimmedCode.startsWith('graph')) {
    return 'activity'
  }
  if (trimmedCode.startsWith('sequencediagram')) {
    return 'sequence'
  }
  if (trimmedCode.startsWith('statediagram')) {
    return 'state'
  }
  if (trimmedCode.startsWith('erdiagram')) {
    return 'er'
  }
  if (trimmedCode.startsWith('classdiagram')) {
    return 'class'
  }
  if (trimmedCode.startsWith('gantt')) {
    return 'gantt'
  }
  if (trimmedCode.startsWith('mindmap')) {
    return 'mindmap'
  }
  if (trimmedCode.startsWith('timeline')) {
    return 'timeline'
  }
  if (trimmedCode.startsWith('gitgraph')) {
    return 'gitgraph'
  }
  if (trimmedCode.startsWith('pie')) {
    return 'pie'
  }
  if (trimmedCode.startsWith('journey')) {
    return 'journey'
  }
  if (trimmedCode.startsWith('requirementdiagram')) {
    return 'requirement'
  }
  if (trimmedCode.startsWith('c4context') || trimmedCode.startsWith('c4container') ||
    trimmedCode.startsWith('c4component') || trimmedCode.startsWith('c4dynamic')) {
    return 'c4'
  }
  if (trimmedCode.startsWith('xychart-beta') || trimmedCode.startsWith('xychart')) {
    return 'xychart'
  }
  if (trimmedCode.startsWith('block')) {
    return 'block'
  }

  return null
}

export function parseMermaidCode(code: string): MermaidParseResult {
  const diagramType = detectDiagramType(code)

  if (!diagramType) {
    return {
      success: false,
      error: '无法识别的图表类型，请检查代码格式',
    }
  }

  const themeName = parseThemeFromCode(code)
  setTheme(themeName)

  try {
    switch (diagramType) {
      case 'activity':
        return parseActivityDiagram(code)
      case 'sequence':
        return parseSequenceDiagram(code)
      case 'state':
        return parseStateDiagram(code)
      case 'er':
        return parseErDiagram(code)
      case 'class':
        return parseClassDiagram(code)
      case 'gantt':
        return parseGanttDiagram(code)
      case 'mindmap':
        return parseMindmapDiagram(code)
      case 'timeline':
        return parseTimelineDiagram(code)
      case 'gitgraph':
        return parseGitgraphDiagram(code)
      case 'pie':
        return parsePieDiagram(code)
      case 'journey':
        return parseJourneyDiagram(code)
      case 'requirement':
        return parseRequirementDiagram(code)
      case 'c4':
        return parseC4Diagram(code)
      case 'xychart':
        return parseXYChartDiagram(code)
      case 'block':
        return parseBlockDiagram(code)
      default:
        return {
          success: false,
          error: '不支持的图表类型',
        }
    }
  } catch (error) {
    return {
      success: false,
      error: `解析错误: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export {
  parseActivityDiagram,
  parseSequenceDiagram,
  parseStateDiagram,
  parseErDiagram,
  parseClassDiagram,
  parseGanttDiagram,
  parseMindmapDiagram,
  parseTimelineDiagram,
  parseGitgraphDiagram,
  parsePieDiagram,
  parseJourneyDiagram,
  parseRequirementDiagram,
  parseC4Diagram,
  parseXYChartDiagram,
  parseBlockDiagram,
}
