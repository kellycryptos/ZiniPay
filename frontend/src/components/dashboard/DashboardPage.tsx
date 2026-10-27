import React, { useState } from 'react';
import { ReleaseReceiptCard } from '../ReleaseReceiptCard';
import { PolicyPanel } from '../PolicyPanel';
import { AttackAttemptsPanel } from '../AttackAttemptsPanel';
import { StepByStepProposeForm } from '../StepByStepProposeForm';
import { Proposal, ActivityEvent } from '../../lib/types';
import { PolicyContractState, DaoOnChainPolicy, TreasuryBalanceResult } from '../../lib/nearRpc';
import { RefreshCw, Inbox, Filter } from 'lucide-react';

interface DashboardPageProps {
  proposals: Proposal[];
  activities: ActivityEvent[];
  network: 'testnet' | 'mainnet';
  daoContract: string;
  onDaoContractChange: (dao: string) => void;
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
  onRefresh: () => void;
  isDemoMode: boolean;
}

export function DashboardPage({
  proposals,
  network,
  daoContract,
  onDaoContractChange,
  policyContractId,
  treasuryState,
  isLoadingOnChain,
  daoError,
  onChainPolicy,
  daoPolicy,
  connectedAccount,
  onVote,
  onInspectProof,
  onInspectDeliberation,
  onExecuteIntent,
  onOpenWalletModal,
  onProposalCreated,
  onShowToast,
  onRefresh,
  isDemoMode,
}: DashboardPageProps) {
  // Navigation tabs: 'pending' | 'paid' | 'all' | 'new_payout' | 'security'
  const [tab, setTab] = useState<'pending' | 'paid' | 'all' | 'new_payout' | 'security'>(() => {
    if (typeof window !== 'undefined') {
      const paramTab = new URLSearchParams(window.location.search).get('tab');
      if (paramTab === 'new_payout' || paramTab === 'propose') return 'new_payout';
      if (paramTab === 'paid') return 'paid';
      if (paramTab === 'all') return 'all';
      if (paramTab === 'security') return 'security';
    }
    return 'pending';
  });
  const [intentFilter, setIntentFilter] = useState<'all' | 'intents'>('all');
  const [legendOpen, setLegendOpen] = useState(false);
  const [tempDaoInput, setTempDaoInput] = useState('');

  // Counts
  const pendingCount = proposals.filter((p) => p.status === 'pending_quorum').length;
  const paidCount = proposals.filter((p) => p.status === 'settled' || p.status === 'approved').length;
  const totalCount = proposals.length;

  // Filtered list
  const displayProposals = proposals.filter((p) => {
    // 1. Status filtering by tab
    if (tab === 'pending' && p.status !== 'pending_quorum') return false;
    if (tab === 'paid' && p.status !== 'settled' && p.status !== 'approved') return false;
    // 2. Intents sub-filtering
    if (intentFilter === 'intents' && p.settlement.type !== 'cross_chain_intent') return false;
    return true;
  });

  const handleConnectDao = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempDaoInput.trim()) {
      onDaoContractChange(tempDaoInput.trim());
      setTempDaoInput('');
    }
  };

  return (
    <div className="flex-1 max-w-6xl w-full min-w-0 max-w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 font-sans">
      {/* Simulation Banner (?demo=1) */}
      {isDemoMode && (
        <aside
          aria-label="Simulation notice"
          className="p-3 rounded-md bg-[var(--color-pending-bg)] border border-[var(--color-pending-border)] text-xs text-[var(--color-pending)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full max-w-full"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[var(--color-pending)] shrink-0" />
            <span className="break-words">
              <strong>Simulation preview active (?demo=1)</strong>: Showing sample verification receipts and audit logs.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              window.location.search = '';
            }}
            className="text-[11px] underline hover:text-white transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            Switch to live NEAR testnet
          </button>
        </aside>
      )}

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full min-w-0 max-w-full">
        {/* ── Left Rail (Narrow: 250px) ────────────────────────── */}
        <aside className="w-full lg:w-64 shrink-0 min-w-0 max-w-full">
          <PolicyPanel
            treasuryBalance={treasuryState.balance}
            treasuryLoading={treasuryState.status === 'loading'}
            treasuryError={treasuryState.error}
            daoConfigured={Boolean(daoContract && daoContract.trim())}
            policyState={onChainPolicy}
            policyContractConfigured={Boolean(policyContractId && policyContractId.trim())}
            onOpenSecurityLog={() => setTab('security')}
            securityEventCount={isDemoMode ? 3 : 0}
          />
        </aside>

        {/* ── Main Area (Approval Queue / Form / Security) ────── */}
        <main className="flex-1 w-full min-w-0 max-w-full flex flex-col gap-4">
          {/* Plain Underline Tabs */}
          <div className="border-b border-[var(--border-subtle)] w-full max-w-full overflow-x-auto no-scrollbar">
            <nav className="flex gap-4 sm:gap-6 text-sm min-w-max pb-0.5" aria-label="Queue views">
              <button
                type="button"
                onClick={() => setTab('pending')}
                className={`pb-2.5 font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'pending'
                    ? 'border-[var(--color-passed)] text-white'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <span>Pending approval</span>
                <span className="ml-1.5 text-xs text-[var(--text-muted)] font-mono">({pendingCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('paid')}
                className={`pb-2.5 font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'paid'
                    ? 'border-[var(--color-passed)] text-white'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <span>Paid</span>
                <span className="ml-1.5 text-xs text-[var(--text-muted)] font-mono">({paidCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('all')}
                className={`pb-2.5 font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'all'
                    ? 'border-[var(--color-passed)] text-white'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <span>All</span>
                <span className="ml-1.5 text-xs text-[var(--text-muted)] font-mono">({totalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('new_payout')}
                className={`pb-2.5 font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'new_payout'
                    ? 'border-[var(--color-passed)] text-white'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <span>New payout</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('security')}
                className={`pb-2.5 font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  tab === 'security'
                    ? 'border-[var(--color-passed)] text-white'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <span>Security log</span>
              </button>
            </nav>
          </div>

          {/* Queue Sub-Toolbar (Legend & Controls) */}
          {(tab === 'pending' || tab === 'paid' || tab === 'all') && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs w-full min-w-0">
              {/* One-Line Collapsible Legend without arrow glyphs */}
              <div className="flex flex-col min-w-0">
                <button
                  type="button"
                  onClick={() => setLegendOpen(!legendOpen)}
                  className="text-[var(--text-muted)] hover:text-white transition-colors text-left underline underline-offset-4 decoration-[var(--border-subtle)] hover:decoration-white text-xs cursor-pointer"
                >
                  {legendOpen ? 'Hide gate verification details' : 'How the three release gates work'}
                </button>

                {legendOpen && (
                  <div className="mt-2.5 p-3 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] leading-relaxed flex flex-col gap-1.5 max-w-xl">
                    <p>
                      <strong className="text-white">Proof</strong>: Deliverable attestation hash claimed by the proposer in the proposal payload.
                    </p>
                    <p>
                      <strong className="text-white">Policy</strong>: On-chain spending cap, daily limits, and recipient cooldown verified by PolicyHelper.
                    </p>
                    <p>
                      <strong className="text-white">Council quorum</strong>: Explicit human council multi-sig approval required on Sputnik DAO v2 before execution.
                    </p>
                  </div>
                )}
              </div>

              {/* Right-aligned Filter & Refresh Toolbar */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <div className="flex items-center gap-1 bg-[var(--bg-panel-alt)] px-2 py-1 rounded border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  <Filter size={11} className="text-[var(--text-muted)]" />
                  <select
                    value={intentFilter}
                    onChange={(e) => setIntentFilter(e.target.value as any)}
                    className="bg-transparent text-white focus:outline-none cursor-pointer pr-1 text-xs"
                    aria-label="Filter payout types"
                  >
                    <option value="all" className="bg-[var(--bg-panel)] text-white">All payouts</option>
                    <option value="intents" className="bg-[var(--bg-panel)] text-white">NEAR Intents only</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isLoadingOnChain}
                  className="p-1.5 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] text-[var(--text-secondary)] hover:text-white transition-colors border border-[var(--border-subtle)] cursor-pointer"
                  title="Refresh on-chain proposals"
                  aria-label="Refresh on-chain proposals"
                >
                  <RefreshCw size={13} className={isLoadingOnChain ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          )}

          {/* Queue Content Area */}
          {(tab === 'pending' || tab === 'paid' || tab === 'all') && (
            <div className="flex flex-col gap-4">
              {/* Unconfigured DAO Empty State (No warning triangle, no red) */}
              {!isDemoMode && (!daoContract || !daoContract.trim()) ? (
                <div className="ledger-card p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3">
                  <h3 className="font-semibold text-base text-white">
                    Connect a community treasury
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] max-w-md leading-relaxed">
                    Enter a Sputnik DAO contract ID to load pending payout requests and live policy constraints.
                  </p>
                  <form onSubmit={handleConnectDao} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 w-full max-w-sm">
                    <input
                      type="text"
                      value={tempDaoInput}
                      onChange={(e) => setTempDaoInput(e.target.value)}
                      placeholder="e.g. zinipay.sputnikv2.testnet"
                      className="flex-1 bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] focus:border-[var(--border-strong)] rounded px-3 py-1.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none"
                    />
                    <button type="submit" className="btn-primary text-xs py-1.5 px-3 shrink-0 cursor-pointer">
                      Connect
                    </button>
                  </form>
                </div>
              ) : isLoadingOnChain && proposals.length === 0 ? (
                /* Loading State Skeleton */
                <div className="ledger-card p-10 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-muted)] animate-pulse">
                  <div className="w-6 h-6 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--color-passed)] animate-spin" />
                  <span>Checking {daoContract} on NEAR {network}...</span>
                </div>
              ) : displayProposals.length > 0 ? (
                /* Proposal Receipts Feed */
                displayProposals.map((prop) => (
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
                /* Configured but Empty Queue State */
                <div className="ledger-card p-10 text-center flex flex-col items-center justify-center gap-2 text-xs">
                  <Inbox size={24} className="text-[var(--text-muted)]" />
                  <h4 className="font-medium text-sm text-white">
                    {tab === 'pending'
                      ? 'No pending payouts'
                      : tab === 'paid'
                      ? 'No settled payouts'
                      : 'No proposals found'}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
                    {daoError
                      ? `Could not reach Sputnik DAO: ${daoError}. Check your network connection.`
                      : 'New requests appear here after an agent submits a deliverable for approval.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* New Payout Tab */}
          {tab === 'new_payout' && (
            <StepByStepProposeForm
              daoContract={daoContract}
              network={network}
              connectedAccount={connectedAccount}
              onOpenWalletModal={onOpenWalletModal}
              onProposalCreated={(p) => {
                onProposalCreated(p);
                setTab('pending');
              }}
              onShowToast={onShowToast}
              onChainPolicy={onChainPolicy}
              daoPolicy={daoPolicy}
            />
          )}

          {/* Security Log Tab */}
          {tab === 'security' && <AttackAttemptsPanel />}
        </main>
      </div>
    </div>
  );
}
