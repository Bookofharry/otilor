import { useEffect, useMemo } from 'react'
import type { Invoice } from '../app/types'
import { statusTone, toDisplayDate, toMoney, totalAmount, withOverdueStatus } from '../app/invoiceUtils'
import { useInvoiceAnalytics } from '../context/useAnalytics'
import EmptyState from '../components/ui/EmptyState'

interface AnalyticsPageProps {
  invoices: Invoice[]
}

interface StatusCount {
  label: string
  count: number
  tone: string
}

interface AnalyticsSummary {
  totalInvoices: number
  totalRevenue: number
  averageInvoiceValue: number
  paidInvoices: number
  overdueInvoices: number
  draftInvoices: number
  sentInvoices: number
  voidInvoices: number
  statusCounts: StatusCount[]
  recentEvents: Array<{ invoiceNumber: string; label: string; at: string }>
}

function buildAnalyticsSummary(invoices: Invoice[]): AnalyticsSummary {
  const paidInvoices: Invoice[] = []
  const overdueInvoices: Invoice[] = []
  const draftInvoices: Invoice[] = []
  const sentInvoices: Invoice[] = []
  const voidInvoices: Invoice[] = []

  for (const invoice of invoices) {
    const status = withOverdueStatus(invoice)
    if (status === 'Paid') paidInvoices.push(invoice)
    else if (status === 'Overdue') overdueInvoices.push(invoice)
    else if (status === 'Draft') draftInvoices.push(invoice)
    else if (status === 'Sent') sentInvoices.push(invoice)
    else if (status === 'Void') voidInvoices.push(invoice)
  }

  const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + totalAmount(invoice.items, invoice.taxRate, invoice.discountRate), 0)
  const averageInvoiceValue = invoices.length > 0 ? invoices.reduce((sum, invoice) => sum + totalAmount(invoice.items, invoice.taxRate, invoice.discountRate), 0) / invoices.length : 0

  const statusCounts: StatusCount[] = [
    { label: 'Paid', count: paidInvoices.length, tone: statusTone('Paid') },
    { label: 'Overdue', count: overdueInvoices.length, tone: statusTone('Overdue') },
    { label: 'Sent', count: sentInvoices.length, tone: statusTone('Sent') },
    { label: 'Draft', count: draftInvoices.length, tone: statusTone('Draft') },
    { label: 'Void', count: voidInvoices.length, tone: statusTone('Void') },
  ].filter((item) => item.count > 0)

  const allEvents = invoices.flatMap((invoice) =>
    invoice.events.map((event) => ({
      invoiceNumber: invoice.number,
      label: event.label,
      at: event.at,
    })),
  )

  const recentEvents = allEvents
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 20)

  return {
    totalInvoices: invoices.length,
    totalRevenue,
    averageInvoiceValue,
    paidInvoices: paidInvoices.length,
    overdueInvoices: overdueInvoices.length,
    draftInvoices: draftInvoices.length,
    sentInvoices: sentInvoices.length,
    voidInvoices: voidInvoices.length,
    statusCounts,
    recentEvents,
  }
}

const barColorForTone = (tone: string): string => {
  if (tone.includes('paid')) return 'var(--color-success-500)'
  if (tone.includes('overdue')) return 'var(--color-error-500)'
  if (tone.includes('sent')) return 'var(--color-info-500)'
  if (tone.includes('draft')) return 'var(--color-neutral-400)'
  if (tone.includes('void')) return 'var(--color-neutral-500)'
  return 'var(--color-brand-500)'
}

function AnalyticsPage({ invoices }: AnalyticsPageProps) {
  const invoiceAnalytics = useInvoiceAnalytics()
  const summary = useMemo(() => buildAnalyticsSummary(invoices), [invoices])

  useEffect(() => {
    invoiceAnalytics.track('analytics_viewed')
  }, [invoiceAnalytics])

  const maxCount = Math.max(...summary.statusCounts.map((item) => item.count), 1)

  return (
    <section className="screen analytics-screen">
      <div className="section-heading">
        <h2>Analytics</h2>
        <p>Track invoicing performance and activity.</p>
      </div>

      <div className="analytics-kpi-grid">
        <article className="kpi-card">
          <p className="analytics-kpi-label">Total Invoices</p>
          <strong className="analytics-kpi-value">{summary.totalInvoices}</strong>
        </article>
        <article className="kpi-card">
          <p className="analytics-kpi-label">Total Revenue</p>
          <strong className="analytics-kpi-value">{toMoney(summary.totalRevenue)}</strong>
        </article>
        <article className="kpi-card">
          <p className="analytics-kpi-label">Average Invoice</p>
          <strong className="analytics-kpi-value">{toMoney(summary.averageInvoiceValue)}</strong>
        </article>
        <article className="kpi-card">
          <p className="analytics-kpi-label">Paid Invoices</p>
          <strong className="analytics-kpi-value">{summary.paidInvoices}</strong>
        </article>
      </div>

      <div className="analytics-layout">
        <article className="panel analytics-primary-panel">
          <h3 className="panel-title">Invoice Status Breakdown</h3>
          {summary.statusCounts.length === 0 ? (
            <EmptyState
              title="No data yet"
              description="Create and send invoices to see status breakdown."
              actionLabel="Create Invoice"
              onAction={() => {}}
            />
          ) : (
            <div className="analytics-status-bars">
              {summary.statusCounts.map((item) => (
                <div key={item.label} className="analytics-status-row">
                  <span className={`status-badge ${item.tone}`}>{item.label}</span>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{
                        width: `${(item.count / maxCount) * 100}%`,
                        backgroundColor: barColorForTone(item.tone),
                      }}
                    />
                  </div>
                  <strong className="analytics-bar-count">{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel analytics-activity-panel">
          <h3 className="panel-title">Recent Activity</h3>
          {summary.recentEvents.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Activity will appear here as you create and update invoices."
              actionLabel={undefined}
              onAction={() => {}}
            />
          ) : (
            <ul className="analytics-activity-list">
              {summary.recentEvents.map((event, index) => (
                <li key={`${event.invoiceNumber}-${event.at}-${index}`} className="analytics-activity-item">
                  <div className="analytics-activity-meta">
                    <span className="analytics-activity-invoice">{event.invoiceNumber}</span>
                    <span className="analytics-activity-time">{toDisplayDate(event.at)}</span>
                  </div>
                  <p className="analytics-activity-label">{event.label}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  )
}

export default AnalyticsPage
