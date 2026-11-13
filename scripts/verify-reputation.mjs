#!/usr/bin/env node
/**
 * scripts/verify-reputation.mjs
 *
 * Independent, keyless verifier for Contributor Reputation & Tiered Approvals (Social Money Track):
 *   1. Queries live testnet PolicyHelper contract (zinipay-policy2.testnet::get_reputation)
 *   2. Queries live testnet effective cap (zinipay-policy2.testnet::get_effective_cap)
 *   3. Reads contributor track record from indexed ledger (completed tasks, total paid, rejection history)
 *   4. Evaluates and prints the Tiered Approval Schedule (Auto-Approve, Single Council, Full DAO Quorum)
 *   5. Displays confirmed testnet payout receipts and explorer links
 *
 * Usage:
 *   node scripts/verify-reputation.mjs [account_id]
 *   npm run verify:reputation -- zinipay-recipient2.testnet
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const targetAccount = process.argv[2] || 'zinipay-recipient2.testnet';
const POLICY_ID = process.env.POLICY_CONTRACT_ID || 'zinipay-policy2.testnet';
const DAO_ID = process.env.DAO_CONTRACT_ID || 'zinipay-demo.sputnikv2.testnet';
const RPC_URLS = [
  ...(process.env.NEAR_NODE_URL ? [process.env.NEAR_NODE_URL] : []),
  'https://test.rpc.fastnear.com',
  'https://archival-rpc.testnet.near.org',
  'https://rpc.testnet.near.org',
];
const EXPLORER_URL = 'https://testnet.nearblocks.io';

function parseYocto(val) {
  if (!val) return 0n;
  if (typeof val === 'bigint') return val;
  const str = val.toString().trim();
  if (str.toLowerCase().includes('e+')) {
    const [mantissa, expStr] = str.toLowerCase().split('e+');
    const exp = parseInt(expStr, 10);
    const [whole, frac = ''] = mantissa.split('.');
    const totalDigits = whole + frac;
    const shift = exp - frac.length;
    return BigInt(totalDigits + '0'.repeat(Math.max(0, shift)));
  }
  return BigInt(str.split('.')[0]);
}

function formatNear(yocto) {
  const whole = yocto / 10n ** 24n;
  const frac = yocto % 10n ** 24n;
  if (frac === 0n) return `${whole} NEAR`;
  const fracStr = frac.toString().padStart(24, '0').slice(0, 4).replace(/0+$/, '');
  return `${whole}.${fracStr} NEAR`;
}

async function rpcCall(methodName, args = {}) {
  for (const url of RPC_URLS) {
    try {
      const res = await axios.post(
        url,
        {
          jsonrpc: '2.0',
          id: 'rep-query',
          method: 'query',
          params: {
            request_type: 'call_function',
            finality: 'final',
            account_id: POLICY_ID,
            method_name: methodName,
            args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
          },
        },
        { timeout: 7000 }
      );
      if (res.data?.result?.result) {
        const raw = Buffer.from(res.data.result.result).toString('utf-8');
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      }
    } catch {
      // try the next endpoint
    }
  }
  return null;
}

function getTierInfo(score) {
  if (score >= 60) {
    return { tier: 'Gold', multiplier: 1.25, capMult: 2.0, baseCap: 10 };
  }
  if (score >= 20) {
    return { tier: 'Silver', multiplier: 1.1, capMult: 1.5, baseCap: 10 };
  }
  return { tier: 'Bronze', multiplier: 1.0, capMult: 1.0, baseCap: 10 };
}

function getApprovalSchedule(tier, score) {
  if (tier === 'Gold') {
    return [
      { range: 'Small (<= 2 NEAR)', type: 'AutoApprove', votes: 0, desc: 'Instant micro-auto-clearing without human vote' },
      { range: 'Medium (<= 8 NEAR)', type: 'SingleCouncil', votes: 1, desc: 'Fast-track single council member approval' },
      { range: 'Large (> 8 NEAR to 20 NEAR)', type: 'FullDaoQuorum', votes: 2, desc: 'Standard Sputnik DAO 2-of-2 multi-sig quorum' },
      { range: 'Over-Cap (> 20 NEAR)', type: 'REJECTED', votes: '-', desc: 'Fail-closed on-chain rejection by PolicyHelper' },
    ];
  }
  if (tier === 'Silver') {
    return [
      { range: 'Small (<= 1 NEAR)', type: 'SingleCouncil', votes: 1, desc: 'Fast-track single council member approval' },
      { range: 'Medium (<= 5 NEAR)', type: 'SingleCouncil', votes: 1, desc: 'Fast-track single council member approval' },
      { range: 'Large (> 5 NEAR to 15 NEAR)', type: 'FullDaoQuorum', votes: 2, desc: 'Standard Sputnik DAO 2-of-2 multi-sig quorum' },
      { range: 'Over-Cap (> 15 NEAR)', type: 'REJECTED', votes: '-', desc: 'Fail-closed on-chain rejection by PolicyHelper' },
    ];
  }
  return [
    { range: 'Any Amount (<= 10 NEAR)', type: 'FullDaoQuorum', votes: 2, desc: 'Mandatory 2-of-2 human council multi-sig quorum' },
    { range: 'Over-Cap (> 10 NEAR)', type: 'REJECTED', votes: '-', desc: 'Fail-closed on-chain rejection by PolicyHelper' },
  ];
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  ZiniPay 🪙🤖 — Social Money Contributor Reputation Verifier       ║
║  Account: ${targetAccount.padEnd(54)}║
║  Network: NEAR Testnet | Policy Contract: ${POLICY_ID.padEnd(22)}║
╚══════════════════════════════════════════════════════════════════╝
`);

  // 1. Live On-Chain Contract Queries
  process.stdout.write('[1/3] Querying live testnet state from PolicyHelper... ');
  const onChainScore = await rpcCall('get_reputation', { account: targetAccount });
  const onChainCap = await rpcCall('get_effective_cap', { recipient: targetAccount });
  console.log('✓ Done');

  // 2. Read Indexed Ledger & Verified Proofs
  process.stdout.write('[2/3] Reading indexed contributor ledger & audit receipts... ');
  let ledgerEntry = {
    score: onChainScore ?? 0,
    tier: 'Bronze',
    completedTasks: 0,
    totalPaidNear: 0,
    approvedProposals: 0,
    rejectionsCount: 0,
    payouts: [],
  };

  // Recorded payouts from the verified testnet record
  const verifiedPath = path.join(process.cwd(), 'frontend', 'public', 'data', 'verified.json');
  let matchedTxs = [];
  if (fs.existsSync(verifiedPath)) {
    try {
      const v = JSON.parse(fs.readFileSync(verifiedPath, 'utf8'));
      matchedTxs = (v.settledPayouts || []).filter((t) => t.recipient === targetAccount);
      if (matchedTxs.length === 0 && Array.isArray(v.transactions)) {
        matchedTxs = v.transactions.filter((t) => t.recipient === targetAccount && t.kind === 'payout');
      }
    } catch {}
  }

  const repFile = path.join(process.cwd(), 'zinipay-reputation.json');
  if (fs.existsSync(repFile)) {
    try {
      const repJson = JSON.parse(fs.readFileSync(repFile, 'utf8'));
      if (repJson.entries?.[targetAccount]) {
        ledgerEntry = { ...ledgerEntry, ...repJson.entries[targetAccount] };
      }
    } catch {}
  }

  // The local cache is not committed. Fall back to the recorded payouts.
  let countsFromRecord = false;
  if (!ledgerEntry.completedTasks && matchedTxs.length > 0) {
    ledgerEntry.completedTasks = matchedTxs.length;
    ledgerEntry.approvedProposals = matchedTxs.length;
    ledgerEntry.totalPaidNear = matchedTxs.reduce((n, t) => n + parseFloat(t.amountNear || '0'), 0);
    countsFromRecord = true;
  }
  const cacheNote = countsFromRecord ? 'from verified.json, not read from the chain' : 'local off-chain cache, not verified on-chain';
  const offline = onChainScore === null || onChainScore === undefined;

  // Use on-chain score as authoritative if available
  const score = onChainScore !== null && onChainScore !== undefined ? onChainScore : ledgerEntry.score;
  const tierInfo = getTierInfo(score);
  console.log('✓ Done\n');

  // 3. Print Verified Track Record
  console.log('════════════════════════════════════════════════════════════════════');
  console.log(`  CONTRIBUTOR TRACK RECORD: ${targetAccount}`);
  console.log('════════════════════════════════════════════════════════════════════');
  if (offline) {
    console.log('  • On-Chain Score:       UNAVAILABLE (no NEAR testnet RPC endpoint could be reached)');
    console.log('  • Reputation Tier:      UNKNOWN until the score can be read from the contract');
  } else {
    console.log(`  • On-Chain Score:       ${score} pts (verified on ${POLICY_ID})`);
    console.log(`  • Reputation Tier:      ${tierInfo.tier} (${tierInfo.capMult}x spend cap multiplier)`);
  }
  console.log(`  • Completed Tasks:      ${ledgerEntry.completedTasks} (${cacheNote})`);
  console.log(`  • Total Value Paid:     ${ledgerEntry.totalPaidNear.toFixed(4)} NEAR`);
  console.log(`  • Proposals Approved:   ${ledgerEntry.approvedProposals} (${cacheNote})`);
  console.log(`  • Deliverable Rejections: ${ledgerEntry.rejectionsCount} (${cacheNote})`);
  if (onChainCap) {
    console.log(`  • Effective Spend Cap:  ${formatNear(parseYocto(onChainCap))}`);
  }
  console.log('────────────────────────────────────────────────────────────────────');

  // 4. Print Tiered Approval Resolution (advisory schedule, needs a real score)
  console.log(`\n  TIERED APPROVAL SCHEDULE${offline ? '' : ` (${tierInfo.tier} Tier)`}:`);
  console.log('  Advisory only. The live DAO requires 2 of 2 council votes for every payout.');
  const schedule = offline ? [] : getApprovalSchedule(tierInfo.tier, score);
  if (offline) console.log('    Skipped: the score could not be read from the chain.');
  schedule.forEach((s) => {
    const typeColor = s.type === 'AutoApprove' ? 'AUTO-APPROVE' : s.type === 'SingleCouncil' ? 'SINGLE-COUNCIL' : s.type === 'FullDaoQuorum' ? 'FULL-DAO' : 'REJECTED';
    console.log(`    [${typeColor.padEnd(14)}] ${s.range.padEnd(26)} → Votes: ${s.votes.toString().padEnd(3)} | ${s.desc}`);
  });

  // 5. Testnet Proofs & Payout Receipts
  console.log('\n  CONFIRMED TESTNET PAYOUT RECEIPTS:');
  if (matchedTxs.length > 0) {
    matchedTxs.forEach((tx, idx) => {
      console.log(`    ${idx + 1}. Proposal #${tx.proposalId ?? '-'}: ${tx.amountNear ?? '0.10'} NEAR → Deliverable: ${tx.deliverable || tx.prTitle}`);
      console.log(`       Tx Hash:  ${tx.txHash}`);
      console.log(`       Explorer: ${EXPLORER_URL}/txns/${tx.txHash}`);
    });
  } else if (ledgerEntry.payouts && ledgerEntry.payouts.length > 0) {
    ledgerEntry.payouts.forEach((p, idx) => {
      console.log(`    ${idx + 1}. Payout: ${p.amountNear} NEAR | Task: ${p.task || 'Settled payout'}`);
      if (p.txHash) console.log(`       Tx: ${EXPLORER_URL}/txns/${p.txHash}`);
    });
  } else {
    console.log(`    (No on-chain payouts recorded yet for ${targetAccount})`);
  }

  console.log('\n════════════════════════════════════════════════════════════════════');
  if (offline) {
    console.log('  ⚠ NOT VERIFIED: the NEAR testnet RPC could not be reached.');
    console.log('    The payout list above comes from verified.json. Run again with internet access.');
    console.log('════════════════════════════════════════════════════════════════════\n');
    process.exit(2);
  }
  console.log('  ✓ SCORE AND CAP READ FROM THE CONTRACT ON NEAR TESTNET');
  console.log('════════════════════════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
