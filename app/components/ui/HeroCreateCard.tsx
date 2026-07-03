"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Hero product motif — a crisp, static mockup of the real "Create Market"
 * flow (token → leverage → fee → deploy). Structured product UI, brand-tinted,
 * no glow. The only motion is a subtle one-shot slider fill on mount.
 */

const Check = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const LockOpen = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

export function HeroCreateCard() {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 260);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="select-none">
      {/* header */}
      <div className="mb-5 flex items-center justify-between">
        <span className="eyebrow">Create Market</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
          <LockOpen /> Permissionless
        </span>
      </div>

      {/* token */}
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Token</div>
      <div className="glass-card-sm flex items-center gap-3 p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] text-[12px] font-bold text-[#0A0A0F]">W</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-white">WIF <span className="font-medium text-white/35">/ USD</span></div>
          <div className="truncate font-mono text-[11px] text-white/40">7xKXtg…Hjq9pump</div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#14F195]/[0.1] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#14F195]">
          <Check /> Detected
        </span>
      </div>

      {/* leverage */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Max Leverage</span>
          <span className="font-jakarta text-sm font-bold tabular-nums text-white">20x</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] transition-[width] duration-700 ease-out"
            style={{ width: filled ? "62%" : "0%" }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#14F195] bg-[#0A0A0F] transition-[left] duration-700 ease-out"
            style={{ left: filled ? "62%" : "0%" }}
          />
        </div>
      </div>

      {/* fee + margin */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="glass-card-sm p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Trading Fee</div>
          <div className="mt-1 font-jakarta text-base font-bold tabular-nums text-white">1.0%</div>
        </div>
        <div className="glass-card-sm p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Initial Margin</div>
          <div className="mt-1 font-jakarta text-base font-bold tabular-nums text-white">5%</div>
        </div>
      </div>

      {/* deploy */}
      <Link href="/create" tabIndex={-1} aria-hidden="true" className="cta cta--brand mt-5 w-full">
        Deploy Market
        <Arrow />
      </Link>

      <div className="mt-3 text-center text-[11px] text-white/45">
        You earn <span className="font-semibold text-[#14F195]">8%</span> of all trading fees
      </div>
    </div>
  );
}
