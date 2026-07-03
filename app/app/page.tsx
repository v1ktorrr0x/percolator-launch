"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { getSupabase } from "@/lib/supabase";
import { isMockMode } from "@/lib/mock-mode";
import { MOCK_SLAB_ADDRESSES, getMockMarketData } from "@/lib/mock-trade-data";
import { isActiveMarket, isSaneMarketValue } from "@/lib/activeMarketFilter";
import { isBlockedSlab } from "@/lib/blocklist";
import { isPhantomOpenInterest } from "@/lib/phantom-oi";
import { motion } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { FeatureIndex } from "@/components/ui/FeatureIndex";
import { GradientText } from "@/components/ui/GradientText";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { OnboardingIcon } from "@/components/icons/OnboardingIcons";
import { HeroDashboard } from "@/components/ui/HeroDashboard";
import { formatUsdFromNumber } from "@/lib/format";

// Dynamic import for wallet connect button to prevent hydration mismatch
const ConnectButton = dynamic(
  () => import("@/components/wallet/ConnectButton").then((m) => m.ConnectButton),
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
  return (
    <section className="relative px-6 py-20 md:py-28 select-text">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-12 lg:mb-16 text-center">
          <div className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#9945FF]/80">
            how it works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white font-jakarta">
            Three steps. <span className="font-normal text-white/50">Sixty seconds.</span>
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {HOW_STEPS.map((step) => (
            <div key={step.number} className="border-t border-white/10 pt-6">
              <div className="font-jakarta text-sm font-bold tabular-nums text-[#9945FF]">{step.number}</div>
              <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState<{ slab_address: string; symbol: string | null; volume_24h: number; last_price: number | null; total_open_interest: number }[]>([]);

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

        setFeatured(mockFeatured);
        return;
      }

      try {
        let { data, error: dbError } = await getSupabase().from("markets_with_stats").select("slab_address, symbol, volume_24h, insurance_balance, insurance_fund, last_price, total_open_interest, open_interest_long, open_interest_short, decimals, vault_balance, total_accounts").neq("indexer_excluded", true);
        if (dbError && dbError.message?.includes("indexer_excluded")) {
          console.warn("[homepage] indexer_excluded column missing — retrying without filter");
          const retry = await getSupabase().from("markets_with_stats").select("slab_address, symbol, volume_24h, insurance_balance, insurance_fund, last_price, total_open_interest, open_interest_long, open_interest_short, decimals, vault_balance, total_accounts");
          data = retry.data;
          dbError = retry.error;
        }
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
          const phantomAwareData = data.map((m) => {
            const accountsCount = m.total_accounts ?? 0;
            const vaultBal = m.vault_balance ?? 0;
            const isPhantom = isPhantomOpenInterest(accountsCount, vaultBal);
            if (!isPhantom) return m;
            return { ...m, total_open_interest: 0, open_interest_long: 0, open_interest_short: 0, last_price: null };
          });

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
      }
    }
    loadStats();
  }, []);

  const hasMarkets = featured.length > 0 && featured.some((m) => m.volume_24h > 0 || m.total_open_interest > 0);

  return (
    <div className="relative z-20 flex flex-col">
        {/* ── 1. Hero ── */}
        <ErrorBoundary label="Hero Section">
        <section className="relative flex min-h-[calc(88dvh-3.5rem)] items-center px-6 sm:px-8 lg:px-14 py-4 select-text">
          <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 xl:grid-cols-[1.15fr_0.85fr] xl:gap-14">
            {/* Left — pitch */}
            <div className="flex min-w-0 flex-col">
              {/* Headline — scale-settle: lands from oversized + blurred */}
              <motion.h1
                initial={{ opacity: 0, scale: 1.08, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left center" }}
                className="font-jakarta text-white uppercase leading-[0.88] tracking-tighter text-[clamp(2.75rem,6.5vw,4.5rem)] [overflow-wrap:anywhere]"
              >
                <span className="block">Any Token.</span>
                <span className="block">Any Market.</span>
                <span className="block bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
                  Permissionless.
                </span>
              </motion.h1>

              {/* Description — one sharp sentence */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg lg:mt-8 lg:text-xl [text-wrap:pretty]"
              >
                Deploy a perpetual futures market for <strong className="font-semibold text-white">any Solana token</strong> — and earn <strong className="font-semibold text-[#14F195]">8% of every trade</strong>.
              </motion.p>

              {/* Actions Row */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 lg:mt-8"
              >
                <Link href="/create" className="cta cta--primary">
                  Launch Market
                  <ArrowUpRight />
                </Link>

                <Link href="/markets" className="cta cta--ghost">
                  Trade Now
                </Link>
              </motion.div>
            </div>

            {/* Right — Create Market mockup (xl+), deliberately off-axis:
                raised above the text's centerline and canted -1.5deg so the
                two columns misalign on purpose */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              animate={{ opacity: 1, y: -16, rotate: -1.5 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="hidden xl:block"
            >
              <HeroDashboard />
            </motion.div>
          </div>
        </section>
        </ErrorBoundary>

        {/* ── 2. How It Works Section ── */}
        <ErrorBoundary label="How It Works Section">
          <HowItWorksSection />
        </ErrorBoundary>

        {/* ── 3. Purpose-Built Infrastructure (Features) ── */}
        <ErrorBoundary label="Features Section">
          <section className="relative px-6 py-16 md:py-28 select-text">
            <div className="mx-auto max-w-[1200px]">
              <ScrollReveal noSafetyNet={true}>
                <div className="mb-12 lg:mb-16 text-center">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white font-jakarta">
                    Purpose-Built <GradientText variant="muted">Infrastructure</GradientText>
                  </h2>
                  <p className="mt-4 mx-auto max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
                    Six guarantees, enforced by the protocol rather than promised by a team.
                  </p>
                </div>
                <FeatureIndex />
              </ScrollReveal>
            </div>
          </section>
        </ErrorBoundary>

        {/* ── 4. Active Markets Section ── */}
        {hasMarkets && (
          <ErrorBoundary label="Featured Markets Section">
            <section className="relative px-6 py-16 md:py-28 select-text">
              <div className="mx-auto max-w-[1200px]">
                <ScrollReveal noSafetyNet={true}>
                  <div className="mb-12 lg:mb-16 text-center">
                    <div className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#14F195]/80">
                      live data
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white font-jakarta">
                      Active Markets
                    </h2>
                  </div>

                  <div className="mx-auto max-w-4xl overflow-x-auto">
                    {/* column labels — hairline rhythm, no box */}
                    <div className="grid min-w-[640px] grid-cols-[2.5rem_1.4fr_1fr_1fr_1fr_0.9fr] items-baseline gap-4 border-b border-white/10 pb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                      <div />
                      <div>Market</div>
                      <div className="text-right">Price</div>
                      <div className="text-right">Volume</div>
                      <div className="text-right">Open interest</div>
                      <div className="text-right">Status</div>
                    </div>
                    {featured.map((m, i) => (
                      <Link
                        key={m.slab_address}
                        href={`/trade/${m.slab_address}`}
                        className="group grid min-w-[640px] grid-cols-[2.5rem_1.4fr_1fr_1fr_1fr_0.9fr] items-baseline gap-4 border-b border-white/10 py-5"
                        aria-label={`Trade ${isValidSymbol(m.symbol) ? `${m.symbol}/USD` : `market ${m.slab_address.slice(0, 6)}`}`}
                      >
                        <span className="font-mono text-[12px] tabular-nums text-white/30 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[#14F195]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-jakarta text-lg font-semibold tracking-tight text-white/60 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-white sm:text-xl">
                          {isValidSymbol(m.symbol) ? `${m.symbol}/USD` : `${m.slab_address.slice(0, 6)}…`}
                        </span>
                        <span className="text-right font-mono text-[13px] tabular-nums text-white/55 transition-colors duration-300 group-hover:text-white/80">
                          {formatUsdFromNumber(m.last_price)}
                        </span>
                        <span className="text-right font-mono text-[13px] tabular-nums text-white/55 transition-colors duration-300 group-hover:text-white/80">
                          {m.volume_24h > 0 ? formatCompact(m.volume_24h) : "—"}
                        </span>
                        <span className="text-right font-mono text-[13px] tabular-nums text-white/55 transition-colors duration-300 group-hover:text-white/80">
                          {m.total_open_interest > 0 ? formatCompact(m.total_open_interest) : "—"}
                        </span>
                        {m.last_price != null ? (
                          <span className="flex items-baseline justify-end gap-1.5 font-mono text-[11px] text-[#14F195]/80">
                            <span className="relative flex h-1.5 w-1.5 self-center">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-[#14F195] opacity-60 motion-safe:animate-ping" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#14F195]" />
                            </span>
                            live
                          </span>
                        ) : (
                          <span className="text-right font-mono text-[11px] text-[var(--warning)]/80">no oracle</span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="mx-auto mt-8 flex max-w-4xl justify-end">
                    <Link
                      href="/markets"
                      className="group inline-flex items-baseline gap-2 font-mono text-[12px] text-white/35 transition-colors duration-300 hover:text-[#14F195]"
                    >
                      view all markets
                      <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1">→</span>
                    </Link>
                  </div>
                </ScrollReveal>
              </div>
            </section>
          </ErrorBoundary>
        )}

        {/* ── 5. Bottom CTA Section ── */}
        <section className="relative px-6 py-20 md:py-32 select-text">
          <ScrollReveal noSafetyNet={true}>
            <div className="relative z-10 mx-auto max-w-[1200px] text-center">
              <h2 className="mb-5 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white font-jakarta">
                <span className="font-normal text-white/50">Ready to </span>
                <GradientText variant="bright">Percolate?</GradientText>
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-sm sm:text-base text-white/60 font-inter">
                Deploy a perpetual futures market in 60 seconds. No permission needed.
              </p>
              <Link
                href="/create"
                className="cta cta--brand cta--lg group"
                aria-label="Launch a new perpetual market"
              >
                Launch Market
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </section>

      </div>
  );
}
