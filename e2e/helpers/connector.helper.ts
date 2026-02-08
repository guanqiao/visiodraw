import { Page, Locator, expect } from '@playwright/test'

/**
 * Connector helper for e2e tests
 */
export class ConnectorHelper {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Select connector tool from toolbar
   */
  async selectConnectorTool() {
    const connectorTool = this.page.locator('[data-testid="tool-connector"], [data-tool="connector"]').first()
    await connectorTool.click()
    await this.page.waitForTimeout(200)
  }

  /**
   * Create a connector between two nodes
   */
  async createConnector(sourceNode: Locator, targetNode: Locator) {
    // Get source node bounding box
    const sourceBox = await sourceNode.boundingBox()
    const targetBox = await targetNode.boundingBox()
    
    if (!sourceBox || !targetBox) {
      throw new Error('Source or target node not found')
    }

    // Click on source node to start connection
    await sourceNode.click()
    await this.page.waitForTimeout(200)

    // Drag to target node
    await sourceNode.dragTo(targetNode)
    await this.page.waitForTimeout(300)
  }

  /**
   * Draw connector using connector tool
   */
  async drawConnector(sourceNode: Locator, targetNode: Locator) {
    await this.selectConnectorTool()
    await this.page.waitForTimeout(200)

    const sourceBox = await sourceNode.boundingBox()
    const targetBox = await targetNode.boundingBox()
    
    if (!sourceBox || !targetBox) {
      throw new Error('Source or target node not found')
    }

    // Click and drag from source to target
    await this.page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
    await this.page.mouse.down()
    await this.page.waitForTimeout(100)
    await this.page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 5 })
    await this.page.mouse.up()
    await this.page.waitForTimeout(300)
  }

  /**
   * Start connector drawing from a node (for ESC cancel test)
   */
  async startConnectorFrom(sourceNode: Locator) {
    const sourceBox = await sourceNode.boundingBox()
    if (!sourceBox) {
      throw new Error('Source node not found')
    }

    await this.page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
    await this.page.mouse.down()
    await this.page.waitForTimeout(100)
  }

  /**
   * Drag to create connector from shape edge
   */
  async dragCreateConnector(sourceNode: Locator, targetNode: Locator) {
    const sourceBox = await sourceNode.boundingBox()
    const targetBox = await targetNode.boundingBox()
    
    if (!sourceBox || !targetBox) {
      throw new Error('Source or target node not found')
    }

    // Start from right edge of source
    await this.page.mouse.move(sourceBox.x + sourceBox.width, sourceBox.y + sourceBox.height / 2)
    await this.page.mouse.down()
    await this.page.waitForTimeout(100)
    
    // Drag to left edge of target
    await this.page.mouse.move(targetBox.x, targetBox.y + targetBox.height / 2, { steps: 5 })
    await this.page.mouse.up()
    await this.page.waitForTimeout(300)
  }

  /**
   * Create connector with snap to connection point
   */
  async createConnectorWithSnap(sourceNode: Locator, targetNode: Locator) {
    const sourceBox = await sourceNode.boundingBox()
    const targetBox = await targetNode.boundingBox()
    
    if (!sourceBox || !targetBox) {
      throw new Error('Source or target node not found')
    }

    // Move near connection point and snap
    await this.page.mouse.move(sourceBox.x + sourceBox.width, sourceBox.y + sourceBox.height / 2)
    await this.page.mouse.down()
    await this.page.waitForTimeout(100)
    await this.page.mouse.move(targetBox.x, targetBox.y + targetBox.height / 2, { steps: 5 })
    await this.page.mouse.up()
    await this.page.waitForTimeout(300)
  }

  /**
   * Create connector from edge with specific position
   */
  async createConnectorFromEdge(
    sourceNode: Locator, 
    targetNode: Locator, 
    position: { x: number; y: number }
  ) {
    const sourceBox = await sourceNode.boundingBox()
    const targetBox = await targetNode.boundingBox()
    
    if (!sourceBox || !targetBox) {
      throw new Error('Source or target node not found')
    }

    // Calculate position on edge
    const startX = sourceBox.x + sourceBox.width * position.x
    const startY = sourceBox.y + sourceBox.height * position.y

    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.waitForTimeout(100)
    await this.page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 5 })
    await this.page.mouse.up()
    await this.page.waitForTimeout(300)
  }

  /**
   * Set connector style (straight, orthogonal, curved, bezier)
   */
  async setConnectorStyle(style: 'straight' | 'orthogonal' | 'curved' | 'bezier' | 'metro' | 'manhattan') {
    const styleButton = this.page.locator(`[data-style="${style}"], [data-testid="style-${style}"]`).first()
    if (await styleButton.count() > 0) {
      await styleButton.click()
    } else {
      // Try to find in dropdown or property panel
      const styleSelect = this.page.locator('select[name="connectorStyle"], [data-testid="connector-style-select"]').first()
      if (await styleSelect.count() > 0) {
        await styleSelect.selectOption(style)
      }
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set arrow style (none, arrow, dot, diamond)
   */
  async setArrowStyle(style: 'none' | 'arrow' | 'dot' | 'diamond') {
    const arrowButton = this.page.locator(`[data-arrow="${style}"], [data-testid="arrow-${style}"]`).first()
    if (await arrowButton.count() > 0) {
      await arrowButton.click()
    } else {
      const arrowSelect = this.page.locator('select[name="arrowStyle"], [data-testid="arrow-style-select"]').first()
      if (await arrowSelect.count() > 0) {
        await arrowSelect.selectOption(style)
      }
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Enable/disable bidirectional arrows
   */
  async setBidirectionalArrows(enabled: boolean) {
    const checkbox = this.page.locator('[data-testid="bidirectional-arrows"], input[name="bidirectional"]').first()
    if (await checkbox.count() > 0) {
      const isChecked = await checkbox.isChecked()
      if (isChecked !== enabled) {
        await checkbox.click()
      }
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set connector color
   */
  async setConnectorColor(color: string) {
    const colorInput = this.page.locator('input[type="color"][name="connectorColor"], [data-testid="connector-color"]').first()
    if (await colorInput.count() > 0) {
      await colorInput.fill(color)
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set connector stroke width
   */
  async setConnectorStrokeWidth(width: number) {
    const widthInput = this.page.locator('input[name="strokeWidth"], [data-testid="stroke-width"]').first()
    if (await widthInput.count() > 0) {
      await widthInput.fill(width.toString())
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set line style (solid, dashed)
   */
  async setLineStyle(style: 'solid' | 'dashed') {
    const styleButton = this.page.locator(`[data-line-style="${style}"], [data-testid="line-style-${style}"]`).first()
    if (await styleButton.count() > 0) {
      await styleButton.click()
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Add label to connector
   */
  async addLabel(text: string, position?: number) {
    const addLabelButton = this.page.locator('[data-testid="add-label"], button:has-text("Add Label")').first()
    if (await addLabelButton.count() > 0) {
      await addLabelButton.click()
    }

    const labelInput = this.page.locator('input[name="labelText"], [data-testid="label-input"]').first()
    if (await labelInput.count() > 0) {
      await labelInput.fill(text)
      await this.page.keyboard.press('Enter')
    }

    if (position !== undefined) {
      await this.setLabelPosition(position)
    }

    await this.page.waitForTimeout(200)
  }

  /**
   * Delete connector label
   */
  async deleteLabel() {
    const deleteButton = this.page.locator('[data-testid="delete-label"], button:has-text("Delete Label")').first()
    if (await deleteButton.count() > 0) {
      await deleteButton.click()
    } else {
      // Try to select label and press delete
      await this.page.keyboard.press('Delete')
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set label position along connector (0-1)
   */
  async setLabelPosition(position: number) {
    const positionInput = this.page.locator('input[name="labelPosition"], [data-testid="label-position"]').first()
    if (await positionInput.count() > 0) {
      await positionInput.fill(position.toString())
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set label font size
   */
  async setLabelFontSize(size: number) {
    const sizeInput = this.page.locator('input[name="labelFontSize"], [data-testid="label-font-size"]').first()
    if (await sizeInput.count() > 0) {
      await sizeInput.fill(size.toString())
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set label color
   */
  async setLabelColor(color: string) {
    const colorInput = this.page.locator('input[type="color"][name="labelColor"], [data-testid="label-color"]').first()
    if (await colorInput.count() > 0) {
      await colorInput.fill(color)
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set label background color
   */
  async setLabelBackgroundColor(color: string) {
    const colorInput = this.page.locator('input[type="color"][name="labelBackgroundColor"], [data-testid="label-bg-color"]').first()
    if (await colorInput.count() > 0) {
      await colorInput.fill(color)
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Enable/disable label auto-rotation
   */
  async setLabelAutoRotate(enabled: boolean) {
    const checkbox = this.page.locator('[data-testid="label-auto-rotate"], input[name="labelAutoRotate"]').first()
    if (await checkbox.count() > 0) {
      const isChecked = await checkbox.isChecked()
      if (isChecked !== enabled) {
        await checkbox.click()
      }
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set label offset
   */
  async setLabelOffset(x: number, y: number) {
    const offsetXInput = this.page.locator('input[name="labelOffsetX"], [data-testid="label-offset-x"]').first()
    const offsetYInput = this.page.locator('input[name="labelOffsetY"], [data-testid="label-offset-y"]').first()
    
    if (await offsetXInput.count() > 0) {
      await offsetXInput.fill(x.toString())
    }
    if (await offsetYInput.count() > 0) {
      await offsetYInput.fill(y.toString())
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set routing padding
   */
  async setRoutingPadding(padding: number) {
    const paddingInput = this.page.locator('input[name="routingPadding"], [data-testid="routing-padding"]').first()
    if (await paddingInput.count() > 0) {
      await paddingInput.fill(padding.toString())
    }
    await this.page.waitForTimeout(200)
  }

  /**
   * Set routing constraint
   */
  async setRoutingConstraint(constraint: 'horizontal' | 'vertical' | 'none') {
    const constraintSelect = this.page.locator('select[name="routingConstraint"], [data-testid="routing-constraint"]').first()
    if (await constraintSelect.count() > 0) {
      await constraintSelect.selectOption(constraint)
    }
    await this.page.waitForTimeout(200)
  }

  // ==================== Getters for assertions ====================

  /**
   * Get connector router type
   */
  async getConnectorRouter(edge: Locator): Promise<string> {
    return await edge.evaluate((el) => {
      // Try to get router from data attribute or X6 cell data
      const router = el.getAttribute('data-router') || 
                     (el as any).__x6_cell__?.router?.name ||
                     'normal'
      return router
    })
  }

  /**
   * Get connector path data (SVG path)
   */
  async getConnectorPath(edge: Locator): Promise<string> {
    return await edge.evaluate((el) => {
      const path = el.querySelector('path')
      return path?.getAttribute('d') || ''
    })
  }

  /**
   * Get connector path points
   */
  async getConnectorPathPoints(edge: Locator): Promise<Array<{ x: number; y: number }>> {
    return await edge.evaluate((el) => {
      const path = el.querySelector('path')
      const d = path?.getAttribute('d') || ''
      
      // Parse path data to extract points
      const points: Array<{ x: number; y: number }> = []
      const regex = /[ML]\s*([\d.]+)[,\s]+([\d.]+)/g
      let match
      while ((match = regex.exec(d)) !== null) {
        points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) })
      }
      return points
    })
  }

  /**
   * Get connector path length (approximate)
   */
  async getConnectorPathLength(edge: Locator): Promise<number> {
    const points = await this.getConnectorPathPoints(edge)
    let length = 0
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x
      const dy = points[i].y - points[i - 1].y
      length += Math.sqrt(dx * dx + dy * dy)
    }
    return length
  }

  /**
   * Get source port ID
   */
  async getSourcePort(edge: Locator): Promise<string> {
    return await edge.evaluate((el) => {
      return el.getAttribute('data-source-port') || 
             (el as any).__x6_cell__?.source?.port ||
             'default'
    })
  }

  /**
   * Check if connector has arrow marker
   */
  async hasArrowMarker(edge: Locator, type: 'source' | 'target'): Promise<boolean> {
    return await edge.evaluate((el, markerType) => {
      const marker = el.querySelector(`marker-${markerType}`)
      return marker !== null || 
             el.getAttribute(`data-${markerType}-marker`) !== null
    }, type)
  }

  /**
   * Get arrow marker type
   */
  async getArrowMarkerType(edge: Locator, type: 'source' | 'target'): Promise<string> {
    return await edge.evaluate((el, markerType) => {
      return el.getAttribute(`data-${markerType}-marker`) || 
             (el as any).__x6_cell__?.attrs?.line?.[`${markerType}Marker`]?.name ||
             'none'
    }, type)
  }

  /**
   * Get connector color
   */
  async getConnectorColor(edge: Locator): Promise<string> {
    return await edge.evaluate((el) => {
      const path = el.querySelector('path')
      return path?.getAttribute('stroke') || 
             window.getComputedStyle(path || el).stroke ||
             '#333333'
    })
  }

  /**
   * Get connector stroke width
   */
  async getConnectorStrokeWidth(edge: Locator): Promise<number> {
    return await edge.evaluate((el) => {
      const path = el.querySelector('path')
      const width = path?.getAttribute('stroke-width') ||
                   window.getComputedStyle(path || el).strokeWidth
      return parseFloat(width) || 2
    })
  }

  /**
   * Get connector dasharray
   */
  async getConnectorDasharray(edge: Locator): Promise<string> {
    return await edge.evaluate((el) => {
      const path = el.querySelector('path')
      return path?.getAttribute('stroke-dasharray') ||
             window.getComputedStyle(path || el).strokeDasharray ||
             'none'
    })
  }

  /**
   * Get label position
   */
  async getLabelPosition(edge: Locator): Promise<number> {
    return await edge.evaluate((el) => {
      const label = el.querySelector('.x6-edge-label')
      return parseFloat(label?.getAttribute('data-position') || '0.5')
    })
  }

  /**
   * Get label offset
   */
  async getLabelOffset(edge: Locator): Promise<{ x: number; y: number }> {
    return await edge.evaluate((el) => {
      const label = el.querySelector('.x6-edge-label')
      return {
        x: parseFloat(label?.getAttribute('data-offset-x') || '0'),
        y: parseFloat(label?.getAttribute('data-offset-y') || '0')
      }
    })
  }
}
