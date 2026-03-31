# Checklist #3 — PDA Derivation Correctness

**Audited by:** Sentinel (security agent)
**Date:** 2026-03-31
**Scope:** `percolator-prog/src/percolator.rs` — all PDA derivations
**Status:** CLEAN

---

## PDAs Reviewed

| PDA | Seeds | program_id Source | Validated at Use? | Result |
|-----|-------|-------------------|-------------------|--------|
| vault_authority | `["vault", slab_key]` | runtime `program_id` arg | ✅ `expect_key()` via `pda_key_matches` | CLEAN |
| insurance_lp_mint | `["ins_lp", slab_key]` | runtime `program_id` | ✅ `expect_key()` | CLEAN |
| lp_vault_state | `["lp_vault", slab_key]` | runtime `program_id` | ✅ `expect_key()` | CLEAN |
| lp_vault_mint | `["lp_vault_mint", slab_key]` | runtime `program_id` | ✅ `expect_key()` | CLEAN |
| loyalty_stake | `["loyalty", slab_key, user_key]` | runtime `program_id` | ✅ `expect_key()` | CLEAN |
| dispute | `["dispute", slab_key]` | runtime `program_id` | ✅ `expect_key()` | CLEAN |
| withdraw_queue | `["withdraw_queue", slab_key, user_key]` | runtime `program_id` | ✅ `expect_key()` | CLEAN |
| keeper_fund | `[KEEPER_FUND_SEED, slab_key]` | runtime `program_id` | ✅ direct equality check | CLEAN |
| lp_pda (V1) | `["lp", slab_key, lp_idx]` | runtime `program_id` | ✅ `pda_key_matches` | CLEAN |
| lp_pda (V2) | `["lp", slab_key, lp_idx, bump]` | runtime `program_id` | ✅ `create_program_address` + `pda_key_matches` | CLEAN |
| creator_lock | `["creator_lock", slab_key, user_key]` | runtime `program_id` | ✅ direct equality check | CLEAN |
| cmor_pair | `["cmor_pair", min(slab_a,slab_b), max(slab_a,slab_b)]` | runtime `program_id` | ✅ `a_pair_pda.key != &expected_pda` | CLEAN |
| ins_policy | `["ins_policy", slab_key]` | runtime `program_id` | ✅ | CLEAN |
| NFT mint_authority | `["mint_authority"]` | `a_nft_prog.key` (validated executable + loader-owned) | ✅ executable + owner checks | CLEAN |

---

## Checks Performed

### 1. User-Supplied program_id in PDA Derivation
**Result: CLEAN**

All PDA derivations pass `program_id` from the runtime entrypoint (`process_instruction(program_id, ...)`). Zero instances of user-supplied program IDs being passed to `find_program_address` or `create_program_address`.

Exception reviewed: `TransferPositionOwnership` uses `a_nft_prog.key` as program_id for the NFT mint_authority PDA. This is intentional and safe — `a_nft_prog` is validated to be a legitimate executable program via:
- `a_nft_prog.executable == true`
- `a_nft_prog.owner` ∈ `{bpf_loader_upgradeable, bpf_loader, bpf_loader_deprecated}`

An attacker cannot pass an arbitrary account: non-executable accounts and non-loader-owned programs are rejected before the PDA derivation.

### 2. Bump Seed Storage and Reuse (Bump Grinding Prevention)
**Result: CLEAN**

- V2 TradeCpi path: caller provides bump, verified via `create_program_address` + `pda_key_matches`. An incorrect bump will cause `create_program_address` to produce a wrong key → rejected.
- All stored bumps are written from the output of `find_program_address` (canonical bump).
- No instances of arbitrary user-provided bumps accepted without re-verification.

### 3. Seed Confusion / Collision Risks
**Result: CLEAN**

- `cmor_pair` uses lexicographic ordering (`slab_a < slab_b`) to produce a symmetric PDA — reviewed and correct. This prevents a pair(A,B) ≠ pair(B,A) collision.
- `loyalty_stake` and `withdraw_queue` include both `slab_key` and `user_key` — user-specific PDAs are correctly namespaced.
- No two PDA types share the same prefix byte array (distinct prefixes: "vault", "ins_lp", "lp_vault", "lp_vault_mint", "loyalty", "dispute", "withdraw_queue", "lp", "keeper_fund", "ins_policy", "cmor_pair", "cmor", "creator_lock").

### 4. Vault PDA Isolation
**Result: CLEAN**

Vault authority PDA `["vault", slab_key]` is derived per-market (slab_key is the market key). No cross-market vault authority derivation possible.

---

## Findings
**NONE** — All PDA derivations are correct, verified at point of use, and free from seed confusion or user-supplied program_id vulnerabilities.

---

## Notes for Auditors
- The V2 TradeCpi caller-provided bump optimization (PERC-154) is safe: `create_program_address` verifies the bump is correct before use.
- The NFT `a_nft_prog.key` usage in `find_program_address` has a hardening comment and proper executable/owner checks (added in a prior hardening pass).
