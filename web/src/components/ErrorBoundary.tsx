import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          style={{
            padding: '2rem',
            margin: '2rem auto',
            maxWidth: '600px',
            background: 'var(--color-surface-elevated, #ffffff)',
            border: '1px solid var(--color-error-500, #ef4444)',
            borderRadius: '1rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2 style={{ color: 'var(--color-error-600, #dc2626)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            An unexpected error occurred while rendering this section.
          </p>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details style={{ marginBottom: '1rem', padding: '0.5rem', background: 'var(--color-neutral-50)', borderRadius: '0.375rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Error Details</summary>
              <p style={{ marginTop: '0.5rem', color: 'var(--color-error-600)' }}>{this.state.error.toString()}</p>
              {this.state.errorInfo && <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{this.state.errorInfo.componentStack}</pre>}
            </details>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--color-brand-600, #2563eb)',
                color: '#fff',
                borderRadius: '0.375rem',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => { window.location.href = '/' }}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--color-neutral-100)',
                color: 'var(--color-text-primary)',
                borderRadius: '0.375rem',
                border: '1px solid var(--color-border)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
