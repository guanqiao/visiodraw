import { describe, it, expect } from 'vitest'
import {
  calculatePolygonPoints,
  calculateStarPoints,
  calculateCrossPoints,
  createCylinderPath,
  createDocumentPath,
  createCloudPath,
  createParallelogramPoints,
  createTrapezoidPoints,
  createArrowPath,
  createServerPath,
  createWifiPath,
  createGlobePath,
  createFirewallPath,
  createRouterPath,
  createSwitchPath,
  createDesktopPath,
  createLaptopPath,
  createUmlActorPath,
  createUmlClassPath,
  createUmlPackagePath,
  createUmlComponentPath,
  createUmlNodePath,
  createUmlNotePath,
  createBpmnEventPath,
  createBpmnGatewayPath,
  createBpmnActivityPath,
  createErTableEntityPath,
  createErTableWithColumnsPath,
} from '../shapeMath'

describe('shapeMath', () => {
  describe('calculatePolygonPoints', () => {
    it('should calculate triangle points', () => {
      const points = calculatePolygonPoints(3, 100, 100)
      const coords = points.split(' ')
      expect(coords).toHaveLength(3)
    })

    it('should calculate hexagon points', () => {
      const points = calculatePolygonPoints(6, 100, 100)
      const coords = points.split(' ')
      expect(coords).toHaveLength(6)
    })

    it('should calculate square points', () => {
      const points = calculatePolygonPoints(4, 100, 100)
      const coords = points.split(' ')
      expect(coords).toHaveLength(4)
    })

    it('should handle custom rotation', () => {
      const points1 = calculatePolygonPoints(4, 100, 100, 0)
      const points2 = calculatePolygonPoints(4, 100, 100, Math.PI / 4)
      expect(points1).not.toBe(points2)
    })
  })

  describe('calculateStarPoints', () => {
    it('should calculate 5-point star', () => {
      const points = calculateStarPoints(50, 25, 5, 100, 100)
      const coords = points.split(' ')
      expect(coords).toHaveLength(10)
    })

    it('should calculate 6-point star', () => {
      const points = calculateStarPoints(50, 25, 6, 100, 100)
      const coords = points.split(' ')
      expect(coords).toHaveLength(12)
    })

    it('should produce valid coordinate format', () => {
      const points = calculateStarPoints(50, 25, 5, 100, 100)
      const coords = points.split(' ')
      coords.forEach(coord => {
        const [x, y] = coord.split(',')
        expect(parseFloat(x)).not.toBeNaN()
        expect(parseFloat(y)).not.toBeNaN()
      })
    })
  })

  describe('calculateCrossPoints', () => {
    it('should calculate cross points', () => {
      const points = calculateCrossPoints(100, 100)
      const coords = points.split(' ')
      expect(coords).toHaveLength(12)
    })

    it('should handle custom arm width ratio', () => {
      const points1 = calculateCrossPoints(100, 100, 0.35)
      const points2 = calculateCrossPoints(100, 100, 0.5)
      expect(points1).not.toBe(points2)
    })
  })

  describe('createCylinderPath', () => {
    it('should create cylinder path', () => {
      const path = createCylinderPath(100, 150)
      expect(path).toContain('M')
      expect(path).toContain('Q')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })

    it('should handle custom ellipse ratio', () => {
      const path1 = createCylinderPath(100, 150, 0.2)
      const path2 = createCylinderPath(100, 150, 0.3)
      expect(path1).not.toBe(path2)
    })
  })

  describe('createDocumentPath', () => {
    it('should create document path', () => {
      const path = createDocumentPath(100, 120)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })

    it('should handle custom wave parameters', () => {
      const path = createDocumentPath(100, 120, 0.1, 2)
      expect(path).toBeDefined()
    })
  })

  describe('createCloudPath', () => {
    it('should create cloud path', () => {
      const path = createCloudPath(100, 80)
      expect(path).toContain('M')
      expect(path).toContain('Q')
      expect(path).toContain('Z')
    })
  })

  describe('createParallelogramPoints', () => {
    it('should create parallelogram points', () => {
      const points = createParallelogramPoints(100, 60)
      const coords = points.split(' ')
      expect(coords).toHaveLength(4)
    })

    it('should handle custom skew ratio', () => {
      const points1 = createParallelogramPoints(100, 60, 0.2)
      const points2 = createParallelogramPoints(100, 60, 0.4)
      expect(points1).not.toBe(points2)
    })
  })

  describe('createTrapezoidPoints', () => {
    it('should create trapezoid points', () => {
      const points = createTrapezoidPoints(100, 60)
      const coords = points.split(' ')
      expect(coords).toHaveLength(4)
    })

    it('should handle custom top ratio', () => {
      const points1 = createTrapezoidPoints(100, 60, 0.6)
      const points2 = createTrapezoidPoints(100, 60, 0.4)
      expect(points1).not.toBe(points2)
    })
  })

  describe('createArrowPath', () => {
    it('should create arrow path', () => {
      const points = createArrowPath(100, 60)
      const coords = points.split(' ')
      expect(coords).toHaveLength(5)
    })

    it('should handle custom arrow ratio', () => {
      const points1 = createArrowPath(100, 60, 0.3)
      const points2 = createArrowPath(100, 60, 0.5)
      expect(points1).not.toBe(points2)
    })
  })

  describe('createServerPath', () => {
    it('should create server path', () => {
      const path = createServerPath(100, 120)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createWifiPath', () => {
    it('should create wifi path', () => {
      const path = createWifiPath(100, 100)
      expect(path).toContain('M')
      expect(path).toContain('A')
    })
  })

  describe('createGlobePath', () => {
    it('should create globe path', () => {
      const path = createGlobePath(100, 100)
      expect(path).toContain('M')
      expect(path).toContain('A')
      expect(path).toContain('L')
      expect(path).toContain('Q')
    })
  })

  describe('createFirewallPath', () => {
    it('should create firewall path', () => {
      const path = createFirewallPath(100, 80)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createRouterPath', () => {
    it('should create router path', () => {
      const path = createRouterPath(100, 80)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
      expect(path).toContain('A')
    })
  })

  describe('createSwitchPath', () => {
    it('should create switch path', () => {
      const path = createSwitchPath(100, 60)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createDesktopPath', () => {
    it('should create desktop path', () => {
      const path = createDesktopPath(100, 100)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createLaptopPath', () => {
    it('should create laptop path', () => {
      const path = createLaptopPath(100, 80)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createUmlActorPath', () => {
    it('should create UML actor path', () => {
      const path = createUmlActorPath(60, 100)
      expect(path).toContain('M')
      expect(path).toContain('A')
      expect(path).toContain('L')
    })
  })

  describe('createUmlClassPath', () => {
    it('should create UML class path', () => {
      const path = createUmlClassPath(120, 100)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createUmlPackagePath', () => {
    it('should create UML package path', () => {
      const path = createUmlPackagePath(120, 80)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createUmlComponentPath', () => {
    it('should create UML component path', () => {
      const path = createUmlComponentPath(100, 80)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createUmlNodePath', () => {
    it('should create UML node path', () => {
      const path = createUmlNodePath(100, 80)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createUmlNotePath', () => {
    it('should create UML note path', () => {
      const path = createUmlNotePath(100, 60)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })
  })

  describe('createBpmnEventPath', () => {
    it('should create BPMN start event path', () => {
      const path = createBpmnEventPath(40, 40, 'start')
      expect(path).toContain('M')
      expect(path).toContain('A')
    })

    it('should create BPMN end event path', () => {
      const path = createBpmnEventPath(40, 40, 'end')
      expect(path).toContain('M')
      expect(path).toContain('A')
    })

    it('should create BPMN intermediate event path with inner circle', () => {
      const path = createBpmnEventPath(40, 40, 'intermediate')
      const circleCount = (path.match(/A/g) || []).length
      expect(circleCount).toBe(4)
    })
  })

  describe('createBpmnGatewayPath', () => {
    it('should create BPMN gateway path (diamond)', () => {
      const points = createBpmnGatewayPath(50, 50)
      const coords = points.split(' ')
      expect(coords).toHaveLength(4)
    })
  })

  describe('createBpmnActivityPath', () => {
    it('should create BPMN activity path with rounded corners', () => {
      const path = createBpmnActivityPath(100, 80)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Q')
      expect(path).toContain('Z')
    })
  })

  describe('createErTableEntityPath', () => {
    it('should create ER table entity path', () => {
      const path = createErTableEntityPath(150, 100)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })

    it('should handle custom header ratio', () => {
      const path1 = createErTableEntityPath(150, 100, 0.3, 0.35)
      const path2 = createErTableEntityPath(150, 100, 0.2, 0.3)
      expect(path1).not.toBe(path2)
    })
  })

  describe('createErTableWithColumnsPath', () => {
    it('should create ER table path with column lines', () => {
      const path = createErTableWithColumnsPath(150, 200, 5)
      expect(path).toContain('M')
      expect(path).toContain('L')
      expect(path).toContain('Z')
    })

    it('should handle zero columns', () => {
      const path = createErTableWithColumnsPath(150, 200, 0)
      expect(path).toBeDefined()
    })

    it('should create more lines for more columns', () => {
      const path1 = createErTableWithColumnsPath(150, 200, 3)
      const path2 = createErTableWithColumnsPath(150, 200, 6)
      const lineCount1 = (path1.match(/M/g) || []).length
      const lineCount2 = (path2.match(/M/g) || []).length
      expect(lineCount2).toBeGreaterThan(lineCount1)
    })
  })
})
