/**
 * GlobeRelayDO — Durable Object for Multiplayer Globe peer state.
 *
 * Maintains a set of connected WebSocket clients and broadcasts
 * active peer positions (lat/lng) to all subscribers whenever
 * someone joins, moves, or disconnects.
 */

export interface PeerPosition {
  id: string;
  lat: number;
  lng: number;
}

export class GlobeRelayDO implements DurableObject {
  private peers = new Map<string, PeerPosition>();
  private sessions = new Map<string, WebSocket>();

  async fetch(request: Request): Promise<Response> {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    server.accept();

    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, server);

    server.addEventListener("message", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === "JOIN") {
          this.peers.set(sessionId, {
            id: sessionId,
            lat: data.lat ?? 0,
            lng: data.lng ?? 0,
          });
          this.broadcast();
        } else if (data.type === "MOVE") {
          const p = this.peers.get(sessionId);
          if (p) {
            p.lat = data.lat ?? p.lat;
            p.lng = data.lng ?? p.lng;
            this.broadcast();
          }
        }
      } catch {
        // ignore malformed messages
      }
    });

    server.addEventListener("close", () => {
      this.peers.delete(sessionId);
      this.sessions.delete(sessionId);
      this.broadcast();
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  private broadcast(): void {
    const list = Array.from(this.peers.values());
    const msg = JSON.stringify({ type: "PEERS_UPDATE", peers: list });

    for (const ws of this.sessions.values()) {
      try {
        ws.send(msg);
      } catch {
        // ignore dead connections
      }
    }
  }
}
