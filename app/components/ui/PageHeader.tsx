"use client";

import { type ReactNode } from "react";

interface PageHeaderProps {
  /** Small tracked label above the title, e.g. "browse", "earn". */
  eyebrow: string;
  /** Eyebrow tint — cyan for live/data surfaces, purple for build/action. */
  eyebrowAccent?: "purple" | "cyan";
  /** Main heading. Pass a string, or a node for custom gradient spans. */
  title: ReactNode;
  /**
   * Optional muted lead-in rendered before the title in a lighter weight,
   * e.g. mutedPrefix="ALL" title="MARKETS" → "ALL MARKETS". Mirrors the
   * hero's "Ready to / Percolate?" two-tone headline treatment.
   */
  mutedPrefix?: string;
  /** Supporting line under the title. */
  subtitle?: ReactNode;
  /** Right-aligned actions (buttons, toggles). */
  actions?: ReactNode;
  /** Constrain + center; defaults to the hero's 1200px shell. */
  width?: "default" | "wide" | "full";
  className?: string;
}

const widthMap = {
  default: "max-w-[1200px]",
  wide: "max-w-7xl",
  full: "max-w-none",
};

/**
 * Canonical page header in the homepage-hero design language:
 *   • tracked sans eyebrow in a brand accent (replaces the old mono "// x")
 *   • heavy uppercase Plus-Jakarta display title with an optional muted lead-in
 *   • optional subtitle + right-aligned actions
 *
 * Use this on every route so headers read as one system.
 */
export function PageHeader({
  eyebrow,
  eyebrowAccent = "purple",
  title,
  mutedPrefix,
  subtitle,
  actions,
  width = "default",
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mx-auto w-full ${widthMap[width]} ${className}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className={`eyebrow ${eyebrowAccent === "cyan" ? "eyebrow--cyan" : ""} mb-4`}>
            {eyebrow}
          </div>
          <h1 className="font-jakarta uppercase tracking-tight text-white text-[clamp(2rem,5vw,3.25rem)] leading-[0.95]">
            {mutedPrefix && (
              <span className="font-light text-white/40">{mutedPrefix} </span>
            )}
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-white/65 font-inter [text-wrap:pretty]">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}
