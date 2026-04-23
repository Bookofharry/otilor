import { useEffect } from 'react'
import { statusTone, toDisplayDate, toMoney, totalAmount, withOverdueStatus } from '../app/invoiceUtils'
import type { Invoice } from '../app/types'
import InvoicePreview from '../modules/invoices/components/InvoicePreview'
import Timeline from '../modules/invoices/components/Timeline'
import { useInvoiceAnalytics } from '../context/useAnalytics'

interface DetailPageProps {
  invoice: Invoice | null
  actionBusy: boolean
  onCreateInvoice: () => void
  onDownload: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onMarkSent: (invoice: Invoice) => void
  onMarkPaid: (invoice: Invoice) => void
  onSend: (invoice: Invoice) => void
  onVoid: (invoice: Invoice) => void
}

function DetailPage({
  invoice,
  actionBusy,
  onCreateInvoice,
  onDownload,
  onEdit,
  onMarkSent,
  onMarkPaid,
  onSend,
  onVoid,
}: DetailPageProps) {
  const invoiceAnalytics = useInvoiceAnalytics()

  // Track detail viewed when invoice changes
  useEffect(() => {
    if (invoice) {
      invoiceAnalytics.trackDetailViewed(invoice.id, invoice.status)
    }
  }, [invoice?.id, invoiceAnalytics])

  const handleDownload = () => {
    if (invoice) {
      invoiceAnalytics.trackPdfDownload(invoice.id)
      onDownload(invoice)
    }
  }

  const handleMarkSent = () => {
    if (invoice) {
      invoiceAnalytics.trackMarkSent(invoice.id)
      onMarkSent(invoice)
      // Note: Success event should be tracked after API call succeeds
    }
  }

  const handleMarkPaid = () => {
    if (invoice) {
      const total = totalAmount(invoice.items, invoice.taxRate, invoice.discountRate)
      invoiceAnalytics.trackMarkPaid(invoice.id, total)
      onMarkPaid(invoice)
    }
  }

  const handleCreateInvoice = () => {
    invoiceAnalytics.trackCreateInvoice('detail_page_empty_state')
    onCreateInvoice()
  }

  if (!invoice) {
    return (
      <section className="screen detail-screen">
        <article className="panel empty-state">
          <h3>No invoice selected</h3>
          <p>Create or pick an invoice from the dashboard.</p>
          <button className="primary-button" type="button" onClick={handleCreateInvoice}>
            Create Invoice
          </button>
        </article>
      </section>
    )
  }

  const selectedStatus = withOverdueStatus(invoice)
  const timelineEvents = invoice.events.map((event) => ({
    id: event.id,
    type: event.type,
    timestamp: event.at,
    description: event.label,
    actor: event.actor,
  }))

  return (
    <section className="screen detail-screen">
      <div className="section-heading">
        <h2>{invoice.number}</h2>
        <p className="detail-subtitle">{invoice.clientName}</p>
      </div>

      <div className="detail-layout detail-content-grid">
        <article className="panel detail-main-panel">
          <div className="detail-meta detail-meta-grid">
            <div className="detail-meta-item detail-meta-item--status">
              <small>Status</small>
              <span className={`status-badge ${statusTone(selectedStatus)}`}>{selectedStatus}</span>
            </div>
            <div className="detail-meta-item">
              <small>Due Date</small>
              <span>{toDisplayDate(invoice.dueDate)}</span>
            </div>
            <div className="detail-meta-item">
              <small>Total</small>
              <span>{toMoney(totalAmount(invoice.items, invoice.taxRate, invoice.discountRate))}</span>
            </div>
          </div>

          <div className="detail-actions detail-actions-grid">
            <button className="secondary-button detail-action-button detail-action-button--secondary" type="button" onClick={handleDownload}>
              Download PDF
            </button>
            <button
              className="ghost-button detail-action-button detail-action-button--ghost"
              type="button"
              onClick={() => onEdit(invoice)}
              disabled={selectedStatus === 'Paid' || selectedStatus === 'Void' || actionBusy}
            >
              Edit
            </button>
            <button
              className="warning-button detail-action-button detail-action-button--warning"
              type="button"
              onClick={handleMarkSent}
              disabled={selectedStatus !== 'Draft' || actionBusy}
            >
              Mark as Sent
            </button>
            <button
              className="success-button detail-action-button detail-action-button--success"
              type="button"
              onClick={handleMarkPaid}
              disabled={
                selectedStatus === 'Draft' ||
                selectedStatus === 'Paid' ||
                selectedStatus === 'Void' ||
                actionBusy
              }
            >
              Mark as Paid
            </button>
            <button
              className="primary-button detail-action-button detail-action-button--primary"
              type="button"
              onClick={() => onSend(invoice)}
              disabled={selectedStatus === 'Void' || actionBusy}
            >
              Send To
            </button>
            <button
              className="danger-button detail-action-button detail-action-button--danger"
              type="button"
              onClick={() => onVoid(invoice)}
              disabled={selectedStatus === 'Void' || actionBusy}
            >
              Void
            </button>
          </div>

          <InvoicePreview invoice={invoice} />
        </article>

        <article className="timeline-panel detail-side-panel">
          <Timeline events={timelineEvents} />
        </article>
      </div>
    </section>
  )
}

export default DetailPage
