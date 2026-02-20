import type { MermaidParseResult } from '../../types/diagramTemplate'
import { cleanLines } from './baseParser'

export function parseGitgraphDiagram(code: string): MermaidParseResult {
  const nodes: MermaidParseResult['nodes'] = []
  const edges: MermaidParseResult['edges'] = []

  const lines = cleanLines(code)

  let currentBranch = 'main'
  let xOffset = 100
  const branchYMap = new Map<string, number>()
  const commitMap = new Map<string, string>()

  branchYMap.set('main', 100)

  for (const line of lines) {
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

    const branchMatch = line.match(/^branch\s+(\w+)/i)
    if (branchMatch) {
      const branchName = branchMatch[1]
      currentBranch = branchName
      branchYMap.set(branchName, 100 + branchYMap.size * 80)
      continue
    }

    const checkoutMatch = line.match(/^checkout\s+(\w+)/i)
    if (checkoutMatch) {
      currentBranch = checkoutMatch[1]
      continue
    }

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
