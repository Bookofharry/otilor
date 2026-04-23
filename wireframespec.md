# SmartInvoice Wireframe Specification

## 1) Purpose
This document turns the product strategy into buildable wireframes for many device types.

Non-negotiable:
- Same core workflow across all devices: `Dashboard -> Invoice Builder -> Invoice Detail`.
- Fast path preserved everywhere.
- No device gets a "second-class" experience.

---

## 2) Device Support Matrix

## Form Factors
- Phone small: `320-374px`
- Phone standard: `375-479px`
- Phone large: `480-767px`
- Tablet: `768-1023px`
- Small desktop/laptop: `1024-1279px`
- Desktop: `1280-1439px`
- Large desktop: `1440px+`

## Platforms
- iOS app: latest 2 major iOS versions
- Android app: Android 10+
- Web app desktop: latest 2 versions of Chrome, Edge, Firefox, Safari
- Web app mobile browser: Safari iOS, Chrome Android (latest 2)

## Input Methods
- Touch first on phone/tablet
- Mouse + keyboard on desktop/laptop
- Keyboard-only navigation supported on web

## Orientation Rules
- Phone portrait: fully optimized
- Phone landscape: supported, not primary layout
- Tablet portrait: fully optimized
- Tablet landscape at `1024px+` follows compact desktop (`lg`) layout rules

---

## 3) Responsive Breakpoints and Grid

## Breakpoint Tokens
- `xs`: `320-374`
- `sm`: `375-767`
- `md`: `768-1023`
- `lg`: `1024-1279`
- `xl`: `1280-1439`
- `2xl`: `1440+`

## Grid System
- `xs/sm`: 4-column grid, 16px page padding
- `md`: 8-column grid, 24px page padding
- `lg/xl/2xl`: 12-column grid, 24-32px page padding

## Spacing Scale
- Base: 8px
- Component spacing values: 8, 12, 16, 24, 32, 40

---

## 4) Global Navigation by Device

## Desktop (`lg+`)
- Left rail nav:
- Dashboard
- Invoices
- Clients
- Settings
- Top bar:
- Search
- Global quick action `Create Invoice`
- User menu

## Tablet (`md`)
- Top tabs or compact rail
- Persistent `Create Invoice` button in top bar

## Phone (`xs/sm`)
- Bottom nav:
- Dashboard
- Invoices
- Clients
- More
- Floating or sticky primary button: `Create Invoice`

Rule:
- `Create Invoice` must always be visible within one gesture.

---

## 5) Screen Wireframes

## Screen A: Dashboard

### Objective
User reads financial status immediately and can start invoice creation instantly.

### A1) Desktop Layout (`lg/xl/2xl`)
- Row 1: Header + primary CTA
- Row 2: KPI cards (3 max)
- Row 3 split:
- Left 8 cols: Recent invoices table
- Right 4 cols: "Needs attention" panel + quick actions

Suggested frame map:
```text
[Header....................................][Create Invoice]
[Unpaid KPI][Overdue KPI][Paid This Month]
[Recent Invoices Table.................][Needs Attention]
[Recent Invoices Table.................][Quick Actions  ]
```

### A2) Tablet Layout (`md`)
- KPI cards in 2x2 or 1x3 stacked depending on orientation
- Recent invoices list cards instead of dense table
- Right-side "Needs attention" moves below list

### A3) Phone Layout (`xs/sm`)
- Sticky top summary card: Unpaid total
- Secondary cards: Overdue, Paid this month
- Recent activity list with swipe actions
- Bottom sticky `Create Invoice`

### Dashboard Component Rules
- KPI cards: concise label, amount, trend chip
- Activity item: invoice id, client, amount, status, date
- Empty state: one sentence + one action

---

## Screen B: Invoice Builder

### Objective
Create invoice with confidence and no confusion.

### B1) Desktop Layout (`lg/xl/2xl`)
- Split canvas:
- Left 5 cols: editable form
- Right 7 cols: live invoice preview
- Preview stays sticky while form scrolls

Suggested frame map:
```text
[Builder Header.................................][Save Status]
[Form: Client, Dates, Items, Tax, Notes][Live Preview........]
[Form....................................][Total + Due Summary]
```

### B2) Tablet Layout (`md`)
- Top segmented control for sections (`Client | Items | Tax | Notes | Preview`)
- 1024px+ tablets/laptops follow compact desktop split layout (`lg`)
- Preview can expand to full screen

### B3) Phone Layout (`xs/sm`)
- Stepper flow:
1. Client + dates
2. Line items
3. Tax + notes
4. Preview and actions
- Sticky footer:
- Back
- Next / Save
- Final step: `Save Draft` and `Send Invoice`

### Builder Component Rules
- Line item row fields: description, qty, rate, amount
- Inline row validation on blur
- Decimal keypad for currency fields on mobile
- Autosave every edit with visible status text

### Builder Failure States
- Network loss: show offline banner, queue local draft sync
- Validation errors: inline + section error count
- Currency mismatch: hard block with clear fix instruction

---

## Screen C: Invoice Detail

### Objective
Single action hub for existing invoices.

### C1) Desktop Layout (`lg/xl/2xl`)
- Header row:
- Invoice number
- Client
- Status chip
- Amount
- Action button group
- Body split:
- Left 8 cols: invoice preview
- Right 4 cols: timeline + metadata + shortcuts

Suggested frame map:
```text
[INV-1024][Client][Status][Amount][Download][Edit][Mark Sent][Mark Paid][Send Invoice]
[Invoice Preview..........................][Timeline...........]
[Invoice Preview..........................][Payment Meta.......]
```

### C2) Tablet Layout (`md`)
- Header wraps actions into overflow menu
- Preview full width
- Timeline and metadata become collapsible accordions below preview

### C3) Phone Layout (`xs/sm`)
- Top: invoice id + status + amount
- Middle: preview thumbnail + tap to full preview
- Bottom sticky action bar:
- Download
- Edit
- More (Mark Sent, Mark Paid, Send Invoice, Void)

### Detail State Rules
- Status chips:
- Draft (neutral)
- Sent (info)
- Overdue (warning)
- Paid (success)
- Void (critical)
- `Mark Sent` is available when status is `Draft`.
- If `Paid`, editing requires explicit confirmation/versioning.

---

## 6) Supporting Surfaces (Not Full Pages)

## Send Invoice Surface
- Desktop: right drawer (min 420px width)
- Compact desktop/touch devices (`lg`): right drawer
- Tablet (`md`): full modal
- Phone: bottom sheet (70-90% height) or full-screen modal

Fields:
- To email
- Subject
- Message
- Attach PDF toggle
- Send copy toggle

Buttons:
- Primary: `Send Invoice`
- Secondary: `Cancel`

## Upgrade Surface
- Desktop: center modal
- Phone/tablet: bottom sheet
- Copy focuses on outcome: speed + professionalism

## Confirmations
- Destructive actions require confirm dialog:
- Void invoice
- Delete draft

---

## 7) Multi-Device Interaction Rules

## Touch
- Minimum hit target: 44x44px
- Swipe actions only when there is a visible alternative (menu button)

## Keyboard/Mouse (Web)
- Logical tab order
- Enter submits only when context is clear
- Arrow navigation in line item table

## Safe Areas and Insets
- Respect iOS/Android notches and home indicators
- Bottom CTA bars include safe-area padding

## Virtual Keyboard Handling
- On phone, action bars move above keyboard
- Numeric fields retain visibility while editing

---

## 8) Accessibility Requirements

- WCAG 2.1 AA contrast minimum
- Text scaling support up to 200% without layout break
- Screen-reader labels for all icon-only actions
- Status chips include text, not color only
- Motion reduced when OS "Reduce Motion" is enabled

---

## 9) Performance and Reliability Targets

- Initial dashboard render: < 2.5s on mid-tier mobile network
- Invoice builder input response: < 100ms local interaction
- Save draft acknowledgement: < 500ms perceived
- Send invoice action: visible progress + retry on failure

---

## 10) QA Device Coverage (Minimum)

## Phones
- iPhone SE/mini size class (`375x667`)
- iPhone Pro Max size class (`430x932`)
- Android small-mid (`360x800`)
- Android large (`412x915`)

## Tablets
- iPad portrait (`768x1024`)
- iPad landscape (`1024x768`) validating compact desktop (`lg`) layout on touch
- Android tablet (`800x1280`)

## Web
- 1280x720
- 1366x768
- 1440x900
- 1920x1080

Regression checks for every release:
- Create invoice flow
- Send invoice flow
- Manual share + mark sent flow
- Mark paid flow
- PDF download/share

---

## 11) Handoff Deliverables

- Low-fi wireframes per breakpoint group (`xs/sm`, `md`, `lg+`)
- Clickable prototype for:
- Create invoice
- Send invoice
- Mark paid
- Component spec sheet with states and variants
- Event tracking map for analytics

If any layout decision harms mobile usability, mobile wins for v1 workflow decisions.
