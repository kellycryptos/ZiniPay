/**
 * reputation.ts — Contributor reputation & tier-gated privileges
 */

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

// In-memory cache for serverless environment
const memoryLedger: Record<string, ReputationEntry> = {
  'alice.testnet': {
    accountId: 'alice.testnet',
    score: 85,
    tier: 'Gold',
    totalProposals: 14,
    approvedProposals: 14,
    lastActivity: Date.now() - 3600000,
  },
  'bob.testnet': {
    accountId: 'bob.testnet',
    score: 35,
    tier: 'Silver',
    totalProposals: 5,
    approvedProposals: 4,
    lastActivity: Date.now() - 7200000,
  },
  'carol.testnet': {
    accountId: 'carol.testnet',
    score: 10,
    tier: 'Bronze',
    totalProposals: 2,
    approvedProposals: 1,
    lastActivity: Date.now() - 86400000,
  },
};

export function getReputation(accountId: string): ReputationEntry {
  if (memoryLedger[accountId]) {
    return memoryLedger[accountId];
  }
  const entry: ReputationEntry = {
    accountId,
    score: 15,
    tier: 'Bronze',
    totalProposals: 1,
    approvedProposals: 1,
    lastActivity: Date.now(),
  };
  memoryLedger[accountId] = entry;
  return entry;
}
