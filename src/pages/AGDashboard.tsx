import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
    [key: string]: unknown;
  }>;
  version: string;
}

export default function AGDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const session = new URLSearchParams(window.location.search).get(
        "session",
      );
      const headers: Record<string, string> = {};
      if (session) {
        headers["Authorization"] = `Bearer ${session}`;
      }

      const resp = await fetch("/api/ag/dashboard", { headers });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-400">
            OpenCodeWEBsAG
          </h1>
          <p className="mt-2 text-slate-400">
            Autonomous GitHub Bot — Dashboard
          </p>
        </div>

        {/* Install Button */}
        <div className="mb-8 flex justify-center">
          <a
            href="/api/ag/auth/login"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Install / Authorize GitHub App
          </a>
        </div>

        {/* Feature nav */}
        <div className="mb-6 flex justify-center">
          <Link
            to="/ag/features"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700/30 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-700/50 hover:text-emerald-200"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            View All Features
          </Link>
        </div>

        {/* Legal Links */}
        <div className="mb-8 flex justify-center gap-4">
          <Link
            to="/ag/privacy"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-emerald-600/50 hover:text-emerald-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Privacy Policy
          </Link>
          <Link
            to="/ag/terms"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-emerald-600/50 hover:text-emerald-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Terms of Service
          </Link>
          <Link
            to="/ag/license"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-emerald-600/50 hover:text-emerald-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            MIT License
          </Link>
        </div>

        {/* Status Card */}
        {loading && (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
            <div className="animate-pulse text-slate-400">
              Loading dashboard...
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-700 bg-red-900/20 p-4 text-red-400">
            Error: {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-200">
                Connection Status
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <span className="text-sm text-slate-500">App Status</span>
                  <p
                    className={`text-lg font-bold ${data.installationCount > 0 ? "text-green-400" : "text-yellow-400"}`}
                  >
                    {data.installationCount > 0
                      ? "Installed & Active"
                      : "Not installed"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Installations</span>
                  <p className="text-lg font-bold text-slate-200">
                    {data.installationCount}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Worker Status</span>
                  <p
                    className={`text-lg font-bold ${
                      data.workerStatus === "ok"
                        ? "text-green-400"
                        : data.workerStatus === "unknown"
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {data.workerStatus}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Version</span>
                  <p className="text-lg font-bold text-slate-200">
                    {data.version}
                  </p>
                </div>
              </div>
              {data.loggedIn && data.user && (
                <div className="mt-3 border-t border-slate-700 pt-3">
                  <span className="text-sm text-slate-500">Logged in as</span>
                  <p className="text-md font-semibold text-emerald-300">
                    @{data.user}
                  </p>
                </div>
              )}
            </div>

            {/* Installations */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-200">
                Installations
                {data.installationCount > 0 && (
                  <span className="ml-2 rounded-full bg-emerald-900/60 px-2.5 py-0.5 text-sm font-medium text-emerald-300">
                    {data.installationCount}
                  </span>
                )}
              </h2>
              {data.installations.length === 0 ? (
                <p className="text-slate-500">
                  No installations found. Click the button above to install the
                  GitHub App.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.installations.map((inst) => (
                    <div
                      key={inst.id as string}
                      className="rounded border border-slate-600 bg-slate-700/30 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-100">
                            {(inst.account as string) ?? "Unknown"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {(inst.accountType as string) ?? "—"} · ID:{" "}
                            <span className="font-mono text-emerald-300">
                              {inst.installationId as string}
                            </span>
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Installed:{" "}
                          {inst.installedAt
                            ? new Date(
                                inst.installedAt as string,
                              ).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
