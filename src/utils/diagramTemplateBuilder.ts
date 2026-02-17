/**
 * 图表模板构建器
 * 将模板数据转换为 X6 节点/边配置
 */

import type {
  DiagramTemplate,
  TemplateNode,
  TemplateEdge,
  TemplateGenerateOptions,
} from '../types/diagramTemplate'
import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector, ConnectorEndStyle } from '../types/connection'
import { getCurrentTheme } from './mermaidTheme'

/**
 * 将模板节点转换为 X6 ShapeData
 */
export function templateNodeToShapeData(node: TemplateNode): ShapeData {
  return {
    id: node.id,
    type: node.type,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    fill: node.fill || '#ffffff',
    stroke: node.stroke || '#333333',
    strokeWidth: node.strokeWidth || 2,
    text: node.text,
  }
}

/**
 * 将模板边转换为 X6 Connector
 */
export function templateEdgeToConnector(edge: TemplateEdge): Connector {
  const startMarker = edge.startMarker || 'none'
  const endMarker = edge.endMarker || 'arrow'
  
  return {
    id: edge.id,
    sourceShapeId: edge.source,
    sourcePointId: 'bottom',
    targetShapeId: edge.target,
    targetPointId: 'top',
    style: (edge.style as any) || 'orthogonal',
    lineStyle: edge.lineStyle || 'solid',
    startStyle: (startMarker === 'none' ? 'none' : startMarker) as ConnectorEndStyle,
    endStyle: (endMarker === 'arrow' ? 'classic' : endMarker) as ConnectorEndStyle,
    stroke: '#666',
    strokeWidth: 2,
    labels: edge.label ? [{ id: `${edge.id}-label`, text: edge.label, position: 0.5 }] : undefined,
  }
}

/**
 * 构建图表模板
 * @param template 图表模板
 * @returns X6 配置
 */
export function buildDiagramTemplate(template: DiagramTemplate): {
  nodes: ShapeData[]
  edges: Connector[]
} {
  const nodes = template.nodes.map(templateNodeToShapeData)
  const edges = template.edges?.map(templateEdgeToConnector) || []

  return { nodes, edges }
}

/**
 * 生成模板选项的默认值
 */
export function getDefaultGenerateOptions(): Required<TemplateGenerateOptions> {
  return {
    startX: 100,
    startY: 100,
    spacing: 120,
    direction: 'vertical',
  }
}

/**
 * 计算节点位置
 */
export function calculateNodePosition(
  index: number,
  options: TemplateGenerateOptions = {}
): { x: number; y: number } {
  const opts = { ...getDefaultGenerateOptions(), ...options }

  if (opts.direction === 'horizontal') {
    return {
      x: opts.startX + index * opts.spacing,
      y: opts.startY,
    }
  }

  return {
    x: opts.startX,
    y: opts.startY + index * opts.spacing,
  }
}

/**
 * 创建模板节点
 */
export function createTemplateNode(
  id: string,
  type: string,
  text: string,
  index: number,
  options: TemplateGenerateOptions = {}
): TemplateNode {
  const position = calculateNodePosition(index, options)
  const theme = getCurrentTheme()

  const baseNode: TemplateNode = {
    id,
    type,
    x: position.x,
    y: position.y,
    width: 120,
    height: 60,
    text,
  }

  // 根据类型设置默认样式（使用 Mermaid 主题颜色）
  switch (type) {
    case 'uml-initial':
    case 'uml-final':
      return {
        ...baseNode,
        width: 30,
        height: 30,
        fill: type === 'uml-initial' ? '#52c41a' : '#f5222d',
        stroke: type === 'uml-initial' ? '#52c41a' : '#f5222d',
        strokeWidth: 2,
      }
    case 'uml-decision':
      return {
        ...baseNode,
        width: 60,
        height: 60,
        fill: '#fff7e6',
        stroke: '#fa8c16',
        strokeWidth: 2,
      }
    case 'uml-fork':
      return {
        ...baseNode,
        width: 20,
        height: 80,
        fill: '#722ed1',
        stroke: '#722ed1',
        strokeWidth: 4,
      }
    case 'uml-lifeline':
      return {
        ...baseNode,
        width: 60,
        height: 300,
        fill: theme.actorBkg,
        stroke: theme.actorBorder,
        strokeWidth: 2,
      }
    case 'uml-state':
      return {
        ...baseNode,
        width: 120,
        height: 60,
        fill: theme.altBackground,
        stroke: theme.lineColor,
        strokeWidth: 2,
      }
    case 'uml-initial-state':
      return {
        ...baseNode,
        width: 30,
        height: 30,
        fill: '#52c41a',
        stroke: '#52c41a',
        strokeWidth: 2,
      }
    case 'uml-final-state':
      return {
        ...baseNode,
        width: 30,
        height: 30,
        fill: '#f5222d',
        stroke: '#f5222d',
        strokeWidth: 2,
      }
    case 'uml-interface':
      return {
        ...baseNode,
        width: 140,
        height: 60,
        fill: '#f6ffed',
        stroke: '#52c41a',
        strokeWidth: 2,
      }
    case 'uml-abstract-class':
      return {
        ...baseNode,
        width: 140,
        height: 60,
        fill: '#fff0f6',
        stroke: '#eb2f96',
        strokeWidth: 2,
      }
    case 'uml-enum':
      return {
        ...baseNode,
        width: 140,
        height: 60,
        fill: '#e6fffb',
        stroke: '#13c2c2',
        strokeWidth: 2,
      }
    case 'er-table-entity':
    case 'er-table-entity-with-columns':
      return {
        ...baseNode,
        width: 160,
        height: 80,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      }
    default:
      return {
        ...baseNode,
        fill: theme.nodeBkg,
        stroke: theme.nodeBorder,
        strokeWidth: 2,
      }
  }
}

/**
 * 创建模板边
 */
export function createTemplateEdge(
  source: string,
  target: string,
  label?: string,
  index: number = 0
): TemplateEdge {
  return {
    id: `edge-${index}`,
    source,
    target,
    label,
    style: 'orthogonal',
    lineStyle: 'solid',
  }
}
