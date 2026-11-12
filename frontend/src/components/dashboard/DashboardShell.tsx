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
  Lock,
  ChevronRight,
  LogOut,
  RefreshCw,
  Plus,
  Scale,
  GitPullRequest,
  Bot,
  Sun,
  Moon,
} from 'lucide-react';
import { Proposal, ActivityEvent } from '../../lib/types';
import { PolicyContractState, DaoOnChainPolicy, TreasuryBalanceResult } from '../../lib/nearRpc';
import { OverviewKpis, BlockedAttackItem, SettledPayoutItem } from './OverviewKpis';
import { SocialMoneyFlowBanner } from './SocialMoneyFlowBanner';
import { ContributorReputationStrip } from './ContributorReputationStrip';
import { PolicyCard } from './PolicyCard';
import { ContributorsView } from './ContributorsView';
import { UniversalFooter } from '../navigation/UniversalFooter';
import { DocsPage } from '../docs/DocsPage';
import { KanbanBoard } from './KanbanBoard';
import { ActivityFeed } from './ActivityFeed';
import { RpcDownBanner } from './RpcDownBanner';
import { VerificationModal } from './VerificationModal';
import { StepByStepProposeForm } from '../StepByStepProposeForm';
import { ZiniPayLogo } from '../landing/LandingHeader';
import { useTheme } from '../../lib/theme';

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
  onNavigateDocs?: () => void;
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
  onNavigateDocs,
}: DashboardShellProps) {
  // Navigation State
  const { theme, toggleTheme } = useTheme();
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
  ];

  return (
    <div className="flex h-screen w-full bg-[#F4FBF7] dark:bg-[#070D0C] text-slate-900 dark:text-white font-sans overflow-hidden relative selection:bg-[#00E599]/30 selection:text-white transition-colors">
      {/* ── Atmospheric Radial Emerald Glow (Dark Mode Only) ──── */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 dark:block hidden"
        style={{
          background:
            'radial-gradient(circle at 50% -10%, #0F231D 0%, #070D0C 60%, #050908 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="fixed top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0 dark:block hidden"
      />

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
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200 dark:border-emerald-500/15 bg-white dark:bg-[#0B1412]/90 backdrop-blur-md transition-all duration-300 shadow-md dark:shadow-none ${
          mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}`}
      >
        {/* Top: Logo & Collapse Button */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/70">
            <button
              type="button"
              onClick={onNavigateToLanding}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ZiniPayLogo className="w-7 h-7 drop-shadow-[0_0_8px_rgba(0,229,153,0.5)]" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                    ZiniPay
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400/80 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-500/20 w-fit mt-0.5">
                    Sputnik DAO v2
                  </span>
                </div>
              )}
            </button>

            {/* Collapse toggle (Desktop) */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            {/* Close button (Mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Primary Action: Full-Width Glowing Neon Emerald Button */}
          <div className="p-3.5">
            <button
              type="button"
              onClick={() => {
                setCurrentView('new_payout');
                setMobileMenuOpen(false);
              }}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                currentView === 'new_payout'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                  : 'bg-[#00E599] hover:bg-[#00ffaa] text-slate-950 shadow-[0_0_20px_rgba(0,229,153,0.4)] hover:shadow-[0_0_28px_rgba(0,229,153,0.6)]'
              }`}
              title="Dispatch proposed release to Sputnik DAO"
            >
              <Plus size={16} className="font-bold" />
              {!sidebarCollapsed && <span className="font-bold tracking-tight">New Payout</span>}
            </button>
          </div>

          {/* Navigation Links with Soft Emerald Accent for Active Item */}
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-l-2 border-emerald-500 dark:border-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] border-l-2 border-transparent'
                  }`}
                  title={item.label}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 ${isActive ? 'text-[#00E599] drop-shadow-[0_0_6px_#00E599]' : 'text-slate-400 dark:text-slate-500'}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {!sidebarCollapsed && item.id === 'security' && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-rose-700 dark:text-rose-300 border border-red-300 dark:border-red-500/30 font-bold shadow-sm">
                      5+1
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Card: Recessed Container with Agent & Wallet */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/70 flex flex-col gap-2.5 bg-slate-50/80 dark:bg-[#070D0C]/60">
          
          {/* Active NEAR Testnet Agent Card */}
          <div className="p-3 rounded-xl bg-white dark:bg-[#070D0C] border border-slate-200 dark:border-slate-800/80 flex flex-col gap-1.5 shadow-sm dark:shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E599] shadow-[0_0_8px_#00E599] animate-pulse shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">NEAR Testnet</span>
                )}
              </div>
              {!sidebarCollapsed && (
                <span className="text-[10px] text-emerald-600 dark:text-[#00E599] font-mono font-semibold">Active</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5" title="agentzinipaytestnet.testnet">
                <Bot size={13} className="text-[#00E599] shrink-0" />
                <span className="truncate">agentzinipaytestnet.testnet</span>
              </div>
            )}
          </div>

          {/* Connected Wallet Status */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#070D0C] border border-slate-200 dark:border-slate-800/80 flex flex-col gap-1 text-xs shadow-sm dark:shadow-inner">
            {connectedAccount ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-500">
                    {activeRole}
                    {isSimulated ? ' (Sim)' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenWalletModal}
                    className="text-[10px] text-emerald-600 dark:text-[#00E599] hover:underline font-mono cursor-pointer"
                  >
                    Change
                  </button>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-900 dark:text-white truncate" title={connectedAccount}>
                  <Wallet size={12} className="text-[#00E599] shrink-0" />
                  <span className="truncate">{connectedAccount}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {!sidebarCollapsed && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Wallet: Not connected
                  </span>
                )}
                <button
                  type="button"
                  onClick={onOpenWalletModal}
                  className="w-full py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#0F1C18] dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wallet size={12} className="text-[#00E599]" />
                  {!sidebarCollapsed && <span>Connect Wallet</span>}
                </button>
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* ── Main Dashboard Workspace ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-10">
        
        {/* ── Top Header Bar (Translucent Sticky Header) ───────── */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#070D0C]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 transition-colors">
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileMenuOpen(!mobileMenuOpen);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumbs: ZiniPay / Dashboard / Overview */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 truncate min-w-0">
              <button
                type="button"
                onClick={onNavigateToLanding}
                className="hidden sm:inline hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                ZiniPay
              </button>
              <ChevronRight size={12} className="hidden sm:inline text-slate-400 dark:text-slate-600 shrink-0" />
              <button
                type="button"
                onClick={() => setCurrentView('overview')}
                className="hidden sm:inline hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <ChevronRight size={12} className="hidden sm:inline text-slate-400 dark:text-slate-600 shrink-0" />
              <span className="text-slate-900 dark:text-white font-bold capitalize truncate">
                {currentView.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Center / Right: Search, Refresh, Theme Toggle, Verified Badge & Wallet */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* Dark/Light Glass Search Omnibox */}
            <div className="relative hidden sm:block w-48 md:w-64">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search proposals, attacks..."
                className="w-full bg-slate-100 dark:bg-[#0B1412]/80 border border-slate-200 dark:border-slate-800/80 focus:border-emerald-500/50 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-mono shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white"
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
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#0B1412]/80 hover:bg-slate-200 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-inner"
              title="Refresh Sputnik DAO on-chain state"
            >
              <RefreshCw size={14} className={isLoadingOnChain ? 'animate-spin' : ''} />
            </button>

            {/* Light / Dark Mode Toggle Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#0B1412]/80 hover:bg-slate-200 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-inner"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun size={14} className="text-amber-400" />
              ) : (
                <Moon size={14} className="text-slate-700" />
              )}
            </button>

            {/* Glowing Emerald Pill Badge: Verified on-chain */}
            <button
              type="button"
              onClick={onNavigateVerify ? onNavigateVerify : () => setVerificationModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-xs font-mono text-emerald-700 dark:text-[#00E599] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm dark:shadow-[0_0_15px_rgba(0,229,153,0.2)]"
              title="Verified on-chain"
            >
              <Shield size={13} />
              <span className="hidden sm:inline">Verified on-chain</span>
            </button>

            {/* Truncated Wallet Pill */}
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B1412]/80 hover:bg-slate-200 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer shadow-inner"
            >
              <Wallet size={13} className="text-[#00E599]" />
              <span className="hidden sm:inline">
                {connectedAccount
                  ? `${connectedAccount.slice(0, 8)}...${connectedAccount.slice(-4)}`
                  : 'Connect Wallet'}
              </span>
            </button>
          </div>
        </header>

        {/* ── Scrollable Workspace Body ───────────────────────── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4 sm:p-6 flex flex-col gap-6">
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
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">Dispatched New Payout</h2>
                  <p className="text-xs text-slate-400">
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
            <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto min-w-0">
              {/* One Full Social Money Flow Obvious at a Glance */}
              <SocialMoneyFlowBanner />

              {/* 4-Metric High Density Strip */}
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

              {/* Contributor Reputation with Tier Badges + Visible Tier Matrix */}
              <ContributorReputationStrip
                policyContractId={policyContractId}
                daoContract={daoContract}
                network={network}
                contributorScore={contributorReputation ?? 30}
              />

              {/* 4-Column Board */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Columns3 size={18} className="text-[#00E599]" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Governance Board</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentView('board')}
                    className="text-xs font-mono text-[#00E599] hover:underline cursor-pointer flex items-center gap-1"
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

              {/* Activity Feed with Status and Explorer Links */}
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
              {/* Social Money Flow Banner */}
              <SocialMoneyFlowBanner />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <h2 className="text-base font-bold text-white">Public Board</h2>
                  <p className="text-xs text-slate-400">
                    All proposals and blocked attacks across 4 governance stages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('new_payout')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#00E599] hover:bg-[#00ffaa] text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-[0_0_15px_rgba(0,229,153,0.3)]"
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
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-950/40 text-rose-400 border border-red-500/30">
                    <AlertOctagon size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Security &amp; Attack Log</h2>
                    <p className="text-xs text-slate-400">
                      5 on-chain blocked attack transactions + 1 blocked admin recovery action + 1 pre-chain check (not an on-chain transaction).
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-red-500/10 text-rose-300 border border-red-500/30 font-bold shadow-[0_0_8px_rgba(239,68,68,0.2)]">
                  5 Attacks + 1 Admin Blocked
                </span>
              </div>

              {/* Group 1: 5 Blocked Attack Vectors */}
              <div className="flex flex-col gap-3 font-sans">
                <h3 className="font-mono text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  Blocked Attack Attempts (5 On-Chain + 1 Pre-Chain)
                </h3>
                {verifiedBlockedAttacks
                  .filter((a) => !a.isAdminAction)
                  .map((att, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#181113]/90 border border-red-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-red-500/40 transition-colors shadow-md"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-red-950/80 text-rose-300 border border-red-500/30 shrink-0">
                          {att.txHash ? `#ATK-${idx}` : '#CHECK-1'}
                        </span>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-white truncate">
                              {att.vector}
                            </h4>
                            <span className="text-[10px] font-mono text-rose-400">
                              {att.blockedBy}
                            </span>
                          </div>
                          <p className="text-xs text-rose-200/90 font-mono bg-red-950/30 p-2.5 rounded-lg border border-red-500/20 leading-relaxed">
                            {att.rejectionReason}
                          </p>
                        </div>
                      </div>

                      {att.explorerUrl && (
                        <a
                          href={att.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070D0C] hover:bg-slate-800/60 border border-slate-800 text-xs font-mono text-slate-300 hover:text-[#00E599] transition-colors"
                        >
                          <span>Explorer</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
              </div>

              {/* Group 2: 1 Blocked Admin Recovery Action */}
              <div className="flex flex-col gap-3 font-sans pt-2 border-t border-slate-800/80">
                <h3 className="font-mono text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Blocked Administrative Action (1 On-Chain Post-DAO Transfer)
                </h3>
                {verifiedBlockedAttacks
                  .filter((a) => a.isAdminAction)
                  .map((att, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#181113]/90 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-500/40 transition-colors shadow-md"
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
                          <p className="text-xs text-amber-200/90 font-mono bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed">
                            {att.rejectionReason}
                          </p>
                        </div>
                      </div>

                      {att.explorerUrl && (
                        <a
                          href={att.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070D0C] hover:bg-slate-800/60 border border-slate-800 text-xs font-mono text-slate-300 hover:text-amber-400 transition-colors"
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
          <div className="mt-8 -mx-4 sm:-mx-6 overflow-hidden">
            <UniversalFooter
              onNavigateBoard={() => setCurrentView('board')}
              onOpenVerifyModal={() => setVerificationModalOpen(true)}
              onNavigateDocs={onNavigateDocs || (() => { window.location.href = '/docs'; })}
              onNavigateVerify={onNavigateVerify || (() => { window.location.href = '/verify'; })}
              network={network}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
