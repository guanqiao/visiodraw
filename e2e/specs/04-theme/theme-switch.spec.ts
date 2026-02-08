import { test, expect } from '@playwright/test'

test.describe('Theme Switch', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display theme toggle button in toolbar', async ({ page }) => {
    // Verify theme toggle button exists
    const themeButton = page.locator('[data-testid="theme-toggle"]')
    await expect(themeButton).toBeVisible()
  })

  test('should toggle between light and dark themes', async ({ page }) => {
    const themeButton = page.locator('[data-testid="theme-toggle"]')
    const appContainer = page.locator('#root')

    // Initially should be light theme
    await expect(appContainer).not.toHaveAttribute('data-theme', 'dark')

    // Click to toggle to dark theme
    await themeButton.click()

    // Should now be dark theme
    await expect(appContainer).toHaveAttribute('data-theme', 'dark')

    // Click again to toggle back to light theme
    await themeButton.click()

    // Should be light theme again
    await expect(appContainer).not.toHaveAttribute('data-theme', 'dark')
  })

  test('should persist theme preference in localStorage', async ({ page }) => {
    const themeButton = page.locator('[data-testid="theme-toggle"]')

    // Toggle to dark theme
    await themeButton.click()

    // Verify localStorage
    const theme = await page.evaluate(() => localStorage.getItem('visiodraw-theme'))
    expect(theme).toBe('dark')

    // Reload page
    await page.reload()

    // Verify theme is restored
    const appContainer = page.locator('#root')
    await expect(appContainer).toHaveAttribute('data-theme', 'dark')
  })

  test('should apply correct CSS variables for dark theme', async ({ page }) => {
    const themeButton = page.locator('[data-testid="theme-toggle"]')

    // Toggle to dark theme
    await themeButton.click()

    // Wait a bit for theme to apply
    await page.waitForTimeout(100)

    // Verify dark theme is applied by checking data-theme attribute on body
    const body = page.locator('body')
    await expect(body).toHaveAttribute('data-theme', 'dark')

    // Verify the computed background color is dark
    const bodyBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })

    // Dark theme should have rgb(44, 44, 44) or similar dark color
    expect(bodyBg).toContain('44')
  })

  test('should apply correct CSS variables for light theme', async ({ page }) => {
    // Verify light theme CSS variables
    const body = page.locator('body')
    await expect(body).not.toHaveAttribute('data-theme', 'dark')

    // Verify the computed background color is light
    const bodyBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor
    })

    // Light theme should have rgb(255, 255, 255) or similar light color
    expect(bodyBg).toContain('255')
  })

  test('should update component styles when theme changes', async ({ page }) => {
    const themeButton = page.locator('[data-testid="theme-toggle"]')
    const toolbar = page.locator('[data-testid="toolbar"]')

    // Get initial toolbar background color
    const lightBgColor = await toolbar.evaluate((el) => {
      return getComputedStyle(el).backgroundColor
    })

    // Toggle to dark theme
    await themeButton.click()

    // Get dark theme toolbar background color
    const darkBgColor = await toolbar.evaluate((el) => {
      return getComputedStyle(el).backgroundColor
    })

    // Colors should be different
    expect(lightBgColor).not.toBe(darkBgColor)
  })

  test('should have theme icon that changes based on current theme', async ({ page }) => {
    const themeButton = page.locator('[data-testid="theme-toggle"]')

    // Initially should show moon icon (to switch to dark)
    const moonIcon = themeButton.locator('.anticon-moon')
    await expect(moonIcon).toBeVisible()

    // Toggle to dark theme
    await themeButton.click()

    // Should now show sun icon (to switch to light)
    const sunIcon = themeButton.locator('.anticon-sun')
    await expect(sunIcon).toBeVisible()
  })
})
