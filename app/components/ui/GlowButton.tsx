"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export function GlowButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: GlowButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  // Hover = clean color invert (outline → solid fill). No glow/press.
  const variantClasses = {
    primary: [
      "border border-[var(--accent)]/50 text-[var(--accent)] bg-transparent font-semibold",
      "",
      "hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]",
    ].join(" "),
    secondary: [
      "border border-[var(--border)] text-[var(--text)] bg-transparent font-medium",
      "",
      "hover:bg-[var(--text)] hover:text-[var(--bg)] hover:border-[var(--text)]",
    ].join(" "),
    ghost: [
      "bg-transparent text-[var(--text-secondary)] font-medium",
      "hover:text-[var(--text)] hover:bg-[var(--accent)]/[0.06]",
    ].join(" "),
  };

  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-lg",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:ring-offset-2 focus:ring-offset-[var(--bg)]",
        "disabled:opacity-40 disabled:pointer-events-none",
        sizeClasses[size],
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
