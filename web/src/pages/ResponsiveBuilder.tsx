import { useState, useEffect } from 'react'
import BuilderPage from './BuilderPage'
import BuilderMobilePage from './BuilderMobilePage'
import type { BuilderForm, ApiClientSummary, Invoice, LineItem } from '../app/types'

interface ResponsiveBuilderProps {
  editingInvoiceId: string | null
  editNotice?: string | null
  builder: BuilderForm
  clients: ApiClientSummary[]
  builderError: string | null
  actionBusy: boolean
  previewInvoice: Invoice
  onSelectExistingClient: (clientId: string) => void
  onPatchBuilder: (patch: Partial<BuilderForm>) => void
  onAddItem: () => void
  onUpdateItem: (itemId: string, patch: Partial<LineItem>) => void
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
