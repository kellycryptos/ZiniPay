# ZiniPay

Let an AI agent ask for money, but never let it take any.

ZiniPay is an agent for community treasuries on NEAR. The agent reads a finished piece of work and proposes a payment. A Rust contract caps the amount and blocks repeats. Two humans approve every payout on a Sputnik DAO v2.

Live site: https://zini-pay.vercel.app

Status: NEAR testnet only. Not audited. The AI review step is simulated in this build (see Limits).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Network: NEAR Testnet](https://img.shields.io/badge/Network-NEAR%20Testnet-00EC97.svg)](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet)
[![Security Policy](https://img.shields.io/badge/Security-Policy%20%26%20Limits-yellow.svg)](SECURITY.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-contract-DEA584.svg)](https://www.rust-lang.org)

## Contents

1. [The problem](#the-problem)
2. [What ZiniPay does](#what-zinipay-does)
3. [How a payout flows](#how-a-payout-flows)
4. [Attacks and what stops them](#attacks-and-what-stops-them)
5. [Claims and evidence](#claims-and-evidence)
6. [Where each NEAR piece lives](#where-each-near-piece-lives)
7. [Try it: do this, see that](#try-it-do-this-see-that)
8. [Proof on testnet](#proof-on-testnet)
9. [How NEAR is used](#how-near-is-used)
10. [Deployed on testnet](#deployed-on-testnet)
11. [Limits](#limits)
12. [Hackathon tracks](#hackathon-tracks)
13. [Repository layout](#repository-layout)
14. [What we used](#what-we-used)
15. [Developer experience](#developer-experience)
16. [AI assistance](#ai-assistance)

## The problem

If you give an AI agent a key to a community treasury, one prompt injection or bug can drain it, and nothing can undo the transfer. If a human council checks every pull request by hand, bounty payments stop scaling. We wanted a middle path where the agent does the paperwork and cannot move money on its own.

Community treasuries that adopt agents run into four failures:

1. Unbounded drain. A compromised agent with a transfer key can empty the treasury in one transaction.
2. Replay. A contributor submits the same pull request or deliverable again and again to get paid each time.
3. Deliverable theft. Someone claims a merged pull request that another person wrote.
4. Prompt injection and made-up milestones. Text inside a pull request tricks the agent into approving work that doesn't exist.

## What ZiniPay does

A payout passes three gates.

1. The agent checks the deliverable off-chain.
   - It reads the GitHub pull request and checks that it is merged and that the author matches the person asking to be paid.
   - It looks for a line in the PR body that binds the payout to one account (`zinipay-recipient: <account.testnet>`), so nobody can claim someone else's work.
   - It reduces IPFS identifiers to a standard form.
   - Two agent roles, an Inspector and a Risk Arbiter, review the result with strict typed output (Zod schemas). This review is simulated in the current build.
   - The chain does not see this step.
2. The `PolicyHelper` contract enforces rules on-chain.
   - A payout can only run when the Sputnik DAO calls `PolicyHelper::release`. Direct calls are rejected.
   - The cap per payout depends on the contributor's reputation: 10 NEAR Bronze (0 to 19 points), 15 NEAR Silver (20 to 59), 20 NEAR Gold (60 and up).
   - There is a 60 second cooldown per recipient.
   - Each deliverable ID can be paid once. IDs are lowercased first so capital letters can't get around the check.
   - If the transfer fails, a callback (`on_release_done`) puts the ID back and resets the cooldown.
3. Two humans approve.
   - Both council members must vote yes on the Sputnik DAO. The agent account can only propose. It has no vote and no council seat.

### Social Money features

- Reputation tied to named accounts. Each contributor's record is tied to their NEAR named account, such as `zinipay-recipient2.testnet`. The score and cap are readable from the contract with `get_reputation` and `get_effective_cap`. Each finished payout adds 5 points up to 19. Silver and Gold need a council vote through the DAO (`update_reputation`), so scores can't be farmed.
- Tiered approvals. The source defines a faster schedule for trusted contributors: Gold up to 2 NEAR with no vote, Silver up to 5 NEAR with one vote, and two votes above that. This is advisory. It is not deployed, and the live DAO requires two votes for every payout.
- Public board at `/board`. It shows proposals, contributor cards and receipt links from real testnet data.
- Trezu. The design should allow a Trezu treasury in place of Sputnik, but this is untested. See [docs/TREZU_INTEGRATION.md](docs/TREZU_INTEGRATION.md).

## How a payout flows

```
[1. Contributor]  Submits a PR with "zinipay-recipient: <account.testnet>"
       |
[2. Agent]        Checks the PR is merged, the author and the recipient line.
       |          Runs the Inspector and Risk Arbiter review (simulated).
       |
[3. Policy check] Reads the recipient's score, tier cap, cooldown and whether
       |          the deliverable ID is already used. Also computes the advisory
       |          approval tier.
       |
[4. Proposal]     Agent calls Sputnik DAO add_proposal (proposer role only).
       |          Payload: PolicyHelper::release(recipient, amount, deliverable)
       |
[5. Human vote]   Council members zinipay-c1 and zinipay-c2 both vote yes.
       |          The DAO requires 2 of 2 today.
       |
[6. Settlement]   The DAO calls PolicyHelper::release. The contract checks:
       |            caller is the DAO, amount is within the tier cap,
       |            deliverable not used, cooldown over.
       |          Then it burns the ID, sets the cooldown and sends the NEAR.
       |          A callback rolls the ID and cooldown back if the transfer fails.
       |
[7. Reputation]   Score goes up (to 19 at most), the board shows the receipt.
```

## Attacks and what stops them

| Attack | What the attacker does | Where it stops | Result |
| --- | --- | --- | --- |
| Deliverable theft | Claims another person's merged PR | Agent check (off-chain) | The author does not match the recipient, so no proposal is created |
| Replay | Resubmits an already paid PR | Contract | Reverts with "CID already used" |
| Capital letter replay | Resubmits `KELLYCRYPTOS/ZINIPAY#2` | Contract | IDs are lowercased, so it reverts with "CID already used" |
| Over cap | Asks for more than the tier allows | Contract | Reverts with "exceeds effective tier cap" |
| Direct call | Calls `release` without the DAO | Contract | Reverts with "Only owner or designated DAO can call this" |
| Fast repeat | Second payout within 60 seconds | Contract | Reverts with "Cooldown not elapsed" |
| Agent self-approval | Agent tries to vote for its own proposal | DAO policy | The agent holds proposal rights only, no vote permissions |
| Failed transfer | Recipient account can't receive | Contract callback | The ID is released and the cooldown reset |
| Prompt injection | Instructions hidden in a PR | Agent output schema | Typed output limits what the model can return. The model review is simulated, so this part is not proven on-chain |

The red-team run found one real hole: the same ID in different capital letters passed the first duplicate check. We patched the contract, then attacked again. The second attempt reverted. Both are in the proof tables below.

## Claims and evidence

Each claim, whether the chain enforces it, where it lives in the code and the receipt that shows it.

| Claim | Enforced or advisory | Code | Evidence |
| --- | --- | --- | --- |
| Two council votes approve every payout | Enforced by Sputnik DAO | [`agent/src/dao.ts`](agent/src/dao.ts), [`scripts/setup-testnet.mjs`](scripts/setup-testnet.mjs) | [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet), votes [`22HTUkeVM6…`](https://testnet.nearblocks.io/txns/22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD) and [`2nWMVtQ4z2…`](https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d) |
| The agent has no vote and no council seat | Enforced by the DAO policy | [`scripts/setup-testnet.mjs`](scripts/setup-testnet.mjs) | `npm run verify:testnet`, check 1.3 |
| Payout cap depends on reputation (10, 15 or 20 NEAR) | Enforced on-chain | [`contracts/policy-helper/src/lib.rs`](contracts/policy-helper/src/lib.rs) (`get_effective_cap`, `release`) | Recipient score 30, cap 15 NEAR. Over-cap attack [`EiktoyYPMJ…`](https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ) |
| Each deliverable ID pays once, capital letters ignored | Enforced on-chain | same file (`release`, `cid_used`) | Replay [`9Gp7HmJb9j…`](https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb), case variant [`EwQAsc5rXE…`](https://testnet.nearblocks.io/txns/EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y) |
| 60 second cooldown per recipient | Enforced on-chain | same file (`release`) | Cooldown attack [`2hVRAoT67H…`](https://testnet.nearblocks.io/txns/2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD) |
| Only the DAO can call `release` | Enforced on-chain | same file (`release`) | Unauthorized call [`2zsvqGDF4B…`](https://testnet.nearblocks.io/txns/2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B) |
| The DAO owns the contract | Enforced on-chain | same file (`update_reputation` and admin methods) | Ownership transfer [`BmUTUzULrC…`](https://testnet.nearblocks.io/txns/BmUTUzULrCCNDK1GTpwmq5QMLgvwPbFjGAjDjVnwZwJX), former owner blocked [`EmKpSxi4LX…`](https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14) |
| Two payouts of 0.10 NEAR were made | Recorded on-chain | [`frontend/public/data/verified.json`](frontend/public/data/verified.json) | Proposals #5 and #6, see Proof on testnet |
| Approval schedule by tier (fewer votes for trusted contributors) | Advisory. Not deployed | [`agent/src/reputation.ts`](agent/src/reputation.ts), `get_approval_tier` in source only | The DAO still asks for 2 of 2 |
| PR is merged and the author matches | Off-chain check in the agent | [`agent/src/policy.ts`](agent/src/policy.ts), [`agent/src/validator.ts`](agent/src/validator.ts) | Not visible on-chain |
| AI review of the deliverable | Simulated in this build | [`agent/src/deliberation.ts`](agent/src/deliberation.ts) | None. The NEAR AI Cloud key returned HTTP 402 |

## Where each NEAR piece lives

| Piece | What it does here | Code | Status |
| --- | --- | --- | --- |
| Sputnik DAO v2 | Holds the treasury, takes proposals, counts council votes | [`agent/src/dao.ts`](agent/src/dao.ts), [`frontend/src/lib/nearRpc.ts`](frontend/src/lib/nearRpc.ts) | Live on testnet |
| `PolicyHelper` contract (Rust) | Caps, cooldown, one-time IDs, reputation, rollback | [`contracts/policy-helper/src/lib.rs`](contracts/policy-helper/src/lib.rs) | Live on testnet |
| NEAR AI Cloud | Inspector and Risk Arbiter review | [`agent/src/deliberation.ts`](agent/src/deliberation.ts) | Simulated, no funded key |
| NEAR Intents (1Click quotes) | Price quote for a cross-chain payout | [`agent/src/intents.ts`](agent/src/intents.ts), [`frontend/src/components/IntentsModal.tsx`](frontend/src/components/IntentsModal.tsx) | Quotes only, no settlement |
| Wallet Selector | Connect a NEAR wallet, or look around read-only | [`frontend/src/lib/wallet.ts`](frontend/src/lib/wallet.ts), [`frontend/src/components/WalletModal.tsx`](frontend/src/components/WalletModal.tsx) | Works, read-only observer mode cannot vote |

## Try it: do this, see that

No private keys and no `.env` file are needed. Steps 4 to 8 read public testnet RPC or GitHub, so they need internet access.

1. Do: `git clone https://github.com/kellycryptos/ZiniPay.git && cd ZiniPay && npm install`
   See: dependencies install for the `agent` and `frontend` workspaces.

2. Do: `npm test --prefix agent`
   See: `All agent tests completed successfully!` The suites cover the policy engine, anti-replay checks, reputation tracking and tier logic.

3. Do: `cd contracts/policy-helper && cargo test`
   See: `test result: ok. 23 passed; 0 failed`. Needs a Rust toolchain.

4. Do: `npm run verify:testnet`
   See: with network access, every check passes and the summary reads `24 PASSED / 0 UNVERIFIED / 0 FAILED`. It confirms the 2-of-2 council, that the agent has no voting rights, that the policy contract is bound to the DAO, the recipient's score and cap, burned deliverable IDs, and the status of the recorded transactions, including the five reverted attacks.
   Without network access it prints `0 PASSED / 24 UNVERIFIED / 0 FAILED`, says nothing was verified, and exits with code 2. It never reports FAILED just because the network is down.

5. Do: `npm run verify:reputation -- zinipay-recipient2.testnet`
   See: the contributor's score (30 points), tier (Silver, 1.5x cap, 15 NEAR) and the two payout receipts with explorer links. Task counts and total paid come from a local cache, the score comes from the contract.

6. Do: `npm run verify:proposal -- 6`
   See: Proposal #6 read from the DAO and checked against the policy contract: target `zinipay-policy2.testnet::release`, recipient, amount, tier cap, burned deliverable ID and the two council votes. Without network access it says it could not reach the RPC. Run it with `5` to check Proposal #5.

7. Do: `npm run agent:propose -- --task "Implement Sputnik DAO Three-Way Gate" --deliverable "https://github.com/kellycryptos/ZiniPay/pull/2" --recipient zinipay-recipient2.testnet --amount 0.1 --github-handle kellycryptos --dry-run`
   See: `THREE-WAY MATCH FAILED` because the deliverable was already settled on-chain (PR #2 paid Proposal #6). This is the replay check running against the live contract. No transaction is sent. Without network access it prints that it could not read `cid_used` and exits with code 2, so it never clears a request it could not check.

8. Do: `npm run agent:propose -- --task "Implement Sputnik DAO Three-Way Gate" --deliverable "https://github.com/near/near-sdk-rs/pull/1651" --recipient zinipay-recipient2.testnet --amount 0.1 --github-handle kellycryptos --dry-run`
   See: the request passes the policy checks and is then rejected with `Consensus Verdict: REJECTED` because the PR author (`vsavchyn-dev`, read from GitHub) does not match the recipient handle. This is the off-chain stolen deliverable check. In this build it runs inside the simulated review step, so the output is labeled `[SIMULATION]`. It needs internet access for GitHub and NEAR RPC.

9. Do: `npm run demo:social-money`
   See: a local walkthrough with no chain calls: a request, a score update, a tiered outcome and a blocked replay. It uses a made-up account (`alice-contributor.testnet`) to show the logic, so it is an illustration and not evidence. It builds the agent first, so it takes about a minute.

10. Do: `npm run frontend:dev`, then open http://localhost:5173/board
    See: the public board with live testnet proposals, contributor cards and receipt links. The same pages run at https://zini-pay.vercel.app.

11. Do: open any transaction link in the tables below.
    See: the real testnet transaction on NearBlocks. The five attack transactions show as failed with the contract's panic message.

## Proof on testnet

Everything here is on NEAR testnet. The full list lives in [`frontend/public/data/verified.json`](frontend/public/data/verified.json) and on the site at `/verify`.

Payouts, 0.10 NEAR each, both approved by two council votes:

| Proposal | Date | Deliverable | Payout transaction |
| --- | --- | --- | --- |
| #5 | 2026-10-30 | `kellycryptos/ZiniPay#1` | [`4B1ExcqigaRw…`](https://testnet.nearblocks.io/txns/4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd) |
| #6 | 2026-11-02 | `kellycryptos/ZiniPay#2` | [`2nWMVtQ4z2L7…`](https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d) |

Proposal #5 ran on the first deployment of the contract (code hash `Eft7wVX8…`). Proposal #6 and everything after it ran on the current one (`4aAns5JeyBVUEMLS6uJSyomHZ6qJGQGbYApLVhL4xAyt`).

Proposal #6 step by step:

| Step | What happened | Transaction |
| --- | --- | --- |
| Proposal #6 created | Agent submits a FunctionCall proposal for `PolicyHelper::release` | [`HBs2djKVAtQz…`](https://testnet.nearblocks.io/txns/HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK) |
| Council 1 vote | `zinipay-c1.testnet` votes yes (1 of 2) | [`22HTUkeVM6nA…`](https://testnet.nearblocks.io/txns/22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD) |
| Council 2 vote and payout | `zinipay-c2.testnet` votes yes, quorum reached, 0.10 NEAR paid | [`2nWMVtQ4z2L7…`](https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d) |
| Promotion to Silver | Council raises the recipient to 25 points (cap 15 NEAR) | [`DfpR26Q4qgoX…`](https://testnet.nearblocks.io/txns/DfpR26Q4qgoXw1oBh481vBkizypsrME6HLwjHj3gKvYf) |

Attacks that reverted on-chain:

| Attack | Contract response | Transaction |
| --- | --- | --- |
| Replay Deliverable CID | `CID already used — duplicate release attempt blocked` | [`9Gp7HmJb9jNg…`](https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb) |
| Over-Cap Treasury Spend | `Amount 16 NEAR exceeds effective tier cap 15 NEAR for recipient zinipay-recipient2.testnet` | [`EiktoyYPMJZt…`](https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ) |
| Unauthorized Release Caller | `Only owner or designated DAO can call this` | [`2zsvqGDF4BkE…`](https://testnet.nearblocks.io/txns/2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B) |
| Case-Variant CID Replay | `CID already used — duplicate release attempt blocked` | [`EwQAsc5rXELJ…`](https://testnet.nearblocks.io/txns/EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y) |
| Cooldown Violation | `Cooldown not elapsed. 16 seconds remaining.` | [`2hVRAoT67HwC…`](https://testnet.nearblocks.io/txns/2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD) |
| Former Owner Admin Rejection | `Only owner or designated DAO can call this` | [`EmKpSxi4LXBs…`](https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14) |

Admin control moved to the DAO:

| Step | What happened | Transaction |
| --- | --- | --- |
| Ownership transferred to the DAO | PolicyHelper owner is now `zinipay-demo.sputnikv2.testnet` | [`BmUTUzULrCCN…`](https://testnet.nearblocks.io/txns/BmUTUzULrCCNDK1GTpwmq5QMLgvwPbFjGAjDjVnwZwJX) |
| Former owner blocked | A direct admin call by the old owner is rejected | [`EmKpSxi4LXBs…`](https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14) |
| Admin proposal #7 created | DAO proposal to run `update_reputation` | [`73JaSgQv8G51…`](https://testnet.nearblocks.io/txns/73JaSgQv8G51VdKTPnYwVasWFogd3EvDDzCr1dx6VJix) |
| Council 1 vote on #7 | Yes vote | [`Cs4sLs72XeLi…`](https://testnet.nearblocks.io/txns/Cs4sLs72XeLiv5yAG8qnTHJVXDfkV7e1tg46pyoK6Vk8) |
| Council 2 vote on #7 and execution | Quorum reached, the admin call runs through the DAO | [`3xqHqNnvstR7…`](https://testnet.nearblocks.io/txns/3xqHqNnvstR7uTFdV1cvpajw7BSPAxMXLgRLRyBZUYkw) |

The first entry in `blockedAttacks` (stolen deliverable) is stopped by the agent's local checks before any transaction exists, so it has no transaction hash.

## How NEAR is used

ZiniPay depends on two NEAR pieces: our `PolicyHelper` Rust contract and the Sputnik DAO v2 role system.

`PolicyHelper` (`contracts/policy-helper/src/lib.rs`, `near-sdk` 5.1.0):
- Only the designated DAO account can trigger a payout. The check is on `env::predecessor_account_id()`.
- Used deliverable IDs live in an on-chain set. IDs are normalized (trimmed and lowercased) before the lookup and the insert.
- The spend cap comes from the recipient's on-chain score.
- A cross-contract promise sends the NEAR, and the `on_release_done` callback reverses the bookkeeping if the transfer fails.

Sputnik DAO v2 (`zinipay-demo.sputnikv2.testnet`):
- The agent account `agentzinipaytestnet.testnet` is in a proposer role with `*:AddProposal` only. It is not in the council and holds no voting permission.
- The DAO needs both council votes before it calls the policy contract.

Why the agent has its own funded account: a NEAR function-call key can't attach a deposit, and Sputnik needs a 1 NEAR proposal bond. So the agent uses a small funded account for bonds only (2 to 5 NEAR). It has no keys or permissions on the treasury, so a stolen agent key can spend the bond float and nothing else.

Without NEAR we would have had to build our own multisig and role system, and handle failed transfers off-chain.

## Deployed on testnet

| What | Account |
| --- | --- |
| Treasury (Sputnik DAO v2) | [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet) |
| Policy contract | [`zinipay-policy2.testnet`](https://testnet.nearblocks.io/address/zinipay-policy2.testnet), code hash `4aAns5JeyBVUEMLS6uJSyomHZ6qJGQGbYApLVhL4xAyt` |
| Agent (proposer only) | [`agentzinipaytestnet.testnet`](https://testnet.nearblocks.io/address/agentzinipaytestnet.testnet) |
| Council | [`zinipay-c1.testnet`](https://testnet.nearblocks.io/address/zinipay-c1.testnet) and [`zinipay-c2.testnet`](https://testnet.nearblocks.io/address/zinipay-c2.testnet) |
| Example recipient | [`zinipay-recipient2.testnet`](https://testnet.nearblocks.io/address/zinipay-recipient2.testnet) |

Prerequisites: Node 20 or newer and npm 10 or newer. Rust with the `wasm32-unknown-unknown` target is only needed to rebuild the contract.

## Limits

We would rather you hear these from us.

- Testnet only. No real funds. No independent audit. Our own checks: `cargo test` (23 passing), `cargo clippy` (no warnings in the contract) and `cargo audit` (advisories only in NEAR toolkit crates that are not compiled into the deployed WASM). Details in [SECURITY.md](SECURITY.md).
- The AI review is simulated. NEAR AI Cloud returned a payment error for our key, so the review step runs locally. The human votes and the contract rules are real.
- Every payout needs both council votes. The faster approval schedule for trusted contributors exists in the source as `get_approval_tier`, but it is advisory and is not deployed.
- `burn_cid`, `get_approval_tier` and `get_contributor_record` are in `main` but not in the deployed contract (deployed from commit `6fb2426`, matched by method names). We did not redeploy, so the evidence above stays tied to one code hash. The build is not reproducible.
- Contract ownership moved to the DAO in the transaction listed above. The old owner can no longer change policy. `reset_cooldown` was called once by the old owner on Oct 30 during early testing.
- Silver and Gold promotions only happen through council action. The recipient went to 25 points by council call and to 30 through DAO Proposal #7.
- The 24 hour rolling spend limit is checked by the agent only. The contract enforces the per payout cap, the cooldown and one-time deliverables.
- The GitHub PR check happens off-chain. The chain enforces that each deliverable ID is used once, not that the PR exists.
- Completed task counts and total paid in the CLI come from a local cache (`zinipay-reputation.json`). The score itself is read from the contract.
- `migrate_canonicalize_cids` has no access control. It only rewrites existing burned IDs to their lowercase form and can be run more than once safely.
- Anyone can submit a proposal to the DAO. The 1 NEAR proposal bond is the only spam deterrent.
- The rate limiter on the Vercel endpoint is in memory and best effort. Hard limits depend on spending caps set at the AI provider.
- NEAR Intents is used for quotes only. We do not settle cross-chain.
- Trezu is untested. We only ran Sputnik DAO v2.

Demo values you should not copy to production:

| Setting | Now | Suggested |
| --- | --- | --- |
| Cooldown | 60 seconds, so checks can run back to back | 24 hours |
| Rolling spend cap | Agent only | Add an on-chain window |
| Approval schedule | Advisory, 2 of 2 always | Deploy and test first |
| Audit | Self-reviewed | Independent audit before mainnet |

Next steps:
- Deploy `get_approval_tier` and `get_contributor_record` through a council proposal and re-run the verifier.
- Store completed tasks, total paid and rejections on-chain, with a migration.
- Run one real proposal through a Trezu treasury.
- Independent audit and a reproducible build with NearBlocks contract verification.

## Hackathon tracks

We submitted to two tracks.

- Social Money: reputation tied to named NEAR accounts, and a Sputnik DAO council that approves every payout.
- AI Security & Defense: a policy contract that limits what a tricked agent can do, with spending caps, a cooldown and one-time deliverables.

Timeline: the first commit is dated 2026-10-25, after the hackathon announcement on 2026-10-19. All code was written inside the hackathon window. Everything runs on testnet, which the rules allow for every track.

## Repository layout

- `contracts/policy-helper`: the Rust contract
- `agent`: the proposing agent, GitHub checks and the policy engine (TypeScript)
- `frontend`: the website and public board (React and Vite)
- `scripts`: the verifier scripts
- `docs`: [design notes](docs/DESIGN_NOTES.md), [developer experience log](docs/DEVEX.md), [NEAR alignment](docs/NEAR_ALIGNMENT.md), [Trezu notes](docs/TREZU_INTEGRATION.md)

## What we used

This is the code and services that existed before the hackathon or that we did not write.

- Rust: `near-sdk` 5.1.0
- Agent: `near-api-js`, `@nearai/inference-sdk`, `openai` client, `zod`, `commander`, `axios`, `lowdb`, `dotenv`
- Frontend: React 18, Vite, TypeScript, Tailwind, `@near-wallet-selector`, `lucide-react`
- Services: Sputnik DAO v2 contracts, NEAR Intents 1Click quote API, NEAR AI Cloud, GitHub REST API
- No templates or boilerplate. The contract, agent, UI and scripts were written for this project.

## Developer experience

[`docs/DEVEX.md`](docs/DEVEX.md) logs the real NEAR problems we hit, with the errors and fixes. The main ones:

- Moving to `near-sdk` 5: balances became `NearToken` and storage keys needed `BorshStorageKey`.
- The Sputnik factory on testnet is `sputnikv2.testnet`, not the older `sputnikdao2.testnet`.
- A function-call key can't attach a deposit (`CannotAttachDeposit`), which led to the separate funded agent account.
- Panic messages are buried in nested promise receipts. We parse `receipts_outcome[].outcome` to find them.
- Public testnet RPC gets rate limited, so the scripts retry and fall back across several endpoints.
- The capital letter replay hole, and the lowercase fix.

## AI assistance

We built this with AI coding tools (Claude, Codex and Google Antigravity) for code, tests and UI, with a human reviewing the design and checking the results. The deliverable review inside the product is also an AI step, and it is simulated in this build.

## License

MIT
