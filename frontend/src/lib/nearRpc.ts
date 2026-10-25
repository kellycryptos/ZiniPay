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

export interface PolicyContractState {
  owner: string;
  dao_account_id: string;
  per_proposal_cap: string;
  cooldown_seconds: number;
  min_reputation: number;
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

export async function fetchPolicyContractConfig(
  policyContractId: string,
  network: 'testnet' | 'mainnet'
): Promise<PolicyContractState | null> {
  if (!policyContractId || policyContractId.includes('your-dao')) return null;
  try {
    const res = await axios.post(getRpcUrl(network), {
      jsonrpc: '2.0',
      id: 'zinipay-policy-config',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: policyContractId,
        method_name: 'get_policy',
        args_base64: 'e30=',
      },
    });

    if (res.data.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(res.data.result.result));
      return JSON.parse(decoded) as PolicyContractState;
    }
  } catch (err) {
    console.warn(`Failed to fetch policy contract config for ${policyContractId}:`, err);
  }
  return null;
}

export async function fetchOnChainReputation(
  policyContractId: string,
  accountId: string,
  network: 'testnet' | 'mainnet'
): Promise<number> {
  if (!policyContractId || !accountId) return 0;
  try {
    const res = await axios.post(getRpcUrl(network), {
      jsonrpc: '2.0',
      id: 'zinipay-rep',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: policyContractId,
        method_name: 'get_reputation',
        args_base64: btoa(JSON.stringify({ account: accountId })),
      },
    });

    if (res.data.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(res.data.result.result));
      return Number(JSON.parse(decoded));
    }
  } catch (err) {
    console.warn(`Failed to fetch reputation for ${accountId}:`, err);
  }
  return 0;
}

export async function checkOnChainCidUsed(
  policyContractId: string,
  cid: string,
  network: 'testnet' | 'mainnet'
): Promise<boolean> {
  if (!policyContractId || !cid) return false;
  try {
    const res = await axios.post(getRpcUrl(network), {
      jsonrpc: '2.0',
      id: 'zinipay-cid-used',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: policyContractId,
        method_name: 'cid_used',
        args_base64: btoa(JSON.stringify({ cid })),
      },
    });

    if (res.data.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(res.data.result.result));
      return Boolean(JSON.parse(decoded));
    }
  } catch (err) {
    console.warn(`Failed to check cid_used for ${cid}:`, err);
  }
  return false;
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
    const argsBase64 = btoa(JSON.stringify({ from_index: fromIndex, limit }));

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
        let recipient = 'community.near';
        let amountYocto = '0';
        let proofCid = '';
        let targetContract = '';

        if (p.kind?.Transfer) {
          amountYocto = p.kind.Transfer.amount || '0';
          recipient = p.kind.Transfer.receiver_id || 'community.near';
        } else if (p.kind?.FunctionCall) {
          targetContract = p.kind.FunctionCall.receiver_id || '';
          const action = p.kind.FunctionCall.actions?.[0];
          if (action) {
            amountYocto = action.deposit || '0';
            if (action.args) {
              try {
                const decodedStr = atob(action.args);
                const decodedArgs = JSON.parse(decodedStr);
                if (decodedArgs.recipient) recipient = decodedArgs.recipient;
                if (decodedArgs.amount) amountYocto = decodedArgs.amount;
                if (decodedArgs.cid) proofCid = decodedArgs.cid;
              } catch {
                // Ignore decoding errors
              }
            }
          }
        }

        const amountNear = (Number(BigInt(amountYocto) / 10n ** 22n) / 100).toFixed(2);

        // Check if description contains ZiniPay / CID metadata if not found in args
        if (!proofCid) {
          const cidMatch = p.description.match(/(https?:\/\/[^\s]+|ipfs:\/\/[^\s]+|bafy[a-z0-9]+)/i);
          proofCid = cidMatch ? cidMatch[0] : '';
        }

        // Extract attestation hash if present in description
        const attMatch = p.description.match(/(?:Attestation:\s*|sha256:)([a-f0-9]{32,64})/i);
        const attestationHash = attMatch ? `sha256:${attMatch[1]}` : undefined;

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
          targetContract: targetContract || undefined,
          attestationHash,
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
