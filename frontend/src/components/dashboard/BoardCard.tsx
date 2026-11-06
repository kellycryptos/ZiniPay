import React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  GitPullRequest,
  Clock,
  CheckCircle2,
  Lock,
  FileText,
  User,
  AlertTriangle,
} from 'lucide-react';

export interface BoardProposalItem {
  type: 'proposal';
  id: number;
  title: string;
  recipient: string;
  amountNear: string;
  tier: 'Bronze' | 'Silver' | 'Gold';
  prUrl?: string;
  prTitle?: string;
  proofCid: string;
  status: 'proposed' | 'awaiting_council' | 'approved_paid';
  votes?: {
    approve: number;
    reject: number;
    required: number;
  };
  explorerUrl?: string;
  txHash?: string;
  simulated?: boolean;
}

export interface BoardAttackItem {
  type: 'attack';
  id: string;
  vector: string;
  recipient: string;
  amountNear?: string;
  tier?: string;
  prUrl?: string;
  prTitle?: string;
  deliverable?: string;
  status: 'blocked';
  rejectionReason: string;
  blockedBy: string;
  explorerUrl?: string;
  txHash?: string;
  simulated?: boolean;
}

export type BoardCardData = BoardProposalItem | BoardAttackItem;

interface BoardCardProps {
  card: BoardCardData;
  onInspect?: () => void;
  canVote?: boolean;
  onVoteApprove?: () => void;
  onVoteReject?: () => void;
}

export function BoardCard({
  card,
  onInspect,
  canVote,
  onVoteApprove,
  onVoteReject,
}: BoardCardProps) {
  const isAttack = card.type === 'attack';

  return (
    <div
      onClick={onInspect}
      className={`relative w-full rounded-xl transition-all duration-200 cursor-pointer text-left select-none group ${
        isAttack
          ? 'bg-[#181316] border border-red-500/30 hover:border-red-500/60 shadow-lg hover:shadow-red-950/30'
          : 'bg-[#FCFCFE] text-[#0F172A] border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xl hover:-translate-y-0.5'
      }`}
    >
      {/* Paper Top Perforation Accent (for paper-on-dark-desk receipt look) */}
      {!isAttack && (
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#00EC97] rounded-t-xl opacity-90" />
      )}
      {isAttack && (
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-rose-400 rounded-t-xl opacity-80" />
      )}

      <div className="p-4 flex flex-col gap-3 font-sans">
        {/* ── Top Bar: ID, Tier Badge & Explorer Link ─────────── */}
        <div className="flex items-center justify-between gap-2 border-b pb-2.5 border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                isAttack
                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              {isAttack ? card.id : `#ZP-${card.id}`}
            </span>

            {card.simulated && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                [SIMULATION]
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Tier Badge */}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                card.tier === 'Gold'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                  : card.tier === 'Silver'
                  ? 'bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-200'
                  : isAttack
                  ? 'bg-red-900/40 text-red-300 border border-red-500/30'
                  : 'bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-950/60 dark:text-orange-300'
              }`}
            >
              {card.tier || 'Testnet'}
            </span>

            {/* Explorer Link */}
            {card.explorerUrl && (
              <a
                href={card.explorerUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`p-1 rounded transition-colors ${
                  isAttack
                    ? 'text-red-400 hover:text-white hover:bg-red-950/60'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Inspect on NEARBlocks"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        {/* ── Title / Deliverable ─────────────────────────────── */}
        <div>
          <h3
            className={`font-semibold text-xs leading-snug line-clamp-2 ${
              isAttack ? 'text-red-100' : 'text-slate-900'
            }`}
          >
            {isAttack ? card.vector : card.title}
          </h3>
        </div>

        {/* ── Financial Amount & Recipient ────────────────────── */}
        <div
          className={`p-2.5 rounded-lg border flex items-center justify-between font-mono text-xs ${
            isAttack
              ? 'bg-red-950/30 border-red-500/20 text-red-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate max-w-[170px]" title={card.recipient}>
            <User size={12} className={isAttack ? 'text-red-400' : 'text-slate-500'} />
            <span className="truncate">{card.recipient}</span>
          </div>

          <div className="font-bold text-sm shrink-0">
            {card.amountNear ? `${card.amountNear} NEAR` : isAttack ? 'Unauthorized' : '0.10 NEAR'}
          </div>
        </div>

        {/* ── PR Link / Deliverable Proof CID ─────────────────── */}
        <div className="flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1 text-[var(--text-secondary)] truncate max-w-[210px]">
            <GitPullRequest size={12} className={isAttack ? 'text-red-400' : 'text-emerald-600'} />
            {card.prUrl ? (
              <a
                href={card.prUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`hover:underline truncate ${
                  isAttack ? 'text-red-300' : 'text-emerald-700 font-medium'
                }`}
              >
                {card.prTitle || 'GitHub PR'}
              </a>
            ) : (
              <span className={`truncate ${isAttack ? 'text-red-300' : 'text-slate-600'}`}>
                {isAttack ? card.deliverable || 'Deliverable' : card.proofCid.slice(0, 20) + '...'}
              </span>
            )}
          </div>
        </div>

        {/* ── Attack Rejection / Council Vote Stamp ───────────── */}
        {isAttack ? (
          <div className="pt-2 border-t border-red-500/20 flex flex-col gap-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-red-400 font-semibold uppercase tracking-wider text-[10px]">
                BLOCKED ON-CHAIN
              </span>
              <span className="text-[10px] text-red-300/70 font-mono">
                {card.blockedBy.split(' ')[0]}
              </span>
            </div>
            <p className="text-[10px] text-red-200 font-mono bg-red-950/50 p-1.5 rounded border border-red-500/30 line-clamp-2">
              {card.rejectionReason}
            </p>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono">
            {card.status === 'approved_paid' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 size={11} className="text-emerald-600" />
                PAID ON-CHAIN (2/2 Council)
              </span>
            ) : card.status === 'awaiting_council' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <Clock size={11} className="text-amber-600" />
                AWAITING 2-OF-2 COUNCIL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                <ShieldCheck size={11} className="text-blue-600" />
                PROPOSED BY AGENT
              </span>
            )}

            {card.votes && (
              <span className="text-[10px] text-slate-500 font-bold">
                {card.votes.approve} / {card.votes.required} Votes
              </span>
            )}
          </div>
        )}

        {/* ── Council Vote Actions (if authorized council wallet) ── */}
        {!isAttack && canVote && card.status === 'awaiting_council' && (
          <div
            className="pt-2 border-t border-slate-200 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onVoteApprove}
              className="flex-1 py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-semibold text-center transition-colors cursor-pointer"
            >
              Vote Approve
            </button>
            <button
              type="button"
              onClick={onVoteReject}
              className="py-1 px-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
