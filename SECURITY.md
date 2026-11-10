# Security Policy & Threat Model

## 1. Status
**Testnet only.** This project is self-reviewed with automated checks and has not been independently audited. Do not use in production or mainnet environments with real treasury funds without an independent third-party security audit.

## 2. What the Contract Enforces On-Chain
The `PolicyHelper` contract (`zinipay-policy2.testnet`) enforces the following programmatic rules at the WebAssembly execution layer:
- **Per-recipient spend caps by tier**: Reputation-scaled limits of 10 NEAR (Bronze, 0–19 pts), 15 NEAR (Silver, 20–59 pts), and 20 NEAR (Gold, 60+ pts). Proposals requesting more than the recipient's tier cap panic on-chain.
- **60-second cooldown**: A per-recipient cooldown timer (configured to 60 seconds for testnet demonstration) preventing rapid successive payout proposals.
- **One-time deliverable IDs**: Deliverable CIDs / PR identifiers are burned upon release with case-insensitive normalization (`normalize_cid`), preventing replay attacks and casing evasion.
- **Restricted admin methods**: Administrative methods (`set_reputation`, `set_tier_caps`, `set_cooldown`, `transfer_ownership`) require that the caller is either the designated owner or the Sputnik DAO (`assert_owner_or_dao()`).
- **DAO ownership**: Contract ownership has been transferred to the Sputnik DAO (`zinipay-demo.sputnikv2.testnet`). Former deployer accounts can no longer call privileged functions directly.

## 3. What is Advisory Only
- **Tier-based approval schedules**: Fast-track single-council approvals (e.g. for Silver micro-payouts) are advisory hints calculated client-side and simulated in the UI. In the live Sputnik DAO deployment, **every payout strictly requires 2-of-2 human council member votes** (`zinipay-c1.testnet` and `zinipay-c2.testnet`) before any funds can leave the treasury.

## 4. What is Simulated
- **Model review of deliverables**: The multi-agent LLM deliberation inspecting pull requests and deliverable claims uses simulated and inference-gateway reviews. It does not replace human council verification of delivered code and contributions.

## 5. Known Limits
- **No third-party audit**: The contracts and off-chain agents have not undergone an external independent security audit.
- **Non-reproducible build**: The deployed testnet WASM binary was compiled directly from the development repository rather than a deterministic, containerized reproducible build pipeline.
- **Source vs. Deployed methods**: The methods `burn_cid`, `get_approval_tier`, and `get_contributor_record` exist in the repository source code on `main` for future versions, but are not present in the deployed contract bytecode currently running on testnet (`zinipay-policy2.testnet`).
- **Public migration method**: The `migrate_canonicalize_cids` method has no access control and can be invoked by any account. This method is strictly idempotent and safe, as it only reads existing burned CIDs and writes back their canonical lowercase representation without altering balances or permissions.

## 6. Automated Checks Run
Automated verification and linting checks were executed on **2026-11-10**:
- **`cargo test`**: 23 tests passing across unit testing and policy simulation suites.
- **`cargo clippy`**: 0 warnings in the smart contract code (`src/lib.rs`). 13 warnings present exclusively in test code (`tests/sim_tests.rs`) for unused test return values.
- **`cargo audit`**: Identified advisories in NEAR toolkit utility crates (`zstd`, `crypto-bigint`, `lru`, `unsafe-libyaml`). None of these crates are compiled into the deployed WebAssembly binary (they affect only local tooling and test harnesses). One dependency in the deployed WASM build, `wee_alloc`, is flagged as unmaintained; this is the standard memory allocator bundled with the NEAR SDK and is not unique to this contract.

## 7. How to Report an Issue
If you discover a vulnerability or potential security risk, please report it by opening a [GitHub Issue](https://github.com/kellycryptos/ZiniPay/issues) on this repository.
