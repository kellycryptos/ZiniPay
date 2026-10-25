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

// Default fallback ledger for stateless pre-flight evaluation.
// NOTE: Canonical reputation persistence is maintained on-chain via `PolicyHelper` (get_reputation).
// Serverless instances do not persist state across invocations.
const defaultFallbackLedger: Record<string, ReputationEntry> = {
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

export async function getOnChainReputation(
  policyContractId: string,
  accountId: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<number> {
  if (!policyContractId || policyContractId.includes('your-dao')) return 0;
  const rpcUrl = network === 'mainnet' ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org';
  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'zinipay-onchain-rep',
        method: 'query',
        params: {
          request_type: 'call_function',
          finality: 'final',
          account_id: policyContractId,
          method_name: 'get_reputation',
          args_base64: Buffer.from(JSON.stringify({ account: accountId })).toString('base64'),
        },
      }),
    });
    const json = (await res.json()) as any;
    if (json.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(json.result.result));
      return Number(JSON.parse(decoded));
    }
  } catch (err) {
    console.warn('Failed to query on-chain reputation:', err);
  }
  return 0;
}

export function getReputation(accountId: string): ReputationEntry {
  if (defaultFallbackLedger[accountId]) {
    return defaultFallbackLedger[accountId];
  }
  const entry: ReputationEntry = {
    accountId,
    score: 15,
    tier: 'Bronze',
    totalProposals: 1,
    approvedProposals: 1,
    lastActivity: Date.now(),
  };
  return entry;
}
