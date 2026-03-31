# Checklist #7 — Access Control Completeness Review

**Audited by:** Sentinel (security agent)
**Date:** 2026-03-31
**Scope:** `percolator-prog/src/percolator.rs` — all instruction handlers
**Task:** PERC-8367
**Status:** CLEAN — no privilege escalation or missing guards found

## Summary

Reviewed all 72 instruction tags for correct access control. All admin-privileged instructions correctly gate on `require_admin(header.admin, signer.key)`. No unauthorized access path found.

## Access Control Matrix (Key Instructions)

| Category | Instructions | Guard | Result |
|----------|-------------|-------|--------|
| Admin-privileged | UpdateAdmin, CloseSlab, UpdateConfig, SetMaintenanceFee, SetOracleAuthority, SetOraclePriceCap, ResolveMarket, WithdrawInsurance, AdminForceClose, UpdateRiskParams, RenounceAdmin, CreateInsuranceMint, PauseMarket, UnpauseMarket, SetPythOracle, UnresolveMarket, CreateLpVault, FundMarketInsurance, SetInsuranceIsolation, ChallengeSettlement, ResolveDispute, SetInsuranceWithdrawPolicy, UpdateFundingParams, SetWalletCap, SetOiImbalanceHardBlock, SetOffsetPair, DepositLpCollateral, WithdrawLpCollateral, InitSharedVault, AllocateMarket | `require_admin(header.admin, a_admin.key)?` | ✅ ALL GATED |
| Oracle authority | PushOraclePrice | `config.oracle_authority == a_authority.key` + zero-address check | ✅ CLEAN |
| ADL keeper | ExecuteAdl | `require_admin(header.admin, a_keeper.key)?` — admin = keeper auth | ✅ CLEAN |
| Keeper-as-admin | SetPendingSettlement, ClearPendingSettlement | GH#1475 guard: `require_admin(header.admin, a_keeper.key)` | ✅ CLEAN (intentional) |
| UpdateMarkPrice crank | UpdateMarkPrice | Permissionless — Pyth-pinned mode only, EMA circuit breaker | ✅ BY DESIGN |
| UpdateHyperpMark crank | UpdateHyperpMark | Permissionless — anti-CPI guard (stack height > 1 rejected) | ✅ BY DESIGN + anti-sandwich |
| KeeperCrank | KeeperCrank | Permissionless when `caller_idx=u16::MAX`; signed when caller_idx used | ✅ BY DESIGN |
| Liquidation | LiquidateAtOracle | Permissionless — oracle staleness guard | ✅ BY DESIGN |
| Two-step admin transfer | UpdateAdmin + AcceptAdmin | UpdateAdmin: require_admin; AcceptAdmin: pending_admin match | ✅ CLEAN |
| RenounceAdmin | RenounceAdmin | require_admin + RESOLVED guard + confirmation code 0x52454E4F554E4345 | ✅ CLEAN |
| Creator | DepositCreatorCollateral, WithdrawCreatorCollateral | PDA-derived creator_lock account checks creator_key | ✅ CLEAN |
| User operations | DepositCollateral, WithdrawCollateral, TradeNoCpi, TradeCpi(V2), CloseAccount, InitUser, MintPositionNft, BurnPositionNft, TransferPositionOwnership | User index ownership checks | ✅ CLEAN |

## Notable Security Properties

1. **No keeper allowlist bypass**: Keeper instructions (ExecuteAdl, SetPendingSettlement, ClearPendingSettlement) all require `header.admin` signer — there is no separate keeper key that could be compromised independently.

2. **Anti-sandwich on oracle cranks**: `UpdateHyperpMark` rejects CPI invocations (stack height guard). `UpdateMarkPrice` uses EMA with 8-hour window + circuit breaker — cannot be manipulated in a single block.

3. **PushOraclePrice zero-authority block**: If `oracle_authority == [0;32]`, PushOraclePrice returns `EngineUnauthorized` — prevents open oracle mode.

4. **Two-step admin transfer**: Cannot lock out current admin — new admin must explicitly call `AcceptAdmin`. Default Pubkey rejected.

5. **RenounceAdmin triple-guard**: Admin key + RESOLVED state + confirmation magic code.

6. **No TAG_SLASH_CREATION_DEPOSIT (58) dispatch**: Confirmed in checklist #4 — returns `InvalidInstructionData`.

## No Findings
Access control completeness: **PASS** for all 72 instruction tags.
