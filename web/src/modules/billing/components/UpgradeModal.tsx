import { useEffect } from 'react'
import { useUpgradeAnalytics } from '../../../context/useAnalytics'

interface UpgradeModalProps {
  visible: boolean
  source?: string
  onClose: () => void
  onUpgrade: () => void
}

function UpgradeModal({ visible, source = 'unknown', onClose, onUpgrade }: UpgradeModalProps) {
  const upgradeAnalytics = useUpgradeAnalytics()

  // Track when modal is viewed
  useEffect(() => {
    if (visible) {
      upgradeAnalytics.trackUpgradeModalViewed(source)
    }
  }, [visible, source, upgradeAnalytics])

  const handleUpgrade = () => {
    upgradeAnalytics.trackUpgradeStarted('monthly', 999) // Demo pricing
    onUpgrade()
  }

  if (!visible) return null

  return (
    <div className="overlay-wrap" role="dialog" aria-modal="true" aria-label="Upgrade modal">
      <button aria-label="Close upgrade modal" className="overlay-backdrop" type="button" onClick={onClose} />
      <article className="upgrade-modal">
        <h3>Automation Feature</h3>
        <p>Send invoices in one click and track delivery status. Upgrade to Pro to unlock this workflow.</p>
        <div className="action-row">
          <button className="secondary-button" type="button" onClick={onClose}>
            Maybe Later
          </button>
          <button className="primary-button" type="button" onClick={handleUpgrade}>
            Upgrade to Pro (Demo)
          </button>
        </div>
      </article>
    </div>
  )
}

export default UpgradeModal
