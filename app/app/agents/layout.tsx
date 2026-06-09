import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Build with AI Agents",
  description:
    "Point your AI coding agent at Percolator's open-source code and architecture context to build and ship features on permissionless Solana perps.",
  path: "/agents",
  keywords: ["AI coding agents", "build on Solana", "agentic engineering", "open source perps"],
});

export default function AgentsLayout({ children }: { children: ReactNode }) {
  return children;
}
