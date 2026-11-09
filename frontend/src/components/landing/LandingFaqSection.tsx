import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export function LandingFaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Who approves payouts?',
      a: 'Two human council members on Sputnik DAO v2 approve payouts with a required 2-of-2 multi-sig quorum. The AI agent holds zero council seats and zero voting rights.',
    },
    {
      q: 'What can the agent not do?',
      a: 'The agent cannot approve proposals, vote, bypass spend caps, reuse deliverables, or execute payouts directly. It can only inspect work deliverables and submit drafts to the DAO.',
    },
    {
      q: 'What happens when a rule fails?',
      a: 'The transaction reverts on-chain. If an amount exceeds the recipient’s tier cap, a deliverable CID is reused, or the 60-second cooldown is active, the Rust PolicyHelper contract panics and rolls back state atomically.',
    },
    {
      q: 'Can a rogue or compromised agent drain the treasury?',
      a: 'No. The agent holds no private keys, PolicyHelper blocks over-cap or duplicate requests on-chain, and two human council members must sign every release.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#00EC97]">
            <HelpCircle size={20} />
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Concrete answers on agent boundaries, council authority, and safety limits.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-panel)] transition-colors shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--bg-panel-alt)]/50 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-[var(--text-primary)] text-sm sm:text-base pr-4">
                    {faq.q}
                  </span>
                  <div className="text-[var(--text-muted)] shrink-0">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
