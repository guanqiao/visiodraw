import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'

test.describe('Canvas Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display grid by default', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    await canvasHelper.waitForCanvas()
    
    // Verify grid is visible
    const grid = page.locator('.x6-grid')
    await expect(grid).toBeVisible()
  })

  test('should toggle grid visibility', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    await canvasHelper.waitForCanvas()
    
    // Find grid toggle button
    const gridToggle = page.locator('[data-testid="toggle-grid"]')
    await expect(gridToggle).toBeVisible()
    
    // Grid should be visible initially
    let grid = page.locator('.x6-grid')
    await expect(grid).toBeVisible()
    
    // Click to hide grid
    await gridToggle.click()
    await page.waitForTimeout(200)
    
    // Grid should be hidden
    await expect(grid).not.toBeVisible()
    
    // Click to show grid again
    await gridToggle.click()
    await page.waitForTimeout(200)
    
    // Grid should be visible again
    await expect(grid).toBeVisible()
  })

  test('should snap to grid when enabled', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    await canvasHelper.waitForCanvas()
    
    // Enable snap to grid
    const snapToggle = page.locator('[data-testid="toggle-snap"]')
    if (await snapToggle.isVisible()) {
      await snapToggle.click()
    }
    
    // Draw a rectangle
    await shapesHelper.drawRectangle(100, 100, 100, 60)
    await page.waitForTimeout(500)
    
    // Verify shape was created
    const shapeCount = await canvasHelper.countNodes()
    expect(shapeCount).toBe(1)
    
    // Get shape position
    const position = await shapesHelper.getShapePosition(0)
    
    // Position should be aligned to grid (multiples of 10)
    expect(position.x % 10).toBe(0)
    expect(position.y % 10).toBe(0)
  })
})
