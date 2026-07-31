import { useParams } from "react-router-dom";

export default function Sandbox() {
  const { org, project } = useParams<{ org: string; project: string }>();

  if (!org || !project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-white/40">Invalid sandbox path.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      {/* Sandbox header */}
      <div className="mb-12">
        <div className="mb-2 flex items-center gap-3">
          <span className="badge">Sandbox</span>
          <span className="badge bg-amber-500/20 text-amber-300">
            Preview Mode
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {org}/{project}
        </h1>
        <p className="mt-2 text-white/40">
          Isolated sandboxed runtime with auto-backup and preview pipeline.
        </p>
      </div>

      {/* Sandbox status */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="card-surface">
          <div className="text-sm text-white/40">Status</div>
          <div className="mt-1 text-lg font-semibold text-emerald-400">
            Running
          </div>
        </div>
        <div className="card-surface">
          <div className="text-sm text-white/40">Isolation</div>
          <div className="mt-1 text-lg font-semibold">Strict</div>
        </div>
        <div className="card-surface">
          <div className="text-sm text-white/40">Auto-Backup</div>
          <div className="mt-1 text-lg font-semibold text-brand-400">
            Enabled
          </div>
        </div>
      </div>

      {/* Preview area placeholder */}
      <div className="card-surface flex min-h-[400px] flex-col items-center justify-center">
        <div className="mb-4 text-4xl">🚀</div>
        <p className="text-lg font-medium">Live Preview</p>
        <p className="mt-2 max-w-md text-center text-sm text-white/40">
          Sandboxed preview will render here. Changes are applied in preview
          mode first, then published with explicit approval.
        </p>
        <button className="mt-6 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
          Publish to Live
        </button>
      </div>

      {/* Scope guardrail notice */}
      <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-sm text-amber-300/80">
          <span className="font-semibold">Scope Escalation Guardrail:</span> Any
          request to access filesystem paths outside the designated sandbox
          directory requires explicit human approval.
        </p>
      </div>
    </div>
  );
}
