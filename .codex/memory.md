# Project Memory

## Repo Shape

- Frontend app lives in `web/`.
- Backend app lives in `server/`.
- Product and implementation notes live in root markdown files like `graphic.md`, `implementationplan.md`, and `wireframespec.md`.

## Frontend Stack

- React
- TypeScript
- Vite
- Global styling is primarily in `web/src/index.css`

## Product Context

- Main app brand used in the interface is `Otilor`.
- Core user flow centers on invoices, clients, dashboard metrics, and send actions.
- Dashboard responsiveness has already been adjusted with mobile-first refinements and smaller mobile component sizing.
- Mobile and tablet should generally use smaller text, tighter spacing, and smaller components than desktop.

## Known Working Notes

- Dashboard page uses dashboard-specific responsive classes in `web/src/pages/DashboardPage.tsx` and `web/src/index.css`.
- Small screens should feel intentionally compact, not like squeezed desktop UI.
- The recent invoices section on smaller screens now behaves like stacked cards instead of a full-width desktop table.

## Verification Notes

- Frontend builds successfully with `npm run build` from `web`.

## Memory Maintenance

- Keep only durable facts here.
- Move completed short-term work out of `tasks.md` once it no longer matters.
