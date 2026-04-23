import { forwardRef } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, className = '', ...props }, ref) => {
    const cardClasses = `card ${hover ? 'card--hover' : ''} ${className}`.trim()

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'

export default Card
export type { CardProps }
