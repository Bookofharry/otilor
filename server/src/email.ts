import { Resend } from 'resend'

export interface SendInvoiceEmailOptions {
  to: string
  subject: string
  message: string
  invoiceNumber: string
  clientName: string
  amount: string
  dueDate: string
  sendCopyToMe?: boolean
}

export interface EmailDeliveryResult {
  provider_message_id: string
  state: 'sent' | 'queued' | 'simulated'
  error?: string
}

function buildInvoiceHtmlTemplate({
  invoiceNumber,
  clientName,
  amount,
  dueDate,
  message,
}: Omit<SendInvoiceEmailOptions, 'to' | 'subject'>): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { font-size: 24px; font-weight: 700; color: #0b6bff; margin-bottom: 24px; }
    .card { background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .label { color: #64748b; font-weight: 500; }
    .value { font-weight: 600; color: #0f172a; }
    .amount { font-size: 22px; font-weight: 700; color: #2563eb; }
    .message-box { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px; white-space: pre-wrap; }
    .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Otilor Invoice</div>
    <p>Hi ${clientName},</p>
    <div class="message-box">${message}</div>
    
    <div class="card">
      <div class="row">
        <span class="label">Invoice Number</span>
        <span class="value">${invoiceNumber}</span>
      </div>
      <div class="row">
        <span class="label">Due Date</span>
        <span class="value">${dueDate}</span>
      </div>
      <div class="row" style="margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
        <span class="label" style="align-self: center;">Total Due</span>
        <span class="amount">${amount}</span>
      </div>
    </div>

    <p style="font-size: 14px; color: #475569;">If you have any questions regarding this invoice, please reply directly to this email.</p>
    
    <div class="footer">
      Sent with Otilor Invoicing &bull; Modern web-first invoicing
    </div>
  </div>
</body>
</html>`
}

export async function sendInvoiceEmail(options: SendInvoiceEmailOptions): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  if (apiKey) {
    try {
      const resend = new Resend(apiKey)
      const htmlContent = buildInvoiceHtmlTemplate(options)

      const recipients = [options.to]
      if (options.sendCopyToMe && process.env.RESEND_COPY_TO_EMAIL) {
        recipients.push(process.env.RESEND_COPY_TO_EMAIL)
      }

      const response = await resend.emails.send({
        from: `Otilor Invoices <${fromEmail}>`,
        to: recipients,
        subject: options.subject,
        html: htmlContent,
      })

      if (response.error) {
        console.error('[Resend Error]', response.error)
        return {
          provider_message_id: `err_${Date.now()}`,
          state: 'queued',
          error: response.error.message,
        }
      }

      return {
        provider_message_id: response.data?.id || `resend_${Date.now()}`,
        state: 'sent',
      }
    } catch (err) {
      console.error('[Resend Exception]', err)
      return {
        provider_message_id: `err_${Date.now()}`,
        state: 'queued',
        error: err instanceof Error ? err.message : 'Unknown Resend error',
      }
    }
  }

  // Simulated fallback mode when RESEND_API_KEY is not set
  console.log(`[Email Service (Simulated)] Sending email to ${options.to}:`, {
    subject: options.subject,
    invoiceNumber: options.invoiceNumber,
  })

  return {
    provider_message_id: `sim_msg_${Math.random().toString(36).substring(2, 9)}`,
    state: 'simulated',
  }
}
