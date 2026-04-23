# SmartInvoice Implementation Plan

> **Last Updated:** 2026-03-28  
> **Current Status:** ~78% Complete (core web architecture reset in place, with Settings expanded into a usable workspace)  
> **Analysis Report:** See [`analysis-report.md`](SmartInvoice/analysis-report.md) for detailed gap analysis

> **Latest Progress:** Settings now includes a business sender profile, live invoice sender preview, editable local account identity, invoice defaults, and persisted demo plan state.

## 1) Objective
Ship SmartInvoice v1 as a web-first product with mobile-ready architecture and consistent core workflows:
- Dashboard
- Invoice Builder
- Invoice Detail
- PDF export
- Status updates (Sent/Paid/Overdue/Void) with explicit `Mark as Sent`
- Premium email send and upgrade gate

Target outcome:
- Launch a high-quality web app first, then roll mobile clients without changing core business logic.

### Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| UI Component Library | ✅ Complete | 12 components implemented |
| Design System | ✅ Complete | Tokens, typography, colors in place |
| Dashboard | ✅ Complete | Refocused as an overview surface with direct handoff into Invoices |
| Invoices Workspace | ✅ Complete | Dedicated browse/filter/history surface with responsive layouts and connected-mode history loading |
| Invoice Builder | ✅ Complete | Line items, preview, validation |
| Invoice Detail | ✅ Complete | Actions, status updates, timeline, and edit-state guards |
| PDF Export | ✅ Complete | Real backend PDF download in connected mode, local PDF fallback in demo mode |
| Landing Page | ✅ Complete | Marketing site with auth |
| Client Management | ⚠️ Partial | API exists, UI needed |
| Settings | ⚠️ Partial | Business profile and invoice defaults added; billing and deeper account settings still pending |
| Timeline/History | ✅ Complete | Structured timeline integrated into invoice detail |
| Analytics Events | ❌ Missing | 18+ events need implementation |
| Accessibility | ⚠️ Partial | Needs audit and fixes |
| Mobile Optimization | ⚠️ Partial | Dashboard, invoice detail, and invoices workspace improved; broader hardening still needed |

### Product Architecture Reset (2026-03-27)

The product idea is strong, but the signed-in app still feels screen-led instead of workflow-led.

Current architecture issue:
- `Dashboard` is doing both overview and invoice browsing work
- `Invoice Detail` is exposed like a primary destination instead of a record page
- There is no dedicated invoice workspace where previous, current, paid, overdue, draft, and void invoices can all be browsed together

Target product structure:

| Section | Role | Notes |
|---------|------|-------|
| Dashboard | Overview only | KPIs, attention items, recent invoices, quick actions |
| Invoices | Primary workspace | Full list, tabs, search, sort, filters, status browsing |
| Create Invoice | Creation flow | Builder with preview and save/send path |
| Clients | Entity management | Client records and later invoice relationships |
| Invoice Detail | Route only, not nav | Accessed from dashboard or invoices list |
| Settings | Supporting workspace | Business profile, invoice defaults, billing, preferences |

Recommended navigation:
- Desktop: `Dashboard`, `Invoices`, `Create Invoice`, `Clients`, `Settings`
- Mobile: `Dashboard`, `Invoices`, `New`, `Clients`
- Remove `Detail` from primary navigation on all breakpoints

Recommended route map:
- `/dashboard`
- `/invoices`
- `/invoices/new`
- `/invoices/:invoiceId`
- `/invoices/:invoiceId/edit`
- `/clients`
- `/settings`
- `/terms`
- `/privacy`
- `/signin`
- `/signup`
- `/forgot-password`

Screen responsibilities:

`Dashboard`
- Summary only
- KPIs, overdue attention, drafts needing action, recent invoice activity
- Short recent-invoice list with clear path into the full invoices workspace

`Invoices`
- Main operational center of the product
- Tabs or segmented filters: `All`, `Draft`, `Sent`, `Overdue`, `Paid`, `Void`
- Search by invoice number and client
- Sorting by date, due date, amount, and status
- Unified history for both previous and current invoices

`Invoice Detail`
- Focused record page
- Status, amount, due date, actions, preview, and timeline
- Entered from the list or dashboard, not treated as a sibling destination to Dashboard

Responsive behavior rules:

Desktop:
- Table-first invoice browsing
- Visible tabs, sort, filters, and quick actions
- Split layouts allowed where they improve scanning

Tablet:
- Smaller text and tighter spacing than desktop
- Compressed table or hybrid card/table patterns
- Filters remain visible, but with reduced control density

Mobile:
- Card-first invoice browsing instead of cramped desktop tables
- Sticky or horizontally scrollable status tabs/chips
- Compact search and filter row
- Smaller headers, tighter spacing, and smaller components than tablet and desktop
- Strong primary CTA for `New Invoice`

Signed-in product design direction:
- Landing can stay expressive, but the product area should feel calmer and more operational
- Prioritize trust, status clarity, amount hierarchy, due dates, and obvious next actions
- The UI should make users feel: "I know what needs attention, I can find any invoice quickly, and I will not make a mistake here."

Implementation order for the architecture reset:
1. [x] Create `InvoicesPage` as the main invoice workspace
2. [x] Add `Invoices` to primary navigation on desktop, tablet, and mobile
3. [x] Move invoice browsing/history responsibility out of `Dashboard`
4. [x] Remove `Detail` as a top-level navigation item
5. [x] Keep `Dashboard` summary-only
6. [x] Refine `Invoice Detail` as a route-level record page entered from list/overview
7. [ ] Test desktop, tablet, and mobile behaviors before expanding scope

---

## 2) Scope Baseline

In scope (v1):
- Items defined in `SmartInvoice/productdesign.md`
- Responsive and multi-device behavior from `SmartInvoice/wireframespec.md`
- User journeys from `SmartInvoice/userflows.md`
- UX microcopy from `SmartInvoice/uxcopy.md`
- Component and token standards from `SmartInvoice/designsystem.md`
- API contract from `SmartInvoice/apicontract.md`
- OpenAPI spec from `SmartInvoice/openapi.yaml`

Out of scope (v1):
- Recurring invoices
- Payment links
- Reminder automations
- Advanced accounting workflows

---

## 3) Team and Ownership

Minimum team:
- Product Lead (scope, priorities, acceptance)
- Product Designer (wireframes, high-fi, UX QA)
- Frontend Engineer - Web
- Frontend Engineer - Mobile (part-time until web core is stable)
- Backend Engineer
- QA Engineer
- Data/Analytics Engineer (part-time)

Primary ownership:
- Product decisions: Product Lead
- UX/UI consistency: Product Designer
- Shared logic and APIs: Backend Engineer
- Web implementation: FE Web
- Mobile implementation: FE Mobile
- Test strategy and release quality: QA
- Event tracking and KPI visibility: Data/Analytics

---

## 4) Delivery Cadence

Sprint length:
- 2 weeks per sprint

Cadence:
- Daily standup (15 min)
- Backlog refinement (weekly)
- Design/engineering sync (2x weekly)
- Sprint review + demo (end of sprint)
- Retro (end of sprint)

Planning horizon:
- Sprint 0 + Sprint 1-3 for web launch candidate (8 weeks)
- Sprint 4 for mobile client hardening and parity pass
- Day-14 post-web-launch review

---

## 5) Workstreams

- Product and UX
- Design system and UI components
- Backend/API and data model
- Web app implementation (primary)
- Mobile app implementation (secondary, post web core)
- QA automation and manual testing
- Analytics and KPI reporting

Rule:
- Do not advance a workstream phase if core multi-device flows are failing.

---

## 6) Sprint Plan

## Sprint 0 (Weeks 1-2): Foundations and Architecture

**Status:** ✅ **COMPLETE**

Goal:
- Lock product scope, architecture, and design system before feature rush.

Deliverables:
- [x] Final v1 requirements and acceptance criteria
- [x] API contract draft for invoice lifecycle actions
- [x] Design tokens and base component library (button/input/chip/card/modal/toast)
- [ ] Analytics event schema - **DEFERRED TO SPRINT 3**
- [ ] QA device matrix and test plan - **DEFERRED TO SPRINT 4**

Engineering tasks:
- [x] Set up shared state model for invoice status transitions
- [x] Build API scaffolding for create/update/get/list invoice
- [x] Build token infrastructure and theme primitives

Completed Work:
- 12 UI components created (Button, Input, TextArea, Select, StatusChip, Card, KpiCard, Modal, Drawer, BottomSheet, Skeleton, EmptyState, ConfirmDialog, Toast)
- CSS design tokens implemented via custom properties
- API layer implemented in `api.ts`
- React context hooks for state management

Exit criteria:
- [x] No open ambiguity on lifecycle/state rules
- [x] Tokenized component baseline available in code
- [ ] QA and analytics plans approved - **PENDING**

---

## Sprint 1 (Weeks 3-4): Create and Save Core

**Status:** ⚠️ **PARTIALLY COMPLETE** (70%)

Goal:
- Users can create invoice drafts quickly on web, with mobile-safe patterns baked in.

Deliverables:
- [x] Dashboard v1 with KPIs and `Create Invoice`
- [ ] Lightweight client list/drawer with create and edit support - **PENDING**
- [x] Invoice Builder for web (`lg+`) with responsive behavior for `xs/sm/md`
- [x] Draft autosave and validation
- [x] Invoice Detail base view for drafts

Completed Work:
- Dashboard with KPI cards, needs attention panel, recent activity
- Invoice Builder with line items, live preview, validation
- Invoice Detail page with status display
- Responsive layouts for all breakpoints
- Landing page with auth (Sign In/Sign Up)

Pending Tasks:
- [ ] **PRIORITY:** Create ClientsPage component
- [ ] **PRIORITY:** Create ClientDrawer for inline client selection in builder
- [ ] **PRIORITY:** Add client creation form

Analytics tasks (DEFERRED to Sprint 3):
- [ ] `create_invoice_clicked`, `invoice_builder_opened`, `invoice_draft_saved`, `invoice_save_failed`, `client_created`, `client_selected`

Exit criteria:
- [x] Critical create/save flows pass all device classes
- [ ] Client management UI complete - **PENDING**

---

## Sprint 2 (Weeks 5-6): Invoice Detail and Status Actions

**Status:** ⚠️ **PARTIALLY COMPLETE** (65%)

Goal:
- Complete invoice action hub and lifecycle handling.

Deliverables:
- [x] Invoice Detail action rail/bar
- [x] Download PDF - **Connected backend PDF with local fallback**
- [x] Edit invoice with state rules
- [x] Mark as Sent flow
- [x] Mark as Paid flow
- [x] Void flow with confirmation
- [x] Timeline events in invoice detail

Completed Work:
- Action rail with all status buttons (Mark as Sent, Mark as Paid, Void)
- Connected backend PDF download with local PDF fallback in demo mode
- Confirmation dialogs for destructive actions
- Structured timeline integrated into invoice detail
- Status transitions working (Draft → Sent → Paid/Void)

Pending Tasks:
- [x] **PRIORITY:** Add edit restrictions for Paid/Void invoices
- [x] **PRIORITY:** Add confirmation for editing Sent invoices

Engineering tasks:
- [x] Implement status transition API guards
- [x] Implement PDF generation and device-appropriate export behavior
- [x] Implement edit restrictions for `Paid` and `Void`
- [x] Implement confirmation and in-builder warning for editing `Sent` / `Overdue`

Analytics tasks (DEFERRED to Sprint 3):
- [ ] `invoice_detail_viewed`, `invoice_mark_sent_clicked`, `invoice_mark_sent_succeeded`, `invoice_mark_paid_clicked`, `invoice_mark_paid_succeeded`, `invoice_pdf_downloaded`

Exit criteria:
- [x] Status transitions are accurate and auditable
- [x] Timeline component integrated
- [ ] Edit restrictions enforced - **PENDING**

---

## Sprint 3 (Weeks 7-8): Premium Send, Upgrade Gate, and Analytics

**Status:** ⚠️ **PARTIALLY COMPLETE** (60%) - **EXPANDED SCOPE**

Goal:
- Ship premium email send experience with reliable gating and recovery.
- **NEW:** Implement comprehensive analytics event tracking system.
- **NEW:** Complete Sprint 1 & 2 pending items (Client Management, Timeline).

Deliverables:
- [x] Send Invoice surface by device type (drawer/sheet/modal)
- [x] Premium gate for free users
- [ ] Upgrade success return-to-intent flow - **NEEDS TESTING**
- [ ] Send success/failure/retry paths - **NEEDS ENHANCEMENT**
- [ ] **NEW:** Analytics event tracking system - **CRITICAL PRIORITY**
- [ ] **NEW:** Client management page and drawer - **FROM SPRINT 1**
- [ ] **NEW:** Timeline component for invoice history - **FROM SPRINT 2**

Completed Work:
- SendPanel component with email form
- UpgradeModal with pricing tiers
- Payment notification API integration

Pending Tasks (Priority Order):
1. [ ] **CRITICAL:** Create `useAnalytics` hook and `AnalyticsProvider` context
2. [ ] **CRITICAL:** Implement all 18+ analytics events from userflows.md
3. [ ] **HIGH:** Create ClientsPage for full client management
4. [ ] **HIGH:** Create ClientDrawer for inline client selection
5. [ ] **HIGH:** Create Timeline component for invoice detail
6. [ ] **MEDIUM:** Enhance retry handling for send failures
7. [ ] **MEDIUM:** Test upgrade return-to-intent flow

Analytics Events to Implement (from [`userflows.md`](SmartInvoice/userflows.md)):
- Sprint 1 Events: `create_invoice_clicked`, `invoice_builder_opened`, `invoice_draft_saved`, `invoice_save_failed`, `client_created`, `client_selected`
- Sprint 2 Events: `invoice_detail_viewed`, `invoice_mark_sent_clicked`, `invoice_mark_sent_succeeded`, `invoice_mark_paid_clicked`, `invoice_mark_paid_succeeded`, `invoice_pdf_downloaded`
- Sprint 3 Events: `send_invoice_clicked`, `invoice_send_attempted`, `invoice_send_succeeded`, `invoice_send_failed`, `upgrade_modal_viewed`, `upgrade_started`, `upgrade_completed`

Engineering tasks:
- [x] Email send API integration with idempotency
- [ ] Retry and timeout handling - **NEEDS ENHANCEMENT**
- [x] Premium entitlement checks and feature flag
- [ ] **NEW:** Analytics infrastructure and event dispatching
- [ ] **NEW:** Client management UI components
- [x] **NEW:** Timeline component with event history

Exit criteria:
- [ ] All 18+ analytics events implemented and tested
- [ ] Client management UI complete and functional
- [x] Timeline component integrated in invoice detail
- [ ] Send retry behavior stable
- [ ] Free fallback path (PDF/manual sharing) remains intact - **VERIFIED**

---

## Sprint 4 (Weeks 9-10): Mobile Parity, Accessibility, and Launch Hardening

**Status:** ❌ **NOT STARTED** (0%)

Goal:
- Mobile client parity and post-web-launch hardening.
- Accessibility compliance and remediation.
- Performance optimization for production.

Deliverables:
- [ ] Mobile implementation of already shipped web core flows
- [ ] Performance tuning for dashboard and builder responsiveness
- [ ] Accessibility remediations (keyboard, contrast, labels, text scaling)
- [ ] Cross-device regression pass
- [ ] Launch checklist and support playbook

Engineering Tasks (Priority Order):
1. [ ] **CRITICAL:** Accessibility audit and remediation
   - Keyboard navigation testing
   - ARIA labels and roles
   - Color contrast verification (WCAG 2.1 AA)
   - Screen reader compatibility
   - Focus management in modals/drawers

2. [ ] **HIGH:** Performance optimization
   - React.memo for list components
   - Virtualization for long invoice lists
   - Code splitting verification
   - Bundle size optimization
   - Lazy loading for heavy components (PDF generator)

3. [ ] **HIGH:** Error handling and recovery
   - Network error boundaries
   - Retry logic for failed operations
   - Offline state handling
   - Toast error messages per [`uxcopy.md`](SmartInvoice/uxcopy.md)

4. [ ] **MEDIUM:** Mobile-specific enhancements
   - Touch gesture support
   - Mobile-optimized form inputs
   - Bottom sheet interactions refinement
   - Viewport-specific optimizations

5. [ ] **MEDIUM:** Observability setup
   - Error monitoring integration (Sentry/similar)
   - Performance monitoring
   - User session tracking

QA Tasks:
- [ ] Full regression suite across device matrix (xs/sm/md/lg/xl/2xl)
- [ ] Accessibility validation (automated + manual)
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] Keyboard-only navigation testing
- [ ] Smoke tests for release candidate
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

Analytics Tasks:
- [ ] Launch KPI dashboard with segmented views by platform/device class
- [ ] Verify all events firing correctly
- [ ] Event property validation

Exit criteria:
- [ ] [`handoffchecklist.md`](SmartInvoice/handoffchecklist.md) fully checked
- [ ] Zero critical accessibility violations
- [ ] Performance budget met (initial load < 3s on 3G)
- [ ] All core flows pass on phone, tablet, and desktop
- [ ] Release decision approved by Product, Design, Eng, QA

---

## NEW: Phase 5 (Post-Launch) - Continuous Improvement

**Timeline:** Weeks 11-14 (Post-launch iteration)

Goal:
- Monitor launch metrics and iterate based on user feedback.

Deliverables:
- [ ] 14-day post-launch review completed
- [ ] Top UX friction points identified and prioritized
- [ ] Performance monitoring dashboard active
- [ ] User feedback collection system in place

Key Metrics to Track:
- Median time-to-sent-invoice
- Draft-to-sent conversion rate
- Send failure rate
- Upgrade conversion at send gate
- User retention (Day 1, Day 7, Day 30)

Exit criteria:
- [ ] Post-launch review document completed
- [ ] Next sprint backlog prioritized based on data
- [ ] No critical bugs unresolved

---

## 7) Effort Estimates (T-Shirt + Story Point Guidance)

### Updated Estimates (Based on Current Progress)

Epics:
| Epic | Status | Original | Revised | Notes |
|------|--------|----------|---------|-------|
| Foundation and Design System | ✅ Complete | L (34-55) | **DONE** | All components built |
| Create/Save Core Flow | ⚠️ 70% | XL (55-89) | **M (21-34)** | Client UI pending |
| Invoice Actions and Status Lifecycle | ⚠️ 65% | L (34-55) | **S (8-13)** | Timeline + restrictions pending |
| Premium Send + Gating | ⚠️ 60% | L (34-55) | **S (8-13)** | Analytics + retry pending |
| Analytics Implementation | ❌ New | - | **M (21-34)** | **NEW: 18+ events needed** |
| QA Hardening + Accessibility + Perf | ❌ Not Started | L (34-55) | **L (34-55)** | Full scope remaining |

**Remaining Effort:** ~92-149 points

### Sprint Capacity Planning

At 25 points/sprint velocity:
- **Sprint 3 (Current):** 25 points
  - Analytics system (13 pts)
  - Client management UI (8 pts)
  - Timeline component (5 pts)
  
- **Sprint 4:** 25 points
  - Accessibility remediation (13 pts)
  - Performance optimization (8 pts)
  - Error handling improvements (5 pts)

- **Buffer:** 42-99 points for defects, scope adjustments, and polish

Planning note:
- If velocity drops below 20 points/sprint, consider extending Sprint 4 or deferring non-critical items to post-launch.
- **Critical path:** Analytics must be complete before launch for KPI tracking.

---

## 8) Multi-Device Definition of Done (Per Story)

A story is not done unless:
- Behavior works on `xs/sm`, `md`, and `lg+`.
- Keyboard and touch interactions both work where relevant.
- Copy fits smallest supported width.
- Error and recovery states are implemented.
- Event tracking is emitted with required properties.
- QA evidence exists for at least one device in each class.

---

## 9) Dependency and Risk Controls

Key dependencies:
- Email provider integration and reliability
- PDF rendering performance and consistency
- Authentication/session behavior across web/mobile
- Upgrade/premium entitlement service

Top risks:
- Feature creep into accounting scope
- Mobile parity erosion during desktop-first implementation
- Unclear state transitions causing billing errors
- Weak send reliability causing trust loss

Controls:
- Weekly scope freeze check
- Lifecycle transition tests in CI
- Device parity checks every sprint
- Send-path monitoring with alert thresholds

---

## 10) KPI and Launch Targets

Primary:
- Median time-to-sent-invoice < 2 minutes (target user path)

Secondary:
- Draft-to-sent conversion >= 80%
- Send failure rate < 2%
- First-session first-invoice creation rate tracked and improving
- Upgrade conversion at send gate monitored weekly

---

## 11) Decision Log

| Date | Decision | Owner | Impact | Status |
|------|----------|-------|--------|--------|
| 2026-03-27 | Recenter signed-in product architecture around a dedicated `Invoices` workspace and make `Dashboard` summary-only | Product Lead + Tech Lead | Changes navigation, route priorities, and next implementation order | Active |
| 2026-02-20 | Consolidated Sprint 3 scope to include deferred analytics and pending Sprint 1-2 items | Tech Lead | Sprint 3 expanded from "Premium Send" to "Analytics + Client Management + Timeline" | Active |
| 2026-02-20 | Added Phase 5 (Post-Launch) for continuous improvement | Tech Lead | Extended planning horizon to Week 14 | Active |
| 2026-02-20 | Prioritized analytics as critical path for launch | Product Lead | Analytics must be complete before launch for KPI tracking | Active |

---

## 12) Immediate Next Actions (Updated 2026-03-27)

### Architecture Reset Priority

Before shipping more surface-level polish, align the signed-in product around the new information architecture:

1. [ ] Define `InvoicesPage` UX and responsive behavior
   - Implemented with desktop table layout
   - Implemented with tablet hybrid/table-card layout
   - Implemented with mobile card layout, compact tabs/chips, and connected-mode history loading

2. [x] Update primary navigation model
   - `Invoices` added
   - `Detail` removed from top-level nav
   - `Create Invoice` kept prominent across breakpoints

3. [x] Reduce `Dashboard` to an overview-only surface
   - KPIs
   - Attention items
   - Recent invoices
   - Quick links into `Invoices`

4. [x] Treat `Invoice Detail` as a route-level record page only
   - Enter from Dashboard or Invoices list
   - Detail route can now recover invoices that were loaded later from server history
   - Continue refining actions, preview, and timeline within that narrower responsibility

5. [ ] Validate the architecture on desktop, tablet, and mobile before expanding scope
   - No desktop-sized components carried unchanged into smaller breakpoints
   - Invoice browsing must remain usable on touch devices
   - Previous and current invoices must be equally discoverable

### Legacy Sprint 3 Actions

### This Week (Sprint 3 - Week 1):

**Engineering Priority Order:**

1. [ ] **Create Analytics Infrastructure** (Day 1-2)
   - Create `useAnalytics.ts` hook
   - Create `AnalyticsProvider.tsx` context
   - Define event types and interfaces
   - Set up event dispatch mechanism

2. [ ] **Implement Core Analytics Events** (Day 2-3)
   - Invoice lifecycle events
   - Client management events
   - Send/upgrade events

3. [ ] **Build Client Management UI** (Day 3-4)
   - Create `ClientsPage.tsx`
   - Create `ClientDrawer.tsx` for inline selection
   - Add client creation form
   - Wire up to existing API

4. [ ] **Create Timeline Component** (Day 4-5)
   - Design timeline UI per designsystem.md
   - Integrate with invoice detail
   - Show status change history

### Next Week (Sprint 3 - Week 2):

5. [ ] Complete remaining analytics events
6. [ ] Test analytics event firing
7. [ ] Enhance send retry handling
8. [ ] Code review and QA handoff

### Sprint 4 Preparation:

- [ ] Schedule accessibility audit
- [ ] Set up performance monitoring tools
- [ ] Prepare device matrix for testing
- [ ] Review handoffchecklist.md items

---

## 13) File Reference Guide

### Key Implementation Files:

**UI Components:**
- [`web/src/components/ui/*.tsx`](SmartInvoice/web/src/components/ui/) - 12 UI components

**Pages:**
- [`web/src/pages/DashboardPage.tsx`](SmartInvoice/web/src/pages/DashboardPage.tsx)
- [`web/src/pages/BuilderPage.tsx`](SmartInvoice/web/src/pages/BuilderPage.tsx)
- [`web/src/pages/DetailPage.tsx`](SmartInvoice/web/src/pages/DetailPage.tsx)
- [`web/src/pages/LandingPage.tsx`](SmartInvoice/web/src/pages/LandingPage.tsx)
- [`web/src/pages/SignInPage.tsx`](SmartInvoice/web/src/pages/SignInPage.tsx)
- [`web/src/pages/SignUpPage.tsx`](SmartInvoice/web/src/pages/SignUpPage.tsx)

**Context/Hooks:**
- [`web/src/context/*.ts`](SmartInvoice/web/src/context/) - State management hooks

**API:**
- [`web/src/api.ts`](SmartInvoice/web/src/api.ts) - API client

**Styles:**
- [`web/src/index.css`](SmartInvoice/web/src/index.css) - Consolidated stylesheet

### New Files Needed (Sprint 3):

- `web/src/context/useAnalytics.ts` - Analytics hook
- `web/src/components/AnalyticsProvider.tsx` - Analytics context
- `web/src/pages/ClientsPage.tsx` - Client management page
- `web/src/components/ClientDrawer.tsx` - Inline client selection
- `web/src/components/Timeline.tsx` - Invoice history timeline

---

## 14) Risk Register (Updated)

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| Analytics implementation delays launch | Medium | High | Prioritize core events only; defer nice-to-have events | Tech Lead |
| Accessibility audit reveals major issues | Medium | High | Start audit early in Sprint 4; allocate buffer time | QA Lead |
| Client management UI complexity | Low | Medium | Use existing Drawer component; reuse patterns | FE Engineer |
| Performance issues on mobile | Medium | Medium | Profile early; implement virtualization | FE Engineer |
| Send retry logic complexity | Low | Medium | Simplify to 3-retry with exponential backoff | BE Engineer |

---

Execution rule:
- If a decision threatens cross-device flow quality, pause feature work and resolve before continuing.
- **NEW:** Analytics events are now critical path - no launch without them.
