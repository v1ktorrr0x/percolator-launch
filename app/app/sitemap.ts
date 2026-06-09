import type { MetadataRoute } from "next";

// Canonical host. percolatorlaunch.com 301s here, so every sitemap URL MUST use
// percolator.trade — otherwise the sitemap is full of redirecting URLs, which
// Google discourages and which wastes crawl budget.
const BASE_URL = "https://percolator.trade";

/**
 * Dynamic sitemap for the canonical waitlist host (percolator.trade).
 *
 * IMPORTANT: percolator.trade is waitlist-gated (middleware.ts "waitlist pivot").
 * Only paths in WAITLIST_HOST_ALLOWED_PREFIXES return 200 here; every other path
 * 302-redirects to /waitlist. So this sitemap lists ONLY allowed, indexable
 * paths — listing redirecting URLs (e.g. /markets, /earn) would waste crawl
 * budget. The full trading product (markets, earn, stake, portfolio) lives on
 * mainnet.percolatorlaunch.com and is intentionally excluded here.
 *
 * `/` renders the waitlist landing (rewrite) and is the canonical home, so
 * /waitlist itself is omitted (it canonicalizes to /).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/trade`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE_URL}/create`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/leaderboard`, changeFrequency: "hourly", priority: 0.6 },
    { url: `${BASE_URL}/guide`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/developers`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/agents`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE_URL}/join`, changeFrequency: "weekly", priority: 0.4 },
  ];

  // Per-market /trade/[slab] routes (the /trade prefix is allowed on the host).
  let marketRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BASE_URL}/api/markets`, {
      next: { revalidate: 3600 }, // revalidate hourly
    });
    if (res.ok) {
      const data = await res.json();
      const markets: Array<{ slab_address: string }> = data?.markets ?? data ?? [];
      marketRoutes = markets.map((m) => ({
        url: `${BASE_URL}/trade/${m.slab_address}`,
        changeFrequency: "hourly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Non-fatal — sitemap works without dynamic markets
  }

  return [...staticRoutes, ...marketRoutes];
}
