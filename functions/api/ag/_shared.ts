/**
 * Shared utilities for AG (Autonomous GitHub Bot) API routes.
 */

export interface Env {
  AG_TOKENS_KV?: KVNamespace;
  SESSIONS_KV?: KVNamespace;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  /** GitHub App slug (e.g. "opencodewebsag") — set this in Pages dashboard env vars */
  GITHUB_APP_SLUG?: string;
  /** Service binding to the opencodeweb gateway (routes to AG worker internally) */
  AG_WORKER?: Fetcher;
  /** Internal gateway token for service-to-service auth (set in Cloudflare Pages env vars) */
  INTERNAL_GATEWAY_TOKEN?: string;
}

/**
 * Add the internal gateway token to a Headers object for service-binding calls.
 * Returns the token value for logging/debug purposes.
 */
export function addGatewayToken(
  headers: Headers,
  token: string | undefined
): string | undefined {
  if (token) {
    headers.set("X-Gateway-Token", token);
  }
  return token;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
