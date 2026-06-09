import Script from "next/script";
import { CF_BEACON_TOKEN } from "@/lib/analytics-config";

/**
 * Cloudflare Web Analytics beacon. Renders nothing until NEXT_PUBLIC_CF_BEACON_TOKEN
 * is set, and only on the production deployment (preview/local excluded).
 *
 * The domain is DNS-only on Cloudflare (NOT proxied), so per Cloudflare docs the
 * manual JS snippet is the required setup (automatic injection only works for
 * proxied/orange-cloud sites). The beacon loads from static.cloudflareinsights.com
 * (CSP script-src) and reports to cloudflareinsights.com/cdn-cgi/rum (CSP
 * connect-src) — both allowlisted in middleware.ts.
 * https://developers.cloudflare.com/web-analytics/get-started/
 */
export function CloudflareAnalytics({ nonce }: { nonce?: string }) {
  const isProd = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
  if (!CF_BEACON_TOKEN || !isProd) return null;
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      nonce={nonce}
      data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`}
    />
  );
}
