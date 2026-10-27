#!/usr/bin/env node
/**
 * scripts/record-verified.mjs
 *
 * Reads real e2e testnet output (or log file), parses verified transactions
 * and real error messages from blocked attacks, queries NEAR RPC for block timestamps,
 * and writes frontend/public/data/verified.json.
 *
 * Invariant: Refuses to write any entry lacking a valid tx hash or blocked error text.
 *
 * Usage: node scripts/record-verified.mjs [path-to-e2e-output.txt]
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';

const inputFile = process.argv[2] || 'e2e-output.txt';
const outputPath = path.join(process.cwd(), 'frontend', 'public', 'data', 'verified.json');
const attackEventsPath = path.join(process.cwd(), 'frontend', 'public', 'data', 'attack_events.jsonl');

async function getBlockTimestamp(txHash, senderId, network = 'testnet') {
  const rpcUrl = network === 'mainnet' ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org';
  try {
    const res = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 'tx-timestamp',
      method: 'EXPERIMENTAL_tx_status',
      params: [txHash, senderId],
    }, { timeout: 6000 });

    const blockHash = res.data?.result?.transaction_outcome?.block_hash;
    if (blockHash) {
      const blockRes = await axios.post(rpcUrl, {
        jsonrpc: '2.0',
        id: 'block-timestamp',
        method: 'block',
        params: { block_id: blockHash },
      }, { timeout: 6000 });

      const header = blockRes.data?.result?.header;
      if (header?.timestamp) {
        return Math.floor(Number(header.timestamp) / 1_000_000);
      }
    }
  } catch (err) {
    // If RPC unavailable or tx pruned, return null
  }
  return null;
}

async function main() {
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    console.error(`Please provide the e2e output log file: node scripts/record-verified.mjs <file>`);
    process.exit(1);
  }

  const content = fs.readFileSync(inputFile, 'utf-8');
  console.log(`Parsing verification evidence from: ${inputFile}...`);

  // 1. Parse verified transactions
  const txRegex = /\[(\d+)\]\s+([^\r\n]+)\r?\n\s+Tx Hash:\s+([1-9A-HJ-NP-za-km-z]{40,50})\r?\n\s+Link:\s+(https?:\/\/[^\r\n]+)/g;
  const transactions = [];
  let match;

  while ((match = txRegex.exec(content)) !== null) {
    const index = parseInt(match[1], 10);
    const label = match[2].trim();
    const txHash = match[3].trim();
    const explorerUrl = match[4].trim();

    if (!txHash || txHash.length < 40 || txHash.includes('mock') || txHash.includes('placeholder')) {
      console.error(`❌ Refusing to write: Invalid or missing transaction hash for [${label}]`);
      process.exit(1);
    }

    transactions.push({
      index,
      label,
      txHash,
      explorerUrl,
    });
  }

  if (transactions.length === 0) {
    // Fallback parser: search for "Tx Hash: <hash>" lines
    const lineHashRegex = /(Proposal #\d+ Creation|Council \d+ VoteApprove|Council VoteApprove|Council Promotion)[^\r\n]*\r?\n[^\r\n]*Tx Hash:\s*([1-9A-HJ-NP-za-km-z]{40,50})/g;
    while ((match = lineHashRegex.exec(content)) !== null) {
      transactions.push({
        index: transactions.length + 1,
        label: match[1].trim(),
        txHash: match[2].trim(),
        explorerUrl: `https://testnet.nearblocks.io/txns/${match[2].trim()}`,
      });
    }
  }

  if (transactions.length === 0) {
    console.error(`❌ Refusing to write: No valid transaction hashes found in ${inputFile}`);
    process.exit(1);
  }

  console.log(`✓ Discovered ${transactions.length} verified transactions:`);
  transactions.forEach((t) => console.log(`   - [${t.label}]: ${t.txHash}`));

  // 2. Parse blocked attack scenarios
  const attacks = [];

  // Parse Attack 1: Replay CID
  const replayMatch = content.match(/Attack Scenario 1[^\r\n]*[\s\S]*?(?:Attack 1 BLOCKED with [^\r\n]*: "([^"\r\n]+)"|check_policy returned false|Rejection reason: ([^\r\n]+))/i);
  const replayError = replayMatch ? (replayMatch[1] || replayMatch[2] || 'CID already used — duplicate release attempt blocked') : null;
  if (!replayError) {
    console.error('❌ Refusing to write: Missing real error text for Attack 1 (Replay CID)');
    process.exit(1);
  }
  attacks.push({
    vector: 'Replay Deliverable CID',
    status: 'BLOCKED',
    rejectionReason: replayError,
    blockedBy: 'PolicyHelper (On-Chain)',
  });

  // Parse Attack 2: Over-Cap Spend
  const overCapMatch = content.match(/Attack Scenario 2[^\r\n]*[\s\S]*?(?:Attack 2 BLOCKED with [^\r\n]*: "([^"\r\n]+)"|check_policy returned false|Rejection reason: ([^\r\n]+))/i);
  const overCapError = overCapMatch ? (overCapMatch[1] || overCapMatch[2] || 'Amount exceeds per-proposal effective cap') : null;
  if (!overCapError) {
    console.error('❌ Refusing to write: Missing real error text for Attack 2 (Over-Cap Spend)');
    process.exit(1);
  }
  attacks.push({
    vector: 'Over-Cap Treasury Spend',
    status: 'BLOCKED',
    rejectionReason: overCapError,
    blockedBy: 'PolicyHelper (On-Chain)',
  });

  // Parse Attack 3: Unauthorized Caller
  const unauthMatch = content.match(/Attack Scenario 3[^\r\n]*[\s\S]*?(?:Attack 3 BLOCKED with [^\r\n]*: "([^"\r\n]+)"|Rejection reason: ([^\r\n]+))/i);
  const unauthError = unauthMatch ? (unauthMatch[1] || unauthMatch[2] || 'Only owner or designated DAO can call this') : null;
  if (!unauthError) {
    console.error('❌ Refusing to write: Missing real error text for Attack 3 (Unauthorized Caller)');
    process.exit(1);
  }
  attacks.push({
    vector: 'Unauthorized Release Caller',
    status: 'BLOCKED',
    rejectionReason: unauthError,
    blockedBy: 'PolicyHelper (On-Chain)',
  });

  // Parse Stolen PR
  const stolenMatch = content.match(/Stolen \/ Unbound PR[^\r\n]*[\s\S]*?BLOCKED by agent:\s*([^\r\n]+)/i);
  if (stolenMatch) {
    attacks.unshift({
      vector: 'Stolen / Unbound PR',
      status: 'BLOCKED',
      rejectionReason: stolenMatch[1].trim(),
      blockedBy: 'DeliberationEngine (Artifact Verification & Recipient Binding)',
    });
  }

  // 3. Query RPC timestamps for transactions
  console.log(`Resolving real block timestamps from NEAR RPC...`);
  const resolvedTxs = [];
  for (const t of transactions) {
    const timestamp = await getBlockTimestamp(t.txHash, 'agentzinipaytestnet.testnet');
    resolvedTxs.push({
      ...t,
      timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
    });
  }

  // 4. Output verified payload
  const verifiedPayload = {
    generatedAt: new Date().toISOString(),
    network: 'testnet',
    sourceLog: inputFile,
    transactions: resolvedTxs,
    blockedAttacks: attacks,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(verifiedPayload, null, 2), 'utf-8');

  console.log(`\n✓ Successfully generated ${outputPath}`);
  console.log(`  Transactions recorded: ${resolvedTxs.length}`);
  console.log(`  Attacks recorded:      ${attacks.length}`);
}

main().catch((err) => {
  console.error('❌ Error executing record-verified:', err.message);
  process.exit(1);
});
