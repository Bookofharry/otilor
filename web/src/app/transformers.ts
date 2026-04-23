import { ApiError, type ApiClientSummary, type ApiInvoice, type ApiInvoiceEvent } from '../api'
import { eventLabel, eventTypeFromApiType, parseAmount } from './invoiceUtils'
import type { Invoice } from './types'

export const fromApiInvoice = (
  invoice: ApiInvoice,
  client: ApiClientSummary | undefined,
  events: ApiInvoiceEvent[],
): Invoice => ({
  id: invoice.id,
  clientId: invoice.client_id,
  number: invoice.number,
  clientName: client?.name ?? 'Unknown Client',
  clientEmail: client?.email ?? '',
  issueDate: invoice.issue_date,
  dueDate: invoice.due_date,
  notes: invoice.notes,
  taxRate: parseAmount(invoice.tax?.rate_percent),
  discountRate: invoice.discount?.type === 'percent' ? parseAmount(invoice.discount.value) : 0,
  items: invoice.line_items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: parseAmount(item.quantity),
    unitPrice: parseAmount(item.unit_price),
  })),
  status: invoice.status,
  sentAt: invoice.sent_at,
  paidAt: invoice.paid_at,
  voidedAt: invoice.voided_at,
  version: invoice.version,
  events: events.map((event) => ({
    id: event.id,
    type: eventTypeFromApiType(event.type),
    label: eventLabel(event.type),
    at: event.occurred_at,
    actor: event.actor,
  })),
  createdAt: invoice.created_at,
  updatedAt: invoice.updated_at,
})

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    const field = error.fieldErrors[0]?.message
    return field ? `${error.message} ${field}` : error.message
  }
  if (error instanceof Error) return error.message
  return 'Unexpected error.'
}
