import type { CSSProperties } from 'react'

interface SkeletonProps {
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'table-row'
  width?: string
  height?: string
  className?: string
  style?: CSSProperties
}

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
}: SkeletonProps) => {
  const variantClasses = {
    text: 'skeleton--text',
    title: 'skeleton--title',
    avatar: 'skeleton--avatar',
    card: 'skeleton--card',
    'table-row': 'skeleton--table-row',
  }

  const mergedStyle: CSSProperties = { ...style }
  if (width) mergedStyle.width = width
  if (height) mergedStyle.height = height

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${className}`.trim()}
      style={mergedStyle}
      aria-hidden="true"
    />
  )
}

export default Skeleton
export type { SkeletonProps }
