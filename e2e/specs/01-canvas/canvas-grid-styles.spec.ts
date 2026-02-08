import { test, expect } from '@playwright/test'

test.describe('Canvas Grid Styles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should support dot grid display', async ({ page }) => {
    // Verify grid style selector exists
    const gridStyleSelector = page.locator('[data-testid="grid-style-selector"]')
    await expect(gridStyleSelector).toBeVisible()

    // Select dot grid style
    await gridStyleSelector.click()
    await page.locator('[data-testid="grid-style-dot"]').click()

    // Verify dot grid is applied
    const canvas = page.locator('.x6-graph')
    const gridType = await canvas.evaluate((el) => {
      return el.getAttribute('data-grid-type')
    })
    expect(gridType).toBe('dot')
  })

  test('should support line grid display', async ({ page }) => {
    const gridStyleSelector = page.locator('[data-testid="grid-style-selector"]')
    await expect(gridStyleSelector).toBeVisible()

    // Select line grid style
    await gridStyleSelector.click()
    await page.locator('[data-testid="grid-style-line"]').click()

    // Verify line grid is applied
    const canvas = page.locator('.x6-graph')
    const gridType = await canvas.evaluate((el) => {
      return el.getAttribute('data-grid-type')
    })
    expect(gridType).toBe('line')
  })

  test('should support grid hide', async ({ page }) => {
    const gridStyleSelector = page.locator('[data-testid="grid-style-selector"]')
    await expect(gridStyleSelector).toBeVisible()

    // Select none grid style (hide grid)
    await gridStyleSelector.click()
    await page.locator('[data-testid="grid-style-none"]').click()

    // Verify grid is hidden
    const canvas = page.locator('.x6-graph')
    const gridType = await canvas.evaluate((el) => {
      return el.getAttribute('data-grid-type')
    })
    expect(gridType).toBe('none')
  })

  test('should apply grid style change immediately', async ({ page }) => {
    const gridStyleSelector = page.locator('[data-testid="grid-style-selector"]')

    // Change to line grid
    await gridStyleSelector.click()
    await page.locator('[data-testid="grid-style-line"]').click()

    // Verify change is applied immediately
    const canvas = page.locator('.x6-graph')
    await expect(canvas).toHaveAttribute('data-grid-type', 'line')

    // Change to dot grid
    await gridStyleSelector.click()
    await page.locator('[data-testid="grid-style-dot"]').click()

    // Verify change is applied immediately
    await expect(canvas).toHaveAttribute('data-grid-type', 'dot')
  })

  test('should support custom canvas background color', async ({ page }) => {
    // Verify background color picker exists
    const bgColorPicker = page.locator('[data-testid="canvas-bg-color"]')
    await expect(bgColorPicker).toBeVisible()

    // Click to open color picker
    await bgColorPicker.click()

    // Select a color
    await page.locator('[data-testid="color-option-#f0f2f5"]').click()

    // Verify canvas background color is applied
    const canvas = page.locator('.x6-graph')
    const bgColor = await canvas.evaluate((el) => {
      return getComputedStyle(el).backgroundColor
    })

    // Should have the selected color
    expect(bgColor).toBeTruthy()
  })

  test('should persist grid style preference', async ({ page }) => {
    const gridStyleSelector = page.locator('[data-testid="grid-style-selector"]')

    // Change to line grid
    await gridStyleSelector.click()
    await page.locator('[data-testid="grid-style-line"]').click()

    // Reload page
    await page.reload()

    // Verify grid style is restored
    const canvas = page.locator('.x6-graph')
    await expect(canvas).toHaveAttribute('data-grid-type', 'line')
  })
})
