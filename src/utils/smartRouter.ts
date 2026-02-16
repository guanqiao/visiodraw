import type { Graph, Node, Edge } from '@antv/x6'

export interface SmartRouterOptions {
  padding: number
  maxIterations: number
  excludeNodes: string[]
  preferredDirection: 'horizontal' | 'vertical' | 'auto'
}

const defaultOptions: SmartRouterOptions = {
  padding: 20,
  maxIterations: 100,
  excludeNodes: [],
  preferredDirection: 'auto',
}

export function optimizeEdgeRouting(
  graph: Graph,
  options: Partial<SmartRouterOptions> = {}
): void {
  const opts = { ...defaultOptions, ...options }
  const edges = graph.getEdges()
  const nodes = graph.getNodes()

  edges.forEach(edge => {
    const source = edge.getSourceCell()
    const target = edge.getTargetCell()

    if (!source || !target) return

    const sourceBBox = source.getBBox()
    const targetBBox = target.getBBox()

    const optimalRouter = calculateOptimalRouter(sourceBBox, targetBBox, nodes, opts)
    
    edge.setRouter(optimalRouter)
  })
}

function calculateOptimalRouter(
  sourceBBox: any,
  targetBBox: any,
  nodes: Node[],
  options: SmartRouterOptions
): { name: string; args?: any } {
  const dx = Math.abs(sourceBBox.center.x - targetBBox.center.x)
  const dy = Math.abs(sourceBBox.center.y - targetBBox.center.y)

  const hasObstacles = checkForObstacles(sourceBBox, targetBBox, nodes, options.excludeNodes)

  if (hasObstacles) {
    return {
      name: 'manhattan',
      args: {
        padding: options.padding,
        maxDirectionChange: 90,
        excludeNodes: options.excludeNodes,
      },
    }
  }

  if (options.preferredDirection === 'horizontal' || (dx > dy && options.preferredDirection === 'auto')) {
    return {
      name: 'manhattan',
      args: {
        padding: options.padding,
        directions: [
          { cost: 1, name: 'right' },
          { cost: 1, name: 'left' },
        ],
      },
    }
  }

  if (options.preferredDirection === 'vertical' || (dy > dx && options.preferredDirection === 'auto')) {
    return {
      name: 'manhattan',
      args: {
        padding: options.padding,
        directions: [
          { cost: 1, name: 'top' },
          { cost: 1, name: 'bottom' },
        ],
      },
    }
  }

  return {
    name: 'manhattan',
    args: {
      padding: options.padding,
    },
  }
}

function checkForObstacles(
  sourceBBox: any,
  targetBBox: any,
  nodes: Node[],
  excludeIds: string[]
): boolean {
  const minX = Math.min(sourceBBox.x, targetBBox.x)
  const maxX = Math.max(sourceBBox.x + sourceBBox.width, targetBBox.x + targetBBox.width)
  const minY = Math.min(sourceBBox.y, targetBBox.y)
  const maxY = Math.max(sourceBBox.y + sourceBBox.height, targetBBox.y + targetBBox.height)

  for (const node of nodes) {
    if (excludeIds.includes(node.id)) continue
    
    const nodeBBox = node.getBBox()
    
    if (nodeBBox.x >= minX && nodeBBox.x + nodeBBox.width <= maxX &&
        nodeBBox.y >= minY && nodeBBox.y + nodeBBox.height <= maxY) {
      if (nodeBBox !== sourceBBox && nodeBBox !== targetBBox) {
        return true
      }
    }
  }

  return false
}

export function minimizeCrossings(graph: Graph): void {
  const edges = graph.getEdges()
  const nodes = graph.getNodes()
  
  const edgePairs: { edge1: Edge; edge2: Edge; crossing: boolean }[] = []
  
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const edge1 = edges[i]
      const edge2 = edges[j]
      
      const crossing = checkEdgeCrossing(edge1, edge2)
      edgePairs.push({ edge1, edge2, crossing })
    }
  }

  const crossingPairs = edgePairs.filter(p => p.crossing)
  
  if (crossingPairs.length > 0) {
    crossingPairs.forEach(({ edge1, edge2 }) => {
      const source1 = edge1.getSourceCell()
      const target1 = edge1.getTargetCell()
      const source2 = edge2.getSourceCell()
      const target2 = edge2.getTargetCell()
      
      if (source1 && target1 && source2 && target2) {
        const source1BBox = source1.getBBox()
        const target1BBox = target1.getBBox()
        const source2BBox = source2.getBBox()
        const target2BBox = target2.getBBox()

        const midY1 = (source1BBox.center.y + target1BBox.center.y) / 2
        const midY2 = (source2BBox.center.y + target2BBox.center.y) / 2
        
        if (Math.abs(midY1 - midY2) < 50) {
          edge1.setRouter({
            name: 'manhattan',
            args: {
              padding: 20,
              startDirections: ['top', 'bottom'],
              endDirections: ['top', 'bottom'],
            },
          })
          
          edge2.setRouter({
            name: 'manhattan',
            args: {
              padding: 20,
              startDirections: ['left', 'right'],
              endDirections: ['left', 'right'],
            },
          })
        }
      }
    })
  }
}

function checkEdgeCrossing(edge1: Edge, edge2: Edge): boolean {
  const source1 = edge1.getSourceCell()
  const target1 = edge1.getTargetCell()
  const source2 = edge2.getSourceCell()
  const target2 = edge2.getTargetCell()

  if (!source1 || !target1 || !source2 || !target2) return false

  const s1BBox = source1.getBBox()
  const t1BBox = target1.getBBox()
  const s2BBox = source2.getBBox()
  const t2BBox = target2.getBBox()

  return doLinesIntersect(
    s1BBox.center.x, s1BBox.center.y, t1BBox.center.x, t1BBox.center.y,
    s2BBox.center.x, s2BBox.center.y, t2BBox.center.x, t2BBox.center.y
  )
}

function doLinesIntersect(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
  if (Math.abs(denom) < 0.0001) return false

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom

  return ua > 0 && ua < 1 && ub > 0 && ub < 1
}

export function optimizeErLayout(graph: Graph): void {
  optimizeEdgeRouting(graph, {
    padding: 30,
    preferredDirection: 'auto',
  })
  
  minimizeCrossings(graph)
}
