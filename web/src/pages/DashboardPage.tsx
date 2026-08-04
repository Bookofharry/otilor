import { useEffect } from 'react'
import { statusTone, toDisplayDate, toMoney, totalAmount, withOverdueStatus } from '../app/invoiceUtils'
import type { DashboardMetrics, Invoice } from '../app/types'
import { useInvoiceAnalytics } from '../context/useAnalytics'
import EmptyState from '../components/ui/EmptyState'

interface DashboardPageProps {
  metrics: DashboardMetrics
  sortedInvoices: Invoice[]
  draftCount: number
  onAddNew: () => void
  onViewAll: () => void
  onViewFiltered: (filter: 'overdue' | 'draft') => void
  onOpenInvoice: (invoiceId: string) => void
}

function DashboardPage({
  metrics,
  sortedInvoices,
  draftCount,
  onAddNew,
  onViewAll,
  onViewFiltered,
  onOpenInvoice,
}: DashboardPageProps) {
  const invoiceAnalytics = useInvoiceAnalytics()
  const recentInvoices = sortedInvoices.slice(0, 5)

  useEffect(() => {
    invoiceAnalytics.trackDashboardViewed()
  }, [invoiceAnalytics])

  const handleAddNew = () => {
    invoiceAnalytics.trackCreateInvoice('dashboard')
    onAddNew()
  }

  const handleOpenInvoice = (invoiceId: string) => {
    const invoice = sortedInvoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      invoiceAnalytics.trackDetailViewed(invoiceId, invoice.status)
    }
    onOpenInvoice(invoiceId)
  }

  return (
    <section className="screen dashboard-screen">
      <div className="section-heading">
        <h2>Dashboard</h2>
        <p className="dashboard-intro">See the signal first. Work the full list in Invoices.</p>
      </div>

      <div className="kpi-grid dashboard-kpi-grid">
        <article className="kpi-card reveal-1">
          <p className="dashboard-kpi-label">Total Unpaid</p>
          <strong className="dashboard-kpi-value">{toMoney(metrics.unpaid)}</strong>
        </article>
        <article className="kpi-card reveal-2">
          <p className="dashboard-kpi-label">Overdue</p>
          <strong className="dashboard-kpi-value">{metrics.overdue}</strong>
        </article>
        <article className="kpi-card reveal-3">
          <p className="dashboard-kpi-label">Paid This Month</p>
          <strong className="dashboard-kpi-value">{toMoney(metrics.paid)}</strong>
        </article>
      </div>

      <div className="dashboard-layout dashboard-content-grid">
        <article className="panel dashboard-primary-panel">
          <div className="panel-header dashboard-panel-header">
            <h3 className="panel-title">Latest 5 Invoices</h3>
            <div className="dashboard-panel-actions">
              <button className="ghost-button" type="button" onClick={onViewAll}>
                View All
              </button>
              <button className="ghost-button" type="button" onClick={handleAddNew}>
                Add New
              </button>
            </div>
          </div>
          <div className="table-wrap dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr className="dashboard-table-empty-row">
                    <td className="dashboard-table-empty" colSpan={5}>
                      <EmptyState
                        title="No invoices yet"
                        description="Create your first invoice, then manage the full history in Invoices."
                        actionLabel="Create Invoice"
                        onAction={handleAddNew}
                      />
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => {
                    const invoiceStatus = withOverdueStatus(invoice)
                    const invoiceTotal = toMoney(totalAmount(invoice.items, invoice.taxRate, invoice.discountRate))

                    return (
                      <tr
                        key={invoice.id}
                        className="clickable-row dashboard-table-row"
                        onClick={() => handleOpenInvoice(invoice.id)}
                      >
                        <td className="dashboard-primary-cell" data-label="Invoice">
                          {invoice.number}
                        </td>
                        <td className="dashboard-secondary-cell" data-label="Client">
                          {invoice.clientName}
                        </td>
                        <td data-label="Status">
                          <span className={`status-badge ${statusTone(invoiceStatus)}`}>
                            {invoiceStatus}
                          </span>
                        </td>
                        <td className="dashboard-metric-cell" data-label="Total">
                          {invoiceTotal}
                        </td>
                        <td data-label="Due">
                          {toDisplayDate(invoice.dueDate)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel actions-panel dashboard-attention-panel">
          <h3>Needs Attention</h3>
          <ul>
            <li><strong>{metrics.overdue}</strong> overdue invoices need follow-up.</li>
            <li><strong>{draftCount}</strong> drafts are not sent.</li>
            <li>Target median create-to-send time <strong>under 2 minutes</strong>.</li>
          </ul>
          <div className="dashboard-attention-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => onViewFiltered('overdue')}
              disabled={metrics.overdue === 0}
            >
              Review Overdue
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => onViewFiltered('draft')}
              disabled={draftCount === 0}
            >
              Review Drafts
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}

export default DashboardPage
