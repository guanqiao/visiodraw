import { Graph, Node, Edge } from '@antv/x6'

interface AnimationConfig {
  duration?: number
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'easeOutBounce'
  delay?: number
}

interface NodeAnimationConfig extends AnimationConfig {
  position?: boolean
  size?: boolean
  attrs?: boolean
}

/**
 * 动画管理器 - 管理图形动画效果
 */
export class AnimationManager {
  private graph: Graph
  private readonly defaultDuration = 300
  private readonly defaultEasing: AnimationConfig['easing'] = 'easeInOut'

  constructor(graph: Graph) {
    this.graph = graph
  }

  /**
   * 设置默认动画配置
   */
  setDefaultAnimation(config: AnimationConfig): void {
    // X6 的动画配置通过 options 设置
    const animating = (this.graph.options as any).animating || {}
    ;(this.graph.options as any).animating = {
      ...animating,
      duration: config.duration || this.defaultDuration,
      easing: config.easing || this.defaultEasing,
    }
  }

  /**
   * 节点移动动画
   */
  animateNodePosition(
    node: Node,
    targetX: number,
    targetY: number,
    config: AnimationConfig = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const duration = config.duration || this.defaultDuration
      const delay = config.delay || 0

      node.transition('position', { x: targetX, y: targetY }, {
        duration,
        delay,
        complete: () => resolve(),
      })
    })
  }

  /**
   * 节点大小变化动画
   */
  animateNodeSize(
    node: Node,
    targetWidth: number,
    targetHeight: number,
    config: AnimationConfig = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const duration = config.duration || this.defaultDuration
      const delay = config.delay || 0

      node.transition('size', { width: targetWidth, height: targetHeight }, {
        duration,
        delay,
        complete: () => resolve(),
      })
    })
  }

  /**
   * 节点属性动画
   */
  animateNodeAttrs(
    node: Node,
    attrs: Record<string, any>,
    config: AnimationConfig = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const duration = config.duration || this.defaultDuration
      const delay = config.delay || 0

      node.transition('attrs', attrs, {
        duration,
        delay,
        complete: () => resolve(),
      })
    })
  }

  /**
   * 节点出现动画
   */
  async animateNodeAppear(node: Node, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || this.defaultDuration

    // 初始状态
    node.attr('body/opacity', 0)
    node.attr('label/opacity', 0)

    // 淡入动画
    await this.animateNodeAttrs(node, {
      'body/opacity': 1,
      'label/opacity': 1,
    }, { duration: duration * 0.5 })

    // 缩放动画
    const originalSize = node.getSize()
    node.setSize(originalSize.width * 0.8, originalSize.height * 0.8)

    await this.animateNodeSize(node, originalSize.width, originalSize.height, {
      duration: duration * 0.5,
    })
  }

  /**
   * 节点消失动画
   */
  async animateNodeDisappear(node: Node, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || this.defaultDuration

    // 缩放动画
    const originalSize = node.getSize()
    await this.animateNodeSize(node, originalSize.width * 0.8, originalSize.height * 0.8, {
      duration: duration * 0.5,
    })

    // 淡出动画
    await this.animateNodeAttrs(node, {
      'body/opacity': 0,
      'label/opacity': 0,
    }, { duration: duration * 0.5 })

    // 恢复原始大小（隐藏状态）
    node.setSize(originalSize.width, originalSize.height)
  }

  /**
   * 边出现动画
   */
  animateEdgeAppear(edge: Edge, config: AnimationConfig = {}): Promise<void> {
    return new Promise((resolve) => {
      const duration = config.duration || this.defaultDuration

      // 初始状态
      edge.attr('line/opacity', 0)

      // 淡入动画
      edge.transition('attrs/line/opacity', 1, {
        duration,
        complete: () => resolve(),
      })
    })
  }

  /**
   * 批量节点动画
   */
  async animateNodesSequentially(
    nodes: Node[],
    animation: (node: Node) => Promise<void>,
    delayBetween: number = 50
  ): Promise<void> {
    for (let i = 0; i < nodes.length; i++) {
      await animation(nodes[i])
      if (i < nodes.length - 1) {
        await this.sleep(delayBetween)
      }
    }
  }

  /**
   * 批量节点并行动画
   */
  animateNodesParallel(
    nodes: Node[],
    animation: (node: Node) => Promise<void>,
    staggerDelay: number = 0
  ): Promise<void[]> {
    const promises = nodes.map((node, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          await animation(node)
          resolve()
        }, index * staggerDelay)
      })
    })

    return Promise.all(promises)
  }

  /**
   * 布局动画
   */
  async animateLayout(
    layout: Map<string, { x: number; y: number }>,
    config: AnimationConfig = {}
  ): Promise<void> {
    const duration = config.duration || this.defaultDuration

    const promises: Promise<void>[] = []

    layout.forEach((position, nodeId) => {
      const node = this.graph.getCellById(nodeId)
      if (node && node.isNode()) {
        promises.push(
          this.animateNodePosition(node as Node, position.x, position.y, {
            duration,
          })
        )
      }
    })

    await Promise.all(promises)
  }

  /**
   * 选中动画
   */
  async animateSelection(node: Node, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || this.defaultDuration

    // 脉冲效果
    const originalStrokeWidth = (node.attr('body/strokeWidth') as number) || 2

    await this.animateNodeAttrs(node, {
      'body/strokeWidth': originalStrokeWidth + 2,
      'body/stroke': '#1890ff',
    }, { duration: duration * 0.3 })

    await this.animateNodeAttrs(node, {
      'body/strokeWidth': originalStrokeWidth,
      'body/stroke': (node.attr('body/stroke') as string) || '#333333',
    }, { duration: duration * 0.3 })
  }

  /**
   * 脉冲动画 - 节点呼吸效果
   */
  async animatePulse(node: Node, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || 1500
    const easing = config.easing || 'easeInOut'
    
    const originalOpacity = node.attr('body/opacity') ?? 1
    const originalStroke = node.attr('body/stroke') as string
    const originalStrokeWidth = node.attr('body/strokeWidth') as number
    
    node.attr('body/stroke', '#1890ff')
    node.attr('body/strokeWidth', (originalStrokeWidth || 2) + 1)
    
    await this.animateNodeAttrs(node, {
      'body/opacity': 0.6,
      'body/stroke': '#40a9ff',
    }, { duration: duration / 2, easing: 'easeIn' })
    
    await this.animateNodeAttrs(node, {
      'body/opacity': originalOpacity,
      'body/stroke': originalStroke || '#1890ff',
    }, { duration: duration / 2, easing: 'easeOut' })
    
    node.attr('body/strokeWidth', originalStrokeWidth || 2)
  }

  /**
   * 波纹动画 - 从中心向外扩散
   */
  async animateRipple(node: Node, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || 1000
    
    const bbox = node.getBBox()
    const cx = bbox.width / 2
    const cy = bbox.height / 2
    
    node.attr('body/opacity', 0.3)
    
    const ripple = new (window as any).SVG('circle')
      .attr({
        cx,
        cy,
        r: 0,
        fill: 'none',
        stroke: '#1890ff',
        strokeWidth: 2,
        opacity: 1,
      })
    
    const parent = node.getMountedElement()
    if (parent) {
      const svg = parent.ownerSVGElement
      if (svg) {
        ripple.appendTo(svg)
        
        ripple.animate(duration, 0, 'now')
          .attr({ r: Math.max(bbox.width, bbox.height), opacity: 0 })
          .after(() => ripple.remove())
      }
    }
    
    await this.sleep(duration)
    node.attr('body/opacity', 1)
  }

  /**
   * 闪烁动画
   */
  async animateBlink(node: Node, times: number = 3, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || 300
    
    for (let i = 0; i < times; i++) {
      await this.animateNodeAttrs(node, {
        'body/opacity': 0.3,
      }, { duration: duration / 2 })
      
      await this.animateNodeAttrs(node, {
        'body/opacity': 1,
      }, { duration: duration / 2 })
    }
  }

  /**
   * 弹跳动画
   */
  async animateBounce(node: Node, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || 600
    const easing = config.easing || 'easeOutBounce'
    
    const position = node.getPosition()
    const originalY = position.y
    
    await this.animateNodePosition(node, position.x, originalY - 20, { duration: duration / 2, easing: 'easeIn' })
    await this.animateNodePosition(node, position.x, originalY, { duration: duration / 2, easing })
  }

  /**
   * 摇晃动画
   */
  async animateShake(node: Node, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || 500
    
    const position = node.getPosition()
    const originalX = position.x
    
    const shakeDistance = 5
    const steps = 4
    const stepDuration = duration / steps
    
    for (let i = 0; i < steps; i++) {
      const offset = (i % 2 === 0 ? 1 : -1) * shakeDistance * (1 - i / steps)
      await this.animateNodePosition(node, originalX + offset, position.y, { duration: stepDuration })
    }
    
    await this.animateNodePosition(node, originalX, position.y, { duration: stepDuration })
  }

  /**
   * 悬停动画
   */
  animateHover(node: Node, isHovering: boolean, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || 150

    if (isHovering) {
      return this.animateNodeAttrs(node, {
        'body/filter': {
          name: 'dropShadow',
          args: {
            dx: 0,
            dy: 4,
            blur: 8,
            color: '#00000030',
          },
        },
      }, { duration })
    } else {
      return this.animateNodeAttrs(node, {
        'body/filter': null,
      }, { duration })
    }
  }

  /**
   * 连接点高亮动画
   */
  animatePortHighlight(node: Node, portId: string, config: AnimationConfig = {}): Promise<void> {
    const duration = config.duration || 200

    return new Promise((resolve) => {
      node.setPortProp(portId, 'attrs/circle', {
        r: 8,
        strokeWidth: 3,
        fill: '#1890ff',
      })

      setTimeout(() => {
        node.setPortProp(portId, 'attrs/circle', {
          r: 5,
          strokeWidth: 1,
          fill: '#ffffff',
        })
        resolve()
      }, duration)
    })
  }

  /**
   * 画布缩放动画
   */
  animateZoom(targetZoom: number, config: AnimationConfig = {}): Promise<void> {
    return new Promise((resolve) => {
      const duration = config.duration || this.defaultDuration

      const currentZoom = this.graph.zoom()
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = this.applyEasing(progress, config.easing)

        const newZoom = currentZoom + (targetZoom - currentZoom) * easedProgress
        this.graph.zoomTo(newZoom)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  /**
   * 画布平移动画
   */
  animatePan(targetX: number, targetY: number, config: AnimationConfig = {}): Promise<void> {
    return new Promise((resolve) => {
      const duration = config.duration || this.defaultDuration

      const currentTranslate = this.graph.translate()
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = this.applyEasing(progress, config.easing)

        const newX = currentTranslate.tx + (targetX - currentTranslate.tx) * easedProgress
        const newY = currentTranslate.ty + (targetY - currentTranslate.ty) * easedProgress
        this.graph.translate(newX, newY)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  /**
   * 应用缓动函数
   */
  private applyEasing(t: number, easing?: AnimationConfig['easing']): number {
    switch (easing) {
      case 'linear':
        return t
      case 'easeIn':
        return t * t
      case 'easeOut':
        return 1 - Math.pow(1 - t, 2)
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      case 'easeOutBounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
        }
      default:
        return t
    }
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * 停止所有动画
   */
  stopAllAnimations(): void {
    this.graph.getNodes().forEach((node) => {
      node.stopTransition('position')
      node.stopTransition('size')
      node.stopTransition('attrs')
    })
    this.graph.getEdges().forEach((edge) => {
      edge.stopTransition('attrs')
    })
  }
}

export default AnimationManager
