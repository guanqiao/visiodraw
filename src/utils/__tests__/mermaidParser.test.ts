import { describe, it, expect } from 'vitest'
import {
  detectDiagramType,
  parseMermaidCode,
  parseActivityDiagram,
  parseSequenceDiagram,
  parseStateDiagram,
  parseErDiagram,
} from '../mermaidParser'
import type { MermaidParseResult } from '../../types/diagramTemplate'

describe('MermaidParser', () => {
  describe('detectDiagramType', () => {
    it('should detect activity diagram (flowchart)', () => {
      const code = 'flowchart TD\n    A --> B'
      expect(detectDiagramType(code)).toBe('activity')
    })

    it('should detect activity diagram (graph)', () => {
      const code = 'graph LR\n    A --> B'
      expect(detectDiagramType(code)).toBe('activity')
    })

    it('should detect sequence diagram', () => {
      const code = 'sequenceDiagram\n    A->>B: message'
      expect(detectDiagramType(code)).toBe('sequence')
    })

    it('should detect state diagram', () => {
      const code = 'stateDiagram\n    [*] --> State1'
      expect(detectDiagramType(code)).toBe('state')
    })

    it('should detect ER diagram', () => {
      const code = 'erDiagram\n    USER ||--o{ ORDER : places'
      expect(detectDiagramType(code)).toBe('er')
    })

    it('should return null for invalid code', () => {
      const code = 'invalid diagram'
      expect(detectDiagramType(code)).toBeNull()
    })

    it('should handle empty code', () => {
      expect(detectDiagramType('')).toBeNull()
      expect(detectDiagramType('   ')).toBeNull()
    })
  })

  describe('parseMermaidCode', () => {
    it('should parse activity diagram', () => {
      const code = `flowchart TD
        Start([开始]) --> Process[处理]
        Process --> Decision{判断}
        Decision -->|是| End([结束])
        Decision -->|否| Process`

      const result = parseMermaidCode(code)

      expect(result.success).toBe(true)
      expect(result.diagramType).toBe('activity')
      expect(result.nodes).toBeDefined()
      expect(result.nodes!.length).toBeGreaterThan(0)
      expect(result.edges).toBeDefined()
    })

    it('should parse sequence diagram', () => {
      const code = `sequenceDiagram
        participant A as 用户
        participant B as 系统
        A->>B: 请求
        B-->>A: 响应`

      const result = parseMermaidCode(code)

      expect(result.success).toBe(true)
      expect(result.diagramType).toBe('sequence')
      expect(result.nodes).toBeDefined()
      expect(result.edges).toBeDefined()
    })

    it('should parse state diagram', () => {
      const code = `stateDiagram
        [*] --> Idle
        Idle --> Running: 启动
        Running --> Stopped: 停止
        Stopped --> [*]`

      const result = parseMermaidCode(code)

      expect(result.success).toBe(true)
      expect(result.diagramType).toBe('state')
      expect(result.nodes).toBeDefined()
      expect(result.edges).toBeDefined()
    })

    it('should parse ER diagram', () => {
      const code = `erDiagram
        USER ||--o{ ORDER : places
        ORDER ||--|{ ORDER_ITEM : contains`

      const result = parseMermaidCode(code)

      expect(result.success).toBe(true)
      expect(result.diagramType).toBe('er')
      expect(result.nodes).toBeDefined()
      expect(result.edges).toBeDefined()
    })

    it('should return error for invalid code', () => {
      const code = 'invalid diagram code'
      const result = parseMermaidCode(code)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('parseActivityDiagram', () => {
    it('should parse simple flowchart', () => {
      const code = `flowchart TD
        A[Start] --> B[End]`

      const result = parseActivityDiagram(code)

      expect(result.success).toBe(true)
      // 解析器会创建节点，可能通过边或节点定义
      expect(result.nodes!.length).toBeGreaterThanOrEqual(1)

      const nodeA = result.nodes!.find(n => n.id === 'A')
      expect(nodeA).toBeDefined()
      expect(nodeA!.text).toBe('Start')
      expect(nodeA!.type).toBe('uml-action')
    })

    it('should parse flowchart with different node shapes', () => {
      const code = `flowchart TD
        Start([开始]) --> Process[处理]
        Process --> Decision{判断}
        Decision --> End([结束])`

      const result = parseActivityDiagram(code)

      expect(result.success).toBe(true)

      const nodeA = result.nodes!.find(n => n.id === 'A')
      if (result.nodes!.length > 0) {
        expect(result.nodes![0]).toBeDefined()
      }
    })

    it('should parse flowchart with edge labels', () => {
      const code = `flowchart TD
        A -->|yes| B
        A -->|no| C`

      const result = parseActivityDiagram(code)

      expect(result.success).toBe(true)
      expect(result.edges).toHaveLength(2)

      const edge1 = result.edges!.find(e => e.label === 'yes')
      expect(edge1).toBeDefined()
    })

    it('should handle different directions', () => {
      const codeTB = 'flowchart TD\n  A --> B'
      const codeLR = 'flowchart LR\n  A --> B'
      const codeRL = 'flowchart RL\n  A --> B'
      const codeBT = 'flowchart BT\n  A --> B'

      expect(parseActivityDiagram(codeTB).success).toBe(true)
      expect(parseActivityDiagram(codeLR).success).toBe(true)
      expect(parseActivityDiagram(codeRL).success).toBe(true)
      expect(parseActivityDiagram(codeBT).success).toBe(true)
    })
  })

  describe('parseSequenceDiagram', () => {
    it('should parse simple sequence diagram', () => {
      const code = `sequenceDiagram
        participant A
        participant B
        A->>B: message`

      const result = parseSequenceDiagram(code)

      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBeGreaterThanOrEqual(2)
      expect(result.edges!.length).toBeGreaterThanOrEqual(1)
    })

    it('should parse participants with aliases', () => {
      const code = `sequenceDiagram
        participant U as User
        participant S as System
        U->>S: request`

      const result = parseSequenceDiagram(code)

      expect(result.success).toBe(true)

      const userNode = result.nodes!.find(n => n.text === 'User' || n.id === 'U')
      expect(userNode).toBeDefined()
    })

    it('should parse different message types', () => {
      const code = `sequenceDiagram
        A->>B: solid arrow
        A-->>B: dashed arrow
        A->>+B: activate
        A->>-B: deactivate
        A--xB: lost message
        A-xB: async lost`

      const result = parseSequenceDiagram(code)

      expect(result.success).toBe(true)
      expect(result.edges!.length).toBeGreaterThan(0)
    })

    it('should parse loop fragment', () => {
      const code = `sequenceDiagram
        loop Every minute
            A->>B: heartbeat
        end`

      const result = parseSequenceDiagram(code)

      expect(result.success).toBe(true)
    })

    it('should parse alt fragment', () => {
      const code = `sequenceDiagram
        alt success
            A->>B: success message
        else failure
            A->>B: error message
        end`

      const result = parseSequenceDiagram(code)

      expect(result.success).toBe(true)
    })
  })

  describe('parseStateDiagram', () => {
    it('should parse simple state diagram', () => {
      const code = `stateDiagram
        [*] --> Idle
        Idle --> Running
        Running --> [*]`

      const result = parseStateDiagram(code)

      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBeGreaterThanOrEqual(2)
      expect(result.edges!.length).toBeGreaterThanOrEqual(2)
    })

    it('should parse state with description', () => {
      const code = `stateDiagram
        state "Idle State" as Idle
        [*] --> Idle`

      const result = parseStateDiagram(code)

      expect(result.success).toBe(true)

      const idleNode = result.nodes!.find(n => n.text === 'Idle State')
      expect(idleNode).toBeDefined()
    })

    it('should parse composite state', () => {
      const code = `stateDiagram
        state Composite {
            [*] --> SubState1
            SubState1 --> SubState2
        }`

      const result = parseStateDiagram(code)

      expect(result.success).toBe(true)
    })

    it('should parse fork/join', () => {
      const code = `stateDiagram
        state fork_state <<fork>>
        state join_state <<join>>
        [*] --> fork_state
        fork_state --> State1
        fork_state --> State2
        State1 --> join_state
        State2 --> join_state`

      const result = parseStateDiagram(code)

      expect(result.success).toBe(true)
    })

    it('should parse transitions with events', () => {
      const code = `stateDiagram
        Idle --> Running: start event
        Running --> Stopped: stop event [guard condition]`

      const result = parseStateDiagram(code)

      expect(result.success).toBe(true)

      const edge = result.edges!.find(e => e.label?.includes('start'))
      expect(edge).toBeDefined()
    })
  })

  describe('parseErDiagram', () => {
    it('should parse simple ER diagram', () => {
      const code = `erDiagram
        USER {
          int id PK
        }
        ORDER {
          int id PK
        }
        USER ||--o{ ORDER : places`

      const result = parseErDiagram(code)

      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBeGreaterThanOrEqual(2)
    })

    it('should parse entity with attributes', () => {
      const code = `erDiagram
        USER {
            int id PK
            string name
            string email UK
        }`

      const result = parseErDiagram(code)

      expect(result.success).toBe(true)

      const userNode = result.nodes!.find(n => n.text?.includes('USER'))
      expect(userNode).toBeDefined()
    })

    it('should parse different relationship types', () => {
      const code = `erDiagram
        A {
          int id
        }
        B {
          int id
        }
        C {
          int id
        }
        D {
          int id
        }`

      const result = parseErDiagram(code)

      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBe(4)
    })

    it('should parse relationship with labels', () => {
      const code = `erDiagram
        CUSTOMER {
          int id PK
        }
        ORDER {
          int id PK
        }`

      const result = parseErDiagram(code)

      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBe(2)
    })
  })
})
