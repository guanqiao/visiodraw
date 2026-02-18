/**
 * 自连线样式工具
 *
 * 提供自连线的样式计算、主题支持和标签位置优化
 */

import type { SelfLoopDirection } from './selfLoopRouter'

export interface SelfLoopThemeConfig {
  /** 默认弧线半径 */
  defaultRadius: number
  /** 默认方向 */
  defaultDirection: SelfLoopDirection
  /** 多自连线偏移量 */
  multiLoopOffset: number
  /** 贝塞尔控制点偏移 */
  bezierControlOffset: number
  /** 标签位置策略 */
  labelPosition: 'inside' | 'outside' | 'auto'
  /** 标签偏移距离 */
  labelOffset: number
  /** 线条颜色 */
  stroke: string
  /** 线条宽度 */
  strokeWidth: number
  /** 箭头大小 */
  arrowSize: number
}

export interface SelfLoopLabelPosition {
  x: number
  y: number
  rotation?: number
  anchor: 'start' | 'middle' | 'end'
}

/**
 * 默认自连线主题配置
 */
export const defaultSelfLoopTheme: SelfLoopThemeConfig = {
  defaultRadius: 35,
  defaultDirection: 'top',
  multiLoopOffset: 25,
  bezierControlOffset: 50,
  labelPosition: 'outside',
  labelOffset: 15,
  stroke: '#333333',
  strokeWidth: 2,
  arrowSize: 10,
}

/**
 * 暗黑主题自连线配置
 */
export const darkSelfLoopTheme: SelfLoopThemeConfig = {
  ...defaultSelfLoopTheme,
  stroke: '#e0e0e0',
}

/**
 * 获取自连线主题配置
 */
export function getSelfLoopTheme(isDark: boolean = false): SelfLoopThemeConfig {
  return isDark ? darkSelfLoopTheme : defaultSelfLoopTheme
}

/**
 * 计算自连线标签位置
 * @param direction 自连线方向
 * @param nodeX 节点中心 X
 * @param nodeY 节点中心 Y
 * @param nodeWidth 节点宽度
 * @param nodeHeight 节点高度
 * @param radius 弧线半径
 * @param position 位置策略
 * @returns 标签位置
 */
export function calculateSelfLoopLabelPosition(
  direction: SelfLoopDirection,
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number,
  radius: number,
  position: 'inside' | 'outside' | 'auto' = 'outside'
): SelfLoopLabelPosition {
  // 计算弧线中点位置
  let midX = nodeX
  let midY = nodeY
  let rotation = 0

  switch (direction) {
    case 'top':
      midY = nodeY - nodeHeight / 2 - radius / 2
      rotation = 0
      break
    case 'right':
      midX = nodeX + nodeWidth / 2 + radius / 2
      rotation = 90
      break
    case 'bottom':
      midY = nodeY + nodeHeight / 2 + radius / 2
      rotation = 0
      break
    case 'left':
      midX = nodeX - nodeWidth / 2 - radius / 2
      rotation = -90
      break
  }

  // 根据位置策略调整
  if (position === 'outside') {
    const offset = defaultSelfLoopTheme.labelOffset
    switch (direction) {
      case 'top':
        midY -= offset
        break
      case 'right':
        midX += offset
        break
      case 'bottom':
        midY += offset
        break
      case 'left':
        midX -= offset
        break
    }
  } else if (position === 'inside') {
    const offset = defaultSelfLoopTheme.labelOffset
    switch (direction) {
      case 'top':
        midY += offset
        break
      case 'right':
        midX -= offset
        break
      case 'bottom':
        midY -= offset
        break
      case 'left':
        midX += offset
        break
    }
  }

  return {
    x: midX,
    y: midY,
    rotation,
    anchor: 'middle',
  }
}

/**
 * 计算多自连线的最佳分布
 * @param count 自连线数量
 * @returns 每个自连线的方向和偏移索引
 */
export function calculateMultiLoopDistribution(
  count: number
): Array<{ direction: SelfLoopDirection; offsetIndex: number }> {
  const directions: SelfLoopDirection[] = ['top', 'right', 'bottom', 'left']
  const result: Array<{ direction: SelfLoopDirection; offsetIndex: number }> = []

  for (let i = 0; i < count; i++) {
    const directionIndex = i % 4
    const offsetIndex = Math.floor(i / 4)
    result.push({
      direction: directions[directionIndex],
      offsetIndex,
    })
  }

  return result
}

/**
 * 获取自连线 CSS 样式
 */
export function getSelfLoopStyles(
  theme: SelfLoopThemeConfig,
  isSelected: boolean = false,
  isHovered: boolean = false
): React.CSSProperties {
  const styles: React.CSSProperties = {
    stroke: theme.stroke,
    strokeWidth: theme.strokeWidth,
    fill: 'none',
  }

  if (isSelected) {
    styles.stroke = '#1890ff'
    styles.strokeWidth = (theme.strokeWidth || 2) + 1
  } else if (isHovered) {
    styles.stroke = '#40a9ff'
    styles.strokeWidth = (theme.strokeWidth || 2) + 0.5
  }

  return styles
}

/**
 * 自连线动画配置
 */
export interface SelfLoopAnimationConfig {
  /** 是否启用动画 */
  enabled: boolean
  /** 动画持续时间 (ms) */
  duration: number
  /** 动画缓动函数 */
  easing: string
  /** 是否循环 */
  loop: boolean
}

/**
 * 默认动画配置
 */
export const defaultSelfLoopAnimation: SelfLoopAnimationConfig = {
  enabled: true,
  duration: 300,
  easing: 'ease-out',
  loop: false,
}

/**
 * 获取自连线创建动画配置
 */
export function getSelfLoopCreateAnimation(): SelfLoopAnimationConfig {
  return {
    ...defaultSelfLoopAnimation,
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  }
}

/**
 * 获取自连线悬停动画配置
 */
export function getSelfLoopHoverAnimation(): SelfLoopAnimationConfig {
  return {
    ...defaultSelfLoopAnimation,
    duration: 150,
    easing: 'ease-in-out',
  }
}

/**
 * 自连线预设样式
 */
export const selfLoopPresets = {
  /** 默认样式 */
  default: defaultSelfLoopTheme,
  /** 强调样式 */
  emphasis: {
    ...defaultSelfLoopTheme,
    strokeWidth: 3,
    stroke: '#1890ff',
    arrowSize: 12,
  },
  /** 弱化样式 */
  subtle: {
    ...defaultSelfLoopTheme,
    strokeWidth: 1,
    stroke: '#999999',
    arrowSize: 8,
  },
  /** 错误样式 */
  error: {
    ...defaultSelfLoopTheme,
    stroke: '#ff4d4f',
    strokeWidth: 2,
  },
  /** 成功样式 */
  success: {
    ...defaultSelfLoopTheme,
    stroke: '#52c41a',
    strokeWidth: 2,
  },
  /** 警告样式 */
  warning: {
    ...defaultSelfLoopTheme,
    stroke: '#faad14',
    strokeWidth: 2,
  },
}

/**
 * 应用预设样式
 */
export function applySelfLoopPreset(
  presetName: keyof typeof selfLoopPresets
): SelfLoopThemeConfig {
  return selfLoopPresets[presetName] || defaultSelfLoopTheme
}

export default {
  defaultSelfLoopTheme,
  darkSelfLoopTheme,
  getSelfLoopTheme,
  calculateSelfLoopLabelPosition,
  calculateMultiLoopDistribution,
  getSelfLoopStyles,
  selfLoopPresets,
  applySelfLoopPreset,
}
