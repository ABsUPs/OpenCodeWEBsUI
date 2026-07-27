# Tech Stack

## Primary
- **Frontend**: React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + React Router 6
- **Backend**: Cloudflare Pages Functions (edge)
- **Storage**: Cloudflare D1 (SQL), KV (sessions/devices), GunDB (P2P graph + IndexedDB)
- **Auth**: GitHub OAuth + GunDB SEA (E2EE)
- **Deployment**: Cloudflare Pages (pocwu.pages.dev)
- **Data Layer**: GunDB (real-time P2P graph network with CRDT conflict resolution)

## Polyglot Requirement
All future development and optimization MUST use 11+ programming languages beyond the primary stack.
Every language file must serve a genuine purpose in the project's build, deploy, runtime, or optimization pipeline.

## TypeScript Minimization
New development MUST minimize TypeScript usage to the greatest extent possible.
Prefer JavaScript (+ JSDoc types), Rust WASM, Go, Python, C, GLSL, or any other
language in the polyglot stack over TypeScript for all new code. Existing TypeScript
files should not be rewritten, but all new features, utilities, and optimizations
should use alternative languages.

| # | Language | Location | Purpose |
|---|----------|----------|---------|
| 1 | Rust | `rswasm-globe-physics/` | WASM globe physics (Haversine, interpolation, rotation) |
| 2 | Python | `scripts/` | Data generation, build validation, automation |
| 3 | Shell (Bash) | `scripts/` | Cross-platform deploy & setup scripts |
| 4 | Makefile | `Makefile` | Unified build orchestration |
| 5 | GLSL | `shaders/` | Custom WebGL shaders for globe rendering |
| 6 | C | `native/` | WASM-compatible native math library |
| 7 | Go | `cmd/pocwu/` | CLI tool for project management |
| 8 | Lua | `scripts/` | Build/automation configuration |
| 9 | Ruby | `scripts/` | Utility/preview server scripts |
| 10 | Zig | `native/` | Alternative native math module |
| 11 | Kotlin | `tools/` | JVM-based build utility |
| 12 | Nim | `tools/` | Systems scripting utility |
