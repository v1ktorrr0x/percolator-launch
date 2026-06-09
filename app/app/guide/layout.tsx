import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Guide — How Percolator Works",
  description:
    "Learn how to trade perps, provide liquidity, and launch markets on Percolator — the permissionless perpetual futures protocol on Solana.",
  path: "/guide",
  keywords: ["how to trade perps", "perps guide", "Solana DeFi guide", "Percolator docs"],
});

export default function GuideLayout({ children }: { children: ReactNode }) {
  return children;
}
