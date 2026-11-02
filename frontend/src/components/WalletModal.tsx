import React, { useState } from 'react';
import { X, Wallet, Shield, Sparkles, ExternalLink, Check, ArrowRight, UserCheck, Bot, User } from 'lucide-react';
import { initNearWallet } from '../lib/wallet';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  network?: 'testnet' | 'mainnet';
  connectedAccount: string | null;
  onConnect: (accountId: string, role: 'council' | 'agent' | 'contributor') => void;
  onDisconnect: () => void;
}

export function WalletModal({
  isOpen,
  onClose,
  network = 'testnet',
  connectedAccount,
  onConnect,
  onDisconnect,
}: WalletModalProps) {
  const [customInput, setCustomInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<'council' | 'agent' | 'contributor'>('council');
  const [isLaunching, setIsLaunching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLaunchOfficialModal = async () => {
    setIsLaunching(true);
    setErrorMsg(null);
    try {
      const { modal } = await initNearWallet(network);
      modal.show();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to initialize NEAR Wallet Selector');
    } finally {
      setIsLaunching(false);
    }
  };

  const TESTNET_PASSPORTS = [
    {
      id: 'zinipay-c1.testnet',
      label: 'Council Member Lead',
      role: 'council' as const,
      desc: 'Sputnik DAO multi-sig council member. Can vote to Approve or Reject payouts.',
      badge: 'Council Signer',
      icon: Shield,
    },
    {
      id: 'agentzinipaytestnet.testnet',
      label: 'ZiniPay Agent Proposer',
      role: 'agent' as const,
      desc: 'Authorized agent worker key. Dispatches verified proposals to Sputnik DAO.',
      badge: 'Agent Proposer',
      icon: Bot,
    },
    {
      id: 'zinipay-recipient2.testnet',
      label: 'Verified Contributor',
      role: 'contributor' as const,
      desc: 'Technical contributor with merged GitHub PR #2. Receives approved treasury payouts.',
      badge: 'Contributor',
      icon: User,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--bg-panel)] border border-[var(--border-strong)] rounded-xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden font-sans text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-panel-alt)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Connect NEAR Account</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Sign votes as a Council Member, or propose as an Agent on NEAR {network.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-white rounded-md hover:bg-[var(--bg-canvas)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-5 text-slate-300 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 rounded-md bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {connectedAccount ? (
            /* Active Connected State */
            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-muted)] font-medium">Currently Connected:</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-[#00EC97] border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97] animate-pulse" />
                  Active Signer
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)]">
                <span className="text-white font-bold font-mono text-sm break-all">
                  {connectedAccount}
                </span>
                <a
                  href={`https://${network === 'testnet' ? 'testnet.' : ''}nearblocks.io/address/${connectedAccount}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-[var(--text-muted)] hover:text-white rounded transition-colors"
                  title="View on NEARBlocks"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center text-[11px]">
                <span className="text-[var(--text-muted)]">Network: NEAR {network.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="px-3 py-1 rounded bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-500/20 text-xs cursor-pointer transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          ) : (
            /* Connect Options */
            <div className="flex flex-col gap-4">
              {/* Option 1: Official NEAR Wallets */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Option 1: Official NEAR Wallet
                </span>
                <button
                  type="button"
                  onClick={handleLaunchOfficialModal}
                  disabled={isLaunching}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-cyan-900/30 hover:from-emerald-800/50 hover:to-cyan-800/40 border border-emerald-500/40 hover:border-[#00EC97] text-white font-medium flex items-center justify-between transition-all shadow-lg cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-black/40 text-[#00EC97]">
                      <Wallet size={16} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white group-hover:text-[#00EC97] transition-colors">
                        {isLaunching ? 'Initializing Wallet Selector...' : 'Launch NEAR Wallet Selector'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        MyNearWallet · Meteor · HERE · Sender
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* Option 2: 1-Click Instant Testnet Passports */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#00EC97]" />
                    <span>Option 2: 1-Click Testnet Passports</span>
                  </span>
                  <span className="text-[10px] text-[#00EC97] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                    Instant Demo
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  No extension or seed phrase needed. Click a role below to immediately test council quorum voting or proposal dispatching on NEAR testnet:
                </p>

                <div className="flex flex-col gap-2 mt-1">
                  {TESTNET_PASSPORTS.map((acc) => {
                    const IconComp = acc.icon;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          onConnect(acc.id, acc.role);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-[var(--bg-panel-alt)] hover:bg-[#1A1F2C] border border-[var(--border-subtle)] hover:border-[#00EC97]/40 flex items-center justify-between transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97] shrink-0 mt-0.5">
                            <IconComp size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white text-xs group-hover:text-[#00EC97] transition-colors flex items-center gap-2">
                              <span>{acc.label}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-[var(--text-muted)] font-mono">
                                {acc.badge}
                              </span>
                            </div>
                            <div className="font-mono text-[11px] text-[#00EC97]/80 truncate mt-0.5">
                              {acc.id}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                              {acc.desc}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-white shrink-0 ml-2 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option 3: Custom Account Entry */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Option 3: Enter Any NEAR Account ID
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. your-account.testnet"
                    className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-[#00EC97] rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none"
                  />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-[#00EC97] rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="council">Council Member</option>
                    <option value="agent">Agent Proposer</option>
                    <option value="contributor">Contributor</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (customInput.trim()) {
                        onConnect(customInput.trim(), selectedRole);
                        onClose();
                      }
                    }}
                    disabled={!customInput.trim()}
                    className="px-4 py-2 rounded-lg bg-[#00EC97] hover:bg-[#00EC97]/90 text-black font-semibold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
