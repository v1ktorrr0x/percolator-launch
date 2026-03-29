#!/usr/bin/env bash
# PERC-8220 — Devnet Smoke Test runner
#
# Verifies /api/health and /api/markets after deployments / migrations.
# Catches: missing Supabase columns, zero oracle prices, offline services.
#
# Usage:
#   ./scripts/smoke-test.sh                           # targets https://percolator.trade
#   BASE_URL=http://localhost:3000 ./scripts/smoke-test.sh
#   BASE_URL=https://percolator-launch.vercel.app MIN_ORACLE_PRICES=5 ./scripts/smoke-test.sh
#
# Requires: curl, jq
# Exit: 0=all pass, 1=one or more failed

BASE_URL="${BASE_URL:-https://percolator.trade}"
MIN_ORACLE_PRICES="${MIN_ORACLE_PRICES:-10}"
TIMEOUT=15

PASS=0
FAIL=0
FAILED_CHECKS=()

check_pass() { echo "  ✅ $1: $2"; PASS=$((PASS+1)); }
check_fail() { echo "  ❌ $1: $2"; FAIL=$((FAIL+1)); FAILED_CHECKS+=("$1: $2"); }

# Returns HTTP status code or "000" on network failure
curl_get() {
  local url="$1" out="$2" code
  code=$(curl -s -o "${out}" -w "%{http_code}" --max-time "${TIMEOUT}" "${url}" 2>/dev/null)
  local rc=$?
  if [ $rc -ne 0 ] || [ -z "${code}" ]; then echo "000"; else echo "${code}"; fi
}

echo ""
echo "🚬 Percolator Devnet Smoke Test"
echo "   Target:              ${BASE_URL}"
echo "   Min oracle prices:   ${MIN_ORACLE_PRICES}"

# ── CHECK 1: /api/health ────────────────────────────────────────────────────
echo ""
echo "📋 CHECK: /api/health"
HEALTH_HTTP=$(curl_get "${BASE_URL}/api/health" /tmp/smoke_health.json)

if [ "${HEALTH_HTTP}" != "200" ]; then
  check_fail "health-status" "HTTP ${HEALTH_HTTP}"
else
  # Accept: ok, degraded, online (all indicate the route is up)
  HEALTH_STATUS=$(jq -r '.status // "missing"' /tmp/smoke_health.json 2>/dev/null || echo "parse_error")
  case "${HEALTH_STATUS}" in
    ok|degraded|online)
      check_pass "health" "status=${HEALTH_STATUS}"
      ;;
    *)
      check_fail "health" "unexpected status: ${HEALTH_STATUS}"
      ;;
  esac
fi

# ── CHECK 2: /api/markets ───────────────────────────────────────────────────
echo ""
echo "📋 CHECK: /api/markets"
MARKETS_HTTP=$(curl_get "${BASE_URL}/api/markets" /tmp/smoke_markets.json)

if [ "${MARKETS_HTTP}" != "200" ]; then
  check_fail "markets-status" "HTTP ${MARKETS_HTTP}"
else
  check_pass "markets-status" "HTTP 200"

  # API returns { total, activeTotal, marketsWithPrice, markets: [...] }
  RESP_TYPE=$(jq -r 'type' /tmp/smoke_markets.json 2>/dev/null || echo "error")

  if [ "${RESP_TYPE}" = "array" ]; then
    # Older / different shape — plain array
    MARKETS_JSON=$(cat /tmp/smoke_markets.json)
    TOTAL=$(echo "${MARKETS_JSON}" | jq 'length' 2>/dev/null || echo "0")
  elif [ "${RESP_TYPE}" = "object" ]; then
    # Current shape: { total, markets: [...] }
    MARKETS_JSON=$(jq '.markets // []' /tmp/smoke_markets.json 2>/dev/null || echo "[]")
    TOTAL=$(jq -r '.total // (.markets | length)' /tmp/smoke_markets.json 2>/dev/null || echo "0")
  else
    check_fail "markets-format" "unexpected response type: ${RESP_TYPE}"
    MARKETS_JSON="[]"
    TOTAL=0
  fi

  if [ -z "${RESP_TYPE}" ] || [ "${RESP_TYPE}" = "error" ]; then
    check_fail "markets-format" "could not parse JSON response"
  else
    check_pass "markets-format" "valid JSON (type=${RESP_TYPE})"
  fi

  # ── CHECK 2a: market count ─────────────────────────────────────────────
  if [ "${TOTAL}" -lt 1 ] 2>/dev/null; then
    check_fail "markets-count" "got ${TOTAL} markets, expected >= 1"
  else
    check_pass "markets-count" "${TOTAL} markets total"
  fi

  # ── CHECK 3: network column (migration guard) ──────────────────────────
  NULL_NETWORK=$(echo "${MARKETS_JSON}" | jq '[.[] | select(.network == null)] | length' 2>/dev/null || echo "${TOTAL}")
  MARKET_LEN=$(echo "${MARKETS_JSON}" | jq 'length' 2>/dev/null || echo "0")
  if [ "${NULL_NETWORK}" -gt 0 ] 2>/dev/null; then
    check_fail "markets-network-column" \
      "${NULL_NETWORK}/${MARKET_LEN} markets have null network — Supabase migration not applied?"
  else
    check_pass "markets-network-column" "all ${MARKET_LEN} markets have network field set"
  fi

  # ── CHECK 4: oracle prices ─────────────────────────────────────────────
  WITH_PRICE=$(echo "${MARKETS_JSON}" | \
    jq '[.[] | select(.oracle_price != null and (.oracle_price | tonumber? // 0) > 0)] | length' \
    2>/dev/null || echo "0")
  if [ "${WITH_PRICE}" -lt "${MIN_ORACLE_PRICES}" ] 2>/dev/null; then
    check_fail "markets-oracle-prices" \
      "only ${WITH_PRICE}/${MARKET_LEN} markets have oracle price — expected >= ${MIN_ORACLE_PRICES}"
  else
    check_pass "markets-oracle-prices" "${WITH_PRICE}/${MARKET_LEN} markets have oracle price"
  fi

  # ── CHECK 5: funding rate ──────────────────────────────────────────────
  WITH_FUNDING=$(echo "${MARKETS_JSON}" | \
    jq '[.[] | select(.funding_rate != null and .funding_rate != 0)] | length' \
    2>/dev/null || echo "0")
  if [ "${WITH_FUNDING}" -lt 1 ] 2>/dev/null; then
    check_fail "markets-funding-rate" "no markets have funding rate data"
  else
    check_pass "markets-funding-rate" "${WITH_FUNDING} markets have funding rate data"
  fi

  # ── CHECK 6: single market detail ─────────────────────────────────────
  echo ""
  echo "📋 CHECK: /api/markets/[slab]"
  FIRST_SLAB=$(echo "${MARKETS_JSON}" | \
    jq -r '.[0].slab_address // .[0].id // .[0].market_address // ""' 2>/dev/null || echo "")
  if [ -z "${FIRST_SLAB}" ] || [ "${FIRST_SLAB}" = "null" ]; then
    check_fail "single-market" "could not determine slab address from first market"
  else
    SLAB_HTTP=$(curl_get "${BASE_URL}/api/markets/${FIRST_SLAB}" /tmp/smoke_slab.json)
    if [ "${SLAB_HTTP}" != "200" ]; then
      check_fail "single-market-status" "HTTP ${SLAB_HTTP} for slab=${FIRST_SLAB}"
    else
      HAS_DATA=$(jq -r '
        if type == "object" and (has("slab_address") or has("id") or has("market_address"))
        then "yes" else "no" end' /tmp/smoke_slab.json 2>/dev/null || echo "no")
      if [ "${HAS_DATA}" = "yes" ]; then
        check_pass "single-market-data" "detail returned for slab=${FIRST_SLAB}"
      else
        check_fail "single-market-data" "unexpected shape from /api/markets/${FIRST_SLAB}"
      fi
    fi
  fi
fi

# ── SUMMARY ────────────────────────────────────────────────────────────────
echo ""
echo "──────────────────────────────────────────────────────────────────────"
echo "Result: ${PASS} passed, ${FAIL} failed"

if [ "${FAIL}" -gt 0 ]; then
  echo ""
  echo "❌ SMOKE TEST FAILED — ${FAIL} check(s) failed:"
  for c in "${FAILED_CHECKS[@]}"; do
    echo "   • ${c}"
  done
  exit 1
else
  echo ""
  echo "✅ SMOKE TEST PASSED — all ${PASS} checks passed"
  exit 0
fi
