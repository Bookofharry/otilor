# SmartInvoice Handoff Checklist

## 1) Purpose
This checklist is the execution gate from strategy to release.

Pass condition:
- Every required item is checked.
- No critical open issue remains in core flows.

Linked source docs:
- `SmartInvoice/productdesign.md`
- `SmartInvoice/wireframespec.md`
- `SmartInvoice/userflows.md`
- `SmartInvoice/uxcopy.md`
- `SmartInvoice/designsystem.md`
- `SmartInvoice/apicontract.md`
- `SmartInvoice/openapi.yaml`

---

## 2) Scope Lock (Product)

- [ ] v1 scope is locked and written (Dashboard, lightweight Client list, Builder, Detail, PDF, `Mark as Sent`, `Mark as Paid`, `Void`, premium send).
- [ ] v1.1 ideas are explicitly deferred (payment links, recurring, reminders, multi-currency profiles if not in v1).
- [ ] Out-of-scope list is approved (no accounting-suite creep).
- [ ] Invoice lifecycle states are final: `Draft`, `Sent`, `Overdue`, `Paid`, `Void`.
- [ ] Premium gating policy is approved: free users keep PDF export and manual sharing.
- [ ] North-star and KPI targets are approved for launch tracking.

---

## 3) UX and Design Handoff

- [ ] Breakpoint behavior is finalized for `xs`, `sm`, `md`, `lg`, `xl`, `2xl`.
- [ ] Wireframes exist for web + tablet + phone across 3 core screens.
- [ ] Builder behavior is defined for desktop split view and mobile stepper flow.
- [ ] Send Invoice surface behavior is defined by device type (drawer/sheet/modal).
- [ ] Empty states, loading states, and error states are designed for each core screen.
- [ ] All status chips map correctly to state meanings and colors.
- [ ] Component states are fully specified (default, hover, focus, disabled, loading, error).
- [ ] Design tokens are frozen for v1 (colors, type, spacing, radius, elevation, motion).
- [ ] Accessibility criteria are included in design acceptance (contrast, focus, screen reader labels, text scaling).

---

## 4) UX Copy Handoff

- [ ] Terminology is consistent everywhere (`client`, `invoice`, `Send Invoice`).
- [ ] Microcopy is finalized for Dashboard, Builder, Detail, send flow, and premium gate.
- [ ] Validation and error messages are clear, specific, and non-dead-end.
- [ ] Success toasts/messages exist for all critical actions.
- [ ] Mobile compact labels are reviewed for smallest supported screens.
- [ ] Localization and dynamic token fallbacks are defined.

---

## 5) Engineering Handoff

- [ ] Frontend architecture supports shared logic across web and mobile layouts.
- [ ] API contract in `SmartInvoice/apicontract.md` is approved and frozen for v1.
- [ ] OpenAPI spec in `SmartInvoice/openapi.yaml` matches the frozen contract.
- [ ] Status transition rules are enforced in code, not only UI.
- [ ] Autosave behavior is implemented with visible save states.
- [ ] Offline and retry handling is defined for draft save and send actions.
- [ ] Send flow uses idempotency to avoid duplicate invoice emails.
- [ ] API contracts are versioned and documented for invoice create/update/send/mark-paid/void.
- [ ] Feature flag exists for premium send gating.
- [ ] Responsive behavior is implemented for all required breakpoint classes.
- [ ] Accessibility baseline is implemented in components.
- [ ] No hardcoded design values in feature components; shared tokens are used.

---

## 6) Analytics and Instrumentation

- [ ] Event list from `SmartInvoice/userflows.md` is implemented.
- [ ] Required properties are attached to events (`platform`, `breakpoint`, status before/after, network state).
- [ ] Dashboard for launch KPIs is created before production release.
- [ ] Upgrade funnel events are verified end-to-end.
- [ ] Failure events are logged for send, save, and mark-paid actions.

---

## 7) QA Test Gate (Multi-Device)

- [ ] Test suite covers phone, tablet, and desktop classes.
- [ ] Core flows pass on each class: create, manage/select client, send, manual share + mark sent, download, mark paid, edit, void.
- [ ] Premium gate path passes for free users and upgraded users.
- [ ] Offline behavior is tested for draft save and delayed sync.
- [ ] Send timeout and retry scenarios are tested.
- [ ] Regression run verifies status transitions and dashboard metric updates.
- [ ] Accessibility checks pass (keyboard-only web, screen reader labels, contrast).
- [ ] Visual QA confirms no clipped or unreadable content on smallest supported widths.

---

## 8) Performance and Reliability Gate

- [ ] Dashboard initial render meets target on mid-tier mobile network.
- [ ] Builder input latency remains responsive under normal load.
- [ ] Draft save acknowledgement meets defined threshold.
- [ ] Send action provides progress and stable retry path.
- [ ] Crash and fatal error monitoring is active for web before web launch.
- [ ] Crash and fatal error monitoring is active for mobile before mobile release.

---

## 9) Release Readiness

- [ ] Web-first release candidate is approved before mobile release scope expands.
- [ ] Open critical bugs: 0
- [ ] Open high-severity bugs: approved exceptions only
- [ ] All docs are in sync with shipped behavior.
- [ ] Rollback plan exists for send-flow failures.
- [ ] Support/ops playbook exists for payment-status and email-delivery complaints.
- [ ] Release decision owner signs off.

---

## 10) Post-Launch 14-Day Review

- [ ] Median time-to-sent-invoice measured and compared to target.
- [ ] Draft-to-sent conversion reviewed by platform/device class.
- [ ] Send failure rate reviewed with top causes.
- [ ] Upgrade conversion at send gate reviewed.
- [ ] Top UX friction points prioritized for next sprint.
- [ ] Scope discipline check completed (no unplanned feature creep in sprint backlog).

---

## 11) Sign-Off Log

- [ ] Product Lead sign-off
- [ ] Design Lead sign-off
- [ ] Engineering Lead sign-off
- [ ] QA Lead sign-off
- [ ] Growth/Analytics sign-off
- [ ] Final go-live approval

Date:

Release version:

Notes:
