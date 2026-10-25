# ZiniPay 🪙🤖

> **100% NEAR-Aligned Constrained Agent Layer for Community Treasuries**  
> *Proof + Policy + Human Quorum* — Built on **Sputnik DAO v2 / Trezu**, **NEAR AI Cloud**, and **NEAR Intents**.

[![NEAR Protocol](https://img.shields.io/badge/NEAR-Protocol-black?logo=near)](https://near.org)
[![Trezu](https://img.shields.io/badge/Trezu-Multisig-purple)](https://trezu.org)
[![Sputnik DAO](https://img.shields.io/badge/Sputnik-DAO%20v2-blue)](https://github.com/near-daos/sputnik-dao-contract)
[![NEAR Intents](https://img.shields.io/badge/NEAR-Intents-00EC97)](https://near-intents.org)

---

## 📌 Problem & Solution

**The Problem**: Autonomous AI agents managing decentralized community treasuries pose severe existential risks: prompt injections, unbounded spending, hallucinated deliverable proofs, and silent draining of multisig funds. Conversely, purely manual human multisigs create coordination bottlenecks where small contributor bounties languish unreviewed for weeks.

**The Solution**: ZiniPay introduces a **fail-closed, constrained agent layer** that works with existing Sputnik DAO v2 / Trezu treasuries without replacing human governance. The AI agent operates strictly under a **Requestor role**—evaluating technical deliverables via NEAR AI Cloud multi-agent deliberation, verifying cryptographic attestation reports, canonicalizing proofs against replay attacks, and dispatching constrained proposals to Sputnik DAO. Payouts can never execute unilaterally: spend caps, cooldowns, and CID uniqueness are strictly enforced on-chain by the `PolicyHelper` contract, and every disbursement requires an explicit human council multi-sig approval vote.

---

## 🔄 Real Architecture & Fund Flow

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ZINIPAY TRANSACTION FLOW                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘

  [1. Contributor Work]
         │  GitHub PR URL / IPFS CID
         ▼
  ┌──────────────────────────────┐
  │  ZiniPay Agent Layer         │ ◀─── Evaluates Three-Way Match:
  │  (agent/src/index.ts)        │       • Deliverable verification (GitHub REST / IPFS)
  └──────────────┬───────────────┘       • Reputation tier & spend cap checks
                 │                       • Anti-replay normalization
                 ▼
  ┌──────────────────────────────┐
  │  NEAR AI Cloud Deliberation  │ ◀─── Inspector Agent (Quality Score)
  │  (agent/src/deliberation.ts) │ ◀─── Risk Arbiter (Treasury Exposure)
  └──────────────┬───────────────┘ ◀─── GET /v1/attestation/report (Nonce challenge)
                 │                      Sha256 Attestation Digest bound to proposal
                 ▼
  ┌──────────────────────────────┐
  │  Pre-Flight check_policy     │ ◀─── View call to PolicyHelper.check_policy
  │  (agent/src/dao.ts)          │      Doomed proposals are rejected before filing
  └──────────────┬───────────────┘
                 │
                 ▼ add_proposal (Attached NEAR bond)
  ┌──────────────────────────────┐
  │  Sputnik DAO v2 Treasury     │ ◀─── Proposal: FunctionCall -> PolicyHelper::release
  │  (*.sputnik-dao.testnet)     │
  └──────────────┬───────────────┘
                 │
                 ▼ act_proposal (VoteApprove)
  ┌──────────────────────────────┐
  │  Human Council Quorum        │ ◀─── Council members review proposal in Trezu / ZiniPay
  │  (Multi-Sig Approval)        │
  └──────────────┬───────────────┘
                 │
                 ▼ Executes FunctionCall with attached deposit
  ┌──────────────────────────────┐
  │  PolicyHelper Contract       │ ◀─── Enforces: caller == DAO, CID unused, cooldown elapsed,
  │  (contracts/policy-helper)   │      deposit >= amount, amount <= effective_cap(tier)
  └──────────────┬───────────────┘
                 │
                 ├──────────────────────────────────────┐
                 ▼ Promise.transfer                     ▼ then(on_release_done)
  ┌──────────────────────────────┐      ┌────────────────────────────────┐
  │  Contributor Payout          │      │  On-Chain Callback             │
  │  (Native NEAR or Intents)    │      │  • Success: +5 rep (cap at 19) │
  └──────────────────────────────┘      │  • Failure: unburns CID/cooldown│
                                        └────────────────────────────────┘
```

---

## 🔗 Claim-to-Code Mapping

Every capability advertised in this documentation is implemented directly in the repository:

| Architectural Claim | Implementation File | Key Invariant / Mechanism |
| :--- | :--- | :--- |
| **Three-Way Match Verification** | [`agent/src/policy.ts`](file:///agent/src/policy.ts) | Verifies deliverable proof, stay within spend cap, and confirms zero deliverable replay. |
| **Multi-Agent Deliberation** | [`agent/src/deliberation.ts`](file:///agent/src/deliberation.ts) | Inspector + Risk Arbiter consensus with Zod schema validation; fail-closed catch blocks. |
| **NEAR AI Cloud TEE Attestation** | [`agent/src/deliberation.ts`](file:///agent/src/deliberation.ts) | Queries `GET /v1/attestation/report` with 32-byte client nonce; verifies Intel TDX quote & computes SHA-256 digest. |
| **On-Chain Policy Guardrails** | [`contracts/policy-helper/src/lib.rs`](file:///contracts/policy-helper/src/lib.rs) | Rust contract verifying caller authorization, tier caps, cooldown periods, and CID anti-replay. |
| **Strict Attached Deposit Funding** | [`contracts/policy-helper/src/lib.rs`](file:///contracts/policy-helper/src/lib.rs#L129) | Requires `env::attached_deposit().as_yoctonear() >= amount.0`; balance fallback dropped to protect storage staking. |
| **Promise Rollback Callback** | [`contracts/policy-helper/src/lib.rs`](file:///contracts/policy-helper/src/lib.rs#L155) | Chained `on_release_done` promise callback; automatically rolls back CID and cooldown if transfer fails. |
| **Reputation Anti-Creep Ceiling** | [`contracts/policy-helper/src/lib.rs`](file:///contracts/policy-helper/src/lib.rs#L168) | Automated milestone completions cap at 19 pts (Bronze); Silver (20+) and Gold (60+) require human council vote. |
| **Pre-Flight check_policy View** | [`agent/src/dao.ts`](file:///agent/src/dao.ts) | Calls `check_policy` on-chain before filing proposal; prevents doomed proposals from locking treasury bonds. |
| **NEAR Intents 1Click Swaps** | [`agent/src/intents.ts`](file:///agent/src/intents.ts) | Real live 1Click API integration (`POST /v0/quote`, `GET /v0/status`) for cross-chain settlement. |
| **Attack Attempts Audit Trail** | [`frontend/src/components/AttackAttemptsPanel.tsx`](file:///frontend/src/components/AttackAttemptsPanel.tsx) | Live dashboard panel displaying blocked exploit attempts and real failure reasons. |

---

## 🛡️ Attack Resilience: Tested & Verified Failure Modes

ZiniPay is architected to **fail closed**. All security assertions are tested in unit tests and live testnet scripts:

### 1. Deliverable CID Replay Attack
- **Attack**: A contributor attempts to submit a previously settled deliverable CID (`near/core-contracts#42`) to claim a second payout.
- **Enforcement**: Checked by [`PolicyEngine.check`](file:///agent/src/policy.ts) and on-chain by [`PolicyHelper.release`](file:///contracts/policy-helper/src/lib.rs#L122).
- **Exact Error**: `Deliverable CID already used: near/core-contracts#42`
- **Rust Test**: `test_duplicate_cid_fails` (passes in `contracts/policy-helper/src/lib.rs`).

### 2. Over-Cap Payout Attack
- **Attack**: An attacker requests 50 NEAR for a Bronze contributor whose effective cap is 10 NEAR.
- **Enforcement**: Contract checks `amount <= self.get_effective_cap(&recipient)`.
- **Exact Error**: `Requested amount exceeds effective reputation cap`
- **Rust Test**: `test_tier_boundaries` (verifies boundaries at 19, 20, 59, 60).

### 3. Unauthorized Caller Invoking Release
- **Attack**: Malicious account `attacker.sputnik-evil.testnet` calls `release()` directly on `PolicyHelper` to drain funds.
- **Enforcement**: Guarded by `assert_owner_or_dao()`.
- **Exact Error**: `Unauthorized: Only owner or DAO can call release`
- **Rust Test**: `test_attacker_fails_release` (passes in `contracts/policy-helper/src/lib.rs`).

### 4. Fake / Missing TEE Attestation
- **Attack**: Attacker tampers with the NEAR AI Cloud attestation report or replays a stale report with a mismatched nonce.
- **Enforcement**: Validated by `verifyAttestationReport` in [`agent/src/deliberation.ts`](file:///agent/src/deliberation.ts).
- **Exact Error**: `Nonce mismatch: expected ... got ...`
- **Unit Test**: Test 6 in `agent/test/deliberation.test.ts`.

---

## 🧪 Verified on Testnet

The repository contains an automated end-to-end verification script ([`scripts/e2e-testnet.mjs`](file:///scripts/e2e-testnet.mjs)) executing the complete on-chain lifecycle:

```bash
# Configure funded testnet credentials in agent/.env:
#   AGENT_ACCOUNT_ID=... AGENT_PRIVATE_KEY=...
#   COUNCIL_ACCOUNT_ID=... COUNCIL_PRIVATE_KEY=...
#   DAO_CONTRACT_ID=... POLICY_CONTRACT_ID=...
#   RECIPIENT_ACCOUNT_ID=...

npm run test:e2e
```

### Verified Transaction Lifecycle Output

| Step | Action | Contract Target | Verification Status |
| :--- | :--- | :--- | :--- |
| **1. Pre-Flight** | View `check_policy` | `policy.testnet` | ✅ Passed (Cap: 10 NEAR, Cooldown: 60s) |
| **2. Propose** | `add_proposal` (FunctionCall) | `your-dao.sputnik-dao.testnet` | ✅ Dispatched with SHA-256 Attestation digest |
| **3. Vote** | `act_proposal` (`VoteApprove`) | `your-dao.sputnik-dao.testnet` | ✅ Quorum reached; `Approved` status confirmed |
| **4. Payout** | `Promise.transfer` | Contributor Account | ✅ Recipient balance increase verified |
| **5. Promotion** | `update_reputation` | `policy.testnet` | ✅ Contributor promoted to Silver (Cap: 10 → 15 NEAR) |
| **6. Attacks** | Replay, Over-Cap, Bad Caller | `policy.testnet` | ✅ 3/3 attacks failed closed with on-chain panics |

*(Per hackathon anti-fabrication rules, live transaction hashes are output strictly from live RPC execution).*

---

## 🚀 Setup & Quickstart (Clean Clone)

### Prerequisites
- Node.js >= 18
- Rust + Cargo (for contract compilation: Linux / WSL / GitHub Codespaces recommended)

### 1. Clone & Install
```bash
git clone https://github.com/kellycryptos/ZiniPay.git
cd ZiniPay
npm install
npm run build
```

### 2. Run Test Suites
```bash
# Run agent unit tests (Deliberation, Policy Anti-Replay, Live 1Click API):
npm test --prefix agent

# In Linux/Codespaces/WSL with Rust installed:
cd contracts/policy-helper
cargo test
```

### 3. Run Simulated Proposal (Instant Verification)
```bash
npm run agent:propose -- propose \
  --task "Build Sputnik DAO Three-Way Match Agent" \
  --deliverable "https://github.com/near/core-contracts/pull/42" \
  --recipient "alice.testnet" \
  --amount 4.5 \
  --dry-run
```

### 4. Start the Frontend Dashboard
```bash
npm run frontend:dev
```
Open [http://localhost:5173](http://localhost:5173). Append `?demo=1` to view simulated metrics and mock proposals, or view live Sputnik DAO data by default.

---

## 📋 Honest "Not Built Yet" List

To uphold strict hackathon integrity, the following features are planned roadmap items and are **not** claimed as completed:

1. **On-Chain Intel TDX Quote Verification**: Currently, Intel TDX quotes and nonce freshness are cryptographically verified off-chain by the agent, and the resulting SHA-256 digest is anchored on-chain in the proposal description. Full on-chain DCAP quote verification in Rust contract is planned.
2. **Chain Signatures Cross-Chain Signing**: Cross-chain settlement is currently routed through the live NEAR Intents 1Click API (`1click.chaindefuser.com`). Direct multi-chain threshold ECDSA signing via `v1.signer` is planned.
3. **Automated Council Auto-Clearing for Gold Tier**: All proposals currently require an explicit human council approval vote (`VoteApprove`). Automated execution for high-reputation contributors without human quorum is in design phase.
4. **Native Mobile App**: The UI is a responsive web application built with React/Vite/Tailwind and NEAR Wallet Selector; dedicated iOS/Android apps are not built.

---

## 📄 License
MIT © 2026 ZiniPay Contributors
