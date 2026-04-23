import { getInvoiceIssuerContactLines, getInvoiceIssuerProfile } from './invoiceIssuer'
import type { Invoice } from './types'

export function openInvoicePrintWindow(invoice: Invoice): boolean {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    return false
  }

  printWindow.document.write(generateInvoiceHtml(invoice))
  printWindow.document.close()
  printWindow.print()
  return true
}

function generateInvoiceHtml(invoice: Invoice): string {
  const issuerProfile = getInvoiceIssuerProfile()
  const issuerDetails = getInvoiceIssuerContactLines()
    .map((line) => `<div class="party-line">${line}</div>`)
    .join('')
  const itemsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align: center">${item.quantity}</td>
        <td style="text-align: right">$${item.unitPrice.toFixed(2)}</td>
        <td style="text-align: right">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
      </tr>
    `,
    )
    .join('')

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const discount = subtotal * (invoice.discountRate / 100)
  const taxable = subtotal - discount
  const tax = taxable * (invoice.taxRate / 100)
  const total = taxable + tax

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.number}</title>
      <style>
        body { font-family: 'Delius', 'Segoe UI', cursive, sans-serif; padding: 40px; }
        h1 { color: #1e40af; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 28px; }
        .meta { text-align: right; }
        .parties { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin: 24px 0; }
        .party { padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
        .party-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 8px; }
        .party-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
        .party-line { color: #475569; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; text-align: left; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { padding: 8px 0; }
        .grand-total { font-size: 1.25em; font-weight: bold; color: #1e40af; }
        .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Invoice ${invoice.number}</h1>
          <div><strong>From:</strong> ${issuerProfile.name}</div>
        </div>
        <div class="meta">
          <div><strong>Date:</strong> ${invoice.issueDate}</div>
          <div><strong>Due:</strong> ${invoice.dueDate}</div>
        </div>
      </div>

      <div class="parties">
        <div class="party">
          <div class="party-label">Bill From</div>
          <div class="party-name">${issuerProfile.name}</div>
          ${issuerDetails || '<div class="party-line">Billing details not configured</div>'}
        </div>
        <div class="party">
          <div class="party-label">Bill To</div>
          <div class="party-name">${invoice.clientName}</div>
          <div class="party-line">${invoice.clientEmail || 'No email provided'}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: center">Qty</th>
            <th style="text-align: right">Unit Price</th>
            <th style="text-align: right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">Subtotal: $${subtotal.toFixed(2)}</div>
        ${invoice.discountRate > 0 ? `<div class="total-row">Discount (${invoice.discountRate}%): -$${discount.toFixed(2)}</div>` : ''}
        ${invoice.taxRate > 0 ? `<div class="total-row">Tax (${invoice.taxRate}%): $${tax.toFixed(2)}</div>` : ''}
        <div class="total-row grand-total">Total: $${total.toFixed(2)}</div>
      </div>

      <div class="footer">
        Questions about this invoice? Contact ${issuerProfile.name}${issuerProfile.email ? ` at ${issuerProfile.email}` : ''}.
      </div>
    </body>
    </html>
  `
}
