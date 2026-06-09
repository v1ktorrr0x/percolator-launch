import Script from "next/script";
import { GA_ID } from "@/lib/analytics-config";

/**
 * GA4 (gtag.js). Renders nothing when NEXT_PUBLIC_GA_ID is unset.
 *
 * The middleware enforces a strict, nonce-based CSP. `gtag.js` itself is an
 * external-src script (allowed via the googletagmanager.com script-src entry),
 * and the inline init below carries the per-request `nonce` so it isn't blocked.
 */
export function GoogleAnalytics({ nonce }: { nonce?: string }) {
  // Only load GA on the real production deployment — keep preview deploys and
  // local dev out of the GA4 property. On Vercel, VERCEL_ENV is
  // "production" | "preview" | "development".
  const isProd = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";
  if (!GA_ID || !isProd) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="ga-init" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}', { send_page_view: true });`}
      </Script>
    </>
  );
}
