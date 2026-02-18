/**
 * SelfLoopStyling 测试用例
 *
 * 测试自连线样式工具的核心功能
 */

import { describe, it, expect } from 'vitest'
import {
  defaultSelfLoopTheme,
  darkSelfLoopTheme,
  getSelfLoopTheme,
  calculateSelfLoopLabelPosition,
  calculateMultiLoopDistribution,
  getSelfLoopStyles,
  selfLoopPresets,
  applySelfLoopPreset,
  getSelfLoopCreateAnimation,
  getSelfLoopHoverAnimation,
} from '../selfLoopStyling'

describe('SelfLoopStyling', () => {
  describe('主题配置', () => {
    it('应该有默认主题配置', () => {
      expect(defaultSelfLoopTheme.defaultRadius).toBe(35)
      expect(defaultSelfLoopTheme.defaultDirection).toBe('top')
      expect(defaultSelfLoopTheme.multiLoopOffset).toBe(25)
      expect(defaultSelfLoopTheme.stroke).toBe('#333333')
    })

    it('应该有暗黑主题配置', () => {
      expect(darkSelfLoopTheme.stroke).toBe('#e0e0e0')
      expect(darkSelfLoopTheme.defaultRadius).toBe(35)
    })

    it('应该根据参数返回正确主题', () => {
      const lightTheme = getSelfLoopTheme(false)
      expect(lightTheme.stroke).toBe('#333333')

      const darkTheme = getSelfLoopTheme(true)
      expect(darkTheme.stroke).toBe('#e0e0e0')
    })
  })

  describe('标签位置计算', () => {
    const nodeX = 100
    const nodeY = 100
    const nodeWidth = 80
    const nodeHeight = 60
    const radius = 35

    it('应该计算顶部方向的标签位置', () => {
      const position = calculateSelfLoopLabelPosition(
        'top', nodeX, nodeY, nodeWidth, nodeHeight, radius, 'outside'
      )
      expect(position.y).toBeLessThan(nodeY)
      expect(position.rotation).toBe(0)
      expect(position.anchor).toBe('middle')
    })

    it('应该计算右侧方向的标签位置', () => {
      const position = calculateSelfLoopLabelPosition(
        'right', nodeX, nodeY, nodeWidth, nodeHeight, radius, 'outside'
      )
      expect(position.x).toBeGreaterThan(nodeX)
      expect(position.rotation).toBe(90)
    })

    it('应该计算底部方向的标签位置', () => {
      const position = calculateSelfLoopLabelPosition(
        'bottom', nodeX, nodeY, nodeWidth, nodeHeight, radius, 'outside'
      )
      expect(position.y).toBeGreaterThan(nodeY)
      expect(position.rotation).toBe(0)
    })

    it('应该计算左侧方向的标签位置', () => {
      const position = calculateSelfLoopLabelPosition(
        'left', nodeX, nodeY, nodeWidth, nodeHeight, radius, 'outside'
      )
      expect(position.x).toBeLessThan(nodeX)
      expect(position.rotation).toBe(-90)
    })

    it('应该支持 inside 位置策略', () => {
      const position = calculateSelfLoopLabelPosition(
        'top', nodeX, nodeY, nodeWidth, nodeHeight, radius, 'inside'
      )
      // inside 时标签应该在弧线内侧（靠近节点）
      expect(position.y).toBeGreaterThan(nodeY - nodeHeight / 2 - radius / 2)
    })
  })

  describe('多自连线分布', () => {
    it('应该为 4 个自连线分配不同方向', () => {
      const distribution = calculateMultiLoopDistribution(4)
      expect(distribution).toHaveLength(4)
      expect(distribution[0].direction).toBe('top')
      expect(distribution[1].direction).toBe('right')
      expect(distribution[2].direction).toBe('bottom')
      expect(distribution[3].direction).toBe('left')
    })

    it('应该为超过 4 个的自连线增加偏移索引', () => {
      const distribution = calculateMultiLoopDistribution(6)
      expect(distribution).toHaveLength(6)
      expect(distribution[4].offsetIndex).toBe(1)
      expect(distribution[5].offsetIndex).toBe(1)
    })

    it('应该正确处理空分布', () => {
      const distribution = calculateMultiLoopDistribution(0)
      expect(distribution).toHaveLength(0)
    })
  })

  describe('样式计算', () => {
    it('应该返回基本样式', () => {
      const styles = getSelfLoopStyles(defaultSelfLoopTheme)
      expect(styles.stroke).toBe('#333333')
      expect(styles.strokeWidth).toBe(2)
      expect(styles.fill).toBe('none')
    })

    it('应该处理选中状态', () => {
      const styles = getSelfLoopStyles(defaultSelfLoopTheme, true)
      expect(styles.stroke).toBe('#1890ff')
      expect(styles.strokeWidth).toBe(3)
    })

    it('应该处理悬停状态', () => {
      const styles = getSelfLoopStyles(defaultSelfLoopTheme, false, true)
      expect(styles.stroke).toBe('#40a9ff')
      expect(styles.strokeWidth).toBe(2.5)
    })
  })

  describe('预设样式', () => {
    it('应该有默认预设', () => {
      expect(selfLoopPresets.default).toBeDefined()
      expect(selfLoopPresets.default.strokeWidth).toBe(2)
    })

    it('应该有强调预设', () => {
      expect(selfLoopPresets.emphasis).toBeDefined()
      expect(selfLoopPresets.emphasis.strokeWidth).toBe(3)
      expect(selfLoopPresets.emphasis.stroke).toBe('#1890ff')
    })

    it('应该有错误预设', () => {
      expect(selfLoopPresets.error).toBeDefined()
      expect(selfLoopPresets.error.stroke).toBe('#ff4d4f')
    })

    it('应该能应用预设', () => {
      const preset = applySelfLoopPreset('success')
      expect(preset.stroke).toBe('#52c41a')
    })

    it('应该返回默认预设当名称无效时', () => {
      const preset = applySelfLoopPreset('invalid' as any)
      expect(preset).toEqual(defaultSelfLoopTheme)
    })
  })

  describe('动画配置', () => {
    it('应该返回创建动画配置', () => {
      const animation = getSelfLoopCreateAnimation()
      expect(animation.enabled).toBe(true)
      expect(animation.duration).toBe(300)
      expect(animation.loop).toBe(false)
    })

    it('应该返回悬停动画配置', () => {
      const animation = getSelfLoopHoverAnimation()
      expect(animation.enabled).toBe(true)
      expect(animation.duration).toBe(150)
    })
  })
})
