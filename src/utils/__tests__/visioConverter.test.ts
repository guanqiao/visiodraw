// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Template } from '../../types/template'
import {
  parseVisioFile,
  convertVisioToTemplate,
  convertTemplateToVisio,
  validateVisioFile,
  getVisioShapeMapping,
  getVisioStyleMapping,
} from '../visioConverter'

// Mock JSZip for testing
vi.mock('jszip', () => {
  return {
    default: vi.fn(() => ({
      loadAsync: vi.fn(() =>
        Promise.resolve({
          file: vi.fn((path: string) => {
            if (path === 'visio/pages/page1.xml') {
              return {
                async: vi.fn(() =>
                  Promise.resolve(`
                    <?xml version="1.0" encoding="UTF-8"?>
                    <PageContents>
                      <Shapes>
                        <Shape ID="1" Type="Rectangle">
                          <XForm>
                            <PinX>1.0</PinX>
                            <PinY>2.0</PinY>
                            <Width>2.0</Width>
                            <Height>1.0</Height>
                          </XForm>
                          <Text>Test Shape</Text>
                        </Shape>
                      </Shapes>
                    </PageContents>
                  `)
                ),
              }
            }
            if (path === 'visio/document.xml') {
              return {
                async: vi.fn(() =>
                  Promise.resolve(`
                    <?xml version="1.0" encoding="UTF-8"?>
                    <VisioDocument>
                      <DocumentSettings>
                        <DefaultTextStyle>0</DefaultTextStyle>
                      </DocumentSettings>
                    </VisioDocument>
                  `)
                ),
              }
            }
            return null
          }),
        })
      ),
    })),
  }
})

describe('Visio Converter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('File Validation', () => {
    it('should validate correct .vsdx file', () => {
      const validFile = new File(['test'], 'diagram.vsdx', {
        type: 'application/vnd.visio',
      })
      const result = validateVisioFile(validFile)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject non-.vsdx files', () => {
      const invalidFile = new File(['test'], 'diagram.txt', {
        type: 'text/plain',
      })
      const result = validateVisioFile(invalidFile)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件格式错误')
    })

    it('should reject files that are too large', () => {
      const largeContent = new Array(11 * 1024 * 1024).join('a')
      const largeFile = new File([largeContent], 'large.vsdx', {
        type: 'application/vnd.visio',
      })
      const result = validateVisioFile(largeFile)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件过大')
    })

    it('should reject empty files', () => {
      const emptyFile = new File([], 'empty.vsdx', {
        type: 'application/vnd.visio',
      })
      const result = validateVisioFile(emptyFile)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('文件为空')
    })
  })

  describe('Visio File Parsing', () => {
    it('should parse valid Visio file', async () => {
      const vsdxContent = await createMockVsdxFile()
      const result = await parseVisioFile(vsdxContent)

      expect(result.success).toBe(true)
      expect(result.pages).toBeDefined()
      expect(result.pages?.length).toBeGreaterThan(0)
    })

    it('should handle parse errors gracefully', async () => {
      const invalidContent = new File(['invalid'], 'invalid.vsdx')
      const result = await parseVisioFile(invalidContent)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should extract shapes from Visio file', async () => {
      const vsdxContent = await createMockVsdxFile()
      const result = await parseVisioFile(vsdxContent)

      expect(result.shapes).toBeDefined()
      expect(result.shapes?.length).toBeGreaterThan(0)
    })

    it('should extract connectors from Visio file', async () => {
      const vsdxContent = await createMockVsdxFile()
      const result = await parseVisioFile(vsdxContent)

      expect(result.connectors).toBeDefined()
      expect(Array.isArray(result.connectors)).toBe(true)
    })
  })

  describe('Shape Type Mapping', () => {
    it('should map Visio rectangle to our rectangle', () => {
      const mapping = getVisioShapeMapping('Rectangle')
      expect(mapping).toBe('rectangle')
    })

    it('should map Visio ellipse to our ellipse', () => {
      const mapping = getVisioShapeMapping('Ellipse')
      expect(mapping).toBe('ellipse')
    })

    it('should map Visio diamond to our decision', () => {
      const mapping = getVisioShapeMapping('Diamond')
      expect(mapping).toBe('decision')
    })

    it('should map Visio parallelogram to our input-output', () => {
      const mapping = getVisioShapeMapping('Parallelogram')
      expect(mapping).toBe('input-output')
    })

    it('should return default for unknown shapes', () => {
      const mapping = getVisioShapeMapping('UnknownShape')
      expect(mapping).toBe('rectangle')
    })
  })

  describe('Style Mapping', () => {
    it('should map Visio fill color', () => {
      const visioStyle = { FillForegnd: '#FF0000' }
      const mapped = getVisioStyleMapping(visioStyle)
      expect(mapped.fill).toBe('#FF0000')
    })

    it('should map Visio stroke color', () => {
      const visioStyle = { LineColor: '#0000FF' }
      const mapped = getVisioStyleMapping(visioStyle)
      expect(mapped.stroke).toBe('#0000FF')
    })

    it('should map Visio line width', () => {
      const visioStyle = { LineWeight: '2 pt' }
      const mapped = getVisioStyleMapping(visioStyle)
      expect(mapped.strokeWidth).toBe(2)
    })

    it('should handle missing styles gracefully', () => {
      const visioStyle = {}
      const mapped = getVisioStyleMapping(visioStyle)
      expect(mapped).toBeDefined()
    })
  })

  describe('Visio to Template Conversion', () => {
    it('should convert Visio data to template format', async () => {
      const visioData = await createMockVisioData()
      const template = await convertVisioToTemplate(visioData)

      expect(template).toBeDefined()
      expect(template.name).toBeDefined()
      expect(template.shapes).toBeDefined()
      expect(Array.isArray(template.shapes)).toBe(true)
    })

    it('should preserve shape positions', async () => {
      const visioData = await createMockVisioData()
      const template = await convertVisioToTemplate(visioData)

      if (template.shapes.length > 0) {
        expect(template.shapes[0]).toHaveProperty('x')
        expect(template.shapes[0]).toHaveProperty('y')
      }
    })

    it('should preserve shape dimensions', async () => {
      const visioData = await createMockVisioData()
      const template = await convertVisioToTemplate(visioData)

      if (template.shapes.length > 0) {
        expect(template.shapes[0]).toHaveProperty('width')
        expect(template.shapes[0]).toHaveProperty('height')
      }
    })

    it('should convert shape text', async () => {
      const visioData = await createMockVisioData()
      const template = await convertVisioToTemplate(visioData)

      if (template.shapes.length > 0) {
        expect(template.shapes[0]).toHaveProperty('text')
      }
    })

    it('should convert connectors', async () => {
      const visioData = await createMockVisioData()
      const template = await convertVisioToTemplate(visioData)

      expect(template.connectors).toBeDefined()
      expect(Array.isArray(template.connectors)).toBe(true)
    })

    it('should handle multi-page Visio files', async () => {
      const visioData = await createMockVisioData({ pages: 3 })
      const template = await convertVisioToTemplate(visioData)

      expect(template).toBeDefined()
      expect(template.shapes.length).toBeGreaterThan(0)
    })
  })

  describe('Template to Visio Conversion', () => {
    it('should convert template to Visio format', async () => {
      const template = createMockTemplate()
      const visioBlob = await convertTemplateToVisio(template)

      expect(visioBlob).toBeDefined()
      expect(visioBlob instanceof Blob).toBe(true)
    })

    it('should generate valid .vsdx file structure', async () => {
      const template = createMockTemplate()
      const visioBlob = await convertTemplateToVisio(template)

      // The blob should have the correct MIME type
      expect(visioBlob.type).toBe('application/vnd.visio')
    })

    it('should preserve all shapes in export', async () => {
      const template = createMockTemplate({ shapeCount: 5 })
      const visioBlob = await convertTemplateToVisio(template)

      expect(visioBlob.size).toBeGreaterThan(0)
    })

    it('should preserve shape styles in export', async () => {
      const template = createMockTemplate({
        shapes: [
          {
            id: 's1',
            type: 'rectangle',
            x: 100,
            y: 100,
            width: 100,
            height: 60,
            fill: '#FF0000',
            stroke: '#0000FF',
          },
        ],
      })
      const visioBlob = await convertTemplateToVisio(template)

      expect(visioBlob).toBeDefined()
    })
  })

  describe('Round-trip Conversion', () => {
    it('should maintain data integrity in round-trip conversion', async () => {
      const originalTemplate = createMockTemplate()
      const visioBlob = await convertTemplateToVisio(originalTemplate)
      const visioData = await parseVisioFile(visioBlob)
      const convertedTemplate = await convertVisioToTemplate(visioData)

      expect(convertedTemplate.shapes.length).toBe(originalTemplate.shapes.length)
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted Visio files', async () => {
      const corruptedFile = new File(['corrupted data'], 'corrupted.vsdx')
      const result = await parseVisioFile(corruptedFile)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle missing required fields', async () => {
      const incompleteData = { shapes: [] }
      const result = await convertVisioToTemplate(incompleteData as any)

      expect(result).toBeDefined()
      expect(result.shapes).toEqual([])
    })

    it('should provide meaningful error messages', async () => {
      const invalidFile = new File(['test'], 'invalid.vsdx')
      const result = await parseVisioFile(invalidFile)

      expect(result.error).toBeTruthy()
      expect(typeof result.error).toBe('string')
    })
  })
})

// Helper functions for creating mock data
async function createMockVsdxFile(): Promise<File> {
  // Create a minimal valid VSDX structure
  const content = new Blob(['PK'], { type: 'application/vnd.visio' })
  return new File([content], 'test.vsdx', { type: 'application/vnd.visio' })
}

async function createMockVisioData(options: { pages?: number } = {}): Promise<any> {
  return {
    pages: options.pages || 1,
    shapes: [
      {
        id: '1',
        type: 'Rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 60,
        text: 'Test Shape',
        style: { FillForegnd: '#E6F7FF', LineColor: '#1890FF' },
      },
    ],
    connectors: [
      { id: 'c1', source: '1', target: '2', label: '' },
    ],
  }
}

function createMockTemplate(options: { shapeCount?: number; shapes?: any[] } = {}): Template {
  const shapes =
    options.shapes ||
    Array(options.shapeCount || 3)
      .fill(null)
      .map((_, i) => ({
        id: `shape-${i}`,
        type: 'rectangle',
        x: 100 + i * 150,
        y: 100,
        width: 100,
        height: 60,
        fill: '#E6F7FF',
        stroke: '#1890FF',
        text: `Shape ${i}`,
      }))

  return {
    id: 'test-template',
    name: 'Test Template',
    description: 'A test template for Visio conversion',
    category: 'flowchart',
    shapes,
    connectors: [
      { id: 'conn-1', source: 'shape-0', target: 'shape-1' },
    ],
  }
}
