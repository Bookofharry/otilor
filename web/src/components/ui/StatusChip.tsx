import type { InvoiceStatus } from '../../app/types'

type StatusChipProps = {
  status: InvoiceStatus | 'Draft' | 'Sent' | 'Overdue' | 'Paid' | 'Void'
  className?: string
}

const statusMap: Record<string, { className: string; label: string }> = {
  Draft: { className: 'status-chip--draft', label: 'Draft' },
  Sent: { className: 'status-chip--sent', label: 'Sent' },
  Overdue: { className: 'status-chip--overdue', label: 'Overdue' },
  Paid: { className: 'status-chip--paid', label: 'Paid' },
  Void: { className: 'status-chip--void', label: 'Void' },
}

const StatusChip = ({ status, className = '' }: StatusChipProps) => {
  const config = statusMap[status] || statusMap.Draft
  const chipClasses = `status-chip ${config.className} ${className}`.trim()

  return <span className={chipClasses}>{config.label}</span>
}

export default StatusChip
export type { StatusChipProps }
