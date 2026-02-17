export interface ValidationError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
  code: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export class MermaidSyntaxValidator {
  validate(code: string, diagramType: string): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationError[] = []
    const lines = code.split('\n')

    switch (diagramType) {
      case 'activity':
        this.validateActivityDiagram(lines, errors, warnings)
        break
      case 'sequence':
        this.validateSequenceDiagram(lines, errors, warnings)
        break
      case 'state':
        this.validateStateDiagram(lines, errors, warnings)
        break
      case 'er':
        this.validateErDiagram(lines, errors, warnings)
        break
      case 'class':
        this.validateClassDiagram(lines, errors, warnings)
        break
      case 'pie':
        this.validatePieDiagram(lines, errors, warnings)
        break
      default:
        break
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private validateActivityDiagram(
    lines: string[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const nodeIds = new Set<string>()
    const edgePattern = /^(\w+)\s*(-->|---|-\.->|==>|\.->|<-->|~~~)\s*(?:\|([^|]+)\|)?\s*(\w+)$/
    const nodePattern = /^(\w+)\s*([\[\(\{<].*[\]\)\}>])/

    let hasNodes = false
    let hasEdges = false
    let subgraphDepth = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('%%')) continue

      if (line.match(/^(flowchart|graph)\s+/i)) continue

      if (line === 'subgraph' || line.match(/^subgraph\s/)) {
        subgraphDepth++
        continue
      }

      if (line === 'end') {
        if (subgraphDepth === 0) {
          errors.push({
            line: i + 1,
            column: 1,
            message: '多余的 end，没有匹配的 subgraph',
            severity: 'error',
            code: 'UNMATCHED_END',
          })
        } else {
          subgraphDepth--
        }
        continue
      }

      const edgeMatch = line.match(edgePattern)
      if (edgeMatch) {
        const [, sourceId, , , targetId] = edgeMatch
        nodeIds.add(sourceId)
        nodeIds.add(targetId)
        hasEdges = true
        continue
      }

      const nodeMatch = line.match(nodePattern)
      if (nodeMatch) {
        nodeIds.add(nodeMatch[1])
        hasNodes = true
        continue
      }

      if (line.startsWith('classDef ') || line.startsWith('style ') || 
          line.startsWith('linkStyle ') || line.match(/^class\s+[\w,]+\s+\w+/)) {
        continue
      }

      if (!line.match(/^(direction|title|click|classDef|style|linkStyle|class)\b/)) {
        warnings.push({
          line: i + 1,
          column: 1,
          message: `无法识别的语法: ${line.substring(0, 50)}...`,
          severity: 'warning',
          code: 'UNRECOGNIZED_SYNTAX',
        })
      }
    }

    if (subgraphDepth > 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: `缺少 ${subgraphDepth} 个 end 来关闭 subgraph`,
        severity: 'error',
        code: 'UNCLOSED_SUBGRAPH',
      })
    }

    if (!hasNodes && !hasEdges) {
      warnings.push({
        line: 1,
        column: 1,
        message: '图表为空，没有定义任何节点或边',
        severity: 'warning',
        code: 'EMPTY_DIAGRAM',
      })
    }
  }

  private validateSequenceDiagram(
    lines: string[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const participants = new Set<string>()
    const fragmentStack: string[] = []
    const messagePattern = /^(\w+)\s*(-+)(>>|>|x|\)|\*\)|#)\s*(\w+)\s*:\s*(.+)$/

    let hasMessages = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('%%')) continue

      if (line.match(/^sequenceDiagram/i)) continue

      const participantMatch = line.match(/^(participant|actor|database)\s+(\w+)/i)
      if (participantMatch) {
        participants.add(participantMatch[2])
        continue
      }

      const fragmentMatch = line.match(/^(alt|opt|loop|par|break|critical|group)\b/)
      if (fragmentMatch) {
        fragmentStack.push(fragmentMatch[1])
        continue
      }

      if (line === 'end') {
        if (fragmentStack.length === 0) {
          errors.push({
            line: i + 1,
            column: 1,
            message: '多余的 end，没有匹配的片段',
            severity: 'error',
            code: 'UNMATCHED_END',
          })
        } else {
          fragmentStack.pop()
        }
        continue
      }

      if (line.match(/^(else|and)\b/)) continue

      if (line.match(/^Note\s+(left|right|over)\s+/)) continue
      if (line.match(/^(activate|deactivate)\s+\w+/)) continue
      if (line.match(/^autonumber\b/)) continue

      const messageMatch = line.match(messagePattern)
      if (messageMatch) {
        const [, from, , , to] = messageMatch
        if (!participants.has(from) && !from.match(/^\w+$/)) {
          warnings.push({
            line: i + 1,
            column: 1,
            message: `未定义的参与者: ${from}`,
            severity: 'warning',
            code: 'UNDEFINED_PARTICIPANT',
          })
        }
        if (!participants.has(to) && !to.match(/^\w+$/)) {
          warnings.push({
            line: i + 1,
            column: 1,
            message: `未定义的参与者: ${to}`,
            severity: 'warning',
            code: 'UNDEFINED_PARTICIPANT',
          })
        }
        hasMessages = true
        continue
      }

      if (!line.match(/^(title|note)\b/i)) {
        warnings.push({
          line: i + 1,
          column: 1,
          message: `无法识别的语法: ${line.substring(0, 50)}...`,
          severity: 'warning',
          code: 'UNRECOGNIZED_SYNTAX',
        })
      }
    }

    if (fragmentStack.length > 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: `缺少 ${fragmentStack.length} 个 end 来关闭片段`,
        severity: 'error',
        code: 'UNCLOSED_FRAGMENT',
      })
    }

    if (!hasMessages && participants.size === 0) {
      warnings.push({
        line: 1,
        column: 1,
        message: '序列图为空',
        severity: 'warning',
        code: 'EMPTY_DIAGRAM',
      })
    }
  }

  private validateStateDiagram(
    lines: string[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const states = new Set<string>()
    const transitionPattern = /^(\[?\*?\]?|\w+)\s*-->\s*(\[?\*?\]?|\w+)(?:\s*:\s*(.+))?$/

    let hasTransitions = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('%%')) continue

      if (line.match(/^stateDiagram/i)) continue

      const stateDefMatch = line.match(/state\s+"([^"]+)"\s+as\s+(\w+)/)
      if (stateDefMatch) {
        states.add(stateDefMatch[2])
        continue
      }

      const transitionMatch = line.match(transitionPattern)
      if (transitionMatch) {
        const [, from, to] = transitionMatch
        if (from !== '[*]' && !states.has(from) && !from.match(/^\w+$/)) {
          states.add(from)
        }
        if (to !== '[*]' && !states.has(to) && !to.match(/^\w+$/)) {
          states.add(to)
        }
        hasTransitions = true
        continue
      }

      if (line.match(/^state\s+\w+\s*\{/)) continue
      if (line === '}') continue
      if (line.match(/^note\s+/)) continue

      if (!line.match(/^(direction|title)\b/i)) {
        warnings.push({
          line: i + 1,
          column: 1,
          message: `无法识别的语法: ${line.substring(0, 50)}...`,
          severity: 'warning',
          code: 'UNRECOGNIZED_SYNTAX',
        })
      }
    }

    if (!hasTransitions && states.size === 0) {
      warnings.push({
        line: 1,
        column: 1,
        message: '状态图为空',
        severity: 'warning',
        code: 'EMPTY_DIAGRAM',
      })
    }
  }

  private validateErDiagram(
    lines: string[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const entities = new Set<string>()
    const relationPattern = /^(\w+)\s+([|}o])\|?(-?-?)([|}o])\}\s+(\w+)\s*:\s*(.+)$/

    let hasRelations = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('%%')) continue

      if (line.match(/^erDiagram/i)) continue

      const entityMatch = line.match(/^(\w+)\s*\{/)
      if (entityMatch) {
        entities.add(entityMatch[1])
        continue
      }

      if (line === '}') continue

      const relationMatch = line.match(relationPattern)
      if (relationMatch) {
        const [, entity1, , , , entity2] = relationMatch
        entities.add(entity1)
        entities.add(entity2)
        hasRelations = true
        continue
      }

      warnings.push({
        line: i + 1,
        column: 1,
        message: `无法识别的语法: ${line.substring(0, 50)}...`,
        severity: 'warning',
        code: 'UNRECOGNIZED_SYNTAX',
      })
    }

    if (!hasRelations && entities.size === 0) {
      warnings.push({
        line: 1,
        column: 1,
        message: 'ER图为空',
        severity: 'warning',
        code: 'EMPTY_DIAGRAM',
      })
    }
  }

  private validateClassDiagram(
    lines: string[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    const classes = new Set<string>()
    const relationPattern = /^(\w+)\s*([\*o]?<\|[\|>]?\|[\*o]?|<[\|>]?|--[\*o]?|\.\.[\|>]?|\.\.\|>)\s*(\w+)/
    let inClass = false
    let braceCount = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('%%')) continue

      if (line.match(/^classDiagram/i)) continue

      if (line.match(/^direction\s+/)) continue

      const classMatch = line.match(/^class\s+(\w+)/)
      if (classMatch) {
        classes.add(classMatch[1])
        if (line.includes('{')) {
          inClass = true
          braceCount++
        }
        continue
      }

      if (line === '}') {
        braceCount--
        if (braceCount === 0) inClass = false
        continue
      }

      if (inClass) continue

      const relationMatch = line.match(relationPattern)
      if (relationMatch) {
        const [, class1, , class2] = relationMatch
        if (!classes.has(class1)) classes.add(class1)
        if (!classes.has(class2)) classes.add(class2)
        continue
      }

      if (line.match(/^namespace\s+/)) continue
      if (line.match(/^title\s+/)) continue

      warnings.push({
        line: i + 1,
        column: 1,
        message: `无法识别的语法: ${line.substring(0, 50)}...`,
        severity: 'warning',
        code: 'UNRECOGNIZED_SYNTAX',
      })
    }

    if (classes.size === 0) {
      warnings.push({
        line: 1,
        column: 1,
        message: '类图为空',
        severity: 'warning',
        code: 'EMPTY_DIAGRAM',
      })
    }
  }

  private validatePieDiagram(
    lines: string[],
    errors: ValidationError[],
    warnings: ValidationError[]
  ): void {
    let hasSlices = false
    const slicePattern = /^"([^"]+)"\s*:\s*(\d+(?:\.\d+)?)$/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('%%')) continue

      if (line.match(/^pie(\s+showtitle)?$/i)) continue
      if (line.match(/^title\s+/i)) continue

      const sliceMatch = line.match(slicePattern)
      if (sliceMatch) {
        hasSlices = true
        continue
      }

      warnings.push({
        line: i + 1,
        column: 1,
        message: `无法识别的语法: ${line.substring(0, 50)}...`,
        severity: 'warning',
        code: 'UNRECOGNIZED_SYNTAX',
      })
    }

    if (!hasSlices) {
      warnings.push({
        line: 1,
        column: 1,
        message: '饼图为空，没有定义数据切片',
        severity: 'warning',
        code: 'EMPTY_DIAGRAM',
      })
    }
  }
}

export const mermaidSyntaxValidator = new MermaidSyntaxValidator()
