import React, { useState } from 'react';
import { Shield, ExternalLink, Lock, CheckCircle, Clock, Users, AlertOctagon, Copy, Check } from 'lucide-react';
import { PolicyContractState } from '../lib/nearRpc';

interface PolicyPanelProps {
  treasuryBalance?: number;
  treasuryLoading?: boolean;
  treasuryError?: string;
  daoConfigured: boolean;
  daoContract?: string;
  policyState?: PolicyContractState | null;
  policyContractConfigured: boolean;
  policyContractId?: string;
  onOpenSecurityLog: () => void;
  securityEventCount: number;
  network?: 'testnet' | 'mainnet';
}

export function PolicyPanel({
  treasuryBalance,
  treasuryLoading,
  treasuryError,
  daoConfigured,
  daoContract = 'zinipay-demo.sputnikv2.testnet',
  policyState,
  policyContractConfigured,
  policyContractId = 'zinipay-policy2.testnet',
  onOpenSecurityLog,
  securityEventCount,
  network = 'testnet',
}: PolicyPanelProps) {
  const [copiedDao, setCopiedDao] = useState(false);
  const explorerBase = network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  const copyDao = () => {
    navigator.clipboard.writeText(daoContract);
    setCopiedDao(true);
    setTimeout(() => setCopiedDao(false), 2000);
  };

  // Compute on-chain policy limits if available
  const perPayoutCapNear = policyState
    ? `${(Number(BigInt(policyState.per_proposal_cap) / 10n ** 22n) / 100).toFixed(1)} NEAR`
    : treasuryLoading
    ? 'Syncing...'
    : 'Unavailable';

  const cooldownHours = policyState
    ? policyState.cooldown_seconds >= 3600
      ? `${(policyState.cooldown_seconds / 3600).toFixed(1)} h`
      : `${policyState.cooldown_seconds}s`
    : treasuryLoading
    ? 'Syncing...'
    : 'Unavailable';

  return (
    <div className="flex flex-col gap-4 font-sans text-xs">
      {/* 1. Treasury Vault Overview Card */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
              <Lock size={14} />
            </div>
            <span className="font-semibold text-white text-xs">Treasury</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00EC97] bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97] animate-pulse" />
            Sputnik DAO v2
          </span>
        </div>

        {/* Balance Display */}
        <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-1">
          {treasuryLoading ? (
            <div className="w-24 h-6 bg-white/[0.06] rounded animate-pulse" />
          ) : treasuryError ? (
            <div className="text-amber-400 font-mono text-xs">{treasuryError}</div>
          ) : (
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-white tracking-tight">
                {treasuryBalance !== undefined ? `${treasuryBalance.toFixed(2)} NEAR` : 'Unavailable'}
              </span>
              {treasuryBalance !== undefined && (
                <span className="text-[11px] text-[var(--text-muted)] font-mono">
                  ~${(treasuryBalance * 5.0).toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Contract Identifier */}
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
          <span className="font-mono text-[11px] text-slate-300 truncate max-w-[170px]" title={daoContract}>
            {daoContract}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={copyDao}
              className="p-1 text-[var(--text-muted)] hover:text-white rounded transition-colors cursor-pointer"
              title="Copy DAO Contract ID"
            >
              {copiedDao ? <Check size={12} className="text-[#00EC97]" /> : <Copy size={12} />}
            </button>
            <a
              href={`${explorerBase}/address/${daoContract}`}
              target="_blank"
              rel="noreferrer"
              className="p-1 text-[var(--text-muted)] hover:text-white rounded transition-colors"
              title="View on NEARBlocks"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* 2. On-Chain Policy Guardrails Card */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
              <Shield size={14} />
            </div>
            <span className="font-semibold text-white text-xs">Policy Guardrails</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">Rust</span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {/* Per Payout Cap */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs font-medium">Per-payout cap</span>
            <span className="font-mono text-xs font-semibold text-white bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
              {perPayoutCapNear}
            </span>
          </div>

          {/* Cooldown */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs font-medium">Cooldown</span>
            <span className="font-mono text-xs font-semibold text-white bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
              {cooldownHours}
            </span>
          </div>

          {/* Anti-Replay CID */}
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs font-medium">Anti-replay</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00EC97]">
              <CheckCircle size={12} />
              Enforced
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] flex items-center justify-between">
          <span>Policy contract</span>
          <span className="font-mono text-slate-300 truncate max-w-[150px]" title={policyContractId}>
            {policyContractId}
          </span>
        </div>
      </div>

      {/* 3. Council Multi-Sig Quorum Card */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
              <Users size={14} />
            </div>
            <span className="font-semibold text-white text-xs">Council Signers</span>
          </div>
          <span className="text-[10px] font-mono text-[#00EC97] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
            2-of-2 Quorum
          </span>
        </div>

        <div className="flex flex-col gap-1.5 text-[11px]">
          <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
              <span className="font-mono text-slate-200">zinipay-c1.testnet</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Council 1</span>
          </div>

          <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97]" />
              <span className="font-mono text-slate-200">zinipay-c2.testnet</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">Council 2</span>
          </div>

          <div className="p-2 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="font-mono text-slate-400">agentzinipay...</span>
            </div>
            <span className="text-[10px] text-amber-400/90 font-mono">0 Vote Weight</span>
          </div>
        </div>
      </div>

      {/* 4. Security Audit Log Trigger Card */}
      <button
        type="button"
        onClick={onOpenSecurityLog}
        className="bg-gradient-to-br from-red-950/20 to-[var(--bg-panel)] hover:from-red-950/30 hover:to-[#1A1F2C] border border-red-500/20 hover:border-red-500/40 rounded-xl p-3.5 flex items-center justify-between text-left transition-all cursor-pointer group shadow-lg"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400 group-hover:text-red-300 transition-colors">
            <AlertOctagon size={14} />
          </div>
          <span className="font-semibold text-white text-xs group-hover:text-red-200 transition-colors">
            Security Log
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
          {securityEventCount} Blocked
        </span>
      </button>
    </div>
  );
}
