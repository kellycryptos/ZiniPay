# ZiniPay

> Constrained agent layer for community treasuries. Agents propose payouts, contracts enforce policy, humans approve.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Network: NEAR Testnet](https://img.shields.io/badge/Network-NEAR%20Testnet-00EC97.svg)](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-1.80+-DEA584.svg)](https://www.rust-lang.org)

---

## 1. For Judges / AI Reviewers (Do X → See Y)

You can verify the entire codebase and testnet deployment in under 5 minutes with **zero private keys, zero wallet setup, and no `.env` required**:

```bash
# Step 1: Install dependencies (~10s)
npm install
```
**See**: Clean dependency installation across all workspace packages (`agent`, `frontend`).

```bash
# Step 2: Run agent unit test suite (~8s)
npm test --prefix agent
```
**See**: `14 passed`. Verifies schema-level prompt injection defense, GitHub PR metadata parsing, CID canonicalization, and anti-replay guards.

```bash
# Step 3: Run keyless testnet verification suite (~15s)
npm run verify:testnet
```
**See**: `24 PASSED / 0 UNVERIFIED / 0 FAILED`. Queries public NEAR testnet RPCs to confirm:
- Active Sputnik DAO v2 council with 2-of-2 multi-sig quorum (`zinipay-c1.testnet`, `zinipay-c2.testnet`).
- Agent proposer isolation: `agentzinipaytestnet.testnet` holds `Requestor` role only (0 council seats, 0 voting keys).
- Active Rust `PolicyHelper` contract bound strictly to DAO treasury.
- Contributor reputation score (Silver tier: 15 NEAR cap) and deliverable CID burn status (`cid_used: true`).
- 14 confirmed on-chain transaction receipts (proposal creation, council approvals, promotion, and 5 blocked attack transactions reverted with exact contract panic messages).

```bash
# Step 4: Run independent proposal verifier (~5s)
npm run verify:proposal -- 5
```
**See**: `✓ STATE CHECKS PASSED`. Cross-references Sputnik DAO Proposal #5 on-chain against `PolicyHelper` spend limits and anti-replay registry. *(To test fail-closed rejection on a non-release proposal, run `npm run verify:proposal -- 0`)*.

```bash
# Step 5: Test agent deliberation & pre-flight policy check locally (~5s, dry run)
npm run agent:propose -- \
  --task "Implement Sputnik DAO Three-Way Gate" \
  --deliverable "https://github.com/kellycryptos/ZiniPay/pull/2" \
  --recipient "zinipay-recipient2.testnet" \
  --amount 0.1 \
  --github-handle kellycryptos \
  --dry-run
```
**See**: Agent verifies pull request metadata and explicit `zinipay-recipient` binding, queries live testnet `PolicyHelper` view method for tier limits, and constructs a valid Sputnik DAO `FunctionCall` proposal with zero token expenditure.

```bash
# Step 6 (Optional): Run smart contract unit tests (~5s, requires Rust toolchain)
cd contracts/policy-helper && cargo test && cd ../..
```
**See**: `test result: ok. 20 passed; 0 failed`. Verifies spend caps, caller authorization, cooldown logic, case-variant anti-replay normalization, and atomic rollback callbacks.

---

## 2. Problem

If decentralized treasuries give autonomous AI agents direct wallet signing keys to pay out bounties, prompt injections or software bugs can immediately drain the treasury with no rollback. 

Conversely, if human councils must manually inspect every pull request and milestone deliverable, bounty payouts bottleneck and fail to scale.

Current community treasuries face four critical failure modes when adopting autonomous agents:
1. **Unbounded Drain**: Compromised agents with direct transfer keys can liquidate treasury balances in a single transaction.
2. **Replay Attacks**: Contributors can submit identical deliverables or pull requests multiple times to collect repeated payouts.
3. **Deliverable Theft**: Attackers can claim existing merged pull requests authored by other contributors to siphon funds.
4. **Prompt Injection & Hallucinated Milestones**: Malicious pull request content can manipulate agent prompts into approving incomplete or nonexistent deliverables.

---

## 3. Solution (What ZiniPay Actually Does)

ZiniPay is a fail-closed execution layer that enables autonomous AI agents to evaluate contributor deliverables and draft treasury payout proposals without granting them direct custody or unilateral signing authority.

ZiniPay solves agent treasury risk through a **Three-Way Release Gate**:

1. **Gate 1: Deliverable Verification (Off-Chain)**:
   - Validates that the GitHub pull request is merged into the designated target repository.
   - Verifies the commit author matches the contributor's claimed identity.
   - Strictly parses the PR body for an explicit recipient identity binding directive (`zinipay-recipient: <account.testnet>`) to eliminate deliverable theft.
   - Strips transport prefixes from IPFS CIDs down to canonical base32/base58 hashes.
   - Deliberates using dual agent personas (Inspector and Risk Arbiter) with strict Zod structured outputs.

2. **Gate 2: Programmatic Policy Enforcement (On-Chain Rust Smart Contract)**:
   - Payout proposals cannot execute raw NEAR transfers; they must invoke `PolicyHelper::release` on `zinipay-policy2.testnet`.
   - Asserts caller identity: `PolicyHelper` executes disbursements **only** when called by the designated Sputnik DAO contract (`zinipay-demo.sputnikv2.testnet`).
   - Enforces reputation-scaled per-proposal spend caps:
     - **Bronze Tier (0–19 pts)**: 1.0x multiplier (10 NEAR cap)
     - **Silver Tier (20–59 pts)**: 1.5x multiplier (15 NEAR cap)
     - **Gold Tier (60+ pts)**: 2.0x multiplier (20 NEAR cap)
   - Enforces per-recipient cooldown timers (e.g. 24 hours between payouts).
   - Permanently burns deliverable CIDs into an on-chain `UnorderedSet` (`used_cids`). Duplicate attempts fail immediately with: `"CID already used — duplicate release attempt blocked"`.
   - Normalizes CIDs (`normalize_cid`) at contract level to defeat case-variant bypass attempts.

3. **Gate 3: Multi-Sig Human Quorum (Sputnik DAO v2 Governance)**:
   - The AI agent operates under a restricted **Requestor** role. It holds zero council seats and zero voting keys.
   - Proposals require an M-of-N human council multi-sig quorum (2-of-2 on testnet) to vote `VoteApprove`.
   - If the downstream NEAR transfer fails, an on-chain callback (`on_release_done`) automatically rolls back CID consumption and resets cooldown timers.

---

## 4. How It Works (Flow + Diagram)

### Execution Sequence

```
[1. Contributor] ── Submits PR/CID with "zinipay-recipient: <account.testnet>"
       │
       ▼
[2. Agent Layer] ── Verifies PR merge, author, & recipient directive
       │            Runs Inspector & Risk Arbiter deliberation
       ▼
[3. Policy Check] ── Calls PolicyHelper.check_policy() view function
       │            Asserts within tier cap (e.g. <= 15N), cooldown elapsed, CID unburned
       ▼
[4. Proposal] ────── Calls Sputnik DAO add_proposal (Requestor role, 0 voting keys)
       │            Payload: FunctionCall -> PolicyHelper::release(recipient, amount, cid)
       ▼
[5. Human Vote] ──── Council Member 1 signs VoteApprove (1/2)
       │            Council Member 2 signs VoteApprove (2/2 quorum reached)
       ▼
[6. Settlement] ──── Sputnik DAO calls PolicyHelper::release
                    ├─ Contract verifies caller == DAO
                    ├─ Contract verifies amount <= effective tier cap
                    ├─ Contract burns canonical CID & sets cooldown
                    ├─ Contract transfers NEAR to recipient
                    └─ Callback on_release_done verifies transfer or triggers rollback
```

### Attack Scenarios and Mitigation Matrix

| Attack Vector | Attacker Action | Layer of Defense | Exact System Response |
| :--- | :--- | :--- | :--- |
| **Deliverable Theft** | Submitting another contributor's merged PR | Gate 1 (Agent Deliberation) | Fails PR author and `zinipay-recipient` binding checks; proposal aborted before creation. |
| **CID Replay** | Re-submitting an already-settled PR / CID | Gate 2 (`PolicyHelper` Contract) | Transaction reverts with contract panic: `"CID already used — duplicate release attempt blocked"`. |
| **Case-Variant Replay** | Submitting `KELLYCRYPTOS/ZINIPAY#2` to bypass string check | Gate 2 (`PolicyHelper` Contract) | `normalize_cid` forces lowercase ascii; reverts with `"CID already used"`. |
| **Over-Cap Payout** | Requesting payout exceeding contributor tier limit | Gate 2 (`PolicyHelper` Contract) | Reverts with: `"Amount ... exceeds effective tier cap ... for recipient ..."`. |
| **Unauthorized Direct Call** | Malicious actor calls `PolicyHelper::release` directly | Gate 2 (`PolicyHelper` Contract) | Reverts with: `"Only owner or designated DAO can call this"`. |
| **Prompt Injection** | Embedding injection commands in deliverable description | Gate 1 (Zod Schema Validation) | Parser strips unescaped payloads and enforces strict typed outputs; ignores instruction hijacking. |
| **Agent Key Compromise** | Rogue agent attempts to self-approve payout | Gate 3 (Sputnik DAO Policy) | Impossible on-chain: agent holds `Requestor` role only; has zero voting permissions. |
| **Transfer Failure** | Payout promise fails due to recipient account issue | Gate 2 (Contract Callback) | `on_release_done` detects failure, removes CID from `used_cids`, resets cooldown. |

---

## 5. Live Proof (Testnet Transactions)

Every claim in ZiniPay is backed by verifiable on-chain transactions on NEAR Testnet:

### Core Governance & Payout Lifecycle Proofs

| Lifecycle Stage | Transaction Hash | Explorer Link | Result |
| :--- | :--- | :--- | :--- |
| **Proposal #6 Creation** | `HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK` | [NEARBlocks](https://testnet.nearblocks.io/txns/HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK) | Agent submits `FunctionCall` proposal targeting `PolicyHelper::release` |
| **Council 1 Approval** | `22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD` | [NEARBlocks](https://testnet.nearblocks.io/txns/22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD) | Council 1 (`zinipay-c1.testnet`) votes `VoteApprove` (1/2) |
| **Council 2 Approval & Execution** | `2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d` | [NEARBlocks](https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d) | Council 2 (`zinipay-c2.testnet`) votes `VoteApprove`; 2/2 quorum reached; +0.1 NEAR disbursed |
| **Council Reputation Promotion** | `DfpR26Q4qgoXw1oBh481vBkizypsrME6HLwjHj3gKvYf` | [NEARBlocks](https://testnet.nearblocks.io/txns/DfpR26Q4qgoXw1oBh481vBkizypsrME6HLwjHj3gKvYf) | Recipient promoted to Silver Tier (25 pts; 1.5x cap = 15 NEAR) |
| **Proposal #5 Historical Audit** | `H86k4iESXPQAQJ4ugixJ4rWh7dcVtPw1UeBE5iJD3B1b` | [NEARBlocks](https://testnet.nearblocks.io/txns/H86k4iESXPQAQJ4ugixJ4rWh7dcVtPw1UeBE5iJD3B1b) | Baseline audit proposal targeting `PolicyHelper::release` (Approved) |

### Blocked Attack Transactions (Reverted On-Chain)

| Attack Test | Transaction Hash | Explorer Link | On-Chain Reversion Assertions |
| :--- | :--- | :--- | :--- |
| **Blocked Replay CID** | `9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb` | [NEARBlocks](https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb) | Reverted: `"CID already used — duplicate release attempt blocked"` |
| **Blocked Over-Cap Spend** | `EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ` | [NEARBlocks](https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ) | Reverted: `"Amount 16000000000000000000000000 exceeds effective tier cap 15000000000000000000000000"` |
| **Blocked Unauthorized Caller** | `2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B` | [NEARBlocks](https://testnet.nearblocks.io/txns/2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B) | Reverted: `"Only owner or designated DAO can call this"` |
| **Blocked Case-Variant Replay** | `EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y` | [NEARBlocks](https://testnet.nearblocks.io/txns/EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y) | Reverted: `"CID already used — duplicate release attempt blocked"` |
| **Blocked Cooldown Violation** | `2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD` | [NEARBlocks](https://testnet.nearblocks.io/txns/2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD) | Reverted: `"Cooldown not elapsed. 16 seconds remaining."` |

### DAO-Controlled Administrative Governance Proofs

| Governance Action | Transaction Hash | Explorer Link | Result |
| :--- | :--- | :--- | :--- |
| **Ownership Transfer to DAO** | `BmUTUzULrCCNDK1GTpwmq5QMLgvwPbFjGAjDjVnwZwJX` | [NEARBlocks](https://testnet.nearblocks.io/txns/BmUTUzULrCCNDK1GTpwmq5QMLgvwPbFjGAjDjVnwZwJX) | PolicyHelper ownership transferred to `zinipay-demo.sputnikv2.testnet` |
| **Blocked Former Owner Action** | `EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14` | [NEARBlocks](https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14) | Direct admin call by former owner rejected on-chain |
| **DAO Admin Proposal #7 Creation** | `73JaSgQv8G51VdKTPnYwVasWFogd3EvDDzCr1dx6VJix` | [NEARBlocks](https://testnet.nearblocks.io/txns/73JaSgQv8G51VdKTPnYwVasWFogd3EvDDzCr1dx6VJix) | Sputnik DAO proposal to execute `update_reputation` |
| **Council 1 Approval (#7)** | `Cs4sLs72XeLiv5yAG8qnTHJVXDfkV7e1tg46pyoK6Vk8` | [NEARBlocks](https://testnet.nearblocks.io/txns/Cs4sLs72XeLiv5yAG8qnTHJVXDfkV7e1tg46pyoK6Vk8) | Council 1 votes `VoteApprove` |
| **Council 2 Approval & Exec (#7)** | `3xqHqNnvstR7uTFdV1cvpajw7BSPAxMXLgRLRyBZUYkw` | [NEARBlocks](https://testnet.nearblocks.io/txns/3xqHqNnvstR7uTFdV1cvpajw7BSPAxMXLgRLRyBZUYkw) | Quorum reached; admin call executed through Sputnik DAO multi-sig |

---

## 6. Verification

### Public Proposal Verifier: `npm run verify:proposal`

ZiniPay includes an independent, keyless proposal verification tool (`scripts/verify-proposal.mjs`) that allows judges to inspect and audit any Sputnik DAO proposal against `PolicyHelper` on-chain state without configuring credentials.

#### Usage
```bash
npm run verify:proposal -- <proposal_id>
```

#### Example: Verifying Proposal #5
```bash
npm run verify:proposal -- 5
```

#### What the Verifier Does
1. **Queries Sputnik DAO v2**: Fetches the on-chain proposal by ID from `zinipay-demo.sputnikv2.testnet` via public RPC.
2. **Validates Target**: Confirms the proposal's `receiver_id` is strictly `zinipay-policy2.testnet` and the method is `release`.
3. **Decodes Payout Parameters**: Decodes the Base64 args payload into recipient (`zinipay-recipient2.testnet`), amount (`0.10 NEAR`), and deliverable identifier (`kellycryptos/ZiniPay#1`).
4. **Queries `PolicyHelper` State**: Calls view methods on `zinipay-policy2.testnet` to verify contract owner, designated DAO, recipient reputation score, effective tier cap, and CID anti-replay burn status.
5. **Audits Invariants**: Checks whether the proposed payout complied with effective tier caps and anti-replay constraints.

#### Expected Output
```text
╔══════════════════════════════════════════════════════════════════╗
║  ZiniPay 🪙🤖 — Proposal Independent Verifier                     ║
║  DAO: zinipay-demo.sputnikv2.testnet                             ║
║  Proposal ID: #5                                                 ║
╚══════════════════════════════════════════════════════════════════╝

[1/5] Fetching Proposal #5 from Sputnik DAO (zinipay-demo.sputnikv2.testnet)...
  ✓ Proposal Found:
      Status:       Approved
      Proposer:     agentzinipaytestnet.testnet
      Votes:        {"zinipay-c1.testnet":"Approve","zinipay-c2.testnet":"Approve"}
      Quorum:       2 Approve / 0 Reject
      Model Review: Simulated run (attestation report received, not independently verified)

[2/5] Inspecting Proposal Execution Target...
  ✓ Target Verified: zinipay-policy2.testnet::release()

[3/5] Decoded Proposed Payout Parameters:
      Recipient:    zinipay-recipient2.testnet
      Amount:       0.1000 NEAR (100000000000000000000000 yoctoNEAR)
      Deposit:      0.1000 NEAR
      CID / PR:     kellycryptos/ZiniPay#1

[4/5] Querying PolicyHelper On-Chain Governance State...
      Contract Owner:      zinipay-demo.sputnikv2.testnet
      Designated DAO:      zinipay-demo.sputnikv2.testnet
      Recipient Score:     30 pts (Tier: Silver)
      Effective Tier Cap:  15.0000 NEAR
      CID Burned on Chain: true (Protected against replay)
      Spend Cap Gate:      PASSED (<= cap)

[5/5] Locating On-Chain Settlement Receipt Outcome...
  ℹ settlement receipt not found, state checks only (Proposal #5 not recorded in verified.json)

════════════════════════════════════════════════════════════════════
                    GOVERNANCE STATE CHECK RESULT                   
════════════════════════════════════════════════════════════════════
  Proposal Status:      Approved
  Target Receiver:      zinipay-policy2.testnet::release()
  Proposed Recipient:   zinipay-recipient2.testnet
  Proposed Amount:      0.1000 NEAR
  Effective Tier Cap:   15.0000 NEAR (COMPLIANT)
  Anti-Replay Registry: ✓ CID BURNED
════════════════════════════════════════════════════════════════════

✓ STATE CHECKS PASSED (Settlement receipt not recorded in verified.json — state checks only)
```

---

## 7. NEAR Integration Details

ZiniPay relies directly on two foundational NEAR Protocol architectural primitives: the custom **`PolicyHelper` Rust smart contract** and the **Sputnik DAO v2 Requestor role**.

### 1. `PolicyHelper` Smart Contract (`contracts/policy-helper/src/lib.rs`)
- Built with `near-sdk = "5.1.0"`.
- **Predecessor Assertion**: Enforces that only the designated DAO treasury account can trigger payouts:
  ```rust
  assert_eq!(
      env::predecessor_account_id(),
      self.dao_account_id,
      "Only owner or designated DAO can call this"
  );
  ```
- **Stateful Anti-Replay Registry**: Stores consumed deliverables in an on-chain `UnorderedSet`. CIDs are normalized to prevent case-variant evasion:
  ```rust
  let canonical_cid = normalize_cid(&cid);
  assert!(
      !self.used_cids.contains(&canonical_cid),
      "CID already used — duplicate release attempt blocked"
  );
  self.used_cids.insert(&canonical_cid);
  ```
- **Dynamic Tier Multipliers**: Calculates spend limits based on on-chain reputation:
  - Bronze [0–19 pts]: $1.0\times$ base cap (10 NEAR)
  - Silver [20–59 pts]: $1.5\times$ base cap (15 NEAR)
  - Gold [60+ pts]: $2.0\times$ base cap (20 NEAR)
- **Atomic Rollback Callback**: Uses NEAR cross-contract promises (`Promise::then`) with an asynchronous callback (`on_release_done`). If the transfer fails, the contract removes the CID from storage and resets the recipient cooldown timer.

### 2. Sputnik DAO v2 Requestor Role
Configured in `zinipay-demo.sputnikv2.testnet` using standard Sputnik DAO v2 policy mechanics:
- **Zero Council Seats**: The agent account (`agentzinipaytestnet.testnet`) is omitted from the `council` role.
- **Restricted Permissions**: The agent is granted the `Requestor` role with `*:AddProposal` permission only.
- **Zero Voting Rights**: The agent cannot call `act_proposal` with `VoteApprove` or `VoteReject`.

### Why a Function-Call Key Cannot Attach Proposal Bonds
On NEAR Protocol, Access Keys are split into `FullAccess` and `FunctionCall` permissions. A `FunctionCall` key is strictly restricted to calling specific contract methods and **cannot attach a non-zero deposit** (`CannotAttachDeposit`).

Because Sputnik DAO v2 requires attaching a `proposal_bond` (1 NEAR) to prevent proposal queue spam:
- The agent runs on a dedicated funded account (`agentzinipaytestnet.testnet`) with a small operating balance (2–5 NEAR) used strictly to attach proposal bonds.
- The agent holds **zero signing keys or permissions on the DAO treasury contract itself**. Even if the agent's private key is compromised, the attacker can only spend the agent's small bond float; treasury funds remain 100% protected behind the 2-of-2 human council multi-sig.

### What Breaks Without NEAR?
1. **Without NEAR Cross-Contract Callbacks (`Promise::then`)**: Atomic state rollbacks on failed transfers would require complex, manual off-chain reconciliation.
2. **Without NEAR's Native Role-Based Access Control (Sputnik DAO v2)**: Creating a constrained, proposal-only agent with zero voting power would require writing a custom multi-sig contract from scratch.
3. **Without NEAR's Fast 1-Second Finality and Sub-Cent Fees**: Multi-agent proposal deliberation and multi-stage governance calls would be too slow and expensive for practical bounty evaluation.

---

## 8. Tracks It Fits

| Track | Alignment & Direct Repository Implementation |
| :--- | :--- |
| **AI Agents** | Fully autonomous evaluation agent service (`agent/`) that inspects GitHub PRs, parses recipient identity bindings, runs multi-agent deliberation (Inspector & Risk Arbiter), simulates on-chain policy view calls, and drafts Sputnik DAO proposals. |
| **AI Security & Defense** | Fail-closed execution architecture designed to defend community treasuries against agent prompt injection, runaway spending, deliverable spoofing, deliverable replay, and case-variant bypass using smart contract invariants and mathematical spend caps. |
| **Social / Governance (Sputnik DAO & Trezu)** | Modernizes decentralized treasury management on Sputnik DAO v2 by automating routine bounty verification while preserving full human council multi-sig sovereignty over disbursements. |

---

## 9. Setup / Try It

### Testnet Deployments

| Entity | Address | Description |
| :--- | :--- | :--- |
| **Sputnik DAO v2 Treasury** | [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet) | Treasury contract holding funds and collecting council multi-sig votes |
| **PolicyHelper Contract** | [`zinipay-policy2.testnet`](https://testnet.nearblocks.io/address/zinipay-policy2.testnet) | Rust policy contract (Code hash: `4aAns5JeyBVUEMLS6uJSyomHZ6qJGQGbYApLVhL4xAyt`) |
| **Agent Account** | [`agentzinipaytestnet.testnet`](https://testnet.nearblocks.io/address/agentzinipaytestnet.testnet) | Proposer account (`Requestor` role, 0 voting keys) |
| **Council Signer 1** | [`zinipay-c1.testnet`](https://testnet.nearblocks.io/address/zinipay-c1.testnet) | Human council member (1/2 quorum) |
| **Council Signer 2** | [`zinipay-c2.testnet`](https://testnet.nearblocks.io/address/zinipay-c2.testnet) | Human council member (2/2 quorum) |
| **Recipient Account** | [`zinipay-recipient2.testnet`](https://testnet.nearblocks.io/address/zinipay-recipient2.testnet) | Verified contributor payout recipient |

### Prerequisites
- **Node.js**: `>= 20.0.0` (Node `>= 24.22.1` enables live `@nearai/inference-sdk` hardware quote verification)
- **npm**: `>= 10.0.0`
- **Rust Toolchain**: Optional, only required to recompile contracts (`cargo` with `wasm32-unknown-unknown`)

### Local Setup Instructions

```bash
# 1. Clone repository
git clone https://github.com/kellycryptos/ZiniPay.git
cd ZiniPay

# 2. Install workspace dependencies
npm install

# 3. Run agent in dry-run mode (zero keys required)
npm run agent:propose -- \
  --task "Implement Sputnik DAO Three-Way Gate" \
  --deliverable "https://github.com/kellycryptos/ZiniPay/pull/2" \
  --recipient "zinipay-recipient2.testnet" \
  --amount 0.1 \
  --github-handle kellycryptos \
  --dry-run

# 4. Launch the dashboard locally
npm run frontend:dev
```
Open `http://localhost:5173` in your browser. Add `?demo=1` to explore the dashboard in demo mode with sample proposals, or connect a NEAR testnet wallet (e.g. Meteor, HERE, MyNearWallet) to interact with live proposals.

### Pre-Hackathon Code, Libraries, and Templates Used
In accordance with NEAR HACKATHON rule Q-005:

- **Smart Contracts (Rust)**:
  - `near-sdk` `v5.1.0` (with `legacy` and `unit-testing` features) for contract state, Borsh serialization, cross-contract promises, and callbacks.
- **Agent Service (TypeScript & Node.js)**:
  - `@nearai/inference-sdk` (`0.2.1`) for hardware TEE gateway & model attestation verification.
  - `near-api-js` (`^5.0.0`) for NEAR RPC interaction, key management, view calls, and transaction broadcasting.
  - `openai` (`^4.70.0`) fallback client configured for OpenAI-compatible inference endpoints.
  - `zod` (`^4.6.7`) for strict schema validation, structured output parsing, and prompt injection defense.
  - `commander` (`^12.1.0`), `chalk` (`^5.3.0`), `axios` (`^1.7.9`), `lowdb` (`^7.0.1`), and `dotenv`.
- **Frontend & Dashboard (React & Vite)**:
  - `react` `18.3` and `react-dom` `18.3` with `vite` `^6.0.7` and TypeScript `5.7`.
  - `@near-wallet-selector` `^10.1.4` (Core, Modal UI, Here Wallet, Meteor Wallet, MyNearWallet) for wallet connectivity.
  - `tailwindcss` `^3.4.17` and `lucide-react` for UI styling and icons.
- **Protocols & External Services**:
  - **Sputnik DAO v2** (`sputnikv2.testnet` / `near-daos/sputnik-dao-contract`): Standard multi-sig treasury contract on NEAR.
  - **NEAR Intents 1Click API** (`https://1click.chaindefuser.com/v0/quote`): Cross-chain solver quotes and swap routing.
  - **NEAR AI Cloud** (`https://cloud-api.near.ai/v1`): Inference endpoint for dual-agent deliberation.
  - **GitHub REST API v3**: Deliverable pull request inspection and author verification.
- **Templates & Boilerplate**: None. All smart contract code, agent logic, UI components, and verification scripts were written specifically for ZiniPay.
- **AI Coding Assistance**: Developed with the assistance of AI coding agents (Antigravity / Claude / Codex) for prototyping, contract hardening, test suite generation, and verification scripts.

---

## 10. Developer Experience (DevEx) Note

A complete, transparent log of 13 real NEAR protocol hurdles, exact error logs, and implemented architectural fixes is documented in [`docs/DEVEX.md`](docs/DEVEX.md).

Key friction points analyzed include:
- **NEAR SDK v5 API Migrations**: Adapting `u128` balance arithmetic to `NearToken` and `BorshStorageKey`.
- **Sputnik DAO v2 Factory Naming**: Identifying `sputnikv2.testnet` on testnet instead of legacy `sputnikdao2.testnet`.
- **`CannotAttachDeposit` Protocol Restriction**: Solving the NEAR protocol limitation preventing Function-Call keys from attaching non-zero deposits.
- **Cross-Contract Panic Message Extraction**: Overcoming buried error strings in nested promise receipts via recursive parsing of `receipts_outcome[].outcome.logs`.
- **Public RPC Failover Architecture**: Mitigating testnet RPC rate limits using multi-RPC fallbacks (FastNEAR and Archival RPC).
- **Deliverable CID Case-Variant Replay Vulnerability**: Hardening smart contract storage with `normalize_cid` to prevent casing evasion.

---

## 11. License

This project is licensed under the [MIT License](LICENSE).
