import { useState, useCallback, useMemo } from 'react'
import type { Invoice } from '../app/types'
import { fallbackInvoices } from '../app/fallbackData'
import { compareDateValues, pushEvent, timestampNow } from '../app/invoiceUtils'

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>(fallbackInvoices)

  const sortedInvoices = useMemo(
    () => [...invoices].sort((a, b) => compareDateValues(b.updatedAt, a.updatedAt)),
    [invoices],
  )

  const addInvoice = useCallback((invoice: Invoice) => {
    setInvoices((rows) => [invoice, ...rows])
  }, [])

  const updateInvoice = useCallback((invoiceId: string, updates: Partial<Invoice>) => {
    setInvoices((rows) =>
      rows.map((row) =>
        row.id === invoiceId
          ? {
              ...row,
              ...updates,
              updatedAt: timestampNow(),
              version: row.version + 1,
              events: pushEvent(row, 'Invoice updated', 'updated'),
            }
          : row,
      ),
    )
  }, [])

  const markAsSent = useCallback((invoiceId: string) => {
    setInvoices((rows) =>
      rows.map((row) =>
        row.id === invoiceId
          ? {
              ...row,
              status: 'Sent',
              sentAt: row.sentAt ?? timestampNow(),
              updatedAt: timestampNow(),
              version: row.version + 1,
              events: pushEvent(row, 'Invoice marked as sent'),
            }
          : row,
      ),
    )
  }, [])

  const markAsPaid = useCallback((invoiceId: string) => {
    setInvoices((rows) =>
      rows.map((row) =>
        row.id === invoiceId
          ? {
              ...row,
              status: 'Paid',
              paidAt: timestampNow(),
              updatedAt: timestampNow(),
              version: row.version + 1,
              events: pushEvent(row, 'Payment recorded'),
            }
          : row,
      ),
    )
  }, [])

  const markAsVoid = useCallback((invoiceId: string) => {
    setInvoices((rows) =>
      rows.map((row) =>
        row.id === invoiceId
          ? {
              ...row,
              status: 'Void',
              voidedAt: timestampNow(),
              updatedAt: timestampNow(),
              version: row.version + 1,
              events: pushEvent(row, 'Invoice voided'),
            }
          : row,
      ),
    )
  }, [])

  const recordSend = useCallback((invoiceId: string) => {
    setInvoices((rows) =>
      rows.map((row) =>
        row.id === invoiceId
          ? {
              ...row,
              status: row.status === 'Draft' ? 'Sent' : row.status,
              sentAt: row.sentAt ?? timestampNow(),
              updatedAt: timestampNow(),
              version: row.version + 1,
              events: pushEvent(row, 'Invoice sent'),
            }
          : row,
      ),
    )
  }, [])

  const setAllInvoices = useCallback((newInvoices: Invoice[]) => {
    setInvoices(newInvoices)
  }, [])

  return {
    invoices,
    sortedInvoices,
    addInvoice,
    updateInvoice,
    markAsSent,
    markAsPaid,
    markAsVoid,
    recordSend,
    setAllInvoices,
  }
}
