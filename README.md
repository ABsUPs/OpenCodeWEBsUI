# OpenCodeABsUI/UX

> Enterprise-grade OpenCode ecosystem plugin and hybrid infrastructure manager

**Version:** 1.0.0-EA | **License:** MIT

---

## Overview

OpenCodeABsUI/UX bridges local developer environments with a 24/7 serverless cloud runtime. It provides a SaaS-style Web UI featuring multi-agent company orchestration, isolated sandboxes, multi-device remote management, GitHub-based verification, and a 3D interactive global metrics dashboard powered by Cloudflare Workers and Cobe WebGL.

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

### Hybrid Compute & Cloud Sync
- **Local host** — heavy compute, code generation, refactoring, security checks
- **Serverless cloud** — 24/7 API runtime on Cloudflare Workers
- Multi-account fallback rotation for zero-cost uptime
- Bi-directional database syncing (Turso / D1 / SQLite)
- Zero-cost Gemini web automation via browser sessions

### Multi-Device Management (`/u/`)
- Active device selector with WebSocket-based telemetry streaming
- Offline snapshot fallback via private GitHub forks
- Read-only dashboard from fork when all devices are offline

### Template Marketplace (`/T/`)
- Public repository for sharing multi-agent templates and OpenCode setups

### Community Hub (`/C/`)
- Discussion forum powered by GitHub Discussions API

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
| **Deployment** | Cloudflare Pages |
| **Runtime** | Cloudflare Workers (edge) |

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

---

## Project Structure

```
OpenCodeWEBsUI/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route-level page components
│   ├── App.tsx          # Root app with routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
├── wrangler.toml        # Cloudflare Pages config
└── package.json
```

---

## Route Map

| Route | Page | Description |
|---|---|---|
| `/` | Home | Cobe WebGL 3D globe, live metrics, leaderboards |
| `/u/{username}` | Device Admin | Active device selector, multi-stream logs, offline snapshot |
| `/o/{org}/{company}` | Org Showcase | Public showcase with workforce metrics and projects |
| `/s/{org}/{project}` | Sandbox | Live sandboxed web server / API preview |
| `/T/` | Template Marketplace | Multi-agent templates and OpenCode setups |
| `/C/` | Community Hub | GitHub Discussions-powered forum |
| `/F/` | Security Landing | Fallback for security restrictions or DOM tampering |

---

## Credits & Attribution

- **Core Maintainer:** [@ABsUP](https://github.com/ABsUP)
- **Organization:** [@ABsUPs](https://github.com/ABsUPs)

---

## License

[MIT](https://opensource.org/licenses/MIT)

---

🗄️⚡💝~ ABsUP.ORG
