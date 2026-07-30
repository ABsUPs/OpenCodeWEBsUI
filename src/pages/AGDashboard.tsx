/**
 * OpenCodeWEBsAG Dashboard
 *
 * PRD Design System (§5):
 *   - Glassmorphism surfaces with backdrop-filter: blur()
 *   - Dark-first, emerald accent (#00D4AA), monochromatic grays
 *   - Responsive: mobile <640px | tablet 640-1024px | desktop >1024px
 *   - Micro-interactions: 150ms ease-out
 *
 * AG Bot Lifecycle Architecture (from OpenCodeWEBsAG PRD):
 *   1. OAuth & Permission Grant
 *   2. ABsUP Engine Routing & Push Enforcement
 *   3. Repository Ingress & Visibility Check
 *   4. Pre-Mutation Automated Backup Engine
 *   5. AST Audit, Bug Scanning & Todo Ledger
 *   6. Autonomous Self-Healing Repair & Dual-Author Commit
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../components/GlassCard";

/* ─── Types ─────────────────────────────────────────────────────────── */

interface DashboardData {
  loggedIn: boolean;
  installationCount: number;
  user: string | null;
  workerStatus: string;
  installations: Array<{
    id: string;
    installationId: string;
    installedAt: string;
    account: string;
    accountType: string;
    suspendedAt?: string | null;
    [key: string]: unknown;
  }>;
  version: string;
}

interface StageProps {
  number: number;
  title: string;
  description: string;
  active?: boolean;
}

/* ─── Pipeline Stages ───────────────────────────────────────────────── */

const PIPELINE_STAGES: StageProps[] = [
  {
    number: 1,
    title: "OAuth & Permission Grant",
    description:
      "User grants Full Admin, Code, Pages, Actions & Deploy scopes via pocwu.pages.dev. Bot exchanges code for User Access Token + 6-month Refresh Token.",
  },
  {
    number: 2,
    title: "ABsUP Engine Routing",
    description:
      "All code updates MUST route through the ABsUP Workflow Engine. Direct git push to GitHub is strictly prohibited — bypassing the pipeline triggers security protocols.",
  },
  {
    number: 3,
    title: "Repository Ingress & Visibility",
    description:
      "Bot intercepts Webhook Events (Push / Pull Request / Dispatch). Detects whether the target repository is Public or Private to determine backup strategy.",
  },
  {
    number: 4,
    title: "Pre-Mutation Backup Engine",
    description:
      "Public repos: Forks to backup namespace via API. Private repos: Creates immutable snapshot branch backup/opencode-ag-{timestamp}. Code is never altered without a restore point.",
  },
  {
    number: 5,
    title: "AST Audit & Bug Scanning",
    description:
      "Parses code AST for syntax errors, type mismatches, security flaws. Appends structured tasks & backup SHAs to OpenCodeWEBsPRD/ToDo.md with severity rankings and line-level references.",
  },
  {
    number: 6,
    title: "Self-Healing Repair & Dual-Author Commit",
    description:
      "Runs automated fix scripts via isolated fix/opencode-ag-* branch. Commits code with ABsUP as Primary Author and OpenCodeWEBsAG[bot] as Co-Author. Executes tests → Merges / Opens PR with summary ledger.",
  },
];

/* ─── SVG Icons (inline, no deps) ───────────────────────────────────── */

function IconGitHub({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
    </svg>
  );
}

/* ─── Dashboard Component ───────────────────────────────────────────── */

export default function AGDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const session = new URLSearchParams(window.location.search).get("session");
      const headers: Record<string, string> = {};
      if (session) {
        headers["Authorization"] = `Bearer ${session}`;
      }
      const resp = await fetch("/api/ag/dashboard", { headers });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = (await resp.json()) as DashboardData;
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ── Status helpers ────────────────────────────────────────────── */

  const statusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "text-emerald-400";
      case "unknown":
        return "text-amber-400";
      default:
        return "text-red-400";
    }
  };

  /* ── Render ────────────────────────────────────────────────────── */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070a]">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-[128px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/8 blur-[128px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* ─── Header Section ─────────────────────────────────────── */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20 backdrop-blur-sm">
              <IconGitHub className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              OpenCodeWEBsAG
            </h1>
          </div>
          <p className="text-sm text-white/40 sm:text-base">
            Enterprise Autonomous GitHub Bot — AI-Powered Code Lifecycle Engine
          </p>
        </div>

        {/* ─── Action Bar ─────────────────────────────────────────── */}
        <GlassCard className="mb-10 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/api/ag/auth/login"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-150 hover:bg-emerald-400 hover:shadow-emerald-400/30 active:scale-[0.97]"
            >
              <IconGitHub className="h-4 w-4" />
              Install / Authorize App
            </a>

            <Link
              to="/ag/features"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all duration-150 hover:border-emerald-500/30 hover:text-emerald-300"
            >
              <IconArrowRight className="h-4 w-4" />
              View All Features
            </Link>

            <a
              href="https://github.com/marketplace/opencodewebsag"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all duration-150 hover:border-white/20 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
              Marketplace
            </a>
          </div>
        </GlassCard>

        {/* ─── Status Grid ────────────────────────────────────────── */}
        {loading && (
          <GlassCard className="mb-10 p-8 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
            <p className="text-sm text-white/30">Loading dashboard…</p>
          </GlassCard>
        )}

        {error && (
          <GlassCard className="mb-10 border-red-500/20 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20">
                <span className="text-xs font-bold text-red-400">!</span>
              </div>
              <div>
                <p className="text-sm font-medium text-red-400">Connection Error</p>
                <p className="mt-1 text-xs text-red-300/60">{error}</p>
                <button
                  onClick={loadDashboard}
                  className="mt-2 text-xs font-medium text-red-400 underline underline-offset-2 transition-colors hover:text-red-300"
                >
                  Retry
                </button>
              </div>
            </div>
          </GlassCard>
        )}

        {data && (
          <>
            {/* ── Live Status Cards ───────────────────────────────── */}
            <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {([
                { label: "App Status", value: data.installationCount > 0 ? "Active" : "Inactive", color: data.installationCount > 0 ? "text-emerald-400" : "text-amber-400" },
                { label: "Installations", value: String(data.installationCount), color: "text-white" },
                { label: "Worker", value: data.workerStatus === "ok" ? "Online" : data.workerStatus, color: statusColor(data.workerStatus) },
                { label: "Version", value: data.version, color: "text-white" },
              ] as const).map((stat) => (
                <GlassCard key={stat.label} className="p-4 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">
                    {stat.label}
                  </p>
                  <p className={`mt-1.5 text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </GlassCard>
              ))}
            </div>

            {/* ── Logged-in user banner ───────────────────────────── */}
            {data.loggedIn && data.user && (
              <GlassCard className="mb-10 border-emerald-500/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                    <IconCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <p className="text-sm text-white/60">
                    Authenticated as{" "}
                    <span className="font-semibold text-emerald-300">@{data.user}</span>
                  </p>
                </div>
              </GlassCard>
            )}

            {/* ─── Pipeline Visualization ─────────────────────────── */}
            <div className="mb-10">
              <div className="mb-5 flex items-center gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
                  Bot Lifecycle Pipeline
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div className="relative">
                {/* Vertical connector line (desktop: hidden) */}
                <div className="absolute left-[19px] top-0 h-full w-px bg-gradient-to-b from-emerald-500/40 via-emerald-500/20 to-transparent max-sm:block sm:hidden" />

                <div className="flex flex-col gap-4 sm:flex-row sm:gap-0">
                  {PIPELINE_STAGES.map((stage, idx) => (
                    <div key={stage.number} className="flex-1 sm:relative sm:px-2">
                      {/* Horizontal connector (mobile: hidden) */}
                      {idx < PIPELINE_STAGES.length - 1 && (
                        <div className="absolute left-[42px] right-0 top-[19px] hidden h-px bg-gradient-to-r from-emerald-500/30 to-transparent sm:block" />
                      )}

                      <GlassCard className="relative p-4 transition-all duration-150 hover:border-emerald-500/20 sm:p-3">
                        {/* Number badge */}
                        <div className="mb-3 flex items-center gap-2 sm:mb-2">
                          <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 sm:h-[14px] sm:w-[14px] sm:text-[8px]">
                            {stage.number}
                          </div>
                          <h3 className="text-xs font-semibold text-white/80 sm:text-[11px]">
                            {stage.title}
                          </h3>
                        </div>

                        <p className="text-[11px] leading-relaxed text-white/40 sm:text-[10px]">
                          {stage.description}
                        </p>
                      </GlassCard>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Installations ──────────────────────────────────── */}
            <div className="mb-10">
              <div className="mb-5 flex items-center gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">
                  Installations
                </h2>
                {data.installationCount > 0 && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                    {data.installationCount}
                  </span>
                )}
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              {data.installations.length === 0 ? (
                <GlassCard className="p-6 text-center">
                  <p className="text-sm text-white/30">
                    No installations found. Click "Install / Authorize App" above to install the
                    GitHub App on your repositories.
                  </p>
                </GlassCard>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.installations.map((inst) => {
                    const account = inst.account as string;
                    const accountType = inst.accountType as string;
                    const instId = inst.installationId as string;
                    const installedAt = inst.installedAt as string;
                    const isSuspended = inst.suspendedAt != null;

                    return (
                      <GlassCard
                        key={inst.id as string}
                        className={`p-4 transition-all duration-150 hover:border-emerald-500/20 ${
                          isSuspended ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 shrink-0 rounded-full ${
                                  isSuspended ? "bg-amber-400" : "bg-emerald-400"
                                }`}
                              />
                              <span className="truncate text-sm font-semibold text-white/80">
                                {account}
                              </span>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/30">
                              <span>{accountType}</span>
                              <span className="hidden text-white/20 sm:inline">·</span>
                              <span className="font-mono text-emerald-400/60">
                                ID: {instId}
                              </span>
                              {isSuspended && (
                                <>
                                  <span className="text-white/20">·</span>
                                  <span className="text-amber-400/60">Suspended</span>
                                </>
                              )}
                            </div>
                          </div>
                          <a
                            href={`https://github.com/settings/installations/${instId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-md bg-white/[0.04] p-2 text-white/20 transition-colors hover:bg-white/[0.08] hover:text-emerald-400"
                            title="Manage installation"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                          </a>
                        </div>
                        {installedAt && (
                          <p className="mt-2 text-[10px] text-white/20">
                            Installed {new Date(installedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── Legal Footer ────────────────────────────────────────── */}
        <GlassCard className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              to="/ag/privacy"
              className="text-[11px] font-medium text-white/30 transition-colors hover:text-emerald-400"
            >
              Privacy Policy
            </Link>
            <span className="text-white/10">·</span>
            <Link
              to="/ag/terms"
              className="text-[11px] font-medium text-white/30 transition-colors hover:text-emerald-400"
            >
              Terms of Service
            </Link>
            <span className="text-white/10">·</span>
            <Link
              to="/ag/license"
              className="text-[11px] font-medium text-white/30 transition-colors hover:text-emerald-400"
            >
              MIT License
            </Link>
            <span className="text-white/10">·</span>
            <a
              href="https://github.com/OpenCodeWEB/AG"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/30 transition-colors hover:text-emerald-400"
            >
              <IconGitHub className="h-3 w-3" />
              Source
            </a>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
