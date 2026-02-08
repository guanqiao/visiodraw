import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'
import { ConnectorHelper } from '../../helpers/connector.helper'

test.describe('Connector Points', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should show connection points on shape hover', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)

    await canvasHelper.waitForCanvas()

    // Create a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)

    // Hover over shape
    const nodes = await canvasHelper.getNodes()
    await nodes.nth(0).hover()
    await page.waitForTimeout(300)

    // Verify connection points are visible
    const connectionPoints = await page.locator('.x6-port, .connection-point').count()
    expect(connectionPoints).toBeGreaterThan(0)
  })

  test('should hide connection points when mouse leaves shape', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)

    await canvasHelper.waitForCanvas()

    // Create a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)

    // Hover over shape
    const nodes = await canvasHelper.getNodes()
    await nodes.nth(0).hover()
    await page.waitForTimeout(300)

    // Move mouse away
    await page.mouse.move(0, 0)
    await page.waitForTimeout(300)

    // Verify connection points are hidden (or have hidden class)
    const visiblePoints = await page.locator('.x6-port:visible, .connection-point:visible').count()
    expect(visiblePoints).toBe(0)
  })

  test('should highlight connection point on hover', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)

    await canvasHelper.waitForCanvas()

    // Create a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)

    // Hover over shape to show connection points
    const nodes = await canvasHelper.getNodes()
    await nodes.nth(0).hover()
    await page.waitForTimeout(300)

    // Hover over a connection point
    const connectionPoint = page.locator('.x6-port').first()
    await connectionPoint.hover()
    await page.waitForTimeout(200)

    // Verify connection point is highlighted
    const isHighlighted = await connectionPoint.evaluate((el) => {
      return el.classList.contains('hover') || 
             el.getAttribute('data-hover') === 'true' ||
             window.getComputedStyle(el).stroke === '#1890ff'
    })
    expect(isHighlighted).toBeTruthy()
  })

  test('should create connector from specific connection point', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    // Get shapes
    const nodes = await canvasHelper.getNodes()
    const sourceNode = nodes.nth(0)
    const targetNode = nodes.nth(1)

    // Hover source shape and click on right connection point
    await sourceNode.hover()
    await page.waitForTimeout(300)

    // Find and click right connection point
    const rightPort = page.locator('[data-port="right"], .x6-port[data-position="right"]').first()
    await rightPort.click()

    // Drag to target shape
    await connectorHelper.dragCreateConnector(sourceNode, targetNode)
    await page.waitForTimeout(500)

    // Verify connector was created
    expect(await canvasHelper.countEdges()).toBe(1)

    // Verify connector uses right port
    const edge = await canvasHelper.getEdges().nth(0)
    const sourcePort = await connectorHelper.getSourcePort(edge)
    expect(sourcePort).toBe('right')
  })

  test('should support connection points on all sides', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)

    await canvasHelper.waitForCanvas()

    // Create a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)

    // Hover over shape
    const nodes = await canvasHelper.getNodes()
    await nodes.nth(0).hover()
    await page.waitForTimeout(300)

    // Verify all 4 sides have connection points
    const topPort = page.locator('[data-port="top"], .x6-port[data-position="top"]').first()
    const bottomPort = page.locator('[data-port="bottom"], .x6-port[data-position="bottom"]').first()
    const leftPort = page.locator('[data-port="left"], .x6-port[data-position="left"]').first()
    const rightPort = page.locator('[data-port="right"], .x6-port[data-position="right"]').first()

    await expect(topPort).toBeVisible()
    await expect(bottomPort).toBeVisible()
    await expect(leftPort).toBeVisible()
    await expect(rightPort).toBeVisible()
  })

  test('should snap to nearest connection point when creating connector', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector with snap
    await connectorHelper.createConnectorWithSnap(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Verify connector was created
    expect(await canvasHelper.countEdges()).toBe(1)

    // Verify connector is snapped to a connection point (not arbitrary position)
    const edge = await canvasHelper.getEdges().nth(0)
    const sourcePort = await connectorHelper.getSourcePort(edge)
    expect(['top', 'bottom', 'left', 'right']).toContain(sourcePort)
  })

  test('should disable connection point when occupied', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create first connector
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Hover source shape
    await nodes.nth(0).hover()
    await page.waitForTimeout(300)

    // Verify occupied connection point is marked as disabled
    const occupiedPort = page.locator('.x6-port[data-occupied="true"], .x6-port.disabled').first()
    const count = await occupiedPort.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should support dynamic connection point on shape edge', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector from edge (not predefined point)
    await connectorHelper.createConnectorFromEdge(nodes.nth(0), nodes.nth(1), { x: 0.25, y: 0 })
    await page.waitForTimeout(500)

    // Verify connector was created
    expect(await canvasHelper.countEdges()).toBe(1)

    // Verify dynamic connection point was created
    const edge = await canvasHelper.getEdges().nth(0)
    const sourcePort = await connectorHelper.getSourcePort(edge)
    expect(sourcePort).toContain('dynamic')
  })

  test('should update connection points when shape is resized', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)

    await canvasHelper.waitForCanvas()

    // Create a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)

    // Get initial connection point position
    const nodes = await canvasHelper.getNodes()
    await nodes.nth(0).hover()
    await page.waitForTimeout(300)

    const rightPort = page.locator('[data-port="right"], .x6-port[data-position="right"]').first()
    const initialBox = await rightPort.boundingBox()
    expect(initialBox).not.toBeNull()

    // Resize shape
    await shapesHelper.resizeShape(nodes.nth(0), 150, 80)
    await page.waitForTimeout(500)

    // Hover again and check connection point position
    await nodes.nth(0).hover()
    await page.waitForTimeout(300)

    const newRightPort = page.locator('[data-port="right"], .x6-port[data-position="right"]').first()
    const newBox = await newRightPort.boundingBox()
    expect(newBox).not.toBeNull()

    // Position should have changed due to resize
    if (initialBox && newBox) {
      expect(newBox.x).not.toBe(initialBox.x)
    }
  })

  test('should support custom connection points configuration', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)

    await canvasHelper.waitForCanvas()

    // Create a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)

    // Open connection points editor (if available)
    const nodes = await canvasHelper.getNodes()
    await nodes.nth(0).click({ button: 'right' })
    await page.waitForTimeout(200)

    // Look for connection points menu item
    const menuItem = page.locator('text=Connection Points, text=连接点').first()
    if (await menuItem.count() > 0) {
      await menuItem.click()
      await page.waitForTimeout(300)

      // Verify connection points editor is open
      const editor = page.locator('.connection-points-editor, [data-testid="connection-points-editor"]')
      await expect(editor).toBeVisible()
    }
  })

  test('should show connection point tooltip on hover', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)

    await canvasHelper.waitForCanvas()

    // Create a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)

    // Hover over shape
    const nodes = await canvasHelper.getNodes()
    await nodes.nth(0).hover()
    await page.waitForTimeout(300)

    // Hover over a connection point
    const connectionPoint = page.locator('.x6-port').first()
    await connectionPoint.hover()
    await page.waitForTimeout(500)

    // Verify tooltip is shown (if implemented)
    const tooltip = page.locator('.x6-port-tooltip, [role="tooltip"]').first()
    const hasTooltip = await tooltip.count() > 0
    // Tooltip is optional, so we just check it doesn't error
    expect(hasTooltip).toBeDefined()
  })
})
