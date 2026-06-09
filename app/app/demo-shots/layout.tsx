import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Internal demo/screenshot page — excluded from search index.
export const metadata: Metadata = pageMetadata({
  title: "Demo",
  description: "Percolator demo screens.",
  path: "/demo-shots",
  noindex: true,
});

export default function DemoShotsLayout({ children }: { children: ReactNode }) {
  return children;
}
