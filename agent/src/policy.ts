/**
 * policy.ts — Spend Policy Engine with Reputation-Tier Scaling & Three-Way Match (lowdb / JSON state)
 *
 * Enforces community-defined rules BEFORE the agent submits a proposal:
 *   1. Three-Way Match Verification:
 *      (a) Deliverable proof attached (CID/URL)
 *      (b) Stays under spend cap and cooldown
 *      (c) Anti-replay: verified not previously paid
 *   2. Reputation-Tier Scaled Caps:
 *      - Bronze: 1.0x standard limit
 *      - Silver: 1.5x standard limit
 *      - Gold: 2.0x standard limit
 *   3. Rolling 24h aggregate limit
 *   4. Cooldown between proposals to same recipient
 *
 * State is persisted in a JSON file via lowdb.
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { getTierInfo, type ReputationTier } from './reputation.js';

export interface PolicyConfig {
  maxSpendPerProposal: bigint;   // Base yoctoNEAR cap
  maxSpendPerDay: bigint;        // Daily aggregate yoctoNEAR cap
  cooldownHours: number;
  minReputationScore: number;
}

export interface PolicyCheckInput {
  recipientId: string;
  amountYocto: bigint;
  deliverableCid: string;
  recipientReputation: number;
}

export type PolicyResult =
  | { ok: true; tier: ReputationTier; effectiveCapYocto: bigint }
  | { ok: false; reason: string };

interface ProposalRecord {
  daoProposalId: number;
  recipient: string;
  amount: string;     // yoctoNEAR as string
  deliverable: string;
  createdAt: number;  // unix ms
  tier: ReputationTier;
  threeWayMatch: boolean;
}

interface DbSchema {
  proposals: ProposalRecord[];
  paidDeliverables: Record<string, number>; // deliverable -> paidAt ms
}

const DEFAULT_DB: DbSchema = { proposals: [], paidDeliverables: {} };

export class PolicyEngine {
  private db!: Low<DbSchema>;
  private config: PolicyConfig;
  private dbPath: string;

  constructor(dbPath: string, config: PolicyConfig) {
    this.config = config;
    this.dbPath = dbPath;
  }

  async init() {
    const adapter = new JSONFile<DbSchema>(this.dbPath);
    this.db = new Low(adapter, DEFAULT_DB);
    await this.db.read();
  }

  private get data(): DbSchema {
    return this.db.data ?? DEFAULT_DB;
  }

  check(input: PolicyCheckInput): PolicyResult {
    const tierInfo = getTierInfo(input.recipientReputation);

    // 1. Deliverable must be non-empty (Three-Way Match Requirement A)
    if (!input.deliverableCid?.trim()) {
      return { ok: false, reason: 'Three-Way Match Failed: Deliverable proof is required (URL, CID, or commit).' };
    }

    // 2. Double-release prevention (Three-Way Match Requirement C: Anti-Replay)
    if (this.data.paidDeliverables[input.deliverableCid]) {
      return {
        ok: false,
        reason: `Three-Way Match Failed: Deliverable "${input.deliverableCid}" has already been settled and paid.`,
      };
    }

    // 3. Per-proposal spend cap scaled by reputation tier (Three-Way Match Requirement B)
    const multiplierBig = BigInt(Math.floor(tierInfo.maxPerProposalMultiplier * 100));
    const effectiveCapYocto = (this.config.maxSpendPerProposal * multiplierBig) / 100n;

    if (input.amountYocto > effectiveCapYocto) {
      const maxNear = Number(effectiveCapYocto) / 1e24;
      const reqNear = Number(input.amountYocto) / 1e24;
      return {
        ok: false,
        reason: `Proposal amount ${reqNear.toFixed(2)} NEAR exceeds ${tierInfo.tier} tier cap of ${maxNear.toFixed(2)} NEAR.`,
      };
    }

    // 4. Per-day aggregate spend cap
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const dailySpent = this.data.proposals
      .filter((p) => p.createdAt > dayAgo)
      .reduce((sum, p) => sum + BigInt(p.amount), 0n);

    if (dailySpent + input.amountYocto > this.config.maxSpendPerDay) {
      const maxNear = Number(this.config.maxSpendPerDay) / 1e24;
      const spentNear = Number(dailySpent) / 1e24;
      return {
        ok: false,
        reason: `Daily spend limit reached: already spent ${spentNear.toFixed(2)} NEAR today, daily cap is ${maxNear.toFixed(2)} NEAR.`,
      };
    }

    // 5. Cooldown (per recipient)
    if (this.config.cooldownHours > 0) {
      const cooldownMs = this.config.cooldownHours * 60 * 60 * 1000;
      const cutoff = Date.now() - cooldownMs;
      const recent = this.data.proposals
        .filter((p) => p.recipient === input.recipientId && p.createdAt > cutoff)
        .sort((a, b) => b.createdAt - a.createdAt)[0];

      if (recent) {
        const hoursAgo = ((Date.now() - recent.createdAt) / 3600000).toFixed(1);
        return {
          ok: false,
          reason: `Cooldown active: ${input.recipientId} received a proposal ${hoursAgo}h ago. Cooldown period is ${this.config.cooldownHours}h.`,
        };
      }
    }

    // 6. Minimum reputation threshold (if configured)
    if (this.config.minReputationScore > 0 && input.recipientReputation < this.config.minReputationScore) {
      return {
        ok: false,
        reason: `Recipient reputation ${input.recipientReputation} is below community threshold ${this.config.minReputationScore}.`,
      };
    }

    return { ok: true, tier: tierInfo.tier, effectiveCapYocto };
  }

  async recordProposal(opts: {
    daoProposalId: number;
    recipientId: string;
    amountYocto: bigint;
    deliverableCid: string;
    tier: ReputationTier;
  }) {
    this.data.proposals.push({
      daoProposalId: opts.daoProposalId,
      recipient: opts.recipientId,
      amount: opts.amountYocto.toString(),
      deliverable: opts.deliverableCid,
      createdAt: Date.now(),
      tier: opts.tier,
      threeWayMatch: true,
    });
    await this.db.write();
  }

  async markDeliverablePaid(deliverableCid: string) {
    this.data.paidDeliverables[deliverableCid] = Date.now();
    await this.db.write();
  }

  getDailySpendSummary(): { count: number; totalYocto: bigint } {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = this.data.proposals.filter((p) => p.createdAt > dayAgo);
    return {
      count: recent.length,
      totalYocto: recent.reduce((s, p) => s + BigInt(p.amount), 0n),
    };
  }
}
