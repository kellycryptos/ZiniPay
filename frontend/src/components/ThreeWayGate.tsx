import React from 'react';
import { FileCheck, ShieldAlert, Users, ArrowRight } from 'lucide-react';

export function ThreeWayGate() {
  const steps = [
    {
      step: '01',
      title: 'Verifiable Proof',
      desc: 'Deliverable IPFS CID, git PR, or Intel TDX confidential compute attestation pinned.',
      icon: FileCheck,
    },
    {
      step: '02',
      title: 'On-Chain Policy',
      desc: 'Tier spend cap verified, cooldown elapsed, CID unspent, zero double-spend.',
      icon: ShieldAlert,
    },
    {
      step: '03',
      title: 'Human Quorum',
      desc: 'Sputnik DAO v2 council votes in Trezu. Payout released natively or via NEAR Intents.',
      icon: Users,
    },
  ];

  return (
    <section className="ledger-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[var(--border-subtle)] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              The Three-Way Release Gate
            </h2>
            <span className="tag-passed text-[10px]">
              Active Guardrail
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
            No treasury capital leaves the DAO without satisfying all three independent layers in sequence.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-[var(--color-passed)] bg-[var(--color-passed-bg)] px-2.5 py-1 rounded border border-[var(--color-passed-border)] w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)] animate-pulse" />
          <span>Fail-Closed Rules Enforced</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="p-4 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--color-passed)]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">
                    GATE {s.step}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">
                  {s.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-5 h-5 rounded bg-[var(--bg-panel)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--text-muted)]">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
