/**
 * 智能布局引擎
 * 实现类似 dagre 的层级布局算法
 * 用于优化 Mermaid 导入图形的自动布局
 */

import type { TemplateNode, TemplateEdge } from '../types/diagramTemplate'

/**
 * 布局方向
 */
export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL'

/**
 * 布局配置
 */
export interface LayoutConfig {
  direction: LayoutDirection
  nodeWidth: number
  nodeHeight: number
  rankSpacing: number
  nodeSpacing: number
  padding: number
}

/**
 * 默认布局配置
 */
export const defaultLayoutConfig: LayoutConfig = {
  direction: 'TB',
  nodeWidth: 120,
  nodeHeight: 60,
  rankSpacing: 100,
  nodeSpacing: 50,
  padding: 50,
}

/**
 * 图节点
 */
interface GraphNode {
  id: string
  rank: number
  order: number
  width: number
  height: number
  x: number
  y: number
}

/**
 * 图边
 */
interface GraphEdge {
  source: string
  target: string
}

/**
 * 计算布局
 * @param nodes 节点列表
 * @param edges 边列表
 * @param config 布局配置
 * @returns 布局后的节点列表
 */
export function calculateLayout(
  nodes: TemplateNode[],
  edges: TemplateEdge[],
  config: Partial<LayoutConfig> = {}
): TemplateNode[] {
  const fullConfig = { ...defaultLayoutConfig, ...config }
  
  if (nodes.length === 0) return []
  
  // 构建图结构
  const graphNodes = new Map<string, GraphNode>()
  const graphEdges: GraphEdge[] = []
  
  // 初始化节点
  nodes.forEach((node, index) => {
    graphNodes.set(node.id, {
      id: node.id,
      rank: 0,
      order: index,
      width: node.width || fullConfig.nodeWidth,
      height: node.height || fullConfig.nodeHeight,
      x: 0,
      y: 0,
    })
  })
  
  // 初始化边
  edges.forEach(edge => {
    if (graphNodes.has(edge.source) && graphNodes.has(edge.target)) {
      graphEdges.push({ source: edge.source, target: edge.target })
    }
  })
  
  // 1. 拓扑排序确定层级
  assignRanks(graphNodes, graphEdges, fullConfig.direction)
  
  // 2. 同层节点排序（减少交叉）
  orderNodesInRanks(graphNodes, graphEdges)
  
  // 3. 计算坐标位置
  calculatePositions(graphNodes, fullConfig)
  
  // 4. 应用方向转换
  applyDirectionTransform(graphNodes, fullConfig.direction, fullConfig)
  
  // 5. 更新原始节点位置
  return nodes.map(node => {
    const graphNode = graphNodes.get(node.id)
    if (graphNode) {
      return {
        ...node,
        x: graphNode.x,
        y: graphNode.y,
      }
    }
    return node
  })
}

/**
 * 分配层级（拓扑排序）
 */
function assignRanks(
  nodes: Map<string, GraphNode>,
  edges: GraphEdge[],
  direction: LayoutDirection
): void {
  // 计算入度
  const inDegree = new Map<string, number>()
  const outEdges = new Map<string, string[]>()
  
  nodes.forEach((_, id) => {
    inDegree.set(id, 0)
    outEdges.set(id, [])
  })
  
  edges.forEach(edge => {
    const source = direction === 'BT' || direction === 'RL' ? edge.target : edge.source
    const target = direction === 'BT' || direction === 'RL' ? edge.source : edge.target
    
    inDegree.set(target, (inDegree.get(target) || 0) + 1)
    outEdges.get(source)?.push(target)
  })
  
  // 拓扑排序
  const queue: string[] = []
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id)
  })
  
  const ranks = new Map<string, number>()
  
  while (queue.length > 0) {
    const id = queue.shift()!
    const currentRank = ranks.get(id) || 0
    
    outEdges.get(id)?.forEach(neighbor => {
      const newRank = currentRank + 1
      if (!ranks.has(neighbor) || ranks.get(neighbor)! < newRank) {
        ranks.set(neighbor, newRank)
      }
      
      const newDegree = (inDegree.get(neighbor) || 0) - 1
      inDegree.set(neighbor, newDegree)
      if (newDegree === 0) {
        queue.push(neighbor)
      }
    })
  }
  
  // 应用层级
  ranks.forEach((rank, id) => {
    const node = nodes.get(id)
    if (node) {
      node.rank = rank
    }
  })
  
  // 处理孤立节点（没有边的节点）
  nodes.forEach((node, id) => {
    if (!ranks.has(id)) {
      node.rank = 0
    }
  })
}

/**
 * 同层节点排序（减少边交叉）
 */
function orderNodesInRanks(
  nodes: Map<string, GraphNode>,
  edges: GraphEdge[]
): void {
  // 按层级分组
  const rankGroups = new Map<number, GraphNode[]>()
  
  nodes.forEach(node => {
    if (!rankGroups.has(node.rank)) {
      rankGroups.set(node.rank, [])
    }
    rankGroups.get(node.rank)?.push(node)
  })
  
  // 按连接关系排序（简单的启发式算法）
  const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b)
  
  sortedRanks.forEach((rank, rankIndex) => {
    const group = rankGroups.get(rank) || []
    
    if (rankIndex === 0) {
      // 第一层按 ID 排序
      group.sort((a, b) => a.id.localeCompare(b.id))
    } else {
      // 后续层根据前一层连接排序
      const prevRank = sortedRanks[rankIndex - 1]
      const prevGroup = rankGroups.get(prevRank) || []
      
      // 计算每个节点的平均连接位置
      const getAverageConnectionPos = (node: GraphNode): number => {
        const connectedFromPrev = edges
          .filter(e => e.target === node.id)
          .map(e => prevGroup.findIndex(n => n.id === e.source))
          .filter(idx => idx >= 0)
        
        if (connectedFromPrev.length === 0) return Infinity
        return connectedFromPrev.reduce((a, b) => a + b, 0) / connectedFromPrev.length
      }
      
      group.sort((a, b) => getAverageConnectionPos(a) - getAverageConnectionPos(b))
    }
    
    // 分配顺序
    group.forEach((node, index) => {
      node.order = index
    })
  })
}

/**
 * 计算坐标位置
 */
function calculatePositions(
  nodes: Map<string, GraphNode>,
  config: LayoutConfig
): void {
  // 按层级分组
  const rankGroups = new Map<number, GraphNode[]>()
  
  nodes.forEach(node => {
    if (!rankGroups.has(node.rank)) {
      rankGroups.set(node.rank, [])
    }
    rankGroups.get(node.rank)?.push(node)
  })
  
  // 计算 Y 坐标（层级方向）
  const sortedRanks = Array.from(rankGroups.keys()).sort((a, b) => a - b)
  
  sortedRanks.forEach((rank, index) => {
    const y = config.padding + index * (config.nodeHeight + config.rankSpacing)
    const group = rankGroups.get(rank) || []
    
    group.forEach(node => {
      node.y = y
    })
  })
  
  // 计算 X 坐标（同层内）
  rankGroups.forEach(group => {
    const totalWidth = group.length * config.nodeWidth + (group.length - 1) * config.nodeSpacing
    const startX = config.padding
    
    group.forEach((node, index) => {
      node.x = startX + index * (config.nodeWidth + config.nodeSpacing)
    })
  })
}

/**
 * 应用方向转换
 */
function applyDirectionTransform(
  nodes: Map<string, GraphNode>,
  direction: LayoutDirection,
  config: LayoutConfig
): void {
  if (direction === 'TB') return // 默认方向，无需转换
  
  const maxX = Math.max(...Array.from(nodes.values()).map(n => n.x + n.width))
  const maxY = Math.max(...Array.from(nodes.values()).map(n => n.y + n.height))
  
  nodes.forEach(node => {
    switch (direction) {
      case 'BT':
        node.y = maxY - node.y - node.height + config.padding * 2
        break
      case 'LR':
        // 交换 X 和 Y
        const tempX = node.x
        node.x = node.y
        node.y = tempX
        break
      case 'RL':
        // 交换 X 和 Y，然后水平翻转
        const tempX2 = node.x
        node.x = maxY - node.y - node.height + config.padding * 2
        node.y = tempX2
        break
    }
  })
}

/**
 * 从 Mermaid 代码解析方向
 */
export function parseDirectionFromCode(code: string): LayoutDirection {
  const directionMatch = code.match(/(?:flowchart|graph)\s+(TD|TB|BT|LR|RL)/i)
  if (directionMatch) {
    const dir = directionMatch[1].toUpperCase()
    // TD is an alias for TB in Mermaid
    if (dir === 'TD') return 'TB'
    return dir as LayoutDirection
  }
  return 'TB'
}

/**
 * 简单的网格布局（用于没有边的节点）
 */
export function calculateGridLayout(
  nodes: TemplateNode[],
  config: Partial<LayoutConfig> = {}
): TemplateNode[] {
  const fullConfig = { ...defaultLayoutConfig, ...config }
  const cols = Math.ceil(Math.sqrt(nodes.length))
  
  return nodes.map((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    
    return {
      ...node,
      x: fullConfig.padding + col * (fullConfig.nodeWidth + fullConfig.nodeSpacing),
      y: fullConfig.padding + row * (fullConfig.nodeHeight + fullConfig.rankSpacing),
    }
  })
}
