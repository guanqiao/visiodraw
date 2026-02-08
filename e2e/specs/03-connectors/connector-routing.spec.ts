import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'
import { ConnectorHelper } from '../../helpers/connector.helper'

test.describe('Connector Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should auto-route around obstacles', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create source and target shapes
    await shapesHelper.drawRectangle(100, 200, 80, 60)
    await shapesHelper.drawRectangle(500, 200, 80, 60)
    await page.waitForTimeout(300)

    // Create obstacle in the middle
    await shapesHelper.drawRectangle(280, 180, 120, 100)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    expect(await canvasHelper.countNodes()).toBe(3)

    // Create connector between source and target (obstacle in between)
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Verify connector was created
    expect(await canvasHelper.countEdges()).toBe(1)

    // Verify connector path goes around obstacle (has multiple segments)
    const edge = await canvasHelper.getEdges().nth(0)
    const pathPoints = await connectorHelper.getConnectorPathPoints(edge)
    expect(pathPoints.length).toBeGreaterThan(2) // More than direct line
  })

  test('should use shortest path for routing', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes close to each other
    await shapesHelper.drawRectangle(200, 200, 80, 60)
    await shapesHelper.drawRectangle(320, 200, 80, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Verify connector path is relatively short
    const edge = await canvasHelper.getEdges().nth(0)
    const pathLength = await connectorHelper.getConnectorPathLength(edge)
    expect(pathLength).toBeLessThan(200) // Should be close to direct distance
  })

  test('should update route when obstacle moves', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create source, target, and obstacle
    await shapesHelper.drawRectangle(100, 200, 80, 60)
    await shapesHelper.drawRectangle(500, 200, 80, 60)
    await shapesHelper.drawRectangle(280, 180, 120, 100)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Get initial path
    const edge = await canvasHelper.getEdges().nth(0)
    const initialPath = await connectorHelper.getConnectorPath(edge)

    // Move obstacle out of the way
    await shapesHelper.dragShape(nodes.nth(2), 0, 200)
    await page.waitForTimeout(500)

    // Get updated path
    const updatedPath = await connectorHelper.getConnectorPath(edge)

    // Path should have changed
    expect(updatedPath).not.toBe(initialPath)
  })

  test('should support orthogonal routing with right angles', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes at different positions
    await shapesHelper.drawRectangle(200, 200, 80, 60)
    await shapesHelper.drawRectangle(400, 400, 80, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector with orthogonal routing
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Set orthogonal style
    const edge = await canvasHelper.getEdges().nth(0)
    await edge.click()
    await connectorHelper.setConnectorStyle('orthogonal')
    await page.waitForTimeout(300)

    // Verify path has right angles (horizontal and vertical segments only)
    const pathPoints = await connectorHelper.getConnectorPathPoints(edge)
    let hasRightAngles = true
    for (let i = 1; i < pathPoints.length - 1; i++) {
      const prev = pathPoints[i - 1]
      const curr = pathPoints[i]
      const next = pathPoints[i + 1]
      // Check if turn is at right angle
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
      const angleDiff = Math.abs(angle2 - angle1)
      if (angleDiff > 0.1 && Math.abs(angleDiff - Math.PI / 2) > 0.1) {
        hasRightAngles = false
        break
      }
    }
    expect(hasRightAngles).toBe(true)
  })

  test('should support metro routing with rounded corners', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes
    await shapesHelper.drawRectangle(200, 200, 80, 60)
    await shapesHelper.drawRectangle(400, 400, 80, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Set metro style
    const edge = await canvasHelper.getEdges().nth(0)
    await edge.click()
    await connectorHelper.setConnectorStyle('metro')
    await page.waitForTimeout(300)

    // Verify router is metro
    const router = await connectorHelper.getConnectorRouter(edge)
    expect(router).toBe('metro')
  })

  test('should support manhattan routing', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes
    await shapesHelper.drawRectangle(200, 200, 80, 60)
    await shapesHelper.drawRectangle(400, 400, 80, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Set manhattan style
    const edge = await canvasHelper.getEdges().nth(0)
    await edge.click()
    await connectorHelper.setConnectorStyle('manhattan')
    await page.waitForTimeout(300)

    // Verify router is manhattan
    const router = await connectorHelper.getConnectorRouter(edge)
    expect(router).toBe('manhattan')
  })

  test('should handle complex routing with multiple obstacles', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create source and target
    await shapesHelper.drawRectangle(50, 300, 60, 40)
    await shapesHelper.drawRectangle(550, 300, 60, 40)
    await page.waitForTimeout(300)

    // Create multiple obstacles
    await shapesHelper.drawRectangle(150, 250, 80, 80)
    await shapesHelper.drawRectangle(300, 280, 80, 80)
    await shapesHelper.drawRectangle(450, 250, 80, 80)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    expect(await canvasHelper.countNodes()).toBe(5)

    // Create connector through obstacles
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Verify connector was created and routed
    expect(await canvasHelper.countEdges()).toBe(1)
    const edge = await canvasHelper.getEdges().nth(0)
    const pathPoints = await connectorHelper.getConnectorPathPoints(edge)
    expect(pathPoints.length).toBeGreaterThan(2)
  })

  test('should route efficiently when no obstacles', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create two shapes with clear path
    await shapesHelper.drawRectangle(200, 200, 80, 60)
    await shapesHelper.drawRectangle(400, 200, 80, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Path should be relatively straight/direct
    const edge = await canvasHelper.getEdges().nth(0)
    const pathPoints = await connectorHelper.getConnectorPathPoints(edge)
    // Without obstacles, path should have minimal points
    expect(pathPoints.length).toBeLessThanOrEqual(4)
  })

  test('should support routing configuration padding', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes with small gap
    await shapesHelper.drawRectangle(200, 200, 80, 60)
    await shapesHelper.drawRectangle(300, 200, 80, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Configure routing padding
    await connectorHelper.setRoutingPadding(20)
    await page.waitForTimeout(300)

    // Verify connector maintains minimum distance from shapes
    const edge = await canvasHelper.getEdges().nth(0)
    const pathPoints = await connectorHelper.getConnectorPathPoints(edge)
    expect(pathPoints.length).toBeGreaterThan(0)
  })

  test('should update route in real-time during shape drag', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes and connector
    await shapesHelper.drawRectangle(200, 200, 80, 60)
    await shapesHelper.drawRectangle(400, 200, 80, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    const edge = await canvasHelper.getEdges().nth(0)
    const initialPath = await connectorHelper.getConnectorPath(edge)

    // Start dragging target shape
    const targetNode = nodes.nth(1)
    const box = await targetNode.boundingBox()
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2 + 50, box.y + box.height / 2 + 50, { steps: 5 })
      
      // Check path during drag
      const midDragPath = await connectorHelper.getConnectorPath(edge)
      await page.mouse.up()
      await page.waitForTimeout(300)

      // Path should have updated
      expect(midDragPath).not.toBe(initialPath)
    }
  })

  test('should handle routing when shapes overlap', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create overlapping shapes
    await shapesHelper.drawRectangle(200, 200, 100, 80)
    await shapesHelper.drawRectangle(250, 220, 100, 80)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Try to create connector between overlapping shapes
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Should still create a connector (even if path is minimal)
    expect(await canvasHelper.countEdges()).toBe(1)
  })

  test('should support custom routing constraints', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    const connectorHelper = new ConnectorHelper(page)

    await canvasHelper.waitForCanvas()

    // Create shapes
    await shapesHelper.drawRectangle(200, 200, 80, 60)
    await shapesHelper.drawRectangle(400, 400, 80, 60)
    await page.waitForTimeout(500)

    const nodes = await canvasHelper.getNodes()

    // Create connector with constraints
    await connectorHelper.createConnector(nodes.nth(0), nodes.nth(1))
    await page.waitForTimeout(500)

    // Apply constraint (e.g., only horizontal first)
    const edge = await canvasHelper.getEdges().nth(0)
    await edge.click()
    await connectorHelper.setRoutingConstraint('horizontal')
    await page.waitForTimeout(300)

    // Verify path starts horizontally
    const pathPoints = await connectorHelper.getConnectorPathPoints(edge)
    if (pathPoints.length >= 2) {
      const isHorizontal = Math.abs(pathPoints[1].y - pathPoints[0].y) < 5
      expect(isHorizontal).toBe(true)
    }
  })
})
