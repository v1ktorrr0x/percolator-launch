/**
 * Waitlist signup — bot-wave hardening guards.
 *
 * After the Jun-2026 wave (scripts POSTing straight to /api/waitlist/signup,
 * bypassing the Privy widget + Turnstile, hammering one referral code at
 * machine cadence with disposable/attacker email domains), the route gained
 * server-side defenses that bind regardless of the client:
 *   1. bot user-agent gate (rejects python/curl/etc. + spoofed UAs)
 *   2. disposable / attacker-controlled email domain denylist
 *   3. per-referral-code hourly rate limit
 *   4. per-IP hourly rate limit
 *   5. ip_hash persistence (hashed, never raw) for future traceability
 *
 * This guards the route source so a refactor that drops a defense trips CI.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROUTE_PATH = path.resolve(
  __dirname,
  "../../app/api/waitlist/signup/route.ts",
);

describe("/api/waitlist/signup bot-wave hardening", () => {
  const source = fs.readFileSync(ROUTE_PATH, "utf8");

  it("rejects non-browser / scripted user agents", () => {
    expect(source).toContain("isBotUserAgent");
    expect(source).toMatch(/python|aiohttp|curl/i);
    // gate is invoked in the handler and returns a non-2xx
    expect(source).toMatch(/if \(isBotUserAgent\(userAgent\)\)/);
    expect(source).toMatch(/status:\s*403/);
  });

  it("denies disposable / attacker-controlled email domains", () => {
    expect(source).toContain("DISPOSABLE_EMAIL_DOMAINS");
    expect(source).toContain("isDisposableEmailDomain");
    // the attacker catch-alls from the wave must be listed
    expect(source).toContain("tirtamulya.xyz");
    expect(source).toContain("wshu.net");
    expect(source).toContain("akaikadot.com");
  });

  it("enforces a per-referral-code hourly rate limit", () => {
    expect(source).toContain("WAITLIST_PER_CODE_HOURLY_CAP");
    expect(source).toMatch(/perCode\.limit\(referredByCode\)/);
  });

  it("enforces a per-IP hourly rate limit", () => {
    expect(source).toContain("WAITLIST_PER_IP_HOURLY_CAP");
    expect(source).toMatch(/perIp\.limit\(ipHash\)/);
  });

  it("fails open when Upstash is unconfigured (local dev / CI)", () => {
    expect(source).toMatch(
      /if \(!url \|\| !token\) return \{ perCode: null, perIp: null \}/,
    );
  });

  it("persists a hashed ip (never the raw IP) on insert", () => {
    expect(source).toContain("ip_hash: ipHash");
    expect(source).toMatch(
      /createHash\("sha256"\)\.update\(ip\)\.digest\("hex"\)/,
    );
  });
});
