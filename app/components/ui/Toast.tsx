"use client";

import { FC, useEffect, useRef, useState, useCallback } from "react";
import { useToastContext, type ToastItem } from "@/hooks/useToast";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const COLORS: Record<ToastItem["type"], { bg: string; border: string; icon: string }> = {
  success: { bg: "bg-[var(--long)]/10", border: "border-[var(--long)]/30", icon: "\u2713" },
  error: { bg: "bg-[var(--short)]/10", border: "border-[var(--short)]/30", icon: "\u2715" },
  info: { bg: "bg-[var(--accent)]/10", border: "border-[var(--accent)]/30", icon: "\u2139" },
  warning: { bg: "bg-[var(--warning)]/10", border: "border-[var(--warning)]/30", icon: "\u26A0" },
};

const TEXT_COLORS: Record<ToastItem["type"], string> = {
  success: "text-[var(--long)]",
  error: "text-[var(--short)]",
  info: "text-[var(--accent)]",
  warning: "text-[var(--warning)]",
};

const SingleToast: FC<{ item: ToastItem; onDismiss: (id: string) => void }> = ({
  item,
  onDismiss,
}) => {
  const [dismissing, setDismissing] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  const handleDismiss = useCallback(() => {
    if (prefersReduced) {
      onDismiss(item.id);
    } else {
      setDismissing(true);
    }
  }, [item.id, onDismiss, prefersReduced]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  useEffect(() => {
    if (dismissing) {
      const timer = setTimeout(() => {
        onDismiss(item.id);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [dismissing, item.id, onDismiss]);

  const c = COLORS[item.type];
  const animationClass = prefersReduced
    ? ""
    : (dismissing ? "animate-slide-out-toast" : "animate-slide-in-toast");

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-sm border px-4 py-3 shadow-lg bg-[var(--panel-bg)] ${c.border} ${animationClass}`}
    >
      <span className={`text-base font-bold ${TEXT_COLORS[item.type]}`}>{c.icon}</span>
      <span className="text-sm text-[var(--text)]">{item.message}</span>
      <button
        onClick={handleDismiss}
        className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastContainer: FC = () => {
  const { toasts, dismiss } = useToastContext();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInToast {
          0% { opacity: 0; transform: translate3d(40px, 0, 0) scale(0.95); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes slideOutToast {
          0% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
          100% { opacity: 0; transform: translate3d(40px, 0, 0) scale(0.95); }
        }
        .animate-slide-in-toast {
          animation: slideInToast 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-slide-out-toast {
          animation: slideOutToast 0.25s ease-in forwards;
        }
      `}} />
      <div className="pointer-events-none fixed right-4 top-20 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <SingleToast key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
};
