import React from 'react';
import { ShieldAlert, RefreshCw, Users, AlertTriangle } from 'lucide-react';

export function LandingProblem() {
  const problems = [
    {
      icon: ShieldAlert,
      tag: 'Risk 1: Unbounded Drain',
      title: 'Agents with private keys drain treasuries',
      description:
        'Giving an autonomous agent signing keys or raw fund access means a single prompt injection, model drift, or hallucination can empty an entire DAO treasury in a single transaction.',
    },
    {
      icon: RefreshCw,
      tag: 'Risk 2: Replay & Sybil Exploits',
      title: 'Same deliverable claimed multiple times',
      description:
        'Without on-chain deliverable burning and cryptographic PR commit hashing, malicious contributors can submit identical work repeatedly to receive duplicate payouts.',
    },
    {
      icon: Users,
      tag: 'Risk 3: Lost Human Sovereignty',
      title: 'Autonomous execution removes council oversight',
      description:
        'Bypassing human multi-sig councils eliminates democratic accountability. Treasuries need speed for micro-tasks, but cannot sacrifice council sovereignty over capital allocation.',
    },
  ];

  return (
    <section className="relative py-12 sm:py-16 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold mb-3">
            <AlertTriangle size={13} />
            <span>The Problem We Solve</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Why autonomous agent treasuries fail without guardrails
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Community treasuries need agents to move fast — but unbounded agents create systemic financial risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.tag}
                className="p-6 sm:p-7 rounded-2xl bg-white/95 dark:bg-[#0F1715]/95 border border-rose-500/20 dark:border-rose-500/25 hover:border-rose-500/40 transition-colors duration-200 group shadow-sm dark:shadow-lg flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 group-hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all">
                    <Icon size={20} />
                  </div>
                  <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold">
                    {p.tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
