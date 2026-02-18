/**
 * 甘特图视口管理器单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GanttViewportManager, ViewMode } from '../ganttViewport'

describe('GanttViewportManager', () => {
  let manager: GanttViewportManager

  beforeEach(() => {
    manager = new GanttViewportManager()
  })

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      expect(manager.getViewMode()).toBe('day')
      expect(manager.getDayWidth()).toBe(40)
    })

    it('应该正确设置日期范围', () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      manager.setDateRange(startDate, endDate)
      const range = manager.getDateRange()

      expect(range.startDate.getTime()).toBe(startDate.getTime())
      expect(range.endDate.getTime()).toBe(endDate.getTime())
    })
  })

  describe('视图模式切换', () => {
    it('应该正确切换到周视图', () => {
      manager.setViewMode('week')
      expect(manager.getViewMode()).toBe('week')
      expect(manager.getDayWidth()).toBe(20)
    })

    it('应该正确切换到月视图', () => {
      manager.setViewMode('month')
      expect(manager.getViewMode()).toBe('month')
      expect(manager.getDayWidth()).toBe(8)
    })

    it('应该正确切换到季度视图', () => {
      manager.setViewMode('quarter')
      expect(manager.getViewMode()).toBe('quarter')
      expect(manager.getDayWidth()).toBe(3)
    })

    it('应该正确切换到年视图', () => {
      manager.setViewMode('year')
      expect(manager.getViewMode()).toBe('year')
      expect(manager.getDayWidth()).toBe(1)
    })

    it('切换视图模式应该触发回调', () => {
      let callbackCalled = false
      let oldMode: ViewMode | undefined
      let newMode: ViewMode | undefined

      manager.onViewportChanged = (old, newM) => {
        callbackCalled = true
        oldMode = old
        newMode = newM
      }

      manager.setViewMode('week')

      expect(callbackCalled).toBe(true)
      expect(oldMode).toBe('day')
      expect(newMode).toBe('week')
    })
  })

  describe('缩放功能', () => {
    it('应该正确放大', () => {
      const initialWidth = manager.getDayWidth()
      manager.zoomIn()
      expect(manager.getDayWidth()).toBeGreaterThan(initialWidth)
    })

    it('应该正确缩小', () => {
      manager.setViewMode('day')
      const initialWidth = manager.getDayWidth()
      manager.zoomOut()
      expect(manager.getDayWidth()).toBeLessThan(initialWidth)
    })

    it('放大不应该超过最大值', () => {
      manager.setViewMode('day')
      // 多次放大
      for (let i = 0; i < 10; i++) {
        manager.zoomIn()
      }
      expect(manager.getDayWidth()).toBeLessThanOrEqual(100)
    })

    it('缩小不应该低于最小值', () => {
      manager.setViewMode('day')
      // 多次缩小
      for (let i = 0; i < 10; i++) {
        manager.zoomOut()
      }
      expect(manager.getDayWidth()).toBeGreaterThanOrEqual(20)
    })

    it('设置天宽度应该触发回调', () => {
      let callbackCalled = false
      let newWidth = 0

      manager.onDayWidthChanged = (width) => {
        callbackCalled = true
        newWidth = width
      }

      manager.setDayWidth(50)

      expect(callbackCalled).toBe(true)
      expect(newWidth).toBe(50)
    })
  })

  describe('今日标记', () => {
    it('应该生成今日标记线', () => {
      manager.setDateRange(new Date('2024-01-01'), new Date('2024-01-31'))
      const marker = manager.generateTodayMarker()

      expect(marker.id).toBe('gantt-today-marker')
      expect(marker.type).toBe('uml-line')
      expect(marker.stroke).toBe('#1890ff')
      expect(marker.strokeWidth).toBe(2)
      expect(marker.dashArray).toBe('5,5')
    })

    it('应该生成今日标签', () => {
      manager.setDateRange(new Date('2024-01-01'), new Date('2024-01-31'))
      const label = manager.generateTodayLabel()

      expect(label.id).toBe('gantt-today-label')
      expect(label.type).toBe('uml-label')
      expect(label.text).toBe('今天')
      expect(label.fill).toBe('#1890ff')
    })

    it('今日标记线位置应该正确', () => {
      const startDate = new Date('2024-01-01')
      manager.setDateRange(startDate, new Date('2024-01-31'))
      manager.setDayWidth(40)

      const marker = manager.generateTodayMarker()
      const today = new Date()
      const dayDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const expectedX = 200 + dayDiff * 40 + 20 // 200是左侧宽度，20是半格

      expect(marker.x).toBe(expectedX)
    })
  })

  describe('状态管理', () => {
    it('应该正确获取状态', () => {
      const state = manager.getState()

      expect(state.viewMode).toBe('day')
      expect(state.dayWidth).toBe(40)
      expect(state.scrollX).toBe(0)
      expect(state.scrollY).toBe(0)
    })

    it('应该正确重置', () => {
      manager.setViewMode('week')
      manager.setDayWidth(30)
      manager.reset()

      expect(manager.getViewMode()).toBe('day')
      expect(manager.getDayWidth()).toBe(40)
    })
  })

  describe('视图模式限制', () => {
    it('日视图应该有正确的限制', () => {
      manager.setViewMode('day')
      manager.setDayWidth(10) // 低于最小值
      expect(manager.getDayWidth()).toBe(20) // 应该被限制到最小值

      manager.setDayWidth(150) // 高于最大值
      expect(manager.getDayWidth()).toBe(100) // 应该被限制到最大值
    })

    it('周视图应该有正确的限制', () => {
      manager.setViewMode('week')
      manager.setDayWidth(5) // 低于最小值
      expect(manager.getDayWidth()).toBe(10)

      manager.setDayWidth(60) // 高于最大值
      expect(manager.getDayWidth()).toBe(50)
    })

    it('月视图应该有正确的限制', () => {
      manager.setViewMode('month')
      manager.setDayWidth(2) // 低于最小值
      expect(manager.getDayWidth()).toBe(4)

      manager.setDayWidth(25) // 高于最大值
      expect(manager.getDayWidth()).toBe(20)
    })
  })
})
