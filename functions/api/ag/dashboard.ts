/**
 * GET /api/ag/dashboard — return bot status and installation info
 *
 * Reads from AG_TOKENS_KV and optionally proxies the worker health check.
 */

import { Env, json } from "./_shared";

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const kv = env.AG_TOKENS_KV;

  // Get session from auth header
  const auth = request.headers.get("Authorization") ?? "";
  const sessionToken = auth.replace("Bearer ", "");
  let userLogin: string | null = null;

  if (sessionToken && env.SESSIONS_KV) {
    const sessionRaw = await env.SESSIONS_KV.get(`session:${sessionToken}`);
    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw) as { user?: { login?: string } };
        userLogin = session.user?.login ?? null;
      } catch {
        // ignore
      }
    }
  }

  // Gather installation info
  const installations: Array<Record<string, unknown>> = [];
  if (kv) {
    try {
      // List all known installations from KV (independent of auth)
      const listed = await kv.list({ prefix: "ag_install:" });
      for (const key of listed.keys) {
        const installData = await kv.get(key.name);
        if (installData) {
          try {
            const parsed = JSON.parse(installData) as Record<string, unknown>;
            installations.push({ id: key.name.replace("ag_install:", ""), ...parsed });
          } catch {
            // skip malformed entries
          }
        }
      }
    } catch {
      // List may not be supported in all environments
    }
  }

  // Try to proxy worker health check
  let workerStatus = "unknown";
  if (env.AG_WORKER) {
    try {
      const healthResp = await env.AG_WORKER.fetch("https://worker/health");
      if (healthResp.ok) {
        const healthData = (await healthResp.json()) as { status?: string };
        workerStatus = healthData.status ?? "unknown";
      } else {
        workerStatus = "unreachable";
      }
    } catch {
      workerStatus = "unreachable";
    }
  }

  return json({
    loggedIn: userLogin !== null,
    user: userLogin,
    workerStatus,
    installations,
    version: "1.0.0",
  });
};
