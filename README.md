# Wildcard Maintenance

Maintenance and regatta planning app for your J/105 `Wildcard`.

## Features

- Maintenance log entries with engine hours
- Service interval timeline with due/overdue alerts
- Editable categorized to-do lists:
  - Engine
  - Sailing
  - Electronics
  - Hull and Fittings
  - Safety
- Manual library with in-app viewer (preloaded YGM20F owner/service manuals)
- J/105 specs with embedded info PDF and tech-spec seeded values
- Boat weight log
- Regatta planner + calendar in one tab:
  - Add races
  - Add regatta website links
  - Mark registration status
  - Track crew as Confirmed/Tentative/Out
  - Auto-flag maintenance due/past due by race date
- Unified month calendar combining regattas, service due dates, and to-do due dates
- Racing-first dashboard:
  - Upcoming regattas in next 3 months
  - Crew readiness (6 sailors including owner)
  - Race-critical maintenance due in 1 month / before race
  - 7-day weather snapshot for Pier 39 area (sunrise/sunset, temp, tides, wind)
  - Method/sources details page at `/sources`
- Password-protected editing (`496`) via top-right login
  - Exception: adding yourself as crew remains available without login

## Seeded records included

- Oil and coolant changed at `2222` engine hours (`2026-02-27`)
- Fuel tank sealed and filters changed (`2026-02-26`)

## Multi-device cloud data (enabled)

This app stores shared state in **Upstash Redis (via Vercel integration)** through `/api/state`.
Any edits made in the website GUI are shared across devices.

If Redis is not configured, the app falls back to local browser cache and remains usable.

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
