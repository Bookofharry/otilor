import { useState } from 'react'
import LandingFeaturesSection from '../modules/marketing/components/LandingFeaturesSection'
import LandingFooter from '../modules/marketing/components/LandingFooter'
import LandingHeroSection from '../modules/marketing/components/LandingHeroSection'
import LandingNavigation from '../modules/marketing/components/LandingNavigation'
import LandingPricingSection from '../modules/marketing/components/LandingPricingSection'
import LandingTestimonialsSection from '../modules/marketing/components/LandingTestimonialsSection'
import LandingTrustStrip from '../modules/marketing/components/LandingTrustStrip'
import LandingWorkflowSection from '../modules/marketing/components/LandingWorkflowSection'
import './LandingPage.css'

interface LandingPageProps {
  onSignIn: () => void
  onStartFree: () => void
  onNavigateToPrivacy: () => void
  onNavigateToTerms: () => void
}

function LandingPage({ onSignIn, onStartFree, onNavigateToPrivacy, onNavigateToTerms }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="landing-page">
      <LandingNavigation
        mobileMenuOpen={mobileMenuOpen}
        onToggleMenu={() => setMobileMenuOpen((current) => !current)}
        onSectionSelect={scrollToSection}
        onSignIn={onSignIn}
        onStartFree={onStartFree}
      />
      <LandingHeroSection onStartFree={onStartFree} />
      <LandingTrustStrip />
      <LandingFeaturesSection />
      <LandingWorkflowSection />
      <LandingTestimonialsSection />
      <LandingPricingSection onSignIn={onSignIn} onStartFree={onStartFree} />
      <LandingFooter onNavigateToPrivacy={onNavigateToPrivacy} onNavigateToTerms={onNavigateToTerms} />
    </div>
  )
}

export default LandingPage
