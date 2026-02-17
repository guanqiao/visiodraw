import { Page, Locator, expect } from '@playwright/test'
import { CanvasHelper } from './canvas.helper'

/**
 * Shapes helper for e2e tests
 */
export class ShapesHelper {
  readonly page: Page
  readonly canvas: CanvasHelper

  constructor(page: Page) {
    this.page = page
    this.canvas = new CanvasHelper(page)
  }

  /**
   * Select rectangle tool
   */
  async selectRectangleTool() {
    await this.page.locator('[data-testid="tool-rectangle"]').click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Select circle tool
   */
  async selectCircleTool() {
    await this.page.locator('[data-testid="tool-circle"]').click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Select triangle tool
   */
  async selectTriangleTool() {
    await this.page.locator('[data-testid="tool-triangle"]').click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Select select tool
   */
  async selectSelectTool() {
    await this.page.locator('[data-testid="tool-select"]').click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Draw rectangle at position
   */
  async drawRectangle(x: number, y: number, width: number, height: number) {
    await this.selectRectangleTool()
    
    const bounds = await this.canvas.getCanvasBounds()
    if (!bounds) throw new Error('Canvas not found')
    
    // Click to start drawing
    await this.canvas.clickAt(x, y)
    await this.page.waitForTimeout(200)
  }

  /**
   * Draw circle at position
   */
  async drawCircle(x: number, y: number, radius: number) {
    await this.selectCircleTool()
    
    await this.canvas.clickAt(x, y)
    await this.page.waitForTimeout(200)
  }

  /**
   * Draw triangle at position
   */
  async drawTriangle(x: number, y: number, size: number) {
    await this.selectTriangleTool()
    
    await this.canvas.clickAt(x, y)
    await this.page.waitForTimeout(200)
  }

  /**
   * Get shape by index
   */
  async getShape(index: number): Promise<Locator> {
    return this.page.locator('.x6-node').nth(index)
  }

  /**
   * Get selected shapes
   */
  async getSelectedShapes() {
    return this.page.locator('.x6-node-selected, .x6-node.x6-selected')
  }

  /**
   * Count selected shapes
   */
  async countSelectedShapes() {
    return await this.getSelectedShapes().count()
  }

  /**
   * Click on shape to select it
   */
  async selectShape(index: number) {
    const shape = await this.getShape(index)
    await shape.click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Multi-select shapes (Ctrl+click)
   */
  async multiSelectShape(index: number) {
    const shape = await this.getShape(index)
    await this.page.keyboard.down('Control')
    await shape.click()
    await this.page.keyboard.up('Control')
    await this.page.waitForTimeout(200)
  }

  /**
   * Drag shape to new position
   */
  async dragShape(shapeOrIndex: Locator | number, deltaX: number, deltaY: number) {
    let shape: Locator
    if (typeof shapeOrIndex === 'number') {
      shape = await this.getShape(shapeOrIndex)
    } else {
      shape = shapeOrIndex
    }
    
    const box = await shape.boundingBox()
    if (!box) throw new Error('Shape not found')
    
    await shape.dragTo(shape, {
      targetPosition: {
        x: box.width / 2 + deltaX,
        y: box.height / 2 + deltaY,
      },
    })
    await this.page.waitForTimeout(200)
  }

  /**
   * Resize shape using resize handle
   */
  async resizeShapeByHandle(index: number, handle: 'se' | 'sw' | 'ne' | 'nw', deltaX: number, deltaY: number) {
    const shape = await this.getShape(index)
    const resizeHandle = shape.locator(`.x6-resize-${handle}`)
    
    await resizeHandle.dragTo(resizeHandle, {
      targetPosition: { x: deltaX, y: deltaY },
    })
    await this.page.waitForTimeout(200)
  }

  /**
   * Resize shape to specific dimensions
   */
  async resizeShape(shapeOrIndex: Locator | number, newWidth: number, newHeight: number) {
    let shape: Locator
    if (typeof shapeOrIndex === 'number') {
      shape = await this.getShape(shapeOrIndex)
    } else {
      shape = shapeOrIndex
    }
    
    const box = await shape.boundingBox()
    if (!box) throw new Error('Shape not found')
    
    // Calculate resize handle position (southeast corner)
    const handleX = box.x + box.width
    const handleY = box.y + box.height
    
    // Calculate new handle position
    const newHandleX = box.x + newWidth
    const newHandleY = box.y + newHeight
    
    // Move to handle and drag to new position
    await this.page.mouse.move(handleX, handleY)
    await this.page.mouse.down()
    await this.page.mouse.move(newHandleX, newHandleY, { steps: 3 })
    await this.page.mouse.up()
    await this.page.waitForTimeout(300)
  }

  /**
   * Get shape position
   */
  async getShapePosition(index: number) {
    const shape = await this.getShape(index)
    const box = await shape.boundingBox()
    if (!box) throw new Error('Shape not found')
    
    return {
      x: box.x,
      y: box.y,
      centerX: box.x + box.width / 2,
      centerY: box.y + box.height / 2,
    }
  }

  /**
   * Get shape size
   */
  async getShapeSize(index: number) {
    const shape = await this.getShape(index)
    const box = await shape.boundingBox()
    if (!box) throw new Error('Shape not found')
    
    return {
      width: box.width,
      height: box.height,
    }
  }

  /**
   * Expect shape count
   */
  async expectShapeCount(count: number) {
    await expect(this.page.locator('.x6-node')).toHaveCount(count)
  }

  /**
   * Expect selected shape count
   */
  async expectSelectedCount(count: number) {
    const selectedCount = await this.countSelectedShapes()
    expect(selectedCount).toBe(count)
  }

  /**
   * Drag shape from library to canvas
   */
  async dragShapeToCanvas(shapeType: string, canvasX: number, canvasY: number) {
    const shapeItem = this.page.locator(`[data-testid="shape-item"]`).filter({
      has: this.page.locator(`[data-shape-type="${shapeType}"], [data-type="${shapeType}"]`)
    }).first()
    
    const canvasBounds = await this.canvas.getCanvasBounds()
    if (!canvasBounds) throw new Error('Canvas not found')
    
    const targetX = canvasBounds.x + canvasX
    const targetY = canvasBounds.y + canvasY
    
    await shapeItem.dragTo(this.page.locator('.x6-graph'), {
      targetPosition: { x: canvasX, y: canvasY }
    })
    await this.page.waitForTimeout(300)
  }

  /**
   * Expand shape category in library
   */
  async expandCategory(categoryId: string) {
    const categoryHeader = this.page.locator(`[data-testid="shape-category"]`).getByRole('button', { name: new RegExp(categoryId, 'i') })
    const isExpanded = await categoryHeader.getAttribute('aria-expanded')
    if (isExpanded !== 'true') {
      await categoryHeader.click()
      await this.page.waitForTimeout(200)
    }
  }

  /**
   * Resize shape using mouse from specific corner
   */
  async resizeShapeFromCorner(
    shapeIndex: number, 
    corner: 'se' | 'sw' | 'ne' | 'nw',
    deltaX: number, 
    deltaY: number
  ) {
    const shape = await this.getShape(shapeIndex)
    const box = await shape.boundingBox()
    if (!box) throw new Error('Shape not found')
    
    let handleX: number, handleY: number
    switch (corner) {
      case 'se':
        handleX = box.x + box.width
        handleY = box.y + box.height
        break
      case 'sw':
        handleX = box.x
        handleY = box.y + box.height
        break
      case 'ne':
        handleX = box.x + box.width
        handleY = box.y
        break
      case 'nw':
        handleX = box.x
        handleY = box.y
        break
    }
    
    const newX = handleX + deltaX
    const newY = handleY + deltaY
    
    await this.page.mouse.move(handleX, handleY)
    await this.page.waitForTimeout(100)
    await this.page.mouse.down()
    await this.page.waitForTimeout(100)
    await this.page.mouse.move(newX, newY, { steps: 5 })
    await this.page.waitForTimeout(100)
    await this.page.mouse.up()
    await this.page.waitForTimeout(300)
  }

  /**
   * Get resize handle position
   */
  async getResizeHandlePosition(shapeIndex: number, corner: 'se' | 'sw' | 'ne' | 'nw') {
    const shape = await this.getShape(shapeIndex)
    const box = await shape.boundingBox()
    if (!box) throw new Error('Shape not found')
    
    switch (corner) {
      case 'se':
        return { x: box.x + box.width, y: box.y + box.height }
      case 'sw':
        return { x: box.x, y: box.y + box.height }
      case 'ne':
        return { x: box.x + box.width, y: box.y }
      case 'nw':
        return { x: box.x, y: box.y }
    }
  }

  /**
   * Check if resize handles are visible
   */
  async areResizeHandlesVisible(shapeIndex: number): Promise<boolean> {
    const shape = await this.getShape(shapeIndex)
    const seHandle = shape.locator('.x6-resize-se, .x6-widget-transform .x6-resize-se')
    return await seHandle.isVisible()
  }

  /**
   * Get all shape types from library
   */
  async getAvailableShapeTypes(): Promise<string[]> {
    const shapeItems = await this.page.locator('[data-testid="shape-item"]').all()
    const types: string[] = []
    for (const item of shapeItems) {
      const type = await item.getAttribute('data-shape-type') || await item.getAttribute('data-type')
      if (type) types.push(type)
    }
    return types
  }

  /**
   * Draw shape by clicking on canvas (for basic shapes with toolbar)
   */
  async drawShapeAt(shapeType: string, x: number, y: number) {
    const toolButton = this.page.locator(`[data-testid="tool-${shapeType}"]`)
    if (await toolButton.count() > 0) {
      await toolButton.click()
      await this.page.waitForTimeout(200)
      await this.canvas.clickAt(x, y)
      await this.page.waitForTimeout(300)
    }
  }

  /**
   * Clear canvas by selecting all and deleting
   */
  async clearCanvas() {
    await this.canvas.selectAll()
    await this.canvas.deleteSelected()
    await this.page.waitForTimeout(200)
  }
}
