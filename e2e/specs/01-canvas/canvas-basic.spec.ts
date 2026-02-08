import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'

test.describe('Canvas Basic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the application', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/VisioDraw/)
    
    // Verify canvas is present
    const canvas = page.locator('.x6-graph')
    await expect(canvas).toBeVisible()
  })

  test('should display canvas with correct initial state', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    
    // Wait for canvas to be ready
    await canvasHelper.waitForCanvas()
    
    // Verify canvas is empty initially
    const isEmpty = await canvasHelper.isEmpty()
    expect(isEmpty).toBe(true)
    
    // Verify zoom level is 100%
    const zoomLevel = await canvasHelper.getZoomLevel()
    expect(zoomLevel).toBe(100)
  })

  test('should display status bar with correct information', async ({ page }) => {
    // Verify status bar exists
    const statusBar = page.locator('[data-testid="status-bar"]')
    await expect(statusBar).toBeVisible()
    
    // Verify zoom level display
    const zoomDisplay = page.locator('[data-testid="zoom-level"]')
    await expect(zoomDisplay).toBeVisible()
    await expect(zoomDisplay).toContainText('100%')
    
    // Verify selection count display
    const selectionCount = page.locator('[data-testid="selection-count"]')
    await expect(selectionCount).toBeVisible()
    await expect(selectionCount).toContainText('0')
  })

  test('should display toolbar', async ({ page }) => {
    // Verify toolbar exists
    const toolbar = page.locator('[data-testid="toolbar"]')
    await expect(toolbar).toBeVisible()
    
    // Verify essential tools exist
    await expect(page.locator('[data-testid="tool-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="tool-rectangle"]')).toBeVisible()
    await expect(page.locator('[data-testid="tool-circle"]')).toBeVisible()
  })
})
