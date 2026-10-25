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
- **Tightened Funding Requirement**: To protect storage-staked funds and prevent treasury drift, `release` strictly requires `env::attached_deposit() >= amount.0`:
  ```rust
  require!(
      attached >= amount.0,
      "Insufficient attached deposit: attached deposit must cover release payout"
  );
  ```
  The loose `account_balance` fallback was dropped to prevent payouts from dipping into the contract's storage-staked balance.

### 2. Fund Safety & State Commit Invariants
- **Atomic Guardrails**: Before transferring any funds, `release` enforces:
  1. Recipient reputation threshold (`min_reputation`)
  2. Reputation-tier scaled per-proposal cap (`amount <= get_effective_cap(recipient)`)
  3. Cooldown period since last release to that recipient
  4. CID anti-replay (`!used_cids.contains(cid)`)
- **State Committed Before Transfer**: The CID is added to `used_cids` and the timestamp is recorded in `last_release` **before** the outgoing transfer promise (`Promise::new(recipient).transfer(amount)`) is dispatched.
- **Automated Callback with State Rollback (`on_release_done`)**:
  `release` chains a private promise callback:
  ```rust
  Promise::new(recipient.clone())
      .transfer(amount.0)
      .then(
          Self::ext(env::current_account_id())
              .with_static_gas(Gas(5_000_000_000_000))
              .on_release_done(cid, recipient)
      )
  ```
  - **On Success**: The payout is confirmed, logged, and the recipient's on-chain reputation score is automatically increased (+5 pts).
  - **On Failure**: If the transfer promise fails (e.g. nonexistent recipient account), `on_release_done` automatically catches the failure result, unburns the deliverable CID (`used_cids.remove(&cid)`), and clears the cooldown (`last_release.remove(&recipient)`).
  - **Manual Recovery**: As defense-in-depth, the owner recovery methods `unburn_cid` and `reset_cooldown` remain available for administrative interventions.

---

## 🔄 Reputation Synchronization & Pre-Flight Policy Checks

### Who Updates Reputation?
On NEAR Protocol, the agent operates under a restricted function-call access key scoped strictly to `add_proposal` on the Sputnik DAO. To uphold the principle of least privilege, the agent is intentionally forbidden from modifying policy parameters or reputation scores directly on `PolicyHelper`.

Instead, on-chain reputation synchronization is handled through two verified paths:
1. **Automated On-Chain Payout Callback (`on_release_done`)**: When Sputnik DAO approves a proposal, `PolicyHelper.release` is invoked. Upon confirmation of the payout transfer via the NEAR promise callback, `on_release_done` automatically increments the recipient's reputation score on-chain (+5 points per settled milestone).
2. **DAO / Owner Administration**: The Sputnik DAO can vote on a `FunctionCall` proposal targeting `update_reputation(account, delta)`, or the contract owner can invoke `update_reputation` directly using their admin key.

### Pre-Flight `check_policy` Verification
Before dispatching any proposal to the Sputnik DAO, the agent performs a read-only `check_policy` view call on `PolicyHelper`. If the proposed amount exceeds the contributor's on-chain tier cap, if the cooldown has not elapsed, or if the CID has already been settled, the agent immediately rejects the action and never submits a doomed proposal to the DAO.

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
