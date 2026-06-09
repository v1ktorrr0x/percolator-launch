import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Personalized (wallet-scoped) — excluded from search index.
export const metadata: Metadata = pageMetadata({
  title: "My Markets",
  description: "Markets you've created on Percolator.",
  path: "/my-markets",
  noindex: true,
});

export default function MyMarketsLayout({ children }: { children: ReactNode }) {
  return children;
}
