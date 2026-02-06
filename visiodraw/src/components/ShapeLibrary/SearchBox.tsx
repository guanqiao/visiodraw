import React from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = '搜索图形...',
}) => {
  return (
    <div className="shape-library-search">
      <Input
        prefix={<SearchOutlined />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        allowClear
        size="small"
      />
    </div>
  )
}

export default SearchBox
