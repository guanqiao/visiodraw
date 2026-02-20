/**
 * 任务进度条渲染器
 *
 * 核心功能：
 * 1. 生成带进度条的任务节点
 * 2. 进度条样式和动画
 * 3. 进度文本显示
 * 4. 交互事件处理
 */

import type { Node, Graph } from '@antv/x6'
import type { GanttTask } from './parser/types'
import { taskProgressManager } from './taskProgress'

export interface ProgressBarOptions {
  showText?: boolean // 是否显示进度文本
  textPosition?: 'inside' | 'outside' | 'center' // 文本位置
  barHeight?: number // 进度条高度
  borderRadius?: number // 圆角
  animation?: boolean // 是否启用动画
  colorScheme?: 'default' | 'gradient' | 'striped' // 颜色方案
}

export class ProgressRenderer {
  private graph: Graph | null = null
  private options: Required<ProgressBarOptions>

  constructor(options: ProgressBarOptions = {}) {
    this.options = {
      showText: true,
      textPosition: 'center',
      barHeight: 4,
      borderRadius: 2,
      animation: true,
      colorScheme: 'default',
      ...options,
    }
  }

  /**
   * 绑定到 X6 Graph
   */
  bind(graph: Graph): void {
    this.graph = graph
  }

  /**
   * 创建带进度条的任务节点
   */
  createTaskNodeWithProgress(
    task: GanttTask,
    x: number,
    y: number,
    width: number,
    height: number
  ): Node.Metadata {
    const progress = taskProgressManager.getProgress(task.id)
    const percent = progress?.percent || this.getDefaultProgress(task)

    // 根据任务状态确定颜色
    const color = this.getTaskColor(task)

    // 创建进度条标记
    const markup = this.createProgressMarkup(percent, color)

    return {
      id: `task-${task.id}`,
      shape: 'rect',
      x,
      y,
      width,
      height,
      attrs: {
        body: {
          fill: this.getBackgroundColor(task),
          stroke: color,
          strokeWidth: 1,
          rx: this.options.borderRadius,
          ry: this.options.borderRadius,
        },
        label: {
          text: this.options.showText ? `${task.name} (${percent}%)` : task.name,
          fill: this.getTextColor(task, percent),
          fontSize: 12,
          fontWeight: percent === 100 ? 'normal' : 'bold',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
        },
        // 进度条属性
        progressBar: {
          fill: color,
          width: (percent / 100) * width,
          height: this.options.barHeight,
          x: 0,
          y: height - this.options.barHeight,
          rx: this.options.borderRadius,
          ry: this.options.borderRadius,
        },
        // 进度文本
        progressText: {
          text: `${percent}%`,
          fill: '#ffffff',
          fontSize: 10,
          x: (percent / 100) * width / 2,
          y: height - this.options.barHeight / 2,
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          visibility: percent > 15 ? 'visible' : 'hidden', // 进度太小时不显示
        },
      },
      markup,
      data: {
        task,
        progress: percent,
        type: 'gantt-task',
      },
    }
  }

  /**
   * 创建进度条标记
   */
  private createProgressMarkup(percent: number, color: string): any[] {
    const baseMarkup = [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'text',
        selector: 'label',
      },
    ]

    // 添加进度条
    baseMarkup.push({
      tagName: 'rect',
      selector: 'progressBar',
    })

    // 添加进度文本
    if (this.options.showText && percent > 15) {
      baseMarkup.push({
        tagName: 'text',
        selector: 'progressText',
      })
    }

    // 添加条纹效果（如果启用）
    if (this.options.colorScheme === 'striped' && percent < 100) {
      baseMarkup.push({
        tagName: 'pattern',
        selector: 'stripePattern',
        attrs: {
          id: `stripe-${percent}`,
          patternUnits: 'userSpaceOnUse',
          width: 10,
          height: 10,
        },
        children: [
          {
            tagName: 'rect',
            attrs: {
              width: 10,
              height: 10,
              fill: color,
            },
          },
          {
            tagName: 'line',
            attrs: {
              x1: 0,
              y1: 0,
              x2: 10,
              y2: 10,
              stroke: 'rgba(255,255,255,0.3)',
              'stroke-width': 2,
            },
          },
        ],
      })
    }

    return baseMarkup
  }

  /**
   * 更新任务进度
   */
  updateTaskProgress(taskId: string, newPercent: number): void {
    if (!this.graph) return

    const node = this.graph.getCellById(`task-${taskId}`) as Node
    if (!node) return

    const width = node.getBBox().width
    const height = node.getBBox().height

    // 更新进度条宽度
    node.attr('progressBar/width', (newPercent / 100) * width)

    // 更新进度文本
    node.attr('progressText/text', `${newPercent}%`)
    node.attr('progressText/x', (newPercent / 100) * width / 2)
    node.attr('progressText/visibility', newPercent > 15 ? 'visible' : 'hidden')

    // 更新标签
    const task = node.getData()?.task as GanttTask
    if (task) {
      node.attr('label/text', `${task.name} (${newPercent}%)`)
    }

    // 更新数据
    node.setData({
      ...node.getData(),
      progress: newPercent,
    })

    // 触发动画
    if (this.options.animation) {
      this.animateProgress(node, newPercent)
    }
  }

  /**
   * 进度动画
   */
  private animateProgress(node: Node, targetPercent: number): void {
    const duration = 500 // 动画持续时间（毫秒）
    const startTime = Date.now()
    const width = node.getBBox().width

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数
      const easeProgress = this.easeOutCubic(progress)
      const currentPercent = easeProgress * targetPercent

      node.attr('progressBar/width', (currentPercent / 100) * width)
      node.attr('progressText/x', (currentPercent / 100) * width / 2)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  /**
   * 缓动函数
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }

  /**
   * 获取任务颜色
   */
  private getTaskColor(task: GanttTask): string {
    const colorMap: Record<string, string> = {
      done: '#52c41a',
      active: '#faad14',
      crit: '#ff4d4f',
      default: '#1890ff',
    }
    return colorMap[task.status] || colorMap.default
  }

  /**
   * 获取背景颜色
   */
  private getBackgroundColor(task: GanttTask): string {
    if (task.status === 'done') {
      return '#f6ffed'
    }
    if (task.status === 'crit') {
      return '#fff2f0'
    }
    return '#ffffff'
  }

  /**
   * 获取文本颜色
   */
  private getTextColor(task: GanttTask, percent: number): string {
    if (task.status === 'done') {
      return '#52c41a'
    }
    if (task.status === 'crit') {
      return '#ff4d4f'
    }
    return '#262626'
  }

  /**
   * 获取默认进度
   */
  private getDefaultProgress(task: GanttTask): number {
    switch (task.status) {
      case 'done':
        return 100
      case 'active':
        return 50
      default:
        return 0
    }
  }

  /**
   * 创建进度编辑控件
   */
  createProgressEditor(
    task: GanttTask,
    onChange: (percent: number) => void
  ): HTMLDivElement {
    const container = document.createElement('div')
    container.className = 'gantt-progress-editor'
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background: #fff;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
    `

    const progress = taskProgressManager.getProgress(task.id)
    const currentPercent = progress?.percent || this.getDefaultProgress(task)

    // 滑块
    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = '0'
    slider.max = '100'
    slider.value = String(currentPercent)
    slider.style.cssText = 'width: 150px;'

    // 数值显示
    const valueDisplay = document.createElement('span')
    valueDisplay.textContent = `${currentPercent}%`
    valueDisplay.style.cssText = 'min-width: 40px; font-weight: bold;'

    // 快速设置按钮
    const quickButtons = [0, 25, 50, 75, 100].map(pct => {
      const btn = document.createElement('button')
      btn.textContent = `${pct}%`
      btn.style.cssText = `
        padding: 2px 8px;
        border: 1px solid #d9d9d9;
        background: ${pct === currentPercent ? '#1890ff' : '#fff'};
        color: ${pct === currentPercent ? '#fff' : '#262626'};
        border-radius: 2px;
        cursor: pointer;
        font-size: 12px;
      `
      btn.onclick = () => {
        slider.value = String(pct)
        valueDisplay.textContent = `${pct}%`
        onChange(pct)
      }
      return btn
    })

    // 事件监听
    slider.oninput = () => {
      const value = parseInt(slider.value)
      valueDisplay.textContent = `${value}%`
      onChange(value)
    }

    container.appendChild(slider)
    container.appendChild(valueDisplay)
    quickButtons.forEach(btn => container.appendChild(btn))

    return container
  }

  /**
   * 批量更新进度
   */
  batchUpdateProgress(updates: Array<{ taskId: string; percent: number }>): void {
    updates.forEach(({ taskId, percent }) => {
      this.updateTaskProgress(taskId, percent)
    })
  }

  /**
   * 设置选项
   */
  setOptions(options: Partial<ProgressBarOptions>): void {
    this.options = { ...this.options, ...options }
  }
}

// 导出单例
export const progressRenderer = new ProgressRenderer()
export default progressRenderer
