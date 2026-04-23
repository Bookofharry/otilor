import type { InvoiceStatus } from '../api'

export type { InvoiceStatus }

export type ToastTone = 'success' | 'error' | 'info'
export type DataMode = 'connected' | 'fallback'
export type InvoiceEventType = 'created' | 'updated' | 'sent' | 'paid' | 'voided' | 'reminder_sent' | 'viewed'

export interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export interface InvoiceEvent {
  id: string
  type: InvoiceEventType
  label: string
  at: string
  actor?: string | null
}

export interface Invoice {
  id: string
  clientId: string
  number: string
  clientName: string
  clientEmail: string
  issueDate: string
  dueDate: string
  notes: string
  taxRate: number
  discountRate: number
  items: LineItem[]
  status: InvoiceStatus
  sentAt: string | null
  paidAt: string | null
  voidedAt: string | null
  version: number
  events: InvoiceEvent[]
  createdAt: string
  updatedAt: string
}

export interface BuilderForm {
  clientId: string
  clientName: string
  clientEmail: string
  issueDate: string
  dueDate: string
  notes: string
  taxRate: number
  discountRate: number
  items: LineItem[]
}

export interface SendForm {
  to: string
  subject: string
  message: string
  attachPdf: boolean
  sendCopyToMe: boolean
}

export interface ToastState {
  tone: ToastTone
  message: string
}

export interface DashboardMetrics {
  unpaid: number
  overdue: number
  paid: number
}

export interface DashboardSummaryState {
  unpaid: number
  overdue: number
  paidThisMonth: number
  draftCount: number
}

export interface ApiInvoicePayload {
  client_id: string
  issue_date: string
  due_date: string
  line_items: Array<{ description: string; quantity: string; unit_price: string }>
  tax?: { name: string; rate_percent: string }
  discount?: { type: 'percent'; value: string }
  notes?: string
}

export type RecurrenceInterval = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

export interface RecurringInvoice {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  items: LineItem[]
  taxRate: number
  discountRate: number
  notes: string
  interval: RecurrenceInterval
  startDate: string
  endDate: string | null
  nextInvoiceDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}
