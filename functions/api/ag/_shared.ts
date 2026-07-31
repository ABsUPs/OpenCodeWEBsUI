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
  /** Optional service binding to the opencodewebsag-worker for dashboard proxy */
  AG_WORKER?: Fetcher;
  /** Internal gateway token — forwarded to worker for protected routes */
  INTERNAL_GATEWAY_TOKEN?: string;
  /** Gateway API key for direct gateway calls */
  GATEWAY_API_KEY?: string;
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
