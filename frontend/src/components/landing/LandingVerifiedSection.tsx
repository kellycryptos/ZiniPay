import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, ShieldAlert, RefreshCw } from 'lucide-react';

interface VerifiedTransaction {
  index?: number;
  label?: string;
  action?: string;
  txHash: string;
  explorerUrl?: string;
  url?: string;
  timestamp?: string;
  details?: string;
  viaPolicyContract?: boolean;
}

interface BlockedAttack {
  vector: string;
  status?: string;
  rejectionReason?: string;
  reason?: string;
  blockedBy: string;
}

export function LandingVerifiedSection() {
  const [txs, setTxs] = useState<VerifiedTransaction[]>([]);
  const [blockedAttacks, setBlockedAttacks] = useState<BlockedAttack[]>([]);
  const [meta, setMeta] = useState<{ generatedAt?: string; network?: string }>({});
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
          setTxs(data);
          setBlockedAttacks([]);
          setMeta({});
        } else if (data && typeof data === 'object') {
          setTxs(Array.isArray(data.transactions) ? data.transactions : []);
          setBlockedAttacks(Array.isArray(data.blockedAttacks) ? data.blockedAttacks : []);
          setMeta({
            generatedAt: data.generatedAt,
            network: data.network,
          });
        } else {
          setTxs([]);
          setBlockedAttacks([]);
          setMeta({});
        }
      } else {
        setTxs([]);
        setBlockedAttacks([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to read verified run record');
      setTxs([]);
      setBlockedAttacks([]);
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
            {meta.generatedAt && (
              <div className="font-mono text-[11px] text-[var(--text-muted)] mt-2">
                Run recorded: {new Date(meta.generatedAt).toLocaleString()} ({meta.network || 'testnet'})
              </div>
            )}
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
        ) : txs.length === 0 ? (
          <div className="ledger-card p-12 text-center flex flex-col items-center justify-center font-mono border-dashed">
            <span className="text-sm text-[var(--text-secondary)] font-semibold">
              No verified run recorded yet
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Transactions Section */}
            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Verified Transaction / Timestamp</span>
                <span>Explorer Link</span>
              </div>
              {txs.map((tx, idx) => {
                const label = tx.label || tx.action || `Transaction #${idx + 1}`;
                const explorerLink = tx.explorerUrl || tx.url || `https://testnet.nearblocks.io/txns/${tx.txHash}`;
                const formattedTime = tx.timestamp ? new Date(tx.timestamp).toLocaleString() : null;

                return (
                  <div
                    key={tx.txHash || idx}
                    className="ledger-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-panel-alt)]"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="p-1.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--color-passed)] shrink-0 mt-0.5 sm:mt-0">
                        <CheckCircle size={14} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white uppercase text-[11px] tracking-wide">
                            {label}
                          </span>
                          {formattedTime && (
                            <span className="text-[10px] text-[var(--text-muted)]">
                              ({formattedTime})
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-slate-300 break-all">
                          {tx.txHash}
                        </span>
                        {tx.details && (
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{tx.details}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <a
                        href={explorerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tag-passed hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        <span>testnet.nearblocks.io</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Blocked Attacks Section */}
            {blockedAttacks.length > 0 && (
              <div className="flex flex-col gap-3 font-mono text-xs pt-4 border-t border-[var(--border-subtle)]">
                <div className="text-[11px] text-[var(--color-blocked)] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Blocked Attack Invariant</span>
                  <span>Enforcing Component</span>
                </div>
                {blockedAttacks.map((att, idx) => (
                  <div
                    key={idx}
                    className="ledger-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-panel-alt)] border-l-2 border-l-[var(--color-blocked)]"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="p-1.5 rounded bg-[var(--bg-canvas)] border border-[var(--color-blocked-border)] text-[var(--color-blocked)] shrink-0 mt-0.5 sm:mt-0">
                        <ShieldAlert size={14} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-[11px] uppercase tracking-wide">
                            {att.vector}
                          </span>
                          <span className="tag-blocked text-[10px]">
                            {att.status || 'BLOCKED'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          {att.rejectionReason || att.reason}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-300 bg-[var(--bg-canvas)] px-2.5 py-1 rounded border border-[var(--border-subtle)] shrink-0 self-start sm:self-auto">
                      {att.blockedBy}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
