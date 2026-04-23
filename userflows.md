# SmartInvoice User Flows (Web + Mobile)

## 1) Scope
This document defines production user flows for:
- Dashboard
- Invoice Builder
- Invoice Detail
- Premium Email Send

It covers:
- Happy paths
- Decision branches
- Failure and recovery paths
- Device-specific UI patterns while keeping shared logic

---

## 2) Global Flow Principles

- One core logic across web and mobile.
- Device changes layout, never business rules.
- Every critical action has: confirmation state, success state, failure state, recovery step.
- User should always have a visible way back without data loss.

Core path:
`Dashboard -> Create Invoice -> Invoice Detail -> Send or Manual Share + Mark Sent -> Mark Paid`

---

## 3) State Model

Invoice lifecycle states in v1:
- `Draft`
- `Sent`
- `Overdue`
- `Paid`
- `Void`

System state rules:
- New invoice starts as `Draft`.
- Sending by email changes `Draft` to `Sent`.
- Manual sharing requires explicit `Mark as Sent` to move `Draft` to `Sent`.
- Past due date and unpaid can surface as `Overdue`.
- `Paid` blocks silent edits; requires confirm/versioning.
- `Void` is terminal for active billing workflows.

---

## 4) Flow Definitions

## F1: First Session Onboarding to First Invoice

Goal:
- New user creates first invoice in first session.

Entry:
- Fresh account lands on Dashboard empty state.

Primary steps:
1. User sees empty Dashboard with primary CTA `Create Invoice`.
2. User taps/clicks `Create Invoice`.
3. App opens Builder with starter defaults (invoice number, due date rule, empty items).
4. User adds client and at least one line item.
5. User previews invoice and saves.
6. App routes to Invoice Detail with status `Draft`.

Success:
- Invoice exists and is visible in recent activity.

Failure branches:
- F1-A Missing required client/item fields:
1. User taps `Save`.
2. Inline validation highlights missing fields.
3. Focus jumps to first invalid field.
- F1-B Network failure on save:
1. Save action fails.
2. App keeps local draft and shows retry banner.
3. User retries save when network is back.

Device notes:
- Web: side-by-side builder + live preview.
- Mobile: stepper flow with preview in final step.

---

## F2: Create Invoice from Existing Dashboard (Returning User)

Goal:
- Returning user creates invoice under 2 minutes.

Entry:
- User on Dashboard with existing data.

Primary steps:
1. User clicks `Create Invoice` (top bar on web, sticky button on mobile).
2. Builder opens with remembered defaults.
3. User selects existing client or adds new client inline.
4. User adds/edits line items.
5. User reviews live preview.
6. User taps `Save Draft` or `Save and Continue`.
7. App opens Invoice Detail.

Success:
- Invoice in `Draft`; timeline logs creation.

Failure branches:
- F2-A Currency conflict introduced by edits:
1. App detects mixed currency input.
2. Hard-block save with one clear fix action.
3. User resolves and proceeds.
- F2-B Auto-save interruption:
1. App shows `Saving...` timeout.
2. User sees persistent warning `Draft not synced`.
3. Retry auto-save or manual save.

---

## F3: Send Invoice (Premium User)

Goal:
- Premium user sends invoice directly by email from Invoice Detail.

Entry:
- Invoice Detail status `Draft` or `Sent` (resend).

Primary steps:
1. User taps `Send Invoice`.
2. App opens send surface:
- Web: right drawer
- Mobile: bottom sheet or full-screen modal
3. Fields prefilled:
- Recipient email
- Subject
- Message template
- Attach PDF toggle ON
4. User reviews/edits message.
5. User taps `Send Invoice`.
6. App validates fields and sends.
7. App shows success toast + `Resend` action.
8. Status becomes `Sent`, timeline logs send event.

Success:
- Email provider accepted request, invoice status updated.

Failure branches:
- F3-A Invalid email:
1. Send blocked.
2. Inline error under recipient field.
3. Focus returns to field.
- F3-B Provider/API failure:
1. Send request fails.
2. Error toast with `Retry`.
3. Draft message preserved.
- F3-C Timeout:
1. Spinner exceeds timeout threshold.
2. UI shows uncertain state with explicit `Retry Send`.
3. Deduplicate retries on backend with idempotency key.

---

## F4: Send Invoice Attempt (Free User, Premium Gate)

Goal:
- Convert free user at a high-intent moment without breaking trust.

Entry:
- Free user taps `Send Invoice`.

Primary steps:
1. User taps `Send Invoice`.
2. App opens upgrade modal/sheet (not a full page redirect).
3. Copy communicates outcome:
- "Send invoices in one click and track delivery."
4. Actions:
- `Upgrade to Pro`
- `Maybe Later`
5. If `Maybe Later`, user returns to Invoice Detail.

Success paths:
- F4-S1 User upgrades, returns to send flow (F3) immediately.
- F4-S2 User declines, continues with free actions:
- Download PDF
- Manual sharing outside app
- Mark as Sent after sharing to update invoice lifecycle state

Failure branches:
- F4-A Upgrade purchase failure:
1. Payment/auth fails.
2. App retains context and returns to modal with retry.
3. User can exit safely without losing invoice state.

Guardrails:
- Never lock PDF download behind premium.
- Never discard send intent context after upgrade.

---

## F5: Manual Share and Mark as Sent (Free + Premium)

Goal:
- Free or premium user shares invoice manually and updates lifecycle state correctly.

Entry:
- Invoice Detail status `Draft`.

Primary steps:
1. User taps `Download PDF`.
2. User shares invoice manually outside the app.
3. User returns to Invoice Detail.
4. User taps `Mark as Sent`.
5. App confirms status update and records timestamp.
6. Status becomes `Sent`, timeline logs manual send event.

Failure branches:
- F5-A Status update sync failure:
1. `Mark as Sent` update fails.
2. UI shows retry option without losing context.

---

## F6: Download PDF (Free + Premium)

Goal:
- User exports invoice quickly on any device.

Entry:
- Invoice Detail page.

Primary steps:
1. User taps `Download PDF`.
2. App generates or fetches rendered PDF.
3. Device behavior:
- Web: browser download
- Mobile app: open share sheet or save to files
4. Confirmation appears (`PDF ready`).

Failure branches:
- F6-A Generation failure:
1. Error toast.
2. Retry action provided.
- F6-B Offline:
1. If cached PDF exists, allow export.
2. Else show offline error and retry when connected.

---

## F7: Mark Invoice as Paid

Goal:
- User records payment accurately and immediately.

Entry:
- Invoice status `Sent` or `Overdue`.

Primary steps:
1. User taps `Mark as Paid`.
2. App opens confirm surface with required `Paid date`.
3. Optional fields:
- Payment method
- Internal note/reference
4. User confirms.
5. Status updates to `Paid`.
6. Dashboard and timeline update.

Success:
- Invoice exits unpaid buckets and appears in paid metrics.

Failure branches:
- F7-A Missing required paid date:
1. Confirm blocked.
2. Inline field error shown.
- F7-B Sync failure:
1. Optimistic UI rollback or pending state shown.
2. Retry action available.

---

## F8: Edit Existing Invoice

Goal:
- User updates draft/sent invoice without causing audit confusion.

Entry:
- Invoice Detail, action `Edit`.

Primary steps:
1. User taps `Edit`.
2. Builder opens with populated values.
3. User modifies data.
4. User saves changes.
5. App returns to Invoice Detail with updated preview and timeline event.

State constraints:
- `Draft`: editable freely.
- `Sent`: editable with warning that client-facing content changed.
- `Paid`: require explicit confirmation/versioning before save.
- `Void`: editing disabled.

Failure branches:
- F8-A Concurrent update conflict:
1. Save detects newer server version.
2. User prompted to reload or duplicate as new invoice.

---

## F9: Void Invoice

Goal:
- User intentionally invalidates an invoice while preserving traceability.

Entry:
- Invoice Detail status is `Draft`, `Sent`, or `Overdue`.

Primary steps:
1. User selects `Void` from overflow actions.
2. Confirm dialog requests reason.
3. User confirms.
4. Status becomes `Void`.
5. Actions like send/mark paid are disabled.

Failure branches:
- F8-A Permission/policy failure:
1. Server denies void action.
2. UI restores previous state and shows explanation.

---

## 5) Device-Specific Interaction Maps

## Web (Desktop/Laptop)
- `Create Invoice` in global header and Dashboard hero area.
- Builder uses dual-pane editing + preview.
- Send flow opens right drawer.
- Keyboard hotkeys recommended:
- `Ctrl/Cmd + S` save draft
- `Ctrl/Cmd + Enter` send (when in send drawer and valid)

## Tablet
- Builder can switch between split view and segmented sections.
- Action bars stay top-aligned with larger touch targets.
- Drawer/modal behavior changes by orientation.

## Mobile (iOS/Android)
- Primary action is sticky/floating for reachability.
- Builder is step-based and keyboard-safe.
- Invoice actions in bottom sticky bar + overflow menu.
- Send flow in bottom sheet/full modal.

---

## 6) Error and Recovery Matrix

Common errors and required behavior:

- Validation error:
- Show inline near offending field.
- Keep user context; no full-page error.

- Network offline:
- Show persistent offline banner.
- Queue draft writes locally when safe.

- API timeout:
- Show pending + retry option.
- Use idempotency for send and status-changing writes.

- Auth/session expiry:
- Prompt re-auth.
- Return user to interrupted task after auth recovery.

---

## 7) Event Tracking Map (Minimum)

Track these events consistently across devices:
- `dashboard_viewed`
- `create_invoice_clicked`
- `client_created`
- `client_selected`
- `invoice_builder_opened`
- `invoice_draft_saved`
- `invoice_save_failed`
- `invoice_detail_viewed`
- `send_invoice_clicked`
- `upgrade_modal_viewed`
- `upgrade_started`
- `upgrade_completed`
- `invoice_send_attempted`
- `invoice_send_succeeded`
- `invoice_send_failed`
- `invoice_mark_sent_clicked`
- `invoice_mark_sent_succeeded`
- `invoice_mark_paid_clicked`
- `invoice_mark_paid_succeeded`
- `invoice_pdf_downloaded`

Required properties:
- `platform` (`web`, `ios`, `android`)
- `breakpoint` (`xs`, `sm`, `md`, `lg`, `xl`, `2xl` where applicable)
- `invoice_status_before`
- `invoice_status_after` (if state-changing)
- `network_state` (`online`, `offline`, `flaky`)

---

## 8) QA Scenarios (Release Gate)

Pass/fail scenarios per device class:
- Create invoice with new client
- Create invoice with existing client
- Save draft with intermittent network
- Premium send success
- Premium send failure and retry
- Free-user send gate and fallback to PDF
- Manual share then mark sent
- Mark paid and verify dashboard totals update
- Edit sent invoice with warning confirmation
- Void invoice and verify action lockout

If any critical path fails on phone, tablet, or desktop, release is blocked.
