import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  badge: 'Pending' | 'Approved' | 'Settled' | 'Rejected' | 'Replay Blocked';
  txHash?: string;
  explorerUrl?: string;
  kind?: string;
}

interface ActivityFeedProps {
  verifiedTxs?: any[];
  liveActivities?: any[];
  network?: 'testnet' | 'mainnet';
}

export function ActivityFeed({
  verifiedTxs = [],
  liveActivities = [],
  network = 'testnet',
}: ActivityFeedProps) {
  const [filterBadge, setFilterBadge] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const explorerBase =
    network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  // Map verified transactions dynamically from verified.json
  const mappedVerified: ActivityFeedItem[] = (verifiedTxs || []).map((tx: any) => {
    let badge: ActivityFeedItem['badge'] = 'Settled';
    if (tx.kind === 'blocked_attack') {
      badge = tx.label?.toLowerCase().includes('replay') ? 'Replay Blocked' : 'Rejected';
    } else if (tx.kind === 'proposal_creation' || tx.kind === 'admin_proposal_creation') {
      badge = 'Pending';
    } else if (tx.label?.includes('VoteApprove') || tx.label?.includes('Approval')) {
      badge = 'Approved';
    } else if (tx.kind === 'payout' || tx.kind === 'admin_execution') {
      badge = 'Settled';
    }

    const formattedTime = tx.timestamp
      ? new Date(tx.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        }) + ' UTC'
      : 'Nov 2, 2026';

    return {
      id: `tx-${tx.index}`,
      timestamp: formattedTime,
      title: tx.label,
      description: tx.description || (tx.kind === 'blocked_attack' ? 'Invariant violation blocked on-chain.' : `Confirmed on NEAR Testnet via Sputnik DAO v2.`),
      badge,
      txHash: tx.txHash,
      explorerUrl: tx.explorerUrl || (tx.txHash ? `${explorerBase}/txns/${tx.txHash}` : undefined),
    };
  }).reverse();

  // Merge any live user action activities to the top
  const combinedItems: ActivityFeedItem[] = [
    ...liveActivities.map((act, i) => ({
      id: act.id || `live-${i}`,
      timestamp: act.timestamp || 'Just now',
      title: act.title,
      description: act.description,
      badge: (act.badge?.includes('Approve')
        ? 'Approved'
        : act.badge?.includes('Reject')
        ? 'Rejected'
        : 'Pending') as ActivityFeedItem['badge'],
      txHash: act.txHash,
      explorerUrl: act.txHash ? `${explorerBase}/txns/${act.txHash}` : undefined,
    })),
    ...mappedVerified,
  ];

  // Filtering
  const filtered = combinedItems.filter((item) => {
    if (filterBadge !== 'all' && item.badge !== filterBadge) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q) ||
        (item.txHash && item.txHash.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getBadgeStyle = (b: ActivityFeedItem['badge']) => {
    switch (b) {
      case 'Approved':
        return 'bg-emerald-950/70 text-[#00E599] border-emerald-500/30 shadow-[0_0_8px_rgba(0,229,153,0.15)]';
      case 'Settled':
        return 'bg-teal-950/70 text-teal-300 border-teal-500/30 shadow-[0_0_8px_rgba(45,212,191,0.15)]';
      case 'Pending':
        return 'bg-amber-950/70 text-amber-300 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
      case 'Rejected':
        return 'bg-red-950/70 text-rose-300 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]';
      case 'Replay Blocked':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-[#0F1815]/90 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5 shadow-lg backdrop-blur-md w-full">
      
      {/* ── Header & Pill-Shaped Filter Bar ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/70 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#00E599] shadow-[0_0_12px_rgba(0,229,153,0.2)]">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight">On-Chain Activity Feed</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified testnet events from Sputnik DAO v2 and PolicyHelper.
            </p>
          </div>
        </div>

        {/* Pill-Shaped Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'Approved', 'Settled', 'Pending', 'Rejected', 'Replay Blocked'].map((b) => {
            const isActive = filterBadge === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setFilterBadge(b)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#00E599] text-slate-950 font-bold shadow-[0_0_12px_rgba(0,229,153,0.35)]'
                    : 'bg-[#070D0C]/90 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {b === 'all' ? 'All Events' : b}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Activity Ledger List ─────────────────────────────── */}
      <div className="flex flex-col divide-y divide-slate-800/60 font-sans">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            No activity matches the selected filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-500/[0.02] px-2.5 rounded-xl transition-colors group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`mt-0.5 shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getBadgeStyle(
                    item.badge
                  )}`}
                >
                  {item.badge}
                </span>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-white">{item.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* NEARBlocks Explorer Link Pill */}
              {item.explorerUrl && (
                <a
                  href={item.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#070D0C] hover:bg-slate-800/60 border border-slate-800/80 text-[11px] font-mono text-slate-300 hover:text-[#00E599] hover:border-emerald-500/40 transition-colors shadow-inner"
                  title="Inspect on NEARBlocks Testnet Explorer"
                >
                  <span className="truncate max-w-[95px] sm:max-w-[120px]">
                    {item.txHash?.slice(0, 8)}...{item.txHash?.slice(-6)}
                  </span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
