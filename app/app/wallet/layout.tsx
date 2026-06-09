import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Personalized (wallet-scoped) — excluded from search index.
export const metadata: Metadata = pageMetadata({
  title: "Wallet",
  description: "Manage your Percolator wallet and balances.",
  path: "/wallet",
  noindex: true,
});

export default function WalletLayout({ children }: { children: ReactNode }) {
  return children;
}
