import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { getInvoiceIssuerContactLines, getInvoiceIssuerProfile } from './invoiceIssuer'
import type { Invoice } from './types'
import { toMoney, toDisplayDate, subtotal, taxAmount, discountAmount, lineAmount } from './invoiceUtils'

export async function generateInvoicePDF(invoice: Invoice): Promise<Blob> {
  // Create a temporary container for the invoice HTML
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '794px' // A4 width in pixels at 96 DPI
  container.style.background = '#ffffff'
  container.style.padding = '40px'
  container.style.fontFamily = "'Delius', 'Segoe UI', cursive, sans-serif"
  
  const sub = subtotal(invoice.items)
  const tax = taxAmount(sub, invoice.taxRate)
  const discount = discountAmount(sub, invoice.discountRate)
  const total = sub + tax - discount
  const rows = invoice.items.filter((item) => item.description.trim().length > 0)
  const issuerProfile = getInvoiceIssuerProfile()
  const issuerContactLines = getInvoiceIssuerContactLines()
  const issuerLinesHtml = issuerContactLines
    .map(
      (line) =>
        `<p style="font-size: 13px; color: #64748b; margin: 4px 0; line-height: 1.5;">${line}</p>`,
    )
    .join('')
  
  // Generate HTML content
  container.innerHTML = `
    <div style="max-width: 714px; margin: 0 auto;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #e2e8f0;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">${issuerProfile.name}</h1>
              <p style="font-size: 12px; color: #64748b; margin: 0;">Fast billing with zero confusion</p>
            </div>
          </div>
          ${issuerLinesHtml}
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 32px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">INVOICE</h2>
          <p style="font-size: 18px; font-weight: 600; color: #3b82f6; margin: 0;">${invoice.number}</p>
        </div>
      </div>

      <!-- Bill From / Bill To / Dates -->
      <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 24px; margin-bottom: 40px; align-items: flex-start;">
        <div style="padding: 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <p style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0;">Bill From</p>
          <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">${issuerProfile.name}</h3>
          ${issuerLinesHtml || `<p style="font-size: 14px; color: #64748b; margin: 0;">Billing details not configured</p>`}
        </div>
        <div style="padding: 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
          <p style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0;">Bill To</p>
          <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">${invoice.clientName}</h3>
          <p style="font-size: 14px; color: #64748b; margin: 0;">${invoice.clientEmail || 'No email provided'}</p>
        </div>
        <div style="text-align: right; min-width: 160px;">
          <div style="margin-bottom: 12px;">
            <p style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Issue Date</p>
            <p style="font-size: 14px; color: #0f172a; margin: 0; font-weight: 500;">${toDisplayDate(invoice.issueDate)}</p>
          </div>
          <div style="margin-bottom: 12px;">
            <p style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Due Date</p>
            <p style="font-size: 14px; color: #0f172a; margin: 0; font-weight: 500;">${toDisplayDate(invoice.dueDate)}</p>
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 11px 14px; text-align: left; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0;">Description</th>
            <th style="padding: 11px 14px; text-align: center; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; width: 80px;">Qty</th>
            <th style="padding: 11px 14px; text-align: right; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; width: 120px;">Unit Price</th>
            <th style="padding: 11px 14px; text-align: right; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; width: 120px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows.length === 0 ? `
            <tr>
              <td colspan="4" style="padding: 24px 16px; text-align: center; color: #94a3b8; font-size: 14px; border-bottom: 1px solid #e2e8f0;">No line items</td>
            </tr>
          ` : rows.map(item => `
            <tr>
              <td style="padding: 13px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12.5px; color: #0f172a; line-height: 1.45;">${item.description}</td>
              <td style="padding: 13px 14px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #0f172a;">${item.quantity}</td>
              <td style="padding: 13px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 12px; color: #0f172a;">${toMoney(item.unitPrice)}</td>
              <td style="padding: 13px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 12px; color: #0f172a; font-weight: 500;">${toMoney(lineAmount(item))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Totals Section -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
        <div style="width: 300px; background: #f8fafc; padding: 24px; border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-size: 14px; color: #64748b;">Subtotal</span>
            <span style="font-size: 14px; color: #0f172a; font-weight: 500;">${toMoney(sub)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-size: 14px; color: #64748b;">Tax (${invoice.taxRate.toFixed(1)}%)</span>
            <span style="font-size: 14px; color: #0f172a; font-weight: 500;">${toMoney(tax)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span style="font-size: 14px; color: #64748b;">Discount (${invoice.discountRate.toFixed(1)}%)</span>
            <span style="font-size: 14px; color: #0f172a; font-weight: 500;">-${toMoney(discount)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 2px dashed #cbd5e1;">
            <span style="font-size: 16px; font-weight: 700; color: #0f172a;">Total</span>
            <span style="font-size: 20px; font-weight: 700; color: #3b82f6;">${toMoney(total)}</span>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      ${invoice.notes ? `
        <div style="margin-bottom: 40px; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <p style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0;">Notes</p>
          <p style="font-size: 14px; color: #334155; margin: 0; line-height: 1.5; white-space: pre-wrap;">${invoice.notes}</p>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">Thank you for your business!</p>
        <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">Questions? Contact ${issuerProfile.name}${issuerProfile.email ? ` at ${issuerProfile.email}` : ''}</p>
        <p style="font-size: 11px; color: #cbd5e1; margin: 0;">Prepared with Otilor</p>
      </div>
    </div>
  `
  
  document.body.appendChild(container)
  
  try {
    // Use html2canvas to capture the invoice
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    
    // Calculate PDF dimensions
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 10
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    
    // Return as blob
    const pdfBlob = pdf.output('blob')
    return pdfBlob
  } finally {
    document.body.removeChild(container)
  }
}
