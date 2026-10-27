import React, { useState } from 'react';
import { ThreeWayGate } from '../ThreeWayGate';
import { ReleaseReceiptCard } from '../ReleaseReceiptCard';
import { PolicyPanel } from '../PolicyPanel';
import { AttackAttemptsPanel } from '../AttackAttemptsPanel';
import { ActivityLog } from '../ActivityLog';
import { StepByStepProposeForm } from '../StepByStepProposeForm';
import { Proposal, ActivityEvent } from '../../lib/types';
import { PolicyContractState, DaoOnChainPolicy, TreasuryBalanceResult } from '../../lib/nearRpc';
import { ShieldCheck, Filter, AlertTriangle, ExternalLink } from 'lucide-react';

interface DashboardPageProps {
  proposals: Proposal[];
  activities: ActivityEvent[];
  network: 'testnet' | 'mainnet';
  daoContract: string;
  policyContractId: string;
  treasuryState: TreasuryBalanceResult;
  isLoadingOnChain: boolean;
  daoError: string | null;
  onChainPolicy: PolicyContractState | null;
  daoPolicy: DaoOnChainPolicy | null;
  contributorReputation: number | null;
  connectedAccount: string | null;
  activeRole: 'council' | 'agent' | 'contributor';
  onVote: (proposalId: number, approve: boolean) => void;
  onInspectProof: (proposal: Proposal) => void;
  onInspectDeliberation: (proposal: Proposal) => void;
  onExecuteIntent: (proposal: Proposal) => void;
  onOpenWalletModal: () => void;
  onProposalCreated: (proposal: Proposal) => void;
  onShowToast: (msg: string) => void;
  isDemoMode: boolean;
}

export function DashboardPage({
  proposals,
  activities,
  network,
  daoContract,
  policyContractId,
  treasuryState,
  isLoadingOnChain,
  daoError,
  onChainPolicy,
  daoPolicy,
  contributorReputation,
  connectedAccount,
  activeRole,
  onVote,
  onInspectProof,
  onInspectDeliberation,
  onExecuteIntent,
  onOpenWalletModal,
  onProposalCreated,
  onShowToast,
  isDemoMode,
}: DashboardPageProps) {
  const [tab, setTab] = useState<'proposals' | 'propose'>('proposals');
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled' | 'intents'>('all');

  const filteredProposals = proposals.filter((p) => {
    if (filter === 'pending') return p.status === 'pending_quorum';
    if (filter === 'settled') return p.status === 'settled' || p.status === 'approved';
    if (filter === 'intents') return p.settlement.type === 'cross_chain_intent';
    return true;
  });

  return (
    <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6 font-sans">
      {/* Simulation Banner if in ?demo=1 mode */}
      {isDemoMode && (
        <aside aria-label="Simulation notice" className="p-3 rounded bg-[var(--color-pending-bg)] border border-[var(--color-pending-border)] text-[var(--color-pending)] text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-pending)] animate-pulse" />
            <span>
              <strong>SIMULATION MODE ACTIVE (?demo=1)</strong>: Showing simulated proposals and evaluation metrics.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.search = '';
            }}
            className="text-[11px] underline hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
          >
            Switch to Live NEAR Testnet RPC
          </button>
        </aside>
      )}

      {/* Top Banner: Three-Way Release Gate */}
      <ThreeWayGate />

      {/* Three-Column / Three-Rail Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Rail (Treasury & Policy Limits & Roles) ────────── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Treasury Account Snapshot */}
          <div className="ledger-card p-5 flex flex-col gap-3 font-mono text-xs">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              Treasury Account Snapshot
            </div>
            <div>
              <div className="text-[11px] text-[var(--text-muted)]">DAO ACCOUNT</div>
              <div className="text-white font-bold text-xs truncate mt-0.5" title={daoContract || 'Not configured'}>
                {daoContract || <span className="text-[var(--text-muted)] font-normal italic">Not configured</span>}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[var(--text-muted)]">RPC BALANCE</div>
              {!daoContract ? (
                <div className="text-[var(--text-muted)] font-mono text-xs mt-0.5">
                  Not configured
                </div>
              ) : treasuryState.status === 'loading' ? (
                <div className="w-24 h-5 bg-gray-800 rounded animate-pulse mt-1" />
              ) : treasuryState.status === 'error' ? (
                <div className="text-[var(--color-blocked)] font-bold text-xs mt-0.5">
                  Unavailable ({treasuryState.error || 'Query failed'})
                </div>
              ) : (
                <div className="text-[var(--color-passed)] font-extrabold text-lg mt-0.5">
                  {treasuryState.balance !== undefined ? treasuryState.balance.toFixed(2) : '0.00'} NEAR
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px]">
              <span className="text-[var(--text-muted)]">NETWORK:</span>
              <span className="tag-neutral text-[10px]">NEAR {network.toUpperCase()}</span>
            </div>
          </div>

          {/* Policy Panel */}
          <PolicyPanel
            policyState={onChainPolicy}
            daoPolicy={daoPolicy}
            policyContractId={policyContractId}
            reputationScore={contributorReputation}
            isSimulated={isDemoMode}
            policy={{
              maxSpendPerProposalNear: 10.0,
              maxSpendPerDayNear: 50.0,
              cooldownHours: 4,
              minReputationScore: 0,
            }}
            daily={{
              count: proposals.filter((p) => p.status === 'settled' || p.status === 'approved').length,
              totalNear: proposals
                .filter((p) => p.status === 'settled' || p.status === 'approved')
                .reduce((sum, p) => sum + (parseFloat(p.amountNear) || 0), 0),
            }}
          />
        </div>

        {/* ── Main Area (Proposals Feed & Step-by-Step Propose) ─── */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Main View Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-3 gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTab('proposals')}
                className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  tab === 'proposals'
                    ? 'btn-primary py-1.5 px-3.5'
                    : 'btn-secondary py-1.5 px-3.5 text-[var(--text-secondary)]'
                }`}
              >
                Treasury Proposals ({proposals.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('propose')}
                className={`px-3.5 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                  tab === 'propose'
                    ? 'btn-primary py-1.5 px-3.5'
                    : 'btn-secondary py-1.5 px-3.5 text-[var(--text-secondary)]'
                }`}
              >
                + Propose Payout
              </button>
            </div>

            {/* Filter buttons when viewing proposals */}
            {tab === 'proposals' && (
              <div className="flex items-center gap-1 bg-[var(--bg-panel-alt)] p-1 rounded border border-[var(--border-subtle)] text-[11px] font-mono">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'pending', label: 'Pending Quorum' },
                  { id: 'settled', label: 'Settled' },
                  { id: 'intents', label: 'NEAR Intents' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      filter === f.id
                        ? 'bg-[var(--bg-canvas)] text-white font-bold border border-[var(--border-subtle)]'
                        : 'text-[var(--text-muted)] hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Proposals Feed as Release Receipts */}
          {tab === 'proposals' && (
            <div className="flex flex-col gap-4">
              {!daoContract || !daoContract.trim() ? (
                /* Empty state: DAO not configured */
                <div className="ledger-card p-12 text-center flex flex-col items-center justify-center gap-3 font-mono text-xs border-dashed">
                  <AlertTriangle size={28} className="text-[var(--color-pending)]" />
                  <div className="text-white font-bold text-sm font-sans">
                    DAO contract is not configured
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] max-w-md leading-relaxed">
                    Set <code className="text-white bg-black/40 px-1 py-0.5 rounded">VITE_DAO_CONTRACT_ID</code> in your environment or enter a DAO account ID in the navigation bar above to view treasury proposals.
                  </p>
                </div>
              ) : isLoadingOnChain && proposals.length === 0 ? (
                /* Loading State Skeleton */
                <div className="ledger-card p-10 flex flex-col items-center justify-center gap-3 font-mono text-xs text-[var(--text-muted)] animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-800" />
                  <span>Loading live proposals from NEAR RPC ({daoContract})...</span>
                </div>
              ) : filteredProposals.length > 0 ? (
                filteredProposals.map((prop) => (
                  <ReleaseReceiptCard
                    key={prop.id}
                    proposal={prop}
                    daoContractId={daoContract}
                    policyContractId={policyContractId}
                    network={network}
                    onVote={onVote}
                    onInspectProof={onInspectProof}
                    onInspectDeliberation={onInspectDeliberation}
                    onExecuteIntent={onExecuteIntent}
                    showActions={true}
                  />
                ))
              ) : (
                /* Empty state with specific text */
                <div className="ledger-card p-12 text-center flex flex-col items-center justify-center gap-3 font-mono text-xs border-dashed">
                  <ShieldCheck size={28} className="text-[var(--text-muted)]" />
                  <div className="text-white font-bold text-sm font-sans">
                    {isDemoMode
                      ? 'No simulated proposals match this filter.'
                      : `No proposals found on ${daoContract} (${network})`}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] max-w-md leading-relaxed">
                    {isDemoMode
                      ? 'Switch proposal filter tabs or dispatch a new payout test.'
                      : daoError
                      ? `RPC Notice: ${daoError}. Verify network connection or DAO contract ID.`
                      : `Connected to Sputnik DAO v2. Use the "+ Propose Payout" tab to dispatch a new proposal, or append ?demo=1 to view sample simulation data.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step-by-Step Propose Flow */}
          {tab === 'propose' && (
            <StepByStepProposeForm
              daoContract={daoContract}
              network={network}
              connectedAccount={connectedAccount}
              onOpenWalletModal={onOpenWalletModal}
              onProposalCreated={(p) => {
                onProposalCreated(p);
                setTab('proposals');
              }}
              onShowToast={onShowToast}
              onChainPolicy={onChainPolicy}
              daoPolicy={daoPolicy}
            />
          )}
        </div>

        {/* ── Right Rail (Attack Attempts & Live Activity) ───────── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Blocked Attacks Panel */}
          <AttackAttemptsPanel />

          {/* Activity Log */}
          <ActivityLog activities={activities} />

          {/* Ecosystem Verification Surfaces */}
          <div className="ledger-card p-4 flex flex-col gap-2 font-mono text-xs">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Ecosystem Surfaces
            </span>
            {[
              { label: 'Trezu Treasury Dashboard', url: 'https://app.trezu.org' },
              { label: 'Sputnik DAO Contracts', url: 'https://github.com/near-daos/sputnik-dao-contract' },
              { label: 'NEAR Intents 1Click API', url: 'https://near-intents.org' },
              { label: 'NEAR AI Cloud', url: 'https://cloud.near.ai' },
            ].map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[var(--text-secondary)] hover:text-white flex items-center justify-between py-1 transition-colors border-b border-[var(--border-subtle)] last:border-none"
              >
                <span>{label}</span>
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
