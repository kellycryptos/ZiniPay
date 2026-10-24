#!/usr/bin/env node
/**
 * scripts/setup-testnet.mjs
 *
 * Helper that walks you through:
 *   1. Creating a testnet NEAR account for the agent
 *   2. Generating a function-call key (not a full-access key)
 *   3. Printing the .env values to paste in
 *
 * Run: node scripts/setup-testnet.mjs
 *
 * Requires: near-cli installed globally  (npm i -g near-cli)
 *           or npx near-cli
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

console.log(`
╔══════════════════════════════════════════════╗
║  ZiniPay — Testnet Setup                     ║
╚══════════════════════════════════════════════╝
`);

const daoId = await ask('Enter your Sputnik DAO contract ID (e.g. zinipay.sputnikdao2.testnet): ');
const agentAccount = await ask('Enter the agent NEAR account ID (e.g. zinipay-agent.testnet): ');

console.log(`
Next steps (run these in your terminal):

─── 1. Create the agent account (skip if it already exists) ───────────────────
  near create-account ${agentAccount} --useFaucet --networkId testnet

─── 2. Key Architecture & Bond Handling ─────────────────────────────────────
  Note: NEAR function-call access keys cannot attach a non-zero deposit.
  
  Pattern A (Recommended: Funded Proposer Account):
    If your Sputnik DAO requires a proposal bond (e.g. 1 NEAR), fund ${agentAccount}
    with 2-5 testnet NEAR. The agent will attach the bond deposit when submitting proposals.
    Security: The agent holds zero access to the DAO account; only its own small bond balance is active.
    Export key: cat ~/.near-credentials/testnet/${agentAccount}.json

  Pattern B (0-Bond Role with Restricted Function-Call Key):
    If your DAO sets proposal_bond to "0" for the Requestor role, add a restricted function-call key:
    near add-key ${agentAccount} \\
      --contract-id ${daoId} \\
      --allowance 0.25 \\
      --method-names add_proposal \\
      --networkId testnet

  Then export the private key for ${agentAccount} from your keystore.

─── 3. Add the agent as a Requestor in Trezu ──────────────────────────────────
  - Go to https://app.trezu.org (or testnet equivalent)
  - Open your treasury → Settings → Members
  - Add ${agentAccount} as a Requestor role

─── 4. Fill in agent/.env ─────────────────────────────────────────────────────
  NEAR_NETWORK=testnet
  NEAR_ACCOUNT_ID=${agentAccount}
  NEAR_PRIVATE_KEY=ed25519:YOUR_PRIVATE_KEY_HERE
  DAO_CONTRACT_ID=${daoId}
  OPENAI_API_KEY=YOUR_KEY_HERE

─── 5. Test in dry-run mode ───────────────────────────────────────────────────
  cd agent
  npm install
  npm run propose -- propose \\
    --task "Write the community newsletter" \\
    --deliverable "https://github.com/example/newsletter.md" \\
    --recipient alice.testnet \\
    --amount 2 \\
    --dry-run
`);

rl.close();
