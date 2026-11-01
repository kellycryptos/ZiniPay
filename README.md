# ZiniPay

> Constrained agent layer for community treasuries. Agents propose payouts, contracts enforce policy, humans approve.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Network: NEAR Testnet](https://img.shields.io/badge/Network-NEAR%20Testnet-00EC97.svg)](https://near.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-1.80+-DEA584.svg)](https://www.rust-lang.org)

---

## What It Is

ZiniPay is a fail-closed execution layer that enables autonomous AI agents to evaluate contributor deliverables and draft treasury payout proposals without granting them direct custody or unilateral signing authority. By enforcing verifiable deliverable proofs, hard on-chain spend limits, and mandatory human multi-sig approvals, ZiniPay eliminates agent runaway spending, prompt injection exploits, and deliverable replay attacks while automating routine bounty evaluation for decentralized treasuries.

---

## For Judges: Quick Verification (Do X, See Y)

Reviewers and judges can verify the entire codebase and live testnet deployment in under 60 seconds with **zero private keys, zero wallet setup, and no `.env` required**:

> 📋 **Developer Experience & Friction Log**: See [`docs/DEVEX.md`](docs/DEVEX.md) for 13 documented NEAR protocol friction points, exact error logs, and architectural solutions encountered during development.

```bash
# 1. Install dependencies (~10s, Node.js >= 20.0.0; Node >= 24.22.1 enables live @nearai/inference-sdk attestation checks)
npm install

# 2. Run agent unit test suite (fail-closed logic, anti-replay, TEE attestation verification, 1Click quote API) (~8s)
npm test --prefix agent
# Expected: All agent tests completed successfully! (14 passing tests)

# 3. Run smart contract unit test suite (~5s, requires Linux/macOS or MSVC linker)
cd contracts/policy-helper && cargo test && cd ../..
# Expected: test result: ok. 20 passed; 0 failed

# 4. Run keyless on-chain testnet verification suite (~20s)
npm run verify:testnet
# Expected: 17 PASSED / 0 UNVERIFIED / 0 FAILED (Check 2.3 prints INFO for simulated attestation on Proposal #5)
# Verifies:
#   - Sputnik DAO v2 account active and council multi-sig quorum (>= 2 human signers)
#   - Agent proposer isolation (Requestor role only, 0 voting keys)
#   - Proposal #5 status is Approved and targets PolicyHelper::release
#   - Model review attestation receipt / status recorded
#   - PolicyHelper smart contract active and WASM code hash verified
#   - PolicyHelper bound strictly to DAO treasury
#   - Contributor reputation score is 25 (Silver tier)
#   - Silver tier spend cap scaled to 15 NEAR (1.5x base)
#   - Deliverable CID burned on-chain (cid_used: true)
#   - 4 confirmed testnet transaction receipts (proposal creation, 2 council approvals, promotion)
#   - 3 real on-chain attack transactions reverted with exact contract panic assertions (replay, over-cap, unauthorized; cooldown attack added in code, not yet run on testnet)

# 5. Run independent proposal verifier (cross-references Sputnik DAO proposal vs PolicyHelper payout) (~5s)
npm run verify:proposal -- 5
# Expected: PROPOSAL #5 VERIFIED CLEAN ON-CHAIN: 100% MATCH
# Note: Settlement receipt check works for recorded proposals (identifying Structured JSON or Legacy plain-text logs);
# others get state checks only ("settlement receipt not found, state checks only").
# Test fail-closed rejection on non-release proposals via `npm run verify:proposal -- 0`.
```

---

## How It Works

ZiniPay operates via a **Three-Way Release Gate** that separates evaluation, policy enforcement, and final fund disbursement across three distinct boundaries:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THREE-WAY RELEASE GATE                          │
└────────────────────────────────────────────────────────────────────────┘

  [1. Gate 1: Deliverable Proof]
         │  • GitHub PR: Merged status, author match, commit verification
         │  • Recipient binding: "zinipay-recipient: <account.testnet>"
         │  • IPFS CID: Canonical hash calculation & duplicate check
         ▼
  [2. Gate 2: On-Chain Policy Constraints]
         │  • PolicyHelper contract view: check_policy()
         │  • Contributor tier limits (Bronze: 10N, Silver: 15N, Gold: 20N)
         │  • Cooldown timers (e.g., 24 hours between payouts)
         │  • Anti-replay registry: duplicate CIDs rejected on-chain
         ▼
  [3. Gate 3: Human Council Quorum]
         │  • Agent submits add_proposal (Requestor role only, 0 voting keys)
         │  • Sputnik DAO v2 collects council multi-sig signatures
         │  • M-of-N threshold reached (e.g. 2-of-2 or 2-of-3 human votes)
         ▼
  [Settlement: Payout Executed]
```

### Gate 1: Deliverable Proof
Before any on-chain action is initiated, the agent evaluates the technical deliverable off-chain:
- **GitHub PR Verification**: Validates that the pull request is merged into the target repository, confirms the commit author matches the claimed contributor handle, and strictly parses the pull request description for explicit recipient identity binding (`zinipay-recipient: <account.testnet>`).
- **IPFS CID Canonicalization**: Strips transport prefixes (`ipfs://`, gateways) down to bare base32/base58 hashes and verifies deliverable uniqueness against local and on-chain registries.
- **Multi-Agent Deliberation**: The deliberation engine (Inspector and Risk Arbiter) evaluates deliverable completeness, execution quality, and treasury exposure against structured criteria.

### Gate 2: On-Chain Policy Constraints
The `PolicyHelper` smart contract enforces programmatic guardrails directly in contract execution:
- **Caller Restriction**: The contract's `release` method only accepts execution calls initiated by the designated DAO treasury.
- **Dynamic Tier Caps**: Enforces payout limits based on contributor reputation scores (Bronze [0-19 pts]: 1.0x / 10 NEAR; Silver [20-59 pts]: 1.5x / 15 NEAR; Gold [60+ pts]: 2.0x / 20 NEAR).
- **Anti-Replay Registry**: Records every settled CID in an on-chain `UnorderedSet`. Duplicate attempts fail immediately with `CID already used — duplicate release attempt blocked`.
- **Pre-Flight Simulation**: The agent executes `check_policy` via view call before submitting proposals, preventing invalid payouts from wasting gas or locking DAO proposal bonds.
- **Atomic Rollback**: If the outgoing payout transfer fails, the contract's `on_release_done` callback rolls back CID consumption and resets cooldown timers.

### Gate 3: Human Quorum
The agent operates under a restricted **Requestor** role:
- The agent holds zero council seats and cannot sign or approve proposals.
- Validated requests are submitted to a Sputnik DAO v2 treasury contract as proposals.
- Funds are only disbursed after a human council multi-sig quorum (e.g., 2-of-2 or 2-of-3 human council members) votes `VoteApprove`. Council members review deliberation reports, deliverable links, and attestation digests directly in the ZiniPay dashboard or Sputnik DAO interfaces.

#### Why a Function-Call Key Cannot Attach the Proposal Bond
On NEAR Protocol, Access Keys are strictly separated into `FullAccess` and `FunctionCall` permissions. A `FunctionCall` key is restricted to calling specific methods on a designated receiver contract and is **strictly prohibited by NEAR protocol rules from attaching a non-zero deposit** (`CannotAttachDeposit`).

In Sputnik DAO v2, calling `add_proposal` requires attaching the `proposal_bond` configured in the DAO's policy (default 1 NEAR = 10^24 yoctoNEAR) to deter proposal spam:
- **Dedicated Funded Proposer Account (Standard Production Architecture)**: The agent operates its own dedicated account (e.g., `agentzinipaytestnet.testnet`) holding a Full-Access key, funded with a small operating float (e.g., 2–5 NEAR) strictly to pay proposal bonds. Crucially, the agent holds **zero access keys or signing permissions on the DAO treasury contract itself**, and has 0 council voting rights (`Requestor` role only). Compromising the agent cannot drain treasury funds; it only exposes the agent's minimal bond float (which is refunded upon proposal resolution per DAO policy).
- **0-Bond Policy for Requestor Role (Alternative Architecture)**: If a DAO explicitly configures its policy with `proposal_bond = "0"` for the `Requestor` role, the agent can use a restricted `FunctionCall` key scoped strictly to `add_proposal`. Note that zero-bond proposal queues are not mitigated on-chain: proposal spam is possible because filing proposals incurs zero bond for authorized requestors. However, the human multi-sig council retains complete discretion to review deliverables and reject (`VoteReject`) any spam proposals.

---

## Key Features

- **Fail-Closed Agent Boundaries**: Autonomous agents hold `Requestor` permissions only, with zero ability to vote, self-approve, or bypass multi-sig threshold requirements.
- **Deliverable Identity Binding**: Prevents deliverable theft by enforcing commit authorship checks and explicit `zinipay-recipient: <account.testnet>` directives in deliverable descriptions.
- **Stateful Anti-Replay Engine**: Verifies CIDs and PR identifiers against historical records both in the agent state machine and directly in smart contract storage.
- **Reputation Tiering & Cooldowns**: Enforces contributor cooldown intervals (e.g., 24h) and spend caps scaled by verified milestone completions.
- **Pre-Flight Proposal Checks**: Queries contract view functions prior to broadcasting transactions, preventing malformed or out-of-policy proposals from locking treasury bonds.
- **Automated Rollback Callbacks**: On-chain transfer failures trigger automatic rollback of consumed CIDs and reset cooldown timers (unit tested).
- **Cross-Chain Routing (NEAR Intents)**: Integrates with the NEAR Intents 1Click API for real-time cross-chain quotes and solver routing when payouts require external assets (e.g., USDC).

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                           │
└────────────────────────────────────────────────────────────────────────┘

  [ Contributor ] ── Submits PR / CID with "zinipay-recipient: <id>"
         │
         ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  ZiniPay Agent Layer (Node.js / TypeScript)                │
  │  • Deliverable Verifier (GitHub REST / IPFS)                │
  │  • Multi-Agent Deliberation (Inspector & Risk Arbiter)       │
  │  • Pre-Flight Policy Gate (Calls PolicyHelper.check_policy) │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 │ Calls add_proposal (Requestor Role)
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  Sputnik DAO v2 Treasury (*.sputnikv2.testnet)              │
  │  • Stores proposals & holds treasury funds                   │
  │  • Requires M-of-N human council multi-sig quorum           │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 │ Council members execute VoteApprove
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  PolicyHelper Smart Contract (Rust / NEAR SDK)              │
  │  • Asserts caller == DAO                                     │
  │  • Verifies recipient tier spend cap & cooldown              │
  │  • Enforces atomic CID single-use check                      │
  │  • Disburses funds via Promise::transfer                    │
  │  • on_release_done callback handles rollback if transfer fails│
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  [ Contributor Account ] ◀── Receives Payout (NEAR or via NEAR Intents)
```

### Core Components
1. **Agent Service (`agent/`)**: TypeScript CLI and daemon. Evaluates deliverables, runs deliberation scoring, validates recipient identity, and submits proposals to the DAO.
2. **PolicyHelper Contract (`contracts/policy-helper/`)**: Rust contract enforcing tier multipliers, cooldowns, CID anti-replay, and atomic rollback callbacks.
3. **Sputnik DAO v2**: Decentralized treasury multisig contract holding community funds, managing policy bonds, and executing council votes.
4. **Dashboard (`frontend/`)**: React 18 / Vite / Tailwind web interface providing real-time visibility into active proposals, council votes, verified receipts, and blocked attack attempts.

---

## Built With

In accordance with NEAR HACKATHON Q-005 (disclosure of libraries, templates, and AI coding tools):

- **Smart Contracts (Rust)**:
  - [`near-sdk`](https://crates.io/crates/near-sdk) `v5.1.0` (with `legacy` and `unit-testing` features) for contract state, borsh serialization, cross-contract promises, callbacks, and testing environments.
- **Agent Layer (TypeScript & Node.js)**:
  - [`@nearai/inference-sdk`](https://github.com/nearai/inference-sdk) (`0.2.1`) for hardware-enforced TEE gateway & model attestation and cryptographic response verification (`client.verifyResponse`).
  - [`near-api-js`](https://github.com/near/near-api-js) (`^5.0.0`) for NEAR RPC communication, key management, view calls, and Sputnik DAO transaction broadcasting.
  - [`openai`](https://github.com/openai/openai-node) (`^4.70.0`) fallback client configured for OpenAI-compatible endpoints.
  - [`zod`](https://zod.dev) (`^4.6.7`) for strict schema enforcement, prompt injection defense, and fail-closed structured parsing.
  - [`commander`](https://github.com/tj/commander.js) (`^12.1.0`), [`chalk`](https://github.com/chalk/chalk) (`^5.3.0`), [`axios`](https://axios-http.com) (`^1.7.9`), [`lowdb`](https://github.com/typicode/lowdb) (`^7.0.1`), and [`dotenv`](https://github.com/motdotla/dotenv).
- **Frontend & Dashboard (React & Vite)**:
  - [`react`](https://react.dev) `18.3` and [`react-dom`](https://react.dev) `18.3` with [`vite`](https://vitejs.dev) `^6.0.7` and TypeScript `5.7`.
  - [`@near-wallet-selector`](https://github.com/near/wallet-selector) `^10.1.4` (Core, Modal UI, Here Wallet, Meteor Wallet, MyNearWallet) for wallet connectivity.
  - [`tailwindcss`](https://tailwindcss.com) `^3.4.17` and [`lucide-react`](https://lucide.dev) for UI styling and icons.
- **Protocols & External APIs**:
  - **Sputnik DAO v2** (`sputnikv2.testnet` / `near-daos/sputnik-dao-contract`): standard multi-sig treasury governance protocol.
  - **NEAR Intents 1Click API** (`https://1click.chaindefuser.com/v0/quote`): Defuse cross-chain solver quotes and atomic execution.
  - **NEAR AI Cloud** (`https://cloud-api.near.ai/v1`): decentralized AI inference with hardware TEE attestation for multi-agent deliberation.
  - **GitHub REST API v3**: deliverable pull request status and recipient directive parsing.
- **Templates & Boilerplate**: None. All smart contract code, agent logic, UI components, and test scripts were written specifically for ZiniPay.
- **AI Coding Assistance**: Developed with the assistance of AI coding agents (Antigravity / Claude / Codex) for rapid prototyping, contract hardening, test suite generation, and verification scripts, compliant with hackathon rule Q-005.
- **License**: Released under the open-source [MIT License](LICENSE).

---

## Getting Started

### Prerequisites
- **Node.js**: >= 20.0.0 (Node >= 24.22.1 enables live `@nearai/inference-sdk@0.2.1` hardware quote and model verification; `engines` field set in `agent/package.json`)
- **npm**: >= 10.0.0
- **Rust Toolchain**: Optional, required only for recompiling the smart contract (`cargo` with `wasm32-unknown-unknown` target)

### Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/kellycryptos/ZiniPay.git
cd ZiniPay
npm install
```

### Environment Configuration
Create an environment file for the agent:

```bash
cp agent/.env.example agent/.env
```

Configure your credentials in `agent/.env`:

```ini
# Network
NEAR_NETWORK=testnet

# Agent Account (Requestor role only, holds no council voting keys)
NEAR_ACCOUNT_ID=your-agent.testnet
NEAR_PRIVATE_KEY=ed25519:...

# Treasury Governance
DAO_CONTRACT_ID=zinipay-demo.sputnikv2.testnet
POLICY_CONTRACT_ID=zinipay-policy2.testnet
PROPOSAL_BOND=1000000000000000000000000

# Policy Defaults
MAX_SPEND_PER_PROPOSAL=10000000000000000000000000
COOLDOWN_HOURS=24
```

### How to Try It

- **DAO Treasury Contract**: [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet)
- **PolicyHelper Contract**: [`zinipay-policy2.testnet`](https://testnet.nearblocks.io/address/zinipay-policy2.testnet)
- **Deployed Contract Code Hash**: Base58: `Eft7wVX8nQ2NjxWNR3xThoXBhCXpzXZa6qHcjcYLeWCy` (SHA-256: `cb1dcd4d021bc94c7a3a41ca3985e1d0725fb058db75c47e85e5dc6d98b36ce2`)
- **Source Commit**: Believed to match `8e8ef52` (failure-log parity; not independently reproduced)

#### 1. Run a Simulated Proposal (Dry Run)
Verify the complete evaluation pipeline locally without spending testnet tokens or broadcasting transactions:

```bash
npm run agent:propose -- \
  --task "Implement Sputnik DAO Three-Way Gate" \
  --deliverable "https://github.com/kellycryptos/ZiniPay/pull/1" \
  --recipient "zinipay-recipient2.testnet" \
  --amount 0.1 \
  --github-handle kellycryptos \
  --dry-run
```

The agent will fetch the pull request, verify the merged state and `zinipay-recipient` binding, run the deliberation engine, perform local policy validation, and print the proposal receipt.

#### 2. Run End-to-End Testnet Verification
To execute the complete on-chain flow with live accounts:

```bash
npm run test:e2e
```

The automated script executes the full verification lifecycle:
1. Validates agent, council, and recipient balances on NEAR Testnet.
2. Evaluates an unrelated merged PR from another author to verify the agent blocks deliverable spoofing.
3. Evaluates contributor PR `#1` and verifies recipient identity binding in the PR description (`zinipay-recipient:`).
4. Submits proposal `#5` to `zinipay-demo.sputnikv2.testnet` via FunctionCall into `PolicyHelper::release`.
5. Council Member 1 signs `VoteApprove` (status: `InProgress`).
6. Council Member 2 signs `VoteApprove` (status: `Approved`, reaches quorum).
7. Verifies on-chain disbursement receipt and recipient balance increase (+0.1 NEAR) executed via `zinipay-policy2.testnet`.
8. Updates reputation score (promoting contributor to Silver tier).
9. Executes real on-chain attack transactions against `zinipay-policy2.testnet` (replay CID, over-cap spend, unauthorized caller), asserting exact contract rejection logs and verifying 100% deposit refunds.

#### 3. Start the Dashboard
Launch the web interface to view proposals, audit logs, and governance status:

```bash
npm run frontend:dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
- Use `http://localhost:5173?demo=1` to explore the dashboard with simulated proposals and metrics.
- Connect a testnet wallet (e.g. Meteor, HERE, MyNearWallet) to view and vote on live Sputnik DAO proposals.

---

## Development Timeline & Hackathon Window Disclosure

To maintain complete transparency with judges and evaluators regarding the hackathon window and commit history (per NEAR HACKATHON rule Q-001):

- **Hackathon Window (HACKATHON.md Q-001)**: The NEAR HACKATHON was officially announced on **October 19, 2026** (see [announcement post](https://x.com/nearprotocol/status/2112257967818997891)). Rule Q-001 confirms: *"Code before 2026-11-01? Yes, from the announcement on 2026-10-19... The window runs from then to 2026-11-14."*
- **Repository Inception (October 22, 2026)**: This repository's very first commit was on **October 22, 2026** (`dbc9f41`). As a result, **100% of the code, contracts, and commits in this repository were built entirely inside the official hackathon development window**.
- **Dated Development Timeline (from Git Log)**:
  - **October 22, 2026**: Initial repository setup, base monorepo architecture, initial Rust `PolicyHelper` smart contract source (`ebc3a98`), Three-Way Gate UI, Vercel config, Sputnik DAO v2 integration, and NEAR Wallet Selector.
  - **October 24, 2026**: Policy contract authorization checks & unit tests (`45996e2`), fail-closed deliberation with Zod validation, deliverable canonicalization, NEAR Intents 1Click API integration, and initial testnet scripts.
  - **October 25, 2026**: Policy contract atomic transfer callbacks & rollback (`1e0a1a8`), reputation tier alignment and cap ceiling tests (`63f4c9b`, `9e1357f`), PR author & recipient identity binding verification, and early attack scenarios.
  - **October 27, 2026**: Contributor deliverable PR #1 specification and merge, GitHub Actions WASM build workflow, /app Paper on Dark Desk redesign, and baseline testnet execution (Proposal #0).
  - **October 29, 2026**: Landing page design system, scroll-triggered tagline reveal, FASTNEAR RPC fallback, and product documentation refactor.
  - **October 30, 2026**: Deployment of `zinipay-policy2.testnet` (code hash `cb1dcd4d...`), audit run executing Proposal #5 (FunctionCall into `PolicyHelper::release`), 2-of-2 council quorum approval, contributor Silver tier promotion, and 3 blocked on-chain attack transactions (replay CID, over-cap spend, unauthorized caller).
  - **November 1, 2026**:
    - **Keyless On-Chain Verification Suite**: Created zero-credential verification suite (`scripts/verify-testnet.mjs`) checking Sputnik DAO roles, Proposal #5 execution status, PolicyHelper WASM code hash, reputation tier scaling (15N Silver cap), deliverable CID burning, and 3 on-chain blocked attack transaction receipts (18 passing checks).
    - **Contract & Agent Test Suites**: Maintained comprehensive test suites across the Rust smart contract (20 unit tests) and TypeScript agent layer (14 unit tests) with local test runner support.
    - **Zero-Fabrication Landing Page & Hero Receipt**: Redesigned landing page for Social Money track with matched `#121721` canvas, Fraunces display typography, dynamic physical rubber stamp (`PAID` on 2/2 quorum), and strict schema-backed receipt reading directly from on-chain RPC and run logs with zero hardcoded fallbacks.
    - **Data Pipeline Fail-Safe**: Hardened `scripts/record-verified.mjs` and `LandingHero.tsx` with strict selection (`kind === "payout"`, `status === "Approved"`) and tested automated fallback to `SAMPLE` receipt with stamp suppression when data is missing.
    - **Contract-Level CID Normalization & Case-Variant Anti-Replay Guard**:
      - Implemented `normalize_cid` (`cid.trim().to_ascii_lowercase()`) across all CID operations in `PolicyHelper` Rust contract (`release`, `check_policy`, `record_release`, `unburn_cid`, `cid_used`, and `on_release_done`) and TypeScript agent layer.
      - Added 8 new Rust unit tests (expanding the contract test suite from 12 to 20 passing unit tests) verifying case-variant deliverable rejection, `check_policy` anti-replay, and ownership transfer governance.
      - Added on-chain Attack Scenario 4 (Case-Variant CID Replay) to `scripts/e2e-testnet.mjs` (added, not yet run on testnet pending contract redeployment).
    - **Contract Admin Governance & Outcome Logs**:
      - Added `transfer_ownership(new_owner: AccountId)` guarded strictly by `assert_owner()`, enabling one-way transfer of admin powers to `zinipay-demo.sputnikv2.testnet`.
      - Added structured JSON logs emitted by `on_release_done` (`event: "settled"` or `"rolled_back"` with recipient, amount, canonical CID, tier, and cap), verified by 20 unit tests.
    - **Independent Proposal Verifier**:
      - Created `scripts/verify-proposal.mjs` (`npm run verify:proposal -- <id>`) allowing judges to independently verify any proposal on Sputnik DAO v2 against `PolicyHelper` state and on-chain settlement receipts with zero private keys.
    - **Developer Experience Friction Log**:
      - Authored [`docs/DEVEX.md`](docs/DEVEX.md) documenting 13 real technical hurdles, exact errors, and solutions verified from repository history and terminal logs.
    - **Offline-Resilient Intents Test Suite**: Hardened `agent/test/intents-live.test.ts` to gracefully handle external 1Click API rate limiting/outages without crashing test runners.

---

## Known Limitations & Audit Disclosures

To maintain absolute transparency with judges and auditors, the following architectural boundaries and operational disclosures are documented:

1. **Owner-Controlled Reset Powers**: The policy contract includes administrative helper methods (`unburn_cid`, `reset_cooldown`, `update_reputation`) currently callable by the contract owner (`zinipay-c1.testnet`). In this testnet testing environment, these allowed reproducible e2e test execution without waiting 24 hours between runs. In production, these methods will be migrated to DAO-only execution, requiring a full Sputnik DAO council multi-sig vote to execute.
2. **Agent-Side Daily Ceilings**: Daily volume spend ceilings are currently enforced in the agent daemon memory and pre-flight deliberation layer. The on-chain `PolicyHelper` contract enforces hard per-proposal tier caps (Bronze: 10N, Silver: 15N, Gold: 20N) and per-recipient cooldown timers.
3. **Deliberation Simulation Fallback**: When NEAR AI Cloud returns HTTP 402 (spending limit / payment required on cloud.near.ai), the deliberation engine falls back to local deterministic heuristic deliberation with explicit `simulated: true` flagging.
4. **Attestation Verification Scope**: The `@nearai/inference-sdk@0.2.1` is designed to verify the NEAR AI Cloud Gateway Intel TDX DCAP hardware quote and model worker TEE quote before signing responses. Proposal #5 currently on record in `verified.json` was generated in simulation mode prior to funding credit; its attestation is explicitly labeled `Simulated run (attestation report received, not independently verified)`. No claim of verified Intel TDX hardware quotes is made for Proposal #5 until a live funded run is executed on testnet.
5. **Development Run History**: Earlier testnet proposals (#0 through #4) and reset pairs were executed during development. Proposal #5 and the subsequent attack transactions represent the clean, reproducible audit run recorded in `verified.json`.
6. **Deployed Contract Version**: The contract deployed on `zinipay-policy2.testnet` (code hash `cb1dcd4d021bc94c7a3a41ca3985e1d0725fb058db75c47e85e5dc6d98b36ce2`) predates commit `1637910`. The CID normalization, case-variant anti-replay guard, and `transfer_ownership` method in commits `2c4aa37` and `1637910` are verified by 20 unit tests but have not yet been redeployed to testnet.

---

## Contracts

### Testnet Deployments

| Component | Testnet Account / Contract Address | Description |
| :--- | :--- | :--- |
| **Sputnik DAO v2** | [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet) | Community treasury contract holding funds and collecting multi-sig votes |
| **Sputnik DAO Factory** | `sputnikv2.testnet` | Official Sputnik DAO v2 factory contract on NEAR Testnet |
| **PolicyHelper Contract** | [`zinipay-policy2.testnet`](https://testnet.nearblocks.io/address/zinipay-policy2.testnet) | Policy enforcement contract (Deployed code hash: `cb1dcd4d...` / base58 `Eft7wVX8...`, built locally from commit `0952e25`) |
| **Agent Account** | [`agentzinipaytestnet.testnet`](https://testnet.nearblocks.io/address/agentzinipaytestnet.testnet) | Dedicated proposer account (`Requestor` role, 0 voting keys; Full-Access key on funded account with small operating balance to attach 1 NEAR proposal bond) |
| **Council Member 1** | [`zinipay-c1.testnet`](https://testnet.nearblocks.io/address/zinipay-c1.testnet) | Human council signer (1/2 quorum) |
| **Council Member 2** | [`zinipay-c2.testnet`](https://testnet.nearblocks.io/address/zinipay-c2.testnet) | Human council signer (2/2 quorum) |
| **Verified Recipient** | [`zinipay-recipient2.testnet`](https://testnet.nearblocks.io/address/zinipay-recipient2.testnet) | Contributor payout recipient |

### Mainnet Deployments
*Mainnet deployment is scheduled following formal smart contract audits.*

### Verified On-Chain Transactions (Testnet Proof)

| Action | Transaction Hash | Explorer Link | Result |
| :--- | :--- | :--- | :--- |
| **Proposal #5 Creation** | `H86k4iESXPQAQJ4ugixJ4rWh7dcVtPw1UeBE5iJD3B1b` | [NEARBlocks](https://testnet.nearblocks.io/txns/H86k4iESXPQAQJ4ugixJ4rWh7dcVtPw1UeBE5iJD3B1b) | FunctionCall proposal into `PolicyHelper::release` created by agent |
| **Council 1 Approval** | `AdeAxJt6LH1YD17r5k3vVL65Pd7EApJt7gyjALSWPAfL` | [NEARBlocks](https://testnet.nearblocks.io/txns/AdeAxJt6LH1YD17r5k3vVL65Pd7EApJt7gyjALSWPAfL) | Vote 1/2 recorded (`VoteApprove`) |
| **Council 2 Approval & Release** | `4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd` | [NEARBlocks](https://testnet.nearblocks.io/txns/4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd) | Quorum reached; `PolicyHelper` executes +0.1 NEAR payout receipt |
| **Council Promotion** | `Dfz77EFjDZK7pCNU6uDfm1Go9pkyfuHaCiUTuNeLZEtB` | [NEARBlocks](https://testnet.nearblocks.io/txns/Dfz77EFjDZK7pCNU6uDfm1Go9pkyfuHaCiUTuNeLZEtB) | Contributor promoted to Silver tier (25 pts, 1.5x cap) |
| **Blocked Attack: Replay CID** | `Bzet7f4ASdxJzoJ3JG3XNdgq24K5BGBoGcoeK9Tm49MZ` | [NEARBlocks](https://testnet.nearblocks.io/txns/Bzet7f4ASdxJzoJ3JG3XNdgq24K5BGBoGcoeK9Tm49MZ) | Panics: `"CID already used — duplicate release attempt blocked"`; deposit refunded |
| **Blocked Attack: Over-Cap** | `ArgK3E9z9SaZjL1oL135NishyKRoiGR5DrDg6iahCGMB` | [NEARBlocks](https://testnet.nearblocks.io/txns/ArgK3E9z9SaZjL1oL135NishyKRoiGR5DrDg6iahCGMB) | Panics: `"Amount 16000000000000000000000000 exceeds effective tier cap..."`; deposit refunded |
| **Blocked Attack: Unauthorized** | `7TUXWbphreoBpwj6YbuJrHRMhsmBgcVDgHt3JxMZUC5D` | [NEARBlocks](https://testnet.nearblocks.io/txns/7TUXWbphreoBpwj6YbuJrHRMhsmBgcVDgHt3JxMZUC5D) | Panics: `"Only owner or designated DAO can call this"`; deposit refunded |

---

## Development

### Repository Structure

```
zinipay/
├── agent/                  # TypeScript Agent Layer
│   ├── src/
│   │   ├── deliberation.ts # Multi-agent evaluation & PR verification
│   │   ├── policy.ts       # Deliverable normalization & spend cap checks
│   │   ├── dao.ts          # Sputnik DAO v2 integration & pre-flight views
│   │   ├── intents.ts      # NEAR Intents 1Click cross-chain API
│   │   └── index.ts        # CLI entry point
│   └── test/               # Deliberation, policy & anti-replay unit tests
├── contracts/
│   └── policy-helper/      # Rust smart contract
│       ├── src/lib.rs      # Policy enforcement, tier logic & callbacks
│       └── Cargo.toml
├── frontend/               # React 18 / Vite / Tailwind Dashboard
│   ├── src/
│   │   ├── components/     # UI panels, proposal lists & landing sections
│   │   └── context/        # Wallet selector & contract interaction state
├── scripts/                # Testnet deployment & verification scripts
└── package.json            # Monorepo workspaces configuration
```

### Running Tests

#### Agent Unit Tests
Tests deliverable normalization, anti-replay constraints, recipient binding validation, and NEAR Intents integration:

```bash
npm test --prefix agent
```

#### Smart Contract Unit Tests
Tests spend caps, tier boundaries, duplicate CID rejection, and caller authorization (requires Rust toolchain on Linux/WSL/macOS):

```bash
cd contracts/policy-helper
cargo test
```

#### Frontend Production Build
Validates TypeScript compilation and bundles static assets:

```bash
npm run frontend:build
```

---

## License

This project is licensed under the [MIT License](LICENSE).
