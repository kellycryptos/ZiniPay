import React from 'react';
import { Bot, SlidersHorizontal, Users, CheckCircle2 } from 'lucide-react';

export function LandingHowItWorks() {
  const steps = [
    {
      num: '01',
      icon: Bot,
      title: 'Agent Proposes',
      subtitle: '0 Voting Rights · Proposal Drafter Only',
      description:
        'When a contributor delivers a GitHub PR or IPFS CID, the agent verifies merge status, author identity, and canonical hash. It drafts a Sputnik DAO FunctionCall proposal but has 0 voting keys and 0 council seats.',
      mechanism: 'agentzinipaytestnet.testnet',
    },
    {
      num: '02',
      icon: SlidersHorizontal,
      title: 'Policy Enforces',
      subtitle: 'Rust Smart Contract Guardrails',
      description:
        'The PolicyHelper contract on-chain verifies recipient reputation score, scales the effective spend cap (10N Bronze, 15N Silver, 20N Gold), permanently burns the deliverable CID, and locks a 60s cooldown.',
      mechanism: 'zinipay-policy2.testnet',
    },
    {
      num: '03',
      icon: Users,
      title: 'Humans Approve',
      subtitle: 'Mandatory 2-of-2 Council Multi-Sig',
      description:
        'The proposal appears on Sputnik DAO v2 (Trezu-compatible). Two distinct human council members review deliverable evidence and cast VoteApprove. No NEAR ever leaves the treasury without human multi-sig quorum.',
      mechanism: 'zinipay-demo.sputnikv2.testnet',
    },
  ];

  return (
    <section className="relative py-12 sm:py-20 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-[#00EC97] font-semibold mb-3">
            <CheckCircle2 size={13} />
            <span>The Three-Way Release Gate</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            The Solution: Agent Proposes, Policy Enforces, Humans Approve
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            A mathematically bounded lifecycle where agents automate the paperwork, smart contracts enforce the rules, and humans retain sovereign control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                className="p-6 sm:p-7 rounded-2xl bg-white/95 dark:bg-[#0F1715]/95 border border-emerald-600/20 dark:border-slate-800 hover:border-emerald-500/40 transition-colors duration-200 flex flex-col justify-between gap-5 shadow-sm dark:shadow-lg group"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#00E599] px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 shadow-[0_0_12px_rgba(0,229,153,0.15)]">
                      Step {s.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-[#00E599]">
                      <Icon size={18} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {s.subtitle}
                    </p>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Target:</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={s.mechanism}>
                    {s.mechanism}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
