# Project Structure — OpenCodeABsUI/UX

> **Living document** — updated as the codebase evolves.
> Last updated: 2026-07-27
>
> **Polyglot: 22 language types** — TypeScript · JavaScript · CSS · JSON · HTML · Rust · Python · Go · C · GLSL · Lua · Ruby · Zig · Kotlin · Nim · Shell · SQL · TOML · PowerShell · YAML · Dockerfile · Makefile

```
OpenCodeWEBsUI/
│
├── .gitignore                    # PRD gitignore rules, build artifacts
├── index.html                    # Vite entry HTML
├── package.json                  # Dependencies: React 18, Cobe, GunDB, react-router-dom
├── postcss.config.js             # PostCSS with Tailwind
├── tailwind.config.js            # Tailwind theme: brand palette, glassmorphism, animations
├── tsconfig.json                 # TypeScript strict config (noUnusedLocals, noUnusedParameters)
├── vite.config.ts                # Vite 5 build: chunk splitting (vendor-react, vendor-cobe), minify
├── wrangler.toml                 # Cloudflare Pages config: KV, D1, service bindings
│
├── README.md                     # Repo overview, routes, features, getting started
├── PROJECT_STRUCTURE.md          # This file — actively maintained directory map
├── ToDo.md                       # Task log: phase tracking, PRD feature roadmap
├── Makefile                      # Polyglot build automation (build, deploy, wasm, python, polyglot)
├── schema.sql                    # D1 database schema
│
├── OpenCodeWEBsPRD/              # 📁 Strictly local PRD storage (gitignored, never synced)
│   ├── PRD.md                    # Master PRD — single source of truth (796 lines, 10 sections)
│   ├── universal-engine.md       # Universal Coding Engine full spec & pipeline
│   ├── ToDo.md                   # Roadmap index → PRD.md §8
│   ├── Logic.md                  # Backend logic index → PRD.md §§3–6
│   ├── Design.md                 # UI/UX design index → PRD.md §5
│   ├── Community_Hub.md          # Community hub index → PRD.md §4.7
│   ├── Security_Integrity.md     # Security & privacy index → PRD.md §§4.1, 4.2, 7
│   ├── Nginx_PRD.md              # Nginx gateway spec → PRD.md §4.13
│   ├── Nginx_Logic.md            # Nginx config + route logic
│   ├── Edge_Gateway_PRD.md       # Pingora/Envoy edge spec → PRD.md §4.14
│   ├── Edge_Gateway_Logic.md     # eBPF, token bucket, Rustls logic
│   ├── Unified_3Tier_Gateway_PRD.md  # 3-tier ingress → PRD.md §4.15
│   ├── Unified_3Tier_Gateway_Logic.md
│   ├── Multiplayer_Globe_PRD.md  # COBE + Cloudflare DO globe → PRD.md §4.16
│   ├── Multiplayer_Globe_Logic.md
│   ├── Polyglot_Microservices_PRD.md   # Rust/WASM/Go/C++ architecture → PRD.md §4.17
│   └── Polyglot_Microservices_Logic.md # IPC flow, WASM bridge, polyglot routing
│
│
├── cmd/                          # 📁 Go CLI toolchain
│   └── pocwu/
│       ├── main.go               # CLI: build, deploy, status, wasm, json commands
│       └── go.mod                # Go module definition
│
├── native/                       # 📁 Native C & Zig modules
│   ├── globe_math.h              # C99 header: Haversine, great-circle, rotation
│   ├── globe_math.c              # C99 implementation + native test harness
│   ├── globe.zig                 # Zig implementation of globe math
│   ├── exports.json              # Emscripten function export list
│   └── Makefile                  # Native build: test (gcc), wasm (emcc)
│
├── rswasm-globe-physics/         # 📁 Rust WASM globe physics engine
│   ├── Cargo.toml                # Cargo project (wasm-bindgen, serde)
│   └── src/
│       └── lib.rs                # Rust lib: Haversine, spherical interp, rotation, FFI exports
│
├── scripts/                      # 📁 Cross-language scripts & tooling
│   ├── generate_cities.py        # Python: city data generator & validator
│   ├── requirements.txt          # Python dependencies
│   ├── deploy.sh                 # Bash: build + deploy pipeline
│   ├── setup.sh                  # Bash: dev environment setup
│   ├── pocwu.lua                 # Lua: build configuration & file counting
│   ├── preview.rb                # Ruby: local preview server (WEBrick)
│   └── deploy.ps1                # PowerShell: build + deploy (Windows)
│
├── shaders/                      # 📁 GLSL WebGL shaders
│   ├── globe.vert                # Vertex shader: puff effect, model-view-projection
│   └── globe.frag                # Fragment shader: Fresnel glow, Lambert diffuse, specular
│
├── tools/                        # 📁 JVM & systems scripting tools
│   ├── pocwu.main.kts            # Kotlin script: project validation & file count
│   └── pocwu.nim                 # Nim utility: health checks & stats
│
├── src/                          # 📁 Frontend application source
│   ├── main.tsx                  # App entry — React root, providers
│   ├── App.tsx                   # Root component with React Router routes
│   ├── index.css                 # Global Tailwind + custom styles
│   ├── vite-env.d.ts             # Vite type declarations
│   ├── prd-orchestrator.ts       # PRD lifecycle: path resolution, .gitignore, auto-sweep
│   │
│   ├── components/               # Reusable UI components
│   │   ├── Layout.tsx            # App shell: header nav, main outlet, footer
│   │   ├── Footer.tsx            # Footer with branding + integrity link
│   │   └── MultiplayerGlobe.tsx  # COBE WebGL 3D globe — responsive, live peer markers, arcs
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useGlobeWebSocket.ts  # WebSocket hook → GlobeRelayDO for real-time peer sync
│   │   └── useGunSync.ts         # GunDB P2P graph sync hook
│   │
│   ├── contexts/                 # React context providers
│   │   └── AuthContext.tsx       # GitHub OAuth session context
│   │
│   ├── lib/                      # Utility modules
│   │   └── gun.ts                # GunDB node initialization (SEA, peers, IndexedDB)
│   │
│   └── pages/                    # Route-level page components
│       ├── Home.tsx              # / — 3D globe dashboard, stats, hero
│       ├── TemplateMarketplace.tsx   # /T/ — Template grid with category filters
│       ├── CommunityHub.tsx      # /C/{username}/{project} — Scoped hub discussions
│       ├── CommunityHubIndex.tsx # /C/ — Hub directory with ranking, search, filters
│       ├── Servers.tsx           # /S/ — Server directory with health status
│       ├── Users.tsx             # /U/ — User directory with GitHub profiles
│       ├── UserProfile.tsx       # /u/ — Multi-device admin
│       ├── OrgShowcase.tsx       # /o/ — Company showcase with metrics
│       ├── Sandbox.tsx           # /s/ — Project sandbox preview
│       └── SecurityLanding.tsx   # * — Fallback for tampered DOM / invalid routes
│
├── functions/                    # 📁 Cloudflare Pages Functions (edge API)
│   ├── tsconfig.json             # Functions TypeScript config
│   ├── _middleware.ts            # Global middleware: CSP headers, Permissions-Policy
│   │
│   └── api/                      # API route handlers
│       ├── _shared.ts            # Shared types, helpers, CORS
│       ├── globe-ws.ts           # WebSocket upgrade → GlobeRelayDO (service binding)
│       ├── health.ts             # Health check endpoint
│       ├── discussions.ts        # GitHub Discussions proxy
│       ├── posts.ts              # Post CRUD
│       ├── users.ts              # User directory API
│       │
│       ├── auth/                 # GitHub OAuth flow
│       │   └── github/
│       │       ├── login.ts      #   Initiate OAuth
│       │       ├── callback.ts   #   OAuth callback handler
│       │       ├── session.ts    #   Session check
│       │       ├── logout.ts     #   Destroy session
│       │       └── index.ts      #   Route index
│       │
│       ├── community/
│       │   └── hubs.ts           # Hub directory listing + ranking API
│       │
│       ├── devices/
│       │   └── [id].ts           # Device telemetry by ID
│       │
│       ├── orgs/
│       │   └── [name].ts         # Org showcase data
│       │
│       ├── posts/
│       │   ├── [id].ts           # Individual post operations
│       │   └── comments.ts       # Post comments
│       │
│       ├── projects/
│       │   └── [id].ts           # Project data
│       │
│       ├── public/
│       │   └── servers.ts        # Public server registry
│       │
│       └── sandbox/
│           └── [id].ts           # Sandbox execution
│
├── do-worker/                    # 📁 Standalone Worker: GlobeRelayDO (deployed separately)
│   ├── package.json              # Dependencies: wrangler, @cloudflare/workers-types
│   ├── wrangler.toml             # Worker config: DO binding + migration
│   ├── tsconfig.json             # Worker TypeScript config
│   └── src/
│       └── index.ts              # GlobeRelayDO class + Worker entry point
│                                 #   - Single "global" DO instance
│                                 #   - WebSocket upgrade handler
│                                 #   - add-marker / remove-marker broadcast
│                                 #   - Geo from cf-* headers / X-Geo-* headers
│
├── public/                       # 📁 Static assets
│   ├── favicon.svg               # Site favicon
│   ├── _headers                  # Security headers (CSP, HSTS, etc.)
│   └── _redirects                # SPA fallback + redirect rules
│
├── conductor/                    # 📁 Conductor methodology tracks
│   ├── index.md                  # Project context index
│   ├── product.md                # Product definition
│   ├── tech-stack.md             # Technology stack
│   ├── workflow.md               # Development workflow
│   ├── tracks.md                 # Tracks registry
│   └── tracks/                   # Implementation tracks
│       └── gun-integration/      # GunDB integration track
│           ├── index.md
│           ├── spec.md
│           ├── plan.md
│           └── metadata.json
│
├── dist/                         # 📁 Vite production build output (gitignored)
│
└── .wrangler/                    # 📁 Wrangler state (gitignored)
```

---

## Key Architectural Relationships

```
Browser ──► Cloudflare Pages ──► Pages Functions ──► Service Binding ──► GlobeRelayDO (do-worker/)
                │                                                            │
                │  wss://pocwu.pages.dev/api/globe-ws                        │
                │  └─► _middleware.ts (CSP)                                  │
                │      └─► globe-ws.ts (WS upgrade)                          │
                │          └─► env.GLOBE_DO.fetch() ─────────────────────────┘
                │                                                             └─► WebSocket peer broadcast
                │
                ├── Static assets (public/) ──► CDN edge
                ├── Vite SPA (dist/) ──► Cloudflare Workers
                │
                └── API endpoints (functions/api/)
                    ├── auth/github/*     ──► GitHub OAuth
                    ├── discussions.ts    ──► GitHub API proxy
                    ├── community/hubs.ts ──► KV-backed hub registry
                    ├── devices/[id].ts   ──► Device telemetry
                    └── ...other CRUD APIs
```

---

## How to Update This File

After structural changes (new packages, route changes, architecture changes):

```bash
# 1. Commit the structural changes
git add <new-files>
git commit -m "description of structural change"

# 2. Update this file to match reality
#    - Add/remove directories as they exist on disk
#    - Update component names, route descriptions
#    - Keep architectural relationship diagrams current

# 3. Commit the structure update
git add PROJECT_STRUCTURE.md
git commit -m "docs: update PROJECT_STRUCTURE.md after <change>"
```
