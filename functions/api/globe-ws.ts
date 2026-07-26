/**
 * Pages Function — WebSocket handler for Multiplayer Globe.
 *
 * Phase 1: Per-connection handler (no Durable Object yet).
 *   Each connection is isolated; the client shows "Live" with 0 peers.
 *
 * Phase 2 (follow-up): Replace with Durable Object relay for cross-user sync.
 *   DO will maintain shared peer state across all connections.
 */

export const onRequest: PagesFunction = async (context) => {
  const upgrade = context.request.headers.get("Upgrade");
  if (!upgrade || upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 426 });
  }

  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  server.accept();

  // Isolated per-connection handler — replies with empty peer list.
  // In Phase 2, this will be replaced with a Durable Object stub fetch.
  server.addEventListener("message", (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data as string);
      if (data.type === "JOIN" || data.type === "MOVE") {
        server.send(JSON.stringify({ type: "PEERS_UPDATE", peers: [] }));
      }
    } catch {
      // ignore malformed messages
    }
  });

  return new Response(null, { status: 101, webSocket: client });
};
