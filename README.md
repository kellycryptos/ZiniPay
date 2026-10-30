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
         │  • Contributor tier limits (Bronze <= 20N, Silver <= 60N, Gold)
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
- **Dynamic Tier Caps**: Enforces payout limits based on contributor reputation scores (Bronze: up to 20 NEAR; Silver: up to 60 NEAR; Gold: council-approved custom limits).
- **Anti-Replay Registry**: Records every settled CID in an on-chain `UnorderedSet`. Duplicate attempts fail immediately with `CID already used — duplicate release attempt blocked`.
- **Pre-Flight Simulation**: The agent executes `check_policy` via view call before submitting proposals, preventing invalid payouts from wasting gas or locking DAO proposal bonds.
- **Atomic Rollback**: If the outgoing payout transfer fails, the contract's `on_release_done` callback rolls back CID consumption and resets cooldown timers.

### Gate 3: Human Quorum
The agent operates under a restricted **Requestor** role:
- The agent holds zero council seats and cannot sign or approve proposals.
- Validated requests are submitted to a Sputnik DAO v2 treasury contract as proposals.
- Funds are only disbursed after a human council multi-sig quorum (e.g., 2-of-2 or 2-of-3 human council members) votes `VoteApprove`. Council members review deliberation reports, deliverable links, and attestation digests directly in the ZiniPay dashboard or Sputnik DAO interfaces.

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

## Getting Started

### Prerequisites
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
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
- **Deployed Contract Code Hash (SHA-256)**: `cb1dcd4d021bc94c7a3a41ca3985e1d0725fb058db75c47e85e5dc6d98b36ce2`
- **Git Commit Hash**: `0952e251a7142bb5b352e675aba86a75abb6537d`

#### 1. Run a Simulated Proposal (Dry Run)
Verify the complete evaluation pipeline locally without spending testnet tokens or broadcasting transactions:

```bash
npm run agent:propose -- \
  --task "Implement Sputnik DAO Three-Way Gate" \
  --deliverable "https://github.com/kellycryptos/ZiniPay/pull/1" \
  --recipient "zinipay-recipient2.testnet" \
  --amount 0.1 \
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

## Known Limitations & Audit Disclosures

To maintain absolute transparency with judges and auditors, the following architectural boundaries and operational disclosures are documented:

1. **Owner-Controlled Reset Powers**: The policy contract includes administrative helper methods (`unburn_cid`, `reset_cooldown`, `update_reputation`) currently callable by the contract owner (`zinipay-c1.testnet`). For the hackathon testnet environment, these allowed reproducible e2e test execution without waiting 24 hours between runs. In production, these methods will be migrated to DAO-only execution, requiring a full Sputnik DAO council multi-sig vote to execute.
2. **Agent-Side Daily Ceilings**: Daily volume spend ceilings are currently enforced in the agent daemon memory and pre-flight deliberation layer. The on-chain `PolicyHelper` contract enforces hard per-proposal tier caps (Bronze: 10N, Silver: 15N, Gold: 20N) and per-recipient cooldown timers.
3. **Deliberation Simulation Fallback**: When NEAR AI Cloud returns HTTP 402 (spending limit / payment required on cloud.near.ai), the deliberation engine falls back to local deterministic heuristic deliberation with explicit `simulated: true` flagging.
4. **Attestation Verification Scope**: NEAR AI Cloud TEE attestation reports are retrieved with client-generated 32-byte nonces. The attestation report is logged and checked for structure, but is not yet independently verified against Intel TDX root CA certificates on-chain.
5. **Development Run History**: Earlier testnet proposals (#0 through #4) and reset pairs were executed during development. Proposal #5 and the subsequent attack transactions represent the clean, reproducible audit run recorded in `verified.json`.

---

## Contracts

### Testnet Deployments

| Component | Testnet Account / Contract Address | Description |
| :--- | :--- | :--- |
| **Sputnik DAO v2** | [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet) | Community treasury contract holding funds and collecting multi-sig votes |
| **Sputnik DAO Factory** | `sputnikv2.testnet` | Official Sputnik DAO v2 factory contract on NEAR Testnet |
| **PolicyHelper Contract** | [`zinipay-policy2.testnet`](https://testnet.nearblocks.io/address/zinipay-policy2.testnet) | Policy enforcement contract (Code hash: `cb1dcd4d021bc94c7a3a41ca3985e1d0725fb058db75c47e85e5dc6d98b36ce2`) |
| **Agent Account** | [`agentzinipaytestnet.testnet`](https://testnet.nearblocks.io/address/agentzinipaytestnet.testnet) | Proposing agent account (`Requestor` role, 0 voting keys) |
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
