# Developer Experience & Friction Log (NEAR DevEx)

> **ZiniPay Testnet Development Log**: Real errors, protocol surprises, and architectural solutions encountered while building a multi-agent Sputnik DAO governance layer on NEAR Testnet (October 22 – November 1, 2026).
>
> *Principle: Documented with exact errors, dates, and code fixes taken directly from repository commit history and terminal logs.*

---

## Summary of Key Takeaways for NEAR Ecosystem & Tooling

| # | Friction Point | Root Cause | Evidence Source | Solution Implemented |
| :- | :--- | :--- | :--- | :--- |
| 1 | **NEAR SDK v5 API Migrations** | `attached_deposit()` / balances migrated from `Balance` (`u128`) to `NearToken` | Commit `9e1357f`, `Cargo.toml` (`near-sdk = "5.1.0"`) | Updated all balance math to `NearToken::from_yoctonear` and `NearToken::as_yoctonear` |
| 2 | **Sputnik DAO v2 Factory Naming** | Testnet factory is `sputnikv2.testnet` (not `sputnikdao2` or `sputnik-dao`) | Commit `26a2ac3`, `scripts/create-dao.mjs` | Fixed factory contract ID in automated DAO deployment scripts |
| 3 | **Function-Call Keys Cannot Attach Deposits** | NEAR protocol rule: FC keys are strictly deposit=0 | Commit `b9dae32`, `scripts/setup-testnet.mjs` (`CannotAttachDeposit`) | Agent proposer uses funded account with small operating balance dedicated to bonds |
| 4 | **DAO Creation Deposit & Base64 Payload** | `sputnikv2.testnet::create` requires Base64 JSON and >= 6 NEAR storage deposit | `scripts/create-dao.mjs` lines 44-55 | Automated base64 serialization and attached 6 NEAR deposit in `create-dao.mjs` |
| 5 | **Windows PowerShell Escaping with near-cli** | PowerShell strips quotes from inline JSON arguments (`--args '{"id": 5}'`) | Commit `0952e25`, `5760d2d` | Bypassed shell CLI; migrated testnet actions to programmatic `near-api-js` scripts |
| 6 | **Single-Council Agent Self-Approval Hazard** | Initial DAO had only the agent account in council | Commit `e9a6b92`, `scripts/create-dao.mjs` | Enforced 2-of-2 human council multi-sig (`zinipay-c1`, `zinipay-c2`) with agent as Requestor |
| 7 | **Contract Initialization Arguments Deserialization** | Deploy script passed wrong argument names (`owner_id`, `dao_contract`) | `scripts/setup-testnet.mjs` / `contracts/policy-helper/src/lib.rs` line 92 | Corrected init argument names to `owner` and `dao_account_id` matching Rust struct |
| 8 | **NEAR Testnet Public RPC Instability** | `rpc.testnet.near.org` intermittent 503 / 408 / rate limits | Commit `0952e25`, `scripts/verify-testnet.mjs` | Implemented multi-RPC client prioritizing FastNEAR (`test.rpc.fastnear.com`) and Archival RPC |
| 9 | **Contract Panic Messages Buried in RPC Receipts** | Panics in cross-contract promises aren't always in top-level `status.Failure` | Commit `39efc01`, `scripts/e2e-testnet.mjs` line 275 | Built recursive parser traversing `receipts_outcome[].outcome.logs` |
| 10 | **NEAR AI Cloud HTTP 402 (Spending Limit)** | `cloud-api.near.ai/v1` requires payment setup / credits | Commit `8e8ef52`, `agent/src/deliberation.ts` line 98 | Implemented fail-closed deliberation fallback with explicit `[SIMULATION]` transparency |
| 11 | **Orphan Testnet Account (`zinipay-council2`)** | Testnet account created without saving private key before process exit | `scripts/setup-testnet.mjs` terminal log | Created fresh account `zinipay-c2.testnet` with verified local keypair persistence |
| 12 | **Windows MSVC Linker Requirement for `cargo test`** | `cargo test` for `x86_64-pc-windows-msvc` requires `link.exe` (VS C++ Build Tools) | Terminal log `cargo test` (`linker link.exe not found`) | Documented Linux/WSL requirement and automated `cargo test` via GitHub Actions Ubuntu CI |
| 13 | **Deliverable CID Case-Variant Replay Hole** | Smart contract `used_cids` stored raw strings; case variants bypassed anti-replay | Commit `1637910`, `contracts/policy-helper/src/lib.rs` | Fixed in code, not yet deployed (canonical `normalize_cid` in source; 20 unit tests) |

---

## Detailed Friction Log Entries

### 1. NEAR SDK v5 Type Breaking Changes (`NearToken`, `Gas`, `LookupMap`)
- **Date**: October 22–24, 2026
- **What I Tried**: Compiled initial `PolicyHelper` Rust smart contract using `near-sdk = "5.29.1"`.
- **Exact Error**:
  ```text
  error[E0308]: mismatched types
     --> src/lib.rs:136:13
      |
  136 |             attached >= amount.0,
      |             ^^^^^^^^^^^^^^^^^^^^ expected `NearToken`, found `u128`
  error[E0277]: the trait bound `StorageKey: BorshSerialize` is not satisfied
  ```
- **Surprise**: In NEAR SDK v5, `env::attached_deposit()` and `env::account_balance()` no longer return raw `u128` yoctoNEAR balances; they return `NearToken`. Similarly, `Gas::from_tgas(5)` replaces raw integer Gas representations, and collections require explicit `BorshStorageKey` derive.
- **The Fix**:
  - Implemented `attached = env::attached_deposit().as_yoctonear();`.
  - Added `NearToken::from_yoctonear(amount.0)` to promise transfers.
  - Derived `#[derive(BorshStorageKey, BorshSerialize)]` on `StorageKey`.

---

### 2. Sputnik DAO v2 Testnet Factory Naming Discrepancies
- **Date**: October 24, 2026
- **What I Tried**: Deployed a new Sputnik DAO v2 treasury using `sputnikdao2.testnet` and `sputnik-dao.testnet`.
- **Exact Error**:
  ```text
  Server error: [-32000] Server error: account sputnikdao2.testnet does not exist while viewing
  ```
- **Surprise**: Various documentation and forum tutorials reference `sputnikdao2.testnet` or `sputnik-dao.testnet`. On NEAR Testnet, the official, active Sputnik DAO v2 factory contract is strictly `sputnikv2.testnet`.
- **The Fix**: Updated factory target in `scripts/create-dao.mjs` to `sputnikv2.testnet` and created `zinipay-demo.sputnikv2.testnet`.

---

### 3. Protocol Limitation: Function-Call Keys Cannot Attach Deposits for Proposal Bonds
- **Date**: October 24, 2026
- **What I Tried**: Configured agent proposer with a restricted Function-Call Access Key scoped to `add_proposal` on the Sputnik DAO, while the DAO required a 1 NEAR proposal bond.
- **Exact Error**:
  ```text
  Transaction Failure: ActionError(FunctionCallError(HostError(CannotAttachDeposit)))
  ```
- **Surprise**: The NEAR protocol fundamentally prohibits Function-Call access keys from attaching a non-zero deposit (`attached_deposit > 0`). When a Sputnik DAO policy enforces `proposal_bond > 0`, an agent restricted to a Function-Call key cannot submit proposals.
- **The Fix**: Documented two architectural patterns in `scripts/setup-testnet.mjs` and README:
  - **Pattern A (Funded Proposer)**: The agent holds a full-access key on its own separate dedicated account (`agentzinipaytestnet.testnet`) with a small operating balance (2–5 NEAR) used strictly for proposal bonds. The agent holds zero keys on the DAO itself.
  - **Pattern B (0-Bond Role)**: The DAO configures `proposal_bond: "0"` for the `Requestor` role, enabling restricted Function-Call keys.

---

### 4. Sputnik DAO Creation Requires Base64 JSON and 6 NEAR Storage Deposit
- **Date**: October 27, 2026
- **What I Tried**: Invoked `sputnikv2.testnet::create` with raw JSON arguments and a 2 NEAR deposit.
- **Exact Error**:
  ```text
  Smart contract panicked: The attached deposit is less than the minimum required (6000000000000000000000000 yoctoNEAR)
  Failed to deserialize args
  ```
- **Surprise**: `sputnikv2.testnet` requires the `args` field to be Base64-encoded JSON, and requires an attached deposit of at least 6 NEAR to cover storage staking for the newly deployed sub-account.
- **The Fix**: Scripted `create-dao.mjs` with `Buffer.from(JSON.stringify(rawArgs)).toString('base64')` and attached `6000000000000000000000000` yoctoNEAR (6 NEAR).

---

### 5. Windows PowerShell JSON Quoting & CLI Incompatibilities
- **Date**: October 27–29, 2026
- **What I Tried**: Invoked `near-cli` commands from PowerShell to interact with Sputnik DAO and Policy contracts.
- **Exact Error**:
  ```text
  Error: Unexpected token 'i', "id: 5" is not valid JSON
  ```
- **Surprise**: Windows PowerShell treats single quotes differently from POSIX shells and strips double quotes from inline JSON arguments before passing them to Node/executable CLIs.
- **The Fix**: Migrated critical contract interaction workflows (`create-dao.mjs`, `e2e-testnet.mjs`, `verify-testnet.mjs`) to programmatic Node.js scripts using `near-api-js`, passing JSON objects directly and eliminating shell quoting issues.

---

### 6. Architectural Hazard: Single-Member Council Allowed Agent Self-Approval
- **Date**: October 29, 2026
- **What I Tried**: Tested initial proposal creation and approval loop.
- **Surprise**: Because `create-dao.mjs` originally initialized the DAO with only `agentzinipaytestnet.testnet` in the council policy, the agent was able to submit a proposal and immediately call `act_proposal({ action: "VoteApprove" })` to disburse treasury funds unilaterally. This broke the core security thesis of fail-closed agent governance.
- **The Fix**: Re-architected Sputnik DAO roles:
  - Removed agent from all voting roles.
  - Added dedicated human council signers: `zinipay-c1.testnet` and `zinipay-c2.testnet`.
  - Configured 2-of-2 human council multi-sig quorum before any payout executes.

---

### 7. Contract Initialization Arguments Deserialization (Wrong Parameter Names)
- **Date**: October 30, 2026
- **What I Tried**: Initialized deployed `PolicyHelper` contract via `new`.
- **Exact Error**:
  ```text
  Smart contract panicked: Failed to deserialize input from JSON
  ```
- **Surprise**: The deploy script passed parameter names `owner_id` and `dao_contract`, but the Rust contract signature was `pub fn new(owner: AccountId, dao_account_id: AccountId, per_proposal_cap: U128, cooldown_seconds: u64, min_reputation: u32)`. The argument name mismatch caused JSON deserialization panics.
- **The Fix**: Corrected argument keys to `owner` and `dao_account_id` in `scripts/setup-testnet.mjs` and deployment scripts matching the contract interface.

---

### 8. NEAR Testnet RPC Instability & FastNEAR Redundancy
- **Date**: October 29–30, 2026
- **What I Tried**: Queried NEAR Testnet for proposal states and contract view methods during automated testing.
- **Exact Error**:
  ```text
  AxiosError: Request failed with status code 503 Service Temporarily Unavailable (rpc.testnet.near.org)
  AxiosError: Request failed with status code 408 Request Timeout
  ```
- **Surprise**: The default official public RPC `https://rpc.testnet.near.org` experienced frequent rate limiting, timeouts, and 503 outages during peak hours.
- **The Fix**: Implemented a resilient multi-RPC fallback pool in all scripts:
  1. `https://test.rpc.fastnear.com` (primary for fast view calls)
  2. `https://archival-rpc.testnet.near.org` (primary for historical execution receipts)
  3. `https://rpc.testnet.near.org` (tertiary fallback)

---

### 9. Contract Panic Messages Buried in Nested Execution Receipts
- **Date**: October 30, 2026
- **What I Tried**: Asserted contract rejection messages on failed attack transactions via `EXPERIMENTAL_tx_status`.
- **Exact Error**:
  ```text
  TypeError: Cannot read properties of undefined (reading 'ActionError')
  ```
- **Surprise**: When a smart contract panics during cross-contract promise calls (such as Sputnik DAO calling `PolicyHelper::release`), the top-level `status.Failure` object often only contains generic error metadata. The actual human-readable panic string emitted by `env::panic_str()` is buried inside `receipts_outcome[i].outcome.logs`.
- **The Fix**: Built a robust receipt outcome scanner that traverses all `receipts_outcome` entries, checking `outcome.logs` for panic substrings (`"CID already used"`, `"exceeds effective tier cap"`, `"Cooldown not elapsed"`, `"Only owner or designated DAO"`).

---

### 10. NEAR AI Cloud Inference HTTP 402 & Fail-Closed Deliberation
- **Date**: October 29–30, 2026
- **What I Tried**: Executed multi-agent LLM deliberation through `https://cloud-api.near.ai/v1`.
- **Exact Error**:
  ```text
  AxiosError: Request failed with status code 402: No spending limit configured / insufficient credits
  ```
- **Surprise**: NEAR AI Cloud accounts require explicit credit funding or spending limits configured on `cloud.near.ai`. Without funded credits, API calls fail with HTTP 402.
- **The Fix**: Rather than ignoring the error or fabricating a consensus report, ZiniPay's `deliberation.ts` engine fails closed:
  - Catches HTTP 402 cleanly.
  - Automatically flags proposal with explicit `[SIMULATION]` and `simulated: true` tags.
  - Discloses local heuristic fallback in proposal description and audit disclosures.

---

### 11. Orphaned Testnet Account During Keypair Generation
- **Date**: October 29, 2026
- **What I Tried**: Created testnet council member accounts via faucet.
- **Surprise**: `zinipay-council2.testnet` was created on-chain, but the terminal process was interrupted before the private key was written to disk, leaving the account permanently orphaned with no available keypair.
- **The Fix**: Created a fresh account `zinipay-c2.testnet`, persisted its credentials immediately in `~/.near-credentials/testnet/zinipay-c2.testnet.json`, and added `zinipay-c2.testnet` to the Sputnik DAO council policy.

---

### 12. Windows Native Linker Requirement for `cargo test`
- **Date**: November 1, 2026
- **What I Tried**: Executed `cargo test` in `contracts/policy-helper` on Windows 11.
- **Exact Error**:
  ```text
  error: linker `link.exe` not found
  note: the msvc targets depend on the msvc linker but `link.exe` was not found
  ```
- **Surprise**: On Windows hosts without Visual Studio C++ Build Tools installed, `rustc` cannot link host build scripts (`proc-macro2`, `quote`) for native execution.
- **The Fix**:
  - Documented the Linux/WSL/macOS requirement for local unit testing in `README.md`.
  - Maintained test suites executable natively across Linux environments.

---

### 13. Deliverable CID Case-Variant Replay Attack Hole
- **Date**: November 1, 2026
- **Status**: Fixed in code, not yet deployed
- **What I Discovered**: Evaluated security of deliverable anti-replay checking across agent and smart contract boundaries.
- **Surprise**: While the off-chain agent normalized pull request strings to lowercase, smart contract `used_cids` stored raw string keys. An attacker could potentially submit uppercase or mixed-case variants (e.g. `KELLYCRYPTOS/ZINIPAY#1` vs `kellycryptos/zinipay#1`) to bypass `used_cids.contains(&cid)` and attempt duplicate release.
- **The Fix**: Implemented canonical `normalize_cid(cid: &str) -> String` inside `contracts/policy-helper/src/lib.rs` that trims whitespace and lowercases all deliverable CIDs before checking or inserting into `used_cids`, verified by unit tests in source. Marked for on-chain deployment with Proposal #6.
