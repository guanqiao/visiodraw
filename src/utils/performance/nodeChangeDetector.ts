import type { NodeData } from '../../stores/x6GraphStore'

interface NodeChanges {
  positionChanged: boolean
  sizeChanged: boolean
  styleChanged: boolean
  textChanged: boolean
}

/**
 * 检测节点变化
 * 用于优化 Store 同步性能，只更新变化的属性
 */
export function detectNodeChanges(
  oldNode: NodeData | undefined,
  newNode: NodeData
): NodeChanges {
  if (!oldNode) {
    return {
      positionChanged: true,
      sizeChanged: true,
      styleChanged: true,
      textChanged: true,
    }
  }

  return {
    positionChanged: oldNode.x !== newNode.x || oldNode.y !== newNode.y,
    sizeChanged: oldNode.width !== newNode.width || oldNode.height !== newNode.height,
    styleChanged:
      oldNode.fill !== newNode.fill ||
      oldNode.stroke !== newNode.stroke ||
      oldNode.strokeWidth !== newNode.strokeWidth,
    textChanged: oldNode.text !== newNode.text,
  }
}

/**
 * 判断节点是否有任何变化
 */
export function hasNodeChanged(
  oldNode: NodeData | undefined,
  newNode: NodeData
): boolean {
  if (!oldNode) return true

  return (
    oldNode.x !== newNode.x ||
    oldNode.y !== newNode.y ||
    oldNode.width !== newNode.width ||
    oldNode.height !== newNode.height ||
    oldNode.fill !== newNode.fill ||
    oldNode.stroke !== newNode.stroke ||
    oldNode.strokeWidth !== newNode.strokeWidth ||
    oldNode.text !== newNode.text
  )
}

/**
 * 创建节点变更批次
 * 用于批量处理节点变更，减少渲染次数
 */
export interface NodeChangeBatch {
  added: NodeData[]
  removed: string[]
  updated: Array<{ node: NodeData; changes: NodeChanges }>
}

export function createNodeChangeBatch(
  currentNodes: NodeData[],
  previousNodes: NodeData[]
): NodeChangeBatch {
  const previousMap = new Map(previousNodes.map((n) => [n.id, n]))
  const currentIds = new Set(currentNodes.map((n) => n.id))
  const previousIds = new Set(previousNodes.map((n) => n.id))

  const batch: NodeChangeBatch = {
    added: [],
    removed: [],
    updated: [],
  }

  // 找出新增的节点
  for (const node of currentNodes) {
    if (!previousIds.has(node.id)) {
      batch.added.push(node)
    } else {
      // 检查是否有更新
      const oldNode = previousMap.get(node.id)
      if (oldNode && hasNodeChanged(oldNode, node)) {
        batch.updated.push({
          node,
          changes: detectNodeChanges(oldNode, node),
        })
      }
    }
  }

  // 找出删除的节点
  for (const id of previousIds) {
    if (!currentIds.has(id)) {
      batch.removed.push(id)
    }
  }

  return batch
}

/**
 * 防抖函数 - 用于优化高频更新
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数 - 用于优化高频事件
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
