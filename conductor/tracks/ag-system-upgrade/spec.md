# Specification: ag-system-upgrade

## Background

The OpenCodeWEBsAG backend makes GitHub REST API calls from multiple modules (auth, backup,
worker). Calls omit the required `X-GitHub-Api-Version` header (GitHub defaults to the oldest
version and may change behavior). The system also lacks automated credential-leak detection in CI.

## Requirements

### R1 — Version Header Injection

- **R1.1** A shared helper `githubFetch(url, init?)` in `src/github-api.ts` sets
  `X-GitHub-Api-Version: 2022-11-28` on every request, overriding any prior value.
- **R1.2** The helper sets a default `User-Agent: OpenCodeWEBsAG/1.0` only when the caller
  did not provide one.
- **R1.3** All GitHub API (`https://api.github.com`) call sites use `githubFetch`, not bare `fetch`.
- **R1.4** The OAuth token endpoint (`github.com/login/oauth/access_token`) is excluded (not
  `api.github.com`).

### R2 — Secret Leak Prevention (CI)

- **R2.1** AG `agent-core.yml` and UI `deploy.yml` include a `Secret Leak Prevention Scan` step
  before deploy.
- **R2.2** Scan patterns: AWS `AKIA[0-9A-Z]{16}`, PEM `-----BEGIN [A-Z ]*PRIVATE KEY-----`,
  GitHub `ghp_[A-Za-z0-9]{36}` / `github_pat_[A-Za-z0-9_]{22,}`, Slack `xox[baprs]-[A-Za-z0-9-]{10,}`,
  Stripe `sk_live_[0-9a-zA-Z]{16,}`, Google `AIza[0-9A-Za-z_-]{35}`.
- **R2.3** Exclusions: node_modules, dist, .git, coverage, .wrangler, .github, lockfiles,
  minified/map bundles.
- **R2.4** Any match fails the job with `::error::` and exit 1.

### R3 — Zero UI Change (hard constraint)

- **R3.1** No file under `src/pages`, `src/components`, `src/styles` in `OpenCodeWEBsUI` may be
  modified by this track.
- **R3.2** The public site `pocwu.pages.dev/AG` must render identically before/after.

### R4 — Verification

- **R4.1** `npx tsc --noEmit` (worker tsconfig) passes.
- **R4.2** Worker redeployed; live GitHub API traffic carries the version header.
- **R4.3** Both CI pipelines green (secret scan included).

## Non-Goals

- No UI/UX changes of any kind.
- No new user-facing features.
- No change to HMAC/backup/multi-author behavior (already compliant).
