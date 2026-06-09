import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Earn Yield as a Liquidity Provider",
  description:
    "Provide liquidity to Percolator perp markets and earn trading fees and funding. Transparent, on-chain LP vaults for Solana perpetuals.",
  path: "/earn",
  keywords: ["DeFi yield", "liquidity provider", "LP vault", "Solana yield"],
});

export default function EarnLayout({ children }: { children: ReactNode }) {
  return children;
}
