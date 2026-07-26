/**
 * Pages Function — WebSocket upgrade handler for Multiplayer Globe.
 *
 * Creates / retrieves a GlobeRelayDO stub and forwards the upgrade
 * request so the Durable Object can manage the WebSocket session.
 */

interface Env {
  GLOBE_RELAY: DurableObjectNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const id = context.env.GLOBE_RELAY.idFromName("global");
  const stub = context.env.GLOBE_RELAY.get(id);
  return stub.fetch(context.request);
};
