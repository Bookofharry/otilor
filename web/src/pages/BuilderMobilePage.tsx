import { useEffect, useState } from 'react'
import type { ApiClientSummary } from '../api'
import type { BuilderForm, Invoice, LineItem } from '../app/types'
import InvoicePreview from '../modules/invoices/components/InvoicePreview'
import { useInvoiceAnalytics, useClientAnalytics } from '../context/useAnalytics'

interface BuilderMobilePageProps {
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

type Step = 'client' | 'items' | 'settings' | 'review'

const STEP_LABELS: Record<Step, string> = {
  client: 'Client',
  items: 'Items',
  settings: 'Settings',
  review: 'Review',
}

function BuilderMobilePage({
  editingInvoiceId,
  editNotice,
  builder,
  clients,
  builderError,
  actionBusy,
  previewInvoice,
  onSelectExistingClient,
  onPatchBuilder,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onCancel,
  onSave,
}: BuilderMobilePageProps) {
  const [step, setStep] = useState<Step>('client')
  const invoiceAnalytics = useInvoiceAnalytics()
  const clientAnalytics = useClientAnalytics()

  useEffect(() => {
    invoiceAnalytics.trackBuilderOpened(editingInvoiceId || undefined)
  }, [editingInvoiceId, invoiceAnalytics])

  const handleSelectClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      clientAnalytics.trackClientSelected(clientId, client.name, 'builder_mobile')
    }
    onSelectExistingClient(clientId)
  }

  const handleSave = () => {
    const total = previewInvoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    invoiceAnalytics.trackDraftSaved(editingInvoiceId || 'new', total)
    onSave()
  }

  const canAdvance = (): boolean => {
    if (step === 'client') {
      return builder.clientName.trim().length > 0
    }
    if (step === 'items') {
      return builder.items.length > 0 && builder.items.every((item) => item.description.trim().length > 0 && item.quantity > 0)
    }
    return true
  }

  const stepIndex = Object.keys(STEP_LABELS).length
  const currentIndex = Object.keys(STEP_LABELS).indexOf(step)
  const progress = ((currentIndex + 1) / stepIndex) * 100

  const renderStep = () => {
    switch (step) {
      case 'client':
        return (
          <div className="builder-mobile-step">
            <h3>Client</h3>
            <label>
              Existing client
              <select value={builder.clientId} onChange={(event) => handleSelectClient(event.target.value)}>
                <option value="">Select existing client (optional)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                    {client.email ? ` (${client.email})` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Client name
              <input
                value={builder.clientName}
                onChange={(event) =>
                  onPatchBuilder({
                    clientId: '',
                    clientName: event.target.value,
                  })
                }
              />
            </label>
            <label>
              Client email
              <input
                value={builder.clientEmail}
                onChange={(event) =>
                  onPatchBuilder({
                    clientId: '',
                    clientEmail: event.target.value,
                  })
                }
              />
            </label>
            <label>
              Issue date
              <input type="date" value={builder.issueDate} onChange={(event) => onPatchBuilder({ issueDate: event.target.value })} />
            </label>
            <label>
              Due date
              <input type="date" value={builder.dueDate} onChange={(event) => onPatchBuilder({ dueDate: event.target.value })} />
            </label>
          </div>
        )
      case 'items':
        return (
          <div className="builder-mobile-step">
            <h3>Line items</h3>
            {builder.items.map((item, index) => (
              <div className="builder-mobile-item" key={item.id}>
                <div className="builder-mobile-item-header">
                  <strong>Item {index + 1}</strong>
                  {builder.items.length > 1 && (
                    <button className="icon-button" type="button" aria-label="Remove item" onClick={() => onRemoveItem(item.id)}>
                      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4l8 8M12 4 4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </div>
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(event) => onUpdateItem(item.id, { description: event.target.value })}
                />
                <div className="builder-mobile-item-row">
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    placeholder="Qty"
                    value={item.quantity === 0 ? '' : item.quantity}
                    onChange={(event) =>
                      onUpdateItem(item.id, {
                        quantity: Number(event.target.value) || 0,
                      })
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Amount"
                    value={item.unitPrice === 0 ? '' : item.unitPrice}
                    onChange={(event) =>
                      onUpdateItem(item.id, {
                        unitPrice: Number(event.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            ))}
            <button className="secondary-button" type="button" onClick={onAddItem}>
              Add item
            </button>
          </div>
        )
      case 'settings':
        return (
          <div className="builder-mobile-step">
            <h3>Settings</h3>
            <label>
              Tax %
              <input
                type="number"
                min={0}
                step={0.1}
                value={builder.taxRate}
                onChange={(event) => onPatchBuilder({ taxRate: Number(event.target.value) || 0 })}
              />
            </label>
            <label>
              Discount %
              <input
                type="number"
                min={0}
                step={0.1}
                value={builder.discountRate}
                onChange={(event) => onPatchBuilder({ discountRate: Number(event.target.value) || 0 })}
              />
            </label>
            <label>
              Notes
              <textarea rows={3} value={builder.notes} onChange={(event) => onPatchBuilder({ notes: event.target.value })} />
            </label>
          </div>
        )
      case 'review':
        return (
          <div className="builder-mobile-step">
            <h3>Review</h3>
            <div className="builder-mobile-preview">
              <InvoicePreview invoice={previewInvoice} />
            </div>
          </div>
        )
    }
  }

  return (
    <section className="screen builder-mobile-screen">
      <div className="section-heading">
        <h2>{editingInvoiceId ? 'Edit Invoice' : 'Invoice Builder'}</h2>
        <p>Step {currentIndex + 1} of {stepIndex}: {STEP_LABELS[step]}</p>
      </div>

      <div className="builder-mobile-progress" aria-hidden>
        <div className="builder-mobile-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="builder-mobile-stepper">
        {editNotice && <p className="inline-notice">{editNotice}</p>}
        {builderError && <p className="inline-error">{builderError}</p>}
        {renderStep()}

        <div className="builder-mobile-actions">
          {step !== 'client' && (
            <button className="secondary-button" type="button" onClick={() => setStep((s) => (Object.keys(STEP_LABELS)[Object.keys(STEP_LABELS).indexOf(s) - 1] as Step) || 'client')}>
              Back
            </button>
          )}
          {step !== 'review' ? (
            <button className="primary-button" type="button" onClick={() => setStep((s) => Object.keys(STEP_LABELS)[Object.keys(STEP_LABELS).indexOf(s) + 1] as Step)} disabled={!canAdvance()}>
              Next
            </button>
          ) : (
            <button className="primary-button" type="button" onClick={handleSave} disabled={actionBusy}>
              {actionBusy ? 'Saving...' : editingInvoiceId ? 'Save Changes' : 'Save Draft'}
            </button>
          )}
          <button className="ghost-button" type="button" onClick={onCancel} disabled={actionBusy}>
            Cancel
          </button>
        </div>
      </div>
    </section>
  )
}

export default BuilderMobilePage
