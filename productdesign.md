# SmartInvoice Product Design Review and Spec

## 1) Blunt Review of the Current Concept

Your concept is strong, but right now it is not a complete product design. It is a good direction memo.

What is solid:
- The 3-screen rule is correct. Fewer screens usually means faster adoption.
- Positioning around speed and reduced billing anxiety is the right core value.
- A live invoice preview is the right trust mechanic.
- Email sending as paid automation is commercially smart.

What is weak or missing:
- No defined user segments. "Small businesses" is too broad.
- No end-to-end flows for failure states (bad email, unpaid aging, partial payments, currency issues).
- No mobile-first interaction detail. This matters if it must be both web and mobile.
- No clear information hierarchy for Dashboard, so it can become a noisy KPI graveyard.
- Premium gating is present but not calibrated. Too aggressive and free users churn before value.
- No operational states for invoice lifecycle beyond Draft/Sent/Paid.
- No design system tokens/components. Execution without a system will drift and look inconsistent.
- No measurable success criteria. You cannot improve what you do not measure.

Bottom line:
- Keep the strategy.
- Tighten scope.
- Define the UX with production-grade detail.

---

## 2) Product Positioning

### Product Statement
SmartInvoice is fast billing software for service businesses that need to create, send, and get paid on invoices in minutes, not hours.

### Primary User (v1)
- Freelancers and micro-agencies (1-10 people)
- Services billed hourly or fixed-fee
- Need simple invoicing, basic payment tracking, and client communication

### Jobs To Be Done
- "Create a professional invoice in under 2 minutes."
- "Send it immediately without switching tools."
- "Know exactly what is unpaid and overdue."
- "Mark payments quickly and keep records clean."

---

## 3) Product Scope (Web + Mobile, Web-First Delivery)

Delivery mode:
- Build and launch web first.
- Keep business logic and UX rules portable for mobile clients.
- Mobile release follows web core validation, not a parallel rewrite.

## v1 Must-Haves
- Dashboard
- Invoice Builder
- Invoice Detail
- Client list (lightweight, inline or minimal page/sheet)
- PDF generation
- Manual status updates (`Mark as Sent`, `Mark as Paid`, `Void`)
- Email sending (Premium)

## v1.1 Should-Haves
- Payment links
- Recurring invoices
- Reminder automations
- Multi-currency and tax profiles

## Out of Scope (v1)
- Full accounting suite
- Complex inventory
- Team permission matrices beyond Owner/Admin

---

## 4) Information Architecture (3 Core Screens + Supporting Surfaces)

1. Dashboard (Control Center)
2. Invoice Builder (Core Work Surface)
3. Invoice Detail (Action + Status)

Supporting surfaces (not full pages where possible):
- Right side sheet: Send Invoice
- Modal: Upgrade to Pro
- Bottom sheet/mobile: Quick status change
- Lightweight client management drawer

Rule:
- New pages only when context switching is unavoidable.
- Prefer drawers/sheets/modals for secondary tasks.

---

## 5) Detailed Screen Design

## Screen 1: Dashboard

### Objective
User understands business status in 3 seconds and can create an invoice in 1 tap/click.

### Priority Order (Top to Bottom)
1. Primary CTA: `Create Invoice`
2. Unpaid amount (largest visual weight)
3. Overdue invoice count
4. Recent invoice activity (last 5 events)
5. Secondary actions (view all invoices, clients)

### Web Layout
- Top bar: logo, search, profile/settings
- KPI row: Total Unpaid, Overdue, Paid This Month
- Main split:
- Left (70%): recent invoices table with status chips
- Right (30%): quick actions + "Need attention" list

### Mobile Layout
- Sticky primary button at bottom: `Create Invoice`
- Scroll stack:
- Unpaid KPI card
- Overdue card
- Recent activity list
- Swipe actions on activity rows (mark paid, remind)

### Design Rules
- Max 3 primary KPI cards.
- Never show more than 2 chart types in v1.
- Empty state must directly explain first action.

---

## Screen 2: Invoice Builder

### Objective
Create invoice fast, with confidence, and no context loss.

### Web Layout (Core)
- Left panel (inputs):
- Client
- Invoice metadata (number, issue date, due date)
- Line items
- Tax/discount
- Notes/payment terms
- Right panel (live preview):
- Real-time rendered invoice
- Sticky summary (subtotal, tax, total)

### Mobile Layout
- Stepper or segmented tabs:
- Step 1: Client + dates
- Step 2: Items
- Step 3: Tax/notes
- Step 4: Preview + save/send
- Live preview is full-screen in final step, not side-by-side.

### Critical UX Behaviors
- Autosave draft every change.
- Inline validation, not post-submit error dump.
- Editable line item rows with keyboard-first flow on web.
- Smart defaults: due date +7/+14 days, tax from profile.
- Currency format locked per invoice after first line item (prevent accidental mismatch).

### Non-Negotiable Components
- `Add Item` row editor with quantity, unit price, amount.
- Tax selector with percent and name.
- Notes template quick insert.
- Save states: `Draft saved`, `Saving...`, `Saved`.

---

## Screen 3: Invoice Detail

### Objective
Single source of truth for one invoice, including all downstream actions.

### Core Areas
- Header:
- Invoice number
- Client Name 
- Status badge
- Amount and due date
- Body:
- Invoice preview
- Timeline (created, sent, paid, voided)
- Action rail/buttons:
- Download PDF
- Edit
- Mark as Sent
- Mark as Paid
- Send Invoice (Premium)

### Status Model (v1)
- Draft
- Sent
- Overdue
- Paid
- Void

### Action Rules
- `Edit` locked or versioned after paid status (to prevent audit confusion).
- `Mark as Sent` is available for manual share workflows (free and premium).
- `Mark as Paid` requires paid date and optional payment method.
- `Void` is allowed only for `Draft`, `Sent`, or `Overdue`.
- `Void` requires confirmation and reason.
- `Viewed` is delivery metadata, not a lifecycle status in v1.

---

## 6) Send by Email (Premium) - Final UX

### Entry Point
- `Send Invoice` action on Invoice Detail and on Builder success state.

### Interaction
- Right side sheet on web.
- Bottom sheet/full-screen modal on mobile.

### Fields
- Recipient email (prefilled from client, editable)
- Subject (auto-generated, editable)
- Message template (editable)
- Attach PDF (default ON)
- Send me a copy (optional)

### Button States
- `Send Invoice` (enabled only when valid)
- Loading state with progress feedback
- Success toast with `Resend` action

### Failure States
- Invalid email
- Send provider failure
- Timeout/retry path
- Save unsent draft message content

---

## 7) Premium Gating Strategy (Blunt Version)

Do not gate too early. Users must get real value before paywall friction.

Recommended gating:
- Free:
- Create invoices
- Download PDF
- Manual sharing and status updates
- Premium:
- Direct email send
- Delivery status + history
- Scheduled reminders (future)

Upgrade moment:
- Trigger on click of `Send Invoice` for free users.
- Modal copy should sell outcome, not plan tiers.

Use this message style:
- "Send invoices in one click and track delivery."
- Avoid "This is premium." That language is weak and transactional.

---

## 8) Design System Guidance

You need a lean system now, not later.

### Foundations
- 8px spacing scale
- 4-6 semantic colors max in v1
- Status colors with AA contrast minimum
- Type scale with clear density on mobile

### Core Components
- Buttons (primary/secondary/ghost/destructive)
- Status chips
- Table row (desktop) / list card (mobile)
- Input, select, date picker
- Drawer/sheet, modal, toast
- Empty and error states

### Interaction Standards
- Response feedback under 150ms for local actions
- Skeletons for loading over 400ms
- Focus states and keyboard support on web

---

## 9) Mobile App Design Principles

If mobile is not excellent, this product loses daily habit potential.

### Principles
- Thumb-first actions in bottom zone
- One primary action per screen
- No dense tables; use grouped cards
- Keep creation flow < 8 taps where possible

### Mobile-Specific Enhancements
- Quick add client from contacts (later)
- Share invoice link/PDF via native share sheet
- Push reminders for overdue invoices (later)

---

## 10) UX Writing (Needs Tight Control)

Tone:
- Professional, calm, direct.

Avoid:
- Cute copy during payment actions.

Examples:
- Good: "Invoice sent."
- Better: "Invoice sent to jane@client.com."
- Bad: "Woohoo! Your invoice is flying through cyberspace!"

---

## 11) Metrics That Actually Matter

North-star:
- Time-to-sent-invoice (from create tap to sent event)

Core KPIs:
- Draft-to-sent conversion rate
- First invoice created within first session
- Send action success rate
- Paid within 14 days rate
- Upgrade conversion after `Send Invoice` trigger

Set hard v1 targets:
- Median create time < 2 minutes
- 80%+ invoice builder completion
- < 2% send failures

---

## 12) Risks and Mitigations

Risk: Feature creep destroys the 3-screen speed promise.
- Mitigation: Enforce strict v1 scope and monthly backlog kill-list.

Risk: Aggressive paywall reduces trust.
- Mitigation: Let free users fully create and export before gating automation.

Risk: Poor mobile parity causes retention drop.
- Mitigation: Design mobile patterns first for key flows, not as desktop leftovers.

Risk: Inconsistent UI quality from ad-hoc implementation.
- Mitigation: Build component library before scaling screens.

---

## 13) Execution Plan (Design to Build)

1. Finalize UX flows and states for 3 core screens.
2. Build low-fidelity wireframes for web + mobile in parallel.
3. Validate with 5 target users (freelancers/agencies).
4. Create high-fidelity prototype with edge states.
5. Define component specs/tokens for engineering handoff.
6. Implement v1 with analytics events from day one.

---

## 14) Final Design Direction

Keep this principle locked:
- "Fast billing with zero confusion."

If a feature slows invoice creation or clouds status clarity, cut it.

The concept is commercially promising. The success depends on ruthless scope control and high-quality execution of the three core screens across both web and mobile.

---

## 15) Device Coverage Requirements (Non-Negotiable)

Support must be intentional across many devices, not "responsive by accident."

Required coverage:
- Phone: `320-767px`
- Tablet: `768-1023px`
- Small desktop/laptop: `1024-1279px`
- Desktop: `1280px+`

Input modes to support:
- Touch
- Keyboard + mouse
- Keyboard-only navigation (web accessibility baseline)

Platform requirement:
- Native-feeling mobile UX patterns for iOS and Android
- Full web support for modern desktop browsers

Design rule:
- Keep one consistent core workflow across all devices.
- Adapt layout per breakpoint, but do not reinvent task logic by platform.

Quality bar:
- Critical flows must pass on phone, tablet, and desktop before release:
- Create invoice
- Manual share + mark as sent
- Send invoice
- Mark as paid
