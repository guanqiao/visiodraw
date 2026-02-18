/**
 * 甘特图解析器单元测试
 */

import { describe, it, expect } from 'vitest'
import { parseGanttScript, GanttParser } from '../parser'
import { simpleExample, softwareExample, criticalExample } from '../examples'

describe('GanttParser', () => {
  describe('基本解析', () => {
    it('应该正确解析简单示例', () => {
      const result = parseGanttScript(simpleExample.code)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.title).toBe('项目进度计划')
      expect(result.data!.sections.length).toBeGreaterThan(0)
      expect(result.data!.tasks.length).toBeGreaterThan(0)
    })

    it('应该正确解析软件示例', () => {
      const result = parseGanttScript(softwareExample.code)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.sections.length).toBe(4)
      expect(result.data!.tasks.length).toBeGreaterThan(10)
    })

    it('应该正确解析关键路径示例', () => {
      const result = parseGanttScript(criticalExample.code)
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.tasks.some(t => t.status === 'crit')).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该检测缺少gantt声明', () => {
      const result = parseGanttScript('title 测试')
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('gantt'))).toBe(true)
    })

    it('应该检测空脚本', () => {
      const result = parseGanttScript('')
      expect(result.success).toBe(false)
    })

    it('应该检测缺少任务', () => {
      const result = parseGanttScript(`gantt
        title 测试
        section 空分组`)
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('任务'))).toBe(true)
    })
  })

  describe('任务解析', () => {
    it('应该正确解析任务状态', () => {
      const script = `gantt
        section 测试
        任务1 :done, t1, 2024-01-01, 1d
        任务2 :active, t2, after t1, 1d
        任务3 :crit, t3, after t2, 1d`
      
      const result = parseGanttScript(script)
      expect(result.success).toBe(true)
      expect(result.data!.tasks[0].status).toBe('done')
      expect(result.data!.tasks[1].status).toBe('active')
      expect(result.data!.tasks[2].status).toBe('crit')
    })

    it('应该正确解析任务类型', () => {
      const script = `gantt
        section 测试
        普通任务 :t1, 2024-01-01, 1d
        里程碑 :milestone, m1, after t1, 0d`
      
      const result = parseGanttScript(script)
      expect(result.success).toBe(true)
      expect(result.data!.tasks[0].type).toBe('task')
      expect(result.data!.tasks[1].type).toBe('milestone')
    })

    it('应该正确解析依赖关系', () => {
      const script = `gantt
        section 测试
        任务1 :t1, 2024-01-01, 1d
        任务2 :t2, after t1, 1d
        任务3 :t3, after t2, 1d`
      
      const result = parseGanttScript(script)
      console.log('Tasks:', result.data?.tasks.map(t => ({ name: t.name, id: t.id, deps: t.dependencies })))
      expect(result.success).toBe(true)
      expect(result.data!.tasks[1].dependencies).toContain('t1')
      expect(result.data!.tasks[2].dependencies).toContain('t2')
    })
  })

  describe('日期解析', () => {
    it('应该正确解析具体日期', () => {
      const script = `gantt
        section 测试
        任务1 :t1, 2024-03-15, 5d`
      
      const result = parseGanttScript(script)
      expect(result.success).toBe(true)
      expect(result.data!.tasks[0].startDate.getFullYear()).toBe(2024)
      expect(result.data!.tasks[0].startDate.getMonth()).toBe(2) // 3月
      expect(result.data!.tasks[0].startDate.getDate()).toBe(15)
    })

    it('应该正确计算持续时间', () => {
      const script = `gantt
        section 测试
        任务1 :t1, 2024-01-01, 7d`
      
      const result = parseGanttScript(script)
      expect(result.success).toBe(true)
      expect(result.data!.tasks[0].duration).toBe(7)
      
      // 验证结束日期 = 开始日期 + 持续时间
      const startDate = result.data!.tasks[0].startDate
      const endDate = result.data!.tasks[0].endDate
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(7)
    })
  })

  describe('扩展属性', () => {
    it('应该正确解析标签', () => {
      const script = `gantt
        section 测试
        任务1 :tag frontend, t1, 2024-01-01, 1d
        任务2 :tag backend, tag urgent, t2, after t1, 1d`
      
      const result = parseGanttScript(script)
      expect(result.success).toBe(true)
      expect(result.data!.tasks[0].tags).toContain('frontend')
      expect(result.data!.tasks[1].tags).toContain('backend')
      expect(result.data!.tasks[1].tags).toContain('urgent')
    })

    it('应该正确解析分配人', () => {
      const script = `gantt
        section 测试
        任务1 :assignee 张三, t1, 2024-01-01, 1d`
      
      const result = parseGanttScript(script)
      expect(result.success).toBe(true)
      expect(result.data!.tasks[0].assignee).toBe('张三')
    })

    it('应该正确解析进度', () => {
      const script = `gantt
        section 测试
        任务1 :progress 50%, t1, 2024-01-01, 1d
        任务2 :progress 100%, t2, after t1, 1d`
      
      const result = parseGanttScript(script)
      expect(result.success).toBe(true)
      expect(result.data!.tasks[0].progress).toBe(50)
      expect(result.data!.tasks[1].progress).toBe(100)
    })

    it('应该正确解析优先级', () => {
      const script = `gantt
        section 测试
        任务1 :priority high, t1, 2024-01-01, 1d
        任务2 :priority medium, t2, after t1, 1d
        任务3 :priority low, t3, after t2, 1d`
      
      const result = parseGanttScript(script)
      expect(result.success).toBe(true)
      expect(result.data!.tasks[0].priority).toBe('high')
      expect(result.data!.tasks[1].priority).toBe('medium')
      expect(result.data!.tasks[2].priority).toBe('low')
    })
  })
})
