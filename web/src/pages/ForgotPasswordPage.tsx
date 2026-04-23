import { useState } from 'react'

interface ForgotPasswordPageProps {
  onNavigateToSignIn: () => void
  onNavigateToSignUp: () => void
  onNavigateToLanding: () => void
}

function ForgotPasswordPage({
  onNavigateToSignIn,
  onNavigateToSignUp,
  onNavigateToLanding,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Please enter your email address')
      return
    }

    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmittedEmail(trimmedEmail)
    setIsLoading(false)
  }

  const handleTryAnotherEmail = () => {
    setSubmittedEmail(null)
    setError(null)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-branding">
          <div className="auth-branding-content">
            <div className="auth-logo" onClick={onNavigateToLanding}>
              <img src="/otilor.png" alt="Otilor" style={{ height: '40px', width: 'auto' }} />
            </div>

            <h2 className="auth-branding-title">
              Reset access to <span className="brand-wordmark">Otilor</span>
            </h2>
            <p className="auth-branding-subtitle">
              Recover your account securely and get back to invoicing without losing momentum.
            </p>

            <div className="auth-branding-features">
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4m0 12v4m8-10h-4M8 12H4m12.95 6.95-2.83-2.83M9.88 9.88 7.05 7.05m9.9 0-2.83 2.83M9.88 14.12l-2.83 2.83" />
                  </svg>
                </div>
                <span>Request a reset in under a minute</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span>Keep account recovery private and secure</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <span>Jump back to sign in after the reset email lands</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h1>Forgot Password</h1>
              <p>Enter the email linked to your account and we will send reset instructions.</p>
            </div>

            {error && (
              <div className="auth-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {submittedEmail ? (
              <div className="auth-success-panel">
                <div className="auth-success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 7-4-14-3 7H2" />
                  </svg>
                </div>
                <h2 className="auth-success-title">Check your email</h2>
                <p className="auth-success-text">
                  If an account exists for <strong>{submittedEmail}</strong>, password reset instructions are on the way.
                </p>
                <div className="auth-action-stack">
                  <button type="button" className="auth-submit-btn" onClick={onNavigateToSignIn}>
                    Back to Sign In
                  </button>
                  <button type="button" className="auth-secondary-btn" onClick={handleTryAnotherEmail}>
                    Use a Different Email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-form-group">
                  <label htmlFor="reset-email">Email Address</label>
                  <div className="auth-input-wrapper">
                    <svg className="auth-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg className="auth-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                      </svg>
                      Sending reset link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}

            <p className="auth-footer-text">
              Remembered your password?{' '}
              <button type="button" className="auth-link" onClick={onNavigateToSignIn}>
                Sign in
              </button>
            </p>
            <p className="auth-footer-text">
              Need an account?{' '}
              <button type="button" className="auth-link" onClick={onNavigateToSignUp}>
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
