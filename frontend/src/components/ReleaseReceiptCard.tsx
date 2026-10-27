import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, X, Clock, ShieldCheck, Cpu, Globe, FileText, AlertTriangle } from 'lucide-react';
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
}: ReleaseReceiptCardProps) {
  const explorerBase = network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';
  const quorumReached = proposal.votes.approve >= proposal.votes.required;

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
        setPolicyCheck({ status: 'unknown', reason: 'Policy contract not configured', checking: false });
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
    <article className="receipt-card p-4 sm:p-5 text-xs text-[var(--text-receipt)] transition-all w-full max-w-full">
      {/* Receipt Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-receipt)] text-xs gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[var(--text-receipt)]">Release receipt #{proposal.id}</span>
          {!isZinipay && (
            <span className="tag-neutral text-[11px]">
              Not a ZiniPay release
            </span>
          )}
          {proposal.simulated && (
            <span className="tag-pending text-[11px] font-medium">
              Simulation
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <span className="text-[var(--text-receipt-muted)] text-xs">{proposal.createdAt}</span>
          <span
            className={
              proposal.status === 'settled' || proposal.status === 'approved'
                ? 'tag-passed'
                : proposal.status === 'rejected'
                ? 'tag-blocked'
                : 'tag-pending'
            }
          >
            {proposal.status === 'pending_quorum'
              ? 'Pending approval'
              : proposal.status === 'settled' || proposal.status === 'approved'
              ? 'Paid'
              : proposal.status === 'rejected'
              ? 'Rejected'
              : proposal.status === 'failed'
              ? 'Failed'
              : proposal.status === 'expired'
              ? 'Expired'
              : proposal.status}
          </span>
        </div>
      </div>

      {/* Task Description */}
      <div className="py-3 font-sans">
        <h4 className="font-semibold text-sm text-[var(--text-receipt)] tracking-tight leading-snug">{proposal.title}</h4>
        {proposal.summary && (
          <p className="text-xs text-[var(--text-receipt-secondary)] mt-1.5 leading-relaxed line-clamp-2">
            {proposal.summary}
          </p>
        )}
      </div>

      <div className="ledger-perforation" />

      {/* Clean Tabular Rows */}
      <div className="flex flex-col gap-2.5 py-1 text-xs">
        {/* Recipient */}
        <div className="ledger-row">
          <span className="text-[var(--text-receipt-muted)]">Recipient</span>
          <div className="flex items-center gap-2 truncate">
            <span className="text-[var(--text-receipt)] font-mono font-medium truncate">{proposal.recipient}</span>
            {isZinipay && proposal.settlement.type === 'cross_chain_intent' && (
              <span className="tag-neutral text-[10px]">
                Intents to {proposal.settlement.targetChain}
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="ledger-row">
          <span className="text-[var(--text-receipt-muted)]">Amount</span>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-receipt)] font-mono font-semibold">{proposal.amountNear} NEAR</span>
            {isZinipay && proposal.settlement.quoteEstimate && (
              <span className="text-[var(--text-receipt-secondary)] font-mono text-[11px]">({proposal.settlement.quoteEstimate})</span>
            )}
          </div>
        </div>

        {/* Deliverable Evidence */}
        <div className="ledger-row">
          <span className="text-[var(--text-receipt-muted)]">Deliverable CID</span>
          <span className="text-[var(--text-receipt-secondary)] font-mono truncate max-w-[190px] sm:max-w-xs break-all" title={proposal.proofCid}>
            {proposal.proofCid ? proposal.proofCid : 'Not applicable'}
          </span>
        </div>

        <div className="ledger-perforation" />

        {/* Gate 1: Proof */}
        <div className="ledger-row">
          <span className="text-[var(--text-receipt-muted)]">Proof</span>
          {!isZinipay ? (
            <span className="tag-neutral">Not a ZiniPay release</span>
          ) : (
            <span className="tag-pending" title="Proof artifact hash was specified in the proposal description and is not verified on-chain.">
              Claimed in proposal description (not verified on-chain)
            </span>
          )}
        </div>

        {/*
         * ┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
         * │ ZINIPAY GATE VERIFICATION MATRIX BY PROPOSAL LIFECYCLE                                                 │
         * ├──────────────────┬─────────────────────────────┬───────────────────────────┬───────────────────────────┤
         * │ Status           │ Proof                       │ Policy                    │ Quorum                    │
         * ├──────────────────┼─────────────────────────────┼───────────────────────────┼───────────────────────────┤
         * │ InProgress       │ Claimed (not on-chain)      │ Live check_policy view    │ Real-time council votes   │
         * │ Approved/Settled │ Claimed (not on-chain)      │ "Executed on-chain"       │ Consensus reached         │
         * │                  │                             │ (+ cid_used verification) │ (never red)               │
         * │ Failed           │ Claimed (not on-chain)      │ "Release did not execute" │ Council/Contract state    │
         * │ Rejected         │ Claimed (not on-chain)      │ "Not executed" (neutral)  │ Council veto              │
         * │ Expired/Removed  │ Claimed (not on-chain)      │ "Not executed" (neutral)  │ Period lapsed / Removed   │
         * │ Foreign proposal │ "Not a ZiniPay release"     │ "Not a ZiniPay release"   │ Standard Sputnik votes    │
         * └──────────────────┴─────────────────────────────┴───────────────────────────┴───────────────────────────┘
         */}
        {/* Gate 2: Policy */}
        <div className="ledger-row">
          <span className="text-[var(--text-receipt-muted)]">Policy</span>
          {!isZinipay ? (
            <span className="tag-neutral">Not a ZiniPay release</span>
          ) : isInProgress ? (
            policyCheck.checking ? (
              <span className="tag-pending">
                <Clock size={11} className="animate-spin inline mr-1" /> Evaluating check_policy view...
              </span>
            ) : policyCheck.status === 'passed' ? (
              <span className="tag-passed">
                <Check size={11} /> Passed · Would pass if executed now
              </span>
            ) : policyCheck.status === 'failed' ? (
              <span className="tag-blocked" title={policyCheck.reason}>
                <X size={11} /> Blocked · Would be blocked now: {policyCheck.reason || 'Policy violation'}
              </span>
            ) : (
              <span className="tag-pending">
                Unknown ({policyCheck.reason || 'check_policy view unavailable'})
              </span>
            )
          ) : isApproved ? (
            <span className="tag-passed">
              <Check size={11} /> Passed · Executed on-chain
              {onChainCidUsed === true && ' (cid_used: verified)'}
            </span>
          ) : isFailed ? (
            <span className="tag-blocked">
              <X size={11} /> Failed · Release did not execute {proposal.executionError ? `(${proposal.executionError})` : ''}
            </span>
          ) : (
            <span className="tag-neutral">
              Not executed · Proposal {rawStatus.toLowerCase()}
            </span>
          )}
        </div>

        {/* Gate 3: Quorum */}
        <div className="ledger-row">
          <span className="text-[var(--text-receipt-muted)]">Council quorum</span>
          {!isZinipay ? (
            <span className="tag-neutral">Not a ZiniPay release</span>
          ) : quorumStatus === 'passed' ? (
            <span className="tag-passed">
              <Check size={11} /> Passed · Quorum reached ({proposal.votes.approve} of {proposal.votes.required} votes)
            </span>
          ) : quorumStatus === 'blocked' ? (
            <span className="tag-blocked">
              <X size={11} /> Rejected · Council veto
            </span>
          ) : (
            <span className="tag-pending">
              <Clock size={11} /> Pending · {proposal.votes.approve} of {proposal.votes.required} council votes
            </span>
          )}
        </div>

        {/* Vote Counts */}
        <div className="ledger-row">
          <span className="text-[var(--text-receipt-muted)]">Votes</span>
          <span className="text-[var(--text-receipt)] text-xs">
            <span className="text-[var(--color-passed)] font-semibold">{proposal.votes.approve} approve</span>
            <span className="text-[var(--text-receipt-muted)] mx-1.5">/</span>
            <span className="text-[var(--color-blocked)] font-semibold">{proposal.votes.reject} reject</span>
            <span className="text-[var(--text-receipt-muted)] ml-1.5">({proposal.votes.required} required)</span>
          </span>
        </div>

        {/* Explorer / Tx Link */}
        <div className="ledger-row pt-0.5">
          <span className="text-[var(--text-receipt-muted)]">On-chain record</span>
          {explorerLinkTarget ? (
            <a
              href={explorerLinkTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-receipt-secondary)] hover:text-[var(--text-receipt)] hover:underline flex items-center gap-1 font-mono text-xs"
            >
              <span>{proposal.txHash ? `${proposal.txHash.slice(0, 16)}...` : daoContractId || 'Sputnik DAO'}</span>
              <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[var(--text-receipt-muted)] font-mono text-xs">Proposal #{proposal.id}</span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {showActions && (
        <div className="pt-3 mt-2 border-t border-[var(--border-receipt)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Inspection Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isZinipay && onInspectProof && (
              <button
                type="button"
                onClick={() => onInspectProof(proposal)}
                className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={12} />
                <span>Deliverable proof</span>
              </button>
            )}

            {isZinipay && onInspectDeliberation && (
              <button
                type="button"
                onClick={() => onInspectDeliberation(proposal)}
                className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5 cursor-pointer"
              >
                <Cpu size={12} />
                <span>Deliberation details</span>
              </button>
            )}

            {isZinipay && proposal.settlement.type === 'cross_chain_intent' && onExecuteIntent && (
              <button
                type="button"
                onClick={() => onExecuteIntent(proposal)}
                className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5 text-[var(--color-pending)] cursor-pointer"
              >
                <Globe size={12} />
                <span>Intents settlement</span>
              </button>
            )}
          </div>

          {/* Voting Actions for Council */}
          {onVote && proposal.status === 'pending_quorum' && (
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                type="button"
                onClick={() => onVote(proposal.id, true)}
                className="btn-primary text-xs py-1 px-3 flex items-center gap-1.5 flex-1 sm:flex-initial justify-center cursor-pointer"
              >
                <Check size={13} />
                <span>Approve payout</span>
              </button>
              <button
                type="button"
                onClick={() => onVote(proposal.id, false)}
                className="btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 text-[var(--color-blocked)] hover:text-white hover:bg-[var(--color-blocked)] hover:border-[var(--color-blocked)] cursor-pointer"
              >
                <X size={13} />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
