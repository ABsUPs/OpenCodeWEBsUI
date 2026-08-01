# Implementation Plan: ag-system-upgrade

## Step 1 — Create shared helper (DONE)
- `src/github-api.ts`: `GITHUB_API_VERSION = "2022-11-28"`, `githubFetch()` sets header (always
  override) + default UA. ✓

## Step 2 — Migrate call sites (DONE)
- `src/auth/github.ts`: import + token-exchange fetch → `githubFetch`. ✓
- `src/backup/fork-engine.ts`: import + 4 fetches (repo info, fork, ref, branch) → `githubFetch`. ✓
- `worker/src/installations.ts`: import + 1 fetch → `githubFetch`. ✓
- `worker/src/repos.ts`: import + 1 fetch → `githubFetch`. ✓
- `worker/src/webhook/handler.ts`: import + 7 fetches → `githubFetch` (BOM stripped after PS write). ✓
- Skipped: `src/auth/token-refresh.ts` (OAuth endpoint, R1.4). ✓

## Step 3 — Secret scan CI (DONE)
- AG `agent-core.yml`: new Step 8 scanner (grep patterns, exclusions, fail on match);
  renumbered deploy→9, commit→10. ✓
- UI `deploy.yml`: Step 7b scanner. ✓

## Step 4 — Verify (DONE)
- `worker/` typecheck green. ✓
- Spec saved to `OpenCodeWEBsPRD/SYSTEM_UPGRADE_SPEC.md`. ✓
- Conductor track registered (`tracks/ag-system-upgrade`). ✓

## Step 5 — Deploy & ship (PENDING)
- [ ] `npx wrangler deploy` (AG worker).
- [ ] Commit AG: `src/github-api.ts`, migrated modules, workflow, spec → push to main.
- [ ] Commit UI: workflow + conductor track → PR → merge (protect/relax procedure).
- [ ] Verify live header presence; confirm no UI change.

## Risk & Rollback
- Worker rollback: `wrangler rollback` to previous version (`cb590215`).
- UI rollback: merge revert / Pages redeploy previous commit.
