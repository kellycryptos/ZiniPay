import React, { useState, useEffect } from 'react';
import { FileCheck, ShieldAlert, Users, CheckCircle2, Zap } from 'lucide-react';

export function LandingReleaseGate() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [hasRunOnTestnet, setHasRunOnTestnet] = useState<boolean>(false);

  useEffect(() => {
    fetch('/data/verified.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.viaPolicyContract === true) {
          setHasRunOnTestnet(true);
        } else if (Array.isArray(data.transactions)) {
          const run = data.transactions.some((t: any) => t.viaPolicyContract === true);
          setHasRunOnTestnet(run);
        }
      })
      .catch(() => {});
  }, []);

  const gates = [
    {
      step: '01',
      name: 'Verifiable Proof',
      tag: 'MATCH A · DELIVERABLE',
      desc: 'Deliverable IPFS CID, git PR, or Intel TDX TEE attestation pinned to prevent ghost deliverables.',
      checks: [
        'GitHub PR merged by authorized maintainer',
        'IPFS CID resolves to valid artifact sha256',
        'Attestation report received (not independently verified)',
      ],
      icon: FileCheck,
      color: 'text-white',
      bg: 'bg-[#161922]',
    },
    {
      step: '02',
      name: 'On-Chain Policy',
      tag: 'MATCH B · CONSTRAINTS',
      desc: 'Rust smart contract enforces per-proposal spend caps, cooldown delays, and CID anti-replay (agent enforces daily limits).',
      checks: [
        'Amount ≤ tier cap (Bronze 10N, Silver 15N, Gold 20N)',
        'Cooldown delay elapsed since previous release',
        'CID recorded on-chain — zero double-spend allowed',
      ],
      icon: ShieldAlert,
      color: 'text-[var(--color-passed)]',
      bg: 'bg-[#161922]',
    },
    {
      step: '03',
      name: 'Human Quorum',
      tag: 'MATCH C · MULTI-SIG',
      desc: 'Sputnik DAO v2 council members review the receipt in Trezu and sign with their private keys before funds move.',
      checks: [
        'Multi-sig threshold required (e.g. 2 of 3 council seats)',
        'Agent never holds release keys — function-call only',
        'Settles natively in NEAR or cross-chain via NEAR Intents',
      ],
      icon: Users,
      color: 'text-white',
      bg: 'bg-[#161922]',
    },
  ];

  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-passed)] uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)]" />
              Fail-Closed Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              The Three-Way Release Gate
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              Capital release requires all three independent gates to clear in sequence. If any layer fails, the transaction is rejected fail-closed.
            </p>
          </div>
          <div className="font-mono text-xs text-[var(--text-muted)] flex items-center gap-2">
            <span>RULE:</span>
            <span className="text-white font-bold bg-[var(--bg-panel-alt)] px-2.5 py-1 rounded border border-[var(--border-subtle)]">
              ALL GATES MUST PASS
            </span>
          </div>
        </div>

        {/* Animated Gate Flow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {gates.map((g, idx) => {
            const Icon = g.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={g.step}
                onMouseEnter={() => setActiveStep(idx)}
                className={`ledger-card p-6 flex flex-col justify-between transition-all cursor-pointer relative ${
                  isSelected ? 'border-[var(--color-passed)] ring-1 ring-[var(--color-passed-border)]' : ''
                }`}
              >
                <div>
                  {/* Gate Number & Tag */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono font-bold text-xs text-[var(--color-passed)]">
                      GATE {g.step}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
                      {g.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-lg bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[var(--color-passed)]">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {g.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-5">
                    {g.desc}
                  </p>

                  {/* Checklist */}
                  <ul className="flex flex-col gap-2 font-mono text-[11px] text-slate-300 pt-3 border-t border-[var(--border-subtle)]">
                    {g.checks.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-[var(--color-passed)] shrink-0 mt-0.5" />
                        <span className="leading-snug">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>STATUS:</span>
                  <span className={hasRunOnTestnet ? 'tag-passed' : 'tag-neutral'}>
                    {hasRunOnTestnet ? 'Run on testnet' : 'Implemented and unit tested'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Settlement Callout */}
        <div className="ledger-card p-5 bg-[var(--bg-panel-alt)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--color-passed)]">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-white font-bold">Settlement Destination Flexibility</div>
              <div className="text-[var(--text-muted)] text-[11px] mt-0.5">
                Native NEAR payouts direct from Sputnik DAO, or cross-chain USDC/SOL/BTC via NEAR Intents.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="tag-neutral text-[10px]">NEAR NATIVE</span>
            <span className="tag-neutral text-[10px]">ETHEREUM INTENT</span>
            <span className="tag-neutral text-[10px]">SOLANA INTENT</span>
          </div>
        </div>
      </div>
    </section>
  );
}
