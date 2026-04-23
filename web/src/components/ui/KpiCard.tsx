import { forwardRef } from 'react'

interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  trend?: {
    direction: 'up' | 'down'
    value: string
  }
  loading?: boolean
}

const KpiCard = forwardRef<HTMLDivElement, KpiCardProps>(
  ({ label, value, trend, loading = false, className = '', ...props }, ref) => {
    if (loading) {
      return (
        <div ref={ref} className={`kpi-card ${className}`.trim()} {...props}>
          <div className="skeleton skeleton--text" style={{ width: '40%' }} />
          <div className="skeleton skeleton--title" style={{ width: '60%', marginTop: '12px' }} />
        </div>
      )
    }

    return (
      <div ref={ref} className={`kpi-card ${className}`.trim()} {...props}>
        <div className="kpi-card__label">{label}</div>
        <div className="kpi-card__value">{value}</div>
        {trend && (
          <div
            className={`kpi-card__trend ${
              trend.direction === 'up' ? 'kpi-card__trend--up' : 'kpi-card__trend--down'
            }`}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    )
  },
)

KpiCard.displayName = 'KpiCard'

export default KpiCard
export type { KpiCardProps }
