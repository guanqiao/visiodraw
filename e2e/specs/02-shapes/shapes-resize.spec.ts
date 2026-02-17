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

test.describe('Shapes Resize - Basic Shapes from Library', () => {
  test('should resize diamond', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('基础图形')
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

  test('should resize ellipse', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('基础图形')
    await shapesHelper.dragShapeFromLibrary('椭圆', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize hexagon', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('基础图形')
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

  test('should resize star', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('基础图形')
    await shapesHelper.dragShapeFromLibrary('星形', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize pentagon', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('基础图形')
    await shapesHelper.dragShapeFromLibrary('五边形', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })
})

test.describe('Shapes Resize - Flowchart Shapes', () => {
  test('should resize process', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('流程图')
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

  test('should resize decision', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('流程图')
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

  test('should resize database', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('流程图')
    await shapesHelper.dragShapeFromLibrary('数据库', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })
})

test.describe('Shapes Resize - Network Shapes', () => {
  test('should resize server', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('网络/云')
    await shapesHelper.dragShapeFromLibrary('服务器', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 40)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize cloud', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('网络/云')
    await shapesHelper.dragShapeFromLibrary('云', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize router', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('网络/云')
    await shapesHelper.dragShapeFromLibrary('路由器', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 20)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })
})

test.describe('Shapes Resize - UML Shapes', () => {
  test('should resize class', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('UML 2.5')
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

  test('should resize interface', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('UML 2.5')
    await shapesHelper.dragShapeFromLibrary('接口', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize usecase', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('UML 2.5')
    await shapesHelper.dragShapeFromLibrary('用例', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 40, 20)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })
})

test.describe('Shapes Resize - ER Shapes', () => {
  test('should resize entity', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('ER图')
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

  test('should resize attribute', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('ER图')
    await shapesHelper.dragShapeFromLibrary('属性', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 20)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize relationship', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('ER图')
    await shapesHelper.dragShapeFromLibrary('关系', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 20)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })
})

test.describe('Shapes Resize - BPMN Shapes', () => {
  test('should resize task', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('BPMN 2.0')
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

  test('should resize start event', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('BPMN 2.0')
    await shapesHelper.dragShapeFromLibrary('开始事件', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 20, 20)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize exclusive gateway', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('BPMN 2.0')
    await shapesHelper.dragShapeFromLibrary('排他网关', 300, 300)
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

test.describe('Shapes Resize - Cloud Shapes', () => {
  test('should resize EC2 instance', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('云服务')
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

  test('should resize Lambda function', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('云服务')
    await shapesHelper.dragShapeFromLibrary('Lambda 函数', 300, 300)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', 30, 30)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(initialSize.width)
    expect(newSize.height).toBeGreaterThan(initialSize.height)
  })

  test('should resize S3 bucket', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.expandCategory('云服务')
    await shapesHelper.dragShapeFromLibrary('S3 存储桶', 300, 300)
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
  test('should shrink shape smaller', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawCircle(300, 300, 50)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    const initialSize = await shapesHelper.getShapeSize(0)
    await shapesHelper.resizeShapeFromCorner(0, 'se', -20, -20)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeLessThan(initialSize.width)
    expect(newSize.height).toBeLessThan(initialSize.height)
  })

  test('should resize to very large size', async ({ page }) => {
    const canvasHelper = new CanvasHelper(page)
    const shapesHelper = new ShapesHelper(page)
    
    await page.goto('/')
    await canvasHelper.waitForCanvas()
    
    await shapesHelper.drawRectangle(300, 300, 100, 60)
    await page.waitForTimeout(500)
    await shapesHelper.selectShape(0)
    await page.waitForTimeout(300)
    
    await shapesHelper.resizeShapeFromCorner(0, 'se', 200, 150)
    const newSize = await shapesHelper.getShapeSize(0)
    
    expect(newSize.width).toBeGreaterThan(250)
    expect(newSize.height).toBeGreaterThan(180)
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
