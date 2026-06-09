import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Trade Perpetual Futures on Solana",
  description:
    "Trade on-chain perpetual futures for any Solana token. Deep liquidity, transparent funding rates, and self-custodial positions — no signup required.",
  path: "/trade",
  keywords: ["Solana perps", "perpetual futures", "on-chain trading", "DeFi perps"],
});

export default function TradeLayout({ children }: { children: ReactNode }) {
  return children;
}
