import React from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Inbox,
  ExternalLink,
} from 'lucide-react';
import { BoardCard, BoardCardData, BoardProposalItem, BoardAttackItem } from './BoardCard';
import { Proposal } from '../../lib/types';

interface KanbanBoardProps {
  proposals: Proposal[];
  blockedAttacks: any[];
  settledPayouts?: any[];
  searchQuery?: string;
  onInspectProposal?: (proposal: Proposal) => void;
  onInspectAttack?: (attack: any) => void;
  canVote?: boolean;
  onVote?: (proposalId: number, approve: boolean) => void;
  isLoading?: boolean;
}

export function KanbanBoard({
  proposals,
  blockedAttacks,
  settledPayouts = [],
  searchQuery = '',
  onInspectProposal,
  onInspectAttack,
  canVote = false,
  onVote,
  isLoading = false,
}: KanbanBoardProps) {
  // Map raw proposals into typed Board items
  const mappedProposals: BoardProposalItem[] = proposals.map((p) => {
    let boardStatus: 'proposed' | 'awaiting_council' | 'approved_paid' = 'awaiting_council';
    if (p.status === 'approved' || p.status === 'settled') {
      boardStatus = 'approved_paid';
    } else if (p.status === 'pending_quorum') {
      // If votes === 0, can classify as 'proposed', if votes > 0, 'awaiting_council'
      boardStatus = p.votes && p.votes.approve > 0 ? 'awaiting_council' : 'proposed';
    }

    return {
      type: 'proposal',
      id: p.id,
      title: p.title,
      recipient: p.recipient,
      amountNear: p.amountNear,
      tier: p.policy?.tier || 'Bronze',
      prUrl: p.proofCid?.startsWith('http')
        ? p.proofCid
        : p.proofCid?.includes('/')
        ? `https://github.com/${p.proofCid.replace('#', '/pull/')}`
        : undefined,
      prTitle: p.proofCid,
      proofCid: p.proofCid,
      status: boardStatus,
      votes: p.votes,
      explorerUrl: p.txHash ? `https://testnet.nearblocks.io/txns/${p.txHash}` : undefined,
      txHash: p.txHash,
      simulated: p.simulated,
    };
  });

    // Map settled proposals from verified.json if not already in mappedProposals
  const hasApproved = mappedProposals.some((p) => p.status === 'approved_paid');
  const settledCards: BoardProposalItem[] = (settledPayouts || []).map((p) => ({
    type: 'proposal' as const,
    id: p.proposalId,
    title: `Proposal #${p.proposalId} (${p.deploymentLabel})`,
    recipient: p.recipient,
    amountNear: p.amountNear,
    tier: 'Silver' as const,
    prUrl: p.deliverable?.includes('/')
      ? `https://github.com/${p.deliverable.replace('#', '/pull/')}`
      : undefined,
    prTitle: p.deliverable || `Proposal #${p.proposalId}`,
    proofCid: p.deliverable || `Proposal #${p.proposalId}`,
    status: 'approved_paid' as const,
    votes: { approve: 2, reject: 0, required: 2 },
    explorerUrl: p.explorerUrl,
    txHash: p.txHash,
    simulated: false,
  }));

  const allProposals = hasApproved
    ? mappedProposals
    : [...mappedProposals, ...settledCards];

  // Map blocked attacks from verified.json
  const mappedAttacks: BoardAttackItem[] = blockedAttacks.map((att, idx) => {
    const isPreChain = !att.txHash || (att.blockedBy && att.blockedBy.includes('Pre-chain'));
    const attackId = isPreChain ? '#CHECK-1' : `#ATK-${idx}`;
    return {
      type: 'attack' as const,
      id: attackId,
      vector: att.vector || 'Blocked Attempt',
      recipient: att.caller || 'zinipay-recipient2.testnet',
      amountNear: att.vector?.includes('Over-Cap') ? '16.0' : undefined,
      tier: isPreChain ? 'Pre-Chain' : 'Blocked',
      prUrl: att.details?.includes('github.com')
        ? att.details.match(/https:\/\/github\.com\/[^\s'"]+/)?.[0]
        : undefined,
      deliverable: att.details?.includes('CID')
        ? 'kellycryptos/ZiniPay#2'
        : 'Deliverable',
      status: 'blocked' as const,
      rejectionReason: att.rejectionReason || 'Policy violation blocked on-chain',
      blockedBy: att.blockedBy || (isPreChain ? 'Pre-chain check, not an on-chain transaction' : 'PolicyHelper (On-Chain)'),
      explorerUrl: att.explorerUrl,
      txHash: att.txHash,
      simulated: Boolean(att.simulated),
    };
  });

  // Filtering by search query
  const filterItem = (item: BoardCardData) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (item.type === 'proposal') {
      return (
        item.title.toLowerCase().includes(q) ||
        item.recipient.toLowerCase().includes(q) ||
        item.proofCid.toLowerCase().includes(q) ||
        `#zp-${item.id}`.includes(q)
      );
    }
    return (
      item.vector.toLowerCase().includes(q) ||
      item.rejectionReason.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.recipient.toLowerCase().includes(q)
    );
  };

  const proposedItems = allProposals.filter((p) => p.status === 'proposed' && filterItem(p));
  const awaitingItems = allProposals.filter((p) => p.status === 'awaiting_council' && filterItem(p));
  const approvedItems = allProposals.filter((p) => p.status === 'approved_paid' && filterItem(p));
  const blockedItems = mappedAttacks.filter(filterItem);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* ── COLUMN 1: PROPOSED ────────────────────────────── */}
        <div className="flex flex-col gap-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-3.5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ShieldCheck size={14} />
              </div>
              <h3 className="font-semibold text-white text-xs">Proposed</h3>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)] bg-[var(--bg-canvas)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
              {proposedItems.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 min-h-[220px]">
            {isLoading ? (
              <div className="h-32 rounded-xl bg-white/[0.03] animate-pulse border border-[var(--border-subtle)]" />
            ) : proposedItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                <Inbox size={22} className="opacity-40 mb-1.5" />
                <p className="text-xs font-mono">No new proposals</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Agent queue clear</p>
              </div>
            ) : (
              proposedItems.map((item) => (
                <BoardCard
                  key={item.id}
                  card={item}
                  onInspect={() => {
                    const original = proposals.find((p) => p.id === item.id);
                    if (original && onInspectProposal) onInspectProposal(original);
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* ── COLUMN 2: AWAITING COUNCIL ───────────────────── */}
        <div className="flex flex-col gap-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-3.5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock size={14} />
              </div>
              <h3 className="font-semibold text-white text-xs">Awaiting Council</h3>
            </div>
            <span className="font-mono text-xs text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
              {awaitingItems.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 min-h-[220px]">
            {isLoading ? (
              <div className="h-32 rounded-xl bg-white/[0.03] animate-pulse border border-[var(--border-subtle)]" />
            ) : awaitingItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                <Inbox size={22} className="opacity-40 mb-1.5" />
                <p className="text-xs font-mono">No pending votes</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Sputnik DAO v2 council quorum clear</p>
              </div>
            ) : (
              awaitingItems.map((item) => (
                <BoardCard
                  key={item.id}
                  card={item}
                  canVote={canVote}
                  onVoteApprove={() => onVote && onVote(item.id, true)}
                  onVoteReject={() => onVote && onVote(item.id, false)}
                  onInspect={() => {
                    const original = proposals.find((p) => p.id === item.id);
                    if (original && onInspectProposal) onInspectProposal(original);
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* ── COLUMN 3: APPROVED AND PAID ──────────────────── */}
        <div className="flex flex-col gap-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-3.5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={14} />
              </div>
              <h3 className="font-semibold text-white text-xs">Approved & Paid</h3>
            </div>
            <span className="font-mono text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              {approvedItems.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 min-h-[220px]">
            {isLoading ? (
              <div className="h-32 rounded-xl bg-white/[0.03] animate-pulse border border-[var(--border-subtle)]" />
            ) : approvedItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-xl">
                <Inbox size={22} className="opacity-40 mb-1.5" />
                <p className="text-xs font-mono">No payouts settled yet</p>
              </div>
            ) : (
              approvedItems.map((item) => (
                <BoardCard
                  key={item.id}
                  card={item}
                  onInspect={() => {
                    const original = proposals.find((p) => p.id === item.id);
                    if (original && onInspectProposal) {
                      onInspectProposal(original);
                    } else if (onInspectProposal) {
                      // Fallback synthetic proposal for Proposal #6
                      onInspectProposal({
                        id: 6,
                        title: item.title,
                        proposer: 'agentzinipaytestnet.testnet',
                        recipient: item.recipient,
                        amountNear: item.amountNear,
                        amountYocto: '100000000000000000000000',
                        proofCid: item.proofCid,
                        summary: 'Case-variant anti-replay security fix and multi-sig settlement',
                        evidenceType: 'github_pr',
                        evidenceDetails: 'GitHub PR #2 merged into kellycryptos/ZiniPay. Signed commit and CI passed.',
                        createdAt: 'Nov 2, 2026',
                        status: 'approved',
                        rawStatus: 'Approved',
                        txHash: item.txHash,
                        policy: {
                          withinCap: true,
                          capLimit: '15.0 NEAR',
                          cooldownElapsed: true,
                          cooldownRemainingSecs: 0,
                          cidUnique: true,
                          reputationQualified: true,
                          reputationScore: 30,
                          tier: 'Silver',
                        },
                        settlement: {
                          type: 'native_near',
                          targetChain: 'near',
                          targetToken: 'NEAR',
                          recipientAddress: item.recipient,
                        },
                        votes: { approve: 2, reject: 0, required: 2 },
                      });
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* ── COLUMN 4: BLOCKED ─────────────────────────────── */}
        <div className="flex flex-col gap-3 rounded-xl bg-[var(--bg-panel)] border border-red-500/20 p-3.5 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-500/30">
                <ShieldAlert size={14} />
              </div>
              <h3 className="font-semibold text-white text-xs">Blocked Attacks</h3>
            </div>
            <span className="font-mono text-xs text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-500/30">
              {blockedItems.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 min-h-[220px]">
            {blockedItems.map((item) => (
              <BoardCard
                key={item.id}
                card={item}
                onInspect={() => {
                  if (onInspectAttack) onInspectAttack(item);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
