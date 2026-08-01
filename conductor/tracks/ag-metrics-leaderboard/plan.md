# Plan: AG Metrics & Contributor Leaderboard

## Steps

### 1. Infrastructure — KV namespace
- `npx wrangler kv namespace create AG_METRICS` (from `worker/`)
- Add `[[kv_namespaces]] binding = "AG_METRICS"` to `worker/wrangler.toml`
- Add `AG_METRICS?: KVNamespace` + `METRICS_WEBHOOK_SECRET?: string` to `worker/src/_shared.ts` Env

### 2. Worker — `src/metrics.ts`
- `verifyGitHubSignature(payload, signature, secret)` — Web Crypto HMAC-SHA256, `sha256=` prefix handling
- `MetricsData` type + `emptyMetrics()` default
- `handleGetMetrics(env)` — GET `/api/metrics/live`: KV read, CORS `https://pocwu.pages.dev`, `Cache-Control: public, max-age=60`
- `handleUpdateMetrics(env, request)` — POST `/api/metrics/update`: read raw body, verify `X-Hub-Signature-256` (secret `METRICS_WEBHOOK_SECRET ?? WEBHOOK_SECRET`), parse `{event, actor}`, increment + upsert contributor, KV put, return totals
- `recordMetricsEvent(env, event, actor)` — shared fire-and-forget helper (used by webhook handler); no-op if `AG_METRICS` unbound

### 3. Worker — `src/index.ts` routing
- Whitelist before gateway guard:
  - `GET /api/metrics/live` → `handleGetMetrics(env)`
  - `POST /api/metrics/update` → `handleUpdateMetrics(env, request)`

### 4. Worker — webhook recording (`src/webhook/handler.ts`)
- Push: `recordMetricsEvent(env, "commit", sender)` (always, inside waitUntil)
- After successful `createBackup`: `recordMetricsEvent(env, "backup", sender)`
- After fix PR created: `recordMetricsEvent(env, "bug_fix", sender)`
- All awaited inside the existing async IIFE (KV puts are fast; failures logged, never fatal)

### 5. Gateway — `gateway/index.ts`
- `authenticate()`: allow when `path === "/api/metrics/live" && method === "GET"` (public); allow `path === "/api/metrics/update" && method === "POST"` when `isWebhookHmacValid(request, env)` (reuses WEBHOOK_SECRET)
- Route: `if (path.startsWith("/api/metrics/"))` → `proxyToWorker(request, env, env.AG_WORKER, url, "")` (no prefix strip — worker uses full `/api/metrics/*` paths)

### 6. Deploy worker + gateway
- `npx wrangler deploy` in `worker/` and `gateway/`
- Verify: live endpoint 200 unauthenticated; update endpoint 401 without HMAC

### 7. Pages proxy — `functions/api/ag/metrics.ts`
- GET only: proxy `env.AG_WORKER.fetch("https://worker/api/metrics/live")` → same payload
- Follows existing `dashboard.ts` pattern (uses `functions/api/ag/_shared.ts`)

### 8. Frontend — `src/pages/AGDashboard.tsx`
- Fetch `/api/ag/metrics` alongside dashboard data (same load cycle, 30s poll)
- New section "Live Analytics & Leaderboard":
  - 3 metric cards: Pre-Mutation Backups, Bug Fixes, Total Commits (mono numbers, colored)
  - Leaderboard: rank, avatar (fallback on error), username, role, commits count, last active
  - Empty state ("No activity yet") + graceful failure (hide section on error)

### 9. Build + deploy UI
- `npm run build` + `npx wrangler pages deploy dist --branch=main --project-name=pocwu`

### 10. Seed + E2E verification
- Seed via signed POSTs (Node script computing HMAC with WEBHOOK_SECRET): ABsUP 120 commits, OpenCodeWEB 75, plus backup/bug_fix counters (PRD example values)
- Verify: `curl` gateway live + update (valid/invalid HMAC), Pages proxy, browser `/ag` renders analytics
- Regression: `/S`, `/U` still fine; footer guard no redirects

## Test Strategy
- E2E via live curl (HMAC positive/negative)
- Browser verification of dashboard section + poll refresh
- No unit test framework exists in worker; keep logic small and pure where possible
