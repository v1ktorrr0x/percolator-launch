import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Personalized (wallet-scoped) — excluded from search index.
export const metadata: Metadata = pageMetadata({
  title: "Dashboard",
  description: "Your Percolator dashboard.",
  path: "/dashboard",
  noindex: true,
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
