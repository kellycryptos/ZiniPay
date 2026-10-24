/**
 * index.ts — ZiniPay Agent CLI entry point
 *
 * Implements:
 *   - Three-Way Match Verification (Deliverable proof, Policy clearance, Anti-replay)
 *   - Multi-Agent Deliberation (Inspector Agent + Risk Arbiter Agent via NEAR AI Cloud)
 *   - Reputation-Tier Scaled Caps (Bronze / Silver / Gold)
 *   - Cross-Chain Value Settlement via NEAR Intents
 *   - Restricted Function-Call Execution on Sputnik DAO / Trezu
 */

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';

import { SputnikDAO, type ProposalKind } from './dao.js';
import { PolicyEngine, type PolicyConfig } from './policy.js';
import { MultiAgentDeliberationEngine } from './deliberation.js';
import { ReputationLedger, getTierInfo } from './reputation.js';
import { NearIntents } from './intents.js';

// ─── Lazy Config Helper ──────────────────────────────────────────────────────

function getConfig(dryRun: boolean = false) {
  const getEnv = (name: string, fallback: string = '') => {
    const val = process.env[name];
    if (!val || val.includes('YOUR_')) {
      if (dryRun) return fallback;
      throw new Error(`Missing required env var: ${name}. Please set it in agent/.env`);
    }
    return val;
  };

  return {
    network: process.env.NEAR_NETWORK ?? 'testnet',
    accountId: getEnv('NEAR_ACCOUNT_ID', 'zinipay-agent.testnet'),
    privateKey: getEnv('NEAR_PRIVATE_KEY', 'ed25519:3D4YuaHz5ndfUXAUsafDbg16p8837eDemoKeyForDryRun'),
    daoContractId: getEnv('DAO_CONTRACT_ID', 'zinipay.sputnik-dao.testnet'),
    policyContractId: process.env.POLICY_CONTRACT_ID ?? getEnv('POLICY_CONTRACT_ID', 'zinipay-policy.testnet'),
    proposalBond: process.env.PROPOSAL_BOND ?? '1000000000000000000000000',  // 1 NEAR
    dbPath: process.env.DB_PATH ?? './zinipay.json',
    openaiBaseUrl: process.env.OPENAI_BASE_URL ?? 'https://cloud-api.near.ai/v1',
    openaiApiKey: getEnv('OPENAI_API_KEY', 'mock-key-for-dry-run'),
    openaiModel: process.env.OPENAI_MODEL ?? 'meta-llama/Llama-3.3-70B-Instruct',
    intentsApiUrl: process.env.INTENTS_API_URL ?? 'https://1click.chaindefuser.com',
  };
}

const policyConfig: PolicyConfig = {
  maxSpendPerProposal: BigInt(process.env.MAX_SPEND_PER_PROPOSAL ?? '10000000000000000000000000'), // 10 NEAR
  maxSpendPerDay: BigInt(process.env.MAX_SPEND_PER_DAY ?? '50000000000000000000000000'),           // 50 NEAR
  cooldownHours: Number(process.env.COOLDOWN_HOURS ?? '24'),
  minReputationScore: Number(process.env.MIN_REPUTATION_SCORE ?? '0'),
};

// ─── CLI ─────────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('zinipay-agent')
  .description('ZiniPay 🪙🤖: 100% NEAR-Aligned Constrained Release Agent for Trezu / Sputnik DAO')
  .version('1.0.0');

// ── propose command ───────────────────────────────────────────────────────────
program
  .command('propose')
  .alias('p')
  .description('Run multi-agent deliberation and propose a constrained community payout')
  .requiredOption('-t, --task <description>', 'What the contributor was supposed to do')
  .requiredOption('-d, --deliverable <proof>', 'Deliverable URL, IPFS CID, or code commit')
  .requiredOption('-r, --recipient <account>', 'NEAR account ID of the contributor')
  .requiredOption('-a, --amount <near>', 'Amount in NEAR (e.g. "5")')
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
    const policy = new PolicyEngine(dbPath, policyConfig);
    await policy.init();
    const reputation = new ReputationLedger(dbPath);
    await reputation.init();
    const summary = policy.getDailySpendSummary();
    const maxNear = Number(policyConfig.maxSpendPerDay) / 1e24;
    const spentNear = Number(summary.totalYocto) / 1e24;

    console.log(chalk.bold.cyan('\n─── ZiniPay Treasury & Reputation Status ───'));
    console.log(`Daily Spend: ${spentNear.toFixed(4)} / ${maxNear.toFixed(4)} NEAR (${summary.count} proposals)`);
    console.log(`Base Per-Proposal Limit: ${Number(policyConfig.maxSpendPerProposal) / 1e24} NEAR`);
    
    const board = reputation.getLeaderboard(5);
    if (board.length > 0) {
      console.log(chalk.cyan('\nTop Contributors & Reputation Tiers:'));
      board.forEach((e, i) => {
        const tier = getTierInfo(e.score);
        console.log(`  ${i + 1}. ${e.accountId} — Tier: ${chalk.yellow(tier.tier)} | Score: ${e.score.toFixed(1)} | Cap: ${tier.maxPerProposalMultiplier}x | Bonus: ${tier.multiplier}x`);
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
  crossChain?: string;
  crossChainAddress?: string;
  crossChainToken?: string;
  plainTransfer?: boolean;
  dryRun: boolean;
}

async function runPropose(opts: ProposeOpts) {
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

  const reputation = new ReputationLedger(cfg.dbPath);
  await reputation.init();

  const intents = new NearIntents(cfg.intentsApiUrl);

  const amountYocto = BigInt(SputnikDAO.parseNear(opts.amountNear));
  const recipientRep = reputation.getScore(opts.recipient);
  const tierInfo = getTierInfo(recipientRep);

  console.log(chalk.bold.cyan('\n🪙🤖 ZiniPay — Multi-Agent Deliberation & Constrained Release\n'));
  console.log(`  Task:        ${opts.task}`);
  console.log(`  Deliverable: ${opts.deliverable}`);
  console.log(`  Recipient:   ${opts.recipient} [Tier: ${chalk.yellow(tierInfo.tier)} | Score: ${recipientRep.toFixed(1)}]`);
  console.log(`  Requested:   ${opts.amountNear} NEAR (Multiplier: ${tierInfo.multiplier}x)`);
  if (opts.crossChain) console.log(`  Settlement:  Cross-chain via NEAR Intents → ${opts.crossChain}`);
  if (opts.dryRun) console.log(chalk.yellow('\n  [SIMULATION / DRY RUN — no on-chain transactions will be broadcast]\n'));

  // ── Step 1: Three-Way Match Verification ──────────────────────────────────
  console.log(chalk.cyan('[1/4] Running Three-Way Match Policy Clearance...'));
  const policyResult = policy.check({
    recipientId: opts.recipient,
    amountYocto,
    deliverableCid: opts.deliverable,
    recipientReputation: recipientRep,
  });

  if (!policyResult.ok) {
    console.log(chalk.red(`\n  ✗ THREE-WAY MATCH FAILED: ${policyResult.reason}`));
    process.exit(1);
  }

  const effectiveCapNear = Number(policyResult.effectiveCapYocto) / 1e24;
  console.log(chalk.green(`  ✓ Match A: Deliverable proof attached`));
  console.log(chalk.green(`  ✓ Match B: Stayed under ${policyResult.tier} tier cap (${effectiveCapNear} NEAR max)`));
  console.log(chalk.green(`  ✓ Match C: Zero-replay confirmed (deliverable not previously paid)`));

  // ── Step 2: Multi-Agent Deliberation ──────────────────────────────────────
  console.log(chalk.cyan('\n[2/4] Executing Multi-Agent Deliberation via NEAR AI Cloud (Inspector + Risk Arbiter)...'));
  const deliberation = await deliberationEngine.deliberate({
    taskDescription: opts.task,
    deliverable: opts.deliverable,
    amountNear: opts.amountNear,
    recipientId: opts.recipient,
    recipientReputation: recipientRep,
    dryRun: opts.dryRun,
  });

  console.log(`  Inspector Agent:   Score ${deliberation.inspector.score}/100 — "${deliberation.inspector.critique}"`);
  console.log(`  Risk Arbiter:      Risk ${deliberation.riskArbiter.riskLevel} — "${deliberation.riskArbiter.policyNotes}"`);
  console.log(`  Consensus Verdict: ${deliberation.consensusApproved ? chalk.green('APPROVED') : chalk.red('REJECTED')} (Confidence: ${deliberation.overallConfidence}%)`);

  if (!deliberation.consensusApproved) {
    console.log(chalk.red('\n  ✗ Deliberation Consensus REJECTED the deliverable. Proposal halted.'));
    await reputation.recordProposalRejected(opts.recipient, deliberation.inspector.critique);
    process.exit(1);
  }

  // ── Step 3: Build Proposal Struct ─────────────────────────────────────────
  console.log(chalk.cyan('\n[3/4] Constructing Constrained Proposal for Sputnik DAO / Trezu...'));

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
  } else if (opts.plainTransfer) {
    console.log(chalk.yellow('  [FLAG: --plain-transfer] Using plain DAO Transfer proposal'));
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
    `Confidence: ${deliberation.overallConfidence}%`,
  ].filter(Boolean).join(' | ');

  console.log(`  On-chain Description: "${description}"`);
  console.log(chalk.green('  ✓ Three-Way Match attestation attached'));

  // ── Step 4: Submit Proposal ───────────────────────────────────────────────
  console.log(chalk.cyan('\n[4/4] Submitting to DAO Treasury (Requestor role)...'));

  if (opts.dryRun) {
    console.log(chalk.yellow('\n  ┌─────────────────────────────────────────────────────────────┐'));
    console.log(chalk.yellow('  │                 THREE-WAY MATCH PASS REPORT                 │'));
    console.log(chalk.yellow('  └─────────────────────────────────────────────────────────────┘'));
    console.log(chalk.gray(`  Treasury Target:   ${cfg.daoContractId}`));
    console.log(chalk.gray(`  Proposing Agent:   ${cfg.accountId} (Function-Call Key)`));
    console.log(chalk.gray(`  Attached Deposit:  ${SputnikDAO.formatNear(cfg.proposalBond)} NEAR bond`));
    console.log(chalk.gray(`  Contributor Tier:  ${policyResult.tier} (${tierInfo.maxPerProposalMultiplier}x cap)`));
    console.log(chalk.gray(`  Deliberation:      Inspector ${deliberation.inspector.score}/100 · Risk ${deliberation.riskArbiter.riskLevel}`));
    console.log(chalk.gray(`  Proposal Payload:`));
    console.log(JSON.stringify({ description, kind: proposalKind }, null, 2));
    console.log(chalk.bold.green('\n  ✓ THREE-WAY MATCH & DELIBERATION VERIFIED: Ready for live Sputnik DAO / Trezu submission!\n'));
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
  console.log(`\n  View in Trezu Treasury:`);
  console.log(chalk.underline(`  https://app.trezu.org`));
  console.log(`\n  View on NEAR Explorer:`);
  console.log(chalk.underline(
    `  https://${cfg.network === 'testnet' ? 'testnet.' : ''}nearblocks.io/accounts/${cfg.daoContractId}`,
  ));
  console.log('');
}

// ─── Run ─────────────────────────────────────────────────────────────────────
program.parse(process.argv.length > 2 ? process.argv : [...process.argv, '--help']);
