import type { MermaidParseResult } from '../../types/diagramTemplate'
import { calculateERLayout } from '../layoutEngine'
import { getNodeColors } from '../mermaidTheme'
import { calculateNodeSize } from '../layoutEngine'
import { cleanLines } from './baseParser'

interface ErEntity {
  name: string
  attributes: { name: string; type: string; key?: string; comment?: string }[]
}

interface ErRelationship {
  entity1: string
  entity2: string
  cardinality1: string
  cardinality2: string
  label: string
  relationType: string
}

const CROWS_FOOT_PATTERNS: { pattern: RegExp; type: string; cardinality: string }[] = [
  { pattern: /\|\| -- \|\|/, type: 'one-to-one', cardinality: '1:1' },
  { pattern: /\|\| -- o\{/, type: 'one-to-many', cardinality: '1:N' },
  { pattern: /\|\| -- \|\{/, type: 'one-to-many-required', cardinality: '1:N+' },
  { pattern: /\}o -- o\{/, type: 'many-to-many', cardinality: 'N:M' },
  { pattern: /\}\| -- \|\{/, type: 'many-to-many-required', cardinality: 'N:M+' },
  { pattern: /\}o -- \|\|/, type: 'many-to-one', cardinality: 'N:1' },
  { pattern: /\}\| -- \|\|/, type: 'many-to-one-required', cardinality: 'N:1+' },
  { pattern: /\|\| -- o\|/, type: 'one-to-zero-one', cardinality: '1:0/1' },
  { pattern: /\}o -- o\|/, type: 'many-to-zero-one', cardinality: 'N:0/1' },
  { pattern: /\|\| -- \|\|/, type: 'one-to-one', cardinality: '1:1' },
]

const RELATION_PATTERN = /^(\w+)\s+([\|\}o][\|\}o\-\s]*[\|\}o])\s+(\w+)(?:\s*:\s*(.+))?$/

export function parseErDiagram(code: string): MermaidParseResult {
  const nodes: NonNullable<MermaidParseResult['nodes']> = []
  const edges: NonNullable<MermaidParseResult['edges']> = []
  const nodeMap = new Map<string, NonNullable<MermaidParseResult['nodes']>[0]>()
  const entities = new Map<string, ErEntity>()

  const lines = cleanLines(code)

  let currentEntity: string | null = null
  let entityAttributes: ErEntity['attributes'] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const entityStartMatch = line.match(/^(\w+)\s*\{/)
    if (entityStartMatch) {
      currentEntity = entityStartMatch[1]
      entityAttributes = []
      continue
    }

    if (line === '}' && currentEntity) {
      entities.set(currentEntity, {
        name: currentEntity,
        attributes: entityAttributes,
      })
      
      const node = createErEntityNode(currentEntity, entityAttributes)
      nodes.push(node)
      nodeMap.set(currentEntity, node)
      currentEntity = null
      continue
    }

    if (currentEntity) {
      const attrMatch = line.match(/^(\w+)\s+(\w+)(?:\s+(\w+))?(?:\s+"([^"]*)")?/)
      if (attrMatch) {
        const attr = {
          name: attrMatch[1],
          type: attrMatch[2],
          key: attrMatch[3],
          comment: attrMatch[4],
        }
        entityAttributes.push(attr)
        continue
      }
      
      const simpleAttrMatch = line.match(/^(\w+)\s+(\w+)/)
      if (simpleAttrMatch) {
        entityAttributes.push({
          name: simpleAttrMatch[1],
          type: simpleAttrMatch[2],
        })
      }
      continue
    }

    const relationship = parseRelationship(line)
    if (relationship) {
      if (!nodeMap.has(relationship.entity1)) {
        const node = createErEntityNode(relationship.entity1)
        nodes.push(node)
        nodeMap.set(relationship.entity1, node)
      }
      if (!nodeMap.has(relationship.entity2)) {
        const node = createErEntityNode(relationship.entity2)
        nodes.push(node)
        nodeMap.set(relationship.entity2, node)
      }

      edges.push({
        id: `edge-${edges.length}`,
        source: relationship.entity1,
        target: relationship.entity2,
        label: relationship.label?.trim() || '',
        style: 'orthogonal',
        lineStyle: 'solid',
        data: {
          relationType: relationship.relationType,
          cardinality: relationship.cardinality1,
          cardinality2: relationship.cardinality2,
        },
      })
    }
  }

  const layoutedNodes = calculateERLayout(nodes, edges)

  return {
    success: true,
    diagramType: 'er',
    nodes: layoutedNodes,
    edges,
  }
}

function parseRelationship(line: string): ErRelationship | null {
  const match = line.match(RELATION_PATTERN)
  if (!match) return null

  const entity1 = match[1]
  const relationSymbol = match[2].replace(/\s/g, '')
  const entity2 = match[3]
  const label = match[4] || ''

  const { type, cardinality } = identifyRelationType(relationSymbol)

  return {
    entity1,
    entity2,
    cardinality1: cardinality.split(':')[0],
    cardinality2: cardinality.split(':')[1],
    label,
    relationType: type,
  }
}

function identifyRelationType(symbol: string): { type: string; cardinality: string } {
  const normalizedSymbol = normalizeSymbol(symbol)
  
  for (const { pattern, type, cardinality } of CROWS_FOOT_PATTERNS) {
    if (normalizedSymbol.match(pattern)) {
      return { type, cardinality }
    }
  }
  
  if (normalizedSymbol.includes('||')) {
    if (normalizedSymbol.includes('o{')) {
      return { type: 'one-to-many', cardinality: '1:N' }
    }
    if (normalizedSymbol.includes('|{')) {
      return { type: 'one-to-many-required', cardinality: '1:N+' }
    }
    return { type: 'one-to-one', cardinality: '1:1' }
  }
  
  if (normalizedSymbol.includes('}o')) {
    if (normalizedSymbol.includes('o{')) {
      return { type: 'many-to-many', cardinality: 'N:M' }
    }
    if (normalizedSymbol.includes('|{')) {
      return { type: 'many-to-many-required', cardinality: 'N:M+' }
    }
    return { type: 'many-to-one', cardinality: 'N:1' }
  }
  
  return { type: 'one-to-many', cardinality: '1:N' }
}

function normalizeSymbol(symbol: string): string {
  return symbol
    .replace(/--/g, ' -- ')
    .replace(/\s+/g, ' ')
    .trim()
}

function createErEntityNode(
  name: string,
  attributes: ErEntity['attributes'] = []
): NonNullable<MermaidParseResult['nodes']>[0] {
  let text = name
  
  if (attributes.length > 0) {
    const attrLines = attributes.map(attr => {
      const constraints: string[] = []
      
      if (attr.key) {
        const keyUpper = attr.key.toUpperCase()
        if (keyUpper === 'PK' || keyUpper === 'PRIMARY' || keyUpper === 'KEY') {
          constraints.push('pk')
        } else if (keyUpper === 'FK' || keyUpper === 'FOREIGN') {
          constraints.push('fk')
        } else if (keyUpper === 'UK' || keyUpper === 'UNIQUE') {
          constraints.push('unique')
        }
      }
      
      const constraintStr = constraints.length > 0 ? ` [${constraints.join(',')}]` : ''
      return `${attr.name} ${attr.type}${constraintStr}`
    })
    text = name + '\n' + attrLines.join('\n')
  }

  const size = calculateNodeSize('er-table-entity-with-columns', text)
  const colors = getNodeColors('er-table-entity-with-columns')

  return {
    id: name,
    type: 'er-table-entity-with-columns',
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

export function parseErDiagramFromMermaid(code: string): {
  entities: ErEntity[]
  relationships: ErRelationship[]
} {
  const entities = new Map<string, ErEntity>()
  const relationships: ErRelationship[] = []
  
  const lines = cleanLines(code)
  
  let currentEntity: string | null = null
  let entityAttributes: ErEntity['attributes'] = []
  
  for (const line of lines) {
    const entityStartMatch = line.match(/^(\w+)\s*\{/)
    if (entityStartMatch) {
      currentEntity = entityStartMatch[1]
      entityAttributes = []
      continue
    }
    
    if (line === '}' && currentEntity) {
      entities.set(currentEntity, {
        name: currentEntity,
        attributes: entityAttributes,
      })
      currentEntity = null
      continue
    }
    
    if (currentEntity) {
      const attrMatch = line.match(/^(\w+)\s+(\w+)(?:\s+(\w+))?(?:\s+"([^"]*)")?/)
      if (attrMatch) {
        entityAttributes.push({
          name: attrMatch[1],
          type: attrMatch[2],
          key: attrMatch[3],
          comment: attrMatch[4],
        })
      }
      continue
    }
    
    const relationship = parseRelationship(line)
    if (relationship) {
      if (!entities.has(relationship.entity1)) {
        entities.set(relationship.entity1, { name: relationship.entity1, attributes: [] })
      }
      if (!entities.has(relationship.entity2)) {
        entities.set(relationship.entity2, { name: relationship.entity2, attributes: [] })
      }
      relationships.push(relationship)
    }
  }
  
  return {
    entities: Array.from(entities.values()),
    relationships,
  }
}
