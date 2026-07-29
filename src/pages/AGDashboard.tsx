import { useState, useEffect } from "react";

interface DashboardData {
  loggedIn: boolean;
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
      const session = new URLSearchParams(window.location.search).get("session");
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

        {/* Status Card */}
        {loading && (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
            <div className="animate-pulse text-slate-400">Loading dashboard...</div>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-sm text-slate-500">Auth Status</span>
                  <p
                    className={`text-lg font-bold ${data.loggedIn ? "text-green-400" : "text-yellow-400"}`}
                  >
                    {data.loggedIn ? "Authenticated" : "Not logged in"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">User</span>
                  <p className="text-lg font-bold text-slate-200">
                    {data.user ?? "—"}
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
            </div>

            {/* Installations */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-200">
                Installations
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
                                inst.installedAt as string
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
