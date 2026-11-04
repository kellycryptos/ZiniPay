import React, { useState, useMemo } from 'react';
import { ReleaseReceiptCard } from '../ReleaseReceiptCard';
import { PolicyPanel } from '../PolicyPanel';
import { AttackAttemptsPanel } from '../AttackAttemptsPanel';
import { StepByStepProposeForm } from '../StepByStepProposeForm';
import { StatCard } from '../ui/StatCard';
import { Proposal, ActivityEvent } from '../../lib/types';
import { PolicyContractState, DaoOnChainPolicy, TreasuryBalanceResult } from '../../lib/nearRpc';
import {
  RefreshCw,
  Inbox,
  Filter,
  Plus,
  Search,
  Lock,
  ShieldCheck,
  Users,
  Coins,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Wallet,
} from 'lucide-react';

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
  isSimulated?: boolean;
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
  onNavigateToBoard?: () => void;
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
  isSimulated = false,
  activeRole,
  onVote,
  onInspectProof,
  onInspectDeliberation,
  onExecuteIntent,
  onOpenWalletModal,
  onProposalCreated,
  onShowToast,
  onRefresh,
  isDemoMode,
  onNavigateToBoard,
}: DashboardPageProps) {
  // Navigation tabs: 'pending' | 'paid' | 'all' | 'new_payout' | 'security'
  const [tab, setTab] = useState<'pending' | 'paid' | 'all' | 'new_payout' | 'security'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [intentFilter, setIntentFilter] = useState<'all' | 'native' | 'intents'>('all');
  const [legendOpen, setLegendOpen] = useState(false);
  const [daoSwitchOpen, setDaoSwitchOpen] = useState(false);
  const [tempDaoInput, setTempDaoInput] = useState('');

  // Effective Treasury Balance
  const effectiveBalance = treasuryState.balance !== undefined ? treasuryState.balance : 25.3;

  // Counts
  const pendingCount = proposals.filter((p) => p.status === 'pending_quorum').length;
  const paidCount = proposals.filter((p) => p.status === 'settled' || p.status === 'approved').length;
  const totalCount = proposals.length;

  // Filtered proposal list
  const displayProposals = useMemo(() => {
    return proposals.filter((p) => {
      // 1. Status filtering by tab
      if (tab === 'pending' && p.status !== 'pending_quorum') return false;
      if (tab === 'paid' && p.status !== 'settled' && p.status !== 'approved') return false;

      // 2. Settlement type filter
      if (intentFilter === 'intents' && p.settlement?.type !== 'cross_chain_intent') return false;
      if (intentFilter === 'native' && p.settlement?.type === 'cross_chain_intent') return false;

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = p.title?.toLowerCase().includes(q);
        const recipientMatch = p.recipient?.toLowerCase().includes(q);
        const cidMatch = p.proofCid?.toLowerCase().includes(q);
        const proposerMatch = p.proposer?.toLowerCase().includes(q);
        const descMatch = p.summary?.toLowerCase().includes(q);
        if (!titleMatch && !recipientMatch && !cidMatch && !proposerMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [proposals, tab, intentFilter, searchQuery]);

  const handleConnectDao = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempDaoInput.trim()) {
      onDaoContractChange(tempDaoInput.trim());
      setTempDaoInput('');
      setDaoSwitchOpen(false);
    }
  };

  const explorerBase = network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  return (
    <div className="flex-1 max-w-7xl w-full min-w-0 max-w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 font-sans">
      {/* ── Top Governance Context & Toolbar ────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Treasury Governance
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/60 text-[#00EC97] border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97] animate-pulse" />
            NEAR {network.toUpperCase()}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Switch DAO Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDaoSwitchOpen(!daoSwitchOpen)}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] border border-[var(--border-subtle)] text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Switch Sputnik DAO Contract"
            >
              <Lock size={13} className="text-[#00EC97]" />
              <span className="font-mono truncate max-w-[140px] sm:max-w-[200px]">{daoContract}</span>
              <ChevronDown size={13} className="text-[var(--text-muted)]" />
            </button>

            {daoSwitchOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-strong)] shadow-2xl p-4 z-50 flex flex-col gap-3 text-xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                  <span className="font-semibold text-white">Change Sputnik DAO</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Testnet</span>
                </div>
                <form onSubmit={handleConnectDao} className="flex flex-col gap-2">
                  <input
                    id="dao-switcher-input"
                    value={tempDaoInput}
                    onChange={(e) => setTempDaoInput(e.target.value)}
                    placeholder="e.g. your-dao.sputnikv2.testnet"
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-[#00EC97] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none"
                  />
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDaoContractChange('zinipay-demo.sputnikv2.testnet');
                        setDaoSwitchOpen(false);
                      }}
                      className="text-[11px] text-[#00EC97] hover:underline cursor-pointer"
                    >
                      Reset to default
                    </button>
                    <button
                      type="submit"
                      disabled={!tempDaoInput.trim()}
                      className="px-3 py-1 rounded-md bg-[#00EC97] text-black font-semibold text-xs disabled:opacity-40 cursor-pointer"
                    >
                      Load DAO
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* New Payout CTA Button */}
          <button
            type="button"
            onClick={() => setTab('new_payout')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
              tab === 'new_payout'
                ? 'bg-white text-black'
                : 'bg-[#00EC97] hover:bg-[#00EC97]/90 text-black'
            }`}
          >
            <Plus size={14} />
            <span>New Payout</span>
          </button>
        </div>
      </div>

      {/* ── High-Density 4-Metric Strip ───────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Metric 1: Treasury Balance */}
        <StatCard
          title="Treasury"
          icon={Coins}
          value={isLoadingOnChain ? 'Syncing...' : `${effectiveBalance.toFixed(2)} NEAR`}
          subtext={`~$${(effectiveBalance * 5.0).toFixed(2)} USD · Sputnik DAO v2`}
          action={
            <a
              href={`${explorerBase}/address/${daoContract}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-[var(--text-muted)] hover:text-[#00EC97] flex items-center gap-1 font-mono transition-colors"
              title="Inspect on NEARBlocks"
            >
              <span>Explorer</span>
              <ExternalLink size={10} />
            </a>
          }
        />

        {/* Metric 2: PolicyHelper Spend Cap */}
        <StatCard
          title="Spend Cap"
          icon={ShieldAlert}
          value="10.0 NEAR"
          subtext="50.0 NEAR daily limit"
          progress={{
            current: 9.5,
            max: 50.0,
            label: "9.5 NEAR spent today",
          }}
        />

        {/* Metric 3: Three-Way Gate Security */}
        <StatCard
          title="Release Gates"
          icon={ShieldCheck}
          value="3 of 3 Gates"
          subtext="Deliverable · Policy · Quorum"
        />

        {/* Metric 4: Council Quorum & Signer */}
        <StatCard
          title="Council Quorum"
          icon={Users}
          value={pendingCount > 0 ? `${pendingCount} Pending` : 'All Approved'}
          subtext={
            connectedAccount ? (
              <span className={`truncate flex items-center gap-1.5 ${isSimulated ? 'text-amber-400' : 'text-[#00EC97]'}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSimulated ? 'bg-amber-400' : 'bg-[#00EC97] animate-pulse'}`} />
                <span className="truncate">{connectedAccount}</span>
                <span className="text-[10px] opacity-75 shrink-0">({isSimulated ? 'Simulated' : activeRole})</span>
              </span>
            ) : (
              'No wallet connected'
            )
          }
          action={
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="text-[10px] font-mono text-[#00EC97] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Wallet size={11} />
              <span>{connectedAccount ? 'Role' : 'Connect'}</span>
            </button>
          }
        />
      </div>

      {/* ── Main Two-Column Governance Board ────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start w-full min-w-0 max-w-full overflow-hidden">
        {/* ── Left Sidebar (280px) ─────────────────────────────────── */}
        <aside className="w-full lg:w-72 shrink-0 min-w-0 max-w-full">
          <PolicyPanel
            treasuryBalance={effectiveBalance}
            treasuryLoading={isLoadingOnChain}
            treasuryError={daoError || undefined}
            daoConfigured={Boolean(daoContract && daoContract.trim())}
            daoContract={daoContract}
            policyState={onChainPolicy}
            policyContractConfigured={Boolean(policyContractId && policyContractId.trim())}
            policyContractId={policyContractId}
            onOpenSecurityLog={() => setTab('security')}
            securityEventCount={42}
            network={network}
          />
        </aside>

        {/* ── Right Stage (Queue / Actions / Security) ─────────────── */}
        <main className="flex-1 w-full min-w-0 max-w-full flex flex-col gap-4 overflow-hidden">
          {/* Segmented Control Tabs */}
          <div className="border-b border-[var(--border-subtle)] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="w-full sm:w-auto overflow-x-auto no-scrollbar">
              <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] w-max text-xs" aria-label="Queue views">
                <button
                  type="button"
                  onClick={() => setTab('pending')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    tab === 'pending'
                      ? 'bg-[var(--bg-canvas)] text-white shadow-sm border border-white/[0.08]'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <span>Pending</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    pendingCount > 0 ? 'bg-emerald-950 text-[#00EC97] border border-emerald-500/30' : 'bg-white/[0.05] text-[var(--text-muted)]'
                  }`}>
                    {pendingCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('paid')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    tab === 'paid'
                      ? 'bg-[var(--bg-canvas)] text-white shadow-sm border border-white/[0.08]'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <span>Paid</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.05] text-[var(--text-muted)]">
                    {paidCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    tab === 'all'
                      ? 'bg-[var(--bg-canvas)] text-white shadow-sm border border-white/[0.08]'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <span>All</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/[0.05] text-[var(--text-muted)]">
                    {totalCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('new_payout')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    tab === 'new_payout'
                      ? 'bg-[var(--bg-canvas)] text-white shadow-sm border border-white/[0.08]'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <Plus size={12} className="text-[#00EC97]" />
                  <span>Submit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('security')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    tab === 'security'
                      ? 'bg-[var(--bg-canvas)] text-white shadow-sm border border-white/[0.08]'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <ShieldAlert size={12} className="text-red-400" />
                  <span>Security</span>
                </button>
              </nav>
            </div>

            {/* Public Board Shortcut */}
            {onNavigateToBoard && (
              <button
                type="button"
                onClick={onNavigateToBoard}
                className="text-xs text-[#00EC97] hover:underline flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <span>View Public Governance Board</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>

          {/* Search, Filter & Refresh Toolbar (Visible in proposal list tabs) */}
          {(tab === 'pending' || tab === 'paid' || tab === 'all') && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter proposals, PRs, CIDs..."
                  className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] focus:border-[#00EC97] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Settlement Type & Refresh */}
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <div className="flex items-center gap-1.5 bg-[var(--bg-panel)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                  <Filter size={13} className="text-[var(--text-muted)]" />
                  <select
                    value={intentFilter}
                    onChange={(e) => setIntentFilter(e.target.value as any)}
                    className="bg-transparent text-white focus:outline-none cursor-pointer pr-1 text-xs"
                    aria-label="Filter settlement types"
                  >
                    <option value="all" className="bg-[var(--bg-panel)] text-white">All settlements</option>
                    <option value="native" className="bg-[var(--bg-panel)] text-white">Native NEAR</option>
                    <option value="intents" className="bg-[var(--bg-panel)] text-white">NEAR Intents (Cross-chain)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isLoadingOnChain}
                  className="p-2 rounded-lg bg-[var(--bg-panel)] hover:bg-[#1E232F] text-[var(--text-secondary)] hover:text-white transition-colors border border-[var(--border-subtle)] cursor-pointer"
                  title="Sync with NEAR RPC"
                  aria-label="Refresh proposals from NEAR RPC"
                >
                  <RefreshCw size={14} className={isLoadingOnChain ? 'animate-spin text-[#00EC97]' : ''} />
                </button>
              </div>
            </div>
          )}

          {/* Three-Way Gate Legend Collapsible */}
          {(tab === 'pending' || tab === 'paid' || tab === 'all') && (
            <div className="flex flex-col text-xs">
              <button
                type="button"
                onClick={() => setLegendOpen(!legendOpen)}
                className="text-[var(--text-muted)] hover:text-white transition-colors text-left underline underline-offset-4 decoration-[var(--border-subtle)] hover:decoration-white text-xs cursor-pointer w-max"
              >
                {legendOpen ? 'Hide verification gate pipeline details' : 'How the three release gates work'}
              </button>

              {legendOpen && (
                <div className="mt-2.5 p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in shadow-xl">
                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
                      Gate 1: Deliverable
                    </span>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Cryptographic attestation hash of merged GitHub PR or IPFS CID, bound directly to recipient account.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
                      Gate 2: PolicyHelper
                    </span>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Rust contract enforces per-payout spend cap (10 NEAR), 24h recipient cooldown, and CID anti-replay.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-1">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
                      Gate 3: Council Quorum
                    </span>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Human multi-sig approval (2 of 3 council signatures) required on Sputnik DAO v2 before execution.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Proposals Feed Area */}
          {(tab === 'pending' || tab === 'paid' || tab === 'all') && (
            <div className="flex flex-col gap-4">
              {isLoadingOnChain && proposals.length === 0 ? (
                /* Loading State Skeleton */
                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-xs text-[var(--text-muted)] animate-pulse">
                  <div className="w-7 h-7 rounded-full border-2 border-[var(--border-strong)] border-t-[#00EC97] animate-spin" />
                  <span>Loading on-chain proposals from {daoContract}...</span>
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
                /* Filtered or Empty State */
                <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 text-xs">
                  <div className="p-3 rounded-full bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                    <Inbox size={22} />
                  </div>
                  <h4 className="font-semibold text-sm text-white">
                    {searchQuery
                      ? 'No proposals match your search'
                      : tab === 'pending'
                      ? 'No pending payouts awaiting quorum'
                      : tab === 'paid'
                      ? 'No settled payouts found'
                      : 'No proposals found'}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
                    {searchQuery
                      ? `No items found matching "${searchQuery}". Try clearing search or adjusting filters.`
                      : 'New proposals appear here after multi-agent verification passes the Three-Way Gate.'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] text-white border border-[var(--border-subtle)] text-xs cursor-pointer"
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTab('new_payout')}
                        className="px-3.5 py-1.5 rounded-lg bg-[#00EC97] text-black font-semibold text-xs cursor-pointer"
                      >
                        Submit New Payout
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onRefresh}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] text-white border border-[var(--border-subtle)] text-xs cursor-pointer"
                    >
                      Sync RPC
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New Payout Tab */}
          {tab === 'new_payout' && (
            <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-xl">
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
            </div>
          )}

          {/* Security Log Tab */}
          {tab === 'security' && <AttackAttemptsPanel />}
        </main>
      </div>
    </div>
  );
}
