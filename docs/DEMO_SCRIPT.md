# ZiniPay — Product Walkthrough & Architecture Demo (2–3 Minutes)

This guide outlines the product walkthrough designed to demonstrate **verifiable on-chain execution**, **multi-agent deliberation**, and **fail-closed security** in 2.5 minutes.

---

## ⏱️ Timeline & Scene Breakdown

### 🎬 Scene 1: Real On-Chain Settlement on Explorer (0:00 – 1:00)
**Goal**: Demonstrate on-chain settlement and multi-sig quorum with real transaction explorer receipts.

- **Screen**: Web browser opened to [https://testnet.nearblocks.io](https://testnet.nearblocks.io)
- **Voiceover**:
  > *"Decentralized community treasuries face a dilemma: giving AI agents unchecked spending power invites catastrophic prompt-injection exploits, while purely manual multisigs bottleneck operations.
  >
  > Welcome to ZiniPay—the constrained agent layer for Sputnik DAO and Trezu.
  >
  > In the first 30 seconds, let's look at real transactions on NEARBlocks. Here is Proposal #0 on our Sputnik DAO `zinipay-demo.sputnikv2.testnet`. Notice the proposal description: it includes an attestation reference digest from NEAR AI Cloud, labeled honestly as 'Attestation report received (not independently verified)'.
  >
  > The agent filed the proposal, but notice who approved it: Council Member 1 (`zinipay-c1.testnet`) voted VoteApprove, and the proposal remained InProgress. Only after Council Member 2 (`zinipay-c2.testnet`) cast their VoteApprove did the proposal reach quorum, transition to Approved, and disburse exactly 0.1 NEAR to the contributor (`zinipay-recipient2.testnet`). This verified baseline run used a native Sputnik DAO Transfer proposal, while our PolicyHelper contract release path is implemented and unit tested. Everything you see here happened on testnet with strict role separation."*

---

### 🎬 Scene 2: Multi-Agent Deliberation & Identity Binding (1:00 – 1:45)
**Goal**: Demonstrate how the agent evaluates deliverables and fails closed against attacks.

- **Screen**: Terminal split-screen (VS Code / CLI)
- **Command to Run**:
  ```bash
  npm run agent:propose -- \
    --task "Build Sputnik DAO Three-Way Match Agent" \
    --deliverable "https://github.com/kellycryptos/ZiniPay/pull/1" \
    --recipient "zinipay-recipient2.testnet" \
    --amount 0.1 \
    --dry-run
  ```
- **Voiceover**:
  > *"Behind the proposal is our dual-agent deliberation pipeline. In the terminal, our agent runs the Three-Way Match:
  > First, the Inspector Agent verifies technical depth and authenticates the GitHub PR status.
  > Second, the Risk Arbiter evaluates treasury exposure against the contributor's reputation tier.
  > Third, the engine challenges NEAR AI Cloud's attestation endpoint with a fresh 32-byte cryptographic nonce, confirming receipt of the TEE hardware enclave report.
  >
  > And most importantly, ZiniPay fails closed. If an attacker replays a previously paid CID, requests funds above their tier cap, or provides an invalid deliverable, the transaction is rejected instantly with an on-chain panic. No funds can ever leave the treasury without meeting all three gates."*

---

### 🎬 Scene 3: Community Treasury Dashboard & Attacks Audit (1:45 – 2:30)
**Goal**: Showcase the live frontend, council multi-sig workflow, and attack panel.

- **Screen**: Browser on ZiniPay Dashboard ([http://localhost:5173](http://localhost:5173))
- **Actions on Screen**:
  1. Highlight the **"Three-Way Release Gate"** indicators (`Scope Verified`, `Cap ≤ Limit`, `Zero Replay`).
  2. Point out the **"Attestation report received (not independently verified)"** badge.
  3. Scroll to the **"Attack Attempts & Blocked Exploits"** panel in the right sidebar.
- **Voiceover**:
  > *"On the ZiniPay dashboard, council members and contributors see live data straight from Sputnik DAO RPC.
  >
  > Every proposal clearly displays its decoded action, target contract, and attestation reference. Council members can review the work and cast their multi-sig vote in one click.
  >
  > In the sidebar, our 'Attack Attempts' audit panel provides full transparency into blocked exploits—showing replayed CIDs, spend cap violations, and unauthorized callers caught by our contract guardrails.
  >
  > By pairing Sputnik DAO multi-sig security, NEAR AI Cloud confidential computing, and on-chain policy enforcement, ZiniPay provides a secure, predictable way for DAOs to automate contractor payouts."*

---

## 💻 Exact Commands Cheat Sheet

| Step | Command Line Execution |
| :--- | :--- |
| **Run E2E On-Chain Test** | `npm run test:e2e` |
| **Run Deliberation CLI** | `npm run agent:propose -- --task "Task" --deliverable "https://github.com/kellycryptos/ZiniPay/pull/1" --recipient "zinipay-recipient2.testnet" --amount 0.1 --dry-run` |
| **Run Agent Unit Tests** | `npm test --prefix agent` |
| **Start Frontend** | `npm run frontend:dev` |

---

## 📢 Product Announcement Text

```text
Introducing ZiniPay: Constrained Agent Layer for Community Treasuries.

Autonomous AI treasury agents without guardrails are an existential risk. Purely manual multisigs create coordination bottlenecks.

ZiniPay introduces a constrained, fail-closed agent layer for Sputnik DAO and Trezu:
🛡️ Three-Way Match verification (Deliverable Proof + Policy Clearance + Human Quorum)
🧠 Verifiable confidential inference via NEAR AI Cloud (Intel TDX hardware attestations)
⚡ Atomic payouts & anti-replay via our Rust PolicyHelper contract
🌐 Cross-chain settlement via NEAR Intents 1Click

Explore the repository and testnet transactions:
🔗 https://github.com/kellycryptos/ZiniPay
```
