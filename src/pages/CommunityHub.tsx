const DISCUSSIONS = [
  {
    id: 1,
    title: "Best practices for multi-agent orchestration?",
    category: "Discussion",
    author: "dev-lead",
    replies: 23,
    timeAgo: "2h ago",
  },
  {
    id: 2,
    title: "Bug: Sandbox isolation leaking between org sessions",
    category: "Bug",
    author: "security-researcher",
    replies: 8,
    timeAgo: "4h ago",
  },
  {
    id: 3,
    title: "Feature request: Custom agent role definitions",
    category: "Ideas",
    author: "enterprise-dev",
    replies: 45,
    timeAgo: "1d ago",
  },
  {
    id: 4,
    title: "How to deploy to Cloudflare Workers with zero cost",
    category: "Tutorial",
    author: "ABsUP",
    replies: 67,
    timeAgo: "3d ago",
  },
  {
    id: 5,
    title: "Announcing v1.0.0-EA release",
    category: "Announcement",
    author: "ABsUPs",
    replies: 112,
    timeAgo: "5d ago",
  },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Discussion: "bg-brand-600/20 text-brand-300",
  Bug: "bg-red-500/20 text-red-300",
  Ideas: "bg-emerald-500/20 text-emerald-300",
  Tutorial: "bg-amber-500/20 text-amber-300",
  Announcement: "bg-purple-500/20 text-purple-300",
};

export default function CommunityHub() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">
          Community <span className="text-brand-400">Hub</span>
        </h1>
        <p className="mt-3 text-white/40">
          Discussion forum powered directly by GitHub Discussions API.
        </p>
      </div>

      {/* Discussion list */}
      <div className="space-y-3">
        {DISCUSSIONS.map((discussion) => (
          <div
            key={discussion.id}
            className="card-surface flex cursor-pointer items-center justify-between transition-all hover:border-brand-500/30"
          >
            <div className="flex items-center gap-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  CATEGORY_COLORS[discussion.category] ?? "bg-white/10 text-white/50"
                }`}
              >
                {discussion.category}
              </span>
              <div>
                <div className="font-medium">{discussion.title}</div>
                <div className="mt-0.5 text-xs text-white/30">
                  by {discussion.author} · {discussion.timeAgo}
                </div>
              </div>
            </div>
            <div className="text-sm text-white/30">
              {discussion.replies} replies
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-12 rounded-lg border border-white/5 bg-white/[0.02] p-4 text-center text-sm text-white/30">
        Powered by GitHub Discussions API ·{" "}
        <a
          href="https://github.com/ABsUPs/OpenCodeWEBsUI/discussions"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 hover:underline"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}
