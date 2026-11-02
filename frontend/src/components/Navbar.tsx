import React, { useState, useRef, useEffect } from 'react';
import { Wallet, Settings2, ChevronDown, Check, ArrowLeft, LogOut, Copy, ExternalLink } from 'lucide-react';

interface NavbarProps {
  network: 'testnet' | 'mainnet';
  onNetworkChange: (network: 'testnet' | 'mainnet') => void;
  daoContract: string;
  onDaoContractChange: (dao: string) => void;
  policyContractId: string;
  onPolicyContractChange: (policy: string) => void;
  activeRole: 'council' | 'agent' | 'contributor';
  onRoleChange: (role: 'council' | 'agent' | 'contributor') => void;
  connectedAccount: string | null;
  onOpenWalletModal: () => void;
  onNavigateToLanding: () => void;
  currentPath?: string;
  onNavigateToDashboard?: () => void;
  onNavigateToBoard?: () => void;
}

export function Navbar({
  network,
  onNetworkChange,
  daoContract,
  onDaoContractChange,
  policyContractId,
  onPolicyContractChange,
  activeRole,
  onRoleChange,
  connectedAccount,
  onOpenWalletModal,
  onNavigateToLanding,
  currentPath = '/app',
  onNavigateToDashboard,
  onNavigateToBoard,
}: NavbarProps) {
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const connectionRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (connectionRef.current && !connectionRef.current.contains(event.target as Node)) {
        setConnectionOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (connectedAccount) {
      navigator.clipboard.writeText(connectedAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="border-b border-[var(--border-subtle)] px-3 sm:px-6 h-15 flex items-center justify-between bg-[var(--bg-canvas)]/95 backdrop-blur-md sticky top-0 z-40 w-full max-w-full overflow-hidden">
      {/* Left: Brand & Return to Landing */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={onNavigateToLanding}
          className="p-1.5 rounded hover:bg-[var(--bg-panel-alt)] text-[var(--text-secondary)] hover:text-white transition-colors"
          title="Return to landing page"
          aria-label="Return to landing page"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <img
            src="/brand/logo-mark.svg"
            alt="ZiniPay Logo"
            className="w-7 h-7 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-strong)] p-1 shrink-0"
          />
          <span className="font-bold text-base tracking-tight text-white font-sans shrink-0">
            ZiniPay
          </span>
        </div>

        {/* Navigation Switcher: Dashboard vs Public Board */}
        {(onNavigateToDashboard || onNavigateToBoard) && (
          <nav className="flex items-center gap-1 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-[var(--border-subtle)]">
            {onNavigateToDashboard && (
              <button
                type="button"
                onClick={onNavigateToDashboard}
                className={`px-2.5 py-1 rounded text-xs font-sans font-medium transition-colors cursor-pointer ${
                  currentPath === '/app'
                    ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                Dashboard
              </button>
            )}
            {onNavigateToBoard && (
              <button
                type="button"
                onClick={onNavigateToBoard}
                className={`px-2.5 py-1 rounded text-xs font-sans font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  currentPath === '/board'
                    ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <span>Public Board</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]"></span>
              </button>
            )}
          </nav>
        )}
      </div>

      {/* Right: Connection Settings Popover & Account Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Connection Button & Popover */}
        <div className="relative shrink-0" ref={connectionRef}>
          <button
            type="button"
            onClick={() => setConnectionOpen(!connectionOpen)}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded text-xs font-sans font-medium transition-colors border ${
              connectionOpen
                ? 'bg-[var(--bg-panel-alt)] text-white border-[var(--border-strong)]'
                : 'bg-transparent hover:bg-[var(--bg-panel-alt)] text-[var(--text-secondary)] hover:text-white border-[var(--border-subtle)]'
            }`}
            title="Configure DAO and policy contracts"
            aria-expanded={connectionOpen}
          >
            <Settings2 size={13} />
            <span className="hidden sm:inline">Connection</span>
          </button>

          {connectionOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-strong)] shadow-2xl p-4 z-50 flex flex-col gap-3.5 text-xs font-sans">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                <span className="font-semibold text-white">Contracts and network</span>
                <span className="tag-neutral text-[10px]">{network}</span>
              </div>

              {/* DAO Contract Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dao-contract-input" className="text-[var(--text-muted)] font-medium">
                  Sputnik DAO contract
                </label>
                <input
                  id="dao-contract-input"
                  value={daoContract}
                  onChange={(e) => onDaoContractChange(e.target.value.trim())}
                  placeholder="e.g. your-dao.sputnikv2.testnet"
                  className="w-full bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] focus:border-[var(--border-strong)] rounded px-2.5 py-1.5 text-white font-mono text-xs placeholder:text-gray-600 focus:outline-none"
                />
              </div>

              {/* Policy Contract Input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="policy-contract-input" className="text-[var(--text-muted)] font-medium">
                  Policy helper contract
                </label>
                <input
                  id="policy-contract-input"
                  value={policyContractId}
                  onChange={(e) => onPolicyContractChange(e.target.value.trim())}
                  placeholder="e.g. your-policy.testnet"
                  className="w-full bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] focus:border-[var(--border-strong)] rounded px-2.5 py-1.5 text-white font-mono text-xs placeholder:text-gray-600 focus:outline-none"
                />
              </div>

              {/* Network Selector */}
              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)]">Network</span>
                <div className="flex rounded bg-[var(--bg-panel-alt)] p-0.5 border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => onNetworkChange('testnet')}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      network === 'testnet' ? 'bg-[var(--bg-canvas)] text-white font-semibold' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Testnet
                  </button>
                  <button
                    type="button"
                    onClick={() => onNetworkChange('mainnet')}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      network === 'mainnet' ? 'bg-[var(--bg-canvas)] text-white font-semibold' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Mainnet
                  </button>
                </div>
              </div>

              {/* Custody Layer */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                <span className="text-[var(--text-muted)]">Custody layer</span>
                <span className="text-white font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                  Sputnik DAO / Trezu
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Account Button & Popover */}
        <div className="relative shrink-0" ref={accountRef}>
          {!connectedAccount ? (
            <button
              type="button"
              onClick={onOpenWalletModal}
              className="btn-secondary text-xs py-1.5 px-2.5 sm:px-3 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Wallet size={13} />
              <span className="hidden sm:inline">Connect wallet</span>
              <span className="sm:hidden">Connect</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAccountOpen(!accountOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] border border-[var(--border-subtle)] text-xs transition-colors"
              aria-expanded={accountOpen}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--color-passed)]" />
              <span className="font-mono text-white max-w-[100px] sm:max-w-[140px] truncate">
                {connectedAccount}
              </span>
              <span className="tag-neutral text-[10px] px-1 py-0 uppercase">
                {network}
              </span>
              <ChevronDown size={12} className="text-[var(--text-muted)]" />
            </button>
          )}

          {connectedAccount && accountOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-strong)] shadow-2xl p-3.5 z-50 flex flex-col gap-3 text-xs font-sans">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <span className="text-[var(--text-muted)] font-medium">Connected wallet</span>
                <span className="tag-passed text-[10px]">{network}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)]">
                <span className="font-mono text-white text-xs truncate max-w-[180px]">
                  {connectedAccount}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[var(--text-secondary)] hover:text-white p-1"
                  title="Copy account ID"
                >
                  {copied ? <Check size={12} className="text-[var(--color-passed)]" /> : <Copy size={12} />}
                </button>
              </div>

              {/* Preview As Role Switcher */}
              <div className="flex flex-col gap-1.5 pt-1 border-t border-[var(--border-subtle)]">
                <span className="text-[var(--text-muted)] text-[11px] font-medium">
                  Preview as
                </span>
                <div className="flex flex-col gap-1">
                  {[
                    { id: 'council', label: 'Council member', desc: 'Can vote to approve or reject releases' },
                    { id: 'agent', label: 'Agent proposer', desc: 'Can dispatch payout proposals' },
                    { id: 'contributor', label: 'Contributor', desc: 'Submits deliverables for review' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        onRoleChange(r.id as any);
                        setAccountOpen(false);
                      }}
                      className={`text-left p-2 rounded transition-colors flex items-center justify-between ${
                        activeRole === r.id ? 'bg-[var(--bg-panel-alt)] text-white' : 'hover:bg-[var(--bg-panel-alt)]/60 text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{r.label}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{r.desc}</span>
                      </div>
                      {activeRole === r.id && <Check size={12} className="text-[var(--color-passed)]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Switch Wallet Action */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    onOpenWalletModal();
                  }}
                  className="text-[var(--text-secondary)] hover:text-white text-xs flex items-center gap-1.5"
                >
                  <LogOut size={12} />
                  <span>Switch wallet</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
