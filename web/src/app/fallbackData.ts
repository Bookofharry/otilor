import type { ApiClientSummary } from '../api'
import { inDays, timestampInDays } from './invoiceUtils'
import type { Invoice } from './types'

export const fallbackClients: ApiClientSummary[] = [
  { id: crypto.randomUUID(), name: 'Northline Studio', email: 'finance@northline.studio' },
  { id: crypto.randomUUID(), name: 'Belmont Kitchens', email: 'ap@belmontkitchens.co' },
]

export const fallbackInvoices: Invoice[] = [
  {
    id: crypto.randomUUID(),
    clientId: fallbackClients[0].id,
    number: 'INV-2026-0001',
    clientName: fallbackClients[0].name,
    clientEmail: fallbackClients[0].email ?? '',
    issueDate: inDays(-10),
    dueDate: inDays(4),
    notes: 'Net 14 terms.',
    taxRate: 7.5,
    discountRate: 0,
    items: [
      { id: crypto.randomUUID(), description: 'Brand sprint', quantity: 1, unitPrice: 1450 },
      { id: crypto.randomUUID(), description: 'Landing page build', quantity: 1, unitPrice: 1200 },
    ],
    status: 'Sent',
    sentAt: timestampInDays(-9),
    paidAt: null,
    voidedAt: null,
    version: 2,
    events: [
      { id: crypto.randomUUID(), type: 'created', label: 'Invoice created', at: timestampInDays(-10) },
      { id: crypto.randomUUID(), type: 'sent', label: 'Invoice sent', at: timestampInDays(-9) },
    ],
    createdAt: timestampInDays(-10),
    updatedAt: timestampInDays(-9),
  },
  {
    id: crypto.randomUUID(),
    clientId: fallbackClients[1].id,
    number: 'INV-2026-0002',
    clientName: fallbackClients[1].name,
    clientEmail: fallbackClients[1].email ?? '',
    issueDate: inDays(-30),
    dueDate: inDays(-18),
    notes: 'Thanks for your business.',
    taxRate: 0,
    discountRate: 0,
    items: [{ id: crypto.randomUUID(), description: 'Consulting retainer', quantity: 1, unitPrice: 2100 }],
    status: 'Paid',
    sentAt: timestampInDays(-29),
    paidAt: timestampInDays(-17),
    voidedAt: null,
    version: 4,
    events: [
      { id: crypto.randomUUID(), type: 'created', label: 'Invoice created', at: timestampInDays(-30) },
      { id: crypto.randomUUID(), type: 'sent', label: 'Invoice sent', at: timestampInDays(-29) },
      { id: crypto.randomUUID(), type: 'paid', label: 'Payment recorded', at: timestampInDays(-17) },
    ],
    createdAt: timestampInDays(-30),
    updatedAt: timestampInDays(-17),
  },
]
