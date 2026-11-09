import React, { useState } from 'react';
import { X, Wallet, Shield, ExternalLink, ArrowRight, Eye, User } from 'lucide-react';
import { initNearWallet } from '../lib/wallet';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  network?: 'testnet' | 'mainnet';
  connectedAccount: string | null;
  activeRole?: 'council' | 'agent' | 'contributor';
  isSimulated?: boolean;
  onConnectObserver: (accountId: string) => void;
  onLaunchSelector?: () => void;
  onDisconnect: () => void;
}

export function WalletModal({
  isOpen,
  onClose,
  network = 'testnet',
  connectedAccount,
  activeRole = 'contributor',
  isSimulated = false,
  onConnectObserver,
  onLaunchSelector,
  onDisconnect,
}: WalletModalProps) {
  const [customInput, setCustomInput] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLaunchOfficialModal = async () => {
    if (onLaunchSelector) {
      onLaunchSelector();
      onClose();
      return;
    }
    setIsLaunching(true);
    setErrorMsg(null);
    try {
      const { modal } = await initNearWallet(network);
      modal.show();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to initialize NEAR Wallet Selector (12s timeout)');
    } finally {
      setIsLaunching(false);
    }
  };

  const OBSERVER_PRESETS = [
    {
      id: 'zinipay-c1.testnet',
      label: 'Council Member 1',
      role: 'council',
      desc: 'On-chain Sputnik DAO council member. Preview interface in read-only mode.',
    },
    {
      id: 'zinipay-recipient2.testnet',
      label: 'Contributor',
      role: 'contributor',
      desc: 'Verified contributor with PR #2 payout. Preview reputation and claims in read-only mode.',
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
              <h3 className="font-bold text-sm text-[var(--text-primary)]">NEAR Account & Identity</h3>
              <p className="text-[11px] font-mono text-[var(--color-passed)] mt-0.5">
                NEAR {network.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-canvas)] transition-colors cursor-pointer"
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
                <span className="text-[11px] text-[var(--text-muted)] font-medium">Active Account:</span>
                {isSimulated ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/60 text-amber-400 border border-amber-500/30">
                    <Eye size={11} />
                    Observer Mode (Read-Only)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 text-[#00EC97] border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97] animate-pulse" />
                    Verified Signer ({activeRole.toUpperCase()})
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)]">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[var(--text-primary)] font-bold font-mono text-sm break-all">
                    {connectedAccount}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    On-chain role: <span className="text-slate-200 font-mono font-medium">{activeRole}</span>
                  </span>
                </div>
                <a
                  href={`https://${network === 'testnet' ? 'testnet.' : ''}nearblocks.io/address/${connectedAccount}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition-colors"
                  title="View on NEARBlocks"
                >
                  <ExternalLink size={14} />
                </a>
              </div>

              {isSimulated ? (
                <div className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-md p-2.5 leading-relaxed">
                  <strong>Observer Mode Active:</strong> You are viewing the dashboard through this account's perspective. Observer mode is strictly read-only and cannot cast votes or sign transactions on NEAR.
                </div>
              ) : (
                <div className="text-[11px] text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2.5 leading-relaxed">
                  <strong>Cryptographic Session Active:</strong> Real NEAR wallet connected via selector. On-chain votes are signed and verified against the Sputnik DAO policy.
                </div>
              )}

              <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center text-[11px]">
                <button
                  type="button"
                  onClick={handleLaunchOfficialModal}
                  disabled={isLaunching}
                  className="text-xs text-[#00EC97] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Wallet size={12} />
                  <span>Connect Different Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="px-3 py-1 rounded bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-500/20 text-xs cursor-pointer transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            /* Connect Options */
            <div className="flex flex-col gap-5">
              {/* Option 1: Official NEAR Wallets */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    Connect NEAR Wallet
                  </span>
                  <span className="text-[10px] text-[#00EC97] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                    Required to Vote
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLaunchOfficialModal}
                  disabled={isLaunching}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-cyan-900/30 hover:from-emerald-800/50 hover:to-cyan-800/40 border border-emerald-500/40 hover:border-[#00EC97] text-[var(--text-primary)] font-medium flex items-center justify-between transition-all shadow-lg cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-black/40 text-[#00EC97]">
                      <Wallet size={16} />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[#00EC97] transition-colors">
                        {isLaunching ? 'Initializing Wallet Selector...' : 'Launch NEAR Wallet Selector'}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        MyNearWallet · Meteor · HERE Wallet (12s timeout)
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* Option 2: View as (Read-Only Observer Mode) */}
              <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Eye size={12} className="text-amber-400" />
                    <span>View as (Read-Only Observer)</span>
                  </span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                    Cannot Vote
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Inspect the treasury interface from any account's viewpoint without signing keys. Observer mode is strictly read-only and cannot cast on-chain votes:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {OBSERVER_PRESETS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        onConnectObserver(acc.id);
                        onClose();
                      }}
                      className="p-2.5 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[#1A1F2C] border border-[var(--border-subtle)] hover:border-amber-500/40 flex flex-col gap-1 text-left cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--text-primary)] text-xs group-hover:text-amber-300">
                          {acc.label}
                        </span>
                        <span className="text-[9px] font-mono px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Observer
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 truncate">
                        {acc.id}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter any account.testnet"
                    className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] font-mono placeholder:text-gray-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customInput.trim()) {
                        onConnectObserver(customInput.trim());
                        onClose();
                      }
                    }}
                    disabled={!customInput.trim()}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    View as Observer
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
