import type { ApiInvoiceEvent } from '../api'
import { readStoredBusinessSettings } from './businessSettings'
import { getInvoiceIssuerProfile } from './invoiceIssuer'
import type {
  ApiInvoicePayload,
  BuilderForm,
  Invoice,
  InvoiceEvent,
  InvoiceEventType,
  InvoiceStatus,
  LineItem,
} from './types'

export const CURRENCY = 'NGN' // Nigerian Naira
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
export const EMAIL_REGEX = /\S+@\S+\.\S+/

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const padDateSegment = (value: number): string => String(value).padStart(2, '0')

const atLocalNoon = (daysOffset = 0): Date => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + daysOffset)
  return date
}

export const toDateOnly = (date: Date): string =>
  `${date.getFullYear()}-${padDateSegment(date.getMonth() + 1)}-${padDateSegment(date.getDate())}`

export const timestampNow = (): string => new Date().toISOString()
export const today = (): string => toDateOnly(new Date())
export const inDays = (days: number): string => toDateOnly(atLocalNoon(days))
export const timestampInDays = (days: number): string => atLocalNoon(days).toISOString()

export const toMoney = (value: number): string =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)

export const parseAmount = (value: string | undefined): number => {
  const parsed = Number(value ?? '0')
  return Number.isFinite(parsed) ? parsed : 0
}

export const parseDateValue = (dateValue: string): Date | null => {
  if (!dateValue) return null

  if (DATE_ONLY_PATTERN.test(dateValue)) {
    const [year, month, day] = dateValue.split('-').map(Number)
    const parsed = new Date(year, month - 1, day)
    const isValid =
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day

    return isValid ? parsed : null
  }

  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

export const toDisplayDate = (dateValue: string): string => {
  const parsed = parseDateValue(dateValue)
  if (!parsed) return dateValue
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const compareDateValues = (left: string, right: string): number => {
  const leftDate = parseDateValue(left)
  const rightDate = parseDateValue(right)

  if (leftDate && rightDate) {
    return leftDate.getTime() - rightDate.getTime()
  }

  if (leftDate) return 1
  if (rightDate) return -1
  return left.localeCompare(right)
}

export const isSameMonth = (dateValue: string, referenceDate = new Date()): boolean => {
  const parsed = parseDateValue(dateValue)
  if (!parsed) return false

  return (
    parsed.getFullYear() === referenceDate.getFullYear() &&
    parsed.getMonth() === referenceDate.getMonth()
  )
}

export const lineAmount = (item: LineItem): number => item.quantity * item.unitPrice
export const subtotal = (items: LineItem[]): number => items.reduce((sum, item) => sum + lineAmount(item), 0)
export const taxAmount = (sub: number, rate: number): number => (sub * rate) / 100
export const discountAmount = (sub: number, rate: number): number => (sub * rate) / 100
export const totalAmount = (items: LineItem[], taxRate: number, discountRate: number): number => {
  const sub = subtotal(items)
  return sub + taxAmount(sub, taxRate) - discountAmount(sub, discountRate)
}

export const statusTone = (status: InvoiceStatus): string => {
  if (status === 'Draft') return 'neutral'
  if (status === 'Sent') return 'info'
  if (status === 'Overdue') return 'warning'
  if (status === 'Paid') return 'success'
  return 'critical'
}

export const withOverdueStatus = (invoice: Invoice): InvoiceStatus => {
  if (invoice.status !== 'Sent') return invoice.status
  return invoice.dueDate < today() ? 'Overdue' : 'Sent'
}

export const eventLabel = (type: ApiInvoiceEvent['type']): string => {
  if (type === 'invoice_created') return 'Invoice created'
  if (type === 'invoice_updated') return 'Invoice updated'
  if (type === 'invoice_marked_sent') return 'Invoice marked as sent'
  if (type === 'invoice_sent_email') return 'Invoice sent'
  if (type === 'invoice_marked_paid') return 'Payment recorded'
  return 'Invoice voided'
}

export const eventTypeFromApiType = (type: ApiInvoiceEvent['type']): InvoiceEventType => {
  if (type === 'invoice_created') return 'created'
  if (type === 'invoice_updated') return 'updated'
  if (type === 'invoice_marked_sent' || type === 'invoice_sent_email') return 'sent'
  if (type === 'invoice_marked_paid') return 'paid'
  return 'voided'
}

export const eventTypeFromLabel = (label: string): InvoiceEventType => {
  const normalizedLabel = label.trim().toLowerCase()

  if (normalizedLabel.includes('created')) return 'created'
  if (normalizedLabel.includes('updated')) return 'updated'
  if (normalizedLabel.includes('paid') || normalizedLabel.includes('payment')) return 'paid'
  if (normalizedLabel.includes('void')) return 'voided'
  if (normalizedLabel.includes('view')) return 'viewed'
  if (normalizedLabel.includes('reminder')) return 'reminder_sent'
  return 'sent'
}

export const normalizeItems = (items: LineItem[]): LineItem[] =>
  items
    .map((item) => ({
      ...item,
      description: item.description.trim(),
      quantity: Number.isFinite(item.quantity) ? item.quantity : 0,
      unitPrice: Number.isFinite(item.unitPrice) ? item.unitPrice : 0,
    }))
    .filter((item) => item.description.length > 0 && item.quantity > 0)

export const emptyBuilder = (): BuilderForm => {
  const settings = readStoredBusinessSettings()

  return {
    clientId: '',
    clientName: '',
    clientEmail: '',
    issueDate: today(),
    dueDate: inDays(settings.defaultPaymentTermsDays),
    notes: settings.defaultNotes,
    taxRate: settings.defaultTaxRate,
    discountRate: settings.defaultDiscountRate,
    items: [{ id: crypto.randomUUID(), description: '', quantity: 0, unitPrice: 0 }],
  }
}

export const toBuilder = (invoice: Invoice): BuilderForm => ({
  clientId: invoice.clientId,
  clientName: invoice.clientName,
  clientEmail: invoice.clientEmail,
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate,
  notes: invoice.notes,
  taxRate: invoice.taxRate,
  discountRate: invoice.discountRate,
  items: invoice.items.map((item) => ({ ...item })),
})

export const sendTemplate = (clientName: string): string =>
  `Hi ${clientName || 'there'},\n\nPlease find attached your invoice from ${getInvoiceIssuerProfile().name}.\n\nBest regards,\n${getInvoiceIssuerProfile().name}`

export const paymentNotificationTemplate = (clientName: string, invoiceNumber: string, amount: string): string =>
      `Hi ${clientName || 'there'},\n\nGreat news! We've received your payment of ${amount} for invoice ${invoiceNumber}.\n\nThank you for your business!\n\nBest regards,\n${getInvoiceIssuerProfile().name}`

export const nextInvoiceNumber = (invoices: Invoice[]): string => {
  const maxSerial = invoices.reduce((max, invoice) => {
    const serial = Number(invoice.number.match(/(\d+)$/)?.[1] ?? '0')
    return Math.max(max, serial)
  }, 0)

  const year = new Date().getFullYear()
  return `INV-${year}-${String(maxSerial + 1).padStart(4, '0')}`
}

export const pushEvent = (
  invoice: Invoice,
  label: string,
  type: InvoiceEventType = eventTypeFromLabel(label),
): InvoiceEvent[] => [
  { id: crypto.randomUUID(), type, label, at: timestampNow() },
  ...invoice.events,
]

export const validateBuilder = (form: BuilderForm): string | null => {
  if (!form.clientName.trim()) return 'Client name is required.'
  if (form.clientEmail.trim() && !EMAIL_REGEX.test(form.clientEmail.trim())) {
    return 'Client email is invalid.'
  }
  if (form.dueDate < form.issueDate) return 'Due date cannot be before issue date.'
  if (normalizeItems(form.items).length === 0) {
    return 'Add at least one line item with description and quantity.'
  }
  return null
}

export const toInvoicePayload = (
  form: BuilderForm,
  clientId: string,
  items: LineItem[],
): ApiInvoicePayload => {
  const payload: ApiInvoicePayload = {
    client_id: clientId,
    issue_date: form.issueDate,
    due_date: form.dueDate,
    line_items: items.map((item) => ({
      description: item.description,
      quantity: item.quantity.toFixed(2),
      unit_price: item.unitPrice.toFixed(2),
    })),
  }

  if (form.taxRate > 0) {
    payload.tax = {
      name: 'Tax',
      rate_percent: form.taxRate.toFixed(2),
    }
  }

  if (form.discountRate > 0) {
    payload.discount = {
      type: 'percent',
      value: form.discountRate.toFixed(2),
    }
  }

  if (form.notes.trim()) {
    payload.notes = form.notes.trim()
  }

  return payload
}
