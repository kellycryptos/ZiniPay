# ZiniPay 🪙🤖 — Video Demo Script (2–3 Minutes)

This script outlines the video walkthrough for hackathon judges, designed to showcase **real on-chain transactions**, **cryptographic attestation**, and **fail-closed security** in 2.5 minutes.

---

## ⏱️ Timeline & Scene Breakdown

### 🎬 Scene 1: Real On-Chain Settlement on NEAR Explorer (0:00 – 1:00)
**Goal**: Prove on-chain legitimacy immediately with real transaction explorer receipts.

- **Screen**: Web browser opened to [https://testnet.nearblocks.io](https://testnet.nearblocks.io)
- **Voiceover**:
  > *"Decentralized community treasuries face a dilemma: giving AI agents unchecked spending power invites catastrophic prompt-injection exploits, while purely manual multisigs bottleneck operations.
  >
  > Welcome to ZiniPay—the 100% NEAR-aligned constrained agent layer for Sputnik DAO and Trezu.
  >
  > In the first 30 seconds, let's look at a real transaction on NEARBlocks. Here is Proposal #42 on our Sputnik DAO. Notice the proposal description: it includes an attestation reference digest from NEAR AI Cloud, labeled honestly as 'Attestation report received (not independently verified)'.
  >
  > The proposal wasn't a loose transfer—it was an atomic FunctionCall targeting our Rust `PolicyHelper` contract. When the human council voted VoteApprove, the DAO attached the exact payout deposit, `release` validated the spend cap and CID uniqueness, transferred the funds to the contributor, and chained an on-chain callback that automatically updated the contributor's reputation score. Everything you see here happened on NEAR testnet."*

---

### 🎬 Scene 2: Multi-Agent Deliberation & TEE Attestation (1:00 – 1:45)
**Goal**: Demonstrate how the agent evaluates deliverables and fails closed against attacks.

- **Screen**: Terminal split-screen (VS Code / CLI)
- **Command to Run**:
  ```bash
  npm run agent:propose -- \
    --task "Build Sputnik DAO Three-Way Match Agent" \
    --deliverable "https://github.com/near/near-sdk-rs/pull/1651" \
    --recipient "vsavchyn-dev.testnet" \
    --amount 4.5 \
    --dry-run
  ```
- **Voiceover**:
  > *"Behind the proposal is our dual-agent deliberation pipeline. In the terminal, our agent runs the Three-Way Match:
  > First, the Inspector Agent verifies technical depth and authenticates the GitHub PR status.
  > Second, the Risk Arbiter evaluates treasury exposure against the contributor's reputation tier.
  > Third, the engine challenges NEAR AI Cloud's attestation endpoint with a fresh 32-byte cryptographic nonce, confirming receipt of the TEE hardware enclave report.
  >
  > And most importantly, ZiniPay fails closed. Let's see what happens during an exploit attempt—if an attacker replays a previously paid CID, requests funds above their tier cap, or provides an invalid deliverable, the transaction is rejected instantly with an on-chain panic. No funds can ever leave the treasury without meeting all three gates."*

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
  > Every proposal clearly displays its decoded action, target contract, and verified attestation reference. Council members can review the work and cast their multi-sig vote in one click.
  >
  > In the sidebar, our 'Attack Attempts' audit panel provides full transparency into blocked exploits—showing replayed CIDs, spend cap violations, and unauthorized callers caught by our contract guardrails.
  >
  > By pairing Sputnik DAO multi-sig security, NEAR AI Cloud confidential computing, and on-chain policy enforcement, ZiniPay provides the safest way for DAOs to automate contractor payouts. Built for NEAR in 2026."*

---

## 💻 Exact Commands Cheat Sheet

| Step | Command Line Execution |
| :--- | :--- |
| **Run E2E On-Chain Test** | `npm run test:e2e` |
| **Run Deliberation CLI** | `npm run agent:propose -- --task "Task" --deliverable "https://github.com/near/near-sdk-rs/pull/1651" --recipient "vsavchyn-dev.testnet" --amount 4.5 --dry-run` |
| **Run Agent Unit Tests** | `npm test --prefix agent` |
| **Start Frontend** | `npm run frontend:dev` |

---

## 📢 X (Twitter) Post Text

```text
Excited to present ZiniPay 🪙🤖 for the @NEARProtocol Hackathon!

Autonomous AI treasury agents without guardrails are an existential risk. Purely manual multisigs are a bottleneck.

ZiniPay introduces a constrained, fail-closed agent layer for Sputnik DAO / @trezu_app:
🛡️ Three-Way Match verification (Deliverable Proof + Policy Clearance + Human Quorum)
🧠 Verifiable confidential inference via NEAR AI Cloud (Intel TDX hardware attestations)
⚡ Atomic payouts & anti-replay via our Rust PolicyHelper contract
🌐 Cross-chain settlement via NEAR Intents 1Click

Watch the demo & check the verified testnet transactions:
🔗 https://github.com/kellycryptos/ZiniPay

#NEAR #AI #SputnikDAO #Trezu #SocialMoney #Web3
```
