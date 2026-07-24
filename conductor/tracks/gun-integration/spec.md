# Spec: GunDB P2P Real-Time Data Layer

## Objective
Integrate GunDB as the universal real-time data synchronization fabric connecting all local nodes (browser tabs) with Cloudflare serverless endpoints through a peer-to-peer graph database network.

## Scope
1. **Client-side GunDB module** — Singleton with IndexedDB persistence, SEA encryption keypair derived from GitHub OAuth session
2. **GunDB WebSocket relay** — Cloudflare Durable Object or Pages Function WebSocket endpoint for cross-user message forwarding
3. **Community Hub real-time sync** — Posts and comments published to Gun graph appear instantly across all connected browsers
4. **SEA identity binding** — Each user's Gun identity tied to their GitHub OAuth session for E2EE

## Out of Scope
- Full P2P WebRTC mesh (use relay for now)
- GunDB integration with /u/, /o/, /s/ routes (Phase 2)
- Background daemon Gun relay (Phase 3)
