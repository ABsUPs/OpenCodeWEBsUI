import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UserEntry {
  login: string;
  id: number;
  avatar: string;
  name: string;
  status: "online" | "offline";
  lastSeen: string;
  joinedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card-surface animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-36 rounded bg-white/5" />
              <div className="h-4 w-24 rounded bg-white/5" />
            </div>
            <div className="h-5 w-14 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  User Card                                                          */
/* ------------------------------------------------------------------ */

function UserCard({ user }: { user: UserEntry }) {
  return (
    <Link
      to={`/u/${user.login}`}
      className="card-surface group flex items-center gap-4 transition-all hover:border-brand-500/30"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={user.avatar}
          alt={user.login}
          className="h-10 w-10 rounded-full bg-white/5"
          loading="lazy"
        />
        <span
          className={`absolute -bottom-0.5 -right-0.5 block h-3.5 w-3.5 rounded-full border-2 border-surface-base ${
            user.status === "online" ? "bg-emerald-500" : "bg-white/20"
          }`}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white/90 group-hover:text-brand-400 transition-colors">
            {user.name}
          </span>
          <span className="text-xs text-white/30">@{user.login}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-white/30">
          <span className="flex items-center gap-1">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                user.status === "online" ? "bg-emerald-500" : "bg-white/20"
              }`}
            />
            {user.status === "online" ? "Online" : "Offline"}
          </span>
          {user.lastSeen && user.status === "offline" && (
            <span>last seen {timeAgo(user.lastSeen)}</span>
          )}
          <span>joined {timeAgo(user.joinedAt)}</span>
        </div>
      </div>

      {/* Chevron */}
      <svg
        className="h-4 w-4 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-brand-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="card-surface text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <svg className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <h3 className="text-base font-medium text-white/70">No users yet</h3>
      <p className="mt-1 text-sm text-white/40">
        Users will appear here once they authenticate via GitHub OAuth.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Search bar                                                         */
/* ------------------------------------------------------------------ */

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2.5 pl-10 pr-4 text-sm text-white/70 outline-none transition-colors placeholder:text-white/20 focus:border-brand-500/50 focus:bg-white/[0.04]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function Users() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/users");
      if (!r.ok) throw new Error("Failed to fetch users");
      const data = (await r.json()) as { users: UserEntry[] };
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? users.filter(
        (u) =>
          u.login.toLowerCase().includes(query) ||
          u.name.toLowerCase().includes(query),
      )
    : users;

  const onlineCount = users.filter((u) => u.status === "online").length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 pb-24">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-brand-400">Users</span> Directory
        </h1>
        <p className="mt-1 text-sm text-white/40">
          {loading
            ? "Loading…"
            : `${users.length} user${users.length === 1 ? "" : "s"} — ${onlineCount} online`}
        </p>
      </div>

      {/* ── Search ─────────────────────────────────────────── */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search users by name or handle…"
        />
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      {loading && <SkeletonList />}
      {!loading && error && (
        <div className="card-surface border-red-500/20 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-3 rounded-lg bg-brand-600/20 px-4 py-2 text-sm font-medium text-brand-300 hover:bg-brand-600/30"
          >
            Try again
          </button>
        </div>
      )}
      {!loading && !error && filtered.length === 0 && (
        query ? (
          <div className="card-surface text-center">
            <p className="text-sm text-white/40">
              No users matching <span className="text-white/60">"{search}"</span>
            </p>
          </div>
        ) : (
          <EmptyState />
        )
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((user) => (
            <UserCard key={user.login} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
