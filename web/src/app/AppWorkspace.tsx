import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import {
  API_BASE_URL,
  CURRENCY,
  EMAIL_REGEX,
  nextInvoiceNumber,
  normalizeItems,
  timestampNow,
  toInvoicePayload,
  today,
  totalAmount,
  withOverdueStatus,
} from './invoiceUtils'
import { extractErrorMessage, fromApiInvoice } from './transformers'
import type { BuilderForm, Invoice } from './types'
import { AppShell } from '../layout/AppShell'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import UpgradeModal from '../modules/billing/components/UpgradeModal'
import SendPanel from '../modules/invoices/components/SendPanel'
import ClientsPage from '../pages/ClientsPage'
import DashboardPage from '../pages/DashboardPage'
import DetailPage from '../pages/DetailPage'
import InvoicesPage from '../pages/InvoicesPage'
import SettingsPage from '../pages/SettingsPage'
import AnalyticsPage from '../pages/AnalyticsPage'
import ResponsiveBuilder from '../pages/ResponsiveBuilder'
import { useApp } from '../context'
import { useInvoiceAnalytics, useSendAnalytics, useUpgradeAnalytics } from '../context/useAnalytics'
import { saveBlobAsFile, savePdfResult } from './invoiceDownload'
import { openInvoicePrintWindow } from './invoicePrint'
import { clearStoredAuthUserProfile } from './userProfile'
import { setApiToken } from '../api'

// Helper to generate a preview Invoice from BuilderForm
function toPreviewInvoice(form: BuilderForm, invoiceNumber: string): Invoice {
  const now = timestampNow()
  return {
    id: 'preview',
    clientId: form.clientId,
    number: invoiceNumber,
    clientName: form.clientName,
    clientEmail: form.clientEmail,
    issueDate: form.issueDate,
    dueDate: form.dueDate,
    notes: form.notes,
    taxRate: form.taxRate,
    discountRate: form.discountRate,
    items: form.items,
    status: 'Draft',
    sentAt: null,
    paidAt: null,
    voidedAt: null,
    version: 1,
    events: [],
    createdAt: now,
    updatedAt: now,
  }
}

type ActiveNav = 'dashboard' | 'invoices' | 'builder' | 'clients' | 'settings' | 'analytics'

interface DetailRouteProps {
  onCreateInvoice: () => void
  onDownload: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onMarkSent: (invoice: Invoice) => void
  onMarkPaid: (invoice: Invoice) => void
  onSend: (invoice: Invoice) => void
  onVoid: (invoice: Invoice) => void
}

function DetailRoute({
  onCreateInvoice,
  onDownload,
  onEdit,
  onMarkSent,
  onMarkPaid,
  onSend,
  onVoid,
}: DetailRouteProps) {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const { invoices, actionBusy, mode, clients } = useApp()
  const [remoteInvoice, setRemoteInvoice] = useState<Invoice | null>(null)
  const [remoteLoading, setRemoteLoading] = useState(false)
  const storedInvoices = invoices.invoices
  const sortedInvoices = invoices.sortedInvoices
  const setAllInvoices = invoices.setAllInvoices
  
  const resolvedInvoiceId = decodeURIComponent(invoiceId ?? '')

  const cachedInvoice = useMemo(
    () => sortedInvoices.find((entry) => entry.id === resolvedInvoiceId) ?? null,
    [resolvedInvoiceId, sortedInvoices],
  )

  useEffect(() => {
    if (!resolvedInvoiceId || cachedInvoice || mode !== 'connected') {
      setRemoteInvoice(null)
      setRemoteLoading(false)
      return
    }

    let cancelled = false

    const loadInvoice = async () => {
      setRemoteLoading(true)
      try {
        const [invoice, events] = await Promise.all([
          api.getInvoice(resolvedInvoiceId),
          api.getInvoiceEvents(resolvedInvoiceId).catch(() => []),
        ])

        if (cancelled) return

        const hydratedInvoice = fromApiInvoice(
          invoice,
          clients.clients.find((client) => client.id === invoice.client_id),
          events,
        )

        setRemoteInvoice(hydratedInvoice)
        setAllInvoices([
          ...storedInvoices.filter((entry) => entry.id !== hydratedInvoice.id),
          hydratedInvoice,
        ])
      } catch {
        if (!cancelled) setRemoteInvoice(null)
      } finally {
        if (!cancelled) setRemoteLoading(false)
      }
    }

    void loadInvoice()

    return () => {
      cancelled = true
    }
  }, [cachedInvoice, clients.clients, mode, resolvedInvoiceId, setAllInvoices, storedInvoices])

  const invoice = useMemo(
    () => cachedInvoice ?? remoteInvoice,
    [cachedInvoice, remoteInvoice],
  )

  if (!invoice && remoteLoading) {
    return (
      <section className="screen detail-screen">
        <article className="panel">
          <div className="timeline-loading">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        </article>
      </section>
    )
  }

  return (
    <DetailPage
      invoice={invoice}
      actionBusy={actionBusy}
      onCreateInvoice={onCreateInvoice}
      onDownload={onDownload}
      onEdit={onEdit}
      onMarkSent={onMarkSent}
      onMarkPaid={onMarkPaid}
      onSend={onSend}
      onVoid={onVoid}
    />
  )
}

function AppWorkspace() {
  const navigate = useNavigate()
  const location = useLocation()
  const lastRouteInit = useRef<string | null>(null)
  
  const {
    mode,
    loadingInitial,
    setLoadingInitial,
    actionBusy,
    setActionBusy,
    apiBanner,
    setApiBanner,
    isPro,
    setIsPro,
    setMode,
    toast,
    clients,
    dashboard,
    builder,
    send,
    invoices,
    refreshFromApi,
  } = useApp()

  const invoiceAnalytics = useInvoiceAnalytics()
  const sendAnalytics = useSendAnalytics()
  const upgradeAnalytics = useUpgradeAnalytics()

  const [voidConfirm, setVoidConfirm] = useState<{ open: boolean; invoiceId: string } | null>(null)
  
  const { metrics, draftCount } = dashboard
  const { builder: builderForm, builderError, editingInvoiceId, patchBuilder, resetBuilder, loadInvoiceForEdit, addItem, updateItem, removeItem, setError } = builder
  const { 
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
    setBusy: setSendBusyState,
    setError: setSendError,
    updateForm,
  } = send

  const {
    invoices: storedInvoices,
    sortedInvoices,
    addInvoice,
    updateInvoice,
    markAsSent,
    markAsPaid,
    markAsVoid,
    recordSend,
    setAllInvoices,
  } = invoices
  const { pushToast } = toast

  const getInvoiceEditNotice = (invoice: Invoice | null) => {
    if (!invoice) return null

    const currentStatus = withOverdueStatus(invoice)
    if (currentStatus === 'Sent') {
      return 'This invoice was already sent. Save changes only if you need to issue a revised version, then resend it to the client.'
    }
    if (currentStatus === 'Overdue') {
      return 'This overdue invoice was already sent. Save changes only if you need to issue a revised version, then follow up with the client again.'
    }
    return null
  }

  const attemptInvoiceEdit = (invoice: Invoice, options?: { redirectOnReject?: boolean }) => {
    const currentStatus = withOverdueStatus(invoice)
    const redirectPath = `/invoices/${encodeURIComponent(invoice.id)}`

    if (currentStatus === 'Paid') {
      pushToast('info', 'Paid invoices are locked and can no longer be edited.')
      if (options?.redirectOnReject) {
        navigate(redirectPath, { replace: true })
      }
      return false
    }

    if (currentStatus === 'Void') {
      pushToast('info', 'Voided invoices cannot be edited.')
      if (options?.redirectOnReject) {
        navigate(redirectPath, { replace: true })
      }
      return false
    }

    const editNotice = getInvoiceEditNotice(invoice)
    if (editNotice && !window.confirm(editNotice)) {
      if (options?.redirectOnReject) {
        navigate(redirectPath, { replace: true })
      }
      return false
    }

    return true
  }
 
  // Bootstrap API connection
  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      try {
        await refreshFromApi()
      } catch (error) {
        if (!mounted) return
        setMode('fallback')
        setApiBanner(
          `API unavailable (${API_BASE_URL}). Working in local demo mode. ${extractErrorMessage(error)}`,
        )
      } finally {
        if (mounted) setLoadingInitial(false)
      }
    }

    void bootstrap()
    return () => {
      mounted = false
    }
  }, [refreshFromApi])

  // Handle route changes for builder
  useEffect(() => {
    const path = location.pathname
    const editMatch = path.match(/^\/invoices\/([^/]+)\/edit$/)

    if (path === '/invoices/new') {
      if (lastRouteInit.current !== path) {
        resetBuilder()
      }
      lastRouteInit.current = path
      return
    }

    if (editMatch) {
      let cancelled = false

      const prepareInvoiceEditor = async () => {
        const invoiceId = decodeURIComponent(editMatch[1])
        if (editingInvoiceId === invoiceId) {
          lastRouteInit.current = path
          return
        }

        let invoice = sortedInvoices.find((entry) => entry.id === invoiceId) ?? null

        if (!invoice && mode === 'connected' && !loadingInitial) {
          try {
            const [apiInvoice, events] = await Promise.all([
              api.getInvoice(invoiceId),
              api.getInvoiceEvents(invoiceId).catch(() => []),
            ])

            if (cancelled) return

            const hydratedInvoice = fromApiInvoice(
              apiInvoice,
              clients.clients.find((client) => client.id === apiInvoice.client_id),
              events,
            )

            invoice = hydratedInvoice

            setAllInvoices([
              ...storedInvoices.filter((entry) => entry.id !== hydratedInvoice.id),
              hydratedInvoice,
            ])
          } catch {
            invoice = null
          }
        }

        if (!invoice) {
          if (!loadingInitial && !cancelled) {
            setError('Invoice not found.')
          }
          return
        }

        if (!attemptInvoiceEdit(invoice, { redirectOnReject: true }) || cancelled) {
          return
        }

        loadInvoiceForEdit(invoice)
        lastRouteInit.current = path
      }

      void prepareInvoiceEditor()

      return () => {
        cancelled = true
      }
    }

    lastRouteInit.current = path
  }, [
    attemptInvoiceEdit,
    clients.clients,
    editingInvoiceId,
    loadingInitial,
    location.pathname,
    mode,
    resetBuilder,
    loadInvoiceForEdit,
    setAllInvoices,
    setError,
    sortedInvoices,
    storedInvoices,
  ])

  const activeNav = useMemo<ActiveNav>(() => {
    if (location.pathname === '/invoices/new' || /\/invoices\/[^/]+\/edit$/.test(location.pathname)) {
      return 'builder'
    }
    if (location.pathname === '/clients') {
      return 'clients'
    }
    if (location.pathname === '/settings') {
      return 'settings'
    }
    if (location.pathname === '/analytics') {
      return 'analytics'
    }
    if (location.pathname === '/invoices' || /\/invoices\/[^/]+$/.test(location.pathname)) {
      return 'invoices'
    }
    return 'dashboard'
  }, [location.pathname])

  const openCreateInvoice = useCallback(() => {
    navigate('/invoices/new')
  }, [navigate])

  const openInvoicesList = useCallback(() => {
    navigate('/invoices')
  }, [navigate])

  const openInvoicesFiltered = useCallback(
    (filter: 'overdue' | 'draft') => {
      navigate(`/invoices?status=${filter}`)
    },
    [navigate],
  )

  const openInvoiceDetail = useCallback(
    (invoiceId: string) => {
      navigate(`/invoices/${encodeURIComponent(invoiceId)}`)
    },
    [navigate],
  )

  const openInvoiceEditor = useCallback(
    (invoice: Invoice) => {
      if (!attemptInvoiceEdit(invoice)) return
      navigate(`/invoices/${encodeURIComponent(invoice.id)}/edit`)
    },
    [attemptInvoiceEdit, navigate],
  )

  const editingInvoice = useMemo(
    () => (editingInvoiceId ? sortedInvoices.find((entry) => entry.id === editingInvoiceId) ?? null : null),
    [editingInvoiceId, sortedInvoices],
  )

  const editNotice = useMemo(
    () => getInvoiceEditNotice(editingInvoice),
    [editingInvoice, getInvoiceEditNotice],
  )

  const selectExistingClient = useCallback(
    (clientId: string) => {
      if (!clientId) {
        patchBuilder({ clientId: '' })
        return
      }

      const client = clients.clients.find((entry) => entry.id === clientId)
      if (!client) return

      patchBuilder({
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email ?? '',
      })
    },
    [clients, patchBuilder],
  )

  const upsertInvoice = async () => {
    setError(null)

    const cleanItems = normalizeItems(builderForm.items)
    if (!builderForm.clientName.trim()) {
      setError('Client name is required.')
      return
    }
    if (builderForm.clientEmail.trim() && !EMAIL_REGEX.test(builderForm.clientEmail.trim())) {
      setError('Client email is invalid.')
      return
    }
    if (builderForm.dueDate < builderForm.issueDate) {
      setError('Due date cannot be before issue date.')
      return
    }
    if (cleanItems.length === 0) {
      setError('Add at least one line item with description and quantity.')
      return
    }

    const clientName = builderForm.clientName.trim()
    const clientEmail = builderForm.clientEmail.trim()
    const editingStatus = editingInvoice ? withOverdueStatus(editingInvoice) : null
    const updateSuccessMessage =
      editingStatus === 'Sent' || editingStatus === 'Overdue'
        ? 'Invoice updated. Review and resend it if the client already received the earlier version.'
        : 'Invoice updated.'

    setActionBusy(true)
    try {
      if (mode === 'fallback') {
        const matchedClient =
          clients.clients.find((client) => client.id === builderForm.clientId) ??
          clients.clients.find(
            (client) =>
              client.name.toLowerCase() === clientName.toLowerCase() &&
              (client.email ?? '').toLowerCase() === clientEmail.toLowerCase(),
          )

        const clientId = matchedClient?.id ?? crypto.randomUUID()

        if (matchedClient) {
          clients.updateClient(matchedClient.id, { name: clientName, email: clientEmail || null })
        } else {
          clients.addClient({ id: clientId, name: clientName, email: clientEmail || null })
        }

        if (editingInvoiceId) {
          updateInvoice(editingInvoiceId, {
            clientId,
            clientName,
            clientEmail,
            issueDate: builderForm.issueDate,
            dueDate: builderForm.dueDate,
            notes: builderForm.notes.trim(),
            taxRate: builderForm.taxRate,
            discountRate: builderForm.discountRate,
            items: cleanItems,
          })
          pushToast('success', updateSuccessMessage)
          navigate(`/invoices/${encodeURIComponent(editingInvoiceId)}`)
        } else {
          const now = timestampNow()
          const createdInvoice: Invoice = {
            id: crypto.randomUUID(),
            clientId,
            number: nextInvoiceNumber(sortedInvoices),
            clientName,
            clientEmail,
            issueDate: builderForm.issueDate,
            dueDate: builderForm.dueDate,
            notes: builderForm.notes.trim(),
            taxRate: builderForm.taxRate,
            discountRate: builderForm.discountRate,
            items: cleanItems,
            status: 'Draft',
            sentAt: null,
            paidAt: null,
            voidedAt: null,
            version: 1,
            events: [{ id: crypto.randomUUID(), type: 'created', label: 'Invoice created', at: now }],
            createdAt: now,
            updatedAt: now,
          }
          addInvoice(createdInvoice)
          pushToast('success', 'Draft saved.')
          navigate(`/invoices/${encodeURIComponent(createdInvoice.id)}`)
        }

        return
      }

      let clientId = builderForm.clientId
      if (!clientId) {
        const createdClient = await api.createClient({
          name: clientName,
          email: clientEmail || undefined,
        })
        clientId = createdClient.id
        clients.addClient({ id: createdClient.id, name: createdClient.name, email: createdClient.email })
      }

      if (!clientId) throw new Error('Unable to resolve client id.')

      const payload = toInvoicePayload(builderForm, clientId, cleanItems)

      if (editingInvoiceId) {
        const editingInvoice = sortedInvoices.find((entry) => entry.id === editingInvoiceId)
        if (!editingInvoice) throw new Error('Unable to load invoice for update.')
        await api.updateInvoice(editingInvoiceId, payload, editingInvoice.version)
        await refreshFromApi()
        pushToast('success', updateSuccessMessage)
        navigate(`/invoices/${encodeURIComponent(editingInvoiceId)}`)
      } else {
        const created = await api.createInvoice({
          ...payload,
          currency: CURRENCY,
        })
        await refreshFromApi()
        pushToast('success', 'Draft saved.')
        navigate(`/invoices/${encodeURIComponent(created.id)}`)
      }
    } catch (error) {
      invoiceAnalytics.trackSaveFailed(error as Error, editingInvoiceId || undefined)
      setError(extractErrorMessage(error))
    } finally {
      setActionBusy(false)
    }
  }

  const markInvoiceAsSent = async (sourceInvoice: Invoice) => {
    const invoice = sortedInvoices.find((entry) => entry.id === sourceInvoice.id) ?? sourceInvoice
    const currentStatus = withOverdueStatus(invoice)
    if (currentStatus === 'Paid' || currentStatus === 'Void') return
    if (currentStatus === 'Sent' || currentStatus === 'Overdue') return

    setActionBusy(true)
    try {
      if (mode === 'fallback') {
        markAsSent(invoice.id)
        pushToast('success', 'Invoice marked as sent.')
        invoiceAnalytics.trackMarkSentSuccess(invoice.id)
        return
      }

      await api.markInvoiceSent(invoice.id, { sent_date: today() })
      await refreshFromApi()
      pushToast('success', 'Invoice marked as sent.')
      invoiceAnalytics.trackMarkSentSuccess(invoice.id)
    } catch (error) {
      pushToast('error', extractErrorMessage(error))
    } finally {
      setActionBusy(false)
    }
  }

  const markInvoiceAsPaid = async (sourceInvoice: Invoice) => {
    const invoice = sortedInvoices.find((entry) => entry.id === sourceInvoice.id) ?? sourceInvoice
    const currentStatus = withOverdueStatus(invoice)
    if (currentStatus === 'Paid' || currentStatus === 'Void') return
    if (currentStatus === 'Draft') {
      pushToast('info', 'Mark invoice as sent before recording payment.')
      return
    }

    const amount = totalAmount(invoice.items, invoice.taxRate, invoice.discountRate)

    setActionBusy(true)
    try {
      if (mode === 'fallback') {
        markAsPaid(invoice.id)
        pushToast('success', 'Payment recorded.')
        invoiceAnalytics.trackMarkPaidSuccess(invoice.id, amount)
        return
      }

      await api.markInvoicePaid(invoice.id, {
        paid_date: today(),
        payment_method: 'manual',
      })
      await refreshFromApi()
      pushToast('success', 'Payment recorded.')
      invoiceAnalytics.trackMarkPaidSuccess(invoice.id, amount)
    } catch (error) {
      pushToast('error', extractErrorMessage(error))
    } finally {
      setActionBusy(false)
    }
  }

  const voidInvoice = async (sourceInvoice: Invoice) => {
    const invoice = sortedInvoices.find((entry) => entry.id === sourceInvoice.id) ?? sourceInvoice
    if (withOverdueStatus(invoice) === 'Void') return

    setVoidConfirm({ open: true, invoiceId: invoice.id })
  }

  const confirmVoid = useCallback(async () => {
    if (!voidConfirm?.invoiceId) return
    const invoice = sortedInvoices.find((entry) => entry.id === voidConfirm.invoiceId)
    if (!invoice) return

    setVoidConfirm(null)
    setActionBusy(true)
    try {
      if (mode === 'fallback') {
        markAsVoid(invoice.id)
        pushToast('info', 'Invoice voided.')
        return
      }

      await api.voidInvoice(invoice.id, { reason: 'Voided by user action' })
      await refreshFromApi()
      pushToast('info', 'Invoice voided.')
    } catch (error) {
      pushToast('error', extractErrorMessage(error))
    } finally {
      setActionBusy(false)
    }
  }, [mode, refreshFromApi, sortedInvoices, voidConfirm])

  const requestSend = useCallback(
    (invoice: Invoice) => {
      sendAnalytics.trackSendClicked(invoice.id)
      if (!isPro) {
        openUpgradeModal(invoice.id)
        return
      }
      openSendPanel(invoice)
    },
    [isPro, openUpgradeModal, openSendPanel, sendAnalytics],
  )

  const submitSend = async () => {
    if (!sendTargetInvoiceId) return
    const invoice = sortedInvoices.find((entry) => entry.id === sendTargetInvoiceId)
    if (!invoice) {
      setSendError('Invoice not found.')
      return
    }
    if (!EMAIL_REGEX.test(sendForm.to.trim())) {
      setSendError('Enter a valid recipient email.')
      return
    }

    sendAnalytics.trackSendAttempted(invoice.id, sendForm.to.trim())

    setSendBusyState(true)
    setSendError(null)
    try {
      if (mode === 'fallback') {
        recordSend(invoice.id)
        pushToast('success', `Invoice sent to ${sendForm.to.trim()}.`)
        closeSendPanel()
        sendAnalytics.trackSendSuccess(invoice.id, sendForm.to.trim())
        return
      }

      await api.sendInvoiceEmail(invoice.id, {
        to: sendForm.to.trim(),
        subject: sendForm.subject.trim(),
        message: sendForm.message.trim(),
        attach_pdf: sendForm.attachPdf,
        send_copy_to_me: sendForm.sendCopyToMe,
      })
      await refreshFromApi()
      pushToast('success', `Invoice sent to ${sendForm.to.trim()}.`)
      closeSendPanel()
      sendAnalytics.trackSendSuccess(invoice.id, sendForm.to.trim())
    } catch (error) {
      sendAnalytics.trackSendFailed(error as Error, invoice.id, sendForm.to.trim())
      setSendError(extractErrorMessage(error))
    } finally {
      setSendBusyState(false)
    }
  }

  const downloadInvoice = async (invoice: Invoice) => {
    setActionBusy(true)
    try {
      const fileName = `${invoice.number}.pdf`

      if (mode === 'connected') {
        const pdfResult = await api.downloadInvoicePdf(invoice.id)
        savePdfResult(pdfResult, fileName)
      } else {
        try {
          const { generateInvoicePDF } = await import('./pdfGenerator')
          const pdfBlob = await generateInvoicePDF(invoice)
          saveBlobAsFile(pdfBlob, fileName)
        } catch {
          const didOpenPrintWindow = openInvoicePrintWindow(invoice)
          if (!didOpenPrintWindow) {
            throw new Error('Unable to download the PDF. Check your popup settings and try again.')
          }
        }
      }

      pushToast('success', 'PDF ready.')
    } catch (error) {
      pushToast('error', extractErrorMessage(error))
    } finally {
      setActionBusy(false)
    }
  }

  const handleLogout = useCallback(() => {
    clearStoredAuthUserProfile()
    setApiToken('')
    navigate('/')
  }, [navigate])

  if (loadingInitial) {
    return (
      <div className="brand-loader">
        <div className="brand-loader-content">
          <div className="brand-loader-logo">
            <img src="/otilor.png" alt="Otilor" style={{ height: '48px', width: 'auto' }} />
          </div>
          <div className="brand-loader-text">
            <p>Get paid. Stay clear.</p>
          </div>
          <div className="brand-loader-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppShell
        activeNav={activeNav}
        isPro={isPro}
        onTogglePro={() => setIsPro(!isPro)}
        onGoDashboard={() => navigate('/dashboard')}
        onGoInvoices={openInvoicesList}
        onGoCreate={openCreateInvoice}
        onGoClients={() => navigate('/clients')}
        onGoSettings={() => navigate('/settings')}
        onGoAnalytics={() => navigate('/analytics')}
        onLogout={handleLogout}
      >
        {apiBanner && (
          <article className="panel">
            <h3>Connection Notice</h3>
            <p>{apiBanner}</p>
          </article>
        )}

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                metrics={metrics}
                sortedInvoices={sortedInvoices}
                draftCount={draftCount}
                onAddNew={openCreateInvoice}
                onViewAll={openInvoicesList}
                onViewFiltered={openInvoicesFiltered}
                onOpenInvoice={openInvoiceDetail}
              />
            }
          />
          <Route
            path="/invoices"
            element={
              <InvoicesPage
                invoices={sortedInvoices}
                onAddNew={openCreateInvoice}
                onOpenInvoice={openInvoiceDetail}
              />
            }
          />
          <Route
            path="/clients"
            element={
              <ClientsPage
                clients={clients.clients}
                onSelectClient={(clientId) => {
                  const client = clients.clients.find((c) => c.id === clientId)
                  if (client) {
                    patchBuilder({
                      clientId: client.id,
                      clientName: client.name,
                      clientEmail: client.email ?? '',
                    })
                    navigate('/invoices/new')
                  }
                }}
                onCreateClient={async (name, email) => {
                  try {
                    const created = await api.createClient({ name, email: email || undefined })
                    clients.addClient({ id: created.id, name: created.name, email: created.email ?? null })
                    pushToast('success', `Client "${name}" created.`)
                  } catch (err) {
                    pushToast('error', extractErrorMessage(err))
                    throw err
                  }
                }}
              />
            }
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/analytics" element={<AnalyticsPage invoices={sortedInvoices} />} />
          <Route
            path="/invoices/new"
            element={
              <ResponsiveBuilder
                editingInvoiceId={editingInvoiceId}
                editNotice={editNotice}
                builder={builderForm}
                clients={clients.clients}
                builderError={builderError}
                actionBusy={actionBusy}
                previewInvoice={toPreviewInvoice(builderForm, 'NEW')}
                onSelectExistingClient={selectExistingClient}
                onPatchBuilder={patchBuilder}
                onAddItem={addItem}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                onCancel={() => navigate('/dashboard')}
                onSave={() => void upsertInvoice()}
              />
            }
          />
          <Route
            path="/invoices/:invoiceId/edit"
            element={
              <ResponsiveBuilder
                editingInvoiceId={editingInvoiceId}
                editNotice={editNotice}
                builder={builderForm}
                clients={clients.clients}
                builderError={builderError}
                actionBusy={actionBusy}
                previewInvoice={toPreviewInvoice(builderForm, 'EDITING')}
                onSelectExistingClient={selectExistingClient}
                onPatchBuilder={patchBuilder}
                onAddItem={addItem}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
                onCancel={() => {
                  if (editingInvoiceId) {
                    navigate(`/invoices/${encodeURIComponent(editingInvoiceId)}`)
                    return
                  }
                  navigate('/dashboard')
                }}
                onSave={() => void upsertInvoice()}
              />
            }
          />
          <Route
            path="/invoices/:invoiceId"
            element={
              <DetailRoute
                onCreateInvoice={openCreateInvoice}
                onDownload={(invoice) => void downloadInvoice(invoice)}
                onEdit={openInvoiceEditor}
                onMarkSent={(invoice) => void markInvoiceAsSent(invoice)}
                onMarkPaid={(invoice) => void markInvoiceAsPaid(invoice)}
                onSend={requestSend}
                onVoid={(invoice) => void voidInvoice(invoice)}
              />
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppShell>

      <SendPanel
        visible={showSendPanel}
        busy={sendBusy}
        error={sendError}
        form={sendForm}
        onClose={closeSendPanel}
        onSubmit={() => void submitSend()}
        onChange={updateForm}
      />

      <UpgradeModal
        source="request_send"
        visible={showUpgradeModal}
        onClose={closeUpgradeModal}
        onUpgrade={() => {
          upgradeAnalytics.trackUpgradeCompleted('monthly', 999)
          setIsPro(true)
          closeUpgradeModal()

          if (!upgradeTargetInvoiceId) return
          const invoice = sortedInvoices.find((entry) => entry.id === upgradeTargetInvoiceId)
          if (invoice) {
            openSendPanel(invoice)
          }
        }}
      />

      <ConfirmDialog
        isOpen={!!voidConfirm?.open}
        onClose={() => setVoidConfirm(null)}
        onConfirm={confirmVoid}
        title="Void Invoice"
        message="Voiding this invoice is irreversible in v1. Are you sure?"
        confirmLabel="Void"
        variant="danger"
      />

      <Toast toast={toast.toast} />
    </>
  )
}
export default AppWorkspace
