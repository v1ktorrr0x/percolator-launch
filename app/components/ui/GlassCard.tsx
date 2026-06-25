"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glow?: boolean;
  hover?: boolean;
  accent?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  /**
   * "glass" (default) — the homepage-hero surface: soft translucent black,
   * hairline border, inner top highlight, tinted depth, rounded-xl.
   * "terminal" — the legacy sharp panel (rounded-sm + hud-corners) for
   * dense data contexts that still want the original terminal edge.
   */
  variant?: "glass" | "terminal";
}

const paddingMap = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { children, glow = false, hover = true, accent = false, padding = "md", variant = "glass", className = "", ...props },
    ref,
  ) => {
    const terminal = variant === "terminal";
    return (
      <div
        ref={ref}
        className={[
          terminal ? "rounded-sm border border-[var(--border)] bg-[var(--panel-bg)] hud-corners" : "glass-card",
          terminal
            ? hover ? "transition-all duration-200 hover:border-[var(--accent)]/20" : ""
            : hover ? "glass-card--hover" : "",
          glow ? "shadow-[0_0_40px_-12px_rgba(153,69,255,0.30)]" : "",
          accent ? "accent-top overflow-hidden" : "",
          paddingMap[padding],
          className,
        ].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlassCard.displayName = "GlassCard";
