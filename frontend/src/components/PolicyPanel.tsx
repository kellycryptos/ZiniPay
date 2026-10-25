/**
 * PolicyPanel.tsx — displays Three-Way Match rules, Reputation Tiers, and Treasury Spend status
 */

import { ShieldCheck, Clock, Award, Layers, Lock } from 'lucide-react';
import { PolicyContractState, DaoOnChainPolicy } from '../lib/nearRpc.ts';

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
  policy?: PolicyConfig;
  policyState?: PolicyContractState | null;
  daoPolicy?: DaoOnChainPolicy | null;
  policyContractId?: string;
  reputationScore?: number | null;
  isSimulated?: boolean;
  daily?: DailySpend;
}

export function PolicyPanel({
  policy,
  policyState,
  daoPolicy,
  policyContractId,
  reputationScore,
  isSimulated = false,
  daily = { count: 0, totalNear: 0 },
}: Props) {
  const capNear = policyState
    ? Number(BigInt(policyState.per_proposal_cap) / 10n ** 22n) / 100
    : policy?.maxSpendPerProposalNear ?? 15.0;

  const cooldownHours = policyState
    ? (policyState.cooldown_seconds / 3600).toFixed(1)
    : policy?.cooldownHours ?? 4;

  const minReputation = policyState
    ? policyState.min_reputation
    : policy?.minReputationScore ?? 0;

  const maxDailyNear = policy?.maxSpendPerDayNear ?? 50.0;
  const spendPct = Math.min(100, (daily.totalNear / maxDailyNear) * 100);

  const proposalBondNear = daoPolicy?.proposal_bond
    ? (Number(BigInt(daoPolicy.proposal_bond) / 10n ** 22n) / 100).toFixed(2)
    : '0.10';

  return (
    <div className="card p-5 flex flex-col gap-5">
      {/* Three-Way Match Engine Card */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-200 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            Three-Way Match Release Gate
          </h3>
          {isSimulated ? (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-bold">
              SIMULATION DATA
            </span>
          ) : policyState ? (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">
              ON-CHAIN ENFORCED
            </span>
          ) : (
            <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded font-mono">
              TESTNET ACTIVE
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Payouts require 3 independent clearances enforced on-chain before release:
        </p>
        <div className="flex flex-col gap-1.5 mt-1 text-xs">
          <div className="flex items-center gap-2 text-gray-300 bg-gray-900/80 p-2 rounded border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span><strong>Match A:</strong> Deliverable artifact verified (PR merged / CID resolved)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 bg-gray-900/80 p-2 rounded border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span><strong>Match B:</strong> Tier spend cap ({capNear}N base) & cooldown ({cooldownHours}h)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 bg-gray-900/80 p-2 rounded border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span><strong>Match C:</strong> Zero-double-spend (CID anti-replay recorded on-chain)</span>
          </div>
        </div>
      </div>

      {/* Contributor Reputation Readout if available */}
      {reputationScore !== undefined && reputationScore !== null && (
        <div className="flex items-center justify-between text-xs bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-xl">
          <span className="text-gray-300 font-medium">Connected Contributor Score:</span>
          <span className="font-mono font-bold text-purple-300">
            {reputationScore} pts ({reputationScore >= 60 ? 'Gold' : reputationScore >= 20 ? 'Silver' : 'Bronze'})
          </span>
        </div>
      )}

      {/* Daily Spend Bar */}
      <div className="flex flex-col gap-1.5 border-t border-[var(--border)] pt-4">
        <div className="flex justify-between text-xs text-gray-400">
          <span className="font-medium text-gray-300">Spend Budget</span>
          <span className="font-mono">{daily.totalNear.toFixed(2)} / {maxDailyNear.toFixed(2)} NEAR</span>
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
        <span className="text-xs text-gray-500">
          {daily.count} proposal{daily.count === 1 ? '' : 's'} tracked in session
        </span>
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
            <div className="text-gray-300 text-[11px] mt-1 font-mono">1.0x ({(capNear * 1.0).toFixed(1)}N)</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/50 p-2 rounded">
            <div className="text-slate-200 font-bold">Silver</div>
            <div className="text-gray-400 text-[10px]">20 - 59 pts</div>
            <div className="text-emerald-400 text-[11px] mt-1 font-mono">1.5x ({(capNear * 1.5).toFixed(1)}N)</div>
          </div>
          <div className="bg-amber-950/30 border border-amber-600/40 p-2 rounded">
            <div className="text-amber-300 font-bold">Gold</div>
            <div className="text-gray-400 text-[10px]">60+ pts</div>
            <div className="text-emerald-300 text-[11px] mt-1 font-mono">2.0x ({(capNear * 2.0).toFixed(1)}N)</div>
          </div>
        </div>
      </div>

      {/* Constraints Summary */}
      <div className="grid grid-cols-2 gap-2 text-xs border-t border-[var(--border)] pt-3 text-gray-400">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-yellow-400" />
          <span>Cooldown: <strong className="text-white">{cooldownHours}h</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock size={12} className="text-blue-400" />
          <span>Bond: <strong className="text-white">{proposalBondNear}N</strong></span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <Layers size={12} className="text-purple-400" />
          <span>Policy Contract: <strong className="text-white font-mono text-[11px] truncate">{policyState ? policyContractId : 'Genesis Policy'}</strong></span>
        </div>
      </div>
    </div>
  );
}
