import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'
import { ConnectorHelper } from '../../helpers/connector.helper'

test.describe('Connector Drawing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should create a connector between two shapes', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    // Verify shapes were created
    expect(await canvasHelper.countNodes()).toBe(2)

    // Create connector between shapes
    const nodes = await canvasHelper.getNodes()
    const firstNode = nodes.nth(0)
    const secondNode = nodes.nth(1)

    await connectorHelper.createConnector(firstNode, secondNode)
    await page.waitForTimeout(500)

    // Verify connector was created
    expect(await canvasHelper.countEdges()).toBe(1)
  })

  test('should create connector using connector tool', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes
    await shapesHelper.drawRectangle(200, 300, 100, 60)
    await shapesHelper.drawRectangle(400, 300, 100, 60)
    await page.waitForTimeout(500)

    // Select connector tool
    await connectorHelper.selectConnectorTool()

    // Draw connector between shapes
    const nodes = await canvasHelper.getNodes()
    await connectorHelper.drawConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Verify connector was created
    expect(await canvasHelper.countEdges()).toBe(1)
  })

  test('should cancel connector drawing with ESC key', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create a shape
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await page.waitForTimeout(500)

    // Start connector drawing
    await connectorHelper.selectConnectorTool()
    const nodes = await canvasHelper.getNodes()
    await connectorHelper.startConnectorFrom(nodes.nth(0))

    // Press ESC to cancel
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    // Verify no connector was created
    expect(await canvasHelper.countEdges()).toBe(0)
  })

  test('should delete selected connector', async ({ page }) => {
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

    // Verify connector exists
    expect(await canvasHelper.countEdges()).toBe(1)

    // Select and delete connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)
    await page.keyboard.press('Delete')
    await page.waitForTimeout(200)

    // Verify connector was deleted
    expect(await canvasHelper.countEdges()).toBe(0)
  })

  test('should highlight selected connector', async ({ page }) => {
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

    // Click on connector to select
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Verify connector is selected (has selected class or attribute)
    const isSelected = await edges.nth(0).evaluate((el) => {
      return el.classList.contains('x6-edge-selected') || 
             el.getAttribute('data-selected') === 'true'
    })
    expect(isSelected).toBeTruthy()
  })

  test('should create multiple connectors between shapes', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    const firstNode = nodes.nth(0)
    const secondNode = nodes.nth(1)

    // Create first connector
    await connectorHelper.createConnector(firstNode, secondNode)
    await page.waitForTimeout(300)

    // Create second connector (reverse direction)
    await connectorHelper.createConnector(secondNode, firstNode)
    await page.waitForTimeout(300)

    // Verify both connectors were created
    expect(await canvasHelper.countEdges()).toBe(2)
  })

  test('should auto-delete connectors when source shape is deleted', async ({ page }) => {
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

    // Verify connector exists
    expect(await canvasHelper.countEdges()).toBe(1)

    // Delete source shape
    await nodes.nth(0).click()
    await page.waitForTimeout(200)
    await page.keyboard.press('Delete')
    await page.waitForTimeout(200)

    // Verify connector was auto-deleted
    expect(await canvasHelper.countEdges()).toBe(0)
  })

  test('should support drag to create connector from shape edge', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes
    await shapesHelper.drawRectangle(200, 200, 100, 60)
    await shapesHelper.drawRectangle(400, 200, 100, 60)
    await page.waitForTimeout(500)

    // Drag from edge of first shape to second shape
    const nodes = await canvasHelper.getNodes()
    await connectorHelper.dragCreateConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Verify connector was created
    expect(await canvasHelper.countEdges()).toBe(1)
  })
})
