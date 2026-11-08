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
    <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-5 shadow-lg">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[#00EC97]">
            <Shield size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white text-base">PolicyHelper Governance Guardrails</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-[#00EC97] border border-emerald-500/30">
                Rust Contract
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Spend caps, anti-replay, and cooldowns enforced on-chain before proposal creation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={copyContract}
            className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] hover:bg-[#1E232F] border border-[var(--border-subtle)] text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy contract ID"
          >
            {copiedContract ? <Check size={12} className="text-[#00EC97]" /> : <Copy size={12} />}
            <span>{policyContractId}</span>
          </button>
          <a
            href={`${explorerBase}/address/${policyContractId}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-[var(--bg-canvas)] hover:bg-[#1E232F] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[#00EC97] transition-colors"
            title="Inspect PolicyHelper on NEARBlocks"
          >
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* ── Key Parameters Grid ───────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Base Spend Cap</span>
          <span className="font-mono text-base font-bold text-white">
            {isLoading ? '...' : `${baseCapNear} NEAR`}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Enforced on-chain</span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Tier Scale</span>
          <span className="font-mono text-base font-bold text-white">1.0x / 1.5x / 2.0x</span>
          <span className="text-[10px] text-emerald-400 font-mono">Enforced on-chain</span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Cooldown</span>
          <span className="font-mono text-base font-bold text-white">
            {isLoading ? '...' : `${cooldownSecs}s`}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Enforced on-chain</span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">Contract Owner</span>
          <span className="font-mono text-xs font-bold text-white truncate" title={contractOwner}>
            {contractOwner}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Sputnik DAO v2</span>
        </div>
      </div>

      {/* ── Tier Matrix Table (Enforced vs Advisory) ───────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            Reputation & Tier Policy Matrix
          </span>
          <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
            <Info size={12} />
            <span>Enforced Caps vs. Advisory Approval</span>
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--bg-canvas)] text-[11px] font-mono text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Reputation Score</th>
                <th className="py-2.5 px-3">Effective Spend Cap</th>
                <th className="py-2.5 px-3">Approval Schedule</th>
                <th className="py-2.5 px-3">Enforcement Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-slate-200">
              {/* Bronze */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 font-semibold text-amber-300 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Bronze
                </td>
                <td className="py-3 px-3 font-mono">0 – 19 pts</td>
                <td className="py-3 px-3 font-mono font-bold text-white">
                  10 NEAR <span className="text-[10px] text-[var(--text-muted)] font-normal">(1.0x base)</span>
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">
                  2 votes (all amounts ≤ 10N) · FullDaoQuorum
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={10} />
                    Cap Enforced · Schedule Advisory
                  </span>
                </td>
              </tr>

              {/* Silver */}
              <tr className="hover:bg-white/[0.02] transition-colors bg-white/[0.01]">
                <td className="py-3 px-3 font-semibold text-slate-200 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  Silver
                </td>
                <td className="py-3 px-3 font-mono">20 – 59 pts</td>
                <td className="py-3 px-3 font-mono font-bold text-white">
                  15 NEAR <span className="text-[10px] text-[var(--text-muted)] font-normal">(1.5x base)</span>
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">
                  1 vote (≤ 5N) · 2 votes (&gt; 5N)
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={10} />
                    Cap Enforced · Schedule Advisory
                  </span>
                </td>
              </tr>

              {/* Gold */}
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 font-semibold text-yellow-300 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  Gold
                </td>
                <td className="py-3 px-3 font-mono">60+ pts</td>
                <td className="py-3 px-3 font-mono font-bold text-white">
                  20 NEAR <span className="text-[10px] text-[var(--text-muted)] font-normal">(2.0x base)</span>
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">
                  AutoApprove (≤ 2N) · 1 vote (≤ 8N) · 2 votes (&gt; 8N)
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={10} />
                    Cap Enforced · Schedule Advisory
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Enforced vs Advisory Notice Box ──────────────────── */}
      <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-emerald-500/20 flex items-start gap-3 text-xs leading-relaxed">
        <Scale size={18} className="text-[#00EC97] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-white">
            Enforced vs. Advisory Clarity:
          </p>
          <p className="text-[var(--text-secondary)]">
            <span className="text-emerald-400 font-mono">Enforced:</span> Tier caps (10 / 15 / 20 NEAR), the 60-second cooldown, and one-time deliverable CIDs are strictly enforced on-chain by the PolicyHelper Rust contract. Any proposal violating these limits is blocked before creation.
          </p>
          <p className="text-[var(--text-secondary)]">
            <span className="text-amber-400 font-mono">Advisory:</span> The approval schedule from <code className="font-mono text-white">get_approval_tier</code> is advisory only. Every actual payout requires Sputnik DAO v2 council 2-of-2 human multi-sig quorum before funds can execute.
          </p>
        </div>
      </div>
    </div>
  );
}
