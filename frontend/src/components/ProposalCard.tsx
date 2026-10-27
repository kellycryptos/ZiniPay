import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Globe,
  FileSearch,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { Proposal } from '../lib/types';
import { verifyOnChainPolicyLive, checkOnChainCidUsed, PolicyCheckResult } from '../lib/nearRpc';

interface Props {
  proposal: Proposal;
  daoContractId?: string;
  policyContractId?: string;
  network?: string;
  onVote?: (id: number, approve: boolean) => void;
  onInspectProof?: (proposal: Proposal) => void;
  onInspectDeliberation?: (proposal: Proposal) => void;
  onExecuteIntent?: (proposal: Proposal) => void;
}

const STATUS_CONFIG = {
  pending_quorum: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', label: 'Pending Quorum' },
  approved:       { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', label: 'Approved' },
  settled:        { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', label: 'Settled' },
  rejected:       { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', label: 'Rejected' },
  failed:         { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', label: 'Failed' },
  expired:        { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20', label: 'Expired' },
  removed:        { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20', label: 'Removed' },
  moved:          { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20', label: 'Moved' },
};

export function ProposalCard({
  proposal,
  daoContractId = '',
  policyContractId = '',
  network = 'testnet',
  onVote,
  onInspectProof,
  onInspectDeliberation,
  onExecuteIntent,
}: Props) {
  const cfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.pending_quorum;
  const StatusIcon = cfg.icon;

  const explorerBase = network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';
  const quorumReached = proposal.votes.approve >= proposal.votes.required;

  // Strict check: only genuine ZiniPay release proposals or explicit demo simulations get gate results
  const isFunctionCallToConfiguredPolicy = Boolean(
    policyContractId &&
    policyContractId.trim() &&
    proposal.targetContract &&
    proposal.targetContract.toLowerCase() === policyContractId.trim().toLowerCase() &&
    proposal.targetMethod === 'release'
  );

  const isZinipay = Boolean(
    proposal.simulated ||
    isFunctionCallToConfiguredPolicy ||
    (proposal.isZinipayRelease && (!policyContractId || proposal.targetContract?.toLowerCase() === policyContractId.trim().toLowerCase()))
  );

  // Determine proposal lifecycle stage
  const rawStatus = proposal.rawStatus || (
    proposal.status === 'approved' || proposal.status === 'settled' ? 'Approved' :
    proposal.status === 'failed' ? 'Failed' :
    proposal.status === 'rejected' ? 'Rejected' :
    proposal.status === 'expired' ? 'Expired' :
    proposal.status === 'removed' ? 'Removed' :
    'InProgress'
  );

  const isInProgress = rawStatus === 'InProgress' || proposal.status === 'pending_quorum';
  const isApproved = rawStatus === 'Approved' || proposal.status === 'approved' || proposal.status === 'settled';
  const isFailed = rawStatus === 'Failed' || proposal.status === 'failed';
  const isTerminalOther = rawStatus === 'Rejected' || rawStatus === 'Removed' || rawStatus === 'Expired' || proposal.status === 'rejected' || proposal.status === 'expired' || proposal.status === 'removed';

  // Gate 2: Real live check_policy call for InProgress; or executed evidence for Approved
  const [policyCheck, setPolicyCheck] = useState<PolicyCheckResult & { checking?: boolean }>({
    status: 'unknown',
    reason: 'Evaluating...',
    checking: isInProgress,
  });
  const [onChainCidUsed, setOnChainCidUsed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!isZinipay) {
      setPolicyCheck({ status: 'unknown', reason: 'Not a ZiniPay release', checking: false });
      return;
    }

    if (isInProgress) {
      if (!policyContractId || !policyContractId.trim()) {
        setPolicyCheck({ status: 'unknown', reason: 'Policy contract not configured', checking: false });
        return;
      }

      setPolicyCheck({ status: 'unknown', reason: 'Verifying on-chain...', checking: true });
      verifyOnChainPolicyLive(
        policyContractId,
        proposal.recipient,
        proposal.amountYocto,
        proposal.proofCid,
        (network as any) || 'testnet'
      ).then((res) => {
        if (isMounted) {
          setPolicyCheck({ ...res, checking: false });
        }
      }).catch((err) => {
        if (isMounted) {
          setPolicyCheck({ status: 'unknown', reason: err.message || 'Call unavailable', checking: false });
        }
      });
    } else if (isApproved) {
      // For approved/settled releases, query cid_used on-chain as positive settlement evidence
      if (policyContractId && proposal.proofCid) {
        checkOnChainCidUsed(policyContractId, proposal.proofCid, (network as any) || 'testnet').then((used) => {
          if (isMounted) {
            setOnChainCidUsed(used);
          }
        }).catch(() => {
          if (isMounted) {
            setOnChainCidUsed(null);
          }
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isZinipay, isInProgress, isApproved, policyContractId, proposal.recipient, proposal.amountYocto, proposal.proofCid, network]);

  return (
    <div className="card p-5 flex flex-col gap-4 transition-all hover:border-[var(--border-strong)]">
      {/* Header Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {proposal.simulated && (
            <span className="status-badge bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-[10px] tracking-wider">
              SIMULATION
            </span>
          )}
          <span className={`status-badge border ${cfg.bg} ${cfg.color}`}>
            <StatusIcon size={12} />
            {cfg.label}
          </span>

          {!isZinipay ? (
            <span className="status-badge tag-neutral text-[10px]">
              Not a ZiniPay release
            </span>
          ) : (
            <>
              <span className="status-badge bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[10px]">
                Proof: Unverified Claim
              </span>
              <span className="status-badge font-mono border bg-slate-300/15 text-slate-200 border-slate-400/30">
                Tier: {proposal.policy.tier}
              </span>
              {proposal.settlement.type === 'cross_chain_intent' && (
                <span className="status-badge bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
                  <Globe size={11} className="mr-0.5" />
                  Intents → {proposal.settlement.targetChain.toUpperCase()}
                </span>
              )}
            </>
          )}

          <span className="status-badge bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono font-bold">
            {proposal.amountNear} NEAR
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs font-mono">#{proposal.id}</span>
          {daoContractId && (
            <a
              href={`${explorerBase}/accounts/${daoContractId}`}
              target="_blank"
              rel="noopener noreferrer"
              title="View on NEAR Explorer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Title & Summary */}
      <div>
        <h3 className="text-sm font-bold text-white leading-snug">{proposal.title}</h3>
        <p className="text-xs text-gray-300 mt-1 leading-relaxed">{proposal.summary}</p>
      </div>

      {/* Action Description */}
      {isZinipay && proposal.targetContract ? (
        <div className="bg-purple-950/20 border border-purple-800/40 p-2.5 rounded-xl text-xs font-mono">
          <div className="text-purple-300 font-semibold mb-1 flex items-center justify-between">
            <span>Action: FunctionCall → {proposal.targetContract}::release()</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">Atomic Payout</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-gray-300 text-[11px] pt-1 border-t border-purple-900/30">
            <div>Recipient: <span className="text-purple-200">{proposal.recipient}</span></div>
            <div>Amount: <span className="text-purple-200">{proposal.amountNear} NEAR</span></div>
            <div className="truncate">CID: <span className="text-cyan-300" title={proposal.proofCid}>{proposal.proofCid || 'N/A'}</span></div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 p-2 rounded-xl text-[11px] font-mono text-gray-400">
          <span>Action: Standard Sputnik DAO Proposal ({proposal.amountNear} NEAR → {proposal.recipient})</span>
        </div>
      )}

      {/* Three Gate Rows */}
      <div className="flex flex-col gap-2 p-3 bg-[var(--bg-panel-alt)] rounded-lg border border-[var(--border-subtle)] font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)]">GATE 01 [PROOF]:</span>
          {!isZinipay ? (
            <span className="tag-neutral text-[10px]">Not a ZiniPay release</span>
          ) : (
            <span className="tag-pending text-[10px]" title="Proof artifact hash was claimed in the proposal description and is not verified on-chain.">
              Claimed in proposal description (not verified on-chain)
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)]">GATE 02 [POLICY]:</span>
          {!isZinipay ? (
            <span className="tag-neutral text-[10px]">Not a ZiniPay release</span>
          ) : isInProgress ? (
            policyCheck.checking ? (
              <span className="tag-pending text-[10px]">
                <Clock size={10} className="animate-spin inline mr-1" /> Evaluating check_policy view...
              </span>
            ) : policyCheck.status === 'passed' ? (
              <span className="tag-passed text-[10px]">
                <Check size={10} className="inline mr-1" /> PASS · Would pass if executed now
              </span>
            ) : policyCheck.status === 'failed' ? (
              <span className="tag-blocked text-[10px]" title={policyCheck.reason}>
                <X size={10} className="inline mr-1" /> BLOCKED · Would be blocked now: {policyCheck.reason || 'Policy violation'}
              </span>
            ) : (
              <span className="tag-pending text-[10px]">
                Unknown ({policyCheck.reason || 'check_policy view unavailable'})
              </span>
            )
          ) : isApproved ? (
            <span className="tag-passed text-[10px]">
              <Check size={10} className="inline mr-1" /> PASS · Executed on-chain
              {onChainCidUsed === true && ' (cid_used: verified)'}
              {proposal.submissionTime && (
                <span className="text-[var(--text-muted)] text-[9px] ml-1 font-mono">
                  [TS:{proposal.submissionTime.slice(0, 10)}]
                </span>
              )}
            </span>
          ) : isFailed ? (
            <span className="tag-blocked text-[10px]">
              <X size={10} className="inline mr-1" /> FAILED · Release did not execute {proposal.executionError ? `(${proposal.executionError})` : ''}
            </span>
          ) : (
            <span className="tag-neutral text-[10px]">
              Not executed · Proposal {rawStatus.toLowerCase()}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)]">GATE 03 [QUORUM]:</span>
          {!isZinipay ? (
            <span className="tag-neutral text-[10px]">Not a ZiniPay release</span>
          ) : quorumReached ? (
            <span className="tag-passed text-[10px]">PASSED · Quorum ({proposal.votes.approve}/{proposal.votes.required})</span>
          ) : proposal.status === 'rejected' ? (
            <span className="tag-blocked text-[10px]">REJECTED · Council Veto</span>
          ) : (
            <span className="tag-pending text-[10px]">PENDING · {proposal.votes.approve}/{proposal.votes.required}</span>
          )}
        </div>
      </div>

      {/* Recipient Quick Inspect */}
      <div className="flex items-center justify-between bg-gray-950/70 p-3 rounded-xl border border-gray-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Recipient:</span>
          <span className="font-mono text-purple-300 font-semibold">{proposal.recipient}</span>
          {proposal.settlement.quoteEstimate && (
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              {proposal.settlement.quoteEstimate}
            </span>
          )}
        </div>

        {isZinipay && (
          <div className="flex items-center gap-2 flex-wrap">
            {onInspectDeliberation && (
              <button
                type="button"
                onClick={() => onInspectDeliberation(proposal)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 font-medium transition-colors border border-purple-500/30"
              >
                <Cpu size={13} className="text-purple-400" />
                <span>NEAR AI Deliberation</span>
              </button>
            )}

            {onInspectProof && (
              <button
                type="button"
                onClick={() => onInspectProof(proposal)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-400 hover:text-cyan-300 font-medium transition-colors border border-gray-700"
              >
                <FileSearch size={13} />
                <span>Inspect Proof</span>
              </button>
            )}

            {proposal.settlement.type === 'cross_chain_intent' && onExecuteIntent && (
              <button
                type="button"
                onClick={() => onExecuteIntent(proposal)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 font-medium transition-colors border border-blue-500/30"
              >
                <Globe size={13} className="text-blue-400" />
                <span>Intent Solver</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer & Voting Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-[var(--border)] text-xs gap-3">
        <div className="flex items-center gap-2 text-gray-400">
          <Cpu size={14} className="text-purple-400" />
          <span>Proposer: <strong className="text-gray-200 font-mono">{proposal.proposer}</strong></span>
          <span>·</span>
          <span>{proposal.createdAt}</span>
        </div>

        {/* Council Voting Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800 font-mono text-xs">
            <span className="text-gray-400">Council Quorum:</span>
            <span className={quorumReached ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {proposal.votes.approve}/{proposal.votes.required}
            </span>
          </div>

          {onVote && proposal.status === 'pending_quorum' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onVote(proposal.id, true)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 font-semibold border border-emerald-500/30 transition-colors"
                title="Vote Approve as Council member"
              >
                <ThumbsUp size={12} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => onVote(proposal.id, false)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 font-semibold border border-red-500/30 transition-colors"
                title="Vote Reject as Council member"
              >
                <ThumbsDown size={12} />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
