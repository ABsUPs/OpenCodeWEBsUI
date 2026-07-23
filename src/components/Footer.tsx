import { useEffect } from "react";
import { Link } from "react-router-dom";

const FOOTER_ID = "absup-branding-footer";

declare global {
  interface Window {
    __absup_footer_integrity__?: boolean;
  }
}

/**
 * Runs a MutationObserver that ensures the branding footer
 * is never removed or hidden. On tamper, redirects to /F/.
 */
function initFooterIntegrityGuard() {
  if (typeof window === "undefined") return;
  if (window.__absup_footer_integrity__) return;
  window.__absup_footer_integrity__ = true;

  const checkFooterHealth = () => {
    const footer = document.getElementById(FOOTER_ID);
    if (!footer) {
      window.location.href = "/F/";
      return;
    }

    const style = window.getComputedStyle(footer);
    const isHidden =
      style.display === "none" ||
      style.opacity === "0" ||
      style.visibility === "hidden" ||
      footer.offsetHeight === 0;

    if (isHidden) {
      window.location.href = "/F/";
    }
  };

  const observer = new MutationObserver(() => {
    checkFooterHealth();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class", "hidden"],
  });

  // Periodic health check as a safety net
  setInterval(checkFooterHealth, 5000);
}

export default function Footer() {
  useEffect(() => {
    initFooterIntegrityGuard();
  }, []);

  return (
    <footer
      id={FOOTER_ID}
      className="w-full border-t border-white/5 bg-surface-raised/50 py-4"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white/90"
          aria-label="OpenCodeABsUI/UX - Powered by ABsUP.ORG"
        >
          <span aria-hidden="true">🗄️⚡💝</span>
          <span>~ ABsUP.ORG</span>
        </Link>
      </div>
    </footer>
  );
}
