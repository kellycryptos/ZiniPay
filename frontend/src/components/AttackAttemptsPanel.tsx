import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { AttackAttempt } from '../lib/types';

const SIMULATED_ATTACKS: AttackAttempt[] = [
  {
    id: 'sim-att-1',
    timestamp: 'Simulation Preview',
    vector: 'Replay CID',
    caller: 'demo-attacker.testnet',
    details: 'Simulated replay of deliverable CID near/near-sdk-rs#1651',
    rejectionReason: 'CID already used — duplicate release attempt blocked',
    blockedBy: 'PolicyHelper (On-Chain)',
    simulated: true,
  },
  {
    id: 'sim-att-2',
    timestamp: 'Simulation Preview',
    vector: 'Over-Cap Spend',
    caller: 'demo-requester.testnet',
    details: 'Simulated 50.0 NEAR payout request for Bronze tier contributor',
    rejectionReason: 'Amount exceeds effective tier cap 10.0 NEAR for recipient demo-requester.testnet',
    blockedBy: 'PolicyHelper (On-Chain)',
    simulated: true,
  },
  {
    id: 'sim-att-3',
    timestamp: 'Simulation Preview',
    vector: 'Unauthorized Caller',
    caller: 'demo-imposter.testnet',
    details: 'Simulated unauthorized caller invoking release() directly',
    rejectionReason: 'Only owner or designated DAO can call this',
    blockedBy: 'PolicyHelper (On-Chain)',
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
      // If empty and ?demo=1, use simulated entries with SIMULATION badges
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
    <div className="ledger-card p-5 border-[var(--border-subtle)] flex flex-col gap-4 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-[var(--color-blocked)]" />
          <div>
            <h3 className="font-bold text-sm text-white font-sans flex items-center gap-2">
              <span>Blocked Attacks</span>
              <span className="tag-blocked text-[10px]">
                Fail-Closed Active
              </span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">
              Audit log of replayed CIDs, over-caps, and unapproved callers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAttacks}
          disabled={loading}
          className="p-1.5 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] text-[var(--text-secondary)] hover:text-white transition-colors border border-[var(--border-subtle)]"
          title="Refresh attack audit log"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)] animate-pulse">
          Reading attack event log...
        </div>
      ) : error ? (
        <div className="p-4 rounded bg-[var(--color-blocked-bg)] border border-[var(--color-blocked-border)] text-[var(--color-blocked)] text-xs">
          Error loading attack event log: {error}
        </div>
      ) : attacks.length === 0 ? (
        /* Empty state with specific text */
        <div className="p-6 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded">
          No attack attempts recorded on testnet. All contract policy checks clean.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {attacks.map((att) => (
            <div
              key={att.id}
              className="p-3 rounded bg-[var(--bg-panel-alt)] border border-[var(--color-blocked-border)] flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {att.simulated && (
                    <span className="tag-pending text-[9px] font-bold">
                      SIMULATION
                    </span>
                  )}
                  <span className="tag-blocked text-[10px]">
                    {att.vector}
                  </span>
                  <span className="text-[var(--text-muted)] text-[10px]">
                    Caller: <strong className="text-white">{att.caller}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">{att.timestamp}</span>
              </div>

              <div className="text-slate-300 text-[11px] leading-relaxed">
                {att.details}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-[10px]">
                <div className="flex items-center gap-1 text-[var(--color-blocked)] truncate max-w-[200px]">
                  <AlertTriangle size={11} className="shrink-0" />
                  <span className="truncate">{att.rejectionReason}</span>
                </div>
                <div className="flex items-center gap-1 text-[var(--color-passed)] shrink-0">
                  <CheckCircle size={11} />
                  <span>{att.blockedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
