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
  const isApprovedPaid = !isAttack && card.status === 'approved_paid';

  return (
    <div
      onClick={onInspect}
      className={`relative w-full rounded-xl transition-all duration-200 cursor-pointer text-left select-none group p-4 flex flex-col gap-3 font-sans ${
        isAttack
          ? 'bg-[#181113]/90 border border-red-500/30 border-l-2 border-l-rose-500 hover:border-red-500/60 shadow-lg text-slate-100'
          : isApprovedPaid
          ? 'bg-[#111C18] border border-slate-800/80 border-l-2 border-l-emerald-400 hover:border-emerald-500/50 shadow-md text-slate-100'
          : 'bg-[#0F1715]/90 border border-slate-800/80 hover:border-slate-700 shadow-md text-slate-100'
      }`}
    >
      {/* ── Top Bar: ID, Tier Badge & Explorer Link ───────────── */}
      <div className="flex items-center justify-between gap-2 border-b pb-2.5 border-slate-800/70">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
              isAttack
                ? 'bg-red-950/80 text-rose-300 border border-red-500/40'
                : 'bg-slate-800/60 text-slate-200 border border-slate-700/60'
            }`}
          >
            {isAttack ? card.id : `#ZP-${card.id}`}
          </span>

          {isAttack && (card.id === '#CHECK-1' || !card.txHash || card.blockedBy.toLowerCase().includes('pre-chain')) ? (
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-red-950/80 text-rose-300 border border-red-500/40">
              Pre-chain check
            </span>
          ) : !isAttack ? (
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Model: simulated
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Tier Badge */}
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
              card.tier === 'Gold'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : card.tier === 'Silver'
                ? 'bg-slate-400/15 text-slate-200 border-slate-400/30'
                : isAttack
                ? 'bg-red-900/40 text-rose-300 border-red-500/30'
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
              className={`p-1 rounded-md transition-colors ${
                isAttack
                  ? 'text-rose-400 hover:text-white hover:bg-red-950/60'
                  : 'text-slate-400 hover:text-[#00E599] hover:bg-emerald-950/40'
              }`}
              title="Inspect on NEARBlocks"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* ── Title / Deliverable ───────────────────────────────── */}
      <div>
        <h3
          className={`font-semibold text-xs leading-snug line-clamp-2 ${
            isAttack ? 'text-rose-100' : 'text-white'
          }`}
        >
          {isAttack ? card.vector : card.title}
        </h3>
      </div>

      {/* ── Financial Amount & Recipient ──────────────────────── */}
      <div
        className={`p-2.5 rounded-lg border flex items-center justify-between font-mono text-xs ${
          isAttack
            ? 'bg-red-950/30 border-red-500/20 text-rose-200'
            : 'bg-[#070D0C]/80 border-slate-800/80 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={card.recipient}>
          <User size={12} className={isAttack ? 'text-rose-400 shrink-0' : 'text-slate-400 shrink-0'} />
          <span className="truncate">{card.recipient}</span>
        </div>

        <div className="font-bold text-xs shrink-0">
          {card.amountNear ? (
            <span className={isAttack ? 'text-rose-300' : 'text-[#00E599]'}>
              {card.amountNear} NEAR
            </span>
          ) : isAttack ? (
            <span className="text-rose-300/80 font-mono text-[11px]">
              {card.id === '#CHECK-1' ? 'Pre-Chain' : 'Blocked Call'}
            </span>
          ) : (
            <span className="text-[#00E599]">0.10 NEAR</span>
          )}
        </div>
      </div>

      {/* ── PR Link / Deliverable Proof CID ───────────────────── */}
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[220px]">
          <GitPullRequest size={12} className={isAttack ? 'text-rose-400' : 'text-[#00E599]'} />
          {card.prUrl ? (
            <a
              href={card.prUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`hover:underline truncate ${
                isAttack ? 'text-rose-300' : 'text-[#00E599] font-medium'
              }`}
            >
              {card.prTitle || 'GitHub PR'}
            </a>
          ) : (
            <span className={`truncate ${isAttack ? 'text-rose-300' : 'text-slate-400'}`}>
              {isAttack ? card.deliverable || 'Deliverable' : card.proofCid ? `${card.proofCid.slice(0, 22)}...` : 'Deliverable'}
            </span>
          )}
        </div>
      </div>

      {/* ── Attack Rejection / Council Vote Stamp ─────────────── */}
      {isAttack ? (
        <div className="pt-2 border-t border-red-500/20 flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/80 text-rose-300 border border-red-500/30 text-[10px] font-bold shadow-[0_0_8px_rgba(239,68,68,0.2)]">
              BLOCKED ON-CHAIN
            </span>
            <span className="text-[10px] text-rose-300/80 font-mono truncate max-w-[180px]" title={card.blockedBy}>
              {card.blockedBy}
            </span>
          </div>
          <p className="text-[11px] text-rose-100 font-mono bg-red-950/60 p-2.5 rounded-lg border border-red-500/30 leading-relaxed break-words">
            {card.rejectionReason}
          </p>
        </div>
      ) : (
        <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono">
          {card.status === 'approved_paid' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-[#00E599] border border-emerald-500/30 shadow-[0_0_8px_rgba(0,229,153,0.15)]">
              <CheckCircle2 size={11} className="text-[#00E599]" />
              PAID ON-CHAIN (2/2 Council)
            </span>
          ) : card.status === 'awaiting_council' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
              <Clock size={11} className="text-amber-400" />
              AWAITING 2-OF-2 COUNCIL
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-500/30">
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
          className="pt-2 border-t border-slate-800/70 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onVoteApprove}
            className="flex-1 py-1.5 px-3 rounded-lg bg-[#00E599] hover:bg-[#00ffaa] text-black font-mono text-[11px] font-bold text-center transition-colors cursor-pointer shadow-[0_0_12px_rgba(0,229,153,0.3)]"
          >
            Vote Approve
          </button>
          <button
            type="button"
            onClick={onVoteReject}
            className="py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
