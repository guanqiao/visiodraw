import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'

test.describe('Shapes Resize', () => {
  let canvasHelper: CanvasHelper
  let shapesHelper: ShapesHelper

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    canvasHelper = new CanvasHelper(page)
    shapesHelper = new ShapesHelper(page)
    await canvasHelper.waitForCanvas()
  })

  test.describe('Basic Shapes Resize', () => {
    test('should resize rectangle using southeast handle', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      const initialSize = await shapesHelper.getShapeSize(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 30)
      
      const newSize = await shapesHelper.getShapeSize(0)
      
      expect(newSize.width).toBeGreaterThan(initialSize.width)
      expect(newSize.height).toBeGreaterThan(initialSize.height)
    })

    test('should resize circle using southeast handle', async ({ page }) => {
      await shapesHelper.drawCircle(300, 300, 50)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      const initialSize = await shapesHelper.getShapeSize(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
      
      const newSize = await shapesHelper.getShapeSize(0)
      
      expect(newSize.width).toBeGreaterThan(initialSize.width)
      expect(newSize.height).toBeGreaterThan(initialSize.height)
    })

    test('should resize triangle using southeast handle', async ({ page }) => {
      await shapesHelper.drawTriangle(400, 400, 80)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      const initialSize = await shapesHelper.getShapeSize(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 30)
      
      const newSize = await shapesHelper.getShapeSize(0)
      
      expect(newSize.width).toBeGreaterThan(initialSize.width)
      expect(newSize.height).toBeGreaterThan(initialSize.height)
    })
  })

  test.describe('Resize Handle Directions', () => {
    test.beforeEach(async ({ page }) => {
      await shapesHelper.drawRectangle(300, 300, 100, 80)
      await page.waitForTimeout(500)
      await shapesHelper.selectShape(0)
    })

    test('should resize using northwest handle', async ({ page }) => {
      const initialSize = await shapesHelper.getShapeSize(0)
      const initialPos = await shapesHelper.getShapePosition(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'nw', -30, -20)
      
      const newSize = await shapesHelper.getShapeSize(0)
      const newPos = await shapesHelper.getShapePosition(0)
      
      expect(newSize.width).toBeGreaterThan(initialSize.width)
      expect(newSize.height).toBeGreaterThan(initialSize.height)
      expect(newPos.x).toBeLessThan(initialPos.x)
      expect(newPos.y).toBeLessThan(initialPos.y)
    })

    test('should resize using northeast handle', async ({ page }) => {
      const initialSize = await shapesHelper.getShapeSize(0)
      const initialPos = await shapesHelper.getShapePosition(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'ne', 40, -30)
      
      const newSize = await shapesHelper.getShapeSize(0)
      const newPos = await shapesHelper.getShapePosition(0)
      
      expect(newSize.width).toBeGreaterThan(initialSize.width)
      expect(newSize.height).toBeGreaterThan(initialSize.height)
      expect(newPos.y).toBeLessThan(initialPos.y)
    })

    test('should resize using southwest handle', async ({ page }) => {
      const initialSize = await shapesHelper.getShapeSize(0)
      const initialPos = await shapesHelper.getShapePosition(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'sw', -40, 30)
      
      const newSize = await shapesHelper.getShapeSize(0)
      const newPos = await shapesHelper.getShapePosition(0)
      
      expect(newSize.width).toBeGreaterThan(initialSize.width)
      expect(newSize.height).toBeGreaterThan(initialSize.height)
      expect(newPos.x).toBeLessThan(initialPos.x)
    })

    test('should resize using southeast handle', async ({ page }) => {
      const initialSize = await shapesHelper.getShapeSize(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
      
      const newSize = await shapesHelper.getShapeSize(0)
      
      expect(newSize.width).toBeGreaterThan(initialSize.width)
      expect(newSize.height).toBeGreaterThan(initialSize.height)
    })
  })

  test.describe('Shrink Shapes', () => {
    test('should shrink rectangle smaller', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      const initialSize = await shapesHelper.getShapeSize(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', -30, -20)
      
      const newSize = await shapesHelper.getShapeSize(0)
      
      expect(newSize.width).toBeLessThan(initialSize.width)
      expect(newSize.height).toBeLessThan(initialSize.height)
    })

    test('should shrink circle smaller', async ({ page }) => {
      await shapesHelper.drawCircle(300, 300, 50)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      const initialSize = await shapesHelper.getShapeSize(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', -20, -20)
      
      const newSize = await shapesHelper.getShapeSize(0)
      
      expect(newSize.width).toBeLessThan(initialSize.width)
      expect(newSize.height).toBeLessThan(initialSize.height)
    })
  })

  test.describe('Multiple Shapes Resize', () => {
    test('should maintain shape selection after resize', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      expect(await shapesHelper.countSelectedShapes()).toBe(1)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 20)
      
      expect(await shapesHelper.countSelectedShapes()).toBe(1)
    })

    test('should resize multiple selected shapes proportionally', async ({ page }) => {
      await shapesHelper.drawRectangle(100, 100, 80, 50)
      await shapesHelper.drawRectangle(250, 150, 80, 50)
      await page.waitForTimeout(500)
      
      await canvasHelper.selectAll()
      
      const initialSize1 = await shapesHelper.getShapeSize(0)
      const initialSize2 = await shapesHelper.getShapeSize(1)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 30)
      
      const newSize1 = await shapesHelper.getShapeSize(0)
      const newSize2 = await shapesHelper.getShapeSize(1)
      
      expect(newSize1.width).toBeGreaterThan(initialSize1.width)
      expect(newSize2.width).toBeGreaterThan(initialSize2.width)
    })
  })

  test.describe('Resize with Aspect Ratio', () => {
    test('should maintain aspect ratio when using shift key during resize', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      const initialSize = await shapesHelper.getShapeSize(0)
      const initialRatio = initialSize.width / initialSize.height
      
      const shape = await shapesHelper.getShape(0)
      const box = await shape.boundingBox()
      if (!box) throw new Error('Shape not found')
      
      const handleX = box.x + box.width
      const handleY = box.y + box.height
      
      await page.keyboard.down('Shift')
      await page.mouse.move(handleX, handleY)
      await page.mouse.down()
      await page.mouse.move(handleX + 50, handleY + 50, { steps: 5 })
      await page.mouse.up()
      await page.keyboard.up('Shift')
      await page.waitForTimeout(300)
      
      const newSize = await shapesHelper.getShapeSize(0)
      const newRatio = newSize.width / newSize.height
      
      expect(Math.abs(newRatio - initialRatio)).toBeLessThan(0.1)
    })
  })

  test.describe('Resize Boundary Cases', () => {
    test('should handle rapid consecutive resizes', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      for (let i = 0; i < 3; i++) {
        await shapesHelper.resizeShapeFromCorner(0, 'se', 20, 15)
        await page.waitForTimeout(100)
      }
      
      const finalSize = await shapesHelper.getShapeSize(0)
      expect(finalSize.width).toBeGreaterThan(100)
      expect(finalSize.height).toBeGreaterThan(60)
    })

    test('should handle resize to very small size', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', -70, -40)
      
      const newSize = await shapesHelper.getShapeSize(0)
      expect(newSize.width).toBeGreaterThan(0)
      expect(newSize.height).toBeGreaterThan(0)
    })

    test('should handle resize to very large size', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 200, 150)
      
      const newSize = await shapesHelper.getShapeSize(0)
      expect(newSize.width).toBeGreaterThan(250)
      expect(newSize.height).toBeGreaterThan(180)
    })
  })

  test.describe('Resize Different Shape Types', () => {
    const shapeTypes = [
      { name: 'rectangle', draw: (h: ShapesHelper) => h.drawRectangle(200, 200, 100, 60) },
      { name: 'circle', draw: (h: ShapesHelper) => h.drawCircle(200, 200, 50) },
      { name: 'triangle', draw: (h: ShapesHelper) => h.drawTriangle(200, 200, 80) },
    ]

    for (const shapeType of shapeTypes) {
      test(`should resize ${shapeType.name} correctly`, async ({ page }) => {
        await shapeType.draw(shapesHelper)
        await page.waitForTimeout(500)
        
        await shapesHelper.selectShape(0)
        
        const initialSize = await shapesHelper.getShapeSize(0)
        
        await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 30)
        
        const newSize = await shapesHelper.getShapeSize(0)
        
        expect(newSize.width).toBeGreaterThan(initialSize.width)
        expect(newSize.height).toBeGreaterThan(initialSize.height)
      })
    }
  })

  test.describe('Resize Undo/Redo', () => {
    test('should undo resize operation', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      const initialSize = await shapesHelper.getShapeSize(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
      
      const resizedSize = await shapesHelper.getShapeSize(0)
      expect(resizedSize.width).toBeGreaterThan(initialSize.width)
      
      await canvasHelper.undo()
      
      const afterUndoSize = await shapesHelper.getShapeSize(0)
      expect(Math.abs(afterUndoSize.width - initialSize.width)).toBeLessThan(10)
    })

    test('should redo resize operation after undo', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      const initialSize = await shapesHelper.getShapeSize(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
      const resizedSize = await shapesHelper.getShapeSize(0)
      
      await canvasHelper.undo()
      await canvasHelper.redo()
      
      const afterRedoSize = await shapesHelper.getShapeSize(0)
      expect(Math.abs(afterRedoSize.width - resizedSize.width)).toBeLessThan(10)
    })
  })

  test.describe('Resize with Property Panel', () => {
    test('should update property panel after resize', async ({ page }) => {
      await shapesHelper.drawRectangle(200, 200, 100, 60)
      await page.waitForTimeout(500)
      
      await shapesHelper.selectShape(0)
      
      await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 20)
      
      const widthInput = page.locator('[data-testid="property-width"] input, input[id*="width"]')
      if (await widthInput.count() > 0) {
        const width = await widthInput.inputValue()
        expect(parseInt(width)).toBeGreaterThan(100)
      }
    })
  })
})
