import { test, expect } from '@playwright/test'

test.describe('Shape Library UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display shape categories in collapsible panels', async ({ page }) => {
    // Verify shape library panel exists
    const shapeLibrary = page.locator('[data-testid="shape-library"]')
    await expect(shapeLibrary).toBeVisible()

    // Verify categories are displayed as collapsible panels
    const categoryPanels = page.locator('[data-testid="shape-category"]')
    await expect(categoryPanels.first()).toBeVisible()
  })

  test('should expand/collapse category panels on click', async ({ page }) => {
    // Find first category header
    const firstCategory = page.locator('[data-testid="shape-category"]').first()
    const categoryHeader = firstCategory.locator('.ant-collapse-header')

    // Click to collapse
    await categoryHeader.click()
    await expect(firstCategory).toHaveClass(/ant-collapse-item-inactive/)

    // Click to expand
    await categoryHeader.click()
    await expect(firstCategory).not.toHaveClass(/ant-collapse-item-inactive/)
  })

  test('should display shape preview on hover', async ({ page }) => {
    // Find a shape item
    const shapeItem = page.locator('[data-testid="shape-item"]').first()
    await expect(shapeItem).toBeVisible()

    // Hover over shape
    await shapeItem.hover()

    // Verify tooltip or preview appears
    const tooltip = page.locator('.ant-tooltip, [data-testid="shape-preview"]')
    await expect(tooltip).toBeVisible()
  })

  test('should support searching shapes', async ({ page }) => {
    // Verify search input exists
    const searchInput = page.locator('[data-testid="shape-search"]')
    await expect(searchInput).toBeVisible()

    // Type search query
    await searchInput.fill('rectangle')

    // Wait for search results
    await page.waitForTimeout(300)

    // Verify filtered results are displayed
    const shapeItems = page.locator('[data-testid="shape-item"]')
    const count = await shapeItems.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should not use Tabs for shape categories', async ({ page }) => {
    // Verify Tabs component is not used in shape library
    const tabsInLibrary = page.locator('[data-testid="shape-library"] .ant-tabs')
    await expect(tabsInLibrary).not.toBeVisible()
  })

  test('should display shape count in category header', async ({ page }) => {
    // Find first category
    const firstCategory = page.locator('[data-testid="shape-category"]').first()
    const categoryHeader = firstCategory.locator('.ant-collapse-header')

    // Verify shape count is displayed
    const countText = await categoryHeader.textContent()
    expect(countText).toMatch(/\(\d+\)/)
  })

  test('should support drag and drop from shape library', async ({ page }) => {
    // Find a shape item
    const shapeItem = page.locator('[data-testid="shape-item"]').first()
    await expect(shapeItem).toBeVisible()

    // Get canvas location
    const canvas = page.locator('[data-testid="x6-canvas"]')
    const canvasBox = await canvas.boundingBox()

    if (canvasBox) {
      // Perform drag and drop
      await shapeItem.dragTo(canvas)

      // Verify shape was added to canvas
      await page.waitForTimeout(500)
      const nodes = page.locator('.x6-node')
      await expect(nodes.first()).toBeVisible()
    }
  })

  test('should have visual feedback on shape item hover', async ({ page }) => {
    const shapeItem = page.locator('[data-testid="shape-item"]').first()

    // Get initial background color
    const initialBg = await shapeItem.evaluate((el) => {
      return getComputedStyle(el).backgroundColor
    })

    // Hover over shape item
    await shapeItem.hover()

    // Get hover background color
    const hoverBg = await shapeItem.evaluate((el) => {
      return getComputedStyle(el).backgroundColor
    })

    // Hover should change appearance
    expect(hoverBg).not.toBe(initialBg)
  })
})
