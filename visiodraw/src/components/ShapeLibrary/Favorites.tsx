import React from 'react'
import { Button, Tooltip, Empty } from 'antd'
import { StarFilled } from '@ant-design/icons'

interface ShapeDefinition {
  type: string
  name: string
  icon: React.ReactNode
  defaultProps: Record<string, unknown>
}

interface FavoritesProps {
  favorites: ShapeDefinition[]
  onToggleFavorite: (shape: ShapeDefinition) => void
  onSelectShape: (shape: ShapeDefinition) => void
}

const Favorites: React.FC<FavoritesProps> = ({
  favorites,
  onToggleFavorite,
  onSelectShape,
}) => {
  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无收藏图形"
        />
        <p className="favorites-hint">点击图形上的星标添加到收藏</p>
      </div>
    )
  }

  return (
    <div className="favorites-list">
      {favorites.map((shape) => (
        <div
          key={shape.type}
          className="favorite-item"
          onClick={() => onSelectShape(shape)}
        >
          <div className="favorite-icon">{shape.icon}</div>
          <span className="favorite-name">{shape.name}</span>
          <Tooltip title="取消收藏">
            <Button
              type="text"
              size="small"
              icon={<StarFilled style={{ color: '#faad14' }} />}
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(shape)
              }}
              className="favorite-btn"
            />
          </Tooltip>
        </div>
      ))}
    </div>
  )
}

export default Favorites
