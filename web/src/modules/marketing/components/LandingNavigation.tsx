interface LandingNavigationProps {
  mobileMenuOpen: boolean
  onToggleMenu: () => void
  onSectionSelect: (id: string) => void
  onSignIn: () => void
  onStartFree: () => void
}

function LandingNavigation({
  mobileMenuOpen,
  onToggleMenu,
  onSectionSelect,
  onSignIn,
  onStartFree,
}: LandingNavigationProps) {
  return (
    <nav className="landing-nav">
      <div className="landing-nav-container">
        <div className="landing-logo">
          <img src="/otilor.png" alt="Otilor" style={{ height: '32px', width: 'auto' }} />
        </div>

        <div className="landing-nav-links">
          <button type="button" onClick={() => onSectionSelect('features')}>
            Features
          </button>
          <button type="button" onClick={() => onSectionSelect('how-it-works')}>
            How it Works
          </button>
          <button type="button" onClick={() => onSectionSelect('testimonials')}>
            Testimonials
          </button>
          <button type="button" onClick={() => onSectionSelect('pricing')}>
            Pricing
          </button>
        </div>

        <div className="landing-nav-actions">
          <button className="landing-nav-signin" type="button" onClick={onSignIn}>
            Sign In
          </button>
          <button className="landing-nav-cta" type="button" onClick={onStartFree}>
            Start Free
          </button>
        </div>

        <button className="landing-mobile-menu-btn" type="button" onClick={onToggleMenu} aria-label="Toggle menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="landing-mobile-menu">
          <button type="button" onClick={() => onSectionSelect('features')}>
            Features
          </button>
          <button type="button" onClick={() => onSectionSelect('how-it-works')}>
            How it Works
          </button>
          <button type="button" onClick={() => onSectionSelect('testimonials')}>
            Testimonials
          </button>
          <button type="button" onClick={() => onSectionSelect('pricing')}>
            Pricing
          </button>
          <button type="button" onClick={onSignIn}>
            Sign In
          </button>
          <button className="landing-mobile-cta" type="button" onClick={onStartFree}>
            Start Free
          </button>
        </div>
      )}
    </nav>
  )
}

export default LandingNavigation
