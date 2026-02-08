import React from 'react'

interface HandIconProps {
  className?: string
  style?: React.CSSProperties
}

export const HandIcon: React.FC<HandIconProps> = ({ className, style }) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M21.5 11.5c-.5-.5-1.2-.5-1.7 0l-2.8 2.8V6c0-.8-.7-1.5-1.5-1.5S14 5.2 14 6v6.5l-2-2V3c0-.8-.7-1.5-1.5-1.5S9 2.2 9 3v7.5l-2-2V6c0-.8-.7-1.5-1.5-1.5S4 5.2 4 6v4.8c0 .2 0 .3.2.5l-3.5 3.5c-.5.5-.5 1.2 0 1.7l4.5 4.5c.5.5 1.2.5 1.7 0l9.8-9.8 2.8-2.8c.5-.5.5-1.2 0-1.7z" />
  </svg>
)

export default HandIcon
