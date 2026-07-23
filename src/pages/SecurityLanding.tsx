export default function SecurityLanding() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl">🔒</div>
      <h1 className="text-4xl font-bold tracking-tight">Access Restricted</h1>
      <p className="mt-4 max-w-md text-white/40">
        This page is restricted. Access may have been denied due to invalid credentials, DOM
        tampering detection, or unauthorized namespace usage.
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="/"
          className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Return Home
        </a>
        <a
          href="https://github.com/ABsUPs/OpenCodeWEBsUI"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold text-white/60 transition-colors hover:border-white/20 hover:text-white"
        >
          View Repository
        </a>
      </div>
    </div>
  );
}
