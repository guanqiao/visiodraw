import type {
  DiagramTemplate,
  TemplateNode,
  TemplateEdge,
  TemplateGenerateOptions,
} from '../types/diagramTemplate'
import type { ShapeData } from '../stores/x6GraphStore'
import type { Connector, ConnectorEndStyle } from '../types/connection'
import { getCurrentTheme } from './mermaidTheme'
import { generateDefaultConnectionPoints } from './connectionPoints'

/**
 * 检查是否为辅助节点（不应添加到主界面）
 * 注意：只过滤纯装饰性节点，保留可能作为边连接点的节点
 */
function isAuxiliaryNode(type: string): boolean {
  const auxiliaryTypes = [
    'uml-message-marker',
    'uml-create-label',
  ]
  return auxiliaryTypes.includes(type)
}

export function templateNodeToShapeData(node: TemplateNode): ShapeData {
  const shapeData: ShapeData = {
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
    connectionPoints: generateDefaultConnectionPoints(node.type),
  }

  // 添加可选属性
  if (node.rx !== undefined) {
    (shapeData as any).rx = node.rx
  }
  if (node.ry !== undefined) {
    (shapeData as any).ry = node.ry
  }
  if ((node as any).dashArray !== undefined) {
    (shapeData as any).dashArray = (node as any).dashArray
  }
  if ((node as any).fillOpacity !== undefined) {
    (shapeData as any).fillOpacity = (node as any).fillOpacity
  }

  return shapeData
}

export function templateEdgeToConnector(edge: TemplateEdge, nodes: TemplateNode[]): Connector {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)

  const { sourcePointId, targetPointId } = calculateConnectionPoints(
    sourceNode,
    targetNode,
    edge.style
  )

  const startMarker = edge.startMarker || 'none'
  const endMarker = edge.endMarker || 'arrow'

  const theme = getCurrentTheme()

  // 获取标签位置信息
  const labelPosition = (edge.labelPosition as number) ?? 0.5
  const labelOffsetY = (edge.labelOffsetY as number) ?? -10

  // 构建基础连接器配置
  const connector: Connector = {
    id: edge.id,
    sourceShapeId: edge.source,
    sourcePointId,
    targetShapeId: edge.target,
    targetPointId,
    style: (edge.style as any) || 'orthogonal',
    lineStyle: edge.lineStyle || 'solid',
    startStyle: (startMarker === 'none' ? 'none' : startMarker) as ConnectorEndStyle,
    endStyle: (endMarker === 'arrow' ? 'classic' : endMarker) as ConnectorEndStyle,
    stroke: theme.lineColor || '#666',
    strokeWidth: 2,
    labels: edge.label ? [{
      id: `${edge.id}-label`,
      text: edge.label,
      position: labelPosition,
      offsetX: 0,
      offsetY: labelOffsetY,
      fontSize: 12,
      color: theme.textColor || '#333',
      backgroundColor: theme.edgeLabelBackground || '#fff',
    }] : undefined,
  }

  // 对于 straight 样式的序列图边，添加水平路由约束
  if (edge.style === 'straight') {
    connector.routingConstraint = 'horizontal'
    
    // 如果有 yPosition 数据，使用 pathPoints 控制消息位置
    const yPosition = edge.data?.yPosition as number | undefined
    if (yPosition !== undefined && sourceNode && targetNode) {
      const sourceX = sourceNode.x + (sourceNode.width || 1) / 2
      const targetX = targetNode.x + (targetNode.width || 1) / 2
      const messageY = sourceNode.y + yPosition
      
      // 使用 pathPoints 定义直线路径
      connector.pathPoints = [
        { x: sourceX, y: messageY },
        { x: targetX, y: messageY },
      ]
    }
  }

  return connector
}

function calculateConnectionPoints(
  sourceNode?: TemplateNode,
  targetNode?: TemplateNode,
  style?: string
): { sourcePointId: string; targetPointId: string } {
  if (!sourceNode || !targetNode) {
    return { sourcePointId: 'bottom', targetPointId: 'top' }
  }

  // 对于锚点节点，使用中心端口
  if (sourceNode.type === 'uml-anchor' && targetNode.type === 'uml-anchor') {
    return { sourcePointId: 'center', targetPointId: 'center' }
  }
  if (sourceNode.type === 'uml-anchor') {
    return { sourcePointId: 'center', targetPointId: 'center' }
  }
  if (targetNode.type === 'uml-anchor') {
    return { sourcePointId: 'center', targetPointId: 'center' }
  }

  // 对于 straight 样式的边（如序列图消息），强制使用水平连接点
  if (style === 'straight') {
    const sourceCenterX = sourceNode.x + (sourceNode.width || 100) / 2
    const targetCenterX = targetNode.x + (targetNode.width || 100) / 2

    if (targetCenterX > sourceCenterX) {
      return { sourcePointId: 'right', targetPointId: 'left' }
    } else {
      return { sourcePointId: 'left', targetPointId: 'right' }
    }
  }

  const sourceCenterX = sourceNode.x + (sourceNode.width || 100) / 2
  const sourceCenterY = sourceNode.y + (sourceNode.height || 60) / 2
  const targetCenterX = targetNode.x + (targetNode.width || 100) / 2
  const targetCenterY = targetNode.y + (targetNode.height || 60) / 2

  const dx = targetCenterX - sourceCenterX
  const dy = targetCenterY - sourceCenterY

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      return { sourcePointId: 'right', targetPointId: 'left' }
    } else {
      return { sourcePointId: 'left', targetPointId: 'right' }
    }
  } else {
    if (dy > 0) {
      return { sourcePointId: 'bottom', targetPointId: 'top' }
    } else {
      return { sourcePointId: 'top', targetPointId: 'bottom' }
    }
  }
}

export function buildDiagramTemplate(template: DiagramTemplate): {
  nodes: ShapeData[]
  edges: Connector[]
} {
  // 如果模板有 generate 函数，先调用它生成 nodes 和 edges
  let templateNodes = template.nodes
  let templateEdges = template.edges

  if (template.generate) {
    const generated = template.generate()
    templateNodes = generated.nodes
    templateEdges = generated.edges
  }

  // 确保 nodes 不为空
  if (!templateNodes || templateNodes.length === 0) {
    return { nodes: [], edges: [] }
  }

  // 只过滤掉真正的辅助标记节点，保留锚点节点
  const filteredNodes = templateNodes.filter(node => {
    const auxiliaryTypes = [
      'uml-lifeline-marker',
      'uml-lifeline-end',
      'uml-message-marker',
      'uml-destroy-marker',
      'uml-create-marker',
      'uml-create-label',
    ]
    return !auxiliaryTypes.includes(node.type)
  })
  const nodes = filteredNodes.map(templateNodeToShapeData)

  // 使用过滤后的节点列表来转换边
  const edges = templateEdges?.map(edge => templateEdgeToConnector(edge, filteredNodes)) || []

  return { nodes, edges }
}

export function getDefaultGenerateOptions(): Required<TemplateGenerateOptions> {
  return {
    startX: 100,
    startY: 100,
    spacing: 120,
    direction: 'vertical',
    autoNumber: false,
  }
}

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
    case 'uml-participant':
      return {
        ...baseNode,
        width: 100,
        height: 40,
        fill: '#f0f5ff',
        stroke: '#2f54eb',
        strokeWidth: 2,
      }
    case 'uml-lifeline-line':
      return {
        ...baseNode,
        width: 1,
        height: 250,
        fill: 'transparent',
        stroke: '#8c8c8c',
        strokeWidth: 1,
      }
    case 'uml-lifeline':
      return {
        ...baseNode,
        width: 120,
        height: 60,
        fill: theme.actorBkg || '#f0f5ff',
        stroke: theme.actorBorder || '#2f54eb',
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

export function createSequenceDiagramEdge(
  source: string,
  target: string,
  label?: string,
  lineStyle: 'solid' | 'dashed' = 'solid',
  index: number = 0
): TemplateEdge {
  return {
    id: `edge-${index}`,
    source,
    target,
    label,
    style: 'straight',
    lineStyle,
    endMarker: 'arrow',
  }
}

export function createClassDiagramEdge(
  source: string,
  target: string,
  relation: string,
  label?: string,
  index: number = 0
): TemplateEdge {
  const lineStyle = relation.includes('.') ? 'dashed' : 'solid'
  let endMarker: 'arrow' | 'diamond' | 'none' = 'arrow'
  let startMarker: 'none' | 'diamond' | 'arrow' = 'none'
  
  if (relation.includes('<|--')) {
    endMarker = 'arrow'
    startMarker = 'none'
  } else if (relation.includes('*--')) {
    endMarker = 'diamond'
  } else if (relation.includes('o--')) {
    endMarker = 'diamond'
  } else if (relation.includes('..|>')) {
    endMarker = 'arrow'
  }
  
  return {
    id: `edge-${index}`,
    source,
    target,
    label,
    style: 'orthogonal',
    lineStyle,
    startMarker,
    endMarker,
  }
}

export function createERDiagramEdge(
  source: string,
  target: string,
  cardinality: string,
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
    endMarker: 'none',
  }
}
