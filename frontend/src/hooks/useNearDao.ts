/**
 * useNearDao.ts — Hook to read Sputnik DAO state from the browser
 *
 * Uses native NEAR JSON-RPC calls (no heavy web3 dependencies required for reads).
 */

import { useState, useEffect, useCallback } from 'react';

const NETWORK = import.meta.env.VITE_NEAR_NETWORK ?? 'testnet';
const DAO_CONTRACT = import.meta.env.VITE_DAO_CONTRACT_ID ?? '';

export interface Proposal {
  id: number;
  proposer: string;
  description: string;
  kind: Record<string, unknown>;
  status: 'InProgress' | 'Approved' | 'Rejected' | 'Removed' | 'Expired' | 'Failed';
  vote_counts: Record<string, number[]>;
  votes: Record<string, string>;
  submission_time: string;
}

export interface DaoPolicy {
  roles: Array<{
    name: string;
    kind: unknown;
    permissions: string[];
  }>;
  proposal_bond: string;
  proposal_period: string;
}

async function viewFunction<T>(methodName: string, args: object = {}): Promise<T> {
  const rpcUrl = NETWORK === 'mainnet'
    ? 'https://rpc.mainnet.near.org'
    : 'https://rpc.testnet.near.org';

  const argsBase64 = btoa(JSON.stringify(args));

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: `zinipay-${methodName}`,
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: DAO_CONTRACT,
        method_name: methodName,
        args_base64: argsBase64,
      },
    }),
  });

  const json = await response.json();
  if (json.error) {
    throw new Error(json.error.data || json.error.message || 'RPC query error');
  }

  const resultBytes = new Uint8Array(json.result.result);
  const decodedText = new TextDecoder().decode(resultBytes);
  return JSON.parse(decodedText) as T;
}

export function useNearDao() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [policy, setPolicy] = useState<DaoPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const isDemo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';

    if (!DAO_CONTRACT || DAO_CONTRACT.includes('your-dao')) {
      if (isDemo) {
        // Only return demo mock proposals when explicit ?demo=1 flag is provided
        setProposals([
          {
            id: 104,
            proposer: 'zinipay-agent.testnet',
            description: 'Deliverable validated: Q4 Developer documentation & tutorials | Deliverable: https://github.com/community/docs/pull/42 | Agent confidence: 96/100',
            kind: {
              Transfer: {
                token_id: '',
                receiver_id: 'alice.testnet',
                amount: '5000000000000000000000000', // 5 NEAR
              },
            },
            status: 'InProgress',
            vote_counts: { council: [1, 0] },
            votes: { 'lead.testnet': 'Approve' },
            submission_time: (Date.now() * 1_000_000).toString(),
          },
          {
            id: 103,
            proposer: 'zinipay-agent.testnet',
            description: 'Community Bounty #12: Smart contract security audit summary | Deliverable: ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi | Agent confidence: 92/100',
            kind: {
              Transfer: {
                token_id: '',
                receiver_id: 'bob-auditor.testnet',
                amount: '12000000000000000000000000', // 12 NEAR
              },
            },
            status: 'Approved',
            vote_counts: { council: [3, 0] },
            votes: { 'lead.testnet': 'Approve', 'finance.testnet': 'Approve' },
            submission_time: ((Date.now() - 86400000) * 1_000_000).toString(),
          },
          {
            id: 102,
            proposer: 'council-member.testnet',
            description: 'Trezu multichain operations budget renewal for Q4',
            kind: {
              Transfer: {
                token_id: '',
                receiver_id: 'operations.testnet',
                amount: '50000000000000000000000000', // 50 NEAR
              },
            },
            status: 'Approved',
            vote_counts: { council: [3, 0] },
            votes: {},
            submission_time: ((Date.now() - 172800000) * 1_000_000).toString(),
          },
        ]);
        setError(null);
      } else {
        // Honest empty state when not configured and not in demo mode
        setProposals([]);
        setError('DAO contract not configured. Set VITE_DAO_CONTRACT_ID or append ?demo=1 to view simulation data.');
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [p, pol] = await Promise.all([
        viewFunction<Proposal[]>('get_proposals', { from_index: 0, limit: 50 }),
        viewFunction<DaoPolicy>('get_policy'),
      ]);
      setProposals([...p].sort((a, b) => b.id - a.id));
      setPolicy(pol);
      setError(null);
    } catch (e) {
      setProposals([]);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { proposals, policy, loading, error, refresh: fetchAll };
}
