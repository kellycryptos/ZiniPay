import React from 'react';
import { Send, Cpu, FileCheck2, CheckCircle2 } from 'lucide-react';

export function LandingHowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Submit Deliverable',
      actor: 'Contributor',
      desc: 'The contributor finishes their milestone and submits evidence: a merged GitHub PR link, IPFS CID, or oracle attestation.',
      icon: Send,
    },
    {
      num: '02',
      title: 'Agent Deliberation',
      actor: 'NEAR AI Cloud Agent',
      desc: 'ZiniPay Agent inspects the artifact for authenticity, checks contributor reputation tier, and computes a deliberation confidence score.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Policy-Constrained Proposal',
      actor: 'Sputnik DAO v2',
      desc: 'Agent crafts an on-chain proposal calling PolicyHelper::release(), committing the deliverable CID and recipient payout atomically.',
      icon: FileCheck2,
    },
    {
      num: '04',
      title: 'Human Council Vote',
      actor: 'Multi-Sig Quorum',
      desc: 'Elected council members inspect the Release Receipt in Trezu, cast their on-chain votes, and trigger atomic payout or cross-chain intent.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Header */}
        <div className="border-b border-[var(--border-subtle)] pb-6">
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-passed)] uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-passed)]" />
            Operational Lifecycle
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How It Works in 4 Steps
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            From pull request submission to multi-sig settlement, every step leaves an immutable audit trail on NEAR.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="ledger-card p-5 flex flex-col justify-between border-[var(--border-subtle)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xl font-extrabold text-[var(--color-passed)]">
                      {st.num}
                    </span>
                    <span className="tag-neutral text-[10px]">
                      {st.actor}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white mb-2 tracking-tight">
                    {st.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)]">
                  <Icon size={12} className="text-[var(--color-passed)]" />
                  <span>STEP {st.num} OF 04</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
