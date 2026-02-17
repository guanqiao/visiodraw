import { describe, it, expect } from 'vitest'
import { 
  renderServer,
  renderCloud,
  renderRouter,
  renderSwitch,
  renderFirewall,
  renderDesktop,
  renderLaptop,
  renderWifi,
  renderGlobe,
} from '../cloud'
import type { ShapeRenderConfig } from '../types'

describe('cloud architecture shape renderers', () => {
  const defaultConfig: ShapeRenderConfig = {
    id: 'test-cloud',
    x: 100,
    y: 200,
    width: 120,
    height: 80,
    fill: '#e6f7ff',
    stroke: '#1890ff',
    strokeWidth: 2,
    text: 'Server',
  }

  describe('renderServer', () => {
    it('should create a server shape', () => {
      const node = renderServer(defaultConfig)
      
      expect(node.id).toBe('test-cloud')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderCloud', () => {
    it('should create a cloud shape', () => {
      const node = renderCloud(defaultConfig)
      
      expect(node.id).toBe('test-cloud')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderRouter', () => {
    it('should create a router shape', () => {
      const node = renderRouter(defaultConfig)
      
      expect(node.id).toBe('test-cloud')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderSwitch', () => {
    it('should create a switch shape', () => {
      const node = renderSwitch(defaultConfig)
      
      expect(node.id).toBe('test-cloud')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderFirewall', () => {
    it('should create a firewall shape', () => {
      const node = renderFirewall(defaultConfig)
      
      expect(node.id).toBe('test-cloud')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderDesktop', () => {
    it('should create a desktop shape', () => {
      const node = renderDesktop(defaultConfig)
      
      expect(node.id).toBe('test-cloud')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderLaptop', () => {
    it('should create a laptop shape', () => {
      const node = renderLaptop(defaultConfig)
      
      expect(node.id).toBe('test-cloud')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderWifi', () => {
    it('should create a wifi shape', () => {
      const node = renderWifi(defaultConfig)
      
      expect(node.id).toBe('test-cloud')
      expect(node.shape).toBe('path')
    })
  })

  describe('renderGlobe', () => {
    it('should create a globe shape', () => {
      const node = renderGlobe(defaultConfig)
      
      expect(node.id).toBe('test-cloud')
      expect(node.shape).toBe('path')
    })
  })
})
