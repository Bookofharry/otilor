import { useState, useCallback } from 'react'
import { getInvoiceIssuerProfile } from '../app/invoiceIssuer'
import type { SendForm, Invoice } from '../app/types'
import { sendTemplate } from '../app/invoiceUtils'

export function useSend() {
  const [showSendPanel, setShowSendPanel] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [sendBusy, setSendBusy] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [sendTargetInvoiceId, setSendTargetInvoiceId] = useState<string | null>(null)
  const [upgradeTargetInvoiceId, setUpgradeTargetInvoiceId] = useState<string | null>(null)
  const [sendForm, setSendForm] = useState<SendForm>({
    to: '',
    subject: '',
    message: '',
    attachPdf: true,
    sendCopyToMe: false,
  })

  const openSendPanel = useCallback((invoice: Invoice) => {
    const issuerProfile = getInvoiceIssuerProfile()

    setSendTargetInvoiceId(invoice.id)
    setSendError(null)
    setSendForm({
      to: invoice.clientEmail,
      subject: `Invoice ${invoice.number} from ${issuerProfile.name}`,
      message: sendTemplate(invoice.clientName),
      attachPdf: true,
      sendCopyToMe: false,
    })
    setShowSendPanel(true)
  }, [])

  const closeSendPanel = useCallback(() => {
    setShowSendPanel(false)
    setSendTargetInvoiceId(null)
    setSendError(null)
  }, [])

  const openUpgradeModal = useCallback((invoiceId: string) => {
    setUpgradeTargetInvoiceId(invoiceId)
    setShowUpgradeModal(true)
  }, [])

  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false)
    setUpgradeTargetInvoiceId(null)
  }, [])

  const setBusy = useCallback((busy: boolean) => {
    setSendBusy(busy)
  }, [])

  const setError = useCallback((error: string | null) => {
    setSendError(error)
  }, [])

  const updateForm = useCallback((updates: Partial<SendForm>) => {
    setSendForm((prev) => ({ ...prev, ...updates }))
  }, [])

  return {
    showSendPanel,
    showUpgradeModal,
    sendBusy,
    sendError,
    sendTargetInvoiceId,
    upgradeTargetInvoiceId,
    sendForm,
    openSendPanel,
    closeSendPanel,
    openUpgradeModal,
    closeUpgradeModal,
    setBusy,
    setError,
    updateForm,
  }
}
