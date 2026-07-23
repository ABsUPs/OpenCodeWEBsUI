import { Outlet, Link, useLocation } from "react-router-dom";
import Footer from "./Footer";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/T", label: "Templates" },
  { to: "/C", label: "Community" },
  { to: "/F", label: "Security" },
] as const;

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-surface/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="text-brand-400">OpenCode</span>
            <span className="text-white/40">ABsUI</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/ABsUPs/OpenCodeWEBsUI"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
              GitHub
            </a>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Mandatory branding footer */}
      <Footer />
    </div>
  );
}
