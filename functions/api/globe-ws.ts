/**
 * Pages Function — WebSocket handler for MultiplayerGlobe.
 *
 * Phase 2: Forwards WebSocket upgrade to GlobeRelayDO (standalone Worker)
 * for real-time cross-user peer sync. Geo-position is extracted from the
 * Cloudflare cf-* headers and passed as X-Geo-* headers to the DO.
 *
 * Architecture:
 *   Browser → wss://pocwu.pages.dev/api/globe-ws
 *          → Pages Function (this file)
 *          → service binding → pocwu-globe-relay Worker → GlobeRelayDO
 *
 * Reference:
 *   https://github.com/cloudflare/templates/tree/main/multiplayer-globe-template
 */

interface Env {
  GLOBE_DO: Fetcher; // service binding to pocwu-globe-relay
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const upgrade = request.headers.get("Upgrade");
  if (!upgrade || upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket upgrade", { status: 426 });
  }

  // Extract geo-position from Cloudflare cf-* headers (set on the edge)
  const cf = (request as any).cf as Record<string, unknown> | undefined;
  const latitude = String(cf?.latitude ?? "");
  const longitude = String(cf?.longitude ?? "");

  // Forward to DO via service binding, passing geo as headers
  const doRequest = new Request(request.url, {
    method: "GET",
    headers: {
      Upgrade: "websocket",
      "X-Geo-Latitude": latitude,
      "X-Geo-Longitude": longitude,
    },
  });

  return env.GLOBE_DO.fetch(doRequest);
};
