# Otilor

Otilor is a web-first invoicing app for freelancers, consultants, and small service teams.

Its job is simple: help a user create a professional invoice quickly, send it with less friction, and stay clear on what has been paid, what is overdue, and what still needs follow-up.

## What Otilor Does

Otilor is built around the core billing flow:

1. Create an invoice fast.
2. Review it with a live preview.
3. Send or share it.
4. Track its status.
5. Mark it as paid when money comes in.

In practice, the app helps users:

- Create polished invoices with client details, dates, line items, tax, discount, and notes.
- Preview invoices before sending so mistakes are easier to catch.
- Track invoice lifecycle states such as `Draft`, `Sent`, `Overdue`, `Paid`, and `Void`.
- Manage client records alongside invoice creation.
- Download invoices as PDF.
- View dashboard summaries for unpaid amounts, overdue invoices, and recent activity.
- Send invoices by email through the product flow when premium functionality is enabled.

## Who It Is For

Otilor is aimed at:

- Freelancers
- Consultants
- Micro-agencies
- Small service businesses

It is not trying to be a full accounting suite. The focus is speed, clarity, and clean billing workflows.

## Product Shape

The product is designed around three core screens:

- `Dashboard`: understand business status quickly and jump into the next action.
- `Invoice Builder`: create and edit invoices without losing context.
- `Invoice Detail`: review one invoice, download it, send it, or update its status.

Supporting surfaces such as send panels, upgrade prompts, and client management are kept lightweight so the main workflow stays focused.

## Repository Structure

- [`web`](c:/Users/hp/Desktop/sideProjects/SmartInvoice/web): React + TypeScript + Vite frontend
- [`server`](c:/Users/hp/Desktop/sideProjects/SmartInvoice/server): Express + TypeScript backend scaffold
- [`productdesign.md`](c:/Users/hp/Desktop/sideProjects/SmartInvoice/productdesign.md): product definition and design direction
- [`designsystem.md`](c:/Users/hp/Desktop/sideProjects/SmartInvoice/designsystem.md): shared visual system and UI rules
- [`userflows.md`](c:/Users/hp/Desktop/sideProjects/SmartInvoice/userflows.md): primary user journeys
- [`openapi.yaml`](c:/Users/hp/Desktop/sideProjects/SmartInvoice/openapi.yaml): API specification draft

## Running It Locally

Install and run the backend:

```powershell
cd server
npm install
npm run dev
```

The API starts on `http://localhost:4000`.

Install and run the frontend:

```powershell
cd web
npm install
npm run dev
```

Then open the Vite development URL shown in the terminal, usually `http://localhost:5173`.

## Current Notes

- The frontend is the main product surface today.
- The backend is currently a lightweight Express scaffold with basic health endpoints and room for fuller invoice APIs.
- The web app includes local fallback behavior so the UI can still be explored even when the API is unavailable.

## Goal

Otilor exists to reduce billing friction.

Instead of making users jump between documents, emails, spreadsheets, and reminders, it keeps invoice creation, review, sending, and tracking in one focused workflow.
# otilor
