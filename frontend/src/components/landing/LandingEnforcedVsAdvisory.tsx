import React from 'react';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

export function LandingEnforcedVsAdvisory() {
  const onChainRules = [
    'Recipient spend caps: Bronze 10N, Silver 15N, Gold 20N',
    '60-second cooldown period between payout releases',
    'One-time deliverable CID burning (used_cids anti-replay)',
    '2-of-2 human council multi-sig quorum on Sputnik DAO',
    'Atomic transaction rollback if any policy check fails',
  ];

  const advisoryRules = [
    'Expedited single-vote schedule for micro-tasks (≤ 5 NEAR)',
    'Contributor reputation score calculations & tier mapping',
    'Deliverable artifact inspection & risk evaluation',
    'Model review: simulated (local dry-run, no ungrounded LLM inference)',
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
            System Boundaries
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-1.5">
            What is enforced on-chain vs. advisory
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 leading-relaxed">
            Cryptographic guarantees are strictly separated from client-side guidance and local evaluation.
          </p>
        </div>

        {/* Small Two-Column Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Enforced On-Chain */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-5 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  Enforced on-chain
                </h3>
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  Rust PolicyHelper &amp; Sputnik DAO v2
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-3">
              {onChainRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  <CheckCircle2 size={16} className="text-[#00EC97] shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Advisory / Off-Chain */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col gap-5 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
                  Advisory / client-side
                </h3>
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  Guidance, scoring &amp; local simulation
                </span>
              </div>
            </div>

            <ul className="flex flex-col gap-3">
              {advisoryRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-2" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
