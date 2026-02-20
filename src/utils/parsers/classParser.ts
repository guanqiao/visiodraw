import type { MermaidParseResult } from '../../types/diagramTemplate'
import { calculateClassLayout } from '../layoutEngine'
import { getNodeColors } from '../mermaidTheme'
import { calculateNodeSize } from '../layoutEngine'
import { cleanLines, getRelationLabel } from './baseParser'

export function parseClassDiagram(code: string): MermaidParseResult {
  const nodes: NonNullable<MermaidParseResult['nodes']> = []
  const edges: NonNullable<MermaidParseResult['edges']> = []
  const classMap = new Map<string, NonNullable<MermaidParseResult['nodes']>[0]>()

  const lines = cleanLines(code)

  let currentClass: string | null = null
  let classMembers: string[] = []
  let classAnnotations: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const directionMatch = line.match(/^direction\s+(TB|BT|LR|RL)$/i)
    if (directionMatch) {
      continue
    }

    const titleMatch = line.match(/^title[:\s]+(.+)$/i)
    if (titleMatch) {
      continue
    }

    const classStartMatch = line.match(/^class\s+(\w+)(?:\s*<<(.+)>>)?\s*\{/)
    if (classStartMatch) {
      const [, className, annotation] = classStartMatch
      currentClass = className
      classMembers = []
      classAnnotations = annotation ? [annotation] : []
      continue
    }

    if (line === '}' && currentClass) {
      const node = createClassNode(currentClass, classMembers, classAnnotations)
      nodes.push(node)
      classMap.set(currentClass, node)
      currentClass = null
      classAnnotations = []
      continue
    }

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

    if (currentClass && (line.includes('(') || line.includes(':') || line.match(/^[\+\-\#~]/))) {
      classMembers.push(line)
      continue
    }

    const relationMatch = line.match(/^(\w+)\s*([\*o]?<\|[\|>]?\|[\*o]?|<[\|>]?|--[\*o]?|\.\.[\|>]?|\.\.\|>)\s*(\w+)(?:\s*:\s*(.+))?$/)
    if (relationMatch) {
      const [, sourceId, relation, targetId, label] = relationMatch

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

  const layoutedNodes = calculateClassLayout(nodes, edges)

  return {
    success: true,
    diagramType: 'class',
    nodes: layoutedNodes,
    edges,
  }
}

function createClassNode(
  name: string,
  members: string[] = [],
  annotations: string[] = []
): MermaidParseResult['nodes'][0] {
  let text = name
  if (annotations.length > 0) {
    text = `«${annotations[0]}»\n${text}`
  }
  if (members.length > 0) {
    text += '\n' + members.join('\n')
  }

  let type = 'uml-class'
  if (annotations.includes('interface')) {
    type = 'uml-interface'
  } else if (annotations.includes('abstract')) {
    type = 'uml-abstract-class'
  } else if (annotations.includes('enumeration') || annotations.includes('enum')) {
    type = 'uml-enum'
  }

  const size = calculateNodeSize(type, text)
  const colors = getNodeColors(type)

  return {
    id: name,
    type,
    x: 100,
    y: 100,
    width: size.width,
    height: size.height,
    text,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: 2,
  }
}
