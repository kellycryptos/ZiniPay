import React, { useState } from 'react';
import { X, Wallet, Shield, Sparkles, ExternalLink } from 'lucide-react';
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
  const isDemo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const [customInput, setCustomInput] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  if (!isOpen) return null;

  const handleLaunchOfficialModal = async () => {
    setIsLaunching(true);
    try {
      const { modal } = await initNearWallet(network);
      modal.show();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLaunching(false);
    }
  };

  const DEMO_ACCOUNTS = [
    {
      id: 'judge-council.testnet',
      label: 'Judge / Council Multi-Sig Lead',
      role: 'council' as const,
      balance: '124.5 NEAR (Simulated)',
    },
    {
      id: 'zinipay-agent.testnet',
      label: 'ZiniPay Agent (Function-Call Key)',
      role: 'agent' as const,
      balance: '0.25 NEAR (Simulated)',
    },
    {
      id: 'contributor.testnet',
      label: 'Contributor (Gold Contributor)',
      role: 'contributor' as const,
      balance: '45.0 NEAR (Simulated)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="ledger-card bg-[var(--bg-panel)] border border-[var(--border-strong)] rounded-lg w-full max-w-md flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-panel-alt)]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--color-passed)]">
              <Wallet size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-sans">Connect NEAR Wallet</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Sputnik DAO Multi-Sig & Contributor Signer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-white rounded hover:bg-[var(--bg-canvas)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-5 text-slate-300">
          {connectedAccount ? (
            <div className="p-4 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-muted)]">Connected Account:</span>
                <span className="tag-passed">Active</span>
              </div>
              <div className="text-white font-bold text-sm break-all">
                {connectedAccount}
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between items-center text-[11px]">
                <span className="text-[var(--text-muted)]">Network: NEAR {network.toUpperCase()}</span>
                <button
                  type="button"
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="tag-blocked cursor-pointer hover:bg-[rgba(255,77,77,0.18)] transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Official NEAR Selector Button */}
              <button
                type="button"
                onClick={handleLaunchOfficialModal}
                disabled={isLaunching}
                className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wallet size={14} />
                <span>
                  {isLaunching ? 'Initializing Wallet Selector...' : 'Connect NEAR Wallet (MyNearWallet / Meteor / HERE)'}
                </span>
              </button>

              {/* Simulation Mode Profiles (Visible only in ?demo=1) */}
              {isDemo && (
                <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between text-[11px] text-[var(--color-pending)]">
                    <span className="flex items-center gap-1 font-bold">
                      <Sparkles size={12} />
                      <span>Simulation Profiles (?demo=1):</span>
                    </span>
                    <span className="tag-pending text-[10px]">SIMULATION</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          onConnect(acc.id, acc.role);
                          onClose();
                        }}
                        className="p-3 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] border border-[var(--border-subtle)] flex items-center justify-between transition-colors text-left"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{acc.label}</span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            <span>{acc.id}</span> · <span className="text-[var(--color-passed)]">{acc.balance}</span>
                          </div>
                        </div>
                        <span className="tag-pending text-[9px]">SIMULATION</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom NEAR Testnet Account Input */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                <label htmlFor="custom-wallet-input" className="text-[11px] text-[var(--text-muted)]">
                  Or input custom NEAR Testnet account ID:
                </label>
                <div className="flex gap-2">
                  <input
                    id="custom-wallet-input"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g., your-account.testnet"
                    className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-subtle)] rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-[var(--color-passed)]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customInput.trim()) {
                        onConnect(customInput.trim(), 'council');
                        onClose();
                      }
                    }}
                    disabled={!customInput.trim()}
                    className="btn-secondary py-2 px-4 text-xs font-bold disabled:opacity-40"
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
