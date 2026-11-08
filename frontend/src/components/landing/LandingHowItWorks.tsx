import React from 'react';
import { Send, Shield, Users, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function LandingHowItWorks({ onNavigateToApp }: { onNavigateToApp?: () => void }) {
  const steps = [
    {
      num: '01',
      title: 'Agent Proposes',
      actor: 'Keyless Proposer Agent',
      desc: 'The agent inspects the deliverable (merged GitHub PR or IPFS CID) and drafts a proposal. The PR link is claimed in the description (not checked on-chain); the one-time deliverable CID is passed to PolicyHelper where anti-replay is enforced. The agent holds 0 voting keys and cannot execute transfers.',
      icon: Send,
      badge: 'Requestor Role (0 Council Seats)',
    },
    {
      num: '02',
      title: 'PolicyHelper Enforces',
      actor: 'Rust Smart Contract Invariant',
      desc: 'The contract checks that the requested amount is within the recipient\'s tier cap (10 / 15 / 20 NEAR), verifies the 60s cooldown has elapsed, and permanently burns the deliverable CID in used_cids to prevent replay attacks.',
      icon: Shield,
      badge: 'Fail-Closed Panic Trap',
    },
    {
      num: '03',
      title: 'Humans Approve on Sputnik DAO v2',
      actor: '2-of-2 Council Multi-Sig',
      desc: 'Elected council members inspect the transparent Release Receipt and sign with their private keys. Payout executes only when 2-of-2 human quorum is reached on-chain.',
      icon: Users,
      badge: 'Human Quorum Threshold',
    },
  ];

  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--text-primary)] font-sans transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-12">
        {/* Section Header: Problem & Solution in Plain Language */}
        <div className="flex flex-col gap-6 border-b border-[var(--border-subtle)] pb-8">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#0D7A5F] font-bold">
              Architecture &amp; Core Mechanism
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
              Agents Propose. Contracts Enforce. Humans Approve.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* The Problem */}
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold">
                <AlertTriangle size={18} />
                <span>The Problem: Autonomous Agent Drain</span>
              </div>
              <p className="text-red-700 dark:text-red-300 leading-relaxed text-xs sm:text-sm">
                Autonomous agents are vulnerable to prompt injection, hallucinated deliverables, and compromised keys. Granting an AI direct withdrawal keys or unconstrained spending limits turns any smart contract into an automated drain target.
              </p>
            </div>

            {/* The Solution */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-[#00EC97] font-bold">
                <CheckCircle2 size={18} />
                <span>The Solution: Decoupled Multi-Sig Invariants</span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed text-xs sm:text-sm">
                ZiniPay eliminates agent custody. The agent can only draft proposals; a Rust contract enforces spend caps and anti-replay guards on-chain; and elected humans retain final multi-sig veto and approval on Sputnik DAO v2.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Numbered Steps Grid on Paper Surface */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                    <span className="font-mono text-2xl font-bold text-[#0D7A5F]">
                      {st.num}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-secondary)] bg-[var(--bg-panel-alt)] px-2 py-0.5 rounded border border-[var(--border-subtle)] font-semibold">
                      {st.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-[#0D7A5F] font-semibold uppercase">
                      {st.actor}
                    </span>
                    <h3 className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
                      {st.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[#0D7A5F]">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Icon size={14} />
                    <span>Step {st.num}</span>
                  </div>
                  <span className="text-[10px] text-[#64748B] uppercase">Fail-Closed</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
