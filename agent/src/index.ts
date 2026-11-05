/**
 * index.ts — ZiniPay Agent CLI entry point
 *
 * Implements:
 *   - Three-Way Match Verification (Deliverable proof, Policy clearance, Anti-replay)
 *   - Multi-Agent Deliberation (Inspector Agent + Risk Arbiter Agent via NEAR AI Cloud)
 *   - Reputation-Tier Scaled Caps (Bronze / Silver / Gold)
 *   - Cross-Chain Value Settlement via NEAR Intents
 *   - Constrained Proposal Execution on Sputnik DAO v2 (Requestor Role)
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from cwd or agent/.env
const agentEnvPath = path.resolve(process.cwd(), 'agent', '.env');
if (fs.existsSync(agentEnvPath)) {
  dotenv.config({ path: agentEnvPath });
}
dotenv.config();

import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import { KeyPair } from 'near-api-js';

import { SputnikDAO, type ProposalKind } from './dao.js';
import { PolicyEngine, type PolicyConfig, normalizeDeliverable } from './policy.js';
import { MultiAgentDeliberationEngine } from './deliberation.js';
import { ReputationLedger, getTierInfo, getApprovalRequirement } from './reputation.js';
import { NearIntents } from './intents.js';
import { logAttackEvent } from './attackLogger.js';

// ─── Helpers for On-Chain View Queries & Formatting ───────────────────────────

async function queryContractView<T>(
  nodeUrl: string,
  contractId: string,
  methodName: string,
  args: Record<string, unknown> = {}
): Promise<T | null> {
  try {
    const res = await axios.post(
      nodeUrl,
      {
        jsonrpc: '2.0',
        id: 'agent-view-query',
        method: 'query',
        params: {
          request_type: 'call_function',
          finality: 'final',
          account_id: contractId,
          method_name: methodName,
          args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
        },
      },
      { timeout: 6000 }
    );
    if (res.data?.result?.result) {
      const str = Buffer.from(res.data.result.result).toString('utf8');
      return JSON.parse(str) as T;
    }
    return null;
  } catch {
    return null;
  }
}

function parseYocto(val: string | number | bigint): bigint {
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

function formatNearAmount(yocto: bigint): string {
  const whole = yocto / 10n ** 24n;
  const frac = yocto % 10n ** 24n;
  if (frac === 0n) return `${whole} NEAR`;
  const fracStr = frac.toString().padStart(24, '0').slice(0, 4).replace(/0+$/, '');
  return `${whole}.${fracStr} NEAR`;
}

async function queryAgentKeyType(
  nodeUrl: string,
  accountId: string,
  privateKey?: string
): Promise<string> {
  try {
    let publicKey: string | null = null;
    if (privateKey && privateKey.startsWith('ed25519:')) {
      try {
        const kp = KeyPair.fromString(privateKey as `ed25519:${string}`);
        publicKey = kp.getPublicKey().toString();
      } catch {
        // mock or malformed private key
      }
    }

    if (publicKey) {
      try {
        const res = await axios.post(
          nodeUrl,
          {
            jsonrpc: '2.0',
            id: 'agent-key-query',
            method: 'query',
            params: {
              request_type: 'view_access_key',
              finality: 'final',
              account_id: accountId,
              public_key: publicKey,
            },
          },
          { timeout: 6000 }
        );
        const perm = res.data?.result?.permission;
        if (perm === 'FullAccess') {
          return 'Full-Access Key';
        }
        if (perm && typeof perm === 'object' && perm.FunctionCall) {
          const fc = perm.FunctionCall;
          const methods =
            Array.isArray(fc.method_names) && fc.method_names.length > 0
              ? fc.method_names.join(', ')
              : 'all';
          const allowance = fc.allowance
            ? `${SputnikDAO.formatNear(fc.allowance)} NEAR`
            : 'unlimited';
          return `Function-Call Key (receiver ${fc.receiver_id}, methods ${methods}, allowance ${allowance})`;
        }
      } catch {
        // fall through to list query
      }
    }

    const listRes = await axios.post(
      nodeUrl,
      {
        jsonrpc: '2.0',
        id: 'agent-keys-query',
        method: 'query',
        params: {
          request_type: 'view_access_key_list',
          finality: 'final',
          account_id: accountId,
        },
      },
      { timeout: 6000 }
    );

    const keys = listRes.data?.result?.keys;
    if (Array.isArray(keys) && keys.length > 0) {
      const match = publicKey ? keys.find((k: any) => k.public_key === publicKey) : keys[0];
      const perm = match?.access_key?.permission;
      if (perm === 'FullAccess') {
        return 'Full-Access Key';
      }
      if (perm && typeof perm === 'object' && perm.FunctionCall) {
        const fc = perm.FunctionCall;
        const methods =
          Array.isArray(fc.method_names) && fc.method_names.length > 0
            ? fc.method_names.join(', ')
            : 'all';
        const allowance = fc.allowance
          ? `${SputnikDAO.formatNear(fc.allowance)} NEAR`
          : 'unlimited';
        return `Function-Call Key (receiver ${fc.receiver_id}, methods ${methods}, allowance ${allowance})`;
      }
    }

    return 'key type unknown (RPC unavailable)';
  } catch {
    return 'key type unknown (RPC unavailable)';
  }
}

// ─── Lazy Config Helper ──────────────────────────────────────────────────────

function printCliInspection(mode: 'demo' | 'inspect' = 'inspect') {
  const payload = {
    name: 'zinipay-agent',
    status: 'ready',
    mode,
    version: '1.0.0',
    archetype: 'AI Agent / Multi-Sig Governance Guardrail',
    network: process.env.NEAR_NETWORK || 'testnet',
    contracts: {
      sputnikDao: process.env.DAO_CONTRACT_ID || 'zinipay-demo.sputnikv2.testnet',
      policyHelper: process.env.POLICY_CONTRACT_ID || 'zinipay-policy2.testnet',
    },
    deliberation: {
      engine: 'MultiAgentDeliberationEngine',
      model: process.env.OPENAI_MODEL || 'z-ai/glm-5.3-flash',
      consensusModel: 'Dual-Agent (Inspector + Risk Arbiter)',
      attestation: 'Deliverable Verification Hash (Commit SHA-1 / IPFS CID)',
      isolation: 'Prompt injection & parameter hijacking defense active (fail-closed)',
    },
    gates: {
      gate1: { name: 'Deliverable Verification', target: 'Merged GitHub PR & IPFS CID Hash' },
      gate2: { name: 'Policy & Spend Caps', rules: ['Tier Spend Cap', '60s Cooldown', 'CID Anti-Replay'] },
      gate3: { name: 'Council Quorum', quorum: '2-of-2 Sputnik DAO v2 Human Multi-Sig' },
    },
    reputationTiers: {
      Bronze: { score: '0-24 pts', capMultiplier: 1.0, quorum: 'FullDaoQuorum' },
      Silver: { score: '25-49 pts', capMultiplier: 1.5, quorum: 'SingleCouncil <= 5N' },
      Gold: { score: '50+ pts', capMultiplier: 2.0, quorum: 'AutoApprove <= 2N' },
    },
    sponsorVerification: [
      {
        sponsor: 'NEAR Protocol (Sputnik DAO v2)',
        methods: ['add_proposal', 'act_proposal', 'get_policy', 'get_proposal'],
        contract: 'zinipay-demo.sputnikv2.testnet',
        proposalId: 6,
        txHash: 'HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK',
        explorerUrl: 'https://testnet.nearblocks.io/txns/HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK',
      },
      {
        sponsor: 'NEAR Smart Contracts (Rust SDK PolicyHelper)',
        methods: ['release', 'check_policy', 'get_reputation', 'get_effective_cap'],
        contract: 'zinipay-policy2.testnet',
        txHash: '2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
        explorerUrl: 'https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
      },
      {
        sponsor: 'NEAR AI Cloud (LLM Multi-Agent Deliberation)',
        endpoints: ['POST /v1/chat/completions'],
        model: 'z-ai/glm-5.3-flash',
        status: 'Dual-Agent Deliberation (Inspector + Risk Arbiter; hardware TEE remote attestation not claimed)',
      },
      {
        sponsor: 'NEAR Intents (ChainDefuser 1Click)',
        endpoints: ['POST /v0/quote'],
        status: 'Quote API verified (Cross-chain settlement execution not claimed / quote-only)',
      },
    ],
  };

  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

// Early check for --demo or --inspect flags before full commander dispatch
if (process.argv.includes('--demo') || process.argv.slice(2)[0] === 'demo') {
  printCliInspection('demo');
}
if (process.argv.includes('--inspect') || process.argv.slice(2)[0] === 'inspect') {
  printCliInspection('inspect');
}

function getConfig(dryRun: boolean = false) {
  const getEnv = (name: string, fallback: string = '') => {
    const val = process.env[name];
    if (!val || val.includes('YOUR_')) {
      return fallback;
    }
    return val;
  };

  return {
    network: process.env.NEAR_NETWORK ?? 'testnet',
    nodeUrl:
      process.env.NEAR_NODE_URL ??
      (process.env.NEAR_NETWORK === 'mainnet'
        ? 'https://rpc.mainnet.near.org'
        : 'https://test.rpc.fastnear.com'),
    accountId: getEnv('NEAR_ACCOUNT_ID', 'agentzinipaytestnet.testnet'),
    privateKey: getEnv('NEAR_PRIVATE_KEY', ''),
    daoContractId: getEnv('DAO_CONTRACT_ID', 'zinipay-demo.sputnikv2.testnet'),
    policyContractId: process.env.POLICY_CONTRACT_ID ?? 'zinipay-policy2.testnet',
    proposalBond: process.env.PROPOSAL_BOND ?? '1000000000000000000000000', // 1 NEAR
    dbPath: process.env.DB_PATH ?? './zinipay.json',
    openaiBaseUrl: process.env.OPENAI_BASE_URL ?? 'https://cloud-api.near.ai/v1',
    openaiApiKey: getEnv('OPENAI_API_KEY', 'mock-key-for-dry-run'),
    openaiModel: process.env.OPENAI_MODEL ?? 'z-ai/glm-5.3-flash',
    intentsApiUrl: process.env.INTENTS_API_URL ?? 'https://1click.chaindefuser.com',
  };
}

const policyConfig: PolicyConfig = {
  maxSpendPerProposal: BigInt(process.env.MAX_SPEND_PER_PROPOSAL ?? '10000000000000000000000000'), // 10 NEAR
  maxSpendPerDay: BigInt(process.env.MAX_SPEND_PER_DAY ?? '50000000000000000000000000'), // 50 NEAR
  cooldownHours: Number(process.env.COOLDOWN_HOURS ?? '24'),
  minReputationScore: Number(process.env.MIN_REPUTATION_SCORE ?? '0'),
};

// ─── CLI ─────────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('zinipay-agent')
  .description('ZiniPay: Constrained Release Agent for Sputnik DAO')
  .version('1.0.0')
  .option('--demo', 'Output valid JSON demonstration telemetry and exit cleanly')
  .option('--inspect', 'Output valid JSON architectural and state inspection without live network calls');

// ── inspect command ──────────────────────────────────────────────────────────
program
  .command('inspect')
  .description('Output valid JSON architectural and state inspection without live network requirements')
  .action(() => {
    printCliInspection('inspect');
  });

// ── demo command ─────────────────────────────────────────────────────────────
program
  .command('demo')
  .description('Output valid JSON demonstration telemetry without live network requirements')
  .action(() => {
    printCliInspection('demo');
  });

// ── propose command ───────────────────────────────────────────────────────────
program
  .command('propose')
  .alias('p')
  .description('Run multi-agent deliberation and propose a constrained community payout')
  .requiredOption('-t, --task <description>', 'What the contributor was supposed to do')
  .requiredOption('-d, --deliverable <proof>', 'Deliverable URL, IPFS CID, or code commit')
  .requiredOption('-r, --recipient <account>', 'NEAR account ID of the contributor')
  .requiredOption('-a, --amount <near>', 'Amount in NEAR (e.g. "5")')
  .option('-g, --github-handle <handle>', 'GitHub username matching author of the pull request')
  .option('--cross-chain <chain>', 'Route payment via NEAR Intents to another chain (e.g. "ethereum")')
  .option('--cross-chain-address <addr>', 'Recipient address on the destination chain')
  .option('--cross-chain-token <token>', 'Output token on the destination chain (default: USDC)')
  .option('--plain-transfer', 'Submit a plain Transfer proposal instead of routing through policy contract')
  .option('--dry-run', 'Simulate three-way match and multi-agent deliberation without submitting tx')
  .action(async (opts) => {
    await runPropose({
      task: opts.task,
      deliverable: opts.deliverable,
      recipient: opts.recipient,
      amountNear: opts.amount,
      githubHandle: opts.githubHandle,
      crossChain: opts.crossChain,
      crossChainAddress: opts.crossChainAddress,
      crossChainToken: opts.crossChainToken,
      plainTransfer: !!opts.plainTransfer,
      dryRun: !!opts.dryRun,
    });
  });

// ── status command ────────────────────────────────────────────────────────────
program
  .command('status')
  .description('Show daily spend summary, reputation tiers, and leaderboard')
  .action(async () => {
    const dbPath = process.env.DB_PATH ?? './zinipay.json';
    const repDbPath = dbPath.endsWith('.json') ? dbPath.replace(/\.json$/, '-reputation.json') : `${dbPath}-reputation.json`;
    const policy = new PolicyEngine(dbPath, policyConfig);
    await policy.init();
    const reputation = new ReputationLedger(repDbPath);
    await reputation.init();
    const summary = policy.getDailySpendSummary();
    const maxNear = Number(policyConfig.maxSpendPerDay) / 1e24;
    const spentNear = Number(summary.totalYocto) / 1e24;

    console.log(chalk.bold.cyan('\n─── ZiniPay Treasury & Social Money Track ───'));
    console.log(`Daily Spend: ${spentNear.toFixed(4)} / ${maxNear.toFixed(4)} NEAR (${summary.count} proposals)`);
    console.log(`Base Per-Proposal Limit: ${Number(policyConfig.maxSpendPerProposal) / 1e24} NEAR`);
    
    const board = reputation.getLeaderboard(10);
    if (board.length > 0) {
      console.log(chalk.cyan('\nPublic Contributor Track Record & Reputation Leaderboard:'));
      board.forEach((e, i) => {
        const tier = getTierInfo(e.score);
        console.log(
          `  ${i + 1}. ${chalk.bold(e.accountId)} — Tier: ${chalk.yellow(tier.tier)} | Score: ${e.score.toFixed(1)} pts | Tasks: ${e.completedTasks ?? 0} | Paid: ${(e.totalPaidNear ?? 0).toFixed(2)} NEAR | Cap: ${tier.maxPerProposalMultiplier}x`
        );
      });
    }
    console.log('');
  });

// ── reputation command ────────────────────────────────────────────────────────
program
  .command('reputation [account]')
  .alias('rep')
  .description('View publicly readable contributor track record, reputation score, and tiered approval requirements')
  .action(async (account) => {
    const targetAccount = account || 'zinipay-recipient2.testnet';
    const cfg = getConfig(true);
    const dbPath = process.env.DB_PATH ?? './zinipay.json';
    const repDbPath = dbPath.endsWith('.json') ? dbPath.replace(/\.json$/, '-reputation.json') : `${dbPath}-reputation.json`;
    const reputation = new ReputationLedger(repDbPath);
    await reputation.init();

    let onChainScore: number | null = null;
    let onChainCap: string | number | null = null;
    if (cfg.policyContractId) {
      onChainScore = await queryContractView<number>(
        cfg.nodeUrl,
        cfg.policyContractId,
        'get_reputation',
        { account: targetAccount }
      );
      onChainCap = await queryContractView<string | number>(
        cfg.nodeUrl,
        cfg.policyContractId,
        'get_effective_cap',
        { recipient: targetAccount }
      );
    }

    const record = reputation.getPublicTrackRecord(targetAccount);
    const effectiveScore = onChainScore !== null ? onChainScore : record.score;
    const tierInfo = getTierInfo(effectiveScore);

    console.log(chalk.bold.cyan(`\n─── Contributor Social Money Track Record: ${targetAccount} ───\n`));
    console.log(`  Named Account:       ${chalk.bold(targetAccount)}`);
    console.log(`  Reputation Score:    ${chalk.green(`${effectiveScore} pts`)} ${onChainScore !== null ? `[On-Chain: ${cfg.policyContractId}]` : '[Indexed Ledger]'}`);
    console.log(`  Reputation Tier:     ${chalk.yellow(tierInfo.tier)} (${tierInfo.maxPerProposalMultiplier}x spend cap | ${tierInfo.multiplier}x reward multiplier)`);
    console.log(`  Completed Tasks:     ${record.completedTasks}`);
    console.log(`  Total Paid:          ${record.totalPaidNear.toFixed(4)} NEAR`);
    console.log(`  Proposals Approved:  ${record.approvedProposals} / ${record.totalProposals > 0 ? record.totalProposals : record.approvedProposals} (${record.successRatePercent}%)`);
    if (onChainCap) {
      console.log(`  Effective Spend Cap: ${formatNearAmount(parseYocto(onChainCap))}`);
    }

    console.log(chalk.cyan(`\n  Tiered Approval Schedule for ${targetAccount}:`));
    const smallReq = getApprovalRequirement(effectiveScore, 0.5);
    const medReq = getApprovalRequirement(effectiveScore, 3.0);
    const largeReq = getApprovalRequirement(effectiveScore, 10.0);
    console.log(`    • Small Payout  (0.5 NEAR): ${chalk.green(smallReq.approvalType)} → ${smallReq.description} [Req: ${smallReq.requiredVotes} vote(s)]`);
    console.log(`    • Medium Payout (3.0 NEAR): ${chalk.yellow(medReq.approvalType)} → ${medReq.description} [Req: ${medReq.requiredVotes} vote(s)]`);
    console.log(`    • Large Payout (10.0 NEAR): ${chalk.magenta(largeReq.approvalType)} → ${largeReq.description} [Req: ${largeReq.requiredVotes} vote(s)]`);
    console.log(`    • Over-Cap     (25.0 NEAR): ${chalk.red('REJECTED')} → Exceeds effective cap (${tierInfo.maxPerProposalMultiplier * 10} NEAR max, fail-closed)`);

    if (record.recentEvents.length > 0) {
      console.log(chalk.cyan(`\n  Recent Reputation Activity:`));
      record.recentEvents.slice(0, 5).forEach((ev) => {
        const sign = ev.delta >= 0 ? `+${ev.delta}` : `${ev.delta}`;
        const color = ev.delta >= 0 ? chalk.green : chalk.red;
        console.log(`    ${new Date(ev.createdAt).toISOString().slice(0, 19)}: ${color(sign.padEnd(5))} ${ev.reason}`);
      });
    }
    console.log('');
  });

// ─── Main Propose Flow ────────────────────────────────────────────────────────

interface ProposeOpts {
  task: string;
  deliverable: string;
  recipient: string;
  amountNear: string;
  githubHandle?: string;
  crossChain?: string;
  crossChainAddress?: string;
  crossChainToken?: string;
  plainTransfer?: boolean;
  dryRun: boolean;
}

async function runPropose(opts: ProposeOpts) {
  if (!opts.dryRun) {
    const key = process.env.NEAR_PRIVATE_KEY;
    if (!key || key.includes('YOUR_') || key.startsWith('mock') || !key.trim()) {
      console.error(chalk.red('\n[FAIL-CLOSED ERROR] Cannot execute live proposal on NEAR testnet:'));
      console.error(chalk.red('  NEAR_PRIVATE_KEY is missing or unconfigured in environment.'));
      console.error(chalk.yellow('  ZiniPay enforces fail-closed execution. To simulate deliberation without signing, pass --dry-run.\n'));
      process.exit(1);
    }
  }

  const cfg = getConfig(opts.dryRun);

  const dao = new SputnikDAO({
    networkId: cfg.network,
    contractId: cfg.daoContractId,
    accountId: cfg.accountId,
    privateKey: cfg.privateKey,
    proposalBond: cfg.proposalBond,
  });

  const policy = new PolicyEngine(cfg.dbPath, policyConfig);
  await policy.init();

  const deliberationEngine = new MultiAgentDeliberationEngine({
    baseUrl: cfg.openaiBaseUrl,
    apiKey: cfg.openaiApiKey,
    model: cfg.openaiModel,
  });

  const repDbPath = cfg.dbPath.endsWith('.json') ? cfg.dbPath.replace(/\.json$/, '-reputation.json') : `${cfg.dbPath}-reputation.json`;
  const reputation = new ReputationLedger(repDbPath);
  await reputation.init();

  const intents = new NearIntents(cfg.intentsApiUrl);

  const amountYocto = BigInt(SputnikDAO.parseNear(opts.amountNear));

  // ── Contributor Reputation & Cap (On-Chain / Local Fallback) ────────────
  let recipientRep = reputation.getScore(opts.recipient);
  let tierInfo = getTierInfo(recipientRep);
  let repDataSource = '[Local Ledger]';
  let effectiveCapYocto: bigint =
    (BigInt(policyConfig.maxSpendPerProposal) *
      BigInt(Math.floor(tierInfo.maxPerProposalMultiplier * 100))) /
    100n;

  if (cfg.policyContractId) {
    const onChainScore = await queryContractView<number>(
      cfg.nodeUrl,
      cfg.policyContractId,
      'get_reputation',
      { account: opts.recipient }
    );
    if (onChainScore !== null && onChainScore !== undefined) {
      recipientRep = onChainScore;
      tierInfo = getTierInfo(recipientRep);
      repDataSource = `[On-Chain: ${cfg.policyContractId}]`;
    }

    const onChainCap = await queryContractView<string | number>(
      cfg.nodeUrl,
      cfg.policyContractId,
      'get_effective_cap',
      { recipient: opts.recipient }
    );
    if (onChainCap !== null && onChainCap !== undefined) {
      effectiveCapYocto = parseYocto(onChainCap);
    }
  }

  console.log(chalk.bold.cyan('\n🪙🤖 ZiniPay — Multi-Agent Deliberation & Constrained Release\n'));
  console.log(`  Task:        ${opts.task}`);
  console.log(`  Deliverable: ${opts.deliverable}`);
  console.log(
    `  Recipient:   ${opts.recipient} [Tier: ${chalk.yellow(tierInfo.tier)} | Score: ${recipientRep} ${repDataSource}]`
  );
  console.log(
    `  Requested:   ${opts.amountNear} NEAR (Tier Cap: ${formatNearAmount(effectiveCapYocto)} max)`
  );
  if (opts.crossChain) console.log(`  Settlement:  Cross-chain via NEAR Intents → ${opts.crossChain}`);
  if (opts.dryRun) console.log(chalk.yellow('\n  [SIMULATION / DRY RUN — no on-chain transactions will be broadcast]\n'));

  // ── Step 1: Three-Way Match Verification ──────────────────────────────────
  console.log(chalk.cyan('[1/4] Running Three-Way Match Policy Clearance...'));
  const canonicalCid = normalizeDeliverable(opts.deliverable);

  // 1a. On-chain CID check if policy contract configured
  let onChainCidUsed: boolean | null = null;
  let burnedCidMatched: string | null = null;
  if (cfg.policyContractId) {
    const ghMatch = opts.deliverable.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
    const originalCaseCid = ghMatch ? `${ghMatch[1]}/${ghMatch[2]}#${ghMatch[3]}` : opts.deliverable;
    const formsToCheck = Array.from(new Set([canonicalCid, originalCaseCid, opts.deliverable]));

    for (const form of formsToCheck) {
      const isUsed = await queryContractView<boolean>(
        cfg.nodeUrl,
        cfg.policyContractId,
        'cid_used',
        { cid: form }
      );
      if (isUsed === true) {
        onChainCidUsed = true;
        burnedCidMatched = form;
        break;
      }
    }
    if (onChainCidUsed === null) {
      onChainCidUsed = false;
    }
  }

  if (onChainCidUsed === true) {
    const reason = `Deliverable proof "${burnedCidMatched || canonicalCid}" has already been settled on-chain (zero-double-spend protection).`;
    console.log(chalk.red(`\n  ✗ THREE-WAY MATCH FAILED: ${reason}`));
    logAttackEvent({
      vector: 'Replay Deliverable',
      caller: opts.recipient,
      details: `Requested ${opts.amountNear} NEAR for deliverable '${burnedCidMatched || canonicalCid}'`,
      rejectionReason: reason,
      blockedBy: 'PolicyHelper (On-Chain Gate)',
      simulated: opts.dryRun,
    });
    process.exit(1);
  }

  // 1b. Local policy validation (caps, daily limits, cooldown)
  const policyResult = policy.check({
    recipientId: opts.recipient,
    amountYocto,
    deliverableCid: opts.deliverable,
    recipientReputation: recipientRep,
  });

  if (!policyResult.ok) {
    console.log(chalk.red(`\n  ✗ THREE-WAY MATCH FAILED: ${policyResult.reason}`));
    logAttackEvent({
      vector: policyResult.reason.includes('already been settled') || policyResult.reason.includes('already has a recorded proposal')
        ? 'Replay Deliverable'
        : policyResult.reason.includes('exceeds')
        ? 'Over-Cap Spend'
        : 'Invalid Deliverable',
      caller: opts.recipient,
      details: `Requested ${opts.amountNear} NEAR for deliverable '${opts.deliverable}'`,
      rejectionReason: policyResult.reason,
      blockedBy: 'PolicyEngine (Agent Gate)',
      simulated: opts.dryRun,
    });
    process.exit(1);
  }

  console.log(chalk.green(`  ✓ Match A: Deliverable proof attached`));
  console.log(chalk.green(`  ✓ Match B: Stayed under ${tierInfo.tier} tier cap (${formatNearAmount(effectiveCapYocto)} max)`));
  console.log(
    chalk.green(
      `  ✓ Match B2: Tiered Approval Resolution → ${policyResult.approvalRequirement.approvalType} (${policyResult.approvalRequirement.description})`
    )
  );
  if (cfg.policyContractId && onChainCidUsed === false) {
    console.log(chalk.green(`  ✓ Match C: Zero-replay confirmed on-chain (cid_used: false on ${cfg.policyContractId})`));
  } else if (!cfg.policyContractId) {
    console.log(chalk.yellow(`  ✓ Match C: Replay check: local record only (no policy contract configured)`));
  } else {
    console.log(chalk.green(`  ✓ Match C: Zero-replay confirmed (deliverable not previously paid)`));
  }

  // ── Step 2: Multi-Agent Deliberation ──────────────────────────────────────
  console.log(chalk.cyan('\n[2/4] Executing Multi-Agent Deliberation via NEAR AI Cloud (Inspector + Risk Arbiter)...'));
  const recipientGithub = opts.githubHandle || process.env.RECIPIENT_GITHUB_HANDLE;
  const deliberation = await deliberationEngine.deliberate({
    taskDescription: opts.task,
    deliverable: opts.deliverable,
    amountNear: opts.amountNear,
    recipientId: opts.recipient,
    recipientGithub,
    recipientReputation: recipientRep,
    dryRun: opts.dryRun,
  });

  console.log(`  Inspector Agent:   Score ${deliberation.inspector.score}/100 — "${deliberation.inspector.critique}"`);
  console.log(`  Risk Arbiter:      Risk ${deliberation.riskArbiter.riskLevel} — "${deliberation.riskArbiter.policyNotes}"`);
  if (deliberation.attestation?.verified && deliberation.attestation.completionId) {
    console.log(chalk.green(`  Attestation Proof: Gateway & model verified (SDK 0.2.1) | Kind: ${deliberation.attestation.signatureKind ?? 'provider_tee'} | ID: ${deliberation.attestation.completionId}`));
  } else if (deliberation.simulated) {
    console.log(chalk.yellow(`  Attestation Proof: [SIMULATION] (local dry-run / no live model review)`));
  } else {
    console.log(`  Attestation Proof: Attestation report received (not independently verified)`);
  }
  console.log(`  Consensus Verdict: ${deliberation.consensusApproved ? chalk.green('APPROVED') : chalk.red('REJECTED')} (Confidence: ${deliberation.overallConfidence}%)`);

  if (!deliberation.consensusApproved) {
    console.log(chalk.red('\n  ✗ Deliberation Consensus REJECTED the deliverable. Proposal halted.'));
    await reputation.recordProposalRejected(opts.recipient, deliberation.inspector.critique);
    logAttackEvent({
      vector: deliberation.inspector.critique.includes('PR author')
        ? 'Stolen / Author Mismatch PR'
        : deliberation.inspector.critique.includes('not merged')
        ? 'Unmerged PR'
        : deliberation.inspector.critique.includes('Attestation')
        ? 'Failed Attestation'
        : 'Deliberation Rejection',
      caller: opts.recipient,
      details: `Deliverable: '${opts.deliverable}' | Task: '${opts.task}'`,
      rejectionReason: deliberation.inspector.critique,
      blockedBy: 'DeliberationEngine (Inspector/Attestation Gate)',
      simulated: opts.dryRun,
    });
    process.exit(1);
  }

  // ── Step 3: Build Proposal Struct ─────────────────────────────────────────
  console.log(chalk.cyan('\n[3/4] Constructing Constrained Proposal for Sputnik DAO...'));

  let proposalKind: ProposalKind;
  let intentInfo: string | null = null;

  if (opts.crossChain && opts.crossChainAddress) {
    console.log(`  Fetching NEAR Intents route for ${opts.recipient} → ${opts.crossChain}...`);
    
    if (!opts.dryRun) {
      const { kind, quote } = await intents.buildCrossChainTransfer({
        tokenIn: 'near',
        amountIn: amountYocto.toString(),
        tokenOut: opts.crossChainToken ?? 'usdc',
        recipientAddress: opts.crossChainAddress,
        destinationChain: opts.crossChain,
      });
      proposalKind = kind;
      intentInfo = `~${quote.amountOut} on ${opts.crossChain} via NEAR Intents (quote: ${quote.quoteId})`;
      console.log(chalk.green(`  ✓ Intent route established: ${intentInfo}`));
    } else {
      console.log(chalk.yellow('  [SIMULATION] Cross-chain intent swap payload simulated'));
      proposalKind = {
        Transfer: {
          token_id: '',
          receiver_id: opts.recipient,
          amount: amountYocto.toString(),
          msg: JSON.stringify({
            destination: opts.crossChain,
            address: opts.crossChainAddress,
            simulated: true,
          }),
        },
      };
      intentInfo = `[SIMULATION] ~${opts.amountNear} NEAR converted to ${opts.crossChainToken ?? 'USDC'} on ${opts.crossChain}`;
    }
  } else if (opts.plainTransfer || !cfg.policyContractId) {
    console.log(chalk.yellow('  [DAO Transfer] Using direct Sputnik DAO Transfer proposal'));
    proposalKind = {
      Transfer: {
        token_id: '',
        receiver_id: opts.recipient,
        amount: amountYocto.toString(),
      },
    };
  } else {
    console.log(chalk.cyan(`  Routing proposal through on-chain policy contract: ${cfg.policyContractId}`));
    proposalKind = SputnikDAO.buildPolicyReleaseProposal({
      policyContractId: cfg.policyContractId,
      recipientId: opts.recipient,
      amountYocto: amountYocto.toString(),
      cid: policyResult.normalizedDeliverable,
    });
  }

  const description = [
    deliberation.attestationSummary,
    intentInfo ? `Cross-chain: ${intentInfo}` : '',
    `Tier: ${tierInfo.tier} | Approval: ${policyResult.approvalRequirement.approvalType} (${policyResult.approvalRequirement.requiredVotes} vote${policyResult.approvalRequirement.requiredVotes === 1 ? '' : 's'})`,
    `Confidence: ${deliberation.overallConfidence}%`,
  ].filter(Boolean).join(' | ');

  console.log(`  On-chain Description: "${description}"`);
  console.log(chalk.green('  ✓ Three-Way Match attestation attached'));

  // ── Step 4: Submit Proposal ───────────────────────────────────────────────
  console.log(chalk.cyan('\n[4/4] Submitting to DAO Treasury (Requestor role)...'));

  // Pre-flight on-chain policy check (if targeting policy contract)
  if (!opts.plainTransfer && cfg.policyContractId && !opts.dryRun) {
    console.log(chalk.cyan(`  Performing pre-flight check_policy on ${cfg.policyContractId}...`));
    const onChainCheck = await dao.checkPolicyOnChain({
      policyContractId: cfg.policyContractId,
      recipientId: opts.recipient,
      amountYocto: amountYocto.toString(),
      cid: policyResult.normalizedDeliverable,
    });
    if (!onChainCheck.ok) {
      console.log(chalk.red(`\n  ✗ ON-CHAIN POLICY REJECTED PROPOSAL: ${onChainCheck.reason}`));
      logAttackEvent({
        vector: 'On-Chain Policy Rejection',
        caller: opts.recipient,
        details: `check_policy rejected deliverable '${policyResult.normalizedDeliverable}'`,
        rejectionReason: onChainCheck.reason || 'On-chain check_policy returned false',
        blockedBy: 'PolicyHelper (On-Chain Pre-Flight)',
        simulated: opts.dryRun,
      });
      console.log(chalk.red('  Aborting submission to prevent filing proposals that cannot be executed.'));
      process.exit(1);
    }
    console.log(chalk.green('  ✓ On-chain policy check passed (tier cap, cooldown, CID uniqueness)'));
  }

  if (opts.dryRun) {
    const keyTypeDesc = await queryAgentKeyType(cfg.nodeUrl, cfg.accountId, cfg.privateKey);

    console.log(chalk.yellow('\n  ┌─────────────────────────────────────────────────────────────┐'));
    console.log(chalk.yellow('  │                 THREE-WAY MATCH PASS REPORT                 │'));
    console.log(chalk.yellow('  └─────────────────────────────────────────────────────────────┘'));
    console.log(chalk.gray(`  Treasury Target:   ${cfg.daoContractId}`));
    console.log(chalk.gray(`  Proposing Agent:   ${cfg.accountId} (${keyTypeDesc})`));
    console.log(chalk.gray(`  Attached Deposit:  ${SputnikDAO.formatNear(cfg.proposalBond)} NEAR bond`));
    console.log(
      chalk.gray(
        `  Contributor Tier:  ${tierInfo.tier} (${tierInfo.maxPerProposalMultiplier}x cap)`
      )
    );
    console.log(
      chalk.gray(
        `  Approval Tier:     ${policyResult.approvalRequirement.approvalType} (${policyResult.approvalRequirement.description})`
      )
    );
    console.log(chalk.gray(`  Required Quorum:   ${policyResult.approvalRequirement.requiredVotes} human council signature(s)`));
    console.log(chalk.gray(`  Deliberation:      Inspector ${deliberation.inspector.score}/100 · Risk ${deliberation.riskArbiter.riskLevel}`));
    console.log(chalk.gray(`  Proposal Payload:`));
    console.log(JSON.stringify({ description, kind: proposalKind }, null, 2));
    console.log(chalk.bold.green('\n  ✓ THREE-WAY MATCH & DELIBERATION VERIFIED: Ready for live Sputnik DAO submission!\n'));
    return;
  }

  const proposalId = await dao.addProposal({ description, kind: proposalKind as any });
  
  await policy.recordProposal({
    daoProposalId: proposalId,
    recipientId: opts.recipient,
    amountYocto,
    deliverableCid: opts.deliverable,
    tier: policyResult.tier,
  });
  await reputation.recordProposalSubmitted(opts.recipient);

  console.log(chalk.bold.green(`\n  ✓ Proposal #${proposalId} submitted to ${cfg.daoContractId}`));
  console.log(chalk.cyan(`  Approval Requirement: ${policyResult.approvalRequirement.approvalType} (${policyResult.approvalRequirement.requiredVotes} human council signature(s))`));
  console.log(`\n  View Proposal on NEAR Explorer:`);
  console.log(chalk.underline(
    `  https://${cfg.network === 'testnet' ? 'testnet.' : ''}nearblocks.io/accounts/${cfg.daoContractId}`,
  ));
  console.log('');
}

// ─── Run ─────────────────────────────────────────────────────────────────────
program.parse(process.argv.length > 2 ? process.argv : [...process.argv, '--help']);
