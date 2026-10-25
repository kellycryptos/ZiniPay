# ZiniPay — Contracts & Policy Helper Reference

This directory contains the smart contract and reference architecture for ZiniPay's on-chain policy layer:
1. **`contracts/policy-helper`**: Custom Rust NEAR smart contract enforcing spend caps, reputation tier multipliers, cooldowns, CID anti-replay, and atomic payouts.
2. **Sputnik DAO v2 Integration**: Standard Sputnik DAO v2 multisig contracts deployed at `*.sputnik-dao.near` / `*.sputnik-dao.testnet`.

---

## 💸 On-Chain Fund Flow Explained

A policy contract that cannot actually pay is useless. ZiniPay provides a robust, atomic fund flow:

```
┌─────────────────┐       FunctionCall Proposal       ┌─────────────────────┐       Promise.transfer       ┌────────────────┐
│  Sputnik DAO    │ ────────────────────────────────> │ Policy Helper       │ ───────────────────────────> │ Contributor    │
│  Treasury       │   deposit: payoutAmount (NEAR)    │ Contract            │      payoutAmount (NEAR)     │ Recipient      │
└─────────────────┘   args: { recipient, amount, cid }└─────────────────────┘                              └────────────────┘
```

### 1. How Funds Reach the Contract
When a proposal passes the council multi-sig vote in Sputnik DAO, the DAO executes the proposal's `FunctionCall` action:
- **Target Contract**: `policy-helper.testnet`
- **Method**: `release(recipient, amount, cid)`
- **Attached Deposit**: The DAO attaches the exact payout amount (`attachedDeposit = amount`).
- **Alternative (Pre-Funded Treasury Pool)**: The DAO or community can alternatively fund the `policy-helper` contract directly. `release` checks:
  ```rust
  require!(
      attached >= amount.0 || env::account_balance() >= amount.0,
      "Insufficient funds to fulfill release payout"
  );
  ```
  This guarantees that the contract can pay out either via attached deposit from the DAO or from its own treasury balance.

### 2. Fund Safety & State Commit Invariants
- **Atomic Guardrails**: Before transferring any funds, `release` enforces:
  1. Recipient reputation threshold (`min_reputation`)
  2. Reputation-tier scaled per-proposal cap (`amount <= get_effective_cap(recipient)`)
  3. Cooldown period since last release to that recipient
  4. CID anti-replay (`!used_cids.contains(cid)`)
- **State Committed Before Transfer**: The CID is added to `used_cids` and the timestamp is recorded in `last_release` **before** the outgoing transfer promise (`Promise::new(recipient).transfer(amount)`) is dispatched.
- **Failed Transfer Handling & Owner Recovery**:
  In NEAR's asynchronous cross-contract call model, if an external transfer fails (e.g., recipient account is deleted or invalid), the attached funds are refunded to the contract balance.
  - To prevent double-spend exploits, the CID remains **burned** by default.
  - If a human admin audits the failed transfer and verifies the contributor was not paid, the owner account can invoke the recovery functions:
    - `unburn_cid(cid)`: Re-enables the deliverable CID for a future valid payout proposal.
    - `reset_cooldown(recipient)`: Clears the cooldown for the affected recipient.

---

## 🔒 Authorization & Security

- **`assert_owner_or_dao`**: Strictly restricts `release`, `record_release`, and `update_reputation` to:
  1. The contract `owner` account
  2. The exact designated `dao_account_id` configured at initialization
  Arbitrary third-party accounts (e.g. `attacker.sputnik-evil.testnet`) fail with an explicit panic.
- **Admin Functions**: `set_dao_account_id`, `set_per_proposal_cap`, `set_cooldown_seconds`, `set_min_reputation`, `unburn_cid`, and `reset_cooldown` are restricted to `owner` only.

---

## 🧪 Unit Tests

Unit tests in `contracts/policy-helper/src/lib.rs` verify:
1. Attacker accounts (`x.sputnik-evil.testnet`) fail `update_reputation`, `record_release`, and `release`.
2. Duplicate CIDs fail on the second attempt (anti-replay).
3. Cooldown periods are enforced between subsequent payouts to the same recipient.
4. Per-proposal caps are strictly enforced for Bronze (1.0x), Silver (1.5x), and Gold (2.0x) tiers.
5. Owner recovery (`unburn_cid` and `reset_cooldown`) restores deliverable eligibility.
