import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Devnet utility — excluded from search index (also Disallowed in robots.txt).
export const metadata: Metadata = pageMetadata({
  title: "Devnet Mint",
  description: "Mint devnet test tokens for Percolator.",
  path: "/devnet-mint",
  noindex: true,
});

export default function DevnetMintLayout({ children }: { children: ReactNode }) {
  return children;
}
