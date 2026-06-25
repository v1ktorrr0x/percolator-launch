'use client';

import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { PageHeader } from '@/components/ui/PageHeader';
import type { EarnStats } from '@/hooks/useEarnStats';

interface EarnHeaderProps {
  stats: EarnStats;
  loading: boolean;
}

export function EarnHeader({ stats, loading }: EarnHeaderProps) {
  return (
    <div className="relative">
      {/* Background grid fade */}
      <div className="absolute inset-x-0 top-0 h-48 bg-grid pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <PageHeader
          eyebrow="earn"
          eyebrowAccent="cyan"
          mutedPrefix="LP"
          title="VAULTS"
          subtitle="Provide liquidity to Percolator markets. Earn trading fees from every perpetual trade — fully on-chain, transparent yield."
          width="full"
        />

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 gap-px border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4" aria-label="Earn statistics">
          <StatCell
            label="Total Value Locked"
            loading={loading}
          >
            <AnimatedNumber
              value={stats.tvl}
              prefix="$"
              decimals={0}
              className="text-lg font-semibold text-[var(--text)]"
            />
          </StatCell>
          <StatCell
            label="Average APY"
            loading={loading}
            tooltip="Estimated from the last 30 days of insurance fund fee revenue. Past performance does not guarantee future returns."
          >
            <span className="text-lg font-semibold text-[var(--cyan)]">
              <AnimatedNumber
                value={stats.avgApyPct}
                suffix="%"
                decimals={1}
                className="text-lg font-semibold text-[var(--cyan)]"
              />
            </span>
          </StatCell>
          <StatCell
            label="Daily Fee Revenue"
            loading={loading}
          >
            <AnimatedNumber
              value={stats.dailyFeeRevenue}
              prefix="$"
              decimals={0}
              className="text-lg font-semibold text-[var(--text)]"
            />
          </StatCell>
          <StatCell
            label="Insurance Fund"
            loading={loading}
          >
            <AnimatedNumber
              value={stats.totalInsurance}
              prefix="$"
              decimals={0}
              className="text-lg font-semibold text-[var(--text)]"
            />
          </StatCell>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  children,
  loading,
  tooltip,
}: {
  label: string;
  children: React.ReactNode;
  loading: boolean;
  tooltip?: string;
}) {
  return (
    <div className="bg-[var(--panel-bg)] p-4 sm:p-5">
      <div
        className={`text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-1 ${
          tooltip ? 'cursor-help underline decoration-dotted decoration-[var(--text-muted)]' : ''
        }`}
        title={tooltip}
      >
        {label}
      </div>
      {loading ? (
        <div className="h-7 w-24 animate-pulse rounded bg-[var(--border)]" />
      ) : (
        children
      )}
    </div>
  );
}
