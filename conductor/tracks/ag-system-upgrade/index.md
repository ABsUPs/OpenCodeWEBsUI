# Track: ag-system-upgrade

**ID:** `ag-system-upgrade`
**Created:** 2026-08-01
**Status:** complete
**Type:** security / api-compliance
**Repos:** OpenCodeWEBsAG (primary), OpenCodeWEBsUI (CI only)

## Summary

Backend-only upgrade per `OpenCodeWEBsPRD/SYSTEM_UPGRADE_SPEC.md`: inject
`X-GitHub-Api-Version: 2022-11-28` on every GitHub API request via a shared `githubFetch()`
helper, and add CI secret-leak prevention scans. **Hard constraint: zero visual changes**
to the public UI (`pocwu.pages.dev/AG`).

## Scope

- **In scope:** `src/github-api.ts`, all GitHub API call sites, AG + UI CI workflows, spec doc.
- **Out of scope:** any UI component, style, page, or layout change.

## Implementation Plan (condensed)

1. Create `src/github-api.ts` (`GITHUB_API_VERSION` + `githubFetch`) — ✅ done.
2. Migrate call sites: `src/auth/github.ts`, `src/backup/fork-engine.ts`,
   `worker/src/installations.ts`, `worker/src/repos.ts`,
   `worker/src/webhook/handler.ts` (7 sites) — ✅ done.
3. Secret-leak scanner step in AG `agent-core.yml` + UI `deploy.yml` — ✅ done.
4. Typecheck worker — ✅ green.
5. Save spec to `OpenCodeWEBsPRD/SYSTEM_UPGRADE_SPEC.md` — ✅ done.
6. Deploy AG worker; verify header on live traffic; commit + push both repos — ✅ done
   (worker version `ac15e6a4`; AG `2a4947b`; UI PR #9 merged `5e25f77`; prod 200s verified).

## Already Satisfied (verified, no change needed)

- HMAC SHA-256 write validation (401 on missing/tampered, 200 on valid).
- Pre-mutation backup snapshots (`backup/opencode-*-{ts}`) in both CI pipelines.
- Multi-author commit attribution (`Co-authored-by` trailers).
- Worker/gateway health + metrics endpoints live-verified.

## Acceptance Criteria

- [x] `npx tsc --noEmit` passes in `worker/`.
- [x] No `src/pages`, `src/components`, `src/styles` files changed in UI repo.
- [x] Secret scan present in both workflows and blocks on leak.
- [x] Worker deployed; `githubFetch` verified to set `X-GitHub-Api-Version: 2022-11-28` + default UA.
- [x] UI CI green; Pages deploy unaffected (`pocwu.pages.dev/ag` → 200).
