import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parseRequirementDiagram(code: string): MermaidParseResult {
  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []

  const lines = cleanLines(code)

  const requirementMap = new Map<string, MermaidParseResult['nodes'][0]>()
  let yOffset = 100

  for (const line of lines) {
    if (line.match(/^requirementdiagram$/i)) {
      continue
    }

    const requirementMatch = line.match(/^requirement\s+(\w+)\s*\{/)
    if (requirementMatch) {
      const reqId = requirementMatch[1]
      requirementMap.set(reqId, {
        id: reqId,
        type: 'uml-action',
        x: 100,
        y: yOffset,
        width: 180,
        height: 80,
        text: reqId,
        fill: '#fff4dd',
        stroke: '#d4b46a',
        strokeWidth: 2,
      })
      yOffset += 100
      continue
    }

    const functionalMatch = line.match(/^functionalrequirement\s+(\w+)\s*\{/)
    if (functionalMatch) {
      const reqId = functionalMatch[1]
      requirementMap.set(reqId, {
        id: reqId,
        type: 'uml-action',
        x: 100,
        y: yOffset,
        width: 180,
        height: 80,
        text: reqId,
        fill: '#e6fffb',
        stroke: '#13c2c2',
        strokeWidth: 2,
      })
      yOffset += 100
      continue
    }

    const interfaceMatch = line.match(/^interfacerequirement\s+(\w+)\s*\{/)
    if (interfaceMatch) {
      const reqId = interfaceMatch[1]
      requirementMap.set(reqId, {
        id: reqId,
        type: 'uml-interface',
        x: 100,
        y: yOffset,
        width: 180,
        height: 80,
        text: reqId,
        fill: '#f6ffed',
        stroke: '#52c41a',
        strokeWidth: 2,
      })
      yOffset += 100
      continue
    }

    const elementMatch = line.match(/^element\s+(\w+)\s*\{/)
    if (elementMatch) {
      const elemId = elementMatch[1]
      requirementMap.set(elemId, {
        id: elemId,
        type: 'uml-component',
        x: 350,
        y: yOffset,
        width: 150,
        height: 60,
        text: elemId,
        fill: '#f0f5ff',
        stroke: '#2f54eb',
        strokeWidth: 2,
      })
      continue
    }

    const relationshipMatch = line.match(/^(\w+)\s*(->|-.->)\s*(\w+)/)
    if (relationshipMatch) {
      const [, source, , target] = relationshipMatch
      edges.push({
        id: `edge-${edges.length}`,
        source,
        target,
        style: 'orthogonal',
        lineStyle: relationshipMatch[2] === '-.-> ' ? 'dashed' : 'solid',
      })
    }
  }

  return {
    success: true,
    diagramType: 'requirement',
    nodes: Array.from(requirementMap.values()),
    edges,
  }
}
