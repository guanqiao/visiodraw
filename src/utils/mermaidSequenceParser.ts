/**
 * Mermaid 时序图脚本解析器
 * 完整支持 Mermaid 时序图语法
 *
 * 语法支持:
 * - participant/actor/database 定义参与者
 * - ->> /-->> / -> 消息类型
 * - alt/opt/loop/par/break/critical 片段
 * - Note left/right/over 注释
 * - activate/deactivate 激活控制
 * - autonumber 自动编号
 */

export type ParticipantType = 'participant' | 'actor' | 'database'
export type MessageType = 'sync' | 'async' | 'return' | 'self' | 'create' | 'destroy'
export type FragmentType = 'alt' | 'opt' | 'loop' | 'par' | 'break' | 'critical' | 'group'
export type NotePosition = 'left' | 'right' | 'over' | 'across'

export interface SequenceParticipant {
  id: string
  name: string
  type: ParticipantType
  order: number
  color?: string
}

export interface SequenceMessage {
  id: string
  from: string
  to: string
  text: string
  type: MessageType
  order: number
  activate?: boolean
  deactivate?: boolean
  color?: string
}

export interface SequenceFragment {
  id: string
  type: FragmentType
  condition?: string
  startMessageOrder: number
  endMessageOrder: number
  parentId?: string
  color?: string
}

export interface SequenceNote {
  id: string
  position: NotePosition
  participants: string[]
  text: string
  messageOrder: number
}

export interface SequenceActivation {
  id: string
  participant: string
  startMessageOrder: number
  endMessageOrder: number
}

export interface ParsedSequenceDiagram {
  participants: SequenceParticipant[]
  messages: SequenceMessage[]
  fragments: SequenceFragment[]
  notes: SequenceNote[]
  activations: SequenceActivation[]
  autoNumber: boolean
}

interface ParseContext {
  participants: SequenceParticipant[]
  messages: SequenceMessage[]
  fragments: SequenceFragment[]
  notes: SequenceNote[]
  activations: SequenceActivation[]
  autoNumber: boolean
  messageOrder: number
  fragmentStack: Array<{ fragment: SequenceFragment; startOrder: number }>
  activationStack: Map<string, string> // participant -> activation id
}

export class MermaidSequenceParser {
  /**
   * 解析 Mermaid 时序图脚本
   */
  parse(script: string): ParsedSequenceDiagram {
    const lines = script
      .split('\n')
      .map((line, index) => ({ line: line.trim(), index }))
      .filter(({ line }) => line.length > 0 && !line.startsWith('%%'))

    const ctx: ParseContext = {
      participants: [],
      messages: [],
      fragments: [],
      notes: [],
      activations: [],
      autoNumber: false,
      messageOrder: 0,
      fragmentStack: [],
      activationStack: new Map(),
    }

    // 检查是否以 sequenceDiagram 开头
    let startIndex = 0
    if (lines.length > 0 && lines[0].line.startsWith('sequenceDiagram')) {
      startIndex = 1
      // 检查配置选项
      const configMatch = lines[0].line.match(/sequenceDiagram\s+(.*)/)
      if (configMatch) {
        const options = configMatch[1]
        if (options.includes('autonumber')) {
          ctx.autoNumber = true
        }
      }
    }

    // 第一遍：收集所有参与者定义
    for (let i = startIndex; i < lines.length; i++) {
      this.parseParticipantDefinition(lines[i].line, ctx)
    }

    // 第二遍：解析消息、片段、注释
    for (let i = startIndex; i < lines.length; i++) {
      this.parseStatement(lines[i].line, ctx)
    }

    // 关闭未闭合的片段
    while (ctx.fragmentStack.length > 0) {
      const { fragment } = ctx.fragmentStack.pop()!
      fragment.endMessageOrder = ctx.messageOrder
    }

    // 关闭未闭合的激活
    ctx.activationStack.forEach((activationId, participant) => {
      const activation = ctx.activations.find(a => a.id === activationId)
      if (activation) {
        activation.endMessageOrder = ctx.messageOrder
      }
    })

    return {
      participants: ctx.participants,
      messages: ctx.messages,
      fragments: ctx.fragments,
      notes: ctx.notes,
      activations: ctx.activations,
      autoNumber: ctx.autoNumber,
    }
  }

  private parseParticipantDefinition(line: string, ctx: ParseContext): void {
    if (line.startsWith('participant ')) {
      this.parseParticipant(line, ctx)
    } else if (line.startsWith('actor ')) {
      this.parseActor(line, ctx)
    } else if (line.startsWith('database ')) {
      this.parseDatabase(line, ctx)
    }
  }

  private parseStatement(line: string, ctx: ParseContext): void {
    // 跳过参与者定义（已在第一遍处理）
    if (line.startsWith('participant ') || line.startsWith('actor ') || line.startsWith('database ')) {
      return
    }

    // 解析注释
    if (line.startsWith('Note ')) {
      this.parseNote(line, ctx)
      return
    }

    // 解析激活控制
    if (line.startsWith('activate ')) {
      this.parseActivate(line, ctx)
      return
    }

    if (line.startsWith('deactivate ')) {
      this.parseDeactivate(line, ctx)
      return
    }

    // 解析片段
    const fragmentMatch = line.match(/^(alt|opt|loop|par|break|critical|group)\b/)
    if (fragmentMatch) {
      this.parseFragmentStart(line, ctx)
      return
    }

    if (line === 'end') {
      this.parseFragmentEnd(ctx)
      return
    }

    if (line.startsWith('else ')) {
      this.parseElse(line, ctx)
      return
    }

    if (line.startsWith('and ')) {
      this.parseAnd(line, ctx)
      return
    }

    // 解析消息
    if (this.isMessage(line)) {
      this.parseMessage(line, ctx)
      return
    }
  }

  private isMessage(line: string): boolean {
    // 匹配消息模式: A->>B:, A-->>B:, A->B:, A--xB: 等
    return /^[\w\s]+(-+)(>>|>|x|\)|\)|\*\)|#\))/.test(line)
  }

  private parseParticipant(line: string, ctx: ParseContext): void {
    // participant A as 用户 #color
    const match = line.match(/participant\s+(\w+)(?:\s+as\s+([^#]+))?(?:\s*#(.+))?/)
    if (match && !ctx.participants.find(p => p.id === match[1])) {
      ctx.participants.push({
        id: match[1],
        name: match[2] ? match[2].trim() : match[1],
        type: 'participant',
        order: ctx.participants.length,
        color: match[3] ? match[3].trim() : undefined,
      })
    }
  }

  private parseActor(line: string, ctx: ParseContext): void {
    const match = line.match(/actor\s+(\w+)(?:\s+as\s+([^#]+))?(?:\s*#(.+))?/)
    if (match && !ctx.participants.find(p => p.id === match[1])) {
      ctx.participants.push({
        id: match[1],
        name: match[2] ? match[2].trim() : match[1],
        type: 'actor',
        order: ctx.participants.length,
        color: match[3] ? match[3].trim() : undefined,
      })
    }
  }

  private parseDatabase(line: string, ctx: ParseContext): void {
    const match = line.match(/database\s+(\w+)(?:\s+as\s+([^#]+))?(?:\s*#(.+))?/)
    if (match && !ctx.participants.find(p => p.id === match[1])) {
      ctx.participants.push({
        id: match[1],
        name: match[2] ? match[2].trim() : match[1],
        type: 'database',
        order: ctx.participants.length,
      })
    }
  }

  private parseMessage(line: string, ctx: ParseContext): void {
    // 解析各种消息类型
    // A->>B: text (同步)
    // A-->>B: text (返回)
    // A->B: text (异步)
    // A--xB: text (删除)
    // A*)B: text (创建)

    const match = line.match(/^([\w\s]+?)(-+)(>>|>|x|\)|\)|\*\)|#\))([\w\s]*):(.+)$/)
    if (!match) return

    const from = match[1].trim()
    const dashes = match[2]
    const arrow = match[3].trim()
    const to = match[4].trim() || from
    const text = match[5].trim()

    ctx.messageOrder++

    // 确定消息类型
    let type: MessageType = 'sync'
    if (dashes.length > 1 && arrow === '>>') {
      type = 'return'
    } else if (arrow === '->') {
      type = 'async'
    } else if (arrow === '--x' || arrow === 'x') {
      type = 'destroy'
    } else if (arrow === '*)') {
      type = 'create'
    }

    if (from === to) {
      type = 'self'
    }

    // 检查是否有 + 或 - 后缀（自动激活/停用）
    let activate = false
    let deactivate = false

    if (text.endsWith('+')) {
      activate = true
    } else if (text.endsWith('-')) {
      deactivate = true
    }

    const cleanText = text.replace(/[+-]$/, '').trim()

    const message: SequenceMessage = {
      id: `msg-${ctx.messageOrder}`,
      from,
      to,
      text: cleanText,
      type,
      order: ctx.messageOrder,
      activate,
      deactivate,
    }

    ctx.messages.push(message)

    // 处理自动激活
    if (activate) {
      this.startActivation(to, ctx)
    }

    // 处理自动停用
    if (deactivate) {
      this.endActivation(to, ctx)
    }
  }

  private parseNote(line: string, ctx: ParseContext): void {
    // Note left of A: text
    // Note right of A: text
    // Note over A: text
    // Note over A,B: text

    const leftMatch = line.match(/Note\s+left\s+of\s+(\w+):(.+)/)
    if (leftMatch) {
      ctx.notes.push({
        id: `note-${ctx.notes.length}`,
        position: 'left',
        participants: [leftMatch[1]],
        text: leftMatch[2].trim(),
        messageOrder: ctx.messageOrder,
      })
      return
    }

    const rightMatch = line.match(/Note\s+right\s+of\s+(\w+):(.+)/)
    if (rightMatch) {
      ctx.notes.push({
        id: `note-${ctx.notes.length}`,
        position: 'right',
        participants: [rightMatch[1]],
        text: rightMatch[2].trim(),
        messageOrder: ctx.messageOrder,
      })
      return
    }

    const overMatch = line.match(/Note\s+over\s+([\w,\s]+):(.+)/)
    if (overMatch) {
      const participants = overMatch[1].split(',').map(p => p.trim())
      ctx.notes.push({
        id: `note-${ctx.notes.length}`,
        position: participants.length > 1 ? 'across' : 'over',
        participants,
        text: overMatch[2].trim(),
        messageOrder: ctx.messageOrder,
      })
      return
    }
  }

  private parseActivate(line: string, ctx: ParseContext): void {
    const match = line.match(/activate\s+(\w+)/)
    if (match) {
      this.startActivation(match[1], ctx)
    }
  }

  private parseDeactivate(line: string, ctx: ParseContext): void {
    const match = line.match(/deactivate\s+(\w+)/)
    if (match) {
      this.endActivation(match[1], ctx)
    }
  }

  private startActivation(participant: string, ctx: ParseContext): void {
    if (!ctx.activationStack.has(participant)) {
      const activationId = `act-${ctx.activations.length}`
      ctx.activationStack.set(participant, activationId)
      ctx.activations.push({
        id: activationId,
        participant,
        startMessageOrder: ctx.messageOrder,
        endMessageOrder: -1,
      })
    }
  }

  private endActivation(participant: string, ctx: ParseContext): void {
    const activationId = ctx.activationStack.get(participant)
    if (activationId) {
      const activation = ctx.activations.find(a => a.id === activationId)
      if (activation) {
        activation.endMessageOrder = ctx.messageOrder
      }
      ctx.activationStack.delete(participant)
    }
  }

  private parseFragmentStart(line: string, ctx: ParseContext): void {
    const spaceIndex = line.indexOf(' ')
    const type = line.substring(0, spaceIndex) as FragmentType
    const condition = spaceIndex > 0 ? line.substring(spaceIndex + 1).trim() : undefined

    const parentId = ctx.fragmentStack.length > 0
      ? ctx.fragmentStack[ctx.fragmentStack.length - 1].fragment.id
      : undefined

    const fragment: SequenceFragment = {
      id: `frag-${ctx.fragments.length}`,
      type,
      condition,
      startMessageOrder: ctx.messageOrder + 1,
      endMessageOrder: -1,
      parentId,
    }

    ctx.fragmentStack.push({ fragment, startOrder: ctx.messageOrder })
    ctx.fragments.push(fragment)
  }

  private parseFragmentEnd(ctx: ParseContext): void {
    if (ctx.fragmentStack.length > 0) {
      const { fragment } = ctx.fragmentStack.pop()!
      fragment.endMessageOrder = ctx.messageOrder
    }
  }

  private parseElse(line: string, ctx: ParseContext): void {
    // else condition - 在 alt 中创建新的分支
    if (ctx.fragmentStack.length > 0) {
      const { fragment } = ctx.fragmentStack[ctx.fragmentStack.length - 1]
      if (fragment.type === 'alt') {
        // 可以在这里记录 else 分支的位置
      }
    }
  }

  private parseAnd(line: string, ctx: ParseContext): void {
    // and condition - 在 par 中创建并行分支
    if (ctx.fragmentStack.length > 0) {
      const { fragment } = ctx.fragmentStack[ctx.fragmentStack.length - 1]
      if (fragment.type === 'par') {
        // 可以在这里记录并行分支
      }
    }
  }

  /**
   * 验证脚本语法
   */
  validate(script: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const lines = script.split('\n').map(line => line.trim())

    // 检查是否以 sequenceDiagram 开头
    if (lines.length > 0 && !lines[0].startsWith('sequenceDiagram')) {
      errors.push('脚本应以 "sequenceDiagram" 开头')
    }

    try {
      const result = this.parse(script)

      // 检查参与者是否定义
      const participantIds = new Set(result.participants.map(p => p.id))
      for (const msg of result.messages) {
        if (!participantIds.has(msg.from)) {
          errors.push(`未定义的参与者: ${msg.from}`)
        }
        if (!participantIds.has(msg.to)) {
          errors.push(`未定义的参与者: ${msg.to}`)
        }
      }

      // 检查片段是否正确闭合
      let openFragments = 0
      for (const line of lines) {
        if (line.match(/^(alt|opt|loop|par|break|critical|group)\s/)) {
          openFragments++
        } else if (line === 'end') {
          openFragments--
        }
      }
      if (openFragments !== 0) {
        errors.push('片段未正确闭合 (缺少 end)')
      }
    } catch (e) {
      errors.push(`解析错误: ${e}`)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// 导出单例实例
export const mermaidSequenceParser = new MermaidSequenceParser()

export default mermaidSequenceParser
