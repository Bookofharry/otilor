import LegalDocumentPage from '../modules/legal/components/LegalDocumentPage'
import type { LegalSection } from '../modules/legal/components/LegalDocumentPage'

interface PrivacyPageProps {
  onNavigateToHome: () => void
  onNavigateToSignIn: () => void
  onNavigateToStartFree: () => void
  onNavigateToTerms: () => void
}

const privacySections: LegalSection[] = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    paragraphs: [
      'Otilor may collect account details, profile information, invoice data, client details, and usage information that helps operate the service.',
      'The exact information collected depends on how you use the product, including whether you create invoices, manage clients, or upgrade to paid features.',
    ],
  },
  {
    id: 'how-we-use-information',
    title: 'How We Use Information',
    paragraphs: [
      'We use information to provide the invoicing service, support account access, improve product performance, communicate with users, and protect the platform from abuse.',
    ],
    bullets: [
      'Create and manage invoices, clients, and dashboard summaries.',
      'Support sign-in, account recovery, and customer support requests.',
      'Monitor usage, troubleshoot issues, and improve the product experience.',
    ],
  },
  {
    id: 'sharing',
    title: 'How Information May Be Shared',
    paragraphs: [
      'We do not sell personal information. We may share information with service providers or infrastructure partners only when necessary to operate, secure, or improve Otilor.',
      'We may also disclose information when required by law or when necessary to protect the rights, safety, and integrity of the platform.',
    ],
  },
  {
    id: 'retention-security',
    title: 'Data Retention and Security',
    paragraphs: [
      'We retain data for as long as reasonably needed to provide the service, comply with obligations, resolve disputes, and enforce our agreements.',
      'We use reasonable technical and organizational measures to protect account and product data, but no system can guarantee absolute security.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and Product Analytics',
    paragraphs: [
      'Otilor may use cookies, local storage, and similar technologies to keep you signed in, remember preferences, measure feature usage, and improve reliability.',
      'If analytics or third-party tracking tools are added in production, they should be documented here before launch.',
    ],
  },
  {
    id: 'your-choices',
    title: 'Your Choices',
    paragraphs: [
      'You may update account details, manage invoice content, and contact the team to request help with account access or privacy-related questions.',
      'Depending on your jurisdiction, you may have additional rights related to access, correction, deletion, or objection. Those workflows should be finalized before production release.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    paragraphs: [
      'If you have questions about this privacy policy or how Otilor handles information, contact the team before publishing this policy in production.',
      'For production launch, this policy should be reviewed and approved by legal counsel to match your actual data handling practices.',
    ],
  },
]

function PrivacyPage({
  onNavigateToHome,
  onNavigateToSignIn,
  onNavigateToStartFree,
  onNavigateToTerms,
}: PrivacyPageProps) {
  return (
    <LegalDocumentPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="This policy explains what information Otilor may collect, how it is used, when it may be shared, and what privacy choices users should expect."
      effectiveDate="March 27, 2026"
      appliesTo="Applies to Otilor website, app, and related account flows"
      sections={privacySections}
      summaryPoints={[
        'Otilor may collect account, invoice, client, and usage information needed to operate the product.',
        'Information is used to deliver the service, secure accounts, and improve product performance.',
        'Data may be shared with service providers only as needed to run the platform or meet legal obligations.',
        'This policy should be reviewed against actual production data handling before launch.',
      ]}
      relatedDocumentLabel="Read Terms of Service"
      onNavigateToHome={onNavigateToHome}
      onNavigateToSignIn={onNavigateToSignIn}
      onNavigateToStartFree={onNavigateToStartFree}
      onNavigateToRelatedDocument={onNavigateToTerms}
    />
  )
}

export default PrivacyPage
