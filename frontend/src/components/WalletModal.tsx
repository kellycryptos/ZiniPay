import React, { useState } from 'react';
import { X, Wallet, Check, Shield, UserCheck, Sparkles, ExternalLink, Globe } from 'lucide-react';
import { initNearWallet } from '../lib/wallet.ts';

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
      badge: 'SIMULATION',
      balance: '124.5 NEAR (Simulated)',
    },
    {
      id: 'zinipay-agent.testnet',
      label: 'ZiniPay Agent (Function-Call Key)',
      role: 'agent' as const,
      badge: 'SIMULATION',
      balance: '0.25 NEAR (Simulated)',
    },
    {
      id: 'alice.testnet',
      label: 'Alice (Gold Contributor)',
      role: 'contributor' as const,
      badge: 'SIMULATION',
      balance: '45.0 NEAR (Simulated)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E0E17] border border-gray-800 rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#12121E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Wallet size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">NEAR Testnet Wallet</h3>
              <p className="text-xs text-gray-400 mt-0.5">Connect to interact with Sputnik DAO v2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 text-xs text-gray-300">
          
          {connectedAccount ? (
            <div className="p-4 rounded-xl bg-gray-900 border border-emerald-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Connected Account:</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                  Active
                </span>
              </div>
              <div className="font-mono text-sm font-bold text-white break-all">
                {connectedAccount}
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                <span className="text-[11px] text-gray-400">Network: NEAR Testnet</span>
                <button
                  onClick={() => {
                    onDisconnect();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors font-medium text-xs"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              
              {/* Official NEAR Selector Button */}
              <button
                onClick={handleLaunchOfficialModal}
                disabled={isLaunching}
                className="w-full py-3 px-4 rounded-xl near-gradient text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-lg shadow-emerald-500/20"
              >
                <Wallet size={16} />
                <span>{isLaunching ? 'Connecting...' : `Connect Real Wallet (MyNearWallet / Meteor / HERE)`}</span>
              </button>

              <div className="flex items-center gap-2 my-1">
                <div className="h-px bg-gray-800 flex-1"></div>
                <span className="text-[10px] text-gray-500 uppercase font-mono">or 1-click profiles</span>
                <div className="h-px bg-gray-800 flex-1"></div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                <Sparkles size={14} />
                <span>Evaluation Profiles (SIMULATION ONLY):</span>
              </div>

              <div className="flex flex-col gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      onConnect(acc.id, acc.role);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl bg-gray-900/90 hover:bg-gray-800/90 border border-gray-800 hover:border-purple-500/50 flex items-center justify-between transition-all text-left group"
                  >
                    <div>
                      <div className="font-bold text-white group-hover:text-purple-300 flex items-center gap-2">
                        <span>{acc.label}</span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5 flex items-center gap-2">
                        <span>{acc.id}</span>
                        <span className="text-gray-600">·</span>
                        <span className="text-emerald-400 font-medium">{acc.balance}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
                      {acc.badge}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="pt-3 border-t border-gray-800 flex flex-col gap-2">
                <label className="text-[11px] text-gray-400 font-medium">Or enter your custom NEAR Testnet Account:</label>
                <div className="flex gap-2">
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="my-wallet.testnet"
                    className="flex-1 bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => {
                      if (customInput.trim()) {
                        onConnect(customInput.trim(), 'council');
                        onClose();
                      }
                    }}
                    disabled={!customInput.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs disabled:opacity-40 transition-colors"
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
