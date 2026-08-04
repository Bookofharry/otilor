import { useEffect, useMemo, useState } from 'react'
import { type BusinessSettings } from '../app/businessSettings'
import { resolveInvoiceIssuerContactLines, resolveInvoiceIssuerProfile } from '../app/invoiceIssuer'
import { persistAuthUserProfile, readStoredAuthUserProfile } from '../app/userProfile'
import { useApp } from '../context'

import { SettingsSkeleton } from '../components/ui/PageSkeletons'

/* eslint-disable react-hooks/set-state-in-effect */

interface SettingsPageProps {
  isLoading?: boolean
}

function SettingsPage({ isLoading = false }: SettingsPageProps) {
  const { businessSettings, toast, isPro, setIsPro, mode } = useApp()
  const [draft, setDraft] = useState<BusinessSettings>(businessSettings.businessSettings)
  const [accountName, setAccountName] = useState(() => readStoredAuthUserProfile()?.name ?? '')
  const authUser = readStoredAuthUserProfile()

  useEffect(() => {
    setDraft(businessSettings.businessSettings)
  }, [businessSettings.businessSettings])

  useEffect(() => {
    setAccountName(authUser?.name ?? '')
  }, [authUser?.name])

  const patchDraft = (patch: Partial<BusinessSettings>) => {
    setDraft((current) => ({ ...current, ...patch }))
  }

  const previewAuthUser = useMemo(
    () =>
      authUser || accountName.trim()
        ? {
            name: accountName.trim() || authUser?.name || 'Your business',
            email: authUser?.email || '',
          }
        : null,
    [accountName, authUser],
  )

  const invoiceSenderPreview = useMemo(
    () => resolveInvoiceIssuerProfile(draft, previewAuthUser),
    [draft, previewAuthUser],
  )

  const invoiceSenderContactLines = useMemo(
    () => resolveInvoiceIssuerContactLines(invoiceSenderPreview),
    [invoiceSenderPreview],
  )

  if (isLoading) {
    return <SettingsSkeleton />
  }

  const handleSave = () => {
    const savedProfile = persistAuthUserProfile({
      name: accountName,
      email: authUser?.email,
    })
    const savedSettings = businessSettings.saveBusinessSettings(draft)
    setAccountName(savedProfile.name)
    setDraft(savedSettings)
    toast.pushToast('success', 'Settings saved.')
  }

  const handleReset = () => {
    const resetSettings = businessSettings.resetBusinessSettings()
    setDraft(resetSettings)
    toast.pushToast('info', 'Settings reset to defaults.')
  }

  const handleUseAccountDetails = () => {
    patchDraft({
      businessName: accountName.trim() || authUser?.name || '',
      businessEmail: authUser?.email || draft.businessEmail,
    })
    toast.pushToast('info', 'Business profile synced from your account.')
  }

  const handlePlanToggle = () => {
    const nextIsPro = !isPro
    setIsPro(nextIsPro)
    toast.pushToast('success', nextIsPro ? 'Pro demo enabled.' : 'Switched back to free demo.')
  }

  return (
    <section className="screen settings-screen">
      <div className="section-heading settings-heading">
        <h2>Settings</h2>
        <p>Control who invoices are from and which defaults show up every time you create one.</p>
      </div>

      <div className="settings-layout">
        <article className="panel settings-panel settings-panel--wide">
          <div className="panel-header settings-panel-header">
            <div>
              <h3 className="panel-title">Business Profile</h3>
              <p className="settings-panel-copy">These details appear in invoice preview, send flows, and local receipt exports.</p>
            </div>
            <button className="secondary-button settings-inline-button" type="button" onClick={handleUseAccountDetails}>
              Use Account Details
            </button>
          </div>

          <div className="form-grid">
            <label>
              Business name
              <input
                value={draft.businessName}
                onChange={(event) => patchDraft({ businessName: event.target.value })}
                placeholder="Your business name"
              />
            </label>
            <label>
              Billing email
              <input
                type="email"
                value={draft.businessEmail}
                onChange={(event) => patchDraft({ businessEmail: event.target.value })}
                placeholder="billing@yourbusiness.com"
              />
            </label>
            <label>
              Phone
              <input
                value={draft.businessPhone}
                onChange={(event) => patchDraft({ businessPhone: event.target.value })}
                placeholder="+234 800 000 0000"
              />
            </label>
            <label>
              Country
              <input
                value={draft.country}
                onChange={(event) => patchDraft({ country: event.target.value })}
                placeholder="Nigeria"
              />
            </label>
            <label>
              Address line 1
              <input
                value={draft.addressLine1}
                onChange={(event) => patchDraft({ addressLine1: event.target.value })}
                placeholder="Street address"
              />
            </label>
            <label>
              Address line 2
              <input
                value={draft.addressLine2}
                onChange={(event) => patchDraft({ addressLine2: event.target.value })}
                placeholder="Suite, floor, landmark"
              />
            </label>
            <label>
              City
              <input
                value={draft.city}
                onChange={(event) => patchDraft({ city: event.target.value })}
                placeholder="Lagos"
              />
            </label>
            <label>
              State / Region
              <input
                value={draft.state}
                onChange={(event) => patchDraft({ state: event.target.value })}
                placeholder="Lagos State"
              />
            </label>
            <label>
              Postal code
              <input
                value={draft.postalCode}
                onChange={(event) => patchDraft({ postalCode: event.target.value })}
                placeholder="100001"
              />
            </label>
          </div>
        </article>

        <article className="panel settings-panel">
          <div className="panel-header settings-panel-header">
            <div>
              <h3 className="panel-title">Invoice Defaults</h3>
              <p className="settings-panel-copy">New invoices will start from these values.</p>
            </div>
          </div>

          <div className="form-grid settings-form-grid--compact">
            <label>
              Payment terms (days)
              <input
                type="number"
                min={1}
                max={365}
                value={draft.defaultPaymentTermsDays}
                onChange={(event) =>
                  patchDraft({ defaultPaymentTermsDays: Number(event.target.value) || 1 })
                }
              />
            </label>
            <label>
              Default tax %
              <input
                type="number"
                min={0}
                step={0.1}
                value={draft.defaultTaxRate}
                onChange={(event) => patchDraft({ defaultTaxRate: Number(event.target.value) || 0 })}
              />
            </label>
            <label>
              Default discount %
              <input
                type="number"
                min={0}
                step={0.1}
                value={draft.defaultDiscountRate}
                onChange={(event) => patchDraft({ defaultDiscountRate: Number(event.target.value) || 0 })}
              />
            </label>
          </div>

          <label className="settings-textarea-label">
            Default notes
            <textarea
              className="form-textarea"
              rows={5}
              value={draft.defaultNotes}
              onChange={(event) => patchDraft({ defaultNotes: event.target.value })}
              placeholder="Add a reusable thank-you note or payment instruction."
            />
          </label>
        </article>

        <article className="panel settings-panel">
          <div className="panel-header settings-panel-header">
            <div>
              <h3 className="panel-title">Sender Preview</h3>
              <p className="settings-panel-copy">This is the identity clients will see on new invoices and local PDF receipts.</p>
            </div>
          </div>

          <div className="settings-sender-card">
            <div className="settings-sender-card-header">
              <span className="settings-badge">Bill From</span>
              <strong>{invoiceSenderPreview.name}</strong>
            </div>

            {invoiceSenderContactLines.length > 0 ? (
              <div className="settings-sender-lines">
                {invoiceSenderContactLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="settings-support-note settings-support-note--compact">
                Add business contact details so clients can clearly see who the invoice is from.
              </p>
            )}
          </div>
        </article>

        <article className="panel settings-panel">
          <div className="panel-header settings-panel-header">
            <div>
              <h3 className="panel-title">Account Profile</h3>
              <p className="settings-panel-copy">This local account identity helps personalize the workspace and can seed your invoice sender details.</p>
            </div>
          </div>

          <div className="form-grid settings-form-grid--compact">
            <label>
              Display name
              <input
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="Your full name"
              />
            </label>
            <label>
              Signed-in email
              <input value={authUser?.email || ''} readOnly disabled placeholder="No signed-in email available" />
            </label>
          </div>

          <p className="settings-support-note settings-support-note--compact">
            Email remains tied to the current local sign-in flow in this repo. Business Profile controls the sender on invoices.
          </p>
        </article>

        <article className="panel settings-panel">
          <div className="panel-header settings-panel-header">
            <div>
              <h3 className="panel-title">Billing & Workspace</h3>
              <p className="settings-panel-copy">Workspace state is still local-first, but this now gives the app a more credible operational center.</p>
            </div>
          </div>

          <div className="settings-summary-list">
            <div className="settings-summary-item">
              <span>Current plan</span>
              <strong>{isPro ? 'Pro demo' : 'Free demo'}</strong>
            </div>
            <div className="settings-summary-item">
              <span>Send workflow</span>
              <strong>{isPro ? 'One-click sending enabled' : 'Upgrade required to send'}</strong>
            </div>
            <div className="settings-summary-item">
              <span>Data mode</span>
              <strong>{mode === 'connected' ? 'Connected API mode' : 'Local fallback mode'}</strong>
            </div>
          </div>

          <p className="settings-support-note">
            {mode === 'connected'
              ? 'Live API connectivity is available for invoices and clients. Profile, billing, and deeper account management are still local-first in this repo.'
              : 'Fallback mode is active, so the workspace is relying on local demo data until the API is reachable again.'}
          </p>

          <button className="primary-button settings-plan-button" type="button" onClick={handlePlanToggle}>
            {isPro ? 'Switch to Free Demo' : 'Enable Pro Demo'}
          </button>
        </article>
      </div>

      <div className="settings-actions">
        <button className="secondary-button" type="button" onClick={handleReset}>
          Reset to Defaults
        </button>
        <button className="primary-button" type="button" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </section>
  )
}

export default SettingsPage
