import { describe, it, expect } from 'vitest'
import { parseActivityDiagram } from '../mermaidParser'
import type { MermaidParseResult } from '../../types/diagramTemplate'

describe('ActivityDiagram Parser', () => {
  describe('Basic Node Parsing', () => {
    it('should parse simple rectangular nodes', () => {
      const code = `flowchart TD
    A[Start] --> B[End]`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBeGreaterThanOrEqual(1)
      
      const nodeA = result.nodes!.find(n => n.id === 'A')
      expect(nodeA).toBeDefined()
      expect(nodeA!.text).toBe('Start')
      expect(nodeA!.type).toBe('uml-action')
    })

    it('should parse rounded nodes (stadium shape)', () => {
      const code = `flowchart TD
    Start([开始]) --> End([结束])`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const startNode = result.nodes!.find(n => n.id === 'Start')
      expect(startNode).toBeDefined()
      expect(startNode!.type).toBe('mermaid-stadium')
    })

    it('should parse diamond nodes (decision)', () => {
      const code = `flowchart TD
    Decision{是否继续?} --> Yes`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const decisionNode = result.nodes!.find(n => n.id === 'Decision')
      expect(decisionNode).toBeDefined()
      expect(decisionNode!.type).toBe('mermaid-rhombus')
    })

    it('should parse circle nodes', () => {
      const code = `flowchart TD
    Start((开始)) --> End((结束))`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const startNode = result.nodes!.find(n => n.id === 'Start')
      expect(startNode).toBeDefined()
      expect(startNode!.type).toBe('mermaid-circle')
    })

    it('should parse cylinder nodes', () => {
      const code = `flowchart TD
    DB[(数据库)] --> Process`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const dbNode = result.nodes!.find(n => n.id === 'DB')
      expect(dbNode).toBeDefined()
      expect(dbNode!.type).toBe('mermaid-cylinder')
    })

    it('should parse hexagon nodes', () => {
      const code = `flowchart TD
    Loop{{循环}} --> Process`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const loopNode = result.nodes!.find(n => n.id === 'Loop')
      expect(loopNode).toBeDefined()
      expect(loopNode!.type).toBe('mermaid-hexagon')
    })

    it('should parse parallelogram nodes', () => {
      const code = `flowchart TD
    Input[/输入/] --> Process
    Process --> Output[\\输出\\]`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const inputNode = result.nodes!.find(n => n.id === 'Input')
      expect(inputNode).toBeDefined()
      expect(inputNode!.type).toBe('mermaid-parallelogram-left')
    })

    it('should parse trapezoid nodes', () => {
      const code = `flowchart TD
    Top[/梯形\\] --> Bottom[\\梯形/]`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
    })
  })

  describe('New Syntax Shapes', () => {
    it('should parse @shape: stadium', () => {
      const code = `flowchart TD
    A@{shape: stadium}
    A --> B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const nodeA = result.nodes!.find(n => n.id === 'A')
      expect(nodeA).toBeDefined()
      expect(nodeA!.type).toBe('mermaid-stadium')
    })

    it('should parse @shape: card', () => {
      const code = `flowchart TD
    A@{shape: card}
    A --> B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const nodeA = result.nodes!.find(n => n.id === 'A')
      expect(nodeA).toBeDefined()
      expect(nodeA!.type).toBe('mermaid-card')
    })

    it('should parse @shape: priority', () => {
      const code = `flowchart TD
    A@{shape: priority}
    A --> B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const nodeA = result.nodes!.find(n => n.id === 'A')
      expect(nodeA).toBeDefined()
      expect(nodeA!.type).toBe('mermaid-priority')
    })

    it('should parse @shape: bolt', () => {
      const code = `flowchart TD
    A@{shape: bolt}
    A --> B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const nodeA = result.nodes!.find(n => n.id === 'A')
      expect(nodeA).toBeDefined()
      expect(nodeA!.type).toBe('mermaid-bolt')
    })
  })

  describe('Edge Parsing', () => {
    it('should parse solid arrow edge', () => {
      const code = `flowchart TD
    A --> B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.edges!.length).toBe(1)
      
      const edge = result.edges![0]
      expect(edge.source).toBe('A')
      expect(edge.target).toBe('B')
      expect(edge.lineStyle).toBe('solid')
      expect(edge.endMarker).toBe('arrow')
    })

    it('should parse dashed arrow edge', () => {
      const code = `flowchart TD
    A -.-> B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const edge = result.edges![0]
      expect(edge.lineStyle).toBe('dashed')
    })

    it('should parse thick arrow edge', () => {
      const code = `flowchart TD
    A ==> B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const edge = result.edges![0]
      expect(edge.lineStyle).toBe('solid')
      expect(edge.startMarker).toBe('arrow')
      expect(edge.endMarker).toBe('arrow')
    })

    it('should parse bidirectional edge', () => {
      const code = `flowchart TD
    A <--> B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const edge = result.edges![0]
      expect(edge.startMarker).toBe('arrow')
      expect(edge.endMarker).toBe('arrow')
    })

    it('should parse circle marker edge', () => {
      const code = `flowchart TD
    A --o B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const edge = result.edges![0]
      expect(edge.endMarker).toBe('circle')
    })

    it('should parse cross marker edge', () => {
      const code = `flowchart TD
    A --x B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const edge = result.edges![0]
      expect(edge.endMarker).toBe('cross')
    })

    it('should parse edge with label', () => {
      const code = `flowchart TD
    A -->|是| B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const edge = result.edges![0]
      expect(edge.label).toBe('是')
    })
  })

  describe('Multi-Chain Edge Parsing', () => {
    it('should parse two-node chain', () => {
      const code = `flowchart TD
    A --> B --> C`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.edges!.length).toBeGreaterThanOrEqual(2)
      
      const edge1 = result.edges!.find(e => e.source === 'A' && e.target === 'B')
      const edge2 = result.edges!.find(e => e.source === 'B' && e.target === 'C')
      
      expect(edge1).toBeDefined()
      expect(edge2).toBeDefined()
    })

    it('should parse three-node chain', () => {
      const code = `flowchart TD
    A --> B --> C --> D`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.edges!.length).toBeGreaterThanOrEqual(3)
    })

    it('should parse chain with labels', () => {
      const code = `flowchart TD
    A -->|step1| B -->|step2| C`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.edges!.length).toBeGreaterThanOrEqual(2)
      
      const edge1 = result.edges!.find(e => e.source === 'A' && e.target === 'B')
      const edge2 = result.edges!.find(e => e.source === 'B' && e.target === 'C')
      
      expect(edge1!.label).toBe('step1')
      expect(edge2!.label).toBe('step2')
    })

    it('should parse chain with different arrow types', () => {
      const code = `flowchart TD
    A --> B -.-> C ==> D`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.edges!.length).toBeGreaterThanOrEqual(3)
      
      const edge1 = result.edges!.find(e => e.source === 'A' && e.target === 'B')
      const edge2 = result.edges!.find(e => e.source === 'B' && e.target === 'C')
      const edge3 = result.edges!.find(e => e.source === 'C' && e.target === 'D')
      
      expect(edge1!.lineStyle).toBe('solid')
      expect(edge2!.lineStyle).toBe('dashed')
      expect(edge3!.lineStyle).toBe('solid')
    })
  })

  describe('Subgraph/Swimlane Parsing', () => {
    it('should parse simple subgraph', () => {
      const code = `flowchart TD
    subgraph Group1 [分组1]
        A --> B
    end`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const subgraphNode = result.nodes!.find(n => n.id === 'Group1')
      expect(subgraphNode).toBeDefined()
      expect(subgraphNode!.text).toBe('分组1')
    })

    it('should parse multiple subgraphs', () => {
      const code = `flowchart TD
    subgraph Group1 [分组1]
        A --> B
    end
    subgraph Group2 [分组2]
        C --> D
    end`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const subgraph1 = result.nodes!.find(n => n.id === 'Group1')
      const subgraph2 = result.nodes!.find(n => n.id === 'Group2')
      
      expect(subgraph1).toBeDefined()
      expect(subgraph2).toBeDefined()
    })

    it('should assign nodes to swimlane', () => {
      const code = `flowchart TD
    subgraph Lane1 [泳道1]
        A --> B
    end`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const nodeA = result.nodes!.find(n => n.id === 'A')
      expect(nodeA).toBeDefined()
      expect((nodeA!.data as any)?.swimlaneId).toBe('Lane1')
    })

    it('should calculate swimlane bounds based on content', () => {
      const code = `flowchart TD
    subgraph Lane1 [泳道1]
        A[节点A] --> B[节点B]
    end`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const swimlane = result.nodes!.find(n => n.id === 'Lane1')
      expect(swimlane).toBeDefined()
      expect(swimlane!.width).toBeGreaterThan(0)
      expect(swimlane!.height).toBeGreaterThan(0)
    })
  })

  describe('Direction Parsing', () => {
    it('should parse TD direction', () => {
      const code = `flowchart TD
    A --> B`
      const result = parseActivityDiagram(code)
      expect(result.success).toBe(true)
    })

    it('should parse TB direction', () => {
      const code = `flowchart TB
    A --> B`
      const result = parseActivityDiagram(code)
      expect(result.success).toBe(true)
    })

    it('should parse LR direction', () => {
      const code = `flowchart LR
    A --> B`
      const result = parseActivityDiagram(code)
      expect(result.success).toBe(true)
    })

    it('should parse RL direction', () => {
      const code = `flowchart RL
    A --> B`
      const result = parseActivityDiagram(code)
      expect(result.success).toBe(true)
    })

    it('should parse BT direction', () => {
      const code = `flowchart BT
    A --> B`
      const result = parseActivityDiagram(code)
      expect(result.success).toBe(true)
    })
  })

  describe('Complex Scenarios', () => {
    it('should parse decision flow', () => {
      const code = `flowchart TD
    Start([开始]) --> Input[输入数据]
    Input --> Decision{有效?}
    Decision -->|是| Process[处理]
    Decision -->|否| Input
    Process --> End([结束])`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBeGreaterThanOrEqual(5)
      expect(result.edges!.length).toBeGreaterThanOrEqual(4)
    })

    it('should parse loop flow', () => {
      const code = `flowchart TD
    Start([开始]) --> Init[初始化]
    Init --> Condition{i < n?}
    Condition -->|是| Process[处理]
    Condition -->|否| End([结束])
    Process --> Increment[i++]
    Increment --> Condition`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBeGreaterThanOrEqual(6)
      expect(result.edges!.length).toBeGreaterThanOrEqual(5)
    })

    it('should parse parallel flow', () => {
      const code = `flowchart TD
    Start([开始]) --> Fork[分叉]
    Fork --> ProcessA[处理A]
    Fork --> ProcessB[处理B]
    ProcessA --> Join[汇合]
    ProcessB --> Join
    Join --> End([结束])`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBeGreaterThanOrEqual(6)
      expect(result.edges!.length).toBeGreaterThanOrEqual(5)
    })

    it('should handle comments', () => {
      const code = `flowchart TD
    %% 这是一个注释
    A --> B
    %% 这是另一个注释
    B --> C`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.edges!.length).toBe(2)
    })
  })

  describe('Style Parsing', () => {
    it('should parse classDef', () => {
      const code = `flowchart TD
    classDef customStyle fill:#f9f,stroke:#333,stroke-width:4px
    A --> B`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
    })

    it('should apply style to node', () => {
      const code = `flowchart TD
    A[Node A]
    style A fill:#f9f,stroke:#333`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      
      const nodeA = result.nodes!.find(n => n.id === 'A')
      expect(nodeA).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle empty diagram', () => {
      const code = `flowchart TD`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
      expect(result.nodes!.length).toBe(0)
    })

    it('should handle invalid syntax gracefully', () => {
      const code = `flowchart TD
    A -->`
      const result = parseActivityDiagram(code)
      
      expect(result.success).toBe(true)
    })
  })
})
