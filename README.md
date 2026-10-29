# ZiniPay

> **Constrained Agent Layer for Community Treasuries**  
> *Proof + Policy + Human Quorum*

[![Sputnik DAO](https://img.shields.io/badge/Sputnik-DAO%20v2-blue)](https://github.com/near-daos/sputnik-dao-contract)
[![Trezu](https://img.shields.io/badge/Trezu-Multisig-purple)](https://trezu.org)
[![NEAR Protocol](https://img.shields.io/badge/NEAR-Protocol-black?logo=near)](https://near.org)
[![NEAR Intents](https://img.shields.io/badge/NEAR-Intents-00EC97)](https://near-intents.org)

---

## 📌 Problem & Solution

**The Problem**: Autonomous AI agents managing decentralized community treasuries pose severe existential risks: prompt injections, unbounded spending, hallucinated deliverable proofs, and silent draining of multisig funds. Conversely, purely manual human multisigs create coordination bottlenecks where small contributor bounties languish unreviewed for weeks.

**The Solution**: ZiniPay introduces a **fail-closed, constrained agent layer** that works with existing Sputnik DAO v2 / Trezu treasuries without replacing human governance. The AI agent operates strictly under a **Requestor role**—evaluating technical deliverables via NEAR AI Cloud multi-agent deliberation, verifying cryptographic attestation reports, canonicalizing proofs against replay attacks, and dispatching constrained proposals to Sputnik DAO. Payouts can never execute unilaterally: spend caps, cooldowns, and CID uniqueness are enforced by the `PolicyHelper` contract (implemented and unit tested in Rust), and every disbursement requires an explicit human council multi-sig approval vote.

---

## 🏗️ Architecture & Policy Guardrails (Implemented, Covered by Unit Tests, Testnet Run Pending)

> [!NOTE]
> **Implementation Status**: The multi-agent deliberation, deliverable identity binding (`verifyArtifact`), and Sputnik DAO multi-sig approval flow are live and verified on NEAR testnet. The on-chain `PolicyHelper` contract path (`FunctionCall` into `PolicyHelper::release`, atomic CID anti-replay, and reputation callbacks) is fully implemented in Rust and covered by unit tests (`cargo test`), with on-chain testnet deployment pending.

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
  │  (*.sputnikv2.testnet)       │      (Or native Transfer during bootstrap)
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
| **NEAR AI Cloud TEE Attestation** | [`agent/src/deliberation.ts`](file:///agent/src/deliberation.ts) | Queries `GET /v1/attestation/report` with 32-byte client nonce challenge; status: "Attestation report received (not independently verified)". |
| **On-Chain Policy Guardrails** | [`contracts/policy-helper/src/lib.rs`](file:///contracts/policy-helper/src/lib.rs) | Rust contract verifying caller authorization, tier caps, cooldown periods, and CID anti-replay. |
| **Strict Attached Deposit Funding** | [`contracts/policy-helper/src/lib.rs`](file:///contracts/policy-helper/src/lib.rs#L129) | Requires `env::attached_deposit().as_yoctonear() >= amount.0`; balance fallback dropped to protect storage staking. |
| **Promise Rollback Callback** | [`contracts/policy-helper/src/lib.rs`](file:///contracts/policy-helper/src/lib.rs#L155) | Chained `on_release_done` promise callback; automatically rolls back CID and cooldown if transfer fails. |
| **Reputation Anti-Creep Ceiling** | [`contracts/policy-helper/src/lib.rs`](file:///contracts/policy-helper/src/lib.rs#L168) | Automated milestone completions cap at 19 pts (Bronze); Silver (20+) and Gold (60+) require human council vote. |
| **Pre-Flight check_policy View** | [`agent/src/dao.ts`](file:///agent/src/dao.ts) | Calls `check_policy` on-chain before filing proposal; prevents doomed proposals from locking treasury bonds. |
| **NEAR Intents 1Click Swaps** | [`agent/src/intents.ts`](file:///agent/src/intents.ts) | Real live 1Click API integration (`POST /v0/quote`, `GET /v0/status`) for cross-chain settlement. |
| **Attack Attempts Audit Trail** | [`frontend/src/components/AttackAttemptsPanel.tsx`](file:///frontend/src/components/AttackAttemptsPanel.tsx) | Live dashboard panel displaying blocked exploit attempts and real failure reasons. |

---

## 🛡️ Attack Resilience (Implemented & Unit Tested — Testnet Run Pending)

ZiniPay is architected to **fail closed**. All security assertions are implemented and verified via comprehensive unit tests with exact error strings matching the source code:

### 1. Deliverable CID Replay Attack
- **Attack**: A contributor attempts to submit a previously settled deliverable CID to claim a second payout.
- **Enforcement**:
  - On-chain contract (`contracts/policy-helper/src/lib.rs#L122`): `CID already used — duplicate release attempt blocked`
  - Agent gate (`agent/src/policy.ts#L140`): `Three-Way Match Failed: Deliverable "<cid>" has already been settled and paid.`
- **Rust Test**: `test_duplicate_cid_fails` (passes in `contracts/policy-helper/src/lib.rs`).

### 2. Over-Cap Payout Attack
- **Attack**: An attacker requests an amount exceeding the recipient's tier cap (e.g. 50 NEAR for a Bronze contributor).
- **Enforcement**:
  - On-chain contract (`contracts/policy-helper/src/lib.rs#L102`): `Amount <amount> exceeds effective tier cap <cap> for recipient <account>`
  - Agent gate (`agent/src/policy.ts#L164`): `Proposal amount <req> NEAR exceeds <tier> tier cap of <max> NEAR.`
- **Rust Test**: `test_tier_boundaries` (verifies boundaries at 19, 20, 59, 60).

### 3. Unauthorized Caller Invoking Release
- **Attack**: Malicious external account calls `release()` directly on `PolicyHelper` to drain funds.
- **Enforcement**: Guarded on-chain by `assert_owner_or_dao()` (`contracts/policy-helper/src/lib.rs#L323`).
- **Exact Error**: `Only owner or designated DAO can call this`
- **Rust Test**: `test_attacker_fails_release` (passes in `contracts/policy-helper/src/lib.rs`).

### 4. Fake / Missing TEE Attestation
- **Attack**: Attacker tampers with the NEAR AI Cloud attestation report or replays a stale report with a mismatched nonce.
- **Enforcement**: Validated by `verifyAttestationReport` in [`agent/src/deliberation.ts`](file:///agent/src/deliberation.ts#L253).
- **Exact Error**: `Nonce mismatch: expected <nonce>..., got <nonce>...`
- **Unit Test**: Test 6 in `agent/test/deliberation.test.ts`.

### 5. Stolen / Unbound PR Attack & Cryptographic Identity Binding
- **Attack**: An attacker submits a merged GitHub PR authored by someone else (`STOLEN_PR_URL` from a second GitHub account), or a PR without verifiable on-chain binding to their NEAR account.
- **Enforcement**: Validated by `verifyArtifact` in [`agent/src/deliberation.ts`](file:///agent/src/deliberation.ts). The agent strictly requires:
  1. The PR is merged.
  2. The PR author matches the claimed recipient GitHub handle.
  3. The PR description (body) contains the explicit binding line: `zinipay-recipient: <recipient.testnet>`.
- **Exact Errors**:
  - Missing binding: `PR description missing required "zinipay-recipient: <near account id>" binding`
  - Recipient mismatch: `PR zinipay-recipient binding ("<account>") does not match recipient account ("<expected>")`
  - Author mismatch: `PR author (<author>) does not match recipient handle (<handles>)`
- **Unit Tests**: Tests 1b.1 – 1b.4 in `agent/test/deliberation.test.ts`. Live e2e execution against second GitHub account PR pending user input (`STOLEN_PR_URL`).

---

## 👥 Strict Role Separation Architecture

ZiniPay enforces absolute role separation between automated agents and human signers:
1. **Agent Account (`AGENT_ACCOUNT_ID`)**: Operates strictly under a `Requestor` role. It can file proposals (`add_proposal`) but holds zero council seats and zero voting power (`*:VoteApprove`).
2. **Council Member 1 (`COUNCIL_ACCOUNT_ID`)**: First human council multi-sig member.
3. **Council Member 2 (`COUNCIL2_ACCOUNT_ID`)**: Second human council multi-sig member. Quorum requires both votes to reach threshold.
4. **Recipient (`RECIPIENT_ACCOUNT_ID`)**: Distinct external contributor account. Cannot be an agent or council member.
5. **PolicyHelper Contract (`POLICY_CONTRACT_ID`)**: Owned by Council Member 1, strictly bound to `DAO_CONTRACT_ID`.

---

## 🧪 Verified on Testnet

The repository contains an automated end-to-end verification script ([`scripts/e2e-testnet.mjs`](file:///scripts/e2e-testnet.mjs)) executing the complete on-chain lifecycle:

```bash
# Configure distinct testnet credentials in agent/.env:
#   AGENT_ACCOUNT_ID=zinipay-agent.testnet
#   COUNCIL_ACCOUNT_ID=council1.testnet
#   COUNCIL2_ACCOUNT_ID=council2.testnet
#   RECIPIENT_ACCOUNT_ID=contributor.testnet
#   DAO_CONTRACT_ID=zinipay-demo.sputnikv2.testnet
#   GITHUB_PR_URL=https://github.com/your-org/your-repo/pull/1
#   STOLEN_PR_URL=https://github.com/second-account/another-repo/pull/1

npm run test:e2e
```

### Verified Multi-Sig Testnet Execution

> [!NOTE]
> This verified run used a plain Sputnik DAO `Transfer` proposal; the policy contract path (`FunctionCall` into `PolicyHelper::release`) is implemented and unit tested but not yet exercised on testnet pending WASM deployment.

The following run was executed and verified on NEAR Testnet with strict role separation:

- **DAO Contract**: [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet)
- **Agent Account**: `agentzinipaytestnet.testnet` (Requestor role only; zero council seats, no voting permissions)
- **Council 1 Account**: `zinipay-c1.testnet` (Quorum signer 1/2)
- **Council 2 Account**: `zinipay-c2.testnet` (Quorum signer 2/2)
- **Recipient Account**: `zinipay-recipient2.testnet` (Independent contributor)
- **Contributor Deliverable**: [PR #1 on `kellycryptos/ZiniPay`](https://github.com/kellycryptos/ZiniPay/pull/1) (Merged, authored by `@kellycryptos`, with `zinipay-recipient: zinipay-recipient2.testnet`)

| Step | Action | Tx Hash | Result | Explorer Link |
| :--- | :--- | :--- | :--- | :--- |
| **1. Proposal Creation** | `add_proposal` | `3zsBfrczDpJqz27e8Cqe9C4PpSAmukmEBkjD7tMhemxC` | ✅ Proposal #0 Created | [View on NEARBlocks](https://testnet.nearblocks.io/txns/3zsBfrczDpJqz27e8Cqe9C4PpSAmukmEBkjD7tMhemxC) |
| **2. Council 1 Vote** | `act_proposal` (`VoteApprove`) | `GPRKU91X2hhTHcZ9BCqS2opATzEh5uucJWYx6hXbDkS3` | ✅ Vote 1 Confirmed; Status: `InProgress` | [View on NEARBlocks](https://testnet.nearblocks.io/txns/GPRKU91X2hhTHcZ9BCqS2opATzEh5uucJWYx6hXbDkS3) |
| **3. Council 2 Vote** | `act_proposal` (`VoteApprove`) | `9RiBxXaVFqyZALtkCztDyCyMAwFQyGHs1naKCydLN8PM` | ✅ Vote 2 Confirmed; Status: `Approved` | [View on NEARBlocks](https://testnet.nearblocks.io/txns/9RiBxXaVFqyZALtkCztDyCyMAwFQyGHs1naKCydLN8PM) |
| **4. Payout Execution** | Sputnik DAO Receipt Transfer | *Receipt in Vote 2* | 💰 +0.1000 NEAR Transferred | Plain Sputnik DAO Transfer payout receipt verified (Balance: 10.0 ➔ 10.1 NEAR) |

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
npm run agent:propose -- \
  --task "Build Sputnik DAO Three-Way Match Agent" \
  --deliverable "https://github.com/kellycryptos/ZiniPay/pull/1" \
  --recipient "zinipay-recipient2.testnet" \
  --amount 0.1 \
  --dry-run
```

### 4. Start the Frontend Dashboard
```bash
npm run frontend:dev
```
Open [http://localhost:5173](http://localhost:5173). Append `?demo=1` to view simulated metrics and mock proposals, or view live Sputnik DAO data by default.

---

## 📋 Roadmap & Current Boundaries

The following capabilities are planned roadmap items and are currently subject to explicit design boundaries:

1. **Independent Cryptographic Intel TDX DCAP Quote Verification**: Currently, the agent fetches the TEE report from `https://cloud-api.near.ai/v1/attestation/report`, confirms receipt of the Intel TDX quote payload, and checks that the server echoed back the client's 32-byte nonce challenge. Full cryptographic verification of the DCAP quote (validating PCK cert chain against Intel PCS and checking that `report_data` binds `signing_address`) is not implemented locally in this build, as it requires Intel DCAP QVL libraries or the `nearai-cloud-verifier` service. Until direct on-chain or local DCAP verification is wired in, it is labeled in code, UI badges, and docs as: **"Attestation report received (not independently verified)"**.
2. **Chain Signatures Cross-Chain Signing**: Cross-chain settlement is currently routed through the live NEAR Intents 1Click API (`1click.chaindefuser.com`). Direct multi-chain threshold ECDSA signing via `v1.signer` is planned.
3. **Automated Council Auto-Clearing for Gold Tier**: All proposals currently require an explicit human council approval vote (`VoteApprove`). Automated execution for high-reputation contributors without human quorum is in design phase.
4. **Native Mobile App**: The UI is a responsive web application built with React/Vite/Tailwind and NEAR Wallet Selector; dedicated iOS/Android apps are not built.

---

## 📄 License
MIT © 2026 ZiniPay Contributors
