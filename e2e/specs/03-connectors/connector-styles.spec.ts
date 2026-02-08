import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'
import { ConnectorHelper } from '../../helpers/connector.helper'

test.describe('Connector Styles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should switch connector style to straight', async ({ page }) => {
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

    // Change style to straight
    await connectorHelper.setConnectorStyle('straight')
    await page.waitForTimeout(300)

    // Verify style was applied
    const router = await connectorHelper.getConnectorRouter(edges.nth(0))
    expect(router).toBe('normal')
  })

  test('should switch connector style to orthogonal', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes and a connector
    await shapesHelper.drawRectangle(200, 300, 100, 60)
    await shapesHelper.drawRectangle(400, 300, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Select connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Change style to orthogonal
    await connectorHelper.setConnectorStyle('orthogonal')
    await page.waitForTimeout(300)

    // Verify style was applied
    const router = await connectorHelper.getConnectorRouter(edges.nth(0))
    expect(router).toBe('manhattan')
  })

  test('should switch connector style to curved', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes and a connector
    await shapesHelper.drawRectangle(200, 400, 100, 60)
    await shapesHelper.drawRectangle(400, 400, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Select connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Change style to curved
    await connectorHelper.setConnectorStyle('curved')
    await page.waitForTimeout(300)

    // Verify style was applied
    const router = await connectorHelper.getConnectorRouter(edges.nth(0))
    expect(router).toBe('er')
  })

  test('should switch connector style to bezier', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes and a connector
    await shapesHelper.drawRectangle(200, 500, 100, 60)
    await shapesHelper.drawRectangle(400, 500, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Select connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Change style to bezier
    await connectorHelper.setConnectorStyle('bezier')
    await page.waitForTimeout(300)

    // Verify connector path contains curve command
    const pathData = await connectorHelper.getConnectorPath(edges.nth(0))
    expect(pathData).toContain('C') // Cubic bezier command
  })

  test('should change arrow style to none', async ({ page }) => {
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

    // Change arrow style to none
    await connectorHelper.setArrowStyle('none')
    await page.waitForTimeout(300)

    // Verify no arrow marker
    const hasArrow = await connectorHelper.hasArrowMarker(edges.nth(0), 'target')
    expect(hasArrow).toBe(false)
  })

  test('should change arrow style to arrow', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes and a connector
    await shapesHelper.drawRectangle(200, 300, 100, 60)
    await shapesHelper.drawRectangle(400, 300, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Select connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Change arrow style to arrow
    await connectorHelper.setArrowStyle('arrow')
    await page.waitForTimeout(300)

    // Verify arrow marker exists
    const hasArrow = await connectorHelper.hasArrowMarker(edges.nth(0), 'target')
    expect(hasArrow).toBe(true)
  })

  test('should change arrow style to dot', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes and a connector
    await shapesHelper.drawRectangle(200, 400, 100, 60)
    await shapesHelper.drawRectangle(400, 400, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Select connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Change arrow style to dot
    await connectorHelper.setArrowStyle('dot')
    await page.waitForTimeout(300)

    // Verify dot marker exists
    const markerType = await connectorHelper.getArrowMarkerType(edges.nth(0), 'target')
    expect(markerType).toContain('circle')
  })

  test('should change arrow style to diamond', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes and a connector
    await shapesHelper.drawRectangle(200, 500, 100, 60)
    await shapesHelper.drawRectangle(400, 500, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Select connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Change arrow style to diamond
    await connectorHelper.setArrowStyle('diamond')
    await page.waitForTimeout(300)

    // Verify diamond marker exists
    const markerType = await connectorHelper.getArrowMarkerType(edges.nth(0), 'target')
    expect(markerType).toContain('diamond')
  })

  test('should support bidirectional arrows', async ({ page }) => {
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

    // Enable bidirectional arrows
    await connectorHelper.setBidirectionalArrows(true)
    await page.waitForTimeout(300)

    // Verify both source and target markers exist
    const hasSourceArrow = await connectorHelper.hasArrowMarker(edges.nth(0), 'source')
    const hasTargetArrow = await connectorHelper.hasArrowMarker(edges.nth(0), 'target')
    expect(hasSourceArrow).toBe(true)
    expect(hasTargetArrow).toBe(true)
  })

  test('should change connector color', async ({ page }) => {
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

    // Change color to red
    await connectorHelper.setConnectorColor('#ff0000')
    await page.waitForTimeout(300)

    // Verify color was applied
    const strokeColor = await connectorHelper.getConnectorColor(edges.nth(0))
    expect(strokeColor).toBe('#ff0000')
  })

  test('should change connector stroke width', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes and a connector
    await shapesHelper.drawRectangle(200, 300, 100, 60)
    await shapesHelper.drawRectangle(400, 300, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Select connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Change stroke width
    await connectorHelper.setConnectorStrokeWidth(4)
    await page.waitForTimeout(300)

    // Verify stroke width was applied
    const strokeWidth = await connectorHelper.getConnectorStrokeWidth(edges.nth(0))
    expect(strokeWidth).toBe(4)
  })

  test('should apply dashed line style', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes and a connector
    await shapesHelper.drawRectangle(200, 400, 100, 60)
    await shapesHelper.drawRectangle(400, 400, 100, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Select connector
    const edges = await canvasHelper.getEdges()
    await edges.nth(0).click()
    await page.waitForTimeout(200)

    // Apply dashed style
    await connectorHelper.setLineStyle('dashed')
    await page.waitForTimeout(300)

    // Verify dashed style was applied
    const strokeDasharray = await connectorHelper.getConnectorDasharray(edges.nth(0))
    expect(strokeDasharray).not.toBe('none')
  })
})
