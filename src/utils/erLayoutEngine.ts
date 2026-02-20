import type { ErColumn } from '../types/shapeLibrary'

export type ErLayoutAlgorithm = 'grid' | 'force' | 'hierarchical' | 'smart'

export interface ErLayoutOptions {
  startX: number
  startY: number
  spacingX: number
  spacingY: number
  columnsPerRow: number
  algorithm: ErLayoutAlgorithm
  maxIterations?: number
  convergenceThreshold?: number
}

export const defaultLayoutOptions: ErLayoutOptions = {
  startX: 100,
  startY: 100,
  spacingX: 280,
  spacingY: 350,
  columnsPerRow: 3,
  algorithm: 'grid',
  maxIterations: 100,
  convergenceThreshold: 0.01,
}

export interface ErTableNode {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  columns: ErColumn[]
  foreignKeys?: ForeignKeyRelation[]
}

export interface ForeignKeyRelation {
  column: string
  refTable: string
  refColumn: string
  onDelete?: string
  onUpdate?: string
}

export interface ErLayoutEdge {
  sourceId: string
  targetId: string
  sourceColumn: string
  targetColumn: string
}

export interface ErLayoutResult {
  nodes: ErTableNode[]
  edges: ErLayoutEdge[]
}

export interface ErLayoutInput {
  id: string
  name: string
  columns: ErColumn[]
  foreignKeys?: ForeignKeyRelation[]
}

function calculateNodeSize(columns: ErColumn[]): { width: number; height: number } {
  const columnCount = columns.length
  const height = Math.max(100, 50 + columnCount * 28)
  const width = Math.max(180, 200)
  return { width, height }
}

export function calculateErLayout(
  tables: ErLayoutInput[],
  options: Partial<ErLayoutOptions> = {}
): ErLayoutResult {
  const opts = { ...defaultLayoutOptions, ...options }
  
  const nodes: ErTableNode[] = tables.map((table, index) => {
    const size = calculateNodeSize(table.columns)
    
    return {
      id: table.id || `er-table-${index}`,
      name: table.name,
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
      columns: table.columns,
      foreignKeys: table.foreignKeys,
    }
  })
  
  const tableNameToId = new Map<string, string>()
  tables.forEach((table, index) => {
    tableNameToId.set(table.name.toLowerCase(), table.id || `er-table-${index}`)
  })
  
  const edges: ErLayoutEdge[] = []
  tables.forEach((table, sourceIndex) => {
    if (table.foreignKeys) {
      for (const fk of table.foreignKeys) {
        const targetId = tableNameToId.get(fk.refTable.toLowerCase())
        if (targetId) {
          edges.push({
            sourceId: table.id || `er-table-${sourceIndex}`,
            targetId,
            sourceColumn: fk.column,
            targetColumn: fk.refColumn,
          })
        }
      }
    }
  })
  
  switch (opts.algorithm) {
    case 'hierarchical':
      applyHierarchicalLayout(nodes, edges, opts)
      break
    case 'force':
      applyForceLayout(nodes, edges, opts)
      break
    case 'smart':
      applySmartLayout(nodes, edges, opts)
      break
    case 'grid':
    default:
      applyGridLayout(nodes, opts)
  }
  
  return { nodes, edges }
}

export function applyGridLayout(
  nodes: ErTableNode[],
  options: ErLayoutOptions
): void {
  const cols = Math.max(options.columnsPerRow, Math.ceil(Math.sqrt(nodes.length)))
  
  nodes.forEach((node, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols
    
    const spacingX = options.spacingX + node.width * 0.2
    const spacingY = options.spacingY + node.height * 0.2
    
    node.x = options.startX + col * spacingX
    node.y = options.startY + row * spacingY
  })
}

export function applyHierarchicalLayout(
  nodes: ErTableNode[],
  edges: ErLayoutEdge[],
  options: ErLayoutOptions
): void {
  const nodeMap = new Map<string, ErTableNode>()
  nodes.forEach(node => nodeMap.set(node.id, node))
  
  const inDegree = new Map<string, number>()
  const outDegree = new Map<string, number>()
  nodes.forEach(node => {
    inDegree.set(node.id, 0)
    outDegree.set(node.id, 0)
  })
  
  edges.forEach(edge => {
    const currentIn = inDegree.get(edge.sourceId) || 0
    const currentOut = outDegree.get(edge.targetId) || 0
    inDegree.set(edge.sourceId, currentIn + 1)
    outDegree.set(edge.targetId, currentOut + 1)
  })
  
  const levels: string[][] = []
  const assigned = new Set<string>()
  
  const rootNodes = nodes.filter(n => (inDegree.get(n.id) || 0) === 0)
  
  if (rootNodes.length > 0) {
    levels.push(rootNodes.map(n => n.id))
    rootNodes.forEach(n => assigned.add(n.id))
  }
  
  let maxIterations = nodes.length * 2
  let iterations = 0
  
  while (assigned.size < nodes.length && iterations < maxIterations) {
    const nextLevel: string[] = []
    
    for (const nodeId of Array.from(assigned)) {
      for (const edge of edges) {
        if (edge.targetId === nodeId && !assigned.has(edge.sourceId)) {
          nextLevel.push(edge.sourceId)
          assigned.add(edge.sourceId)
        }
        if (edge.sourceId === nodeId && !assigned.has(edge.targetId)) {
          nextLevel.push(edge.targetId)
          assigned.add(edge.targetId)
        }
      }
    }
    
    if (nextLevel.length === 0) {
      const remaining = nodes.filter(n => !assigned.has(n.id))
      if (remaining.length > 0) {
        levels.push(remaining.map(n => n.id))
        remaining.forEach(n => assigned.add(n.id))
      }
      break
    }
    
    levels.push([...new Set(nextLevel)])
    iterations++
  }
  
  let maxWidth = 0
  levels.forEach(level => {
    const levelWidth = level.length * options.spacingX
    maxWidth = Math.max(maxWidth, levelWidth)
  })
  
  levels.forEach((level, levelIndex) => {
    const levelWidth = level.length * options.spacingX
    const startX = options.startX + Math.max(0, (maxWidth - levelWidth) / 2)
    
    level.forEach((nodeId, colIndex) => {
      const node = nodeMap.get(nodeId)
      if (node) {
        node.x = startX + colIndex * options.spacingX
        node.y = options.startY + levelIndex * (options.spacingY + node.height * 0.3)
      }
    })
  })
}

export function applyForceLayout(
  nodes: ErTableNode[],
  edges: ErLayoutEdge[],
  options: ErLayoutOptions
): void {
  const canvasWidth = Math.max(800, nodes.length * 250)
  const canvasHeight = Math.max(600, Math.ceil(nodes.length / 3) * 350)
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  const radius = Math.min(canvasWidth, canvasHeight) * 0.35
  
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length
    node.x = centerX + radius * Math.cos(angle)
    node.y = centerY + radius * Math.sin(angle)
  })
  
  const maxIterations = options.maxIterations || 100
  const convergenceThreshold = options.convergenceThreshold || 0.01
  const k = Math.sqrt((canvasWidth * canvasHeight) / Math.max(1, nodes.length)) * 0.5
  const positions = nodes.map(n => ({ x: n.x, y: n.y }))
  
  let prevEnergy = Infinity
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const displacements = positions.map(() => ({ x: 0, y: 0 }))
    const temperature = Math.max(0.1, 1 - iter / maxIterations)
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x
        const dy = positions[j].y - positions[i].y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const repulsiveForce = (k * k) / distance
        const fx = (dx / distance) * repulsiveForce * 0.5
        const fy = (dy / distance) * repulsiveForce * 0.5
        
        displacements[i].x -= fx
        displacements[i].y -= fy
        displacements[j].x += fx
        displacements[j].y += fy
      }
    }
    
    for (const edge of edges) {
      const sourceIndex = nodes.findIndex(n => n.id === edge.sourceId)
      const targetIndex = nodes.findIndex(n => n.id === edge.targetId)
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const dx = positions[targetIndex].x - positions[sourceIndex].x
        const dy = positions[targetIndex].y - positions[sourceIndex].y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        
        const attractiveForce = (distance * distance) / k
        const fx = (dx / distance) * attractiveForce * 0.1
        const fy = (dy / distance) * attractiveForce * 0.1
        
        displacements[sourceIndex].x += fx
        displacements[sourceIndex].y += fy
        displacements[targetIndex].x -= fx
        displacements[targetIndex].y -= fy
      }
    }
    
    let totalDisplacement = 0
    for (let i = 0; i < positions.length; i++) {
      const disp = displacements[i]
      const dispLength = Math.sqrt(disp.x * disp.x + disp.y * disp.y) || 1
      const limitedDisp = Math.min(dispLength, temperature * 150)
      
      positions[i].x += (disp.x / dispLength) * limitedDisp
      positions[i].y += (disp.y / dispLength) * limitedDisp
      
      positions[i].x = Math.max(50, Math.min(canvasWidth - 50, positions[i].x))
      positions[i].y = Math.max(50, Math.min(canvasHeight - 50, positions[i].y))
      
      totalDisplacement += limitedDisp
    }
    
    const avgDisplacement = totalDisplacement / nodes.length
    if (Math.abs(prevEnergy - avgDisplacement) < convergenceThreshold && iter > 10) {
      break
    }
    prevEnergy = avgDisplacement
  }
  
  nodes.forEach((node, index) => {
    node.x = positions[index].x
    node.y = positions[index].y
  })
}

export function applySmartLayout(
  nodes: ErTableNode[],
  edges: ErLayoutEdge[],
  options: ErLayoutOptions
): void {
  const nodeMap = new Map<string, ErTableNode>()
  nodes.forEach(node => nodeMap.set(node.id, node))
  
  const adjacencyList = new Map<string, Set<string>>()
  nodes.forEach(node => adjacencyList.set(node.id, new Set()))
  
  edges.forEach(edge => {
    adjacencyList.get(edge.sourceId)?.add(edge.targetId)
    adjacencyList.get(edge.targetId)?.add(edge.sourceId)
  })
  
  const clusters: string[][] = []
  const visited = new Set<string>()
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const cluster: string[] = []
      const queue = [node.id]
      
      while (queue.length > 0) {
        const current = queue.shift()!
        if (visited.has(current)) continue
        visited.add(current)
        cluster.push(current)
        
        const neighbors = adjacencyList.get(current) || new Set()
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor)
          }
        }
      }
      
      if (cluster.length > 0) {
        clusters.push(cluster)
      }
    }
  }
  
  clusters.sort((a, b) => b.length - a.length)
  
  let globalX = options.startX
  let globalY = options.startY
  const clusterSpacingX = options.spacingX + 120
  const clusterSpacingY = options.spacingY + 100
  
  for (const cluster of clusters) {
    const clusterNodes = cluster.map(id => nodeMap.get(id)!).filter(Boolean)
    
    if (clusterNodes.length === 1) {
      const node = clusterNodes[0]
      node.x = globalX
      node.y = globalY
      globalX += clusterSpacingX
    } else {
      const clusterInDegree = new Map<string, number>()
      clusterNodes.forEach(n => clusterInDegree.set(n.id, 0))
      
      for (const edge of edges) {
        if (cluster.includes(edge.sourceId)) {
          const current = clusterInDegree.get(edge.sourceId) || 0
          clusterInDegree.set(edge.sourceId, current + 1)
        }
      }
      
      const sortedNodes = [...clusterNodes].sort(
        (a, b) => (clusterInDegree.get(a.id) || 0) - (clusterInDegree.get(b.id) || 0)
      )
      
      const cols = Math.ceil(Math.sqrt(clusterNodes.length))
      sortedNodes.forEach((node, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols
        node.x = globalX + col * options.spacingX
        node.y = globalY + row * options.spacingY
      })
      
      globalY += Math.ceil(clusterNodes.length / cols) * options.spacingY + 100
    }
  }
}

export function calculateBoundingBox(
  nodes: ErTableNode[]
): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  for (const node of nodes) {
    minX = Math.min(minX, node.x)
    minY = Math.min(minY, node.y)
    maxX = Math.max(maxX, node.x + node.width)
    maxY = Math.max(maxY, node.y + node.height)
  }
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function centerLayout(
  nodes: ErTableNode[],
  canvasWidth: number,
  canvasHeight: number
): void {
  const bbox = calculateBoundingBox(nodes)
  
  const offsetX = (canvasWidth - bbox.width) / 2 - bbox.minX
  const offsetY = (canvasHeight - bbox.height) / 2 - bbox.minY
  
  nodes.forEach(node => {
    node.x += offsetX
    node.y += offsetY
  })
}
