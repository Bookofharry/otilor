import { useState, useEffect } from 'react'
import BuilderPage from './BuilderPage'
import BuilderMobilePage from './BuilderMobilePage'

interface ResponsiveBuilderProps {
  editingInvoiceId: string | null
  editNotice?: string | null
  builder: any
  clients: any[]
  builderError: string | null
  actionBusy: boolean
  previewInvoice: any
  onSelectExistingClient: (clientId: string) => void
  onPatchBuilder: (patch: any) => void
  onAddItem: () => void
  onUpdateItem: (itemId: string, patch: any) => void
  onRemoveItem: (itemId: string) => void
  onCancel: () => void
  onSave: () => void
}

function ResponsiveBuilder(props: ResponsiveBuilderProps) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  if (isMobile) {
    return <BuilderMobilePage {...props} />
  }

  return <BuilderPage {...props} />
}

export default ResponsiveBuilder
