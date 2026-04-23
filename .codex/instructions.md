# Project Instructions

## Product

- Build and refine `SmartInvoice` / `Otilor` as a fast invoicing app.
- Prioritize a clean UX for dashboard, builder, detail, and send flows.
- Mobile and tablet responsiveness are required, not optional.
- Treat mobile and tablet as intentionally smaller views than desktop, with smaller text, tighter spacing, and more compact components where appropriate.

## Engineering Rules

- Preserve the existing React + TypeScript + Vite structure.
- Prefer small, targeted changes over broad rewrites.
- Keep styles consistent with the current design tokens in `web/src/index.css`.
- When fixing responsive issues, scale components down for mobile instead of only stacking desktop layouts.
- Do not keep desktop-sized typography or component density on mobile/tablet unless there is a strong usability reason.
- Avoid breaking the invoice flow: `Dashboard -> Builder -> Detail -> Send/Mark Sent -> Mark Paid`.

## Working Preferences

- Validate frontend changes with `npm run build` inside `web` when practical.
- Keep copy concise and product-focused.
- Treat dashboard usability on small screens as a standing quality bar.
- Do not overwrite user-authored content or repo notes unless explicitly requested.

## Update Policy

- Add new permanent project rules here.
- Put temporary tasks in `tasks.md`.
- Put lasting context and decisions in `memory.md`.
