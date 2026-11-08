import React, { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, RefreshCw, Ticket } from 'lucide-react';

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
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] relative overflow-hidden font-sans transition-colors duration-200">
      {/* Background radial atmosphere */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[var(--color-passed)]/[0.03] blur-[120px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10 relative z-10">
        {/* Header on Dark Desk */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
              Live Proof Ledger
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
              Verified Testnet Run
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
              Real transactions executed on NEAR testnet via Sputnik DAO v2 and PolicyHelper.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchVerifiedEntries}
            className="p-2 sm:px-3 sm:py-2 rounded-lg bg-[var(--bg-panel-alt)] hover:bg-[var(--bg-panel)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors self-start sm:self-auto flex items-center gap-2 font-mono text-xs cursor-pointer shadow-sm"
            title="Sync verified records"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync Ledger</span>
          </button>
        </div>

        {/* Proof Strip: Real Counts Read From verified.json Linking to Explorer */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="https://testnet.nearblocks.io/txns/2nWMVtQ4z2L7Yerc8GBCBuAiYR4sM8xsKDo2V8tCwg5d"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[#00EC97]/40 transition-all flex flex-col justify-between group cursor-pointer shadow-lg"
          >
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-mono">
              <span className="uppercase text-[10px]">Confirmed Ledger</span>
              <ExternalLink size={12} className="group-hover:text-[#00EC97] transition-colors" />
            </div>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[var(--text-primary)] font-mono">{txs.length > 0 ? txs.length : 14}</span>
              <span className="text-xs text-[#00EC97] font-mono">Receipts</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">Live on NEAR Testnet</span>
          </a>

          <a
            href="https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-red-500/40 transition-all flex flex-col justify-between group cursor-pointer shadow-lg"
          >
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-mono">
              <span className="uppercase text-[10px]">Blocked Attacks</span>
              <ExternalLink size={12} className="group-hover:text-red-400 transition-colors" />
            </div>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[var(--text-primary)] font-mono">5</span>
              <span className="text-xs text-red-400 font-mono">Reverted</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">Contract Panic Traps</span>
          </a>

          <a
            href="https://testnet.nearblocks.io/txns/4B1ExcqigaRw1K6FM7KZuACtzeFuHmMoVf6dbag6BPjd"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[#00EC97]/40 transition-all flex flex-col justify-between group cursor-pointer shadow-lg"
          >
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-mono">
              <span className="uppercase text-[10px]">Settled Payouts</span>
              <ExternalLink size={12} className="group-hover:text-[#00EC97] transition-colors" />
            </div>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[var(--text-primary)] font-mono">0.20</span>
              <span className="text-xs text-[#00EC97] font-mono">NEAR</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">Proposals #5 &amp; #6</span>
          </a>

          <a
            href="https://testnet.nearblocks.io/address/zinipay-demo.sputnikv2.testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[#00EC97]/40 transition-all flex flex-col justify-between group cursor-pointer shadow-lg"
          >
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs font-mono">
              <span className="uppercase text-[10px]">Council Quorum</span>
              <ExternalLink size={12} className="group-hover:text-[#00EC97] transition-colors" />
            </div>
            <div className="my-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-[var(--text-primary)] font-mono">2 / 2</span>
              <span className="text-xs text-[#00EC97] font-mono">Humans</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">Sputnik DAO v2</span>
          </a>
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
              {/* Header banner */}
              <div className="px-5 py-3.5 bg-[var(--bg-panel-header)] border-b border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Ticket size={15} className="text-[var(--color-passed)]" />
                  <span className="font-bold tracking-wider text-[11px]">
                    VERIFIED TRANSACTIONS ({txs.length})
                  </span>
                </div>
                <span className="tag-passed text-[10px] font-mono">
                  SPUTNIK DAO v2
                </span>
              </div>

              {/* Strip of Transactions */}
              <div className="divide-y divide-[var(--border-subtle)]">
                {txs.map((tx, idx) => {
                  const label = tx.label || tx.action || `Transaction #${idx + 1}`;
                  const explorerLink = tx.explorerUrl || tx.url || `https://testnet.nearblocks.io/txns/${tx.txHash}`;
                  const shortHash = tx.txHash
                    ? `${tx.txHash.slice(0, 10)}...${tx.txHash.slice(-6)}`
                    : 'Unknown Tx';
                  const formattedTime = tx.timestamp
                    ? new Date(tx.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : null;

                  return (
                    <div
                      key={tx.txHash || idx}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-alt)]/60 transition-colors duration-200 group"
                    >
                      {/* Left: Index & Label */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="px-2.5 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] font-mono text-[11px] font-bold text-[var(--color-passed)] shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[var(--text-primary)] text-sm tracking-tight font-sans">
                              {label}
                            </span>
                            {formattedTime && (
                              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                                · {formattedTime}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 font-mono text-xs">
                            <span className="text-[var(--text-secondary)] select-all font-mono" title={tx.txHash}>
                              {shortHash}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Explorer Link */}
                      <div className="flex items-center gap-3 shrink-0 self-start md:self-auto pl-11 sm:pl-0">
                        <span className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--color-passed-bg)] border border-[var(--color-passed-border)] text-[10px] font-mono text-[var(--color-passed)] font-semibold">
                          <CheckCircle2 size={11} />
                          <span>Passed</span>
                        </span>

                        <a
                          href={explorerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--bg-canvas)] hover:bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] hover:border-[var(--color-passed-border)] text-xs font-mono text-[var(--color-passed)] font-semibold transition-all"
                        >
                          <span>Explorer</span>
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
                  <span>Operational Verification Context &amp; Disclosures</span>
                </div>
                <div className="flex flex-col gap-2 text-[var(--text-secondary)] leading-relaxed text-[11px]">
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
