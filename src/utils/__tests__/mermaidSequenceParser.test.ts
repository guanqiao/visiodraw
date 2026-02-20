import { describe, it, expect } from 'vitest'
import { MermaidSequenceParser } from '../mermaidSequenceParser'

describe('MermaidSequenceParser', () => {
  const parser = new MermaidSequenceParser()

  describe('参与者解析', () => {
    it('应该解析 participant 定义', () => {
      const script = `
sequenceDiagram
  participant A as 用户
  participant B as 系统
`
      const result = parser.parse(script)

      expect(result.participants.length).toBe(2)
      expect(result.participants[0].id).toBe('A')
      expect(result.participants[0].name).toBe('用户')
      expect(result.participants[0].type).toBe('participant')
    })

    it('应该解析 actor 定义', () => {
      const script = `
sequenceDiagram
  actor User as 用户
  actor System as 系统
`
      const result = parser.parse(script)

      expect(result.participants.length).toBe(2)
      expect(result.participants[0].type).toBe('actor')
      expect(result.participants[1].type).toBe('actor')
    })

    it('应该解析 database 定义', () => {
      const script = `
sequenceDiagram
  database DB as 数据库
`
      const result = parser.parse(script)

      expect(result.participants.length).toBe(1)
      expect(result.participants[0].type).toBe('database')
      expect(result.participants[0].id).toBe('DB')
    })

    it('应该解析带颜色的参与者', () => {
      const script = `
sequenceDiagram
  participant A #red
`
      const result = parser.parse(script)

      expect(result.participants[0].color).toBe('red')
    })

    it('应该解析简写参与者（无别名）', () => {
      const script = `
sequenceDiagram
  participant A
`
      const result = parser.parse(script)

      expect(result.participants[0].name).toBe('A')
    })
  })

  describe('消息解析', () => {
    it('应该解析同步消息 (->>)', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A->>B: 同步消息
`
      const result = parser.parse(script)

      expect(result.messages.length).toBe(1)
      expect(result.messages[0].type).toBe('sync')
      expect(result.messages[0].from).toBe('A')
      expect(result.messages[0].to).toBe('B')
      expect(result.messages[0].text).toBe('同步消息')
    })

    it('应该解析返回消息 (-->>)', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A-->>B: 返回消息
`
      const result = parser.parse(script)

      expect(result.messages[0].type).toBe('return')
    })

    it('应该解析异步消息 (->)', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A-)B: 异步消息
`
      const result = parser.parse(script)

      expect(result.messages.length).toBeGreaterThanOrEqual(1)
    })

    it('应该解析自消息', () => {
      const script = `
sequenceDiagram
  participant A
  A->>A: 自调用
`
      const result = parser.parse(script)

      expect(result.messages[0].type).toBe('self')
      expect(result.messages[0].from).toBe('A')
      expect(result.messages[0].to).toBe('A')
    })

    it('应该解析带颜色的消息', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A->>B: 消息 #red
`
      const result = parser.parse(script)

      expect(result.messages[0].color).toBe('red')
    })

    it('应该正确设置消息顺序', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A->>B: 消息1
  B->>A: 消息2
  A->>B: 消息3
`
      const result = parser.parse(script)

      expect(result.messages[0].order).toBe(1)
      expect(result.messages[1].order).toBe(2)
      expect(result.messages[2].order).toBe(3)
    })
  })

  describe('片段解析', () => {
    it('应该解析 alt 片段', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  alt 条件1
    A->>B: 消息1
  else 条件2
    A->>B: 消息2
  end
`
      const result = parser.parse(script)

      expect(result.fragments.length).toBe(1)
      expect(result.fragments[0].type).toBe('alt')
      expect(result.fragments[0].condition).toBe('条件1')
    })

    it('应该解析 opt 片段', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  opt 可选操作
    A->>B: 消息
  end
`
      const result = parser.parse(script)

      expect(result.fragments.length).toBe(1)
      expect(result.fragments[0].type).toBe('opt')
    })

    it('应该解析 loop 片段', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  loop 循环条件
    A->>B: 消息
  end
`
      const result = parser.parse(script)

      expect(result.fragments.length).toBe(1)
      expect(result.fragments[0].type).toBe('loop')
    })

    it('应该解析 par 片段', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  par 并行分支
    A->>B: 消息1
  and 另一分支
    B->>A: 消息2
  end
`
      const result = parser.parse(script)

      expect(result.fragments.length).toBe(1)
      expect(result.fragments[0].type).toBe('par')
    })

    it('应该解析嵌套片段', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  alt 外层条件
    loop 循环
      A->>B: 消息
    end
  end
`
      const result = parser.parse(script)

      expect(result.fragments.length).toBe(2)
      expect(result.fragments[1].parentId).toBe(result.fragments[0].id)
    })
  })

  describe('注释解析', () => {
    it('应该解析左侧注释', () => {
      const script = `
sequenceDiagram
  participant A
  Note left of A: 左侧注释
`
      const result = parser.parse(script)

      expect(result.notes.length).toBe(1)
      expect(result.notes[0].position).toBe('left')
      expect(result.notes[0].participants).toEqual(['A'])
      expect(result.notes[0].text).toBe('左侧注释')
    })

    it('应该解析右侧注释', () => {
      const script = `
sequenceDiagram
  participant A
  Note right of A: 右侧注释
`
      const result = parser.parse(script)

      expect(result.notes[0].position).toBe('right')
    })

    it('应该解析跨参与者注释', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  Note over A,B: 跨参与者注释
`
      const result = parser.parse(script)

      expect(result.notes[0].position).toBe('across')
      expect(result.notes[0].participants).toEqual(['A', 'B'])
    })

    it('应该解析单参与者注释', () => {
      const script = `
sequenceDiagram
  participant A
  Note over A: 单参与者注释
`
      const result = parser.parse(script)

      expect(result.notes[0].position).toBe('over')
      expect(result.notes[0].participants).toEqual(['A'])
    })
  })

  describe('激活控制', () => {
    it('应该解析 activate 指令', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A->>B: 消息
  activate B
`
      const result = parser.parse(script)

      expect(result.activations.length).toBe(1)
      expect(result.activations[0].participant).toBe('B')
    })

    it('应该解析 deactivate 指令', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A->>B: 消息
  activate B
  B-->>A: 返回
  deactivate B
`
      const result = parser.parse(script)

      expect(result.activations[0].endMessageOrder).toBeGreaterThan(0)
    })

    it('应该解析消息中的自动激活 (+)', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A->>B: 消息+
`
      const result = parser.parse(script)

      expect(result.messages[0].activate).toBe(true)
      expect(result.activations.length).toBe(1)
    })

    it('应该解析消息中的自动停用 (-)', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A->>B: 消息+
  B-->>A: 返回-
`
      const result = parser.parse(script)

      expect(result.messages[1].deactivate).toBe(true)
    })
  })

  describe('自动编号', () => {
    it('应该解析 autonumber 配置', () => {
      const script = `
sequenceDiagram autonumber
  participant A
  participant B
  A->>B: 消息
`
      const result = parser.parse(script)

      expect(result.autoNumber).toBe(true)
    })
  })

  describe('引用解析', () => {
    it('应该解析 ref over', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  ref over A,B: 引用内容
`
      const result = parser.parse(script)

      expect(result.references.length).toBe(1)
      expect(result.references[0].participants).toEqual(['A', 'B'])
      expect(result.references[0].text).toBe('引用内容')
    })
  })

  describe('验证功能', () => {
    it('应该验证正确的脚本', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  A->>B: 消息
`
      const result = parser.parse(script)

      expect(result.participants.length).toBe(2)
      expect(result.messages.length).toBe(1)
    })

    it('应该检测缺少 sequenceDiagram 开头', () => {
      const script = `
participant A
A->>B: 消息
`
      const validation = parser.validate(script)

      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes('sequenceDiagram'))).toBe(true)
    })

    it('应该检测未闭合的片段', () => {
      const script = `
sequenceDiagram
  participant A
  participant B
  alt 条件
    A->>B: 消息
`
      const validation = parser.validate(script)

      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes('end'))).toBe(true)
    })

    it('应该检测未定义的参与者', () => {
      const script = `
sequenceDiagram
  participant A
  A->>B: 消息
`
      const validation = parser.validate(script)

      expect(validation.valid).toBe(false)
      expect(validation.errors.some(e => e.includes('B'))).toBe(true)
    })
  })

  describe('复杂场景', () => {
    it('应该解析完整的时序图', () => {
      const script = `
sequenceDiagram
  participant User as 用户
  actor App as 应用
  database DB as 数据库

  User->>App: 登录请求
  activate App
  App->>DB: 查询用户
  activate DB
  DB-->>App: 用户数据
  deactivate DB
  App-->>User: 登录成功
  deactivate App

  Note over User,DB: 完整登录流程
`
      const result = parser.parse(script)

      expect(result.participants.length).toBe(3)
      expect(result.messages.length).toBe(4)
      expect(result.activations.length).toBe(2)
      expect(result.notes.length).toBe(1)
    })

    it('应该处理注释行', () => {
      const script = `
sequenceDiagram
  %% 这是注释
  participant A
  %% 另一个注释
  A->>A: 自消息
`
      const result = parser.parse(script)

      expect(result.participants.length).toBe(1)
      expect(result.messages.length).toBe(1)
    })
  })
})
