import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Admin area — excluded from search index (also Disallowed in robots.txt).
export const metadata: Metadata = pageMetadata({
  title: "Admin",
  description: "Percolator admin.",
  path: "/admin",
  noindex: true,
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
