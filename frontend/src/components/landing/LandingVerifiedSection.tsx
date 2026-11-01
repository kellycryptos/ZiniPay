import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, ShieldAlert, RefreshCw, Ticket } from 'lucide-react';

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
  txHash?: string;
  explorerUrl?: string;
  blockedBy: string;
}

export function LandingVerifiedSection() {
  const [txs, setTxs] = useState<VerifiedTransaction[]>([]);
  const [disclosures, setDisclosures] = useState<string[]>([]);
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
          setDisclosures([]);
          setMeta({});
        } else if (data && typeof data === 'object') {
          setTxs(Array.isArray(data.transactions) ? data.transactions : []);
          setDisclosures(Array.isArray(data.disclosures) ? data.disclosures : []);
          setMeta({
            generatedAt: data.generatedAt,
            network: data.network,
          });
        } else {
          setTxs([]);
          setDisclosures([]);
          setMeta({});
        }
      } else {
        setTxs([]);
        setDisclosures([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to read verified run record');
      setTxs([]);
      setDisclosures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedEntries();
  }, []);

  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-slate-100 relative overflow-hidden">
      {/* Background radial atmosphere */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[var(--color-passed)]/[0.03] blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10 relative z-10">
        {/* Header on Dark Desk */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--color-passed)] uppercase tracking-wider mb-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)]" />
              On-Chain Audit Trail
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Verified Run on Testnet
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
              Every step from proposal submission to dual-key council execution produces an immutable ticket stub on NEAR.
            </p>
            {meta.generatedAt && (
              <div className="font-mono text-xs text-[var(--text-muted)] mt-2">
                Recorded run: {new Date(meta.generatedAt).toLocaleString()} ({meta.network || 'testnet'})
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={fetchVerifiedEntries}
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[#1C212E] text-[var(--text-secondary)] hover:text-white border border-[var(--border-subtle)] transition-colors self-start sm:self-auto flex items-center gap-2 font-mono text-xs cursor-pointer shadow-sm"
            title="Sync verified records"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync Ledger</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="ledger-card p-12 text-center font-mono text-xs text-[var(--text-muted)] animate-pulse">
            Retrieving ticket stubs from verified on-chain run...
          </div>
        ) : txs.length === 0 ? (
          <div className="ledger-card p-12 text-center flex flex-col items-center justify-center font-mono gap-3">
            <Ticket size={28} className="text-[var(--text-muted)] opacity-60" />
            <span className="text-sm text-[var(--text-secondary)] font-semibold">
              No verified run recorded yet
            </span>
            <p className="text-xs text-[var(--text-muted)] max-w-md">
              Run records update automatically when the agent or council executes proposals on testnet.
            </p>
            <button
              type="button"
              onClick={fetchVerifiedEntries}
              className="btn-secondary text-xs py-1.5 px-3 mt-1 cursor-pointer"
            >
              Retry Sync
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* The Ticket-Stub Strip Container */}
            <div className="relative rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] overflow-hidden shadow-2xl">
              {/* Header banner of the ticket roll */}
              <div className="px-5 py-3.5 bg-[var(--bg-panel-header)] border-b border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  <Ticket size={15} className="text-[var(--color-passed)]" />
                  <span className="font-bold uppercase tracking-wider text-[11px]">
                    VERIFIED TRANSACTION STUB STRIP ({txs.length} STUBS)
                  </span>
                </div>
                <span className="tag-passed text-[10px] font-mono">
                  SPUTNIK DAO v2 + POLICY CONTRACT
                </span>
              </div>

              {/* Vertical Strip of Connected Stubs */}
              <div className="divide-y-2 divide-dashed divide-[var(--border-subtle)]">
                {txs.map((tx, idx) => {
                  const label = tx.label || tx.action || `Transaction #${idx + 1}`;
                  const explorerLink = tx.explorerUrl || tx.url || `https://testnet.nearblocks.io/txns/${tx.txHash}`;
                  const shortHash = tx.txHash
                    ? `${tx.txHash.slice(0, 8)}...${tx.txHash.slice(-6)}`
                    : 'Unknown Tx';
                  const formattedTime = tx.timestamp
                    ? new Date(tx.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'short',
                      })
                    : null;

                  return (
                    <div
                      key={tx.txHash || idx}
                      className="relative p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-alt)]/60 transition-colors duration-200 group"
                    >
                      {/* Ticket punch-out notches on left & right */}
                      <span className="stub-notch-left hidden sm:block" aria-hidden="true" />
                      <span className="stub-notch-right hidden sm:block" aria-hidden="true" />

                      {/* Left: Stub Index & Label */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="px-2.5 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono text-[11px] font-bold text-[var(--color-passed)] shrink-0 group-hover:border-[var(--color-passed-border)] transition-colors">
                          STUB #{String(idx + 1).padStart(2, '0')}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm tracking-tight font-sans">
                              {label}
                            </span>
                            {formattedTime && (
                              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                                · {formattedTime}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 font-mono text-xs">
                            <span className="text-[var(--text-muted)] text-[10px] uppercase">Hash:</span>
                            <span className="text-slate-300 select-all font-mono" title={tx.txHash}>
                              {shortHash}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Explorer Link & Validated Stamp */}
                      <div className="flex items-center gap-3 shrink-0 self-start md:self-auto pl-11 sm:pl-0">
                        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--color-passed-bg)] border border-[var(--color-passed-border)] text-[10px] font-mono text-[var(--color-passed)] font-semibold">
                          <CheckCircle2 size={11} />
                          <span>ON-CHAIN</span>
                        </div>

                        <a
                          href={explorerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--bg-canvas)] hover:bg-[#171B26] border border-[var(--border-subtle)] hover:border-[var(--color-passed-border)] text-xs font-mono text-[var(--color-passed)] font-semibold transition-all shadow-xs"
                        >
                          <span>nearblocks</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operational Disclosures Strip */}
            {disclosures.length > 0 && (
              <div className="rounded-xl border border-[var(--color-pending-border)] bg-[var(--bg-panel-alt)] p-4 sm:p-5 text-xs font-mono">
                <div className="text-[11px] text-[var(--color-pending)] uppercase tracking-wider mb-2 font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-pending)]" />
                  <span>Operational Verification Context & Disclosures</span>
                </div>
                <div className="flex flex-col gap-2 text-slate-300 leading-relaxed text-[11px]">
                  {disclosures.map((disc, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--color-pending)] shrink-0 font-bold">•</span>
                      <span>{disc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
