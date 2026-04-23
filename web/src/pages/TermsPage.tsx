import LegalDocumentPage from '../modules/legal/components/LegalDocumentPage'
import type { LegalSection } from '../modules/legal/components/LegalDocumentPage'

interface TermsPageProps {
  onNavigateToHome: () => void
  onNavigateToSignIn: () => void
  onNavigateToStartFree: () => void
  onNavigateToPrivacy: () => void
}

const termsSections: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of These Terms',
    paragraphs: [
      'By accessing or using Otilor, you agree to these Terms of Service and any policies referenced here. If you do not agree, do not use the service.',
      'These terms apply to the Otilor website, web app, and related billing features made available through SmartInvoice.',
    ],
  },
  {
    id: 'accounts',
    title: 'Accounts and Access',
    paragraphs: [
      'You are responsible for maintaining the confidentiality of your account credentials and for activity that occurs under your account.',
      'You must provide accurate account information and keep it updated so we can operate the service and contact you when needed.',
    ],
    bullets: [
      'Do not share credentials with unauthorized users.',
      'Notify us promptly if you suspect unauthorized access.',
      'You must be legally able to use the service on behalf of yourself or your business.',
    ],
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    paragraphs: [
      'You may use Otilor only for lawful business and invoicing purposes. You may not use the service to violate laws, infringe rights, or interfere with the platform.',
    ],
    bullets: [
      'Do not upload unlawful, misleading, or fraudulent billing information.',
      'Do not attempt to disrupt, probe, or bypass platform security.',
      'Do not use Otilor to send spam, malware, or abusive communications.',
    ],
  },
  {
    id: 'billing',
    title: 'Plans, Billing, and Changes',
    paragraphs: [
      'Some features may require a paid plan. Pricing, plan limits, and feature access may change over time, but we will aim to communicate material changes before they take effect.',
      'If you subscribe to a paid plan, you agree to pay applicable fees and taxes associated with your use of that plan.',
    ],
  },
  {
    id: 'content',
    title: 'Your Data and Invoice Content',
    paragraphs: [
      'You retain ownership of the invoices, client information, notes, and other content you create in Otilor.',
      'You grant us the limited rights needed to host, process, transmit, and display that content so the service can function as intended.',
    ],
  },
  {
    id: 'availability',
    title: 'Service Availability',
    paragraphs: [
      'We work to keep Otilor reliable, but we do not guarantee uninterrupted availability or error-free operation at all times.',
      'We may update, suspend, or change parts of the service in order to improve it, maintain it, or respond to security and operational concerns.',
    ],
  },
  {
    id: 'liability',
    title: 'Disclaimers and Limitation of Liability',
    paragraphs: [
      'To the extent permitted by law, Otilor is provided on an as-is and as-available basis without warranties of any kind.',
      'To the extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    paragraphs: [
      'If you have questions about these terms, contact the Otilor team before relying on the service for business-critical workflows.',
      'For production launch, these terms should be reviewed and approved by your legal counsel before final publication.',
    ],
  },
]

function TermsPage({
  onNavigateToHome,
  onNavigateToSignIn,
  onNavigateToStartFree,
  onNavigateToPrivacy,
}: TermsPageProps) {
  return (
    <LegalDocumentPage
      eyebrow="Terms"
      title="Terms of Service"
      description="These terms explain the basic rules for using Otilor, including account access, acceptable use, billing, and service limitations."
      effectiveDate="March 27, 2026"
      appliesTo="Applies to Otilor website and invoicing services"
      sections={termsSections}
      summaryPoints={[
        'You must use the service lawfully and keep your account secure.',
        'You keep ownership of your invoice data, while Otilor processes it to operate the service.',
        'Paid features may have fees, limits, or plan changes over time.',
        'Service availability is not guaranteed and legal review is still recommended before launch.',
      ]}
      relatedDocumentLabel="Read Privacy Policy"
      onNavigateToHome={onNavigateToHome}
      onNavigateToSignIn={onNavigateToSignIn}
      onNavigateToStartFree={onNavigateToStartFree}
      onNavigateToRelatedDocument={onNavigateToPrivacy}
    />
  )
}

export default TermsPage
