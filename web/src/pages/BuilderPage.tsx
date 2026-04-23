import { useEffect } from 'react'
import type { ApiClientSummary } from '../api'
import type { BuilderForm, Invoice, LineItem } from '../app/types'
import InvoicePreview from '../modules/invoices/components/InvoicePreview'
import { useInvoiceAnalytics, useClientAnalytics } from '../context/useAnalytics'

interface BuilderPageProps {
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

function BuilderPage({
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
}: BuilderPageProps) {
  const invoiceAnalytics = useInvoiceAnalytics()
  const clientAnalytics = useClientAnalytics()

  // Track builder opened
  useEffect(() => {
    invoiceAnalytics.trackBuilderOpened(editingInvoiceId || undefined)
  }, [editingInvoiceId, invoiceAnalytics])

  const handleSelectClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      clientAnalytics.trackClientSelected(clientId, client.name, 'builder')
    }
    onSelectExistingClient(clientId)
  }

  const handleSave = () => {
    // Track draft saved
    const total = previewInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    invoiceAnalytics.trackDraftSaved(editingInvoiceId || 'new', total)
    onSave()
  }

  return (
    <section className="screen">
      <div className="section-heading">
        <h2>{editingInvoiceId ? 'Edit Invoice' : 'Invoice Builder'}</h2>
        <p>Left: inputs. Right: live preview.</p>
      </div>

      <div className="builder-layout">
        <article className="panel">
          <h3>Invoice Inputs</h3>
          {editNotice && <p className="inline-notice">{editNotice}</p>}
          <div className="form-grid">
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

          <div className="items-editor">
            <div className="items-header">
              <h4>Line items</h4>
              <button className="ghost-button" type="button" onClick={onAddItem}>
                Add item
              </button>
            </div>

            {builder.items.map((item) => (
              <div className="item-row" key={item.id}>
                <input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(event) => onUpdateItem(item.id, { description: event.target.value })}
                />
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
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Remove item"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4l8 8M12 4 4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <span className="sr-only">Remove item</span>
                </button>
              </div>
            ))}
          </div>

          <div className="form-grid">
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
          </div>

          <label className="textarea-label">
            Notes
            <textarea rows={3} value={builder.notes} onChange={(event) => onPatchBuilder({ notes: event.target.value })} />
          </label>

          {builderError && <p className="inline-error">{builderError}</p>}

          <div className="action-row">
            <button className="secondary-button" type="button" onClick={onCancel} disabled={actionBusy}>
              Cancel
            </button>
            <button className="primary-button" type="button" onClick={handleSave} disabled={actionBusy}>
              {actionBusy ? 'Saving...' : editingInvoiceId ? 'Save Changes' : 'Save Draft'}
            </button>
          </div>
        </article>

        <article className="panel preview-panel">
          <h3>Live Preview</h3>
          <InvoicePreview invoice={previewInvoice} />
        </article>
      </div>
    </section>
  )
}

export default BuilderPage
