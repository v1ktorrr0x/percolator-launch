#!/usr/bin/env npx ts-node --esm
/**
 * PERC-8220 — Devnet smoke test script
 *
 * Verifies the core devnet API health after deployments / migrations.
 * Catches issues like missing Supabase columns, zero oracle prices, etc.
 *
 * Usage:
 *   BASE_URL=https://percolator.trade npx ts-node scripts/smoke-test.ts
 *   BASE_URL=http://localhost:3000   npx ts-node scripts/smoke-test.ts
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more checks failed
 */

const BASE_URL = process.env.BASE_URL ?? "https://percolator.trade";
const MIN_MARKETS = 1;
const MIN_ORACLE_PRICES = 10;
const TIMEOUT_MS = 15_000;

interface SmokeResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: SmokeResult[] = [];

function pass(name: string, detail: string) {
  results.push({ name, passed: true, detail });
  console.log(`  ✅ ${name}: ${detail}`);
}

function fail(name: string, detail: string) {
  results.push({ name, passed: false, detail });
  console.error(`  ❌ ${name}: ${detail}`);
}

async function fetchWithTimeout(url: string, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkHealth() {
  console.log("\n📋 CHECK: /api/health");
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/health`);
    if (!res.ok) {
      fail("health", `HTTP ${res.status}`);
      return;
    }
    const body = await res.json();
    if (body.status === "ok" || body.status === "degraded") {
      pass("health", `status=${body.status}`);
    } else {
      fail("health", `unexpected status: ${body.status ?? "missing"}`);
    }
  } catch (e: unknown) {
    fail("health", `request failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function checkMarkets() {
  console.log("\n📋 CHECK: /api/markets");
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/markets`);
    if (!res.ok) {
      fail("markets-status", `HTTP ${res.status}`);
      return;
    }
    const body = await res.json();

    // 1. Response must be an array with entries
    if (!Array.isArray(body)) {
      fail("markets-format", `expected array, got ${typeof body}`);
      return;
    }
    pass("markets-format", "response is an array");

    if (body.length < MIN_MARKETS) {
      fail("markets-count", `got ${body.length}, expected >= ${MIN_MARKETS}`);
    } else {
      pass("markets-count", `${body.length} markets returned`);
    }

    // 2. All markets should have network=devnet (once migration is applied)
    //    If the column is missing, network will be null — flag as warning
    const withNetwork = body.filter((m: Record<string, unknown>) => m.network === "devnet");
    const withNullNetwork = body.filter((m: Record<string, unknown>) => m.network == null);
    if (withNullNetwork.length > 0) {
      fail(
        "markets-network-column",
        `${withNullNetwork.length}/${body.length} markets have null network — migration not applied?`
      );
    } else {
      pass("markets-network-column", `all ${withNetwork.length} markets have network=devnet`);
    }

    // 3. Oracle prices: at least MIN_ORACLE_PRICES markets should have a non-zero oracle price
    const withPrice = body.filter(
      (m: Record<string, unknown>) =>
        m.oracle_price != null && Number(m.oracle_price) > 0
    );
    if (withPrice.length < MIN_ORACLE_PRICES) {
      fail(
        "markets-oracle-prices",
        `only ${withPrice.length}/${body.length} markets have oracle price — expected >= ${MIN_ORACLE_PRICES}`
      );
    } else {
      pass("markets-oracle-prices", `${withPrice.length}/${body.length} markets have oracle price`);
    }

    // 4. At least one market should have valid funding rate data
    const withFunding = body.filter(
      (m: Record<string, unknown>) => m.funding_rate != null && m.funding_rate !== 0
    );
    if (withFunding.length === 0) {
      fail("markets-funding-rate", "no markets have funding rate data");
    } else {
      pass("markets-funding-rate", `${withFunding.length} markets have funding rate data`);
    }

    // 5. Spot-check single market detail endpoint using first returned market
    if (body.length > 0) {
      await checkSingleMarket(body[0]);
    }
  } catch (e: unknown) {
    fail("markets", `request failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function checkSingleMarket(market: Record<string, unknown>) {
  console.log("\n📋 CHECK: /api/markets/[slab]");
  const slabAddress = market.slab_address ?? market.id ?? market.market_address;
  if (!slabAddress) {
    fail("single-market", "could not determine slab address from first market");
    return;
  }
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/markets/${slabAddress}`);
    if (!res.ok) {
      fail("single-market-status", `HTTP ${res.status} for slab=${slabAddress}`);
      return;
    }
    const body = await res.json();
    if (body && (body.slab_address || body.id || body.market_address)) {
      pass("single-market-data", `market detail returned for slab=${slabAddress}`);
    } else {
      fail("single-market-data", `unexpected shape: ${JSON.stringify(body).slice(0, 120)}`);
    }
  } catch (e: unknown) {
    fail("single-market", `request failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function main() {
  console.log(`\n🚬 Percolator Devnet Smoke Test`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Min oracle prices required: ${MIN_ORACLE_PRICES}`);

  await checkHealth();
  await checkMarkets();

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Result: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.error(`\n❌ SMOKE TEST FAILED — ${failed} check(s) failed:`);
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.error(`   • ${r.name}: ${r.detail}`));
    process.exit(1);
  } else {
    console.log(`\n✅ SMOKE TEST PASSED — all ${passed} checks passed`);
    process.exit(0);
  }
}

main().catch((e) => {
  console.error("Fatal smoke test error:", e);
  process.exit(1);
});
