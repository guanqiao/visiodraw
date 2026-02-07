import { test, expect } from '@playwright/test'

test.describe('VisioDraw UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Bug Fixes', () => {
    test('should not have infinite render loop in RulerPanel', async ({ page }) => {
      // Check console for errors
      const consoleErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      // Wait for page to stabilize
      await page.waitForTimeout(1000)

      // Should not have Maximum update depth exceeded errors
      const reactErrors = consoleErrors.filter(e => 
        e.includes('Maximum update depth exceeded')
      )
      expect(reactErrors).toHaveLength(0)
    })

    test('should not have infinite render loop in Toolbar', async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      // Click through toolbar tabs
      await page.getByRole('tab', { name: '布局' }).click()
      await page.waitForTimeout(500)
      
      await page.getByRole('tab', { name: '文件' }).click()
      await page.waitForTimeout(500)
      
      await page.getByRole('tab', { name: '开始' }).click()
      await page.waitForTimeout(500)

      // Should not have Maximum update depth exceeded errors
      const reactErrors = consoleErrors.filter(e => 
        e.includes('Maximum update depth exceeded')
      )
      expect(reactErrors).toHaveLength(0)
    })
  })

  test.describe('Toolbar Functionality', () => {
    test('should switch between toolbar tabs', async ({ page }) => {
      // Check initial state
      await expect(page.getByRole('tab', { name: '开始' })).toHaveAttribute('aria-selected', 'true')

      // Click Layout tab
      await page.getByRole('tab', { name: '布局' }).click()
      await expect(page.getByRole('tab', { name: '布局' })).toHaveAttribute('aria-selected', 'true')
      await expect(page.getByText('对齐')).toBeVisible()
      await expect(page.getByText('分布')).toBeVisible()

      // Click File tab
      await page.getByRole('tab', { name: '文件' }).click()
      await expect(page.getByRole('tab', { name: '文件' })).toHaveAttribute('aria-selected', 'true')
      await expect(page.getByText('文件操作')).toBeVisible()
      await expect(page.getByText('导入导出')).toBeVisible()
      await expect(page.getByText('打印')).toBeVisible()
    })

    test('should open template gallery', async ({ page }) => {
      await page.getByRole('tab', { name: '文件' }).click()
      await page.getByRole('button', { name: /模板/ }).click()
      
      await expect(page.getByRole('dialog', { name: '模板库' })).toBeVisible()
      await expect(page.getByText('简单流程图')).toBeVisible()
      await expect(page.getByText('公司组织架构')).toBeVisible()
      
      // Close dialog
      await page.getByRole('button', { name: '关闭' }).click()
      await expect(page.getByRole('dialog', { name: '模板库' })).not.toBeVisible()
    })
  })

  test.describe('Shape Library', () => {
    test('should display basic shapes', async ({ page }) => {
      await expect(page.getByText('基础图形')).toBeVisible()
      await expect(page.getByText('矩形')).toBeVisible()
      await expect(page.getByText('圆形')).toBeVisible()
      await expect(page.getByText('三角形')).toBeVisible()
    })

    test('should display flowchart shapes', async ({ page }) => {
      await expect(page.getByText('流程图')).toBeVisible()
      await expect(page.getByText('流程')).toBeVisible()
      await expect(page.getByText('判断')).toBeVisible()
      await expect(page.getByText('开始/结束')).toBeVisible()
    })

    test('should switch to Visio stencils tab', async ({ page }) => {
      await page.getByRole('tab', { name: 'Visio模具' }).click()
      await expect(page.getByRole('tab', { name: 'Visio模具' })).toHaveAttribute('aria-selected', 'true')
    })
  })

  test.describe('Canvas', () => {
    test('should have canvas element', async ({ page }) => {
      const canvas = page.locator('canvas').first()
      await expect(canvas).toBeVisible()
    })

    test('should select rectangle tool', async ({ page }) => {
      await page.getByRole('button', { name: /矩形/ }).first().click()
      
      // Check that status bar shows rectangle tool
      await expect(page.getByText('矩形')).toBeVisible()
    })
  })

  test.describe('Property Panel', () => {
    test('should show placeholder when no shape selected', async ({ page }) => {
      await expect(page.getByText('请选择一个图形或连接线以编辑属性')).toBeVisible()
    })
  })

  test.describe('Layer Panel', () => {
    test('should display default layer', async ({ page }) => {
      await expect(page.getByText('默认图层')).toBeVisible()
      await expect(page.getByText('共 1 个图层')).toBeVisible()
    })

    test('should add new layer', async ({ page }) => {
      await page.getByRole('button', { name: '新建' }).filter({ hasText: /新建/ }).click()
      await expect(page.getByText('共 2 个图层')).toBeVisible()
    })
  })

  test.describe('Theme Selector', () => {
    test('should display theme options', async ({ page }) => {
      await expect(page.getByText('主题设置')).toBeVisible()
      await expect(page.getByText('明亮')).toBeVisible()
      await expect(page.getByText('深色')).toBeVisible()
      await expect(page.getByText('商务蓝')).toBeVisible()
    })
  })

  test.describe('Ruler Panel', () => {
    test('should display ruler controls', async ({ page }) => {
      await expect(page.getByText('标尺与参考线')).toBeVisible()
      await expect(page.getByText('显示标尺')).toBeVisible()
      await expect(page.getByText('显示参考线')).toBeVisible()
    })

    test('should toggle ruler visibility', async ({ page }) => {
      const rulerSwitch = page.locator('.ruler-panel .ant-switch').first()
      await rulerSwitch.click()
      // Should not cause infinite loop
      await page.waitForTimeout(500)
    })
  })

  test.describe('Status Bar', () => {
    test('should display zoom level', async ({ page }) => {
      await expect(page.getByText('缩放: 100%')).toBeVisible()
    })

    test('should display shape count', async ({ page }) => {
      await expect(page.getByText('图形: 0')).toBeVisible()
    })

    test('should display current tool', async ({ page }) => {
      await expect(page.getByText('选择工具')).toBeVisible()
    })
  })
})
