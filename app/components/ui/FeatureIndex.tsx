"use client";

import { useState } from "react";
import { motion } from "motion/react";

/**
 * Purpose-Built Infrastructure — editorial feature index.
 * Left: numbered, type-led rows with hairline dividers — hover/tap sets
 * the active feature.
 * Right (lg+): a sticky boxless preview in the SAME editorial language —
 * no card, no chrome. A ghost numeral anchors the pane; each feature gets
 * a large related visual drawn directly on the canvas, structured only by
 * hairlines and type. Brand purple→cyan only.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Feature visuals — boxless, hairline-and-type only ── */

function VisualPermissionless() {
  const rows = [
    { cmd: "create --token $ANY", note: "no whitelist" },
    { cmd: "create --token $BONK", note: "no vote" },
    { cmd: "create --token $WIF", note: "no waiting" },
  ];
  return (
    <div className="flex h-full flex-col justify-center">
      {rows.map((r, i) => (
        <motion.div
          key={r.cmd}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.45, ease: EASE }}
          className="flex items-baseline justify-between border-b border-white/[0.07] py-4 last:border-b-0"
        >
          <span className="font-mono text-[12px] text-white/55">
            <span className="text-[#9945FF]">$</span> {r.cmd}
          </span>
          <span className="font-mono text-[11px] text-[#14F195]/70">{r.note} ✓</span>
        </motion.div>
      ))}
    </div>
  );
}

function VisualSpeed() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="font-jakarta text-[88px] font-bold leading-none tracking-tight text-white tabular-nums">
        60
        <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
          s
        </span>
      </div>
      <div className="mt-6 h-px w-full bg-white/[0.07]">
        <motion.div
          className="h-px origin-left bg-gradient-to-r from-[#9945FF] to-[#14F195]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-mono text-[11px] text-white/35">token mint</span>
        <span className="font-mono text-[11px] text-[#14F195]/70">live market</span>
      </div>
    </div>
  );
}

function VisualInsurance() {
  const bars = [22, 30, 26, 38, 44, 40, 52, 60, 56, 72, 84, 100];
  return (
    <div className="flex h-full flex-col justify-end">
      <div className="flex h-[160px] items-end gap-[7px]">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="w-full"
            style={{
              background: `color-mix(in srgb, #14F195 ${Math.round((i / (bars.length - 1)) * 100)}%, #9945FF)`,
              opacity: 0.35 + (i / (bars.length - 1)) * 0.6,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: 0.08 + i * 0.05, duration: 0.5, ease: EASE }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-baseline justify-between border-t border-white/[0.07] pt-3">
        <span className="font-mono text-[11px] text-white/35">fund balance</span>
        <span className="font-mono text-[11px] text-[#14F195]/70">every trade adds ↗</span>
      </div>
    </div>
  );
}

function VisualOnChain() {
  return (
    <div className="flex h-full flex-col justify-center">
      <div className="flex items-center">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span key={i} className="flex flex-1 items-center last:flex-none">
            <motion.span
              className="h-3 w-3 shrink-0"
              initial={{ opacity: 0.15, background: "rgba(255,255,255,0.15)" }}
              animate={{
                opacity: 1,
                background: `color-mix(in srgb, #14F195 ${Math.round((i / 6) * 100)}%, #9945FF)`,
              }}
              transition={{ delay: 0.12 + i * 0.11, duration: 0.3 }}
            />
            {i < 6 && (
              <motion.span
                className="h-px w-full origin-left bg-white/15"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.18 + i * 0.11, duration: 0.25 }}
              />
            )}
          </span>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.95, duration: 0.4 }}
        className="mt-8 flex items-baseline justify-between border-t border-white/[0.07] pt-3"
      >
        <span className="font-mono text-[11px] text-white/35">every state change</span>
        <span className="font-mono text-[11px] text-[#14F195]/70">finalized on solana</span>
      </motion.div>
    </div>
  );
}

function VisualBurnKey() {
  const rows = [
    { k: "upgrade_authority", v: "revoked", dim: true },
    { k: "fee_override", v: "revoked", dim: true },
    { k: "admin_key", v: "burned ✓", dim: false },
  ];
  return (
    <div className="flex h-full flex-col justify-center">
      {rows.map((r, i) => (
        <motion.div
          key={r.k}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + i * 0.14, duration: 0.45, ease: EASE }}
          className="flex items-baseline justify-between border-b border-white/[0.07] py-4 last:border-b-0"
        >
          <span className="font-mono text-[12px] text-white/45">{r.k}</span>
          <span
            className={
              r.dim
                ? "font-mono text-[12px] text-white/30 line-through"
                : "font-mono text-[12px] font-semibold text-[#14F195]"
            }
          >
            {r.v}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function VisualGuard() {
  const pts = "0,58 24,52 48,55 72,44 96,48 120,34 144,40 168,26 192,31 216,18 240,24 264,12 288,16";
  return (
    <div className="flex h-full flex-col justify-center">
      <svg viewBox="0 0 288 70" className="block h-[110px] w-full" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="62" x2="288" y2="62" stroke="#9945FF" strokeWidth="1" strokeDasharray="4 5" opacity="0.55" />
        <motion.polyline
          points={pts}
          fill="none"
          stroke="#14F195"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          initial={{ strokeDasharray: 1, strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
        />
      </svg>
      <div className="mt-3 flex items-baseline justify-between border-t border-white/[0.07] pt-3">
        <span className="font-mono text-[11px] text-white/35">margin health</span>
        <span className="font-mono text-[11px] text-[#9945FF]/80">liquidation threshold</span>
      </div>
    </div>
  );
}

/* ── Feature data ── */

interface Feature {
  no: string;
  title: string;
  desc: string;
  kicker: string;
  visual: React.ComponentType;
}

const FEATURES: Feature[] = [
  {
    no: "01",
    title: "No permission needed",
    kicker: "Permissionless",
    desc: "No governance votes, no whitelists, no waiting. Anyone can deploy a perpetual market for any Solana token.",
    visual: VisualPermissionless,
  },
  {
    no: "02",
    title: "Deploy in sixty seconds",
    kicker: "Speed",
    desc: "From token mint to live, tradable market in about a minute. Smart defaults handle the details.",
    visual: VisualSpeed,
  },
  {
    no: "03",
    title: "Insurance fund",
    kicker: "Solvency",
    desc: "Every trade adds to it. Your market stays solvent even when traders get liquidated.",
    visual: VisualInsurance,
  },
  {
    no: "04",
    title: "Fully on-chain",
    kicker: "Transparency",
    desc: "Every trade, liquidation, and funding payment settles on Solana. Nothing custodial, ever.",
    visual: VisualOnChain,
  },
  {
    no: "05",
    title: "Burn the admin key",
    kicker: "Immutable",
    desc: "One click and the market is immutable forever. Your market, your rules, permanently secured by code.",
    visual: VisualBurnKey,
  },
  {
    no: "06",
    title: "Liquidation guard",
    kicker: "Risk engine",
    desc: "Fully automated on-chain liquidations keep liquidity providers safe from bad-debt accumulation.",
    visual: VisualGuard,
  },
];

export function FeatureIndex() {
  const [active, setActive] = useState(0);

  return (
    <div className="mx-auto max-w-4xl">
      {/* ── Index rows ── */}
      <div className="border-t border-white/10">
        {FEATURES.map((item, i) => {
          const isActive = i === active;
          const Visual = item.visual;
          return (
            <button
              key={item.no}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-expanded={isActive}
              className="group relative block w-full border-b border-white/10 text-left focus-visible:outline-none"
            >
              {isActive && (
                <motion.span
                  layoutId="feature-index-active"
                  className="absolute inset-y-0 -left-5 w-px bg-[#14F195] sm:-left-8"
                  transition={{ type: "spring", stiffness: 380, damping: 38 }}
                />
              )}

              <motion.div
                className="flex items-baseline gap-6 py-6 sm:gap-9"
                animate={{ x: isActive ? 6 : 0 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <span
                  className={`font-mono text-[13px] tabular-nums transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive ? "text-[#14F195]" : "text-white/30"
                  }`}
                >
                  {item.no}
                </span>
                <span
                  className={`font-jakarta text-2xl font-semibold tracking-tight transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-3xl ${
                    isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                  }`}
                >
                  {item.title}
                </span>
                <span
                  className={`ml-auto hidden shrink-0 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:block ${
                    isActive ? "text-[#9945FF]" : "text-white/25"
                  }`}
                >
                  {item.kicker}
                </span>
              </motion.div>

              {/* inline reveal (all viewports; primary reading path on mobile) */}
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-xl pb-7 pl-[calc(1.5rem+13px)] text-base leading-relaxed text-white/55 sm:pl-[calc(2.25rem+13px)] [text-wrap:pretty]">
                    {item.desc}
                  </p>
                  <div className="h-[210px] pb-7 pl-[calc(1.5rem+13px)] pr-6">
                    {isActive && <Visual />}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
