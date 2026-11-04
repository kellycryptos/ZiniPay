/**
 * reputation.ts — Contributor reputation & tier-gated privileges (lowdb / JSON state)
 *
 * Implements Social Money Reputation & Tiered Approvals:
 *   - Bronze (0 - 19 pts): Base 1.0x cap (10N), mandatory 2-of-2 human multi-sig quorum.
 *   - Silver (20 - 59 pts): 1.1x reward multiplier, 1.5x spend cap (15N), single council approval for <= 5N.
 *   - Gold (60+ pts): 1.25x reward multiplier, 2.0x spend cap (20N), micro auto-clear for <= 2N, single council for <= 8N.
 *
 * All scores and track records are publicly readable.
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

export type ReputationTier = 'Bronze' | 'Silver' | 'Gold';

export type ApprovalType = 'AutoApprove' | 'SingleCouncil' | 'FullDaoQuorum';

export interface TierInfo {
  tier: ReputationTier;
  multiplier: number;
  autoClearEligible: boolean;
  maxPerProposalMultiplier: number;
}

export interface ApprovalRequirementInfo {
  tier: ReputationTier;
  score: number;
  amountNear: number;
  approvalType: ApprovalType;
  requiredVotes: number;
  description: string;
  autoApprove: boolean;
}

export function getTierInfo(score: number): TierInfo {
  if (score >= 60) {
    return {
      tier: 'Gold',
      multiplier: 1.25,
      autoClearEligible: true,
      maxPerProposalMultiplier: 2.0,
    };
  }
  if (score >= 20) {
    return {
      tier: 'Silver',
      multiplier: 1.1,
      autoClearEligible: false,
      maxPerProposalMultiplier: 1.5,
    };
  }
  return {
    tier: 'Bronze',
    multiplier: 1.0,
    autoClearEligible: false,
    maxPerProposalMultiplier: 1.0,
  };
}

/**
 * Computes tiered approval recommendation based on contributor reputation score and payout amount:
 *
 * NOTE ON ON-CHAIN ENFORCEMENT VS AGENT ADVISORY HINT:
 * This tiered calculation (AutoApprove / SingleCouncil / FullDaoQuorum) is an ADVISORY HINT
 * and UI/Agent recommendation. It is NOT enforced by the smart contract to override Sputnik DAO voting.
 * On-chain, Sputnik DAO v2 enforces a mandatory 2-of-2 human council quorum for all
 * FunctionCall proposals targeting PolicyHelper::release.
 *
 * - High-reputation (Gold >= 60 pts):
 *     <= 2 NEAR: AutoApprove (advisory fast-track)
 *     <= 8 NEAR: SingleCouncil (advisory recommendation: 1 council vote)
 *     > 8 NEAR: FullDaoQuorum (standard 2 council votes)
 * - Medium-reputation (Silver 20 - 59 pts):
 *     <= 1 NEAR: SingleCouncil (advisory fast-track micro payout)
 *     <= 5 NEAR: SingleCouncil (advisory recommendation: 1 council vote)
 *     > 5 NEAR: FullDaoQuorum (standard 2 council votes)
 * - Entry-reputation (Bronze 0 - 19 pts):
 *     All amounts: FullDaoQuorum (mandatory 2 council votes)
 */
export function getApprovalRequirement(score: number, amountNear: number): ApprovalRequirementInfo {
  const tierInfo = getTierInfo(score);

  if (tierInfo.tier === 'Gold') {
    if (amountNear <= 2.0) {
      return {
        tier: 'Gold',
        score,
        amountNear,
        approvalType: 'AutoApprove',
        requiredVotes: 0,
        description: 'Auto-Approved (Micro-clearance: Gold contributor <= 2 NEAR)',
        autoApprove: true,
      };
    } else if (amountNear <= 8.0) {
      return {
        tier: 'Gold',
        score,
        amountNear,
        approvalType: 'SingleCouncil',
        requiredVotes: 1,
        description: 'Single Council Approval (Fast-track: Gold contributor <= 8 NEAR)',
        autoApprove: false,
      };
    } else {
      return {
        tier: 'Gold',
        score,
        amountNear,
        approvalType: 'FullDaoQuorum',
        requiredVotes: 2,
        description: 'Full DAO Quorum (Multi-sig: Gold contributor > 8 NEAR up to 20 NEAR cap)',
        autoApprove: false,
      };
    }
  }

  if (tierInfo.tier === 'Silver') {
    if (amountNear <= 1.0) {
      return {
        tier: 'Silver',
        score,
        amountNear,
        approvalType: 'SingleCouncil',
        requiredVotes: 1,
        description: 'Single Council Approval (Fast-track micro: Silver contributor <= 1 NEAR)',
        autoApprove: false,
      };
    } else if (amountNear <= 5.0) {
      return {
        tier: 'Silver',
        score,
        amountNear,
        approvalType: 'SingleCouncil',
        requiredVotes: 1,
        description: 'Single Council Approval (Medium bounty: Silver contributor <= 5 NEAR)',
        autoApprove: false,
      };
    } else {
      return {
        tier: 'Silver',
        score,
        amountNear,
        approvalType: 'FullDaoQuorum',
        requiredVotes: 2,
        description: 'Full DAO Quorum (Multi-sig: Silver contributor > 5 NEAR up to 15 NEAR cap)',
        autoApprove: false,
      };
    }
  }

  return {
    tier: 'Bronze',
    score,
    amountNear,
    approvalType: 'FullDaoQuorum',
    requiredVotes: 2,
    description: 'Full DAO Quorum (Mandatory 2-of-N multi-sig: Bronze contributor up to 10 NEAR cap)',
    autoApprove: false,
  };
}

export interface ContributorPayout {
  txHash?: string;
  amountNear: number;
  deliverableCid?: string;
  task?: string;
  timestamp: number;
}

export interface ReputationEntry {
  accountId: string;
  score: number;
  tier: ReputationTier;
  totalProposals: number;
  approvedProposals: number;
  completedTasks: number;
  totalPaidNear: number;
  rejectionsCount: number;
  lastActivity: number;
  payouts?: ContributorPayout[];
}

export interface ReputationEvent {
  accountId: string;
  delta: number;
  reason: string;
  createdAt: number;
}

export interface ContributorTrackRecord {
  accountId: string;
  score: number;
  tier: ReputationTier;
  completedTasks: number;
  totalPaidNear: number;
  totalProposals: number;
  approvedProposals: number;
  rejectionsCount: number;
  successRatePercent: number;
  tierInfo: TierInfo;
  sampleApprovalSchedule: {
    micro: ApprovalRequirementInfo;
    medium: ApprovalRequirementInfo;
    large: ApprovalRequirementInfo;
  };
  recentEvents: ReputationEvent[];
  payouts: ContributorPayout[];
}

interface DbSchema {
  entries: Record<string, ReputationEntry>;
  events: ReputationEvent[];
}

const DEFAULT_DB: DbSchema = { entries: {}, events: [] };

export class ReputationLedger {
  private db!: Low<DbSchema>;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async init() {
    const adapter = new JSONFile<DbSchema>(this.dbPath);
    this.db = new Low(adapter, DEFAULT_DB);
    await this.db.read();
    if (!this.db.data) {
      this.db.data = { entries: {}, events: [] };
      await this.db.write();
    }
  }

  private get data(): DbSchema {
    return this.db.data ?? DEFAULT_DB;
  }

  private defaultEntry(accountId: string): ReputationEntry {
    return {
      accountId,
      score: 0,
      tier: 'Bronze',
      totalProposals: 0,
      approvedProposals: 0,
      completedTasks: 0,
      totalPaidNear: 0,
      rejectionsCount: 0,
      lastActivity: Date.now(),
      payouts: [],
    };
  }

  getScore(accountId: string): number {
    return this.data.entries[accountId]?.score ?? 0;
  }

  getEntry(accountId: string): ReputationEntry {
    const raw = this.data.entries[accountId] ?? this.defaultEntry(accountId);
    return {
      ...raw,
      completedTasks: raw.completedTasks ?? raw.approvedProposals ?? 0,
      totalPaidNear: raw.totalPaidNear ?? 0,
      rejectionsCount: raw.rejectionsCount ?? 0,
      payouts: raw.payouts ?? [],
      tier: getTierInfo(raw.score).tier,
    };
  }

  async recordProposalSubmitted(accountId: string) {
    const entry = this.getEntry(accountId);
    entry.totalProposals += 1;
    entry.lastActivity = Date.now();
    entry.tier = getTierInfo(entry.score).tier;
    this.data.entries[accountId] = entry;
    await this.db.write();
  }

  async recordProposalApproved(
    accountId: string,
    validatorConfidence: number,
    amountNear = 0,
    deliverableCid?: string,
    task?: string,
    txHash?: string
  ) {
    const bonus = validatorConfidence > 80 ? (validatorConfidence - 80) * 0.2 : 0;
    const delta = 10 + bonus;
    const entry = this.getEntry(accountId);
    entry.score += delta;
    entry.approvedProposals += 1;
    entry.completedTasks += 1;
    if (amountNear > 0) {
      entry.totalPaidNear = Number((entry.totalPaidNear + amountNear).toFixed(4));
    }
    entry.lastActivity = Date.now();
    entry.tier = getTierInfo(entry.score).tier;
    if (!entry.payouts) entry.payouts = [];
    if (amountNear > 0 || deliverableCid) {
      entry.payouts.push({
        txHash,
        amountNear,
        deliverableCid,
        task,
        timestamp: Date.now(),
      });
    }
    this.data.entries[accountId] = entry;
    this.data.events.push({
      accountId,
      delta,
      reason: `approved (confidence ${validatorConfidence}${amountNear > 0 ? `, ${amountNear} NEAR paid` : ''})`,
      createdAt: Date.now(),
    });
    await this.db.write();
  }

  async recordPayoutSettled(opts: {
    accountId: string;
    amountNear: number;
    deliverableCid?: string;
    txHash?: string;
    task?: string;
    validatorConfidence?: number;
  }) {
    const confidence = opts.validatorConfidence ?? 90;
    await this.recordProposalApproved(
      opts.accountId,
      confidence,
      opts.amountNear,
      opts.deliverableCid,
      opts.task,
      opts.txHash
    );
  }

  async recordProposalRejected(accountId: string, reason: string) {
    const entry = this.getEntry(accountId);
    entry.score = Math.max(0, entry.score - 5);
    entry.rejectionsCount += 1;
    entry.lastActivity = Date.now();
    entry.tier = getTierInfo(entry.score).tier;
    this.data.entries[accountId] = entry;
    this.data.events.push({
      accountId,
      delta: -5,
      reason: `rejected: ${reason}`,
      createdAt: Date.now(),
    });
    await this.db.write();
  }

  async setReputation(accountId: string, score: number, completedTasks?: number, totalPaidNear?: number) {
    const entry = this.getEntry(accountId);
    entry.score = score;
    entry.tier = getTierInfo(score).tier;
    if (typeof completedTasks === 'number') entry.completedTasks = completedTasks;
    if (typeof totalPaidNear === 'number') entry.totalPaidNear = totalPaidNear;
    entry.lastActivity = Date.now();
    this.data.entries[accountId] = entry;
    await this.db.write();
  }

  getHistory(accountId: string) {
    return this.data.events
      .filter((e) => e.accountId === accountId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getPublicTrackRecord(accountId: string): ContributorTrackRecord {
    const entry = this.getEntry(accountId);
    const tierInfo = getTierInfo(entry.score);
    const totalActivity = entry.totalProposals > 0 ? entry.totalProposals : entry.approvedProposals;
    const successRatePercent = totalActivity > 0 ? Math.round((entry.approvedProposals / totalActivity) * 100) : 100;

    return {
      accountId,
      score: entry.score,
      tier: tierInfo.tier,
      completedTasks: entry.completedTasks,
      totalPaidNear: entry.totalPaidNear,
      totalProposals: entry.totalProposals,
      approvedProposals: entry.approvedProposals,
      rejectionsCount: entry.rejectionsCount,
      successRatePercent,
      tierInfo,
      sampleApprovalSchedule: {
        micro: getApprovalRequirement(entry.score, 0.5),
        medium: getApprovalRequirement(entry.score, 3.0),
        large: getApprovalRequirement(entry.score, 10.0),
      },
      recentEvents: this.getHistory(accountId).slice(0, 10),
      payouts: (entry.payouts || []).slice(-10),
    };
  }

  getAllTrackRecords(): ContributorTrackRecord[] {
    return Object.keys(this.data.entries).map((account) => this.getPublicTrackRecord(account));
  }

  getLeaderboard(limit = 10): ReputationEntry[] {
    return Object.values(this.data.entries)
      .map((e) => this.getEntry(e.accountId))
      .sort((a, b) => b.score - a.score || b.completedTasks - a.completedTasks)
      .slice(0, limit);
  }
}
