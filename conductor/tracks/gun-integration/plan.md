# Plan: GunDB P2P Real-Time Data Layer

## Steps

### Step 1: Install GunDB dependency
- `npm install gun` 
- Add `@types/gun` if available, or create ambient type declarations

### Step 2: Create client-side GunDB module (`src/lib/gun.ts`)
- Initialize Gun with `localStorage`/`IndexedDB` persistence
- Export singleton `gun` instance
- Export `useGun` hook for React components
- Handle SEA keypair generation tied to GitHub OAuth token

### Step 3: Integrate SEA auth with AuthContext
- When user logs in via GitHub OAuth, derive SEA keypair from session token
- Store public key in SESSIONS_KV for peer discovery
- Sign all Gun graph operations with SEA

### Step 4: Create WebSocket relay endpoint
- Add `functions/api/gun/relay.ts` — WebSocket upgrade handler
- Forward Gun messages between connected peers
- Periodically persist graph state to D1

### Step 5: Community Hub real-time sync
- When a post is created via the REST API, also publish it to the Gun graph
- CommunityHub subscribes to Gun graph for real-time updates
- Merge Gun-synced posts with REST-fetched posts in the feed
- Show "live" indicator on real-time-synced posts

### Step 6: Build, deploy & verify
- Build passes cleanly
- Deploy to pocwu.pages.dev
- Open two browser tabs — post created in one appears in the other within seconds
