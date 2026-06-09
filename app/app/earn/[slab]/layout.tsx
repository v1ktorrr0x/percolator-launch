import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from "@/lib/seo";
import { fetchMarketMeta } from "@/lib/market-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slab: string }>;
}): Promise<Metadata> {
  const { slab } = await params;
  const market = await fetchMarketMeta(slab);

  const canonicalSlab = market?.slabAddress ?? slab;
  const path = `/earn/${canonicalSlab}`;
  const url = `${SITE_URL}${path}`;

  const sym = market?.symbol || "";
  const title = sym ? `${sym} Liquidity Vault — Earn Yield` : "Liquidity Vault — Earn Yield";
  const description = sym
    ? `Provide liquidity to the ${sym} perpetual market on Percolator and earn trading fees and funding. Transparent, on-chain LP vault on Solana.`
    : "Provide liquidity to Percolator perpetual markets and earn fees and funding. Transparent, on-chain LP vaults on Solana.";
  const ogTitle = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      title: ogTitle,
      description,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export default function EarnSlabLayout({ children }: { children: ReactNode }) {
  return children;
}
