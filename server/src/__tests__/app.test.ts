import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../index'

describe('Otilor Server API Test Suite', () => {
  let authToken: string

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/v1/auth/login')
      .send({ email: 'test@otilor.dev', name: 'Test User' })
    expect(loginRes.status).toBe(200)
    authToken = loginRes.body.data.access_token
  })

  describe('GET /healthz', () => {
    it('returns status ok', async () => {
      const response = await request(app).get('/healthz')
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'ok')
    })
  })

  describe('GET /v1/dashboard/summary', () => {
    it('returns dashboard metrics summary', async () => {
      const response = await request(app)
        .get('/v1/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('total_unpaid')
      expect(response.body.data).toHaveProperty('overdue_count')
      expect(response.body.data).toHaveProperty('paid_this_month')
    })
  })

  describe('Clients API', () => {
    let createdClientId: string

    it('lists clients with cursor pagination', async () => {
      const response = await request(app)
        .get('/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body).toHaveProperty('meta')
    })

    it('creates a new client', async () => {
      const payload = {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '+1-555-0199',
        address: '100 Innovation Way, Tech City',
      }
      const response = await request(app)
        .post('/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)

      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.name).toBe('Acme Corporation')
      expect(response.body.data.email).toBe('billing@acme.com')

      createdClientId = response.body.data.id
    })

    it('fetches single client details', async () => {
      const response = await request(app)
        .get(`/v1/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe(createdClientId)
      expect(response.body.data.name).toBe('Acme Corporation')
    })

    it('updates a client', async () => {
      const response = await request(app)
        .patch(`/v1/clients/${createdClientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme Global Inc' })

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe('Acme Global Inc')
    })

    it('fails to fetch non-existent client', async () => {
      const response = await request(app)
        .get('/v1/clients/non_existent_id')
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })
  })

  describe('Invoices API & Lifecycle', () => {
    let clientId: string
    let invoiceId: string
    let invoiceVersion: number

    it('setup client for invoice testing', async () => {
      const res = await request(app)
        .post('/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Starlight Corp',
          email: 'invoices@starlight.io',
        })
      expect(res.status).toBe(201)
      clientId = res.body.data.id
    })

    it('creates a draft invoice', async () => {
      const payload = {
        client_id: clientId,
        issue_date: '2026-08-01',
        due_date: '2026-08-15',
        currency: 'USD',
        notes: 'Test invoice notes',
        tax: { name: 'VAT', rate_percent: '10.00' },
        line_items: [
          { description: 'Web Development Services', quantity: '10', unit_price: '100.00' },
        ],
      }

      const response = await request(app)
        .post('/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)

      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.status).toBe('Draft')

      invoiceId = response.body.data.id
      invoiceVersion = response.body.data.version
    })

    it('validates missing required fields on creation', async () => {
      const response = await request(app)
        .post('/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
      expect(response.status).toBe(422)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('updates draft invoice with version check (If-Match header)', async () => {
      const response = await request(app)
        .patch(`/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('If-Match', String(invoiceVersion))
        .send({ notes: 'Updated notes' })

      expect(response.status).toBe(200)
      expect(response.body.data.notes).toBe('Updated notes')
      expect(response.body.data.version).toBe(invoiceVersion + 1)
      invoiceVersion = response.body.data.version
    })

    it('handles version conflict (409 VERSION_CONFLICT)', async () => {
      const response = await request(app)
        .patch(`/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('If-Match', '999')
        .send({ notes: 'Conflict test' })

      expect(response.status).toBe(409)
      expect(response.body.error.code).toBe('VERSION_CONFLICT')
    })

    it('sends invoice email via /send-email endpoint', async () => {
      const emailPayload = {
        to: 'invoices@starlight.io',
        subject: 'Invoice from Otilor',
        message: 'Please find attached invoice details.',
        attach_pdf: true,
        send_copy_to_me: false,
      }

      const response = await request(app)
        .post(`/v1/invoices/${invoiceId}/send-email`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', `idem_send_email_${invoiceId}`)
        .send(emailPayload)

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('Sent')
      expect(response.body.data).toHaveProperty('delivery')
      expect(response.body.data.delivery).toHaveProperty('provider_message_id')
    })

    it('marks sent invoice as paid', async () => {
      const response = await request(app)
        .post(`/v1/invoices/${invoiceId}/mark-paid`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', `idem_mark_paid_${invoiceId}`)
        .send({ paid_date: '2026-08-03' })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('Paid')
    })

    it('prevents invalid status transition (Paid -> Sent)', async () => {
      const response = await request(app)
        .post(`/v1/invoices/${invoiceId}/mark-sent`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', `idem_mark_sent_${invoiceId}`)
        .send({ sent_date: '2026-08-04' })

      expect(response.status).toBe(409)
      expect(response.body.error.code).toBe('CONFLICT_STATUS_TRANSITION')
    })

    it('fetches invoice timeline events', async () => {
      const response = await request(app)
        .get(`/v1/invoices/${invoiceId}/events`)
        .set('Authorization', `Bearer ${authToken}`)
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('Idempotency Middleware', () => {
    it('returns cached response when same Idempotency-Key is reused', async () => {
      const key = `idem_key_${Date.now()}`

      // Create client
      const cRes = await request(app)
        .post('/v1/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Idem Client', email: 'idem@test.com' })
      expect(cRes.status).toBe(201)
      const cId = cRes.body.data.id

      // Create invoice
      const invRes = await request(app)
        .post('/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          client_id: cId,
          issue_date: '2026-08-01',
          due_date: '2026-08-15',
          currency: 'USD',
          line_items: [{ description: 'Service', quantity: '1', unit_price: '50.00' }],
        })
      expect(invRes.status).toBe(201)
      const invId = invRes.body.data.id

      // First request with idempotency key
      const req1 = await request(app)
        .post(`/v1/invoices/${invId}/mark-sent`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', key)
        .send({ sent_date: '2026-08-02' })

      expect(req1.status).toBe(200)

      // Second request with same idempotency key
      const req2 = await request(app)
        .post(`/v1/invoices/${invId}/mark-sent`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', key)
        .send({ sent_date: '2026-08-02' })

      expect(req2.status).toBe(200)
      expect(req2.header['idempotency-replayed']).toBe('true')
      expect(req2.body).toEqual(req1.body)
    })
  })
})
