interface TopbarProps {
  modeLabel: string
  onCreate: () => void
  onLogout?: () => void
}

function Topbar({ modeLabel, onCreate, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">Fast billing with zero confusion</h1>
        <p className="topbar-subtitle">{modeLabel}</p>
      </div>
      <div className="topbar-actions">
        <button className="btn btn--primary" type="button" onClick={onCreate}>
          Create Invoice
        </button>
        {onLogout && (
          <button className="btn btn--ghost" type="button" onClick={onLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        )}
      </div>
    </header>
  )
}

export default Topbar
