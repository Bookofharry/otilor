import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { compareDateValues, statusTone, toDisplayDate, toMoney, totalAmount, withOverdueStatus } from '../app/invoiceUtils'
import { fromApiInvoice } from '../app/transformers'
import type { Invoice, InvoiceStatus } from '../app/types'
import EmptyState from '../components/ui/EmptyState'
import { useApp } from '../context'
import { useInvoiceAnalytics } from '../context/useAnalytics'

type InvoiceFilter = 'all' | 'draft' | 'sent' | 'overdue' | 'paid' | 'void'
type SortOption = 'newest' | 'oldest' | 'due_soon' | 'amount_high' | 'amount_low'
const INVOICES_PER_PAGE = 12
const REMOTE_BATCH_SIZE = 24

interface InvoicesPageProps {
  invoices: Invoice[]
  onAddNew: () => void
  onOpenInvoice: (invoiceId: string) => void
}

const invoiceFilters: InvoiceFilter[] = ['all', 'draft', 'sent', 'overdue', 'paid', 'void']
const filterLabels: Record<InvoiceFilter, string> = {
  all: 'All',
  draft: 'Draft',
  sent: 'Sent',
  overdue: 'Overdue',
  paid: 'Paid',
  void: 'Void',
}

function InvoicesPage({ invoices, onAddNew, onOpenInvoice }: InvoicesPageProps) {
  const { mode, clients } = useApp()
  const invoiceAnalytics = useInvoiceAnalytics()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [remoteInvoices, setRemoteInvoices] = useState<Invoice[]>([])
  const [remoteCursor, setRemoteCursor] = useState<string | null>(null)
  const [remoteHasMore, setRemoteHasMore] = useState(false)
  const [remoteLoading, setRemoteLoading] = useState(false)
  const [remoteLoadingMore, setRemoteLoadingMore] = useState(false)
  const [remoteError, setRemoteError] = useState<string | null>(null)
  const statusParam = searchParams.get('status')
  const activeFilter: InvoiceFilter = invoiceFilters.includes(statusParam as InvoiceFilter)
    ? (statusParam as InvoiceFilter)
    : 'all'
  const isConnectedMode = mode === 'connected'

  const clientById = useMemo(
    () => new Map(clients.clients.map((client) => [client.id, client])),
    [clients.clients],
  )

  const cachedInvoiceById = useMemo(
    () => new Map(invoices.map((invoice) => [invoice.id, invoice])),
    [invoices],
  )

  const fetchRemoteInvoices = useCallback(
    async (cursor?: string | null) => {
      const nextSort = sortBy === 'due_soon' ? 'due_date_asc' : 'created_at_desc'
      const response = await api.listInvoices({
        limit: REMOTE_BATCH_SIZE,
        cursor: cursor ?? undefined,
        status: activeFilter === 'all' ? undefined : (filterLabels[activeFilter] as InvoiceStatus),
        sort: nextSort,
      })

      const hydratedInvoices = await Promise.all(
        response.data.map(async (summary) => {
          const cachedInvoice = cachedInvoiceById.get(summary.id)
          if (cachedInvoice) return cachedInvoice

          const invoice = await api.getInvoice(summary.id)
          return fromApiInvoice(invoice, clientById.get(invoice.client_id), [])
        }),
      )

      return {
        invoices: hydratedInvoices,
        nextCursor: response.nextCursor,
        hasMore: response.hasMore,
      }
    },
    [activeFilter, cachedInvoiceById, clientById, sortBy],
  )

  useEffect(() => {
    if (!isConnectedMode) {
      setRemoteInvoices([])
      setRemoteCursor(null)
      setRemoteHasMore(false)
      setRemoteLoading(false)
      setRemoteLoadingMore(false)
      setRemoteError(null)
      return
    }

    let cancelled = false

    const loadInitialPage = async () => {
      setRemoteLoading(true)
      setRemoteError(null)
      try {
        const result = await fetchRemoteInvoices(null)
        if (cancelled) return

        setRemoteInvoices(result.invoices)
        setRemoteCursor(result.nextCursor)
        setRemoteHasMore(result.hasMore)
      } catch (error) {
        if (cancelled) return
        setRemoteInvoices([])
        setRemoteCursor(null)
        setRemoteHasMore(false)
        setRemoteError(error instanceof Error ? error.message : 'Unable to load invoices.')
      } finally {
        if (!cancelled) setRemoteLoading(false)
      }
    }

    void loadInitialPage()

    return () => {
      cancelled = true
    }
  }, [fetchRemoteInvoices, isConnectedMode])

  const loadMoreRemoteInvoices = useCallback(async () => {
    if (!isConnectedMode || !remoteHasMore || !remoteCursor || remoteLoadingMore) return

    setRemoteLoadingMore(true)
    setRemoteError(null)
    try {
      const result = await fetchRemoteInvoices(remoteCursor)
      setRemoteInvoices((currentInvoices) => {
        const mergedInvoices = [...currentInvoices]
        const invoiceIds = new Set(currentInvoices.map((invoice) => invoice.id))

        result.invoices.forEach((invoice) => {
          if (!invoiceIds.has(invoice.id)) {
            invoiceIds.add(invoice.id)
            mergedInvoices.push(invoice)
          }
        })

        return mergedInvoices
      })
      setRemoteCursor(result.nextCursor)
      setRemoteHasMore(result.hasMore)
    } catch (error) {
      setRemoteError(error instanceof Error ? error.message : 'Unable to load more invoices.')
    } finally {
      setRemoteLoadingMore(false)
    }
  }, [fetchRemoteInvoices, isConnectedMode, remoteCursor, remoteHasMore, remoteLoadingMore])

  const sourceInvoices = isConnectedMode ? remoteInvoices : invoices

  const invoiceRows = useMemo(
    () =>
      sourceInvoices.map((invoice) => {
        const status = withOverdueStatus(invoice)
        const amount = totalAmount(invoice.items, invoice.taxRate, invoice.discountRate)

        return {
          invoice,
          status,
          amount,
          amountLabel: toMoney(amount),
          issueLabel: toDisplayDate(invoice.issueDate),
          dueLabel: toDisplayDate(invoice.dueDate),
        }
      }),
    [sourceInvoices],
  )

  const counts = useMemo<Record<InvoiceFilter, number>>(
    () =>
      invoiceRows.reduce(
        (acc, row) => {
          acc.all += 1
          acc[row.status.toLowerCase() as Exclude<InvoiceFilter, 'all'>] += 1
          return acc
        },
        { all: 0, draft: 0, sent: 0, overdue: 0, paid: 0, void: 0 },
      ),
    [invoiceRows],
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, query, sortBy])

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const matchesFilter = (status: InvoiceStatus) => {
      if (activeFilter === 'all') return true
      return status.toLowerCase() === activeFilter
    }

    const matchesQuery = (invoice: Invoice) => {
      if (!normalizedQuery) return true
      return (
        invoice.number.toLowerCase().includes(normalizedQuery) ||
        invoice.clientName.toLowerCase().includes(normalizedQuery) ||
        invoice.clientEmail.toLowerCase().includes(normalizedQuery)
      )
    }

    const rows = invoiceRows.filter((row) => matchesFilter(row.status) && matchesQuery(row.invoice))

    return rows.sort((left, right) => {
      if (sortBy === 'oldest') {
        return compareDateValues(left.invoice.updatedAt, right.invoice.updatedAt)
      }
      if (sortBy === 'due_soon') {
        return compareDateValues(left.invoice.dueDate, right.invoice.dueDate)
      }
      if (sortBy === 'amount_high') {
        return right.amount - left.amount
      }
      if (sortBy === 'amount_low') {
        return left.amount - right.amount
      }
      return compareDateValues(right.invoice.updatedAt, left.invoice.updatedAt)
    })
  }, [activeFilter, invoiceRows, query, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / INVOICES_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * INVOICES_PER_PAGE
    return filteredInvoices.slice(startIndex, startIndex + INVOICES_PER_PAGE)
  }, [currentPage, filteredInvoices])

  const pageStart = filteredInvoices.length === 0 ? 0 : (currentPage - 1) * INVOICES_PER_PAGE + 1
  const pageEnd = Math.min(currentPage * INVOICES_PER_PAGE, filteredInvoices.length)
  const displayedInvoices = isConnectedMode ? filteredInvoices : paginatedInvoices

  const handleCreateInvoice = () => {
    invoiceAnalytics.trackCreateInvoice('invoices_page')
    onAddNew()
  }

  const handleOpenInvoice = (invoiceId: string, status: InvoiceStatus) => {
    invoiceAnalytics.trackDetailViewed(invoiceId, status)
    onOpenInvoice(invoiceId)
  }

  const handleFilterChange = (filter: InvoiceFilter) => {
    const nextParams = new URLSearchParams(searchParams)
    if (filter === 'all') {
      nextParams.delete('status')
    } else {
      nextParams.set('status', filter)
    }
    setSearchParams(nextParams)
  }

  const emptyTitle = query.trim() ? 'No invoices match your search' : 'No invoices in this view'
  const emptyDescription = query.trim()
    ? isConnectedMode && remoteHasMore
      ? 'Try a different invoice number, client name, or email. You can also load more invoices to widen the search.'
      : 'Try a different invoice number, client name, or email.'
    : activeFilter === 'all'
      ? 'Create your first invoice to start building your history.'
      : `No ${filterLabels[activeFilter].toLowerCase()} invoices yet.`

  return (
    <section className="screen invoices-screen">
      <div className="section-heading invoices-heading">
        <h2>Invoices</h2>
        <p>Browse current and previous invoices from one place.</p>
      </div>

      <div className="invoices-toolbar">
        <div className="search-box invoices-search-box">
          <input
            className="search-input"
            type="text"
            placeholder="Search by invoice, client, or email"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <label className="invoices-sort-control">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="due_soon">Due soon</option>
            <option value="amount_high">Highest amount</option>
            <option value="amount_low">Lowest amount</option>
          </select>
        </label>

        <button className="primary-button invoices-create-button" type="button" onClick={handleCreateInvoice}>
          Create Invoice
        </button>
      </div>

      <div className="invoices-filter-bar" role="tablist" aria-label="Invoice status filters">
        {invoiceFilters.map((filter) => (
          <button
            key={filter}
            className={`invoices-filter-chip ${activeFilter === filter ? 'is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter}
            onClick={() => handleFilterChange(filter)}
          >
            <span>{filterLabels[filter]}</span>
            {!isConnectedMode && <strong>{counts[filter]}</strong>}
          </button>
        ))}
      </div>

      <div className="invoices-results-bar">
        <p>
          {isConnectedMode
            ? query.trim()
              ? `Showing ${filteredInvoices.length} of ${sourceInvoices.length} loaded invoices`
              : `Loaded ${sourceInvoices.length} invoice${sourceInvoices.length === 1 ? '' : 's'}`
            : filteredInvoices.length === 0
              ? '0 invoices shown'
              : `Showing ${pageStart}-${pageEnd} of ${filteredInvoices.length} invoices`}
        </p>
        {query.trim() && (
          <button className="ghost-button invoices-clear-button" type="button" onClick={() => setQuery('')}>
            Clear search
          </button>
        )}
      </div>

      {isConnectedMode && remoteLoading && sourceInvoices.length === 0 ? (
        <article className="panel">
          <div className="timeline-loading">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        </article>
      ) : remoteError && sourceInvoices.length === 0 ? (
        <article className="panel">
          <EmptyState
            title="Unable to load invoices"
            description={remoteError}
            actionLabel="Try Again"
            onAction={() => {
              if (isConnectedMode) {
                void fetchRemoteInvoices(null).then((result) => {
                  setRemoteInvoices(result.invoices)
                  setRemoteCursor(result.nextCursor)
                  setRemoteHasMore(result.hasMore)
                  setRemoteError(null)
                }).catch((error) => {
                  setRemoteError(error instanceof Error ? error.message : 'Unable to load invoices.')
                })
              }
            }}
          />
        </article>
      ) : filteredInvoices.length === 0 ? (
        <article className="panel">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel="Create Invoice"
            onAction={handleCreateInvoice}
          />
        </article>
      ) : (
        <>
          <div className="table-wrap invoices-table-wrap">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Issued</th>
                  <th>Due</th>
                </tr>
              </thead>
              <tbody>
                {displayedInvoices.map((row) => (
                  <tr
                    key={row.invoice.id}
                    className="clickable-row invoices-table-row"
                    onClick={() => handleOpenInvoice(row.invoice.id, row.status)}
                  >
                    <td className="invoices-primary-cell">{row.invoice.number}</td>
                    <td>
                      <div className="invoices-client-cell">
                        <strong>{row.invoice.clientName}</strong>
                        <span>{row.invoice.clientEmail || 'No email'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusTone(row.status)}`}>{row.status}</span>
                    </td>
                    <td className="invoices-metric-cell">{row.amountLabel}</td>
                    <td>{row.issueLabel}</td>
                    <td>{row.dueLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-list invoices-mobile-list">
            {displayedInvoices.map((row) => (
              <article
                key={row.invoice.id}
                className="invoice-card invoices-mobile-card"
                onClick={() => handleOpenInvoice(row.invoice.id, row.status)}
              >
                <div className="invoice-card-header">
                  <div>
                    <p className="invoice-number">{row.invoice.number}</p>
                    <p className="invoice-client">{row.invoice.clientName}</p>
                  </div>
                  <span className={`status-badge ${statusTone(row.status)}`}>{row.status}</span>
                </div>

                <div className="invoice-meta">
                  <span className="invoice-amount">{row.amountLabel}</span>
                  <span className="invoice-date">Due {row.dueLabel}</span>
                </div>

                <div className="invoices-mobile-details">
                  <p>
                    <span>Issued</span>
                    <strong>{row.issueLabel}</strong>
                  </p>
                  <p>
                    <span>Email</span>
                    <strong>{row.invoice.clientEmail || 'No email'}</strong>
                  </p>
                </div>
              </article>
            ))}
          </div>

          {isConnectedMode && (
            <div className="invoices-remote-footer">
              {remoteError && <p className="invoices-remote-error">{remoteError}</p>}
              {remoteHasMore && (
                <button
                  className="ghost-button invoices-load-more-button"
                  type="button"
                  onClick={() => void loadMoreRemoteInvoices()}
                  disabled={remoteLoadingMore}
                >
                  {remoteLoadingMore ? 'Loading more...' : 'Load More History'}
                </button>
              )}
            </div>
          )}

          {!isConnectedMode && totalPages > 1 && (
            <div className="invoices-pagination" aria-label="Invoice pagination">
              <button
                className="ghost-button invoices-pagination-button"
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <p className="invoices-pagination-summary">
                Page {currentPage} of {totalPages}
              </p>
              <button
                className="ghost-button invoices-pagination-button"
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default InvoicesPage
