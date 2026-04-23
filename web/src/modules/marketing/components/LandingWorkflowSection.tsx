function LandingWorkflowSection() {
  return (
    <section id="how-it-works" className="landing-steps">
      <div className="landing-steps-container">
        <div className="landing-steps-shell">
          <div className="landing-steps-heading">
            <span className="landing-steps-kicker">How it works</span>
            <h2 className="landing-section-title">Three steps to getting paid</h2>
            <p className="landing-section-subtitle">A clear three-step flow for creating, reviewing, and sending invoices.</p>
          </div>

          <div className="landing-steps-grid">
            <div className="landing-step">
              <div className="landing-step-top">
                <div className="landing-step-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
              <h3>Create</h3>
              <p>
                Add your work, set terms, and let <span className="brand-wordmark">Otilor</span> calculate totals automatically.
              </p>
            </div>
            <div className="landing-step">
              <div className="landing-step-top">
                <div className="landing-step-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <h3>Preview</h3>
              <p>Review a live, client-ready invoice. Edit anything before sending.</p>
            </div>
            <div className="landing-step">
              <div className="landing-step-top">
                <div className="landing-step-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
              <h3>Send</h3>
              <p>Deliver via email or share a link, and track when it's viewed.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingWorkflowSection
