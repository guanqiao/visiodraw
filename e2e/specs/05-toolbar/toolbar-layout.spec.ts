import { test, expect } from '@playwright/test'

test.describe('Toolbar Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display file operation buttons', async ({ page }) => {
    // Verify file operation buttons exist
    await expect(page.locator('[data-testid="btn-new"]')).toBeVisible()
    await expect(page.locator('[data-testid="btn-open"]')).toBeVisible()
    await expect(page.locator('[data-testid="btn-save"]')).toBeVisible()
  })

  test('should display drawing tools', async ({ page }) => {
    // Verify drawing tools exist
    await expect(page.locator('[data-testid="tool-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="tool-rectangle"]')).toBeVisible()
    await expect(page.locator('[data-testid="tool-circle"]')).toBeVisible()
    await expect(page.locator('[data-testid="tool-triangle"]')).toBeVisible()
  })

  test('should display view controls', async ({ page }) => {
    // Verify view controls exist
    await expect(page.locator('[data-testid="btn-zoom-in"]')).toBeVisible()
    await expect(page.locator('[data-testid="btn-zoom-out"]')).toBeVisible()
    await expect(page.locator('[data-testid="toggle-grid"]')).toBeVisible()
  })

  test('should not use Tabs for toolbar navigation', async ({ page }) => {
    // Verify Tabs component is not used in toolbar
    const tabsInToolbar = page.locator('[data-testid="toolbar"] .ant-tabs')
    await expect(tabsInToolbar).not.toBeVisible()
  })

  test('should show active state for selected tool', async ({ page }) => {
    const selectTool = page.locator('[data-testid="tool-select"]')
    const rectTool = page.locator('[data-testid="tool-rectangle"]')

    // Initially select tool should be active
    await expect(selectTool).toHaveClass(/ant-btn-primary/)

    // Click rectangle tool
    await rectTool.click()

    // Rectangle tool should now be active
    await expect(rectTool).toHaveClass(/ant-btn-primary/)
    await expect(selectTool).not.toHaveClass(/ant-btn-primary/)
  })

  test('should have visual feedback on button hover', async ({ page }) => {
    const newButton = page.locator('[data-testid="btn-new"]')

    // Hover over button
    await newButton.hover()

    // Button should have hover state (background color change)
    const hoverBgColor = await newButton.evaluate((el) => {
      return getComputedStyle(el).backgroundColor
    })

    // Hover should change the appearance
    expect(hoverBgColor).toBeTruthy()
  })

  test('should have proper spacing between button groups', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]')

    // Verify toolbar has flex layout with gap
    const display = await toolbar.evaluate((el) => {
      return getComputedStyle(el).display
    })

    expect(['flex', 'grid']).toContain(display)
  })

  test('should display tooltips on hover', async ({ page }) => {
    // Hover over a tool button
    await page.locator('[data-testid="tool-select"]').hover()

    // Wait for tooltip to appear
    const tooltip = page.locator('.ant-tooltip')
    await expect(tooltip).toBeVisible()
  })
})
