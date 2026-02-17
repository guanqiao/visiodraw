/**
 * Mermaid 语法解析器
 * 支持解析活动图(flowchart)、序列图(sequenceDiagram)、状态图(stateDiagram)、ER图(erDiagram)、类图(classDiagram)、甘特图(gantt)等
 */

import type {
  DiagramType,
  MermaidParseResult,
  TemplateNode,
  TemplateEdge,
} from '../types/diagramTemplate'
import { setTheme, getNodeColors, getEdgeColors, parseThemeFromCode } from './mermaidTheme'
import { calculateLayout, parseDirectionFromCode, calculateGridLayout } from './layoutEngine'

/**
 * 检测 Mermaid 代码的图表类型
 * @param code Mermaid 代码
 * @returns 图表类型或 null
 */
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

  return null
}

/**
 * 解析 Mermaid 代码
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseMermaidCode(code: string): MermaidParseResult {
  const diagramType = detectDiagramType(code)

  if (!diagramType) {
    return {
      success: false,
      error: '无法识别的图表类型，请检查代码格式',
    }
  }

  // 解析并设置主题
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

/**
 * 解析活动图(flowchart/graph)
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseActivityDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  const nodeMap = new Map<string, TemplateNode>()

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  // 解析方向
  const directionMatch = lines[0]?.match(/(?:flowchart|graph)\s+(TD|TB|LR|RL|BT)/i)
  const direction = directionMatch?.[1] || 'TD'

  // 解析节点和边
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]

    // 解析边定义: A --> B 或 A -->|label| B
    const edgeMatch = line.match(/^(\w+)\s*(-->|---|-\.->|==>|\.->)\s*(?:\|([^|]+)\|)?\s*(\w+)$/)
    if (edgeMatch) {
      const [, sourceId, arrowType, label, targetId] = edgeMatch

      // 创建或获取源节点
      if (!nodeMap.has(sourceId)) {
        const node = createActivityNode(sourceId, sourceId, direction, nodes.length)
        nodes.push(node)
        nodeMap.set(sourceId, node)
      }

      // 创建或获取目标节点
      if (!nodeMap.has(targetId)) {
        const node = createActivityNode(targetId, targetId, direction, nodes.length)
        nodes.push(node)
        nodeMap.set(targetId, node)
      }

      edges.push({
        id: `edge-${edges.length}`,
        source: sourceId,
        target: targetId,
        label: label?.trim(),
        style: arrowType.includes('.') ? 'curved' : 'orthogonal',
        lineStyle: arrowType === '---' ? 'dashed' : 'solid',
      })

      continue
    }

    // 解析节点定义: A[text] 或 A{text} 或 A((text)) 或 A([text]) 等
    // 支持新语法: A@{ shape: stadium }
    const nodeMatch = line.match(/^(\w+)\s*((?:\[\/)?\[|\(|\{|\(\(|\(\[|<|\[\[|\[\(|\[\\/|\\/\]|\{\{)\s*([^\]]*)\s*(\]|\)|\}|\)\)|\]\)|\]\]|\}\})?\s*(?:-->.*)?$/)
    const newSyntaxMatch = line.match(/^(\w+)\s*@\{\s*shape:\s*\w+\s*\}\s*(?:-->.*)?$/)

    if (nodeMatch || newSyntaxMatch) {
      let nodeId: string
      let openBracket: string
      let text: string
      let fullLine: string

      if (newSyntaxMatch) {
        // 新语法: A@{ shape: xxx }
        const match = line.match(/^(\w+)\s*@\{\s*shape:\s*(\w+)\s*\}(?:\s*:\s*(.+))?$/)
        if (match) {
          [, nodeId, , text = ''] = match
          openBracket = ''
          fullLine = line
        } else {
          continue
        }
      } else {
        // 传统语法
        [, nodeId, openBracket, text] = nodeMatch!
        fullLine = line
      }

      if (!nodeMap.has(nodeId)) {
        const nodeType = getActivityNodeType(openBracket, fullLine)
        const node = createActivityNode(nodeId, text?.trim() || nodeId, direction, nodes.length, nodeType)
        nodes.push(node)
        nodeMap.set(nodeId, node)
      } else {
        // 更新现有节点的文本和类型
        const existingNode = nodeMap.get(nodeId)!
        existingNode.text = text?.trim() || nodeId
        existingNode.type = getActivityNodeType(openBracket, fullLine)
      }
    }
  }

  // 应用智能布局
  const layoutDirection = parseDirectionFromCode(code)
  const layoutedNodes = nodes.length > 0 
    ? calculateLayout(nodes, edges, { direction: layoutDirection })
    : nodes

  return {
    success: true,
    diagramType: 'activity',
    nodes: layoutedNodes,
    edges,
  }
}

/**
 * 创建活动图节点
 */
function createActivityNode(
  id: string,
  text: string,
  direction: string,
  index: number,
  type: string = 'uml-action'
): TemplateNode {
  const spacing = 120
  const startX = 100
  const startY = 100

  let x = startX
  let y = startY

  // 根据方向计算位置
  if (direction === 'LR' || direction === 'RL') {
    x = startX + index * spacing
    y = startY
  } else {
    x = startX
    y = startY + index * spacing
  }

  // 根据节点类型设置尺寸
  let width = 100
  let height = 50

  switch (type) {
    case 'uml-initial':
    case 'uml-final':
      width = 30
      height = 30
      break
    case 'uml-decision':
    case 'mermaid-rhombus':
      width = 80
      height = 80
      break
    case 'uml-fork':
      width = 20
      height = 80
      break
    case 'mermaid-stadium':
      width = 120
      height = 50
      break
    case 'mermaid-cylinder':
      width = 100
      height = 70
      break
    case 'mermaid-hexagon':
      width = 110
      height = 70
      break
    case 'mermaid-parallelogram-left':
    case 'mermaid-parallelogram-right':
      width = 120
      height = 60
      break
    case 'mermaid-trapezoid-top':
    case 'mermaid-trapezoid-bottom':
      width = 120
      height = 60
      break
    case 'mermaid-subroutine':
      width = 120
      height = 60
      break
    case 'mermaid-double-circle':
      width = 60
      height = 60
      break
    case 'mermaid-asymmetric':
      width = 120
      height = 50
      break
    case 'mermaid-circle':
      width = 60
      height = 60
      break
  }

  // 根据文本长度调整宽度
  const textLength = text.length
  if (textLength > 10) {
    width = Math.max(width, textLength * 10 + 20)
  }

  // 使用主题颜色
  const colors = getNodeColors(type)

  return {
    id,
    type,
    x,
    y,
    width,
    height,
    text,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  }
}

/**
 * 根据括号类型获取活动图节点类型
 * 支持Mermaid Flowchart所有标准形状
 */
function getActivityNodeType(bracket: string, fullText: string = ''): string {
  // 检查新的语法格式: A@{ shape: stadium }
  const newSyntaxMatch = fullText.match(/@\{\s*shape:\s*(\w+)\s*\}/)
  if (newSyntaxMatch) {
    const shapeName = newSyntaxMatch[1].toLowerCase()
    const shapeMap: Record<string, string> = {
      'stadium': 'mermaid-stadium',
      'cylinder': 'mermaid-cylinder',
      'hexagon': 'mermaid-hexagon',
      'parallelogram': 'mermaid-parallelogram-left',
      'trapezoid': 'mermaid-trapezoid-top',
      'subroutine': 'mermaid-subroutine',
      'circle': 'mermaid-circle',
      'doublecircle': 'mermaid-double-circle',
      'asymmetric': 'mermaid-asymmetric',
      'rhombus': 'mermaid-rhombus',
      'diamond': 'mermaid-rhombus',
      'rect': 'uml-action',
      'rectangle': 'uml-action',
      'roundrect': 'uml-initial',
    }
    return shapeMap[shapeName] || 'uml-action'
  }

  switch (bracket) {
    case '(':
      return 'uml-initial' // 圆角矩形作为开始/结束
    case '([':
      return 'mermaid-stadium' // stadium 形状
    case '{':
      return 'mermaid-rhombus' // 菱形作为判断
    case '(((':
      return 'mermaid-double-circle' // 双圆
    case '>':
      return 'mermaid-asymmetric' // 不对称形状
    case '[/':
      return 'mermaid-parallelogram-left' // 平行四边形左斜
    case '\\[':
      return 'mermaid-parallelogram-right' // 平行四边形右斜
    case '[\\/':
      return 'mermaid-trapezoid-top' // 梯形上宽下窄
    case '\\/]':
      return 'mermaid-trapezoid-bottom' // 梯形上窄下宽
    case '((':
      return 'mermaid-circle' // 圆形
    case '[[':
      return 'mermaid-subroutine' // 子程序双边框
    case '[(]':
      return 'mermaid-cylinder' // 圆柱形/数据库
    case '{{':
      return 'mermaid-hexagon' // 六边形
    default:
      // 检查是否是方括号
      if (bracket === '[' || bracket?.startsWith('[')) {
        return 'uml-action' // 默认矩形
      }
      return 'uml-action' // 默认矩形
  }
}



/**
 * 解析序列图
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseSequenceDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  const participants = new Map<string, { id: string; alias?: string }>()

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  // 第一遍：收集所有参与者
  for (const line of lines) {
    // participant Name as Alias
    const participantMatch = line.match(/participant\s+(\w+)(?:\s+as\s+(.+))?/i)
    if (participantMatch) {
      const [, id, alias] = participantMatch
      participants.set(id, { id, alias: alias?.trim() })
    }
  }

  // 第二遍：从消息中提取参与者
  for (const line of lines) {
    const messageMatch = line.match(/^(\w+)\s*(->>|-->>|->|-x|--x|->>\+|->>-|--)\s*(\w+)\s*:\s*(.+)$/)
    if (messageMatch) {
      const [, sourceId, , targetId] = messageMatch
      if (!participants.has(sourceId)) {
        participants.set(sourceId, { id: sourceId })
      }
      if (!participants.has(targetId)) {
        participants.set(targetId, { id: targetId })
      }
    }
  }

  // 创建参与者节点（生命线）
  const participantArray = Array.from(participants.values())
  participantArray.forEach((p, index) => {
    nodes.push({
      id: p.id,
      type: 'uml-lifeline',
      x: 100 + index * 150,
      y: 50,
      width: 60,
      height: 300,
      text: p.alias || p.id,
      fill: '#f0f5ff',
      stroke: '#2f54eb',
      strokeWidth: 2,
    })
  })

  // 解析消息
  let currentY = 120
  for (const line of lines) {
    const messageMatch = line.match(/^(\w+)\s*(->>|-->>|->|-x|--x|->>\+|->>-|--)\s*(\w+)\s*:\s*(.+)$/)
    if (messageMatch) {
      const [, sourceId, arrowType, targetId, message] = messageMatch

      const sourceIndex = participantArray.findIndex(p => p.id === sourceId)
      const targetIndex = participantArray.findIndex(p => p.id === targetId)

      if (sourceIndex !== -1 && targetIndex !== -1) {
        edges.push({
          id: `edge-${edges.length}`,
          source: sourceId,
          target: targetId,
          label: message.trim(),
          style: 'orthogonal',
          lineStyle: arrowType.includes('--') ? 'dashed' : 'solid',
        })

        // 添加激活条
        if (arrowType.includes('+')) {
          nodes.push({
            id: `activation-${nodes.length}`,
            type: 'uml-activation',
            x: 100 + targetIndex * 150 + 20,
            y: currentY,
            width: 20,
            height: 60,
            fill: '#2f54eb',
            stroke: '#2f54eb',
            strokeWidth: 1,
          })
        }
      }

      currentY += 40
    }
  }

  return {
    success: true,
    diagramType: 'sequence',
    nodes,
    edges,
  }
}

/**
 * 解析状态图
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseStateDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  const nodeMap = new Map<string, TemplateNode>()

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  for (const line of lines) {
    // 解析状态定义: state "Name" as ID
    const stateDefMatch = line.match(/state\s+"([^"]+)"\s+as\s+(\w+)/)
    if (stateDefMatch) {
      const [, name, id] = stateDefMatch
      if (!nodeMap.has(id)) {
        const node = createStateNode(id, name)
        nodes.push(node)
        nodeMap.set(id, node)
      }
      continue
    }

    // 解析复合状态开始
    const compositeMatch = line.match(/state\s+(\w+)\s*\{/)
    if (compositeMatch) {
      const [, id] = compositeMatch
      if (!nodeMap.has(id)) {
        const node = createStateNode(id, id, 'uml-state-composite')
        nodes.push(node)
        nodeMap.set(id, node)
      }
      continue
    }

    // 解析转换: [*] --> State 或 State1 --> State2: event
    const transitionMatch = line.match(/^(\[?\*?\]?|\w+)\s*-->\s*(\[?\*?\]?|\w+)(?:\s*:\s*(.+))?$/)
    if (transitionMatch) {
      const [, sourceId, targetId, event] = transitionMatch

      // 处理初始/终止状态
      if (sourceId === '[*]') {
        const startId = 'start'
        if (!nodeMap.has(startId)) {
          const node = createStateNode(startId, '', 'uml-initial-state')
          nodes.push(node)
          nodeMap.set(startId, node)
        }
      }
      if (targetId === '[*]') {
        const endId = 'end'
        if (!nodeMap.has(endId)) {
          const node = createStateNode(endId, '', 'uml-final-state')
          nodes.push(node)
          nodeMap.set(endId, node)
        }
      }

      // 创建普通状态节点
      if (sourceId !== '[*]' && !nodeMap.has(sourceId)) {
        const node = createStateNode(sourceId, sourceId)
        nodes.push(node)
        nodeMap.set(sourceId, node)
      }
      if (targetId !== '[*]' && !nodeMap.has(targetId)) {
        const node = createStateNode(targetId, targetId)
        nodes.push(node)
        nodeMap.set(targetId, node)
      }

      edges.push({
        id: `edge-${edges.length}`,
        source: sourceId === '[*]' ? 'start' : sourceId,
        target: targetId === '[*]' ? 'end' : targetId,
        label: event?.trim(),
        style: 'orthogonal',
        lineStyle: 'solid',
      })
    }
  }

  return {
    success: true,
    diagramType: 'state',
    nodes,
    edges,
  }
}

/**
 * 创建状态图节点
 */
function createStateNode(id: string, text: string, type: string = 'uml-state'): TemplateNode {
  const index = parseInt(id.replace(/\D/g, '')) || Math.floor(Math.random() * 100)
  const spacing = 150

  let width = 120
  let height = 60

  if (type === 'uml-initial-state' || type === 'uml-final-state') {
    width = 30
    height = 30
  } else if (type === 'uml-state-composite') {
    width = 200
    height = 150
  }

  // 使用主题颜色
  const colors = getNodeColors(type)

  return {
    id,
    type,
    x: 100 + (index % 4) * spacing,
    y: 100 + Math.floor(index / 4) * spacing,
    width,
    height,
    text,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  }
}

/**
 * 解析 ER 图
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseErDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  const nodeMap = new Map<string, TemplateNode>()

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentEntity: string | null = null
  let entityAttributes: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 解析实体定义开始: ENTITY {
    const entityStartMatch = line.match(/^(\w+)\s*\{/)
    if (entityStartMatch) {
      currentEntity = entityStartMatch[1]
      entityAttributes = []
      continue
    }

    // 解析实体定义结束: }
    if (line === '}' && currentEntity) {
      const node = createErEntityNode(currentEntity, entityAttributes)
      nodes.push(node)
      nodeMap.set(currentEntity, node)
      currentEntity = null
      continue
    }

    // 解析实体属性
    if (currentEntity && line.match(/^(\w+)\s+\w+/)) {
      entityAttributes.push(line)
      continue
    }

    // 解析关系: ENTITY1 ||--o{ ENTITY2 : label
    // 支持多种关系格式: ||--o{, }o--o{, ||--|| 等
    const relationshipMatch = line.match(/^(\w+)\s+([|}o])\|?(-?-?)([|}o])\}\s+(\w+)\s*:\s*(.+)$/)
    const relationshipMatch2 = line.match(/^(\w+)\s+\|\|?(-?-?)([|}o])\}\s+(\w+)\s*:\s*(.+)$/)
    const relationshipMatch3 = line.match(/^(\w+)\s+([|}o])\}(-?-?)\|?\|\s+(\w+)\s*:\s*(.+)$/)

    const match = relationshipMatch || relationshipMatch2 || relationshipMatch3

    if (match) {
      const entity1 = match[1]
      const entity2 = match[5] || match[4]
      const label = match[6] || match[5]

      // 创建实体节点
      if (!nodeMap.has(entity1)) {
        const node = createErEntityNode(entity1)
        nodes.push(node)
        nodeMap.set(entity1, node)
      }
      if (!nodeMap.has(entity2)) {
        const node = createErEntityNode(entity2)
        nodes.push(node)
        nodeMap.set(entity2, node)
      }

      edges.push({
        id: `edge-${edges.length}`,
        source: entity1,
        target: entity2,
        label: label?.trim() || '',
        style: 'orthogonal',
        lineStyle: 'solid',
      })
    }
  }

  return {
    success: true,
    diagramType: 'er',
    nodes,
    edges,
  }
}

/**
 * 创建 ER 实体节点
 */
function createErEntityNode(name: string, attributes: string[] = []): TemplateNode {
  const index = Math.floor(Math.random() * 100)
  const spacing = 200

  let text = name
  if (attributes.length > 0) {
    text += '\n' + attributes.join('\n')
  }

  // 使用主题颜色
  const colors = getNodeColors('er-table-entity-with-columns')

  return {
    id: name,
    type: 'er-table-entity-with-columns',
    x: 100 + (index % 3) * spacing,
    y: 100 + Math.floor(index / 3) * 150,
    width: 160,
    height: 50 + attributes.length * 25,
    text,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  }
}

/**
 * 解析类图
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseClassDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []
  const classMap = new Map<string, TemplateNode>()

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentClass: string | null = null
  let classMembers: string[] = []
  let classAnnotations: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 解析方向
    const directionMatch = line.match(/^direction\s+(TB|BT|LR|RL)$/i)
    if (directionMatch) {
      continue
    }

    // 解析标题
    const titleMatch = line.match(/^title[:\s]+(.+)$/i)
    if (titleMatch) {
      continue
    }

    // 解析类定义开始: class Name {
    const classStartMatch = line.match(/^class\s+(\w+)(?:\s*<<(.+)>>)?\s*\{/)
    if (classStartMatch) {
      const [, className, annotation] = classStartMatch
      currentClass = className
      classMembers = []
      classAnnotations = annotation ? [annotation] : []
      continue
    }

    // 解析类定义结束: }
    if (line === '}' && currentClass) {
      const node = createClassNode(currentClass, classMembers, classAnnotations)
      nodes.push(node)
      classMap.set(currentClass, node)
      currentClass = null
      classAnnotations = []
      continue
    }

    // 解析简单类定义: class Name
    const simpleClassMatch = line.match(/^class\s+(\w+)(?:\s*<<(.+)>>)?$/)
    if (simpleClassMatch && !line.includes('{')) {
      const [, className, annotation] = simpleClassMatch
      const annotations = annotation ? [annotation] : []
      if (!classMap.has(className)) {
        const node = createClassNode(className, [], annotations)
        nodes.push(node)
        classMap.set(className, node)
      }
      continue
    }

    // 解析类成员
    if (currentClass && (line.includes('(') || line.includes(':') || line.match(/^[\+\-\#~]/))) {
      classMembers.push(line)
      continue
    }

    // 解析类关系: ClassA <|-- ClassB : label
    const relationMatch = line.match(/^(\w+)\s*([\*o]?<\|[\|>]?\|[\*o]?|<[\|>]?|--[\*o]?|\.\.[\|>]?|\.\.\|>)\s*(\w+)(?:\s*:\s*(.+))?$/)
    if (relationMatch) {
      const [, sourceId, relation, targetId, label] = relationMatch

      // 创建类节点
      if (!classMap.has(sourceId)) {
        const node = createClassNode(sourceId)
        nodes.push(node)
        classMap.set(sourceId, node)
      }
      if (!classMap.has(targetId)) {
        const node = createClassNode(targetId)
        nodes.push(node)
        classMap.set(targetId, node)
      }

      edges.push({
        id: `edge-${edges.length}`,
        source: sourceId,
        target: targetId,
        label: label?.trim() || getRelationLabel(relation),
        style: 'orthogonal',
        lineStyle: relation.includes('.') ? 'dashed' : 'solid',
      })
    }
  }

  return {
    success: true,
    diagramType: 'class',
    nodes,
    edges,
  }
}

/**
 * 创建类图节点
 */
function createClassNode(name: string, members: string[] = [], annotations: string[] = []): TemplateNode {
  const index = Math.floor(Math.random() * 100)
  const spacing = 200

  let text = name
  if (annotations.length > 0) {
    text = `«${annotations[0]}»\n${text}`
  }
  if (members.length > 0) {
    text += '\n' + members.join('\n')
  }

  // 确定节点类型
  let type = 'uml-class'
  if (annotations.includes('interface')) {
    type = 'uml-interface'
  } else if (annotations.includes('abstract')) {
    type = 'uml-abstract-class'
  } else if (annotations.includes('enumeration') || annotations.includes('enum')) {
    type = 'uml-enum'
  }

  // 使用主题颜色
  const colors = getNodeColors(type)

  return {
    id: name,
    type,
    x: 100 + (index % 4) * spacing,
    y: 100 + Math.floor(index / 4) * 150,
    width: 180,
    height: 60 + members.length * 20,
    text,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  }
}

/**
 * 获取关系标签
 */
function getRelationLabel(relation: string): string {
  if (relation.includes('<|--')) return '继承'
  if (relation.includes('*--')) return '组合'
  if (relation.includes('o--')) return '聚合'
  if (relation.includes('-->')) return '关联'
  if (relation.includes('..|>')) return '实现'
  if (relation.includes('..>')) return '依赖'
  return ''
}

/**
 * 解析甘特图
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseGanttDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentSection = 'Default'
  let yOffset = 100
  let taskIndex = 0

  for (const line of lines) {
    // 解析标题
    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      continue
    }

    // 解析日期格式
    const dateFormatMatch = line.match(/^dateformat\s+(.+)$/i)
    if (dateFormatMatch) {
      continue
    }

    // 解析 section
    const sectionMatch = line.match(/^section\s+(.+)$/i)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      // 添加 section 标题节点
      nodes.push({
        id: `section-${nodes.length}`,
        type: 'uml-action',
        x: 50,
        y: yOffset,
        width: 120,
        height: 30,
        text: currentSection,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })
      yOffset += 50
      continue
    }

    // 解析任务: Task name : id, start, duration
    const taskMatch = line.match(/^([^:]+)\s*:\s*(?:(\w+),\s*)?([^,]+)(?:,\s*(.+))?$/)
    if (taskMatch) {
      const [, taskName, taskId, startOrStatus, duration] = taskMatch
      const trimmedTaskName = taskName.trim()

      // 检查是否是 milestone
      const isMilestone = line.toLowerCase().includes('milestone')
      // 检查状态标签
      const isDone = line.toLowerCase().includes('done')
      const isActive = line.toLowerCase().includes('active')
      const isCrit = line.toLowerCase().includes('crit')

      const nodeId = taskId || `task-${taskIndex}`
      const nodeWidth = isMilestone ? 20 : 150
      const nodeHeight = isMilestone ? 20 : 30

      nodes.push({
        id: nodeId,
        type: isMilestone ? 'uml-initial' : 'uml-action',
        x: 200 + taskIndex * 30,
        y: yOffset,
        width: nodeWidth,
        height: nodeHeight,
        text: trimmedTaskName,
        fill: isDone ? '#52c41a' : isActive ? '#1890ff' : isCrit ? '#f5222d' : '#f0f0f0',
        stroke: isDone ? '#52c41a' : isActive ? '#1890ff' : isCrit ? '#f5222d' : '#999',
        strokeWidth: 2,
      })

      yOffset += 40
      taskIndex++
    }
  }

  return {
    success: true,
    diagramType: 'gantt',
    nodes,
    edges,
  }
}

/**
 * 解析思维导图
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseMindmapDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  // 解析根节点
  const rootMatch = lines[0]?.match(/root\s*\(\(([^)]+)\)\)|root\s*\[([^\]]+)\]|root\s+(.+)/)
  if (rootMatch) {
    const rootText = rootMatch[1] || rootMatch[2] || rootMatch[3]
    nodes.push({
      id: 'root',
      type: 'uml-initial',
      x: 400,
      y: 50,
      width: 100,
      height: 50,
      text: rootText.trim(),
      fill: '#722ed1',
      stroke: '#722ed1',
      strokeWidth: 2,
    })
  }

  // 解析子节点（简化实现）
  let currentLevel = 0
  let yOffset = 150

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const indent = line.search(/\S/)
    const level = Math.floor(indent / 4)
    const text = line.trim()

    if (text) {
      const nodeId = `node-${nodes.length}`
      const x = 200 + (level * 150)

      nodes.push({
        id: nodeId,
        type: 'uml-action',
        x,
        y: yOffset,
        width: 120,
        height: 40,
        text,
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })

      // 创建边连接到父节点
      const parentId = level === 0 ? 'root' : `node-${nodes.length - 2}`
      edges.push({
        id: `edge-${edges.length}`,
        source: parentId,
        target: nodeId,
        style: 'orthogonal',
        lineStyle: 'solid',
      })

      yOffset += 60
    }
  }

  return {
    success: true,
    diagramType: 'mindmap',
    nodes,
    edges,
  }
}

/**
 * 解析时间线图
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseTimelineDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentSection = ''
  let xOffset = 100

  for (const line of lines) {
    // 解析标题
    const titleMatch = line.match(/^title\s+(.+)$/i)
    if (titleMatch) {
      continue
    }

    // 解析 section
    const sectionMatch = line.match(/^section\s+(.+)$/i)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      continue
    }

    // 解析时间段和事件: 2002 : Event1 : Event2
    const timelineMatch = line.match(/^([^:]+)\s*:\s*(.+)$/)
    if (timelineMatch) {
      const [, period, events] = timelineMatch
      const periodId = `period-${nodes.length}`

      // 创建时间段节点
      nodes.push({
        id: periodId,
        type: 'uml-action',
        x: xOffset,
        y: 100,
        width: 100,
        height: 40,
        text: period.trim(),
        fill: '#fff2e8',
        stroke: '#fa8c16',
        strokeWidth: 2,
      })

      // 创建事件节点
      const eventList = events.split(':').map(e => e.trim())
      eventList.forEach((event, index) => {
        const eventId = `event-${nodes.length}`
        nodes.push({
          id: eventId,
          type: 'uml-action',
          x: xOffset,
          y: 180 + index * 60,
          width: 120,
          height: 40,
          text: event,
          fill: '#f6ffed',
          stroke: '#52c41a',
          strokeWidth: 1,
        })

        edges.push({
          id: `edge-${edges.length}`,
          source: periodId,
          target: eventId,
          style: 'orthogonal',
          lineStyle: 'solid',
        })
      })

      xOffset += 150
    }
  }

  return {
    success: true,
    diagramType: 'timeline',
    nodes,
    edges,
  }
}

/**
 * 解析 Git 分支图
 * @param code Mermaid 代码
 * @returns 解析结果
 */
export function parseGitgraphDiagram(code: string): MermaidParseResult {
  const nodes: TemplateNode[] = []
  const edges: TemplateEdge[] = []

  const lines = code.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('%%'))

  let currentBranch = 'main'
  let xOffset = 100
  let yOffset = 100
  const branchYMap = new Map<string, number>()
  const commitMap = new Map<string, string>() // commit id -> node id

  branchYMap.set('main', 100)

  for (const line of lines) {
    // 解析 commit
    const commitMatch = line.match(/^commit(?:\s+(?:id:\s*["']?([^"']+)["']?)?)?/i)
    if (commitMatch) {
      const commitId = commitMatch[1] || `commit-${nodes.length}`
      const nodeId = `node-${nodes.length}`
      const branchY = branchYMap.get(currentBranch) || 100

      nodes.push({
        id: nodeId,
        type: 'uml-initial',
        x: xOffset,
        y: branchY,
        width: 30,
        height: 30,
        text: commitId.slice(0, 7),
        fill: '#1890ff',
        stroke: '#1890ff',
        strokeWidth: 2,
      })

      commitMap.set(commitId, nodeId)
      xOffset += 80
      continue
    }

    // 解析 branch
    const branchMatch = line.match(/^branch\s+(\w+)/i)
    if (branchMatch) {
      const branchName = branchMatch[1]
      currentBranch = branchName
      branchYMap.set(branchName, 100 + branchYMap.size * 80)
      continue
    }

    // 解析 checkout
    const checkoutMatch = line.match(/^checkout\s+(\w+)/i)
    if (checkoutMatch) {
      currentBranch = checkoutMatch[1]
      continue
    }

    // 解析 merge
    const mergeMatch = line.match(/^merge\s+(\w+)(?:\s+(?:id:\s*["']?([^"']+)["']?)?)?/i)
    if (mergeMatch) {
      const sourceBranch = mergeMatch[1]
      const mergeId = mergeMatch[2] || `merge-${nodes.length}`
      const nodeId = `node-${nodes.length}`
      const branchY = branchYMap.get(currentBranch) || 100

      nodes.push({
        id: nodeId,
        type: 'uml-decision',
        x: xOffset,
        y: branchY,
        width: 30,
        height: 30,
        text: 'M',
        fill: '#722ed1',
        stroke: '#722ed1',
        strokeWidth: 2,
      })

      xOffset += 80
    }
  }

  return {
    success: true,
    diagramType: 'gitgraph',
    nodes,
    edges,
  }
}
