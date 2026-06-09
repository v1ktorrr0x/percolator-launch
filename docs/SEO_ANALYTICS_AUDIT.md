# SEO & Analytics Audit — percolator.trade

_Audit date: 2026-06-08 · App: `app/` (Next.js 16.2.3, App Router, Vercel) · Canonical host: `percolator.trade`_

## Executive summary

The site has a solid technical baseline (global metadata, dynamic sitemap, robots.txt, HTTPS,
canonical-domain 301) but three things are actively costing organic performance:

1. **Domain split-brain** — the sitemap and `robots.txt` advertise `percolatorlaunch.com`
   (which 301s to `percolator.trade`), so the live sitemap is full of redirecting URLs. **HIGH.**
2. **No analytics at all** — only Sentry (errors). Zero measurement of traffic, organic search,
   Core Web Vitals, or waitlist conversion. **HIGH** (can't improve what you can't measure).
3. **Duplicate metadata sitewide** — almost every page is a `"use client"` component and inherits
   one generic root `<title>`/description. Only `/developers` and `/openclaw` are unique. **HIGH.**

Plus a large untapped opportunity: **programmatic SEO** on per-market pages (`/trade/[slab]`),
which currently share the generic title and carry no structured data.

---

## ⚠️ Critical context: host architecture (waitlist pivot, 2026-05-08)

`middleware.ts` runs a **host-based gate** that fundamentally shapes the SEO surface:

| Host | Role | Indexable? |
|------|------|-----------|
| `percolator.trade` | **Canonical SEO host.** `/` is *rewritten* to the waitlist landing. Only an allowlist of paths returns 200; everything else **302-redirects to `/waitlist`**. | Yes (this is the target) |
| `mainnet.percolatorlaunch.com` | Full trading product (markets, earn, stake, portfolio, …) | Strategy TBD (see open question) |
| `percolatorlaunch.com` (apex) | 301 → `percolator.trade` | No |

**Allowed (200) on `percolator.trade`:** `/`, `/waitlist`, `/trade`, `/create`, `/guide`,
`/developers`, `/agents`, `/leaderboard`, `/join`, `/pitch`, `/pitch-2`, `/demo-shots`, `/r`,
`/admin`, `/bugs`, `/report-bug`, `/openclaw` + metadata routes (`/robots.txt`, `/sitemap.xml`,
`/opengraph-image`, `/twitter-image`).

**Redirected → `/waitlist` on `percolator.trade`:** `/markets`, `/earn`, `/stake`, `/portfolio`,
`/dashboard`, `/wallet`, `/my-markets`, `/devnet-mint`, `/faucet`.

Implications already applied:
- **`sitemap.ts` now lists only allowed-200 paths** (dropped `/markets`, `/earn`, `/stake`,
  `/earn/[slab]` — they'd be redirecting URLs, the exact problem we set out to fix).
- **`/waitlist` layout removed** so `/` and `/waitlist` both inherit the brand homepage metadata
  with canonical `/` (the de-facto homepage is the waitlist landing).
- Per-page metadata for `/markets`, `/earn`, `/stake`, etc. is still in place — it serves on the
  mainnet host where those pages render; it's simply never reached on `percolator.trade`.

**Open question (needs owner decision):** should `mainnet.percolatorlaunch.com` be indexed, or
`noindex`'d to avoid duplicate content with `percolator.trade`? And should the trading pages
(`/trade`, `/create`) be promoted as SEO landing pages pre-launch, or kept out of the index until
public launch? See the end of this doc.

---

## Findings

### Technical SEO

| # | Issue | Impact | Evidence | Fix |
|---|-------|--------|----------|-----|
| T1 | Sitemap URLs use non-canonical host | HIGH | `app/sitemap.ts:3` `BASE_URL = https://percolatorlaunch.com` — every entry 301s to `percolator.trade` | Point `BASE_URL` to `https://percolator.trade` |
| T2 | `robots.txt` Sitemap ref uses non-canonical host | HIGH | `app/public/robots.txt:7` `Sitemap: https://percolatorlaunch.com/sitemap.xml` (served live on percolator.trade) | Point to `https://percolator.trade/sitemap.xml` |
| T3 | Sitemap missing many indexable routes | MED | `sitemap.ts` lists 7 static routes; app has `/markets`, `/earn`, `/stake`, `/portfolio`, `/join`, `/agents`, `/guide`, etc. | Expand static list + add `/earn/[slab]` |
| T4 | No per-page canonical tags | MED | No `alternates.canonical` anywhere except none | Add self-referencing canonicals per route |
| T5 | Core Web Vitals unmeasured | MED | No CWV/RUM tooling installed | Use free CrUX field data via Search Console Core Web Vitals report + PageSpeed Insights (Vercel Speed Insights skipped — metered cost) |

Confirmed OK: `percolatorlaunch.com` → 301 → `percolator.trade`; `robots.txt` & `sitemap.xml` both 200;
HTTPS + HSTS (`next.config.ts:34`); `/markets/[slab]` → 301 → `/trade/[slab]` (`next.config.ts:54`)
so it must stay OUT of the sitemap.

### On-page SEO

| # | Issue | Impact | Evidence | Fix |
|---|-------|--------|----------|-----|
| O1 | Duplicate `<title>`/description on ~28 pages | HIGH | `home, trade, markets, earn, leaderboard, guide, create, stake, …` are `"use client"` → can't `export const metadata` → inherit root `layout.tsx:36` | Add per-route `layout.tsx` server wrappers exporting metadata (model: `app/developers/page.tsx:13`) |
| O2 | Dynamic market pages have no unique metadata | HIGH | `/trade/[slab]/page.tsx:1` is `"use client"`; no `generateMetadata` | Add `[slab]/layout.tsx` with `generateMetadata` (symbol, price, OG) |
| O3 | No structured data (JSON-LD) | MED | none in tree | Organization + WebSite (root); FinancialProduct + BreadcrumbList (markets) |
| O4 | OG/Twitter images not per-page | LOW | global `opengraph-image.tsx` only | Optional: dynamic OG image per market |

### Analytics (currently none)

| # | Gap | Plan |
|---|-----|------|
| A1 | No traffic analytics | GA4 + Vercel Web Analytics + Cloudflare Web Analytics |
| A2 | No Core Web Vitals RUM | Free CrUX via Search Console + PageSpeed Insights (Vercel Speed Insights skipped — metered cost) |
| A3 | No organic-search reporting | GA4 (gtag.js) + Google Search Console |
| A5 | No conversion events | Track waitlist signup, wallet connect, create-market, trade CTA |

CSP note: `middleware.ts` `script-src` + `connect-src` extended for GA4
(`googletagmanager.com`, `*.google-analytics.com`). Vercel insights domains are already allowlisted.
(PostHog was evaluated and dropped — not needed.)

---

## Prioritized action plan

**P0 — Crawl/index correctness (no credentials needed)**
- [ ] T1/T2 Fix sitemap + robots domain → `percolator.trade`
- [ ] T3 Expand sitemap routes (+ `/earn/[slab]`)

**P1 — On-page (no credentials)**
- [ ] O1 Per-route `layout.tsx` metadata for all client pages + canonicals (T4)
- [ ] O2 `generateMetadata` for `/trade/[slab]`, `/earn/[slab]`
- [ ] O3 JSON-LD: Organization + WebSite (root), FinancialProduct + Breadcrumb (markets)

**P2 — Analytics (needs env keys; scaffolded to no-op until set)**
- [ ] A1 Traffic analytics: GA4 + Vercel Web Analytics + Cloudflare beacon (A2 CWV: free via Search Console / PageSpeed Insights)
- [ ] A3 GA4 + CSP update
- [ ] A5 Conversion events

**P3 — Search Console (needs user action)**
- [ ] Verify `percolator.trade` property, submit `sitemap.xml`, set `metadata.verification.google`

---

## Credentials / manual steps needed from owner

| Item | Env var | Where to get it |
|------|---------|-----------------|
| GA4 Measurement ID | `NEXT_PUBLIC_GA_ID` (`G-XXXXXXX`) | analytics.google.com → Admin → Data Streams |
| GSC verification | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | search.google.com/search-console (HTML-tag method) |
| Vercel Web Analytics | _none_ | Enable in Vercel dashboard → Analytics tab |
| Cloudflare beacon token | `NEXT_PUBLIC_CF_BEACON_TOKEN` | Cloudflare dashboard → Web Analytics → site → JS snippet |

_Until the env vars are set, the analytics integrations compile and render nothing (no errors)._

---

## Manual steps (owner)

### Google Search Console
1. Add a property for `https://percolator.trade` (URL-prefix) at search.google.com/search-console.
2. Verification: easiest is **DNS TXT** (works regardless of the waitlist gate). Alternatively use
   the **HTML tag** method → copy the token into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (it renders
   on `/`, which the verifier fetches).
3. Submit `https://percolator.trade/sitemap.xml`.
4. (Optional) Add a separate property for `mainnet.percolatorlaunch.com` only if it will be indexed.

### Analytics providers: GA4 + Vercel Web Analytics + Cloudflare Web Analytics
- All three run together. **Speed Insights is the only one excluded** (metered cost); Core Web
  Vitals are covered for free by the Search Console Core Web Vitals report + PageSpeed Insights.
- **Vercel Web Analytics:** enable in the Vercel dashboard (Analytics tab); `<Analytics/>` is wired
  and `/_vercel/*` beacons are allowlisted past the waitlist gate.
- **Cloudflare Web Analytics:** the domain is **DNS-only** (not proxied — the setup Vercel
  recommends), so per Cloudflare docs the **manual JS snippet is required** (automatic injection is
  proxy-only). Set `NEXT_PUBLIC_CF_BEACON_TOKEN` (CF dashboard → Web Analytics). The app injects the
  beacon nonce-correctly; CSP allows `static.cloudflareinsights.com` (script) +
  `cloudflareinsights.com` (connect → `/cdn-cgi/rum`). Because traffic never hits Cloudflare's edge,
  Rocket Loader / "Cache Everything" / auto-injection are non-issues.

### GA4
- ID `G-1SPWXBNZVP` is hardcoded as the default in `lib/analytics-config.ts` (loads on production
  only). `NEXT_PUBLIC_GA_ID` overrides it but is not required. CSP already allows
  `googletagmanager.com` and `*.google-analytics.com`.
- Conversion event `waitlist_joined` (`method: email|wallet`, `position`) already fires on signup.

---

## Open question for the owner

**Indexing strategy for the trading product.** Right now `percolator.trade` is a waitlist landing;
the app lives on `mainnet.percolatorlaunch.com`. Decide:
1. **Waitlist-focused (default):** index only `percolator.trade` (waitlist + content pages),
   `noindex` the mainnet app host. Keeps the index clean pre-launch. ✅ matches current code.
2. **Index the app now:** add per-market `noindex`→index on the mainnet host, add a second sitemap,
   and set canonicals cross-host. More work; risks thin/duplicate pages pre-launch.
3. **Promote trade pages on percolator.trade:** treat `/trade`, `/trade/[slab]` as public SEO
   landing pages even pre-launch (they're already allowed + have per-market metadata + JSON-LD).
