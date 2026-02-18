import { Graph } from '@antv/x6'
import { devWarn } from '../logger'

export interface GradientStop {
  offset: number
  color: string
  opacity?: number
}

export interface LinearGradientConfig {
  type: 'linear'
  id: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  stops: GradientStop[]
}

export interface RadialGradientConfig {
  type: 'radial'
  id: string
  cx?: number | string
  cy?: number | string
  r?: number | string
  fx?: number | string
  fy?: number | string
  stops: GradientStop[]
}

export type GradientConfig = LinearGradientConfig | RadialGradientConfig

/**
 * 渐变管理器 - 管理SVG渐变定义
 */
export class GradientManager {
  private graph: Graph
  private gradients: Map<string, GradientConfig> = new Map()
  private defsElement: SVGDefsElement | null = null

  constructor(graph: Graph) {
    this.graph = graph
    this.initializeDefs()
  }

  /**
   * 初始化SVG defs元素
   */
  private initializeDefs(): void {
    const container = (this.graph as any).container
    if (!container) return
    
    const svg = container.querySelector('svg')
    if (!svg) return

    let defs = svg.querySelector('defs')
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.insertBefore(defs, svg.firstChild)
    }
    this.defsElement = defs as SVGDefsElement
  }

  /**
   * 创建线性渐变
   */
  createLinearGradient(config: Omit<LinearGradientConfig, 'type'>): string {
    const fullConfig: LinearGradientConfig = { ...config, type: 'linear' }
    return this.createGradient(fullConfig)
  }

  /**
   * 创建径向渐变
   */
  createRadialGradient(config: Omit<RadialGradientConfig, 'type'>): string {
    const fullConfig: RadialGradientConfig = { ...config, type: 'radial' }
    return this.createGradient(fullConfig)
  }

  /**
   * 创建渐变
   */
  private createGradient(config: GradientConfig): string {
    if (this.gradients.has(config.id)) {
      return `url(#${config.id})`
    }

    if (!this.defsElement) {
      this.initializeDefs()
    }

    if (!this.defsElement) {
      devWarn('[GradientManager] 无法创建渐变：defs元素不存在')
      return config.stops[0]?.color || '#ffffff'
    }

    const gradientElement = this.createGradientElement(config)
    this.defsElement.appendChild(gradientElement)
    this.gradients.set(config.id, config)

    return `url(#${config.id})`
  }

  /**
   * 创建渐变元素
   */
  private createGradientElement(config: GradientConfig): SVGGradientElement {
    if (config.type === 'linear') {
      return this.createLinearGradientElement(config)
    } else {
      return this.createRadialGradientElement(config)
    }
  }

  /**
   * 创建线性渐变元素
   */
  private createLinearGradientElement(config: LinearGradientConfig): SVGLinearGradientElement {
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    gradient.setAttribute('id', config.id)
    gradient.setAttribute('x1', String(config.x1 ?? '0%'))
    gradient.setAttribute('y1', String(config.y1 ?? '0%'))
    gradient.setAttribute('x2', String(config.x2 ?? '100%'))
    gradient.setAttribute('y2', String(config.y2 ?? '100%'))

    config.stops.forEach((stop) => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
      stopElement.setAttribute('offset', `${stop.offset * 100}%`)
      stopElement.setAttribute('stop-color', stop.color)
      if (stop.opacity !== undefined) {
        stopElement.setAttribute('stop-opacity', String(stop.opacity))
      }
      gradient.appendChild(stopElement)
    })

    return gradient
  }

  /**
   * 创建径向渐变元素
   */
  private createRadialGradientElement(config: RadialGradientConfig): SVGRadialGradientElement {
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')
    gradient.setAttribute('id', config.id)
    gradient.setAttribute('cx', String(config.cx ?? '50%'))
    gradient.setAttribute('cy', String(config.cy ?? '50%'))
    gradient.setAttribute('r', String(config.r ?? '50%'))

    if (config.fx !== undefined) {
      gradient.setAttribute('fx', String(config.fx))
    }
    if (config.fy !== undefined) {
      gradient.setAttribute('fy', String(config.fy))
    }

    config.stops.forEach((stop) => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
      stopElement.setAttribute('offset', `${stop.offset * 100}%`)
      stopElement.setAttribute('stop-color', stop.color)
      if (stop.opacity !== undefined) {
        stopElement.setAttribute('stop-opacity', String(stop.opacity))
      }
      gradient.appendChild(stopElement)
    })

    return gradient
  }

  /**
   * 移除渐变
   */
  removeGradient(id: string): boolean {
    if (!this.gradients.has(id)) {
      return false
    }

    const gradientElement = this.defsElement?.querySelector(`#${id}`)
    if (gradientElement) {
      gradientElement.remove()
    }

    this.gradients.delete(id)
    return true
  }

  /**
   * 获取渐变
   */
  getGradient(id: string): GradientConfig | undefined {
    return this.gradients.get(id)
  }

  /**
   * 检查渐变是否存在
   */
  hasGradient(id: string): boolean {
    return this.gradients.has(id)
  }

  /**
   * 获取所有渐变
   */
  getAllGradients(): GradientConfig[] {
    return Array.from(this.gradients.values())
  }

  /**
   * 清空所有渐变
   */
  clear(): void {
    this.gradients.forEach((_, id) => {
      const gradientElement = this.defsElement?.querySelector(`#${id}`)
      if (gradientElement) {
        gradientElement.remove()
      }
    })
    this.gradients.clear()
  }

  /**
   * 获取渐变数量
   */
  size(): number {
    return this.gradients.size
  }

  /**
   * 预定义渐变 - 蓝色渐变
   */
  static blueGradient(id: string = 'blue-gradient'): LinearGradientConfig {
    return {
      type: 'linear',
      id,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1,
      stops: [
        { offset: 0, color: '#e6f7ff' },
        { offset: 1, color: '#1890ff' },
      ],
    }
  }

  /**
   * 预定义渐变 - 绿色渐变
   */
  static greenGradient(id: string = 'green-gradient'): LinearGradientConfig {
    return {
      type: 'linear',
      id,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1,
      stops: [
        { offset: 0, color: '#f6ffed' },
        { offset: 1, color: '#52c41a' },
      ],
    }
  }

  /**
   * 预定义渐变 - 橙色渐变
   */
  static orangeGradient(id: string = 'orange-gradient'): LinearGradientConfig {
    return {
      type: 'linear',
      id,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1,
      stops: [
        { offset: 0, color: '#fff7e6' },
        { offset: 1, color: '#fa8c16' },
      ],
    }
  }

  /**
   * 预定义渐变 - 红色渐变
   */
  static redGradient(id: string = 'red-gradient'): LinearGradientConfig {
    return {
      type: 'linear',
      id,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1,
      stops: [
        { offset: 0, color: '#fff1f0' },
        { offset: 1, color: '#f5222d' },
      ],
    }
  }

  /**
   * 预定义渐变 - 紫色渐变
   */
  static purpleGradient(id: string = 'purple-gradient'): LinearGradientConfig {
    return {
      type: 'linear',
      id,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 1,
      stops: [
        { offset: 0, color: '#f9f0ff' },
        { offset: 1, color: '#722ed1' },
      ],
    }
  }

  /**
   * 预定义渐变 - 径向光晕
   */
  static radialGlow(id: string = 'radial-glow'): RadialGradientConfig {
    return {
      type: 'radial',
      id,
      cx: '50%',
      cy: '50%',
      r: '50%',
      stops: [
        { offset: 0, color: '#ffffff', opacity: 1 },
        { offset: 0.5, color: '#e6f7ff', opacity: 0.8 },
        { offset: 1, color: '#1890ff', opacity: 0.4 },
      ],
    }
  }
}

export default GradientManager
