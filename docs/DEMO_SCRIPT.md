# ZiniPay — Product Walkthrough & Architecture Demo (2–3 Minutes)

This guide outlines the honest product walkthrough designed to demonstrate **verifiable on-chain execution**, **policy-constrained releases**, and **fail-closed security** in ~2.5 minutes without overclaiming.

---

## ⏱️ Timeline & Scene Breakdown

### 🎬 Scene 1: Real On-Chain Settlement on Explorer (0:00 – 0:40)
**Goal**: Demonstrate on-chain execution of Proposal #5 (FunctionCall into `PolicyHelper::release`) and multi-sig quorum with preloaded transaction receipts.

- **Screen**: Web browser with 4 preloaded tabs:
  1. Proposal #5 on Sputnik DAO
  2. Blocked Replay CID attack
  3. Blocked Over-Cap attack
  4. Blocked Unauthorized Caller attack
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

### 🎬 Scene 2: Deliberation CLI & Identity Binding (0:40 – 1:40)
**Goal**: Demonstrate legitimate deliverable verification and fail-closed defense against deliverable theft.

- **Screen**: Terminal split-screen (VS Code / CLI)

- **Step A: Legitimate Contributor Deliverable (PR #2)**
  ```bash
  npm run agent:propose -- \
    --task "Implement Sputnik DAO Three-Way Gate" \
    --deliverable "https://github.com/kellycryptos/ZiniPay/pull/2" \
    --recipient "zinipay-recipient2.testnet" \
    --github-handle "kellycryptos" \
    --amount 0.1 \
    --dry-run
  ```
  - **Voiceover**:
    > *"Now let's look at the agent layer in the terminal. In these dry runs, the GitHub PR verification and on-chain policy queries are real, while the agent model evaluation runs in local simulation because NEAR AI Cloud credit was not configured.
    >
    > When a contributor submits work, the agent runs our evaluation pipeline:
    > In Gate 1, policy clearance reads the contract state directly on-chain: it confirms the deliverable proof is attached, verifies it stays under the recipient's Silver tier cap (15 NEAR max), and confirms zero-replay against `zinipay-policy2.testnet`.
    > In Gate 2, the Inspector Agent verifies the real GitHub PR #2: it confirms the PR is merged, matches the author handle @kellycryptos, and checks that the PR description explicitly binds `zinipay-recipient: zinipay-recipient2.testnet`.
    > The Inspector scores it 95/100, the Risk Arbiter confirms LOW risk, and deliberation reaches consensus: APPROVED.
    > In Gate 3, the agent formats a constrained FunctionCall proposal for `zinipay-policy2.testnet` ready for Sputnik DAO council multi-sig review."*

- **Step B: Stolen / Spoofed PR Attack Attempt**
  ```bash
  npm run agent:propose -- \
    --task "Implement Sputnik DAO Three-Way Gate" \
    --deliverable "https://github.com/near/near-sdk-rs/pull/1651" \
    --recipient "zinipay-recipient2.testnet" \
    --github-handle "kellycryptos" \
    --amount 0.1 \
    --dry-run
  ```
  - **Voiceover**:
    > *"Now watch what happens when an attacker tries to claim someone else's merged pull request—here an unrelated PR from near-sdk-rs:
    > Gate 1 passes policy clearance, but Gate 2 immediately halts:
    > The Inspector Agent queries the real GitHub API and flags: 'PR author (vsavchyn-dev) does not match recipient handle (kellycryptos, zinipay-recipient2.testnet)'.
    > The Consensus Verdict halts immediately with REJECTED. The agent logs the exploit attempt to attack_events.jsonl and refuses to format or submit any proposal."*

---

### 🎬 Scene 3: Community Treasury Dashboard & Honest Limitations (1:40 – 2:30)
**Goal**: Showcase the live frontend and state architectural limitations transparently.

- **Screen**: Browser on ZiniPay Dashboard ([https://zini-pay.vercel.app/app](https://zini-pay.vercel.app/app))
- **Actions on Screen**:
  1. Highlight the **"Three-Way Release Gate"** indicators (`Scope Verified`, `Cap ≤ Limit`, `Zero Replay`).
  2. Point out the **"Model review: simulated"** label.
  3. Show the **"Attack Attempts & Blocked Exploits"** panel in the right sidebar.
- **Voiceover**:
  > *"On the ZiniPay dashboard at zini-pay.vercel.app, council members and contributors see live data straight from Sputnik DAO RPC.
  >
  > No wallet is needed to look. Everything shown comes from live testnet data.
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
