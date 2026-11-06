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

  // Build items list from verified transactions in verified.json
  const defaultItems: ActivityFeedItem[] = [
    {
      id: 'tx-14',
      timestamp: 'Nov 2, 2026 · 14:55 UTC',
      title: 'Council 2 VoteApprove & Execution (Admin Proposal #7)',
      description: 'Sputnik DAO v2 council 2-of-2 quorum reached. FunctionCall executed update_reputation on PolicyHelper.',
      badge: 'Approved',
      txHash: '3xqHqNnvstR7uTFdV1cvpajw7BSPAxMXLgRLRyBZUYkw',
      explorerUrl: 'https://testnet.nearblocks.io/txns/3xqHqNnvstR7uTFdV1cvpajw7BSPAxMXLgRLRyBZUYkw',
    },
    {
      id: 'tx-13',
      timestamp: 'Nov 2, 2026 · 14:54 UTC',
      title: 'Council 1 VoteApprove (Admin Proposal #7)',
      description: 'Council member zinipay-c1.testnet voted Approve on Sputnik DAO proposal #7.',
      badge: 'Approved',
      txHash: 'Cs4sLs72XeLiv5yAG8qnTHJVXDfkV7e1tg46pyoK6Vk8',
      explorerUrl: 'https://testnet.nearblocks.io/txns/Cs4sLs72XeLiv5yAG8qnTHJVXDfkV7e1tg46pyoK6Vk8',
    },
    {
      id: 'tx-12',
      timestamp: 'Nov 2, 2026 · 14:54 UTC',
      title: 'DAO Proposal #7 Creation (Admin: update_reputation)',
      description: 'Council member dispatched proposal #7 to update recipient reputation through DAO multi-sig.',
      badge: 'Pending',
      txHash: '73JaSgQv8G51VdKTPnYwVasWFogd3EvDDzCr1dx6VJix',
      explorerUrl: 'https://testnet.nearblocks.io/txns/73JaSgQv8G51VdKTPnYwVasWFogd3EvDDzCr1dx6VJix',
    },
    {
      id: 'tx-11',
      timestamp: 'Nov 2, 2026 · 14:53 UTC',
      title: 'Blocked Admin: Former Owner Unburn Rejected',
      description: 'Original deployer attempted unburn_cid after ownership transfer. Transaction rejected with WasmTrap.',
      badge: 'Rejected',
      txHash: 'EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14',
      explorerUrl: 'https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14',
    },
    {
      id: 'tx-10',
      timestamp: 'Nov 2, 2026 · 14:52 UTC',
      title: 'PolicyHelper Contract Ownership Transferred to Sputnik DAO',
      description: 'Full contract ownership transferred to zinipay-demo.sputnikv2.testnet on NEAR testnet.',
      badge: 'Settled',
      txHash: 'BmUTUzULrCCNDK1GTpwmq5QMLgvwPbFjGAjDjVnwZwJX',
      explorerUrl: 'https://testnet.nearblocks.io/txns/BmUTUzULrCCNDK1GTpwmq5QMLgvwPbFjGAjDjVnwZwJX',
    },
    {
      id: 'tx-9',
      timestamp: 'Nov 2, 2026 · 14:48 UTC',
      title: 'Blocked Attack 5: Cooldown Violation',
      description: 'Payout requested within 60-second cooldown window. Blocked on-chain: 16 seconds remaining.',
      badge: 'Rejected',
      txHash: '2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD',
      explorerUrl: 'https://testnet.nearblocks.io/txns/2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD',
    },
    {
      id: 'tx-8',
      timestamp: 'Nov 2, 2026 · 14:48 UTC',
      title: 'Blocked Attack 4: Case-Variant CID Replay',
      description: 'Attempted release using uppercase deliverable KELLYCRYPTOS/ZINIPAY#2. Canonicalizer trap blocked.',
      badge: 'Replay Blocked',
      txHash: 'EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y',
      explorerUrl: 'https://testnet.nearblocks.io/txns/EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y',
    },
    {
      id: 'tx-7',
      timestamp: 'Nov 2, 2026 · 14:48 UTC',
      title: 'Blocked Attack 3: Unauthorized Caller',
      description: 'Agent caller agentzinipaytestnet.testnet attempted direct release(). Blocked: Only owner/DAO permitted.',
      badge: 'Rejected',
      txHash: '2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B',
      explorerUrl: 'https://testnet.nearblocks.io/txns/2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B',
    },
    {
      id: 'tx-6',
      timestamp: 'Nov 2, 2026 · 14:48 UTC',
      title: 'Blocked Attack 2: Over-Cap Spend (16 NEAR)',
      description: 'Attempted 16.0 NEAR release exceeding effective Silver tier cap (15.0 NEAR). Contract panic trap.',
      badge: 'Rejected',
      txHash: 'EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
      explorerUrl: 'https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
    },
    {
      id: 'tx-5',
      timestamp: 'Nov 2, 2026 · 14:48 UTC',
      title: 'Blocked Attack 1: Replay Deliverable CID',
      description: 'Attempted replay of deliverable kellycryptos/ZiniPay#2. Blocked: CID already used.',
      badge: 'Replay Blocked',
      txHash: '9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb',
      explorerUrl: 'https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb',
    },
    {
      id: 'tx-4',
      timestamp: 'Nov 2, 2026 · 14:48 UTC',
      title: 'Council Promotion to Silver Tier (25 pts)',
      description: 'Contributor reputation updated to Silver tier (score >= 20), unlocking 1.5x cap scale.',
      badge: 'Settled',
      txHash: 'DfpR26Q4qgoXw1oBh481vBkizypsrME6HLwjHj3gKvYf',
      explorerUrl: 'https://testnet.nearblocks.io/txns/DfpR26Q4qgoXw1oBh481vBkizypsrME6HLwjHj3gKvYf',
    },
    {
      id: 'tx-3',
      timestamp: 'Nov 2, 2026 · 14:47 UTC',
      title: 'Council 2 VoteApprove & Execution (Proposal #6)',
      description: 'Sputnik DAO 2-of-2 human quorum achieved. 0.10 NEAR transferred on-chain to zinipay-recipient2.testnet.',
      badge: 'Settled',
      txHash: '2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
      explorerUrl: 'https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d',
    },
    {
      id: 'tx-2',
      timestamp: 'Nov 2, 2026 · 14:47 UTC',
      title: 'Council 1 VoteApprove (Proposal #6)',
      description: 'Council member zinipay-c1.testnet approved proposal #6 on Sputnik DAO v2.',
      badge: 'Approved',
      txHash: '22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD',
      explorerUrl: 'https://testnet.nearblocks.io/txns/22HTUkeVM6nA3k4vrwYfojpMDhVi8Lcj4z2fGzETaepD',
    },
    {
      id: 'tx-1',
      timestamp: 'Nov 2, 2026 · 14:47 UTC',
      title: 'Proposal #6 Creation (Agent Dispatched)',
      description: 'Agent dispatched Sputnik DAO proposal #6 for 0.10 NEAR payout to zinipay-recipient2.testnet.',
      badge: 'Pending',
      txHash: 'HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK',
      explorerUrl: 'https://testnet.nearblocks.io/txns/HBs2djKVAtQzvBToXJfbUM7WiCb1jUgYYrP4H3CHkgVK',
    },
  ];

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
    ...defaultItems,
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
