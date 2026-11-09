import React from 'react';
import { FileCheck, ShieldCheck, Users } from 'lucide-react';

export function LandingHowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Propose with a deliverable',
      actor: 'AI Agent or Contributor',
      desc: 'The agent drafts a payout proposal on Sputnik DAO referencing a specific deliverable, such as a merged GitHub pull request or IPFS CID, and binds it to the contributor’s NEAR testnet account.',
      icon: FileCheck,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
    },
    {
      step: '02',
      title: 'Contract checks caps, cooldown and one-time deliverable',
      actor: 'Rust PolicyHelper Smart Contract',
      desc: 'Before execution, the smart contract verifies that the requested amount is within the recipient’s tier cap (10, 15, or 20 NEAR), the 60-second cooldown has elapsed, and the deliverable CID has never been used before. Any violation reverts on-chain.',
      icon: ShieldCheck,
      color: 'text-[#00EC97]',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      step: '03',
      title: 'Council votes',
      actor: 'Sputnik DAO v2 Human Multi-Sig',
      desc: 'Two human council members review the deliverable and cast their on-chain VoteApprove transactions. A 2-of-2 council quorum is strictly required before any treasury funds can be disbursed.',
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#00EC97] font-semibold">
            Mechanism
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight mt-1.5">
            How a payout works
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-2 leading-relaxed">
            Three sequential checkpoints ensure mathematical safety and human oversight on every treasury release.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm relative group hover:border-[#00EC97]/30 transition-all"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[var(--bg-panel-alt)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      Step {st.step}
                    </span>
                    <div className={`p-2.5 rounded-xl ${st.bgColor} border ${st.borderColor} ${st.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-[var(--text-muted)] block mb-1">
                      {st.actor}
                    </span>
                    <h3 className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
                      {st.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {st.desc}
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
