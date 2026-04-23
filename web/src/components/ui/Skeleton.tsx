interface SkeletonProps {
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'table-row'
  width?: string
  height?: string
  className?: string
}

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
}: SkeletonProps) => {
  const variantClasses = {
    text: 'skeleton--text',
    title: 'skeleton--title',
    avatar: 'skeleton--avatar',
    card: 'skeleton--card',
    'table-row': 'skeleton--table-row',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = width
  if (height) style.height = height

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  )
}

export default Skeleton
export type { SkeletonProps }
