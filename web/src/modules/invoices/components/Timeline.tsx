import { parseDateValue, toDisplayDate } from '../../../app/invoiceUtils'
import type { InvoiceEventType } from '../../../app/types'

export interface TimelineEvent {
  id: string
  type: InvoiceEventType
  timestamp: string
  description: string
  actor?: string | null
  metadata?: Record<string, unknown>
}

interface TimelineProps {
  events: TimelineEvent[]
  isLoading?: boolean
}

function getEventIcon(type: TimelineEvent['type']): string {
  if (type === 'created') return 'C'
  if (type === 'updated') return 'U'
  if (type === 'sent') return 'S'
  if (type === 'paid') return 'P'
  if (type === 'voided') return 'X'
  if (type === 'reminder_sent') return 'R'
  return 'V'
}

function getEventTone(type: TimelineEvent['type']): string {
  if (type === 'created') return 'info'
  if (type === 'updated') return 'neutral'
  if (type === 'sent') return 'warning'
  if (type === 'paid') return 'success'
  if (type === 'voided') return 'danger'
  if (type === 'reminder_sent') return 'warning'
  return 'info'
}

function getEventLabel(type: TimelineEvent['type']): string {
  if (type === 'reminder_sent') return 'Reminder sent'
  if (type === 'created') return 'Created'
  if (type === 'updated') return 'Updated'
  if (type === 'sent') return 'Sent'
  if (type === 'paid') return 'Paid'
  if (type === 'voided') return 'Voided'
  return 'Viewed'
}

function formatTimeAgo(timestamp: string): string {
  const date = parseDateValue(timestamp)
  if (!date) return timestamp

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return toDisplayDate(timestamp)
}

function Timeline({ events, isLoading }: TimelineProps) {
  if (isLoading) {
    return (
      <div className="timeline">
        <div className="timeline-header">
          <h4>Activity History</h4>
        </div>
        <div className="timeline-loading">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="timeline">
        <div className="timeline-header">
          <h4>Activity History</h4>
        </div>
        <div className="timeline-empty">
          <p>No activity recorded yet.</p>
        </div>
      </div>
    )
  }

  const sortedEvents = [...events].sort(
    (left, right) => (parseDateValue(right.timestamp)?.getTime() ?? 0) - (parseDateValue(left.timestamp)?.getTime() ?? 0),
  )

  return (
    <div className="timeline">
      <div className="timeline-header">
        <h4>Activity History</h4>
        <span className="timeline-count">{events.length} events</span>
      </div>

      <div className="timeline-events">
        {sortedEvents.map((event, index) => (
          <div
            key={event.id}
            className={`timeline-event ${getEventTone(event.type)}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="timeline-marker">
              <span className="timeline-icon">{getEventIcon(event.type)}</span>
              {index !== sortedEvents.length - 1 && <div className="timeline-line" />}
            </div>

            <div className="timeline-content">
              <div className="timeline-title">
                <span className="timeline-type">{getEventLabel(event.type)}</span>
                <time
                  className="timeline-time"
                  title={parseDateValue(event.timestamp)?.toLocaleString() ?? event.timestamp}
                >
                  {formatTimeAgo(event.timestamp)}
                </time>
              </div>
              <p className="timeline-description">{event.description}</p>
              {event.actor && <span className="timeline-actor">by {event.actor}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Timeline
