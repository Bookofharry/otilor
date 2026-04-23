# SmartInvoice Design System (Web + Mobile)

## 1) Purpose
This document defines the visual and interaction system for SmartInvoice across phone, tablet, laptop, and desktop.

Goals:
- Keep UI consistent across platforms.
- Reduce design and engineering guesswork.
- Protect speed and clarity in core billing flows.

---

## 2) Product UI Principles

- Clarity over decoration.
- Speed over feature noise.
- One primary action per screen area.
- Strong status visibility (`Draft`, `Sent`, `Overdue`, `Paid`, `Void`).
- Consistent interaction logic across all devices.

---

## 3) Foundations

## 3.1 Color Tokens

Use semantic tokens, not hardcoded hex values in components.

Brand and core:
- `--color-brand-500: #0B6BFF`
- `--color-brand-600: #075CE0`
- `--color-brand-700: #064CB7`

Neutrals:
- `--color-neutral-0: #FFFFFF`
- `--color-neutral-50: #F8FAFC`
- `--color-neutral-100: #F1F5F9`
- `--color-neutral-200: #E2E8F0`
- `--color-neutral-400: #94A3B8`
- `--color-neutral-600: #475569`
- `--color-neutral-800: #1E293B`
- `--color-neutral-900: #0F172A`

Status:
- `--color-success-500: #0E9F6E`
- `--color-warning-500: #D97706`
- `--color-danger-500: #DC2626`
- `--color-info-500: #0284C7`

Surfaces:
- `--color-bg: var(--color-neutral-50)`
- `--color-surface: var(--color-neutral-0)`
- `--color-surface-muted: var(--color-neutral-100)`
- `--color-border: var(--color-neutral-200)`

Text:
- `--color-text-primary: var(--color-neutral-900)`
- `--color-text-secondary: var(--color-neutral-600)`
- `--color-text-disabled: var(--color-neutral-400)`
- `--color-text-inverse: var(--color-neutral-0)`

Interactive:
- `--color-focus-ring: #2563EB`
- `--color-link: #1D4ED8`
- `--color-link-hover: #1E40AF`

## 3.2 Typography

Primary typeface:
- `Manrope` (fallback: `Segoe UI`, `sans-serif`)

Scale:
- `text-xs: 12/16`
- `text-sm: 14/20`
- `text-md: 16/24`
- `text-lg: 18/26`
- `text-xl: 24/32`
- `text-2xl: 32/40`

Weights:
- Regular: 400
- Medium: 500
- SemiBold: 600
- Bold: 700

Rules:
- Use `text-md` for default body.
- Use `text-sm` for helper/metadata.
- KPI values use `text-xl` or `text-2xl` based on viewport.

## 3.3 Spacing

Base unit: `8px`

Token scale:
- `space-1: 4`
- `space-2: 8`
- `space-3: 12`
- `space-4: 16`
- `space-5: 20`
- `space-6: 24`
- `space-8: 32`
- `space-10: 40`
- `space-12: 48`

Rules:
- Avoid custom spacing values unless layout breakage requires it.
- Component internals should primarily use `8/12/16`.

## 3.4 Radius and Shadow

Radius:
- `radius-sm: 6`
- `radius-md: 10`
- `radius-lg: 14`
- `radius-pill: 999`

Elevation:
- `shadow-1: 0 1px 2px rgba(15,23,42,0.08)`
- `shadow-2: 0 6px 16px rgba(15,23,42,0.10)`
- `shadow-3: 0 10px 28px rgba(15,23,42,0.14)`

Rules:
- Cards use `shadow-1`.
- Overlays/drawers/modals use `shadow-2` or `shadow-3`.

## 3.5 Motion

Durations:
- Fast: `120ms`
- Standard: `180ms`
- Emphasized: `240ms`

Easing:
- Standard: `cubic-bezier(0.2, 0, 0, 1)`

Patterns:
- Drawer slide-in: 180ms
- Toast enter/exit: 120ms
- List stagger: optional, max 60ms between items

Accessibility:
- Respect OS reduced motion settings.

---

## 4) Layout System

## 4.1 Breakpoints

- `xs: 320-374`
- `sm: 375-767`
- `md: 768-1023`
- `lg: 1024-1279`
- `xl: 1280-1439`
- `2xl: 1440+`

## 4.2 Grid

- `xs/sm`: 4 columns, 16px side padding
- `md`: 8 columns, 24px side padding
- `lg+`: 12 columns, 24-32px side padding

## 4.3 Safe Areas

- Mobile fixed bars must include safe-area insets.
- Bottom CTA bars must not overlap gesture/home areas.

---

## 5) Component Specification

## 5.1 Button

Variants:
- Primary
- Secondary
- Ghost
- Destructive

Sizes:
- `sm` (32h), `md` (40h), `lg` (48h)

States:
- Default
- Hover (web)
- Focus-visible
- Pressed
- Disabled
- Loading

Rules:
- Minimum touch target: `44x44`.
- One primary button per container region.

## 5.2 Input

Types:
- Text
- Email
- Number
- Date
- Textarea

States:
- Default
- Focus
- Filled
- Error
- Disabled

Anatomy:
- Label
- Field
- Optional helper text
- Error text slot

## 5.3 Select and Date Picker

Rules:
- Mobile uses native-like picker/bottom sheet where appropriate.
- Date validation happens inline and on submit.

## 5.4 Status Chip

Mappings:
- Draft -> neutral
- Sent -> info
- Overdue -> warning
- Paid -> success
- Void -> danger

Requirements:
- Text always visible; never color-only meaning.

## 5.5 Card

Use cases:
- KPI cards
- Activity list cards (mobile)
- Quick action cards

Defaults:
- Surface background
- Border `--color-border`
- Radius `radius-md`

## 5.6 Table Row (Desktop)

Columns minimum:
- Invoice ID
- Client
- Status
- Amount
- Due date
- Actions

States:
- Default
- Hover
- Selected
- Loading skeleton

## 5.7 List Item (Mobile)

Content:
- Primary line: client or invoice id
- Secondary line: amount + due date
- Trailing status chip

Actions:
- Swipe optional
- Overflow menu mandatory alternative

## 5.8 Drawer / Sheet / Modal

Use:
- Drawer: secondary in-context actions on wide screens
- Bottom sheet: mobile contextual tasks
- Modal: confirmations and upgrades

Interaction:
- Esc/backdrop closes non-destructive surfaces
- Destructive confirms require explicit action buttons

## 5.9 Toast

Placement:
- Web: top-right or bottom-right
- Mobile: above bottom nav/CTA bar

Types:
- Success
- Warning
- Error
- Info

Duration:
- 3-5 seconds (persistent for critical errors)

## 5.10 Empty State

Structure:
- Short headline
- One-line body
- One primary action

No illustrations required in v1.

## 5.11 Loading Skeleton

Rules:
- Show skeleton if loading > 400ms.
- Match final layout shape to reduce perceived jank.

---

## 6) Core Screen Component Maps

## 6.1 Dashboard

Must include:
- Primary CTA `Create Invoice`
- KPI row (max 3 cards)
- Recent activity/table
- Needs attention panel

Do not include:
- More than 2 chart types
- Secondary actions competing with primary CTA

## 6.2 Invoice Builder

Must include:
- Client block
- Metadata block
- Line items editor
- Tax/discount block
- Notes block
- Live preview
- Save status indicator

Critical behavior:
- Autosave visible state
- Inline validation
- Currency consistency lock

## 6.3 Invoice Detail

Must include:
- Invoice identity + status + amount + due date
- Invoice preview
- Timeline
- Action group: Download, Edit, Mark Sent, Mark Paid, Send Invoice

State logic:
- Paid editing requires explicit confirmation/versioning.

---

## 7) Interaction Patterns by Device

## Desktop/Laptop

- Hover affordances enabled.
- Keyboard shortcuts allowed for power tasks.
- Multi-column layouts preferred.

## Tablet

- Touch-first spacing and hit targets.
- Collapsible side areas and responsive action menus.

## Mobile

- Step-based builder flow.
- Sticky/floating primary action.
- Compact labels in constrained areas.
- Bottom sheet for send and quick actions.

---

## 8) Accessibility Requirements

- WCAG 2.1 AA contrast minimum.
- Focus-visible ring on all interactive controls.
- Keyboard navigable web experience.
- Screen reader labels on icon-only controls.
- Support text scaling to 200%.

---

## 9) Design-to-Code Contract

Token naming:
- Keep tokens in semantic form (`--color-success-500`), not page-specific names.

Component naming:
- `Button/Primary/MD`
- `Input/Default/Error`
- `Chip/Status/Paid`
- `Drawer/SendInvoice`

Implementation order:
1. Tokens
2. Core primitives (button/input/chip/card)
3. Overlay components (drawer/modal/toast)
4. Screen assemblies

---

## 10) Quality Gates

Design QA:
- Visual parity across breakpoints
- Status colors and labels correct
- No clipped text at smallest supported widths

UX QA:
- Critical tasks possible in <= expected steps on each device class
- Error recovery paths always visible

Engineering QA:
- No hardcoded colors in feature components
- Components consume shared tokens
- Accessibility checks pass before release

---

## 11) Starter Token Snippet (CSS)

```css
:root {
  --color-brand-500: #0B6BFF;
  --color-bg: #F8FAFC;
  --color-surface: #FFFFFF;
  --color-border: #E2E8F0;
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-success-500: #0E9F6E;
  --color-warning-500: #D97706;
  --color-danger-500: #DC2626;

  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}
```

This spec is the baseline. Any intentional deviation should be documented and approved before implementation.
