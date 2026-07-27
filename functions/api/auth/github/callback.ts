/**
 * GET /api/auth/github/callback — handle OAuth callback, create session
 */

import { Env, json, generateToken } from "./_shared";

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!code || !state || !clientId || !clientSecret) {
    return json({ error: "Missing parameters" }, 400);
  }

  // Verify state (CSRF check)
  if (env.SESSIONS_KV) {
    const stored = await env.SESSIONS_KV.get(`oauth_state:${state}`);
    if (!stored) return json({ error: "Invalid state" }, 403);
    await env.SESSIONS_KV.delete(`oauth_state:${state}`);
  }

  // Exchange code for access token
  const tokenResp = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "OpenCodeABsUI-UX/1.0",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    }
  );

  if (!tokenResp.ok) {
    const errText = await tokenResp.text().catch(() => "Unknown error");
    return json({ error: "Token exchange failed", details: errText.slice(0, 200) }, 502);
  }

  const tokenData = (await tokenResp.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!tokenData.access_token) {
    return json(
      { error: tokenData.error_description ?? "OAuth failed" },
      400
    );
  }

  // Fetch user info
  const userResp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "OpenCodeABsUI-UX/1.0",
    },
  });
  if (!userResp.ok) {
    return json({ error: "Failed to fetch GitHub user" }, 502);
  }
  const user = (await userResp.json()) as {
    login: string;
    id: number;
    avatar_url: string;
    name?: string;
  };

  // Fetch user's orgs for namespace validation
  const orgsResp = await fetch("https://api.github.com/user/orgs", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "OpenCodeABsUI-UX/1.0",
    },
  });
  if (!orgsResp.ok) {
    return json({ error: "Failed to fetch GitHub orgs" }, 502);
  }
  const orgs = (await orgsResp.json()) as Array<{ login: string }>;

  // Create session token — note: the GitHub access_token is NOT stored.
  // It was only needed momentarily for the two API calls above (user + orgs).
  // Storing it would grant unnecessary GitHub API access if leaked.
  const sessionToken = generateToken();
  const sessionData = {
    user: {
      login: user.login,
      id: user.id,
      avatar: user.avatar_url,
      name: user.name ?? user.login,
    },
    orgs: orgs.map((o) => o.login),
    createdAt: new Date().toISOString(),
  };

  // Store session in KV (24h expiry)
  if (env.SESSIONS_KV) {
    await env.SESSIONS_KV.put(
      `session:${sessionToken}`,
      JSON.stringify(sessionData),
      { expirationTtl: 86400 }
    );
  }

  // Redirect back to app with session token
  const appUrl = new URL(url.origin);
  appUrl.searchParams.set("session", sessionToken);
  return Response.redirect(appUrl.toString(), 302);
};
