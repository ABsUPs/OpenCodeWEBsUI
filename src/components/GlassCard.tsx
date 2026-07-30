/**
 * GlassCard — Reusable glassmorphism card component.
 *
 * PRD Design System (§5.1):
 *   background: rgba(255, 255, 255, 0.03–0.08)
 *   backdrop-filter: blur(12px)
 *   border: 1px solid rgba(255, 255, 255, 0.08–0.15)
 *   border-radius: 12px
 *
 * Usage:
 *   <GlassCard className="p-4">content</GlassCard>
 */

import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

export default function GlassCard({
  children,
  className = "",
  as: Tag = "div",
}: GlassCardProps) {
  return (
    <Tag
      className={`rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-[12px] transition-all duration-150 ${className}`}
    >
      {children}
    </Tag>
  );
}
