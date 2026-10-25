import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { AttackAttempt } from '../lib/types';

export function AttackAttemptsPanel() {
  const [attacks, setAttacks] = useState<AttackAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/data/attack_logs.json');
      if (res.ok) {
        const data = await res.json();
        setAttacks(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttacks();
  }, []);

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
              Live audit trail of replayed CIDs, spend cap violations, and unauthorized callers blocked by ZiniPay.
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
          No attack attempts logged yet. All policy constraints remain green.
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
                  <AlertTriangle size={11} />
                  <span>Rejection: <strong>{att.rejectionReason}</strong></span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle size={11} />
                  <span>Blocked By: {att.blockedBy}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
