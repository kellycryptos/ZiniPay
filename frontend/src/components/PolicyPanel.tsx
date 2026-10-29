import React from 'react';
import { PolicyContractState } from '../lib/nearRpc';

interface PolicyPanelProps {
  treasuryBalance?: number;
  treasuryLoading?: boolean;
  treasuryError?: string;
  daoConfigured: boolean;
  policyState?: PolicyContractState | null;
  policyContractConfigured: boolean;
  onOpenSecurityLog: () => void;
  securityEventCount: number;
}

export function PolicyPanel({
  treasuryBalance,
  treasuryLoading,
  treasuryError,
  daoConfigured,
  policyState,
  policyContractConfigured,
  onOpenSecurityLog,
  securityEventCount,
}: PolicyPanelProps) {
  // Compute on-chain policy limits if available
  const perPayoutCapNear = policyState
    ? `${(Number(BigInt(policyState.per_proposal_cap) / 10n ** 22n) / 100).toFixed(1)} NEAR`
    : policyContractConfigured
    ? (policyState === null ? 'Unavailable' : 'Reading...')
    : 'Not connected';

  const cooldownHours = policyState
    ? `${(policyState.cooldown_seconds / 3600).toFixed(1)} h`
    : policyContractConfigured
    ? (policyState === null ? 'Unavailable' : 'Reading...')
    : 'Not connected';

  const dailySpendLimit = (policyState as any)?.daily_limit
    ? `${(policyState as any).daily_limit} NEAR`
    : 'Not connected';

  return (
    <div className="ledger-card p-4 flex flex-col gap-3 font-sans text-xs">
      {/* Treasury Balance (One place only) */}
      <div className="flex flex-col gap-1">
        <span className="text-[var(--text-muted)] text-[11px] font-medium">
          Treasury balance
        </span>
        {!daoConfigured ? (
          <span className="text-[var(--text-muted)] font-mono text-xs">
            Not connected
          </span>
        ) : treasuryLoading ? (
          <div className="w-20 h-5 bg-gray-800 rounded animate-pulse mt-0.5" />
        ) : treasuryError ? (
          <span className="text-[var(--text-muted)] font-mono text-xs" title={treasuryError}>
            Unavailable
          </span>
        ) : (
          <span className="text-white font-bold text-base font-mono">
            {treasuryBalance !== undefined ? treasuryBalance.toFixed(2) : '0.00'} NEAR
          </span>
        )}
      </div>

      <div className="border-t border-[var(--border-subtle)] my-1" />

      {/* Policy Limits as Three Plain Lines */}
      <div className="flex flex-col gap-2">
        <span className="text-[var(--text-muted)] text-[11px] font-medium">
          Policy limits
        </span>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)]">Per-payout cap</span>
          <span className={perPayoutCapNear === 'Not connected' || perPayoutCapNear === 'Unavailable' ? 'text-[var(--text-muted)] font-mono text-xs' : 'text-white font-mono font-medium'}>
            {perPayoutCapNear}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)]">Daily spend limit</span>
          <span className={dailySpendLimit === 'Not connected' ? 'text-[var(--text-muted)] font-mono text-xs' : 'text-white font-mono font-medium'}>
            {dailySpendLimit}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-secondary)]">Cooldown</span>
          <span className={cooldownHours === 'Not connected' || cooldownHours === 'Unavailable' ? 'text-[var(--text-muted)] font-mono text-xs' : 'text-white font-mono font-medium'}>
            {cooldownHours}
          </span>
        </div>
      </div>

      {/* Security Log Trigger */}
      <div className="border-t border-[var(--border-subtle)] pt-2.5 mt-1">
        <button
          type="button"
          onClick={onOpenSecurityLog}
          className="w-full flex items-center justify-between text-xs text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
        >
          <span>Security audit log</span>
          <span className="tag-neutral text-[10px]">
            {securityEventCount} events
          </span>
        </button>
      </div>
    </div>
  );
}
