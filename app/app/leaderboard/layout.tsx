import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Trader Leaderboard",
  description:
    "See the top traders on Percolator ranked by PnL and volume. Live leaderboard for permissionless perpetual futures on Solana.",
  path: "/leaderboard",
  keywords: ["trading leaderboard", "top traders", "PnL ranking", "Solana perps"],
});

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return children;
}
