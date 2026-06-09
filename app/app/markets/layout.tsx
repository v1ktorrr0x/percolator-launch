import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Perpetual Markets",
  description:
    "Browse every permissionless perp market on Percolator. Live prices, funding rates, open interest, and 24h volume for Solana token perpetuals.",
  path: "/markets",
  keywords: ["perp markets", "Solana perpetuals", "funding rates", "open interest"],
});

export default function MarketsLayout({ children }: { children: ReactNode }) {
  return children;
}
