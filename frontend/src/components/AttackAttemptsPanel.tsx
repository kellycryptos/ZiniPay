import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, Shield } from 'lucide-react';
import { AttackAttempt } from '../lib/types';

const SIMULATED_ATTACKS: AttackAttempt[] = [
  {
    id: 'sim-att-1',
    timestamp: 'Simulated attempt',
    vector: 'Replay deliverable CID',
    caller: 'demo-attacker.testnet',
    details: 'Attempted reuse of IPFS CID near/near-sdk-rs#1651 already settled in a prior release.',
    rejectionReason: 'CID already used — duplicate release attempt blocked',
    blockedBy: 'PolicyHelper smart contract',
    simulated: true,
  },
  {
    id: 'sim-att-2',
    timestamp: 'Simulated attempt',
    vector: 'Payout exceeding cap',
    caller: 'demo-requester.testnet',
    details: 'Attempted 50.0 NEAR payout exceeding the configured per-proposal spend cap.',
    rejectionReason: 'Amount exceeds spend cap 10.0 NEAR',
    blockedBy: 'PolicyHelper smart contract',
    simulated: true,
  },
  {
    id: 'sim-att-3',
    timestamp: 'Simulated attempt',
    vector: 'Unauthorized caller',
    caller: 'demo-imposter.testnet',
    details: 'Direct invocation of release() bypassing Sputnik DAO governance.',
    rejectionReason: 'Only designated DAO can execute release',
    blockedBy: 'PolicyHelper smart contract',
    simulated: true,
  },
];

export function AttackAttemptsPanel() {
  const isDemo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const [attacks, setAttacks] = useState<AttackAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/data/attack_events.jsonl');
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n').filter(Boolean);
        if (lines.length > 0) {
          const parsed = lines.map((l) => JSON.parse(l));
          setAttacks(parsed.reverse());
          return;
        }
      }
      if (isDemo) {
        setAttacks(SIMULATED_ATTACKS);
      } else {
        setAttacks([]);
      }
    } catch (err: any) {
      if (isDemo) {
        setAttacks(SIMULATED_ATTACKS);
      } else {
        setError(err.message || 'Failed to read attack log');
        setAttacks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttacks();
  }, [isDemo]);

  return (
    <div className="ledger-card p-5 flex flex-col gap-4 font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[var(--text-secondary)]" />
          <div>
            <h3 className="font-semibold text-sm text-white">
              Security audit log
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Attempts blocked by PolicyHelper smart contract invariants.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAttacks}
          disabled={loading}
          className="p-1.5 rounded hover:bg-[var(--bg-panel-alt)] text-[var(--text-secondary)] hover:text-white transition-colors border border-[var(--border-subtle)]"
          title="Refresh audit log"
          aria-label="Refresh audit log"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)] animate-pulse">
          Reading security log...
        </div>
      ) : error ? (
        <div className="p-3 rounded bg-[var(--color-blocked-bg)] border border-[var(--color-blocked-border)] text-[var(--color-blocked)] text-xs">
          Could not load audit log: {error}
        </div>
      ) : attacks.length === 0 ? (
        <div className="p-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-lg">
          No security violations recorded on-chain. All invariant checks clean.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {attacks.map((att) => (
            <div
              key={att.id}
              className="p-3.5 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-xs">
                    {att.vector}
                  </span>
                  {att.simulated && (
                    <span className="tag-pending text-[10px]">
                      Simulation
                    </span>
                  )}
                  <span className="text-[var(--text-muted)] text-[11px]">
                    Caller: <span className="font-mono text-[var(--text-secondary)]">{att.caller}</span>
                  </span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">{att.timestamp}</span>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {att.details}
              </p>

              <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border-subtle)] text-[11px]">
                <span className="text-[var(--color-blocked)] font-medium truncate max-w-[280px]">
                  {att.rejectionReason}
                </span>
                <span className="text-[var(--color-passed)] font-medium flex items-center gap-1 shrink-0">
                  <CheckCircle2 size={12} />
                  <span>{att.blockedBy || (att.simulated ? 'Simulated block' : 'Blocked')}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
