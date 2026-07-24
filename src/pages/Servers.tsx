import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PublicServer {
  id: string;
  name: string;
  type: "gun-relay" | "sandbox-preview" | "daemon-node" | "custom";
  url: string;
  owner: string;
  status: "online" | "offline" | "maintenance";
  region: string;
  version: string;
  description: string;
  tags: string[];
  uptime: number;
  lastSeen: string;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPE_ICONS: Record<string, string> = {
  "gun-relay": "📡",
  "sandbox-preview": "🔬",
  "daemon-node": "🤖",
  custom: "⚙️",
};

const TYPE_LABELS: Record<string, string> = {
  "gun-relay": "GunDB Relay",
  "sandbox-preview": "Sandbox Preview",
  "daemon-node": "Daemon Node",
  custom: "Custom Service",
};

const STATUS_COLORS: Record<string, string> = {
  online: "bg-emerald-500",
  offline: "bg-red-500",
  maintenance: "bg-amber-500",
};

function formatUptime(pct: number): string {
  return pct >= 99.9 ? "99.9%+" : pct.toFixed(1) + "%";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card-surface animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 rounded bg-white/5" />
              <div className="h-4 w-96 rounded bg-white/5" />
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded-full bg-white/5" />
                <div className="h-5 w-24 rounded-full bg-white/5" />
                <div className="h-5 w-16 rounded-full bg-white/5" />
              </div>
            </div>
            <div className="h-5 w-14 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Server Card                                                        */
/* ------------------------------------------------------------------ */

function ServerCard({ server }: { server: PublicServer }) {
  const [expanded, setExpanded] = useState(false);

  const isLinkable =
    server.url.startsWith("http") || server.url.startsWith("wss");

  return (
    <div
      className={`card-surface group cursor-pointer transition-all ${
        expanded ? "border-brand-500/30" : ""
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-lg">
          {TYPE_ICONS[server.type] ?? "⚙️"}
        </div>

        <div className="min-w-0 flex-1">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-medium text-white/90">{server.name}</h3>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/30">
              {TYPE_LABELS[server.type] ?? server.type}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/30">
              v{server.version}
            </span>
          </div>

          {/* Description */}
          <p className={`mt-1 text-sm text-white/50 transition-all ${expanded ? "" : "line-clamp-1"}`}>
            {server.description}
          </p>

          {/* Tags + meta */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {/* Status dot */}
            <span className="inline-flex items-center gap-1.5 text-white/40">
              <span className={`inline-block h-2 w-2 rounded-full ${STATUS_COLORS[server.status] ?? "bg-gray-500"}`} />
              {server.status}
            </span>
            <span className="text-white/30">·</span>
            <span className="text-white/40">{server.region}</span>
            <span className="text-white/30">·</span>
            <span className="text-white/40">{formatUptime(server.uptime)} uptime</span>
            <span className="text-white/30">·</span>
            <span className="text-white/40">by {server.owner}</span>
            <span className="text-white/30">·</span>
            <span className="text-white/30">{timeAgo(server.lastSeen)}</span>
          </div>

          {/* Tags */}
          {expanded && server.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {server.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-brand-600/10 px-2 py-0.5 text-[10px] font-medium text-brand-400"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          {expanded && (
            <div className="mt-4 flex gap-3">
              {isLinkable ? (
                <a
                  href={server.url}
                  target={server.url.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg bg-brand-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-500"
                >
                  {server.type === "gun-relay" ? "Connect Relay" : "Open Server"}
                </a>
              ) : (
                <code className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40">
                  {server.url}
                </code>
              )}
            </div>
          )}
        </div>

        {/* Expand chevron */}
        <div className="shrink-0 self-start pt-1">
          <svg
            className={`h-4 w-4 text-white/20 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filters                                                            */
/* ------------------------------------------------------------------ */

const FILTER_TYPES = ["All", "gun-relay", "sandbox-preview", "daemon-node", "custom"] as const;

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function Servers() {
  const { user } = useAuth();
  const [servers, setServers] = useState<PublicServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    type: "custom" as PublicServer["type"],
    url: "",
    region: "",
    description: "",
    tags: "",
  });
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const fetchServers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/public/servers");
      if (!r.ok) throw new Error("Failed to fetch servers");
      const data = (await r.json()) as { servers: PublicServer[] };
      setServers(data.servers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load servers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const filtered =
    filterType === "All"
      ? servers
      : servers.filter((s) => s.type === filterType);

  const typeCounts = servers.reduce(
    (acc, s) => {
      acc[s.type] = (acc[s.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // ── Register handler ─────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim() || !registerForm.url.trim()) return;
    setRegistering(true);
    setRegisterError("");
    try {
      const token = localStorage.getItem("pocwu_session_token");
      const r = await fetch("/api/public/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: registerForm.name.trim(),
          type: registerForm.type,
          url: registerForm.url.trim(),
          region: registerForm.region.trim() || undefined,
          description: registerForm.description.trim() || undefined,
          tags: registerForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed to register");
      }
      setShowRegister(false);
      setRegisterForm({ name: "", type: "custom", url: "", region: "", description: "", tags: "" });
      await fetchServers();
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 pb-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Public <span className="text-brand-400">Servers</span>
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {loading
              ? "Loading…"
              : `${servers.length} public server${servers.length === 1 ? "" : "s"} — ${servers.filter((s) => s.status === "online").length} online`}
          </p>
        </div>
        {user && (
          <button
            onClick={() => setShowRegister(!showRegister)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Register Server
          </button>
        )}
      </div>

      {/* ── Register form ──────────────────────────────────── */}
      {showRegister && (
        <div className="mb-8 rounded-xl border border-white/10 bg-surface-raised p-5">
          <h2 className="mb-4 text-sm font-semibold text-white/70">Register a Public Server</h2>
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-white/40">Name *</label>
                <input
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50"
                  placeholder="My Server"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/40">Type</label>
                <select
                  value={registerForm.type}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, type: e.target.value as PublicServer["type"] })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50"
                >
                  <option value="gun-relay">GunDB Relay</option>
                  <option value="sandbox-preview">Sandbox Preview</option>
                  <option value="daemon-node">Daemon Node</option>
                  <option value="custom">Custom Service</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/40">URL *</label>
              <input
                value={registerForm.url}
                onChange={(e) => setRegisterForm({ ...registerForm, url: e.target.value })}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50"
                placeholder="https://myserver.com or wss://relay.example.com"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-white/40">Region</label>
                <input
                  value={registerForm.region}
                  onChange={(e) => setRegisterForm({ ...registerForm, region: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50"
                  placeholder="US East, Europe, Global…"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/40">Tags (comma-separated)</label>
                <input
                  value={registerForm.tags}
                  onChange={(e) => setRegisterForm({ ...registerForm, tags: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50"
                  placeholder="gun, relay, europe"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/40">Description</label>
              <textarea
                value={registerForm.description}
                onChange={(e) => setRegisterForm({ ...registerForm, description: e.target.value })}
                rows={2}
                className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-500/50"
                placeholder="What does your server do?"
              />
            </div>
            {registerError && <p className="text-sm text-red-400">{registerError}</p>}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registering || !registerForm.name.trim() || !registerForm.url.trim()}
                className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-40"
              >
                {registering ? "Registering…" : "Register"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Type filters ───────────────────────────────────── */}
      {!loading && !error && servers.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTER_TYPES.map((t) => {
            const count = t === "All" ? servers.length : typeCounts[t] ?? 0;
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterType === t
                    ? "bg-brand-600/20 text-brand-300"
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                }`}
              >
                {t === "All" ? "All" : TYPE_LABELS[t] ?? t}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Content ────────────────────────────────────────── */}
      {loading && <SkeletonList />}
      {!loading && error && (
        <div className="card-surface border-red-500/20 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchServers}
            className="mt-3 rounded-lg bg-brand-600/20 px-4 py-2 text-sm font-medium text-brand-300 hover:bg-brand-600/30"
          >
            Try again
          </button>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="card-surface text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <svg className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.75L7.5 6.75l3.75-3.75m0 0l3.75 3.75L18 7.5" />
            </svg>
          </div>
          <h3 className="text-base font-medium text-white/70">No servers found</h3>
          <p className="mt-1 text-sm text-white/40">
            {filterType !== "All"
              ? `No ${TYPE_LABELS[filterType]?.toLowerCase() ?? filterType} servers registered yet.`
              : "No public servers registered yet."}
          </p>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}
    </div>
  );
}
