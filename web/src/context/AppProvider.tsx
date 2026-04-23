import { useState, useCallback, useMemo, type ReactNode } from 'react'
import type { ApiInvoiceEvent } from '../api'
import { api } from '../api'
import { fromApiInvoice } from '../app/transformers'
import type { DashboardSummaryState, DataMode } from '../app/types'
import { persistWorkspacePreferences, readStoredWorkspacePreferences } from '../app/workspacePreferences'
import { AppContext } from './AppContext'
import { useToast } from './useToast'
import { useClients } from './useClients'
import { useDashboard } from './useDashboard'
import { useBuilder } from './useBuilder'
import { useBusinessSettings } from './useBusinessSettings'
import { useSend } from './useSend'
import { useInvoices } from './useInvoices'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  // Mode state
  const [mode, setMode] = useState<DataMode>('connected')
  
  // Loading state
  const [loadingInitial, setLoadingInitial] = useState(true)
  
  // Action busy state
  const [actionBusy, setActionBusy] = useState(false)
  
  // API Banner
  const [apiBanner, setApiBanner] = useState<string | null>(null)
  
  // Pro state
  const [isPro, setIsProState] = useState(() => readStoredWorkspacePreferences().isPro)
  const setIsPro = useCallback((nextIsPro: boolean) => {
    persistWorkspacePreferences({ isPro: nextIsPro })
    setIsProState(nextIsPro)
  }, [])
  const togglePro = useCallback(() => {
    setIsProState((currentValue) => {
      const nextValue = !currentValue
      persistWorkspacePreferences({ isPro: nextValue })
      return nextValue
    })
  }, [])
  
  // Dashboard summary
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryState | null>(null)
  
  // Compose hooks
  const toast = useToast()
  const clients = useClients()
  const invoices = useInvoices()
  const builder = useBuilder()
  const businessSettings = useBusinessSettings()
  const send = useSend()
  
  const dashboard = useDashboard({
    invoices: invoices.invoices,
    dashboardSummary,
    mode,
  })
  
  // API refresh
  const refreshFromApi = useCallback(async () => {
    const [summary, clientRows, invoiceIds] = await Promise.all([
      api.getDashboardSummary(),
      api.listClients(),
      api.listInvoiceIds(),
    ])

    const clientById = new Map(clientRows.map((client) => [client.id, client]))
    const hydratedInvoices = await Promise.all(
      invoiceIds.map(async (invoiceId) => {
        const [invoice, events] = await Promise.all([
          api.getInvoice(invoiceId),
          api.getInvoiceEvents(invoiceId).catch((): ApiInvoiceEvent[] => []),
        ])
        return fromApiInvoice(invoice, clientById.get(invoice.client_id), events)
      }),
    )

    setMode('connected')
    setApiBanner(null)
    setDashboardSummary({
      unpaid: summary.unpaid,
      overdue: summary.overdue,
      paidThisMonth: summary.paidThisMonth,
      draftCount: summary.draft,
    })
    clients.setAllClients(clientRows)
    invoices.setAllInvoices(hydratedInvoices)
  }, [clients, invoices])
  
  const value = useMemo(
    () => ({
      mode,
      setMode,
      loadingInitial,
      setLoadingInitial,
      actionBusy,
      setActionBusy,
      apiBanner,
      setApiBanner,
      isPro,
      setIsPro,
      togglePro,
      dashboardSummary,
      setDashboardSummary,
      toast,
      clients,
      dashboard,
      builder,
      businessSettings,
      send,
      invoices,
      refreshFromApi,
    }),
    [
      mode,
      loadingInitial,
      actionBusy,
      apiBanner,
      isPro,
      togglePro,
      dashboardSummary,
      toast,
      clients,
      dashboard,
      builder,
      businessSettings,
      send,
      invoices,
      refreshFromApi,
    ],
  )
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
