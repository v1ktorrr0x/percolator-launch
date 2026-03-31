# Checklist #4 — Instruction Discriminator + IX_TAG Validation

**Audited by:** Sentinel (security agent)
**Date:** 2026-03-31
**Scope:** `percolator-prog/src/tags.rs`, `percolator-prog/src/percolator.rs` (dispatch + decode), `percolator-sdk/src/abi/instructions.ts` (IX_TAG)
**Status:** CLEAN (1 informational note — pre-existing, tracked in GH#1975)

---

## Methodology

1. Extracted all `TAG_*` constants from `tags.rs` (72 entries, values 0–71)
2. Verified SDK `IX_TAG` in `instructions.ts` against on-chain constants byte-for-byte
3. Traced the three-stage dispatch in `process_instruction` (init_market | core_ops | admin_ops | extended_ops)
4. Verified `Instruction::decode()` match arms for every active tag
5. Confirmed no dispatch fallthrough possible in any arm
6. Confirmed unimplemented stub (tag 58) returns `InvalidInstructionData`
7. Verified test coverage of uniqueness and sequential ordering

---

## Tag Map (Complete)

| Tag | On-chain Constant | SDK IX_TAG | Decode Arm | Handler | Notes |
|-----|-------------------|------------|------------|---------|-------|
| 0 | `TAG_INIT_MARKET` | `InitMarket: 0` | ✅ | `process_init_market()` (direct) | |
| 1 | `TAG_INIT_USER` | `InitUser: 1` | ✅ | `dispatch_core_ops` | |
| 2 | `TAG_INIT_LP` | `InitLP: 2` | ✅ | `dispatch_core_ops` | |
| 3 | `TAG_DEPOSIT_COLLATERAL` | `DepositCollateral: 3` | ✅ | `dispatch_core_ops` | |
| 4 | `TAG_WITHDRAW_COLLATERAL` | `WithdrawCollateral: 4` | ✅ | `dispatch_core_ops` | |
| 5 | `TAG_KEEPER_CRANK` | `KeeperCrank: 5` | ✅ | `dispatch_core_ops` | |
| 6 | `TAG_TRADE_NO_CPI` | `TradeNoCpi: 6` | ✅ | `dispatch_core_ops` | |
| 7 | `TAG_LIQUIDATE_AT_ORACLE` | `LiquidateAtOracle: 7` | ✅ | `dispatch_core_ops` | |
| 8 | `TAG_CLOSE_ACCOUNT` | `CloseAccount: 8` | ✅ | `dispatch_core_ops` | |
| 9 | `TAG_TOP_UP_INSURANCE` | `TopUpInsurance: 9` | ✅ | `dispatch_core_ops` | |
| 10 | `TAG_TRADE_CPI` | `TradeCpi: 10` | ✅ | `dispatch_core_ops` | |
| 11 | `TAG_SET_RISK_THRESHOLD` | `SetRiskThreshold: 11` | ✅ | `dispatch_admin_ops` | |
| 12 | `TAG_UPDATE_ADMIN` | `UpdateAdmin: 12` | ✅ | `dispatch_admin_ops` | |
| 13 | `TAG_CLOSE_SLAB` | `CloseSlab: 13` | ✅ | `dispatch_admin_ops` | |
| 14 | `TAG_UPDATE_CONFIG` | `UpdateConfig: 14` | ✅ | `dispatch_admin_ops` | |
| 15 | `TAG_SET_MAINTENANCE_FEE` | `SetMaintenanceFee: 15` | ✅ | `dispatch_admin_ops` | |
| 16 | `TAG_SET_ORACLE_AUTHORITY` | `SetOracleAuthority: 16` | ✅ | `dispatch_admin_ops` | |
| 17 | `TAG_PUSH_ORACLE_PRICE` | `PushOraclePrice: 17` | ✅ | `dispatch_admin_ops` | |
| 18 | `TAG_SET_ORACLE_PRICE_CAP` | `SetOraclePriceCap: 18` | ✅ | `dispatch_admin_ops` | |
| 19 | `TAG_RESOLVE_MARKET` | `ResolveMarket: 19` | ✅ | `dispatch_admin_ops` | |
| 20 | `TAG_WITHDRAW_INSURANCE` | `WithdrawInsurance: 20` | ✅ | `dispatch_admin_ops` | |
| 21 | `TAG_ADMIN_FORCE_CLOSE` | `AdminForceClose: 21` | ✅ | `dispatch_admin_ops` | |
| 22 | `TAG_UPDATE_RISK_PARAMS` | `UpdateRiskParams: 22` | ✅ | `dispatch_admin_ops` | |
| 23 | `TAG_RENOUNCE_ADMIN` | `RenounceAdmin: 23` | ✅ | `dispatch_admin_ops` | |
| 24 | `TAG_CREATE_INSURANCE_MINT` | `CreateInsuranceMint: 24` | ✅ | `dispatch_admin_ops` | |
| 25 | `TAG_DEPOSIT_INSURANCE_LP` | `DepositInsuranceLP: 25` | ✅ | `dispatch_admin_ops` | |
| 26 | `TAG_WITHDRAW_INSURANCE_LP` | `WithdrawInsuranceLP: 26` | ✅ | `dispatch_admin_ops` | |
| 27 | `TAG_PAUSE_MARKET` | `PauseMarket: 27` | ✅ | `dispatch_admin_ops` | |
| 28 | `TAG_UNPAUSE_MARKET` | `UnpauseMarket: 28` | ✅ | `dispatch_admin_ops` | |
| 29 | `TAG_ACCEPT_ADMIN` | `AcceptAdmin: 29` | ✅ | `dispatch_admin_ops` | |
| 30 | `TAG_SET_INSURANCE_WITHDRAW_POLICY` | `SetInsuranceWithdrawPolicy: 30` | ✅ | `dispatch_admin_ops` | |
| 31 | `TAG_WITHDRAW_INSURANCE_LIMITED` | `WithdrawInsuranceLimited: 31` | ✅ | `dispatch_admin_ops` | |
| 32 | `TAG_SET_PYTH_ORACLE` | `SetPythOracle: 32` | ✅ | `dispatch_extended_ops` | |
| 33 | `TAG_UPDATE_MARK_PRICE` | `UpdateMarkPrice: 33` | ✅ | `dispatch_extended_ops` | |
| 34 | `TAG_UPDATE_HYPERP_MARK` | `UpdateHyperpMark: 34` | ✅ | `dispatch_extended_ops` | |
| 35 | `TAG_TRADE_CPI_V2` | `TradeCpiV2: 35` | ✅ | `dispatch_core_ops` (explicit routing) | |
| 36 | `TAG_UNRESOLVE_MARKET` | `UnresolveMarket: 36` | ✅ | `dispatch_extended_ops` | |
| 37 | `TAG_CREATE_LP_VAULT` | `CreateLpVault: 37` | ✅ | `dispatch_extended_ops` | |
| 38 | `TAG_LP_VAULT_DEPOSIT` | `LpVaultDeposit: 38` | ✅ | `dispatch_extended_ops` | |
| 39 | `TAG_LP_VAULT_WITHDRAW` | `LpVaultWithdraw: 39` | ✅ | `dispatch_extended_ops` | |
| 40 | `TAG_LP_VAULT_CRANK_FEES` | `LpVaultCrankFees: 40` | ✅ | `dispatch_extended_ops` | |
| 41 | `TAG_FUND_MARKET_INSURANCE` | `FundMarketInsurance: 41` | ✅ | `dispatch_extended_ops` | |
| 42 | `TAG_SET_INSURANCE_ISOLATION` | `SetInsuranceIsolation: 42` | ✅ | `dispatch_extended_ops` | |
| 43 | `TAG_CHALLENGE_SETTLEMENT` | `ChallengeSettlement: 43` | ✅ | `dispatch_extended_ops` | |
| 44 | `TAG_RESOLVE_DISPUTE` | `ResolveDispute: 44` | ✅ | `dispatch_extended_ops` | |
| 45 | `TAG_DEPOSIT_LP_COLLATERAL` | `DepositLpCollateral: 45` | ✅ | `dispatch_extended_ops` | |
| 46 | `TAG_WITHDRAW_LP_COLLATERAL` | `WithdrawLpCollateral: 46` | ✅ | `dispatch_extended_ops` | |
| 47 | `TAG_QUEUE_WITHDRAWAL` | `QueueWithdrawal: 47` | ✅ | `dispatch_extended_ops` | |
| 48 | `TAG_CLAIM_QUEUED_WITHDRAWAL` | `ClaimQueuedWithdrawal: 48` | ✅ | `dispatch_extended_ops` | |
| 49 | `TAG_CANCEL_QUEUED_WITHDRAWAL` | `CancelQueuedWithdrawal: 49` | ✅ | `dispatch_extended_ops` | |
| 50 | `TAG_EXECUTE_ADL` | `ExecuteAdl: 50` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 51 | `TAG_CLOSE_STALE_SLAB` | `CloseStaleSlabs: 51` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 52 | `TAG_RECLAIM_SLAB_RENT` | `ReclaimSlabRent: 52` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 53 | `TAG_AUDIT_CRANK` | `AuditCrank: 53` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 54 | `TAG_SET_OFFSET_PAIR` | `SetOffsetPair: 54` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 55 | `TAG_ATTEST_CROSS_MARGIN` | `AttestCrossMargin: 55` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 56 | `TAG_ADVANCE_ORACLE_PHASE` | `AdvanceOraclePhase: 56` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 57 | `TAG_TOPUP_KEEPER_FUND` | `TopUpKeeperFund: 57` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 58 | `TAG_SLASH_CREATION_DEPOSIT` | `SlashCreationDeposit: 58` | ❌ (intentional) | NO handler — `_ => Err(InvalidInstructionData)` | ⚠️ INFORMATIONAL — see below |
| 59 | `TAG_INIT_SHARED_VAULT` | `InitSharedVault: 59` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 60 | `TAG_ALLOCATE_MARKET` | `AllocateMarket: 60` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 61 | `TAG_QUEUE_WITHDRAWAL_SV` | `QueueWithdrawalSV: 61` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 62 | `TAG_CLAIM_EPOCH_WITHDRAWAL` | `ClaimEpochWithdrawal: 62` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 63 | `TAG_ADVANCE_EPOCH` | `AdvanceEpoch: 63` | ✅ | `dispatch_extended_ops` | ADL tag ✅ |
| 64 | `TAG_MINT_POSITION_NFT` | `MintPositionNft: 64` | ✅ | `dispatch_extended_ops` | |
| 65 | `TAG_TRANSFER_POSITION_OWNERSHIP` | `TransferPositionOwnership: 65` | ✅ | `dispatch_extended_ops` | |
| 66 | `TAG_BURN_POSITION_NFT` | `BurnPositionNft: 66` | ✅ | `dispatch_extended_ops` | |
| 67 | `TAG_SET_PENDING_SETTLEMENT` | `SetPendingSettlement: 67` | ✅ | `dispatch_extended_ops` | |
| 68 | `TAG_CLEAR_PENDING_SETTLEMENT` | `ClearPendingSettlement: 68` | ✅ | `dispatch_extended_ops` | |
| 69 | `TAG_TRANSFER_OWNERSHIP_CPI` | `TransferOwnershipCpi: 69` | ✅ | `dispatch_extended_ops` | |
| 70 | `TAG_SET_WALLET_CAP` | `SetWalletCap: 70` | ✅ | `dispatch_extended_ops` | |
| 71 | `TAG_SET_OI_IMBALANCE_HARD_BLOCK` | `SetOiImbalanceHardBlock: 71` | ✅ | `dispatch_extended_ops` | |

---

## Dispatch Architecture

### Top-Level Routing (`process_instruction`)
```text
tag == 0                                   → process_init_market() (direct)
tag in 1-10, 35                            → dispatch_core_ops()
tag in 11-31                               → dispatch_admin_ops()
tag in 32-34, 36-71 (and any unknown)      → dispatch_extended_ops()
```

- **No fallthrough possible**: all arms are exhaustive. Unknown tags > 71 reach `dispatch_extended_ops` → `Instruction::decode()` → `_ => Err(InvalidInstructionData)`. ✅
- **TAG_TRADE_CPI_V2 (35) cross-route**: explicitly listed in the core_ops arm (`TAG_INIT_USER..=TAG_TRADE_CPI | TAG_TRADE_CPI_V2`). Correct — avoids ambiguity. ✅
- **PERC-331 split rationale**: BPF 4 KiB stack limit. Splitting avoids stack overflow in the monolithic 72-arm match. Architecture is sound. ✅

### `Instruction::decode()` (bottom-of-file match)
- Each tag maps to exactly one `Instruction` variant.
- `_ => Err(ProgramError::InvalidInstructionData)` is the explicit catchall. ✅
- Tag 58 (SlashCreationDeposit): **has no arm** → falls through to `_` → returns `InvalidInstructionData`. This is correct and intentional (PERC-629 stub). ✅

---

## Checks Performed

### 1. SDK ↔ On-chain Discriminator Parity
**Result: CLEAN — zero mismatches**

Cross-referenced all 72 on-chain `TAG_*` constants against `IX_TAG` in `percolator-sdk/src/abi/instructions.ts`. Perfect byte-for-byte match across all 72 entries. No stale/orphaned SDK tags detected.

### 2. No Dispatch Fallthrough
**Result: CLEAN**

- `process_instruction`: all ranges are explicit and exhaustive. The `_` arm catches unknowns and routes to `dispatch_extended_ops`.
- `dispatch_core_ops`: `_ => return Err(InvalidInstructionData)` at line ~11695. ✅
- `dispatch_admin_ops`: `_ => return Err(InvalidInstructionData)` at line ~13148. ✅  
- `dispatch_extended_ops`: `_ => return Err(InvalidInstructionData)` at line ~17390. ✅

### 3. ADL Instructions 50-63 (New Range)
**Result: CLEAN**

All 14 ADL-range tags (50–63) verified:
- Each has a `TAG_*` constant in `tags.rs`
- Each has a corresponding `IX_TAG` entry in the SDK
- Each has a `Instruction::decode()` arm (except tag 58 — intentional stub)
- Each has a handler in `dispatch_extended_ops`
- All 14 correctly routed via the `_` arm of `process_instruction` → `dispatch_extended_ops`

### 4. No Instruction Variant Without a Handler
**Result: CLEAN**

Every `Instruction` enum variant has a corresponding match arm in the relevant dispatcher:
- `dispatch_core_ops` handles: InitUser, InitLP, DepositCollateral, WithdrawCollateral, KeeperCrank, TradeNoCpi, LiquidateAtOracle, CloseAccount, TopUpInsurance, TradeCpi, TradeCpiV2
- `dispatch_admin_ops` handles: SetRiskThreshold..=WithdrawInsuranceLimited (21 variants)
- `dispatch_extended_ops` handles: all remaining active variants
- `_ => return Err(InvalidInstructionData)` covers unimplemented variants in each sub-dispatcher ✅

### 5. Tag Uniqueness Tests
**Result: CLEAN**

- `no_duplicate_tags` test: covers all 72 tags, O(n²) uniqueness check. ✅
- `tags_are_sequential` test: covers tags 0–68 for sequential ordering. Tags 69–71 are verified for uniqueness via `no_duplicate_tags` but not covered by the sequential test (see Informational #2 below).

---

## Findings

### ⚠️ INFORMATIONAL-1 — Tag 58 (SlashCreationDeposit) Unimplemented (pre-existing, GH#1975)

**Severity:** LOW (informational — pre-existing, tracked)
**Component:** `percolator-prog/src/tags.rs`, `percolator-prog/src/percolator.rs`

Tag 58 (`TAG_SLASH_CREATION_DEPOSIT`) is defined in `tags.rs` and `IX_TAG` but has no `Instruction` decode arm and no dispatch handler. Any transaction with tag 58 returns `ProgramError::InvalidInstructionData`.

- **Risk:** None currently. The slot is reserved for PERC-629 post-launch. Dead slot in dispatch space. External auditors will flag this as a reserved-but-unimplemented instruction.
- **Evidence:** No `Instruction::SlashCreationDeposit` variant exists. No arm in any decoder. `_ => Err(InvalidInstructionData)` catches it.
- **Resolution:** See GH#1975 — three options: implement, replace with a no-op, or remove and renumber (breaking change). Pre-audit, this must be documented for auditors. **No action needed before mainnet launch.**

### ℹ️ INFORMATIONAL-2 — `tags_are_sequential` test covers 0–68 only

**Severity:** LOW (test coverage gap, not an exploit)
**Component:** `percolator-prog/src/tags.rs`

Tags 69 (`TransferOwnershipCpi`), 70 (`SetWalletCap`), 71 (`SetOiImbalanceHardBlock`) are sequential (0→71 is contiguous) but are not included in the `tags_are_sequential` test. They are covered by `no_duplicate_tags`.

- **Risk:** None — the values are correct and verified by the duplicate test. A future author could incorrectly assign one of these three a non-sequential value without the sequential test catching it.
- **Recommendation:** Add tags 69–71 to `tags_are_sequential` test for completeness. One-line fix.

---

## Overall Result

**CLEAN — 71/72 tags fully implemented and correctly wired. Tag 58 is an intentional stub returning InvalidInstructionData. Zero discriminator mismatches between on-chain and SDK.**

---

## Notes for External Auditors

- Percolator does NOT use Anchor's 8-byte discriminator scheme. It uses a single `u8` tag at `data[0]`. This is intentional for compute efficiency on a hot-path permissioned protocol.
- The three-stage dispatch split (PERC-331) is a BPF stack depth optimization — not a security boundary. Each sub-dispatcher has its own `_ => Err(InvalidInstructionData)` guard.
- Tag 35 (`TradeCpiV2`) is explicitly aliased into `dispatch_core_ops` despite its numeric position in the extended range. This is safe and intentional (avoids sending it to `dispatch_extended_ops`).
- Tag 58 is reserved/unimplemented — see GH#1975.
