import React from 'react';
import { Award, Users, ExternalLink, ShieldCheck, CheckCircle2, Scale, Info } from 'lucide-react';

interface ContributorReputationStripProps {
  policyContractId?: string;
  daoContract?: string;
  network?: 'testnet' | 'mainnet';
  contributorScore?: number | null;
}

export function ContributorReputationStrip({
  policyContractId = 'zinipay-policy2.testnet',
  daoContract = 'zinipay-demo.sputnikv2.testnet',
  network = 'testnet',
  contributorScore = 30,
}: ContributorReputationStripProps) {
  const explorerBase =
    network === 'mainnet' ? 'https://nearblocks.io' : 'https://testnet.nearblocks.io';

  const score = contributorScore ?? 30;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
      {/* ── LEFT (7 COLS): Contributor Reputation Cards ───────── */}
      <div className="lg:col-span-7 rounded-2xl bg-white/90 dark:bg-[#0F1815]/85 border border-slate-200 dark:border-slate-800/80 p-5 flex flex-col justify-between gap-4 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Contributor Reputation &amp; Track Record
              </h3>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Verified on-chain via {policyContractId}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[#00EC97] border border-emerald-500/30 self-start sm:self-auto font-semibold">
            Social Money Ledger
          </span>
        </div>

        {/* Primary Contributor Card: zinipay-recipient2.testnet */}
        <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-[#070D0C]/80 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00EC97] shadow-[0_0_8px_#00E599] shrink-0" />
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate" title="zinipay-recipient2.testnet">
                zinipay-recipient2.testnet
              </span>
              <a
                href={`${explorerBase}/address/zinipay-recipient2.testnet`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-[#00EC97] transition-colors"
                title="Inspect on NearBlocks"
              >
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Silver Tier Badge */}
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-800 dark:text-slate-100 text-[10px] font-mono font-bold border border-slate-300 dark:border-slate-500 flex items-center gap-1.5 shadow-sm self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-white" />
              <span>SILVER TIER (1.5x)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/70 text-[11px] font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Score</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{score} pts</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Spend Cap</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-[#00EC97]">15.0 NEAR</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Completed Tasks</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">2 Tasks</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Total Disbursed</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">0.20 NEAR</span>
            </div>
          </div>
        </div>

        {/* Secondary Contributor Card: alice-contributor.testnet (Demo) */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#070D0C]/50 border border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300">alice-contributor.testnet</span>
            <span className="text-[10px] text-slate-500">(Demo Contributor)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">
              BRONZE TIER (10 pts · 10N Cap)
            </span>
            <span className="text-slate-500 text-[10px]">1 Completed</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT (5 COLS): Visible Tier Policy Matrix ─────────── */}
      <div className="lg:col-span-5 rounded-2xl bg-white/90 dark:bg-[#0F1815]/85 border border-slate-200 dark:border-slate-800/80 p-5 flex flex-col justify-between gap-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
              <Scale size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Visible Tier Policy Matrix
              </h3>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Formula: Cap = Base (10N) × Multiplier
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-[#00EC97]">
            Enforced
          </span>
        </div>

        {/* 3 Tier Rows */}
        <div className="flex flex-col gap-2 font-mono text-xs">
          {/* Bronze */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070D0C]/60 border border-slate-200 dark:border-slate-800/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="font-bold text-amber-600 dark:text-amber-400">Bronze</span>
              <span className="text-slate-500 text-[10px]">0–19 pts</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 dark:text-white">10 NEAR</span>
              <span className="text-[10px] text-slate-500 block">Full DAO Quorum</span>
            </div>
          </div>

          {/* Silver */}
          <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Silver</span>
              <span className="text-slate-500 text-[10px]">20–59 pts</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-600 dark:text-[#00EC97]">15 NEAR (1.5x)</span>
              <span className="text-[10px] text-slate-500 block">1 vote ≤ 5N / 2 votes &gt; 5N</span>
            </div>
          </div>

          {/* Gold */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070D0C]/60 border border-slate-200 dark:border-slate-800/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
              <span className="font-bold text-yellow-600 dark:text-yellow-300">Gold</span>
              <span className="text-slate-500 text-[10px]">60+ pts</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-900 dark:text-white">20 NEAR (2.0x)</span>
              <span className="text-[10px] text-slate-500 block">Auto ≤ 2N / 1 vote ≤ 8N</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/70 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={11} className="text-[#00EC97]" />
            <span>Over-cap requests fail-closed on chain</span>
          </span>
          <span className="text-slate-500">60s Cooldown</span>
        </div>
      </div>
    </div>
  );
}
