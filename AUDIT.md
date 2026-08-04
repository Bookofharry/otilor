# Otilor Project Audit

## Executive Summary

Otilor is a web-first invoicing app with a React frontend and Express backend. The project has a solid foundation with most core UI screens implemented, but critical gaps remain in analytics wiring, backend persistence, mobile parity, and launch readiness.

**Overall Completion: ~55–60%**

---

## 1. What Is Properly Built

### Frontend (web/)
- **Routing & Navigation**: Complete React Router setup with Dashboard, Invoices, Builder, Detail, Clients, Settings, Landing, and auth pages.
- **State Management**: Custom hook-based context architecture (`useInvoices`, `useBuilder`, `useClients`, `useDashboard`, `useSend`, `useToast`, `useBusinessSettings`).
- **UI Component Library**: 13 components (Button, Input, TextArea, Select, StatusChip, Card, KpiCard, Modal, Drawer, BottomSheet, Skeleton, EmptyState, ConfirmDialog, Toast).
- **Design Tokens**: Comprehensive CSS custom properties in `index.css` (colors, typography, spacing, radius, shadows, motion, breakpoints).
- **Pages**:
  - Landing page with auth (Sign In, Sign Up, Forgot Password)
  - Dashboard with KPIs, recent invoices, needs attention panel
  - Invoices workspace with filters, search, sort, pagination, remote history loading
  - Invoice Builder with line items, live preview, client selection
  - Invoice Detail with actions, preview, timeline
  - Clients page with search and inline creation
  - Settings with business profile, invoice defaults, sender preview, account profile, billing
- **API Client**: Full TypeScript API client in `api.ts` matching the OpenAPI contract.
- **PDF Export**: Connected backend PDF download + local fallback using `html2canvas` + `jspdf`.
- **Fallback Mode**: Full local CRUD when API is unavailable.
- **Server-Sent Events**: Timeline integration in invoice detail.

### Backend (server/)
- **Express + TypeScript**: Scaffolded with helmet, cors, morgan.
- **API Implementation**: All endpoints from `openapi.yaml` implemented:
  - Dashboard summary
  - Clients CRUD with cursor pagination and search
  - Invoices CRUD with cursor pagination, filters, sort
  - Invoice lifecycle actions: mark-sent, send-email, mark-paid, void
  - Invoice events timeline
  - PDF binary stream generation
- **Validation**: Strong field-level validation with `AppError` and structured error responses.
- **Idempotency**: Implemented for all mutation endpoints with TTL-based pruning.
- **Concurrency**: `If-Match` / version conflict handling on PATCH.
- **Status Transitions**: Server-enforced state machine (Draft → Sent → Paid/Void, etc.).
- **PDF Generation**: Raw PDF buffer generation in `pdf.ts`.

### Documentation
- Comprehensive product design, user flows, wireframes, design system, API contract, OpenAPI spec, implementation plan, handoff checklist, UX copy, and graphic direction docs.

---

## 2. What Is Missing or Incomplete

### Critical Gaps (Block Launch)

| Gap | Impact | Location |
|-----|--------|----------|
| **Analytics not wired into app** | `AnalyticsProvider` and `useAnalytics` exist in `web/src/context/` but are **never imported or used** in `App.tsx` or `AppRoutes.tsx`. Events are not tracked. | `web/src/App.tsx`, `web/src/app/AppRoutes.tsx` |
| **No backend persistence** | Server uses in-memory `Map`s. All data is lost on restart. No database. | `server/src/index.ts` |
| **No authentication** | Server has no auth middleware. All endpoints are public despite contract requiring Bearer tokens. | `server/src/index.ts` |
| **No email integration** | `send-email` endpoint is a mock that returns `queued` state. No actual email provider. | `server/src/index.ts:1097` |
| **No mobile stepper builder** | Builder is desktop split-view only. No mobile-optimized stepper flow (`BuilderMobilePage`). | `web/src/pages/BuilderPage.tsx` |
| **`window.confirm` for void** | Not accessible, not styled, not consistent with design system. | `web/src/app/AppWorkspace.tsx:648` |
| **PDF is plain text** | Server PDF is basic text. No styling, no branding, no proper layout. | `server/src/pdf.ts` |

### High Priority Gaps

| Gap | Impact | Location |
|-----|--------|----------|
| **Limited responsive breakpoints** | CSS only uses `min-width: 640px` and `min-width: 1024px`. Missing proper `xs/sm/md/lg/xl/2xl` grid. | `web/src/index.css` |
| **No loading skeletons** | Only Invoices page has skeleton. Dashboard, Builder, Detail, Clients lack loading states. | Various pages |
| **No error boundaries** | No React error boundaries around pages. | `web/src/app/AppWorkspace.tsx` |
| **No focus trap in overlays** | Modal, Drawer, BottomSheet, ConfirmDialog lack focus trap implementation. | UI components |
| **No test suite for server** | Frontend has vitest config and a couple of test files, but server has zero tests. | `server/` |
| **No autosave indicator** | Builder lacks visible `Saving...` / `Draft saved` / `Draft not synced` states. | `web/src/pages/BuilderPage.tsx` |
| **No offline support / service worker** | No PWA features, no offline queue, no sync indicators. | `web/` |
| **No CI/CD** | No GitHub Actions, no automated lint/test/build. | Root |
| **No Docker / deployment config** | No containerization, no Procfile, no deployment scripts. | Root |

### Medium Priority Gaps

| Gap | Impact | Location |
|-----|--------|----------|
| **Brand font mismatch** | Design system specifies `Manrope`, but CSS uses `Delius` / `Aptos`. | `web/src/index.css:161` |
| **Color token deviation** | Design system uses `#0B6BFF` brand, but CSS uses `#3B82F6` (Tailwind blue). | `web/src/index.css:90-99` |
| **Monolithic AppWorkspace** | `AppWorkspace.tsx` is 944 lines with all business logic. Hard to test and maintain. | `web/src/app/AppWorkspace.tsx` |
| **Duplicate App.tsx paths** | README references old `c:/Users/hp/Desktop/sideProjects/SmartInvoice` paths. | `README.md:50-55` |
| **No code splitting** | All pages loaded eagerly. No `React.lazy` / `Suspense`. | `web/src/app/AppRoutes.tsx` |
| **No keyboard shortcuts** | Builder lacks `Ctrl+S` save, Detail lacks keyboard actions per userflows. | Pages |
| **No retry logic** | Send actions lack retry/timeout handling. | `web/src/app/AppWorkspace.tsx:679` |
| **No analytics dashboard** | No KPI dashboard for launch metrics. | — |
| **Missing `send-payment-notification` in OpenAPI** | API has endpoint but OpenAPI spec does not document it. | `openapi.yaml` vs `server/src/index.ts:1240` |

### Low Priority / Nice-to-Have

| Gap | Impact | Location |
|-----|--------|----------|
| **No mobile app** | Out of scope for v1 web launch, but mentioned in docs. | — |
| **No recurring invoices UI** | Types exist but no UI or backend logic. | `web/src/app/types.ts:94-112` |
| **No payment links** | Out of scope. | — |
| **No reminder automations** | Out of scope. | — |
| **No accessibility audit** | WCAG 2.1 AA not verified. | — |
| **No performance monitoring** | No Sentry, no metrics. | — |
| **No rate limiting** | Server lacks rate limiting middleware. | `server/src/index.ts` |
| **No request logging to file** | Morgan logs to stdout only. | `server/src/index.ts:854` |

---

## 3. Completion Percentage by Area

| Area | Completion | Notes |
|------|-----------|-------|
| Frontend UI Screens | 85% | All core screens exist; mobile stepper missing |
| Design System / Tokens | 75% | Tokens in place but deviate from spec (font, brand color) |
| Backend API | 70% | All endpoints implemented; missing auth, persistence, email |
| Client Management | 80% | Page exists; missing edit capability and inline drawer in builder |
| Analytics | 20% | Types/provider exist but not wired into app |
| Mobile Optimization | 40% | Basic responsive CSS; no stepper builder, no bottom sheet send |
| Accessibility | 30% | Some aria labels; missing focus traps, keyboard nav, contrast audit |
| Testing | 10% | Frontend has vitest config + 2 test files; server has none |
| Documentation | 90% | Comprehensive docs; some outdated paths |
| Deployment / Ops | 5% | No CI/CD, Docker, monitoring, or database |

**Weighted Overall: ~55–60%**

---

## 4. Things That Can Be Done Better

### Architecture & Code Quality
1. **Split `AppWorkspace.tsx`**: Extract business logic into smaller, testable hooks or service modules. Currently 944 lines.
2. **Wire AnalyticsProvider**: Wrap app with `AnalyticsProvider` in `AppRoutes.tsx` and actually fire events on all user actions.
3. **Replace `window.confirm`**: Use the existing `ConfirmDialog` component for void action.
4. **Add proper breakpoint CSS**: Implement all 6 breakpoints (`xs/sm/md/lg/xl/2xl`) with a grid system per `wireframespec.md`.
5. **Add loading skeletons**: Dashboard, Builder, Detail, and Clients pages need skeleton loaders.
6. **Add error boundaries**: Wrap each page route in a React error boundary.
7. **Implement focus traps**: Add focus trap to Modal, Drawer, BottomSheet, and ConfirmDialog.
8. **Code splitting**: Use `React.lazy` + `Suspense` for route-based code splitting.
9. **Extract magic strings**: Centralize route paths, status labels, and event types.
10. **Add TypeScript strictness**: Enable `strict: true` in web `tsconfig.app.json` if not already.

### Backend
11. **Add database**: Replace in-memory maps with SQLite or PostgreSQL. Add Prisma or Drizzle ORM.
12. **Implement auth middleware**: Add JWT validation to protected routes per `apicontract.md`.
13. **Integrate email provider**: Replace mock `send-email` with real SMTP or SendGrid/Mailgun integration.
14. **Add rate limiting**: Implement `express-rate-limit` on mutation endpoints.
15. **Add request logging**: Log to file or structured logger (Pino/Winston) instead of stdout only.
16. **Add health checks**: Expand `/healthz` to include dependency checks.
17. **Add server tests**: Unit tests for validation, status transitions, and idempotency.
18. **Add OpenAPI coverage**: Document `send-payment-notification` endpoint.

### Frontend
19. **Build mobile stepper**: Create `BuilderMobilePage.tsx` with step-based flow for `xs/sm`.
20. **Add autosave indicator**: Show `Saving...` / `Draft saved` / `Draft not synced` in builder.
21. **Add retry logic**: Implement exponential backoff retry for send and status actions.
22. **Add offline support**: Service worker + local queue for draft saves.
23. **Add keyboard shortcuts**: `Ctrl+S` save, `Ctrl+Enter` send in builder/send panel.
24. **Implement searchable client picker**: Replace raw `<select>` in builder with searchable dropdown.
25. **Add client edit**: ClientsPage lacks edit functionality; only select and create.
26. **Add version conflict UI**: Handle `VERSION_CONFLICT` with reload/duplicate prompt.
27. **Add aria-labels**: Audit all icon-only buttons and interactive elements.
28. **Add reduced motion**: Wrap animations in `prefers-reduced-motion` query (partially exists).

### Product / Design
29. **Align brand colors**: Update CSS tokens to match `designsystem.md` (`#0B6BFF` instead of `#3B82F6`).
30. **Align font**: Switch from `Delius`/`Aptos` to `Manrope` per design system.
31. **Add empty state illustrations**: Design system allows none in v1, but would improve UX.
32. **Add onboarding tour**: First-session guidance for new users.

### DevOps
33. **Add CI/CD**: GitHub Actions for lint, test, build on PR.
34. **Add Docker**: Dockerfile + docker-compose for local dev.
35. **Add environment validation**: Validate required env vars on startup.
36. **Add migration scripts**: Database schema migrations when DB is added.

---

## 5. Recommended Next Steps (Priority Order)

### Phase 1: Critical Path (Weeks 1–2)
1. Wire `AnalyticsProvider` into `AppRoutes.tsx` and fire all 18+ events.
2. Add SQLite + Prisma to server for persistence.
3. Add JWT auth middleware to protected routes.
4. Replace `window.confirm` with `ConfirmDialog`.
5. Build `BuilderMobilePage.tsx` stepper flow.

### Phase 2: Quality & Polish (Weeks 3–4)
6. Implement proper 6-breakpoint responsive system.
7. Add loading skeletons to all pages.
8. Add error boundaries and focus traps.
9. Add server test suite.
10. Integrate real email provider.

### Phase 3: Launch Readiness (Weeks 5–6)
11. Accessibility audit and remediation.
12. Performance optimization (code splitting, memoization).
13. CI/CD pipeline.
14. Cross-device regression testing.
15. Handoff checklist completion.

---

## 6. File Structure Overview

```
otilor/
├── .codex/                    # Kilo agent config
├── .gitignore
├── analysis-report.md         # Existing gap analysis
├── apicontract.md             # API contract
├── designsystem.md            # Design tokens & components
├── graphic.md                 # Brand guidelines
├── handoffchecklist.md        # Release checklist
├── implementationplan.md      # Sprint plan
├── openapi.yaml               # API spec
├── package-lock.json          # Root lock (empty)
├── plans/
│   └── frontend-buildout-plan.md
├── productdesign.md           # Product spec
├── README.md                  # Project README
├── server/
│   ├── .eslintrc.cjs
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts           # Express app (1282 lines)
│       └── pdf.ts             # PDF generation
├── userflows.md               # User journey definitions
├── uxcopy.md                  # UX microcopy
├── web/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── vitest.config.js
│   ├── public/                # Favicons, manifest, images
│   └── src/
│       ├── App.tsx            # Root (12 lines)
│       ├── App.css
│       ├── api.ts             # API client (448 lines)
│       ├── index.css          # Styles + tokens (7507+ lines)
│       ├── main.tsx
│       ├── app/
│       │   ├── AppRoutes.tsx
│       │   ├── AppWorkspace.tsx # 944 lines - main workspace
│       │   ├── businessSettings.ts
│       │   ├── fallbackData.ts
│       │   ├── invoiceDownload.ts
│       │   ├── invoiceIssuer.ts
│       │   ├── invoicePrint.ts
│       │   ├── invoiceUtils.ts
│       │   ├── invoiceUtilsBackup.ts
│       │   ├── types.ts
│       │   ├── transformers.ts
│       │   ├── userProfile.ts
│       │   └── workspacePreferences.ts
│       ├── components/
│       │   ├── Toast.tsx
│       │   ├── ui/            # 13 UI components
│       │   └── ...
│       ├── context/
│       │   ├── AnalyticsProvider.tsx  # EXISTS BUT NOT USED
│       │   ├── AppContext.tsx
│       │   ├── AppProvider.tsx
│       │   ├── useAnalytics.ts        # EXISTS BUT NOT USED
│       │   ├── useApp.ts
│       │   ├── useBuilder.ts
│       │   ├── useBusinessSettings.ts
│       │   ├── useClients.ts
│       │   ├── useDashboard.ts
│       │   ├── useInvoices.ts
│       │   ├── useSend.ts
│       │   └── useToast.ts
│       ├── layout/
│       │   ├── AppNavigation.tsx
│       │   ├── AppShell.tsx
│       │   └── Topbar.tsx
│       ├── modules/
│       │   ├── billing/
│       │   │   └── components/
│       │   │       └── UpgradeModal.tsx
│       │   └── invoices/
│       │       ├── components/
│       │       │   ├── InvoicePreview.tsx
│       │       │   ├── SendPanel.tsx
│       │       │   └── Timeline.tsx
│       │       └── ...
│       ├── pages/
│       │   ├── BuilderPage.tsx
│       │   ├── ClientsPage.tsx
│       │   ├── DashboardPage.tsx
│       │   ├── DetailPage.tsx
│       │   ├── ForgotPasswordPage.tsx
│       │   ├── InvoicesPage.tsx
│       │   ├── LandingPage.tsx
│       │   ├── PrivacyPage.tsx
│       │   ├── SettingsPage.tsx
│       │   ├── SignInPage.tsx
│       │   ├── SignUpPage.tsx
│       │   ├── TermsPage.tsx
│       │   └── index.ts
│       └── test/
│           ├── App.test.tsx
│           ├── setup.ts
│           └── simple.test.ts
└── wireframespec.md
```

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| No database / data loss | High | Critical | Add SQLite + Prisma immediately |
| No auth / security | High | Critical | Add JWT middleware before any production deployment |
| Analytics never launched | Medium | High | Wire provider into app this sprint |
| Mobile UX unusable | Medium | High | Build stepper builder before launch |
| PDF looks unprofessional | Medium | Medium | Redesign PDF generation with proper layout |
| Server memory limits | Medium | Medium | Add DB + connection pooling |
| Frontend bundle size | Low | Medium | Code splitting + lazy loading |

---

*Audit generated: 2026-08-03*
