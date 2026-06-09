import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Join the Team",
  description:
    "Contribute to Percolator. We're looking for developers, designers, and community builders to grow permissionless perps on Solana.",
  path: "/join",
  keywords: ["Percolator jobs", "Solana DeFi careers", "crypto contributor", "web3 jobs"],
});

export default function JoinLayout({ children }: { children: ReactNode }) {
  return children;
}
