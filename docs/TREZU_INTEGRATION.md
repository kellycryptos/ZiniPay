# Trezu Alternative Custody Layer Integration

> How ZiniPay integrates with Trezu treasuries on NEAR Protocol without modifying core multisig contracts or replacing Sputnik DAO v2.

---

## Overview

[Trezu](https://trezu.app) is NEAR's modern multi-sig treasury governance platform designed for DAO councils, teams, and community funds. Under the hood, Trezu treasuries are governed by **Sputnik DAO v2** smart contracts and NEAR native multi-sig policies.

Because ZiniPay's architecture enforces strict role separation (**Agent proposes → PolicyHelper constrains → Human council approves**), ZiniPay is wire-compatible with any Trezu-managed treasury.

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ZINIPAY + TREZU CUSTODY FLOW                         │
└────────────────────────────────────────────────────────────────────────┘

  [1. Contributor Deliverable]
         │  • GitHub PR (merged, author match, zinipay-recipient line)
         │  • IPFS CID deliverable proof
         ▼
  [2. ZiniPay Agent & Deliberation]
         │  • Three-Way Match & Anti-Replay check
         │  • Queries contributor reputation from PolicyHelper
         │  • Resolves Approval Tier:
         │      - Micro/Small (<= 1N or 2N): Fast-track single council
         │      - Medium (<= 5N): Single council approval
         │      - Large (> 5N): Full DAO multi-sig quorum
         │      - Over-Cap: Rejection (fail-closed)
         ▼
  [3. Trezu-Managed Sputnik DAO v2]
         │  • Agent submits add_proposal (Requestor role only, 0 voting keys)
         │  • Proposal targets PolicyHelper::release(recipient, amount, cid)
         ▼
  [4. Human Council Signing in Trezu UI]
         │  • Council members view deliverable proof & attestation in Trezu UI
         │  • Fast-track approval (1 signature) OR standard quorum (>= 2 signatures)
         ▼
  [5. Atomic Execution & Settlement]
         │  • PolicyHelper burns CID, updates cooldown, transfers funds
         │  • Contributor reputation score & completed tasks updated on-chain
```

---

## 4-Step Setup Guide for Communities

### Step 1: Deploy or Identify Your Trezu Treasury
Every Trezu organization is backed by a Sputnik DAO v2 account (e.g. `<community>.sputnikv2.testnet`). Identify your treasury contract ID in the Trezu organization settings.

### Step 2: Grant Agent the Requestor Role
In Trezu's member and role management:
1. Add the ZiniPay agent account (`agentzinipaytestnet.testnet` on testnet) as a member with the **Requestor** role.
2. Ensure the Requestor role has only `*:AddProposal` permission and **zero** voting permissions (`VoteApprove`, `VoteReject`, or `*`).
3. The agent is now strictly restricted to filing proposals with a required bond deposit (e.g. 1 NEAR).

### Step 3: Link the PolicyHelper Contract
Deploy or configure ZiniPay's `PolicyHelper` contract (`zinipay-policy2.testnet` on testnet):
1. Set the Trezu DAO contract ID as the authorized caller (`dao_account_id`).
2. Transfer or retain contract ownership with the council.
3. Configure community spend caps: base cap (e.g. 10 NEAR), cooldown period (demo deployment uses 60 seconds; configurable in production e.g. 24 hours), and reputation multiplier tiers.

### Step 4: Configure ZiniPay Agent & Frontend
Point ZiniPay to your Trezu treasury:
```bash
# In agent/.env:
DAO_CONTRACT_ID="<your-community>.sputnikv2.testnet"
POLICY_CONTRACT_ID="zinipay-policy2.testnet"
```
Or in the ZiniPay Web UI:
1. Click the **Connection** button in the header.
2. Enter your Trezu Sputnik DAO contract ID.
3. The interface immediately reads live treasury reserves, pending proposals, and PolicyHelper state.

---

## Tiered Approval Workflow with Trezu

When a contributor submits a bounty or milestone claim:

| Contributor Tier | Payout Range | Trezu Approval Quorum | Mechanism |
| :--- | :--- | :--- | :--- |
| **Gold** (>= 60 pts) | Micro (&le; 2 NEAR) | **Auto-Approved / 0 Votes** | Micro-cleared under strict spend cap |
| **Gold** (>= 60 pts) | Medium (&le; 8 NEAR) | **1 Council Member** | Single council member approves in Trezu |
| **Gold** (>= 60 pts) | Large (&gt; 8 NEAR) | **Full Quorum (>= 2)** | Multi-sig council quorum required in Trezu |
| **Silver** (20 - 59 pts) | Small/Medium (&le; 5 NEAR) | **1 Council Member** | Single council member approves in Trezu |
| **Silver** (20 - 59 pts) | Large (&gt; 5 NEAR) | **Full Quorum (>= 2)** | Multi-sig council quorum required in Trezu |
| **Bronze** (0 - 19 pts) | All (&le; 10 NEAR) | **Full Quorum (>= 2)** | Mandatory multi-sig human review |
| **Any Contributor** | Over Effective Cap | **BLOCKED (Fail-Closed)** | PolicyHelper panics, protecting Trezu treasury |

---

## Security Invariants

1. **Zero Agent Custody**: The agent holds no funds. Funds reside strictly in the Trezu-managed Sputnik DAO contract.
2. **Fail-Closed Spend Caps**: Even if a rogue proposal is created, `PolicyHelper::release()` panics on-chain if the amount exceeds the contributor's reputation tier limit or violates cooldowns.
3. **Anti-Replay Guarantees**: Deliverable CIDs are burned on-chain upon payout. Duplicate releases are blocked atomically.
4. **Full Recovery Rights**: The Trezu council retains complete multi-sig ownership and recovery capabilities (`reset_cooldown`, `unburn_cid`, `update_reputation`).
