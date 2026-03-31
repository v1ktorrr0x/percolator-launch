# Checklist #5 — Arithmetic Overflow/Underflow Review

**Audited by:** Sentinel (security agent)
**Date:** 2026-03-31
**Scope:** `percolator-prog/src/percolator.rs` (verify module), `percolator/src/percolator.rs` (risk engine), `percolator/src/wide_math.rs`
**Task:** PERC-8362
**Status:** CLEAN with 1 low-severity finding (ARI-01)

---

## Methodology

1. Extracted all arithmetic operations (`+`, `-`, `*`, `/`, bit-shifts, casts) from security-critical paths
2. Verified each division site has a zero-guard before the divisor
3. Checked all numeric casts (`as u64`, `as i64`, `as u128`, `as i128`) for truncation/sign-wrap risk
4. Reviewed saturating/checked/wrapping usage for intentionality
5. Cross-checked with existing Kani proofs covering funded arithmetic

---

## Findings

### ARI-01 — LOW: Missing upper-bound validation on `funding_horizon_slots` (u64 → i64 cast)

**Location:** `percolator-prog/src/percolator.rs` line 347  
**Severity:** LOW

**Description:**  
`compute_inventory_funding_bps_per_slot` casts `funding_horizon_slots: u64` to `i64` for division. If an admin sets `funding_horizon_slots > i64::MAX` (9,223,372,036,854,775,807 slots ≈ 116 years), the cast wraps to a negative value, causing division to flip the sign of `per_slot`. The result is immediately clamped to `[-10_000, 10_000]` bps, so this does not cause a fund drain.

The same cast pattern appears at line 5971 (`funding_horizon_slots as i128`), which is safe because i128 covers the full u64 range.

**Affected component:** `verify::compute_inventory_funding_bps_per_slot` → `UpdateFundingParams` instruction

**Reproduction:** Set `funding_horizon_slots = u64::MAX` via `UpdateFundingParams`. The function returns a funding rate with the wrong sign (direction), clamped to the policy max.

**Exploit preconditions:** Admin key required to call `UpdateFundingParams`. No financial loss possible — effect is a briefly incorrect funding direction, not a drainable amount.

**Remediation:** Add validation in `UpdateFundingParams` handler:
```rust
if funding_horizon_slots > i64::MAX as u64 {
    return Err(PercolatorError::InvalidConfigParam.into());
}
```

---

## Clean Items Verified

| Component | Check | Result |
|-----------|-------|--------|
| `compute_inventory_funding_bps_per_slot` | `funding_horizon_slots == 0` guard before division | ✅ CLEAN (line 303) |
| `compute_inventory_funding_bps_per_slot` | `premium_bps_u as i64` cast: clamped to `funding_max_premium_bps.unsigned_abs()` which ≤ i64::MAX | ✅ CLEAN |
| `compute_inventory_funding_bps_per_slot` | `scale = funding_inv_scale_notional_e6.max(1)` prevents div-by-zero | ✅ CLEAN |
| `compute_inventory_funding_bps_per_slot` | All u128 arithmetic uses `saturating_*` | ✅ CLEAN |
| `compute_premium_funding_bps_per_slot` | `funding_horizon_slots as i128` — safe, i128 covers full u64 | ✅ CLEAN |
| `compute_vram_margin_bps` | `target_vol_e6 == 0` guard before division | ✅ CLEAN (early return) |
| `trade_notional_e6_from_size` | `checked_div(1_000_000).unwrap_or(0)` — safe | ✅ CLEAN |
| `compute_adl_close_abs` | `checked_mul` with fallback to `abs_pos` — Kani-proven | ✅ CLEAN |
| `compute_fee_multiplier_bps` | Segment 2: `excess * range_mult` max = 3000 × 15000 = 45M < u64::MAX | ✅ CLEAN |
| `compute_fee_multiplier_bps` | Segment 3: `excess * range_mult` max = 2000 × 50000 = 100M < u64::MAX | ✅ CLEAN |
| `compute_fee_multiplier_bps` | Over-utilization (> 10000) → capped at `FEE_MULT_MAX_BPS` | ✅ CLEAN |
| `compute_util_bps` | `max_oi == 0` guard before division | ✅ CLEAN |
| OI ramp (`apply_oi_ramp`) | `oi_ramp_slots == 0` guard; `elapsed >= oi_ramp_slots` guard before division | ✅ CLEAN |
| CMOR credit reduction | `(m as u128).saturating_sub(reduction).max(1)` — floor at 1 bps | ✅ CLEAN |
| Pyth price conversion | `checked_mul` with `EngineOverflow` error; overflow check before `as u64` cast | ✅ CLEAN |
| Chainlink price conversion | Staleness and zero-price guards before use | ✅ CLEAN |
| `scale_price_e6` | `unit_scale <= 1` guard; zero-result check after division | ✅ CLEAN |
| `isqrt_u32` | `x <= 1` early return; Newton-Raphson on u32 range only | ✅ CLEAN |
| Mark price EMA | All u128 with `saturating_*`; `min(u64::MAX)` clamp before cast | ✅ CLEAN |
| Wide arithmetic (wide_math.rs) | U256/I256 with checked ops; Kani proofs | ✅ CLEAN |
| `apply_cmor_credit` | `initial_margin >= maintenance` invariant maintained after reduction | ✅ CLEAN |
| BH5 liquidation | Not in percolator.rs scope — covered by percolator core Kani proofs | ✅ See PERC-8350 |

---

## Summary

**1 finding: ARI-01 (LOW)** — `funding_horizon_slots` missing upper-bound validation (admin-only, no fund loss, clamped output). GitHub issue to be filed.

All financial calculations (PnL, fees, margin, funding, OI caps) use safe arithmetic patterns: `saturating_*` for u128 accumulation, `checked_*` with error propagation for multiplication before narrowing casts, and explicit zero-guards before every division site.

The one exception (ARI-01) is a config-validation gap requiring admin privilege to trigger, with no financial impact beyond a temporarily wrong funding direction.
