interface TopbarProps {
  onCreate: () => void
  onLogout?: () => void
}

function Topbar({ onCreate, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <h1 className="topbar-title">Otilor</h1>
        <span className="topbar-badge">Beta</span>
      </div>
      <div className="topbar-actions">
        <button className="btn btn--primary btn--sm" type="button" onClick={onCreate}>
          Create Invoice
        </button>
        {onLogout && (
          <button className="btn btn--ghost btn--icon" type="button" onClick={onLogout} aria-label="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}

export default Topbar
