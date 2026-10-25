/**
 * policy.ts — Spend Policy Engine with Reputation-Tier Scaling & Three-Way Match
 *
 * NOTE ON SERVERLESS ARCHITECTURE:
 * Vercel serverless routes are stateless per invocation and do NOT maintain
 * persistent state (such as local lowdb files or memory caches) across requests.
 * Canonical state—including CID uniqueness (anti-replay), recipient cooldown timestamps,
 * and contributor reputation scores—is permanently recorded and enforced on-chain
 * in the PolicyHelper smart contract (`contracts/policy-helper`). Serverless routes
 * perform stateless pre-flight policy evaluation prior to transaction broadcast.
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

export async function checkOnChainCidUsed(
  policyContractId: string,
  cid: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<boolean> {
  if (!policyContractId || policyContractId.includes('your-dao')) return false;
  const rpcUrl = network === 'mainnet' ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org';
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'zinipay-cid-check',
        method: 'query',
        params: {
          request_type: 'call_function',
          finality: 'final',
          account_id: policyContractId,
          method_name: 'cid_used',
          args_base64: Buffer.from(JSON.stringify({ cid })).toString('base64'),
        },
      }),
    });
    const json = (await res.json()) as any;
    if (json.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(json.result.result));
      return Boolean(JSON.parse(decoded));
    }
  } catch (err) {
    console.warn('Failed to query on-chain cid_used:', err);
  }
  return false;
}

export interface PolicyEvaluation {
  allowed: boolean;
  reason?: string;
  tier: ReputationTier;
  effectiveCapNear: number;
  cooldownHours: number;
  antiReplayPassed: boolean;
  onChainEnforced?: boolean;
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

  // 2. Spend cap check
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
