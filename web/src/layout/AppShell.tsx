import { type ReactNode } from 'react'
import AppNavigation from './AppNavigation'
import Topbar from './Topbar'

interface AppShellProps {
  activeNav: 'dashboard' | 'invoices' | 'builder' | 'clients' | 'settings'
  isPro: boolean
  modeLabel: string
  onTogglePro: () => void
  onGoDashboard: () => void
  onGoInvoices: () => void
  onGoCreate: () => void
  onGoClients: () => void
  onGoSettings: () => void
  onLogout?: () => void
  children: ReactNode
}

export function AppShell({
  activeNav,
  isPro,
  modeLabel,
  onTogglePro,
  onGoDashboard,
  onGoInvoices,
  onGoCreate,
  onGoClients,
  onGoSettings,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      {/* Topbar - always visible */}
      <Topbar modeLabel={modeLabel} onCreate={onGoCreate} onLogout={onLogout} />

      {/* Navigation drawer */}
      <AppNavigation
        activeNav={activeNav}
        isPro={isPro}
        onTogglePro={onTogglePro}
        onGoDashboard={onGoDashboard}
        onGoInvoices={onGoInvoices}
        onGoCreate={onGoCreate}
        onGoClients={onGoClients}
        onGoSettings={onGoSettings}
        onLogout={onLogout}
      />

      {/* Main content area */}
      <main className="main-content" id="main-content">
        {children}
      </main>
    </div>
  )
}
