interface LandingHeroSectionProps {
  onStartFree: () => void
}

function LandingHeroSection({ onStartFree }: LandingHeroSectionProps) {
  return (
    <section className="landing-hero">
      <div className="landing-hero-container">
        <div className="landing-hero-copy">
          <h1 className="landing-hero-title">
            Invoicing that finally feels <span className="landing-text-gradient">effortless</span>
          </h1>

          <p className="landing-hero-subtitle">
            Create polished invoices in seconds, send them from any device, and get paid faster with less back-and-forth.
          </p>
        </div>

        <div className="landing-hero-buttons">
          <button className="landing-btn-primary" type="button" onClick={onStartFree}>
            Start Free
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="landing-btn-secondary" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download App
          </button>
        </div>

        <div className="landing-hero-trust">
          <div className="landing-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
            No credit card required
          </div>
          <div className="landing-trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
            Free forever plan
          </div>
        </div>

        <div className="landing-hero-preview">
          <div className="landing-preview-card">
            <div className="landing-preview-header">
              <div className="landing-preview-badge">Payment Received</div>
              <div className="landing-preview-time">Just now</div>
            </div>
            <div className="landing-preview-invoice">
              <div className="landing-preview-label">INVOICE</div>
              <div className="landing-preview-number">INV-2024-001</div>
              <div className="landing-preview-row">
                <span>Issue Date</span>
                <span>Feb 15, 2024</span>
              </div>
              <div className="landing-preview-row">
                <span>Due Date</span>
                <span>Feb 22, 2024</span>
              </div>
              <div className="landing-preview-divider" />
              <div className="landing-preview-row landing-preview-total">
                <span>Total</span>
                <span>{'\u20A6'}500,000.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingHeroSection
