import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Launch a Perpetual Market",
  description:
    "Create a permissionless perpetual futures market for any Solana token in minutes. Fully on-chain, transparent, and no permission required.",
  path: "/create",
  keywords: ["launch perp market", "create perpetual", "permissionless markets", "Solana"],
});

export default function CreateLayout({ children }: { children: ReactNode }) {
  return children;
}
