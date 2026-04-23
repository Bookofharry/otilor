import { useMemo } from 'react'
import type { Invoice, DashboardMetrics, DashboardSummaryState } from '../app/types'
import { isSameMonth, totalAmount, withOverdueStatus } from '../app/invoiceUtils'

interface UseDashboardProps {
  invoices: Invoice[]
  dashboardSummary: DashboardSummaryState | null
  mode: 'connected' | 'fallback'
}

export function useDashboard({ invoices, dashboardSummary, mode }: UseDashboardProps) {
  const metrics = useMemo<DashboardMetrics>(() => {
    if (mode === 'connected' && dashboardSummary) {
      return {
        unpaid: dashboardSummary.unpaid,
        overdue: dashboardSummary.overdue,
        paid: dashboardSummary.paidThisMonth,
      }
    }

    return invoices.reduce<DashboardMetrics>(
      (acc, invoice) => {
        const status = withOverdueStatus(invoice)
        const total = totalAmount(invoice.items, invoice.taxRate, invoice.discountRate)

        if (status === 'Sent' || status === 'Overdue') acc.unpaid += total
        if (status === 'Overdue') acc.overdue += 1
        if (status === 'Paid' && invoice.paidAt && isSameMonth(invoice.paidAt)) acc.paid += total

        return acc
      },
      { unpaid: 0, overdue: 0, paid: 0 },
    )
  }, [mode, dashboardSummary, invoices])

  const draftCount = useMemo(() => {
    if (mode === 'connected' && dashboardSummary) {
      return dashboardSummary.draftCount
    }

    return invoices.filter((invoice) => withOverdueStatus(invoice) === 'Draft').length
  }, [mode, dashboardSummary, invoices])

  return {
    metrics,
    draftCount,
  }
}
