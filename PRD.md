



```markdown

\# Product Requirement Document (PRD)



\## Product Name: OpenCodeABsUI/UX

\*\*Version:\*\* 1.0.0-EA  

\*\*Author / Core Maintainer:\*\* \[@ABsUP](https://github.com/ABsUP)  

\*\*Organization:\*\* \[@ABsUPs](https://github.com/ABsUPs)  

\*\*Official Repository:\*\* \[ABsUPs/OpenCodeWEBsUI](https://github.com/ABsUPs/OpenCodeWEBsUI)  



\---



\## 1. Executive Summary \& Vision



\*\*OpenCodeABsUI/UX\*\* is an enterprise-grade, public OpenCode ecosystem plugin and hybrid infrastructure manager. It bridges local developer environments (PC, Mac, Linux, Mobile Termux, Docker, VPS) with a 24/7 serverless cloud runtime via a decentralized, peer-to-peer data synchronization layer powered by GunDB.



The system provides a SaaS-style Web UI featuring multi-agent company orchestration (`/o/`), isolated sandboxes (`/s/`), multi-device remote management (`/u/`), GitHub-based verification, and a 3D interactive global metrics dashboard powered by Cloudflare Workers and Cobe WebGL — all underpinned by a real-time, offline-first GunDB graph network that syncs state across every local node and the cloud without requiring a central database server.



\---



\## 2. Core Architecture \& Ecosystem Flow



```text

💻 Local Active Nodes            📡 GunDB P2P Graph Network           ☁️ Cloudflare / GitHub
 (PC / Phone / Docker)           (Peer-to-Peer Data Syncing)           (Serverless & Storage)
┌───────────────────────┐         ┌───────────────────────────┐     ┌───────────────────────┐
│ • Heavy Processing    │ ◄─────► │ Real-Time Bi-Directional │ ◄─► │ • 24/7 API Gateway    │
│ • Local GunDB Node    │  WebRTC │ DB Syncing Across Nodes  │ WS  │ • Private Fork Sync   │
│ • OS Daemon           │         │ • Conflict-Free CRDT     │     │ • Cloudflare Workers  │
│ • Offline-First Cache │         │ • Offline Queue & Replay │     │ • D1 / KV Storage     │
└───────────────────────┘         └───────────────────────────┘     └───────────────────────┘
                                         │
                                         │ SEA (Security, Auth)
                                         v
                               🔐 Encrypted P2P Mesh
                         (E2EE via GunDB SEA Layer)

                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    v                    v                    v
          ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
          │  pocwu.pages.dev │ │  /u/{username}   │ │  /o/ & /s/       │
          │  (Home / Globe)  │ │  Multi-Device    │ │  Org / Sandbox   │
          │  Live Metrics    │ │  Telemetry       │ │  Showcase        │
          └──────────────────┘ └──────────────────┘ └──────────────────┘
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         │
                                         v
                            ┌─────────────────────────┐
                            │   GitHub Private Fork   │
                            │   (state-backup branch) │
                            │   Offline Fallback      │
                            └─────────────────────────┘

```



\---



\## 3. System Requirements \& Feature Specifications



\### 3.1. Authentication, Verification \& Identity



\* \*\*Personal \& Org Profiles:\*\*

\* Personal Profile: `https://github.com/ABsUP`

\* Organization Profile: `https://github.com/ABsUPs`





\* \*\*Human Verification via GitHub OAuth:\*\*

\* Accessing `{device\_hash}?key={private\_key}` prompts GitHub OAuth.

\* Successful authentication triggers an automated follow to `@ABsUP` and `@ABsUPs` to verify human status.

\* Token Lifecycle: Key-based URL valid for \*\*99 minutes\*\*. GitHub OAuth login session persists indefinitely until explicit manual logout.





\* \*\*Strict Organization Namespace Control:\*\*

\* Deploying or creating a company under an organization name (e.g., `/o/{Org\_Name}/`) requires server-side validation via GitHub API (`/user/orgs`) confirming the authenticated user holds an `admin` or `owner` role.

\* Unauthorized namespace usage is immediately rejected and redirected to `/F/`.







\---



\### 3.2. Mandatory Branding \& Anti-Tamper Engine



\* \*\*Global Footer Injection:\*\*

\* All generated Web UIs, dashboards, and client pages must inject the following footer:

`🗄️⚡💝\~ ABsUP.ORG` (Hyperlinked to `https://github.com/ABsUPs/OpenCodeWEBsUI`).





\* \*\*Client-Side DOM Integrity Observer:\*\*

\* A lightweight `MutationObserver` script runs continuously in the browser DOM.

\* If the footer element is removed, obscured, or hidden via CSS (`display: none`, `opacity: 0`), the observer halts execution and forces a client redirect to `/F/` (Restricted Landing Page).





\* \*\*Contributor Attribution:\*\*

\* Automatically injects `@ABsUP` into the `contributors` array of `package.json` and inserts a `Credits \& Attribution` section in `README.md` for all scaffolded projects.







\---



\### 3.3. Company Session \& Showcase Module (`/o/`)



\* \*\*Creation Wizard Inputs:\*\*

\* Company Name, Logo (Optional), Website (Optional), Goals/Mission.

\* Resource Caps: Sandbox Storage Limit (MB/GB), Budget Cap ($ USD).

\* Structure Mode: Auto-Generated Roster vs. Prompt-Driven Custom Roles.





\* \*\*Public Showcase Page (`/o/{username\_or\_org}/{company\_name}`):\*\*

\* Brand Header: Logo, Verified Badge, Mission Statement.

\* AI Workforce Metrics: Active vs. Inactive agent count across 33+ multi-agent roles.

\* Live AI Power / Token throughput gauges.

\* Public Project Showcase Cards.







\---



\### 3.4. Sandbox Isolation, Auto-Backup \& Preview Pipeline (`/s/`)



\* \*\*Multi-Tenant Isolation:\*\*

\* Strict default isolation between distinct company sessions on the same physical host. Data sharing requires explicit prompt authorization.





\* \*\*Auto-Permission \& Backup Workflow:\*\*

\* When Auto-Permission Mode is active:

1\. Triggers an automated backup of existing source code to a user-defined local backup folder before applying edits.

2\. Executes incoming code modifications in \*\*PREVIEW MODE\*\*.

3\. Prompts a `\[🚀 Publish]` button in the UI for one-click deployment to live state.









\* \*\*Scope Escalation Guardrail:\*\*

\* Any request to access filesystem paths outside the designated sandbox directory strictly requires explicit human approval.







\---



\### 3.5. Hybrid Compute, 24/7 Cloud \& Bi-Directional Sync



\* \*\*Hybrid Execution Split:\*\*

\* \*\*Local Host:\*\* Heavy compute, code generation, refactoring, security checks, and PREVIEW testing.

\* \*\*Serverless Cloud:\*\* 24/7 public API runtime deployed to free-tier cloud platforms (Cloudflare Workers, Vercel, Netlify, Render).





\* \*\*Multi-Account Fallback Rotation:\*\*

\* Supports configuring multiple free account API keys/tokens across serverless providers to maintain 100% zero-cost uptime.





\* \*\*Bi-Directional Database Syncing:\*\*

\* Automatically synchronizes state changes between cloud storage (e.g., Turso / Cloudflare D1 / SQLite) and local databases whenever a local node comes online.





\* \*\*Zero-Cost Gemini Web Automation:\*\*

\* Integrated browser automation wrapper using active logged-in sessions on `gemini.google.com` to perform AI operations without requiring paid API keys.







\---



\### 3.6. Multi-Device Management \& Offline Snapshot (`/u/`)



\* \*\*Active Device Selector:\*\*

\* Accessing `pocwu.pages.dev/u/{username}` queries active WebSocket sockets for all registered nodes under that handle.

\* Displays an interactive selector card (e.g., `🟢 MacBook Pro`, `🟢 Workstation PC`).

\* Supports connecting to a single node or streaming telemetry from all active nodes simultaneously.





\* \*\*Offline Snapshot Fallback (Zero Server Cost):\*\*

\* Automatically creates a personal \*\*Private Fork\*\* of `github.com/ABsUPs/OpenCodeWEBsUI` in the user's GitHub account during onboarding.

\* Local sessions automatically commit state snapshots to a private branch (`state-backup`).

\* When all user devices are offline, `/u/{username}` renders a read-only dashboard directly from the private GitHub fork.







\---



\### 3.7. Local-Only PRD Orchestration Module



\* \*\*Large Project Detection:\*\*

\* When a complex or multi-tier project request is received, the agent prompts:

\*"This appears to be a large-scale project. Should we draft a structured PRD first?"\*





\* \*\*Step-by-Step Interactive Interview:\*\*

\* Conducts a sequential, non-overwhelming interview covering: Goals, Feature Scopes, Tech Stack, Security Policies, and Data Schemas.





\* \*\*Strict Privacy Isolation:\*\*

\* \*\*Rule:\*\* PRDs are classified as strictly local confidential assets. They must \*\*NEVER\*\* be pushed to remote GitHub repositories or published to cloud serverless endpoints.

\* Saved exclusively at `/docs/PRD.md` on the user's local disk with explicit `.gitignore` enforcement.







\---



\### 3.8. Dynamic Plugin Manager \& Parallel Pipeline Engine



\* \*\*On-Demand Plugin Throttle:\*\*

\* Ability to dynamically load, enable, or unload other installed OpenCode plugins based on current task requirements to optimize RAM/CPU usage.





\* \*\*Concurrent Dual-Stream Pipeline:\*\*

\* Automatically splits complex tasks into parallel worker streams:

\* \*\*Stream A (Verification):\*\* Executes automated unit tests, static analysis, and security checks.

\* \*\*Stream B (Optimization):\*\* Performs code refactoring, bundle size reduction, and performance optimization concurrently.





\* Merges outputs into the master branch only when both streams pass validation.







\---



\### 3.9. GunDB Decentralized P2P Graph Network



\* \*\*Overview:\*\*

\* GunDB serves as the universal real-time data synchronization fabric connecting all local active nodes (PC, Phone, Docker, VPS) with Cloudflare serverless endpoints through a peer-to-peer graph database network.

\* All state — device telemetry, community posts, org data, sandbox sessions — flows through the GunDB graph and is automatically replicated across every online peer without requiring a central database server.



\* \*\*P2P Data Layer:\*\*

\* Utilizes GunDB (Graph Database) for real-time, peer-to-peer, offline-first data synchronization across local nodes (PC, Phone, VPS) and Cloudflare Edge Workers.

\* Each node runs a local GunDB instance that connects to other peers via WebRTC (browser-to-browser) and WebSocket (browser-to-relay / relay-to-relay).

\* The graph data model allows natural representation of interconnected entities: users, devices, orgs, projects, posts, comments — all as nodes with relational edges.



\* \*\*Conflict-Free State Sync (CRDT):\*\*

\* GunDB's built-in Conflict-Free Replicated Data Type (CRDT) algorithm automatically resolves state conflicts when offline nodes come back online.

\* No merge conflicts, no manual reconciliation — the last-write-wins and HAM (Happens-After-Merge) strategy ensures eventual consistency across the entire mesh.

\* Operations queued offline are replayed in causal order upon reconnection, preserving the integrity of the state graph.



\* \*\*Zero-Cost Storage Persistence:\*\*

\* GunDB graph snapshots are periodically serialized and persisted to the user's \*\*GitHub Private Fork\*\* (`state-backup` branch) as JSON blobs for offline fallback rendering.

\* When all user devices are offline, Cloudflare Functions serve the latest snapshot from the GitHub fork as a read-only fallback.

\* Browser-side GunDB data is persisted to IndexedDB for instant cold-start loading without network round-trips.



\* \*\*Encrypted P2P Mesh (SEA):\*\*

\* All peer-to-peer communication uses GunDB's built-in \*\*Security, Encryption & Authorization (SEA)\*\* layer.

\* Each user's identity is bound to their GitHub OAuth session — a derived SEA keypair is generated from the OAuth token and used to sign/encrypt all graph operations.

\* Data is end-to-end encrypted between peers; Cloudflare relays never see plaintext payloads.



\* \*\*Architecture Flow:\*\*

\* \*\*1. Pairing:\*\* When a new device joins, it authenticates via GitHub OAuth, retrieves the user's SEA public key from SESSIONS\_KV, and establishes an encrypted WebRTC/WS connection to existing peers.

\* \*\*2. Publishing:\*\* Any node writes data to the local GunDB instance. The change propagates instantly to all connected peers (including Cloudflare edge nodes) via the P2P mesh.

\* \*\*3. Persisting:\*\* Cloudflare edge GunDB relay nodes write periodic snapshots to D1 (structured queries) and to the user's GitHub Private Fork (full graph JSON backup).

\* \*\*4. Recovering:\*\* When a node that has been offline reconnects, GunDB's CRDT logic replays the missed operations and merges any divergent state automatically.



\* \*\*Integration Points:\*\*

\* \*\*Community Hub (/C/):\*\* Posts and comments are GunDB graph nodes. When a user creates a post, it syncs instantly to all other online users viewing the hub. Offline users see cached IndexedDB data.

\* \*\*Multi-Device (/u/):\*\* Device telemetry (CPU, RAM, uptime, active sessions) streams through GunDB in real-time. Each browser tab or daemon instance is a graph peer.

\* \*\*Org Sandbox (/o/, /s/):\*\* Sandbox state, workflow status, and agent metrics are replicated across org members' devices via the P2P mesh.

\* \*\*Templates (/T/):\*\* Template metadata and download counts are synced across edge nodes for low-latency global access.



\* \*\*Relay Node Strategy:\*\*

\* \*\*Cloudflare Workers as Gun Relays:\*\* Each Cloudflare edge location that receives a request can act as a lightweight GunDB relay — forwarding messages between peers that cannot establish direct WebRTC connections (NAT traversal).

\* \*\*Fallback to a lightweight Node.js relay\*\* running on the user's primary local machine (the OS daemon) ensures connectivity even when Cloudflare is unreachable.

\* The relay is stateless and does not store the graph — all state lives on the peers and in IndexedDB / GitHub backups.



\---

\### 3.11. Community Hub Dynamic Routing & Smart Ranking (`/C/`)

\* \*\*Hub Header-as-Button Navigation:\*\*

\* The Community Hub Directory at `/C/` features a fully interactive header that doubles as the primary action button:

\* \*\*\[💬 Community Hub\]\*\* (Page Header — Interactive Primary Action Button):
\* \* The main `💬 Community Hub` page heading is itself a clickable primary action button.
\* \* \*\*Internal Route Alias:\*\* `/C/💬` — The emoji character `💬` acts as a routable path segment.
\* \* \*\*Internal SPA Navigation:\*\* Clicking the header or navigating to `/C/💬` internally routes to the Root Hub at `/C/ABsUPs/CommunityHub`. All GitHub Discussions are fetched server-side via API and rendered inline with the app's design system — no external redirect, everything stays within the SPA.
\* \* This provides a permanent, friendly alias that is easy to remember and share, while keeping all community content natively in-app.

\* \*\*Integrated Search & Multi-Level Filtering:\*\*
\* \* \*\*\[🌐 Global\]\*\* — Toggle to display global user/org community forks.
\* \* \*\*\[📁 Projects\]\*\* — Toggle to display specific project-level community hubs.
\* \* \*\*\[🔍 Search...\]\*\* — Real-time search filter that matches against GitHub usernames, organization names, and project titles simultaneously.

\* \*\*Immutable System Smart Rank:\*\* `pocwu.pages.dev/C/ABsUPs/CommunityHub` remains permanently anchored at position #1.

\* \*\*Sort & Filter Engine:\*\*

\* Below the navigation header, a dedicated toolbar row provides advanced sorting and filtering:

\* \*\*\[🔽 Sort: System Smart Rank\]\*\* — Dropdown with the following sort options:
\* \* \*\*System Smart Rank\*\* (Default) — Immutable algorithmic order anchored by Root Hub at position #1.
\* \* \*\*Most Active Members\*\* — Hubs ranked by highest active participant count.
\* \* \*\*Top GitHub Stars & Forks\*\* — Hubs ranked by combined GitHub star and fork count.
\* \*\*Recently Created\*\* — Newest hubs first, based on creation date.

\* \*\*\[🏷️ Tag: All\]\*\* — Filter dropdown to narrow by discussion thread types:
\* \* \*\*All\*\* (Default) — No tag filter applied.
\* \* \*\*Templates\*\* — Hubs with template-related discussions.
\* \* \*\*Features\*\* — Hubs with feature request discussions.
\* \* \*\*Showcase\*\* — Hubs with showcase / portfolio discussions.
\* \* \*\*Bug Reports\*\* — Hubs with bug report discussions.

\* \*\*\[⚡ Status: All Active\]\*\* — Filter by hub activity status (reserved for future use, currently defaults to all active hubs).



\* \*\*Dynamic Community URL Routing:\*\*

\* \*\*Hub Directory:\*\* `pocwu.pages.dev/C` — Lists all community hubs with ranking.

\* \*\*Personal/Org Global Hub:\*\* `pocwu.pages.dev/C/{GitHub_Username_or_OrgName}` — The community hub for a specific user or organization, showing their discussions and project hubs.

\* \*\*Specific Project Hub:\*\* `pocwu.pages.dev/C/{GitHub_Username_or_OrgName}/{Project_Name}` — A project-scoped community hub, showing discussions limited to that project.

\* \*\*Root Hub:\*\* `pocwu.pages.dev/C/ABsUPs/CommunityHub` — The canonical root hub, permanently fixed at position #1 in rankings.



\* \*\*Automated Repository Forking:\*\*

\* When a user enables the \*\*🌐 Global Community\*\* toggle for the first time, the system automatically creates a GitHub Fork of `github.com/ABsUPs/CommunityHub` into the authenticated user's personal account or organization.

\* The fork becomes the user's personal community hub, populated with their discussions and project hubs.

\* Subsequent visits to `/C/{username}` render content from the user's fork.



\* \*\*System-Driven Smart Ranking (Immutable):\*\*

\* \*\*Top Fixed Root:\*\* `pocwu.pages.dev/C/ABsUPs/CommunityHub` (`github.com/ABsUPs/CommunityHub`) is permanently anchored at position \#1 in all hub listings. This position is immutable and cannot be overridden.

\* \*\*Algorithmic Ranking:\*\* All subsequent community hubs are ranked dynamically by the system based on:

\* \*\*Member Engagement:\*\* Active discussion threads, comment velocity, and participant count.

\* \*\*Discussion Volume:\*\* Total posts, replies, and daily active conversations.

\* \*\*Repository Stars & Forks:\*\* GitHub star count, fork count, and recent commit activity.

\* \*\*Manual override is strictly disallowed.\*\* Rankings are computed server-side and cannot be influenced by users.



\* \*\*Integration with GunDB P2P Sync:\*\*

\* Each community hub's posts and comments are published to the GunDB graph under a namespaced key: `community_hub:{username}:{project}`.

\* Real-time cross-hub sync ensures that updates in one hub propagate to all subscribers of that hub via the GunDB P2P mesh.

\* Offline users see cached IndexedDB data scoped to their last-visited hub.



\---

\### 3.12. OS-Level Background Daemon Engine



\* \*\*24/7 System Persistence:\*\*

\* Generates OS-native persistent background services to maintain continuous node readiness:

\* \*\*Linux:\*\* `systemd` user unit file.

\* \*\*macOS:\*\* `launchd` plist daemon configuration.

\* \*\*Windows:\*\* Task Scheduler / PM2 background process script.

\* \*\*Android / Mobile:\*\* Termux wrapper with sticky Foreground Notification Service.

\* \*\*Docker / VPS:\*\* Managed via `--restart always` policy.











\---



\## 4. URL Route Map (pocwu.pages.dev)



| Route Pattern | Page Type | Description \& Visibility |

| --- | --- | --- |

| \*\*`/`\*\* | Home Dashboard | Cobe WebGL 3D Interactive Globe, Live Node Metrics, Top Leaderboards. |

| \*\*`/u/{username}`\*\* | Device Admin \& Control | Active device selector, multi-stream logs, or offline snapshot view. |

| \*\*`/o/{org}/{company}`\*\* | Org Showcase | Public showcase with logo, workforce metrics, token meters, and projects. |

| \*\*`/s/{org}/{project}`\*\* | Project Sandbox | Live sandboxed web server / API preview endpoint. |

| \*\*`/T/`\*\* | Template Marketplace | Public repository for sharing multi-agent templates and OpenCode setups. |

| \*\*`/C/`\*\* | Community Hub Directory | Global hub directory with smart ranking, search, and Global/Project toggles. |

| \*\*`/C/💬`\*\* | External Redirect | Internal route alias that redirects to official GitHub Discussions (`github.com/ABsUPs/OpenCodeWEBsUI/discussions`). |

| \*\*`/C/{username}`\*\* | User/Org Community Hub | Personal or organization community hub with discussions and project hubs. |

| \*\*`/C/{username}/{project}`\*\* | Project Community Hub | Project-scoped community hub with discussions limited to that project. |

| \*\*`/C/ABsUPs/CommunityHub`\*\* | Root Hub (Fixed #1) | Canonical root community hub permanently anchored at position #1. |

| \*\*`/F/`\*\* | Security Landing Page | Fallback landing page for security restrictions, invalid access, or DOM tampering. |



\---



\## 5. Software Architecture \& File Mapping



```text

opencode-abs-ui-ux/

├── src/

│   ├── index.ts                     # Main plugin registration \& orchestration entrypoint

│   ├── plugin-manager.ts            # Dynamic plugin enabler/disabler \& RAM optimizer

│   ├── task-parallelizer.ts         # Task decomposition \& dual-stream concurrent pipeline

│   ├── prd-orchestrator.ts          # Interactive PRD interview engine \& local file isolation

│   ├── background-daemon.ts         # Cross-platform OS service installer (systemd/launchd/PM2)

│   ├── footer-integrity.ts          # Mandatory branding wrapper \& client-side MutationObserver

│   ├── github-auth-fork.ts          # GitHub OAuth, Org owner validation, \& private fork engine

│   ├── hybrid-deployer.ts           # Serverless deployment driver with multi-account rotation

│   ├── db-sync.ts                   # Bi-directional local-to-cloud database sync manager

│   ├── gun-db-sync.ts              # GunDB P2P graph node — local peer, SEA encryption, CRDT sync

│   ├── multi-device-manager.ts      # Active node registry \& device selector broker

│   ├── company-sandbox.ts           # Org profile wizard, sandbox isolation, \& preview engine

│   └── telegram-voice-discord.ts    # Telegram inline bot, browser TTS, \& Discord webhooks

├── cloudflare/

│   ├── cloudflare-worker.js         # Edge worker handling /u/, /o/, /s/, /T/, /C/, /F/ routes

│   └── gun-relay-worker.js          # GunDB WebSocket relay — forwards P2P messages between peers, persists snapshots to D1 + GitHub Fork

└── package.json                     # NPM package metadata for opencode-abs-ui-ux



```



```

