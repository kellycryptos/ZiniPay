/**
 * PolicyPanel.tsx — displays Three-Way Match rules, Reputation Tiers, and Treasury Spend status
 */

import { ShieldCheck, Clock, TrendingUp, Award, Layers } from 'lucide-react';

interface PolicyConfig {
  maxSpendPerProposalNear: number;
  maxSpendPerDayNear: number;
  cooldownHours: number;
  minReputationScore: number;
}

interface DailySpend {
  count: number;
  totalNear: number;
}

interface Props {
  policy: PolicyConfig;
  daily: DailySpend;
}

export function PolicyPanel({ policy, daily }: Props) {
  const spendPct = Math.min(100, (daily.totalNear / policy.maxSpendPerDayNear) * 100);

  return (
    <div className="card p-5 flex flex-col gap-5">
      {/* Three-Way Match Engine Card */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-200 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            Three-Way Match Verification
          </h3>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
            SIMULATION DATA
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Payouts require 3 independent clearances before proposal submission:
        </p>
        <div className="flex flex-col gap-1.5 mt-1 text-xs">
          <div className="flex items-center gap-2 text-gray-300 bg-gray-900/80 p-2 rounded border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span><strong>Match A:</strong> Deliverable artifact proof (URL/CID)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 bg-gray-900/80 p-2 rounded border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span><strong>Match B:</strong> Reputation tier spend cap & cooldown</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 bg-gray-900/80 p-2 rounded border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span><strong>Match C:</strong> Zero replay (anti-double-spend ledger)</span>
          </div>
        </div>
      </div>

      {/* Daily Spend Bar */}
      <div className="flex flex-col gap-1.5 border-t border-[var(--border)] pt-4">
        <div className="flex justify-between text-xs text-gray-400">
          <span className="font-medium text-gray-300">Daily Spend Cap</span>
          <span className="font-mono">{daily.totalNear.toFixed(2)} / {policy.maxSpendPerDayNear.toFixed(2)} NEAR</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${spendPct}%`,
              background: spendPct > 80 ? '#f87171' : '#00EC97',
            }}
          />
        </div>
        <span className="text-xs text-gray-500">{daily.count} proposals executed today</span>
      </div>

      {/* Reputation Tiers */}
      <div className="flex flex-col gap-2 border-t border-[var(--border)] pt-4">
        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Award size={13} className="text-amber-400" /> Contributor Reputation Tiers
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-orange-950/20 border border-orange-800/40 p-2 rounded">
            <div className="text-orange-400 font-bold">Bronze</div>
            <div className="text-gray-400 text-[10px]">0 - 19 pts</div>
            <div className="text-gray-300 text-[11px] mt-1 font-mono">1.0x Cap</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/50 p-2 rounded">
            <div className="text-slate-200 font-bold">Silver</div>
            <div className="text-gray-400 text-[10px]">20 - 59 pts</div>
            <div className="text-emerald-400 text-[11px] mt-1 font-mono">1.5x Cap</div>
          </div>
          <div className="bg-amber-950/30 border border-amber-600/40 p-2 rounded">
            <div className="text-amber-300 font-bold">Gold</div>
            <div className="text-gray-400 text-[10px]">60+ pts</div>
            <div className="text-emerald-300 text-[11px] mt-1 font-mono">2.0x Cap</div>
          </div>
        </div>
      </div>

      {/* Constraints Summary */}
      <div className="grid grid-cols-2 gap-2 text-xs border-t border-[var(--border)] pt-3 text-gray-400">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-yellow-400" />
          <span>Cooldown: <strong className="text-white">{policy.cooldownHours}h</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers size={12} className="text-purple-400" />
          <span>Key: <strong className="text-white">Function-Call</strong></span>
        </div>
      </div>
    </div>
  );
}
