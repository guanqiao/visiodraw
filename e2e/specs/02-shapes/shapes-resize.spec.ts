import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'

test.describe('Shapes Resize - Basic Shapes', () => {
  test('should resize circle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawCircle(300, 300, 50)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize triangle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawTriangle(300, 300, 80)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize rectangle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 80)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })
})

test.describe('Shapes Resize - Diamond and Ellipse', () => {
  test('should resize diamond', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawDiamond(300, 300, 80)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize ellipse', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawEllipse(300, 300, 100, 60)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })
})

test.describe('Shapes Resize - Operations', () => {
  test('should enlarge shape significantly', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 60)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 150, 100)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width - initialSize.width).toBeGreaterThan(100)
    expect(newSize.height - initialSize.height).toBeGreaterThan(80)
  })

  test('should undo resize operation', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 60)
    await page.waitForTimeout(500)
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
    
    await shapesHelper.drawRectangle(300, 300, 100, 60)
    await page.waitForTimeout(500)
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
})

test.describe('Shapes Resize - Multiple Shapes', () => {
  test('should resize multiple shapes independently', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawCircle(200, 200, 50)
    await shapesHelper.drawRectangle(400, 300, 100, 60)
    await page.waitForTimeout(500)
    
    await shapesHelper.selectShape(0)
    const initialSize1 = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 30)
    const newSize1 = await shapesHelper.getShapeSize(0)
    
    expect(newSize1.width).toBeGreaterThan(initialSize1.width)
    
    await shapesHelper.selectShape(1)
    const initialSize2 = await shapesHelper.getShapeSize(1)
    await shapesHelper.resizeShapeFromCorner(1, 'se', 40, 30)
    const newSize2 = await shapesHelper.getShapeSize(1)
    
    expect(newSize2.width).toBeGreaterThan(initialSize2.width)
  })
})
