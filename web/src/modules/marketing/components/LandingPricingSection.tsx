interface LandingPricingSectionProps {
  onSignIn: () => void
  onStartFree: () => void
}

function LandingPricingSection({ onSignIn, onStartFree }: LandingPricingSectionProps) {
  return (
    <>
      <section id="pricing" className="landing-pricing">
        <div className="landing-pricing-container">
          <h2 className="landing-section-title">Simple, transparent pricing</h2>
          <p className="landing-section-subtitle">Start free, upgrade when you need more power.</p>

          <div className="landing-pricing-grid">
            <div className="landing-pricing-card">
              <div className="landing-pricing-header">
                <h3>Free</h3>
                <p>Perfect for getting started</p>
              </div>
              <div className="landing-pricing-price">
                <span className="landing-pricing-currency">{'\u20A6'}</span>
                <span className="landing-pricing-amount">0</span>
                <span className="landing-pricing-period">/month</span>
              </div>
              <ul className="landing-pricing-features">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited invoices
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  PDF downloads
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Client management
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Basic reporting
                </li>
              </ul>
              <button className="landing-pricing-btn landing-pricing-btn-outline" type="button" onClick={onStartFree}>
                Get Started
              </button>
            </div>

            <div className="landing-pricing-card landing-pricing-card-popular">
              <div className="landing-pricing-badge">Popular</div>
              <div className="landing-pricing-header">
                <h3>Pro</h3>
                <p>For professionals who mean business</p>
              </div>
              <div className="landing-pricing-price">
                <span className="landing-pricing-currency">{'\u20A6'}</span>
                <span className="landing-pricing-amount">5,000</span>
                <span className="landing-pricing-period">/month</span>
              </div>
              <ul className="landing-pricing-features">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Free
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Email sending
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Delivery tracking
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Payment reminders
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Custom branding
                </li>
              </ul>
              <button className="landing-pricing-btn landing-pricing-btn-primary" type="button" onClick={onStartFree}>
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-container">
          <h2>Ready to simplify your billing?</h2>
          <p>Join thousands of freelancers and small teams who invoice faster and get paid sooner.</p>

          <div className="landing-cta-buttons">
            <button className="landing-btn-primary" type="button" onClick={onStartFree}>
              Start Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="landing-btn-white" type="button" onClick={onSignIn}>
              Sign In
            </button>
          </div>

          <div className="landing-cta-trust">Free forever plan, no credit card required, upgrade anytime</div>
        </div>
      </section>
    </>
  )
}

export default LandingPricingSection
