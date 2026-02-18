/**
 * 工作日历单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { WorkCalendar } from '../workCalendar'

describe('WorkCalendar', () => {
  let calendar: WorkCalendar

  beforeEach(() => {
    calendar = new WorkCalendar()
  })

  describe('基础功能', () => {
    it('应该正确判断工作日', () => {
      // 2024-01-08 是周一
      expect(calendar.isWorkDay(new Date('2024-01-08'))).toBe(true)
      // 2024-01-13 是周六
      expect(calendar.isWorkDay(new Date('2024-01-13'))).toBe(false)
      // 2024-01-14 是周日
      expect(calendar.isWorkDay(new Date('2024-01-14'))).toBe(false)
    })

    it('应该正确判断周末', () => {
      expect(calendar.isWeekend(new Date('2024-01-13'))).toBe(true) // 周六
      expect(calendar.isWeekend(new Date('2024-01-14'))).toBe(true) // 周日
      expect(calendar.isWeekend(new Date('2024-01-08'))).toBe(false) // 周一
    })

    it('应该支持自定义工作日', () => {
      calendar.setWorkDays([1, 2, 3, 4, 5, 6]) // 周一到周六
      expect(calendar.isWorkDay(new Date('2024-01-13'))).toBe(true) // 周六
      expect(calendar.isWorkDay(new Date('2024-01-14'))).toBe(false) // 周日
    })
  })

  describe('节假日管理', () => {
    it('应该正确添加和判断节假日', () => {
      const holiday = new Date('2024-01-01')
      calendar.addHoliday(holiday)
      
      // 2024-01-01 是周一，但被设为节假日
      expect(calendar.isHoliday(holiday)).toBe(true)
      expect(calendar.isWorkDay(holiday)).toBe(false)
    })

    it('应该正确移除节假日', () => {
      const holiday = new Date('2024-01-01')
      calendar.addHoliday(holiday)
      expect(calendar.isHoliday(holiday)).toBe(true)
      
      calendar.removeHoliday(holiday)
      expect(calendar.isHoliday(holiday)).toBe(false)
      expect(calendar.isWorkDay(holiday)).toBe(true) // 周一是工作日
    })

    it('应该正确处理特殊工作日', () => {
      const specialDay = new Date('2024-01-13') // 周六
      calendar.addSpecialWorkDay(specialDay)
      
      expect(calendar.isWorkDay(specialDay)).toBe(true)
      expect(calendar.isWeekend(specialDay)).toBe(true)
    })
  })

  describe('工作日计算', () => {
    it('应该正确计算两个日期之间的工作日天数', () => {
      // 2024-01-08 (周一) 到 2024-01-14 (周日)
      const start = new Date('2024-01-08')
      const end = new Date('2024-01-14')
      
      // 工作日：周一、周二、周三、周四、周五 = 5天
      expect(calendar.getWorkDaysBetween(start, end)).toBe(5)
    })

    it('应该正确处理跨周的工作日计算', () => {
      // 2024-01-08 (周一) 到 2024-01-22 (周一)
      const start = new Date('2024-01-08')
      const end = new Date('2024-01-22')
      
      // 两周的工作日：5 + 5 = 10天
      expect(calendar.getWorkDaysBetween(start, end)).toBe(10)
    })

    it('添加工作日后应该跳过周末', () => {
      const start = new Date('2024-01-12') // 周五
      
      // 添加1个工作日应该是下周一
      const result = calendar.addWorkDays(start, 1)
      expect(result.getDay()).toBe(1) // 周一
      expect(result.toISOString().split('T')[0]).toBe('2024-01-15')
    })

    it('添加多个工作日应该正确计算', () => {
      const start = new Date('2024-01-08') // 周一
      
      // 添加5个工作日应该是下周一（跨周末）
      const result = calendar.addWorkDays(start, 5)
      expect(result.toISOString().split('T')[0]).toBe('2024-01-15')
    })

    it('应该支持负数的添加工作日', () => {
      const start = new Date('2024-01-15') // 周一
      
      // 减去1个工作日应该是上周五
      const result = calendar.addWorkDays(start, -1)
      expect(result.getDay()).toBe(5) // 周五
      expect(result.toISOString().split('T')[0]).toBe('2024-01-12')
    })
  })

  describe('节假日影响', () => {
    it('节假日应该影响工作日计算', () => {
      // 将周三设为节假日
      calendar.addHoliday(new Date('2024-01-10'))
      
      const start = new Date('2024-01-08') // 周一
      const end = new Date('2024-01-13') // 周六（不包含）
      
      // 工作日：周一、周二、周四、周五 = 4天（周三节假日，周六不包含）
      expect(calendar.getWorkDaysBetween(start, end)).toBe(4)
    })

    it('节假日应该影响添加工作日', () => {
      // 将周二设为节假日
      calendar.addHoliday(new Date('2024-01-09'))
      
      const start = new Date('2024-01-08') // 周一
      
      // 添加1个工作日应该跳过周二，到周三
      const result = calendar.addWorkDays(start, 1)
      expect(result.toISOString().split('T')[0]).toBe('2024-01-10')
    })
  })

  describe('日期范围信息', () => {
    it('应该返回正确的日期范围信息', () => {
      calendar.addHoliday(new Date('2024-01-10'))
      
      const info = calendar.getDateRangeInfo(
        new Date('2024-01-08'),
        new Date('2024-01-12')
      )
      
      expect(info).toHaveLength(5)
      expect(info[0].isWorkDay).toBe(true) // 周一
      expect(info[1].isWorkDay).toBe(true) // 周二
      expect(info[2].isWorkDay).toBe(false) // 周三（节假日）
      expect(info[2].isHoliday).toBe(true)
      expect(info[3].isWorkDay).toBe(true) // 周四
      expect(info[4].isWorkDay).toBe(true) // 周五
    })
  })

  describe('月份和年份计算', () => {
    it('应该正确计算月份工作日', () => {
      // 2024年1月
      const workDays = calendar.getWorkDaysInMonth(2024, 0)
      
      // 2024年1月有23个工作日（排除周末）
      expect(workDays).toBe(23)
    })

    it('应该正确计算年份工作日', () => {
      // 2024年是闰年，366天
      const workDays = calendar.getWorkDaysInYear(2024)
      
      // 2024年有262个工作日（排除周末，不考虑节假日）
      expect(workDays).toBe(262)
    })
  })

  describe('相邻工作日', () => {
    it('应该正确获取下一个工作日', () => {
      const friday = new Date('2024-01-12')
      const nextWorkDay = calendar.getNextWorkDay(friday)
      
      expect(nextWorkDay.getDay()).toBe(1) // 周一
      expect(nextWorkDay.toISOString().split('T')[0]).toBe('2024-01-15')
    })

    it('应该正确获取上一个工作日', () => {
      const monday = new Date('2024-01-15')
      const prevWorkDay = calendar.getPreviousWorkDay(monday)
      
      expect(prevWorkDay.getDay()).toBe(5) // 周五
      expect(prevWorkDay.toISOString().split('T')[0]).toBe('2024-01-12')
    })
  })

  describe('序列化', () => {
    it('应该正确序列化和反序列化', () => {
      calendar.addHoliday(new Date('2024-01-01'))
      calendar.addSpecialWorkDay(new Date('2024-01-13'))
      calendar.setWorkDays([1, 2, 3, 4, 5, 6])
      
      const json = calendar.toJSON()
      const restored = WorkCalendar.fromJSON(json)
      
      expect(restored.getConfig().workDays).toEqual([1, 2, 3, 4, 5, 6])
      expect(restored.isHoliday(new Date('2024-01-01'))).toBe(true)
      expect(restored.isWorkDay(new Date('2024-01-13'))).toBe(true)
    })
  })

  describe('中国法定节假日', () => {
    it('应该正确添加中国法定节假日', () => {
      calendar.addChinaHolidays(2024)
      
      // 元旦
      expect(calendar.isHoliday(new Date('2024-01-01'))).toBe(true)
      // 春节第一天
      expect(calendar.isHoliday(new Date('2024-02-10'))).toBe(true)
      // 劳动节
      expect(calendar.isHoliday(new Date('2024-05-01'))).toBe(true)
      // 国庆
      expect(calendar.isHoliday(new Date('2024-10-01'))).toBe(true)
    })
  })
})
