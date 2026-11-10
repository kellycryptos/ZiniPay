import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Clock,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Info,
  Scale,
  Users,
} from 'lucide-react';
import { PolicyContractState } from '../../lib/nearRpc';

interface PolicyCardProps {
  policyState?: PolicyContractState | null;
  policyContractId?: string;
  daoContract?: string;
  network?: 'testnet' | 'mainnet';
  isLoading?: boolean;
}

export function PolicyCard({
  policyState,
  policyContractId = 'zinipay-policy2.testnet',
  daoContract = 'zinipay-demo.sputnikv2.testnet',
  network = 'testnet',
  isLoading = false,
}: PolicyCardProps) {
  const [copiedContract, setCopiedContract] = useState(false);
  const explorerBase =
    network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  const copyContract = () => {
    navigator.clipboard.writeText(policyContractId);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  // Base Cap from contract (e.g. 10000000000000000000000000 yocto = 10 NEAR)
  const baseCapNear = policyState?.per_proposal_cap
    ? (Number(BigInt(policyState.per_proposal_cap) / 10n ** 22n) / 100).toFixed(1)
    : '10.0';

  const cooldownSecs = policyState ? policyState.cooldown_seconds : 60;
  const contractOwner = policyState?.owner || daoContract;

  return (
    <div className="bg-[#0F1815]/90 border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.05)] backdrop-blur-md flex flex-col gap-6">
      
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#00E599] shadow-[0_0_15px_rgba(0,229,153,0.2)]">
            <Shield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-bold text-white text-base sm:text-lg tracking-tight">
                PolicyHelper Governance Guardrails
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-[#00E599] border border-emerald-500/40 font-semibold shadow-[0_0_8px_rgba(0,229,153,0.15)]">
                Rust Contract
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Spend caps, anti-replay, and cooldowns enforced on-chain before proposal creation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={copyContract}
            className="px-3 py-1.5 rounded-xl bg-[#070D0C]/80 hover:bg-slate-800/60 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-inner"
            title="Copy contract ID"
          >
            {copiedContract ? <Check size={13} className="text-[#00E599]" /> : <Copy size={13} />}
            <span>{policyContractId}</span>
          </button>
          <a
            href={`${explorerBase}/address/${policyContractId}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-[#070D0C]/80 hover:bg-slate-800/60 border border-slate-800 text-slate-400 hover:text-[#00E599] transition-colors shadow-inner"
            title="Inspect PolicyHelper on NEARBlocks"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* ── 4 Key Parameters Grid with Top Accent Borders ─────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Param 1: Base Spend Cap */}
        <div className="p-4 rounded-xl bg-[#0B1310]/80 border border-slate-800/80 border-t-2 border-t-emerald-500/50 flex flex-col gap-1.5 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Base Spend Cap
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-white tracking-tight">
            {isLoading ? '...' : `${baseCapNear} NEAR`}
          </span>
          <span className="text-[10px] text-[#00E599] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599]" />
            Enforced on-chain
          </span>
        </div>

        {/* Param 2: Tier Scale */}
        <div className="p-4 rounded-xl bg-[#0B1310]/80 border border-slate-800/80 border-t-2 border-t-emerald-500/50 flex flex-col gap-1.5 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Tier Scale
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-white tracking-tight">
            1.0x / 1.5x / 2.0x
          </span>
          <span className="text-[10px] text-[#00E599] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599]" />
            Enforced on-chain
          </span>
        </div>

        {/* Param 3: Cooldown */}
        <div className="p-4 rounded-xl bg-[#0B1310]/80 border border-slate-800/80 border-t-2 border-t-emerald-500/50 flex flex-col gap-1.5 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Cooldown
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-white tracking-tight">
            {isLoading ? '...' : `${cooldownSecs}s`}
          </span>
          <span className="text-[10px] text-[#00E599] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599]" />
            Enforced on-chain
          </span>
        </div>

        {/* Param 4: Contract Owner */}
        <div className="p-4 rounded-xl bg-[#0B1310]/80 border border-slate-800/80 border-t-2 border-t-emerald-500/50 flex flex-col gap-1.5 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Contract Owner
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-white truncate" title={contractOwner}>
            {contractOwner}
          </span>
          <span className="text-[10px] text-emerald-400/80 font-mono">
            Sputnik DAO v2
          </span>
        </div>

      </div>

      {/* ── Tier Matrix Table (Enforced vs Advisory) ───────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Reputation &amp; Tier Policy Matrix
          </span>
          <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1.5">
            <Info size={13} />
            <span>Enforced Caps vs. Advisory Approval</span>
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#070D0C]/60 shadow-inner">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#0B1310]/90 text-[11px] font-mono text-slate-400 border-b border-slate-800/70">
              <tr>
                <th className="py-3 px-4 font-semibold">Tier</th>
                <th className="py-3 px-4 font-semibold">Reputation Score</th>
                <th className="py-3 px-4 font-semibold">Effective Spend Cap</th>
                <th className="py-3 px-4 font-semibold">Approval Schedule</th>
                <th className="py-3 px-4 font-semibold">Enforcement Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-200">
              
              {/* Bronze */}
              <tr className="hover:bg-emerald-500/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-semibold text-amber-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                  Bronze
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">0 – 19 pts</td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">
                  10 NEAR <span className="text-[10px] text-slate-500 font-normal">(1.0x base)</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  2 votes (all amounts ≤ 10N) · FullDaoQuorum
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/60 text-[#00E599] border border-emerald-500/30 shadow-[0_0_6px_rgba(0,229,153,0.15)]">
                    <CheckCircle2 size={11} />
                    Cap Enforced · Schedule Advisory
                  </span>
                </td>
              </tr>

              {/* Silver */}
              <tr className="hover:bg-emerald-500/[0.02] transition-colors bg-white/[0.01]">
                <td className="py-3.5 px-4 font-semibold text-slate-200 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300 shadow-[0_0_6px_rgba(203,213,225,0.5)]" />
                  Silver
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">20 – 59 pts</td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">
                  15 NEAR <span className="text-[10px] text-slate-500 font-normal">(1.5x base)</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  1 vote (≤ 5N) · 2 votes (&gt; 5N)
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/60 text-[#00E599] border border-emerald-500/30 shadow-[0_0_6px_rgba(0,229,153,0.15)]">
                    <CheckCircle2 size={11} />
                    Cap Enforced · Schedule Advisory
                  </span>
                </td>
              </tr>

              {/* Gold */}
              <tr className="hover:bg-emerald-500/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-semibold text-yellow-300 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
                  Gold
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">60+ pts</td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">
                  20 NEAR <span className="text-[10px] text-slate-500 font-normal">(2.0x base)</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  AutoApprove (≤ 2N) · 1 vote (≤ 8N) · 2 votes (&gt; 8N)
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/60 text-[#00E599] border border-emerald-500/30 shadow-[0_0_6px_rgba(0,229,153,0.15)]">
                    <CheckCircle2 size={11} />
                    Cap Enforced · Schedule Advisory
                  </span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* ── Enforced vs Advisory Notice Box ──────────────────── */}
      <div className="p-4 rounded-xl bg-[#070D0C]/80 border border-emerald-500/20 flex items-start gap-3.5 text-xs leading-relaxed shadow-sm">
        <Scale size={20} className="text-[#00E599] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5">
          <p className="font-bold text-white">
            Enforced vs. Advisory Clarity:
          </p>
          <p className="text-slate-300">
            <span className="text-[#00E599] font-mono font-semibold">Enforced:</span> Tier caps (10 / 15 / 20 NEAR), the 60-second cooldown, and one-time deliverable CIDs are strictly enforced on-chain by the PolicyHelper Rust contract. Any proposal violating these limits is blocked before creation.
          </p>
          <p className="text-slate-400">
            <span className="text-amber-400 font-mono font-semibold">Advisory:</span> The approval schedule from <code className="font-mono text-slate-200 bg-slate-800/80 px-1 py-0.5 rounded">get_approval_tier</code> is advisory only. Every actual payout requires Sputnik DAO v2 council 2-of-2 human multi-sig quorum before funds can execute.
          </p>
        </div>
      </div>

    </div>
  );
}
