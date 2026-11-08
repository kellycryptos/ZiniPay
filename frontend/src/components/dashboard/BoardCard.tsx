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
          ? 'bg-[#181316] border border-red-500/30 hover:border-red-500/60 shadow-lg hover:shadow-red-950/30 text-slate-100'
          : 'bg-[#12141A] border border-white/[0.08] hover:border-white/20 shadow-xl hover:-translate-y-0.5 text-slate-100'
      }`}
    >
      {/* Top Perforation Accent */}
      {!isAttack ? (
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#00EC97] rounded-t-xl opacity-90" />
      ) : (
        <div className="h-1 w-full bg-gradient-to-r from-red-600 to-rose-400 rounded-t-xl opacity-80" />
      )}

      <div className="p-4 flex flex-col gap-3 font-sans">
        {/* ── Top Bar: ID, Tier Badge & Explorer Link ─────────── */}
        <div className="flex items-center justify-between gap-2 border-b pb-2.5 border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                isAttack
                  ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                  : 'bg-white/[0.06] text-slate-200 border border-white/[0.1]'
              }`}
            >
              {isAttack ? card.id : `#ZP-${card.id}`}
            </span>

            {!isAttack && (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Model review: simulated
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Tier Badge */}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                card.tier === 'Gold'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : card.tier === 'Silver'
                  ? 'bg-slate-400/15 text-slate-200 border-slate-400/30'
                  : isAttack
                  ? 'bg-red-900/40 text-red-300 border-red-500/30'
                  : 'bg-orange-500/15 text-orange-300 border-orange-500/30'
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
                    : 'text-slate-400 hover:text-[#00EC97] hover:bg-white/[0.06]'
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
              isAttack ? 'text-red-100' : 'text-white'
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
              : 'bg-white/[0.03] border-white/[0.08] text-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate max-w-[170px]" title={card.recipient}>
            <User size={12} className={isAttack ? 'text-red-400' : 'text-slate-400'} />
            <span className="truncate">{card.recipient}</span>
          </div>

          <div className="font-bold text-sm shrink-0">
            {card.amountNear ? (
              <span className={isAttack ? 'text-red-300' : 'text-[#00EC97]'}>
                {card.amountNear} NEAR
              </span>
            ) : isAttack ? (
              <span className="text-red-400">Unauthorized</span>
            ) : (
              <span className="text-[#00EC97]">0.10 NEAR</span>
            )}
          </div>
        </div>

        {/* ── PR Link / Deliverable Proof CID ─────────────────── */}
        <div className="flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1 text-[var(--text-secondary)] truncate max-w-[210px]">
            <GitPullRequest size={12} className={isAttack ? 'text-red-400' : 'text-[#00EC97]'} />
            {card.prUrl ? (
              <a
                href={card.prUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`hover:underline truncate ${
                  isAttack ? 'text-red-300' : 'text-[#00EC97] font-medium'
                }`}
              >
                {card.prTitle || 'GitHub PR'}
              </a>
            ) : (
              <span className={`truncate ${isAttack ? 'text-red-300' : 'text-slate-400'}`}>
                {isAttack ? card.deliverable || 'Deliverable' : card.proofCid ? `${card.proofCid.slice(0, 20)}...` : 'Deliverable'}
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
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono">
            {card.status === 'approved_paid' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 size={11} className="text-[#00EC97]" />
                PAID ON-CHAIN (2/2 Council)
              </span>
            ) : card.status === 'awaiting_council' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                <Clock size={11} className="text-amber-400" />
                AWAITING 2-OF-2 COUNCIL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-500/30">
                <ShieldCheck size={11} className="text-blue-400" />
                PROPOSED BY AGENT
              </span>
            )}

            {card.votes && (
              <span className="text-[10px] text-slate-400 font-bold">
                {card.votes.approve} / {card.votes.required} Votes
              </span>
            )}
          </div>
        )}

        {/* ── Council Vote Actions (if authorized council wallet) ── */}
        {!isAttack && canVote && card.status === 'awaiting_council' && (
          <div
            className="pt-2 border-t border-white/[0.08] flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onVoteApprove}
              className="flex-1 py-1 px-2 rounded bg-[#00EC97] hover:bg-[#00EC97]/90 text-black font-mono text-[11px] font-semibold text-center transition-colors cursor-pointer"
            >
              Vote Approve
            </button>
            <button
              type="button"
              onClick={onVoteReject}
              className="py-1 px-2 rounded bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
