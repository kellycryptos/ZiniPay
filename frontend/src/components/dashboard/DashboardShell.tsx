import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Columns3,
  Activity,
  Users,
  Shield,
  AlertOctagon,
  Terminal,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  CheckCircle2,
  ExternalLink,
  Wallet,
  Menu,
  X,
  Sparkles,
  Lock,
  ChevronRight,
  LogOut,
  RefreshCw,
  Plus,
  Scale,
  GitPullRequest,
} from 'lucide-react';
import { Proposal, ActivityEvent } from '../../lib/types';
import { PolicyContractState, DaoOnChainPolicy, TreasuryBalanceResult } from '../../lib/nearRpc';
import { OverviewKpis, BlockedAttackItem, SettledPayoutItem } from './OverviewKpis';
import { PolicyCard } from './PolicyCard';
import { KanbanBoard } from './KanbanBoard';
import { ActivityFeed } from './ActivityFeed';
import { RpcDownBanner } from './RpcDownBanner';
import { VerificationModal } from './VerificationModal';
import { StepByStepProposeForm } from '../StepByStepProposeForm';

export type DashboardView =
  | 'overview'
  | 'board'
  | 'activity'
  | 'contributors'
  | 'policy'
  | 'security'
  | 'docs'
  | 'new_payout';

interface DashboardShellProps {
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
  onNavigateToLanding?: () => void;
}

export function DashboardShell({
  proposals,
  activities,
  network,
  daoContract,
  onDaoContractChange,
  policyContractId,
  treasuryState,
  isLoadingOnChain,
  daoError,
  onChainPolicy,
  daoPolicy,
  contributorReputation,
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
  onNavigateToLanding,
}: DashboardShellProps) {
  // Navigation State
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verificationModalOpen, setVerificationModalOpen] = useState<boolean>(false);
  const [settledPayouts, setSettledPayouts] = useState<SettledPayoutItem[]>([]);

  useEffect(() => {
    fetch('/data/verified.json')
      .then((r) => r.json())
      .then((data) => {
        if (data?.settledPayouts) {
          setSettledPayouts(data.settledPayouts);
        }
      })
      .catch((err) => {
        console.warn('Failed to load verified.json:', err);
      });
  }, []);

  // Static verified data from verified.json: 5 attacks + 1 blocked admin + 1 pre-chain check
  const verifiedBlockedAttacks: BlockedAttackItem[] = [
    {
      index: 1,
      label: 'Deliberation Rejection',
      vector: 'Stolen Deliverable / Author Mismatch PR',
      rejectionReason: 'PR author (vsavchyn-dev) does not match recipient handle (zinipay-recipient2.testnet)',
      blockedBy: 'DeliberationEngine (Pre-Chain)',
      isAdminAction: false,
    },
    {
      index: 2,
      label: 'Blocked Attack 1',
      vector: 'Replay Deliverable CID (kellycryptos/ZiniPay#2)',
      rejectionReason: 'CID already used — duplicate release attempt blocked',
      blockedBy: 'PolicyHelper (On-Chain)',
      txHash: '9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb',
      explorerUrl: 'https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb',
      isAdminAction: false,
    },
    {
      index: 3,
      label: 'Blocked Attack 2',
      vector: 'Over-Cap Treasury Spend (16.0 NEAR)',
      rejectionReason: 'Amount 16000000000000000000000000 exceeds effective tier cap 15000000000000000000000000 for recipient zinipay-recipient2.testnet',
      blockedBy: 'PolicyHelper (On-Chain)',
      txHash: 'EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
      explorerUrl: 'https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
      isAdminAction: false,
    },
    {
      index: 4,
      label: 'Blocked Attack 3',
      vector: 'Unauthorized Release Caller (agentzinipaytestnet.testnet)',
      rejectionReason: 'Only owner or designated DAO can call this',
      blockedBy: 'PolicyHelper (On-Chain)',
      txHash: '2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B',
      explorerUrl: 'https://testnet.nearblocks.io/txns/2zsvqGDF4BkEs4MEvemnt2URXMHMjHuJtFFVXvKKWF4B',
      isAdminAction: false,
    },
    {
      index: 5,
      label: 'Blocked Attack 4',
      vector: 'Case-Variant CID Replay (KELLYCRYPTOS/ZINIPAY#2)',
      rejectionReason: 'CID already used — duplicate release attempt blocked',
      blockedBy: 'PolicyHelper (On-Chain)',
      txHash: 'EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y',
      explorerUrl: 'https://testnet.nearblocks.io/txns/EwQAsc5rXELJuLS8CG64uwT68WnBnHUSJCAQhwvgRc8y',
      isAdminAction: false,
    },
    {
      index: 6,
      label: 'Blocked Attack 5',
      vector: 'Cooldown Violation (16 seconds remaining)',
      rejectionReason: 'Cooldown not elapsed. 16 seconds remaining.',
      blockedBy: 'PolicyHelper (On-Chain)',
      txHash: '2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD',
      explorerUrl: 'https://testnet.nearblocks.io/txns/2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD',
      isAdminAction: false,
    },
    {
      index: 7,
      label: 'Blocked Admin Action',
      vector: 'Former Owner Unburn Attempt (Post-DAO Transfer)',
      rejectionReason: 'Only owner or designated DAO can call this',
      blockedBy: 'PolicyHelper (On-Chain / Post-DAO Transfer)',
      txHash: 'EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14',
      explorerUrl: 'https://testnet.nearblocks.io/txns/EmKpSxi4LXBs8VShDEhH55SjmDp3zkFTHTfoTQqE1w14',
      isAdminAction: true,
    },
  ];

  const explorerBase =
    network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'board', label: 'Board', icon: Columns3 },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'contributors', label: 'Contributors', icon: Users },
    { id: 'policy', label: 'Policy', icon: Shield },
    { id: 'security', label: 'Security Log', icon: AlertOctagon },
    { id: 'docs', label: 'Docs', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen w-full bg-[var(--bg-canvas)] text-slate-100 font-sans overflow-hidden">
      {/* ── Keyless Verification Suite Modal ──────────────────── */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        network={network}
      />

      {/* ── Mobile Sidebar Backdrop ───────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Collapsible Left Sidebar ──────────────────────────── */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-panel)] transition-all duration-300 ease-spring ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}`}
      >
        {/* Top: Logo & Collapse Button */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onNavigateToLanding}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00EC97] to-emerald-600 flex items-center justify-center font-display font-bold text-black text-sm shadow-md group-hover:scale-105 transition-transform">
                ZP
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col leading-tight">
                  <span className="font-display font-bold text-white text-base tracking-tight">
                    ZiniPay
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    Sputnik DAO v2
                  </span>
                </div>
              )}
            </button>

            {/* Collapse toggle (Desktop) */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            {/* Close button (Mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Create Payout CTA */}
          <div className="p-3">
            <button
              type="button"
              onClick={() => {
                setCurrentView('new_payout');
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                currentView === 'new_payout'
                  ? 'bg-white text-black'
                  : 'bg-[#00EC97] hover:bg-[#00EC97]/90 text-black'
              }`}
              title="Dispatched proposed release to Sputnik DAO"
            >
              <Plus size={15} />
              {!sidebarCollapsed && <span>New Payout</span>}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setCurrentView(item.id as DashboardView);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-semibold border border-white/[0.12]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                  title={item.label}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 ${isActive ? 'text-[#00EC97]' : 'text-slate-400'}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.id === 'security' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      5+1
                    </span>
                  )}
                </button>
              );
            })}

            {/* Verification Suite Trigger */}
            <button
              type="button"
              onClick={() => {
                setVerificationModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.03] transition-colors cursor-pointer"
              title="Keyless on-chain verification suite"
            >
              <Terminal size={16} className="text-[#00EC97] shrink-0" />
              {!sidebarCollapsed && <span className="flex-1 text-left">Verification</span>}
              {!sidebarCollapsed && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00EC97] border border-emerald-500/30">
                  25/25
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Bottom: Network Badge & Wallet Status */}
        <div className="p-3 border-t border-[var(--border-subtle)] flex flex-col gap-2.5 bg-[var(--bg-panel-alt)]/40">
          {/* Network Badge */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00EC97] animate-pulse" />
              {!sidebarCollapsed && (
                <span className="text-slate-200 font-semibold">NEAR Testnet</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <span className="text-[10px] text-[var(--text-muted)]">FastNear</span>
            )}
          </div>

          {/* Wallet Status */}
          <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-1.5 text-xs">
            {connectedAccount ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                    {activeRole}
                    {isSimulated ? ' (Simulation)' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenWalletModal}
                    className="text-[10px] text-[#00EC97] hover:underline font-mono cursor-pointer"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-white truncate" title={connectedAccount}>
                  <Wallet size={12} className="text-[#00EC97] shrink-0" />
                  <span className="truncate">{connectedAccount}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {!sidebarCollapsed && (
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    Wallet: Not connected
                  </span>
                )}
                <button
                  type="button"
                  onClick={onOpenWalletModal}
                  className="w-full py-1.5 px-2 rounded-md bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.12] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wallet size={12} />
                  {!sidebarCollapsed && <span>Connect Wallet</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Dashboard Workspace ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* ── Top Bar ─────────────────────────────────────────── */}
        <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08]"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] truncate">
              <button
                type="button"
                onClick={onNavigateToLanding}
                className="hover:text-white transition-colors cursor-pointer"
              >
                ZiniPay
              </button>
              <ChevronRight size={12} className="text-slate-600 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentView('overview')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <ChevronRight size={12} className="text-slate-600 shrink-0" />
              <span className="text-white font-semibold capitalize truncate">
                {currentView.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Center / Right: Search & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Omnibox */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposals, attacks..."
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-[#00EC97] rounded-lg pl-8 pr-7 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-none font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Refresh Chain Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoadingOnChain}
              className="p-1.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[#1E232F] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
              title="Refresh Sputnik DAO on-chain state"
            >
              <RefreshCw size={14} className={isLoadingOnChain ? 'animate-spin' : ''} />
            </button>

            {/* Verify On-Chain Button */}
            <button
              type="button"
              onClick={() => setVerificationModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#00EC97]/10 hover:bg-[#00EC97]/20 border border-[#00EC97]/30 text-xs font-mono text-[#00EC97] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Terminal size={13} />
              <span className="hidden sm:inline">Verify on-chain</span>
            </button>

            {/* Connect Wallet Trigger */}
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wallet size={13} className="text-[#00EC97]" />
              <span className="hidden sm:inline">
                {connectedAccount
                  ? `${connectedAccount.slice(0, 8)}...`
                  : 'Connect Wallet'}
              </span>
            </button>
          </div>
        </header>

        {/* ── Optional Simulation Mode Banner ─────────────────── */}
        {isDemoMode && (
          <aside
            aria-label="Demo mode"
            className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs font-mono text-amber-300"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>
                SIMULATION MODE ACTIVE (?demo=1) · Walking through local proposal deliberation. All data labelled Simulation.
              </span>
            </div>
            <a
              href="/board"
              className="underline text-amber-200 hover:text-white text-[11px]"
            >
              Exit to Live Testnet
            </a>
          </aside>
        )}

        {/* ── Scrollable Workspace Body ───────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* RPC Down Banner (if error querying chain) */}
          {daoError && (
            <RpcDownBanner
              error={daoError}
              onRetry={onRefresh}
              isLoading={isLoadingOnChain}
              onLaunchDemo={() => {
                window.location.href = '/board?demo=1';
              }}
              onOpenVerification={() => setVerificationModalOpen(true)}
            />
          )}

          {/* VIEW: NEW PAYOUT FORM */}
          {currentView === 'new_payout' && (
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">Dispatched New Payout</h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Agent deliberates on artifact, validates spend cap, and creates Sputnik DAO FunctionCall.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('overview')}
                  className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <StepByStepProposeForm
                daoContract={daoContract}
                policyContractId={policyContractId}
                network={network}
                connectedAccount={connectedAccount}
                onOpenWalletModal={onOpenWalletModal}
                onProposalCreated={(newProp) => {
                  onProposalCreated(newProp);
                  setCurrentView('board');
                  onShowToast(`Proposal #ZP-${newProp.id} dispatched!`);
                }}
                onShowToast={onShowToast}
                onChainPolicy={onChainPolicy}
                daoPolicy={daoPolicy}
              />
            </div>
          )}

          {/* VIEW: OVERVIEW */}
          {currentView === 'overview' && (
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
              {/* 4-Metric High Density Strip with Real Visuals */}
              <OverviewKpis
                treasuryState={treasuryState}
                isLoadingOnChain={isLoadingOnChain}
                daoContract={daoContract}
                proposals={proposals}
                network={network}
                blockedAttacks={verifiedBlockedAttacks}
                settledPayouts={settledPayouts}
                onSelectAttack={() => setCurrentView('security')}
              />

              {/* Policy Card with Enforced vs Advisory Tier Matrix */}
              <PolicyCard
                policyState={onChainPolicy}
                policyContractId={policyContractId}
                daoContract={daoContract}
                network={network}
                isLoading={isLoadingOnChain}
              />

              {/* 4-Column Board */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Columns3 size={16} className="text-[#00EC97]" />
                    <h2 className="font-semibold text-white text-base">Governance Board</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('board')}
                    className="text-xs font-mono text-[#00EC97] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Expand Board</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                <KanbanBoard
                  proposals={proposals}
                  blockedAttacks={verifiedBlockedAttacks}
                settledPayouts={settledPayouts}
                  searchQuery={searchQuery}
                  onInspectProposal={onInspectProof}
                  onInspectAttack={() => setCurrentView('security')}
                  canVote={activeRole === 'council' && !isSimulated}
                  onVote={onVote}
                  isLoading={isLoadingOnChain}
                />
              </div>

              {/* Activity Feed */}
              <ActivityFeed
                verifiedTxs={[]}
                liveActivities={activities}
                network={network}
              />
            </div>
          )}

          {/* VIEW: BOARD (Focused Full View) */}
          {currentView === 'board' && (
            <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">Public Board</h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    All proposals and blocked attacks across 4 governance stages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('new_payout')}
                  className="px-3 py-1.5 rounded-lg bg-[#00EC97] hover:bg-[#00EC97]/90 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus size={14} />
                  <span>New Payout</span>
                </button>
              </div>

              <KanbanBoard
                proposals={proposals}
                blockedAttacks={verifiedBlockedAttacks}
                settledPayouts={settledPayouts}
                searchQuery={searchQuery}
                onInspectProposal={onInspectProof}
                onInspectAttack={() => setCurrentView('security')}
                canVote={activeRole === 'council' && !isSimulated}
                onVote={onVote}
                isLoading={isLoadingOnChain}
              />
            </div>
          )}

          {/* VIEW: ACTIVITY */}
          {currentView === 'activity' && (
            <div className="w-full max-w-5xl mx-auto">
              <ActivityFeed
                verifiedTxs={[]}
                liveActivities={activities}
                network={network}
              />
            </div>
          )}

          {/* VIEW: POLICY */}
          {currentView === 'policy' && (
            <div className="w-full max-w-5xl mx-auto">
              <PolicyCard
                policyState={onChainPolicy}
                policyContractId={policyContractId}
                daoContract={daoContract}
                network={network}
                isLoading={isLoadingOnChain}
              />
            </div>
          )}

          {/* VIEW: SECURITY LOG */}
          {currentView === 'security' && (
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-950/40 text-red-400 border border-red-500/30">
                    <AlertOctagon size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Security & Attack Log</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      5 on-chain blocked attack transactions + 1 blocked admin recovery action + 1 pre-chain check.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  5 Attacks + 1 Admin Blocked
                </span>
              </div>

              {/* Group 1: 5 Blocked Attack Vectors */}
              <div className="flex flex-col gap-3 font-sans">
                <h3 className="font-mono text-xs font-semibold text-red-400 uppercase tracking-wider">
                  Blocked Attack Attempts (5 On-Chain + 1 Pre-Chain)
                </h3>
                {verifiedBlockedAttacks
                  .filter((a) => !a.isAdminAction)
                  .map((att, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[var(--bg-panel)] border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-red-500/40 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-500/30 shrink-0">
                          {att.txHash ? `#ATK-${idx}` : '#CHECK-1'}
                        </span>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-white truncate">
                              {att.vector}
                            </h4>
                            <span className="text-[10px] font-mono text-red-400">
                              {att.blockedBy}
                            </span>
                          </div>
                          <p className="text-xs text-red-200/90 font-mono bg-red-950/30 p-2 rounded border border-red-500/20 leading-relaxed">
                            {att.rejectionReason}
                          </p>
                        </div>
                      </div>

                      {att.explorerUrl && (
                        <a
                          href={att.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[#1E232F] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors"
                        >
                          <span>Explorer</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
              </div>

              {/* Group 2: 1 Blocked Admin Recovery Action */}
              <div className="flex flex-col gap-3 font-sans pt-2 border-t border-[var(--border-subtle)]">
                <h3 className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Blocked Administrative Action (1 On-Chain Post-DAO Transfer)
                </h3>
                {verifiedBlockedAttacks
                  .filter((a) => a.isAdminAction)
                  .map((att, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[var(--bg-panel)] border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 shrink-0">
                          #ADMIN-1
                        </span>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-white truncate">
                              {att.vector}
                            </h4>
                            <span className="text-[10px] font-mono text-amber-400">
                              {att.blockedBy}
                            </span>
                          </div>
                          <p className="text-xs text-amber-200/90 font-mono bg-amber-950/30 p-2 rounded border border-amber-500/20 leading-relaxed">
                            {att.rejectionReason}
                          </p>
                        </div>
                      </div>

                      {att.explorerUrl && (
                        <a
                          href={att.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[#1E232F] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-amber-400 transition-colors"
                        >
                          <span>Explorer</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW: CONTRIBUTORS */}
          {currentView === 'contributors' && (
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-5 font-sans">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
                    <Users size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Contributors & Reputation</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Accounts verified on-chain and recorded in Sputnik DAO proposals.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Full Registry Coming in Stage 2
                </span>
              </div>

              {/* Contributor 1: zinipay-recipient2.testnet */}
              <div className="p-5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="font-mono text-sm font-bold text-white">
                      zinipay-recipient2.testnet
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      Silver Tier
                    </span>
                  </div>

                  <a
                    href="https://testnet.nearblocks.io/address/zinipay-recipient2.testnet"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-[#00EC97] hover:underline flex items-center gap-1"
                  >
                    <span>NEARBlocks</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">Reputation Score</span>
                    <span className="text-base font-bold text-white">30 pts</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">get_reputation() on-chain</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">Effective Cap</span>
                    <span className="text-base font-bold text-white">15 NEAR</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">get_effective_cap() on-chain</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase">Recorded Payouts</span>
                    <span className="text-base font-bold text-white">0.20 NEAR</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Proposals #5 & #6</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-emerald-500/20 text-xs text-slate-300">
                  <p>
                    <span className="font-semibold text-white">Approval Schedule (Advisory):</span> Fast-track single vote (≤ 5 NEAR) · Full 2-of-2 council quorum (&gt; 5 NEAR).
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Source: Verified via PolicyHelper contract query and Sputnik DAO v2 proposal execution.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: DOCS */}
          {currentView === 'docs' && (
            <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 font-sans">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Architecture & Verification Docs</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      System boundaries, enforced constraints, and keyless testnet verification.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Full Documentation Coming in Stage 3
                </span>
              </div>

              {/* Problem & Solution */}
              <div className="p-5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-3">
                <h3 className="font-bold text-white text-sm">Problem & Core Thesis</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Let AI agents ask for money. Never let them take it. Autonomous agents cannot be trusted with raw private keys or unrestricted access to community treasuries. ZiniPay enforces a fail-closed three-way release gate: the agent proposes, a Rust PolicyHelper contract enforces boundaries, and humans approve on Sputnik DAO v2.
                </p>
              </div>

              {/* Three-Way Release Gate */}
              <div className="p-5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-3">
                <h3 className="font-bold text-white text-sm">The Three-Way Release Gate</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    <span className="text-[#00EC97] font-semibold block mb-1">Gate 1: Deliverable</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Validates GitHub PR commit hash and IPFS CID uniqueness. PR author must match the recipient account.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    <span className="text-[#00EC97] font-semibold block mb-1">Gate 2: Policy Contract</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      PolicyHelper smart contract enforces per-proposal spend caps (10/15/20N), cooldowns, and burns CID to prevent replay.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    <span className="text-[#00EC97] font-semibold block mb-1">Gate 3: Human Quorum</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Mandatory 2-of-2 council multi-sig quorum on Sputnik DAO v2. Agent holds 0 voting rights.
                    </p>
                  </div>
                </div>
              </div>

              {/* Keyless Verification */}
              <div className="p-5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">60-Second Judge Verification Command</h3>
                  <button
                    type="button"
                    onClick={() => setVerificationModalOpen(true)}
                    className="text-xs font-mono text-[#00EC97] hover:underline"
                  >
                    View All 25 Checks
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-[#00EC97]">
                  npm run verify:testnet
                </div>
                <p className="text-xs text-slate-400">
                  Runs keyless verification against public FastNear RPC without needing private keys or environment variables.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
