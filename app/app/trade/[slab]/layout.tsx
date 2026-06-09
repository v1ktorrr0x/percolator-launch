import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from "@/lib/seo";
import { fetchMarketMeta, formatUsd } from "@/lib/market-meta";
import { JsonLd } from "@/components/seo/JsonLd";
import { marketSchema, breadcrumbSchema } from "@/lib/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slab: string }>;
}): Promise<Metadata> {
  const { slab } = await params;
  const market = await fetchMarketMeta(slab);

  // Canonical always points to the resolved address form (slug + address render
  // the same page — collapse them onto one canonical URL).
  const canonicalSlab = market?.slabAddress ?? slab;
  const path = `/trade/${canonicalSlab}`;
  const url = `${SITE_URL}${path}`;

  const sym = market?.symbol || "";
  const title = sym ? `${sym}-PERP Perpetual Futures` : "Perpetual Futures Market";
  const priceStr = market?.price ? ` Mark price ${formatUsd(market.price)}.` : "";
  const description = sym
    ? `Trade ${sym} perpetual futures on Percolator — on-chain, permissionless, and self-custodial.${priceStr} Live funding, deep liquidity, no signup, on Solana.`
    : "Trade on-chain perpetual futures on Percolator — permissionless and self-custodial, on Solana.";
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

export default async function TradeSlabLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slab: string }>;
}) {
  const { slab } = await params;
  const market = await fetchMarketMeta(slab); // cached (revalidate 300) — shared with generateMetadata
  const canonicalSlab = market?.slabAddress ?? slab;
  const sym = market?.symbol || "";
  const path = `/trade/${canonicalSlab}`;

  return (
    <>
      <JsonLd
        data={[
          marketSchema({ symbol: sym, path }),
          breadcrumbSchema([
            { name: "Markets", path: "/markets" },
            { name: sym ? `${sym}-PERP` : "Market", path },
          ]),
        ]}
      />
      {children}
    </>
  );
}
