import { discountAmount, lineAmount, statusTone, subtotal, taxAmount, toDisplayDate, toMoney, withOverdueStatus } from '../../../app/invoiceUtils'
import { getInvoiceIssuerContactLines, getInvoiceIssuerProfile } from '../../../app/invoiceIssuer'
import type { Invoice } from '../../../app/types'

interface InvoicePreviewProps {
  invoice: Invoice
}

function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const sub = subtotal(invoice.items)
  const tax = taxAmount(sub, invoice.taxRate)
  const discount = discountAmount(sub, invoice.discountRate)
  const total = sub + tax - discount
  const rows = invoice.items.filter((item) => item.description.trim().length > 0)
  const issuerProfile = getInvoiceIssuerProfile()
  const issuerContactLines = getInvoiceIssuerContactLines()

  return (
    <article className="invoice-preview invoice-preview--detail">
      <header className="invoice-preview__header">
        <div className="invoice-preview__identity">
          <p className="mono-label">{invoice.number}</p>
          <h4>Invoice</h4>
          <p>Issued by {issuerProfile.name}</p>
        </div>
        <div className="invoice-preview__parties">
          <section className="invoice-preview__party">
            <span className="invoice-preview__party-label">Bill From</span>
            <strong>{issuerProfile.name}</strong>
            {issuerContactLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </section>
          <section className="invoice-preview__party">
            <span className="invoice-preview__party-label">Bill To</span>
            <strong>{invoice.clientName}</strong>
            <p>{invoice.clientEmail || 'Client email not added yet.'}</p>
          </section>
        </div>
        <div className="invoice-preview__meta">
          <p>Issue: {toDisplayDate(invoice.issueDate)}</p>
          <p>Due: {toDisplayDate(invoice.dueDate)}</p>
          <p>
            Status:{' '}
            <span className={`status-badge ${statusTone(withOverdueStatus(invoice))}`}>
              {withOverdueStatus(invoice)}
            </span>
          </p>
        </div>
      </header>

      <table className="invoice-preview__table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr className="invoice-preview__empty-row">
              <td className="invoice-preview__empty" colSpan={4}>No line items yet.</td>
            </tr>
          )}
          {rows.map((item) => (
            <tr key={item.id} className="invoice-preview__row">
              <td data-label="Description">{item.description}</td>
              <td data-label="Qty">{item.quantity}</td>
              <td data-label="Unit">{toMoney(item.unitPrice)}</td>
              <td data-label="Amount">{toMoney(lineAmount(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals invoice-preview__totals">
        <p>
          <span>Subtotal</span>
          <span>{toMoney(sub)}</span>
        </p>
        <p>
          <span>Tax ({invoice.taxRate.toFixed(1)}%)</span>
          <span>{toMoney(tax)}</span>
        </p>
        <p>
          <span>Discount ({invoice.discountRate.toFixed(1)}%)</span>
          <span>-{toMoney(discount)}</span>
        </p>
        <p className="total-line">
          <span>Total</span>
          <strong>{toMoney(total)}</strong>
        </p>
      </div>

      <footer className="invoice-preview__notes">
        <strong>Notes</strong>
        <p>{invoice.notes || 'No notes provided.'}</p>
      </footer>
    </article>
  )
}

export default InvoicePreview
