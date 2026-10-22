/**
 * policy.ts — Spend Policy Engine with Reputation-Tier Scaling & Three-Way Match
 */

import { getTierInfo, type ReputationTier } from './reputation.js';

export interface PolicyConfig {
  maxSpendPerProposal: bigint;
  maxSpendPerDay: bigint;
  cooldownHours: number;
  minReputationScore: number;
}

export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  maxSpendPerProposal: 15_000_000_000_000_000_000_000_000n, // 15 NEAR
  maxSpendPerDay: 50_000_000_000_000_000_000_000_000n,      // 50 NEAR
  cooldownHours: 4,
  minReputationScore: 0,
};

// Known paid deliverables cache to enforce CID anti-replay
const paidDeliverablesCache = new Set<string>([
  'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
]);

export interface PolicyEvaluation {
  allowed: boolean;
  reason?: string;
  tier: ReputationTier;
  effectiveCapNear: number;
  cooldownHours: number;
  antiReplayPassed: boolean;
}

export function evaluatePolicy(
  recipientId: string,
  amountNear: number,
  deliverableCid: string,
  reputationScore: number,
  config = DEFAULT_POLICY_CONFIG
): PolicyEvaluation {
  const tierInfo = getTierInfo(reputationScore);
  const baseCapNear = Number(config.maxSpendPerProposal / 1_000_000_000_000_000_000_000_000n);
  const effectiveCapNear = baseCapNear * tierInfo.maxPerProposalMultiplier;

  // 1. Deliverable must exist
  if (!deliverableCid || !deliverableCid.trim()) {
    return {
      allowed: false,
      reason: 'Three-Way Match Failed: Deliverable proof (CID/URL) is missing.',
      tier: tierInfo.tier,
      effectiveCapNear,
      cooldownHours: config.cooldownHours,
      antiReplayPassed: false,
    };
  }

  // 2. Anti-replay check
  if (paidDeliverablesCache.has(deliverableCid.trim())) {
    return {
      allowed: false,
      reason: `Three-Way Match Failed: Deliverable proof ${deliverableCid} has already been paid (double-spend protection).`,
      tier: tierInfo.tier,
      effectiveCapNear,
      cooldownHours: config.cooldownHours,
      antiReplayPassed: false,
    };
  }

  // 3. Spend cap check
  if (amountNear > effectiveCapNear) {
    return {
      allowed: false,
      reason: `Spend Cap Exceeded: Requested ${amountNear} NEAR exceeds ${tierInfo.tier} tier cap of ${effectiveCapNear} NEAR.`,
      tier: tierInfo.tier,
      effectiveCapNear,
      cooldownHours: config.cooldownHours,
      antiReplayPassed: true,
    };
  }

  return {
    allowed: true,
    tier: tierInfo.tier,
    effectiveCapNear,
    cooldownHours: config.cooldownHours,
    antiReplayPassed: true,
  };
}
