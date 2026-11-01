import React from 'react';
import { Send, Cpu, FileCheck2, KeyRound } from 'lucide-react';

export function LandingHowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Submit Deliverable',
      actor: 'Contributor',
      desc: 'The contributor finishes their milestone and submits deliverable evidence: a merged GitHub PR link or IPFS CID.',
      icon: Send,
    },
    {
      num: '02',
      title: 'Agent Deliberation',
      actor: 'AI Deliberation Layer',
      desc: 'ZiniPay Agent inspects the artifact for authenticity, checks contributor tier, and verifies proof. The agent can ask, but cannot take.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Policy Proposal',
      actor: 'Rust Policy Contract',
      desc: 'PolicyHelper asserts spend caps and cooldowns on-chain, crafting an immutable Sputnik DAO FunctionCall proposal.',
      icon: FileCheck2,
    },
    {
      num: '04',
      title: 'Two Humans Turn the Keys',
      actor: 'Human Multi-Sig Quorum',
      desc: 'Elected council members inspect the Release Receipt and sign with their private keys. Two humans hold the final word.',
      icon: KeyRound,
    },
  ];

  return (
    <section className="py-20 border-b border-[#E5E1D8] bg-[#F7F5F0] text-[#0F172A]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E1D8] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-[#0D7A5F] uppercase tracking-wider mb-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D7A5F]" />
              Operational Lifecycle
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight">
              From Pull Request to Paid Receipt
            </h2>
            <p className="text-sm sm:text-base text-[#334155] mt-1.5 max-w-2xl leading-relaxed">
              Every step leaves a transparent, cryptographic audit trail on NEAR. The agent drafts the invoice; humans sign the check.
            </p>
          </div>
          <div className="font-mono text-xs text-[#475569] bg-white px-3 py-1.5 rounded border border-[#E2DDD5] shadow-xs self-start sm:self-auto">
            <span>GOVERNANCE:</span> <span className="font-bold text-[#0F172A]">SPUTNIK DAO v2</span>
          </div>
        </div>

        {/* 4 Steps Grid on Paper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-sm hover-lift flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F1ECE1]">
                    <span className="font-mono text-2xl font-bold text-[#0D7A5F]">
                      {st.num}
                    </span>
                    <span className="font-mono text-[10px] text-[#475569] bg-[#F8F6F1] px-2 py-0.5 rounded border border-[#EAE5DA] font-semibold uppercase">
                      {st.actor}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-[#0F172A] mb-2 tracking-tight">
                    {st.title}
                  </h3>

                  <p className="text-xs text-[#334155] leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3.5 border-t border-[#F1ECE1] flex items-center gap-2 text-[11px] font-mono text-[#475569]">
                  <Icon size={15} className="text-[#0D7A5F]" />
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
