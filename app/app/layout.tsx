import "@/lib/polyfills";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { MusicPlayer } from "@/components/ui/MusicPlayer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CloudflareAnalytics } from "@/components/analytics/CloudflareAnalytics";

// Three-font system: Inter (body), Plus Jakarta Sans (display/headings),
// JetBrains Mono (numeric/terminal). Self-hosted via next/font — no
// render-blocking third-party font requests, no layout shift.
const inter = Inter({ variable: "--font-inter-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const plusJakartaSans = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta-sans", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], display: "swap" });

// PERC-695 (bug bounty — CSP static nonce): Force dynamic rendering so each request
// generates a fresh layout render with the new per-request nonce from middleware.
// Without this, Next.js may serve a cached layout with a stale nonce baked into
// data-nonce, causing a CSP mismatch with the freshly generated nonce in the header.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Canonical host is percolator.trade — percolatorlaunch.com 301s to it.
  // metadataBase MUST be the live host so og:image / twitter:image resolve to a
  // direct 200 (X's card renderer won't follow a 301 on the image URL, which
  // left the card image blank).
  metadataBase: new URL("https://percolator.trade"),
  // `default` is the home-page title; `template` appends " | Percolator" to any
  // bare title set by a child route segment (see lib/seo.ts → pageMetadata).
  title: {
    default: "Percolator | Permissionless Perpetual Markets on Solana",
    template: "%s | Percolator",
  },
  description: "Launch and trade perpetual futures for any Solana token. Fully on-chain, permissionless, transparent.",
  keywords: ["Solana", "perpetual futures", "DeFi", "trading", "perps", "on-chain"],
  applicationName: "Percolator",
  alternates: { canonical: "/" },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    url: "https://percolator.trade",
    siteName: "Percolator",
    title: "Percolator — Permissionless Perps on Solana",
    description: "Launch and trade perpetual futures for any Solana token.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@PercolatorTrade",
    title: "Percolator — Permissionless Perps on Solana",
    description: "Launch and trade perpetual futures for any Solana token.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  // GSC verification — set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel env.
  // Renders <meta name="google-site-verification" …> only when present.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable}`}>
      <head />
        <body suppressHydrationWarning className="min-h-screen antialiased" data-nonce={nonce}>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <ChromeGate>
            <MusicPlayer />
          </ChromeGate>
        </Providers>
        <GoogleAnalytics nonce={nonce} />
        <CloudflareAnalytics nonce={nonce} />
        <Analytics />
      </body>
    </html>
  );
}
