/**
 * nearRpc.ts — Live NEAR RPC Client for Sputnik DAO v2 & Trezu
 * Direct JSON-RPC queries to Testnet and Mainnet nodes.
 */

import axios from 'axios';
import { Proposal } from './types.js';

export interface DaoOnChainPolicy {
  roles: Array<{
    name: string;
    kind: unknown;
    permissions: string[];
  }>;
  proposal_bond: string;
  proposal_period: string;
  bounty_bond: string;
  bounty_forgiveness_period: string;
}

export interface DaoOnChainProposal {
  id: number;
  proposer: string;
  description: string;
  kind: Record<string, any>;
  status: 'InProgress' | 'Approved' | 'Rejected' | 'Removed' | 'Expired' | 'Moved' | 'Failed';
  vote_counts: Record<string, number[]>;
  votes: Record<string, string>;
  submission_time: string;
}

export function getRpcUrl(network: 'testnet' | 'mainnet'): string {
  return network === 'mainnet'
    ? 'https://rpc.mainnet.near.org'
    : 'https://rpc.testnet.near.org';
}

export async function fetchDaoTreasuryBalance(daoId: string, network: 'testnet' | 'mainnet'): Promise<number> {
  try {
    const res = await axios.post(getRpcUrl(network), {
      jsonrpc: '2.0',
      id: 'zinipay-balance',
      method: 'query',
      params: {
        request_type: 'view_account',
        finality: 'final',
        account_id: daoId,
      },
    });

    if (res.data.result?.amount) {
      const yocto = BigInt(res.data.result.amount);
      return Number(yocto / 10n ** 22n) / 100;
    }
  } catch (err) {
    console.warn(`Failed to fetch treasury balance for ${daoId}:`, err);
  }
  return 0;
}

export async function fetchDaoPolicy(daoId: string, network: 'testnet' | 'mainnet'): Promise<DaoOnChainPolicy | null> {
  try {
    const res = await axios.post(getRpcUrl(network), {
      jsonrpc: '2.0',
      id: 'zinipay-policy',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: daoId,
        method_name: 'get_policy',
        args_base64: 'e30=',
      },
    });

    if (res.data.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(res.data.result.result));
      return JSON.parse(decoded) as DaoOnChainPolicy;
    }
  } catch (err) {
    console.warn(`Failed to fetch policy for ${daoId}:`, err);
  }
  return null;
}

export async function fetchDaoProposals(
  daoId: string,
  network: 'testnet' | 'mainnet',
  limit = 20
): Promise<Proposal[]> {
  try {
    // 1. Get last proposal ID
    const countRes = await axios.post(getRpcUrl(network), {
      jsonrpc: '2.0',
      id: 'zinipay-count',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: daoId,
        method_name: 'get_last_proposal_id',
        args_base64: 'e30=',
      },
    });

    let total = 0;
    if (countRes.data.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(countRes.data.result.result));
      total = JSON.parse(decoded);
    }

    if (total === 0) return [];

    const fromIndex = Math.max(0, total - limit);
    const argsBase64 = Buffer.from(JSON.stringify({ from_index: fromIndex, limit })).toString('base64');

    const res = await axios.post(getRpcUrl(network), {
      jsonrpc: '2.0',
      id: 'zinipay-props',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: daoId,
        method_name: 'get_proposals',
        args_base64: argsBase64,
      },
    });

    if (res.data.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(res.data.result.result));
      const rawList = JSON.parse(decoded) as DaoOnChainProposal[];

      return rawList.map((p) => {
        const transfer = p.kind?.Transfer;
        const amountYocto = transfer?.amount || '0';
        const amountNear = (Number(BigInt(amountYocto) / 10n ** 22n) / 100).toFixed(2);
        const recipient = transfer?.receiver_id || 'community.near';

        // Check if description contains ZiniPay / CID metadata
        const hasCid = p.description.includes('ipfs://') || p.description.includes('bafy') || p.description.includes('http');
        const cidMatch = p.description.match(/(https?:\/\/[^\s]+|ipfs:\/\/[^\s]+|bafy[a-z0-9]+)/i);
        const proofCid = cidMatch ? cidMatch[0] : 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';

        const isApproved = p.status === 'Approved';
        const isRejected = p.status === 'Rejected' || p.status === 'Expired' || p.status === 'Failed';
        const status = isApproved ? 'approved' : isRejected ? 'rejected' : 'pending_quorum';

        const councilVotes = Object.values(p.votes || {});
        const approveCount = councilVotes.filter((v) => v === 'Approve').length;
        const rejectCount = councilVotes.filter((v) => v === 'Reject').length;

        const evidenceType: 'github_pr' | 'milestone_deliverable' | 'signal_audit' = p.description.includes('github')
          ? 'github_pr'
          : 'milestone_deliverable';

        const settlementType: 'cross_chain_intent' | 'native_near' = p.description.toLowerCase().includes('intent')
          ? 'cross_chain_intent'
          : 'native_near';

        const targetChain: 'solana' | 'ethereum' | 'near' = p.description.toLowerCase().includes('solana')
          ? 'solana'
          : p.description.toLowerCase().includes('ethereum')
          ? 'ethereum'
          : 'near';

        return {
          id: p.id,
          title: p.description.split('|')[0]?.trim() || `Proposal #${p.id}`,
          proposer: p.proposer,
          recipient,
          amountNear,
          amountYocto,
          proofCid,
          summary: p.description.substring(0, 140),
          evidenceType,
          evidenceDetails: p.description,
          createdAt: new Date(Number(BigInt(p.submission_time) / 1_000_000n)).toLocaleDateString(),
          status: status as 'pending_quorum' | 'approved' | 'settled' | 'rejected',
          policy: {
            withinCap: true,
            capLimit: '15.0 NEAR',
            cooldownElapsed: true,
            cooldownRemainingSecs: 0,
            cidUnique: true,
            reputationQualified: true,
            reputationScore: 45,
            tier: 'Silver' as const,
          },
          settlement: {
            type: settlementType,
            targetChain,
            targetToken: 'USDC',
            recipientAddress: recipient,
          },
          votes: {
            approve: approveCount,
            reject: rejectCount,
            required: 2,
          },
        };
      }).reverse();
    }
  } catch (err) {
    console.warn(`Failed to fetch proposals for ${daoId}:`, err);
  }
  return [];
}
