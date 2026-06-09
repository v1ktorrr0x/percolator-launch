import { SITE_URL } from "@/lib/seo";

/**
 * Server-only helper for per-market metadata (generateMetadata) and JSON-LD.
 *
 * The [slab] route accepts EITHER a base58 slab address OR a symbol slug, and
 * both render the same page — so the canonical URL must always use the resolved
 * `slabAddress` to avoid duplicate-content splits. Falls back to generic
 * metadata when the market can't be resolved (returns null, never throws).
 */
export type MarketMeta = {
  /** Normalized symbol without the -PERP suffix, e.g. "SOL". Empty if unknown. */
  symbol: string;
  /** Canonical on-chain slab address (use for canonical URL). */
  slabAddress: string;
  /** Best available USD price, or null. */
  price: number | null;
};

export async function fetchMarketMeta(slab: string): Promise<MarketMeta | null> {
  try {
    const res = await fetch(`${SITE_URL}/api/markets/${encodeURIComponent(slab)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const m = data?.market;
    if (!m) return null;
    const symbol = String(m.symbol ?? "").toUpperCase().replace(/-PERP$/, "");
    const price =
      typeof m.last_price === "number" ? m.last_price
      : typeof m.mark_price === "number" ? m.mark_price
      : typeof m.index_price === "number" ? m.index_price
      : null;
    return { symbol, slabAddress: String(m.slab_address ?? slab), price };
  } catch {
    return null;
  }
}

export function formatUsd(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toPrecision(2)}`;
}
