# SmartInvoice UX Copy

## 1) Voice and Tone

Use this voice everywhere:
- Clear
- Professional
- Brief
- Action-oriented

Never use:
- Hype language
- Jokes in billing/payment actions
- Vague error messages

Good standard:
- "Invoice sent."
- "Draft saved."
- "Couldn't send invoice. Try again."

---

## 2) Terminology Lock (Use Consistently)

Approved terms:
- Invoice
- Client
- Issue date
- Due date
- Line item
- Tax
- Discount
- Total
- Status

Avoid mixed terms:
- Do not mix "customer" and "client" in v1.
- Do not mix "bill" and "invoice."

Action label standard:
- Use `Send Invoice` (not `Send To`) for clarity.

---

## 3) Navigation Labels

## Web
- Dashboard
- Invoices
- Clients
- Settings
- Create Invoice

## Mobile Bottom Nav
- Home
- Invoices
- Clients
- More

Primary CTA:
- Create Invoice

---

## 4) Dashboard Copy

## KPI Labels
- Total Unpaid
- Overdue
- Paid This Month

## Quick Actions
- Create Invoice
- View All Invoices
- Add Client

## Empty State
Headline:
- You have no invoices yet

Body:
- Create your first invoice to start tracking payments.

Primary:
- Create Invoice

Secondary:
- Add Client

## Needs Attention Panel
- Overdue invoices need follow-up.
- 3 invoices due this week.
- 2 drafts not sent.

---

## 5) Invoice Builder Copy

## Section Labels
- Client
- Invoice Details
- Line Items
- Tax and Discount
- Notes
- Preview

## Field Labels
- Client name
- Client email
- Invoice number
- Issue date
- Due date
- Item description
- Quantity
- Unit price
- Tax (%)
- Discount
- Notes

## Placeholders
- Enter client name
- name@company.com
- e.g. Website design
- Add a note or payment terms

## Primary Buttons
- Save Draft
- Continue
- Back
- Review Invoice

Mobile short label fallback:
- Save
- Next

## Autosave States
- Saving...
- Draft saved
- Draft not synced

## Validation Messages
- Client name is required.
- Enter a valid email address.
- Add at least one line item.
- Quantity must be greater than 0.
- Unit price must be a valid amount.
- Due date cannot be before issue date.
- Currency must match all line items.

---

## 6) Invoice Detail Copy

## Header Labels
- Invoice
- Client
- Due
- Total

## Status Badges
- Draft
- Sent
- Overdue
- Paid
- Void

## Actions
- Download PDF
- Edit Invoice
- Mark as Sent
- Mark as Paid
- Send Invoice
- Void Invoice

## Timeline Labels
- Invoice created
- Invoice updated
- Invoice sent
- Payment recorded
- Invoice voided

---

## 7) Send Invoice Surface (Premium)

## Header
- Send Invoice

## Field Labels
- To
- Subject
- Message
- Attach PDF
- Send me a copy

## Default Subject
- Invoice {{invoice_number}} from {{business_name}}

## Default Message
Hi {{client_name}},

Please find your invoice attached.

Thank you,
{{business_name}}

## Buttons
- Send Invoice
- Cancel

## Loading
- Sending invoice...

## Success
- Invoice sent to {{recipient_email}}.

Secondary action:
- Resend

## Errors
- Enter a valid recipient email.
- Couldn't send invoice. Try again.
- Sending timed out. Please retry.

---

## 8) Premium Gating Copy

Goal:
- Sell outcome, not feature tiers.

## Upgrade Modal
Headline:
- Send invoices in one click

Body:
- Save time with automatic email delivery and send history.

Primary:
- Upgrade to Pro

Secondary:
- Maybe Later

Footer note:
- You can still download and share PDFs for free.

## Post-Upgrade Success
- Pro unlocked. Send your invoice now.

---

## 9) Mark as Sent Copy

## Surface Header
- Mark Invoice as Sent

## Fields
- Sent date (default: today)
- Optional note

## Buttons
- Confirm Sent
- Cancel

## Success
- Invoice marked as sent.

## Validation
- Sent date is required.
- Sent date cannot be before issue date.

---

## 10) Mark as Paid Copy

## Modal Header
- Mark Invoice as Paid

## Fields
- Paid date
- Payment method (optional)
- Reference note (optional)

## Buttons
- Confirm Payment
- Cancel

## Success
- Invoice marked as paid.

## Validation
- Paid date is required.
- Paid date cannot be in the future.

---

## 11) Void Invoice Copy

## Confirmation
Headline:
- Void this invoice?

Body:
- This action removes the invoice from active billing workflows.

Field:
- Reason for voiding (optional)

Buttons:
- Void Invoice
- Keep Invoice

Success:
- Invoice voided.

---

## 12) Error, Offline, and Session Copy

## Network and Sync
- You're offline. Changes will sync when you reconnect.
- Draft saved locally. Sync pending.
- Sync failed. Tap to retry.

## API/Server
- Something went wrong. Try again.
- We couldn't complete that action right now.

## Auth
- Your session expired. Sign in again to continue.

After re-auth:
- You're back. Continue where you left off.

---

## 13) Device-Specific Copy Rules

- Prefer short action labels on small screens:
- `Create` instead of `Create Invoice` only when space is constrained.
- `Mark Sent` instead of `Mark as Sent` only in compact toolbars.
- `Mark Paid` instead of `Mark as Paid` only in compact toolbars.

- Keep destructive actions explicit on all devices:
- Never shorten `Void Invoice` to `Void`.

- Toast max length:
- Phone: <= 60 characters preferred
- Tablet/Desktop: <= 90 characters preferred

---

## 14) Accessibility Copy Rules

- Every icon-only button needs an accessible label.

Examples:
- `aria-label="Download invoice PDF"`
- `aria-label="Edit invoice"`
- `aria-label="Mark invoice as paid"`

- Do not use color-only meaning in text:
- Always include status words (`Paid`, `Overdue`, etc.).

---

## 15) Formatting and Localization Rules

- Date display follows user locale.
- Currency display follows invoice currency.
- Decimal precision:
- Quantity: up to 2 decimals
- Price/total: currency standard

Dynamic token safety:
- If `client_name` missing, fallback to `there`.
- If `business_name` missing, fallback to account name.

---

## 16) Copy QA Checklist

Pass criteria before release:
- No mixed terminology (`client/customer`, `bill/invoice`)
- No dead-end error messages
- Premium gate always offers a free fallback path
- All core actions have clear success/failure text
- Mobile labels fit smallest supported width without truncating critical meaning

