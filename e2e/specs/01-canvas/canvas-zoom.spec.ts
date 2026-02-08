import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'

test.describe('Canvas Zoom', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should zoom in with keyboard shortcut', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    await canvasHelper.waitForCanvas()
    
    // Initial zoom should be 100%
    let zoomLevel = await canvasHelper.getZoomLevel()
    expect(zoomLevel).toBe(100)
    
    // Zoom in
    await canvasHelper.zoomIn()
    
    // Verify zoom increased
    zoomLevel = await canvasHelper.getZoomLevel()
    expect(zoomLevel).toBeGreaterThan(100)
  })

  test('should zoom out with keyboard shortcut', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    await canvasHelper.waitForCanvas()
    
    // Zoom in first
    await canvasHelper.zoomIn()
    await canvasHelper.zoomIn()
    
    let zoomLevel = await canvasHelper.getZoomLevel()
    expect(zoomLevel).toBeGreaterThan(100)
    
    // Zoom out
    await canvasHelper.zoomOut()
    
    // Verify zoom decreased
    const newZoomLevel = await canvasHelper.getZoomLevel()
    expect(newZoomLevel).toBeLessThan(zoomLevel)
  })

  test('should reset zoom to 100%', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    await canvasHelper.waitForCanvas()
    
    // Zoom in
    await canvasHelper.zoomIn()
    await canvasHelper.zoomIn()
    
    let zoomLevel = await canvasHelper.getZoomLevel()
    expect(zoomLevel).not.toBe(100)
    
    // Reset zoom
    await canvasHelper.resetZoom()
    
    // Verify zoom is back to 100%
    zoomLevel = await canvasHelper.getZoomLevel()
    expect(zoomLevel).toBe(100)
  })

  test('should zoom with mouse wheel and Ctrl key', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    await canvasHelper.waitForCanvas()
    
    const initialZoom = await canvasHelper.getZoomLevel()
    
    // Zoom in with mouse wheel
    await page.keyboard.down('Control')
    await page.mouse.wheel(0, -100)
    await page.keyboard.up('Control')
    await page.waitForTimeout(300)
    
    const zoomAfterIn = await canvasHelper.getZoomLevel()
    expect(zoomAfterIn).toBeGreaterThan(initialZoom)
    
    // Zoom out with mouse wheel
    await page.keyboard.down('Control')
    await page.mouse.wheel(0, 100)
    await page.keyboard.up('Control')
    await page.waitForTimeout(300)
    
    const zoomAfterOut = await canvasHelper.getZoomLevel()
    expect(zoomAfterOut).toBeLessThan(zoomAfterIn)
  })

  test('should have zoom limits', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    await canvasHelper.waitForCanvas()
    
    // Try to zoom in beyond max
    for (let i = 0; i < 50; i++) {
      await canvasHelper.zoomIn()
    }
    
    const maxZoom = await canvasHelper.getZoomLevel()
    expect(maxZoom).toBeLessThanOrEqual(300)
    
    // Reset and try to zoom out beyond min
    await canvasHelper.resetZoom()
    
    for (let i = 0; i < 50; i++) {
      await canvasHelper.zoomOut()
    }
    
    const minZoom = await canvasHelper.getZoomLevel()
    expect(minZoom).toBeGreaterThanOrEqual(10)
  })
})
