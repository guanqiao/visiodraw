import React, { useState } from 'react'
import { Button, Tooltip, Space, Divider, Dropdown } from 'antd'
import {
  SelectOutlined,
  BorderOutlined,
  LineOutlined,
  FontSizeOutlined,
  UndoOutlined,
  RedoOutlined,
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined,
  SaveOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
  AppstoreOutlined,
  PrinterOutlined,
  ExportOutlined,
  FileExcelOutlined,
} from '@ant-design/icons'
import useCanvasStore from '@stores/canvasStore'
import TemplateGallery from './TemplateGallery'
import PrintPreview from './PrintPreview'
import ExcelImportDialog from './ExcelImportDialog'
import { exportToPng, exportToSvg } from '@utils/exportUtils'

const Toolbar: React.FC = () => {
  const {
    currentTool,
    setTool,
    undo,
    redo,
    zoom,
    setZoom,
    newCanvas,
    gridEnabled,
    toggleGrid,
    canvas,
  } = useCanvasStore()

  const [isTemplateGalleryVisible, setIsTemplateGalleryVisible] = useState(false)
  const [isPrintPreviewVisible, setIsPrintPreviewVisible] = useState(false)
  const [isExcelImportVisible, setIsExcelImportVisible] = useState(false)

  const tools = [
    { key: 'select', icon: <SelectOutlined />, title: '选择' },
    { key: 'rectangle', icon: <BorderOutlined />, title: '矩形' },
    { key: 'circle', icon: <BorderOutlined />, title: '圆形' },
    { key: 'line', icon: <LineOutlined />, title: '线条' },
    { key: 'text', icon: <FontSizeOutlined />, title: '文本' },
  ]

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 3)
    setZoom(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.1)
    setZoom(newZoom)
  }

  const handleZoomFit = () => {
    setZoom(1)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', width: '100%' }}>
      {/* 文件操作 */}
      <Space>
        <Tooltip title="新建">
          <Button icon={<FileAddOutlined />} onClick={newCanvas} />
        </Tooltip>
        <Tooltip title="打开">
          <Button icon={<FolderOpenOutlined />} />
        </Tooltip>
        <Tooltip title="保存">
          <Button icon={<SaveOutlined />} />
        </Tooltip>
      </Space>

      <Divider type="vertical" />

      {/* 绘图工具 */}
      <Space>
        {tools.map((tool) => (
          <Tooltip title={tool.title} key={tool.key}>
            <Button
              icon={tool.icon}
              type={currentTool === tool.key ? 'primary' : 'default'}
              onClick={() => setTool(tool.key)}
            />
          </Tooltip>
        ))}
      </Space>

      <Divider type="vertical" />

      {/* 编辑操作 */}
      <Space>
        <Tooltip title="撤销">
          <Button icon={<UndoOutlined />} onClick={undo} />
        </Tooltip>
        <Tooltip title="重做">
          <Button icon={<RedoOutlined />} onClick={redo} />
        </Tooltip>
        <Tooltip title="删除">
          <Button icon={<DeleteOutlined />} danger />
        </Tooltip>
      </Space>

      <Divider type="vertical" />

      {/* 视图操作 */}
      <Space>
        <Tooltip title="放大">
          <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
        </Tooltip>
        <span style={{ minWidth: 50, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <Tooltip title="缩小">
          <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
        </Tooltip>
        <Tooltip title="适应窗口">
          <Button icon={<ExpandOutlined />} onClick={handleZoomFit} />
        </Tooltip>
      </Space>

      <Divider type="vertical" />

      {/* Excel导入 */}
      <Tooltip title="导入Excel">
        <Button
          icon={<FileExcelOutlined />}
          onClick={() => setIsExcelImportVisible(true)}
        >
          Excel
        </Button>
      </Tooltip>

      <Divider type="vertical" />

      {/* 模板库 */}
      <Tooltip title="模板库">
        <Button
          icon={<AppstoreOutlined />}
          onClick={() => setIsTemplateGalleryVisible(true)}
        >
          模板
        </Button>
      </Tooltip>

      <Divider type="vertical" />

      <Divider type="vertical" />

      {/* 打印 */}
      <Tooltip title="打印">
        <Button
          icon={<PrinterOutlined />}
          onClick={() => setIsPrintPreviewVisible(true)}
        >
          打印
        </Button>
      </Tooltip>

      {/* 导出菜单 */}
      <Dropdown
        menu={{
          items: [
            {
              key: 'png',
              label: '导出为 PNG',
              onClick: () => {
                if (canvas) {
                  const dataUrl = exportToPng(canvas)
                  const link = document.createElement('a')
                  link.href = dataUrl
                  link.download = `export-${Date.now()}.png`
                  link.click()
                }
              },
            },
            {
              key: 'svg',
              label: '导出为 SVG',
              onClick: () => {
                if (canvas) {
                  const svg = exportToSvg(canvas)
                  const blob = new Blob([svg], { type: 'image/svg+xml' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `export-${Date.now()}.svg`
                  link.click()
                  URL.revokeObjectURL(url)
                }
              },
            },
          ],
        }}
      >
        <Button icon={<ExportOutlined />}>导出</Button>
      </Dropdown>

      <Divider type="vertical" />

      {/* 网格开关 */}
      <Tooltip title={gridEnabled ? '关闭网格' : '显示网格'}>
        <Button
          type={gridEnabled ? 'primary' : 'default'}
          onClick={toggleGrid}
        >
          网格
        </Button>
      </Tooltip>

      {/* 模板库弹窗 */}
      <TemplateGallery
        visible={isTemplateGalleryVisible}
        onClose={() => setIsTemplateGalleryVisible(false)}
      />

      {/* 打印预览弹窗 */}
      <PrintPreview
        visible={isPrintPreviewVisible}
        onClose={() => setIsPrintPreviewVisible(false)}
      />

      {/* Excel导入弹窗 */}
      <ExcelImportDialog
        visible={isExcelImportVisible}
        onClose={() => setIsExcelImportVisible(false)}
      />
    </div>
  )
}

export default Toolbar
