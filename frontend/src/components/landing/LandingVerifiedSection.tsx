import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, RefreshCw } from 'lucide-react';

interface VerifiedEntry {
  action: string;
  txHash: string;
  url?: string;
  timestamp?: string;
  details?: string;
}

export function LandingVerifiedSection() {
  const [entries, setEntries] = useState<VerifiedEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerifiedEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/data/verified.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          setEntries([]);
        }
      } else {
        setEntries([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to read verified run record');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedEntries();
  }, []);

  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-passed)] uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)]" />
              On-Chain Audit
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verified on Testnet
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              Cryptographic proof of end-to-end execution on NEAR Testnet. Every proposal, council vote, atomic release, and blocked attack transaction hash.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchVerifiedEntries}
            className="p-2 rounded bg-[var(--bg-panel-alt)] hover:bg-[#1E232F] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] transition-colors self-start sm:self-auto flex items-center gap-1.5 font-mono text-xs"
            title="Refresh verified records"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="ledger-card p-12 text-center font-mono text-xs text-[var(--text-muted)] animate-pulse">
            Querying verified on-chain run records...
          </div>
        ) : entries.length === 0 ? (
          <div className="ledger-card p-12 text-center flex flex-col items-center justify-center font-mono border-dashed">
            <span className="text-sm text-[var(--text-secondary)] font-semibold">
              No verified run recorded yet
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Recorded Transaction Hash</span>
              <span>Action / Explorer Link</span>
            </div>
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="ledger-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-panel-alt)]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--color-passed)]">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-white uppercase text-[11px] tracking-wide">
                      {entry.action}
                    </span>
                    {entry.details && (
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{entry.details}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-white font-mono text-xs truncate max-w-[200px] sm:max-w-none">
                    {entry.txHash}
                  </span>
                  <a
                    href={entry.url || `https://testnet.nearblocks.io/txns/${entry.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tag-passed hover:underline flex items-center gap-1"
                  >
                    <span>View Explorer</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
