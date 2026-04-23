type ActiveNav = 'dashboard' | 'invoices' | 'builder' | 'clients' | 'settings'

interface AppNavigationProps {
  activeNav: ActiveNav
  isPro: boolean
  onTogglePro: () => void
  onGoDashboard: () => void
  onGoInvoices: () => void
  onGoCreate: () => void
  onGoClients: () => void
  onGoSettings: () => void
  onLogout?: () => void
}

function AppNavigation({
  activeNav,
  isPro,
  onTogglePro,
  onGoDashboard,
  onGoInvoices,
  onGoCreate,
  onGoClients,
  onGoSettings,
  onLogout,
}: AppNavigationProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <img src="/otilor.png" alt="Otilor" style={{ height: '32px', width: 'auto' }} />
        </div>

        <nav className="nav-stack">
          <button
            className={`nav-button ${activeNav === 'dashboard' ? 'is-active' : ''}`}
            type="button"
            onClick={onGoDashboard}
          >
            Dashboard
          </button>
          <button
            className={`nav-button ${activeNav === 'invoices' ? 'is-active' : ''}`}
            type="button"
            onClick={onGoInvoices}
          >
            Invoices
          </button>
          <button 
            className={`nav-button ${activeNav === 'builder' ? 'is-active' : ''}`} 
            type="button" 
            onClick={onGoCreate}
          >
            Create Invoice
          </button>
          <button
            className={`nav-button ${activeNav === 'clients' ? 'is-active' : ''}`}
            type="button"
            onClick={onGoClients}
          >
            Clients
          </button>
          <button
            className={`nav-button ${activeNav === 'settings' ? 'is-active' : ''}`}
            type="button"
            onClick={onGoSettings}
          >
            Settings
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{isPro ? 'Pro Active' : 'Free Plan'}</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
            {isPro ? 'Automation enabled for one-click email sending.' : 'Upgrade to send invoices automatically.'}
          </p>
          <button 
            className="btn btn--secondary btn--sm" 
            type="button" 
            onClick={onTogglePro}
            style={{ width: '100%' }}
          >
            {isPro ? 'Switch to Free (Demo)' : 'Enable Pro (Demo)'}
          </button>
        </div>

        {onLogout && (
          <button 
            className="nav-button" 
            type="button" 
            onClick={onLogout}
            style={{ marginTop: '1rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <button 
          type="button" 
          className={`mobile-nav-button ${activeNav === 'dashboard' ? 'is-active' : ''}`} 
          onClick={onGoDashboard}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </button>
        <button
          type="button"
          className={`mobile-nav-button ${activeNav === 'invoices' ? 'is-active' : ''}`}
          onClick={onGoInvoices}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Invoices
        </button>
        <button 
          type="button" 
          className={`mobile-nav-button ${activeNav === 'builder' ? 'is-active' : ''}`} 
          onClick={onGoCreate}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New
        </button>
        <button
          type="button"
          className={`mobile-nav-button ${activeNav === 'clients' ? 'is-active' : ''}`}
          onClick={onGoClients}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Clients
        </button>
        <button
          type="button"
          className={`mobile-nav-button ${activeNav === 'settings' ? 'is-active' : ''}`}
          onClick={onGoSettings}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
          Settings
        </button>
      </nav>
    </>
  )
}

export default AppNavigation
