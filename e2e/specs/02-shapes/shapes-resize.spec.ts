import { test, expect } from '@playwright/test'
import { CanvasHelper } from '../../helpers/canvas.helper'
import { ShapesHelper } from '../../helpers/shapes.helper'

test.describe('Shapes Resize - Basic Shapes', () => {
  test('should resize circle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawCircle(300, 300, 50)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize triangle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawTriangle(300, 300, 80)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize rectangle', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 80)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })
})

test.describe('Shapes Resize - From Shape Library', () => {
  test('should resize diamond from library', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('基础图形')
    await page.waitForTimeout(300)
    await shapesHelper.dragShapeFromLibrary('菱形', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize hexagon from library', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('基础图形')
    await page.waitForTimeout(300)
    await shapesHelper.dragShapeFromLibrary('六边形', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize flowchart process', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('流程图')
    await page.waitForTimeout(300)
    await shapesHelper.dragShapeFromLibrary('流程', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize flowchart decision', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('流程图')
    await page.waitForTimeout(300)
    await shapesHelper.dragShapeFromLibrary('判断', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize UML class', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('UML 2.5')
    await page.waitForTimeout(300)
    await shapesHelper.dragShapeFromLibrary('类', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize ER entity', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('ER图')
    await page.waitForTimeout(300)
    await shapesHelper.dragShapeFromLibrary('实体', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 20)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize BPMN task', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('BPMN 2.0')
    await page.waitForTimeout(300)
    await shapesHelper.dragShapeFromLibrary('任务', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 20)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize cloud EC2 instance', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('云服务')
    await page.waitForTimeout(300)
    await shapesHelper.dragShapeFromLibrary('EC2 实例', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })
})

test.describe('Shapes Resize - Operations', () => {
  test('should enlarge shape significantly', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 60)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 150, 100)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width - initialSize.width).toBeGreaterThan(100)
    expect(newSize.height - initialSize.height).toBeGreaterThan(80)
  })

  test('should undo resize operation', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 60)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
    
    const resizedSize = await shapesHelper.getShapeSize(0)
    expect(resizedSize.width).toBeGreaterThan(initialSize.width)
    
    await canvasHelper.undo()
    await page.waitForTimeout(300)
    
    const afterUndoSize = await shapesHelper.getShapeSize(0)
    expect(Math.abs(afterUndoSize.width - initialSize.width)).toBeLessThan(15)
  })

  test('should redo resize operation after undo', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 60)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 50, 40)
    const resizedSize = await shapesHelper.getShapeSize(0)
    
    await canvasHelper.undo()
    await canvasHelper.redo()
    await page.waitForTimeout(300)
    
    const afterRedoSize = await shapesHelper.getShapeSize(0)
    expect(Math.abs(afterRedoSize.width - resizedSize.width)).toBeLessThan(15)
  })
})
