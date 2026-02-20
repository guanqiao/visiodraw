import { describe, it, expect } from 'vitest'
import {
  DEFAULT_LAYOUT_CONFIG,
  DEFAULT_STYLES,
  FRAGMENT_TYPE_STYLES,
  getMessageColor,
  getMessageArrow,
  getMessageLineStyle,
  calculateLabelPosition,
  calculateLabelOffsetY,
  generateMessageLabel,
  calculateParticipantLayouts,
  calculateMessageY,
  calculateTotalHeight,
  createParticipantNode,
  createLifelineNode,
  createActivationNode,
  createMessageMarkers,
  createMessageEdge,
} from '../sequenceDiagramUtils'

describe('sequenceDiagramUtils', () => {
  describe('DEFAULT_LAYOUT_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_LAYOUT_CONFIG.startX).toBe(60)
      expect(DEFAULT_LAYOUT_CONFIG.startY).toBe(25)
      expect(DEFAULT_LAYOUT_CONFIG.participantWidth).toBe(120)
      expect(DEFAULT_LAYOUT_CONFIG.participantHeight).toBe(55)
      expect(DEFAULT_LAYOUT_CONFIG.participantSpacing).toBe(160)
      expect(DEFAULT_LAYOUT_CONFIG.messageSpacing).toBe(45)
    })
  })

  describe('DEFAULT_STYLES', () => {
    it('should have participant styles', () => {
      expect(DEFAULT_STYLES.participant.fill).toBe('#f0f5ff')
      expect(DEFAULT_STYLES.participant.stroke).toBe('#2f54eb')
      expect(DEFAULT_STYLES.participant.cornerRadius).toBe(6)
    })

    it('should have activation styles with gradient', () => {
      expect(DEFAULT_STYLES.activation.fill).toBe('#1890ff')
      expect(DEFAULT_STYLES.activation.fillGradient).toEqual(['#40a9ff', '#1890ff'])
    })

    it('should have lifeline styles', () => {
      expect(DEFAULT_STYLES.lifeline.stroke).toBe('#bfbfbf')
      expect(DEFAULT_STYLES.lifeline.dashArray).toBe('5,5')
    })
  })

  describe('FRAGMENT_TYPE_STYLES', () => {
    it('should have styles for all fragment types', () => {
      expect(FRAGMENT_TYPE_STYLES.alt.stroke).toBe('#722ed1')
      expect(FRAGMENT_TYPE_STYLES.loop.stroke).toBe('#1890ff')
      expect(FRAGMENT_TYPE_STYLES.par.stroke).toBe('#52c41a')
    })
  })

  describe('getMessageColor', () => {
    it('should return red for destroy message', () => {
      expect(getMessageColor('destroy')).toBe('#f5222d')
    })

    it('should return default color for other types', () => {
      expect(getMessageColor('sync')).toBe('#333333')
      expect(getMessageColor('async')).toBe('#333333')
      expect(getMessageColor('return')).toBe('#333333')
    })
  })

  describe('getMessageArrow', () => {
    it('should return open-arrow for return message', () => {
      expect(getMessageArrow('return')).toBe('open-arrow')
    })

    it('should return open-arrow for async message', () => {
      expect(getMessageArrow('async')).toBe('open-arrow')
    })

    it('should return none for destroy message', () => {
      expect(getMessageArrow('destroy')).toBe('none')
    })

    it('should return arrow for sync message', () => {
      expect(getMessageArrow('sync')).toBe('arrow')
    })
  })

  describe('getMessageLineStyle', () => {
    it('should return dashed for return message', () => {
      expect(getMessageLineStyle('return')).toBe('dashed')
    })

    it('should return dashed for create message', () => {
      expect(getMessageLineStyle('create')).toBe('dashed')
    })

    it('should return solid for sync message', () => {
      expect(getMessageLineStyle('sync')).toBe('solid')
    })
  })

  describe('calculateLabelPosition', () => {
    it('should return 0.35 for return message', () => {
      expect(calculateLabelPosition('return')).toBe(0.35)
    })

    it('should return 0.25 for self message', () => {
      expect(calculateLabelPosition('self')).toBe(0.25)
    })

    it('should return 0.4 for create and destroy messages', () => {
      expect(calculateLabelPosition('create')).toBe(0.4)
      expect(calculateLabelPosition('destroy')).toBe(0.4)
    })

    it('should return 0.5 for sync message', () => {
      expect(calculateLabelPosition('sync')).toBe(0.5)
    })
  })

  describe('calculateLabelOffsetY', () => {
    it('should return negative offset for odd order', () => {
      const offset = calculateLabelOffsetY(1)
      expect(offset).toBeLessThan(0)
    })

    it('should return positive offset for even order', () => {
      const offset = calculateLabelOffsetY(2)
      expect(offset).toBeGreaterThan(-10)
    })

    it('should alternate offsets', () => {
      const offset1 = calculateLabelOffsetY(1)
      const offset2 = calculateLabelOffsetY(2)
      expect(offset1).not.toBe(offset2)
    })
  })

  describe('generateMessageLabel', () => {
    it('should add number prefix when autoNumber is true', () => {
      const label = generateMessageLabel('test message', 5, true)
      expect(label).toBe('5: test message')
    })

    it('should return original text when autoNumber is false', () => {
      const label = generateMessageLabel('test message', 5, false)
      expect(label).toBe('test message')
    })
  })

  describe('calculateParticipantLayouts', () => {
    it('should calculate layouts for participants', () => {
      const layouts = calculateParticipantLayouts(['A', 'B', 'C'], DEFAULT_LAYOUT_CONFIG)

      expect(layouts.size).toBe(3)
      expect(layouts.get('A')?.x).toBe(60)
      expect(layouts.get('B')?.x).toBe(220) // 60 + 160
      expect(layouts.get('C')?.x).toBe(380) // 60 + 160 * 2
    })

    it('should calculate centerX correctly', () => {
      const layouts = calculateParticipantLayouts(['A'], DEFAULT_LAYOUT_CONFIG)
      const layout = layouts.get('A')

      expect(layout?.centerX).toBe(120) // 60 + 120/2
      expect(layout?.bottomY).toBe(80) // 25 + 55
    })
  })

  describe('calculateMessageY', () => {
    it('should calculate Y position correctly', () => {
      const y = calculateMessageY(2, DEFAULT_LAYOUT_CONFIG, 100)
      expect(y).toBe(190) // 100 + 2 * 45
    })

    it('should use default offset of 0', () => {
      const y = calculateMessageY(1, DEFAULT_LAYOUT_CONFIG)
      expect(y).toBe(45) // 0 + 1 * 45
    })
  })

  describe('calculateTotalHeight', () => {
    it('should calculate total height correctly', () => {
      const height = calculateTotalHeight(5, DEFAULT_LAYOUT_CONFIG, 100)
      expect(height).toBe(375) // 100 + 5 * 45 + 50 (lifelineExtension)
    })
  })

  describe('createParticipantNode', () => {
    it('should create participant node', () => {
      const layouts = calculateParticipantLayouts(['A'], DEFAULT_LAYOUT_CONFIG)
      const layout = layouts.get('A')!
      const node = createParticipantNode('A', 'Participant A', layout, 'participant')

      expect(node.type).toBe('uml-participant')
      expect(node.text).toBe('Participant A')
      expect(node.fill).toBe(DEFAULT_STYLES.participant.fill)
    })

    it('should create actor node', () => {
      const layouts = calculateParticipantLayouts(['A'], DEFAULT_LAYOUT_CONFIG)
      const layout = layouts.get('A')!
      const node = createParticipantNode('A', 'Actor A', layout, 'actor')

      expect(node.type).toBe('uml-actor-sequence')
      expect(node.fill).toBe(DEFAULT_STYLES.actor.fill)
    })
  })

  describe('createLifelineNode', () => {
    it('should create lifeline node', () => {
      const layouts = calculateParticipantLayouts(['A'], DEFAULT_LAYOUT_CONFIG)
      const layout = layouts.get('A')!
      const node = createLifelineNode('A', layout, 300)

      expect(node.type).toBe('uml-lifeline')
      expect(node.x).toBe(layout.centerX)
      expect(node.y).toBe(layout.bottomY)
      expect(node.dashArray).toBe('5,5')
    })
  })

  describe('createActivationNode', () => {
    it('should create activation node', () => {
      const layouts = calculateParticipantLayouts(['A'], DEFAULT_LAYOUT_CONFIG)
      const layout = layouts.get('A')!
      const node = createActivationNode('act-1', layout, 100, 150)

      expect(node.type).toBe('uml-activation')
      expect(node.fill).toBe(DEFAULT_STYLES.activation.fill)
      expect(node.height).toBeGreaterThanOrEqual(28)
    })
  })

  describe('createMessageMarkers', () => {
    it('should create markers for normal message', () => {
      const markers = createMessageMarkers('msg-1', 100, 200, 150, 'sync')

      expect(markers).toHaveLength(2)
      expect(markers[0].type).toBe('uml-message-marker')
      expect(markers[1].type).toBe('uml-message-marker')
    })

    it('should create only source marker for destroy message', () => {
      const markers = createMessageMarkers('msg-1', 100, 200, 150, 'destroy')

      expect(markers).toHaveLength(1)
      expect(markers[0].fill).toBe('#f5222d')
    })
  })

  describe('createMessageEdge', () => {
    it('should create message edge', () => {
      const edge = createMessageEdge('msg-1', 'src', 'tgt', 'test', 'sync', 1)

      expect(edge.id).toBe('msg-msg-1')
      expect(edge.sourceShapeId).toBe('src')
      expect(edge.targetShapeId).toBe('tgt')
      expect(edge.lineStyle).toBe('solid')
      expect(edge.endStyle).toBe('arrow')
    })

    it('should add number prefix when autoNumber is true', () => {
      const edge = createMessageEdge('msg-1', 'src', 'tgt', 'test', 'sync', 5, true)

      expect(edge.labels?.[0].text).toBe('5: test')
    })

    it('should set correct label position for return message', () => {
      const edge = createMessageEdge('msg-1', 'src', 'tgt', 'test', 'return', 1)

      expect(edge.lineStyle).toBe('dashed')
      expect(edge.endStyle).toBe('open-arrow')
      expect(edge.labels?.[0].position).toBe(0.35)
    })
  })
})
