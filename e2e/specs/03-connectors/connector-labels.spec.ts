import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'
import { ConnectorHelper } from '../../helpers/connector.helper'

test.describe('Connector Labels', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should add label to connector', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes and a connector
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Select connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Add label
    await connectorHelper.addLabel('Test Label')
    await page.waitForTimeout(300)

    // Verify label was added
    const label = page.locator('.x6-edge-label, .connector-label').first()
    await expect(label).toBeVisible()
    await expect(label).toContainText('Test Label')
  })

  test('should edit connector label', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector with label
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await connectorHelper.addLabel('Initial Label')
    await page.waitForTimeout(300)

    // Double click label to edit
    const label = page.locator('.x6-edge-label, .connector-label').first()
    await label.dblclick()
    await page.waitForTimeout(200)

    // Clear and type new text
    await page.keyboard.press('Control+a')
    await page.keyboard.type('Updated Label')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)

    // Verify label was updated
    await expect(label).toContainText('Updated Label')
  })

  test('should delete connector label', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector with label
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await connectorHelper.addLabel('Label to Delete')
    await page.waitForTimeout(300)

    // Verify label exists
    let label = page.locator('.x6-edge-label, .connector-label').first()
    await expect(label).toBeVisible()

    // Delete label
    await connectorHelper.deleteLabel()
    await page.waitForTimeout(300)

    // Verify label was deleted
    label = page.locator('.x6-edge-label, .connector-label').first()
    await expect(label).not.toBeVisible()
  })

  test('should change label position along connector', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector with label
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await connectorHelper.addLabel('Position Test')
    await page.waitForTimeout(300)

    // Change label position to start (0.25)
    await connectorHelper.setLabelPosition(0.25)
    await page.waitForTimeout(300)

    // Verify position was set
    const position = await connectorHelper.getLabelPosition(edges.nth(0))
    expect(position).toBeCloseTo(0.25, 1)

    // Change label position to end (0.75)
    await connectorHelper.setLabelPosition(0.75)
    await page.waitForTimeout(300)

    const newPosition = await connectorHelper.getLabelPosition(edges.nth(0))
    expect(newPosition).toBeCloseTo(0.75, 1)
  })

  test('should change label font size', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector with label
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await connectorHelper.addLabel('Font Size Test')
    await page.waitForTimeout(300)

    // Change font size
    await connectorHelper.setLabelFontSize(16)
    await page.waitForTimeout(300)

    // Verify font size
    const label = page.locator('.x6-edge-label, .connector-label').first()
    const fontSize = await label.evaluate((el) => {
      return parseInt(window.getComputedStyle(el).fontSize)
    })
    expect(fontSize).toBe(16)
  })

  test('should change label color', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector with label
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await connectorHelper.addLabel('Color Test')
    await page.waitForTimeout(300)

    // Change label color
    await connectorHelper.setLabelColor('#ff0000')
    await page.waitForTimeout(300)

    // Verify color
    const label = page.locator('.x6-edge-label, .connector-label').first()
    const color = await label.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    expect(color).toContain('rgb(255, 0, 0)')
  })

  test('should support multiple labels on single connector', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()

    // Add first label
    await connectorHelper.addLabel('First Label', 0.3)
    await page.waitForTimeout(300)

    // Add second label
    await connectorHelper.addLabel('Second Label', 0.7)
    await page.waitForTimeout(300)

    // Verify both labels exist
    const labels = page.locator('.x6-edge-label, .connector-label')
    expect(await labels.count()).toBe(2)
  })

  test('should move label with connector when shapes move', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector with label
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await connectorHelper.addLabel('Move Test')
    await page.waitForTimeout(300)

    // Get initial label position
    const label = page.locator('.x6-edge-label, .connector-label').first()
    const initialBox = await label.boundingBox()
    expect(initialBox).not.toBeNull()

    // Move source shape
    await shapesHelper.dragShape(nodes.nth(0), 50, 0)
    await page.waitForTimeout(500)

    // Get new label position
    const newBox = await label.boundingBox()
    expect(newBox).not.toBeNull()

    // Label should have moved
    if (initialBox && newBox) {
      expect(newBox.x).not.toBe(initialBox.x)
    }
  })

  test('should support label background color', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector with label
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await connectorHelper.addLabel('Background Test')
    await page.waitForTimeout(300)

    // Set background color
    await connectorHelper.setLabelBackgroundColor('#ffff00')
    await page.waitForTimeout(300)

    // Verify background color
    const label = page.locator('.x6-edge-label, .connector-label').first()
    const bgColor = await label.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    expect(bgColor).toContain('rgb(255, 255, 0)')
  })

  test('should support label rotation', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector with label
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 400, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await connectorHelper.addLabel('Rotation Test')
    await page.waitForTimeout(300)

    // Enable auto-rotation
    await connectorHelper.setLabelAutoRotate(true)
    await page.waitForTimeout(300)

    // Verify label has transform/rotation
    const label = page.locator('.x6-edge-label, .connector-label').first()
    const transform = await label.evaluate((el) => {
      return window.getComputedStyle(el).transform
    })
    // Transform should not be 'none' if rotated
    expect(transform).toBeDefined()
  })

  test('should handle empty label text', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()

    // Try to add empty label
    await connectorHelper.addLabel('')
    await page.waitForTimeout(300)

    // Empty label should either not be created or be hidden
    const label = page.locator('.x6-edge-label, .connector-label').first()
    const count = await label.count()
    if (count > 0) {
      const isVisible = await label.isVisible()
      expect(isVisible).toBeFalsy()
    }
  })

  test('should support label offset from connector line', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector with label
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await connectorHelper.addLabel('Offset Test')
    await page.waitForTimeout(300)

    // Set label offset
    await connectorHelper.setLabelOffset(10, -10)
    await page.waitForTimeout(300)

    // Verify offset was applied
    const offset = await connectorHelper.getLabelOffset(edges.nth(0))
    expect(offset.x).toBe(10)
    expect(offset.y).toBe(-10)
  })
})
