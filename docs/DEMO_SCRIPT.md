# ZiniPay — Product Walkthrough & Architecture Demo (2–3 Minutes)

This guide outlines the honest product walkthrough designed to demonstrate **verifiable on-chain execution**, **policy-constrained releases**, and **fail-closed security** in ~2.5 minutes without overclaiming.

---

## ⏱️ Timeline & Scene Breakdown

### 🎬 Scene 1: Real On-Chain Settlement on Explorer (0:00 – 1:00)
**Goal**: Demonstrate on-chain execution of Proposal #5 (FunctionCall into `PolicyHelper::release`) and multi-sig quorum with real transaction explorer receipts.

- **Screen**: Web browser opened to [https://testnet.nearblocks.io](https://testnet.nearblocks.io)
- **Voiceover**:
  > *"Decentralized community treasuries face a dilemma: giving AI agents unchecked spending power invites catastrophic prompt-injection exploits, while purely manual multisigs bottleneck operations.
  >
  > Welcome to ZiniPay—a constrained agent layer for community treasuries on Sputnik DAO v2.
  >
  > In the first 45 seconds, let's look at real on-chain execution on NEARBlocks testnet. Here is Proposal #5 on our Sputnik DAO `zinipay-demo.sputnikv2.testnet`.
  >
  > Notice the action: it's a FunctionCall executing `release` on our PolicyHelper contract `zinipay-policy2.testnet`. The agent filed this proposal, but the agent holds zero voting keys.
  >
  > Here is Council Member 1 (`zinipay-c1.testnet`) casting VoteApprove—the proposal remained InProgress. Only after Council Member 2 (`zinipay-c2.testnet`) cast their VoteApprove did the proposal reach 2-of-2 quorum, transition to Approved, and trigger the contract payout receipt releasing 0.1 NEAR to the contributor.
  >
  > Next, let's look at what happens when an attack occurs. Here on the explorer are three blocked attack transactions:
  > 1. A replayed deliverable CID: rejected with 'CID already used — duplicate release attempt blocked'.
  > 2. An over-cap spend attempt: rejected with 'Amount exceeds effective tier cap'.
  > 3. An unauthorized caller trying to bypass the DAO: rejected with 'Only owner or designated DAO can call this'.
  > All three panics happened on-chain, refunding the gas deposit safely."*

---

### 🎬 Scene 2: Deliberation CLI & Identity Binding (1:00 – 1:40)
**Goal**: Demonstrate how the agent evaluates deliverables and fails closed.

- **Screen**: Terminal split-screen (VS Code / CLI)
- **Command to Run**:
  ```bash
  npm run agent:propose -- \
    --task "Implement Sputnik DAO Three-Way Gate" \
    --deliverable "https://github.com/kellycryptos/ZiniPay/pull/1" \
    --recipient "zinipay-recipient2.testnet" \
    --amount 0.1 \
    --dry-run
  ```
- **Voiceover**:
  > *"Behind each proposal is our deliberation pipeline:
  > First, the deliverable verifier checks that the pull request is merged, matches the committer handle, and verifies that the PR description includes an explicit identity binding line: `zinipay-recipient: <account.testnet>`. Without this line, the agent rejects the deliverable to prevent deliverable theft.
  > Second, the agent simulates on-chain policy against our PolicyHelper contract.
  > Third, the agent requests a hardware enclave attestation report from NEAR AI Cloud with a fresh 32-byte nonce. Note that we fetch and log this report, but do not yet verify it independently on-chain.
  > [If live credit available: 'Here the dual-agent review ran against Llama 3.3 70B on NEAR AI Cloud.' / If simulation: 'Because NEAR AI Cloud returned 402 payment required on this run, deliberation fell back to deterministic local simulation with explicit simulation tagging.']*

---

### 🎬 Scene 3: Community Treasury Dashboard & Honest Limitations (1:40 – 2:30)
**Goal**: Showcase the live frontend, explain demo mode, and state architectural limitations transparently.

- **Screen**: Browser on ZiniPay Dashboard ([https://zini-pay.vercel.app/app?demo=1](https://zini-pay.vercel.app/app?demo=1))
- **Actions on Screen**:
  1. Highlight the **"Three-Way Release Gate"** indicators (`Scope Verified`, `Cap ≤ Limit`, `Zero Replay`).
  2. Point out the **"Simulation"** label on the demo mode banner.
  3. Show the **"Attack Attempts & Blocked Exploits"** panel in the right sidebar.
- **Voiceover**:
  > *"On the ZiniPay dashboard at zini-pay.vercel.app, council members and contributors see live data straight from Sputnik DAO RPC.
  >
  > We provide an explicit `?demo=1` mode so anyone can explore simulated proposals and deliberation logs without needing testnet tokens.
  >
  > To be completely transparent about our current scope:
  > - Daily spend limits currently live in the agent daemon, while per-proposal tier caps and cooldowns live on-chain in Rust.
  > - In this hackathon testnet deployment, owner reset functions exist for reproducible testing; in production, these will be strictly DAO-governed.
  > - Cross-chain settlement is verified via live quotes with the NEAR Intents 1Click API.
  >
  > By pairing Sputnik DAO multi-sig security with on-chain policy enforcement, ZiniPay provides a practical, fail-closed foundation for AI agents in community governance."*

---

## 💻 Explorer Receipts Reference Sheet

| Action | Transaction Hash | Explorer Link |
| :--- | :--- | :--- |
| **Proposal #5 Creation** | `H86k4iESXPQAQJ4ugixJ4rWh7dcVtPw1UeBE5iJD3B1b` | [NEARBlocks](https://testnet.nearblocks.io/txns/H86k4iESXPQAQJ4ugixJ4rWh7dcVtPw1UeBE5iJD3B1b) |
| **Council 1 Approval** | `AdeAxJt6LH1YD17r5k3vVL65Pd7EApJt7gyjALSWPAfL` | [NEARBlocks](https://testnet.nearblocks.io/txns/AdeAxJt6LH1YD17r5k3vVL65Pd7EApJt7gyjALSWPAfL) |
| **Council 2 Approval & Release** | `4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd` | [NEARBlocks](https://testnet.nearblocks.io/txns/4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd) |
| **Blocked: Replay CID** | `Bzet7f4ASdxJzoJ3JG3XNdgq24K5BGBoGcoeK9Tm49MZ` | [NEARBlocks](https://testnet.nearblocks.io/txns/Bzet7f4ASdxJzoJ3JG3XNdgq24K5BGBoGcoeK9Tm49MZ) |
| **Blocked: Over-Cap** | `ArgK3E9z9SaZjL1oL135NishyKRoiGR5DrDg6iahCGMB` | [NEARBlocks](https://testnet.nearblocks.io/txns/ArgK3E9z9SaZjL1oL135NishyKRoiGR5DrDg6iahCGMB) |
| **Blocked: Unauthorized Caller** | `7TUXWbphreoBpwj6YbuJrHRMhsmBgcVDgHt3JxMZUC5D` | [NEARBlocks](https://testnet.nearblocks.io/txns/7TUXWbphreoBpwj6YbuJrHRMhsmBgcVDgHt3JxMZUC5D) |
