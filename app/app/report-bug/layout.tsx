import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

// Utility page — excluded from search index.
export const metadata: Metadata = pageMetadata({
  title: "Report a Bug",
  description: "Report a bug or issue with Percolator.",
  path: "/report-bug",
  noindex: true,
});

export default function ReportBugLayout({ children }: { children: ReactNode }) {
  return children;
}
