"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { getSupabase } from "@/lib/supabase";
import { getConfig } from "@/lib/config";
import { isMockMode } from "@/lib/mock-mode";
import { MOCK_SLAB_ADDRESSES, getMockMarketData } from "@/lib/mock-trade-data";
import { isActiveMarket, isSaneMarketValue } from "@/lib/activeMarketFilter";
import { isBlockedSlab } from "@/lib/blocklist";
import { isPhantomOpenInterest } from "@/lib/phantom-oi";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientText } from "@/components/ui/GradientText";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { OnboardingIcon } from "@/components/icons/OnboardingIcons";
import { ShimmerSkeleton } from "@/components/ui/ShimmerSkeleton";
import { formatUsdFromNumber } from "@/lib/format";

// Dynamic import for wallet connect button to prevent hydration mismatch
const ConnectButton = dynamic(
  () => import("@/components/wallet/ConnectButton").then((m) => m.ConnectButton),
  { ssr: false }
);

const MagicScrollStack = dynamic(
  () => import("@/components/ui/MagicScrollStack"),
  { ssr: false }
);

// Inline SVGs for lightweight, zero-dependency icon rendering
const AwardIcon = () => (
  <svg className="w-4 h-4 text-[#9945FF] inline-block mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const ArrowUpRight = () => (
  <svg className="w-3.5 h-3.5 text-white ml-1 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const HOW_STEPS = [
  {
    number: "01",
    title: "Paste a Token Address",
    desc: "Any Solana token. We auto-detect everything. No approval needed.",
    brandIcon: "perps" as const,
  },
  {
    number: "02",
    title: "Set Your Terms",
    desc: "Leverage, fees, initial liquidity. Smart defaults if you don't care.",
    brandIcon: "onchain" as const,
  },
  {
    number: "03",
    title: "Market Goes Live",
    desc: "Your market is deployed instantly on-chain. Share the link. Done.",
    brandIcon: "deploy" as const,
  },
];

/** Format large numbers compactly: 1.2T / 3.4B / 5.6M / 7.8K */
function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(1)}T`;
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

function isValidSymbol(s: string | null | undefined): s is string {
  return typeof s === "string" && /^[A-Z]{1,10}$/.test(s);
}

function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticked = false;
    const handleScroll = () => {
      if (!ticked) {
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) {
            ticked = false;
            return;
          }
          const rect = sectionRef.current.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const elementTop = rect.top + scrollTop;
          const elementHeight = rect.height;
          const windowHeight = window.innerHeight;

          const scrollStart = elementTop;
          const scrollEnd = elementTop + elementHeight - windowHeight;
          const currentScroll = scrollTop;

          let progress = 0;
          if (currentScroll > scrollStart) {
            if (scrollEnd > scrollStart) {
              progress = (currentScroll - scrollStart) / (scrollEnd - scrollStart);
            } else {
              progress = 1;
            }
          }
          progress = Math.max(0, Math.min(1, progress));
          setScrollProgress(progress);
          ticked = false;
        });
        ticked = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Helper to interpolate smooth metrics for cards & dots based on scroll progress
  const getStepMetrics = (idx: number, progress: number) => {
    const ranges = [
      { start: 0.0, end: 0.25, rotate: -0.5 },
      { start: 0.25, end: 0.60, rotate: 0.5 },
      { start: 0.60, end: 0.90, rotate: -0.5 },
    ];

    const range = ranges[idx];
    let t = 0;
    if (progress > range.end) {
      t = 1;
    } else if (progress >= range.start) {
      t = (progress - range.start) / (range.end - range.start);
    }

    // Cubic ease-out for extra smooth and natural curve
    const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
    const easedT = easeOutCubic(t);

    return {
      opacity: 0.15 + easedT * 0.85, // from 0.15 (darker inactive state) to 1.0
      scale: 0.95 + easedT * 0.05,  // subtle scale-up from 0.95 to 1.0
      rotate: easedT * range.rotate, // gentle rotation tilt
      yOffset: (1 - easedT) * 12,    // slide up 12px
      dotOpacity: easedT * 0.75,     // glow dot opacity from 0 to 0.75
      dotScale: easedT * 1.15,       // glow dot scale from 0 to 1.15
      easedT
    };
  };

  const step1 = getStepMetrics(0, scrollProgress);
  const step2 = getStepMetrics(1, scrollProgress);
  const step3 = getStepMetrics(2, scrollProgress);

  return (
    <section ref={sectionRef} className="relative h-[150vh] sm:h-[180vh] select-text">
      {/* Sticky viewport lock */}
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden py-12">
        <div className="mx-auto w-full max-w-[1200px] px-6">
          {/* Centered static title header */}
          <div className="mb-12 lg:mb-16 text-center">
            <div className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[#14F195]/80">
              how it works
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white font-jakarta">
              Three steps. <span className="font-normal text-white/50">Sixty seconds.</span>
            </h2>
          </div>

          {/* Timeline Container */}
          <div className="relative flex items-stretch h-[540px] sm:h-[600px] w-full max-w-[540px] sm:max-w-[620px] mx-auto select-none">
            {/* Linear Gradient definitions for SVG */}
            <svg className="absolute w-0 h-0">
              <defs>
                <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9945FF" />
                  <stop offset="100%" stopColor="#14F195" />
                </linearGradient>
              </defs>
            </svg>

            {/* Left Column: Straight Timeline Line SVG */}
            <div className="relative flex items-stretch h-full" style={{ width: "60px" }}>
              <svg width="60" height="100%" viewBox="0 0 60 680" preserveAspectRatio="none" fill="none" className="shrink-0">
                <path d="M 30 0 L 30 680" stroke="#1C1F2E" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" fill="none" />
                <path
                  d="M 30 0 L 30 680"
                  stroke="url(#line-gradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="680"
                  strokeDashoffset={680 * (1 - scrollProgress)}
                  opacity="0.9"
                  className="transition-all duration-300 ease-out"
                />
              </svg>

              {/* Timeline Interactive Dots and Connecting horizontal lines */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Step 1: 15% Y, X = 30px, line width = 50px */}
                <div>
                  <div className="absolute h-px bg-white/10" style={{ left: "30px", top: "15%", width: "50px", transform: "translateY(-50%)" }} />
                  <div className="absolute rounded-full" style={{ left: "30px", top: "15%", width: "12px", height: "12px", background: "#0A0A0F", border: "2px solid #1C1F2E", transform: "translate(-50%, -50%)" }} />
                  <div
                    className="absolute rounded-full transition-all duration-300"
                    style={{
                      left: "30px",
                      top: "15%",
                      width: "12px",
                      height: "12px",
                      background: "#14F195",
                      border: "2px solid #14F195",
                      opacity: step1.dotOpacity,
                      transform: `translate(-50%, -50%) scale(${step1.dotScale})`
                    }}
                  />
                </div>

                {/* Step 2: 50% Y, X = 30px, line width = 50px */}
                <div>
                  <div className="absolute h-px bg-white/10" style={{ left: "30px", top: "50%", width: "50px", transform: "translateY(-50%)" }} />
                  <div className="absolute rounded-full" style={{ left: "30px", top: "50%", width: "12px", height: "12px", background: "#0A0A0F", border: "2px solid #1C1F2E", transform: "translate(-50%, -50%)" }} />
                  <div
                    className="absolute rounded-full transition-all duration-300"
                    style={{
                      left: "30px",
                      top: "50%",
                      width: "12px",
                      height: "12px",
                      background: "#9945FF",
                      border: "2px solid #9945FF",
                      opacity: step2.dotOpacity,
                      transform: `translate(-50%, -50%) scale(${step2.dotScale})`
                    }}
                  />
                </div>

                {/* Step 3: 85% Y, X = 30px, line width = 50px */}
                <div>
                  <div className="absolute h-px bg-white/10" style={{ left: "30px", top: "85%", width: "50px", transform: "translateY(-50%)" }} />
                  <div className="absolute rounded-full" style={{ left: "30px", top: "85%", width: "12px", height: "12px", background: "#0A0A0F", border: "2px solid #1C1F2E", transform: "translate(-50%, -50%)" }} />
                  <div
                    className="absolute rounded-full transition-all duration-300"
                    style={{
                      left: "30px",
                      top: "85%",
                      width: "12px",
                      height: "12px",
                      background: "#14F195",
                      border: "2px solid #14F195",
                      opacity: step3.dotOpacity,
                      transform: `translate(-50%, -50%) scale(${step3.dotScale})`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Absolutely Positioned Step Cards with Transitions */}
            <div className="relative flex-1 min-w-0">
              {HOW_STEPS.map((step, idx) => {
                const positions = [
                  { top: "15%", left: "20px", rotate: "-0.5deg", trigger: 0.15 },
                  { top: "50%", left: "20px", rotate: "0.5deg", trigger: 0.50 },
                  { top: "85%", left: "20px", rotate: "-0.5deg", trigger: 0.85 }
                ];
                const pos = positions[idx];
                const metrics = idx === 0 ? step1 : idx === 1 ? step2 : step3;
                const isInteractable = scrollProgress >= pos.trigger;

                return (
                  <div
                    key={step.number}
                    className="absolute origin-left w-[260px] xs:w-[300px] sm:w-[420px] transition-all duration-300 ease-out"
                    style={{
                      top: pos.top,
                      left: pos.left,
                      transform: `translateY(calc(-50% + ${metrics.yOffset}px)) rotate(${metrics.rotate}deg) scale(${metrics.scale})`,
                      opacity: metrics.opacity,
                      pointerEvents: isInteractable ? "auto" : "none"
                    }}
                  >
                    <article
                      className="group relative bg-black/40 backdrop-blur-md p-6 border border-white/10 rounded-xl hover:border-[#9945FF]/40 hover:scale-[1.02] transition-all duration-300 w-full overflow-hidden"
                      style={{ boxShadow: `0 10px 30px -10px rgba(153, 69, 255, ${metrics.easedT * 0.15})` }}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#9945FF]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-3.5 relative z-10">
                        <span className="text-sm sm:text-base font-bold tracking-wider text-white uppercase">{step.title}</span>
                        <span className="text-xs font-mono font-bold text-[#14F195] opacity-60 uppercase">{step.number}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-inter relative z-10">{step.desc}</p>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [stats, setStats] = useState({ markets: 0, volume: 0, insurance: 0 });
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [featured, setFeatured] = useState<{ slab_address: string; symbol: string | null; volume_24h: number; last_price: number | null; total_open_interest: number }[]>([]);
  const [network] = useState<"mainnet" | "devnet">(() => getConfig().network as "mainnet" | "devnet");

  useEffect(() => {
    async function loadStats() {
      // In mock mode, use synthetic data instead of Supabase
      if (isMockMode() || process.env.NODE_ENV === "development") {
        const mockFeatured = MOCK_SLAB_ADDRESSES.slice(0, 5).map((addr) => {
          const m = getMockMarketData(addr);
          if (!m) return null;
          const vol = Math.round(m.priceUsd * Number(m.oi) / 1_000_000 * 0.1);
          return {
            slab_address: addr,
            symbol: m.symbol,
            volume_24h: vol,
            last_price: m.priceUsd,
            total_open_interest: Math.round(Number(m.oi) / 1_000_000 * m.priceUsd),
          };
        }).filter(Boolean) as typeof featured;

        setStats({
          markets: MOCK_SLAB_ADDRESSES.length,
          volume: mockFeatured.reduce((s, m) => s + m.volume_24h, 0),
          insurance: 63200,
        });
        setStatsLoaded(true);
        setFeatured(mockFeatured);
        return;
      }

      try {
        let [{ data, error: dbError }, apiStatsRes] = await Promise.all([
          getSupabase().from("markets_with_stats").select("slab_address, symbol, volume_24h, insurance_balance, insurance_fund, last_price, total_open_interest, open_interest_long, open_interest_short, decimals, vault_balance, total_accounts").neq("indexer_excluded", true),
          fetch("/api/stats").then((r) => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (dbError && dbError.message?.includes("indexer_excluded")) {
          console.warn("[homepage] indexer_excluded column missing — retrying without filter");
          const retry = await getSupabase().from("markets_with_stats").select("slab_address, symbol, volume_24h, insurance_balance, insurance_fund, last_price, total_open_interest, open_interest_long, open_interest_short, decimals, vault_balance, total_accounts");
          data = retry.data;
          dbError = retry.error;
        }
        const apiTotalMarkets: number | null = (apiStatsRes && typeof apiStatsRes.totalMarkets === "number") ? apiStatsRes.totalMarkets : null;
        if (dbError) {
          console.error("Failed to query markets_with_stats:", dbError.message);
          throw new Error(dbError.message);
        }
        if (data && data.length > 0) {
          const MAX_PER_MARKET_USD = 10_000_000_000;
          const MAX_SANE_PRICE_USD = 10_000;
          const toUsd = (raw: number, decimals: number | null, price: number | null): number => {
            if (!isSaneMarketValue(raw)) return 0;
            const d = Math.min(Math.max(decimals ?? 6, 0), 18);
            const p = (price != null && price > 0 && price <= MAX_SANE_PRICE_USD) ? price : 0;
            if (p <= 0) return 0;
            const usd = (raw / 10 ** d) * p;
            return usd > MAX_PER_MARKET_USD ? 0 : usd;
          };
          const toUsdWithFallback = (raw: number, decimals: number | null, price: number | null): number => {
            if (!isSaneMarketValue(raw)) return 0;
            const d = Math.min(Math.max(decimals ?? 6, 0), 18);
            const p = (price != null && price > 0 && price <= MAX_SANE_PRICE_USD) ? price : 0;
            const usd = p > 0 ? (raw / 10 ** d) * p : raw / 10 ** d;
            return usd > MAX_PER_MARKET_USD ? 0 : usd;
          };

          const phantomAwareData = data.map((m) => {
            const accountsCount = m.total_accounts ?? 0;
            const vaultBal = m.vault_balance ?? 0;
            const isPhantom = isPhantomOpenInterest(accountsCount, vaultBal);
            if (!isPhantom) return m;
            return { ...m, total_open_interest: 0, open_interest_long: 0, open_interest_short: 0, last_price: null };
          });

          const activeData = phantomAwareData
            .filter((m) => !isBlockedSlab(m.slab_address))
            .filter(isActiveMarket);

          setStats({
            markets: apiTotalMarkets ?? activeData.length,
            volume: activeData.reduce((s, m) => {
              const usd = toUsd(Number(m.volume_24h || 0), m.decimals, m.last_price);
              return usd > 10_000_000 ? s : s + usd;
            }, 0),
            insurance: activeData.reduce((s, m) => {
              const raw = Number(m.insurance_fund ?? m.insurance_balance ?? 0);
              if (!isSaneMarketValue(raw)) return s;
              if (raw > 1e13) return s;
              return s + toUsdWithFallback(raw, m.decimals, m.last_price);
            }, 0),
          });
          setStatsLoaded(true);

          const converted = phantomAwareData
            .filter((m) => m.slab_address != null)
            .filter((m) => !isBlockedSlab(m.slab_address!))
            .filter(isActiveMarket)
            .filter((m) => m.last_price != null && m.last_price > 0 && m.last_price <= MAX_SANE_PRICE_USD)
            .map((m) => ({
              slab_address: m.slab_address!,
              symbol: m.symbol,
              volume_24h: (() => {
                const usd = toUsd(Number(m.volume_24h || 0), m.decimals, m.last_price);
                return usd > 10_000_000 ? 0 : usd;
              })(),
              last_price: (m.last_price != null && m.last_price > 0 && m.last_price <= MAX_SANE_PRICE_USD) ? m.last_price : null,
              total_open_interest: toUsd(Number(m.total_open_interest ?? ((m.open_interest_long ?? 0) + (m.open_interest_short ?? 0))), m.decimals, m.last_price),
            }));

          const sorted = converted.sort((a, b) => {
            const volDiff = b.volume_24h - a.volume_24h;
            return volDiff !== 0 ? volDiff : b.total_open_interest - a.total_open_interest;
          }).slice(0, 5);
          setFeatured(sorted);
        }
      } catch (err) {
        console.error("Failed to load market stats:", err);
        setStatsLoaded(false);
      }
    }
    loadStats();
  }, []);

  const hasMarkets = featured.length > 0 && featured.some((m) => m.volume_24h > 0 || m.total_open_interest > 0);

  return (
    <div className="relative z-20 flex flex-col min-h-screen pt-14">
      {/* ── Scrolling Content wrapper ── */}

        {/* ── 1. Hero & Stats Bento Grid Section ── */}
        <ErrorBoundary label="Stats Section">
        <section className="relative flex min-h-screen items-center pl-6 sm:pl-12 lg:pl-20 pr-6 py-12 select-text">
          <div className="w-full select-text">
            
            {/* Left Box: Main Hero Pitch */}
            <div className="flex flex-col max-w-4xl pl-0">
              {/* Headline (Stagger 0s) */}
              <h1 className="animate-fade-up font-jakarta text-white uppercase leading-[0.9] tracking-tighter text-[clamp(3.2rem,8.5vw,6.5rem)]">
                <span className="block">Any Token.</span>
                <span className="block">Any Market.</span>
                <span className="block bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                  Permissionless.
                </span>
              </h1>

              {/* Description (Stagger 0.2s) */}
              <p className="animate-fade-up-delay-1 text-white/75 text-sm sm:text-base lg:text-lg font-inter leading-relaxed max-w-xl mt-6 lg:mt-8">
                Deploy a perpetual futures market for <strong className="text-white font-bold">any Solana token</strong>. No permission. <strong className="text-[#9945FF] font-bold">No admin key</strong>. No gatekeepers. Earn <strong className="text-[#14F195] font-bold">8% of all trading fees</strong> as the market creator.
              </p>

              {/* Actions Row (Stagger 0.4s) */}
              <div className="animate-fade-up-delay-2 flex flex-wrap items-center gap-4 sm:gap-6 mt-8 lg:mt-10">
                <Link
                  href="/create"
                  className="bg-white text-black font-inter px-6 sm:px-8 py-3.5 sm:py-4 text-xs tracking-[0.15em] font-semibold uppercase flex items-center gap-2 group transition-all hover:bg-[#9945FF] hover:text-white min-h-[48px]"
                >
                  Launch Market
                  <ArrowUpRight />
                </Link>

                <Link
                  href="/markets"
                  className="border border-white/20 hover:border-[#14F195] hover:text-[#14F195] text-white font-inter px-6 sm:px-8 py-3.5 sm:py-4 text-xs tracking-[0.15em] font-semibold uppercase flex items-center gap-2 group transition-all min-h-[48px]"
                >
                  Trade Now
                </Link>
              </div>
            </div>

          </div>
        </section>         </ErrorBoundary>

        {/* ── 3. How It Works Section ── */}
        <ErrorBoundary label="How It Works Section">
          <HowItWorksSection />
        </ErrorBoundary>

        {/* ── 4. Purpose-Built Infrastructure (Features) ── */}
        <ErrorBoundary label="Features Section">
          <section className="relative px-6 py-16 md:py-28 select-text">
            <div className="mx-auto max-w-[1200px]">
              <ScrollReveal noSafetyNet={true} className="sticky top-20 md:top-28 z-20">
                <div className="mb-12 lg:mb-16 text-center">
                  <div className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[#9945FF]/80">
                    architecture
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white font-jakarta">
                    Purpose-Built <GradientText variant="muted">Infrastructure</GradientText>
                  </h2>
                </div>
              </ScrollReveal>

              <MagicScrollStack />
            </div>
          </section>
        </ErrorBoundary>

        {/* ── 5. Active Markets Section ── */}
        {hasMarkets && (
          <ErrorBoundary label="Featured Markets Section">
            <section className="relative px-6 py-16 md:py-28 select-text">
              <div className="mx-auto max-w-[1200px]">
                <ScrollReveal noSafetyNet={true}>
                  <div className="mb-12 lg:mb-16 text-center">
                    <div className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[#14F195]/80">
                      live data
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white font-jakarta">
                      Active Markets
                    </h2>
                  </div>

                  <div className="overflow-x-auto border border-white/10 bg-black/40 backdrop-blur-md rounded">
                    <div className="grid min-w-[560px] grid-cols-5 gap-4 border-b border-white/10 bg-white/[0.02] px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white/50 font-inter">
                      <div>Token</div>
                      <div className="text-right">Price</div>
                      <div className="text-right">Volume</div>
                      <div className="text-right">OI</div>
                      <div className="text-right">Status</div>
                    </div>
                    {featured.map((m) => (
                      <Link
                        key={m.slab_address}
                        href={`/trade/${m.slab_address}`}
                        className="group relative grid min-w-[560px] grid-cols-5 gap-4 border-b border-white/5 px-8 py-5 text-sm sm:text-base transition-all duration-150 last:border-b-0 hover:bg-[#9945FF]/5 min-h-[60px]"
                        aria-label={`Trade ${isValidSymbol(m.symbol) ? `${m.symbol}/USD` : `market ${m.slab_address.slice(0, 6)}`}`}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#9945FF] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                        <div className="text-sm sm:text-base font-bold text-white font-inter">
                          {isValidSymbol(m.symbol) ? `${m.symbol}/USD` : `${m.slab_address.slice(0, 6)}...`}
                        </div>
                        <div className="text-right text-[13px] sm:text-sm text-white/70 font-mono">
                          {formatUsdFromNumber(m.last_price)}
                        </div>
                        <div className="text-right text-[13px] sm:text-sm text-white/70 font-mono">
                          {m.volume_24h > 0 ? formatCompact(m.volume_24h) : "—"}
                        </div>
                        <div className="text-right text-[13px] sm:text-sm text-white/70 font-mono">
                          {m.total_open_interest > 0 ? formatCompact(m.total_open_interest) : "—"}
                        </div>
                        {m.last_price != null ? (
                          <div className="text-right text-[12px] sm:text-xs text-[#14F195] font-bold font-inter">LIVE</div>
                        ) : (
                          <div className="text-right text-[12px] sm:text-xs text-yellow-500 font-bold font-inter animate-pulse">NO ORACLE</div>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-10 text-center">
                    <Link
                      href="/markets"
                      className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.15em] text-white/40 transition-colors hover:text-[#9945FF]"
                    >
                      View All Markets
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </ScrollReveal>
              </div>
            </section>
          </ErrorBoundary>
        )}

        {/* ── 6. Bottom CTA Section ── */}
        <section className="relative px-6 py-20 md:py-32 select-text">
          <ScrollReveal noSafetyNet={true}>
            <div className="relative z-10 mx-auto max-w-[1200px] text-center">
              <div className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[#9945FF]/80">
                deploy
              </div>
              <h2 className="mb-5 text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white font-jakarta">
                <span className="font-normal text-white/50">Ready to </span>
                <GradientText variant="bright">Percolate?</GradientText>
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-sm sm:text-base text-white/60 font-inter">
                Deploy a perpetual futures market in 60 seconds. No permission needed.
              </p>
              <Link
                href="/create"
                className="group inline-flex items-center justify-center gap-3 border border-[#9945FF]/50 bg-[#9945FF]/[0.06] px-10 py-5 text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[#9945FF] transition-all duration-200 hover:border-[#9945FF] hover:bg-[#9945FF] hover:text-white min-h-[56px]"
                aria-label="Launch a new perpetual market"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Launch Market
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </ScrollReveal>
        </section>

      </div>
  );
}
