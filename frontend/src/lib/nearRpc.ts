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

export type TreasuryBalanceResult = {
  status: 'loading' | 'success' | 'error';
  balance?: number;
  error?: string;
};

export async function fetchDaoTreasuryBalanceResult(
  daoId: string,
  network: 'testnet' | 'mainnet'
): Promise<TreasuryBalanceResult> {
  if (!daoId || !daoId.trim()) {
    return { status: 'error', error: 'No DAO account specified' };
  }
  try {
    const res = await axios.post(
      getRpcUrl(network),
      {
        jsonrpc: '2.0',
        id: 'zinipay-balance',
        method: 'query',
        params: {
          request_type: 'view_account',
          finality: 'final',
          account_id: daoId.trim(),
        },
      },
      { timeout: 7000 }
    );

    if (res.data.error) {
      const errCause = res.data.error.cause?.name || res.data.error.name || res.data.error.message || 'Account query error';
      return { status: 'error', error: `${errCause}: ${daoId}` };
    }

    if (res.data.result?.amount) {
      const yocto = BigInt(res.data.result.amount);
      const balance = Number(yocto / 10n ** 22n) / 100;
      return { status: 'success', balance };
    }
    return { status: 'error', error: 'Invalid balance format from RPC' };
  } catch (err: any) {
    const msg = err.response?.data?.error?.message || err.message || 'Network error querying NEAR RPC';
    return { status: 'error', error: msg };
  }
}

export async function fetchDaoTreasuryBalance(daoId: string, network: 'testnet' | 'mainnet'): Promise<number> {
  const res = await fetchDaoTreasuryBalanceResult(daoId, network);
  return res.status === 'success' && res.balance !== undefined ? res.balance : 0;
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

export interface PolicyCheckResult {
  status: 'passed' | 'failed' | 'unknown';
  reason?: string;
}

export async function verifyOnChainPolicyLive(
  policyContractId: string,
  recipient: string,
  amountYocto: string,
  cid: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<PolicyCheckResult> {
  if (!policyContractId || !policyContractId.trim()) {
    return { status: 'unknown', reason: 'Policy contract not configured' };
  }
  if (!recipient || !recipient.trim()) {
    return { status: 'unknown', reason: 'Recipient not specified' };
  }

  try {
    const res = await axios.post(
      getRpcUrl(network),
      {
        jsonrpc: '2.0',
        id: 'zinipay-check-policy',
        method: 'query',
        params: {
          request_type: 'call_function',
          finality: 'final',
          account_id: policyContractId.trim(),
          method_name: 'check_policy',
          args_base64: btoa(
            JSON.stringify({
              recipient: recipient.trim(),
              amount: amountYocto || '0',
              cid: cid || '',
            })
          ),
        },
      },
      { timeout: 7000 }
    );

    if (res.data.error) {
      const errData = res.data.error.data || res.data.error.message || '';
      const strData = typeof errData === 'string' ? errData : JSON.stringify(errData);

      if (
        strData.includes('does not exist') ||
        strData.includes('MethodNotFound') ||
        strData.includes('CompilationError') ||
        strData.includes('HostError')
      ) {
        return { status: 'unknown', reason: 'Contract or check_policy view unavailable' };
      }

      const panicMatch = strData.match(/panicked:\s*([^\n,]+)/i) || strData.match(/GuestPanic\s*\{\s*panic_msg:\s*"([^"]+)"/i);
      const panicText = panicMatch ? panicMatch[1].trim() : strData;
      return { status: 'failed', reason: panicText };
    }

    if (res.data.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(res.data.result.result));
      const isAllowed = JSON.parse(decoded);
      if (isAllowed === true) {
        return { status: 'passed' };
      }
      return { status: 'failed', reason: 'On-chain policy returned false' };
    }

    return { status: 'unknown', reason: 'Empty response from RPC' };
  } catch (err: any) {
    const errorData = err.response?.data?.error?.data || err.response?.data?.error?.message;
    if (errorData) {
      const strData = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
      if (strData.includes('does not exist') || strData.includes('MethodNotFound')) {
        return { status: 'unknown', reason: 'Contract or check_policy view unavailable' };
      }
      const panicMatch = strData.match(/panicked:\s*([^\n,]+)/i);
      const panicText = panicMatch ? panicMatch[1].trim() : strData;
      return { status: 'failed', reason: panicText };
    }
    return { status: 'unknown', reason: err.message || 'Network error querying policy' };
  }
}

export async function fetchDaoProposals(
  daoId: string,
  network: 'testnet' | 'mainnet',
  limit = 20,
  policyContractId?: string
): Promise<Proposal[]> {
  if (!daoId || !daoId.trim()) return [];
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
    }, { timeout: 7000 });

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
    }, { timeout: 7000 });

    if (res.data.result?.result) {
      const decoded = new TextDecoder().decode(new Uint8Array(res.data.result.result));
      const rawList = JSON.parse(decoded) as DaoOnChainProposal[];

      return rawList.map((p) => {
        let recipient = 'community.near';
        let amountYocto = '0';
        let proofCid = '';
        let targetContract = '';
        let targetMethod = '';
        let isZinipayRelease = false;

        if (p.kind?.Transfer) {
          amountYocto = p.kind.Transfer.amount || '0';
          recipient = p.kind.Transfer.receiver_id || 'community.near';
        } else if (p.kind?.FunctionCall) {
          targetContract = p.kind.FunctionCall.receiver_id || '';
          const action = p.kind.FunctionCall.actions?.[0];
          if (action) {
            targetMethod = action.method_name || '';
            amountYocto = action.deposit || '0';

            const isPolicyMatch = Boolean(
              policyContractId &&
              policyContractId.trim() &&
              targetContract.toLowerCase() === policyContractId.trim().toLowerCase()
            );

            if (isPolicyMatch && targetMethod === 'release') {
              isZinipayRelease = true;
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
        }

        const amountNear = (Number(BigInt(amountYocto) / 10n ** 22n) / 100).toFixed(2);

        // Only parse CID and Attestation for real ZiniPay release proposals
        let attestationHash: string | undefined;
        let attestationStatus: 'report_received' | 'unverified' | 'verified' | undefined;
        let attestationReason: string | undefined;

        if (isZinipayRelease) {
          if (!proofCid) {
            const cidMatch = p.description.match(/(https?:\/\/[^\s]+|ipfs:\/\/[^\s]+|bafy[a-z0-9]+)/i);
            proofCid = cidMatch ? cidMatch[0] : '';
          }
          const attMatch = p.description.match(/(?:Attestation[^:]*:\s*|sha256:)([a-f0-9]{32,64})/i);
          attestationHash = attMatch ? `sha256:${attMatch[1]}` : undefined;
          attestationStatus = attMatch ? 'report_received' : 'unverified';
          attestationReason = attMatch
            ? 'Attestation report received (not independently verified)'
            : 'No attestation report attached';
        }

        let status: 'pending_quorum' | 'approved' | 'settled' | 'rejected' | 'failed' | 'expired' | 'removed' | 'moved' = 'pending_quorum';
        if (p.status === 'Approved') {
          status = 'approved';
        } else if (p.status === 'Failed') {
          status = 'failed';
        } else if (p.status === 'Expired') {
          status = 'expired';
        } else if (p.status === 'Removed') {
          status = 'removed';
        } else if (p.status === 'Moved') {
          status = 'moved';
        } else if (p.status === 'Rejected') {
          status = 'rejected';
        } else {
          status = 'pending_quorum';
        }

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
          targetMethod: targetMethod || undefined,
          isZinipayRelease,
          attestationHash,
          attestationStatus,
          attestationReason,
          summary: p.description.substring(0, 140),
          evidenceType,
          evidenceDetails: p.description,
          createdAt: new Date(Number(BigInt(p.submission_time) / 1_000_000n)).toLocaleDateString(),
          submissionTime: p.submission_time,
          status,
          rawStatus: p.status,
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
