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
    rejectionReason: 'Amount 50000000000000000000000000 exceeds effective tier cap 10000000000000000000000000 for recipient demo-requester.testnet',
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

  const fetchAttacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/data/attack_events.jsonl');
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split('\n').filter(Boolean);
        const parsed = lines.map((l) => JSON.parse(l));
        setAttacks(parsed.reverse());
        return;
      }
      // If no live file and ?demo=1, use simulated entries
      if (isDemo) {
        setAttacks(SIMULATED_ATTACKS);
      } else {
        setAttacks([]);
      }
    } catch {
      if (isDemo) {
        setAttacks(SIMULATED_ATTACKS);
      } else {
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
    <div className="card p-5 border border-red-500/20 bg-red-950/10 rounded-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Attack Attempts & Blocked Exploits</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                Fail-Closed Active
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Real-time audit log of replayed CIDs, spend cap violations, and unauthorized callers blocked by ZiniPay.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAttacks}
          disabled={loading}
          className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          title="Refresh attack log"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {attacks.length === 0 ? (
        <div className="p-6 text-center text-xs text-gray-400 font-mono">
          No attack attempts recorded. All policy constraints remain green.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {attacks.map((att) => (
            <div
              key={att.id}
              className="p-3 rounded-xl bg-black/40 border border-red-500/20 flex flex-col gap-1.5 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {att.simulated && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[9px] tracking-wider">
                      SIMULATION
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30 text-[10px]">
                    {att.vector}
                  </span>
                  <span className="text-gray-400 text-[11px]">Caller: <strong className="text-gray-200">{att.caller}</strong></span>
                </div>
                <span className="text-[10px] text-gray-500">{att.timestamp}</span>
              </div>

              <div className="text-gray-300 text-[11px] leading-relaxed">
                {att.details}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-800/60 text-[10px]">
                <div className="flex items-center gap-1 text-red-400">
                  <AlertTriangle size={11} className="shrink-0" />
                  <span className="truncate">Rejection: <strong>{att.rejectionReason}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 shrink-0">
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
