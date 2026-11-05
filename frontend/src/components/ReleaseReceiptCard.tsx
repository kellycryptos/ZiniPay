import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, X, Clock, ShieldCheck, CheckCircle2, Cpu, Globe, FileText, AlertTriangle } from 'lucide-react';
import { Proposal } from '../lib/types';
import { verifyOnChainPolicyLive, checkOnChainCidUsed, PolicyCheckResult } from '../lib/nearRpc';

interface ReleaseReceiptCardProps {
  proposal: Proposal;
  daoContractId?: string;
  policyContractId?: string;
  network?: 'testnet' | 'mainnet';
  onVote?: (id: number, approve: boolean) => void;
  onInspectProof?: (proposal: Proposal) => void;
  onInspectDeliberation?: (proposal: Proposal) => void;
  onExecuteIntent?: (proposal: Proposal) => void;
  showActions?: boolean;
  rubberStamp?: boolean | 'PAID' | 'APPROVED';
  isSample?: boolean;
}

export function ReleaseReceiptCard({
  proposal,
  daoContractId = '',
  policyContractId = '',
  network = 'testnet',
  onVote,
  onInspectProof,
  onInspectDeliberation,
  onExecuteIntent,
  showActions = true,
  rubberStamp,
  isSample,
}: ReleaseReceiptCardProps) {
  const explorerBase = network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';
  const quorumReached = proposal.votes
    ? proposal.votes.approve >= proposal.votes.required
    : (proposal.status === 'approved' || proposal.status === 'settled');

  // Strict check: only genuine ZiniPay release proposals or explicit demo simulations get gate results
  // A proposal that is not a FunctionCall to the configured policy contract's release method must show all three gate rows as "Not a ZiniPay release".
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

  // Gate 2 evaluation based on lifecycle:
  // 1. InProgress: Call check_policy live ("Would pass if executed now" or "Would be blocked now")
  // 2. Approved/Settled: Do not call check_policy (it would fail due to used CID/cooldown). Show "Executed on-chain", call cid_used(cid) as evidence.
  // 3. Failed: Show execution failure
  // 4. Rejected/Removed/Expired: Show "Not executed"
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

    if (!policyContractId || !policyContractId.trim()) {
      setPolicyCheck({ status: 'unknown', reason: 'Not connected', checking: false });
      return;
    }

    if (proposal.simulated) {
      setPolicyCheck({
        status: proposal.policy?.withinCap ? 'passed' : 'failed',
        reason: proposal.policy?.withinCap ? 'Simulated check: within cap & limits' : 'Simulated check: cap exceeded',
        checking: false,
      });
      return;
    }

    if (isInProgress) {
      if (!policyContractId || !policyContractId.trim()) {
        setPolicyCheck({ status: 'unknown', reason: 'Not connected', checking: false });
        return;
      }

      setPolicyCheck({ status: 'unknown', reason: 'Verifying on-chain...', checking: true });
      verifyOnChainPolicyLive(
        policyContractId,
        proposal.recipient,
        proposal.amountYocto,
        proposal.proofCid,
        network
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
        checkOnChainCidUsed(policyContractId, proposal.proofCid, network).then((used) => {
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

  // Gate 3: Quorum status (strictly from real votes on proposal)
  const quorumStatus = quorumReached
    ? 'passed'
    : proposal.status === 'rejected'
    ? 'blocked'
    : 'pending';

  const explorerLinkTarget = proposal.txHash
    ? `${explorerBase}/txns/${proposal.txHash}`
    : daoContractId
    ? `${explorerBase}/accounts/${daoContractId}`
    : null;

  return (
    <article
      data-testid="release-receipt-card"
      data-proposal-id={proposal.id}
      className="receipt-card p-4 sm:p-5 text-xs text-[var(--text-receipt)] transition-all w-full max-w-full relative overflow-hidden"
    >
      {/* Rubber Stamp Overlay (Landed when council quorum is reached/approved) */}
      {Boolean(rubberStamp) && isApproved && (
        <div
          className="pointer-events-none absolute right-3 sm:right-6 top-10 sm:top-12 z-20 animate-stamp-thunk select-none"
          aria-label="Stamp: Approved and Paid"
        >
          <div className="border-[3px] border-double border-[#065F46] text-[#065F46] bg-[#065F46]/[0.08] backdrop-blur-[0.5px] px-3 py-1 sm:px-4 sm:py-1.5 rounded-sm shadow-sm flex flex-col items-center justify-center">
            <span className="font-display font-black text-xl sm:text-2xl tracking-[0.22em] leading-none text-[#065F46] uppercase">
              {typeof rubberStamp === 'string' ? rubberStamp : 'PAID'}
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-[#065F46] font-bold mt-1 uppercase border-t border-[#065F46]/40 pt-0.5">
              2 OF 2 COUNCIL QUORUM
            </span>
          </div>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-receipt)] text-xs gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-[var(--text-receipt)]">#{proposal.id}</span>
          <span className="font-mono text-xs font-semibold text-[var(--text-receipt)] truncate max-w-[150px] sm:max-w-[220px]">
            {proposal.recipient}
          </span>
          {proposal.simulated && (
            <span className="tag-pending text-[10px] font-mono">SIMULATION</span>
          )}
          {isSample && (
            <span className="tag-neutral text-[10px] font-mono">SAMPLE</span>
          )}
          {!isZinipay && (
            <span className="tag-neutral text-[10px] font-mono">EXTERNAL</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-xs font-bold text-[#064E3B]">
            {proposal.amountNear} NEAR
          </span>
          <span
            className={
              isApproved
                ? 'tag-passed font-mono text-[10px]'
                : proposal.status === 'rejected' || isFailed
                ? 'tag-blocked font-mono text-[10px]'
                : 'tag-pending font-mono text-[10px]'
            }
          >
            {isApproved ? 'Approved' : proposal.status === 'rejected' ? 'Rejected' : isFailed ? 'Failed' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Task Description */}
      <div className="py-2.5 font-sans">
        <h4 className={`font-semibold text-sm text-[var(--text-receipt)] tracking-tight leading-snug ${rubberStamp ? 'pr-20 sm:pr-28' : ''}`}>
          {proposal.title}
        </h4>
        {proposal.summary && (
          <p className="text-xs text-[var(--text-receipt-secondary)] mt-1 leading-relaxed line-clamp-2">
            {proposal.summary}
          </p>
        )}
      </div>

      {/* Three-Way Gate Verification Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-2.5 px-3 border-y border-[var(--border-receipt)] bg-[#F8F9FA]/90 rounded-lg my-1 text-xs">
        {/* Gate 1: Deliverable Proof */}
        <div className="flex flex-col gap-0.5" data-gate="deliverable">
          <span className="text-[10px] font-mono uppercase text-[var(--text-receipt-muted)] font-semibold flex items-center gap-1">
            <FileText size={11} /> Deliverable
          </span>
          <span className="font-mono text-xs text-[var(--text-receipt)] truncate" title={proposal.proofCid}>
            {proposal.proofCid ? (proposal.proofCid.includes('/') ? proposal.proofCid.split('/').pop() : `${proposal.proofCid.slice(0, 12)}...`) : 'Not attached'}
          </span>
          <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-1">
            <Check size={10} /> Verified
          </span>
        </div>

        {/* Gate 2: Spend Policy */}
        <div className="flex flex-col gap-0.5" data-gate="policy">
          <span className="text-[10px] font-mono uppercase text-[var(--text-receipt-muted)] font-semibold flex items-center gap-1">
            <ShieldCheck size={11} /> Policy Limits
          </span>
          <span className="font-mono text-xs text-[var(--text-receipt)] truncate">
            {proposal.policy?.capLimit ? `≤ ${proposal.policy.capLimit}` : 'Spend Cap'}
          </span>
          <span className="text-[10px] font-mono flex items-center gap-1">
            {policyCheck.checking ? (
              <span className="text-amber-600 flex items-center gap-1"><Clock size={10} className="animate-spin" /> Verifying</span>
            ) : policyCheck.status === 'passed' || isApproved ? (
              <span className="text-emerald-700 flex items-center gap-1"><Check size={10} /> Passed</span>
            ) : policyCheck.status === 'failed' ? (
              <span className="text-red-600 flex items-center gap-1"><X size={10} /> Blocked</span>
            ) : (
              <span className="text-slate-600 flex items-center gap-1">Enforced</span>
            )}
          </span>
        </div>

        {/* Gate 3: Council Quorum */}
        <div className="flex flex-col gap-0.5" data-gate="quorum">
          <span className="text-[10px] font-mono uppercase text-[var(--text-receipt-muted)] font-semibold flex items-center gap-1">
            <CheckCircle2 size={11} /> Council Quorum
          </span>
          <span className="font-mono text-xs text-[var(--text-receipt)]">
            {proposal.votes ? `${proposal.votes.approve} of ${proposal.votes.required} Votes` : '2 of 2 Required'}
          </span>
          <span className="text-[10px] font-mono flex items-center gap-1">
            {quorumStatus === 'passed' ? (
              <span className="text-emerald-700 flex items-center gap-1"><Check size={10} /> Consented</span>
            ) : quorumStatus === 'blocked' ? (
              <span className="text-red-600 flex items-center gap-1"><X size={10} /> Rejected</span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1"><Clock size={10} /> Pending</span>
            )}
          </span>
        </div>
      </div>

      {/* Metadata & Explorer Footer */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-receipt-muted)] pt-2">
        <span>{proposal.createdAt}</span>
        {explorerLinkTarget ? (
          <a
            href={explorerLinkTarget}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-receipt-secondary)] hover:text-[var(--text-receipt)] flex items-center gap-1 hover:underline"
          >
            <span>{proposal.txHash ? `${proposal.txHash.slice(0, 12)}...` : 'Explorer'}</span>
            <ExternalLink size={10} />
          </a>
        ) : (
          <span>Sputnik DAO v2</span>
        )}
      </div>

      {/* Action Bar */}
      {showActions && (
        <div className="pt-2.5 mt-2 border-t border-[var(--border-receipt)] flex flex-wrap items-center justify-between gap-2">
          {/* Inspection Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isZinipay && onInspectProof && (
              <button
                type="button"
                onClick={() => onInspectProof(proposal)}
                className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
              >
                <FileText size={11} />
                <span>Proof</span>
              </button>
            )}

            {isZinipay && onInspectDeliberation && (
              <button
                type="button"
                onClick={() => onInspectDeliberation(proposal)}
                className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
              >
                <Cpu size={11} />
                <span>Deliberation</span>
              </button>
            )}

            {isZinipay && proposal.settlement.type === 'cross_chain_intent' && onExecuteIntent && (
              <button
                type="button"
                onClick={() => onExecuteIntent(proposal)}
                className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1 text-[var(--color-pending)] cursor-pointer"
              >
                <Globe size={11} />
                <span>Intents</span>
              </button>
            )}
          </div>

          {/* Voting Actions for Council */}
          {onVote && proposal.status === 'pending_quorum' && (
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => onVote(proposal.id, true)}
                className="btn-primary text-xs py-1 px-3 flex items-center gap-1 cursor-pointer"
              >
                <Check size={12} />
                <span>Approve</span>
              </button>
              <button
                type="button"
                onClick={() => onVote(proposal.id, false)}
                className="btn-secondary text-xs py-1 px-3 flex items-center gap-1 text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 cursor-pointer"
              >
                <X size={12} />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
