/**
 * Sandbox management API
 *
 * GET  /api/sandbox/:id     — get sandbox status
 * POST /api/sandbox         — create new sandbox
 * PUT  /api/sandbox/:id     — update sandbox state
 */

interface Sandbox {
  id: string;
  name: string;
  org: string;
  owner: string;
  status: "creating" | "running" | "preview" | "stopped";
  isolation: "strict" | "shared";
  autoBackup: boolean;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Env {
  DEVICES_KV?: KVNamespace;
  SESSIONS_KV?: KVNamespace;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function getUser(
  request: Request,
  kv: KVNamespace,
): Promise<string | null> {
  const auth = request.headers.get("Authorization") ?? "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;

  const session = await kv.get(`session:${token}`);
  if (!session) return null;

  const data = JSON.parse(session);
  return data.user?.login ?? null;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, params, env } = context;
  const method = request.method;
  const kv = env.DEVICES_KV;

  if (!kv || !env.SESSIONS_KV) {
    return json({ error: "Storage not configured" }, 503);
  }

  const user = await getUser(request, env.SESSIONS_KV);

  // ─── GET /api/sandbox/:id ─────────────────────────────────
  if (method === "GET" && params.id) {
    if (!user) return json({ error: "Unauthorized" }, 401);

    const sandbox = await kv.get(`sandbox:${params.id}`);
    if (!sandbox) return json({ error: "Sandbox not found" }, 404);

    const data: Sandbox = JSON.parse(sandbox);
    if (data.owner !== user) return json({ error: "Forbidden" }, 403);

    return json({ sandbox: data });
  }

  return json({ error: "Not found" }, 404);
};

// ─── POST /api/sandbox — create new sandbox ──────────────────
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const kv = env.DEVICES_KV;

  if (!kv || !env.SESSIONS_KV) {
    return json({ error: "Storage not configured" }, 503);
  }

  const user = await getUser(request, env.SESSIONS_KV);
  if (!user) return json({ error: "Unauthorized" }, 401);

  const body = (await request.json()) as {
    name?: string;
    org?: string;
  };

  const sandbox: Sandbox = {
    id: crypto.randomUUID(),
    name: body.name ?? "Untitled Sandbox",
    org: body.org ?? "personal",
    owner: user,
    status: "creating",
    isolation: "strict",
    autoBackup: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await kv.put(`sandbox:${sandbox.id}`, JSON.stringify(sandbox), {
    expirationTtl: 86400 * 7, // 7 day TTL
  });

  // Transition to running after creation
  sandbox.status = "running";
  sandbox.updatedAt = new Date().toISOString();
  await kv.put(`sandbox:${sandbox.id}`, JSON.stringify(sandbox), {
    expirationTtl: 86400 * 7,
  });

  return json({ sandbox }, 201);
};

// ─── PUT /api/sandbox/:id — update state ─────────────────────
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { request, params, env } = context;
  const kv = env.DEVICES_KV;

  if (!kv || !env.SESSIONS_KV) {
    return json({ error: "Storage not configured" }, 503);
  }

  const user = await getUser(request, env.SESSIONS_KV);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (!params.id) return json({ error: "Sandbox ID required" }, 400);

  const existing = await kv.get(`sandbox:${params.id}`);
  if (!existing) return json({ error: "Sandbox not found" }, 404);

  const sandbox: Sandbox = JSON.parse(existing);
  if (sandbox.owner !== user) return json({ error: "Forbidden" }, 403);

  const body = (await request.json()) as {
    status?: Sandbox["status"];
  };

  if (body.status) sandbox.status = body.status;
  sandbox.updatedAt = new Date().toISOString();

  await kv.put(`sandbox:${params.id}`, JSON.stringify(sandbox), {
    expirationTtl: 86400 * 7,
  });

  return json({ sandbox });
};
