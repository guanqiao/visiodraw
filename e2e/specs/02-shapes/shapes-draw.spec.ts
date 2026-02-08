import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'

test.describe('Shapes Drawing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should draw a rectangle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Verify canvas is empty
    expect(await canvasHelper.isEmpty()).toBe(true)
    
    // Draw rectangle
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)
    
    // Verify shape was created
    const shapeCount = await canvasHelper.countNodes()
    expect(shapeCount).toBe(1)
    
    // Verify it's a rectangle
    const shape = await shapesHelper.getShape(0)
    await expect(shape).toBeVisible()
  })

  test('should draw a circle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw circle
    await shapesHelper.drawCircle(300, 300, 50)
    await page.waitForTimeout(500)
    
    // Verify shape was created
    const shapeCount = await canvasHelper.countNodes()
    expect(shapeCount).toBe(1)
  })

  test('should draw a triangle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw triangle
    await shapesHelper.drawTriangle(400, 400, 80)
    await page.waitForTimeout(500)
    
    // Verify shape was created
    const shapeCount = await canvasHelper.countNodes()
    expect(shapeCount).toBe(1)
  })

  test('should draw multiple shapes', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await canvasHelper.waitForCanvas()
    
    // Draw multiple shapes
    await shapesHelper.drawRectangle(100, 100, 80, 50)
    await shapesHelper.drawCircle(250, 150, 40)
    await shapesHelper.drawTriangle(400, 200, 60)
    await shapesHelper.drawRectangle(150, 300, 100, 80)
    
    await page.waitForTimeout(500)
    
    // Verify all shapes were created
    const shapeCount = await canvasHelper.countNodes()
    expect(shapeCount).toBe(4)
  })

  test('should switch between drawing tools', async ({ page }) => {
    const shapesHelper = new ShapesHelper(page)

    // Select rectangle tool
    await shapesHelper.selectRectangleTool()
    const rectTool = page.locator('[data-testid="tool-rectangle"]')
    await expect(rectTool).toHaveAttribute('type', 'button')
    // Check if the button has primary type (Ant Design uses type attribute for styling)
    await expect(rectTool).toHaveClass(/ant-btn-primary/)

    // Select circle tool
    await shapesHelper.selectCircleTool()
    const circleTool = page.locator('[data-testid="tool-circle"]')
    await expect(circleTool).toHaveClass(/ant-btn-primary/)

    // Select select tool
    await shapesHelper.selectSelectTool()
    const selectTool = page.locator('[data-testid="tool-select"]')
    await expect(selectTool).toHaveClass(/ant-btn-primary/)
  })
})
