/**
 * reputation.ts — Contributor reputation & tier-gated privileges (lowdb / JSON state)
 *
 * Implements Reputation Tiers:
 *   - Bronze (0 - 19 pts): Base 1.0x cap multiplier, mandatory human approval.
 *   - Silver (20 - 59 pts): 1.1x reward multiplier, 1.5x spend cap.
 *   - Gold (60+ pts): 1.25x reward multiplier, 2.0x spend cap, eligible for micro-auto-clearing.
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

export type ReputationTier = 'Bronze' | 'Silver' | 'Gold';

export interface TierInfo {
  tier: ReputationTier;
  multiplier: number;
  autoClearEligible: boolean;
  maxPerProposalMultiplier: number;
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

export interface ReputationEntry {
  accountId: string;
  score: number;
  tier: ReputationTier;
  totalProposals: number;
  approvedProposals: number;
  lastActivity: number;
}

interface ReputationEvent {
  accountId: string;
  delta: number;
  reason: string;
  createdAt: number;
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
      lastActivity: Date.now(),
    };
  }

  getScore(accountId: string): number {
    return this.data.entries[accountId]?.score ?? 0;
  }

  getEntry(accountId: string): ReputationEntry {
    const entry = this.data.entries[accountId] ?? this.defaultEntry(accountId);
    entry.tier = getTierInfo(entry.score).tier;
    return entry;
  }

  async recordProposalSubmitted(accountId: string) {
    const entry = this.data.entries[accountId] ?? this.defaultEntry(accountId);
    entry.totalProposals += 1;
    entry.lastActivity = Date.now();
    entry.tier = getTierInfo(entry.score).tier;
    this.data.entries[accountId] = entry;
    await this.db.write();
  }

  async recordProposalApproved(accountId: string, validatorConfidence: number) {
    const bonus = validatorConfidence > 80 ? (validatorConfidence - 80) * 0.2 : 0;
    const delta = 10 + bonus;
    const entry = this.data.entries[accountId] ?? this.defaultEntry(accountId);
    entry.score += delta;
    entry.approvedProposals += 1;
    entry.lastActivity = Date.now();
    entry.tier = getTierInfo(entry.score).tier;
    this.data.entries[accountId] = entry;
    this.data.events.push({
      accountId,
      delta,
      reason: `approved (confidence ${validatorConfidence})`,
      createdAt: Date.now(),
    });
    await this.db.write();
  }

  async recordProposalRejected(accountId: string, reason: string) {
    const entry = this.data.entries[accountId] ?? this.defaultEntry(accountId);
    entry.score = Math.max(0, entry.score - 5);
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

  getHistory(accountId: string) {
    return this.data.events
      .filter((e) => e.accountId === accountId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getLeaderboard(limit = 10): ReputationEntry[] {
    return Object.values(this.data.entries)
      .map((e) => ({ ...e, tier: getTierInfo(e.score).tier }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
