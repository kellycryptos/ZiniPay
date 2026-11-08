import React from 'react';
import { Award, ShieldCheck, Columns3, ShieldAlert, Terminal } from 'lucide-react';

export function LandingFeaturesSection() {
  const features = [
    {
      icon: Award,
      title: 'On-Chain Reputation (Named Accounts)',
      desc: 'PolicyHelper stores an immutable reputation score per account on NEAR Testnet (zinipay-policy2.testnet::get_reputation). Scores rise through council-approved milestone delivery.',
      badge: 'PolicyHelper Contract',
    },
    {
      icon: ShieldCheck,
      title: 'Enforced Spend Caps (10 / 15 / 20 NEAR)',
      desc: 'Spend limits scale strictly by tier: Bronze (10N), Silver (15N), and Gold (20N). The Rust contract panics and reverts if any payout attempts to exceed effective limits.',
      badge: 'Rust Invariant',
    },
    {
      icon: Columns3,
      title: 'Transparent Public Board',
      desc: 'Anyone can observe active proposals, agent confidence scores, council vote progress, and settled releases in real time—zero wallet connection or sign-up required.',
      badge: 'Zero-Barrier View',
    },
    {
      icon: ShieldAlert,
      title: 'Fail-Closed Security Policy',
      desc: 'Permanent deliverable CID burning in used_cids blocks duplicate submissions. 60-second cooldown windows and atomic rollbacks stop drain attempts instantly.',
      badge: 'Anti-Replay Guard',
    },
    {
      icon: Terminal,
      title: 'Keyless Live Verification Suite',
      desc: 'Judges and reviewers can execute npm run verify:testnet from a sterile shell without .env or API keys. 24 on-chain checks verify state across public RPCs in 15 seconds.',
      badge: 'Judge-Proof CI/CD',
    },
  ];

  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
              Core Capabilities
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
              Engineered for Provable Safety
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl leading-relaxed">
              Every mechanism combines off-chain agent inspection with on-chain Rust constraints and human council quorum.
            </p>
          </div>
        </div>

        {/* 5 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[#00EC97]/30 transition-all flex flex-col justify-between shadow-lg"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {feat.desc}
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
