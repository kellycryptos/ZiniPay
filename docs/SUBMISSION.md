# ZiniPay — NEAR Hackathon Submission Packet

> Complete submission packet aligned with all AI screening and human judging criteria.
> Submission deadline: **14 November 2026, 23:59 UTC**.
> Note: Submissions cannot be edited after submission.

---

## 1. Submission Metadata & Track Selection

| Field | Submission Value | Notes |
| :--- | :--- | :--- |
| **Project Name** | **ZiniPay** | Constrained Agent Layer for Community Treasuries |
| **Tagline** | Agents propose payouts, contracts enforce policy, humans approve. | Focus: Fail-closed governance on Sputnik DAO v2 |
| **Primary Tracks** | **1. AI Agents**<br>**2. AI Security & Defense**<br>**3. Social / Governance (Sputnik DAO)** | Directly fits contract architecture and multi-agent roles |
| **Public GitHub Repo** | `https://github.com/kellycryptos/ZiniPay` | Must remain public |
| **Live Web App / Dashboard** | `https://zini-pay.vercel.app` (Demo mode: `https://zini-pay.vercel.app/app?demo=1`) | Zero wallet required to inspect live testnet state |
| **Sputnik DAO Treasury** | [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet) | Active Sputnik DAO v2 treasury contract |
| **PolicyHelper Contract** | [`zinipay-policy2.testnet`](https://testnet.nearblocks.io/address/zinipay-policy2.testnet) | Rust smart contract enforcing on-chain policy |
| **DevEx / Friction Log** | [`docs/DEVEX.md`](DEVEX.md) | 13 documented NEAR protocol friction points |

---

## 2. Idea Description (Submission Form Field: 20–2,000 Characters)

*Character count: 1,585 characters (strictly within the 20–2,000 character limit).*

```text
Autonomous AI agents are transforming bounty evaluation and contributor workflows, but granting agents direct custody or unilateral signing authority over community treasuries invites catastrophic risks: prompt injection, deliverable replay attacks, hallucinated milestones, and runaway treasury drains. 

ZiniPay solves this dilemma by introducing a fail-closed, multi-agent evaluation layer for Sputnik DAO v2 that separates deliberation, policy enforcement, and fund disbursement into a Three-Way Release Gate:

1. Off-Chain Evaluation: An Inspector Agent validates technical pull requests (commit hashes, merged status, and explicit "zinipay-recipient" identity binding), while a Risk Arbiter assesses treasury exposure. When configured with NEAR AI Cloud, gateway and model TEE hardware quotes are verified via @nearai/inference-sdk@0.2.1.
2. On-Chain NEAR Enforcement: The agent operates under a restricted "Requestor" role holding zero voting keys. Proposals must target our custom Rust "PolicyHelper" smart contract (zinipay-policy2.testnet), which programmatically enforces per-proposal spend caps based on contributor reputation scores (Bronze: 10N, Silver: 15N, Gold: 20N), enforces cooldown timers, and permanently burns deliverable CIDs into an on-chain UnorderedSet to mathematically eliminate double-spends.
3. Multi-Sig Human Quorum: Funds are disbursed only when a human council multi-sig quorum (2-of-2 on zinipay-demo.sputnikv2.testnet) votes VoteApprove. If a transfer fails, atomic callbacks rollback CID consumption.

Built with Rust, near-sdk v5, TypeScript, React, and Sputnik DAO v2.
```

---

## 3. Public X Demo Post (Mandatory Rule)

### Primary Tweet Copy
*Must state: built at NEAR HACKATHON, tag `@NEARProtocol`, and include `#NEARHackathon`.*

```text
Built at NEAR HACKATHON: Introducing ZiniPay 🪙🤖

AI agents propose bounties. Smart contracts enforce spend caps. Humans approve.

Giving AI agents unilateral treasury access leads to runaway spending and prompt injection exploits. ZiniPay introduces a fail-closed evaluation layer for Sputnik DAO v2 treasuries on @NEARProtocol:

1. Off-chain: Dual agents evaluate GitHub PRs & verify deliverable identity bindings
2. On-chain: Rust PolicyHelper contract enforces tier spend caps & burns CIDs against replay
3. Governance: Sputnik DAO 2-of-2 human council multi-sig retains final quorum before any payout executes

Watch the 90-second end-to-end proof: legitimate PR evaluation → proposal creation → multi-sig settlement → blocked attacks.

Code: https://github.com/kellycryptos/ZiniPay
Live App: https://zini-pay.vercel.app/app?demo=1
Explorer: https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet

#NEARHackathon #NEAR #AI #Web3Security
```

### Video Recording Storyboard (60–90 Seconds)
*Judges require a video showing one complete user action → visible result.*

| Time | Scene | Action on Screen | Voiceover / Text Overlay |
| :--- | :--- | :--- | :--- |
| **0:00–0:25** | **Independent Verification** | Run `npm run verify:testnet` and `npm run verify:proposal -- 5` in terminal. | *"ZiniPay is an open-source, fail-closed treasury layer. In under 20 seconds, any reviewer can verify our live Sputnik DAO deployment and on-chain proposal receipts without private keys."* |
| **0:25–0:50** | **Agent Evaluation & Policy Gate** | Run `npm run agent:propose -- ... --dry-run` with legitimate PR #2. | *"A contributor submits PR #2. The agent queries live on-chain policy, verifies the merged GitHub PR author and recipient binding, checks spend caps, and formats a constrained FunctionCall proposal for Sputnik DAO."* |
| **0:50–1:10** | **Blocked Attacks Demo** | Run proposal with burned PR #1 (replay) and then amount `25` (over-cap). | *"Watch what happens when an exploit is attempted: replaying settled PR #1 is rejected on-chain by the PolicyHelper anti-replay registry. Requesting 25 NEAR fails immediately against the contributor's 15 NEAR Silver cap."* |
| **1:10–1:30** | **On-Chain Settlement & Dashboard** | Show NEARBlocks explorer tabs for Proposal #5 and 2-of-2 votes, then show `localhost:5173`. | *"On NEARBlocks: Proposal #5 reached 2-of-2 human council approval and disbursed 0.1 NEAR. The agent holds 0 voting keys. Smart contracts enforce safety; humans retain custody."* |

---

## 4. Live Proof: Confirmed Testnet Receipts

Every phase of the governance lifecycle is verifiable on NEAR Testnet:

| Action | Transaction Hash | Explorer Link | Result |
| :--- | :--- | :--- | :--- |
| **Proposal #5 Creation** | `H86k4iESXPQAQJ4ugixJ4rWh7dcVtPw1UeBE5iJD3B1b` | [NEARBlocks](https://testnet.nearblocks.io/txns/H86k4iESXPQAQJ4ugixJ4rWh7dcVtPw1UeBE5iJD3B1b) | `FunctionCall` proposal into `PolicyHelper::release` created by agent (`agentzinipaytestnet.testnet`) |
| **Council Signer 1 Approval** | `AdeAxJt6LH1YD17r5k3vVL65Pd7EApJt7gyjALSWPAfL` | [NEARBlocks](https://testnet.nearblocks.io/txns/AdeAxJt6LH1YD17r5k3vVL65Pd7EApJt7gyjALSWPAfL) | Council member 1 votes `VoteApprove` (1/2 quorum reached) |
| **Council Signer 2 Approval & Release** | `4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd` | [NEARBlocks](https://testnet.nearblocks.io/txns/4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd) | Council member 2 votes `VoteApprove` (2/2 quorum reached); contract executes payout receipt (+0.1 NEAR) |
| **Contributor Tier Promotion** | `Dfz77EFjDZK7pCNU6uDfm1Go9pkyfuHaCiUTuNeLZEtB` | [NEARBlocks](https://testnet.nearblocks.io/txns/Dfz77EFjDZK7pCNU6uDfm1Go9pkyfuHaCiUTuNeLZEtB) | Contributor promoted to Silver tier (25 pts, 1.5x cap) |
| **Blocked Attack: Replay Deliverable** | `Bzet7f4ASdxJzoJ3JG3XNdgq24K5BGBoGcoeK9Tm49MZ` | [NEARBlocks](https://testnet.nearblocks.io/txns/Bzet7f4ASdxJzoJ3JG3XNdgq24K5BGBoGcoeK9Tm49MZ) | Panics: `"CID already used — duplicate release attempt blocked"`; deposit refunded |
| **Blocked Attack: Over-Cap Spend** | `ArgK3E9z9SaZjL1oL135NishyKRoiGR5DrDg6iahCGMB` | [NEARBlocks](https://testnet.nearblocks.io/txns/ArgK3E9z9SaZjL1oL135NishyKRoiGR5DrDg6iahCGMB) | Panics: `"Amount 16000000000000000000000000 exceeds effective tier cap..."`; deposit refunded |
| **Blocked Attack: Unauthorized Caller** | `7TUXWbphreoBpwj6YbuJrHRMhsmBgcVDgHt3JxMZUC5D` | [NEARBlocks](https://testnet.nearblocks.io/txns/7TUXWbphreoBpwj6YbuJrHRMhsmBgcVDgHt3JxMZUC5D) | Panics: `"Only owner or designated DAO can call this"`; deposit refunded |

---

## 5. Judge & AI Screener Quick Verification Matrix

Judges and screening LLMs can verify the complete implementation using standard terminal commands:

| Check | Command | Expected Output | Zero-Key Capable |
| :--- | :--- | :--- | :--- |
| **Agent Unit Tests** | `npm test --prefix agent` | 14 passed (fail-closed logic, anti-replay, 1Click quote) | Yes |
| **Testnet State Verification** | `npm run verify:testnet` | 17 PASSED / 0 UNVERIFIED / 0 FAILED | Yes |
| **Independent Proposal Verifier** | `npm run verify:proposal -- 5` | PROPOSAL #5 VERIFIED CLEAN ON-CHAIN: 100% MATCH | Yes |
| **Non-Release Proposal Rejection** | `npm run verify:proposal -- 0` | Fails closed (`Target Mismatch: Proposal #0 is not a FunctionCall proposal`) | Yes |
| **Live Agent Pre-Flight** | `npm run agent:propose -- --task "Implement DAO dashboard" --deliverable "https://github.com/kellycryptos/ZiniPay/pull/2" --recipient "zinipay-recipient2.testnet" --amount "1" --dry-run` | Three-Way Match clears; queries live contract state; outputs draft proposal | Yes |
| **Replay Attack Rejection** | `npm run agent:propose -- --task "Replay" --deliverable "https://github.com/kellycryptos/ZiniPay/pull/1" --recipient "zinipay-recipient2.testnet" --amount "1" --dry-run` | Fails immediately: `Deliverable proof already settled on-chain` | Yes |
| **Contract Unit Tests** | `cd contracts/policy-helper && cargo test && cd ../..` | 20 passed; 0 failed | Yes (Linux/macOS) |
