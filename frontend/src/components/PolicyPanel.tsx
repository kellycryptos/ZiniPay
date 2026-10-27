import React from 'react';
import { ShieldCheck, Clock, Award, Layers, Lock } from 'lucide-react';
import { PolicyContractState, DaoOnChainPolicy } from '../lib/nearRpc';

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

  const maxDailyNear = policy?.maxSpendPerDayNear ?? 50.0;
  const spendPct = Math.min(100, (daily.totalNear / maxDailyNear) * 100);

  const proposalBondNear = daoPolicy?.proposal_bond
    ? (Number(BigInt(daoPolicy.proposal_bond) / 10n ** 22n) / 100).toFixed(2)
    : '0.10';

  return (
    <div className="ledger-card p-5 flex flex-col gap-5 font-mono text-xs text-slate-300">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[var(--color-passed)]" />
            <h3 className="font-bold text-sm text-white font-sans">
              Three-Way Release Limits
            </h3>
          </div>
          {isSimulated ? (
            <span className="tag-pending text-[10px]">
              SIMULATION
            </span>
          ) : policyState ? (
            <span className="tag-passed text-[10px]">
              ON-CHAIN
            </span>
          ) : (
            <span className="tag-neutral text-[10px]">
              TESTNET ACTIVE
            </span>
          )}
        </div>

        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          On-chain constraints enforced fail-closed before any treasury capital is released:
        </p>

        {/* 3 Matches Summary */}
        <div className="flex flex-col gap-2 mt-1 text-[11px]">
          <div className="flex items-start gap-2 bg-[var(--bg-panel-alt)] p-2 rounded border border-[var(--border-subtle)]">
            <span className="tag-passed text-[9px] shrink-0 mt-0.5">GATE 1</span>
            <span className="text-slate-300">
              <strong>Deliverable:</strong> PR merge or IPFS CID verified against sha256.
            </span>
          </div>
          <div className="flex items-start gap-2 bg-[var(--bg-panel-alt)] p-2 rounded border border-[var(--border-subtle)]">
            <span className="tag-passed text-[9px] shrink-0 mt-0.5">GATE 2</span>
            <span className="text-slate-300">
              <strong>Policy:</strong> Spend cap ({capNear}N) and cooldown ({cooldownHours}h).
            </span>
          </div>
          <div className="flex items-start gap-2 bg-[var(--bg-panel-alt)] p-2 rounded border border-[var(--border-subtle)]">
            <span className="tag-passed text-[9px] shrink-0 mt-0.5">GATE 3</span>
            <span className="text-slate-300">
              <strong>Quorum:</strong> Council multi-sig signature required.
            </span>
          </div>
        </div>
      </div>

      {/* Contributor Tier Reputation if available */}
      {reputationScore !== null && reputationScore !== undefined && (
        <div className="p-3 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[var(--text-muted)] flex items-center gap-1.5">
              <Award size={12} className="text-[var(--color-passed)]" />
              <span>Contributor Tier:</span>
            </span>
            <span className="text-white font-bold">
              {reputationScore >= 80 ? 'Gold Tier' : reputationScore >= 40 ? 'Silver Tier' : 'Bronze Tier'} ({reputationScore}/100)
            </span>
          </div>
          <div className="w-full bg-[var(--bg-canvas)] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--color-passed)] h-full transition-all"
              style={{ width: `${Math.min(100, reputationScore)}%` }}
            />
          </div>
        </div>
      )}

      {/* Numerical Metrics Table */}
      <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border-subtle)] text-[11px]">
        <div className="ledger-row">
          <span className="text-[var(--text-muted)]">PER-PROPOSAL CAP:</span>
          <span className="text-white font-bold">{capNear} NEAR</span>
        </div>
        <div className="ledger-row">
          <span className="text-[var(--text-muted)]">DAILY SPEND LIMIT:</span>
          <span className="text-white font-bold">{maxDailyNear} NEAR</span>
        </div>
        <div className="ledger-row">
          <span className="text-[var(--text-muted)]">COOLDOWN DURATION:</span>
          <span className="text-white font-bold">{cooldownHours} HOURS</span>
        </div>
        <div className="ledger-row">
          <span className="text-[var(--text-muted)]">PROPOSAL BOND:</span>
          <span className="text-white font-bold">{proposalBondNear} NEAR</span>
        </div>
      </div>
    </div>
  );
}
