import React, { useState } from 'react';
import {
  Coins,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { TreasuryBalanceResult } from '../../lib/nearRpc';
import { Proposal } from '../../lib/types';

export interface BlockedAttackItem {
  index: number;
  label: string;
  vector: string;
  txHash?: string;
  explorerUrl?: string;
  rejectionReason: string;
  blockedBy: string;
  isAdminAction?: boolean;
}

export interface SettledPayoutItem {
  proposalId: number;
  deployment: 'first' | 'current';
  codeHash: string;
  deploymentLabel: string;
  recipient: string;
  amountNear: string;
  amountYocto?: string;
  deliverable: string;
  status: string;
  source: string;
  txHash: string;
  explorerUrl: string;
  timestamp: string;
}

interface OverviewKpisProps {
  treasuryState: TreasuryBalanceResult;
  isLoadingOnChain: boolean;
  daoContract: string;
  proposals: Proposal[];
  network: 'testnet' | 'mainnet';
  blockedAttacks: BlockedAttackItem[];
  settledPayouts?: SettledPayoutItem[];
  onSelectAttack?: (attack: BlockedAttackItem) => void;
}

export function OverviewKpis({
  treasuryState,
  isLoadingOnChain,
  daoContract,
  proposals,
  network,
  blockedAttacks,
  settledPayouts = [],
  onSelectAttack,
}: OverviewKpisProps) {
  const [hoveredAttack, setHoveredAttack] = useState<BlockedAttackItem | null>(null);
  const explorerBase =
    network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  // 1. Treasury Balance (Real from chain view_account)
  const hasLiveBalance =
    treasuryState.status === 'success' && treasuryState.balance !== undefined;
  const balanceNear = hasLiveBalance ? treasuryState.balance! : null;

  // 2. Payouts Settled: Loaded dynamically from verified.json (settledPayouts prop)
  // Both #5 and #6 are on-chain Sputnik DAO proposals to zinipay-policy2.testnet
  const payoutsList = settledPayouts || [];
  const isLoaded = payoutsList.length > 0;
  const settledCount = payoutsList.length;
  const settledSumNear = payoutsList.reduce(
    (acc, p) => acc + (parseFloat(p.amountNear) || 0),
    0
  );

  // 3. Active Requests (Proposals inProgress on Sputnik DAO)
  const activeCount = proposals.filter((p) => p.status === 'pending_quorum').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full font-sans">
      {/* ── CARD 1: Treasury Balance ──────────────────────────── */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-xl p-4 flex flex-col justify-between shadow-lg transition-all">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97] shrink-0">
              <Coins size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] truncate">
                Treasury Balance
              </p>
              <p
                className="text-[10px] text-[var(--text-secondary)] font-mono truncate"
                title={daoContract}
              >
                {daoContract}
              </p>
            </div>
          </div>
          <a
            href={`${explorerBase}/address/${daoContract}`}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-[var(--text-muted)] hover:text-[#00EC97] flex items-center gap-1 font-mono transition-colors shrink-0"
            title="Inspect Sputnik DAO v2 on NEARBlocks"
          >
            <span>Explorer</span>
            <ExternalLink size={11} />
          </a>
        </div>

        <div className="my-3">
          {isLoadingOnChain && treasuryState.status === 'loading' ? (
            <div className="h-7 w-28 bg-white/[0.06] rounded animate-pulse" />
          ) : hasLiveBalance ? (
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-white tracking-tight">
                {balanceNear!.toFixed(2)}
              </span>
              <span className="font-mono text-sm text-[#00EC97] font-semibold">NEAR</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1 text-amber-400 font-mono text-sm">
              <span>{treasuryState.error ? 'Unavailable' : 'Not loaded'}</span>
            </div>
          )}
        </div>

        {/* Real Data Footer: No arbitrary meter */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
            Liquid Treasury Reserves
          </span>
          <span>{hasLiveBalance ? 'Live on-chain' : 'Public RPC'}</span>
        </div>
      </div>

      {/* ── CARD 2: Payouts Settled ───────────────────────────── */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-xl p-4 flex flex-col justify-between shadow-lg transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Payouts Settled
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                {isLoaded ? `${settledCount} on-chain releases` : 'Not loaded'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)]">
            {isLoaded ? (
              <>
                {payoutsList.map((p, idx) => (
                  <React.Fragment key={p.proposalId}>
                    {idx > 0 && <span>·</span>}
                    <a
                      href={p.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#00EC97] transition-colors underline-offset-2 hover:underline"
                      title={`Proposal #${p.proposalId} Payout (${p.amountNear}N)\n${p.deploymentLabel}\nTx: ${p.txHash}`}
                    >
                      #{p.proposalId}
                    </a>
                  </React.Fragment>
                ))}
                <ExternalLink size={10} className="text-slate-500" />
              </>
            ) : (
              <span className="text-slate-500">Not loaded</span>
            )}
          </div>
        </div>

        <div className="my-2.5">
          {isLoaded ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-white tracking-tight">
                  {settledSumNear.toFixed(2)}
                </span>
                <span className="font-mono text-sm text-[#00EC97] font-semibold">NEAR</span>
              </div>
              {/* Distinct deployment labels for Proposal #5 and Proposal #6 */}
              <div className="flex flex-col gap-0.5 mt-1 text-[9px] font-mono text-slate-400">
                {payoutsList.map((p) => (
                  <span key={p.proposalId} className="truncate" title={p.deploymentLabel}>
                    • #{p.proposalId} ({p.amountNear}N): {p.deploymentLabel}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1 text-slate-400 font-mono text-sm">
              <span>Not loaded</span>
              <span className="text-[9px] text-slate-500">Awaiting verified.json load...</span>
            </div>
          )}
        </div>

        {/* Real Data Footer: Citing Sputnik DAO Proposals as Source */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] gap-2">
          <span className="truncate" title="Source: Sputnik DAO v2 Proposals #5 & #6 on-chain execution (zinipay-demo.sputnikv2.testnet)">
            Proposals <span className="whitespace-nowrap">#5 &amp; #6</span>
          </span>
          <span className="text-emerald-400 font-semibold shrink-0">{isLoaded ? '2/2 Quorum' : '—'}</span>
        </div>
      </div>

      {/* ── CARD 3: Active Requests ───────────────────────────── */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-xl p-4 flex flex-col justify-between shadow-lg transition-all">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-amber-400">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Active Requests
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                Sputnik DAO v2
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
            {activeCount > 0 ? `${activeCount} Pending` : 'Clear'}
          </span>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-white tracking-tight">
              {activeCount}
            </span>
            <span className="font-mono text-xs text-[var(--text-secondary)]">in queue</span>
          </div>
        </div>

        {/* Real Data Footer: Honest text queue status, no made-up 5-dot scale */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
          <span>Governance Queue</span>
          <span>{activeCount === 0 ? '0 awaiting council quorum' : `${activeCount} in progress`}</span>
        </div>
      </div>

      {/* ── CARD 4: Blocked Attempts (5 Attack Txs + 1 Blocked Admin) ── */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-red-500/40 rounded-xl p-4 flex flex-col justify-between shadow-lg transition-all group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400">
              <ShieldAlert size={16} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Blocked Attempts
              </p>
              <p className="text-[10px] text-red-300/80 font-mono">
                5 attack txs + 1 admin action
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
            Fail-Closed
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-white tracking-tight">
              5
            </span>
            <span className="font-mono text-xs text-red-400 font-semibold">Attacks</span>
            <span className="font-mono text-xs text-slate-400">+ 1 Blocked Admin</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] truncate font-mono mt-0.5">
            {hoveredAttack
              ? `${hoveredAttack.label}: ${hoveredAttack.rejectionReason.slice(0, 32)}...`
              : 'Each bar below links to verified transaction'}
          </p>
        </div>

        {/* Real Data Visual: ONE BAR PER VERIFIED ON-CHAIN TRANSACTION */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
            <span>6 On-Chain Explorer Proofs</span>
            <span className="text-red-400 font-semibold">Enforced by contract</span>
          </div>
          <div className="flex items-center gap-1 w-full h-3">
            {blockedAttacks
              .filter((att) => att.explorerUrl)
              .map((att, idx) => {
                const isAdmin = att.isAdminAction;
                return (
                  <a
                    key={idx}
                    href={att.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    onMouseEnter={() => setHoveredAttack(att)}
                    onMouseLeave={() => setHoveredAttack(null)}
                    title={`${att.label}: ${att.vector}\nReason: ${att.rejectionReason}\nClick to inspect transaction on NEARBlocks`}
                    className={`h-full flex-1 rounded-sm transition-all cursor-pointer relative hover:scale-y-125 origin-bottom ${
                      isAdmin
                        ? 'bg-amber-500/70 hover:bg-amber-400'
                        : 'bg-red-500/70 hover:bg-red-400'
                    }`}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
