import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Template } from '../../types/template'
import {
  generateShareLink,
  generateEmbedCode,
  exportTemplateAsImage,
  exportTemplateAsSvg,
  copyToClipboard,
  downloadFile,
  validateShareLink,
  ShareOptions,
  EmbedOptions,
} from '../templateShare'

// Mock canvas and document APIs
const mockCanvasContext = {
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fillText: vi.fn(),
  font: '',
  textAlign: '',
  textBaseline: '',
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  lineCap: '',
  lineJoin: '',
}

const mockCanvas = {
  getContext: vi.fn(() => mockCanvasContext),
  toDataURL: vi.fn(() => 'data:image/png;base64,mocked'),
  width: 800,
  height: 600,
}

const mockExecCommand = vi.fn()

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas
      }
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
        }
      }
      return {}
    }),
    execCommand: mockExecCommand,
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
})

Object.defineProperty(global, 'navigator', {
  value: {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
    },
  },
  writable: true,
})

// Mock template
const mockTemplate: Template = {
  id: 'test-template-1',
  name: '测试模板',
  description: '这是一个测试模板',
  category: 'flowchart',
  tags: ['测试', '流程'],
  shapes: [
    { id: 's1', type: 'rectangle', x: 100, y: 100, width: 100, height: 60, text: '开始' },
    { id: 's2', type: 'rectangle', x: 300, y: 100, width: 100, height: 60, text: '结束' },
  ],
  connectors: [
    { id: 'c1', source: 's1', target: 's2' },
  ],
}

describe('Template Share', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Generate Share Link', () => {
    it('should generate a valid share link', () => {
      const link = generateShareLink(mockTemplate)
      expect(link).toMatch(/^https:\/\//)
      expect(link).toContain(mockTemplate.id)
    })

    it('should include template name in link', () => {
      const link = generateShareLink(mockTemplate)
      expect(link).toContain(encodeURIComponent(mockTemplate.name))
    })

    it('should generate unique links for different templates', () => {
      const link1 = generateShareLink(mockTemplate)
      const link2 = generateShareLink({ ...mockTemplate, id: 'test-template-2' })
      expect(link1).not.toBe(link2)
    })

    it('should handle templates with special characters in name', () => {
      const specialTemplate = { ...mockTemplate, name: '模板 <script>alert(1)</script>' }
      const link = generateShareLink(specialTemplate)
      expect(link).not.toContain('<script>')
    })

    it('should support custom base URL', () => {
      const options: ShareOptions = { baseUrl: 'https://example.com' }
      const link = generateShareLink(mockTemplate, options)
      expect(link).toContain('https://example.com')
    })

    it('should include expiration parameter when specified', () => {
      const options: ShareOptions = { expiresIn: 7 }
      const link = generateShareLink(mockTemplate, options)
      expect(link).toContain('expires=')
    })
  })

  describe('Generate Embed Code', () => {
    it('should generate iframe embed code', () => {
      const code = generateEmbedCode(mockTemplate)
      expect(code).toContain('<iframe')
      expect(code).toContain('</iframe>')
    })

    it('should include template ID in embed code', () => {
      const code = generateEmbedCode(mockTemplate)
      expect(code).toContain(mockTemplate.id)
    })

    it('should support custom dimensions', () => {
      const options: EmbedOptions = { width: 800, height: 600 }
      const code = generateEmbedCode(mockTemplate, options)
      expect(code).toContain('width="800"')
      expect(code).toContain('height="600"')
    })

    it('should support responsive embed', () => {
      const options: EmbedOptions = { responsive: true }
      const code = generateEmbedCode(mockTemplate, options)
      expect(code).toContain('style=')
      expect(code).toContain('100%')
    })

    it('should generate script embed code', () => {
      const options: EmbedOptions = { type: 'script' }
      const code = generateEmbedCode(mockTemplate, options)
      expect(code).toContain('<script')
      expect(code).toContain('</script>')
    })

    it('should generate markdown embed code', () => {
      const options: EmbedOptions = { type: 'markdown' }
      const code = generateEmbedCode(mockTemplate, options)
      expect(code).toContain('![')
      expect(code).toContain('](')
    })
  })

  describe('Export as Image', () => {
    it('should export template as PNG', async () => {
      const result = await exportTemplateAsImage(mockTemplate, 'png')
      expect(result).toMatch(/^data:image\/png/)
    })

    it('should export template as JPEG', async () => {
      const result = await exportTemplateAsImage(mockTemplate, 'jpeg')
      expect(result).toMatch(/^data:image\/jpeg/)
    })

    it('should support custom dimensions', async () => {
      const options = { width: 1200, height: 800 }
      const result = await exportTemplateAsImage(mockTemplate, 'png', options)
      expect(mockCanvas.width).toBe(1200)
      expect(mockCanvas.height).toBe(800)
    })

    it('should support quality option for JPEG', async () => {
      const options = { quality: 0.8 }
      await exportTemplateAsImage(mockTemplate, 'jpeg', options)
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
    })

    it('should handle empty template', async () => {
      const emptyTemplate = { ...mockTemplate, shapes: [], connectors: [] }
      const result = await exportTemplateAsImage(emptyTemplate, 'png')
      expect(result).toBeDefined()
    })

    it('should handle template with many shapes', async () => {
      const largeTemplate = {
        ...mockTemplate,
        shapes: Array(100).fill(null).map((_, i) => ({
          id: `s${i}`,
          type: 'rectangle',
          x: i * 10,
          y: i * 10,
          width: 50,
          height: 30,
        })),
      }
      const result = await exportTemplateAsImage(largeTemplate, 'png')
      expect(result).toBeDefined()
    })
  })

  describe('Export as SVG', () => {
    it('should export template as SVG string', async () => {
      const result = await exportTemplateAsSvg(mockTemplate)
      expect(result).toContain('<svg')
      expect(result).toContain('</svg>')
    })

    it('should include shapes in SVG', async () => {
      const result = await exportTemplateAsSvg(mockTemplate)
      expect(result).toContain('<rect')
    })

    it('should include connectors in SVG', async () => {
      const result = await exportTemplateAsSvg(mockTemplate)
      expect(result).toContain('<line') || expect(result).toContain('<path')
    })

    it('should support custom viewBox', async () => {
      const options = { viewBox: '0 0 1000 800' }
      const result = await exportTemplateAsSvg(mockTemplate, options)
      expect(result).toContain('viewBox="0 0 1000 800"')
    })

    it('should escape special characters in text', async () => {
      const specialTemplate = {
        ...mockTemplate,
        shapes: [
          { ...mockTemplate.shapes[0], text: 'Text <with> special & chars' },
        ],
      }
      const result = await exportTemplateAsSvg(specialTemplate)
      expect(result).not.toContain('<with>')
      expect(result).toContain('&lt;with&gt;')
    })
  })

  describe('Copy to Clipboard', () => {
    it('should copy text to clipboard using modern API', async () => {
      const text = 'test content'
      const result = await copyToClipboard(text)
      expect(result).toBe(true)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text)
    })

    it('should fallback to execCommand if modern API fails', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Failed'))
      const text = 'test content'
      const result = await copyToClipboard(text)
      expect(result).toBe(true)
      expect(mockExecCommand).toHaveBeenCalledWith('copy')
    })

    it('should handle empty text', async () => {
      const result = await copyToClipboard('')
      expect(result).toBe(true)
    })

    it('should handle special characters', async () => {
      const text = 'Special <>&" chars'
      const result = await copyToClipboard(text)
      expect(result).toBe(true)
    })
  })

  describe('Download File', () => {
    it('should trigger file download', () => {
      const content = 'test content'
      const filename = 'test.txt'
      const mimeType = 'text/plain'

      const link = downloadFile(content, filename, mimeType)
      expect(link.download).toBe(filename)
      expect(link.click).toHaveBeenCalled()
    })

    it('should handle blob content', () => {
      const blob = new Blob(['test'], { type: 'text/plain' })
      const filename = 'test.txt'

      const link = downloadFile(blob, filename)
      expect(link.download).toBe(filename)
    })

    it('should handle data URL content', () => {
      const dataUrl = 'data:text/plain;base64,dGVzdA=='
      const filename = 'test.txt'

      const link = downloadFile(dataUrl, filename)
      expect(link.href).toBe(dataUrl)
    })

    it('should clean up after download', () => {
      const content = 'test'
      const filename = 'test.txt'

      downloadFile(content, filename)
      expect(document.body.removeChild).toHaveBeenCalled()
    })
  })

  describe('Validate Share Link', () => {
    it('should validate correct share link', () => {
      const link = 'https://example.com/share/template-123'
      const result = validateShareLink(link)
      expect(result.valid).toBe(true)
    })

    it('should reject invalid URL', () => {
      const link = 'not-a-valid-url'
      const result = validateShareLink(link)
      expect(result.valid).toBe(false)
    })

    it('should reject expired link', () => {
      const expiredLink = 'https://example.com/share/template-123?expires=' + (Date.now() - 1000)
      const result = validateShareLink(expiredLink)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('过期')
    })

    it('should accept valid non-expired link', () => {
      const validLink = 'https://example.com/share/template-123?expires=' + (Date.now() + 86400000)
      const result = validateShareLink(validLink)
      expect(result.valid).toBe(true)
    })

    it('should extract template ID from link', () => {
      const link = 'https://example.com/share/template-123'
      const result = validateShareLink(link)
      expect(result.templateId).toBe('template-123')
    })
  })

  describe('Error Handling', () => {
    it('should handle canvas creation failure', async () => {
      vi.mocked(document.createElement).mockReturnValueOnce(null as any)
      await expect(exportTemplateAsImage(mockTemplate, 'png')).rejects.toThrow()
    })

    it('should handle invalid image format', async () => {
      await expect(exportTemplateAsImage(mockTemplate, 'invalid' as any)).rejects.toThrow()
    })

    it('should handle missing template', async () => {
      await expect(exportTemplateAsImage(null as any, 'png')).rejects.toThrow()
    })

    it('should handle clipboard API not available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      })
      const result = await copyToClipboard('test')
      expect(result).toBe(false)
    })
  })

  describe('Performance', () => {
    it('should generate image within reasonable time', async () => {
      const start = Date.now()
      await exportTemplateAsImage(mockTemplate, 'png')
      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000)
    })

    it('should handle large templates efficiently', async () => {
      const largeTemplate = {
        ...mockTemplate,
        shapes: Array(500).fill(null).map((_, i) => ({
          id: `s${i}`,
          type: 'rectangle',
          x: i * 5,
          y: i * 5,
          width: 30,
          height: 20,
        })),
      }
      const start = Date.now()
      await exportTemplateAsImage(largeTemplate, 'png')
      const duration = Date.now() - start
      expect(duration).toBeLessThan(2000)
    })
  })
})
