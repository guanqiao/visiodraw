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
    await this.page.waitForTimeout(300)
    
    await this.canvas.clickAt(x, y)
    await this.page.waitForTimeout(500)
    
    await this.selectSelectTool()
  }

  /**
   * Draw circle at position
   */
  async drawCircle(x: number, y: number, radius: number) {
    await this.selectCircleTool()
    await this.page.waitForTimeout(300)
    
    await this.canvas.clickAt(x, y)
    await this.page.waitForTimeout(500)
    
    await this.selectSelectTool()
  }

  /**
   * Draw triangle at position
   */
  async drawTriangle(x: number, y: number, size: number) {
    await this.selectTriangleTool()
    await this.page.waitForTimeout(300)
    
    await this.canvas.clickAt(x, y)
    await this.page.waitForTimeout(500)
    
    await this.selectSelectTool()
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
   * Select diamond tool
   */
  async selectDiamondTool() {
    const toolButton = this.page.locator('[data-testid="tool-diamond"]')
    if (await toolButton.count() > 0) {
      await toolButton.click()
      await this.page.waitForTimeout(200)
    }
  }

  /**
   * Select ellipse tool
   */
  async selectEllipseTool() {
    const toolButton = this.page.locator('[data-testid="tool-ellipse"]')
    if (await toolButton.count() > 0) {
      await toolButton.click()
      await this.page.waitForTimeout(200)
    }
  }

  /**
   * Draw diamond at position
   */
  async drawDiamond(x: number, y: number, size: number) {
    await this.selectDiamondTool()
    await this.page.waitForTimeout(300)
    
    await this.canvas.clickAt(x, y)
    await this.page.waitForTimeout(500)
    
    await this.selectSelectTool()
  }

  /**
   * Draw ellipse at position
   */
  async drawEllipse(x: number, y: number, width: number, height: number) {
    await this.selectEllipseTool()
    await this.page.waitForTimeout(300)
    
    await this.canvas.clickAt(x, y)
    await this.page.waitForTimeout(500)
    
    await this.selectSelectTool()
  }

  /**
   * Drag shape from library to canvas
   */
  async dragShapeFromLibrary(shapeType: string, canvasX: number, canvasY: number) {
    const shapeItem = this.page.locator(`[data-testid="shape-item"]`).filter({
      has: this.page.locator(`text=${shapeType}`)
    }).first()
    
    if (await shapeItem.count() === 0) {
      throw new Error(`Shape "${shapeType}" not found in library`)
    }
    
    const canvasBounds = await this.canvas.getCanvasBounds()
    if (!canvasBounds) throw new Error('Canvas not found')
    
    const box = await shapeItem.boundingBox()
    if (!box) throw new Error('Shape item not found')
    
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2
    const endX = canvasBounds.x + canvasX
    const endY = canvasBounds.y + canvasY
    
    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.waitForTimeout(100)
    await this.page.mouse.move(endX, endY, { steps: 10 })
    await this.page.waitForTimeout(100)
    await this.page.mouse.up()
    await this.page.waitForTimeout(500)
  }

  /**
   * Expand shape category in library
   */
  async expandCategory(categoryName: string) {
    const allCategories = this.page.locator(`[data-testid="shape-category"]`).getByRole('button')
    const categoryHeader = allCategories.filter({ hasText: categoryName }).first()
    const isExpanded = await categoryHeader.getAttribute('aria-expanded')
    if (isExpanded !== 'true') {
      await categoryHeader.click()
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
}
