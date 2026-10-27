# ZiniPay Gate Verification Lifecycle Matrix

This document defines the cryptographic and state sources used to evaluate each gate of the **Three-Way Match Release Gate** across each stage of a proposal's lifecycle on Sputnik DAO v2 and the ZiniPay `PolicyHelper` smart contract.

---

## Gate Source & Display Matrix

| Proposal Status | Gate 01 [Proof] | Gate 02 [Policy] | Gate 03 [Quorum] | Attestation Row |
|---|---|---|---|---|
| **InProgress** (`pending_quorum`) | Claimed in proposal description (not verified on-chain) `[Amber]` | Live `check_policy` view call on policy contract: *"Would pass if executed now"* `[Green]` or *"Would be blocked now: [panic text]"* `[Red]` or *"Unknown"* `[Amber]` | Real-time on-chain votes: `votes.approve` / `votes.required` `[Amber]` | Claimed in proposal description (not verified on-chain) `[Amber]` |
| **Approved / Settled** (`approved`, `settled`) | Claimed in proposal description (not verified on-chain) `[Amber]` | On-chain settlement record: *"Executed on-chain"* + live `cid_used(cid)` verification + timestamp `[Green]` (Never red) | Quorum consensus reached: `votes.approve >= votes.required` `[Green]` | Claimed in proposal description (not verified on-chain) `[Amber]` |
| **Failed** (`failed`) | Claimed in proposal description (not verified on-chain) `[Amber]` | Contract execution failure: *"Release did not execute"* + on-chain execution error `[Red]` | Consensus or execution state `[Red]` | Claimed in proposal description (not verified on-chain) `[Amber]` |
| **Rejected** (`rejected`) | Claimed in proposal description (not verified on-chain) `[Amber]` | *"Not executed · Proposal rejected"* `[Neutral]` | Council veto consensus `[Red]` | Claimed in proposal description (not verified on-chain) `[Amber]` |
| **Expired / Removed** (`expired`, `removed`) | Claimed in proposal description (not verified on-chain) `[Amber]` | *"Not executed · Proposal expired/removed"* `[Neutral]` | Voting window lapsed or removed by council `[Neutral]` | Claimed in proposal description (not verified on-chain) `[Amber]` |
| **Foreign Proposal** (Not a ZiniPay FunctionCall) | *"Not a ZiniPay release"* `[Neutral]` | *"Not a ZiniPay release"* `[Neutral]` | Standard Sputnik DAO vote counts `[Green/Amber/Red]` | *"Not a ZiniPay release"* `[Neutral]` |

---

## Architectural Rationale

1. **Why `check_policy` must not be called after execution (Approved / Settled)**:
   - When a proposal executes `PolicyHelper::release()`, the contract marks the deliverable CID as used in `used_cids` and starts the recipient's cooldown period.
   - Calling `check_policy` on an already-settled proposal would result in an on-chain panic (`"CID already used — duplicate release attempt blocked"` or `"Cooldown not elapsed"`).
   - Therefore, for **Approved** proposals, Gate 02 confirms on-chain execution, verifies `cid_used(cid) == true`, and displays expiry-safe execution metadata rather than querying pre-flight eligibility.

2. **Why Gate 01 & Attestation never show green passes**:
   - Deliverable CIDs and `[Attestation: sha256:...]` tokens originate from the proposal description submitted by the proposer.
   - Without an on-chain zero-knowledge or DCAP quote verifier contract directly verifying the attestation hash on NEAR, these values are claims rather than on-chain verified proofs.
   - Marking them `"Claimed in proposal description (not verified on-chain)"` in amber guarantees zero-fabrication presentation.
