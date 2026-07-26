# OpenCodeABsUI/UX

> Enterprise-grade OpenCode ecosystem plugin and hybrid infrastructure manager

**Version:** 1.0.0-EA | **License:** MIT | **Live:** [`pocwu.pages.dev`](https://pocwu.pages.dev) | **PRD:** [`OpenCodeWEBsPRD/PRD.md`](OpenCodeWEBsPRD/PRD.md)

---

## Overview

OpenCodeABsUI/UX bridges local developer environments with a 24/7 serverless cloud runtime via a decentralized, peer-to-peer data synchronization layer powered by **GunDB**. It provides a SaaS-style Web UI featuring multi-agent company orchestration (`/o/`), isolated sandboxes (`/s/`), multi-device remote management (`/u/`), GitHub-based verification, a **Universal Coding Language Support Engine** for 200+ programming languages, and a 3D interactive global metrics dashboard — all underpinned by a real-time, offline-first GunDB graph network.

---

## All Routes

| Route | Page | Description |
|---|---|---|
| `/` | **Home Dashboard** | Cobe WebGL 3D Interactive Globe, live node metrics, leaderboards |
| `/u/{username}` | **Device Admin** | Active device selector, multi-stream telemetry, offline snapshot fallback |
| `/o/{org}/{company}` | **Org Showcase** | Public showcase with AI workforce metrics, token meters, and projects |
| `/s/{org}/{project}` | **Project Sandbox** | Live sandboxed web server / API preview endpoint |
| `/T/` | **Template Marketplace** | Public repository for multi-agent templates and OpenCode setups |
| `/C/` | **Community Hub Directory** | Smart-ranked hub directory with Global/Project toggles, search, sort, and tag filters |
| `/C/{username}` | **User/Org Hub** | Personal or organization community hub with scoped discussions |
| `/C/{username}/{project}` | **Project Hub** | Project-scoped community hub |
| `/C/💬` | **Community Discussions** | Internal route — renders GitHub Discussions natively via API; no redirect, no iframes |
| `/C/ABsUPs/CommunityHub` | **Root Hub (Fixed #1)** | Canonical root community hub, permanently anchored at position #1 |
| `/S/` | **Servers Directory** | Public server directory with status health checks and registry |
| `/U/` | **Users Directory** | Community user directory with GitHub-verified profiles |
| `/F/` | **Feature Showcase** | Project overview, feature cards, architecture diagram, tech stack |
| `*` | **Fallback** | Security landing for invalid routes or DOM tampering |

---

## Features

### Authentication & Identity
- **GitHub OAuth verification** with automated follow-to-verify human status
- **Org namespace control** — server-side role validation via GitHub API
- **Token lifecycle** — key-based URLs valid for 99 minutes, OAuth sessions persist indefinitely

### Company Session & Showcase (`/o/`)
- Creation wizard with company name, logo, goals, and resource caps
- Public showcase pages with verified badges, workforce metrics, and token throughput gauges
- 33+ multi-agent role tracking with live AI power meters

### Sandbox Isolation & Preview (`/s/`)
- Strict multi-tenant isolation between company sessions
- Auto-backup workflow with preview mode and one-click publish
- Scope escalation guardrails for filesystem access

### Community Hub (`/C/`)
- **Smart-ranked hub directory** with immutable Root Hub (#1) anchored at `/C/ABsUPs/CommunityHub`
- **Dynamic routing:** `/C/{username}` and `/C/{username}/{project}` for scoped discussions
- **Header-as-Button:** Click the `💬 Community Hub` header to natively render GitHub Discussions — no external redirect
- **Real-time search** by username, org, or project name
- **Sort options:** System Smart Rank, Most Active Members, Top Stars & Forks, Recently Created
- **Tag filters:** Templates, Features, Showcase, Bug Reports
- **Automated forking** — first-time users auto-fork the root hub to create their personal space
- **GunDB P2P Sync:** Posts and comments sync instantly across the peer-to-peer mesh
- **Create/Edit/Delete posts** with inline Markdown, comments, and category tagging

### Universal Coding Language Support Engine
- **100% language inclusivity** — write, parse, compile, execute, and debug code in **any** programming language
- **5-tier classification** — Mainstream (TS/JS/Python/Rust), Enterprise Legacy (COBOL/Fortran), Functional (Haskell/Elixir), HDL (Verilog/VHDL), Esoteric (Brainfuck/APL)
- **Tree-sitter WASM parsing** — dynamic grammar loading for 200+ languages without bundle inflation
- **Polyglot AST mapping** — unified JSON-serializable AST nodes across all paradigms
- **Cross-language transpilation** — translate between any languages (e.g., COBOL → Rust)
- **WASM micro-runtime** for lightweight scripts, **Docker sandbox** for heavy/legacy runtimes
- **Resource hardening** — 512MB RAM limit, 30-second execution timeout
- **Full spec:** [`OpenCodeWEBsPRD/universal-engine.md`](OpenCodeWEBsPRD/universal-engine.md)

### Servers Directory (`/S/`)
- Public server directory with live health status (`🟢 Healthy`, `🟡 Degraded`, `🔴 Offline`)
- Server registration with metadata (type, location, capabilities)
- Last-seen tracking and status badges
- API-driven server management with KV persistence

### Users Directory (`/U/`)
- Community user directory with GitHub-verified profiles
- Avatar, bio, location, and follower/following metrics
- User search and sorted listings
- Links to personal community hubs

### Feature Showcase (`/F/`)
- Comprehensive project overview with feature cards and architecture diagram
- Tech stack breakdown and collapsible security notice
- Repository statistics and navigation links

### Multi-Device Management (`/u/`)
- Active device selector with WebSocket-based telemetry streaming
- Offline snapshot fallback via private GitHub forks
- Read-only dashboard from fork when all devices are offline

### Template Marketplace (`/T/`)
- Public repository for sharing multi-agent templates and OpenCode setups

### Hybrid Compute & Cloud Sync
- **Local host** — heavy compute, code generation, refactoring, security checks
- **Serverless cloud** — 24/7 API runtime on Cloudflare Workers
- Multi-account fallback rotation for zero-cost uptime
- Bi-directional database syncing (D1 / KV / GitHub Fork)
- Zero-cost Gemini web automation via browser sessions

### GunDB Decentralized P2P Graph Network
- Real-time, offline-first peer-to-peer data sync across all nodes
- CRDT-based conflict resolution with automatic merge on reconnect
- SEA end-to-end encryption bound to GitHub OAuth identity
- IndexedDB persistence for instant cold-start loading
- GitHub Private Fork snapshots as offline fallback

### OS-Level Background Daemon
- 24/7 persistence via systemd (Linux), launchd (macOS), Task Scheduler/PM2 (Windows), Termux (Android), Docker

### Plugin Manager & Parallel Pipeline
- Dynamic plugin loading/unloading with RAM optimization
- Concurrent dual-stream pipeline: verification + optimization
- Merge to master only when both streams pass validation

### PRD Orchestration System
- **Local-only PRD isolation** — all documents stored in `OpenCodeWEBsPRD/` with `.gitignore` enforcement
- **6-step startup pipeline:** path resolution → directory creation → privacy guardrail → auto-sweep → subject routing → isolated write
- **Subject-based modular files** — master `PRD.md` + indexes for ToDo, Logic, Design, Community, and Security
- **Cross-platform** — Windows, macOS, Linux, Termux

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **Routing** | React Router 6 |
| **3D Globe** | Cobe (WebGL) |
| **P2P Graph** | GunDB (peer-to-peer, CRDT, SEA encryption) |
| **Deployment** | Cloudflare Pages + Functions |
| **Runtime** | Cloudflare Workers (edge) |
| **Storage** | Cloudflare KV, GitHub Private Fork |
| **AST Parsing** | Tree-sitter WASM (200+ grammars) |
| **Sandbox** | WASM micro-runtime + Docker/Podman |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- npm (or yarn/pnpm)

### Installation

```bash
git clone https://github.com/ABsUPs/OpenCodeWEBsUI.git
cd OpenCodeWEBsUI
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Build

```bash
npm run build
```

Output is written to `dist/`.

### Preview Production Build

```bash
npm run preview
```

### Type Check

```bash
npm run check
```

### Lint

```bash
npm run lint
```

---

## Deployment to Cloudflare Pages

1. **Install Wrangler CLI** (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. **Authenticate with Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy via Wrangler**:
   ```bash
   npx wrangler pages deploy dist
   ```

4. **Or connect your GitHub repo** in the [Cloudflare Pages dashboard](https://dash.cloudflare.com/?to=/:account/pages) for automatic deployments:
   - Build command: `npm run build`
   - Build output directory: `dist`

Your site will be live at `https://pocwu.pages.dev`.

> Required Cloudflare KV namespaces: `DEVICES_KV`, `SESSIONS_KV` — bind them in the Pages dashboard or `wrangler.toml`.

---

## Project Structure

```
OpenCodeWEBsUI/
├── OpenCodeWEBsPRD/            # 📁 Strict local PRD storage (gitignored, never synced)
│   ├── PRD.md                  #     Master PRD — single source of truth
│   ├── universal-engine.md     #     Universal Coding Engine full spec & pipeline
│   ├── ToDo.md                 #     Roadmap index → PRD.md §8
│   ├── Logic.md                #     Backend logic index → PRD.md §§3–6
│   ├── Design.md               #     UI/UX design index → PRD.md §5
│   ├── Community_Hub.md        #     Community hub index → PRD.md §4.7
│   └── Security_Integrity.md   #     Security & privacy index → PRD.md §§4.1, 4.2, 7
├── src/
│   ├── main.tsx                # App entry — routing, providers, global layout
│   ├── prd-orchestrator.ts     # 📋 PRD lifecycle: path resolution, .gitignore, auto-sweep,
│   │                           #     subject router, isolated write
│   ├── background-daemon.ts    # Cross-platform OS service installer (systemd/launchd/PM2)
│   ├── footer-integrity.ts     # Mandatory branding wrapper & MutationObserver
│   ├── github-auth-fork.ts     # GitHub OAuth, org owner validation, private fork engine
│   ├── hybrid-deployer.ts      # Serverless deployment with multi-account rotation
│   ├── db-sync.ts              # Bi-directional local-to-cloud database sync manager
│   ├── gun-db-sync.ts          # GunDB P2P graph node — SEA encryption, CRDT sync
│   ├── multi-device-manager.ts # Active node registry & device selector broker
│   ├── company-sandbox.ts      # Org profile wizard, sandbox isolation, preview engine
│   ├── task-parallelizer.ts    # Task decomposition & dual-stream concurrent pipeline
│   ├── universal-engine.ts     # Universal Coding Language Support Engine entry
│   ├── polyglot/               # Universal Engine submodules
│   │   ├── language-detector.ts    # Extension parser, shebang detector, categorizer
│   │   ├── tree-sitter-wasm.ts     # Dynamic WASM AST loader for polyglot languages
│   │   ├── universal-runner.ts     # Unified execution manager (WASM / Docker)
│   │   └── transpiler.ts           # Cross-language translation & legacy converter
│   ├── components/             # Reusable UI components
│   │   ├── Layout.tsx          # App shell with nav + footer
│   │   ├── FooterGuard.tsx     # DOM integrity observer
│   │   ├── GlassCard.tsx       # Reusable glassmorphism card
│   │   └── Globe.tsx           # Cobe WebGL 3D globe wrapper
│   ├── pages/                  # Route-level page components
│   │   ├── Home.tsx            # 3D globe dashboard
│   │   ├── CommunityHub.tsx    # Dynamic scoped community hub
│   │   ├── CommunityHubIndex.tsx    # Hub directory with ranking
│   │   ├── Servers.tsx         # Public server directory
│   │   ├── Users.tsx           # Community user directory
│   │   ├── UserProfile.tsx     # Multi-device admin
│   │   ├── OrgShowcase.tsx     # Company showcase
│   │   ├── Sandbox.tsx         # Project sandbox
│   │   ├── TemplateMarketplace.tsx  # Template grid
│   │   ├── FeatureShow.tsx     # Project overview & architecture
│   │   └── SecurityLanding.tsx # Fallback for tampering
│   ├── hooks/
│   │   ├── useGunSync.ts       # GunDB P2P sync hook
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx     # GitHub OAuth session
│   ├── App.tsx                 # Root app with routing
│   └── index.css               # Global styles
├── functions/                  # Cloudflare Pages Functions
│   ├── api/
│   │   ├── community/
│   │   │   └── hubs.ts         # Hub directory listing + ranking API
│   │   ├── discussions.ts      # GitHub Discussions proxy
│   │   ├── posts.ts            # Local post CRUD
│   │   │   └── comments.ts     # Post comments
│   │   ├── servers.ts          # Server registry
│   │   └── users.ts            # User directory
│   ├── auth/                   # OAuth callback handlers
│   └── _middleware.ts          # Auth middleware
├── cloudflare/
│   ├── cloudflare-worker.js    # Edge worker: /u/, /o/, /s/, /T/, /C/, /F/ routes
│   └── gun-relay-worker.js     # GunDB WebSocket relay — P2P message forwarding
├── public/
│   ├── _redirects              # SPA fallback + redirect rules
│   └── _headers                # Security headers
├── conductor/                  # Conductor methodology tracks
├── dist/                       # Vite build output
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── wrangler.toml
└── package.json
```

---

## Credits & Attribution

- **Core Maintainer:** [@ABsUP](https://github.com/ABsUP)
- **Organization:** [@ABsUPs](https://github.com/ABsUPs)
- **Repository:** [ABsUPs/OpenCodeWEBsUI](https://github.com/ABsUPs/OpenCodeWEBsUI)
- **PRD Documents:** [`OpenCodeWEBsPRD/`](OpenCodeWEBsPRD/) (strictly local, gitignored)

---

## License

[MIT](https://opensource.org/licenses/MIT)

---

[🗄️⚡💝 ~ ABsUP.ORG](https://github.com/ABsUPs/OpenCodeWEBsUI)
