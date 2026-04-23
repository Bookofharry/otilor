import './LegalDocumentPage.css'

interface LegalSection {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

interface LegalDocumentPageProps {
  eyebrow: string
  title: string
  description: string
  effectiveDate: string
  appliesTo: string
  sections: LegalSection[]
  summaryPoints: string[]
  relatedDocumentLabel: string
  onNavigateToHome: () => void
  onNavigateToSignIn: () => void
  onNavigateToStartFree: () => void
  onNavigateToRelatedDocument: () => void
}

function LegalDocumentPage({
  eyebrow,
  title,
  description,
  effectiveDate,
  appliesTo,
  sections,
  summaryPoints,
  relatedDocumentLabel,
  onNavigateToHome,
  onNavigateToSignIn,
  onNavigateToStartFree,
  onNavigateToRelatedDocument,
}: LegalDocumentPageProps) {
  return (
    <div className="legal-page">
      <header className="legal-topbar">
        <div className="legal-topbar-inner">
          <button type="button" className="legal-brand" onClick={onNavigateToHome}>
            <img src="/otilor.png" alt="Otilor" style={{ height: '28px', width: 'auto' }} />
            <span className="legal-brand-subtitle" style={{ marginLeft: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Legal</span>
          </button>

          <div className="legal-topbar-actions">
            <button type="button" className="legal-topbar-link" onClick={onNavigateToSignIn}>
              Sign In
            </button>
            <button type="button" className="legal-topbar-cta" onClick={onNavigateToStartFree}>
              Start Free
            </button>
          </div>
        </div>
      </header>

      <main className="legal-shell">
        <section className="legal-hero">
          <span className="legal-kicker">{eyebrow}</span>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-subtitle">{description}</p>
          <div className="legal-meta">
            <span className="legal-meta-chip">Effective date: {effectiveDate}</span>
            <span className="legal-meta-chip">{appliesTo}</span>
          </div>
        </section>

        <div className="legal-grid">
          <article className="legal-article">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="legal-section">
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>

          <aside className="legal-sidebar">
            <section className="legal-sidebar-card">
              <h2>Quick Summary</h2>
              <ul className="legal-summary-list">
                {summaryPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>

            <section className="legal-sidebar-card">
              <h2>On This Page</h2>
              <nav className="legal-page-nav">
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
              </nav>
            </section>

            <section className="legal-sidebar-card">
              <h2>Related Document</h2>
              <button type="button" className="legal-related-button" onClick={onNavigateToRelatedDocument}>
                {relatedDocumentLabel}
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default LegalDocumentPage
export type { LegalSection, LegalDocumentPageProps }
