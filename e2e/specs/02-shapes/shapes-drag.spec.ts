import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'

test.describe('Shapes Drag', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should drag shape to new position', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)
    
    // Get initial position
    const initialPos = await shapesHelper.getShapePosition(0)
    
    // Drag shape
    await shapesHelper.dragShape(0, 100, 50)
    
    // Get new position
    const newPos = await shapesHelper.getShapePosition(0)
    
    // Verify position changed
    expect(newPos.centerX).toBeGreaterThan(initialPos.centerX)
    expect(newPos.centerY).toBeGreaterThan(initialPos.centerY)
  })

  test('should drag multiple selected shapes together', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw multiple shapes
    await shapesHelper.drawRectangle(100, 100, 80, 50)
    await shapesHelper.drawRectangle(250, 150, 80, 50)
    await page.waitForTimeout(500)
    
    // Get initial positions
    const initialPos1 = await shapesHelper.getShapePosition(0)
    const initialPos2 = await shapesHelper.getShapePosition(1)
    
    // Select all shapes
    await canvasHelper.selectAll()
    
    // Drag first shape (all selected should move)
    await shapesHelper.dragShape(0, 50, 50)
    
    // Get new positions
    const newPos1 = await shapesHelper.getShapePosition(0)
    const newPos2 = await shapesHelper.getShapePosition(1)
    
    // Verify both shapes moved
    expect(newPos1.centerX).toBeGreaterThan(initialPos1.centerX)
    expect(newPos2.centerX).toBeGreaterThan(initialPos2.centerX)
  })

  test('should maintain shape selection after drag', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)
    
    // Select the shape
    await shapesHelper.selectShape(0)
    expect(await shapesHelper.countSelectedShapes()).toBe(1)
    
    // Drag the shape
    await shapesHelper.dragShape(0, 50, 50)
    
    // Verify shape is still selected
    expect(await shapesHelper.countSelectedShapes()).toBe(1)
  })
})
