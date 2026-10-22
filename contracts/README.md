# SynCommons — Contracts Reference

This directory holds ABI typings and reference data for the Sputnik DAO v2 contract.

No custom smart contracts are needed for SynCommons. We interact with:

1. **Sputnik DAO v2** — deployed at `*.sputnik-dao.near` / `*.sputnik-dao.testnet`
   - Factory: `sputnik-dao.near` (mainnet) / `sputnikv2.testnet` (testnet)
   - Docs: https://github.com/near-daos/sputnik-dao-contract

2. **NEAR MPC Signer** (for Chain Signatures, phase 2)
   - `v1.signer` (mainnet) / `v1.signer.testnet`
   - Docs: https://docs.near.org/build/chain-abstraction/chain-signatures

## Creating a Test DAO

```bash
# Using near-cli (install: npm i -g near-cli)

near call sputnikv2.testnet create \
  '{"name":"syncommons-test","args":"<BASE64_ENCODED_ARGS>"}' \
  --accountId YOUR_ACCOUNT.testnet \
  --amount 5 \
  --gas 300000000000000 \
  --networkId testnet
```

Or use the Trezu UI at https://app.trezu.org to create a treasury with one click.

## Key Sputnik DAO Methods

| Method | Type | Description |
|---|---|---|
| `add_proposal` | Change | Submit new proposal (requires bond) |
| `act_proposal` | Change | Vote / finalize a proposal |
| `get_policy` | View | Read roles, voting rules, bonds |
| `get_proposals` | View | Paginated proposal list |
| `get_proposal` | View | Single proposal by ID |
| `get_last_proposal_id` | View | Most recent proposal ID |

## Trezu Role Mapping → Sputnik Roles

| Trezu Role | Sputnik Equivalent | What Agent Needs |
|---|---|---|
| Requestor | Custom role with `add_proposal` only | ✅ Agent uses this |
| Finance | Council with vote permissions | Human approvers |
| Governance | Admin/policy-change role | Human admins |

## Agent Key Security

The agent MUST use a **function-call key**, not a full-access key:

```bash
near add-key AGENT_ACCOUNT \
  --contract-id DAO_CONTRACT \
  --allowance 0.25 \
  --method-names add_proposal \
  --networkId testnet
```

This key can ONLY call `add_proposal`. It cannot:
- Transfer NEAR from the treasury
- Vote on proposals
- Change the DAO policy
- Access any other contract
