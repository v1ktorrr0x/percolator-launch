import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Stake into Percolator Pools",
  description:
    "Deposit into Percolator pools to earn protocol yield and help backstop permissionless perpetual markets on Solana.",
  path: "/stake",
  keywords: ["staking", "Solana staking", "DeFi pools", "protocol yield"],
});

export default function StakeLayout({ children }: { children: ReactNode }) {
  return children;
}
