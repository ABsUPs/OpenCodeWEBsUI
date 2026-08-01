# Track: AG Metrics & Contributor Leaderboard

**Status:** In Progress
**Sources:** `OpenCodeWEBsPRD/METRICS_LEADERBOARD_PRD.md`, `OpenCodeWEBsPRD/ADVANCED_FEATURES_SPEC.md` (Feature #7)

## Spec

### Problem
The AG dashboard (`pocwu.pages.dev/ag`) shows installation/worker status but no operational analytics. There is no visibility into backups created, bugs fixed, or contributor activity — and no persisted, queryable metrics store.

### Goals
1. Persist live AG metrics in Cloudflare KV (`AG_METRICS` namespace): `total_backups`, `bugs_fixed`, `total_commits`, plus a contributor leaderboard.
2. Expose a **public, edge-cached** read endpoint: `GET /api/metrics/live` (via gateway `opencodeweb.xup.workers.dev`, CORS for `https://pocwu.pages.dev`).
3. Expose an **HMAC-protected** write endpoint: `POST /api/metrics/update` (GitHub-style `X-Hub-Signature-256`, secret-verified) for GitHub Actions / agents.
4. Record metrics **automatically** from real webhook processing: push → commit, backup created → backup, auto-fix PR → bug_fix.
5. Render a "Live Analytics & Leaderboard" section on the `/ag` SPA dashboard (3 metric cards + contributor table), refreshing on the existing 30s poll.

### Non-Goals
- GitHub Actions workflows that emit metric payloads (future track — the endpoints are ready for them).
- Time-series histograms, per-repo breakdowns, or atomic KV guarantees (read-modify-write is acceptable at this scale).
- Public write access without HMAC.

### Data Model (KV `AG_METRICS`, key `dashboard_data`)
```json
{
  "system_stats": {
    "total_backups": 0,
    "bugs_fixed": 0,
    "total_commits": 0,
    "last_updated": "ISO-8601"
  },
  "contributors": [
    {
      "username": "ABsUP",
      "role": "Core Author / Co-Author",
      "avatar": "https://github.com/ABsUP.png",
      "commits_count": 0,
      "last_active": "ISO-8601"
    }
  ]
}
```

### API Contracts

**`GET /api/metrics/live`** (public — no credentials)
- 200 → `{ system_stats, contributors }` (empty defaults if unset)
- Headers: `Access-Control-Allow-Origin: https://pocwu.pages.dev`, `Cache-Control: public, max-age=60`

**`POST /api/metrics/update`** (HMAC-authenticated)
- Header `X-Hub-Signature-256: sha256=<hex>` over raw body, secret = `METRICS_WEBHOOK_SECRET` (falls back to `WEBHOOK_SECRET`)
- Body: `{ "event": "backup" | "bug_fix" | "commit", "actor": "<github login>" }`
- 200 → `{ success: true, totals }`; 401 on bad/missing signature; 400 on malformed body
- Increments: `backup` → `total_backups`, `bug_fix` → `bugs_fixed`, always `total_commits` +1; upserts contributor by `actor` (`commits_count` +1, `last_active` = now; new contributor role `"Co-Author / Contributor"`, avatar `https://github.com/<actor>.png`).

### Integration Points
- **AG worker** (`worker/src/index.ts`): `/api/metrics/live` + `/api/metrics/update` whitelisted BEFORE the `INTERNAL_GATEWAY_TOKEN` guard (live = public read; update = self-authenticating HMAC).
- **Webhook handler** (`worker/src/webhook/handler.ts`): record real events inside existing `ctx.waitUntil` pipeline (commit on push, backup on successful backup, bug_fix when a fix PR is created).
- **Gateway** (`gateway/index.ts`): allow public GET `/api/metrics/live`; allow POST `/api/metrics/update` with valid HMAC (reuses `WEBHOOK_SECRET`); passthrough `/api/metrics/*` to AG worker without path stripping.
- **Pages function** (`functions/api/ag/metrics.ts`): same-origin proxy for the SPA via `AG_WORKER` service binding.
- **Frontend** (`src/pages/AGDashboard.tsx`): new analytics section fed by `/api/ag/metrics`.

### Acceptance Criteria
- [ ] `GET https://opencodeweb.xup.workers.dev/api/metrics/live` returns 200 JSON **without** credentials
- [ ] `POST https://opencodeweb.xup.workers.dev/api/metrics/update` with valid HMAC increments counters
- [ ] Same POST with invalid/missing HMAC returns 401
- [ ] `/api/ag/metrics` (Pages) returns the same payload same-origin
- [ ] `/ag` dashboard renders 3 metric cards + leaderboard table; updates on 30s poll
- [ ] Webhook push event increments `total_commits` (observable via live endpoint)
