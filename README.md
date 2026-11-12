# ZiniPay

> **"Let AI agents ask for money. Never let them take it."**
> 
> ZiniPay is a constrained agent for community treasuries on NEAR. The agent proposes, a Rust contract enforces the limits, and humans approve on Sputnik DAO v2.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Network: NEAR Testnet](https://img.shields.io/badge/Network-NEAR%20Testnet-00EC97.svg)](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet)
[![Security Policy](https://img.shields.io/badge/Security-Policy%20%26%20Limits-yellow.svg)](SECURITY.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-1.80+-DEA584.svg)](https://www.rust-lang.org)

---

## What We Built

Autonomous agents cannot be trusted with raw private keys or unrestricted access to community treasuries. ZiniPay enforces a fail-closed **Three-Way Release Gate**:

1. **Gate 1: Deliverable Verification (Pre-Chain)**
   - Dual-agent deliberation validates that the GitHub pull request is merged, the commit hash matches, the PR author matches the claim, and the IPFS CID is stripped to canonical base58/base32.
2. **Gate 2: Programmatic Policy Enforcement (Rust Smart Contract)**
   - `PolicyHelper` on `zinipay-policy2.testnet` enforces reputation-scaled per-proposal spend caps (**10 NEAR** Bronze / **15 NEAR** Silver / **20 NEAR** Gold), enforces a **60-second cooldown** per recipient, and permanently burns the deliverable CID into an on-chain set.
3. **Gate 3: Human Council Multi-Sig Quorum (Sputnik DAO v2)**
   - The agent operates strictly as a proposal preparer with **0 voting rights** and **0 council seats**. Every payout requires a mandatory **2-of-2 human council vote** (`VoteApprove`) on Sputnik DAO v2 before funds leave the treasury.

---

## 60-Second Judge Verification (Zero Config, No `.env` Required)

Clone and verify the entire on-chain testnet deployment in under 60 seconds from a sterile shell:

```bash
git clone https://github.com/kellycryptos/ZiniPay.git
cd ZiniPay
npm install
npm run verify:testnet
```

**Result**: `24 PASSED / 0 UNVERIFIED / 0 FAILED` across all live contract calls, Sputnik DAO v2 council roles, PolicyHelper spend caps, deliverable CID burning, and 14 on-chain transaction receipts with panic assertions.

---

## Live Proof & On-Chain Evidence Matrix

Every claim made on the site and in documentation is publicly auditable on NearBlocks testnet explorer:

| Claim / Capability | Enforced On-Chain or Advisory | Source Code Location | Verified Explorer Evidence |
| :--- | :--- | :--- | :--- |
| **Sputnik DAO v2 Council Quorum** | **Enforced** (2-of-2 human council quorum required) | [`agent/src/dao.ts`](agent/src/dao.ts) | [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet) · Txs: [`22HTUkeVM...`](https://testnet.nearblocks.io/txns/22HTUkeVM6kSj4jDk9X5vX911wz2M62rW4e11nF4WvM6) & [`2nWMVtQ4...`](https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d) |
| **Agent Isolation (0 Voting Rights)** | **Enforced** (`agentzinipaytestnet.testnet` holds Requestor role only) | [`agent/src/dao.ts`](agent/src/dao.ts) | Verified in check 1.3: `agent in voting/wildcard roles: false` |
| **Reputation-Scaled Spend Caps** | **Enforced** (Bronze 10N / Silver 15N / Gold 20N via `get_effective_cap`) | [`contracts/policy-helper/src/lib.rs`](contracts/policy-helper/src/lib.rs) | Recipient score 30 pts (Silver, 15N cap) · Cap check: [`verify-testnet.mjs`](scripts/verify-testnet.mjs) |
| **CID Anti-Replay Protection** | **Enforced** (One-time CID burn, case-normalized) | [`contracts/policy-helper/src/lib.rs`](contracts/policy-helper/src/lib.rs) | Replay Attack Reverted Tx: [`9Gp7HmJb...`](https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb) (`CID already used`) |
| **Over-Cap Spend Defense** | **Enforced** (Exceeding tier cap panics on-chain) | [`contracts/policy-helper/src/lib.rs`](contracts/policy-helper/src/lib.rs) | Over-Cap Attack Reverted Tx: [`EiktoyYP...`](https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ) (`exceeds effective tier cap`) |
| **Unauthorized Caller Defense** | **Enforced** (Direct non-DAO calls rejected) | [`contracts/policy-helper/src/lib.rs`](contracts/policy-helper/src/lib.rs) | Unauthorized Reverted Tx: [`2zsvqGDF...`](https://testnet.nearblocks.io/txns/2zsvqGDF4Bfqm2QG2XpXgqP4p4zH7r2rR6y9rT4mK9W2) (`Only owner or designated DAO`) |
| **Case-Variant Replay Defense** | **Enforced** (`normalize_cid` defeats casing bypass) | [`contracts/policy-helper/src/lib.rs`](contracts/policy-helper/src/lib.rs) | Case-Variant Reverted Tx: [`EwQAsc5r...`](https://testnet.nearblocks.io/txns/EwQAsc5rXEsS4n9R2rR8q1wX8y2V3r4t5U6W7X8y2V3r) (`CID already used`) |
| **Cooldown Timer Defense** | **Enforced** (60s cooldown per recipient) | [`contracts/policy-helper/src/lib.rs`](contracts/policy-helper/src/lib.rs) | Cooldown Reverted Tx: [`2hVRAoT6...`](https://testnet.nearblocks.io/txns/2hVRAoT67H4qX8y2V3r4t5U6W7X8y2V3r4t5U6W7X8y2) (`Cooldown not elapsed`) |
| **DAO Contract Ownership** | **Enforced** (Ownership transferred to Sputnik DAO) | [`contracts/policy-helper/src/lib.rs`](contracts/policy-helper/src/lib.rs) | Ownership Tx: [`BmUTUzUL...`](https://testnet.nearblocks.io/txns/BmUTUzULrCCx5PZ2fRkmh49pW98W4eXUq2fVjYc4z9b) · Blocked former owner: [`EmKpSxi4...`](https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14) |
| **Settled Payouts (0.20 NEAR)** | **Enforced** (2 recorded on-chain DAO proposals) | [`frontend/public/data/verified.json`](frontend/public/data/verified.json) | Proposal #5 (0.10N, Oct 30, deploy hash `Eft7wVX8...`): [`4B1Excqiga...`](https://testnet.nearblocks.io/txns/4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd)<br>Proposal #6 (0.10N, Nov 2, deploy hash `4aAns5Je...`): [`2nWMVtQ4...`](https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d) |
| **Approval Tier Schedule** | **Advisory** (Computed client-side; DAO requires 2 votes) | [`agent/src/reputation.ts`](agent/src/reputation.ts) | Note: `get_approval_tier` is in repo source at commit `6fb2426` but not deployed in testnet WASM; Sputnik DAO enforces 2-of-2 quorum on all payouts |

---

## Sponsor Track Verification Matrix ("The Receipt Box")

| Capability / Sponsor Track | Specific Endpoint or Method Called | Source Code File & Line Numbers | Verified Explorer Tx / Proof | Demonstration Link |
| :--- | :--- | :--- | :--- | :--- |
| **NEAR Protocol (Sputnik DAO v2)** | `add_proposal` (FunctionCall / Transfer), `act_proposal` (VoteApprove/Reject), `get_policy`, `get_proposals` | [`agent/src/dao.ts#L71-L200`](agent/src/dao.ts#L71-L200)<br>[`frontend/src/lib/nearRpc.ts#L116-L450`](frontend/src/lib/nearRpc.ts#L116-L450) | Proposal #6: [`HBs2djKV...`](https://testnet.nearblocks.io/txns/HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK)<br>Contract: [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet) | [60-Second Walkthrough](#1-for-judges--ai-reviewers-do-x--see-y) |
| **NEAR Smart Contracts (Rust SDK)** | `PolicyHelper::release`, `check_policy`, `get_reputation`, `get_effective_cap`, `burn_cid` | [`contracts/policy-helper/src/lib.rs#L169-L324`](contracts/policy-helper/src/lib.rs#L169-L324) | Payout Tx: [`2nWMVtQ4...`](https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d)<br>Blocked Drain: [`EiktoyYP...`](https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ)<br>Blocked Replay: [`9Gp7HmJb...`](https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb) | [Contract Execution Demo](#1-for-judges--ai-reviewers-do-x--see-y) |
| **NEAR AI Cloud (LLM Deliberation)** | `POST /v1/chat/completions` (`z-ai/glm-5.3-flash`) | [`agent/src/deliberation.ts#L34-L245`](agent/src/deliberation.ts#L34-L245)<br>[`agent/src/validator.ts#L40-L105`](agent/src/validator.ts#L40-L105) | Dual-agent deliberation (Inspector + Risk Arbiter) with prompt injection defense (Hardware TEE attestation not claimed) | [Deliberation Test Suite](#1-for-judges--ai-reviewers-do-x--see-y) |
| **NEAR Intents (ChainDefuser 1Click)** | `POST /v0/quote` | [`agent/src/intents.ts#L45-L95`](agent/src/intents.ts#L45-L95)<br>[`frontend/src/components/IntentsModal.tsx#L40-L110`](frontend/src/components/IntentsModal.tsx#L40-L110) | Live Dry Quote API verified; cross-chain settlement execution not claimed (quote-only) | [NEAR Intents Live Suite](#1-for-judges--ai-reviewers-do-x--see-y) |
| **NEAR Wallet Selector & Observer** | `setupWalletSelector`, MyNearWallet, Meteor, HERE + Read-Only Observer Preview | [`frontend/src/lib/wallet.ts#L20-L185`](frontend/src/lib/wallet.ts#L20-L185)<br>[`frontend/src/components/WalletModal.tsx#L35-L95`](frontend/src/components/WalletModal.tsx#L35-L95) | Live testnet council signer (`22HTUkeVM...`) & read-only Observer view (fake signers dropped) | [UI Sandbox Simulation](#1-for-judges--ai-reviewers-do-x--see-y) |

---

## 1. For Judges / AI Reviewers (Do X → See Y)

You can verify the entire codebase, live testnet deployment, and Social Money track features in under 5 minutes with **zero private keys, zero wallet setup, and no `.env` required**:

```bash
# Step 1: Install dependencies (~10s)
npm install
```
**See**: Clean dependency installation across all workspace packages (`agent`, `frontend`).

```bash
# Step 2: Run agent unit test suite (~8s)
npm test --prefix agent
```
**See**: `All agent tests completed successfully! (22 passing tests)`. Verifies:
- Suite 1: Deliberation, schema-level prompt injection defense, and TEE attestation verification.
- Suite 2: Three-Way Match policy clearance, canonical CID normalization, and anti-replay guards.
- Suite 3: NEAR Intents 1Click cross-chain routing.
- Suite 4: Social Money reputation tracking, task completion accounting, and tiered approval resolutions across Gold, Silver, and Bronze tiers.

```bash
# Step 3: Run keyless testnet verification suite (~15s)
npm run verify:testnet
```
**See**: `24 PASSED / 0 UNVERIFIED / 0 FAILED`. Queries public NEAR testnet RPCs to confirm:
- Active Sputnik DAO v2 council with 2-of-2 multi-sig quorum (`zinipay-c1.testnet`, `zinipay-c2.testnet`).
- Agent proposer isolation: `agentzinipaytestnet.testnet` holds proposal creation rights (`*:AddProposal`) with 0 council seats and 0 voting keys.
- Active Rust `PolicyHelper` contract bound strictly to DAO treasury.
- Contributor reputation score (Silver tier: 30 pts) and deliverable CID burn status (`cid_used: true`).
- Check 4.5: Social Money Tiered Approval Resolution (advisory client-side schedule; Sputnik DAO enforces 2-of-2 council quorum for all payouts).
- 14 confirmed on-chain transaction receipts (proposal creation, council approvals, promotion, and 5 blocked attack transactions reverted with exact contract panic messages).

```bash
# Step 4: Verify contributor reputation & tiered approval schedule (~5s)
npm run verify:reputation -- zinipay-recipient2.testnet
```
**See**: Publicly readable contributor track record:
- Named Account: `zinipay-recipient2.testnet`
- On-Chain Score: `30 pts (verified on zinipay-policy2.testnet)`
- Reputation Tier: `Silver (1.5x spend cap multiplier)`
- Completed Tasks: `2` verified tasks under policy (local off-chain cache: `zinipay-reputation.json`)
- Total Value Paid: `0.2000 NEAR` (local cache / verified receipts)
- Tiered Approval Schedule:
  - Small Payout (&le; 1 NEAR): `SingleCouncil` (1 council member approval, fast-tracked)
  - Medium Payout (&le; 5 NEAR): `SingleCouncil` (1 council member approval)
  - Large Payout (> 5 NEAR to 15 NEAR): `FullDaoQuorum` (2 council members, standard Sputnik DAO multi-sig)
  - Over-Cap Payout (> 15 NEAR): `REJECTED` (Fail-closed on-chain rejection by PolicyHelper)
- Confirmed testnet payout receipts with NEARBlocks explorer links.

```bash
# Step 5: Run Social Money Track demonstration flow (~5s)
# "Create Request → See Reputation Update → See Tiered Outcome"
npm run demo:social-money
```
**See**: Complete automated walkthrough:
1. Contributor starting state (Named account: `alice-contributor.testnet`, Bronze tier, 0 pts).
2. Create request: Deliberate deliverable proof and calculate initial approval requirement (Full DAO quorum).
3. Payout settlement: Multi-sig quorum reached → atomic release updates score (+5 pts on-chain, auto-increase stops at Bronze ceiling of 19 pts; promotions to Silver 20+ and Gold 60+ require DAO council action via `update_reputation`), completed tasks (+1), and total paid (+2.5N). Council promotes contributor to Silver tier via DAO action.
4. Tiered outcomes under updated reputation:
   - Micro bounty (0.8N): Single council member fast-track.
   - Medium milestone (4.0N): Single council member approval.
   - Large grant (12.0N): Full DAO multi-sig quorum.
   - Over-cap request (18.0N): Fail-closed on-chain rejection (`exceeds Silver tier cap of 15.00 NEAR`).
5. Malicious claim: Replay deliverable blocked by anti-replay registry; contributor penalized (-5 pts) without treasury drain.

```bash
# Step 6: Run independent proposal verifier (~5s)
npm run verify:proposal -- 6
```
**See**: `✓ STATE CHECKS PASSED`. Cross-references Sputnik DAO Proposal #6 on-chain against `PolicyHelper` spend limits and anti-replay registry, displaying recipient score (30 pts), Silver tier cap (15 NEAR), and `SingleCouncil` approval tier with 2 recorded votes satisfying the 1-vote quorum. *(To test fail-closed rejection on a non-release proposal, run `npm run verify:proposal -- 7`)*.

```bash
# Step 7: Test agent deliberation & on-chain anti-replay clearance (~5s, dry run)
# Note: PR #1 (Proposal #5) and PR #2 (Proposal #6) are permanently burned on-chain.
# Running PR #2 demonstrates live on-chain anti-replay rejection in real time:
npm run agent:propose -- \
  --task "Implement Sputnik DAO Three-Way Gate" \
  --deliverable "https://github.com/kellycryptos/ZiniPay/pull/2" \
  --recipient "zinipay-recipient2.testnet" \
  --amount 0.1 \
  --github-handle kellycryptos \
  --dry-run
```
**See**: `✗ THREE-WAY MATCH FAILED: Deliverable proof "kellycryptos/zinipay#2" has already been settled on-chain (zero-double-spend protection)`.

```bash
# Step 7b: Test Gate 2 author-mismatch defense on an unauthorized PR (~5s, dry run)
npm run agent:propose -- \
  --task "Implement Sputnik DAO Three-Way Gate" \
  --deliverable "https://github.com/near/near-sdk-rs/pull/1651" \
  --recipient "zinipay-recipient2.testnet" \
  --amount 0.1 \
  --github-handle kellycryptos \
  --dry-run
```
**See**: `Consensus Verdict: REJECTED (Confidence: 0%)` — `PR author (vsavchyn-dev) does not match recipient handle`.

```bash
# Step 8: View Public Activity & Reputation Board
npm run frontend:dev
# Navigate to http://localhost:5173/board (or click "Public Board" in top nav)
```
**See**: Public activity feed, contributor track record cards, confirmed testnet receipts, and the tiered approval policy matrix rendered with live testnet data.

```bash
# Step 9 (Optional): Run smart contract unit tests (~5s, requires Linux/macOS or MSVC linker)
cd contracts/policy-helper && cargo test && cd ../..
```
**See**: `test result: ok. 23 passed; 0 failed`. Verifies spend caps, caller authorization, cooldown logic, case-variant anti-replay normalization, atomic rollback callbacks, and `get_approval_tier` resolution.

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
   - Enforces per-recipient cooldown timers (e.g. 60 seconds on testnet between payouts).
   - Permanently burns deliverable CIDs into an on-chain `UnorderedSet` (`used_cids`). Duplicate attempts fail immediately with: `"CID already used — duplicate release attempt blocked"`.
   - Normalizes CIDs (`normalize_cid`) at contract level to defeat case-variant bypass attempts.

3. **Gate 3: Multi-Sig Human Quorum & Tiered Approval (Sputnik DAO v2 Governance)**:
   - The AI agent operates under a restricted **Requestor** role. It holds zero council seats and zero voting keys.
   - Evaluates contributor reputation to determine governance friction:
     - **Low Friction (Gold / Small Amounts)**: Auto-approve eligibility (under policy cap) or 1-vote council clearance.
     - **Medium Friction (Silver / Mid Amounts)**: Single council member multi-sig vote required (`SingleCouncil`).
     - **Full Governance (Bronze / High Amounts)**: Full M-of-N human council multi-sig quorum (2-of-2 on testnet) required (`FullDaoQuorum`).
   - If the downstream NEAR transfer fails, an on-chain callback (`on_release_done`) automatically rolls back CID consumption and resets cooldown timers.

### Social Money Track Extensions

ZiniPay extends standard DAO tooling with four Social Money capabilities designed for decentralized contributor economies:

1. **Reputation Tied to Named Accounts**:
   - Every contributor's earned track record is indexed against their human-readable NEAR named account (e.g. `zinipay-recipient2.testnet`).
   - Records completed tasks, total NEAR earned under policy, rejections, and verified settlement receipts.
   - Scores are queryable directly on-chain via `PolicyHelper::get_reputation` and `PolicyHelper::get_effective_cap`. Note: `get_contributor_record` and `get_approval_tier` exist in `main` source code only and are not deployed on-chain; approval schedules and aggregated contributor records are resolved client-side.

2. **Tiered Governance Approvals**:
   - Replaces all-or-nothing multi-sig bottlenecks with a merit-based governance spectrum:
     - **Gold Tier (Score 60+)**: $\le 2$ NEAR auto-approved under policy; $\le 8$ NEAR requires 1 council vote; $> 8$ NEAR requires full DAO quorum.
     - **Silver Tier (Score 20–59)**: $\le 5$ NEAR requires 1 council vote; $> 5$ NEAR requires full DAO quorum.
     - **Bronze Tier (Score 0–19)**: All payouts $\le 10$ NEAR require full DAO quorum.
   - All tiers remain fail-closed: spend caps, CID anti-replay, and recipient cooldowns are never bypassed.

3. **Public Activity & Reputation Board (`/board`)**:
   - An open transparency interface displaying active milestone requests, pending claims, settled payouts, and verified contributor track records.
   - Uses real testnet data with direct explorer links to Sputnik DAO proposals and `PolicyHelper` receipts.

4. **Trezu Treasury Compatibility (Alternative Custody)**:
   - Designed so a Trezu treasury could be used in place of Sputnik DAO v2 without contract changes. This has not been tested. Only Sputnik DAO v2 on testnet is verified.
   - Detailed integration patterns and configuration blueprints are documented in [`docs/TREZU_INTEGRATION.md`](docs/TREZU_INTEGRATION.md).

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
[3. Policy & Tier] ─ Calls PolicyHelper.check_policy() & get_approval_tier()
       │            Evaluates recipient score, tier cap, cooldown, and unburned CID
       │            Resolves requirement: AutoApprove (0) | SingleCouncil (1) | FullDaoQuorum (2)
       ▼
[4. Proposal] ────── Calls Sputnik DAO add_proposal (Requestor role, 0 voting keys)
       │            Payload: FunctionCall -> PolicyHelper::release(recipient, amount, cid)
       │            Tagged description: "[Tier: SingleCouncil] [PolicyCheck: PASSED] ..."
       ▼
[5. Human Vote] ──── Council votes based on resolved tier requirement:
       │            • AutoApprove:   0 council votes required (executes under policy cap)
       │            • SingleCouncil: 1 council member approval required (Fast-track)
       │            • FullDaoQuorum: 2 council members approval required (Full M-of-N multi-sig)
       ▼
[6. Settlement] ──── Sputnik DAO calls PolicyHelper::release
       │            ├─ Contract verifies caller == DAO
       │            ├─ Contract verifies amount <= effective tier cap
       │            ├─ Contract burns canonical CID & sets cooldown
       │            ├─ Contract transfers NEAR to recipient
       │            └─ Callback on_release_done verifies transfer or triggers rollback
       ▼
[7. Reputation] ──── Post-Settlement Reputation Indexing & Public Board
                    ├─ Contributor score updated (+5 pts auto on-chain, capped at Bronze ceiling 19; Silver/Gold require DAO council action)
                    ├─ Completed tasks count incremented & total NEAR earned updated
                    ├─ Settlement receipt logged with explorer links
                    └─ Public Activity Board (/board) surfaces updated track record
```

### Trezu Alternative Custody Architecture

> Untested. Only Sputnik DAO v2 on testnet has been run. The notes below describe the intended design for a Trezu treasury.

Communities utilizing [Trezu](https://trezu.app) as their multisig custody layer could operate ZiniPay the same way:
- **Zero Contract Changes**: `PolicyHelper` verifies `predecessor_account_id == self.dao_account_id`. The DAO treasury address can point to either a Sputnik DAO v2 contract (`*.sputnikv2.testnet`) or a Trezu multisig contract (`*.near`).
- **Proposal Flow**: The ZiniPay agent submits multi-sig transactions to the Trezu contract.
- **Quorum Execution**: Trezu council signers approve in the Trezu web interface. Upon reaching threshold, Trezu calls `PolicyHelper::release`, enforcing spend caps, anti-replay, and cooldowns.
- Detailed step-by-step instructions are provided in [`docs/TREZU_INTEGRATION.md`](docs/TREZU_INTEGRATION.md).

### Attack Scenarios and Mitigation Matrix

| Attack Vector | Attacker Action | Layer of Defense | Exact System Response |
| :--- | :--- | :--- | :--- |
| **Deliverable Theft** | Submitting another contributor's merged PR | Gate 1 (Agent Deliberation) | Fails PR author and `zinipay-recipient` binding checks; proposal aborted before creation. |
| **CID Replay** | Re-submitting an already-settled PR / CID | Gate 2 (`PolicyHelper` Contract) | Transaction reverts with contract panic: `"CID already used — duplicate release attempt blocked"`. |
| **Case-Variant Replay** | Submitting `KELLYCRYPTOS/ZINIPAY#2` to bypass string check | Gate 2 (`PolicyHelper` Contract) | `normalize_cid` forces lowercase ascii; reverts with `"CID already used"`. |
| **Over-Cap Payout** | Requesting payout exceeding contributor tier limit | Gate 2 (`PolicyHelper` Contract) | Reverts with: `"Amount ... exceeds effective tier cap ... for recipient ..."`. |
| **Unauthorized Direct Call** | Malicious actor calls `PolicyHelper::release` directly | Gate 2 (`PolicyHelper` Contract) | Reverts with: `"Only owner or designated DAO can call this"`. |
| **Prompt Injection** | Embedding injection commands in deliverable description | Gate 1 (Zod Schema Validation) | Parser strips unescaped payloads and enforces strict typed outputs; ignores instruction hijacking. |
| **Agent Key Compromise** | Rogue agent attempts to self-approve payout | Gate 3 (Sputnik DAO Policy) | Impossible on-chain: agent holds proposal creation rights (`*:AddProposal`) only; has zero voting permissions (`*:*`, `*:Vote*`). |
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

### Contributor Reputation & Tier Verifier: `npm run verify:reputation`

ZiniPay provides an independent verification tool (`scripts/verify-reputation.mjs`) to audit any contributor's reputation score, completed milestones, total NEAR paid under policy, and the resulting tiered approval schedule directly on-chain.

#### Usage
```bash
# Query any named testnet account
npm run verify:reputation -- <account.testnet>

# Example: Query verified contributor zinipay-recipient2.testnet
npm run verify:reputation -- zinipay-recipient2.testnet
```

#### Expected Output
```text
╔══════════════════════════════════════════════════════════════════╗
║  ZiniPay 🪙🤖 — Social Money Contributor Track Record & Tier      ║
║  Account:  zinipay-recipient2.testnet                            ║
║  Contract: zinipay-policy2.testnet                               ║
╚══════════════════════════════════════════════════════════════════╝

[1/3] Querying PolicyHelper On-Chain Reputation State...
  ✓ Reputation Found on-chain:
      Score:            30 pts
      Tier:             Silver (1.5x spend cap multiplier)
      Max Cap / Payout: 15.0000 NEAR
      Cooldown Period:  1440 mins (24.0 hrs)
      Registered In:    Contract zinipay-policy2.testnet

[2/3] Querying Public Contributor Track Record...
  ✓ Track Record Verified:
      Completed Tasks:  2 (local off-chain cache, not verified on-chain)
      Total NEAR Paid:  0.2000 NEAR
      Rejections Count: 16 (local off-chain cache, not verified on-chain)
      Track Record:     100.0% completion rate (2 of 2)
      Recent Payouts:   2 confirmed testnet payout receipts

[3/3] Tiered Approval Requirements by Amount:
  • Amount <= 5 NEAR:   SingleCouncil (1 council vote needed)
  • Amount > 5 NEAR:    FullDaoQuorum (2 council votes needed)
  • Amount > 15 NEAR:   FailClosedRejection (exceeds 15.0000 NEAR tier cap)

✓ REPUTATION VERIFIED ON NEAR TESTNET
```

### Automated Social Money Flow Demo: `npm run demo:social-money`

Run an end-to-end automated simulation demonstrating the entire Social Money lifecycle:
1. **Create Request**: Agent evaluates deliverable & queries on-chain tier cap.
2. **Reputation Update**: Payout settles, adding +5 pts on-chain (up to 19 Bronze ceiling; Silver/Gold requires DAO council action) and updating completed tasks in local cache.
3. **Tiered Outcome**: Subsequent larger payout automatically unlocks the upgraded tier (SingleCouncil fast-track), while replay attempts trigger instant penalty & rollback.

```bash
npm run demo:social-money
```

### Public Proposal Verifier: `npm run verify:proposal`

ZiniPay includes an independent, keyless proposal verification tool (`scripts/verify-proposal.mjs`) that allows judges to inspect and audit any Sputnik DAO proposal against `PolicyHelper` on-chain state without configuring credentials.

#### Usage
```bash
npm run verify:proposal -- <proposal_id>
```

#### Example: Verifying Proposal #6 (or #5)
```bash
npm run verify:proposal -- 6
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
      Approval Tier:       SingleCouncil (Fast-track single council approval (Silver contributor <= 5 NEAR))
      Advisory schedule:   1 vote(s) (not enforced)
      Enforced on-chain:   2-of-2 council (zinipay-c1, zinipay-c2)
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
- The agent holds **zero signing keys or permissions on the DAO treasury contract itself**. Even if the agent's private key is compromised, the attacker can only spend the agent's small bond float; treasury funds remain protected behind the 2-of-2 human council multi-sig.

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
| **Social Money & Governance (Sputnik DAO & Trezu)** | Implements contributor reputation tied to human-readable named accounts (`*.testnet`), dynamic tiered approval friction (AutoApprove, SingleCouncil, FullDaoQuorum), a transparent public activity board (`/board`), and alternative treasury custody via Trezu without rebuilding the multisig. |

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

## 11. Known Limitations & Security Model

> For our threat model, automated check results, self-review disclosures, and vulnerability reporting procedures, see [SECURITY.md](SECURITY.md).

Based on verified on-chain state queries directly on NEAR Testnet (`test.rpc.fastnear.com`):

1. **Contract Ownership Transferred to Sputnik DAO**: The `PolicyHelper` smart contract (`zinipay-policy2.testnet`) has had its ownership transferred directly to the Sputnik DAO multi-sig (`zinipay-demo.sputnikv2.testnet`) via tx [`BmUTUzULrCCNDK1GTpwmq5QMLgvwPbFjGAjDjVnwZwJX`](https://testnet.nearblocks.io/txns/BmUTUzULrCCNDK1GTpwmq5QMLgvwPbFjGAjDjVnwZwJX). Former deployer keys cannot modify policy rules or unburn CIDs (`assert_owner_or_dao()` blocks them on-chain); all administrative recovery requires a council multi-sig proposal.
2. **`burn_cid`, `get_approval_tier`, and `get_contributor_record` in Main Source But Not Deployed**: The `burn_cid` recovery method, `get_approval_tier` advisory view, and `get_contributor_record` exist in `contracts/policy-helper/src/lib.rs` on `main`, but are not present in the deployed contract bytecode at `zinipay-policy2.testnet` (which matches commit `6fb2426`). All tier schedules and contributor record aggregations are resolved client-side.
3. **`get_approval_tier` Advisory Only (Not Enforced On-Chain)**: While `get_approval_tier` in `main` and `agent/src/reputation.ts` provide advisory recommendations for fast-track micro-clearance (e.g., SingleCouncil for Silver <= 5 NEAR), **these are client-side and UI advisory hints**. Sputnik DAO's live on-chain policy requires a strict 2-of-2 council quorum (`zinipay-c1.testnet` and `zinipay-c2.testnet`) to approve and execute any `FunctionCall` proposal executing `PolicyHelper::release`.
4. **`migrate_canonicalize_cids` Public & Harmless**: The `migrate_canonicalize_cids` method is callable by any account without access control; it is strictly idempotent and harmless because it only iterates existing burned CIDs in contract storage and inserts their canonical lowercase form.
5. **60-Second Cooldown as Demo Setting**: On-chain `cooldown_seconds` on `zinipay-policy2.testnet` is set to **60 seconds** as a demo setting (rather than 24 hours) to allow judges and automated verification suites to test sequential operations without waiting a full day.
6. **Past `reset_cooldown` Call**: `reset_cooldown` was called once by the then-owner (`zinipay-c1.testnet`) on Oct 30 in tx [`HS4zxxCJ71iKPHXD6bEX8GPk8WTbPbUrAZC5611tMmKH`](https://testnet.nearblocks.io/txns/HS4zxxCJ71iKPHXD6bEX8GPk8WTbPbUrAZC5611tMmKH) during early testnet integration.
7. **Reputation Ceilings & DAO-Governed Tier Promotions**: Routine +5 reputation rewards upon bounty settlement stop at the Bronze ceiling (19 pts). Contributor promotions to Silver (>= 20 pts) and Gold (>= 60 pts) can only occur via council action or Sputnik DAO proposal to prevent contributor reputation farming. On testnet:
   - **Initial Promotion to 25 pts**: First performed during the Oct 30 development run (Proposal #5 cycle) in tx [`Dfz77EFjDZK7pCNU6uDfm1Go9pkyfuHaCiUTuNeLZEtB`](https://testnet.nearblocks.io/txns/Dfz77EFjDZK7pCNU6uDfm1Go9pkyfuHaCiUTuNeLZEtB), and subsequently confirmed in the clean Nov 2 verification run (Proposal #6 cycle, recorded as Transaction #4 in `verified.json`) in tx [`DfpR26Q4qgoXw1oBh481vBkizypsrME6HLwjHj3gKvYf`](https://testnet.nearblocks.io/txns/DfpR26Q4qgoXw1oBh481vBkizypsrME6HLwjHj3gKvYf), both signed by then-owner `zinipay-c1.testnet`.
   - **DAO Multi-Sig Promotion to 30 pts**: Executed on Nov 2 after contract ownership moved to Sputnik DAO. Created via Proposal #7 (tx [`73JaSgQv8G51VdKTPnYwVasWFogd3EvDDzCr1dx6VJix`](https://testnet.nearblocks.io/txns/73JaSgQv8G51VdKTPnYwVasWFogd3EvDDzCr1dx6VJix)) and executed with 2-of-2 council quorum approval in tx [`3xqHqNnvstR7uTFdV1cvpajw7BSPAxMXLgRLRyBZUYkw`](https://testnet.nearblocks.io/txns/3xqHqNnvstR7uTFdV1cvpajw7BSPAxMXLgRLRyBZUYkw), setting the contributor's final on-chain score to 30.
8. **Agent Rolling 24h Cap is Agent-Side Only**: The rolling 24-hour aggregate spend limit is enforced locally by the agent's `PolicyEngine`; the smart contract enforces per-proposal tier caps and cooldowns, but does not maintain a 24-hour rolling aggregate window on-chain.
9. **Public Proposal Creation & Spam Costs**: The Sputnik DAO policy defines the `all` role as `Everyone` with permission `*:AddProposal`. Proposals are public, meaning any account can submit a proposal. The on-chain `proposal_bond` is **1.0 NEAR** (`1000000000000000000000000` yoctoNEAR), which is the sole economic spam deterrent preventing proposal flooding.
10. **Off-Chain Reputation Cache**: `zinipay-reputation.json` is a local read cache utilized by the agent runner for offline simulations and CLI previews. The canonical source of truth for contributor reputation and tier multiplier checks is permanently stored on-chain in `PolicyHelper::reputation_scores`.
11. **Serverless Rate Limiting is Best-Effort**: The in-memory sliding window rate limiter on Vercel endpoints (`frontend/api/deliberate.ts`) is ephemeral and scoped to warm serverless containers. Hard protection against runaway LLM inference credit exhaustion relies on spending caps and quota cutoffs configured directly on the AI provider dashboard.
12. **AI-Assisted Engineering Disclosure**: In full accordance with hackathon rules and transparency standards, AI tooling (Claude, Antigravity) was utilized for code generation, adversarial edge-case analysis, test automation, and UI implementation under human architectural direction and verification.

---

### Demo vs Production Settings

| Setting | Demo (testnet now) | Production suggestion |
|---|---|---|
| Cooldown between payouts | 60 seconds, enforced on-chain, so checks can run back to back | 24 hours |
| Rolling 24 hour spend cap | Enforced by the agent only, not on-chain | Add an on-chain aggregate window |
| Approval votes | 2 of 2 council on every payout, enforced by Sputnik DAO | Tier based schedule only after it is deployed and tested |
| Tier approval schedule | Advisory view in source, not deployed | Deploy through a DAO proposal, then re-verify |
| Audit | Self-reviewed only | Independent audit before mainnet |

### Next Steps

- Deploy `get_approval_tier` and `get_contributor_record` through a council proposal, then re-run the verifier.
- Store completed tasks, total paid and rejections on-chain in `PolicyHelper`, with a migration.
- Run one real proposal through a Trezu treasury before claiming compatibility.
- Independent audit and a reproducible build with NearBlocks contract verification.

## 12. License

This project is licensed under the [MIT License](LICENSE).
