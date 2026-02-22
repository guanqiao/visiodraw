// @ts-nocheck
/**
 * 序列图模板测试
 *
 * 测试内容：
 * 1. 基础模板生成
 * 2. 参数校验
 * 3. 自动编号功能
 * 4. 节点和边的正确性
 */

import { describe, it, expect } from 'vitest'
import {
  basicSequenceTemplate,
  authSequenceTemplate,
  crudSequenceTemplate,
  loopSequenceTemplate,
  errorHandlingTemplate,
  criticalSequenceTemplate,
  parSequenceTemplate,
  selfCallSequenceTemplate,
  sequenceTemplates,
} from '../sequenceTemplates'

describe('Sequence Templates', () => {
  describe('基础模板', () => {
    it('应该生成基础序列图', () => {
      const result = basicSequenceTemplate.generate()

      expect(result.nodes).toBeDefined()
      expect(result.edges).toBeDefined()
      expect(result.nodes.length).toBeGreaterThan(0)
      expect(result.edges.length).toBeGreaterThan(0)
    })

    it('应该包含参与者和生命线', () => {
      const result = basicSequenceTemplate.generate()

      const participants = result.nodes.filter(n =>
        n.type === 'uml-participant' ||
        n.type === 'uml-actor-sequence' ||
        n.type === 'uml-database-sequence'
      )
      const lifelines = result.nodes.filter(n => n.type === 'uml-lifeline')

      expect(participants.length).toBe(2)
      expect(lifelines.length).toBe(2)
    })

    it('应该包含消息边', () => {
      const result = basicSequenceTemplate.generate()

      expect(result.edges.length).toBe(2)
      expect(result.edges[0].label).toContain('request')
      expect(result.edges[1].label).toContain('response')
    })
  })

  describe('认证流程模板', () => {
    it('应该生成认证流程图', () => {
      const result = authSequenceTemplate.generate()

      expect(result.nodes.length).toBeGreaterThan(0)
      expect(result.edges.length).toBeGreaterThan(0)
    })

    it('应该包含Actor类型的参与者', () => {
      const result = authSequenceTemplate.generate()

      const actors = result.nodes.filter(n => n.type === 'uml-actor-sequence')
      expect(actors.length).toBe(1)
      expect(actors[0].text).toBe('User')
    })

    it('应该包含Database类型的参与者', () => {
      const result = authSequenceTemplate.generate()

      const databases = result.nodes.filter(n => n.type === 'uml-database-sequence')
      expect(databases.length).toBe(1)
      expect(databases[0].text).toBe('Database')
    })

    it('应该包含片段框', () => {
      const result = authSequenceTemplate.generate()

      const fragments = result.nodes.filter(n => n.type === 'uml-fragment')
      expect(fragments.length).toBeGreaterThan(0)
    })
  })

  describe('CRUD模板', () => {
    it('应该生成CRUD操作图', () => {
      const result = crudSequenceTemplate.generate()

      expect(result.nodes.length).toBeGreaterThan(0)
      expect(result.edges.length).toBeGreaterThan(0)
    })

    it('应该包含所有CRUD消息', () => {
      const result = crudSequenceTemplate.generate()

      const labels = result.edges.map(e => e.label)
      expect(labels.some(l => l.includes('create'))).toBe(true)
      expect(labels.some(l => l.includes('read'))).toBe(true)
    })
  })

  describe('循环模板', () => {
    it('应该生成循环处理图', () => {
      const result = loopSequenceTemplate.generate()

      expect(result.nodes.length).toBeGreaterThan(0)
      expect(result.edges.length).toBeGreaterThan(0)
    })

    it('应该包含loop片段', () => {
      const result = loopSequenceTemplate.generate()

      const fragments = result.nodes.filter(n => n.type === 'uml-fragment')
      expect(fragments.length).toBeGreaterThan(0)
      expect(fragments[0].text).toContain('loop')
    })

    it('应该包含自引用消息', () => {
      const result = loopSequenceTemplate.generate()

      // 自引用消息使用特殊的源和目标ID格式
      const selfMessages = result.edges.filter(e => {
        // 提取消息索引
        const sourceMatch = e.source.match(/msg-src-(\d+)/)
        const targetMatch = e.target.match(/msg-tgt-(\d+)/)
        if (sourceMatch && targetMatch) {
          return sourceMatch[1] === targetMatch[1]
        }
        return false
      })
      expect(selfMessages.length).toBeGreaterThan(0)
    })
  })

  describe('错误处理模板', () => {
    it('应该生成错误处理图', () => {
      const result = errorHandlingTemplate.generate()

      expect(result.nodes.length).toBeGreaterThan(0)
      expect(result.edges.length).toBeGreaterThan(0)
    })

    it('应该包含opt片段', () => {
      const result = errorHandlingTemplate.generate()

      const fragments = result.nodes.filter(n => n.type === 'uml-fragment')
      expect(fragments.length).toBeGreaterThan(0)
      expect(fragments[0].text).toContain('opt')
    })
  })

  describe('自动编号功能', () => {
    it('应该支持消息自动编号', () => {
      const result = basicSequenceTemplate.generate({ autoNumber: true })

      // 检查第一条消息是否包含编号
      expect(result.edges[0].label).toMatch(/^\d+:/)
    })

    it('默认情况下不应该编号', () => {
      const result = basicSequenceTemplate.generate()

      // 检查消息不包含编号前缀
      expect(result.edges[0].label).not.toMatch(/^\d+:/)
    })

    it('编号应该按顺序递增', () => {
      const result = basicSequenceTemplate.generate({ autoNumber: true })

      const labels = result.edges.map(e => e.label)
      expect(labels[0]).toMatch(/^1:/)
      expect(labels[1]).toMatch(/^2:/)
    })
  })

  describe('模板集合', () => {
    it('应该导出所有模板', () => {
      expect(sequenceTemplates.length).toBe(8)
      expect(sequenceTemplates).toContain(basicSequenceTemplate)
      expect(sequenceTemplates).toContain(authSequenceTemplate)
      expect(sequenceTemplates).toContain(crudSequenceTemplate)
      expect(sequenceTemplates).toContain(loopSequenceTemplate)
      expect(sequenceTemplates).toContain(errorHandlingTemplate)
      expect(sequenceTemplates).toContain(criticalSequenceTemplate)
      expect(sequenceTemplates).toContain(parSequenceTemplate)
      expect(sequenceTemplates).toContain(selfCallSequenceTemplate)
    })

    it('每个模板应该有正确的元数据', () => {
      sequenceTemplates.forEach(template => {
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.description).toBeDefined()
        expect(template.category).toBe('uml')
        expect(template.tags).toContain('sequence')
      })
    })
  })

  describe('节点属性验证', () => {
    it('所有节点应该有必需的属性', () => {
      const result = basicSequenceTemplate.generate()

      result.nodes.forEach(node => {
        expect(node.id).toBeDefined()
        expect(node.type).toBeDefined()
        expect(node.x).toBeDefined()
        expect(node.y).toBeDefined()
        expect(node.width).toBeDefined()
        expect(node.height).toBeDefined()
      })
    })

    it('所有边应该有必需的属性', () => {
      const result = basicSequenceTemplate.generate()

      result.edges.forEach(edge => {
        expect(edge.id).toBeDefined()
        expect(edge.source).toBeDefined()
        expect(edge.target).toBeDefined()
      })
    })
  })

  describe('布局验证', () => {
    it('参与者应该水平排列', () => {
      const result = basicSequenceTemplate.generate()

      const participants = result.nodes.filter(n =>
        n.type === 'uml-participant' ||
        n.type === 'uml-actor-sequence' ||
        n.type === 'uml-database-sequence'
      )
      expect(participants.length).toBe(2)

      // 第二个参与者应该在第一个的右边
      expect(participants[1].x).toBeGreaterThan(participants[0].x)
    })

    it('生命线应该从参与者底部延伸', () => {
      const result = basicSequenceTemplate.generate()

      const participants = result.nodes.filter(n => n.type === 'uml-participant')
      const lifelines = result.nodes.filter(n => n.type === 'uml-lifeline')

      // 确保有相同数量的参与者和生命线
      expect(lifelines.length).toBe(participants.length)

      participants.forEach((participant, index) => {
        const lifeline = lifelines[index]
        expect(lifeline).toBeDefined()
        // 生命线应该在参与者底部附近
        expect(lifeline.y).toBeGreaterThanOrEqual(participant.y + participant.height - 5)
      })
    })
  })
})
