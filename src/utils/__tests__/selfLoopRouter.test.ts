/**
 * SelfLoopRouter 测试用例
 *
 * 测试自连线路由算法的核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  SelfLoopRouter,
  SelfLoopManager,
  defaultSelfLoopConfig,
  type SelfLoopDirection,
} from '../selfLoopRouter'

describe('SelfLoopRouter', () => {
  let router: SelfLoopRouter

  beforeEach(() => {
    router = new SelfLoopRouter()
  })

  describe('基本功能', () => {
    it('应该使用默认配置创建', () => {
      const config = router.getConfig()
      expect(config.radius).toBe(defaultSelfLoopConfig.radius)
      expect(config.direction).toBe(defaultSelfLoopConfig.direction)
      expect(config.useBezier).toBe(defaultSelfLoopConfig.useBezier)
    })

    it('应该支持自定义配置', () => {
      const customRouter = new SelfLoopRouter({
        radius: 50,
        direction: 'right',
        useBezier: false,
      })
      const config = customRouter.getConfig()
      expect(config.radius).toBe(50)
      expect(config.direction).toBe('right')
      expect(config.useBezier).toBe(false)
    })

    it('应该能更新配置', () => {
      router.updateConfig({ radius: 60 })
      const config = router.getConfig()
      expect(config.radius).toBe(60)
    })
  })

  describe('路径计算', () => {
    const nodeX = 100
    const nodeY = 100
    const nodeWidth = 80
    const nodeHeight = 60

    it('应该计算顶部方向的自连线路径', () => {
      router.updateConfig({ direction: 'top' })
      const path = router.calculatePath(nodeX, nodeY, nodeWidth, nodeHeight, 0)

      expect(path.points.length).toBeGreaterThan(0)
      expect(path.startPoint).toBeDefined()
      expect(path.endPoint).toBeDefined()
      // 起点和终点应该在节点顶部边缘
      expect(path.startPoint.y).toBe(nodeY - nodeHeight / 2)
      expect(path.endPoint.y).toBe(nodeY - nodeHeight / 2)
    })

    it('应该计算右侧方向的自连线路径', () => {
      router.updateConfig({ direction: 'right' })
      const path = router.calculatePath(nodeX, nodeY, nodeWidth, nodeHeight, 0)

      expect(path.points.length).toBeGreaterThan(0)
      // 起点和终点应该在节点右侧边缘
      expect(path.startPoint.x).toBe(nodeX + nodeWidth / 2)
      expect(path.endPoint.x).toBe(nodeX + nodeWidth / 2)
    })

    it('应该计算底部方向的自连线路径', () => {
      router.updateConfig({ direction: 'bottom' })
      const path = router.calculatePath(nodeX, nodeY, nodeWidth, nodeHeight, 0)

      expect(path.points.length).toBeGreaterThan(0)
      // 起点和终点应该在节点底部边缘
      expect(path.startPoint.y).toBe(nodeY + nodeHeight / 2)
      expect(path.endPoint.y).toBe(nodeY + nodeHeight / 2)
    })

    it('应该计算左侧方向的自连线路径', () => {
      router.updateConfig({ direction: 'left' })
      const path = router.calculatePath(nodeX, nodeY, nodeWidth, nodeHeight, 0)

      expect(path.points.length).toBeGreaterThan(0)
      // 起点和终点应该在节点左侧边缘
      expect(path.startPoint.x).toBe(nodeX - nodeWidth / 2)
      expect(path.endPoint.x).toBe(nodeX - nodeWidth / 2)
    })

    it('应该支持贝塞尔曲线模式', () => {
      router.updateConfig({ useBezier: true, direction: 'top' })
      const path = router.calculatePath(nodeX, nodeY, nodeWidth, nodeHeight, 0)

      expect(path.controlPoints).toBeDefined()
      expect(path.controlPoints?.length).toBe(2)
    })

    it('应该支持非贝塞尔曲线模式', () => {
      router.updateConfig({ useBezier: false, direction: 'top' })
      const path = router.calculatePath(nodeX, nodeY, nodeWidth, nodeHeight, 0)

      expect(path.controlPoints).toBeUndefined()
      expect(path.points.length).toBe(3) // 起点、中点、终点
    })

    it('应该根据现有自连线数量调整偏移', () => {
      router.updateConfig({ direction: 'top', offset: 20 })
      const path1 = router.calculatePath(nodeX, nodeY, nodeWidth, nodeHeight, 0)
      const path2 = router.calculatePath(nodeX, nodeY, nodeWidth, nodeHeight, 1)

      // 第二个自连线的控制点应该更远
      expect(path2.controlPoints?.[0].y).toBeLessThan(path1.controlPoints?.[0].y || 0)
    })
  })

  describe('多自连线配置', () => {
    it('应该为多个自连线分配不同方向', () => {
      const directions: SelfLoopDirection[] = ['top', 'right', 'bottom', 'left']

      directions.forEach((_, index) => {
        const config = router.calculateMultiLoopConfig('node1', 4, index)
        expect(config.direction).toBe(directions[index])
      })
    })

    it('应该为超过4个的自连线增加偏移', () => {
      const config1 = router.calculateMultiLoopConfig('node1', 5, 4)
      const config2 = router.calculateMultiLoopConfig('node1', 5, 5)

      // 索引4对应第5个自连线，方向为top（4 % 4 = 0），偏移为1层（4 / 4 = 1）
      expect(config1.direction).toBe('top')
      expect(config1.offset).toBe(25)
      // 索引5对应第6个自连线，方向为right（5 % 4 = 1），偏移为1层（5 / 4 = 1）
      expect(config2.direction).toBe('right')
      expect(config2.offset).toBe(25)
    })
  })

  describe('静态方法', () => {
    it('应该正确检测自连线', () => {
      expect(SelfLoopRouter.isSelfLoop('node1', 'node1')).toBe(true)
      expect(SelfLoopRouter.isSelfLoop('node1', 'node2')).toBe(false)
    })
  })
})

describe('SelfLoopManager', () => {
  let manager: SelfLoopManager

  beforeEach(() => {
    manager = new SelfLoopManager()
  })

  describe('注册管理', () => {
    it('应该注册自连线并返回索引', () => {
      const index1 = manager.registerLoop('edge1', 'node1')
      const index2 = manager.registerLoop('edge2', 'node1')

      expect(index1).toBe(0)
      expect(index2).toBe(1)
    })

    it('应该统计节点的自连线数量', () => {
      manager.registerLoop('edge1', 'node1')
      manager.registerLoop('edge2', 'node1')
      manager.registerLoop('edge3', 'node2')

      expect(manager.getLoopCount('node1')).toBe(2)
      expect(manager.getLoopCount('node2')).toBe(1)
      expect(manager.getLoopCount('node3')).toBe(0)
    })

    it('应该获取自连线索引', () => {
      manager.registerLoop('edge1', 'node1')
      manager.registerLoop('edge2', 'node1')

      expect(manager.getLoopIndex('edge1')).toBe(0)
      expect(manager.getLoopIndex('edge2')).toBe(1)
      expect(manager.getLoopIndex('edge3')).toBe(0)
    })

    it('应该注销自连线', () => {
      manager.registerLoop('edge1', 'node1')
      manager.registerLoop('edge2', 'node1')
      manager.unregisterLoop('edge1')

      expect(manager.getLoopCount('node1')).toBe(1)
      expect(manager.getLoopIndex('edge1')).toBe(0)
    })

    it('应该清空所有注册', () => {
      manager.registerLoop('edge1', 'node1')
      manager.registerLoop('edge2', 'node2')
      manager.clear()

      expect(manager.getLoopCount('node1')).toBe(0)
      expect(manager.getLoopCount('node2')).toBe(0)
    })
  })
})
