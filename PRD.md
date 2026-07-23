



```markdown

\# Product Requirement Document (PRD)



\## Product Name: OpenCodeABsUI/UX

\*\*Version:\*\* 1.0.0-EA  

\*\*Author / Core Maintainer:\*\* \[@ABsUP](https://github.com/ABsUP)  

\*\*Organization:\*\* \[@ABsUPs](https://github.com/ABsUPs)  

\*\*Official Repository:\*\* \[ABsUPs/OpenCodeWEBsUI](https://github.com/ABsUPs/OpenCodeWEBsUI)  



\---



\## 1. Executive Summary \& Vision



\*\*OpenCodeABsUI/UX\*\* is an enterprise-grade, public OpenCode ecosystem plugin and hybrid infrastructure manager. It bridges local developer environments (PC, Mac, Linux, Mobile Termux, Docker, VPS) with a 24/7 serverless cloud runtime. 



The system provides a SaaS-style Web UI featuring multi-agent company orchestration (`/o/`), isolated sandboxes (`/s/`), multi-device remote management (`/u/`), GitHub-based verification, and a 3D interactive global metrics dashboard powered by Cloudflare Workers and Cobe WebGL.



\---



\## 2. Core Architecture \& Ecosystem Flow



```text

+---------------------------------------------------------------------------------+

|                                 pocwu.pages.dev                                 |

|              (Cloudflare Edge Proxy / Dynamic Multi-Route Engine)               |

+-------+------------------+------------------+------------------+----------------+

&#x20;       |                  |                  |                  |

&#x20;       v                  v                  v                  v

&#x20;   / (Home)          /u/{username}     /o/{org\_name}      /s/{project}

&#x20; 3D Cobe Globe      Multi-Device UI    Org Showcase        Sandboxed Runtime

&#x20; Live Metrics       Offline Snapshot   Workforce Stats     Preview/Live Server

&#x20;       |                  |                  |                  |

&#x20;       +------------------+------------------+------------------+

&#x20;                                  |

&#x20;                                  v

&#x20;            +-------------------------------------------+

&#x20;            |         Local OS Background Daemon        |

&#x20;            |  (systemd / launchd / Task Scheduler)     |

&#x20;            +---------------------+---------------------+

&#x20;                                  |

&#x20;            +---------------------+---------------------+

&#x20;            |                                           |

&#x20;            v                                           v

&#x20;  Parallel Pipeline Engine                 Hybrid Serverless Cloud

&#x20; (Test + Optimize Dual Stream)           (Cloudflare Workers / Vercel)



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



\### 3.9. OS-Level Background Daemon Engine



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

| \*\*`/C/`\*\* | Community Hub | Discussion forum powered directly by GitHub Discussions API. |

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

│   ├── multi-device-manager.ts      # Active node registry \& device selector broker

│   ├── company-sandbox.ts           # Org profile wizard, sandbox isolation, \& preview engine

│   └── telegram-voice-discord.ts    # Telegram inline bot, browser TTS, \& Discord webhooks

├── cloudflare/

│   └── cloudflare-worker.js         # Edge worker handling /u/, /o/, /s/, /T/, /C/, /F/ routes

└── package.json                     # NPM package metadata for opencode-abs-ui-ux



```



```

