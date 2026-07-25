# OpenCodeABsUI/UX

> Enterprise-grade OpenCode ecosystem plugin and hybrid infrastructure manager

**Version:** 1.0.0-EA | **License:** MIT | **Live:** [`pocwu.pages.dev`](https://pocwu.pages.dev)

---

## Overview

OpenCodeABsUI/UX bridges local developer environments with a 24/7 serverless cloud runtime via a decentralized, peer-to-peer data synchronization layer powered by **GunDB**. It provides a SaaS-style Web UI featuring multi-agent company orchestration (`/o/`), isolated sandboxes (`/s/`), multi-device remote management (`/u/`), GitHub-based verification, and a 3D interactive global metrics dashboard — all underpinned by a real-time, offline-first GunDB graph network.

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
| `/C/💬` | **GitHub Discussions ↗** | Internal route alias → `github.com/ABsUPs/OpenCodeWEBsUI/discussions` |
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
- **Header-as-Button:** Click the `💬 Community Hub` header or visit `/C/💬` to open GitHub Discussions
- **Real-time search** by username, org, or project name
- **Sort options:** System Smart Rank, Most Active Members, Top Stars & Forks, Recently Created
- **Tag filters:** Templates, Features, Showcase, Bug Reports
- **GunDB P2P Sync:** Posts and comments sync instantly across the peer-to-peer mesh
- **Create/Edit/Delete posts** with inline Markdown, comments, and category tagging

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
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # App shell with nav + footer
│   │   └── FooterGuard.tsx  # DOM integrity observer
│   ├── pages/               # Route-level page components
│   │   ├── Home.tsx         # 3D globe dashboard
│   │   ├── CommunityHub.tsx # Dynamic scoped community hub
│   │   ├── CommunityHubIndex.tsx  # Hub directory with ranking
│   │   ├── Servers.tsx      # Public server directory
│   │   ├── Users.tsx        # Community user directory
│   │   ├── UserProfile.tsx  # Multi-device admin
│   │   ├── OrgShowcase.tsx  # Company showcase
│   │   ├── Sandbox.tsx      # Project sandbox
│   │   ├── TemplateMarketplace.tsx
│   │   ├── SecurityLanding.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useGunSync.ts    # GunDB P2P sync hook
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # GitHub OAuth session
│   ├── App.tsx              # Root app with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── functions/               # Cloudflare Pages Functions
│   ├── api/
│   │   ├── community/
│   │   │   └── hubs.ts      # Hub directory listing + ranking API
│   │   ├── discussions.ts   # GitHub Discussions proxy
│   │   ├── posts.ts         # Local post CRUD
│   │   │   └── comments.ts  # Post comments
│   │   ├── servers.ts       # Server registry
│   │   ├── users.ts         # User directory
│   │   └── ...
│   ├── auth/                # OAuth callback handlers
│   └── _middleware.ts       # Auth middleware
├── public/
│   ├── _redirects           # SPA fallback + redirect rules
│   └── _headers             # Security headers
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

---

## License

[MIT](https://opensource.org/licenses/MIT)

---

[🗄️⚡💝 ~ ABsUP.ORG](https://github.com/ABsUPs/OpenCodeWEBsUI)
