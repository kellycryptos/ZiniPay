import React, { useState } from 'react';
import { Coins, RefreshCw, Wallet, Check, ChevronDown, Shield } from 'lucide-react';

interface NavbarProps {
  network: string;
  daoContract: string;
  treasuryBalance: number;
  loading: boolean;
  onRefresh: () => void;
  activeRole: 'council' | 'agent' | 'contributor';
  onRoleChange: (role: 'council' | 'agent' | 'contributor') => void;
}

export function Navbar({
  network,
  daoContract,
  treasuryBalance,
  loading,
  onRefresh,
  activeRole,
  onRoleChange,
}: NavbarProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="border-b border-[var(--border)] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0D0D14]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl near-gradient flex items-center justify-center shadow-lg shadow-purple-500/20 text-black shrink-0">
          <Coins size={22} className="text-black fill-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              ZiniPay <span className="text-sm">🪙🤖</span>
            </h1>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full font-semibold border border-purple-500/30">
              Sputnik DAO + Trezu
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Constrained AI Agent Releases · Proof + Policy + Human Quorum</p>
        </div>
      </div>

      {/* Status, Balances & Wallet */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Treasury Balance */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-900/90 px-3 py-1.5 rounded-xl border border-gray-800 text-xs font-mono">
          <span className="text-gray-400">Treasury:</span>
          <span className="text-emerald-400 font-bold">{treasuryBalance.toFixed(1)} NEAR</span>
        </div>

        {/* Contract Address */}
        <span className="text-xs text-gray-400 font-mono bg-gray-900/90 px-3 py-1.5 rounded-xl border border-gray-800">
          {daoContract}
        </span>

        {/* Network Pill */}
        <span className={`status-badge border ${
          network === 'testnet' ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30'
        }`}>
          {network}
        </span>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white border border-gray-800"
          title="Refresh on-chain state"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-medium text-gray-200 transition-colors"
          >
            <Shield size={13} className="text-purple-400" />
            <span className="capitalize">{activeRole} View</span>
            <ChevronDown size={13} className="text-gray-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-gray-900 border border-gray-700 shadow-xl py-1 z-50 text-xs font-mono">
              {[
                { id: 'council', label: 'Council / Finance (Vote)', desc: 'Full multi-sig signer' },
                { id: 'agent', label: 'ZiniPay Agent (Propose)', desc: 'Function-call key only' },
                { id: 'contributor', label: 'Contributor (Claim)', desc: 'Submit deliverables' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    onRoleChange(r.id as any);
                    setRoleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-purple-600/20 flex flex-col transition-colors"
                >
                  <div className="flex items-center justify-between text-white font-medium">
                    <span>{r.label}</span>
                    {activeRole === r.id && <Check size={12} className="text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-gray-400">{r.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Wallet Connect */}
        <button
          onClick={() => setWalletConnected(!walletConnected)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
            walletConnected
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-600/10'
              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
          }`}
        >
          <Wallet size={14} />
          {walletConnected ? 'Connected: council.testnet' : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
}
