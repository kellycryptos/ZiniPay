import React from 'react';
import { ShieldAlert, ExternalLink, CheckCircle2, Lock } from 'lucide-react';

export function LandingBenefits() {
  const attacks = [
    {
      label: 'Blocked Attack 1',
      vector: 'Deliverable Replay Attempt',
      deliverable: 'kellycryptos/ZiniPay#2',
      reason: 'CID already used — duplicate release attempt blocked on-chain',
      txHash: '9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb',
      explorerUrl: 'https://testnet.nearblocks.io/txns/9Gp7HmJb9jNg9QmGRUXunTpqqfGfhRbGPR4MJAGmEUSb',
    },
    {
      label: 'Blocked Attack 2',
      vector: 'Unbounded Treasury Drain (Over-Cap)',
      deliverable: 'Spend 16 NEAR (Silver cap: 15N)',
      reason: 'Exceeds effective tier cap — mathematical panic on-chain',
      txHash: 'EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
      explorerUrl: 'https://testnet.nearblocks.io/txns/EiktoyYPMJZt2C4rF5sR5rBF899yY4mYAVQmH9yMqARZ',
    },
    {
      label: 'Blocked Attack 3',
      vector: 'Unauthorized Caller Direct Drain',
      deliverable: 'agentzinipaytestnet.testnet -> release()',
      reason: 'Only owner or designated DAO can call release()',
      txHash: '2zsvqGDF4Bfqm2QG2XpXgqP4p4zH7r2rR6y9rT4mK9W2',
      explorerUrl: 'https://testnet.nearblocks.io/txns/2zsvqGDF4Bfqm2QG2XpXgqP4p4zH7r2rR6y9rT4mK9W2',
    },
  ];

  return (
    <section className="relative py-12 sm:py-16 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold mb-3">
            <Lock size={13} />
            <span>On-Chain Defense In Action</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Attacks That Fail: Verified Testnet Receipts
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Every invariant is backed by verified on-chain transactions that reverted with exact contract panic assertions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {attacks.map((att) => (
            <div
              key={att.label}
              className="p-5 sm:p-6 rounded-2xl bg-white/95 dark:bg-[#121115]/95 border border-red-500/25 dark:border-red-500/30 hover:border-red-500/50 transition-colors duration-200 flex flex-col justify-between gap-4 shadow-sm dark:shadow-lg group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30">
                    {att.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    On-Chain Panic
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {att.vector}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 truncate" title={att.deliverable}>
                    Target: {att.deliverable}
                  </p>
                </div>

                <p className="text-xs font-mono text-rose-700 dark:text-rose-200/90 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-500/25 leading-relaxed">
                  "{att.reason}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-700 dark:text-[#00EC97] flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={13} />
                  <span>Reverted Safe</span>
                </span>
                <a
                  href={att.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>NearBlocks</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
