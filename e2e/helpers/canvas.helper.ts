import { Page, Locator, expect } from '@playwright/test'

/**
 * Canvas helper for e2e tests
 */
export class CanvasHelper {
  readonly page: Page
  readonly canvas: Locator

  constructor(page: Page) {
    this.page = page
    this.canvas = page.locator('.x6-graph')
  }

  /**
   * Wait for canvas to be ready
   */
  async waitForCanvas() {
    await expect(this.canvas).toBeVisible()
    // Wait for X6 graph to initialize
    await this.page.waitForTimeout(500)
  }

  /**
   * Get canvas bounding box
   */
  async getCanvasBounds() {
    return await this.canvas.boundingBox()
  }

  /**
   * Click on canvas at specific position
   */
  async clickAt(x: number, y: number) {
    const bounds = await this.getCanvasBounds()
    if (!bounds) throw new Error('Canvas not found')
    
    await this.canvas.click({
      position: {
        x: x - bounds.x,
        y: y - bounds.y,
      },
      force: true,
    })
  }

  /**
   * Double click on canvas at specific position
   */
  async doubleClickAt(x: number, y: number) {
    const bounds = await this.getCanvasBounds()
    if (!bounds) throw new Error('Canvas not found')
    
    await this.canvas.dblclick({
      position: {
        x: x - bounds.x,
        y: y - bounds.y,
      },
    })
  }

  /**
   * Drag from one position to another
   */
  async drag(fromX: number, fromY: number, toX: number, toY: number) {
    const bounds = await this.getCanvasBounds()
    if (!bounds) throw new Error('Canvas not found')
    
    await this.canvas.dragTo(this.canvas, {
      sourcePosition: {
        x: fromX - bounds.x,
        y: fromY - bounds.y,
      },
      targetPosition: {
        x: toX - bounds.x,
        y: toY - bounds.y,
      },
    })
  }

  /**
   * Get all nodes on canvas
   */
  getNodes(): Locator {
    return this.page.locator('.x6-node')
  }

  /**
   * Get all edges on canvas
   */
  getEdges(): Locator {
    return this.page.locator('.x6-edge')
  }

  /**
   * Count nodes on canvas
   */
  async countNodes() {
    return await this.getNodes().count()
  }

  /**
   * Count edges on canvas
   */
  async countEdges() {
    return await this.getEdges().count()
  }

  /**
   * Check if canvas is empty
   */
  async isEmpty() {
    const nodeCount = await this.countNodes()
    const edgeCount = await this.countEdges()
    return nodeCount === 0 && edgeCount === 0
  }

  /**
   * Get zoom level from status bar
   */
  async getZoomLevel() {
    const zoomText = await this.page.locator('[data-testid="zoom-level"]').textContent()
    if (!zoomText) return 100
    const match = zoomText.match(/(\d+)%/)
    return match ? parseInt(match[1]) : 100
  }

  /**
   * Zoom in
   */
  async zoomIn() {
    await this.page.keyboard.down('Control')
    await this.page.keyboard.press('Equal')
    await this.page.keyboard.up('Control')
    await this.page.waitForTimeout(200)
  }

  /**
   * Zoom out
   */
  async zoomOut() {
    await this.page.keyboard.down('Control')
    await this.page.keyboard.press('Minus')
    await this.page.keyboard.up('Control')
    await this.page.waitForTimeout(200)
  }

  /**
   * Reset zoom to 100%
   */
  async resetZoom() {
    await this.page.keyboard.down('Control')
    await this.page.keyboard.press('0')
    await this.page.keyboard.up('Control')
    await this.page.waitForTimeout(200)
  }

  /**
   * Pan canvas (space + drag)
   */
  async pan(deltaX: number, deltaY: number) {
    await this.page.keyboard.down('Space')
    await this.canvas.dragTo(this.canvas, {
      targetPosition: { x: deltaX, y: deltaY },
    })
    await this.page.keyboard.up('Space')
  }

  /**
   * Select all (Ctrl+A)
   */
  async selectAll() {
    await this.page.keyboard.down('Control')
    await this.page.keyboard.press('a')
    await this.page.keyboard.up('Control')
    await this.page.waitForTimeout(200)
  }

  /**
   * Delete selected (Delete key)
   */
  async deleteSelected() {
    await this.page.keyboard.press('Delete')
    await this.page.waitForTimeout(200)
  }

  /**
   * Copy selected (Ctrl+C)
   */
  async copy() {
    await this.page.keyboard.down('Control')
    await this.page.keyboard.press('c')
    await this.page.keyboard.up('Control')
    await this.page.waitForTimeout(200)
  }

  /**
   * Paste (Ctrl+V)
   */
  async paste() {
    await this.page.keyboard.down('Control')
    await this.page.keyboard.press('v')
    await this.page.keyboard.up('Control')
    await this.page.waitForTimeout(200)
  }

  /**
   * Undo (Ctrl+Z)
   */
  async undo() {
    await this.page.keyboard.down('Control')
    await this.page.keyboard.press('z')
    await this.page.keyboard.up('Control')
    await this.page.waitForTimeout(200)
  }

  /**
   * Redo (Ctrl+Y)
   */
  async redo() {
    await this.page.keyboard.down('Control')
    await this.page.keyboard.press('y')
    await this.page.keyboard.up('Control')
    await this.page.waitForTimeout(200)
  }
}
