import React from 'react';
import { FileCheck, ShieldAlert, Users, ArrowRight } from 'lucide-react';

export function ThreeWayGate() {
  const steps = [
    {
      step: '01',
      title: 'Verifiable Proof',
      desc: 'Deliverable IPFS CID, git PR, or cryptographic oracle attestation pinned.',
      icon: FileCheck,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
    {
      step: '02',
      title: 'On-Chain Policy',
      desc: 'Spend cap verified, cooldown elapsed, CID unspent, reputation scaled.',
      icon: ShieldAlert,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      step: '03',
      title: 'Human Quorum',
      desc: 'Sputnik DAO council votes via Trezu. Settlement executed natively or via Intents.',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <section className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[var(--border)] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-mono">
              The Three-Way Release Gate
            </h2>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
              Active Guardrail
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            No treasury payout moves without satisfying all three independent layers.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-900/60 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Policy Engine Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative p-4 rounded-xl border border-gray-800/80 bg-gray-900/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${s.bgColor} ${s.borderColor} border`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    GATE {s.step}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-slate-100">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-[#12121A] border border-gray-700 flex items-center justify-center text-slate-400">
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
