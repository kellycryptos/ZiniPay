import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Filter,
  Search,
  Activity,
  ArrowUpRight,
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
        return 'bg-emerald-950/50 text-[#00EC97] border-emerald-500/30';
      case 'Settled':
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-500/40';
      case 'Pending':
        return 'bg-amber-950/50 text-amber-300 border-amber-500/30';
      case 'Rejected':
        return 'bg-red-950/60 text-red-300 border-red-500/40';
      case 'Replay Blocked':
        return 'bg-rose-950/70 text-rose-300 border-rose-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-4 shadow-lg w-full">
      {/* ── Header & Filter Bar ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
            <Activity size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-white text-base">On-Chain Activity Feed</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Verified testnet events from Sputnik DAO v2 and PolicyHelper.
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'Approved', 'Settled', 'Pending', 'Rejected', 'Replay Blocked'].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setFilterBadge(b)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                filterBadge === b
                  ? 'bg-white text-black font-semibold'
                  : 'bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]'
              }`}
            >
              {b === 'all' ? 'All Events' : b}
            </button>
          ))}
        </div>
      </div>

      {/* ── Activity Ledger List ─────────────────────────────── */}
      <div className="flex flex-col divide-y divide-[var(--border-subtle)] font-sans">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
            No activity matches the selected filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-white/[0.015] px-2 rounded-lg transition-colors group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`mt-0.5 shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getBadgeStyle(
                    item.badge
                  )}`}
                >
                  {item.badge}
                </span>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-white">{item.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* NEARBlocks Explorer Link */}
              {item.explorerUrl && (
                <a
                  href={item.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-canvas)] hover:bg-[#1E232F] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors"
                  title="Inspect on NEARBlocks Testnet Explorer"
                >
                  <span className="truncate max-w-[90px] sm:max-w-[110px]">
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
