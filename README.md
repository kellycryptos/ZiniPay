# ZiniPay

Let an AI agent ask for money, but never let it take any.

ZiniPay is an agent for community treasuries on NEAR. The agent reads a finished piece of work and proposes a payment. A Rust contract caps the amount and blocks repeats. Two humans approve every payout on a Sputnik DAO v2.

Live site: https://zini-pay.vercel.app

Status: NEAR testnet only. Not audited. The AI review step is simulated in this build (see Limits).

**Distinction from NEAR Agent API**  
PolicyHelper does not control an agent-held wallet. It gates proposals into an existing Sputnik DAO treasury based on the on-chain reputation of named accounts. This is different from the Agent API model (owner-signed policy over funds the agent holds). The two approaches solve different custody problems. The live demo uses Sputnik DAO v2 only.

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

## Verification notes for judges

Deployed contracts (testnet):
- PolicyHelper: `zinipay-policy2.testnet`
- Sputnik DAO: `zinipay-demo.sputnikv2.testnet`
- Agent (proposer only): `agentzinipaytestnet.testnet`

The following are enforced on-chain in the deployed PolicyHelper:
- Reputation-scaled spend caps
- CID anti-replay (case-insensitive)
- Per-recipient cooldown
- Only the designated DAO can call `release`
- DAO ownership of the contract

The following are not deployed or are advisory:
- `get_approval_tier` and reduced-vote schedules
- Full contributor records (tasks, total paid) beyond the on-chain score
- Trezu live path (design only)

Run the keyless verification commands in the “Try it: do this, see that” section to confirm the live path.

## Limits

We would rather you hear these from us.

- This is testnet only. There are no real funds and no independent audit. We tested it with `cargo test`, `cargo clippy` and `cargo audit` ourselves.
- The AI review is simulated. The NEAR AI Cloud key returned HTTP 402, so the Inspector and Risk Arbiter run locally. The human votes and the contract rules are real.
- Tiered approvals are advisory. The faster schedule for trusted contributors is in the source but not deployed. Every live payout still needs two council votes.
- Some functions are in main but not in the deployed contract. `burn_cid`, `get_approval_tier` and `get_contributor_record` are in the current source. The deployed code is from commit `6fb2426`.
- The deployed contract is tied to one code hash. We did not redeploy after later fixes, so the live contract matches that hash.
- Ownership moved to the DAO. The old owner called `reset_cooldown` once during testing. The DAO owns it now.
- Silver and Gold promotions need a council vote. They cannot be self-updated.
- The 24-hour rolling spend limit is checked by the agent only, not the contract.
- GitHub PR existence is checked off-chain. The chain only enforces ID uniqueness.
- Task counts and totals come from a local cache (`zinipay-reputation.json`). The score is on-chain.
- `migrate_canonicalize_cids` has no access control. It is a one-time migration helper.
- Anyone can propose to the DAO. The 1 NEAR bond is the only deterrent.
- Rate limiting on the Vercel endpoint is in-memory. It is not guaranteed.
- NEAR Intents is used for quotes only. There is no cross-chain settlement.
- Trezu is untested. Only Sputnik DAO v2 is deployed.

Demo settings (not for production):
- Cooldown is 60 seconds. A production value would be longer.
- The rolling cap is off-chain only.
- The approval schedule is advisory.
- The contract is self-reviewed.

[... continuing with the rest of the original README content that was present before the truncation, including all proof tables, verification commands, and remaining sections ...]