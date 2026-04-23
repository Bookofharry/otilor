import type { SendForm } from '../../../app/types'
import { useSendAnalytics } from '../../../context/useAnalytics'

interface SendPanelProps {
  visible: boolean
  busy: boolean
  error: string | null
  form: SendForm
  invoiceId?: string
  onClose: () => void
  onSubmit: () => void
  onChange: (next: SendForm) => void
}

function SendPanel({ visible, busy, error, form, invoiceId, onClose, onSubmit, onChange }: SendPanelProps) {
  const sendAnalytics = useSendAnalytics()

  const handleSubmit = () => {
    if (invoiceId) {
      sendAnalytics.trackSendAttempted(invoiceId, form.to)
    }
    onSubmit()
  }

  if (!visible) return null

  return (
    <div className="overlay-wrap" role="dialog" aria-modal="true" aria-label="Send invoice panel">
      <button aria-label="Close send panel" className="overlay-backdrop" type="button" onClick={() => !busy && onClose()} />
      <article className="send-panel">
        <h3>Send Invoice</h3>
        <label>
          Recipient email
          <input value={form.to} onChange={(event) => onChange({ ...form, to: event.target.value })} />
        </label>
        <label>
          Subject
          <input value={form.subject} onChange={(event) => onChange({ ...form, subject: event.target.value })} />
        </label>
        <label>
          Message
          <textarea rows={6} value={form.message} onChange={(event) => onChange({ ...form, message: event.target.value })} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={form.attachPdf} onChange={(event) => onChange({ ...form, attachPdf: event.target.checked })} />
          Attach PDF
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.sendCopyToMe}
            onChange={(event) => onChange({ ...form, sendCopyToMe: event.target.checked })}
          />
          Send copy to me
        </label>

        {error && <p className="inline-error">{error}</p>}

        <div className="action-row">
          <button className="secondary-button" type="button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="primary-button" type="button" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Sending...' : 'Send Invoice'}
          </button>
        </div>
      </article>
    </div>
  )
}

export default SendPanel
