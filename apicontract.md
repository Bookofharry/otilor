# SmartInvoice API Contract (v1)

## 1) Document Control

Document purpose:
- Define the exact integration contract between frontend and backend for SmartInvoice v1.
- Remove ambiguity in payloads, status transitions, and failure behavior.

Status:
- `Draft for implementation`

Version:
- `v1.0.0`

Scope:
- Web-first release with mobile-ready API behavior.
- Covers clients, invoices, dashboard summary, PDF export, and premium send.

Out of scope:
- Auth provider internals
- Recurring invoices
- Payment links
- Reminder automations

---

## 2) API Design Principles

- Contract-first development: backend and frontend implement against this document.
- Backward compatibility within major version (`/v1`).
- Explicit status transition rules enforced server-side.
- Strong validation with field-level errors.
- Idempotent mutation endpoints for safe retries.
- Consistent error schema and request tracing.

---

## 3) Conventions

## 3.1 Base URL and Versioning

- Base URL (production example): `https://api.smartinvoice.com`
- Version prefix: `/v1`
- Breaking changes require `/v2`

## 3.2 Content and Encoding

- Request `Content-Type`: `application/json; charset=utf-8`
- Response `Content-Type`: `application/json; charset=utf-8`
- UTF-8 encoding required

## 3.3 Authentication

- Required on all endpoints unless explicitly marked public.
- Header:
```http
Authorization: Bearer <access_token>
```

If token invalid or missing:
- Response: `401 Unauthorized`

## 3.4 Common Headers

- `X-Request-Id` (optional client-provided correlation id)
- `Idempotency-Key` (required for marked mutation endpoints)
- `If-Match` (required for optimistic concurrency on invoice update)

## 3.5 Date and Time

- Timestamps: ISO 8601 UTC, e.g. `2026-02-19T17:45:00Z`
- Dates without time: `YYYY-MM-DD` (account timezone semantics for due dates and paid/sent dates)

## 3.6 IDs

- Invoice id: `inv_<ulid>`
- Client id: `cli_<ulid>`
- Event id: `evt_<ulid>`

## 3.7 Money and Numbers

Money values are decimal strings (never float):
- `amount`: `"1234.56"`
- `currency`: ISO 4217 code, e.g. `"USD"`

Quantity rules:
- Decimal string, max 2 decimal places, > 0

## 3.8 Pagination

Cursor-based pagination:
- Query params: `limit`, `cursor`
- Response `meta`:
```json
{
  "next_cursor": "eyJpZCI6Imludl8xMjMifQ==",
  "has_more": true
}
```

## 3.9 Response Envelope

Success:
```json
{
  "data": {},
  "meta": {}
}
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "field_errors": [
      {
        "field": "due_date",
        "message": "Due date cannot be before issue date."
      }
    ]
  },
  "request_id": "req_01H..."
}
```

---

## 4) Core Resource Schemas

## 4.1 Client

```json
{
  "id": "cli_01J8N8KQ4C4WQ7ZP5V7S1N2A3B",
  "name": "Acme Studio",
  "email": "billing@acme.studio",
  "phone": "+1-202-555-0182",
  "billing_address": {
    "line1": "100 Main St",
    "line2": "Suite 5",
    "city": "Austin",
    "state": "TX",
    "postal_code": "78701",
    "country": "US"
  },
  "created_at": "2026-02-19T17:45:00Z",
  "updated_at": "2026-02-19T17:45:00Z"
}
```

Validation:
- `name` required, 1-120 chars
- `email` optional but must be valid format if present

## 4.2 Invoice Line Item

```json
{
  "id": "ili_01J8N8Q...",
  "description": "Website design",
  "quantity": "2.00",
  "unit_price": "500.00",
  "amount": "1000.00"
}
```

Validation:
- `description` required
- `quantity` > 0, up to 2 decimals
- `unit_price` >= 0, up to 2 decimals
- `amount` computed server-side from quantity x unit_price

## 4.3 Invoice

```json
{
  "id": "inv_01J8N8M3N7AH6QKX3A3N1Y2K5P",
  "number": "INV-2026-0012",
  "client_id": "cli_01J8N8KQ4C4WQ7ZP5V7S1N2A3B",
  "status": "Draft",
  "issue_date": "2026-02-19",
  "due_date": "2026-03-05",
  "currency": "USD",
  "line_items": [],
  "tax": {
    "name": "VAT",
    "rate_percent": "0.00",
    "amount": "0.00"
  },
  "discount": {
    "type": "percent",
    "value": "0.00",
    "amount": "0.00"
  },
  "totals": {
    "subtotal": "0.00",
    "tax": "0.00",
    "discount": "0.00",
    "total": "0.00"
  },
  "notes": "",
  "sent_at": null,
  "paid_at": null,
  "voided_at": null,
  "version": 1,
  "created_at": "2026-02-19T17:45:00Z",
  "updated_at": "2026-02-19T17:45:00Z"
}
```

Status enum:
- `Draft`
- `Sent`
- `Overdue`
- `Paid`
- `Void`

Important:
- `Viewed` is not a lifecycle status in v1.
- `Overdue` can be computed and persisted by scheduled backend job based on due date.

## 4.4 Dashboard Summary

```json
{
  "total_unpaid": {
    "currency": "USD",
    "amount": "6200.00"
  },
  "overdue_count": 3,
  "paid_this_month": {
    "currency": "USD",
    "amount": "4100.00"
  },
  "draft_count": 2
}
```

---

## 5) Status Transition Rules

Allowed transitions:

- `Draft -> Sent` (via `mark-sent` or premium `send-email`)
- `Sent -> Paid` (via `mark-paid`)
- `Overdue -> Paid` (via `mark-paid`)
- `Draft -> Void` (via `void`)
- `Sent -> Void` (via `void`)
- `Overdue -> Void` (via `void`)
- `Sent -> Overdue` (system transition when past due and unpaid)

Disallowed transitions:
- `Paid -> Sent`
- `Paid -> Draft`
- `Paid -> Void`
- `Void -> any`

If disallowed transition requested:
- Response: `409 Conflict`
- Error code: `CONFLICT_STATUS_TRANSITION`

---

## 6) Endpoint Catalog

## 6.1 Dashboard

### GET `/v1/dashboard/summary`

Purpose:
- Render dashboard KPIs.

Response `200`:
```json
{
  "data": {
    "total_unpaid": { "currency": "USD", "amount": "6200.00" },
    "overdue_count": 3,
    "paid_this_month": { "currency": "USD", "amount": "4100.00" },
    "draft_count": 2
  },
  "meta": {}
}
```

---

## 6.2 Clients

### GET `/v1/clients`

Query params:
- `limit` (default 20, max 100)
- `cursor` (optional)
- `q` (optional search by name/email)

Response `200`:
```json
{
  "data": [
    {
      "id": "cli_01J8N8KQ4C4WQ7ZP5V7S1N2A3B",
      "name": "Acme Studio",
      "email": "billing@acme.studio"
    }
  ],
  "meta": {
    "next_cursor": null,
    "has_more": false
  }
}
```

### POST `/v1/clients`

Request:
```json
{
  "name": "Acme Studio",
  "email": "billing@acme.studio",
  "phone": "+1-202-555-0182",
  "billing_address": {
    "line1": "100 Main St",
    "city": "Austin",
    "state": "TX",
    "postal_code": "78701",
    "country": "US"
  }
}
```

Response `201`:
- Returns full `Client` resource in `data`.

### GET `/v1/clients/{client_id}`

Response `200`:
- Returns full `Client` resource.

### PATCH `/v1/clients/{client_id}`

Request:
- Partial updates allowed.

Response `200`:
- Returns updated `Client`.

Errors:
- `404 NOT_FOUND` if client missing
- `422 VALIDATION_ERROR` for invalid payload

---

## 6.3 Invoices

### GET `/v1/invoices`

Query params:
- `limit` (default 20, max 100)
- `cursor`
- `status` (optional enum)
- `client_id` (optional)
- `sort` (optional: `created_at_desc`, `due_date_asc`)

Response `200`:
```json
{
  "data": [
    {
      "id": "inv_01J8N8M3N7AH6QKX3A3N1Y2K5P",
      "number": "INV-2026-0012",
      "client_id": "cli_01J8N8KQ4C4WQ7ZP5V7S1N2A3B",
      "status": "Draft",
      "due_date": "2026-03-05",
      "totals": { "total": "1000.00", "currency": "USD" },
      "updated_at": "2026-02-19T17:45:00Z"
    }
  ],
  "meta": {
    "next_cursor": null,
    "has_more": false
  }
}
```

### POST `/v1/invoices`

Request:
```json
{
  "client_id": "cli_01J8N8KQ4C4WQ7ZP5V7S1N2A3B",
  "issue_date": "2026-02-19",
  "due_date": "2026-03-05",
  "currency": "USD",
  "line_items": [
    {
      "description": "Website design",
      "quantity": "2.00",
      "unit_price": "500.00"
    }
  ],
  "tax": { "name": "VAT", "rate_percent": "0.00" },
  "discount": { "type": "percent", "value": "0.00" },
  "notes": "Thank you for your business."
}
```

Response `201`:
- Returns full `Invoice` resource with computed totals and `status: Draft`.

Validation:
- `client_id` required
- at least 1 line item required to create invoice
- `due_date >= issue_date`
- all amounts must use single invoice currency

### GET `/v1/invoices/{invoice_id}`

Response `200`:
- Returns full `Invoice`.

### PATCH `/v1/invoices/{invoice_id}`

Purpose:
- Edit invoice fields while respecting state constraints.

Headers:
- `If-Match: "<version>"`

Request:
- Partial update of editable fields (`client_id`, dates, line items, tax, discount, notes).

Response `200`:
- Returns updated invoice with incremented `version`.

Rules:
- `Draft`: fully editable.
- `Sent`: editable with business warning expected on client UI; server allows.
- `Paid`: server rejects content-changing updates unless explicit versioning strategy is later introduced.
- `Void`: not editable.

Errors:
- `409 VERSION_CONFLICT` when `If-Match` does not match current `version`
- `409 CONFLICT_STATUS_TRANSITION` when status disallows edit

---

## 6.4 Invoice Actions

All action endpoints below require:
- `Idempotency-Key` header

### POST `/v1/invoices/{invoice_id}/mark-sent`

Purpose:
- Manual-share lifecycle update (free and premium).

Request:
```json
{
  "sent_date": "2026-02-19",
  "note": "Sent via external email client"
}
```

Response `200`:
```json
{
  "data": {
    "id": "inv_01J8N8M3N7AH6QKX3A3N1Y2K5P",
    "status": "Sent",
    "sent_at": "2026-02-19T18:10:00Z",
    "version": 3
  },
  "meta": {}
}
```

Rules:
- Allowed from `Draft` only.
- Requires at least one line item and non-empty total.

### POST `/v1/invoices/{invoice_id}/send-email`

Purpose:
- Premium email send and status transition.

Request:
```json
{
  "to": "billing@acme.studio",
  "subject": "Invoice INV-2026-0012 from SmartInvoice",
  "message": "Please find your invoice attached.",
  "attach_pdf": true,
  "send_copy_to_me": true
}
```

Response `200`:
```json
{
  "data": {
    "id": "inv_01J8N8M3N7AH6QKX3A3N1Y2K5P",
    "status": "Sent",
    "sent_at": "2026-02-19T18:15:00Z",
    "delivery": {
      "provider_message_id": "msg_001",
      "state": "queued"
    },
    "version": 4
  },
  "meta": {}
}
```

Premium gating:
- If user is not entitled:
  - `403 Forbidden`
  - Error code: `FEATURE_NOT_ENTITLED`
  - Include `required_plan: "pro"` in error details

Rules:
- Allowed from `Draft` or `Sent` (resend).
- Valid email required.

### POST `/v1/invoices/{invoice_id}/mark-paid`

Request:
```json
{
  "paid_date": "2026-02-20",
  "payment_method": "bank_transfer",
  "reference_note": "TXN-8841"
}
```

Response `200`:
```json
{
  "data": {
    "id": "inv_01J8N8M3N7AH6QKX3A3N1Y2K5P",
    "status": "Paid",
    "paid_at": "2026-02-20T15:20:00Z",
    "version": 5
  },
  "meta": {}
}
```

Rules:
- Allowed from `Sent` or `Overdue`.
- `paid_date` required and cannot be in the future (account timezone).

### POST `/v1/invoices/{invoice_id}/void`

Request:
```json
{
  "reason": "Issued in error"
}
```

Response `200`:
```json
{
  "data": {
    "id": "inv_01J8N8M3N7AH6QKX3A3N1Y2K5P",
    "status": "Void",
    "voided_at": "2026-02-20T15:40:00Z",
    "version": 6
  },
  "meta": {}
}
```

Rules:
- Allowed from `Draft`, `Sent`, `Overdue`.
- Not allowed from `Paid`.

---

## 6.5 Invoice Events and PDF

### GET `/v1/invoices/{invoice_id}/events`

Purpose:
- Populate invoice timeline.

Response `200`:
```json
{
  "data": [
    {
      "id": "evt_01J8N99...",
      "type": "invoice_created",
      "occurred_at": "2026-02-19T17:45:00Z",
      "actor": "user_01J..."
    },
    {
      "id": "evt_01J8NAB...",
      "type": "invoice_marked_sent",
      "occurred_at": "2026-02-19T18:10:00Z",
      "actor": "user_01J..."
    }
  ],
  "meta": {}
}
```

### GET `/v1/invoices/{invoice_id}/pdf`

Purpose:
- Fetch invoice PDF for download/share.

Response options:
- `200 application/pdf` binary stream
- or `200 application/json` with signed `download_url` if storage architecture requires redirect flow

Contract decision for v1:
- Prefer binary stream for simplicity unless CDN/storage constraints require signed URLs.

---

## 7) Validation Rules Summary

- `issue_date` required on create
- `due_date >= issue_date`
- at least one line item required for create/send/mark-sent
- invoice currency is immutable after create
- one currency per invoice
- `paid_date` required for mark-paid and must not be future date
- valid email required for send-email

---

## 8) Error Model and Codes

HTTP status usage:
- `400` malformed request
- `401` unauthorized
- `403` forbidden/entitlement
- `404` resource not found
- `409` transition or version conflict
- `422` validation error
- `429` rate limited
- `500` internal server error

Canonical error codes:
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `FEATURE_NOT_ENTITLED`
- `NOT_FOUND`
- `CONFLICT_STATUS_TRANSITION`
- `VERSION_CONFLICT`
- `IDEMPOTENCY_CONFLICT`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

---

## 9) Idempotency Contract

Required endpoints:
- `POST /v1/invoices/{id}/mark-sent`
- `POST /v1/invoices/{id}/send-email`
- `POST /v1/invoices/{id}/mark-paid`
- `POST /v1/invoices/{id}/void`

Header:
```http
Idempotency-Key: <uuid-v4>
```

Behavior:
- Same key + same payload within 24h returns original response.
- Same key + different payload returns `409 IDEMPOTENCY_CONFLICT`.

---

## 10) Concurrency Contract

Invoice updates (`PATCH /v1/invoices/{id}`):
- Must include `If-Match` header with current invoice `version`.
- Server increments version on successful mutation.
- On mismatch, server returns:
  - `409 VERSION_CONFLICT`
  - latest `version` in error details for recovery

---

## 11) Reliability and Performance Targets

API targets for v1:
- P95 read endpoints: < 300ms
- P95 mutation endpoints: < 500ms (excluding third-party email provider latency)
- Error rate (5xx): < 1%

Send-email behavior:
- Return quickly with queued state when async delivery is used.
- Delivery provider failures must map to actionable error responses on retry.

---

## 12) Analytics and Audit Hooks

Backend must emit or support these events for analytics alignment:
- `client_created`
- `client_selected` (frontend event)
- `invoice_draft_saved`
- `send_invoice_clicked` (frontend event)
- `invoice_send_attempted`
- `invoice_send_succeeded`
- `invoice_send_failed`
- `invoice_mark_sent_clicked` (frontend event)
- `invoice_mark_sent_succeeded`
- `invoice_mark_paid_clicked` (frontend event)
- `invoice_mark_paid_succeeded`
- `invoice_pdf_downloaded`

Audit trail:
- Every status-changing action creates immutable timeline event.

---

## 13) Open Decisions (Must Be Resolved Before Build Freeze)

- Decide final PDF response mode: binary stream vs signed URL.
- Decide if `PATCH Sent` invoice edits should be restricted by policy or only warned by UI.
- Confirm account timezone source for due-date and paid-date validation.

---

## 14) Implementation Checklist

- [ ] Backend signs off this contract.
- [ ] Frontend signs off payload and error handling.
- [ ] QA maps test cases to each endpoint and error code.
- [ ] API examples validated in Postman/Insomnia collection.
- [ ] Contract version tagged and locked for v1 release branch.
