export type InvoiceStatus = 'Draft' | 'Sent' | 'Overdue' | 'Paid' | 'Void'

export interface ApiErrorField {
  field: string
  message: string
}

export class ApiError extends Error {
  status: number
  code: string
  fieldErrors: ApiErrorField[]
  requestId: string | null

  constructor(
    message: string,
    options: {
      status: number
      code: string
      fieldErrors?: ApiErrorField[]
      requestId?: string | null
    },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.fieldErrors = options.fieldErrors ?? []
    this.requestId = options.requestId ?? null
  }
}

interface Envelope<T> {
  data: T
}

interface CursorMeta {
  next_cursor: string | null
  has_more: boolean
}

interface PaginatedEnvelope<T> extends Envelope<T> {
  meta: CursorMeta
}

export interface ApiClientSummary {
  id: string
  name: string
  email: string | null
}

export interface ApiClient extends ApiClientSummary {
  phone: string | null
  billing_address: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  } | null
}

interface ApiInvoiceLineItem {
  id: string
  description: string
  quantity: string
  unit_price: string
  amount: string
}

interface ApiInvoiceTax {
  name: string
  rate_percent: string
  amount?: string
}

interface ApiInvoiceDiscount {
  type: 'percent' | 'fixed'
  value: string
  amount?: string
}

interface ApiInvoiceTotals {
  subtotal: string
  tax: string
  discount: string
  total: string
}

export interface ApiInvoice {
  id: string
  number: string
  client_id: string
  status: InvoiceStatus
  issue_date: string
  due_date: string
  currency: string
  line_items: ApiInvoiceLineItem[]
  tax?: ApiInvoiceTax
  discount?: ApiInvoiceDiscount
  totals: ApiInvoiceTotals
  notes: string
  sent_at: string | null
  paid_at: string | null
  voided_at: string | null
  version: number
  created_at: string
  updated_at: string
}

export interface ApiInvoiceListItem {
  id: string
  number: string
  client_id: string
  status: InvoiceStatus
  due_date: string
  totals: { total: string; currency: string }
  updated_at: string
}

export interface ApiInvoiceEvent {
  id: string
  type:
    | 'invoice_created'
    | 'invoice_updated'
    | 'invoice_marked_sent'
    | 'invoice_sent_email'
    | 'invoice_marked_paid'
    | 'invoice_voided'
  occurred_at: string
  actor: string
}

interface ApiDashboardSummary {
  total_unpaid: { currency: string; amount: string }
  overdue_count: number
  paid_this_month: { currency: string; amount: string }
  draft_count: number
}

export interface DashboardSummary {
  unpaid: number
  overdue: number
  paidThisMonth: number
  draft: number
}

export interface PaginatedResult<T> {
  data: T
  nextCursor: string | null
  hasMore: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'
const API_TOKEN = import.meta.env.VITE_API_TOKEN ?? ''

const createHeaders = (extra?: Record<string, string>): Headers => {
  const headers = new Headers({
    Accept: 'application/json',
    ...extra,
  })

  if (API_TOKEN) {
    headers.set('Authorization', `Bearer ${API_TOKEN}`)
  }

  return headers
}

const numberFromAmount = (value: string | undefined): number => {
  const parsed = Number(value ?? '0')
  return Number.isFinite(parsed) ? parsed : 0
}

const parseErrorResponse = async (response: Response): Promise<ApiError> => {
  try {
    const payload = (await response.json()) as {
      error?: { code?: string; message?: string; field_errors?: ApiErrorField[] }
      request_id?: string
    }

    return new ApiError(payload.error?.message ?? 'API request failed.', {
      status: response.status,
      code: payload.error?.code ?? 'UNKNOWN_ERROR',
      fieldErrors: payload.error?.field_errors ?? [],
      requestId: payload.request_id ?? null,
    })
  } catch {
    return new ApiError('API request failed.', {
      status: response.status,
      code: 'UNKNOWN_ERROR',
    })
  }
}

const buildUrl = (path: string, query?: Record<string, string | number | undefined>): string => {
  const url = new URL(path, API_BASE_URL)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

const requestEnvelope = async <T>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PATCH'
    query?: Record<string, string | number | undefined>
    body?: unknown
    headers?: Record<string, string>
  },
): Promise<T> => {
  const response = await fetch(buildUrl(path, options?.query), {
    method: options?.method ?? 'GET',
    headers: createHeaders({
      ...(options?.body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
      ...(options?.headers ?? {}),
    }),
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw await parseErrorResponse(response)
  }

  const payload = (await response.json()) as Envelope<T>
  return payload.data
}

const requestPaginated = async <T>(
  path: string,
  options?: {
    method?: 'GET' | 'POST' | 'PATCH'
    query?: Record<string, string | number | undefined>
    body?: unknown
    headers?: Record<string, string>
  },
): Promise<PaginatedResult<T>> => {
  const response = await fetch(buildUrl(path, options?.query), {
    method: options?.method ?? 'GET',
    headers: createHeaders({
      ...(options?.body ? { 'Content-Type': 'application/json; charset=utf-8' } : {}),
      ...(options?.headers ?? {}),
    }),
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw await parseErrorResponse(response)
  }

  const payload = (await response.json()) as PaginatedEnvelope<T>
  return {
    data: payload.data,
    nextCursor: payload.meta?.next_cursor ?? null,
    hasMore: payload.meta?.has_more ?? false,
  }
}

const requestPdf = async (invoiceId: string): Promise<Blob | string> => {
  const response = await fetch(buildUrl(`/v1/invoices/${invoiceId}/pdf`), {
    method: 'GET',
    headers: createHeaders(),
  })

  if (!response.ok) {
    throw await parseErrorResponse(response)
  }

  const contentType = response.headers.get('Content-Type') ?? ''

  if (contentType.includes('application/pdf')) {
    return response.blob()
  }

  const payload = (await response.json()) as Envelope<{ download_url: string }>
  return payload.data.download_url
}

export const api = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const data = await requestEnvelope<ApiDashboardSummary>('/v1/dashboard/summary')
    return {
      unpaid: numberFromAmount(data.total_unpaid.amount),
      overdue: data.overdue_count,
      paidThisMonth: numberFromAmount(data.paid_this_month.amount),
      draft: data.draft_count,
    }
  },

  async listClients(): Promise<ApiClientSummary[]> {
    return requestEnvelope<ApiClientSummary[]>('/v1/clients', {
      query: { limit: 100 },
    })
  },

  async createClient(payload: { name: string; email?: string }): Promise<ApiClient> {
    return requestEnvelope<ApiClient>('/v1/clients', {
      method: 'POST',
      body: payload,
    })
  },

  async updateClient(clientId: string, payload: { name?: string; email?: string | null }): Promise<ApiClient> {
    return requestEnvelope<ApiClient>(`/v1/clients/${clientId}`, {
      method: 'PATCH',
      body: payload,
    })
  },

  async getClient(clientId: string): Promise<ApiClient> {
    return requestEnvelope<ApiClient>(`/v1/clients/${clientId}`)
  },

  async listInvoiceIds(limit = 200): Promise<string[]> {
    const items = await requestEnvelope<ApiInvoiceListItem[]>('/v1/invoices', {
      query: { limit, sort: 'created_at_desc' },
    })
    return items.map((item) => item.id)
  },

  async listInvoices(options?: {
    limit?: number
    cursor?: string
    status?: InvoiceStatus
    sort?: 'created_at_desc' | 'due_date_asc'
    clientId?: string
  }): Promise<PaginatedResult<ApiInvoiceListItem[]>> {
    return requestPaginated<ApiInvoiceListItem[]>('/v1/invoices', {
      query: {
        limit: options?.limit,
        cursor: options?.cursor,
        status: options?.status,
        sort: options?.sort,
        client_id: options?.clientId,
      },
    })
  },

  async getInvoice(invoiceId: string): Promise<ApiInvoice> {
    return requestEnvelope<ApiInvoice>(`/v1/invoices/${invoiceId}`)
  },

  async createInvoice(payload: {
    client_id: string
    issue_date: string
    due_date: string
    currency: string
    line_items: Array<{ description: string; quantity: string; unit_price: string }>
    tax?: { name: string; rate_percent: string }
    discount?: { type: 'percent' | 'fixed'; value: string }
    notes?: string
  }): Promise<ApiInvoice> {
    return requestEnvelope<ApiInvoice>('/v1/invoices', {
      method: 'POST',
      body: payload,
    })
  },

  async updateInvoice(
    invoiceId: string,
    payload: {
      client_id: string
      issue_date: string
      due_date: string
      line_items: Array<{ description: string; quantity: string; unit_price: string }>
      tax?: { name: string; rate_percent: string }
      discount?: { type: 'percent' | 'fixed'; value: string }
      notes?: string
    },
    version: number,
  ): Promise<ApiInvoice> {
    return requestEnvelope<ApiInvoice>(`/v1/invoices/${invoiceId}`, {
      method: 'PATCH',
      body: payload,
      headers: { 'If-Match': String(version) },
    })
  },

  async getInvoiceEvents(invoiceId: string): Promise<ApiInvoiceEvent[]> {
    return requestEnvelope<ApiInvoiceEvent[]>(`/v1/invoices/${invoiceId}/events`)
  },

  async markInvoiceSent(invoiceId: string, payload: { sent_date: string; note?: string }): Promise<void> {
    await requestEnvelope(`/v1/invoices/${invoiceId}/mark-sent`, {
      method: 'POST',
      body: payload,
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
  },

  async sendInvoiceEmail(
    invoiceId: string,
    payload: {
      to: string
      subject: string
      message: string
      attach_pdf: boolean
      send_copy_to_me: boolean
    },
  ): Promise<void> {
    await requestEnvelope(`/v1/invoices/${invoiceId}/send-email`, {
      method: 'POST',
      body: payload,
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
  },

  async markInvoicePaid(invoiceId: string, payload: { paid_date: string; payment_method?: string }): Promise<void> {
    await requestEnvelope(`/v1/invoices/${invoiceId}/mark-paid`, {
      method: 'POST',
      body: payload,
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
  },

  async sendPaymentNotification(
    invoiceId: string,
    payload: {
      to: string
      subject: string
      message: string
      send_copy_to_me: boolean
    },
  ): Promise<void> {
    await requestEnvelope(`/v1/invoices/${invoiceId}/send-payment-notification`, {
      method: 'POST',
      body: payload,
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
  },

  async voidInvoice(invoiceId: string, payload: { reason?: string }): Promise<void> {
    await requestEnvelope(`/v1/invoices/${invoiceId}/void`, {
      method: 'POST',
      body: payload,
      headers: { 'Idempotency-Key': crypto.randomUUID() },
    })
  },

  async downloadInvoicePdf(invoiceId: string): Promise<Blob | string> {
    return requestPdf(invoiceId)
  },
}
