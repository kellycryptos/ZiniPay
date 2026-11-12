# ZiniPay

Let an AI agent ask for money, but never let it take any.

ZiniPay is an agent for community treasuries on NEAR. The agent reads a finished piece of work and proposes a payment. A Rust contract caps the amount and blocks repeats. Two humans approve every payout on a Sputnik DAO v2.

Live site: https://zini-pay.vercel.app

Status: NEAR testnet only. Not audited. The AI review step is simulated in this build (see Limits).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Network: NEAR Testnet](https://img.shields.io/badge/Network-NEAR%20Testnet-00EC97.svg)](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet)

## The problem

If you give an AI agent a key to a community treasury, one prompt injection or bug can drain it. If a human council checks every pull request by hand, bounty payments stop scaling. We wanted a middle path where the agent does the paperwork and cannot move money on its own.

## How it works

A payout passes three gates.

1. The agent checks the deliverable off-chain. It reads the GitHub pull request, checks that it is merged, and checks that the author matches the person asking to be paid. The chain does not see this step.
2. The `PolicyHelper` contract enforces rules on-chain. The cap per payout depends on the contributor's reputation (10 NEAR Bronze, 15 NEAR Silver, 20 NEAR Gold). There is a 60 second cooldown per recipient. Each deliverable ID can be paid once, and IDs are lowercased so capital letters can't get around the check.
3. Two humans approve. Both council members must vote yes on the Sputnik DAO. The agent account can only propose. It has no vote and no council seat.

Reputation belongs to named NEAR accounts. Each finished payout adds 5 points up to 19 (Bronze). Moving to Silver (20 to 59) or Gold (60 and up) takes a council vote through the DAO.

## What is real

Everything below is on NEAR testnet and you can open each link.

- Two real payouts, 0.10 NEAR each: Proposal #5 and Proposal #6, both approved by two council votes.
- Five attacks that reverted on-chain, plus one admin call that was rejected. We found the capital-letter replay hole ourselves with a red-team run, patched it, then attacked again.
- Contract ownership moved to the DAO, so changing policy needs a council vote.

| Attack | Contract response | Transaction |
| --- | --- | --- |
| Replay a paid deliverable | CID already used | [`9Gp7HmJb9j…`](https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb) |
| Request 16 NEAR when the cap is 15 | Exceeds effective tier cap | [`EiktoyYPMJ…`](https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ) |
| Call release from a non-DAO account | Only owner or designated DAO | [`2zsvqGDF4B…`](https://testnet.nearblocks.io/txns/2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B) |
| Replay the same ID with different capital letters | CID already used | [`EwQAsc5rXE…`](https://testnet.nearblocks.io/txns/EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y) |
| Second payout inside the 60 second cooldown | Cooldown not elapsed | [`2hVRAoT67H…`](https://testnet.nearblocks.io/txns/2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD) |
| Former owner tries an admin call after ownership moved | Rejected, owner is now the DAO | [`EmKpSxi4LX…`](https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14) |

Payout transactions: Proposal #5 [`4B1ExcqigaRw…`](https://testnet.nearblocks.io/txns/4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd) and Proposal #6 [`2nWMVtQ4z2L7…`](https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d). The full list is in [`frontend/public/data/verified.json`](frontend/public/data/verified.json) and on the site at `/verify`.

## Try it: do this, see that

No private keys and no `.env` file are needed. Steps 4 to 6 read public testnet RPC, so they need internet access.

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
   See: Proposal #6 read from the DAO and checked against the policy contract, with its two council votes. Without network access it says it could not reach the RPC.

7. Do: `npm run frontend:dev`, then open http://localhost:5173/board
   See: the public board with live testnet proposals, contributor cards and receipt links. The same pages run at https://zini-pay.vercel.app.

8. Do: open any transaction link in the tables above.
   See: the real testnet transaction on NearBlocks. The five attack transactions show as failed with the contract's panic message.

## Deployed on testnet

| What | Account |
| --- | --- |
| Treasury (Sputnik DAO v2) | [`zinipay-demo.sputnikv2.testnet`](https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet) |
| Policy contract | [`zinipay-policy2.testnet`](https://testnet.nearblocks.io/address/zinipay-policy2.testnet), code hash `4aAns5JeyBVUEMLS6uJSyomHZ6qJGQGbYApLVhL4xAyt` |
| Agent (proposer only) | [`agentzinipaytestnet.testnet`](https://testnet.nearblocks.io/address/agentzinipaytestnet.testnet) |
| Council | [`zinipay-c1.testnet`](https://testnet.nearblocks.io/address/zinipay-c1.testnet) and [`zinipay-c2.testnet`](https://testnet.nearblocks.io/address/zinipay-c2.testnet) |
| Example recipient | [`zinipay-recipient2.testnet`](https://testnet.nearblocks.io/address/zinipay-recipient2.testnet) |

## Limits

We would rather you hear these from us.

- Testnet only. No real funds. No independent audit. Our own checks: `cargo test` (23 passing), `cargo clippy` (no warnings in the contract) and `cargo audit`. Details in [SECURITY.md](SECURITY.md).
- The AI review is simulated. NEAR AI Cloud returned a payment error for our key, so the review step runs locally. The human votes and the contract rules are real.
- Every payout needs both council votes. The faster approval schedule for trusted contributors exists in the source as `get_approval_tier`, but it is advisory and is not deployed.
- `burn_cid`, `get_approval_tier` and `get_contributor_record` are in `main` but not in the deployed contract (deployed from commit `6fb2426`). We did not redeploy, so the evidence above stays tied to one code hash. The build is not reproducible.
- The 24 hour rolling spend limit is checked by the agent only. The contract enforces the per payout cap, the cooldown and one-time deliverables.
- The GitHub PR check happens off-chain. The chain enforces that each deliverable ID is used once, not that the PR exists.
- Completed task counts and total paid shown in the CLI come from a local cache (`zinipay-reputation.json`). The score itself is read from the contract.
- Anyone can submit a proposal to the DAO. The 1 NEAR proposal bond is the only spam deterrent.
- Trezu is untested. The design should allow it, but we only ran Sputnik DAO v2. See [docs/TREZU_INTEGRATION.md](docs/TREZU_INTEGRATION.md).

Demo values you should not copy to production:

| Setting | Now | Suggested |
| --- | --- | --- |
| Cooldown | 60 seconds, so checks can run back to back | 24 hours |
| Rolling spend cap | Agent only | Add an on-chain window |
| Approval schedule | Advisory, 2 of 2 always | Deploy and test first |
| Audit | Self-reviewed | Independent audit before mainnet |

## Next steps

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
- `docs`: [design notes](docs/DESIGN_NOTES.md), [developer experience log](docs/DEVEX.md), [NEAR alignment](docs/NEAR_ALIGNMENT.md)

## What we used

This is the code and services that existed before the hackathon or that we did not write.

- Rust: `near-sdk` 5.1.0
- Agent: `near-api-js`, `@nearai/inference-sdk`, `openai` client, `zod`, `commander`, `axios`, `lowdb`, `dotenv`
- Frontend: React 18, Vite, TypeScript, Tailwind, `@near-wallet-selector`, `lucide-react`
- Services: Sputnik DAO v2 contracts, NEAR Intents 1Click quote API (quotes only, no settlement), NEAR AI Cloud, GitHub REST API
- No templates or boilerplate. The contract, agent, UI and scripts were written for this project.

## AI assistance

We built this with AI coding tools (Claude, Codex and Google Antigravity) for code, tests and UI, with a human reviewing the design and checking the results. The deliverable review inside the product is also an AI step, and it is simulated in this build.

## License

MIT
