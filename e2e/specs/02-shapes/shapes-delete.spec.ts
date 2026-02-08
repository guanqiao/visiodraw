import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'

test.describe('Shapes Delete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should delete selected shape with Delete key', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)
    
    // Verify shape exists
    expect(await canvasHelper.countNodes()).toBe(1)
    
    // Select the shape
    await shapesHelper.selectShape(0)
    
    // Delete with Delete key
    await canvasHelper.deleteSelected()
    
    // Verify shape is deleted
    expect(await canvasHelper.countNodes()).toBe(0)
  })

  test('should delete selected shape with Backspace key', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)
    
    // Select the shape
    await shapesHelper.selectShape(0)
    
    // Delete with Backspace key
    await page.keyboard.press('Backspace')
    await page.waitForTimeout(200)
    
    // Verify shape is deleted
    expect(await canvasHelper.countNodes()).toBe(0)
  })

  test('should delete multiple selected shapes', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw multiple shapes
    await shapesHelper.drawRectangle(100, 100, 80, 50)
    await shapesHelper.drawRectangle(250, 150, 80, 50)
    await shapesHelper.drawRectangle(400, 200, 80, 50)
    await page.waitForTimeout(500)
    
    // Select all shapes
    await canvasHelper.selectAll()
    expect(await shapesHelper.countSelectedShapes()).toBe(3)
    
    // Delete all selected
    await canvasHelper.deleteSelected()
    
    // Verify all shapes are deleted
    expect(await canvasHelper.countNodes()).toBe(0)
  })

  test('should not delete unselected shapes', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw two shapes
    await shapesHelper.drawRectangle(100, 100, 80, 50)
    await shapesHelper.drawRectangle(250, 150, 80, 50)
    await page.waitForTimeout(500)
    
    // Select only first shape
    await shapesHelper.selectShape(0)
    
    // Delete
    await canvasHelper.deleteSelected()
    
    // Verify only first shape is deleted
    expect(await canvasHelper.countNodes()).toBe(1)
  })
})
