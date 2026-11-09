import React from 'react';
import { AlertOctagon, Repeat, ShieldOff } from 'lucide-react';

export function LandingProblemSection() {
  const risks = [
    {
      icon: AlertOctagon,
      title: 'Runaway spending',
      description:
        'Without contract-level boundaries, an agent can hallucinate massive payout amounts, get trapped in recursive spending loops, or drain funds without limit.',
    },
    {
      icon: Repeat,
      title: 'Replay deliverables',
      description:
        'An attacker or rogue script can resubmit the same pull request, commit hash, or deliverable identifier multiple times to extract duplicate payouts.',
    },
    {
      icon: ShieldOff,
      title: 'Bypassed human oversight',
      description:
        'Giving an agent direct private key signing rights eliminates human governance. If the agent makes a mistake, the funds are gone immediately.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-red-500 font-semibold">
            The Risk
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-1.5">
            Giving an agent treasury access is risky.
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 leading-relaxed">
            Autonomous AI agents cannot be trusted with unsupervised wallet keys or unbounded treasury access. Prompt injections, hallucinations, and logic bugs make full autonomy dangerous.
          </p>
        </div>

        {/* 3 Risk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {risks.map((risk, idx) => {
            const Icon = risk.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-4 shadow-sm"
              >
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 w-fit">
                  <Icon size={20} />
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  {risk.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {risk.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
