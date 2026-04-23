import { createContext } from 'react'
import type { DashboardSummaryState, DataMode } from '../app/types'
import type { useToast } from './useToast'
import type { useClients } from './useClients'
import type { useDashboard } from './useDashboard'
import type { useBuilder } from './useBuilder'
import type { useBusinessSettings } from './useBusinessSettings'
import type { useSend } from './useSend'
import type { useInvoices } from './useInvoices'

export interface AppContextValue {
  // Mode
  mode: DataMode
  setMode: (mode: DataMode) => void
  
  // Loading
  loadingInitial: boolean
  setLoadingInitial: (loading: boolean) => void
  
  // Action busy state
  actionBusy: boolean
  setActionBusy: (busy: boolean) => void
  
  // API Banner
  apiBanner: string | null
  setApiBanner: (banner: string | null) => void
  
  // Pro state
  isPro: boolean
  setIsPro: (isPro: boolean) => void
  togglePro: () => void
  
  // Dashboard summary
  dashboardSummary: DashboardSummaryState | null
  setDashboardSummary: (summary: DashboardSummaryState | null) => void
  
  // Toast
  toast: ReturnType<typeof useToast>
  
  // Clients
  clients: ReturnType<typeof useClients>
  
  // Dashboard
  dashboard: ReturnType<typeof useDashboard>
  
  // Builder
  builder: ReturnType<typeof useBuilder>

  // Business settings
  businessSettings: ReturnType<typeof useBusinessSettings>
  
  // Send
  send: ReturnType<typeof useSend>
  
  // Invoices
  invoices: ReturnType<typeof useInvoices>
  
  // API operations
  refreshFromApi: () => Promise<void>
}

export const AppContext = createContext<AppContextValue | null>(null)
