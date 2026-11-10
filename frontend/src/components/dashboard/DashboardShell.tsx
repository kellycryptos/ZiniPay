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
import { ContributorsView } from './ContributorsView';
import { UniversalFooter } from '../navigation/UniversalFooter';
import { DocsPage } from '../docs/DocsPage';
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
  onNavigateToLanding?: () => void;
  onNavigateVerify?: () => void;
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
  onNavigateToLanding,
  onNavigateVerify,
}: DashboardShellProps) {
  // Navigation State
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verificationModalOpen, setVerificationModalOpen] = useState<boolean>(false);
  const [settledPayouts, setSettledPayouts] = useState<SettledPayoutItem[]>([]);
  const [verifiedTxs, setVerifiedTxs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/verified.json')
      .then((r) => r.json())
      .then((data) => {
        if (data?.settledPayouts) {
          setSettledPayouts(data.settledPayouts);
        }
        if (data?.transactions) {
          setVerifiedTxs(data.transactions);
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
      label: 'Local DeliberationEngine test run, not on-chain',
      vector: 'Stolen Deliverable / Author Mismatch PR',
      caller: 'zinipay-recipient2.testnet',
      deliverable: 'near/near-sdk-rs#1651',
      amountNear: '0.10',
      rejectionReason: 'PR author (vsavchyn-dev) does not match recipient handle (zinipay-recipient2.testnet)',
      blockedBy: 'Pre-Chain (Local DeliberationEngine test run, not on-chain)',
      isAdminAction: false,
    },
    {
      index: 2,
      label: 'Blocked Attack 1',
      vector: 'Replay Deliverable CID (kellycryptos/ZiniPay#2)',
      caller: 'zinipay-demo.sputnikv2.testnet',
      deliverable: 'kellycryptos/ZiniPay#2',
      amountNear: '0.10',
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
      caller: 'zinipay-recipient2.testnet',
      deliverable: 'kellycryptos/ZiniPay#2',
      amountNear: '16.0',
      rejectionReason: 'Amount 16.0 NEAR exceeds effective tier cap 15.0 NEAR for recipient zinipay-recipient2.testnet',
      blockedBy: 'PolicyHelper (On-Chain)',
      txHash: 'EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
      explorerUrl: 'https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
      isAdminAction: false,
    },
    {
      index: 4,
      label: 'Blocked Attack 3',
      vector: 'Unauthorized Release Caller (agentzinipaytestnet.testnet)',
      caller: 'agentzinipaytestnet.testnet',
      deliverable: 'kellycryptos/ZiniPay#2',
      amountNear: '0.10',
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
      caller: 'zinipay-demo.sputnikv2.testnet',
      deliverable: 'KELLYCRYPTOS/ZINIPAY#2',
      amountNear: '0.10',
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
      caller: 'zinipay-recipient2.testnet',
      deliverable: 'kellycryptos/ZiniPay#2',
      amountNear: '0.10',
      rejectionReason: 'Cooldown not elapsed. 16 seconds remaining.',
      blockedBy: 'PolicyHelper (On-Chain)',
      txHash: '2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD',
      explorerUrl: 'https://testnet.nearblocks.io/txns/2hVRAoT67HwCY1PJkNCwHNQgtqW461X4XFdSq6ed8jgD',
      isAdminAction: false,
    },
    {
      index: 7,
      label: 'Blocked Admin Action',
      vector: 'Former Owner Admin Rejection',
      caller: 'former-owner.testnet',
      deliverable: 'Admin: unburn_cid',
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
              <img
                src="/logo.svg"
                alt="ZiniPay Logo"
                className="w-8 h-8 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] p-1 shrink-0 group-hover:border-[#00EC97]/40 transition-colors"
              />
              {!sidebarCollapsed && (
                <div className="flex flex-col leading-tight">
                  <span className="font-display font-bold text-[var(--text-primary)] text-base tracking-tight">
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
              className="hidden lg:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            {/* Close button (Mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-primary)]"
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
                      ? 'bg-[var(--bg-panel-alt)] text-[var(--text-primary)] font-semibold border border-[var(--border-subtle)]'
                      : 'text-slate-400 hover:text-[var(--text-primary)] hover:bg-white/[0.03]'
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

            {/* Verification Trigger */}
            <button
              type="button"
              onClick={() => {
                if (onNavigateVerify) {
                  onNavigateVerify();
                } else {
                  setVerificationModalOpen(true);
                }
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-[var(--text-primary)] hover:bg-white/[0.03] transition-colors cursor-pointer"
              title="On-chain verification"
            >
              <Shield size={16} className="text-[#00EC97] shrink-0" />
              {!sidebarCollapsed && <span className="flex-1 text-left">Verification</span>}
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
                <div className="flex items-center gap-1.5 font-mono text-xs text-[var(--text-primary)] truncate" title={connectedAccount}>
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
                  className="w-full py-1.5 px-2 rounded-md bg-[var(--bg-panel-alt)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-[var(--text-primary)] hover:bg-white/[0.08]"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-[var(--text-muted)] truncate min-w-0">
              <button
                type="button"
                onClick={onNavigateToLanding}
                className="hidden sm:inline hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                ZiniPay
              </button>
              <ChevronRight size={12} className="hidden sm:inline text-slate-600 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentView('overview')}
                className="hidden sm:inline hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <ChevronRight size={12} className="hidden sm:inline text-slate-600 shrink-0" />
              <span className="text-[var(--text-primary)] font-semibold capitalize truncate">
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
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-[#00EC97] rounded-lg pl-8 pr-7 py-1 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[var(--text-primary)]"
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
              className="p-1.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              title="Refresh Sputnik DAO on-chain state"
            >
              <RefreshCw size={14} className={isLoadingOnChain ? 'animate-spin' : ''} />
            </button>

            {/* Verified On-Chain Link */}
            <button
              type="button"
              onClick={onNavigateVerify ? onNavigateVerify : () => setVerificationModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#00EC97]/10 hover:bg-[#00EC97]/20 border border-[#00EC97]/30 text-xs font-mono text-[#00EC97] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Verified on-chain"
            >
              <Shield size={13} />
              <span className="hidden sm:inline">Verified on-chain</span>
            </button>

            {/* Connect Wallet Trigger */}
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
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

        {/* ── Scrollable Workspace Body ───────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* RPC Down Banner (if error querying chain) */}
          {daoError && (
            <RpcDownBanner
              error={daoError}
              onRetry={onRefresh}
              isLoading={isLoadingOnChain}
              onOpenVerification={() => setVerificationModalOpen(true)}
            />
          )}

          {/* VIEW: NEW PAYOUT FORM */}
          {currentView === 'new_payout' && (
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Dispatched New Payout</h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Agent deliberates on artifact, validates spend cap, and creates Sputnik DAO FunctionCall.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('overview')}
                  className="text-xs font-mono text-slate-400 hover:text-[var(--text-primary)] cursor-pointer"
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
                    <h2 className="font-semibold text-[var(--text-primary)] text-base">Governance Board</h2>
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
                verifiedTxs={verifiedTxs}
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
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Public Board</h2>
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
                verifiedTxs={verifiedTxs}
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
                    <h2 className="text-base font-bold text-[var(--text-primary)]">Security & Attack Log</h2>
                    <p className="text-xs text-[var(--text-secondary)]">
                      5 on-chain blocked attack transactions + 1 blocked admin recovery action + 1 pre-chain check (not an on-chain transaction).
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
                            <h4 className="font-semibold text-xs text-[var(--text-primary)] truncate">
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
                          className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[#00EC97] transition-colors"
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
                            <h4 className="font-semibold text-xs text-[var(--text-primary)] truncate">
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
                          className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-amber-400 transition-colors"
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
            <ContributorsView
              policyContractId={policyContractId}
              daoContract={daoContract}
              network={network}
              settledPayouts={settledPayouts}
            />
          )}

          {/* VIEW: DOCS */}
          {currentView === 'docs' && (
            <div className="w-full">
              <DocsPage embedded={true} network={network} />
            </div>
          )}

          {/* Universal Footer */}
          <div className="mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
            <UniversalFooter
              onNavigateBoard={() => setCurrentView('board')}
              onOpenVerifyModal={() => setVerificationModalOpen(true)}
              onNavigateDocs={() => setCurrentView('docs')}
              network={network}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
