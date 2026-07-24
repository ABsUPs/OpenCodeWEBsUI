import { useEffect, useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Discussion {
  id: string;
  number: number;
  title: string;
  url: string;
  category: string;
  author: string;
  authorAvatar: string;
  replyCount: number;
  isAnswered: boolean;
  createdAt: string;
  labels: Array<{ name: string; color: string }>;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface ApiResponse {
  discussions: Discussion[];
  totalCount: number;
  pageInfo: PageInfo;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_COLORS: Record<string, string> = {
  Announcement: "bg-purple-500/20 text-purple-300",
  Ideas: "bg-emerald-500/20 text-emerald-300",
  Bug: "bg-red-500/20 text-red-300",
  Discussion: "bg-brand-600/20 text-brand-300",
  Tutorial: "bg-amber-500/20 text-amber-300",
  "Q&A": "bg-cyan-500/20 text-cyan-300",
  Poll: "bg-pink-500/20 text-pink-300",
  Show: "bg-orange-500/20 text-orange-300",
};

const DEFAULT_COLOR = "bg-white/10 text-white/50";

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="card-surface animate-pulse">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-8 w-8 shrink-0 rounded-full bg-white/5" />
        <div className="flex-1 space-y-2">
          {/* Category badge */}
          <div className="h-5 w-20 rounded-full bg-white/5" />
          {/* Title */}
          <div className="h-5 w-3/4 rounded bg-white/5" />
          {/* Meta row */}
          <div className="flex gap-3">
            <div className="h-3 w-24 rounded bg-white/5" />
            <div className="h-3 w-16 rounded bg-white/5" />
          </div>
        </div>
        {/* Reply count */}
        <div className="h-5 w-14 rounded bg-white/5" />
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Error banner                                                       */
/* ------------------------------------------------------------------ */

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="card-surface border-red-500/20 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-sm text-white/60">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-brand-600/20 px-4 py-2 text-sm font-medium text-brand-300 transition-colors hover:bg-brand-600/30"
      >
        Try again
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyState() {
  return (
    <div className="card-surface text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <svg className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      </div>
      <h3 className="text-base font-medium text-white/70">No discussions yet</h3>
      <p className="mt-1 text-sm text-white/40">
        Be the first to start a conversation!
      </p>
      <a
        href="https://github.com/ABsUPs/OpenCodeWEBsUI/discussions/new"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500"
      >
        Start a discussion
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Discussion card                                                    */
/* ------------------------------------------------------------------ */

function DiscussionCard({ discussion }: { discussion: Discussion }) {
  const categoryClass = CATEGORY_COLORS[discussion.category] ?? DEFAULT_COLOR;
  const timeAgo = formatRelativeTime(discussion.createdAt);

  return (
    <a
      href={discussion.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-surface group flex items-start gap-4 transition-all hover:border-brand-500/30"
    >
      {/* Author avatar */}
      {discussion.authorAvatar ? (
        <img
          src={discussion.authorAvatar}
          alt={discussion.author}
          className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-white/5"
          loading="lazy"
        />
      ) : (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs text-white/40">
          {discussion.author[0]?.toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* Top row: badges */}
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryClass}`}>
            {discussion.category}
          </span>
          {discussion.isAnswered && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Answered
            </span>
          )}
          {discussion.labels.map((label) => (
            <span
              key={label.name}
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${label.color}20`, color: `#${label.color}` }}
            >
              {label.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-base font-medium text-white/90 transition-colors group-hover:text-brand-400">
          {discussion.title}
        </h3>

        {/* Meta */}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/30">
          <span>by <span className="text-white/50">{discussion.author}</span></span>
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Reply count */}
      <div className="flex shrink-0 items-center gap-1.5 text-sm text-white/30">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
        </svg>
        <span>{discussion.replyCount}</span>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Relative time helper                                               */
/* ------------------------------------------------------------------ */

function formatRelativeTime(iso: string): string {
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
/*  Category filter                                                    */
/* ------------------------------------------------------------------ */

const ALL_CATEGORIES = [
  "All",
  "Announcement",
  "Ideas",
  "Discussion",
  "Bug",
  "Tutorial",
  "Q&A",
  "Poll",
  "Show",
] as const;

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function CommunityHub() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/discussions?first=30");
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${resp.status}`);
      }
      const data = (await resp.json()) as ApiResponse;
      setDiscussions(data.discussions);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load discussions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  // Derive categories from live data
  const availableCategories = [
    "All",
    ...new Set(discussions.map((d) => d.category)),
  ] as string[];

  const filtered =
    activeCategory === "All"
      ? discussions
      : discussions.filter((d) => d.category === activeCategory);

  const navCategories = availableCategories.length > 1 ? availableCategories : ALL_CATEGORIES;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Community <span className="text-brand-400">Hub</span>
            </h1>
            <p className="mt-2 text-sm text-white/40">
              {loading
                ? "Loading discussions…"
                : totalCount > 0
                  ? `${totalCount} discussion${totalCount === 1 ? "" : "s"} — powered by GitHub Discussions API`
                  : "Powered by GitHub Discussions API"}
            </p>
          </div>
          <a
            href="https://github.com/ABsUPs/OpenCodeWEBsUI/discussions/new"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500 sm:inline-flex"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Discussion
          </a>
        </div>
      </div>

      {/* Category filter tabs */}
      {!loading && !error && discussions.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {navCategories.map((cat) => {
            const count =
              cat === "All"
                ? discussions.length
                : discussions.filter((d) => d.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-brand-600/20 text-brand-300"
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                }`}
              >
                {cat}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content area */}
      {loading && <SkeletonList />}

      {!loading && error && <ErrorBanner message={error} onRetry={fetchDiscussions} />}

      {!loading && !error && discussions.length === 0 && <EmptyState />}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((discussion) => (
            <DiscussionCard key={discussion.id} discussion={discussion} />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-12 rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center text-sm text-white/30">
        <span>Powered by{" "}
          <a
            href="https://docs.github.com/en/graphql"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:underline"
          >
            GitHub GraphQL API
          </a>
          {" · "}
          <a
            href="https://github.com/ABsUPs/OpenCodeWEBsUI/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:underline"
          >
            View all on GitHub
          </a>
        </span>
      </div>

      {/* Mobile FAB */}
      <a
        href="https://github.com/ABsUPs/OpenCodeWEBsUI/discussions/new"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-500 sm:hidden"
        aria-label="Start a new discussion"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </a>
    </div>
  );
}
