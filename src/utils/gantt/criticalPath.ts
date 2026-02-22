/**
 * 关键路径算法 (Critical Path Method - CPM)
 * 
 * 核心功能：
 * 1. 计算每个任务的最早开始/结束时间 (ES/EF)
 * 2. 计算每个任务的最晚开始/结束时间 (LS/LF)
 * 3. 计算每个任务的总浮动时间 (Total Float)
 * 4. 识别关键路径上的任务
 * 
 * 算法步骤：
 * 1. 拓扑排序任务依赖图
 * 2. 前向遍历计算最早时间
 * 3. 后向遍历计算最晚时间
 * 4. 识别关键任务 (TF = 0)
 */

import type { GanttTask } from '../ganttDiagramGenerator'

export interface GanttDependency {
  id: string
  sourceTaskId: string
  targetTaskId: string
  type?: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
}

export interface TaskTimeData {
  taskId: string
  earliestStart: number  // 最早开始时间（从项目开始的天数）
  earliestFinish: number // 最早结束时间
  latestStart: number    // 最晚开始时间
  latestFinish: number   // 最晚结束时间
  totalFloat: number     // 总浮动时间（可延迟天数）
  freeFloat: number      // 自由浮动时间
  isCritical: boolean    // 是否在关键路径上
}

export interface CriticalPathResult {
  taskTimes: Map<string, TaskTimeData>
  criticalPath: string[]           // 关键路径任务ID列表（按顺序）
  projectDuration: number          // 项目总工期（天数）
  criticalPathCount: number        // 关键路径数量
}

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export interface DependencyWithType {
  sourceId: string
  targetId: string
  type: DependencyType
  lag: number  // 延迟天数（可为负值表示提前）
}

export class CriticalPathCalculator {
  /**
   * 计算关键路径
   */
  calculate(
    tasks: GanttTask[],
    dependencies: DependencyWithType[] = []
  ): CriticalPathResult {
    if (tasks.length === 0) {
      return {
        taskTimes: new Map(),
        criticalPath: [],
        projectDuration: 0,
        criticalPathCount: 0,
      }
    }

    // 构建依赖图
    const graph = this.buildDependencyGraph(tasks, dependencies)
    
    // 拓扑排序
    const { sorted: sortedTasks, hasCycle } = this.topologicalSort(tasks, graph)
    
    if (hasCycle) {
      console.warn('[CriticalPath] 存在循环依赖，关键路径计算可能不准确')
    }
    
    // 计算最早时间（前向遍历）
    const earliestTimes = this.calculateEarliestTimes(sortedTasks, dependencies)
    
    // 计算最晚时间（后向遍历）
    const latestTimes = this.calculateLatestTimes(sortedTasks, dependencies, earliestTimes)
    
    // 整合结果
    const taskTimes = this.buildTaskTimeData(tasks, earliestTimes, latestTimes)
    
    // 识别关键路径
    const criticalPath = this.identifyCriticalPath(sortedTasks, taskTimes)
    
    // 计算项目总工期
    const projectDuration = Math.max(...Array.from(earliestTimes.values()).map(t => t.earliestFinish))
    
    return {
      taskTimes,
      criticalPath,
      projectDuration,
      criticalPathCount: 1, // 简化处理，实际可能有多个关键路径
    }
  }

  /**
   * 构建依赖图（邻接表）
   */
  private buildDependencyGraph(
    tasks: GanttTask[],
    dependencies: DependencyWithType[]
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>()
    
    // 初始化
    tasks.forEach(task => {
      graph.set(task.id, [])
    })
    
    // 添加依赖边
    dependencies.forEach(dep => {
      const adjList = graph.get(dep.targetId) || []
      if (!adjList.includes(dep.sourceId)) {
        adjList.push(dep.sourceId)
      }
      graph.set(dep.targetId, adjList)
    })
    
    // 处理任务内置的 dependencies
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        const adjList = graph.get(task.id) || []
        if (!adjList.includes(depId)) {
          adjList.push(depId)
        }
        graph.set(task.id, adjList)
      })
    })
    
    return graph
  }

  /**
   * 检测循环依赖
   */
  private detectCycle(
    tasks: GanttTask[],
    graph: Map<string, string[]>
  ): { hasCycle: boolean; cyclePath: string[] } {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    const dfs = (taskId: string): boolean => {
      visited.add(taskId)
      recursionStack.add(taskId)
      path.push(taskId)

      const neighbors = graph.get(taskId) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true
        } else if (recursionStack.has(neighbor)) {
          // 发现环
          const cycleStart = path.indexOf(neighbor)
          return true
        }
      }

      path.pop()
      recursionStack.delete(taskId)
      return false
    }

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        if (dfs(task.id)) {
          return { hasCycle: true, cyclePath: [...path] }
        }
      }
    }

    return { hasCycle: false, cyclePath: [] }
  }

  /**
   * 拓扑排序（Kahn算法）
   */
  private topologicalSort(
    tasks: GanttTask[],
    graph: Map<string, string[]>
  ): { sorted: GanttTask[]; hasCycle: boolean } {
    // 先检测循环
    const cycleCheck = this.detectCycle(tasks, graph)
    if (cycleCheck.hasCycle) {
      console.warn('[CriticalPath] 检测到循环依赖:', cycleCheck.cyclePath.join(' -> '))
      return { sorted: [...tasks], hasCycle: true }
    }

    const inDegree = new Map<string, number>()
    const result: GanttTask[] = []
    const queue: string[] = []
    
    // 初始化入度
    tasks.forEach(task => {
      inDegree.set(task.id, graph.get(task.id)?.length || 0)
      if (inDegree.get(task.id) === 0) {
        queue.push(task.id)
      }
    })
    
    // 处理队列
    let iterationCount = 0
    const maxIterations = tasks.length * 2 // 安全限制
    
    while (queue.length > 0 && iterationCount < maxIterations) {
      iterationCount++
      const taskId = queue.shift()!
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        result.push(task)
      }
      
      // 减少后继节点的入度
      tasks.forEach(t => {
        const deps = graph.get(t.id) || []
        if (deps.includes(taskId)) {
          const newDegree = (inDegree.get(t.id) || 0) - 1
          inDegree.set(t.id, newDegree)
          if (newDegree === 0) {
            queue.push(t.id)
          }
        }
      })
    }
    
    // 如果迭代次数超过限制，说明有异常
    if (iterationCount >= maxIterations) {
      console.warn('[CriticalPath] 拓扑排序迭代次数超过限制，可能存在异常依赖')
      return { sorted: [...tasks], hasCycle: false }
    }
    
    return { sorted: result, hasCycle: false }
  }

  /**
   * 计算最早开始/结束时间（前向遍历）
   */
  private calculateEarliestTimes(
    sortedTasks: GanttTask[],
    dependencies: DependencyWithType[]
  ): Map<string, { earliestStart: number; earliestFinish: number }> {
    const times = new Map<string, { earliestStart: number; earliestFinish: number }>()
    
    sortedTasks.forEach(task => {
      let earliestStart = 0
      
      // 查找所有前置依赖
      const taskDeps = dependencies.filter(d => d.targetId === task.id)
      const builtInDeps = task.dependencies.map(depId => ({
        sourceId: depId,
        targetId: task.id,
        type: 'FS' as DependencyType,
        lag: 0,
      }))
      
      const allDeps = [...taskDeps, ...builtInDeps]
      
      if (allDeps.length > 0) {
        let maxPredecessorFinish = 0
        
        allDeps.forEach(dep => {
          const sourceTime = times.get(dep.sourceId)
          if (sourceTime) {
            let predecessorFinish = 0
            
            switch (dep.type) {
              case 'FS': // 结束后开始
                predecessorFinish = sourceTime.earliestFinish + dep.lag
                break
              case 'SS': // 后开始
                predecessorFinish = sourceTime.earliestStart + dep.lag
                break
              case 'FF': // 后结束
                predecessorFinish = sourceTime.earliestFinish + dep.lag - task.duration
                break
              case 'SF': // 开始结束
                predecessorFinish = sourceTime.earliestStart + dep.lag - task.duration
                break
            }
            
            maxPredecessorFinish = Math.max(maxPredecessorFinish, predecessorFinish)
          }
        })
        
        earliestStart = Math.max(0, maxPredecessorFinish)
      }
      
      times.set(task.id, {
        earliestStart,
        earliestFinish: earliestStart + task.duration,
      })
    })
    
    return times
  }

  /**
   * 计算最晚开始/结束时间（后向遍历）
   */
  private calculateLatestTimes(
    sortedTasks: GanttTask[],
    dependencies: DependencyWithType[],
    earliestTimes: Map<string, { earliestStart: number; earliestFinish: number }>
  ): Map<string, { latestStart: number; latestFinish: number }> {
    const times = new Map<string, { latestStart: number; latestFinish: number }>()
    const projectDuration = Math.max(...Array.from(earliestTimes.values()).map(t => t.earliestFinish))
    
    // 反向遍历
    for (let i = sortedTasks.length - 1; i >= 0; i--) {
      const task = sortedTasks[i]
      
      // 查找所有后继任务
      const successors = dependencies.filter(d => d.sourceId === task.id)
      const builtInSuccessors = sortedTasks
        .filter(t => t.dependencies.includes(task.id))
        .map(t => ({
          sourceId: task.id,
          targetId: t.id,
          type: 'FS' as DependencyType,
          lag: 0,
        }))
      
      const allSuccessors = [...successors, ...builtInSuccessors]
      
      let latestFinish = projectDuration
      
      if (allSuccessors.length > 0) {
        let minSuccessorStart = projectDuration
        
        allSuccessors.forEach(succ => {
          const targetTime = times.get(succ.targetId)
          if (targetTime) {
            let successorStart = projectDuration
            
            switch (succ.type) {
              case 'FS': // 结束后开始
                successorStart = targetTime.latestStart - succ.lag
                break
              case 'SS': // 后开始
                successorStart = targetTime.latestStart - succ.lag
                break
              case 'FF': // 后结束
                successorStart = targetTime.latestFinish - succ.lag
                break
              case 'SF': // 开始结束
                successorStart = targetTime.latestFinish - succ.lag
                break
            }
            
            minSuccessorStart = Math.min(minSuccessorStart, successorStart)
          }
        })
        
        latestFinish = minSuccessorStart
      }
      
      times.set(task.id, {
        latestFinish,
        latestStart: latestFinish - task.duration,
      })
    }
    
    return times
  }

  /**
   * 构建任务时间数据
   */
  private buildTaskTimeData(
    tasks: GanttTask[],
    earliestTimes: Map<string, { earliestStart: number; earliestFinish: number }>,
    latestTimes: Map<string, { latestStart: number; latestFinish: number }>
  ): Map<string, TaskTimeData> {
    const result = new Map<string, TaskTimeData>()
    
    tasks.forEach(task => {
      const earliest = earliestTimes.get(task.id)!
      const latest = latestTimes.get(task.id)!
      const totalFloat = latest.latestStart - earliest.earliestStart
      
      result.set(task.id, {
        taskId: task.id,
        earliestStart: earliest.earliestStart,
        earliestFinish: earliest.earliestFinish,
        latestStart: latest.latestStart,
        latestFinish: latest.latestFinish,
        totalFloat,
        freeFloat: totalFloat, // 简化计算
        isCritical: Math.abs(totalFloat) < 0.001, // 浮动时间为0即为关键任务
      })
    })
    
    return result
  }

  /**
   * 识别关键路径
   */
  private identifyCriticalPath(
    sortedTasks: GanttTask[],
    taskTimes: Map<string, TaskTimeData>
  ): string[] {
    return sortedTasks
      .filter(task => taskTimes.get(task.id)?.isCritical)
      .map(task => task.id)
  }
}

// 导出单例实例
export const criticalPathCalculator = new CriticalPathCalculator()
export default criticalPathCalculator
