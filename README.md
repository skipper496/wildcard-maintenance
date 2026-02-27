# Wildcard Maintenance

Maintenance and regatta planning app for your J/105 `Wildcard`.

## Features

- Maintenance log entries with engine hours
- Service interval timeline editor with due/overdue alerts
- Editable categorized to-do lists:
  - Engine
  - Sailing
  - Electronics
  - Hull and Fittings
  - Safety
- Manual library with search/filter and custom links
- Seeded J/105 specs (dimensions, rigging, sail plan) plus custom spec entries
- Regatta planner:
  - Add races
  - Track crew as Confirmed/Tentative/Out
  - Auto-flag maintenance due/past due by race date
- Unified month calendar combining regattas, service due dates, and to-do due dates

## Seeded records included

- Oil and coolant changed at `2222` engine hours (`2026-02-27`)
- Fuel tank sealed and filters changed (`2026-02-26`)

## Multi-device cloud data (enabled)

This app now stores all state in **Upstash Redis (via Vercel integration)** through `/api/state`.
Any edits made in the website GUI are shared across devices.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Vercel (with shared data)

1. Push this folder to a Git repo.
2. Import repo in Vercel.
3. Framework preset: `Next.js`.
4. In Vercel project dashboard, go to `Marketplace` and add an **Upstash Redis** integration.
5. Connect Redis to this project (this auto-injects env vars).
6. Redeploy.

Required env vars are injected by Vercel when Redis is connected:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Source references used for seeded docs/specs

- J/105 primary specs and sail plan: https://jboats.com/j105
- J/105 class docs: https://j105.org
- Yanmar Marine support/manual portals:
  - https://www.yanmar.com/marine/support/
  - https://www.yanmar.com/marine/support/operation_manuals/
  - https://www.yanmar.com/marine/support/dealer_locator/
