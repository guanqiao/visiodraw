/**
 * Visio VSDX 文件解析器
 * VSDX是基于Open XML格式的压缩文件，包含多个XML文件
 */

import JSZip from 'jszip'

export interface VsdxShape {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  angle?: number
}

export interface VsdxPage {
  id: string
  name: string
  width: number
  height: number
  shapes: VsdxShape[]
}

export interface VsdxDocument {
  pages: VsdxPage[]
  masters: unknown[]
  themes: unknown[]
}

/**
 * 解析VSDX文件
 * @param arrayBuffer VSDX文件的ArrayBuffer
 * @returns 解析后的文档对象
 */
export async function parseVsdx(arrayBuffer: ArrayBuffer): Promise<VsdxDocument> {
  const zip = await JSZip.loadAsync(arrayBuffer)

  const document: VsdxDocument = {
    pages: [],
    masters: [],
    themes: [],
  }

  // 解析页面
  const pagesXml = await zip.file('visio/pages/pages.xml')?.async('text')
  if (pagesXml) {
    const parser = new DOMParser()
    const pagesDoc = parser.parseFromString(pagesXml, 'application/xml')
    const pageElements = pagesDoc.querySelectorAll('Page')

    for (const pageElement of Array.from(pageElements)) {
      const pageId = pageElement.getAttribute('ID') || ''
      const pageName = pageElement.getAttribute('Name') || `Page ${pageId}`

      // 解析页面内容文件
      const pageContentFile = await findPageContentFile(zip, pageId)

      if (pageContentFile) {
        const pageContent = await parsePageContent(zip, pageContentFile)
        document.pages.push({
          id: pageId,
          name: pageName,
          width: pageContent.width || 8.5,
          height: pageContent.height || 11,
          shapes: pageContent.shapes,
        })
      }
    }
  }

  return document
}

/**
 * 查找页面内容文件路径
 */
async function findPageContentFile(zip: JSZip, pageId: string): Promise<string | null> {
  // 尝试不同的命名约定
  const possiblePaths = [
    `visio/pages/${pageId}.xml`,
    `visio/pages/page${pageId}.xml`,
    `visio/pages/Page-${pageId}.xml`,
  ]

  for (const path of possiblePaths) {
    if (zip.file(path)) {
      return path
    }
  }

  // 尝试从_rels文件查找
  const relsPath = `visio/pages/_rels/pages.xml.rels`
  const relsContent = await zip.file(relsPath)?.async('text')
  if (relsContent) {
    const parser = new DOMParser()
    const relsDoc = parser.parseFromString(relsContent, 'application/xml')
    const relationships = relsDoc.querySelectorAll('Relationship')

    for (const rel of Array.from(relationships)) {
      const target = rel.getAttribute('Target')
      const id = rel.getAttribute('Id')
      if (target && id?.includes(pageId)) {
        return `visio/pages/${target}`
      }
    }
  }

  return null
}

/**
 * 解析页面内容
 */
async function parsePageContent(zip: JSZip, pagePath: string): Promise<{ width: number; height: number; shapes: VsdxShape[] }> {
  const pageXml = await zip.file(pagePath)?.async('text')
  if (!pageXml) {
    return { width: 8.5, height: 11, shapes: [] }
  }

  const parser = new DOMParser()
  const pageDoc = parser.parseFromString(pageXml, 'application/xml')

  // 获取页面尺寸
  const pageSheet = pageDoc.querySelector('PageSheet')
  let width = 8.5
  let height = 11

  if (pageSheet) {
    const pageWidth = pageSheet.querySelector('PageWidth')
    const pageHeight = pageSheet.querySelector('PageHeight')
    if (pageWidth?.textContent) {
      width = parseFloat(pageWidth.textContent) || 8.5
    }
    if (pageHeight?.textContent) {
      height = parseFloat(pageHeight.textContent) || 11
    }
  }

  // 解析图形
  const shapes: VsdxShape[] = []
  const shapeElements = pageDoc.querySelectorAll('Shape')

  for (const shapeElement of Array.from(shapeElements)) {
    const shape = parseShape(shapeElement)
    if (shape) {
      shapes.push(shape)
    }
  }

  return { width, height, shapes }
}

/**
 * 解析单个图形
 */
function parseShape(shapeElement: Element): VsdxShape | null {
  const id = shapeElement.getAttribute('ID') || ''
  const type = shapeElement.getAttribute('Type') || 'Shape'

  // 解析位置和大小
  const xForm = shapeElement.querySelector('XForm')
  let x = 0
  let y = 0
  let width = 100
  let height = 100
  let angle = 0

  if (xForm) {
    const pinXValue = xForm.querySelector('PinX')
    const pinYValue = xForm.querySelector('PinY')
    const widthEl = xForm.querySelector('Width')
    const heightEl = xForm.querySelector('Height')
    const angleEl = xForm.querySelector('Angle')

    if (pinXValue?.textContent) {
      x = parseFloat(pinXValue.textContent) || 0
    }
    if (pinYValue?.textContent) {
      y = parseFloat(pinYValue.textContent) || 0
    }
    if (widthEl?.textContent) {
      width = parseFloat(widthEl.textContent) || 100
    }
    if (heightEl?.textContent) {
      height = parseFloat(heightEl.textContent) || 100
    }
    if (angleEl?.textContent) {
      angle = parseFloat(angleEl.textContent) || 0
    }
  }

  // 解析样式
  let fill = '#ffffff'
  let stroke = '#333333'
  let strokeWidth = 1

  const fillEl = shapeElement.querySelector('Fill')
  if (fillEl) {
    const fillForegnd = fillEl.querySelector('FillForegnd')
    if (fillForegnd?.textContent) {
      fill = parseColor(fillForegnd.textContent)
    }
  }

  const lineEl = shapeElement.querySelector('Line')
  if (lineEl) {
    const lineColor = lineEl.querySelector('LineColor')
    const lineWeight = lineEl.querySelector('LineWeight')
    if (lineColor?.textContent) {
      stroke = parseColor(lineColor.textContent)
    }
    if (lineWeight?.textContent) {
      strokeWidth = parseFloat(lineWeight.textContent) || 1
    }
  }

  // 解析文本
  let text = ''
  const textEl = shapeElement.querySelector('Text')
  if (textEl?.textContent) {
    text = textEl.textContent.trim()
  }

  return {
    id,
    type: mapVisioType(type),
    x: x - width / 2, // Visio使用中心点坐标，转换为左上角坐标
    y: y - height / 2,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    text,
    angle: angle * (180 / Math.PI), // 弧度转角度
  }
}

/**
 * 解析Visio颜色值
 */
function parseColor(colorValue: string): string {
  // Visio使用RGB格式或其他颜色格式
  if (colorValue.startsWith('#')) {
    return colorValue
  }
  if (colorValue.startsWith('RGB(')) {
    const match = colorValue.match(/RGB\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0')
      const g = parseInt(match[2]).toString(16).padStart(2, '0')
      const b = parseInt(match[3]).toString(16).padStart(2, '0')
      return `#${r}${g}${b}`
    }
  }
  // 默认颜色
  return '#ffffff'
}

/**
 * 映射Visio图形类型到内部类型
 */
function mapVisioType(visioType: string): string {
  const typeMap: Record<string, string> = {
    'Shape': 'rectangle',
    'Group': 'group',
    'Line': 'line',
    'Text': 'text',
  }
  return typeMap[visioType] || 'rectangle'
}

/**
 * 将内部格式转换为VSDX格式
 * @param pages 页面数据
 * @returns VSDX文件的Blob
 */
export async function exportToVsdx(pages: VsdxPage[]): Promise<Blob> {
  const zip = new JSZip()

  // 创建[Content_Types].xml
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/visio/document.xml" ContentType="application/vnd.visio.document+xml"/>
  <Override PartName="/visio/pages/pages.xml" ContentType="application/vnd.visio.pages+xml"/>
</Types>`
  zip.file('[Content_Types].xml', contentTypes)

  // 创建_rels/.rels
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/document" Target="visio/document.xml"/>
</Relationships>`
  zip.file('_rels/.rels', rels)

  // 创建visio/document.xml
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<VisioDocument xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  <DocumentSettings>
    <GlueSettings>0</GlueSettings>
    <SnapSettings>0</SnapSettings>
    <SnapExtensions>0</SnapExtensions>
    <SnapAngles>0</SnapAngles>
    <DynamicGridEnabled>0</DynamicGridEnabled>
  </DocumentSettings>
  <Pages>
    ${pages.map((page, index) => `<Page ID="${index + 1}" Name="${page.name}"/>`).join('\n    ')}
  </Pages>
</VisioDocument>`
  zip.file('visio/document.xml', document)

  // 创建visio/pages/pages.xml
  const pagesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Pages xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  ${pages.map((page, index) => `
  <Page ID="${index + 1}" Name="${page.name}">
    <PageSheet>
      <PageWidth>${page.width}</PageWidth>
      <PageHeight>${page.height}</PageHeight>
    </PageSheet>
  </Page>`).join('')}
</Pages>`
  zip.file('visio/pages/pages.xml', pagesXml)

  // 创建页面内容
  pages.forEach((page, index) => {
    const pageId = index + 1
    const pageContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<PageContents xmlns="http://schemas.microsoft.com/office/visio/2012/main">
  <PageSheet>
    <PageWidth>${page.width}</PageWidth>
    <PageHeight>${page.height}</PageHeight>
  </PageSheet>
  <Shapes>
    ${page.shapes.map((shape) => `
    <Shape ID="${shape.id}" Type="${shape.type}">
      <XForm>
        <PinX>${shape.x + shape.width / 2}</PinX>
        <PinY>${shape.y + shape.height / 2}</PinY>
        <Width>${shape.width}</Width>
        <Height>${shape.height}</Height>
        <Angle>${(shape.angle || 0) * (Math.PI / 180)}</Angle>
      </XForm>
      <Fill>
        <FillForegnd>${shape.fill || '#ffffff'}</FillForegnd>
      </Fill>
      <Line>
        <LineColor>${shape.stroke || '#333333'}</LineColor>
        <LineWeight>${shape.strokeWidth || 1}</LineWeight>
      </Line>
      ${shape.text ? `<Text>${shape.text}</Text>` : ''}
    </Shape>`).join('')}
  </Shapes>
</PageContents>`
    zip.file(`visio/pages/page${pageId}.xml`, pageContent)
  })

  // 创建pages.xml.rels
  const pagesRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${pages.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.microsoft.com/visio/2010/relationships/page" Target="page${index + 1}.xml"/>`).join('\n  ')}
</Relationships>`
  zip.file('visio/pages/_rels/pages.xml.rels', pagesRels)

  return await zip.generateAsync({ type: 'blob' })
}
