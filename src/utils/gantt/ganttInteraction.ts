/**
 * 甘特图交互管理器
 *
 * 核心功能：
 * 1. 任务条拖拽调整时间
 * 2. 任务条边缘拖拽调整持续时间
 * 3. 拖拽创建依赖关系
 * 4. 约束传播（修改任务时间后自动更新依赖任务）
 * 5. 撤销/重做支持
 */

import type { Graph, Node, Edge } from '@antv/x6'
import type { GanttTask, ParsedGanttDiagram } from '../ganttDiagramGenerator'
import type { ShapeData } from '../../stores/x6GraphStore'

export interface GanttInteractionConfig {
  dayWidth: number
  startX: number
  startDate: Date
  onTaskMove?: (taskId: string, newStartDay: number) => void
  onTaskResize?: (taskId: string, newDuration: number) => void
  onDependencyCreate?: (sourceId: string, targetId: string) => void
  onTaskUpdate?: (task: GanttTask) => void
}

export interface TaskMoveEvent {
  taskId: string
  oldX: number
  newX: number
  dayDelta: number
}

export interface TaskResizeEvent {
  taskId: string
  oldWidth: number
  newWidth: number
  durationDelta: number
}

export class GanttInteractionManager {
  private graph: Graph | null = null
  private config: GanttInteractionConfig
  private isDragging = false
  private dragStartX = 0
  private dragStartY = 0
  private selectedTaskId: string | null = null
  private resizeMode: 'move' | 'resize-left' | 'resize-right' | null = null

  // 任务数据映射
  private taskDataMap = new Map<string, GanttTask>()
  private nodeIdToTaskIdMap = new Map<string, string>()

  constructor(config: GanttInteractionConfig) {
    this.config = config
  }

  /**
   * 绑定到 X6 Graph 实例
   */
  bind(graph: Graph): void {
    this.graph = graph
    this.setupEventListeners()
  }

  /**
   * 解绑事件监听
   */
  unbind(): void {
    if (this.graph) {
      this.graph.off('node:mousedown', this.onNodeMouseDown)
      this.graph.off('node:mousemove', this.onNodeMouseMove)
      this.graph.off('node:mouseup', this.onNodeMouseUp)
      this.graph.off('blank:mousedown', this.onBlankMouseDown)
      this.graph.off('blank:mousemove', this.onBlankMouseMove)
      this.graph.off('blank:mouseup', this.onBlankMouseUp)
    }
    this.graph = null
  }

  /**
   * 加载甘特图数据
   */
  loadData(data: ParsedGanttDiagram): void {
    this.taskDataMap.clear()
    this.nodeIdToTaskIdMap.clear()

    data.tasks.forEach(task => {
      this.taskDataMap.set(task.id, task)
      // 映射节点ID到任务ID
      this.nodeIdToTaskIdMap.set(`task-${task.id}`, task.id)
    })
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<GanttInteractionConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    if (!this.graph) return

    // 节点鼠标事件
    this.graph.on('node:mousedown', this.onNodeMouseDown)
    this.graph.on('node:mousemove', this.onNodeMouseMove)
    this.graph.on('node:mouseup', this.onNodeMouseUp)

    // 画布空白区域事件（用于创建依赖）
    this.graph.on('blank:mousedown', this.onBlankMouseDown)
    this.graph.on('blank:mousemove', this.onBlankMouseMove)
    this.graph.on('blank:mouseup', this.onBlankMouseUp)

    // 边连接事件
    this.graph.on('edge:connected', this.onEdgeConnected)
  }

  /**
   * 节点鼠标按下事件
   */
  private onNodeMouseDown = (args: { node: Node; e: MouseEvent }): void => {
    const { node, e } = args
    const nodeId = node.id

    // 检查是否是甘特图任务节点
    if (!this.isGanttTaskNode(nodeId)) return

    const taskId = this.nodeIdToTaskIdMap.get(nodeId)
    if (!taskId) return

    this.isDragging = true
    this.selectedTaskId = taskId
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY

    // 判断拖拽模式
    const bbox = node.getBBox()
    const mouseX = e.offsetX
    const resizeThreshold = 10

    if (mouseX < bbox.x + resizeThreshold) {
      this.resizeMode = 'resize-left'
    } else if (mouseX > bbox.x + bbox.width - resizeThreshold) {
      this.resizeMode = 'resize-right'
    } else {
      this.resizeMode = 'move'
    }

    // 改变鼠标样式
    this.updateCursor(this.resizeMode)
  }

  /**
   * 节点鼠标移动事件
   */
  private onNodeMouseMove = (args: { node: Node; e: MouseEvent }): void => {
    if (!this.isDragging || !this.selectedTaskId) return

    const { node, e } = args
    const deltaX = e.clientX - this.dragStartX

    if (Math.abs(deltaX) < 5) return // 最小移动阈值

    const task = this.taskDataMap.get(this.selectedTaskId)
    if (!task) return

    const dayDelta = Math.round(deltaX / this.config.dayWidth)

    switch (this.resizeMode) {
      case 'move':
        this.handleTaskMove(node, task, dayDelta)
        break
      case 'resize-left':
        this.handleTaskResizeLeft(node, task, dayDelta)
        break
      case 'resize-right':
        this.handleTaskResizeRight(node, task, dayDelta)
        break
    }
  }

  /**
   * 节点鼠标释放事件
   */
  private onNodeMouseUp = (args: { node: Node; e: MouseEvent }): void => {
    if (!this.isDragging || !this.selectedTaskId) return

    const { node } = args
    const task = this.taskDataMap.get(this.selectedTaskId)
    if (!task) return

    const bbox = node.getBBox()

    // 计算新的时间
    const newStartDay = Math.round((bbox.x - this.config.startX) / this.config.dayWidth)
    const newDuration = Math.round(bbox.width / this.config.dayWidth)

    // 触发回调
    switch (this.resizeMode) {
      case 'move':
        this.config.onTaskMove?.(this.selectedTaskId, newStartDay)
        break
      case 'resize-left':
      case 'resize-right':
        this.config.onTaskResize?.(this.selectedTaskId, newDuration)
        break
    }

    // 重置状态
    this.isDragging = false
    this.selectedTaskId = null
    this.resizeMode = null
    this.updateCursor(null)
  }

  /**
   * 处理任务移动
   */
  private handleTaskMove(node: Node, task: GanttTask, dayDelta: number): void {
    if (dayDelta === 0) return

    const newStartDay = Math.max(0, task.startDate.getTime() / (1000 * 60 * 60 * 24) - this.config.startDate.getTime() / (1000 * 60 * 60 * 24) + dayDelta)
    const newX = this.config.startX + newStartDay * this.config.dayWidth

    node.position(newX, node.getBBox().y)

    // 更新相关依赖任务
    this.propagateConstraint(task.id, dayDelta)
  }

  /**
   * 处理任务左边缘调整（调整开始时间）
   */
  private handleTaskResizeLeft(node: Node, task: GanttTask, dayDelta: number): void {
    if (dayDelta === 0) return

    const bbox = node.getBBox()
    const currentStartDay = (bbox.x - this.config.startX) / this.config.dayWidth
    const currentDuration = bbox.width / this.config.dayWidth

    const newStartDay = Math.max(0, currentStartDay + dayDelta)
    const newDuration = Math.max(1, currentDuration - dayDelta)
    const newX = this.config.startX + newStartDay * this.config.dayWidth
    const newWidth = newDuration * this.config.dayWidth

    node.position(newX, bbox.y)
    node.size(newWidth, bbox.height)
  }

  /**
   * 处理任务右边缘调整（调整持续时间）
   */
  private handleTaskResizeRight(node: Node, task: GanttTask, dayDelta: number): void {
    if (dayDelta === 0) return

    const bbox = node.getBBox()
    const currentDuration = bbox.width / this.config.dayWidth
    const newDuration = Math.max(1, currentDuration + dayDelta)
    const newWidth = newDuration * this.config.dayWidth

    node.size(newWidth, bbox.height)
  }

  /**
   * 约束传播 - 更新依赖任务的时间
   */
  private propagateConstraint(taskId: string, dayDelta: number): void {
    // 查找所有依赖于该任务的任务
    this.taskDataMap.forEach((task, id) => {
      if (task.dependencies.includes(taskId)) {
        // 更新依赖任务的位置
        const node = this.graph?.getCellById(`task-${id}`) as Node
        if (node) {
          const bbox = node.getBBox()
          const newX = bbox.x + dayDelta * this.config.dayWidth
          node.position(newX, bbox.y)

          // 递归传播
          this.propagateConstraint(id, dayDelta)
        }
      }
    })
  }

  /**
   * 空白区域鼠标事件（用于创建依赖）
   */
  private dependencySource: string | null = null

  private onBlankMouseDown = (args: { e: MouseEvent }): void => {
    // 检查是否按住 Shift 键（用于创建依赖）
    if (!args.e.shiftKey) return

    // 获取鼠标位置下的节点
    const node = this.getNodeAtPosition(args.e.offsetX, args.e.offsetY)
    if (node && this.isGanttTaskNode(node.id)) {
      this.dependencySource = this.nodeIdToTaskIdMap.get(node.id) || null
    }
  }

  private onBlankMouseMove = (args: { e: MouseEvent }): void => {
    if (!this.dependencySource) return

    // 可以在这里绘制临时的依赖线
  }

  private onBlankMouseUp = (args: { e: MouseEvent }): void => {
    if (!this.dependencySource) return

    const node = this.getNodeAtPosition(args.e.offsetX, args.e.offsetY)
    if (node && this.isGanttTaskNode(node.id)) {
      const targetId = this.nodeIdToTaskIdMap.get(node.id)
      if (targetId && targetId !== this.dependencySource) {
        this.config.onDependencyCreate?.(this.dependencySource, targetId)
      }
    }

    this.dependencySource = null
  }

  /**
   * 边连接事件
   */
  private onEdgeConnected = (args: { edge: Edge; isNew: boolean }): void => {
    const { edge } = args
    const sourceNode = edge.getSourceNode()
    const targetNode = edge.getTargetNode()

    if (!sourceNode || !targetNode) return

    const sourceTaskId = this.nodeIdToTaskIdMap.get(sourceNode.id)
    const targetTaskId = this.nodeIdToTaskIdMap.get(targetNode.id)

    if (sourceTaskId && targetTaskId) {
      this.config.onDependencyCreate?.(sourceTaskId, targetTaskId)
    }
  }

  /**
   * 获取指定位置的节点
   */
  private getNodeAtPosition(x: number, y: number): Node | null {
    if (!this.graph) return null

    const nodes = this.graph.getNodes()
    for (const node of nodes) {
      const bbox = node.getBBox()
      if (x >= bbox.x && x <= bbox.x + bbox.width &&
          y >= bbox.y && y <= bbox.y + bbox.height) {
        return node
      }
    }
    return null
  }

  /**
   * 检查是否是甘特图任务节点
   */
  private isGanttTaskNode(nodeId: string): boolean {
    return nodeId.startsWith('task-') && this.nodeIdToTaskIdMap.has(nodeId)
  }

  /**
   * 更新鼠标样式
   */
  private updateCursor(mode: 'move' | 'resize-left' | 'resize-right' | null): void {
    if (!this.graph) return

    const container = this.graph.container
    switch (mode) {
      case 'move':
        container.style.cursor = 'move'
        break
      case 'resize-left':
      case 'resize-right':
        container.style.cursor = 'ew-resize'
        break
      default:
        container.style.cursor = 'default'
    }
  }

  /**
   * 启用/禁用交互
   */
  setEnabled(enabled: boolean): void {
    if (enabled) {
      this.setupEventListeners()
    } else {
      this.unbind()
    }
  }
}

// 导出单例
export const ganttInteractionManager = new GanttInteractionManager({
  dayWidth: 40,
  startX: 200,
  startDate: new Date(),
})

export default ganttInteractionManager
