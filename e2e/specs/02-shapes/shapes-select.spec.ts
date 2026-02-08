import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'

test.describe('Shapes Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should select a shape by clicking', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)
    
    // Select the shape
    await shapesHelper.selectShape(0)
    
    // Verify shape is selected
    const selectedCount = await shapesHelper.countSelectedShapes()
    expect(selectedCount).toBe(1)
  })

  test('should deselect shape by clicking on canvas', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw and select a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    
    // Verify shape is selected
    expect(await shapesHelper.countSelectedShapes()).toBe(1)
    
    // Click on empty canvas area
    await canvasHelper.clickAt(50, 50)
    await page.waitForTimeout(200)
    
    // Verify shape is deselected
    expect(await shapesHelper.countSelectedShapes()).toBe(0)
  })

  test('should multi-select shapes with Ctrl+click', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw multiple shapes
    await shapesHelper.drawRectangle(100, 100, 80, 50)
    await shapesHelper.drawRectangle(250, 150, 80, 50)
    await shapesHelper.drawRectangle(400, 200, 80, 50)
    await page.waitForTimeout(500)
    
    // Select first shape
    await shapesHelper.selectShape(0)
    expect(await shapesHelper.countSelectedShapes()).toBe(1)
    
    // Multi-select second shape
    await shapesHelper.multiSelectShape(1)
    expect(await shapesHelper.countSelectedShapes()).toBe(2)
    
    // Multi-select third shape
    await shapesHelper.multiSelectShape(2)
    expect(await shapesHelper.countSelectedShapes()).toBe(3)
  })

  test('should select all shapes with Ctrl+A', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw multiple shapes
    await shapesHelper.drawRectangle(100, 100, 80, 50)
    await shapesHelper.drawRectangle(250, 150, 80, 50)
    await shapesHelper.drawRectangle(400, 200, 80, 50)
    await page.waitForTimeout(500)
    
    // Select all
    await canvasHelper.selectAll()
    
    // Verify all shapes are selected
    const selectedCount = await shapesHelper.countSelectedShapes()
    expect(selectedCount).toBe(3)
  })

  test('should show selection box around selected shape', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw and select a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    
    // Verify selection box is visible
    const selectionBox = page.locator('.x6-widget-selection-box')
    await expect(selectionBox).toBeVisible()
  })
})
