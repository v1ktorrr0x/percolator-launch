import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Personalized (wallet-scoped) — excluded from search index.
export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description: "Your Percolator positions, balances, and PnL.",
  path: "/portfolio",
  noindex: true,
});

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return children;
}
