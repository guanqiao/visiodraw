import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Collapse, Input, Tooltip, Button, Empty, Badge } from 'antd'
import {
  SearchOutlined,
  StarFilled,
  StarOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  BorderOutlined,
  BranchesOutlined,
  GlobalOutlined,
  ApartmentOutlined,
  TableOutlined,
} from '@ant-design/icons'
import useShapeLibraryStore from '../../stores/shapeLibraryStore'
import { shapeLibraryService } from '../../services/shapeLibraryService'
import { setDragData } from '../../types/dragDrop'
import type { ShapeLibraryItem } from '../../types/shapeLibrary'
import './styles.css'

const { Search } = Input

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  basic: <BorderOutlined />,
  flowchart: <BranchesOutlined />,
  network: <GlobalOutlined />,
  uml: <ApartmentOutlined />,
  er: <TableOutlined />,
}

interface ShapeItemProps {
  shape: ShapeLibraryItem
  isFavorite: boolean
  onToggleFavorite: (shapeId: string) => void
  onDragStart: (shape: ShapeLibraryItem) => void
}

const ShapeItem = React.memo<ShapeItemProps>(({
  shape,
  isFavorite,
  onToggleFavorite,
  onDragStart,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    onDragStart(shape)

    setDragData(e.dataTransfer, {
      type: 'shape',
      shapeType: shape.type,
      name: shape.name,
      width: shape.width,
      height: shape.height,
      defaultProps: shape.defaultProps,
    })

    // Create drag preview
    const dragPreview = document.createElement('div')
    dragPreview.style.width = '60px'
    dragPreview.style.height = '60px'
    dragPreview.style.background = 'rgba(24, 144, 255, 0.2)'
    dragPreview.style.border = '2px solid #1890ff'
    dragPreview.style.borderRadius = '4px'
    dragPreview.style.display = 'flex'
    dragPreview.style.alignItems = 'center'
    dragPreview.style.justifyContent = 'center'
    dragPreview.style.position = 'fixed'
    dragPreview.style.top = '-100px'
    dragPreview.innerHTML = `<span style="font-size: 10px; color: #1890ff;">${shape.name.slice(0, 4)}</span>`
    document.body.appendChild(dragPreview)

    e.dataTransfer.setDragImage(dragPreview, 30, 30)

    setTimeout(() => {
      document.body.removeChild(dragPreview)
    }, 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <Tooltip title={shape.name} placement="bottom" data-testid="shape-preview">
      <div
        className={`shape-item ${isDragging ? 'dragging' : ''}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        data-testid="shape-item"
      >
        <div
          className="shape-item-icon"
          dangerouslySetInnerHTML={{ __html: shape.icon }}
        />
        <span className="shape-item-name">{shape.name}</span>
        <Tooltip title={isFavorite ? '取消收藏' : '添加收藏'}>
          <Button
            type="text"
            size="small"
            icon={isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(shape.id)
            }}
            className="shape-item-favorite-btn"
          />
        </Tooltip>
      </div>
    </Tooltip>
  )
})

ShapeItem.displayName = 'ShapeItem'

interface ShapeGridProps {
  shapes: ShapeLibraryItem[]
  favoriteIds: string[]
  onToggleFavorite: (shapeId: string) => void
  onUseShape: (shape: ShapeLibraryItem) => void
}

const ShapeGrid = React.memo<ShapeGridProps>(({
  shapes,
  favoriteIds,
  onToggleFavorite,
  onUseShape,
}) => {
  if (shapes.length === 0) {
    return <div className="shape-library-empty">暂无图形</div>
  }

  return (
    <div className="shape-library-grid">
      {shapes.map((shape) => (
        <ShapeItem
          key={shape.id}
          shape={shape}
          isFavorite={favoriteIds.includes(shape.id)}
          onToggleFavorite={onToggleFavorite}
          onDragStart={onUseShape}
        />
      ))}
    </div>
  )
})

ShapeGrid.displayName = 'ShapeGrid'

const ShapeLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activePanels, setActivePanels] = useState<string[]>(['basic', 'favorites', 'recent'])
  const [categories] = useState(shapeLibraryService.getAllCategories())

  const {
    favorites,
    recent,
    toggleFavorite,
    addRecent,
  } = useShapeLibraryStore()

  // Initialize categories in store
  useEffect(() => {
    useShapeLibraryStore.getState().setCategories(categories)
  }, [categories])

  const handleToggleFavorite = useCallback((shapeId: string) => {
    toggleFavorite(shapeId)
  }, [toggleFavorite])

  const handleUseShape = useCallback((shape: ShapeLibraryItem) => {
    addRecent(shape.id)
  }, [addRecent])

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return shapeLibraryService.searchShapes(searchQuery)
  }, [searchQuery])

  // Favorite shapes
  const favoriteShapes = useMemo(() => {
    return favorites
      .map((id) => shapeLibraryService.getShapeById(id))
      .filter((shape): shape is ShapeLibraryItem => shape !== undefined)
  }, [favorites])

  // Recent shapes
  const recentShapes = useMemo(() => {
    return recent
      .map((id) => shapeLibraryService.getShapeById(id))
      .filter((shape): shape is ShapeLibraryItem => shape !== undefined)
  }, [recent])

  // Build collapse items
  const collapseItems = useMemo(() => {
    const items = []

    // Favorites section
    items.push({
      key: 'favorites',
      label: (
        <span className="shape-library-category-header">
          <HeartOutlined style={{ color: '#ff4d4f' }} />
          <span>收藏</span>
          <Badge count={favoriteShapes.length} size="small" style={{ marginLeft: 8 }} />
        </span>
      ),
      children: favoriteShapes.length > 0 ? (
        <ShapeGrid
          shapes={favoriteShapes}
          favoriteIds={favorites}
          onToggleFavorite={handleToggleFavorite}
          onUseShape={handleUseShape}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无收藏图形"
          style={{ marginTop: 20, marginBottom: 20 }}
        />
      ),
    })

    // Recent section
    items.push({
      key: 'recent',
      label: (
        <span className="shape-library-category-header">
          <ClockCircleOutlined style={{ color: '#1890ff' }} />
          <span>最近使用</span>
          <Badge count={recentShapes.length} size="small" style={{ marginLeft: 8 }} />
        </span>
      ),
      children: recentShapes.length > 0 ? (
        <ShapeGrid
          shapes={recentShapes}
          favoriteIds={favorites}
          onToggleFavorite={handleToggleFavorite}
          onUseShape={handleUseShape}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无最近使用"
          style={{ marginTop: 20, marginBottom: 20 }}
        />
      ),
    })

    // Category sections
    categories.forEach((category) => {
      items.push({
        key: category.id,
        label: (
          <span className="shape-library-category-header">
            {categoryIcons[category.id] || <BorderOutlined />}
            <span>{category.name}</span>
            <Badge count={category.shapes.length} size="small" style={{ marginLeft: 8 }} />
          </span>
        ),
        children: (
          <ShapeGrid
            shapes={category.shapes}
            favoriteIds={favorites}
            onToggleFavorite={handleToggleFavorite}
            onUseShape={handleUseShape}
          />
        ),
      })
    })

    return items
  }, [categories, favorites, favoriteShapes, recentShapes, handleToggleFavorite, handleUseShape])

  return (
    <div className="shape-library-container" data-testid="shape-library">
      <div className="shape-library-search">
        <Search
          placeholder="搜索图形..."
          allowClear
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          data-testid="shape-search"
        />
      </div>

      {searchQuery ? (
        <div className="shape-library-search-results" style={{ padding: '8px' }}>
          <div className="shape-library-section-title">搜索结果</div>
          <ShapeGrid
            shapes={searchResults}
            favoriteIds={favorites}
            onToggleFavorite={handleToggleFavorite}
            onUseShape={handleUseShape}
          />
        </div>
      ) : (
        <Collapse
          activeKey={activePanels}
          onChange={(keys) => setActivePanels(keys as string[])}
          bordered={false}
          className="shape-library-collapse"
          items={collapseItems}
          data-testid="shape-category"
        />
      )}
    </div>
  )
}

export default ShapeLibrary
