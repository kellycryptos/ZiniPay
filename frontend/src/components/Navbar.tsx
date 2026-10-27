import React, { useState } from 'react';
import { RefreshCw, Wallet, Check, ChevronDown, Shield, ArrowLeft } from 'lucide-react';
import { TreasuryBalanceResult } from '../lib/nearRpc';

interface NavbarProps {
  network: 'testnet' | 'mainnet';
  onNetworkChange: (network: 'testnet' | 'mainnet') => void;
  daoContract: string;
  onDaoContractChange: (dao: string) => void;
  policyContractId: string;
  onPolicyContractChange: (policy: string) => void;
  treasuryState: {
    status: 'loading' | 'success' | 'error';
    balance?: number;
    error?: string;
  };
  onRefresh: () => void;
  activeRole: 'council' | 'agent' | 'contributor';
  onRoleChange: (role: 'council' | 'agent' | 'contributor') => void;
  connectedAccount: string | null;
  onOpenWalletModal: () => void;
  onNavigateToLanding: () => void;
}

export function Navbar({
  network,
  onNetworkChange,
  daoContract,
  onDaoContractChange,
  policyContractId,
  onPolicyContractChange,
  treasuryState,
  onRefresh,
  activeRole,
  onRoleChange,
  connectedAccount,
  onOpenWalletModal,
  onNavigateToLanding,
}: NavbarProps) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="border-b border-[var(--border-subtle)] px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-[var(--bg-canvas)]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Brand & Landing Link */}
      <div className="flex items-center justify-between w-full md:w-auto">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToLanding}
            className="p-1.5 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] transition-colors"
            title="Return to Landing Page"
          >
            <ArrowLeft size={15} />
          </button>

          <img
            src="/brand/logo-mark.svg"
            alt="ZiniPay Logo"
            className="w-8 h-8 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-strong)] p-1 shrink-0"
          />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white font-sans">
                ZiniPay
              </h1>
              <span className="tag-neutral text-[10px]">
                Sputnik DAO v2
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">
              Constrained Agent Treasury Layer
            </p>
          </div>
        </div>

        {/* Mobile quick connect button if wallet modal needed */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={onOpenWalletModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
              connectedAccount ? 'tag-passed' : 'btn-primary py-1 px-2.5 text-[11px]'
            }`}
          >
            <Wallet size={12} />
            <span>{connectedAccount ? 'Connected' : 'Wallet'}</span>
          </button>
        </div>
      </div>

      {/* Controls: Treasury, DAO Selector, Network, Role, Wallet */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full md:w-auto">
        {/* Treasury Balance with Skeleton & Error handling */}
        <div className="flex items-center gap-2 bg-[var(--bg-panel-alt)] px-2.5 sm:px-3 py-1.5 rounded border border-[var(--border-subtle)] text-xs font-mono">
          <span className="text-[var(--text-muted)]">Treasury:</span>
          {treasuryState.status === 'loading' ? (
            <div className="w-16 h-3.5 bg-gray-800 rounded animate-pulse" />
          ) : treasuryState.status === 'error' ? (
            <span
              className="text-[var(--color-blocked)] font-semibold cursor-help"
              title={treasuryState.error || 'Failed to query DAO account balance'}
            >
              Unavailable
            </span>
          ) : (
            <span className="text-[var(--color-passed)] font-bold">
              {treasuryState.balance !== undefined ? treasuryState.balance.toFixed(2) : '0.00'} NEAR
            </span>
          )}
        </div>

        {/* DAO Contract Input */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-panel-alt)] px-2 sm:px-2.5 py-1.5 rounded border border-[var(--border-subtle)] text-xs font-mono flex-1 sm:flex-initial">
          <span className="text-[var(--text-muted)]">DAO:</span>
          <input
            value={daoContract}
            onChange={(e) => onDaoContractChange(e.target.value)}
            className="bg-transparent text-white font-mono focus:outline-none w-24 sm:w-36 text-xs font-semibold placeholder:text-gray-600"
            placeholder="e.g., zinipay.sputnikv2.testnet"
          />
        </div>

        {/* Policy Contract Input */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-panel-alt)] px-2 sm:px-2.5 py-1.5 rounded border border-[var(--border-subtle)] text-xs font-mono flex-1 sm:flex-initial">
          <span className="text-[var(--text-muted)]">Policy:</span>
          <input
            value={policyContractId}
            onChange={(e) => onPolicyContractChange(e.target.value)}
            className="bg-transparent text-white font-mono focus:outline-none w-24 sm:w-36 text-xs font-semibold placeholder:text-gray-600"
            placeholder="e.g., zinipay-policy.testnet"
          />
        </div>

        {/* Network Toggle */}
        <button
          type="button"
          onClick={() => onNetworkChange(network === 'testnet' ? 'mainnet' : 'testnet')}
          className="tag-neutral cursor-pointer hover:border-[var(--border-strong)] transition-all font-mono py-1 px-2 text-[11px]"
          title="Toggle between Testnet and Mainnet"
        >
          {network.toUpperCase()} ⟲
        </button>

        {/* Refresh State */}
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] transition-colors text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)]"
          title="Refresh on-chain state"
        >
          <RefreshCw size={13} className={treasuryState.status === 'loading' ? 'animate-spin' : ''} />
        </button>

        {/* Role Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-primary)] transition-colors"
          >
            <Shield size={12} className="text-[var(--color-passed)]" />
            <span className="capitalize">{activeRole}</span>
            <ChevronDown size={12} className="text-[var(--text-muted)]" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded bg-[var(--bg-panel)] border border-[var(--border-strong)] shadow-2xl py-1 z-50 text-xs font-mono">
              {[
                { id: 'council', label: 'Council (Vote)', desc: 'Multi-sig signer seat' },
                { id: 'agent', label: 'ZiniPay Agent', desc: 'Function-call key only' },
                { id: 'contributor', label: 'Contributor', desc: 'Submit deliverables' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onRoleChange(r.id as any);
                    setRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[var(--bg-panel-alt)] flex flex-col transition-colors"
                >
                  <div className="flex items-center justify-between text-white font-medium">
                    <span>{r.label}</span>
                    {activeRole === r.id && <Check size={12} className="text-[var(--color-passed)]" />}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">{r.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Wallet Connect Button */}
        <button
          type="button"
          onClick={onOpenWalletModal}
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
            connectedAccount
              ? 'tag-passed'
              : 'btn-primary py-1.5 px-3'
          }`}
        >
          <Wallet size={13} />
          {connectedAccount ? (
            <span className="flex items-center gap-1.5 truncate max-w-[130px] sm:max-w-[180px]">
              <span className="truncate">{connectedAccount}</span>
              {(connectedAccount.includes('judge-') || connectedAccount.includes('agent.') || connectedAccount.includes('alice.')) && (
                <span className="tag-pending text-[9px] px-1 py-0">
                  SIM
                </span>
              )}
            </span>
          ) : (
            <span>Connect wallet</span>
          )}
        </button>
      </div>
    </header>
  );
}
