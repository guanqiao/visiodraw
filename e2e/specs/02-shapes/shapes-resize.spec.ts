import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'

test.describe('Shapes Resize', () => {
  test('should resize rectangle using southeast handle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 30)
    
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize circle using southeast handle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawCircle(300, 300, 50)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize triangle using southeast handle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawTriangle(400, 400, 80)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 30)
    
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize using northwest handle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 80)
    await page.waitForTimeout(800)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
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
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 80)
    await page.waitForTimeout(800)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
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
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 80)
    await page.waitForTimeout(800)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    const initialPos = await shapesHelper.getShapePosition(0)
    
    await shapesHelper.resizeShapeFromCorner(0, 'sw', -40, 30)
    
    const newSize = await shapesHelper.getShapeSize(0)
    const newPos = await shapesHelper.getShapePosition(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
    expect(newPos.x).toBeLessThan(initialPos.x)
  })

  test('should resize using southeast handle on rectangle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 80)
    await page.waitForTimeout(800)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
    
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should shrink rectangle smaller', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', -30, -20)
    
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeLessThan(initialSize.width)
    expect(newSize.height).toBeLessThan(initialSize.height)
  })

  test('should shrink circle smaller', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawCircle(300, 300, 50)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', -20, -20)
    
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeLessThan(initialSize.width)
    expect(newSize.height).toBeLessThan(initialSize.height)
  })

  test('should maintain shape selection after resize', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    expect(await shapesHelper.countSelectedShapes()).toBe(1)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 20)
    
    expect(await shapesHelper.countSelectedShapes()).toBe(1)
  })

  test('should handle rapid consecutive resizes', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    for (let i = 0; i < 3; i++) {
      await shapesHelper.resizeShapeFromCorner(0, 'se', 20, 15)
      await page.waitForTimeout(200)
    }
    
    const finalSize = await shapesHelper.getShapeSize(0)
    expect(finalSize.width).toBeGreaterThan(100)
    expect(finalSize.height).toBeGreaterThan(60)
  })

  test('should handle resize to very small size', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', -70, -40)
    
    const newSize = await shapesHelper.getShapeSize(0)
    expect(newSize.width).toBeGreaterThan(0)
    expect(newSize.height).toBeGreaterThan(0)
  })

  test('should handle resize to very large size', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 200, 150)
    
    const newSize = await shapesHelper.getShapeSize(0)
    expect(newSize.width).toBeGreaterThan(250)
    expect(newSize.height).toBeGreaterThan(180)
  })

  test('should undo resize operation', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
    
    const resizedSize = await shapesHelper.getShapeSize(0)
    expect(resizedSize.width).toBeGreaterThan(initialSize.width)
    
    await canvasHelper.undo()
    await page.waitForTimeout(300)
    
    const afterUndoSize = await shapesHelper.getShapeSize(0)
    expect(Math.abs(afterUndoSize.width - initialSize.width)).toBeLessThan(15)
  })

  test('should redo resize operation after undo', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
    const resizedSize = await shapesHelper.getShapeSize(0)
    
    await canvasHelper.undo()
    await canvasHelper.redo()
    await page.waitForTimeout(300)
    
    const afterRedoSize = await shapesHelper.getShapeSize(0)
    expect(Math.abs(afterRedoSize.width - resizedSize.width)).toBeLessThan(15)
  })

  test('should maintain aspect ratio when using shift key during resize', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(800)
    
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
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
    await page.waitForTimeout(500)
    
    const newSize = await shapesHelper.getShapeSize(0)
    const newRatio = newSize.width / newSize.height
    
    expect(Math.abs(newRatio - initialRatio)).toBeLessThan(0.15)
  })
})
