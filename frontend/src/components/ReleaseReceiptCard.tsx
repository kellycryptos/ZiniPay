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
    <article className="receipt-card p-5 font-mono text-xs text-slate-300 transition-all hover:border-[var(--border-strong)]">
      {/* Receipt Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] text-[11px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[var(--text-muted)] font-mono">RECEIPT</span>
          <span className="font-bold text-white tracking-wider">#ZP-{proposal.id}</span>
          {!isZinipay && (
            <span className="tag-neutral text-[10px]">
              Not a ZiniPay release
            </span>
          )}
          {proposal.simulated && (
            <span className="tag-pending font-bold tracking-wider">
              SIMULATION
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[var(--text-muted)]">{proposal.createdAt}</span>
          <span
            className={
              proposal.status === 'settled' || proposal.status === 'approved'
                ? 'tag-passed'
                : proposal.status === 'rejected'
                ? 'tag-blocked'
                : 'tag-pending'
            }
          >
            {proposal.status.toUpperCase().replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Task Description */}
      <div className="py-3 font-sans">
        <h4 className="font-semibold text-sm text-white tracking-tight leading-snug">{proposal.title}</h4>
        {proposal.summary && (
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed line-clamp-2">
            {proposal.summary}
          </p>
        )}
      </div>

      <div className="ledger-perforation" />

      {/* Monospace Tabular Rows */}
      <div className="flex flex-col gap-2 py-1 text-[11px]">
        {/* Recipient */}
        <div className="ledger-row">
          <span className="text-[var(--text-muted)] tracking-wider">RECIPIENT:</span>
          <div className="flex items-center gap-2 truncate">
            <span className="text-white font-semibold truncate">{proposal.recipient}</span>
            {isZinipay && proposal.settlement.type === 'cross_chain_intent' && (
              <span className="tag-neutral text-[10px]">
                INTENTS → {proposal.settlement.targetChain.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="ledger-row">
          <span className="text-[var(--text-muted)] tracking-wider">AMOUNT:</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{proposal.amountNear} NEAR</span>
            {isZinipay && proposal.settlement.quoteEstimate && (
              <span className="text-[var(--text-secondary)] text-[10px]">({proposal.settlement.quoteEstimate})</span>
            )}
          </div>
        </div>

        {/* Deliverable Evidence */}
        <div className="ledger-row">
          <span className="text-[var(--text-muted)] tracking-wider">DELIVERABLE:</span>
          <span className="text-[var(--text-secondary)] truncate max-w-[240px] sm:max-w-xs" title={proposal.proofCid}>
            {proposal.proofCid ? proposal.proofCid : 'N/A (Standard Sputnik DAO proposal)'}
          </span>
        </div>

        <div className="ledger-perforation" />

        {/* Gate 1: Proof */}
        <div className="ledger-row">
          <span className="text-[var(--text-muted)]">GATE 01 [PROOF]:</span>
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
         * │ Status           │ Gate 01 [Proof]             │ Gate 02 [Policy]          │ Gate 03 [Quorum]          │
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
          <span className="text-[var(--text-muted)]">GATE 02 [POLICY]:</span>
          {!isZinipay ? (
            <span className="tag-neutral">Not a ZiniPay release</span>
          ) : isInProgress ? (
            policyCheck.checking ? (
              <span className="tag-pending">
                <Clock size={10} className="animate-spin inline mr-1" /> Evaluating check_policy view...
              </span>
            ) : policyCheck.status === 'passed' ? (
              <span className="tag-passed">
                <Check size={10} /> PASS · Would pass if executed now
              </span>
            ) : policyCheck.status === 'failed' ? (
              <span className="tag-blocked" title={policyCheck.reason}>
                <X size={10} /> BLOCKED · Would be blocked now: {policyCheck.reason || 'Policy violation'}
              </span>
            ) : (
              <span className="tag-pending">
                Unknown ({policyCheck.reason || 'check_policy view unavailable'})
              </span>
            )
          ) : isApproved ? (
            <span className="tag-passed">
              <Check size={10} /> PASS · Executed on-chain
              {onChainCidUsed === true && ' (cid_used: verified)'}
              {proposal.submissionTime && (
                <span className="text-[var(--text-muted)] text-[10px] ml-1 font-mono">
                  [TS:{proposal.submissionTime.slice(0, 10)}]
                </span>
              )}
            </span>
          ) : isFailed ? (
            <span className="tag-blocked">
              <X size={10} /> FAILED · Release did not execute {proposal.executionError ? `(${proposal.executionError})` : ''}
            </span>
          ) : (
            <span className="tag-neutral">
              Not executed · Proposal {rawStatus.toLowerCase()}
            </span>
          )}
        </div>

        {/* Gate 3: Quorum */}
        <div className="ledger-row">
          <span className="text-[var(--text-muted)]">GATE 03 [QUORUM]:</span>
          {!isZinipay ? (
            <span className="tag-neutral">Not a ZiniPay release</span>
          ) : quorumStatus === 'passed' ? (
            <span className="tag-passed">
              <Check size={10} /> PASSED · Quorum Reached ({proposal.votes.approve}/{proposal.votes.required})
            </span>
          ) : quorumStatus === 'blocked' ? (
            <span className="tag-blocked">
              <X size={10} /> REJECTED · Council Veto
            </span>
          ) : (
            <span className="tag-pending">
              <Clock size={10} /> PENDING · {proposal.votes.approve}/{proposal.votes.required} Council Votes
            </span>
          )}
        </div>

        {/* Attestation Status */}
        <div className="ledger-row">
          <span className="text-[var(--text-muted)]">ATTESTATION:</span>
          {!isZinipay ? (
            <span className="tag-neutral">Not a ZiniPay release</span>
          ) : (
            <span className="tag-pending" title="Attestation hash was provided in proposal description by the proposer and cannot be verified on-chain without an on-chain verifier contract.">
              Claimed in proposal description (not verified on-chain)
            </span>
          )}
        </div>

        {/* Vote Counts */}
        <div className="ledger-row">
          <span className="text-[var(--text-muted)]">VOTES:</span>
          <span className="text-white">
            <strong className="text-[var(--color-passed)]">{proposal.votes.approve} APPROVE</strong> /{' '}
            <strong className="text-[var(--color-blocked)]">{proposal.votes.reject} REJECT</strong> (REQ: {proposal.votes.required})
          </span>
        </div>

        {/* Explorer / Tx Link */}
        <div className="ledger-row pt-1">
          <span className="text-[var(--text-muted)]">TX RECORD:</span>
          {explorerLinkTarget ? (
            <a
              href={explorerLinkTarget}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-passed)] hover:underline flex items-center gap-1"
            >
              <span>{proposal.txHash ? `${proposal.txHash.slice(0, 16)}...` : daoContractId || 'Sputnik DAO'}</span>
              <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[var(--text-muted)]">On-Chain Proposal #{proposal.id}</span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {showActions && (
        <div className="pt-3 mt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
          {/* Secondary Inspection Buttons (Only for ZiniPay releases) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isZinipay && onInspectProof && (
              <button
                type="button"
                onClick={() => onInspectProof(proposal)}
                className="px-2.5 py-1 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] text-[11px] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] transition-colors flex items-center gap-1"
              >
                <FileText size={11} />
                <span>Proof</span>
              </button>
            )}

            {isZinipay && onInspectDeliberation && (
              <button
                type="button"
                onClick={() => onInspectDeliberation(proposal)}
                className="px-2.5 py-1 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] text-[11px] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] transition-colors flex items-center gap-1"
              >
                <Cpu size={11} />
                <span>Deliberation</span>
              </button>
            )}

            {isZinipay && proposal.settlement.type === 'cross_chain_intent' && onExecuteIntent && (
              <button
                type="button"
                onClick={() => onExecuteIntent(proposal)}
                className="px-2.5 py-1 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] text-[11px] text-[var(--color-pending)] border border-[var(--color-pending-border)] transition-colors flex items-center gap-1"
              >
                <Globe size={11} />
                <span>Intents</span>
              </button>
            )}
          </div>

          {/* Voting Actions for Council */}
          {onVote && proposal.status === 'pending_quorum' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onVote(proposal.id, true)}
                className="px-3 py-1 rounded bg-[var(--color-passed-bg)] hover:bg-[rgba(0,236,151,0.18)] text-[var(--color-passed)] border border-[var(--color-passed-border)] font-bold transition-colors flex items-center gap-1 text-[11px]"
              >
                <Check size={12} />
                <span>Vote Approve</span>
              </button>
              <button
                type="button"
                onClick={() => onVote(proposal.id, false)}
                className="px-3 py-1 rounded bg-[var(--color-blocked-bg)] hover:bg-[rgba(255,77,77,0.18)] text-[var(--color-blocked)] border border-[var(--color-blocked-border)] font-bold transition-colors flex items-center gap-1 text-[11px]"
              >
                <X size={12} />
                <span>Vote Reject</span>
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
